// spec-v1632 section 0: the one engine behind the label dose-check tools. A label prints a table of
// bands (a creatinine clearance, an eGFR, a weight) and a row of text for each; this finds the row or
// rows a value falls in and says honestly when the table does not cover it.
//
// A band is { from, to, fromExclusive, toExclusive, text, flag }. `from` and `to` are the numbers the
// label prints, null when the band is open at that end, and each end is inclusive unless the label
// says otherwise (">60" is { from: 60, fromExclusive: true }; "<10" is { to: 10, toExclusive: true }).
// Labels are not consistent, and the engine does not smooth them over:
//   - bands that share an edge ("25 to 50" then "10 to 25"): a value on the edge is in both, and both
//     rows are returned;
//   - bands printed in whole numbers ("30-49" then "10-29"): 29.5 is in neither, and the two rows
//     either side are returned with `between: true`;
//   - a value outside every band: no row, `outside: true`.
// `flag` is one of FLAGS; the caller reports the text and never falls back to a nearest band.
//
// Pure: no DOM, no clock, no network.

export const FLAGS = ['dose', 'no-adjustment', 'not-recommended', 'contraindicated', 'no-recommendation-given'];

export const inBand = (b, v) => (b.from === null || b.from === undefined || v > b.from || (v === b.from && !b.fromExclusive))
  && (b.to === null || b.to === undefined || v < b.to || (v === b.to && !b.toExclusive));

// "above 60 to 90", "30 to 49", "below 10", "50 or more": a band in words, in the label's own bounds.
export function bandName(b) {
  const lo = b.from === null || b.from === undefined; const hi = b.to === null || b.to === undefined;
  if (lo && hi) return 'any value';
  if (lo) return b.toExclusive ? `below ${b.to}` : `${b.to} or below`;
  if (hi) return b.fromExclusive ? `above ${b.from}` : `${b.from} or above`;
  return `${b.fromExclusive ? 'above ' : ''}${b.from} to ${b.toExclusive ? 'below ' : ''}${b.to}`;
}

// findBands(bands, value) -> { rows, between, outside }
export function findBands(bands, value) {
  const rows = bands.filter((b) => inBand(b, value));
  if (rows.length) return { rows, between: false, outside: false };
  const below = bands.filter((b) => b.to !== null && b.to !== undefined && value > b.to).sort((a, b) => b.to - a.to)[0];
  const above = bands.filter((b) => b.from !== null && b.from !== undefined && value < b.from).sort((a, b) => a.from - b.from)[0];
  if (below && above) return { rows: [below, above], between: true, outside: false };
  return { rows: [], between: false, outside: true };
}

// A sentence for the result: one row, two rows that share an edge, two rows either side of a gap, or none.
export function describeBands(found, value, unit, what = 'the label\'s table') {
  if (found.outside) return `${value} ${unit} is outside every band of ${what}; the label gives no row for it.`;
  if (found.between) return `${value} ${unit} falls between two bands of ${what}, which are printed in whole numbers: ${bandName(found.rows[0])} and ${bandName(found.rows[1])}. Both rows are shown.`;
  if (found.rows.length > 1) return `${value} ${unit} is on the edge shared by two bands of ${what}: ${found.rows.map(bandName).join(' and ')}. Both rows are shown.`;
  return `${value} ${unit} is in the band ${bandName(found.rows[0])}.`;
}

// The most cautious flag among the rows shown, for the result's status.
export function worstFlag(rows) {
  const order = ['contraindicated', 'not-recommended', 'no-recommendation-given', 'dose', 'no-adjustment'];
  return order.find((f) => rows.some((r) => r.flag === f)) || 'dose';
}
