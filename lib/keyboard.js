// Keyboard layer per spec-v2 section 3.
// - Tile grid arrow-key navigation when a tile has focus.
// - Global leader-key shortcuts (G, then a letter) with a help overlay (?).
// - The overlay is dismissable on Escape.
//
// Shortcuts are intentionally G-prefixed so they do not collide with browser
// shortcuts. Per spec-v2 section 3.3 "G H" is ambiguous between Home and
// HCPCS; we route to Home when on a non-home view, and to HCPCS when already
// on the home view.

const SHORTCUTS = [
  // [keys, action]. `keys` is the letter pressed after G.
  ['h', { label: 'Home (or HCPCS from home)', resolve: () => location.hash.replace(/^#/, '').split('/')[0] === '' ? 'hcpcs' : '' }],
  ['s', { label: 'Search (focus search box)', focus: 'topbar-search' }],
  ['p', { label: 'Pinned section (jump)', go: '__pinned__' }],
  ['u', { label: 'Unit Converter', go: 'unit-converter' }],
  ['b', { label: 'BMI', go: 'bmi' }],
  ['e', { label: 'eGFR (CKD-EPI 2021)', go: 'egfr' }],
  ['d', { label: 'Drip Rate', go: 'drip-rate' }],
  ['w', { label: 'Weight-Based Dose', go: 'weight-dose' }],
  ['m', { label: 'MAP', go: 'map' }],
  ['g', { label: 'Glasgow Coma Scale', go: 'gcs' }],
  ['i', { label: 'ICD-10 Lookup', go: 'icd10' }],
  ['c', { label: 'CPT Code Reference', go: 'cpt' }],
  ['n', { label: 'NDC Lookup', go: 'ndc' }],
  ['f', { label: 'Medicare Fee Lookup', go: 'mpfs' }],
  ['o', { label: 'Out-of-Pocket Estimator', go: 'oop' }],
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
  if (action.go === '__pinned__') {
    const pinned = document.getElementById('pinned-section');
    if (pinned) pinned.scrollIntoView({ block: 'start' });
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

// Tile-grid arrow-key navigation. Tiles are .tile elements that contain a
// .tile-link anchor. We move focus among the .tile-link anchors.
function tileLinks() {
  return Array.from(document.querySelectorAll('#tile-grid .tile:not([hidden]) .tile-link'));
}

function onGridKey(e) {
  const focused = document.activeElement;
  if (!focused || !focused.classList.contains('tile-link')) return;
  const links = tileLinks();
  const idx = links.indexOf(focused);
  if (idx === -1) return;
  let next = -1;
  // Determine columns by reading bounding rects (responsive grid).
  const cols = computeColumns(links);
  switch (e.key) {
    case 'ArrowRight': next = Math.min(idx + 1, links.length - 1); break;
    case 'ArrowLeft':  next = Math.max(idx - 1, 0); break;
    case 'ArrowDown':  next = Math.min(idx + cols, links.length - 1); break;
    case 'ArrowUp':    next = Math.max(idx - cols, 0); break;
    case 'Home':       next = 0; break;
    case 'End':        next = links.length - 1; break;
  }
  if (next === -1) return;
  links[next].focus();
  links.forEach((l) => l.removeAttribute('aria-current'));
  links[next].setAttribute('aria-current', 'true');
  e.preventDefault();
}

function computeColumns(links) {
  if (links.length < 2) return 1;
  const first = links[0].getBoundingClientRect();
  let cols = 1;
  for (let i = 1; i < links.length; i += 1) {
    const r = links[i].getBoundingClientRect();
    if (Math.abs(r.top - first.top) < 4) cols += 1;
    else break;
  }
  return cols;
}

export function installKeyboard() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keydown', onGridKey, true);
}

export const _testing = { SHORTCUT_MAP, SHORTCUTS };
