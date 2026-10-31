'use strict';
/* CampusPulse — mobile web client (no build step, no dependencies). */

/* ---------- icons (Feather, MIT) ---------- */
const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  sweep: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  more: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  chev: '<polyline points="9 18 15 12 9 6"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  wifioff: '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  hourglass: '<path d="M6 2h12M6 22h12M7 2c0 5 5 6 5 10s-5 5-5 10M17 2c0 5-5 6-5 10s5 5 5 10"/>'
};
const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { } }
};

/* ---------- state ---------- */
const St = {
  token: store.get('cp_token'), user: JSON.parse(store.get('cp_user') || 'null'),
  data: null, route: (location.hash || '#home').slice(1), floor: 'F1', modal: null,
  log: null, logQ: '', skew: 0, seenNotif: store.get('cp_seen') || '', loginRole: 'security'
};
const ROUTES = { home: 'Home', twin: 'Digital Twin', sweep: 'Sweep List', log: 'Ask the Log', more: 'More', exceptions: 'Timed Exceptions', timetable: 'Timetable', shutdowns: 'Shutdowns', issues: 'Repeat Issues', streaks: 'Floor Streaks', settings: 'Settings' };
const NAV = [['home', 'home', 'Home'], ['twin', 'grid', 'Twin'], ['sweep', 'sweep', 'Sweep'], ['log', 'search', 'Log'], ['more', 'more', 'More']];
const STATIC_VIEWS = new Set(['log', 'settings']); // views with inputs — not auto re-rendered by polling
const isAdmin = () => St.user && St.user.role === 'admin';

/* ---------- utils ---------- */
const nowS = () => new Date(Date.now() + St.skew);
const pad = n => String(n).padStart(2, '0');
const hm = iso => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dt = iso => { const d = new Date(iso); return `${dk(d)} ${hm(iso)}`; };
function fmtDur(ms) {
  ms = Math.max(0, ms); const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  if (h) return `${h}h ${pad(m)}m`; if (m) return `${m}m ${pad(x)}s`; return `${x}s`;
}
function ago(iso) { const ms = nowS() - new Date(iso); if (ms < 60000) return 'just now'; if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`; if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`; return `${Math.floor(ms / 86400000)}d ago`; }
const cd = (iso, mode = 'until') => `<span data-cd="${esc(iso)}" data-mode="${mode}">${fmtDur(mode === 'until' ? new Date(iso) - nowS() : nowS() - new Date(iso))}</span>`;
const policyAt = (iso, min) => new Date(new Date(iso).getTime() + min * St.data.policy.timeScale * 1000).toISOString();

const STATE_CLS = { ON: 'p-on', OFF: 'p-off', PENDING: 'p-pending', UNKNOWN: 'p-unknown', SIMULATED: 'p-sim' };
const statePill = s => `<span class="pill ${STATE_CLS[s] || 'p-unknown'}"><i class="d"></i>${s === 'UNKNOWN' ? 'Unknown/Offline' : s}</span>`;
const physPill = real => real ? '<span class="pill p-phys">Physical</span>' : '<span class="pill p-sim">Simulated</span>';
const COLOR_LABEL = { green: 'Off · verified', amber: 'Pending / due', red: 'Still on', grey: 'Offline / unknown' };
const COLOR_HEX = { green: '#10B981', amber: '#F59E0B', red: '#EF4444', grey: '#94A3B8' };
const room = id => St.data.rooms.find(r => r.id === id);
const floorName = id => (St.data.floors.find(f => f.id === id) || {}).name || id;

function toast(msg, err) {
  const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  $('#toast').appendChild(t); setTimeout(() => t.remove(), 3500);
}
async function api(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (St.token || '') }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && url !== '/api/login') { doLogout(true); throw new Error('Session expired — sign in again'); }
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
async function act(fn, okMsg) {
  try { const r = await fn(); if (okMsg) toast(okMsg); await poll(true); return r; }
  catch (e) { toast(e.message, true); }
}

/* ---------- polling & render ---------- */
let pollBusy = false;
async function poll(force) {
  if (!St.token || (pollBusy && !force)) return;
  pollBusy = true;
  try {
    const d = await api('GET', '/api/state');
    St.skew = new Date(d.serverTime) - Date.now();
    St.data = d; St.user = d.user;
    const ae = document.activeElement;
    const typing = ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName);
    if (force || (!STATIC_VIEWS.has(St.route) && !(typing && $('#root').contains(ae)))) renderPage();
    else renderChrome();
    if (St.modal && (St.modal.live || force) && !(typing && $('#modal').contains(ae))) renderModal();
  } catch (e) { if (!/Session/.test(e.message)) console.warn(e); }
  finally { pollBusy = false; }
}
setInterval(poll, 2000);
setInterval(() => {
  document.querySelectorAll('[data-cd]').forEach(el => {
    const t = new Date(el.dataset.cd);
    el.textContent = fmtDur(el.dataset.mode === 'since' ? nowS() - t : t - nowS());
  });
}, 1000);

function render() {
  if (!St.token) return renderLogin();
  if (!St.data) { $('#root').innerHTML = '<div class="login"><div class="muted">Loading CampusPulse…</div></div>'; poll(true); return; }
  renderPage();
}
function renderPage() {
  const v = VIEWS[St.route] || VIEWS.home;
  const y = window.scrollY;
  $('#root').innerHTML = shell(v());
  window.scrollTo(0, y);
}
function renderChrome() {
  const tb = $('.topbar'); if (!tb) return;
  const n = unread(); const dot = tb.querySelector('.dot');
  if (n && !dot) tb.querySelector('[data-act=notifs]').insertAdjacentHTML('beforeend', '<i class="dot"></i>');
  if (!n && dot) dot.remove();
}
const unread = () => St.data ? St.data.notifications.filter(n => n.id > St.seenNotif).length : 0;

function shell(content) {
  const u = St.user || {};
  const initials = u.role === 'admin' ? 'AD' : 'SO';
  const navRoute = NAV.some(n => n[0] === St.route) ? St.route : 'more';
  const sweepPending = St.data.sweep ? St.data.sweep.items.filter(i => !i.result).length : 0;
  return `<div id="app">
    <header class="topbar">
      <div class="brand"><div class="logo">${ic('shield')}</div><div><b>CampusPulse</b><span>${esc(ROUTES[St.route] || 'Home')} · ${u.role === 'admin' ? 'Admin' : 'Security'}</span></div></div>
      <button class="iconbtn" data-act="notifs" aria-label="Notifications">${ic('bell')}${unread() ? '<i class="dot"></i>' : ''}</button>
      <button class="avatar" data-act="go" data-r="more" aria-label="Account">${initials}</button>
    </header>
    <main>${content}</main>
  </div>
  <nav class="nav"><div class="nav-in">${NAV.map(([r, i, l]) => `<button class="${navRoute === r ? 'on' : ''}" data-act="go" data-r="${r}"><span class="ib">${ic(i)}${r === 'sweep' && sweepPending ? `<span class="badge">${sweepPending}</span>` : ''}</span>${l}</button>`).join('')}</div></nav>`;
}

/* ---------- login ---------- */
function renderLogin() {
  $('#modal').innerHTML = '';
  $('#root').innerHTML = `<div class="login"><form class="card" data-form="login">
    <div class="hero-ic">${ic('shield')}</div>
    <h1 style="text-align:center;font-size:26px;line-height:32px">CampusPulse</h1>
    <p class="muted" style="text-align:center;margin:6px 0 20px">Camera-free campus shutdown &amp; security</p>
    <div class="seg">
      <button type="button" class="${St.loginRole === 'security' ? 'on' : ''}" data-act="loginrole" data-r="security">${ic('shield', 'sm')} Security</button>
      <button type="button" class="${St.loginRole === 'admin' ? 'on' : ''}" data-act="loginrole" data-r="admin">${ic('user', 'sm')} Admin</button>
    </div>
    <label class="f" for="pin">PIN</label>
    <input class="input" id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" placeholder="••••" required>
    <button class="btn primary block lg" style="margin-top:18px">Sign in</button>
    <p class="muted small" style="text-align:center;margin-top:14px">Demo PINs — Security <b>0000</b> · Admin <b>1234</b></p>
  </form></div>`;
  setTimeout(() => $('#pin') && $('#pin').focus(), 50);
}
function doLogout(silent) {
  if (!silent && St.token) api('POST', '/api/logout').catch(() => { });
  St.token = null; St.data = null; St.modal = null; St.log = null;
  store.set('cp_token', null); store.set('cp_user', null);
  renderLogin();
}

/* ---------- HOME ---------- */
function vHome() {
  const d = St.data, ph = d.phase, p = d.policy;
  const open = d.alerts.filter(a => a.status === 'open');
  const escd = open.filter(a => a.stage >= 1).length;
  const roomsOn = d.rooms.filter(r => r.onCount > 0).length;
  const pend = d.exceptions.filter(e => e.status === 'pending').length;
  const activeEx = d.exceptions.filter(e => e.status === 'approved').length;
  const sw = d.sweep, swDone = sw ? sw.items.filter(i => i.result).length : 0, swTot = sw ? sw.items.length : 0;
  const h = nowS().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const phasePill = { open: '<span class="pill p-ok"><i class="d"></i>Standard hours</span>', sweep: '<span class="pill p-warn"><i class="d"></i>Pre-closing sweep</span>', after_hours: `<span class="pill ${open.length ? 'p-crit' : 'p-info'}"><i class="d"></i>After-hours mode</span>` }[ph.phase];

  const msLeft = new Date(ph.closing) - nowS();
  const frac = ph.phase === 'after_hours' ? 0 : Math.min(1, msLeft / (8 * 3600000));
  const ring = `<div class="ring"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="36" stroke="#E8EDFF" stroke-width="8" fill="none"/><circle cx="42" cy="42" r="36" stroke="url(#gr)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${(226 * frac).toFixed(1)} 226"/><defs><linearGradient id="gr"><stop offset="0" stop-color="#5146F5"/><stop offset="1" stop-color="#7167FF"/></linearGradient></defs></svg>
    <div class="t"><div>${ph.phase === 'after_hours' ? ic('moon') : `${msLeft > 3600000 ? (msLeft / 3600000).toFixed(1) + 'h' : Math.ceil(msLeft / 60000) + 'm'}<small>LEFT</small>`}</div></div></div>`;
  let title, sub;
  if (ph.phase === 'open') { title = `Campus closing ${hm(ph.closing)}`; sub = `Sweep list generates in ${cd(ph.sweepStart)}`; }
  else if (ph.phase === 'sweep') { title = `Closing in ${cd(ph.closing)}`; sub = `Pre-closing sweep in progress — ${swDone}/${swTot} rooms checked`; }
  else { title = `Closed at ${hm(ph.closing)}`; sub = `After-hours for ${cd(ph.closing, 'since')} · ${open.length} open alert${open.length === 1 ? '' : 's'}`; }

  const demoClock = p.timeScale !== 60 ? `<span class="pill p-warn">Demo clock · 1 policy min = ${p.timeScale}s</span>` : '';

  return `
  <div class="row between wrap" style="margin:4px 2px 6px">${phasePill}${ph.override ? '<span class="pill p-info">Closing time overridden (demo)</span>' : ''}</div>
  <h1 class="h-display" style="margin:6px 2px 2px">${greet}, ${isAdmin() ? 'Admin' : 'Officer'}</h1>
  <div class="muted row" style="margin:0 2px 16px">${ic('shield', 'sm')} Main Block · 3 floors · 18 rooms</div>
  <div class="cols-d"><div>
  <div class="card pad-lg">
    <div class="row" style="align-items:flex-start">
      <div style="flex:1;min-width:0">
        <span class="pill p-info"><i class="d"></i>${ph.phase === 'open' ? 'Standard hours active' : ph.phase === 'sweep' ? 'Sweep window' : 'Night security mode'}</span>
        <h2 style="font:700 26px/32px var(--display);margin:10px 0 6px">${title}</h2>
        <div class="muted row">${ic('clock', 'sm')}<span>${sub}</span></div>
      </div>${ring}
    </div>
    <div class="notice" style="margin-top:14px">${ic('calendar', 'sm')}<div style="flex:1">T+0 alert · T+${p.escalateMin} escalation · T+${p.shutdownMin} shutdown request${demoClock ? `<div style="margin-top:6px">${demoClock}</div>` : ''}</div></div>
    ${ph.phase !== 'open' ? `<button class="btn ghost block" style="margin-top:10px" data-act="go" data-r="sweep">${ic('sweep', 'sm')} Open sweep list</button>` : ''}
  </div>
  ${open.length ? timelineCard(open) : ''}
  <div class="card pad-lg">
    <div class="row" style="align-items:flex-start">
      <div class="tile" style="padding:0;border:0;box-shadow:none;min-height:0"><div class="ic">${ic('power')}</div></div>
      <div style="flex:1"><h3 style="font:600 18px/24px var(--display)">Floor shutdown</h3><div class="muted small">Preview every affected device first · 2-minute cancel window</div></div>
    </div>
    <button class="btn primary block lg" style="margin-top:14px" data-act="floorpick">${ic('power')} Turn off eligible devices…</button>
  </div>
  </div><div>
  <div class="section-h" style="margin-top:8px"><h2>Campus status</h2><span class="eyebrow">Live sync</span></div>
  <div class="grid g2">
    ${tile('Rooms still ON', roomsOn, `of ${d.rooms.length} rooms`, 'zap', roomsOn ? 'amber' : 'green', 'twin')}
    ${tile('Open alerts', open.length, escd ? `${escd} escalated` : 'none escalated', 'alert', open.length ? 'red' : 'green', 'twin')}
    ${tile('Exceptions', activeEx, pend ? `${pend} awaiting approval` : 'active, timed', 'clock', pend ? 'amber' : '', 'exceptions')}
    ${tile('Sweep', sw ? `${swDone}/${swTot}` : '—', sw ? `${swTot ? Math.round(swDone / swTot * 100) : 100}% complete` : `at ${hm(ph.sweepStart)}`, 'sweep', '', 'sweep')}
  </div>
  ${hwCard()}
  </div></div>
  <div class="section-h"><h2>Quick operations</h2><span class="eyebrow">Tap to open</span></div>
  <div class="grid g3 g4d" style="grid-template-columns:repeat(3,minmax(0,1fr))">
    ${qop('twin', 'grid', 'Digital Twin', `${d.rooms.filter(r => r.color === 'red').length} red`)}
    ${qop('sweep', 'sweep', 'Sweep List', sw ? `${swTot - swDone} left` : 'not yet')}
    ${qop('exceptions', 'clock', 'Exceptions', `${pend} pending`)}
    ${qop('timetable', 'calendar', 'Timetable', `${d.timetable.filter(t => t.active).length} live now`)}
    ${qop('issues', 'tool', 'Repeat Issues', `${d.tickets.filter(t => t.status === 'open').length} tickets`)}
    ${qop('streaks', 'award', 'Floor Streaks', `${d.streaks[0] ? d.streaks[0].current : 0} wk lead`)}
  </div>
  <div class="section-h"><h2>Operational feed</h2><button class="linkbtn" data-act="go" data-r="log">View all logs</button></div>
  <div class="card flush">${d.notifications.length ? d.notifications.slice(0, 6).map(feedItem).join('') : '<div class="empty">No recent events</div>'}</div>`;
}
const tile = (lbl, val, sub, icon, tone, r) => `<button class="tile" data-act="go" data-r="${r}" style="text-align:left"><div class="top"><span class="lbl">${lbl}</span><span class="ic ${tone ? 'bg-' + tone : ''}">${ic(icon, 'sm')}</span></div><div class="val ${tone ? 'c-' + tone : ''}">${val}</div><div class="sub">${sub}</div></button>`;
const qop = (r, i, t, s) => `<button class="qop" data-act="go" data-r="${r}"><span class="ic">${ic(i)}</span><b>${t}</b><span>${esc(s)}</span></button>`;
const SEV = { critical: ['p-crit', 'alert', 'High severity'], warning: ['p-warn', 'alert', 'Warning'], info: ['p-info', 'info', 'Info'] };
function feedItem(n) {
  const [cls, icon, lbl] = SEV[n.severity] || SEV.info;
  return `<div class="feed-item"><div class="feed-ic ${cls === 'p-crit' ? 'bg-red' : cls === 'p-warn' ? 'bg-amber' : ''}">${ic(icon, 'sm')}</div>
    <div style="flex:1;min-width:0"><div class="row between"><span class="pill ${cls}">${lbl}</span><span class="muted small">${ago(n.ts)}</span></div>
    <b style="margin-top:4px">${esc(n.action.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()))}${n.roomId ? ` · ${esc(n.roomId)}` : ''}</b>
    <div class="muted small">${esc(n.detail)}</div></div></div>`;
}
function timelineCard(open) {
  const p = St.data.policy;
  const a = open.slice().sort((x, y) => y.stage - x.stage || new Date(x.createdAt) - new Date(y.createdAt))[0];
  const r = room(a.roomId);
  const t15 = policyAt(a.createdAt, p.escalateMin), t25 = policyAt(a.createdAt, p.shutdownMin);
  const step = (cls, icon, title, time, body) => `<div class="tl-step ${cls}"><div class="tl-dot">${ic(icon, 'sm')}</div><div class="tl-body"><div class="row between"><b>${title}</b><span class="pill ${cls === 'now' ? 'p-warn' : 'p-info'}">${time}</span></div><div class="muted small">${body}</div></div></div>`;
  return `<div class="card pad-lg"><div class="row between" style="margin-bottom:14px"><h3 class="row" style="font:600 18px/24px var(--display)">${ic('clock', 'c-indigo')} After-hours timeline</h3><span class="pill p-info">${open.length} open</span></div>
  <div class="eyebrow" style="margin-bottom:10px">Most urgent · Room ${esc(r.id)} ${esc(r.name)}</div>
  <div class="tl">
    ${step(a.stage >= 1 ? 'done' : 'now', a.stage >= 1 ? 'check' : 'alert', 'T+0 Initial alert', hm(a.createdAt), `Device still ON/UNKNOWN at closing. ${a.stage === 0 ? `Escalates in ${cd(t15)}` : 'Complete'}`)}
    ${step(a.stage >= 2 ? 'done' : a.stage === 1 ? 'now' : '', a.stage >= 2 ? 'check' : 'hourglass', `T+${p.escalateMin} Escalation`, hm(t15), a.stage >= 1 ? `Escalated — awaiting physical verification. ${a.stage === 1 ? `Shutdown request in ${cd(t25)}` : ''}` : 'Unverified rooms flagged for duty guards')}
    ${step(a.stage >= 2 ? 'now' : '', 'power', `T+${p.shutdownMin} Shutdown request`, hm(t25), a.stage >= 2 ? `Requested (${esc(a.shutdownId || 'no eligible devices')}) — see Shutdowns` : 'Eligible devices without an approved exception')}
  </div>
  <button class="btn ghost block" style="margin-top:12px" data-act="room" data-id="${esc(r.id)}">Inspect Room ${esc(r.id)}</button></div>`;
}
function hwCard() {
  const c = St.data.controller;
  const nanoStale = c.online && c.nanoLink && c.nanoLink !== 'confirmed';
  const st = !c.configured ? ['p-dark', 'Not configured'] : !c.online ? ['p-crit', 'Offline'] : nanoStale ? ['p-warn', 'Nano: no reply'] : ['p-ok', 'Online'];
  let line;
  if (!c.configured) line = 'Set the ESP32 address in Settings. Room 104 stays grey (UNKNOWN) until the controller reports.';
  else if (c.online && nanoStale) line = 'ESP32 is reachable, but the Nano has not confirmed a command recently, so the relay state is UNKNOWN. Send ON or OFF to re-sync, and check the Nano power and wiring.';
  else if (c.online) line = `Relay reports <b>${esc(c.relay)}</b>${c.lastAck ? ` · last Nano ack: “${esc(c.lastAck)}”` : ''}<br><span class="small">${c.statusSource === 'nano' ? 'State reported by the Nano' : 'State = last command the Nano confirmed (START_ACCEPTED / STOP_ACCEPTED)'}</span>`;
  else line = `Controller unreachable (${esc(c.error || 'no response')}). Room 104 shown as UNKNOWN — never green.`;
  return `<div class="card dark pad-lg" style="margin-top:12px">
    <div class="row" style="align-items:flex-start"><div class="feed-ic" style="background:rgba(255,255,255,.12);color:#fff">${ic('cpu')}</div>
    <div style="flex:1"><div class="row wrap"><h3 style="font:600 18px/24px var(--display)">Hardware testbed</h3><span class="pill ${st[0]}"><i class="d"></i>${st[1]}</span>${c.mock ? '<span class="pill p-warn">Mock controller — not real hardware</span>' : ''}</div>
    <div class="muted" style="margin-top:6px">ESP32 → Arduino Nano → Relay 1 → socket. 1 physical output (Room 104), 17 simulated rooms.</div>
    <div style="margin-top:8px">${line}</div>
    <div class="small" style="margin-top:8px;color:#FCD34D">Physical state not independently verified</div></div></div></div>`;
}

/* ---------- DIGITAL TWIN ---------- */
function vTwin() {
  const d = St.data;
  const rooms = d.rooms.filter(r => r.floorId === St.floor).sort((a, b) => a.slot - b.slot);
  const cnt = c => rooms.filter(r => r.color === c).length;
  const sim = rooms.filter(r => r.simulated).length;
  const tileR = r => {
    const icons = [];
    if (r.exception || r.timetable) icons.push(`<span title="Excused">${ic('clock', 'c-indigo')}</span>`);
    if (r.repeatFlag) icons.push(`<span title="Repeat issue">${ic('flag', 'c-amber')}</span>`);
    if (r.unstable) icons.push(`<span title="Unstable controller">${ic('wifioff', 'c-red')}</span>`);
    const status = r.color === 'red' ? `${r.onCount} ON · ${r.openAlert && r.openAlert.stage >= 1 ? 'Escalated' : 'Alert'}` : r.color === 'amber' ? (r.onCount ? `${r.onCount} ON · due` : 'Pending') : r.color === 'grey' ? 'Offline / unknown' : 'All off';
    const until = r.exception ? `Exception till ${hm(r.exception.endsAt)}` : r.timetable ? `${esc(r.timetable.title)} till ${r.timetable.end}` : '';
    return `<button class="room ${r.color} ${r.simulated ? 'sim' : 'phys'}" data-act="room" data-id="${r.id}">
      <div class="ics">${icons.join('')}</div>
      ${r.simulated ? '' : '<span class="tag">● PHYSICAL</span>'}
      <span class="no">${r.id}</span><span class="nm">${esc(r.name)}</span>
      ${until ? `<span class="until">${until}</span>` : ''}
      <span class="st">${status}</span></button>`;
  };
  return `
  <div class="chips" style="margin-bottom:12px">${d.floors.map(f => { const red = d.rooms.filter(r => r.floorId === f.id && r.color === 'red').length; return `<button class="chip ${St.floor === f.id ? 'on' : ''}" data-act="floor" data-f="${f.id}">${esc(f.name)} · ${esc(f.label)}${red ? `<span class="n">${red}</span>` : ''}</button>`; }).join('')}</div>
  <div class="legend" style="margin-bottom:12px">
    ${['green', 'amber', 'red', 'grey'].map(c => `<span class="lg"><i style="background:${COLOR_HEX[c]}"></i>${COLOR_LABEL[c]} <b>${cnt(c)}</b></span>`).join('')}
    <span class="lg"><i style="background:transparent;outline:2px dashed #3B82F6;outline-offset:-1px"></i>Simulated <b>${sim}</b></span>
  </div>
  <div class="plan">
    <div class="plan-row">${rooms.filter(r => r.slot < 3).map(tileR).join('')}</div>
    <div class="corridor">CORRIDOR · ${esc(floorName(St.floor).toUpperCase())}</div>
    <div class="plan-row">${rooms.filter(r => r.slot >= 3).map(tileR).join('')}</div>
  </div>
  <div class="notice blue" style="margin-top:12px">${ic('info', 'sm')}<div>Only <b>Room 104</b> is wired to real hardware. Every room with a blue dashed outline is a <b>simulated record</b>. A room is green only when its controller is online and reporting OFF.</div></div>`;
}

function mRoom(m) {
  const r = room(m.id); if (!r) return '';
  const p = St.data.policy, c = St.data.controller;
  const notes = [];
  if (r.openAlert) {
    const a = r.openAlert;
    if (a.stage === 0) notes.push(['red', 'alert', `T+0 alert raised at ${hm(a.createdAt)} — escalates at ${hm(policyAt(a.createdAt, p.escalateMin))}`]);
    else if (a.stage === 1) notes.push(['red', 'alert', `ESCALATED — awaiting physical verification. Automatic shutdown request at ${hm(policyAt(a.createdAt, p.shutdownMin))}`]);
    else notes.push(['red', 'power', `T+${p.shutdownMin} shutdown requested (${esc(a.shutdownId || 'no eligible devices')})`]);
  }
  if (r.timetable) notes.push(['blue', 'calendar', `“${esc(r.timetable.title)}” until ${r.timetable.end} — excluded from closing alerts`]);
  if (r.exception) notes.push(['blue', 'clock', `Approved exception until ${hm(r.exception.endsAt)} (${cd(r.exception.endsAt)} left) — ${esc(r.exception.reason)}`]);
  if (r.repeatFlag) notes.push(['amber', 'flag', `Repeat issue: ${r.repeatCount} after-hours alerts in ${p.repeatWindowDays} days — maintenance ticket raised`]);
  if (r.unstable) notes.push(['amber', 'wifioff', `Unstable controller: offline ${p.offlineThreshold}+ times in ${p.offlineWindowHours}h`]);
  if (r.sweep && r.sweep.result) notes.push(['green', 'sweep', `Sweep: ${SWEEP_LBL[r.sweep.result]} by ${esc(r.sweep.by)} at ${hm(r.sweep.at)}`]);
  if (!r.simulated) notes.push(['', 'cpu', c.configured ? (c.online ? (c.nanoLink && c.nanoLink !== 'confirmed' ? 'Nano: no recent confirmed reply, relay UNKNOWN' : `Controller online${c.mock ? ' (MOCK)' : ''} · relay reports ${esc(c.relay)}`) : `Controller offline — ${esc(c.error || '')}`) : 'Controller not configured (Settings → ESP32 address)']);
  const devRow = x => `<div class="dev-row">
    <div class="feed-ic">${ic(x.real ? 'cpu' : x.protected ? 'lock' : 'zap', 'sm')}</div>
    <div class="grow"><b>${esc(x.name)}</b><div class="muted small">${esc(x.type)}${x.real ? ' · state from controller report' : ''}</div>
      <div class="row wrap" style="gap:5px;margin-top:5px">${statePill(x.state)}${physPill(x.real)}${x.protected ? '<span class="pill p-prot">Protected</span>' : ''}${x.unstable ? '<span class="pill p-warn">Unstable</span>' : ''}</div>
      ${isAdmin() && x.real ? `<div class="row" style="margin-top:8px"><button class="btn sm" data-act="realon" data-id="${x.id}">${ic('power', 'sm')} Send ON (test)</button><span class="muted small">OFF goes through Shutdown Preview</span></div>` : ''}
      ${isAdmin() && !x.real && !x.protected ? `<div class="row wrap" style="margin-top:8px;gap:6px"><span class="muted small">Demo — set simulated record:</span><button class="btn sm" data-act="sim" data-id="${x.id}" data-s="ON">ON</button><button class="btn sm" data-act="sim" data-id="${x.id}" data-s="OFF">OFF</button><button class="btn sm" data-act="sim" data-id="${x.id}" data-s="${x.simOnline ? 'OFFLINE' : 'ONLINE'}">${x.simOnline ? 'Offline' : 'Online'}</button></div>` : ''}
    </div></div>`;
  return sheet(`<div class="sheet-h"><div style="flex:1"><div class="eyebrow">${esc(floorName(r.floorId))}</div><h3>Room ${esc(r.id)} · ${esc(r.name)}</h3>
      <div class="row wrap" style="gap:6px;margin-top:6px">${physPill(!r.simulated)}<span class="pill" style="background:${COLOR_HEX[r.color]}22;color:${COLOR_HEX[r.color]}"><i class="d"></i>${COLOR_LABEL[r.color]}</span></div></div>${closeBtn()}</div>
    ${notes.map(([cls, i, t]) => `<div class="notice ${cls}">${ic(i, 'sm')}<div>${t}</div></div>`).join('')}
    <div class="eyebrow" style="margin:16px 0 4px">Devices</div>
    ${r.devices.map(devRow).join('')}
    ${!r.simulated ? '<div class="verify-note" style="margin-top:10px">' + ic('info', 'sm') + 'Physical state not independently verified — no sensors in this build</div>' : ''}
    <div class="grid g2" style="margin-top:16px">
      <button class="btn" data-act="excnew" data-id="${r.id}">${ic('clock', 'sm')} Request exception</button>
      <button class="btn navy" data-act="preview" data-scope="room" data-id="${r.id}">${ic('power', 'sm')} Shutdown preview</button>
    </div>`);
}
const sheet = inner => `<div class="overlay" data-act="bg"><div class="sheet" role="dialog"><div class="grab"></div>${inner}</div></div>`;
const closeBtn = () => `<button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button>`;

/* ---------- SHUTDOWN PREVIEW / STATUS ---------- */
async function openPreview(scope, id) {
  St.modal = { type: 'preview', scope, roomId: scope === 'room' ? id : null, floorId: scope === 'floor' ? id : null, devices: null, sel: new Set() };
  renderModal();
  try {
    const r = await api('POST', '/api/shutdowns/preview', { scope, roomId: St.modal.roomId, floorId: St.modal.floorId });
    St.modal.devices = r.devices; St.modal.windowSec = r.cancelWindowSec;
    r.devices.filter(x => x.defaultSelected).forEach(x => St.modal.sel.add(x.id));
  } catch (e) { toast(e.message, true); St.modal = null; }
  renderModal();
}
function mPreview(m) {
  const title = m.scope === 'floor' ? `${esc(floorName(m.floorId))} — floor-wide shutdown` : `Room ${esc(m.roomId)} — shutdown`;
  if (!m.devices) return sheet(`<div class="sheet-h"><h3 style="flex:1">${title}</h3>${closeBtn()}</div><div class="empty">Loading preview…</div>`);
  const groups = {};
  m.devices.forEach(x => (groups[x.roomId] = groups[x.roomId] || []).push(x));
  const n = m.sel.size;
  const prot = m.devices.filter(x => x.protected).length, excl = m.devices.filter(x => !x.selectable && !x.protected).length;
  return sheet(`<div class="sheet-h"><div style="flex:1"><div class="eyebrow">Shutdown preview</div><h3>${title}</h3></div>${closeBtn()}</div>
    ${m.scope === 'floor' ? `<div class="chips" style="margin-bottom:10px">${St.data.floors.map(f => `<button class="chip ${f.id === m.floorId ? 'on' : ''}" data-act="preview" data-scope="floor" data-id="${f.id}">${esc(f.name)}</button>`).join('')}</div>` : ''}
    <div class="row wrap" style="gap:6px;margin-bottom:6px"><span class="pill p-info">${m.devices.length} devices</span><span class="pill p-prot">${prot} protected</span><span class="pill p-warn">${excl} excluded</span></div>
    ${Object.entries(groups).map(([rid, devs]) => `<div class="eyebrow" style="margin:14px 0 2px">Room ${esc(rid)} · ${esc(devs[0].roomName)}</div>
      ${devs.map(x => `<label class="check ${x.selectable ? '' : 'disabled'}"><input type="checkbox" data-sel="${x.id}" ${m.sel.has(x.id) ? 'checked' : ''} ${x.selectable ? '' : 'disabled'}>
        <div style="flex:1;min-width:0"><b style="font:600 14px/18px var(--display)">${esc(x.name)}</b> <span class="muted small">${esc(x.type)}</span>
        <div class="row wrap" style="gap:5px;margin-top:4px">${statePill(x.state)}${physPill(x.real)}${x.protected ? '<span class="pill p-prot">Protected</span>' : ''}</div>
        ${x.reason ? `<div class="small" style="color:#B45309;margin-top:4px">${esc(x.reason)}</div>` : ''}</div></label>`).join('')}`).join('')}
    <div class="notice ${m.scope === 'floor' ? 'amber' : ''}" style="margin-top:14px">${ic(m.scope === 'floor' ? 'hourglass' : 'info', 'sm')}<div>${m.scope === 'floor' ? `Floor-wide: a <b>${Math.round(m.windowSec / 60 * 10) / 10}-minute cancel window</b> starts after you confirm. Nothing is sent to any controller until it ends; a cancelled request is never sent.` : 'Room shutdown is sent immediately after you confirm.'}</div></div>
    <button class="btn danger block lg" style="margin-top:12px" data-act="sdconfirm" ${n ? '' : 'disabled'}>${ic('power')} Request shutdown of ${n} device${n === 1 ? '' : 's'}</button>`);
}
function mSdStatus(m) {
  const sd = St.data.shutdowns.find(s => s.id === m.id) || m.sd;
  if (!sd) return sheet(`<div class="sheet-h"><h3 style="flex:1">Shutdown</h3>${closeBtn()}</div><div class="empty">Loading…</div>`);
  const where = sd.scope === 'floor' ? floorName(sd.floorId) : `Room ${sd.roomId}`;
  let body;
  if (sd.status === 'scheduled') {
    body = `<div class="eyebrow" style="text-align:center;margin-top:8px">Sending to controller in</div>
      <div class="countdown-big">${cd(sd.sendAt)}</div>
      <p class="muted" style="text-align:center">${sd.deviceIds.length} device(s) selected. Cancel now and nothing is sent.</p>
      <button class="btn block lg" style="border-color:var(--red);color:var(--red)" data-act="sdcancel" data-id="${sd.id}">${ic('x')} Cancel shutdown</button>`;
  } else if (sd.status === 'cancelled') {
    body = `<div class="notice green">${ic('check', 'sm')}<div>Cancelled by ${esc(sd.cancelledBy)} at ${hm(sd.cancelledAt)} — <b>never sent to the controller</b>.</div></div>`;
  } else if (sd.status === 'sending') {
    body = `<div class="empty"><b>Sending…</b>Waiting for controller response</div>`;
  } else {
    body = `<table class="res"><thead><tr><th>Device</th><th>Requested</th><th>Controller response</th></tr></thead><tbody>
      ${sd.results.map(r => `<tr><td><b>${esc(r.name)}</b><div class="muted small">Room ${esc(r.roomId)}</div>${physPill(r.real)}</td><td><span class="pill p-info">${r.requested}</span></td><td>${esc(r.response)}</td></tr>`).join('')}
      </tbody></table>
      <div class="verify-note" style="margin-top:12px">${ic('info', 'sm')} Physical state not independently verified</div>`;
  }
  return sheet(`<div class="sheet-h"><div style="flex:1"><div class="eyebrow">${esc(sd.id)} · ${sd.auto ? 'Automatic (T+' + St.data.policy.shutdownMin + ')' : 'Requested by ' + esc(sd.requestedBy)}</div><h3>${esc(where)} shutdown</h3>
    <div class="row" style="margin-top:6px">${sdPill(sd.status)}<span class="muted small">created ${hm(sd.createdAt)}</span></div></div>${closeBtn()}</div>${body}`);
}
const sdPill = s => `<span class="pill ${{ scheduled: 'p-warn', sending: 'p-info', completed: 'p-ok', cancelled: 'p-unknown' }[s]}">${s === 'scheduled' ? 'Cancel window' : s}</span>`;
function mFloorPick() {
  return sheet(`<div class="sheet-h"><div style="flex:1"><div class="eyebrow">Floor shutdown</div><h3>Which floor?</h3></div>${closeBtn()}</div>
    ${St.data.floors.map(f => { const rs = St.data.rooms.filter(r => r.floorId === f.id); const on = rs.filter(r => r.onCount).length; return `<button class="menu-row" data-act="preview" data-scope="floor" data-id="${f.id}"><span class="ic">${ic('grid')}</span><div style="flex:1"><b>${esc(f.name)} · ${esc(f.label)}</b><span class="muted small">${on} of ${rs.length} rooms with devices ON</span></div>${ic('chev')}</button>`; }).join('')}`);
}

/* ---------- SWEEP ---------- */
const SWEEP_LBL = { turned_off: 'Turned off', occupied: 'Still occupied', no_access: 'Cannot access' };
function vSweep() {
  const d = St.data, ph = d.phase, sw = d.sweep;
  if (!sw) {
    return `<div class="card pad-lg" style="text-align:center">
      <div class="hero-ic">${ic('sweep')}</div>
      <h2 style="font:700 22px/28px var(--display)">Sweep list not generated yet</h2>
      <p class="muted">It is generated automatically ${d.policy.sweepLeadMin} minutes before closing — at <b>${hm(ph.sweepStart)}</b> (in ${cd(ph.sweepStart)}) — and lists every room still ON or UNKNOWN.</p>
      ${isAdmin() ? `<button class="btn primary" data-act="demo" data-m="sweep">${ic('zap', 'sm')} Start pre-closing sweep now (demo)</button>` : ''}
    </div>`;
  }
  const items = sw.items, done = items.filter(i => i.result);
  const pct = items.length ? Math.round(done.length / items.length * 100) : 100;
  const by = k => items.filter(i => i.result === k).length;
  const floors = d.floors.filter(f => items.some(i => i.floorId === f.id));
  const item = i => {
    const r = room(i.roomId);
    const stillPhysOn = i.result === 'turned_off' && i.devices.some(x => x.real && x.state === 'ON');
    return `<div class="sweep-item ${i.result ? 'done' : ''}">
      <div class="row between"><div><span style="font:700 18px/22px var(--display)">${esc(i.roomId)}</span> <span class="muted">${esc(i.roomName)}</span></div>
        ${i.result ? `<span class="pill ${i.result === 'turned_off' ? 'p-ok' : i.result === 'occupied' ? 'p-info' : 'p-warn'}">${SWEEP_LBL[i.result]}</span>` : `<span class="pill ${r.color === 'red' ? 'p-crit' : 'p-warn'}">To check</span>`}</div>
      <div class="row wrap" style="gap:5px;margin-top:8px">${i.devices.map(x => `<span class="pill ${STATE_CLS[x.state]}">${esc(x.name)}: ${x.state}</span>`).join('')}${r.simulated ? '<span class="pill p-sim">Simulated</span>' : '<span class="pill p-phys">Physical</span>'}</div>
      ${i.result ? `<div class="muted small" style="margin-top:6px">${esc(i.by)} · ${hm(i.at)}</div>` : ''}
      ${stillPhysOn ? `<div class="notice red" style="margin-top:8px">${ic('alert', 'sm')}<div>Guard reported OFF, but the controller still reports the socket <b>ON</b> — room stays in the alert sequence.</div></div>` : ''}
      <div class="sw-actions">
        <button class="btn ${i.result === 'turned_off' ? 'navy' : ''}" data-act="sweep" data-id="${i.roomId}" data-res="turned_off">${ic('power', 'sm')}Turned off</button>
        <button class="btn ${i.result === 'occupied' ? 'navy' : ''}" data-act="sweep" data-id="${i.roomId}" data-res="occupied">${ic('users', 'sm')}Still occupied</button>
        <button class="btn ${i.result === 'no_access' ? 'navy' : ''}" data-act="sweep" data-id="${i.roomId}" data-res="no_access">${ic('lock', 'sm')}Cannot access</button>
      </div></div>`;
  };
  return `<div class="card pad-lg">
    <div class="row between"><div><div class="eyebrow">Closing ${hm(sw.closing)} · generated ${hm(sw.createdAt)}</div><h2 style="font:700 22px/28px var(--display);margin-top:4px">Pre-closing sweep</h2></div>
    <div style="text-align:right"><div class="big-num c-indigo">${pct}%</div><div class="muted small">complete</div></div></div>
    <div class="progress" style="margin:12px 0"><i style="width:${pct}%"></i></div>
    <div class="eyebrow" style="margin-bottom:6px">Shift handover</div>
    <div class="row wrap" style="gap:6px"><span class="pill p-ok">${by('turned_off')} turned off</span><span class="pill p-info">${by('occupied')} occupied</span><span class="pill p-warn">${by('no_access')} no access</span><span class="pill p-unknown">${items.length - done.length} pending</span></div>
    ${ph.phase === 'sweep' ? `<div class="notice" style="margin-top:12px">${ic('clock', 'sm')}<div>Closing in ${cd(ph.closing)} — unchecked rooms enter the T+0 alert sequence.</div></div>` : ''}
  </div>
  ${items.length ? floors.map(f => `<div class="section-h"><h2>${esc(f.name)}</h2><span class="eyebrow">${items.filter(i => i.floorId === f.id && !i.result).length} left</span></div>
    ${items.filter(i => i.floorId === f.id).sort((a, b) => a.roomId.localeCompare(b.roomId, undefined, { numeric: true })).map(item).join('')}`).join('')
    : '<div class="card empty" style="margin-top:12px"><b>Nothing to sweep</b>No rooms were ON or UNKNOWN when the list was generated.</div>'}`;
}

/* ---------- LOG ---------- */
async function runLog(q) {
  St.logQ = q;
  try { St.log = await api('GET', '/api/log?q=' + encodeURIComponent(q)); } catch (e) { toast(e.message, true); }
  if (St.route === 'log') renderPage();
}
function vLog() {
  if (!St.log) { runLog(St.logQ); }
  const L = St.log;
  const chips = ['104', 'shutdown', 'escalation', 'exception', dk(nowS()), 'Security Officer', '203'];
  return `<form class="searchbar" data-form="log"><input class="input" name="q" value="${esc(St.logQ)}" placeholder="Search: room, device, user, date, action…" autocomplete="off"><button class="btn primary">${ic('search', 'sm')}</button></form>
  <div class="chips" style="margin:10px 0">${chips.map(c => `<button class="chip" data-act="logq" data-q="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="notice ${L && L.limited ? 'amber' : ''}">${ic('info', 'sm')}<div>${L && L.limited ? 'Security view — limited records (operational events and your own actions).' : 'Admin view — full audit log.'} Results are exact log entries; every word must match. No match means no answer — nothing is guessed.</div></div>
  ${!L ? '<div class="empty">Searching…</div>' : `
  <div class="row between" style="margin:16px 2px 8px"><div><b style="font:600 16px var(--display)">${L.query ? `${L.total} matching entr${L.total === 1 ? 'y' : 'ies'}` : 'Latest entries'}</b><div class="muted small">searched ${L.searched} visible records${L.total > L.entries.length ? ` · showing newest ${L.entries.length}` : ''}</div></div>
  <button class="btn sm" data-act="csv" ${L.entries.length ? '' : 'disabled'}>${ic('download', 'sm')} CSV</button></div>
  <div class="card flush">${L.entries.length ? L.entries.map(e => `<div class="log-entry"><div class="meta"><span class="id">${esc(e.id)}</span><span>${dt(e.ts)}</span><span class="act">${esc(e.action)}</span>${e.roomId ? `<span>Room ${esc(e.roomId)}${e.roomName ? ' · ' + esc(e.roomName) : ''}</span>` : ''}<span>${esc(e.actor)}</span></div><p>${esc(e.detail)}</p></div>`).join('')
    : `<div class="empty"><b>No records found.</b>Nothing in the audit log matches “${esc(L.query)}”.</div>`}</div>`}`;
}
function exportCsv() {
  const L = St.log; if (!L) return;
  const cols = ['id', 'ts', 'actor', 'role', 'action', 'roomId', 'roomName', 'deviceName', 'floorId', 'detail'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...L.entries.map(e => cols.map(c => q(c === 'ts' ? dt(e.ts) : e[c])).join(','))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `campuspulse-log-${(L.query || 'latest').replace(/[^\w-]+/g, '_')}.csv`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- MORE ---------- */
function vMore() {
  const d = St.data;
  const row = (r, i, t, s) => `<button class="menu-row" data-act="go" data-r="${r}"><span class="ic">${ic(i)}</span><div style="flex:1"><b>${t}</b><span class="muted small">${s}</span></div>${ic('chev')}</button>`;
  return `<div class="card row" style="gap:14px"><div class="avatar" style="width:52px;height:52px;font-size:16px">${isAdmin() ? 'AD' : 'SO'}</div><div style="flex:1"><b style="font:700 18px var(--display)">${esc(St.user.name)}</b><div class="muted small">${isAdmin() ? 'Admin — full access, approves exceptions' : 'Security — sweep, alerts, shutdown requests'}</div></div></div>
  <div class="card flush" style="margin-top:12px">
    ${row('exceptions', 'clock', 'Timed exceptions', `${d.exceptions.filter(e => e.status === 'pending').length} pending · ${d.exceptions.filter(e => e.status === 'approved').length} active`)}
    ${row('timetable', 'calendar', 'Timetable', `${d.timetable.length} bookings · ${d.timetable.filter(t => t.active).length} live now`)}
    ${row('shutdowns', 'power', 'Shutdowns', `${d.shutdowns.filter(s => s.status === 'scheduled').length} in cancel window`)}
    ${row('issues', 'tool', 'Repeat issues & tickets', `${d.tickets.filter(t => t.status === 'open').length} open tickets`)}
    ${row('streaks', 'award', 'Floor streaks', 'Clean-week leaderboard')}
    ${isAdmin() ? row('settings', 'sliders', 'Settings & demo controls', 'Closing time, thresholds, ESP32') : ''}
  </div>
  <button class="btn block" style="margin-top:16px" data-act="logout">${ic('logout', 'sm')} Sign out</button>`;
}

/* ---------- EXCEPTIONS ---------- */
function vExceptions() {
  const d = St.data;
  const pend = d.exceptions.filter(e => e.status === 'pending');
  const act = d.exceptions.filter(e => e.status === 'approved');
  const hist = d.exceptions.filter(e => !['pending', 'approved'].includes(e.status)).slice().reverse();
  const card = e => {
    const r = room(e.roomId); const left = new Date(e.endsAt) - nowS();
    return `<div class="card"><div class="row between"><div><span class="pill ${{ pending: 'p-warn', approved: 'p-ok', rejected: 'p-crit', expired: 'p-unknown' }[e.status]}">${e.status}</span> <span class="muted small">${esc(e.id)}</span></div>
      ${e.status === 'approved' ? `<span class="pill ${left < d.policy.exceptionReminderMin * 60000 ? 'p-warn' : 'p-info'}">${ic('clock', 'sm')} ${cd(e.endsAt)} left</span>` : ''}</div>
      <b style="font:600 16px/22px var(--display);display:block;margin-top:8px">Room ${esc(r.id)} · ${esc(r.name)}</b>
      <div style="margin-top:4px">${esc(e.reason)}</div>
      <div class="muted small" style="margin-top:6px">Until ${hm(e.endsAt)} · requested by ${esc(e.requestedBy)} ${ago(e.requestedAt)}${e.decidedBy ? ` · ${e.status === 'rejected' ? 'rejected' : 'approved'} by ${esc(e.decidedBy)}` : ''}</div>
      ${e.status === 'approved' && left < d.policy.exceptionReminderMin * 60000 ? `<div class="notice amber" style="margin-top:8px">${ic('bell', 'sm')}<div>Expires soon — after ${hm(e.endsAt)} it is ignored by shutdown logic.</div></div>` : ''}
      ${e.status === 'pending' ? (isAdmin() ? `<div class="grid g2" style="margin-top:12px"><button class="btn" data-act="decide" data-id="${e.id}" data-d="reject">${ic('x', 'sm')} Reject</button><button class="btn primary" data-act="decide" data-id="${e.id}" data-d="approve">${ic('check', 'sm')} Approve</button></div>` : '<div class="muted small" style="margin-top:8px">Awaiting admin approval</div>') : ''}
    </div>`;
  };
  return `<button class="btn primary block lg" data-act="excnew">${ic('plus')} Request timed exception</button>
  <div class="notice" style="margin-top:12px">${ic('info', 'sm')}<div>Every exception needs a reason and an end time (max ${d.policy.maxExceptionHours}h) and auto-expires. An expired exception is no longer honored by shutdown logic, even if nobody removes it. Reminder ${d.policy.exceptionReminderMin} min before expiry.</div></div>
  <div class="section-h"><h2>Pending approval</h2><span class="eyebrow">${pend.length}</span></div>${pend.length ? pend.map(card).join('') : '<div class="card empty">No pending requests</div>'}
  <div class="section-h"><h2>Active</h2><span class="eyebrow">${act.length}</span></div>${act.length ? act.map(card).join('') : '<div class="card empty">No active exceptions</div>'}
  ${hist.length ? `<div class="section-h"><h2>Recent history</h2></div>${hist.slice(0, 8).map(card).join('')}` : ''}`;
}
function mExcForm(m) {
  const rooms = St.data.rooms;
  const def = new Date(nowS().getTime() + 60 * 60000);
  return sheet(`<form data-form="exc"><div class="sheet-h"><div style="flex:1"><div class="eyebrow">Timed exception</div><h3>Request exception</h3></div>${closeBtn()}</div>
    <label class="f">Room</label><select class="input" name="roomId" required>${rooms.map(r => `<option value="${r.id}" ${r.id === m.roomId ? 'selected' : ''}>${r.id} · ${esc(r.name)}${r.simulated ? '' : ' (physical)'}</option>`).join('')}</select>
    <label class="f">Reason (required)</label><textarea class="input" name="reason" required minlength="4" maxlength="300" placeholder="e.g. Robotics team testing for tomorrow's competition — supervised by Prof. Rao">${esc(m.reason || '')}</textarea>
    <label class="f">Ends at (required — no open-ended exceptions)</label>
    <div class="row"><input class="input" type="time" name="end" value="${pad(def.getHours())}:${pad(def.getMinutes())}" required style="flex:1">
      <button type="button" class="btn sm" data-act="qend" data-min="30">+30m</button><button type="button" class="btn sm" data-act="qend" data-min="60">+1h</button><button type="button" class="btn sm" data-act="qend" data-min="120">+2h</button></div>
    <div class="muted small" style="margin-top:6px">A time earlier than now means tomorrow. Admin approval required.</div>
    <button class="btn primary block lg" style="margin-top:18px">Submit request</button></form>`);
}

/* ---------- TIMETABLE ---------- */
function vTimetable() {
  const d = St.data, now = nowS(), today = dk(now), dow = now.getDay();
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todays = d.timetable.filter(t => t.kind === 'oneoff' ? t.date === today : t.days.includes(dow)).sort((a, b) => a.start.localeCompare(b.start));
  const others = d.timetable.filter(t => !todays.includes(t));
  const row = t => { const r = room(t.roomId); return `<div class="list-row"><div class="feed-ic ${t.active ? 'bg-green' : ''}">${ic('calendar', 'sm')}</div>
    <div class="grow"><b>${esc(t.title)}</b><div class="muted small">Room ${esc(r.id)} · ${esc(r.name)} · ${t.start}–${t.end}</div>
    <div class="row wrap" style="gap:5px;margin-top:4px">${t.active ? '<span class="pill p-ok"><i class="d"></i>In session — alerts paused</span>' : ''}${t.kind === 'oneoff' ? `<span class="pill p-warn">One-off · ${t.date} · auto-expires</span>` : `<span class="pill p-info">Weekly · ${t.days.map(x => DAYS[x]).join(' ')}</span>`}</div></div>
    ${isAdmin() ? `<button class="iconbtn" data-act="ttdel" data-id="${t.id}" aria-label="Remove">${ic('trash', 'sm')}</button>` : ''}</div>`; };
  return `${isAdmin() ? `<button class="btn primary block lg" data-act="ttnew">${ic('plus')} Add one-off booking</button>` : ''}
  <div class="notice" style="margin-top:12px">${ic('info', 'sm')}<div>During a class or event the room is excluded from closing-time alerts. The moment the window ends, if a device is still ON, the normal T+0 → T+${d.policy.escalateMin} → T+${d.policy.shutdownMin} sequence starts. Changes are logged.</div></div>
  <div class="section-h"><h2>Today</h2><span class="eyebrow">${DAYS[dow]} ${today}</span></div>
  <div class="card">${todays.length ? todays.map(row).join('') : '<div class="empty">No bookings today</div>'}</div>
  ${others.length ? `<div class="section-h"><h2>Other days</h2></div><div class="card">${others.map(row).join('')}</div>` : ''}`;
}
function mTtForm() {
  const n = nowS(); const s = new Date(n.getTime() + 5 * 60000), e = new Date(n.getTime() + 65 * 60000);
  return sheet(`<form data-form="tt"><div class="sheet-h"><div style="flex:1"><div class="eyebrow">Timetable</div><h3>One-off booking</h3></div>${closeBtn()}</div>
    <label class="f">Room</label><select class="input" name="roomId">${St.data.rooms.map(r => `<option value="${r.id}">${r.id} · ${esc(r.name)}</option>`).join('')}</select>
    <label class="f">Class / event</label><input class="input" name="title" required maxlength="80" placeholder="e.g. Project review — Final year">
    <label class="f">Date</label><input class="input" type="date" name="date" value="${dk(n)}" required>
    <div class="grid g2"><div><label class="f">Start</label><input class="input" type="time" name="start" value="${pad(s.getHours())}:${pad(s.getMinutes())}" required></div>
    <div><label class="f">End</label><input class="input" type="time" name="end" value="${pad(e.getHours())}:${pad(e.getMinutes())}" required></div></div>
    <button class="btn primary block lg" style="margin-top:18px">Add booking</button></form>`);
}

/* ---------- SHUTDOWNS ---------- */
function vShutdowns() {
  const list = St.data.shutdowns;
  return `<button class="btn primary block lg" data-act="floorpick">${ic('power')} New floor shutdown</button>
  <div class="section-h"><h2>Recent requests</h2></div>
  ${list.length ? list.map(sd => `<button class="card" style="display:block;width:100%;text-align:left" data-act="sdopen" data-id="${sd.id}">
    <div class="row between"><div class="row">${sdPill(sd.status)}<span class="muted small">${esc(sd.id)}</span></div><span class="muted small">${hm(sd.createdAt)}</span></div>
    <b style="font:600 16px/22px var(--display);display:block;margin-top:6px">${sd.scope === 'floor' ? esc(floorName(sd.floorId)) + ' — floor-wide' : 'Room ' + esc(sd.roomId)} · ${sd.deviceIds.length} device(s)</b>
    <div class="muted small">${sd.auto ? `Automatic T+${St.data.policy.shutdownMin} request` : 'By ' + esc(sd.requestedBy)}${sd.status === 'scheduled' ? ` · sends in ${cd(sd.sendAt)}` : ''}${sd.status === 'completed' ? ` · ${sd.results.filter(r => r.acknowledged).length}/${sd.results.length} acknowledged · physical state not independently verified` : ''}</div>
  </button>`).join('') : '<div class="card empty"><b>No shutdown requests yet</b>Requests from the preview screen and T+25 automatic requests appear here.</div>'}`;
}

/* ---------- ISSUES ---------- */
function vIssues() {
  const d = St.data, p = d.policy;
  const flagged = d.rooms.filter(r => r.repeatFlag);
  const unstable = d.rooms.flatMap(r => r.devices.filter(x => x.unstable).map(x => ({ ...x, room: r })));
  return `<div class="notice">${ic('info', 'sm')}<div>Flag when a room triggers <b>${p.repeatAlertThreshold}+</b> after-hours alerts in <b>${p.repeatWindowDays} days</b> (one ticket per room, not one per alert). A controller offline <b>${p.offlineThreshold}+</b> times in <b>${p.offlineWindowHours}h</b> is marked unstable. ${isAdmin() ? 'Change thresholds in Settings.' : ''}</div></div>
  <div class="section-h"><h2>Flagged rooms</h2><span class="eyebrow">${flagged.length}</span></div>
  <div class="card">${flagged.length ? flagged.map(r => `<button class="list-row" style="width:100%;text-align:left" data-act="room" data-id="${r.id}"><div class="feed-ic bg-amber">${ic('flag', 'sm')}</div><div class="grow"><b>Room ${r.id} · ${esc(r.name)}</b><div class="muted small">${r.repeatCount} after-hours alerts in ${p.repeatWindowDays} days</div></div>${ic('chev')}</button>`).join('') : '<div class="empty">No repeat offenders</div>'}</div>
  <div class="section-h"><h2>Unstable controllers</h2><span class="eyebrow">${unstable.length}</span></div>
  <div class="card">${unstable.length ? unstable.map(x => `<div class="list-row"><div class="feed-ic bg-red">${ic('wifioff', 'sm')}</div><div class="grow"><b>${esc(x.name)}</b><div class="muted small">Room ${x.room.id} · ${esc(x.room.name)}</div></div>${physPill(x.real)}</div>`).join('') : '<div class="empty">All controllers stable</div>'}</div>
  <div class="section-h"><h2>Maintenance tickets</h2><span class="eyebrow">${d.tickets.filter(t => t.status === 'open').length} open</span></div>
  <div class="card">${d.tickets.length ? d.tickets.map(t => `<div class="list-row"><div class="feed-ic">${ic('tool', 'sm')}</div><div class="grow"><b>${esc(t.title)}</b><div class="muted small">${esc(t.id)} · ${esc(t.detail)} · ${ago(t.createdAt)}</div></div>
    ${t.status === 'open' ? (isAdmin() ? `<button class="btn sm" data-act="tclose" data-id="${t.id}">Close</button>` : '<span class="pill p-warn">Open</span>') : '<span class="pill p-unknown">Closed</span>'}</div>`).join('') : '<div class="empty">No tickets</div>'}</div>`;
}

/* ---------- STREAKS ---------- */
function vStreaks() {
  const s = St.data.streaks;
  return `<div class="card dark pad-lg"><div class="eyebrow" style="color:#B4C5FF">Leader</div><h2 style="font:700 24px/30px var(--display);margin-top:4px">${esc(s[0].name)} · ${s[0].current} clean week${s[0].current === 1 ? '' : 's'}</h2>
    <div class="muted" style="margin-top:4px">A clean week = zero <b>unresolved</b> after-hours alerts. Alerts resolved by sweep or exception don't break the streak.</div></div>
  <div class="card" style="margin-top:12px">${s.map((f, i) => `<div class="streak-row"><div class="rank ${i === 0 ? 'r1' : ''}">${i + 1}</div>
    <div style="flex:1;min-width:0"><b style="font:600 16px var(--display)">${esc(f.name)}</b> <span class="muted small">${esc(f.label)}</span>
    <div class="weeks" title="Last 12 weeks, oldest first">${f.weeks.map(w => `<i class="${w.weeksAgo === 0 ? 'cur ' + (w.clean ? 'pending' : 'b') : w.clean ? '' : 'b'}" title="${w.weeksAgo ? w.weeksAgo + ' wk ago' : 'this week'}: ${w.clean ? 'clean' : w.unresolved + ' unresolved'}"></i>`).join('')}</div>
    <div class="muted small" style="margin-top:4px">This week: ${f.thisWeekClean ? 'clean so far' : `${f.thisWeekUnresolved} unresolved alert(s)`} · best ${f.best} weeks</div></div>
    <div style="text-align:right"><div class="big-num c-indigo">${f.current}</div><div class="muted small">clean weeks</div></div></div>`).join('')}</div>
  <div class="muted small" style="margin:10px 2px">Counts only — no energy or money figures.</div>`;
}

/* ---------- SETTINGS ---------- */
function vSettings() {
  if (!isAdmin()) return '<div class="card empty"><b>Admin only</b></div>';
  const s = St.data.settings, c = St.data.controller, ph = St.data.phase;
  const num = (k, l, unit) => `<div><label class="f">${l}</label><div class="row"><input class="input" type="number" name="${k}" value="${s[k]}"><span class="muted small" style="min-width:28px">${unit}</span></div></div>`;
  return `<div class="card pad-lg"><h3 style="font:600 18px var(--display)">Demo controls</h3>
    <div class="muted small" style="margin-top:4px">Closing today: <b>${hm(ph.closing)}</b>${ph.override ? ' (override)' : ''} · phase: <b>${ph.phase.replace('_', ' ')}</b></div>
    <div class="grid g2" style="margin-top:12px">
      <button class="btn ghost" data-act="demo" data-m="sweep">${ic('sweep', 'sm')} Start sweep now</button>
      <button class="btn ghost" data-act="demo" data-m="closing">${ic('moon', 'sm')} Jump to closing</button>
      <button class="btn" data-act="demo" data-m="clear">${ic('refresh', 'sm')} Clear override</button>
      <button class="btn" style="color:var(--red)" data-act="reset">${ic('trash', 'sm')} Reset demo data</button>
    </div></div>
  <form data-form="settings">
  <div class="card pad-lg" style="margin-top:12px"><h3 style="font:600 18px var(--display)">Hardware controller (ESP32)</h3>
    <label class="f">ESP32 address</label><input class="input" name="esp32Url" value="${esc(s.esp32Url)}" placeholder="http://192.168.1.50">
    <div class="row wrap" style="margin-top:8px"><span class="pill ${!c.configured ? 'p-unknown' : c.online ? 'p-ok' : 'p-crit'}"><i class="d"></i>${!c.configured ? 'Not configured' : c.online ? 'Online' : 'Offline'}</span>${c.mock ? '<span class="pill p-warn">Mock</span>' : ''}<span class="muted small">${c.online ? `relay ${esc(c.relay)}${c.device ? ' · ' + esc(c.device) : ''}` : esc(c.error || '')}</span><span class="spacer"></span><button type="button" class="btn sm" data-act="ctltest">${ic('refresh', 'sm')} Test</button></div>
  </div>
  <div class="card pad-lg" style="margin-top:12px"><h3 style="font:600 18px var(--display)">Closing policy</h3>
    <div class="grid g2">
      <div><label class="f">Closing time</label><input class="input" type="time" name="closingTime" value="${s.closingTime}"></div>
      <div><label class="f">Clock speed</label><select class="input" name="timeScale">${[[60, 'Real time'], [10, '1 min = 10 s'], [4, '1 min = 4 s (demo)'], [2, '1 min = 2 s']].map(([v, l]) => `<option value="${v}" ${s.timeScale === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      ${num('sweepLeadMin', 'Sweep list before closing', 'min')}${num('escalateMin', 'Escalate at T+', 'min')}
      ${num('shutdownMin', 'Shutdown request at T+', 'min')}${num('cancelWindowSec', 'Cancel window', 'sec')}
      ${num('exceptionReminderMin', 'Exception reminder', 'min')}${num('maxExceptionHours', 'Max exception length', 'h')}
    </div></div>
  <div class="card pad-lg" style="margin-top:12px"><h3 style="font:600 18px var(--display)">Repeat-issue thresholds</h3>
    <div class="grid g2">${num('repeatAlertThreshold', 'Alerts to flag a room', '#')}${num('repeatWindowDays', 'Within', 'days')}${num('offlineThreshold', 'Offline events = unstable', '#')}${num('offlineWindowHours', 'Within', 'h')}</div></div>
  <button class="btn primary block lg" style="margin-top:14px">Save settings</button></form>`;
}

/* ---------- notifications ---------- */
function mNotifs() {
  const n = St.data.notifications;
  if (n[0]) { St.seenNotif = n[0].id; store.set('cp_seen', St.seenNotif); setTimeout(renderChrome, 0); }
  return sheet(`<div class="sheet-h"><div style="flex:1"><div class="eyebrow">Last 12 hours</div><h3>Notifications</h3></div>${closeBtn()}</div>
    <div class="card flush">${n.length ? n.map(feedItem).join('') : '<div class="empty">Nothing yet</div>'}</div>`);
}

const VIEWS = { home: vHome, twin: vTwin, sweep: vSweep, log: vLog, more: vMore, exceptions: vExceptions, timetable: vTimetable, shutdowns: vShutdowns, issues: vIssues, streaks: vStreaks, settings: vSettings };
const MODALS = { room: [mRoom, true], preview: [mPreview, false], sdstatus: [mSdStatus, true], floorpick: [mFloorPick, true], exc: [mExcForm, false], tt: [mTtForm, false], notifs: [mNotifs, true] };
function openModal(m) { m.live = MODALS[m.type][1]; St.modal = m; renderModal(); }
// The popup is built ONCE when it opens. Later refreshes (2 s status poll) only patch the sheet's
// contents — the overlay and sheet elements stay in place, so the open/fade animations never replay
// (that replay was the flicker). Unchanged content is skipped entirely, and no patch is applied while
// a finger/mouse is pressed inside the popup, so a button can't be swapped out mid-click.
let modalKey = null, modalHtml = '', modalPointerDown = false, modalPending = false;
document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('#modal')) modalPointerDown = true; }, true);
const releaseModalPointer = () => {
  if (!modalPointerDown) return;
  modalPointerDown = false;
  if (modalPending) { modalPending = false; setTimeout(renderModal, 0); }   // apply the deferred refresh after the click has fired
};
document.addEventListener('pointerup', releaseModalPointer, true);
document.addEventListener('pointercancel', releaseModalPointer, true);

function renderModal() {
  const el = $('#modal');
  if (!St.modal || !St.data) {
    el.innerHTML = ''; modalKey = null; modalHtml = ''; modalPending = false;
    document.body.style.overflow = '';
    return;
  }
  const m = St.modal;
  const key = `${m.type}:${m.id || m.roomId || m.floorId || ''}`;
  const html = MODALS[m.type][0](m);
  const sheet = el.querySelector('.sheet');
  if (key === modalKey && sheet) {
    if (html === modalHtml) return;                         // nothing changed -> leave the DOM alone
    if (modalPointerDown) { modalPending = true; return; }  // user is mid-press -> refresh after release
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const fresh = tmp.querySelector('.sheet');
    if (fresh) {
      const sc = sheet.scrollTop;
      sheet.innerHTML = fresh.innerHTML;                    // patch contents only, no animation replay
      sheet.scrollTop = sc;
      modalHtml = html;
      return;
    }
  }
  // first render of this popup (or a different popup): build it once
  el.innerHTML = html;
  modalKey = key; modalHtml = html;
  document.body.style.overflow = 'hidden';
}
function closeModal() { St.modal = null; renderModal(); }

/* ---------- events ---------- */
function go(r) { St.route = ROUTES[r] ? r : 'home'; if (location.hash !== '#' + St.route) history.pushState(null, '', '#' + St.route); if (r === 'log') St.log = null; window.scrollTo(0, 0); renderPage(); }
window.addEventListener('popstate', () => { St.route = (location.hash || '#home').slice(1); if (St.data) renderPage(); });

const ACTIONS = {
  go: ds => { closeModal(); go(ds.r); },
  floor: ds => { St.floor = ds.f; renderPage(); },
  room: ds => openModal({ type: 'room', id: ds.id }),
  close: () => closeModal(),
  bg: (ds, el, ev) => { if (ev.target === el) closeModal(); },
  notifs: () => openModal({ type: 'notifs' }),
  floorpick: () => openModal({ type: 'floorpick' }),
  preview: ds => openPreview(ds.scope, ds.id),
  sdconfirm: async () => {
    const m = St.modal;
    const sd = await act(() => api('POST', '/api/shutdowns', { scope: m.scope, roomId: m.roomId, floorId: m.floorId, deviceIds: [...m.sel] }), 'Shutdown request created');
    if (sd) openModal({ type: 'sdstatus', id: sd.id, sd });
  },
  sdcancel: ds => act(() => api('POST', `/api/shutdowns/${ds.id}/cancel`), 'Cancelled — nothing was sent'),
  sdopen: ds => openModal({ type: 'sdstatus', id: ds.id }),
  sweep: async ds => {
    const ok = await act(() => api('POST', '/api/sweep', { roomId: ds.id, result: ds.res }), `Room ${ds.id}: ${SWEEP_LBL[ds.res]} — logged`);
    if (ok && ds.res === 'occupied') openModal({ type: 'exc', roomId: ds.id, reason: 'Room still occupied during closing sweep — ' });
  },
  excnew: ds => openModal({ type: 'exc', roomId: ds.id || (St.data.rooms[0] || {}).id }),
  qend: (ds) => { const t = new Date(nowS().getTime() + Number(ds.min) * 60000); const inp = $('#modal [name=end]'); if (inp) inp.value = `${pad(t.getHours())}:${pad(t.getMinutes())}`; },
  decide: ds => act(() => api('POST', `/api/exceptions/${ds.id}/decide`, { decision: ds.d }), ds.d === 'approve' ? 'Exception approved' : 'Exception rejected'),
  ttnew: () => openModal({ type: 'tt' }),
  ttdel: ds => { if (confirmInline(ds)) act(() => api('DELETE', `/api/timetable/${ds.id}`), 'Booking removed'); },
  sim: ds => act(() => api('POST', `/api/devices/${ds.id}/simulate`, { state: ds.s }), `Simulated record → ${ds.s}`),
  realon: async ds => { const r = await act(() => api('POST', `/api/devices/${ds.id}/on`)); if (r) toast(r.ok ? (r.acknowledged ? `Controller acknowledged: ${r.ack}` : r.ack ? `Nano replied "${r.ack}" — not accepted` : 'Sent — no reply from Nano') : `Not delivered: ${r.error}`, !r.ok || !r.acknowledged); },
  demo: ds => act(() => api('POST', '/api/demo/closing', { mode: ds.m }), { sweep: 'Sweep window started', closing: 'Closing time = now', clear: 'Override cleared' }[ds.m]),
  reset: (ds, el) => { if (el.dataset.armed) act(() => api('POST', '/api/demo/reset'), 'Demo data reset'); else { el.dataset.armed = '1'; el.textContent = 'Tap again to reset'; setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = 'Reset demo data'; } }, 3000); } },
  ctltest: async () => { const r = await act(() => api('POST', '/api/controller/test')); if (r) toast(r.online ? `Controller online · relay ${r.relay}` : `Controller unreachable: ${r.error}`, !r.online); if (St.route === 'settings') renderPage(); },
  tclose: ds => act(() => api('POST', `/api/tickets/${ds.id}/close`), 'Ticket closed'),
  logq: ds => runLog(ds.q),
  csv: () => exportCsv(),
  logout: () => doLogout(),
  loginrole: ds => { St.loginRole = ds.r; document.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.r === ds.r)); $('#pin').focus(); }
};
function confirmInline(ds) { return true; }

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  if (el.dataset.act === 'bg' && ev.target !== el) return;
  ev.preventDefault();
  fn(el.dataset, el, ev);
});
document.addEventListener('change', ev => {
  const id = ev.target.dataset && ev.target.dataset.sel;
  if (id && St.modal && St.modal.type === 'preview') {
    ev.target.checked ? St.modal.sel.add(id) : St.modal.sel.delete(id);
    renderModal();
  }
});
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && St.modal) closeModal(); });
document.addEventListener('submit', async ev => {
  const f = ev.target; const kind = f.dataset.form; if (!kind) return;
  ev.preventDefault();
  const v = Object.fromEntries(new FormData(f).entries());
  if (kind === 'login') {
    try {
      const r = await api('POST', '/api/login', { role: St.loginRole, pin: v.pin });
      St.token = r.token; St.user = r.user; store.set('cp_token', r.token); store.set('cp_user', JSON.stringify(r.user));
      St.route = 'home'; history.replaceState(null, '', '#home'); render();
    } catch (e) { toast(e.message, true); }
  } else if (kind === 'log') runLog(v.q.trim());
  else if (kind === 'exc') {
    const [H, M] = v.end.split(':').map(Number); const n = nowS(); const end = new Date(n); end.setHours(H, M, 0, 0);
    if (end <= n) end.setDate(end.getDate() + 1);
    const r = await act(() => api('POST', '/api/exceptions', { roomId: v.roomId, reason: v.reason, endsAt: end.toISOString() }), isAdmin() ? 'Requested — approve it under Exceptions' : 'Exception requested — awaiting admin approval');
    if (r) closeModal();
  } else if (kind === 'tt') {
    const r = await act(() => api('POST', '/api/timetable', v), 'Booking added');
    if (r) closeModal();
  } else if (kind === 'settings') {
    v.timeScale = Number(v.timeScale);
    await act(() => api('POST', '/api/settings', v), 'Settings saved');
  }
});

render();
