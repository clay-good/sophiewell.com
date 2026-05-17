// spec-v8 §4.3: the front-door prompt resolver. Pure-function,
// no DOM, no fetch, no AI. Consumes a query, the UTILITIES list
// (each tile carrying `name`, `desc`, `audiences`, `group`, and
// optional `tags`), the synonym table, and the active audience
// chip, and returns the routed tile id with a short `why` tag for
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

function tokenize(s) {
  return normalizePhrase(s).split(/\s+/).filter(Boolean);
}

function buildSearchDoc(tile) {
  const audiences = Array.isArray(tile.audiences) ? tile.audiences : [];
  const tags = Array.isArray(tile.tags) ? tile.tags : [];
  return {
    name: normalizePhrase(tile.name),
    desc: normalizePhrase(tile.desc || ''),
    nameTokens: tokenize(tile.name),
    descTokens: tokenize(tile.desc || ''),
    audienceTokens: audiences.map((a) => normalizePhrase(a)),
    tagTokens: tags.map((t) => normalizePhrase(t)),
    audiences,
  };
}

function rankTiles(queryRaw, tiles, audience) {
  const query = normalizePhrase(queryRaw);
  if (!query) return null;
  const tokens = query.split(/\s+/).filter(Boolean);
  let best = null;
  let bestScore = -Infinity;
  for (const tile of tiles) {
    if (!tile || !tile.id || !tile.name) continue;
    const doc = buildSearchDoc(tile);
    let score = 0;
    if (doc.name.includes(query)) score += RANKER_RUBRIC.exactPhraseInName;
    if (doc.desc && doc.desc.includes(query)) score += RANKER_RUBRIC.exactPhraseInDesc;
    for (const t of tokens) {
      if (!t) continue;
      if (doc.nameTokens.includes(t)) score += RANKER_RUBRIC.tokenInName;
      if (doc.descTokens.includes(t)) score += RANKER_RUBRIC.tokenInDesc;
      if (doc.audienceTokens.includes(t) || doc.tagTokens.includes(t)) {
        score += RANKER_RUBRIC.tokenInAudienceOrTag;
      }
    }
    if (audience && audience !== 'all') {
      if (doc.audiences.includes(audience)) score += RANKER_RUBRIC.audienceAligned;
      else if (doc.audiences.length) score += RANKER_RUBRIC.audienceMisaligned;
    }
    if (score > bestScore) {
      bestScore = score;
      best = { tileId: tile.id, score, why: 'name-token-match' };
    }
  }
  if (!best || best.score < RANKER_RUBRIC.threshold) return null;
  return best;
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

// Exported for tests; do not depend on the exact rubric values
// from app code.
export const _testing = { rankTiles, withinOneEdit, synonymEditFallback, RANKER_RUBRIC };
