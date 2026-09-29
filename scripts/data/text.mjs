// scripts/data/text.mjs -- spec-v1621 §2.
//
// Decoding and tabular parsing for federal files. CMS ships CSVs with quoted
// multi-line cells (the AMA notice on the MUE file, the "HCPCS/\nCPT Code"
// header), CRLF line ends, and preambles of varying length; IPPS tables are
// tab-delimited Windows-1252. Node built-ins only.

// decode(bytes, 'utf8' | 'latin1') -> string. 'latin1' is read as
// Windows-1252, which is what CMS means by it (curly quotes live in 0x80-0x9F).
export function decode(bytes, encoding = 'utf8') {
  const label = encoding === 'latin1' ? 'windows-1252' : 'utf-8';
  const text = new TextDecoder(label).decode(bytes);
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

// parseCsv(text, delimiter = ',') -> string[][]. RFC 4180: a quoted cell may
// hold the delimiter, a doubled quote, or a line break. Blank lines are kept as
// [''] so a caller counting preamble rows sees them.
export function parseCsv(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false;
      } else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === delimiter) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// splitTsv(text) -> string[][]. Tab-delimited with no quoting (the IPPS and
// NCCI files quote only a title line, which callers skip as preamble).
export function splitTsv(text) {
  return text.split(/\r?\n/).filter((l, i, a) => !(i === a.length - 1 && l === '')).map((l) => l.split('\t'));
}

// skipPreamble(rows, isHeader) -> { header, rows } starting after the first
// row the predicate accepts. Throws when no row matches: a file whose header
// moved is a failed parse, not an empty table.
export function skipPreamble(rows, isHeader) {
  const i = rows.findIndex((r) => isHeader(r));
  if (i === -1) throw new Error('text: header row not found');
  return { header: rows[i], rows: rows.slice(i + 1) };
}

// moneyCents('$88.91 ') -> 8891; '.', '' and 'N/A' -> null. Integer cents,
// so a fee is never a float. Throws on anything else that is not a number.
export function moneyCents(value) {
  const s = String(value ?? '').replace(/[$,\s]/g, '');
  if (s === '' || s === '.' || /^n\/?a$/i.test(s)) return null;
  const neg = /^\(.*\)$/.test(s) || s.startsWith('-');
  const digits = s.replace(/^[(-]|\)$/g, '');
  if (!/^\d*(\.\d+)?$/.test(digits) || digits === '') throw new Error(`text: not a dollar amount: ${JSON.stringify(value)}`);
  const cents = Math.round(Number(digits) * 100);
  return neg ? -cents : cents;
}

// num('1.30 ') -> 1.3; blank -> null. For RVUs, weights and indicators.
export function num(value) {
  const s = String(value ?? '').trim();
  if (s === '' || s === '.') return null;
  const n = Number(s.replace(/,/g, ''));
  if (!Number.isFinite(n)) throw new Error(`text: not a number: ${JSON.stringify(value)}`);
  return n;
}
