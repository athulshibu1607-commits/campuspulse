/*
 * CampusPulse — ESP32 network gateway firmware
 * ------------------------------------------------------------
 * Role: accept ON / OFF / STATUS from the CampusPulse backend over Wi-Fi,
 *       forward the command to the Arduino Nano over the EXISTING serial link,
 *       and relay back whatever acknowledgement the Nano sends.
 *
 * The Nano firmware is NOT changed. Instead, edit the NANO_CMD_* strings below
 * so they match exactly what your existing Nano sketch already listens for.
 *
 * HTTP API (port 80):
 *   GET /status              -> {"device","online","relay","lastCmd","lastAck","statusSource","uptimeSec","ip"}
 *   GET /cmd?c=ON|OFF|STATUS -> {"ok","sent","acknowledged","ack","relay"}
 *
 * "relay" is what the controller believes, based on the Nano's acknowledgement.
 * It is NOT a physical measurement — CampusPulse always labels it
 * "physical state not independently verified".
 *
 * Board: any ESP32 dev board (Arduino core for ESP32). Libraries: built-in WiFi, WebServer, ESPmDNS.
 */
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>

// ================= CONFIG — edit these =================
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Serial link to the Nano (reuse the same pins/baud the PlugPilot build used)
#define NANO_RX_PIN 16        // ESP32 RX2  <- Nano TX  (Nano TX is 5 V: keep the divider/level shifter you already had)
#define NANO_TX_PIN 17        // ESP32 TX2  -> Nano RX
#define NANO_BAUD   9600

// Nano protocol — confirmed with firmware/nano_probe on the real hardware:
//   9600 baud, commands START / STOP + '\n', replies START_ACCEPTED / STOP_ACCEPTED.
//   A single burst write gets corrupted in transit; one byte at a time with a ~3 ms gap is received cleanly.
const char* NANO_CMD_ON         = "START";
const char* NANO_CMD_OFF        = "STOP";
const char* NANO_ACK_ON         = "START_ACCEPTED";   // reply that confirms ON was accepted
const char* NANO_ACK_OFF        = "STOP_ACCEPTED";    // reply that confirms OFF was accepted
const bool  SEND_NEWLINE        = true;               // '\n' terminates each command
const unsigned long NANO_BYTE_GAP_MS = 3;              // delay between bytes — REQUIRED for this Nano (no burst writes)
const unsigned long ACK_TIMEOUT_MS   = 1500;           // how long to wait for the Nano's reply line
// The Nano has no status command, so the relay state is the last command the Nano
// confirmed with its *_ACCEPTED reply. Any other reply, or none, -> UNKNOWN (never assumed).
// =======================================================

WebServer server(80);
HardwareSerial Nano(2);

String relayState   = "UNKNOWN";   // ON / OFF / UNKNOWN
String lastCmd      = "";
String lastAck      = "";
String statusSource = "nano-ack";      // state = last command the Nano confirmed with *_ACCEPTED

String jsonEscape(const String& s) {
  String o;
  for (size_t i = 0; i < s.length(); i++) {
    char c = s[i];
    if (c == '"' || c == '\\') { o += '\\'; o += c; }
    else if (c >= 32 && c < 127) o += c;
  }
  return o;
}

// Write a command to the Nano one byte at a time with NANO_BYTE_GAP_MS between bytes.
// (A normal Nano.print() burst is corrupted by this Nano — do not "optimise" this back to a burst.)
void writeSlow(const char* text) {
  for (const char* p = text; *p; p++) {
    Nano.write((uint8_t)*p);
    Nano.flush();                                 // wait until the byte has actually left the UART
    delay(NANO_BYTE_GAP_MS);
  }
}

// Send one command and return the Nano's reply line exactly as received ("" if none within ACK_TIMEOUT_MS).
String sendToNano(const char* cmd) {
  while (Nano.available()) Nano.read();          // drop stale bytes so we only read this command's reply
  writeSlow(cmd);
  if (SEND_NEWLINE) writeSlow("\n");
  String line = "";
  unsigned long t0 = millis();
  while (millis() - t0 < ACK_TIMEOUT_MS) {
    while (Nano.available()) {
      char c = (char)Nano.read();
      if (c == '\n' || c == '\r') { if (line.length()) { line.trim(); return line; } }
      else line += c;
    }
    delay(2);
  }
  line.trim();
  return line;                                    // partial line without newline is still returned
}

// True only if the Nano's reply contains the expected acknowledgement (e.g. "START_ACCEPTED").
bool isAccepted(const String& reply, const char* expected) {
  return reply.indexOf(expected) >= 0;
}

void sendJson(int code, const String& body) {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-store");
  server.send(code, "application/json", body);
}

String statusJson() {
  return String("{\"device\":\"campuspulse-esp32\",\"online\":true,\"relay\":\"") + relayState +
         "\",\"lastCmd\":\"" + jsonEscape(lastCmd) + "\",\"lastAck\":\"" + jsonEscape(lastAck) +
         "\",\"statusSource\":\"" + statusSource + "\",\"uptimeSec\":" + String(millis() / 1000) +
         ",\"ip\":\"" + WiFi.localIP().toString() + "\"}";
}

void handleStatus() {
  // The Nano has no status command: report the last state it confirmed (never queried, never assumed).
  sendJson(200, statusJson());
}

void handleCmd() {
  String c = server.arg("c"); c.toUpperCase();
  if (c == "STATUS") { handleStatus(); return; }  // nothing to send — the Nano only understands START/STOP
  const char* nanoCmd; const char* expected;
  if (c == "ON")       { nanoCmd = NANO_CMD_ON;  expected = NANO_ACK_ON; }
  else if (c == "OFF") { nanoCmd = NANO_CMD_OFF; expected = NANO_ACK_OFF; }
  else { sendJson(400, "{\"ok\":false,\"error\":\"use c=ON, OFF or STATUS\"}"); return; }

  String reply = sendToNano(nanoCmd);
  bool acked = isAccepted(reply, expected);
  lastCmd = c;
  lastAck = reply;                                // the Nano's real reply, forwarded to the app as-is
  relayState = acked ? c : "UNKNOWN";             // only a *_ACCEPTED reply changes the reported state
  statusSource = "nano-ack";
  Serial.printf("[CMD] %s -> Nano \"%s\" | reply: \"%s\" | %s\n", c.c_str(), nanoCmd, reply.c_str(),
                acked ? "ACCEPTED" : (reply.length() ? "UNEXPECTED REPLY" : "NO REPLY"));
  sendJson(200, String("{\"ok\":true,\"sent\":\"") + c + "\",\"nanoCmd\":\"" + nanoCmd +
                "\",\"expected\":\"" + expected + "\",\"acknowledged\":" + (acked ? "true" : "false") +
                ",\"ack\":\"" + jsonEscape(reply) + "\",\"relay\":\"" + relayState + "\"}");
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) { delay(400); Serial.print('.'); }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("CampusPulse ESP32 ready at http://"); Serial.println(WiFi.localIP());
    Serial.println("Put that address into CampusPulse -> More -> Settings -> ESP32 address");
  } else Serial.println("Wi-Fi failed — retrying in loop()");
}

void setup() {
  Serial.begin(115200);
  Nano.begin(NANO_BAUD, SERIAL_8N1, NANO_RX_PIN, NANO_TX_PIN);
  connectWifi();
  if (MDNS.begin("campuspulse")) MDNS.addService("http", "tcp", 80);   // also reachable as http://campuspulse.local
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/cmd", HTTP_GET, handleCmd);
  server.on("/", HTTP_GET, []() { sendJson(200, statusJson()); });
  server.onNotFound([]() { sendJson(404, "{\"ok\":false,\"error\":\"not found\"}"); });
  server.begin();
}

unsigned long lastWifiCheck = 0;
void loop() {
  server.handleClient();
  if (millis() - lastWifiCheck > 10000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) { WiFi.disconnect(); connectWifi(); }
  }
}
