// plain-language-search: shared helper for the search corpus
// (data/search-corpus/corpus.json, built by scripts/build-search-corpus.mjs).
// Pure and host-free so both the browser prompt bar (app.js) and the MCP server
// (mcp/tools.js) rank over identical per-tile text. No DOM, no fetch, no fs.
//
// corpusDesc flattens a corpus row's natural-language prose fields -- adapter
// summary, interpretation-band text, tool-copy what/when, example sentence --
// into a single string for the token ranker's `desc` channel, which scores
// below name/specialty weight. A term that appears only in a tile's summary or
// bands (not its name) then still matches.

export function corpusDesc(row) {
  if (!row || typeof row !== 'object') return '';
  return [
    row.summary,
    Array.isArray(row.bands) ? row.bands.join(' ') : '',
    row.what,
    row.when,
    row.expected,
  ].filter(Boolean).join(' ');
}

// corpusOneLiner returns a short, human-readable description for the answer card
// -- the hand-authored `what` line if present, else the first sentence of the
// adapter summary -- trimmed to a single line. Empty string when the row has no
// prose (the card then shows just the name + breadcrumb).
// Index of the first sentence-ending period that is not inside a bracket and
// not an author initial, or -1. Bounded by `max` -- past that the clamp below
// takes over anyway.
function firstSentenceEnd(text, max) {
  let depth = 0;
  for (let i = 0; i < text.length - 1 && i < max; i += 1) {
    const c = text[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
    else if (c === '.' && depth === 0 && text[i + 1] === ' ') {
      // "J. Smith", "et al. 1987" -- a single capital or a known abbreviation
      // before the period is an initial, not a sentence end.
      const before = text.slice(0, i);
      if (/(^|[\s(])[A-Z]$/.test(before)) continue;
      if (/\b(al|e\.g|i\.e|vs|approx|no)$/i.test(before)) continue;
      return i;
    }
  }
  return -1;
}

export function corpusOneLiner(row, max = 120) {
  if (!row || typeof row !== 'object') return '';
  let s = row.what || row.summary || row.expected || '';
  if (!s) return '';
  // First sentence, if the summary runs long -- but a sentence does not end
  // inside a bracket. `indexOf('. ')` split "Boey score (Boey J, et al. 1987)"
  // at the author initials and handed back a line with an open parenthesis it
  // never closed; 37 one-liners read that way. Same rule as splitLead() in
  // lib/long-note.js, reimplemented rather than imported: that module pulls in
  // dom.js, and this one is host-free on purpose so the MCP server can use it.
  const dot = firstSentenceEnd(s, max);
  if (dot > 0) s = s.slice(0, dot);
  s = s.trim();
  if (s.length > max) s = clampToPhrase(s, max);
  return s;
}

// Words a clamped line must never end on. Cutting at the last space is not
// enough: it produced "albumin-corrected calcium plus glucose-corrected sodium
// (Katz factor 1.6 and" on the live disambiguation card -- a sentence that
// stops on a conjunction reads as a page that broke, not as a description that
// was shortened.
const DANGLING = new Set([
  'and', 'or', 'but', 'with', 'without', 'plus', 'minus', 'of', 'for', 'from',
  'to', 'by', 'in', 'on', 'at', 'as', 'per', 'the', 'a', 'an', 'is', 'are',
  'was', 'that', 'than', 'then', 'when', 'where', 'which', 'who', 'vs', 'via',
  'over', 'under', 'above', 'below', 'between', 'using', 'into', 'onto',
  'within', 'across', 'after', 'before', 'during', 'about', 'against', 'per-',
]);

// Trim to `max` without ending mid-phrase or inside a bracket.
//
// The bracket half matters as much as the words. "(Katz factor 1.6 and" opens a
// parenthesis it never closes, and a clamp that only scans for a word boundary
// cannot see that -- it needs to track depth, which is the same lesson the
// pre-rendered pages learned when 225 of them shipped an unclosed bracket.
export function clampToPhrase(text, max = 120) {
  let s = String(text || '').trim();
  if (s.length <= max) return s;

  const cut = s.slice(0, max);
  const words = cut.trim().split(/\s+/);

  // Drop a word the clamp split in half FIRST. Doing it after the connective
  // pass below leaves the connective as the new last word and the pass never
  // sees it -- which is how "target rate with" survived a first attempt.
  //
  // Split means the cut has a word character on BOTH sides of it. Testing only
  // the character after the cut threw away a perfectly complete last word every
  // time the cut happened to land on a space: "(absolute or ratio within 48 h),"
  // lost "h)," and then unravelled back through "48" and "within" to an
  // unbalanced "(absolute or ratio".
  const splitAWord = cut.length === max
    && /\S/.test(s[max - 1] || ' ')
    && /\S/.test(s[max] || ' ');
  if (splitAWord && words.length > 1) words.pop();

  // Then back off any trailing connective, however many deep. A token with no
  // letters is NOT dropped -- "48 h" and "1-3" are the end of a real phrase.
  while (words.length > 1) {
    const last = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (!DANGLING.has(last)) break;
    words.pop();
  }

  // Close the brackets LAST, once nothing more will be removed. Doing it on the
  // raw cut was not enough: the cut itself can be balanced -- "(types I-IV)," --
  // and then the trimming above pops the token carrying the ")" and leaves
  // "(types" behind. Three one-liners read that way after the first fix.
  return closeBrackets(words.join(' ').replace(/[,;:([]+$/, '').trim());
}

// Trim a line back to just before the last bracket it leaves open. Returns it
// unchanged when nothing is open, which is the overwhelming majority.
function closeBrackets(text) {
  let depth = 0;
  let lastOpen = -1;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '(' || c === '[') { if (depth === 0) lastOpen = i; depth += 1; }
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
  }
  if (depth === 0 || lastOpen <= 0) return text;
  return text.slice(0, lastOpen).replace(/[\s,;:]+$/, '').trim();
}
