'use strict';
/*
 * MOCK ESP32 controller — for rehearsing the demo WITHOUT the hardware.
 * It speaks the same HTTP API as firmware/campuspulse_esp32. CampusPulse detects it
 * (device name contains "mock") and labels it "Mock controller — not real hardware".
 *
 *   node tools/mock-esp32.js            (listens on http://localhost:8081)
 *   then in CampusPulse Settings set ESP32 address to http://localhost:8081
 *
 * Type "off" / "on" / "down" / "up" + Enter in this terminal to simulate the guard
 * flipping the socket or the controller dropping off the network.
 */
const http = require('http');
const PORT = Number(process.env.MOCK_PORT || 8081);
let relay = 'ON', lastCmd = '', lastAck = '', down = false;

http.createServer((req, res) => {
  if (down) { req.socket.destroy(); return; }
  const u = new URL(req.url, 'http://x');
  const send = (code, o) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(o)); };
  if (u.pathname === '/status' || u.pathname === '/') return send(200, { device: 'mock-esp32 (NOT REAL HARDWARE)', online: true, relay, lastCmd, lastAck, statusSource: 'last-command', uptimeSec: Math.round(process.uptime()) });
  if (u.pathname === '/cmd') {
    const c = String(u.searchParams.get('c') || '').toUpperCase();
    if (!['ON', 'OFF', 'STATUS'].includes(c)) return send(400, { ok: false, error: 'use c=ON, OFF or STATUS' });
    setTimeout(() => {
      lastCmd = c;
      if (c !== 'STATUS') relay = c;
      lastAck = c === 'STATUS' ? `RELAY ${relay}` : `OK RELAY ${c}`;
      console.log(`[mock] ${c} -> ack "${lastAck}"`);
      send(200, { ok: true, sent: c, acknowledged: true, ack: lastAck, relay });
    }, 250);
    return;
  }
  send(404, { ok: false, error: 'not found' });
}).listen(PORT, () => console.log(`MOCK ESP32 on http://localhost:${PORT}  (relay ${relay}). Type on/off/down/up + Enter.`));

process.stdin.on('data', d => {
  const c = d.toString().trim().toLowerCase();
  if (c === 'on' || c === 'off') { relay = c.toUpperCase(); console.log('[mock] relay now', relay); }
  if (c === 'down') { down = true; console.log('[mock] controller now UNREACHABLE'); }
  if (c === 'up') { down = false; console.log('[mock] controller reachable again'); }
});
