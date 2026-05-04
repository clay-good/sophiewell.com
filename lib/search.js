// Reusable indexed code-search. Used by all twelve Group A utilities.
//
// Build once per dataset; query in constant-ish time for code matches and
// prefix-substring scan over descriptions for phrase matches. Designed to
// return within 100 ms on the bundled seed datasets.

export function buildIndex(records, opts = {}) {
  const codeKey = opts.codeKey || 'code';
  const textKeys = opts.textKeys || ['desc', 'long', 'short', 'name', 'summary'];

  const byCode = new Map();
  const tokens = []; // [{ text, record }]
  for (const r of records) {
    const code = r[codeKey];
    if (code) byCode.set(String(code).toUpperCase(), r);
    const blob = textKeys.map((k) => r[k] || '').join(' ').toLowerCase();
    tokens.push({ blob, record: r });
  }

  return {
    size: records.length,
    byCode,
    tokens,
    search(query, limit = 50) {
      const q = String(query || '').trim();
      if (!q) return [];
      const upper = q.toUpperCase();
      // Exact code hit first.
      const exact = byCode.get(upper);
      const results = exact ? [exact] : [];
      // Prefix code matches.
      if (results.length < limit) {
        for (const [code, rec] of byCode) {
          if (code.startsWith(upper) && rec !== exact) {
            results.push(rec);
            if (results.length >= limit) break;
          }
        }
      }
      // Description matches.
      if (results.length < limit) {
        const lower = q.toLowerCase();
        for (const t of tokens) {
          if (results.includes(t.record)) continue;
          if (t.blob.includes(lower)) {
            results.push(t.record);
            if (results.length >= limit) break;
          }
        }
      }
      return results;
    },
  };
}
