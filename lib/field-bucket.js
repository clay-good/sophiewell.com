// spec-v753: which file a tile's field descriptors live in.
//
// Shared by scripts/build-field-index.mjs (which writes the buckets) and
// lib/query-fill.js (which reads them), so the two can never disagree about a
// filename. The lowercase first two characters of the tile id, each `_` if it
// is not a letter or digit, so the browser computes the path from the id with
// no manifest fetch. One letter was enough until the "m" bucket passed the
// 24 KB gzip budget at a catalog of 1934 (spec-v1504); two letters is the split
// the budget's own message named.
const ch = (c) => (/[a-z0-9]/.test(c) ? c : '_');
export function bucketFor(id) {
  const s = String(id || '').toLowerCase();
  return ch(s.charAt(0)) + ch(s.charAt(1));
}
