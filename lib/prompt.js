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
function stemToken(t) {
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
  const scored = [];
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i];
    if (!tile || !tile.id || !tile.name) continue;
    const doc = buildSearchDoc(tile);
    let score = 0;
    if (doc.name.includes(query)) score += RANKER_RUBRIC.exactPhraseInName;
    if (doc.desc && doc.desc.includes(query)) score += RANKER_RUBRIC.exactPhraseInDesc;
    for (const t of tokens) {
      if (!t) continue;
      if (doc.nameTokens.includes(t)) score += RANKER_RUBRIC.tokenInName;
      if (doc.descTokens.includes(t)) score += RANKER_RUBRIC.tokenInDesc;
      if (doc.audienceTokens.includes(t) || doc.tagTokens.includes(t) || doc.specialtyTokens.includes(t)) {
        score += RANKER_RUBRIC.tokenInAudienceOrTag;
      }
    }
    if (audience && audience !== 'all') {
      if (doc.audiences.includes(audience)) score += RANKER_RUBRIC.audienceAligned;
      else if (doc.audiences.length) score += RANKER_RUBRIC.audienceMisaligned;
    }
    if (score >= RANKER_RUBRIC.threshold) {
      scored.push({ tileId: tile.id, score, why: 'name-token-match', order: i });
    }
  }
  // Descending score; stable on ties by original UTILITIES order.
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

  // Pass 2: token ranker.
  const ranked = rankTiles(q, tileList, audience);
  if (ranked && tileById.has(ranked.tileId)) {
    return { tileId: ranked.tileId, why: ranked.why };
  }

  // Pass 3: single-edit-distance synonym retry.
  const fallback = synonymEditFallback(q, synonyms, audience);
  if (fallback && tileById.has(fallback.tileId)) return fallback;

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

  // Pass 2: token ranker, in score order.
  for (const r of rankTilesAll(q, tileList, audience)) {
    if (out.length >= limit) break;
    push({ tileId: r.tileId, why: r.why, score: r.score });
  }

  // Pass 3: single-edit synonym retry, only when nothing matched.
  if (out.length === 0) {
    const fb = synonymEditFallback(q, synonyms, audience);
    if (fb) push(fb);
  }

  return out.slice(0, limit);
}

// Exported for tests; do not depend on the exact rubric values
// from app code.
export const _testing = { rankTiles, rankTilesAll, withinOneEdit, synonymEditFallback, RANKER_RUBRIC };
