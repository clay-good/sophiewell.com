// Shared "Related tools" picker.
//
// spec-v939: this used to live only in scripts/build-tool-pages.mjs, so the
// website topped every tile's list up to four and the MCP `describe_calculator`
// answer carried only the curated `META.related` ids -- empty on 102
// calculators the website has four good suggestions for. Both surfaces now
// call the same function over the same two signals, so an agent and a reader
// are looking at the same shortlist.
//
// Pure: it takes tiles, a specialties map and the curated ids, and returns
// tile objects. No DOM, no fs, no META import -- mcp/tools.js feeds it the
// search corpus and the page builder feeds it UTILITIES.

// --- "Related tools": four links picked from what this tile has in common
// with the others, rather than from the order they happen to sit in.
//
// The list used to be the first four tiles sharing a group. A group holds
// hundreds of tiles, so the group chose the list and the tile did not: 1201
// of 1563 pages carried the identical four links, and a nurse finishing the
// DOLOPLUS-2 pain scale was pointed at APGAR, ABG, and Wells PE.
//
// Two signals, both already in the build. The search corpus tags every tile
// with its specialties, which is what puts a stroke score next to other
// stroke work. And the tile's own name, which is what catches the siblings no
// tag can tell apart -- "Wells Score for PE" and "Wells Score for DVT" share
// every specialty they have with 300 other tiles, and share "wells" with one.
//
// Both are weighted by how rare the term is across the catalog, so sharing
// "toxicology" counts and sharing "internal-medicine" (365 tiles) barely
// does. That falls out of one number and needs no stopword list: "score",
// "index", and "risk" are common enough to weigh nothing on their own.
export const RELATED_MAX = 4;

export function termsOf(tile, specialties) {
  const terms = new Set();
  for (const w of String(tile.name || '').toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length >= 2) terms.add(`n:${w}`);
  }
  for (const sp of specialties.get(tile.id) || []) terms.add(`s:${sp}`);
  return terms;
}

// log(N / documents holding the term): zero for a term on every tile, largest
// for one on a handful.
export function inverseFrequency(termsByTile, total) {
  const seen = new Map();
  for (const terms of termsByTile.values()) {
    for (const t of terms) seen.set(t, (seen.get(t) || 0) + 1);
  }
  const idf = new Map();
  for (const [t, n] of seen) idf.set(t, Math.log(total / n));
  return idf;
}

export function buildRelatedIndex(tiles, specialties) {
  const termsByTile = new Map(tiles.map((t) => [t.id, termsOf(t, specialties)]));
  return { termsByTile, idf: inverseFrequency(termsByTile, tiles.length || 1) };
}

export function pickRelated(tiles, current, index, meta, max = RELATED_MAX) {
  // The hand-picked siblings first. `META[id].related` is what the app itself
  // links to under "Related tools", so the two surfaces named different tools
  // for the same tile -- and the app's were chosen by a person. 1462 tiles
  // have them, a median of two each, which is why the scorer still runs: it
  // tops the list up to four rather than replacing a curated choice.
  const byId = new Map(tiles.map((t) => [t.id, t]));
  const picked = [];
  for (const rid of Array.isArray(meta?.related) ? meta.related : []) {
    const t = byId.get(rid);
    if (t && t.id !== current.id && !picked.includes(t)) picked.push(t);
    if (picked.length >= max) return picked;
  }

  const mine = index.termsByTile.get(current.id) || new Set();
  const scored = [];
  for (const t of tiles) {
    if (t.id === current.id || picked.includes(t)) continue;
    let score = 0;
    for (const term of index.termsByTile.get(t.id) || []) {
      if (mine.has(term)) score += index.idf.get(term) || 0;
    }
    // A tile in the same group is the same kind of thing -- a score, a drip,
    // a form -- which breaks ties the terms leave level without ever
    // outweighing a real shared term.
    if (t.group === current.group) score += 0.25;
    if (score > 0.25) scored.push([score, t]);
  }
  // Sort by id under equal scores so the same catalog always builds the same
  // page; `dist/` is compared byte-for-byte between builds.
  scored.sort((a, b) => b[0] - a[0] || (a[1].id < b[1].id ? -1 : 1));
  picked.push(...scored.slice(0, max - picked.length).map(([, t]) => t));
  // A tile that shares nothing measurable still gets neighbors, as before.
  if (picked.length < max) {
    for (const t of tiles) {
      if (picked.length >= max) break;
      if (t.id !== current.id && t.group === current.group && !picked.includes(t)) picked.push(t);
    }
  }
  return picked;
}
