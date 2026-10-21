// Thousands separators in a typed line of comma-separated fields.
//
// A typed claim line splits on commas, so "1,250.00" would read as two fields, 1 and 250.00. An amount written with
// a dollar sign or with cents is plainly one number: unThousand() removes its grouping commas before the line is
// split. Only in a line whose fields are separated by ", " (or tabs) can a comma with no space after it be told apart
// from a field separator; a compact line ("11,125.00") is left as typed. A bare "1,250" also stays as typed.
//
// Pure: no DOM, no clock, no network.

const GROUPED = /(^|[\s,\t])(\$?)(\d{1,3}(?:,\d{3})+)(\.\d{1,4})?(?=$|[\s,\t])/g;

export function unThousand(line) {
  const s = String(line ?? '');
  if (!/,\s|\t/.test(s)) return s;
  return s.replace(GROUPED, (m, pre, dollar, whole, cents) => (dollar || cents ? `${pre}${dollar}${whole.replace(/,/g, '')}${cents || ''}` : m));
}
