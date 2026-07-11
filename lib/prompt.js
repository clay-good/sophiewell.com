// spec-v8 §4.3: the front-door prompt resolver. Pure-function,
// no DOM, no fetch, no AI. Consumes a query, the UTILITIES list
// (each tile carrying `name`, `desc`, `audiences`, `group`, and
// optional `tags`), the synonym table, and the active audience
// (the `#a=` deep-link, nurse-first by default; the chip-filter UI
// was removed in spec-v51/v53), and returns the routed tile id with a short `why` tag for
// the UI breadcrumb, or null if nothing matched.
//
// The signature is `(query, tiles, synonyms, audience) -> {tileId,
// why, phrase?} | null` so test fixtures can drive the matcher
// without ever standing up the DOM or the network.
//
// Three passes, evaluated in order, first-match wins:
//
//   1. Synonym table (delegates to lib/synonyms.js `matchSynonym`).
//      The hand-curated `data/synonyms.json` rows.
//   2. Token ranker over `name + desc + audiences + group + tags`.
//      Whitespace+dash tokenization, deterministic scoring (see
//      RANKER_RUBRIC), threshold-gated top-1 return.
//   3. Single-edit Levenshtein fallback against the synonym table
//      only (the tile token ranker already absorbs partial-token
//      typos via the +1 per token bonus). Recovers "discharg" ->
//      "discharge", "medicaiton" -> "medication".

import { matchSynonym, normalizePhrase } from './synonyms.js';

const RANKER_RUBRIC = {
  exactPhraseInName: 10,
  exactPhraseInDesc: 5,
  tokenInName: 3,
  tokenInDesc: 1,
  tokenInAudienceOrTag: 1,
  audienceAligned: 2,
  audienceMisaligned: -2,
  threshold: 3,
};

// spec plain-language-search task 3.3 (Design D4): question-scaffold and
// stopword stripping for the RANKING view of the query only. A nurse types
// "how much maintenance fluid for a child"; the scaffolding tokens ("how",
// "much", "for", "a") otherwise each collect +1 desc hits across hundreds of
// tiles and drown the two clinical terms. The raw query is kept for the
// exact-phrase bonuses, so verbatim tile-name queries are unaffected. The
// list is a reviewed constant: interrogative scaffolding and pure function
// words only - never a clinical term, however common.
const QUERY_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'be',
  'do', 'does', 'did', 'i', 'my', 'me', 'we', 'you', 'your',
  'of', 'to', 'in', 'on', 'at', 'for', 'with', 'and', 'or',
  'what', 'whats', 'which', 'who', 'how', 'much', 'many',
  'should', 'can', 'could', 'would', 'will', 'when',
  'get', 'out', 'this', 'that', 'these', 'those',
  'figure', 'calculate', 'work',
  'patient', 'patients',
]);

// spec plain-language-search task 3.2 (Design D3, bounded to the safe
// subset): plural-only suffix fold so "fluids" matches "fluid" and "scores"
// matches "score". Applied identically to corpus and query tokens. The
// ing/ion pairs the design also listed are deliberately NOT folded - the
// build-time prototype showed they introduce order-dependent noise
// (prediction<->predicting sent "predicting bleeding risk" to the wrong
// tile); revisit them with the IDF ranker slice. Guards: short tokens and
// the -ss / -us / -is endings (sepsis, status, glass) are left alone.
// Derivational folds (spec-v290): a REVIEWED pair table, not a suffix rule.
// The general ing/ion stripper the design sketched is exactly what produced
// order-dependent noise in the spec-v282 prototype ("staging" -> "stag",
// prediction<->predicting misroutes), so only hand-vetted clinical
// verb<->noun pairs fold, each to its noun form. Extend the table only with
// a golden-set probe demonstrating the gap.
const DERIVATIONAL_FOLDS = new Map([
  ['transfuse', 'transfusion'],
  ['transfusing', 'transfusion'],
  ['intubate', 'intubation'],
  ['intubating', 'intubation'],
  ['sedate', 'sedation'],
  ['sedating', 'sedation'],
  ['resuscitate', 'resuscitation'],
  ['resuscitating', 'resuscitation'],
  ['anticoagulate', 'anticoagulation'],
  ['dialyze', 'dialysis'],
  ['extubate', 'extubation'],
]);

function stemToken(t) {
  const folded = DERIVATIONAL_FOLDS.get(t);
  if (folded) return folded;
  if (t.length >= 4 && t.endsWith('s')) {
    const prev = t[t.length - 2];
    if (prev !== 's' && prev !== 'u' && prev !== 'i') return t.slice(0, -1);
  }
  return t;
}

function tokenize(s) {
  return normalizePhrase(s).split(/\s+/).filter(Boolean).map(stemToken);
}

// The ranking view of the query: normalized tokens minus scaffolding, then
// stemmed. Falls back to the unstripped token list when stripping would
// leave nothing (an all-scaffold query like "what is" ranks as before
// rather than matching nothing).
function queryRankTokens(query) {
  const raw = query.split(/\s+/).filter(Boolean);
  const stripped = raw.filter((t) => !QUERY_STOPWORDS.has(t));
  return (stripped.length ? stripped : raw).map(stemToken);
}

function buildSearchDoc(tile) {
  const audiences = Array.isArray(tile.audiences) ? tile.audiences : [];
  const tags = Array.isArray(tile.tags) ? tile.tags : [];
  // spec-v11 §4.3: specialties are additive search tokens, weighted the
  // same as audiences / tags (+1 per matched token).
  const specialties = Array.isArray(tile.specialties) ? tile.specialties : [];
  return {
    name: normalizePhrase(tile.name),
    desc: normalizePhrase(tile.desc || ''),
    nameTokens: tokenize(tile.name),
    descTokens: tokenize(tile.desc || ''),
    audienceTokens: audiences.map((a) => stemToken(normalizePhrase(a))),
    tagTokens: tags.map((t) => stemToken(normalizePhrase(t))),
    specialtyTokens: specialties.flatMap((s) => tokenize(s)),
    audiences,
  };
}

// Score every tile against the query with the deterministic rubric. Returns an
// array of { tileId, score, why } for tiles at or above threshold, sorted by
// score descending; ties keep UTILITIES order (stable). `rankTiles` (top-1) is
// the head of this list, so the two never disagree.
function rankTilesAll(queryRaw, tiles, audience) {
  const query = normalizePhrase(queryRaw);
  if (!query) return [];
  const tokens = queryRankTokens(query);
  const vocab = tileVocabulary(tiles);
  const scored = [];
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i];
    if (!tile || !tile.id || !tile.name) continue;
    const doc = buildSearchDoc(tile);
    let score = 0;
    let idfSum = 0;
    if (doc.name.includes(query)) score += RANKER_RUBRIC.exactPhraseInName;
    if (doc.desc && doc.desc.includes(query)) score += RANKER_RUBRIC.exactPhraseInDesc;
    for (const t of tokens) {
      if (!t) continue;
      let matched = false;
      if (doc.nameTokens.includes(t)) { score += RANKER_RUBRIC.tokenInName; matched = true; }
      if (doc.descTokens.includes(t)) { score += RANKER_RUBRIC.tokenInDesc; matched = true; }
      if (doc.audienceTokens.includes(t) || doc.tagTokens.includes(t) || doc.specialtyTokens.includes(t)) {
        score += RANKER_RUBRIC.tokenInAudienceOrTag;
        matched = true;
      }
      if (matched) idfSum += idfNorm(vocab, t);
    }
    if (audience && audience !== 'all') {
      if (doc.audiences.includes(audience)) score += RANKER_RUBRIC.audienceAligned;
      else if (doc.audiences.length) score += RANKER_RUBRIC.audienceMisaligned;
    }
    if (score >= RANKER_RUBRIC.threshold) {
      // Sub-point IDF bonus (Design D2, bounded form): a rarity-weighted
      // fraction strictly below one rubric point, so it reorders ties and
      // near-ties (a tile matching "heparin" outranks one matching only
      // "drip") but can never cross the integer threshold or outvote a
      // whole-point rubric signal. Fixed 4-decimal precision keeps the
      // ordering reproducible across engines.
      const bonus = tokens.length
        ? Math.round((0.99 * idfSum / tokens.length) * 10000) / 10000
        : 0;
      scored.push({ tileId: tile.id, score: score + bonus, why: 'name-token-match', order: i });
    }
  }
  // Descending score; the IDF bonus breaks former whole-point ties, and
  // exact ties still keep original UTILITIES order (stable).
  scored.sort((a, b) => (b.score - a.score) || (a.order - b.order));
  return scored.map(({ tileId, score, why }) => ({ tileId, score, why }));
}

function rankTiles(queryRaw, tiles, audience) {
  const all = rankTilesAll(queryRaw, tiles, audience);
  return all.length ? all[0] : null;
}

// Levenshtein with a hard cap of 1. Bails as soon as the partial
// distance exceeds 1 so the worst case stays O(min(a, b)).
function withinOneEdit(a, b) {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la === lb) { i++; j++; }            // substitution
    else if (la > lb) { i++; }              // deletion in `a`
    else { j++; }                           // insertion in `a`
  }
  if (i < la || j < lb) edits++;            // trailing extra char
  return edits <= 1;
}

// Pass 3: retry the synonym table after rewriting each query token
// to its closest one-edit neighbor that appears in some synonym
// phrase. Catches single-character typos without bringing in a
// fuzzy library.
function synonymEditFallback(queryRaw, synonyms, audience) {
  const query = normalizePhrase(queryRaw);
  if (!query) return null;
  const tokens = query.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;

  // Build the corpus of tokens that appear in any synonym phrase.
  const corpus = new Set();
  for (const entry of synonyms || []) {
    for (const phrase of entry?.phrases || []) {
      for (const t of normalizePhrase(phrase).split(/\s+/)) {
        if (t) corpus.add(t);
      }
    }
  }
  if (!corpus.size) return null;

  // Rewrite each token to its first one-edit neighbor in the corpus
  // (skipping tokens that already appear). Stop after one rewrite -
  // multi-typo queries fall through.
  let rewritten = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (corpus.has(t)) continue;
    for (const candidate of corpus) {
      if (withinOneEdit(t, candidate)) {
        const next = tokens.slice();
        next[i] = candidate;
        rewritten = next.join(' ');
        break;
      }
    }
    if (rewritten) break;
  }
  if (!rewritten || rewritten === query) return null;
  const hit = matchSynonym(rewritten, synonyms, audience);
  if (!hit) return null;
  return { tileId: hit.tile, why: 'synonym-edit-distance', phrase: hit.phrase };
}

// Pass 3b (plain-language-search task 3.4, Design D5): one-edit rewrite
// against the FULL tile vocabulary, not just synonym phrases, so a typo in a
// tile-name term recovers even when the tile has no synonym entry
// ("bradan scale" -> "braden scale", "heprin drip" -> "heparin drip"). Cost
// is bounded three ways: the vocabulary map is length-bucketed (only
// candidates within +-1 length are scanned), only the first
// EDIT_TOKEN_ATTEMPTS unknown tokens are tried, and the pass only runs at
// all when passes 1-2 returned nothing - the end-of-typing miss case, not
// the per-keystroke path. Tokens shorter than 3 chars are never rewritten
// (two-letter neighbors are all noise).
const EDIT_TOKEN_ATTEMPTS = 3;
const EDIT_MIN_TOKEN = 3;

// Session-scoped vocabulary memo, keyed on the tiles array identity. Callers
// that pass a stable array (the browser's corpus-enriched tile list) pay the
// build once; callers that rebuild the array per call just rebuild the map -
// same order of work as the ranker's own per-call tokenization.
const VOCAB_CACHE = new WeakMap();

function tileVocabulary(tiles) {
  const cached = VOCAB_CACHE.get(tiles);
  if (cached) return cached;
  const byLen = new Map();
  const df = new Map();
  const dfRaw = new Map();
  let docCount = 0;
  // byLen indexes BOTH the raw surface form and its stem: the typo-repair
  // neighbor search must be able to rewrite toward the surface form
  // ("wels" -> "wells", not the stem "well"), because the rewritten query's
  // exact-phrase bonuses only fire on surface text. df stays stem-keyed -
  // it feeds idfNorm, and the ranker matches on stems.
  const add = (raw, docTokens) => {
    if (!raw || raw.length < EDIT_MIN_TOKEN) return;
    const stemmed = stemToken(raw);
    for (const form of stemmed === raw ? [raw] : [raw, stemmed]) {
      let bucket = byLen.get(form.length);
      if (!bucket) { bucket = new Set(); byLen.set(form.length, bucket); }
      bucket.add(form);
    }
    docTokens.add(stemmed);
    docTokens.rawSet.add(raw);
  };
  const rawTokens = (s) => normalizePhrase(s).split(/\s+/).filter(Boolean);
  for (const tile of tiles) {
    if (!tile || !tile.id || !tile.name) continue;
    docCount += 1;
    const docTokens = new Set();
    docTokens.rawSet = new Set();
    for (const t of rawTokens(tile.name)) add(t, docTokens);
    for (const t of rawTokens(tile.desc || '')) add(t, docTokens);
    for (const t of Array.isArray(tile.tags) ? tile.tags : []) add(normalizePhrase(t), docTokens);
    for (const s of Array.isArray(tile.specialties) ? tile.specialties : []) {
      for (const t of rawTokens(s)) add(t, docTokens);
    }
    for (const t of docTokens) df.set(t, (df.get(t) || 0) + 1);
    for (const t of docTokens.rawSet) dfRaw.set(t, (dfRaw.get(t) || 0) + 1);
  }
  const vocab = { byLen, df, dfRaw, docCount };
  VOCAB_CACHE.set(tiles, vocab);
  return vocab;
}

function hasToken(vocab, t) {
  const bucket = vocab.byLen.get(t.length);
  return Boolean(bucket && bucket.has(t));
}

// Normalized inverse document frequency in [0, 1], rounded to 4 decimals so
// ordering is reproducible across JS engines (Design D2's fixed-precision
// requirement). A token in every tile scores ~0; a token in one tile scores
// ~1; an unseen token scores 1.
function idfNorm(vocab, t) {
  if (!vocab.docCount) return 0;
  const df = vocab.df.get(t) || 0;
  const v = Math.log((vocab.docCount + 1) / (df + 1)) / Math.log(vocab.docCount + 1);
  return Math.round(v * 10000) / 10000;
}

// Rarity of the repaired term, read the most-informative way: the surface
// form's own document frequency when the stem family is polluted by a
// common prose word ("wells" is a rare eponym even though its stem "well"
// appears in half the corpus as "as well as").
function repairIdf(vocab, t) {
  const stemIdf = idfNorm(vocab, stemToken(t));
  if (!vocab.docCount) return stemIdf;
  const raw = vocab.dfRaw.get(t) || 0;
  const rawIdf = Math.round((Math.log((vocab.docCount + 1) / (raw + 1)) / Math.log(vocab.docCount + 1)) * 10000) / 10000;
  return Math.max(stemIdf, rawIdf);
}

function tokenEditFallback(queryRaw, tiles, audience) {
  const NO_REPAIR = { hits: [], rewrote: null };
  const query = normalizePhrase(queryRaw);
  if (!query) return NO_REPAIR;
  // Work in RAW surface forms: the neighbor search and the rewritten query
  // both stay un-stemmed ("wels" scans length 3-5 and can reach "wells"),
  // so a repaired query keeps its exact-phrase bonuses; only the
  // known-token check consults the stemmed side of the vocabulary.
  const tokens = query.split(/\s+/).filter(Boolean);
  if (!tokens.length) return NO_REPAIR;
  const vocab = tileVocabulary(tiles);
  if (!vocab.byLen.size) return NO_REPAIR;

  let rewritten = null;
  let attempts = 0;
  for (let i = 0; i < tokens.length && attempts < EDIT_TOKEN_ATTEMPTS; i += 1) {
    const t = tokens[i];
    if (t.length < EDIT_MIN_TOKEN || QUERY_STOPWORDS.has(t)
      || hasToken(vocab, t) || hasToken(vocab, stemToken(t))) continue;
    attempts += 1;
    // Among ALL one-edit neighbors, pick the most-attested stem family
    // (highest document frequency), preferring the LONGEST surface form
    // within it (so "wels" repairs to "wells", whose exact-phrase bonus can
    // fire, not the stem "well"), lexicographic on remaining ties. Taking
    // the first Set-iteration hit instead is deterministic but arbitrary:
    // it rewrote "wels"(->"wel") to "del" rather than "well" during the
    // build.
    let best = null;
    let bestDf = -1;
    for (let len = t.length - 1; len <= t.length + 1; len += 1) {
      const bucket = vocab.byLen.get(len);
      if (!bucket) continue;
      for (const candidate of bucket) {
        if (!withinOneEdit(t, candidate)) continue;
        const df = vocab.df.get(stemToken(candidate)) || 0;
        const wins = df > bestDf
          || (df === bestDf && best !== null && candidate.length > best.length)
          || (df === bestDf && best !== null && candidate.length === best.length && candidate < best);
        if (best === null ? df >= 0 : wins) {
          best = candidate;
          bestDf = df;
        }
      }
    }
    if (best) {
      const next = tokens.slice();
      next[i] = best;
      rewritten = { text: next.join(' '), target: best };
      break;                                 // single-rewrite semantics, as pass 3a
    }
  }
  if (!rewritten || rewritten.text === query) return NO_REPAIR;
  return {
    hits: rankTilesAll(rewritten.text, tiles, audience)
      .map((r) => ({ tileId: r.tileId, why: 'token-edit-distance', score: r.score })),
    rewrote: rewritten.target,
  };
}

// The ranked view both resolvers share: pass-2 scoring, with the D5 typo
// repair allowed to LEAD only when the unrepaired reading is weak (no
// exact-phrase-strength hit) and one of two wins holds:
//   - whole-point win: the repair beats the literal reading by at least a
//     name-token (+3) margin - it unlocked name/phrase-strength evidence;
//   - rare-repair win: the repair strictly beats the literal reading AND the
//     token it rewrote INTO is rare (idf >= RARE_REPAIR_IDF). Rarity is the
//     tell that the typo really was that term: "heprin" -> "heparin" (idf
//     ~0.77) clears it, while a corruption like "wean" -> "mean" (idf ~0.54,
//     a corpus-wide word) is rejected, and the literal reading's own IDF
//     bonus defends it in the strict comparison besides.
// A query whose literal reading already ranks well never pays for the
// repair at all.
const RARE_REPAIR_IDF = 0.6;

function rankWithRepair(queryRaw, tiles, audience) {
  const ranked = rankTilesAll(queryRaw, tiles, audience);
  const topScore = ranked.length ? ranked[0].score : 0;
  if (topScore >= RANKER_RUBRIC.exactPhraseInName) return ranked;
  const { hits, rewrote } = tokenEditFallback(queryRaw, tiles, audience);
  if (!hits.length) return ranked;
  const wholePointWin = hits[0].score >= topScore + RANKER_RUBRIC.tokenInName;
  const rareRepairWin = hits[0].score > topScore
    && repairIdf(tileVocabulary(tiles), rewrote) >= RARE_REPAIR_IDF;
  if (wholePointWin || rareRepairWin) return hits.concat(ranked);
  return ranked;
}

export function resolvePrompt(query, tiles, synonyms, audience = 'all') {
  const q = String(query || '').trim();
  if (!q) return null;
  const tileList = Array.isArray(tiles) ? tiles : [];
  const tileById = new Map();
  for (const t of tileList) if (t && t.id) tileById.set(t.id, t);

  // Pass 1: synonym table.
  const syn = matchSynonym(q, synonyms, audience);
  if (syn && tileById.has(syn.tile)) {
    return { tileId: syn.tile, why: 'synonym', phrase: syn.phrase };
  }

  // Pass 2: token ranker, with the D5 typo repair allowed to lead when the
  // literal reading is weak (see rankWithRepair).
  const ranked = rankWithRepair(q, tileList, audience);
  const strong = ranked.length && ranked[0].score >= RANKER_RUBRIC.exactPhraseInName;
  if (strong && tileById.has(ranked[0].tileId)) {
    return { tileId: ranked[0].tileId, why: ranked[0].why };
  }

  // Pass 3: single-edit-distance synonym retry. Runs BEFORE accepting a
  // weak ranker reading: the corpus-enriched ranker almost never returns
  // zero results, so a zero-results-only gate would starve this pass
  // entirely ("heprin drip" surfaced only generic drip tiles). A rewrite
  // that lands on a hand-curated synonym phrase is stronger intent evidence
  // than a weak token match.
  const fallback = synonymEditFallback(q, synonyms, audience);
  if (fallback && tileById.has(fallback.tileId)) return fallback;

  if (ranked.length && tileById.has(ranked[0].tileId)) {
    return { tileId: ranked[0].tileId, why: ranked[0].why };
  }

  return null;
}

// Ranked, top-N variant of resolvePrompt for callers that want a list rather
// than a single route (spec plain-language-search task 3.5): the answer-card
// and MCP find_calculator surfaces. Same three signals in the same precedence
// as resolvePrompt -- a synonym hit leads, then the token ranker's ordered
// results, then a single-edit typo recovery when nothing else matched -- but it
// returns up to `limit` distinct existing tiles, each with a `why` tag (and
// `phrase` for synonym / typo hits). resolvePrompt is exactly this list's head.
export function resolvePromptRanked(query, tiles, synonyms, audience = 'all', limit = 5) {
  const q = String(query || '').trim();
  if (!q) return [];
  const tileList = Array.isArray(tiles) ? tiles : [];
  const tileById = new Map();
  for (const t of tileList) if (t && t.id) tileById.set(t.id, t);

  const out = [];
  const seen = new Set();
  const push = (hit) => {
    if (!hit || !tileById.has(hit.tileId) || seen.has(hit.tileId)) return;
    seen.add(hit.tileId);
    out.push(hit);
  };

  // Pass 1: synonym table leads.
  const syn = matchSynonym(q, synonyms, audience);
  if (syn) push({ tileId: syn.tile, why: 'synonym', phrase: syn.phrase });

  // Pass 2 + 3, same precedence as resolvePrompt: a strong literal/repaired
  // reading leads; otherwise a single-edit synonym rescue (hand-curated
  // intent) outranks weak token matches, which follow it.
  const ranked = rankWithRepair(q, tileList, audience);
  const strong = ranked.length && ranked[0].score >= RANKER_RUBRIC.exactPhraseInName;
  if (!strong) {
    const fb = synonymEditFallback(q, synonyms, audience);
    if (fb) push(fb);
  }
  for (const r of ranked) {
    if (out.length >= limit) break;
    push({ tileId: r.tileId, why: r.why, score: r.score });
  }

  return out.slice(0, limit);
}

// Exported for tests; do not depend on the exact rubric values
// from app code.
export const _testing = { rankTiles, rankTilesAll, rankWithRepair, withinOneEdit, synonymEditFallback, tokenEditFallback, RANKER_RUBRIC };
