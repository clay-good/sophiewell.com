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
