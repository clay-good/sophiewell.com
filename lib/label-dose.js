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
// `bandToolAnswer` is the whole of a class tool whose labels are band tables: one choice of drug and
// indication, a dialysis question, one kidney-function number. A tool supplies its rows and labels.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const FLAGS = ['dose', 'no-adjustment', 'not-recommended', 'contraindicated', 'no-recommendation-given'];

export const inBand = (b, v) => (b.from === null || b.from === undefined || v > b.from || (v === b.from && !b.fromExclusive))
  && (b.to === null || b.to === undefined || v < b.to || (v === b.to && !b.toExclusive));

// "above 60 to 90", "30 to 49", "below 10", "50 or more": a band in words, in the label's own bounds.
export function bandName(b) {
  const lo = b.from === null || b.from === undefined; const hi = b.to === null || b.to === undefined;
  if (lo && hi) return 'any value';
  if (!lo && !hi && b.from === b.to) return `exactly ${b.from}`;
  if (lo) return b.toExclusive ? `below ${b.to}` : `${b.to} or below`;
  if (hi) return b.fromExclusive ? `above ${b.from}` : `${b.from} or above`;
  return `${b.fromExclusive ? 'above ' : ''}${b.from} to ${b.toExclusive ? 'below ' : ''}${b.to}`;
}

// findBands(bands, value) -> { rows, between, outside }
export function findBands(bands, value) {
  const rows = bands.filter((b) => inBand(b, value));
  if (rows.length) return { rows, between: false, outside: false };
  // A band whose excluded edge IS the value (">30" at 30) is a neighbor too, not a band further off.
  const below = bands.filter((b) => b.to !== null && b.to !== undefined && (value > b.to || (value === b.to && b.toExclusive))).sort((a, b) => b.to - a.to)[0];
  const above = bands.filter((b) => b.from !== null && b.from !== undefined && (value < b.from || (value === b.from && b.fromExclusive))).sort((a, b) => a.from - b.from)[0];
  if (below && above) return { rows: [below, above], between: true, outside: false };
  return { rows: [], between: false, outside: true };
}

// A sentence for the result: one row, two rows that share an edge, two rows either side of a gap, or none.
export function describeBands(found, value, unit, what = 'the label\'s table') {
  if (found.outside) return `${value} ${unit} is outside every band of ${what}; the label gives no row for it.`;
  if (found.between) return `${value} ${unit} falls between two bands of ${what} as the label prints them: ${bandName(found.rows[0])} and ${bandName(found.rows[1])}. Both rows are shown.`;
  if (found.rows.length > 1) return `${value} ${unit} is on the edge shared by two bands of ${what}: ${found.rows.map(bandName).join(' and ')}. Both rows are shown.`;
  return `${value} ${unit} is in the band ${bandName(found.rows[0])}.`;
}

// The most cautious flag among the rows shown, for the result's status.
export function worstFlag(rows) {
  const order = ['contraindicated', 'not-recommended', 'no-recommendation-given', 'dose', 'no-adjustment'];
  return order.find((f) => rows.some((r) => r.flag === f)) || 'dose';
}

export const DIALYSIS = [
  { value: 'none', text: 'Not on dialysis' },
  { value: 'hd', text: 'Hemodialysis' },
  { value: 'pd', text: 'Peritoneal dialysis' },
];
const SHORT = { dose: 'Dose given', 'no-adjustment': 'No adjustment', 'not-recommended': 'Not recommended', contraindicated: 'Contraindicated', 'no-recommendation-given': 'No row given' };
const bare = (t) => t.replace(/\.$/, '');

// cfg: { regimens, labels, note, notesFor(reg, dialysis) }
//   regimens: [{ value, drug, text, bands, hd, pd, anyValue }]; `hd` and `pd` are { text, flag } lines,
//     absent when the label has none; `anyValue` marks a label with one row at every kidney function.
//   labels: { [drug]: { brand, setId, unit, measure } }
// input: { regimen, dialysis, kidney }
export function bandToolAnswer(cfg, input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = cfg.regimens.find((r) => r.value === String(o.regimen ?? '').trim());
  if (!reg) return { valid: false, message: 'Choose the drug and indication. Each label gives its own table.' };
  const L = cfg.labels[reg.drug];
  const dialysis = String(o.dialysis ?? '').trim();
  if (!DIALYSIS.some((d) => d.value === dialysis)) return { valid: false, message: 'Say whether the patient is on dialysis: these labels have their own lines for it.' };
  let value = null;
  if (dialysis === 'none' && !reg.anyValue) {
    const f = inputFault([[`the ${L.measure}`, o.kidney, 0, 250, L.unit]]);
    if (f) return { valid: false, message: `${f} The ${L.brand} label's table is by ${L.measure} in ${L.unit}.` };
    value = Number(o.kidney);
  }
  const row = labelRow(L.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, regimen: reg.value, band: `The ${L.brand} label's rows are withheld, so no dose is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: cfg.note };
  }
  const notes = [];
  const none = (band, extra = []) => ({ valid: true, regimen: reg.value, drug: reg.drug, flag: 'no-recommendation-given', abnormal: true, band, bandLabel: SHORT['no-recommendation-given'], notes: [...extra, ...notes, `Label: ${row.edition}.`], note: cfg.note });
  let rows; let band;
  if (dialysis !== 'none') {
    const line = dialysis === 'hd' ? reg.hd : reg.pd;
    const word = dialysis === 'hd' ? 'hemodialysis' : 'peritoneal dialysis';
    if (!line) return none(`The ${L.brand} label's table has no line for ${word}.`, reg.hd && dialysis === 'pd' ? [`Its hemodialysis line reads: ${bare(reg.hd.text)}.`] : []);
    rows = [line];
    band = `The ${L.brand} label, for ${word}: ${bare(line.text)}.`;
  } else if (reg.anyValue) {
    rows = reg.bands;
    band = `The ${L.brand} label gives ${bare(reg.bands[0].text)}.`;
  } else {
    const found = findBands(reg.bands, value);
    rows = found.rows;
    notes.push(describeBands(found, value, L.unit, `the ${L.brand} label's table`));
    if (found.outside) return none(`The ${L.brand} label's table gives no row for a ${L.measure} of ${value} ${L.unit}.`);
    const plain = rows[0].flag === 'dose' || rows[0].flag === 'no-adjustment';
    band = rows.length > 1
      ? `The ${L.brand} label gives two rows here: ${rows.map((r) => bare(r.text)).join('; or ')}.`
      : plain ? `The ${L.brand} label gives ${bare(rows[0].text)}.`
        : `The ${L.brand} label's row here reads: ${bare(rows[0].text)}.`;
  }
  if (cfg.notesFor) notes.push(...cfg.notesFor(reg, dialysis));
  const flag = worstFlag(rows);
  return {
    valid: true, regimen: reg.value, drug: reg.drug, flag, rows: rows.map((r) => r.text), abnormal: flag !== 'dose' && flag !== 'no-adjustment',
    band, bandLabel: SHORT[flag],
    notes: [...notes, `Label: ${row.edition}.`], note: cfg.note,
  };
}
