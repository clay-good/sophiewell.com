// spec-v61 §2 A7: opt-in, client-only "remember my inputs" persistence.
//
// Off by default. When the nurse enables it, a tile's numeric/choice inputs
// are written to localStorage so reopening the same tile next shift restores
// the constants she would otherwise re-enter. Two string-literal keys are used
// (both listed in scripts/storage-allowlist.json, per spec-v50 §3.4):
//
//   sw-remember      -> '1' when the feature is enabled; absent otherwise.
//   sw-saved-inputs  -> JSON map { [toolId]: { [fieldId]: value } }.
//
// PHI safety: only number/range/checkbox/radio inputs and <select> values are
// stored. Free-text inputs (type=text/search) and <textarea> are never
// persisted, so a name/allergy/clinical-note field can never land in storage
// (spec-v61 §2 A7: "never on for PHI-bearing free-text"). Turning the toggle
// off removes both keys, so opting out also erases anything already stored.
//
// All access is wrapped in try/catch: in private-browsing modes that throw on
// localStorage, the feature silently no-ops rather than breaking the tile.

const PERSIST_TYPES = new Set(['number', 'range', 'checkbox', 'radio']);

// Collect the tile's persistable input/select nodes. Iterates by tag and
// filters by type in JS (no compound CSS selector) so the behavior is the
// same in the browser and under the unit-test DOM stub.
function persistableNodes(body) {
  if (!body || typeof body.querySelectorAll !== 'function') return [];
  const inputs = Array.from(body.querySelectorAll('input'));
  const selects = Array.from(body.querySelectorAll('select'));
  const nodes = [];
  for (const n of inputs) {
    if (n.id && PERSIST_TYPES.has(String(n.type || '').toLowerCase())) nodes.push(n);
  }
  for (const s of selects) {
    if (s.id) nodes.push(s);
  }
  return nodes;
}

export function hasPersistableInputs(body) {
  return persistableNodes(body).length > 0;
}

export function isRememberEnabled() {
  try { return localStorage.getItem('sw-remember') === '1'; } catch { return false; }
}

export function setRememberEnabled(on) {
  try {
    if (on) {
      localStorage.setItem('sw-remember', '1');
    } else {
      // Opting out erases the persisted inputs too - the toggle is also the
      // "forget what you stored" control.
      localStorage.removeItem('sw-remember');
      localStorage.removeItem('sw-saved-inputs');
    }
  } catch { /* storage unavailable (private mode / disabled) - no-op */ }
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem('sw-saved-inputs') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function collectInputs(body) {
  const out = {};
  for (const node of persistableNodes(body)) {
    const type = String(node.type || '').toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      out[node.id] = node.checked ? '1' : '0';
    } else if (node.value !== '' && node.value != null) {
      out[node.id] = String(node.value);
    }
  }
  return out;
}

// Persist the current values for `toolId`. No-ops unless the feature is on.
export function saveInputs(toolId, body) {
  if (!isRememberEnabled() || !toolId || !body) return;
  try {
    const store = readStore();
    const fields = collectInputs(body);
    if (Object.keys(fields).length) store[toolId] = fields;
    else delete store[toolId];
    localStorage.setItem('sw-saved-inputs', JSON.stringify(store));
  } catch { /* storage unavailable - no-op */ }
}

// Restore saved values into `body`. Returns the set of field ids actually
// filled, so the caller can let remembered values win over the example while
// still losing to a deep link's hash state (passed in via `skip`).
export function applySavedInputs(body, toolId, skip) {
  const filled = new Set();
  if (!isRememberEnabled() || !toolId || !body) return filled;
  const fields = readStore()[toolId];
  if (!fields || typeof fields !== 'object') return filled;
  for (const [id, value] of Object.entries(fields)) {
    if (skip && skip.has(id)) continue;
    const node = body.querySelector(`#${id}`) || (typeof document !== 'undefined' && document.getElementById(id));
    if (!node) continue;
    const type = String(node.type || '').toLowerCase();
    if (node.tagName === 'SELECT') node.value = value;
    else if (type === 'checkbox' || type === 'radio') node.checked = value === '1';
    else node.value = value;
    const evt = node.tagName === 'SELECT' || type === 'checkbox' || type === 'radio' ? 'change' : 'input';
    if (typeof node.dispatchEvent === 'function' && typeof Event === 'function') {
      node.dispatchEvent(new Event(evt, { bubbles: true }));
    }
    filled.add(id);
  }
  return filled;
}
