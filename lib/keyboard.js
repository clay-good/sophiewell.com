// Keyboard layer per spec-v2 section 3.
// - Global leader-key shortcuts (G, then a letter) with a help overlay (?).
// - The overlay is dismissable on Escape.
//
// (spec-v2 also described tile-grid arrow-key navigation, but the home tile
// grid was removed in spec-v51/v53 -- the home is now a single search combobox
// -- so that handler was dead code targeting `#tile-grid`/`.tile-link` elements
// that no longer exist; it was removed.)
//
// Shortcuts are intentionally G-prefixed so they do not collide with browser
// shortcuts. The G-H ambiguity from spec-v2 §3.3 (Home vs HCPCS) collapsed
// when HCPCS was retired in spec-v29 wave 29-2 §2.1; G H now always routes
// to Home. The six leaders that targeted retired tiles (h's HCPCS branch,
// i ICD-10, c CPT, n NDC, f Medicare Fee Lookup, o Out-of-Pocket Estimator)
// were dropped with their tiles.

const SHORTCUTS = [
  // [keys, action]. `keys` is the letter pressed after G.
  ['h', { label: 'Home', go: '' }],
  ['u', { label: 'Unit Converter', go: 'unit-converter' }],
  ['b', { label: 'BMI', go: 'bmi' }],
  ['e', { label: 'eGFR (CKD-EPI 2021)', go: 'egfr' }],
  ['d', { label: 'Drip Rate', go: 'drip-rate' }],
  ['w', { label: 'Weight-Based Dose', go: 'weight-dose' }],
  ['m', { label: 'MAP', go: 'map' }],
  ['g', { label: 'Glasgow Coma Scale', go: 'gcs' }],
];

const SHORTCUT_MAP = new Map(SHORTCUTS.map(([k, a]) => [k, a]));

let leaderArmed = false;
let leaderTimer = null;
let overlayEl = null;

function isTypingTarget(target) {
  if (!target || !target.tagName) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function disarmLeader() {
  leaderArmed = false;
  if (leaderTimer) { clearTimeout(leaderTimer); leaderTimer = null; }
  document.documentElement.removeAttribute('data-leader-armed');
}

function armLeader() {
  leaderArmed = true;
  document.documentElement.setAttribute('data-leader-armed', '1');
  if (leaderTimer) clearTimeout(leaderTimer);
  leaderTimer = setTimeout(disarmLeader, 1500);
}

function executeAction(action) {
  if (action.focus) {
    const node = document.getElementById(action.focus);
    if (node) node.focus();
    return;
  }
  if (action.resolve) {
    const target = action.resolve();
    if (target) location.hash = '#' + target;
    else location.hash = '#';
    return;
  }
  if (action.go) location.hash = '#' + action.go;
}

function showOverlay() {
  if (overlayEl) { overlayEl.focus(); return; }
  overlayEl = document.createElement('div');
  overlayEl.id = 'shortcut-overlay';
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-modal', 'true');
  overlayEl.setAttribute('aria-label', 'Keyboard shortcuts');
  overlayEl.tabIndex = -1;
  const panel = document.createElement('div');
  panel.className = 'shortcut-panel';
  const h = document.createElement('h2');
  h.textContent = 'Keyboard shortcuts';
  panel.appendChild(h);
  const intro = document.createElement('p');
  intro.className = 'muted';
  intro.textContent = 'Press G then a letter. Press ? to toggle this overlay. Press Esc to dismiss.';
  panel.appendChild(intro);
  const list = document.createElement('ul');
  for (const [k, a] of SHORTCUTS) {
    const li = document.createElement('li');
    const kbd = document.createElement('kbd');
    kbd.textContent = `G ${k.toUpperCase()}`;
    li.appendChild(kbd);
    li.appendChild(document.createTextNode(`  ${a.label}`));
    list.appendChild(li);
  }
  panel.appendChild(list);
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close';
  close.addEventListener('click', hideOverlay);
  panel.appendChild(close);
  overlayEl.appendChild(panel);
  document.body.appendChild(overlayEl);
  overlayEl.focus();
}

function hideOverlay() {
  if (!overlayEl) return;
  overlayEl.remove();
  overlayEl = null;
}

function onKeyDown(e) {
  // Always allow Escape to dismiss overlay.
  if (e.key === 'Escape' && overlayEl) { hideOverlay(); e.preventDefault(); return; }

  if (isTypingTarget(e.target)) return;
  // Modifier keys are off-limits to avoid clashing with browser/system shortcuts.
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
    if (overlayEl) hideOverlay(); else showOverlay();
    e.preventDefault();
    return;
  }

  if (leaderArmed) {
    const k = e.key.toLowerCase();
    const action = SHORTCUT_MAP.get(k);
    disarmLeader();
    if (action) {
      executeAction(action);
      e.preventDefault();
    }
    return;
  }

  if (e.key.toLowerCase() === 'g') {
    armLeader();
    e.preventDefault();
  }
}

export function installKeyboard() {
  document.addEventListener('keydown', onKeyDown);
}

export const _testing = { SHORTCUT_MAP, SHORTCUTS };
