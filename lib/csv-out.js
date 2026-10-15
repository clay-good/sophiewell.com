// A CSV table for a tool's per-row result, the text a reader copies into a spreadsheet. Not a tool of its
// own. A cell is quoted when it holds a comma, quote or line break, and a cell a spreadsheet would read as
// a formula (starting =, +, - or @) gets a leading apostrophe, so a pasted member reference cannot run as
// one. Numbers are written as they are.

const FORMULA = /^[=+\-@\t\r]/;
function cell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  let s = String(v);
  if (FORMULA.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// csvText(['member', 'rate'], [['A', 50]]) -> 'member,rate\nA,50'
export function csvText(header, rows) {
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}
