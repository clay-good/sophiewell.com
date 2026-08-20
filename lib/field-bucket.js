// spec-v753: which file a tile's field descriptors live in.
//
// Shared by scripts/build-field-index.mjs (which writes the buckets) and
// lib/query-fill.js (which reads them), so the two can never disagree about a
// filename. Lowercase first character of the tile id, or `_` for anything else,
// which means the browser computes the path from the id with no manifest fetch.
export function bucketFor(id) {
  const c = String(id || '').charAt(0).toLowerCase();
  return /[a-z0-9]/.test(c) ? c : '_';
}
