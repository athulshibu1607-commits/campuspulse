'use strict';
/*
 * CampusPulse backend — camera-free campus shutdown & security platform.
 * Zero dependencies: needs Node.js 18+ only.  Run:  node server.js
 *
 * Ground rules enforced here:
 *  - No energy / kWh / money figures anywhere.
 *  - Only ONE real device (the ESP32 -> Nano -> relay -> socket path). Everything else is a SIMULATED record.
 *  - "Command sent" / "controller acknowledged" is never presented as physical proof of OFF.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');

const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const pad = n => String(n).padStart(2, '0');
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const atHM = (dk, h) => { const [y, m, dd] = dk.split('-').map(Number); const [H, M] = h.split(':').map(Number); return new Date(y, m - 1, dd, H, M, 0, 0); };

let db;

/* ------------------------------------------------------------------ */
/* Seed data                                                          */
/* ------------------------------------------------------------------ */
function defaultSettings() {
  return {
    closingTime: '18:00', closingOverride: null,
    sweepLeadMin: 15, escalateMin: 15, shutdownMin: 25,
    timeScale: 60,            // real seconds per policy minute (60 = real time; 4 = demo-fast)
    cancelWindowSec: 120, exceptionReminderMin: 10, maxExceptionHours: 12,
    repeatAlertThreshold: 3, repeatWindowDays: 7,
    offlineThreshold: 3, offlineWindowHours: 24,
    esp32Url: ''
  };
}

function seed() {
  const now = new Date();
  db = {
    version: 1, seq: 0, logSeq: 0,
    users: [
      { id: 'u-admin', name: 'Facilities Admin', role: 'admin', pin: '1234' },
      { id: 'u-sec', name: 'Security Officer', role: 'security', pin: '0000' }
    ],
    floors: [
      { id: 'F1', name: 'Floor 1', label: 'Labs' },
      { id: 'F2', name: 'Floor 2', label: 'Classrooms' },
      { id: 'F3', name: 'Floor 3', label: 'Seminar & Research' }
    ],
    rooms: [], devices: [], timetable: [], exceptions: [], alerts: [],
    sweeps: {}, shutdowns: [], tickets: [], offlineEvents: [], audit: [],
    settings: defaultSettings()
  };
  const rooms = [
    ['101', 'F1', 'Physics Lab'], ['102', 'F1', 'Chemistry Lab'], ['103', 'F1', 'Electronics Lab'],
    ['104', 'F1', 'Robotics Lab'], ['105', 'F1', 'Workshop'], ['106', 'F1', 'Faculty Lounge'],
    ['201', 'F2', 'Classroom A'], ['202', 'F2', 'Classroom B'], ['203', 'F2', 'Classroom C'],
    ['204', 'F2', 'Classroom D'], ['205', 'F2', 'Server Room'], ['206', 'F2', 'Library Annex'],
    ['301', 'F3', 'Seminar Hall'], ['302', 'F3', 'Research Lab'], ['303', 'F3', 'Bio Lab'],
    ['304', 'F3', 'Conference Room'], ['305', 'F3', 'Staff Room'], ['306', 'F3', 'Media Studio']
  ];
  rooms.forEach(([id, floorId, name], i) => db.rooms.push({ id, floorId, name, slot: i % 6 }));

  const D = (roomId, key, name, type, state, extra = {}) =>
    db.devices.push(Object.assign({ id: `D-${roomId}-${key}`, roomId, name, type, real: false, protected: false, state, simOnline: true }, extra));
  D('101', 'LT', 'Lights', 'Lighting', 'ON'); D('101', 'FAN', 'Ceiling Fans', 'Fan', 'OFF');
  D('102', 'LT', 'Lights', 'Lighting', 'OFF'); D('102', 'HOOD', 'Exhaust Fan', 'Fan', 'OFF');
  D('103', 'PC', 'Workbench PCs', 'Computers', 'ON'); D('103', 'LT', 'Lights', 'Lighting', 'OFF');
  // THE one real device:
  D('104', 'SOCKET', 'Demo Socket (Relay 1)', 'Socket', 'UNKNOWN', { real: true, controller: 'ESP32 → Nano → Relay 1' });
  D('105', 'LT', 'Lights', 'Lighting', 'OFF'); D('105', 'SOLDER', 'Soldering Stations', 'Bench Tools', 'OFF');
  D('106', 'AC', 'Air Conditioner', 'AC', 'ON'); D('106', 'LT', 'Lights', 'Lighting', 'OFF');
  D('201', 'LT', 'Lights', 'Lighting', 'ON'); D('201', 'PROJ', 'Projector', 'Projector', 'ON');
  D('202', 'LT', 'Lights', 'Lighting', 'OFF'); D('202', 'FAN', 'Ceiling Fans', 'Fan', 'OFF');
  D('203', 'LT', 'Lights', 'Lighting', 'ON'); D('203', 'BOARD', 'Smart Board', 'Display', 'OFF');
  D('204', 'LT', 'Lights', 'Lighting', 'OFF'); D('204', 'FAN', 'Ceiling Fans', 'Fan', 'OFF');
  D('205', 'RACK', 'Server Rack', 'IT', 'ON', { protected: true }); D('205', 'LT', 'Lights', 'Lighting', 'OFF');
  D('206', 'LT', 'Reading Lights', 'Lighting', 'ON'); D('206', 'AC', 'Air Conditioner', 'AC', 'OFF');
  D('301', 'LT', 'Stage Lights', 'Lighting', 'ON'); D('301', 'PA', 'PA System', 'Audio', 'ON');
  D('302', 'LT', 'Lights', 'Lighting', 'OFF'); D('302', 'HOOD', 'Fume Hood Controller', 'Ventilation', 'UNKNOWN', { simOnline: false });
  D('303', 'FRIDGE', 'Sample Fridge', 'Cold Storage', 'ON', { protected: true }); D('303', 'LT', 'Lights', 'Lighting', 'OFF');
  D('304', 'LT', 'Lights', 'Lighting', 'OFF'); D('304', 'TV', 'Display Panel', 'Display', 'OFF');
  D('305', 'FAN', 'Ceiling Fans', 'Fan', 'ON'); D('305', 'LT', 'Lights', 'Lighting', 'OFF');
  D('306', 'LT', 'Studio Lights', 'Lighting', 'OFF'); D('306', 'CAM', 'Edit Workstation', 'Computers', 'OFF');

  db.timetable.push({ id: nid('TT'), roomId: '301', title: 'Evening Guest Lecture', kind: 'recurring', days: [1, 2, 3, 4, 5], start: '17:00', end: '19:00' });
  db.timetable.push({ id: nid('TT'), roomId: '201', title: 'Remedial Class', kind: 'recurring', days: [1, 3], start: '16:00', end: '18:30' });

  // ---- History: after-hours alerts over the past 12 weeks (drives streaks, repeat detection and log search)
  const monday = startOfWeek(now);
  const hist = [
    // [floor room, weeksAgo, resolution]  resolution 'open' / 'auto_shutdown' => breaks streak
    ['105', 10, 'auto_shutdown'], ['101', 9, 'sweep'], ['103', 7, 'auto_shutdown'], ['106', 4, 'sweep'], ['101', 2, 'exception'],
    ['204', 8, 'sweep'], ['202', 6, 'auto_shutdown'], ['206', 3, 'turned_off'], ['201', 1, 'auto_shutdown'],
    ['304', 9, 'auto_shutdown'], ['305', 5, 'sweep'], ['306', 3, 'auto_shutdown'], ['301', 1, 'exception']
  ];
  for (const [rid, w, res] of hist) {
    const t = new Date(monday.getTime() - w * 7 * DAY + 2 * DAY); t.setHours(18, 4, 0, 0);
    seedAlert(rid, t, res);
  }
  // Classroom C (203): 3 after-hours alerts in the last 7 days -> repeat-issue flag + maintenance ticket
  [5, 3, 1].forEach((daysAgo, i) => {
    const t = new Date(now.getTime() - daysAgo * DAY); t.setHours(18, 2 + i, 0, 0);
    seedAlert('203', t, i === 2 ? 'auto_shutdown' : 'sweep');
  });
  // Research Lab (302) simulated controller dropped offline 3 times in the last 24h -> unstable
  [20, 9, 2].forEach(h => {
    const t = new Date(now.getTime() - h * HOUR);
    db.offlineEvents.push({ deviceId: 'D-302-HOOD', at: t.toISOString() });
    log('CONTROLLER_OFFLINE', { ts: t, roomId: '302', deviceId: 'D-302-HOOD', detail: 'Simulated controller for Fume Hood Controller went offline', severity: 'warning' });
  });
  log('SYSTEM_SEEDED', { detail: 'Demo data created: 18 rooms (17 simulated), 1 real controller path (Room 104)', visibility: 'admin' });
  for (const r of db.rooms) repeatCheck(r.id, true);
  unstableCheck('D-302-HOOD', true);
}

function seedAlert(roomId, t, resolution) {
  const r = room(roomId);
  const devs = relevant(roomId);
  const a = { id: nid('ALR'), roomId, floorId: r.floorId, createdAt: t.toISOString(), stage: resolution === 'auto_shutdown' ? 2 : 0, status: 'resolved', resolution, resolvedAt: new Date(t.getTime() + (resolution === 'auto_shutdown' ? 27 : 9) * MIN).toISOString(), deviceIds: devs.map(d => d.id), seeded: true };
  db.alerts.push(a);
  log('ALERT_RAISED', { ts: t, roomId, detail: `T+0 after-hours alert — ${r.name}: ${devs[0].name} still ON at closing`, severity: 'warning' });
  if (resolution === 'auto_shutdown') {
    log('ALERT_ESCALATED', { ts: new Date(t.getTime() + 15 * MIN), roomId, detail: `T+15 escalation — ${r.name} not verified`, severity: 'critical' });
    log('SHUTDOWN_RESULT', { ts: new Date(t.getTime() + 27 * MIN), roomId, detail: `Automatic shutdown request completed for ${r.name} (simulated record). Physical state not independently verified.` });
  }
  const by = resolution === 'sweep' ? 'Security Officer' : resolution === 'exception' ? 'Facilities Admin' : 'System';
  log('ALERT_RESOLVED', { ts: new Date(a.resolvedAt), actor: by, role: by === 'System' ? 'system' : by === 'Security Officer' ? 'security' : 'admin', roomId, detail: `Alert ${a.id} resolved: ${RES_LABEL[resolution]}` });
}

const RES_LABEL = {
  turned_off: 'devices reported OFF', sweep: 'verified OFF during sweep', exception: 'approved exception',
  timetable: 'scheduled class/event in progress', auto_shutdown: 'automatic shutdown request (unverified)',
  manual_shutdown: 'manual shutdown request'
};

/* ------------------------------------------------------------------ */
/* Persistence                                                        */
/* ------------------------------------------------------------------ */
let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(db));
      fs.renameSync(DATA_FILE + '.tmp', DATA_FILE);
    } catch (e) { console.error('save failed', e.message); }
  }, 300);
}
function load() {
  try {
    db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    db.settings = Object.assign(defaultSettings(), db.settings);
    console.log('Loaded state from', DATA_FILE);
  } catch { seed(); save(); console.log('Seeded fresh demo data'); }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function nid(p) { db.seq = (db.seq || 0) + 1; return `${p}-${String(db.seq).padStart(4, '0')}`; }
const room = id => db.rooms.find(r => r.id === id);
const floor = id => db.floors.find(f => f.id === id);
const dev = id => db.devices.find(x => x.id === id);
const roomDevices = rid => db.devices.filter(x => x.roomId === rid);
const relevant = rid => roomDevices(rid).filter(x => !x.protected);
const realDevice = () => db.devices.find(x => x.real);
const S = () => db.settings;
const pm = min => min * S().timeScale * 1000; // policy minutes -> ms
function startOfWeek(d) { const x = new Date(d); const k = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - k); return x; }

function log(action, o = {}) {
  db.logSeq = (db.logSeq || 0) + 1;
  const r = o.roomId ? room(o.roomId) : null;
  const d = o.deviceId ? dev(o.deviceId) : null;
  const e = {
    id: 'LOG-' + String(db.logSeq).padStart(6, '0'),
    ts: (o.ts || new Date()).toISOString(),
    actor: o.actor || 'System', role: o.role || 'system', action,
    roomId: o.roomId || null, roomName: r ? r.name : null,
    deviceId: o.deviceId || null, deviceName: d ? d.name : null,
    floorId: o.floorId || (r && r.floorId) || null,
    detail: o.detail || '', visibility: o.visibility || 'all',
    notify: !!o.notify, severity: o.severity || 'info'
  };
  db.audit.push(e);
  save();
  return e;
}

function devState(x) {
  if (x.pendingShutdown) return 'PENDING';
  if (x.real) return ctl.online ? (x.state || 'UNKNOWN') : 'UNKNOWN';
  return x.simOnline === false ? 'UNKNOWN' : x.state;
}
function onish(rid) { return relevant(rid).filter(x => ['ON', 'UNKNOWN', 'PENDING'].includes(devState(x))); }

function closingAt(now) {
  const s = S();
  if (s.closingOverride) { const o = new Date(s.closingOverride); if (dateKey(o) === dateKey(now)) return o; }
  return atHM(dateKey(now), s.closingTime);
}
function phaseInfo(now) {
  const c = closingAt(now);
  const sw = new Date(c.getTime() - pm(S().sweepLeadMin));
  const phase = now < sw ? 'open' : now < c ? 'sweep' : 'after_hours';
  return { closing: c, sweepStart: sw, phase, key: c.toISOString() };
}
function ttActive(rid, now) {
  const dk = dateKey(now), dow = now.getDay();
  return db.timetable.find(t => t.roomId === rid && (t.kind === 'oneoff' ? t.date === dk : t.days.includes(dow)) && now >= atHM(dk, t.start) && now < atHM(dk, t.end));
}
function excActive(rid, now) { return db.exceptions.find(e => e.roomId === rid && e.status === 'approved' && new Date(e.endsAt) > now); }
function sweepItem(rid, ph) { const sw = db.sweeps[ph.key]; return sw ? sw.items.find(i => i.roomId === rid) : null; }
function excuse(rid, now, ph) {
  if (ttActive(rid, now)) return 'timetable';
  if (excActive(rid, now)) return 'exception';
  const it = sweepItem(rid, ph);
  // A guard's "turned off" removes the room from the alert sequence — unless a live controller still reports ON.
  if (it && it.result === 'turned_off' && !relevant(rid).some(x => x.real && devState(x) === 'ON')) return 'sweep';
  return null;
}
const devLabel = x => `${x.name} (${devState(x)})`;

/* ------------------------------------------------------------------ */
/* Alerts, repeat detection                                           */
/* ------------------------------------------------------------------ */
function createAlert(r, on, now) {
  const a = { id: nid('ALR'), roomId: r.id, floorId: r.floorId, createdAt: now.toISOString(), stage: 0, status: 'open', deviceIds: on.map(x => x.id) };
  db.alerts.push(a);
  log('ALERT_RAISED', { roomId: r.id, detail: `T+0 after-hours alert — ${r.name}: ${on.map(devLabel).join(', ')}`, notify: true, severity: 'warning' });
  repeatCheck(r.id);
  return a;
}
function resolveAlert(a, resolution, actor = 'System', role = 'system') {
  a.status = 'resolved'; a.resolution = resolution; a.resolvedAt = new Date().toISOString();
  log('ALERT_RESOLVED', { actor, role, roomId: a.roomId, detail: `Alert ${a.id} resolved: ${RES_LABEL[resolution] || resolution}` });
}
function repeatCount(rid, now = new Date()) {
  const since = now.getTime() - S().repeatWindowDays * DAY;
  return db.alerts.filter(a => a.roomId === rid && new Date(a.createdAt).getTime() >= since).length;
}
function repeatCheck(rid, quiet) {
  const n = repeatCount(rid);
  if (n < S().repeatAlertThreshold) return;
  if (db.tickets.some(t => t.roomId === rid && t.kind === 'repeat_alert' && t.status === 'open')) return; // dedup
  const r = room(rid);
  const t = { id: nid('TKT'), kind: 'repeat_alert', roomId: rid, deviceId: null, createdAt: new Date().toISOString(), status: 'open', title: `Repeat after-hours alerts — ${r.name}`, detail: `${n} after-hours alerts in the last ${S().repeatWindowDays} days` };
  db.tickets.push(t);
  log('TICKET_CREATED', { roomId: rid, detail: `Maintenance ticket ${t.id}: ${t.detail}`, notify: !quiet, severity: 'warning' });
}
function offlineCount(deviceId, now = new Date()) {
  const since = now.getTime() - S().offlineWindowHours * HOUR;
  return db.offlineEvents.filter(e => e.deviceId === deviceId && new Date(e.at).getTime() >= since).length;
}
function unstableCheck(deviceId, quiet) {
  const n = offlineCount(deviceId);
  if (n < S().offlineThreshold) return;
  if (db.tickets.some(t => t.deviceId === deviceId && t.kind === 'unstable_controller' && t.status === 'open')) return;
  const d = dev(deviceId);
  const t = { id: nid('TKT'), kind: 'unstable_controller', roomId: d.roomId, deviceId, createdAt: new Date().toISOString(), status: 'open', title: `Unstable controller — ${d.name}`, detail: `Went offline ${n} times in ${S().offlineWindowHours}h` };
  db.tickets.push(t);
  log('TICKET_CREATED', { roomId: d.roomId, deviceId, detail: `Maintenance ticket ${t.id}: ${t.detail}`, notify: !quiet, severity: 'warning' });
}

/* ------------------------------------------------------------------ */
/* Shutdowns                                                          */
/* ------------------------------------------------------------------ */
function previewShutdown({ scope, roomId, floorId }) {
  const now = new Date();
  let rooms;
  if (scope === 'floor') { if (!floor(floorId)) throw httpErr(400, 'Unknown floor'); rooms = db.rooms.filter(r => r.floorId === floorId); }
  else { const r = room(roomId); if (!r) throw httpErr(400, 'Unknown room'); rooms = [r]; }
  const out = [];
  for (const r of rooms) {
    const tt = ttActive(r.id, now), ex = excActive(r.id, now);
    for (const x of roomDevices(r.id)) {
      const state = devState(x);
      let reason = null;
      if (x.protected) reason = 'Protected device — cannot be selected';
      else if (x.pendingShutdown) reason = 'Already in a pending shutdown request';
      else if (tt) reason = `Excluded: "${tt.title}" until ${tt.end}`;
      else if (ex) reason = `Excluded: approved exception until ${hm(new Date(ex.endsAt))}`;
      out.push({ id: x.id, name: x.name, type: x.type, roomId: r.id, roomName: r.name, real: x.real, protected: x.protected, state, selectable: !reason, defaultSelected: !reason && state !== 'OFF', reason });
    }
  }
  return out;
}

function createShutdown({ scope, roomId, floorId, deviceIds, actor, role, auto, alertId }) {
  const preview = previewShutdown({ scope, roomId, floorId });
  const ids = [...new Set(deviceIds || [])];
  if (!ids.length) throw httpErr(400, 'Select at least one device');
  for (const id of ids) {
    const p = preview.find(x => x.id === id);
    if (!p) throw httpErr(400, `Device ${id} is not in this shutdown scope`);
    if (!p.selectable) throw httpErr(400, `${p.name}: ${p.reason}`);
  }
  const now = new Date();
  const windowSec = (scope === 'floor' || auto) ? S().cancelWindowSec : 0;
  const sd = {
    id: nid('SHD'), scope, roomId: roomId || null, floorId: scope === 'floor' ? floorId : room(roomId).floorId,
    deviceIds: ids, requestedBy: actor, role, auto: !!auto, alertId: alertId || null,
    createdAt: now.toISOString(), sendAt: new Date(now.getTime() + windowSec * 1000).toISOString(),
    status: 'scheduled', results: []
  };
  db.shutdowns.push(sd);
  ids.forEach(id => { dev(id).pendingShutdown = sd.id; });
  const where = scope === 'floor' ? floor(floorId).name : `${roomId} ${room(roomId).name}`;
  log(auto ? 'AUTO_SHUTDOWN_REQUESTED' : 'SHUTDOWN_REQUESTED', {
    actor, role, roomId: roomId || null, floorId: sd.floorId, notify: true, severity: 'warning',
    detail: `${sd.id}: ${auto ? `T+${S().shutdownMin} automatic` : scope === 'floor' ? 'Floor-wide' : 'Room'} shutdown request for ${where} — ${ids.length} device(s)${windowSec ? `, ${windowSec}s cancel window` : ''}`
  });
  return sd;
}

function cancelShutdown(sd, actor, role) {
  if (sd.status !== 'scheduled') throw httpErr(409, `Shutdown is already ${sd.status}`);
  sd.status = 'cancelled'; sd.cancelledAt = new Date().toISOString(); sd.cancelledBy = actor;
  sd.deviceIds.forEach(id => { const x = dev(id); if (x && x.pendingShutdown === sd.id) delete x.pendingShutdown; });
  log('SHUTDOWN_CANCELLED', { actor, role, roomId: sd.roomId, floorId: sd.floorId, detail: `${sd.id} cancelled during cancel window — never sent to the controller`, notify: true });
}

async function executeShutdown(sd) {
  sd.status = 'sending';
  const results = [];
  for (const id of sd.deviceIds) {
    const x = dev(id);
    if (!x) continue;
    if (x.pendingShutdown === sd.id) delete x.pendingShutdown;
    const r = room(x.roomId);
    const base = { deviceId: x.id, name: x.name, roomId: r.id, roomName: r.name, real: x.real, requested: 'OFF', physicallyVerified: false };
    if (x.real) {
      const c = await controllerCommand('OFF');
      let response, acknowledged = false;
      if (!c.ok) response = `Not delivered — controller unreachable (${c.error})`;
      else if (c.acknowledged) { acknowledged = true; response = `Controller acknowledged: "${c.ack}"`; }
      else if (c.ack) response = `Nano replied "${c.ack}" — not the expected acknowledgement (${c.expected || '*_ACCEPTED'})`;
      else response = 'Command sent — no reply from Nano';
      results.push({ ...base, response, acknowledged, commandSent: !!c.ok });
    } else if (x.simOnline === false) {
      results.push({ ...base, response: 'Not delivered — simulated controller offline', acknowledged: false, commandSent: false, simulated: true });
    } else {
      x.state = 'OFF';
      results.push({ ...base, response: 'Simulated record set to OFF — no physical controller', acknowledged: true, commandSent: false, simulated: true });
    }
  }
  sd.results = results; sd.status = 'completed'; sd.completedAt = new Date().toISOString();
  const ok = results.filter(r => r.acknowledged).length;
  log('SHUTDOWN_RESULT', {
    actor: 'System', roomId: sd.roomId, floorId: sd.floorId, notify: true,
    detail: `${sd.id} completed: ${ok}/${results.length} acknowledged (${results.filter(r => r.real).length} physical, ${results.filter(r => !r.real).length} simulated). Physical state not independently verified.`
  });
  // resolve open alerts in affected rooms that no longer have anything ON
  const affected = [...new Set(results.map(r => r.roomId))];
  for (const rid of affected) {
    const a = db.alerts.find(al => al.roomId === rid && al.status === 'open');
    if (a && onish(rid).length === 0) resolveAlert(a, sd.auto ? 'auto_shutdown' : 'manual_shutdown');
  }
  save();
}

/* ------------------------------------------------------------------ */
/* ESP32 controller bridge                                            */
/* ------------------------------------------------------------------ */
const ctl = { configured: false, online: false, everSeen: false, lastSeen: null, relay: 'UNKNOWN', lastAck: null, lastCmd: null, device: null, statusSource: null, error: 'Not configured', mock: false, busy: false };
const normRelay = v => { const s = String(v || '').toUpperCase(); return s === 'ON' || s === 'OFF' ? s : 'UNKNOWN'; };
const ctlUrl = () => (S().esp32Url || '').trim().replace(/\/+$/, '');

async function fetchJSON(url, ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { signal: ac.signal, cache: 'no-store' }); return await r.json(); }
  finally { clearTimeout(t); }
}
function setOnline(on, err) {
  const rd = realDevice();
  if (ctl.online && !on) {
    db.offlineEvents.push({ deviceId: rd.id, at: new Date().toISOString() });
    log('CONTROLLER_OFFLINE', { roomId: rd.roomId, deviceId: rd.id, detail: `ESP32 controller unreachable (${err})`, notify: true, severity: 'warning' });
    unstableCheck(rd.id);
  } else if (!ctl.online && on) {
    log('CONTROLLER_ONLINE', { roomId: rd.roomId, deviceId: rd.id, detail: `ESP32 controller reachable${ctl.mock ? ' (MOCK controller — not real hardware)' : ''}` });
  }
  if (on) ctl.everSeen = true;
  ctl.online = on; ctl.error = err;
}
async function pollController() {
  const url = ctlUrl();
  ctl.configured = !!url;
  if (!url) { if (ctl.online) setOnline(false, 'Controller URL removed'); ctl.error = 'Not configured'; return; }
  if (ctl.busy) return;
  try {
    const j = await fetchJSON(url + '/status', 2500);
    ctl.lastSeen = new Date().toISOString();
    ctl.relay = normRelay(j.relay);
    ctl.lastAck = j.lastAck ?? ctl.lastAck; ctl.lastCmd = j.lastCmd ?? ctl.lastCmd;
    ctl.device = j.device || 'esp32'; ctl.mock = /mock/i.test(ctl.device);
    ctl.statusSource = j.statusSource || null;
    realDevice().state = ctl.relay;
    setOnline(true, null);
  } catch (e) { setOnline(false, e.name === 'AbortError' ? 'timed out' : e.message); }
}
async function controllerCommand(cmd) {
  const url = ctlUrl();
  if (!url) return { ok: false, error: 'controller URL not configured' };
  ctl.busy = true;
  try {
    const j = await fetchJSON(`${url}/cmd?c=${encodeURIComponent(cmd)}`, 5000);
    ctl.lastCmd = cmd; ctl.lastAck = j.ack ?? null; ctl.lastSeen = new Date().toISOString();
    if (j.relay) { ctl.relay = normRelay(j.relay); realDevice().state = ctl.relay; }
    if (!ctl.online) setOnline(true, null);
    return { ok: !!j.ok, acknowledged: !!j.acknowledged, ack: j.ack, expected: j.expected, relay: j.relay, error: j.error };
  } catch (e) {
    const err = e.name === 'AbortError' ? 'timed out' : e.message;
    setOnline(false, err);
    return { ok: false, error: err };
  } finally { ctl.busy = false; }
}

/* ------------------------------------------------------------------ */
/* Engine tick                                                        */
/* ------------------------------------------------------------------ */
let ticking = false;
async function tick() {
  if (ticking) return; ticking = true;
  try {
    const now = new Date();
    const ph = phaseInfo(now);
    const s = S();

    // one-off bookings auto-expire
    db.timetable = db.timetable.filter(t => {
      if (t.kind === 'oneoff' && atHM(t.date, t.end) <= now) {
        log('BOOKING_EXPIRED', { roomId: t.roomId, detail: `One-off booking "${t.title}" (${t.date} ${t.start}–${t.end}) auto-expired` });
        return false;
      }
      return true;
    });

    // exceptions: reminder + expiry
    for (const e of db.exceptions) {
      const end = new Date(e.endsAt);
      if ((e.status === 'approved' || e.status === 'pending') && end <= now) {
        const was = e.status; e.status = 'expired'; e.expiredAt = now.toISOString();
        log('EXCEPTION_EXPIRED', { roomId: e.roomId, detail: `Exception ${e.id} ${was === 'pending' ? '(never approved) ' : ''}expired at ${hm(end)} — no longer honored by shutdown logic`, notify: true, severity: 'warning' });
      } else if (e.status === 'approved' && !e.reminded && end - now <= s.exceptionReminderMin * MIN) {
        e.reminded = true;
        log('EXCEPTION_REMINDER', { roomId: e.roomId, detail: `Exception ${e.id} for ${room(e.roomId).name} expires at ${hm(end)}`, notify: true, severity: 'warning' });
      }
    }

    // pre-closing sweep list
    if (ph.phase !== 'open') {
      let sw = db.sweeps[ph.key], fresh = false;
      if (!sw) { sw = db.sweeps[ph.key] = { key: ph.key, closing: ph.closing.toISOString(), createdAt: now.toISOString(), items: [] }; fresh = true; }
      if (fresh || ph.phase === 'sweep') {
        let added = 0;
        for (const r of db.rooms) {
          if (sw.items.some(i => i.roomId === r.id)) continue;
          if (ttActive(r.id, now)) continue;
          if (onish(r.id).length) { sw.items.push({ roomId: r.id, floorId: r.floorId, result: null, by: null, at: null }); added++; }
        }
        if (fresh) log('SWEEP_GENERATED', { detail: `Pre-closing sweep list generated for closing at ${hm(ph.closing)} — ${sw.items.length} room(s) ON or UNKNOWN`, notify: true });
        else if (added) log('SWEEP_UPDATED', { detail: `${added} room(s) added to sweep list` });
      }
    }

    // alert sequence
    for (const r of db.rooms) {
      const open = db.alerts.find(a => a.roomId === r.id && a.status === 'open');
      const on = onish(r.id);
      const ex = excuse(r.id, now, ph);
      if (open) {
        if (!on.length) resolveAlert(open, 'turned_off');
        else if (ex) resolveAlert(open, ex);
        else {
          const el = now - new Date(open.createdAt);
          if (open.stage < 1 && el >= pm(s.escalateMin)) {
            open.stage = 1; open.escalatedAt = now.toISOString();
            log('ALERT_ESCALATED', { roomId: r.id, detail: `T+${s.escalateMin} escalation — ${r.name} still not verified: ${on.map(devLabel).join(', ')}`, notify: true, severity: 'critical' });
          }
          if (open.stage < 2 && el >= pm(s.shutdownMin)) {
            open.stage = 2; open.shutdownAt = now.toISOString();
            const elig = previewShutdown({ scope: 'room', roomId: r.id }).filter(p => p.selectable && p.state !== 'OFF');
            if (elig.length) {
              const sd = createShutdown({ scope: 'room', roomId: r.id, deviceIds: elig.map(p => p.id), actor: 'System', role: 'system', auto: true, alertId: open.id });
              open.shutdownId = sd.id;
            } else {
              log('AUTO_SHUTDOWN_SKIPPED', { roomId: r.id, detail: `T+${s.shutdownMin}: no eligible devices in ${r.name}` });
            }
          }
        }
      } else if (ph.phase === 'after_hours' && on.length && !ex) {
        createAlert(r, on, now);
      }
    }

    // due shutdowns
    for (const sd of db.shutdowns.filter(x => x.status === 'scheduled' && new Date(x.sendAt) <= now)) await executeShutdown(sd);
    save();
  } catch (e) { console.error('tick error', e); }
  finally { ticking = false; }
}

/* ------------------------------------------------------------------ */
/* Views                                                              */
/* ------------------------------------------------------------------ */
function computeStreaks(now = new Date()) {
  const thisMon = startOfWeek(now).getTime();
  const WEEKS = 12;
  const breaks = a => a.status === 'open' || a.resolution === 'auto_shutdown';
  return db.floors.map(f => {
    const weeks = [];
    for (let w = WEEKS; w >= 0; w--) {
      const from = thisMon - w * 7 * DAY, to = from + 7 * DAY;
      const inWeek = db.alerts.filter(a => a.floorId === f.id && +new Date(a.createdAt) >= from && +new Date(a.createdAt) < to);
      weeks.push({ weeksAgo: w, start: new Date(from).toISOString(), clean: !inWeek.some(breaks), alerts: inWeek.length, unresolved: inWeek.filter(breaks).length });
    }
    const done = weeks.filter(w => w.weeksAgo > 0); // completed weeks, oldest first
    let current = 0;
    for (let i = done.length - 1; i >= 0 && done[i].clean; i--) current++;
    let best = 0, run = 0;
    for (const w of done) { run = w.clean ? run + 1 : 0; best = Math.max(best, run); }
    const thisWeek = weeks[weeks.length - 1];
    return { floorId: f.id, name: f.name, label: f.label, current, best, thisWeekClean: thisWeek.clean, thisWeekUnresolved: thisWeek.unresolved, weeks };
  }).sort((a, b) => b.current - a.current || b.best - a.best);
}

function roomView(r, now, ph) {
  const devs = roomDevices(r.id).map(x => ({
    id: x.id, name: x.name, type: x.type, real: x.real, protected: x.protected, state: devState(x),
    pendingShutdown: x.pendingShutdown || null, unstable: offlineCount(x.id, now) >= S().offlineThreshold,
    simOnline: x.simOnline !== false
  }));
  const rel = devs.filter(d => !d.protected);
  const openAlert = db.alerts.find(a => a.roomId === r.id && a.status === 'open') || null;
  let color;
  if (rel.some(d => d.state === 'ON')) color = openAlert ? 'red' : 'amber';
  else if (rel.some(d => d.state === 'PENDING')) color = 'amber';
  else if (rel.some(d => d.state === 'UNKNOWN')) color = 'grey';
  else color = 'green'; // for the real room this already implies controller online + reporting OFF
  const tt = ttActive(r.id, now), ex = excActive(r.id, now), it = sweepItem(r.id, ph);
  return {
    id: r.id, name: r.name, floorId: r.floorId, slot: r.slot, simulated: !devs.some(d => d.real),
    color, devices: devs, onCount: rel.filter(d => d.state === 'ON').length,
    openAlert, timetable: tt ? { title: tt.title, end: tt.end } : null,
    exception: ex ? { id: ex.id, endsAt: ex.endsAt, reason: ex.reason } : null,
    sweep: it || null, repeatCount: repeatCount(r.id, now), repeatFlag: repeatCount(r.id, now) >= S().repeatAlertThreshold,
    unstable: devs.some(d => d.unstable)
  };
}

function visibleTo(user) { return e => user.role === 'admin' || e.visibility === 'all' || e.actor === user.name; }

function snapshot(user) {
  const now = new Date();
  const ph = phaseInfo(now);
  const sw = db.sweeps[ph.key] || null;
  const rooms = db.rooms.map(r => roomView(r, now, ph));
  const s = S();
  const recentCut = now.getTime() - 2 * DAY;
  return {
    serverTime: now.toISOString(),
    user: { name: user.name, role: user.role },
    phase: { phase: ph.phase, closing: ph.closing.toISOString(), sweepStart: ph.sweepStart.toISOString(), override: !!(s.closingOverride && dateKey(new Date(s.closingOverride)) === dateKey(now)) },
    policy: { escalateMin: s.escalateMin, shutdownMin: s.shutdownMin, sweepLeadMin: s.sweepLeadMin, timeScale: s.timeScale, cancelWindowSec: s.cancelWindowSec, repeatAlertThreshold: s.repeatAlertThreshold, repeatWindowDays: s.repeatWindowDays, offlineThreshold: s.offlineThreshold, offlineWindowHours: s.offlineWindowHours, exceptionReminderMin: s.exceptionReminderMin, maxExceptionHours: s.maxExceptionHours },
    settings: user.role === 'admin' ? s : null,
    floors: db.floors, rooms,
    alerts: db.alerts.filter(a => a.status === 'open' || +new Date(a.createdAt) > recentCut).slice(-80),
    exceptions: db.exceptions.filter(e => e.status === 'pending' || e.status === 'approved' || +new Date(e.requestedAt) > recentCut),
    timetable: db.timetable.map(t => ({ ...t, active: !!(ttActive(t.roomId, now) && ttActive(t.roomId, now).id === t.id) })),
    sweep: sw ? { ...sw, items: sw.items.map(i => ({ ...i, roomName: room(i.roomId).name, devices: relevant(i.roomId).map(x => ({ name: x.name, state: devState(x), real: x.real })) })) } : null,
    shutdowns: db.shutdowns.slice(-25).reverse(),
    tickets: db.tickets.slice().reverse(),
    streaks: computeStreaks(now),
    controller: { configured: ctl.configured, online: ctl.online, lastSeen: ctl.lastSeen, relay: ctl.relay, lastAck: ctl.lastAck, lastCmd: ctl.lastCmd, device: ctl.device, statusSource: ctl.statusSource, error: ctl.error, mock: ctl.mock, url: user.role === 'admin' ? ctlUrl() : undefined },
    notifications: db.audit.filter(e => e.notify && +new Date(e.ts) > now.getTime() - 12 * HOUR).filter(visibleTo(user)).slice(-25).reverse()
  };
}

/* ------------------------------------------------------------------ */
/* HTTP                                                               */
/* ------------------------------------------------------------------ */
const sessions = new Map(); // token -> userId
function httpErr(status, msg) { const e = new Error(msg); e.status = status; return e; }
function send(res, status, obj) { const b = JSON.stringify(obj); res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(b); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 1e6) { reject(httpErr(413, 'Body too large')); req.destroy(); } });
    req.on('end', () => { if (!b) return resolve({}); try { resolve(JSON.parse(b)); } catch { reject(httpErr(400, 'Invalid JSON')); } });
  });
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
function serveStatic(req, res, pathname) {
  let p = pathname === '/' ? '/index.html' : pathname;
  const file = path.normalize(path.join(PUB, decodeURIComponent(p)));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { fs.readFile(path.join(PUB, 'index.html'), (e2, d2) => { if (e2) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end(d2); }); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

function needRole(user, role) { if (user.role !== role) throw httpErr(403, `Only ${role} can do this`); }
function parseHMStr(v) { if (!/^\d{2}:\d{2}$/.test(v || '')) throw httpErr(400, 'Time must be HH:MM'); return v; }

const routes = [];
const route = (method, pattern, handler, opts = {}) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler, auth: opts.auth !== false });

route('POST', '/api/login', async (req, body) => {
  const u = db.users.find(x => x.role === body.role);
  if (!u || String(body.pin) !== u.pin) throw httpErr(401, 'Wrong role or PIN');
  const token = crypto.randomBytes(18).toString('hex');
  sessions.set(token, u.id);
  log('USER_LOGIN', { actor: u.name, role: u.role, detail: `${u.name} signed in`, visibility: u.role === 'admin' ? 'admin' : 'all' });
  return { token, user: { name: u.name, role: u.role } };
}, { auth: false });

route('POST', '/api/logout', async (req, body, user, token) => { sessions.delete(token); return { ok: true }; });
route('GET', '/api/state', async (req, body, user) => snapshot(user));

route('GET', '/api/log', async (req, body, user, token, params, url) => {
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const visible = db.audit.filter(visibleTo(user));
  const tokens = q.split(/\s+/).filter(Boolean);
  const hay = e => {
    const d = new Date(e.ts);
    return [e.id, dateKey(d), hm(d), e.actor, e.role, e.action, e.action.replace(/_/g, ' '), e.roomId, e.roomName, e.roomId ? 'room ' + e.roomId : '', e.deviceId, e.deviceName, e.floorId, e.floorId ? floor(e.floorId)?.name : '', e.detail]
      .filter(Boolean).join(' | ').toLowerCase();
  };
  const matches = tokens.length ? visible.filter(e => { const h = hay(e); return tokens.every(t => h.includes(t)); }) : visible.slice(-50);
  return { query: q, searched: visible.length, limited: user.role !== 'admin', total: matches.length, entries: matches.slice(-300).reverse() };
});

route('POST', '/api/sweep', async (req, body, user) => {
  const ph = phaseInfo(new Date());
  const sw = db.sweeps[ph.key];
  if (!sw) throw httpErr(409, 'No sweep list yet — it is generated 15 minutes before closing');
  const it = sw.items.find(i => i.roomId === body.roomId);
  if (!it) throw httpErr(404, 'Room is not on the sweep list');
  if (!['turned_off', 'occupied', 'no_access'].includes(body.result)) throw httpErr(400, 'Invalid result');
  it.result = body.result; it.by = user.name; it.at = new Date().toISOString();
  const r = room(it.roomId);
  let detail = { turned_off: `Guard reported ${r.name} turned off`, occupied: `${r.name} still occupied — exception to be requested`, no_access: `${r.name}: guard could not access the room` }[body.result];
  if (body.result === 'turned_off') {
    // Simulated records follow the guard's report; the real device is never assumed OFF without its controller saying so.
    relevant(r.id).forEach(x => { if (!x.real && x.simOnline !== false) x.state = 'OFF'; });
    if (relevant(r.id).some(x => x.real && devState(x) === 'ON')) detail += ' — WARNING: controller still reports the physical socket ON';
  }
  log('SWEEP_' + body.result.toUpperCase(), { actor: user.name, role: user.role, roomId: r.id, detail });
  await tick();
  return { ok: true };
});

route('POST', '/api/exceptions', async (req, body, user) => {
  const r = room(body.roomId);
  if (!r) throw httpErr(400, 'Pick a room');
  const reason = String(body.reason || '').trim();
  if (reason.length < 4) throw httpErr(400, 'A reason is required');
  const end = new Date(body.endsAt);
  const now = new Date();
  if (isNaN(end)) throw httpErr(400, 'An end time is required — exceptions cannot be open-ended');
  if (end <= now) throw httpErr(400, 'End time must be in the future');
  if (end - now > S().maxExceptionHours * HOUR) throw httpErr(400, `Exceptions are limited to ${S().maxExceptionHours} hours`);
  const e = { id: nid('EXC'), roomId: r.id, reason: reason.slice(0, 300), endsAt: end.toISOString(), requestedBy: user.name, requestedRole: user.role, requestedAt: now.toISOString(), status: 'pending' };
  db.exceptions.push(e);
  log('EXCEPTION_REQUESTED', { actor: user.name, role: user.role, roomId: r.id, detail: `${e.id} requested until ${hm(end)} — reason: ${e.reason}`, notify: true });
  return e;
});

route('POST', '/api/exceptions/:id/decide', async (req, body, user, t, params) => {
  needRole(user, 'admin');
  const e = db.exceptions.find(x => x.id === params.id);
  if (!e) throw httpErr(404, 'Not found');
  if (e.status !== 'pending') throw httpErr(409, `Exception is ${e.status}`);
  if (new Date(e.endsAt) <= new Date()) throw httpErr(409, 'Exception end time already passed');
  const approve = body.decision === 'approve';
  e.status = approve ? 'approved' : 'rejected'; e.decidedBy = user.name; e.decidedAt = new Date().toISOString();
  log(approve ? 'EXCEPTION_APPROVED' : 'EXCEPTION_REJECTED', { actor: user.name, role: user.role, roomId: e.roomId, detail: `${e.id} ${e.status} (until ${hm(new Date(e.endsAt))}) — ${e.reason}`, notify: true });
  await tick();
  return e;
});

route('POST', '/api/timetable', async (req, body, user) => {
  needRole(user, 'admin');
  const r = room(body.roomId); if (!r) throw httpErr(400, 'Pick a room');
  const title = String(body.title || '').trim(); if (!title) throw httpErr(400, 'Title required');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : dateKey(new Date());
  const start = parseHMStr(body.start), end = parseHMStr(body.end);
  if (end <= start) throw httpErr(400, 'End must be after start');
  if (atHM(date, end) <= new Date()) throw httpErr(400, 'That booking would already be over');
  const t = { id: nid('TT'), roomId: r.id, title: title.slice(0, 80), kind: 'oneoff', date, start, end, createdBy: user.name };
  db.timetable.push(t);
  log('BOOKING_ADDED', { actor: user.name, role: user.role, roomId: r.id, detail: `One-off booking "${t.title}" ${date} ${start}–${end}`, visibility: 'admin' });
  await tick();
  return t;
});
route('DELETE', '/api/timetable/:id', async (req, body, user, t, params) => {
  needRole(user, 'admin');
  const i = db.timetable.findIndex(x => x.id === params.id);
  if (i < 0) throw httpErr(404, 'Not found');
  const [x] = db.timetable.splice(i, 1);
  log('TIMETABLE_REMOVED', { actor: user.name, role: user.role, roomId: x.roomId, detail: `Removed "${x.title}" (${x.kind === 'oneoff' ? x.date : 'recurring'} ${x.start}–${x.end})`, visibility: 'admin' });
  return { ok: true };
});

route('POST', '/api/shutdowns/preview', async (req, body) => ({ devices: previewShutdown(body), cancelWindowSec: body.scope === 'floor' ? S().cancelWindowSec : 0 }));
route('POST', '/api/shutdowns', async (req, body, user) => {
  const sd = createShutdown({ scope: body.scope === 'floor' ? 'floor' : 'room', roomId: body.roomId, floorId: body.floorId, deviceIds: body.deviceIds, actor: user.name, role: user.role });
  if (new Date(sd.sendAt) <= new Date()) await executeShutdown(sd);
  return sd;
});
route('POST', '/api/shutdowns/:id/cancel', async (req, body, user, t, params) => {
  const sd = db.shutdowns.find(x => x.id === params.id);
  if (!sd) throw httpErr(404, 'Not found');
  cancelShutdown(sd, user.name, user.role);
  return sd;
});

route('POST', '/api/devices/:id/on', async (req, body, user, t, params) => {
  needRole(user, 'admin');
  const x = dev(params.id);
  if (!x || !x.real) throw httpErr(400, 'Only the real demo device takes direct commands');
  const c = await controllerCommand('ON');
  log('DEVICE_COMMAND', { actor: user.name, role: user.role, roomId: x.roomId, deviceId: x.id, detail: `ON requested — ${c.ok ? (c.acknowledged ? `controller acknowledged: "${c.ack}"` : c.ack ? `Nano replied "${c.ack}" (not accepted)` : 'sent, no reply from Nano') : `not delivered (${c.error})`}. Physical state not independently verified.` });
  return c;
});
route('POST', '/api/devices/:id/simulate', async (req, body, user, t, params) => {
  needRole(user, 'admin');
  const x = dev(params.id);
  if (!x || x.real) throw httpErr(400, 'Only simulated records can be edited');
  const st = String(body.state || '').toUpperCase();
  if (st === 'OFFLINE') x.simOnline = false;
  else if (st === 'ONLINE') x.simOnline = true;
  else if (st === 'ON' || st === 'OFF') { x.state = st; x.simOnline = true; }
  else throw httpErr(400, 'state must be ON, OFF, OFFLINE or ONLINE');
  log('SIMULATED_RECORD_CHANGED', { actor: user.name, role: user.role, roomId: x.roomId, deviceId: x.id, detail: `Demo: simulated record set to ${st}`, visibility: 'admin' });
  await tick();
  return { ok: true };
});

route('POST', '/api/tickets/:id/close', async (req, body, user, t, params) => {
  needRole(user, 'admin');
  const k = db.tickets.find(x => x.id === params.id);
  if (!k) throw httpErr(404, 'Not found');
  k.status = 'closed'; k.closedAt = new Date().toISOString(); k.closedBy = user.name;
  log('TICKET_CLOSED', { actor: user.name, role: user.role, roomId: k.roomId, detail: `${k.id} closed` });
  return k;
});

route('POST', '/api/settings', async (req, body, user) => {
  needRole(user, 'admin');
  const s = S(), changed = [];
  const nums = { sweepLeadMin: [1, 120], escalateMin: [1, 240], shutdownMin: [2, 480], timeScale: [1, 60], cancelWindowSec: [10, 600], exceptionReminderMin: [1, 120], maxExceptionHours: [1, 24], repeatAlertThreshold: [2, 20], repeatWindowDays: [1, 60], offlineThreshold: [2, 20], offlineWindowHours: [1, 168] };
  for (const [k, [lo, hi]] of Object.entries(nums)) {
    if (body[k] === undefined || body[k] === '') continue;
    const v = Number(body[k]);
    if (!Number.isFinite(v) || v < lo || v > hi) throw httpErr(400, `${k} must be between ${lo} and ${hi}`);
    if (s[k] !== v) { changed.push(`${k}: ${s[k]} → ${v}`); s[k] = v; }
  }
  if (Number(body.shutdownMin ?? s.shutdownMin) <= Number(body.escalateMin ?? s.escalateMin)) throw httpErr(400, 'Shutdown step must come after escalation');
  if (body.closingTime !== undefined) { parseHMStr(body.closingTime); if (s.closingTime !== body.closingTime) { changed.push(`closingTime: ${s.closingTime} → ${body.closingTime}`); s.closingTime = body.closingTime; } }
  if (body.esp32Url !== undefined) {
    const u = String(body.esp32Url).trim();
    if (u && !/^https?:\/\/[^\s]+$/i.test(u)) throw httpErr(400, 'Controller URL must start with http://');
    if (s.esp32Url !== u) { changed.push(`esp32Url → ${u || '(none)'}`); s.esp32Url = u; ctl.everSeen = false; }
  }
  if (changed.length) log('SETTINGS_CHANGED', { actor: user.name, role: user.role, detail: changed.join('; '), visibility: 'admin' });
  pollController();
  return s;
});

route('POST', '/api/demo/closing', async (req, body, user) => {
  needRole(user, 'admin');
  const now = new Date();
  if (body.mode === 'clear') { S().closingOverride = null; log('DEMO_CLOCK', { actor: user.name, role: user.role, detail: `Closing override cleared — back to ${S().closingTime}`, visibility: 'admin' }); }
  else if (body.mode === 'sweep') { S().closingOverride = new Date(now.getTime() + pm(S().sweepLeadMin)).toISOString(); log('DEMO_CLOCK', { actor: user.name, role: user.role, detail: `Demo: closing set to ${hm(new Date(S().closingOverride))} (sweep starts now)`, visibility: 'admin' }); }
  else if (body.mode === 'closing') { S().closingOverride = now.toISOString(); log('DEMO_CLOCK', { actor: user.name, role: user.role, detail: `Demo: closing time set to now (${hm(now)})`, visibility: 'admin' }); }
  else throw httpErr(400, 'mode must be sweep, closing or clear');
  await tick();
  return { ok: true };
});

route('POST', '/api/demo/reset', async (req, body, user) => {
  needRole(user, 'admin');
  const keep = { esp32Url: S().esp32Url, timeScale: S().timeScale };
  seed();
  Object.assign(db.settings, keep);
  ctl.everSeen = false; ctl.online = false;
  log('DEMO_RESET', { actor: user.name, role: user.role, detail: 'Demo data reset', visibility: 'admin' });
  save(); pollController();
  return { ok: true };
});

route('POST', '/api/controller/test', async (req, body, user) => { needRole(user, 'admin'); await pollController(); return { online: ctl.online, error: ctl.error, relay: ctl.relay, device: ctl.device }; });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (!url.pathname.startsWith('/api/')) return serveStatic(req, res, url.pathname);
  try {
    const r = routes.find(x => x.method === req.method && x.re.test(url.pathname));
    if (!r) throw httpErr(404, 'No such endpoint');
    const params = url.pathname.match(r.re).groups || {};
    let user = null, token = null;
    if (r.auth) {
      token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      const uid = sessions.get(token);
      user = uid && db.users.find(u => u.id === uid);
      if (!user) throw httpErr(401, 'Please sign in');
    }
    const body = req.method === 'GET' ? {} : await readBody(req);
    const out = await r.handler(req, body, user, token, params, url);
    send(res, 200, out);
  } catch (e) {
    if (!e.status) console.error(e);
    send(res, e.status || 500, { error: e.message || 'Server error' });
  }
});

load();
setInterval(tick, 2000);
setInterval(pollController, 4000);
pollController();
tick();
server.listen(PORT, '0.0.0.0', () => {
  const nets = require('os').networkInterfaces();
  const ips = Object.values(nets).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address);
  console.log(`\nCampusPulse running:\n  http://localhost:${PORT}\n${ips.map(i => `  http://${i}:${PORT}   (phones on the same Wi-Fi)`).join('\n')}\n\nDemo PINs — Admin: 1234 · Security: 0000\n`);
});
