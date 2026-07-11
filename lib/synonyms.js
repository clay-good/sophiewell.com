// spec-v7 section 3.2: synonym-routed prompt bar.
//
// Pure-function synonym matcher. Maps a typed patient phrase to a tile id
// against the hand-curated table in `data/synonyms.json`. The matcher does
// no AI inference, no fuzzy distance metric, no probability ranking; it is
// a deterministic lookup with two normalization passes (case + whitespace
// + punctuation), prefix containment, and an audience-aware reorder.
//
// Renderer code calls `loadSynonyms()` once at boot, then `matchSynonym(q,
// entries, audience)` per keystroke. Tests import `matchSynonym` directly
// with a fixture entry list and never touch the network.
//
// The matcher returns null on no-match, or
//   { tile, phrase, entry } on a match,
// where `phrase` is the exact synonym row that matched (used by app.js to
// render the "matched: '<phrase>'" breadcrumb).

import { fetchJson } from './data.js';

export function normalizePhrase(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Match a query against a list of synonym entries.
// Returns the best match { tile, phrase, entry } or null.
//
// Matching rules, in priority order:
//   1. exact normalized equality of the query and a phrase: highest score.
//   2. the query is contained as a whole-word substring of a phrase: medium.
//      Ties broken by phrase length, shorter first: the tightest phrase
//      around the typed query is the most specific reading of it.
//   3. a phrase is contained as a whole-word substring of the query: low.
//      Ties broken by phrase length, LONGER first: when a query names two
//      intents ("anticoagulation bleeding risk atrial fibrillation"), the
//      phrase covering more of the query is the dominant one - the bleeding
//      question, not the incidental "atrial fibrillation".
// Within a tier, an entry whose audience matches the active chip ranks
// above one that does not.
export function matchSynonym(query, entries, audience = 'all') {
  const q = normalizePhrase(query);
  if (!q) return null;
  const list = Array.isArray(entries) ? entries : [];
  let best = null;
  let bestScore = -1;
  for (const entry of list) {
    const phrases = Array.isArray(entry && entry.phrases) ? entry.phrases : [];
    for (const raw of phrases) {
      const p = normalizePhrase(raw);
      if (!p) continue;
      let score = 0;
      let coverage = false;
      if (p === q) score = 1000;
      else if (containsWord(p, q)) score = 500;
      else if (containsWord(q, p)) { score = 250; coverage = true; }
      else continue;
      if (audience !== 'all' && entry.audience === audience) score += 50;
      else if (audience !== 'all' && entry.audience && entry.audience !== audience) score -= 25;
      // Tier 2: shorter phrases fit the typed query more tightly.
      // Tier 3: longer phrases cover more of the typed query.
      const len = Math.min(p.length, 99) * 0.01;
      score += coverage ? len : -len;
      if (score > bestScore) {
        bestScore = score;
        best = { tile: entry.tile, phrase: raw, entry };
      }
    }
  }
  return best;
}

function containsWord(haystack, needle) {
  if (!needle) return false;
  if (haystack === needle) return true;
  // word-boundary check: needle must sit between start/whitespace on both sides
  const idx = haystack.indexOf(needle);
  if (idx < 0) return false;
  const before = idx === 0 || haystack[idx - 1] === ' ';
  const after = idx + needle.length === haystack.length || haystack[idx + needle.length] === ' ';
  return before && after;
}

// Browser-only: fetch and cache the synonyms table.
export async function loadSynonyms() {
  const data = await fetchJson('data/synonyms.json');
  return Array.isArray(data && data.entries) ? data.entries : [];
}
