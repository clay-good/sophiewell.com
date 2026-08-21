// spec-v766: how strongly a query names a calculator.
//
// The token ranker scores on overlap, which makes a SHORTER name beat a longer
// one that contains it. "TyG-BMI (Triglyceride-Glucose-BMI Index)" loses to
// "BMI Calculator"; "Modified Glasgow (Imrie) Pancreatitis Severity" loses to
// the Ranson/BISAP tile it shares "pancreatitis severity" with. The reader named
// one calculator and got its neighbour.
//
// This was written for the MCP first (spec-v762, which took wrong-calculator
// answers from 135 to 7) and lives here so the website and the server decide the
// same way rather than drifting apart.
//
// Pure: no DOM, no fetch, no fs. mcp/tools.js imports it too, and
// check-mcp-catalog forbids DOM coupling on that path.

// Words that appear in dozens of names and identify nothing on their own.
const NOISE = new Set([
  'score', 'scale', 'index', 'risk', 'rule', 'test', 'tool', 'calculator',
  'criteria', 'classification', 'grade', 'stage', 'ratio', 'rate', 'value',
  'adult', 'child', 'total', 'time', 'level', 'with', 'from', 'this', 'that',
  'calc', 'estimate', 'estimator', 'predictor', 'assessment', 'screen',
]);

export function nameWords(name) {
  return (String(name || '').toLowerCase().match(/[a-z0-9-]+/g) || [])
    .filter((w) => w.length >= 4 && !NOISE.has(w));
}

/**
 * How many names each word appears in. A word shared by fifty calculators says
 * almost nothing about which one was meant; a word shared by two says almost
 * everything. Counted from the catalog rather than kept as a stoplist, so it
 * stays right as the catalog grows.
 */
export function buildNameCounts(names) {
  const counts = new Map();
  for (const name of names) {
    for (const w of new Set(nameWords(name))) counts.set(w, (counts.get(w) || 0) + 1);
  }
  return counts;
}

/**
 * Score, matched-word count, and whether the match is strong enough to override
 * a ranker.
 *
 * The score is summed rarity scaled by COVERAGE -- how much of this name the
 * query accounted for. Rarity alone is not enough, because a sibling's name can
 * contain its neighbour's: "HEAR Score (HEART minus troponin)" contains `heart`,
 * so it matched on the rarest word available and outscored the HEART score
 * itself. Coverage settles it -- HEART matches 3 of its 3 distinctive words,
 * HEAR 1 of its 4.
 *
 * Strength is a SEPARATE question from score, and conflating them regressed
 * twice: `life` appears in exactly one calculator name, which makes it rare and
 * still meaningless in "what is the meaning of life". It takes two matched
 * words, or one long rare one.
 */
export function nameMatch(query, name, counts) {
  const q = ` ${String(query || '').toLowerCase()} `;
  const words = new Set(nameWords(name));
  if (!words.size) return { score: 0, hits: 0, strong: false };
  let rarity = 0;
  const matched = [];
  for (const w of words) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (re.test(q)) { rarity += 1 / ((counts && counts.get(w)) || 1); matched.push(w); }
  }
  const strong = matched.length >= 2
    || matched.some((w) => w.length >= 6 && ((counts && counts.get(w)) || 1) <= 2);
  return { score: rarity * (matched.length / words.size), hits: matched.length, strong };
}

/**
 * word -> the ids of every calculator whose name contains it.
 *
 * Promotion can only reorder what the ranker returned, and the ranker sometimes
 * returns one row: "Modified EHRA Symptom Scale (Atrial Fibrillation)" came back
 * as CHA2DS2-VASc alone, with the named tile nowhere in the list. Finding it
 * needs a lookup by name word, and doing that by scanning 1564 names on every
 * keystroke is not something to put in a phone's typing path -- an inverted
 * index makes it proportional to the QUERY instead of the catalog.
 */
export function buildNameIndex(tiles) {
  const index = new Map();
  for (const t of tiles) {
    for (const w of new Set(nameWords(t.name))) {
      if (!index.has(w)) index.set(w, []);
      index.get(w).push(t.id);
    }
  }
  return index;
}

/**
 * The calculator a query names most strongly, looked up by word. Returns null
 * when nothing is named strongly enough to override a ranker.
 */
export function findNamed(query, index, counts, byId, opts = {}) {
  // How many of a name's words the query must match. Rarity among NAMES is not
  // the same as meaningfulness: "therapy" appears in few calculator names and in
  // a great deal of ordinary language, and one such word promoted Therapy Units
  // over CHA2DS2-VASc for "antithrombotic therapy not recommended".
  //
  // The website passes 2. Its ranker already weighs corpus prose -- what a tile
  // MEANS -- so overruling that needs more than a single suggestive word. The
  // MCP path leaves the default, because there a name match is corroborated by
  // whether the query's values actually fit the tile.
  const minHits = Number.isFinite(opts.minHits) ? opts.minHits : 1;
  const words = new Set((String(query || '').toLowerCase().match(/[a-z0-9-]+/g) || [])
    .filter((w) => w.length >= 4));
  const seen = new Set();
  let best = null;
  let bestScore = 0;
  for (const w of words) {
    for (const id of index.get(w) || []) {
      if (seen.has(id)) continue;
      seen.add(id);
      const tile = byId(id);
      if (!tile) continue;
      const m = nameMatch(query, tile.name, counts);
      if (m.strong && m.hits >= minHits && m.score > bestScore) { bestScore = m.score; best = tile; }
    }
  }
  return best;
}
