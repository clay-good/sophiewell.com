// A CSV table for a tool's per-row result, the text a reader copies into a spreadsheet. Not a tool of its
// own. Each cell goes through csvValue in lib/upload-intake.js, the one rule for a downloaded cell: quoted
// when it holds a comma, quote or line break, and a leading apostrophe on text a spreadsheet would read as
// a formula (=, +, -, @), so a pasted member reference cannot run as one. true and false read yes and no.

import { csvValue } from './upload-intake.js';

const cell = (v) => (typeof v === 'boolean' ? (v ? 'yes' : 'no') : typeof v === 'number' && !Number.isFinite(v) ? '' : csvValue(v));

// csvText(['member', 'rate'], [['A', 50]]) -> 'member,rate\nA,50'
export function csvText(header, rows) {
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}
