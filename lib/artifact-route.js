// spec-v7 section 3.1: artifact-kind -> tile-id routing.
//
// Pure-function lookup that takes a kind returned by lib/artifact-detect.js
// and returns the home-grid tile id the dropzone shell should route to,
// or null when no tile is wired for that kind yet (the UI then falls back
// to its chooser pane).
//
// The full v7 section 4 decoder pages (annotated DOCX export, web-worker
// PDF parsers) are still unimplemented. Until they land, the dropzone
// shell routes to the existing in-grid decoder tiles that already accept
// pasted text. The mapping is the single source of truth for that
// fallback behavior so it can be unit-tested without touching the DOM.

import { ARTIFACT_KINDS } from './artifact-detect.js';

// Default routing table. Each value is a tile id present in app.js's
// UTILITIES registry. Kinds with no shipped decoder tile map to null so
// the UI surfaces a chooser instead of routing into nothing.
export const DEFAULT_ARTIFACT_ROUTES = Object.freeze({
  bill: 'decoder',
  eob: 'eob-decoder',
  msn: 'msn-decoder',
  'lab-result': 'lab-interpret',
  'denial-letter': 'appeal-letter',
  'pharmacy-list': null,
  'discharge-summary': 'discharge-instr',
  'insurance-card': 'insurance',
});

// Returns the tile id for `kind`, or null when no tile is wired or the
// kind is unknown / unrecognized. `knownIds`, when provided, gates the
// result on the tile actually existing in the live registry so a stale
// mapping cannot produce a broken hash route.
export function routeArtifact(kind, knownIds) {
  if (!kind || kind === 'unknown') return null;
  if (!ARTIFACT_KINDS.includes(kind)) return null;
  const tileId = DEFAULT_ARTIFACT_ROUTES[kind] || null;
  if (!tileId) return null;
  if (knownIds && typeof knownIds.has === 'function' && !knownIds.has(tileId)) {
    return null;
  }
  return tileId;
}

// File-intake helpers (spec-v7 section 3.1 shell).
//
// The dropzone reads plain-text files in the browser via FileReader.
// Until v7 section 4 lands the Web-Worker PDF/DOCX parsers, the shell
// accepts any file the FileReader can read as text: anything with a
// text/* MIME type, the common JSON/CSV/TSV MIME types, or one of the
// well-known text extensions below. `isLikelyTextFile` is the pure
// predicate; `TEXT_EXTENSIONS` is exported so the input element and
// any future tests can stay in lockstep.

export const TEXT_EXTENSIONS = Object.freeze([
  '.txt', '.text', '.log', '.csv', '.tsv', '.md', '.markdown', '.json',
]);

export const TEXT_MIME_PREFIXES = Object.freeze(['text/']);

export const TEXT_MIME_EXACT = Object.freeze([
  'application/json',
  'application/csv',
  'application/x-csv',
  'application/x-ndjson',
]);

// Returns true when the given file-ish object (anything with `name` and
// `type` strings) is safe to read with FileReader.readAsText. Empty
// type with a known text extension still counts (some browsers omit
// the MIME for less-common extensions).
export function isLikelyTextFile(file) {
  if (!file) return false;
  const name = String(file.name || '').toLowerCase();
  const type = String(file.type || '').toLowerCase();
  for (const p of TEXT_MIME_PREFIXES) {
    if (type.startsWith(p)) return true;
  }
  for (const t of TEXT_MIME_EXACT) {
    if (type === t) return true;
  }
  for (const ext of TEXT_EXTENSIONS) {
    if (name.endsWith(ext)) return true;
  }
  return false;
}

// Build a short human-readable summary of why the classifier picked a
// kind: "matched: this is not a bill, allowed amount". Caps the list
// at `limit` (default 3) so the result line stays readable.
export function formatDetectionHits(hits, limit) {
  const max = Number.isInteger(limit) && limit > 0 ? limit : 3;
  const arr = Array.isArray(hits) ? hits.slice(0, max) : [];
  if (arr.length === 0) return '';
  return 'matched: ' + arr.join(', ');
}

// Human-readable label per kind. Used by the chooser pane when detection
// returned `unknown` and the user needs to pick a target decoder.
export const ARTIFACT_LABELS = Object.freeze({
  bill: 'Medical bill',
  eob: 'Explanation of Benefits (EOB)',
  msn: 'Medicare Summary Notice (MSN)',
  'lab-result': 'Lab result',
  'denial-letter': 'Insurance denial letter',
  'pharmacy-list': 'Pharmacy / medication list',
  'discharge-summary': 'Discharge paperwork',
  'insurance-card': 'Insurance card',
});
