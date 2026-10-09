// A quote-aware CSV reader for the CMS reference files the reader supplies (spec-v1614 §6): their preambles and
// header cells hold commas and line breaks inside quotes, and their rows are not all the same width, which the
// upload intake's parseDelimited refuses. Pure.

export function rowsOf(text) {
  const out = []; let row = []; let v = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { v += '"'; i++; } else if (c === '"') q = false; else v += c; continue; }
    if (c === '"') q = true;
    else if (c === ',') { row.push(v); v = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(v); out.push(row); row = []; v = ''; }
    else v += c;
  }
  if (v || row.length) { row.push(v); out.push(row); }
  return out;
}
