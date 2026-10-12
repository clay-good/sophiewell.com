// spec-v1635 tool 11: filgrastim and pegfilgrastim timing against chemotherapy, as the reference
// labels state it.
//
// Sources, re-read October 11, 2026:
//   NEUPOGEN (filgrastim) label, Amgen, DailyMed set id 97cc73cc-..., version 166, section 2.1:
//     "Administer NEUPOGEN at least 24 hours after chemotherapy. Do not administer NEUPOGEN within
//      the 24-hour period prior to chemotherapy".
//   Neulasta (pegfilgrastim) label, Amgen, set id fdfe5d72-..., version 160, section 2.1 and Table 1:
//     "for adults of any weight and pediatric patients weighing at least 45 kg ... a single
//      subcutaneous injection of 6 mg administered once per chemotherapy cycle"; "Do not administer
//      Neulasta between 14 days before and 24 hours after administration of chemotherapy."
//     Table 1, pediatric patients under 45 kg: less than 10 kg 0.1 mg/kg (0.01 mL/kg); 10 kg to 20 kg
//      1.5 mg (0.15 mL); 21 kg to 30 kg 2.5 mg (0.25 mL); 31 kg to 44 kg 4 mg (0.4 mL).
// The table's bands are whole kilograms and leave 20 to 21, 30 to 31 and 44 to 45 kg unstated; a
// weight in a gap returns both neighboring rows. An adult under 45 kg gets 6 mg, not the table.
// Biosimilar labels are expected to carry the same timing; the reference labels are the ones read.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  filgrastim: { name: 'NEUPOGEN', setId: '97cc73cc-b5b7-458a-a933-77b00523e193' },
  pegfilgrastim: { name: 'Neulasta', setId: 'fdfe5d72-6b80-435a-afa4-c5d74dd852ce' },
};
export const PRODUCTS = [
  { value: 'filgrastim', text: 'Filgrastim (NEUPOGEN label)' },
  { value: 'pegfilgrastim', text: 'Pegfilgrastim (Neulasta label)' },
];
export const POPULATIONS = [
  { value: 'adult', text: 'Adult' },
  { value: 'child', text: 'Pediatric patient' },
];
const NOTE = 'The timing rule of the reference label, tested against the times entered. It does not say whether a growth factor is indicated, and a biosimilar\'s own label governs that product.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const HOUR = 3600000; const DAY = 24 * HOUR;

// 'YYYY-MM-DDTHH:MM' (a datetime-local value) -> a wall-clock instant, or null.
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const clock = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const span = (ms) => { const min = Math.round(Math.abs(ms) / 60000); const d = Math.floor(min / 1440); const h = Math.floor((min % 1440) / 60); return `${d ? `${d} d ` : ''}${h} h${min % 60 ? ` ${min % 60} min` : ''}`; };

const ROWS = [
  { text: '10 kg to 20 kg: 1.5 mg (0.15 mL)', lo: 10, hi: 20, mg: 1.5 },
  { text: '21 kg to 30 kg: 2.5 mg (0.25 mL)', lo: 21, hi: 30, mg: 2.5 },
  { text: '31 kg to 44 kg: 4 mg (0.4 mL)', lo: 31, hi: 44, mg: 4 },
];
// The pegfilgrastim dose line for a population and weight: { mg (or null in a table gap), text }.
function pegDose(population, kg) {
  if (population === 'adult') return { mg: 6, text: `Dose: 6 mg once per chemotherapy cycle. The label gives 6 mg for adults of any weight${kg !== null && kg < 45 ? '; the weight table is for pediatric patients only' : ''}.` };
  if (kg >= 45) return { mg: 6, text: 'Dose: 6 mg once per chemotherapy cycle (pediatric patients weighing at least 45 kg).' };
  if (kg < 10) return { mg: Number((0.1 * kg).toFixed(2)), text: `Dose: 0.1 mg/kg × ${kg} kg = ${Number((0.1 * kg).toFixed(2))} mg (${Number((0.01 * kg).toFixed(3))} mL), the label's row for pediatric patients under 10 kg.` };
  const row = ROWS.find((r) => kg >= r.lo && kg <= r.hi);
  if (row) return { mg: row.mg, text: `Dose: the label's row ${row.text}.` };
  const below = [...ROWS].reverse().find((r) => r.hi < kg); const above = ROWS.find((r) => r.lo > kg);
  return { mg: null, text: `Dose: ${kg} kg falls between the label table's whole-kilogram rows, which leave it unstated. The neighboring rows are ${below.text} and ${above ? above.text : '45 kg or more: 6 mg'}. No dose is assigned here.` };
}

export function gcsfTimingCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const product = PRODUCTS.find((p) => p.value === String(o.product ?? '').trim());
  if (!product) return { valid: false, message: 'Choose the product: filgrastim or pegfilgrastim. Their timing rules differ.' };
  const peg = product.value === 'pegfilgrastim';
  const when = {};
  for (const [key, label, required] of [['chemoEnd', 'when this cycle\'s chemotherapy was last given', true], ['planned', 'the planned growth-factor date and time', true], ['nextChemo', 'the start of the next cycle\'s chemotherapy', false]]) {
    if (blank(o[key])) {
      if (required) return { valid: false, message: `Enter ${label} (YYYY-MM-DDTHH:MM).` };
      when[key] = null; continue;
    }
    when[key] = parseWhen(o[key]);
    if (when[key] === null) return { valid: false, message: `Enter ${label} as a date and time (YYYY-MM-DDTHH:MM).` };
  }
  const { chemoEnd, planned, nextChemo } = when;
  if (nextChemo !== null && nextChemo <= chemoEnd) return { valid: false, message: 'The next cycle\'s chemotherapy must be after this cycle\'s.' };
  let population = null; let kg = null;
  if (peg) {
    population = POPULATIONS.find((p) => p.value === String(o.population ?? '').trim())?.value ?? null;
    if (!population) return { valid: false, message: 'Choose adult or pediatric patient: the pegfilgrastim label doses a child under 45 kg by a weight table and an adult of any weight at 6 mg.' };
    if (population === 'child' || !blank(o.weight)) {
      const wf = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
      if (wf) return { valid: false, message: wf };
      kg = Number(o.weight);
    }
  }
  const L = LABELS[product.value];
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label figures are withheld: ${lr.why}. Read the timing from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const earliest = chemoEnd + DAY;
  const latest = nextChemo === null ? null : nextChemo - (peg ? 14 * DAY : DAY);
  const name = peg ? 'Pegfilgrastim' : 'Filgrastim';
  const before = peg ? '14 days' : '24 hours';
  const notes = [];
  let flag; let band; let label;
  const noWindow = latest !== null && latest < earliest;
  if (planned < earliest) {
    flag = 'too-soon-after'; label = 'Not allowed';
    band = `Not allowed by the label: ${clock(planned)} is ${span(planned - chemoEnd)} after chemotherapy${planned < chemoEnd ? ' (before it)' : ''}, and the label says ${peg ? 'not until 24 hours after' : 'at least 24 hours after'}. Earliest: ${clock(earliest)}.`;
    if (planned < chemoEnd) band = `Not allowed by the label: ${clock(planned)} is before this cycle's chemotherapy. Earliest: ${clock(earliest)}, 24 hours after it.`;
  } else if (latest !== null && planned > latest) {
    flag = 'too-close-to-next'; label = 'Not allowed';
    band = `Not allowed by the label: ${clock(planned)} is ${planned >= nextChemo ? 'at or after' : `${span(nextChemo - planned)} before`} the next chemotherapy, inside the ${before} before it. ${noWindow ? 'This cycle leaves no allowed time at all.' : `Allowed from ${clock(earliest)} to ${clock(latest)}.`}`;
  } else if (latest === null) {
    flag = 'allowed-next-cycle-not-entered'; label = 'After-chemotherapy rule met';
    band = `${clock(planned)} is ${span(planned - chemoEnd)} after chemotherapy, which meets the 24-hour rule. The rule about the ${before} before the next chemotherapy was not tested: no next cycle was entered.`;
  } else {
    flag = 'allowed'; label = 'Allowed';
    band = `Allowed by the label: ${clock(planned)} is ${span(planned - chemoEnd)} after chemotherapy and ${span(nextChemo - planned)} before the next. Window: ${clock(earliest)} to ${clock(latest)}.`;
  }
  notes.push(peg
    ? 'Label rule: do not administer between 14 days before and 24 hours after administration of chemotherapy.'
    : 'Label rule: administer at least 24 hours after chemotherapy, and do not administer within the 24-hour period before chemotherapy.');
  notes.push(`Earliest allowed time: ${clock(earliest)} (24 hours after ${clock(chemoEnd)}).`);
  if (latest !== null) {
    const cycle = nextChemo - chemoEnd;
    if (noWindow) notes.push(`The next chemotherapy is ${span(cycle)} after this one. With 24 hours after and ${before} before, no time between the two is allowed${peg ? ': a cycle needs more than 15 days between chemotherapy administrations to leave any, so weekly and 14-day regimens leave none' : ''}.`);
    else notes.push(`Latest allowed time before the next cycle: ${clock(latest)} (${before} before ${clock(nextChemo)}).`);
  }
  let doseMg;
  if (peg) { const d = pegDose(population, kg); doseMg = d.mg; notes.push(d.text); }
  else notes.push('Filgrastim is given daily; each dose is tested the same way. This checks one planned time.');
  notes.push('Times are read as written; a daylight-saving change in between is not adjusted for.');
  notes.push(`Label: ${lr.edition}. Biosimilar labels are expected to carry the same timing; this reads the reference label.`);
  const out = { valid: true, flag, abnormal: flag !== 'allowed' || (peg && doseMg === null), labelUrl: lr.url, allowed: flag === 'allowed' ? true : flag === 'allowed-next-cycle-not-entered' ? null : false, earliest: clock(earliest), latest: latest === null ? null : clock(latest), windowExists: latest === null ? null : !noWindow, band: `${name}: ${band.charAt(0).toLowerCase()}${band.slice(1)}`, bandLabel: label, notes, note: NOTE };
  if (peg) out.doseMg = doseMg;
  return out;
}
