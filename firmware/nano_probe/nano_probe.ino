/*
 * Nano protocol probe — runs on the ESP32, leaves the Nano untouched.
 * Finds the baud rate at which the existing Nano firmware reacts to START / STOP.
 *
 * Wiring: as in the CampusPulse build (ESP32 GPIO16 RX2 <- Nano TX, GPIO17 TX2 -> Nano RX, common GND).
 *         Disconnect the test load from the socket while probing — the relay will click.
 *
 * Serial Monitor: 115200 baud, line ending "Newline". Commands:
 *   scan            send START then STOP (with newline) at 9600/19200/38400/57600/115200, print every reply
 *   raw             send START at 9000/9300/9600/9900/10200 baud (+2 alt methods at 9600),
 *                   print exact bytes SENT and RECEIVED as hex and escaped text
 *   baud 9600       set the Nano link baud rate
 *   pins 16 17      set RX TX pins
 *   nl on|off|crlf  line ending appended to manually sent text (default: newline)
 *   <anything else> sent to the Nano as-is; any reply is printed
 */

// ---------- globals (must come before any function that uses them) ----------
HardwareSerial Nano(2);
int rxPin = 16, txPin = 17;
long baud = 9600;
String ending = "\n";

// ---------- helpers ----------
void openLink() {
  Nano.end();
  Nano.begin(baud, SERIAL_8N1, rxPin, txPin);
  delay(50);
}

String readReply(unsigned long ms) {
  String s;
  unsigned long t0 = millis();
  while (millis() - t0 < ms) {
    while (Nano.available()) {
      char c = Nano.read();
      s += (c == '\r' ? ' ' : c == '\n' ? '|' : c);
    }
    delay(2);
  }
  s.trim();
  return s;
}

void sendAndShow(const String& cmd) {
  while (Nano.available()) Nano.read();          // flush stale bytes
  Nano.print(cmd);
  Nano.print(ending);
  String r = readReply(1200);
  if (r.length()) Serial.printf("    reply: \"%s\"\n", r.c_str());
  else            Serial.println("    reply: (none)");
}

// ---------- scan: START / STOP only, every common baud rate ----------
void scan() {
  const long bauds[] = { 9600, 19200, 38400, 57600, 115200 };
  const char* words[] = { "START", "STOP" };
  const String keepEnding = ending;
  ending = "\n";                                  // START/STOP always sent with a newline
  long keep = baud;
  for (long b : bauds) {
    baud = b; openLink();
    Serial.printf("\n=== Testing %ld baud - watch for the relay click ===\n", b);
    String idle = readReply(800);
    if (idle.length()) Serial.printf("  (unprompted output: \"%s\")\n", idle.c_str());
    for (const char* w : words) {
      Serial.printf("  [%ld baud] sending \"%s\" now...\n", b, w);
      sendAndShow(w);                             // prints any reply text from the Nano
      delay(1500);                                // pause so you can tell which command clicked
    }
  }
  ending = keepEnding;
  baud = keep; openLink();
  Serial.println("\nScan done. Note the baud rate where START/STOP clicked the relay, and any reply text.");
}

// ---------- raw diagnostics: exact bytes sent vs received ----------
// Prints bytes as hex AND as text (\r \n and non-printables escaped), so nothing is hidden by the terminal.
void printBytes(const char* label, const uint8_t* b, size_t n) {
  Serial.printf("    %-4s %3u byte(s) HEX :", label, (unsigned)n);
  for (size_t i = 0; i < n; i++) Serial.printf(" %02X", b[i]);
  Serial.printf("\n    %-4s           TEXT: \"", label);
  for (size_t i = 0; i < n; i++) {
    uint8_t c = b[i];
    if (c == '\r') Serial.print("\\r");
    else if (c == '\n') Serial.print("\\n");
    else if (c >= 32 && c < 127) Serial.print((char)c);
    else Serial.printf("\\x%02X", c);
  }
  Serial.println("\"");
}

size_t captureRaw(uint8_t* buf, size_t cap, unsigned long ms) {
  size_t n = 0;
  unsigned long t0 = millis();
  while (millis() - t0 < ms) {
    while (Nano.available()) { int c = Nano.read(); if (c >= 0 && n < cap) buf[n++] = (uint8_t)c; }
    delay(1);
  }
  return n;
}

// mode 0: "START\n" sent in one burst
// mode 1: send a lone "\n" first (clears any junk sitting in the Nano's line buffer), wait, then "START\n"
// mode 2: "START\n" sent one byte at a time with 3 ms gaps (helps if the Nano uses SoftwareSerial and drops/garbles bursts)
void rawAttempt(long b, int mode) {
  static const char* modeName[] = { "burst", "newline-first", "slow bytes" };
  baud = b; openLink();
  delay(300);                                     // let the line settle after (re)opening the port
  Serial.printf("\n--- %ld baud | mode %d (%s) ---\n", b, mode, modeName[mode]);

  uint8_t buf[160];
  size_t n = captureRaw(buf, sizeof buf, 300);    // anything the Nano sent unprompted / after the port re-open
  if (n) printBytes("IDLE", buf, n);

  if (mode == 1) {
    const uint8_t nl = '\n';
    Nano.write(nl);
    n = captureRaw(buf, sizeof buf, 400);
    printBytes("SENT", &nl, 1);
    printBytes("RECV", buf, n);
  }

  const uint8_t cmd[] = { 'S', 'T', 'A', 'R', 'T', '\n' };
  if (mode == 2) { for (uint8_t c : cmd) { Nano.write(c); Nano.flush(); delay(3); } }
  else { Nano.write(cmd, sizeof cmd); Nano.flush(); }
  n = captureRaw(buf, sizeof buf, 1500);
  printBytes("SENT", cmd, sizeof cmd);
  printBytes("RECV", buf, n);
}

void raw() {
  const long bauds[] = { 9000, 9300, 9600, 9900, 10200 };
  long keep = baud;
  Serial.println("\n===== RAW DIAGNOSTIC: START at near-9600 baud rates =====");
  for (long b : bauds) rawAttempt(b, 0);
  Serial.println("\n===== RAW DIAGNOSTIC: 9600 baud, alternative send methods =====");
  rawAttempt(9600, 1);
  rawAttempt(9600, 2);
  baud = keep; openLink();
  Serial.println("\nRaw diagnostic done. Copy everything from '===== RAW DIAGNOSTIC' down and share it.");
}

// ---------- Arduino entry points ----------
void setup() {
  Serial.begin(115200);
  delay(300);
  openLink();
  Serial.println("\nNano probe ready. Type: scan | raw | baud N | pins RX TX | nl on/off/crlf | <text to send>");
}

void loop() {
  if (Nano.available()) {
    String r = readReply(100);
    if (r.length()) Serial.printf("[Nano] %s\n", r.c_str());
  }
  if (!Serial.available()) return;
  String in = Serial.readStringUntil('\n');
  in.trim();
  if (!in.length()) return;
  if (in == "scan") scan();
  else if (in == "raw") raw();
  else if (in.startsWith("baud ")) { baud = in.substring(5).toInt(); openLink(); Serial.printf("baud = %ld\n", baud); }
  else if (in.startsWith("pins ")) {
    int sp = in.indexOf(' ', 5);
    rxPin = in.substring(5, sp).toInt();
    txPin = in.substring(sp + 1).toInt();
    openLink();
    Serial.printf("RX=%d TX=%d\n", rxPin, txPin);
  }
  else if (in == "nl off")  { ending = "";     Serial.println("no line ending"); }
  else if (in == "nl on")   { ending = "\n";   Serial.println("ending = \\n"); }
  else if (in == "nl crlf") { ending = "\r\n"; Serial.println("ending = \\r\\n"); }
  else { Serial.printf("  sending \"%s\"\n", in.c_str()); sendAndShow(in); }
}
