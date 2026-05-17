// spec-v7 section 3.1 / section 4: handoff of dropzone-extracted text
// into the decoder tile's primary text input.
//
// The dropzone (wireDropzone in app.js) sets a pending payload via
// setPendingDrop() before navigating to the decoder via location.hash.
// The route() post-render microtask then calls applyPendingDrop() with
// the freshly mounted tile body; if a payload was set for that tile,
// the matching textarea is filled and a small banner is appended so the
// user knows the form was populated from their dropped document.
//
// State lives in module scope (no storage API). The payload is single-
// use: consuming it clears the pending slot. Same-tab only.
//
// PRIMARY_INPUT_BY_TILE maps each decoder tile id to the DOM id of the
// textarea/input that accepts the raw artifact text. Tiles whose
// renderers do not expose a single paste input are intentionally absent;
// the dropzone still routes to them but the handoff is a no-op.

import { ARTIFACT_KINDS } from './artifact-detect.js';

export const PRIMARY_INPUT_BY_TILE = Object.freeze({
  decoder: 'bill',
  'eob-decoder': 'eob',
  'msn-decoder': 'msn',
});

// Single pending payload. Cleared by consumePendingDrop().
let PENDING = null;

export function setPendingDrop(tileId, text) {
  if (!tileId || typeof tileId !== 'string') return;
  const t = String(text == null ? '' : text);
  if (!t) { PENDING = null; return; }
  PENDING = { tileId, text: t };
}

export function consumePendingDrop(tileId) {
  if (!PENDING || PENDING.tileId !== tileId) return null;
  const out = PENDING;
  PENDING = null;
  return out;
}

export function peekPendingDrop() {
  return PENDING ? { tileId: PENDING.tileId, text: PENDING.text } : null;
}

// Apply a pending payload to the live tile body. Returns the input id
// that was filled, or null if nothing happened. `bannerHost`, when
// provided, receives a one-line banner element noting that the form
// was pre-filled (caller controls placement). The optional `doc`
// argument lets tests inject a JSDOM document; defaults to the global
// document when present.
export function applyPendingDrop(tileId, body, opts) {
  const options = opts || {};
  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  const inputId = PRIMARY_INPUT_BY_TILE[tileId];
  if (!inputId || !doc || !body) return null;
  const payload = consumePendingDrop(tileId);
  if (!payload) return null;
  const input = (typeof body.querySelector === 'function')
    ? body.querySelector('#' + cssEscape(inputId))
    : doc.getElementById(inputId);
  if (!input || !('value' in input)) return null;
  input.value = payload.text;
  const bannerHost = options.bannerHost || input.parentNode;
  if (bannerHost && typeof doc.createElement === 'function') {
    const banner = doc.createElement('p');
    banner.className = 'artifact-handoff-banner';
    banner.setAttribute('role', 'status');
    banner.textContent =
      'Pre-filled from the document you dropped above. ' +
      'Review the text and click the decode button to continue.';
    bannerHost.appendChild(banner);
  }
  return inputId;
}

// Belt-and-suspenders: any artifact kind from the classifier should map
// (via lib/artifact-route.js) to one of the tile ids above, or to a
// tile with no paste input. This helper lets the route table cross-
// check itself in tests.
export function hasPasteInputForTile(tileId) {
  return Object.prototype.hasOwnProperty.call(PRIMARY_INPUT_BY_TILE, tileId);
}

// Re-exported so callers can iterate without importing two modules.
export { ARTIFACT_KINDS };

function cssEscape(s) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(s);
  return String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c);
}
