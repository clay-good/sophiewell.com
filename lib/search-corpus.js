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
export function corpusOneLiner(row, max = 120) {
  if (!row || typeof row !== 'object') return '';
  let s = row.what || row.summary || row.expected || '';
  if (!s) return '';
  // First sentence, if the summary runs long.
  const dot = s.indexOf('. ');
  if (dot > 0 && dot < max) s = s.slice(0, dot);
  s = s.trim();
  if (s.length > max) {
    const cut = s.slice(0, max);
    const sp = cut.lastIndexOf(' ');
    s = (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim();
  }
  return s;
}
