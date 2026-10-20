// spec-v1636 tool 19: surgical prophylaxis, weight-based dose and redose clock.
//
// Source: Bratzler DW et al. Clinical practice guidelines for antimicrobial prophylaxis in surgery. Am J Health Syst
// Pharm. 2013;70:195-283, Table 1, read cell by cell on October 18, 2026 in the copy ASHP hosts (saved by the owner;
// every row matched this spec's table, and the footnote markers were placed from the rendered page). Footnotes:
// b, the pediatric dose should not exceed the usual adult dose (the text excepts aminoglycosides); c, NA redosing
// intervals rest on typical case length and redosing may be needed in unusually long procedures; d, cefotaxime: label
// 1 g, experts recommend 2 g for obese patients; e, ceftriaxone: as a single dose with metronidazole for colorectal
// procedures; g, gentamicin: one preoperative dose on actual weight, or DW = IBW + 0.4(actual - IBW) when actual is
// more than 20% above IBW. Timing, from the text: start within 60 minutes before incision, 120 minutes for vancomycin
// and fluoroquinolones; the redosing interval runs from the start of the preoperative dose.
// The guideline gives no ideal-weight formula, so the reader enters IBW for gentamicin. The oral colorectal agents are
// not included.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// The component a pediatric mg/kg refers to, and its amount in the adult dose.
const COMPONENT = {
  'ampicillin-sulbactam': { name: 'ampicillin', mg: 2000 },
  'piperacillin-tazobactam': { name: 'piperacillin', mg: 3000 },
};

// adult: mg fixed, or { perKg }; peds: mg/kg (a number, or [low, high] for a range); redose: hours or null (NA).
const A = [
  ['ampicillin-sulbactam', 'Ampicillin-sulbactam', 3000, 50, 2, 'The pediatric dose is 50 mg/kg of the ampicillin component; the adult 3 g is ampicillin 2 g with sulbactam 1 g.'],
  ['ampicillin', 'Ampicillin', 2000, 50, 2],
  ['aztreonam', 'Aztreonam', 2000, 30, 4],
  ['cefazolin', 'Cefazolin', 'cefazolin', 30, 4],
  ['cefuroxime', 'Cefuroxime', 1500, 50, 4],
  ['cefotaxime', 'Cefotaxime', 1000, 50, 3, 'The label gives 1 g; the guideline notes experts recommend 2 g for obese patients.'],
  ['cefoxitin', 'Cefoxitin', 2000, 40, 2],
  ['cefotetan', 'Cefotetan', 2000, 40, 6],
  ['ceftriaxone', 'Ceftriaxone', 2000, [50, 75], null, 'The table gives ceftriaxone as a single dose with metronidazole for colorectal procedures.'],
  ['ciprofloxacin', 'Ciprofloxacin', 400, 10, null, 'fq'],
  ['clindamycin', 'Clindamycin', 900, 10, 6],
  ['ertapenem', 'Ertapenem', 1000, 15, null],
  ['fluconazole', 'Fluconazole', 400, 6, null],
  ['gentamicin', 'Gentamicin', { perKg: 5 }, 2.5, null, 'A single preoperative dose, on dosing weight.'],
  ['levofloxacin', 'Levofloxacin', 500, 10, null, 'fq'],
  ['metronidazole', 'Metronidazole', 500, 15, null],
  ['moxifloxacin', 'Moxifloxacin', 400, 10, null, 'fq'],
  ['piperacillin-tazobactam', 'Piperacillin-tazobactam', 3375, 'pip', 2],
  ['vancomycin', 'Vancomycin', { perKg: 15 }, 15, null],
];
export const AGENTS = A.map(([value, text]) => ({ value, text }));
export const PATIENTS = [{ value: 'adult', text: 'Adult' }, { value: 'child', text: 'Child' }];
export const PIP_AGES = [{ value: 'infant', text: 'Infant 2 to 9 months' }, { value: 'child', text: 'Child over 9 months' }];
const LONG_WINDOW = new Set(['vancomycin', 'ciprofloxacin', 'levofloxacin', 'moxifloxacin']);
const NOTE = 'Doses and redosing intervals from Table 1 of the 2013 ASHP/IDSA/SIS/SHEA surgical prophylaxis guideline. The redose clock runs from the start of the preoperative dose, not from incision. A check against the order and local protocol, not an order.';

const amt = (mg) => (mg >= 1000 ? `${Math.round(mg) / 1000} g` : `${Math.round(mg * 10) / 10} mg`);
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

export function surgicalProphylaxisRedose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const row = A.find(([k]) => k === String(o.agent ?? '').trim());
  if (!row) return { valid: false, message: 'Choose the antimicrobial.' };
  const pt = String(o.patient ?? '').trim();
  if (pt !== 'adult' && pt !== 'child') return { valid: false, message: 'Choose adult or child.' };
  const fw = inputFault([['the weight', o.weightKg, 0.3, 350, 'kg']]);
  if (fw) return { valid: false, message: fw };
  const [key, name, adult, peds, redose, extra] = row;
  const kg = Number(o.weightKg);
  const notes = [];
  let doseKg = kg;
  if (key === 'gentamicin') {
    const fi = inputFault([['the ideal body weight', o.ibwKg, 0.3, 200, 'kg']]);
    if (fi) return { valid: false, message: `${fi.replace(/\.$/, '')}: gentamicin is dosed on dosing weight.` };
    const ibw = Number(o.ibwKg);
    if (kg > 1.2 * ibw) {
      doseKg = ibw + 0.4 * (kg - ibw);
      notes.push(`Actual weight is more than 20% above ideal, so dosing weight = ${ibw} + 0.4 x (${kg} - ${ibw}) = ${Math.round(doseKg * 10) / 10} kg.`);
    } else notes.push('Actual weight is within 20% of ideal, so actual weight is the dosing weight.');
  }
  const adultMg = adult === 'cefazolin' ? (kg >= 120 ? 3000 : 2000) : typeof adult === 'number' ? adult : adult.perKg * doseKg;
  let doseText;
  let doseMg = null;
  if (pt === 'adult') {
    doseMg = adultMg;
    doseText = typeof adult === 'object' ? `${adult.perKg} mg/kg x ${Math.round(doseKg * 10) / 10} kg = ${amt(doseMg)}` : amt(doseMg);
    if (adult === 'cefazolin') notes.push(kg >= 120 ? 'Cefazolin: 3 g at 120 kg or more.' : 'Cefazolin: 2 g under 120 kg (3 g at 120 kg or more).');
  } else {
    const capped = typeof adult !== 'object'; // the cap applies where the adult dose is a fixed amount
    let perKg = peds;
    if (peds === 'pip') {
      const age = String(o.pipAge ?? '').trim();
      if (age !== 'infant' && age !== 'child') return { valid: false, message: 'Choose the child\'s age band for piperacillin-tazobactam.' };
      if (age === 'child' && kg > 40) return { valid: true, flag: 'no-recommendation-given', abnormal: true, band: `The table's pediatric row for piperacillin-tazobactam stops at 40 kg; it gives no pediatric dose for ${kg} kg. The adult dose is 3.375 g.`, bandLabel: 'No figure given', notes, note: NOTE };
      perKg = age === 'infant' ? 80 : 100;
      notes.push(`${perKg} mg/kg of the piperacillin component (${age === 'infant' ? 'infants 2 to 9 months' : 'children over 9 months and 40 kg or less'}); the table gives nothing for infants under 2 months.`);
    }
    if (key === 'metronidazole' && kg < 1.2) {
      perKg = 7.5;
      notes.push('Neonates weighing under 1,200 g receive a single 7.5 mg/kg dose.');
    }
    // For a combination the pediatric mg/kg is of one component, so the cap is that component's adult amount:
    // ampicillin 2 g of the 3 g ampicillin-sulbactam, piperacillin 3 g of the 3.375 g piperacillin-tazobactam (8:1).
    const component = COMPONENT[key];
    const capMg = component ? component.mg : adultMg;
    const one = (pk) => {
      const raw = pk * doseKg;
      return capped && raw > capMg ? [capMg, true, raw] : [raw, false, raw];
    };
    const capPhrase = component ? `capped at the ${amt(capMg)} of ${component.name} in the usual adult dose of ${amt(adultMg)}` : 'capped at the usual adult dose';
    if (Array.isArray(perKg)) {
      const [lo, hi] = perKg.map(one);
      doseText = `${perKg[0]} to ${perKg[1]} mg/kg: ${amt(lo[0])} to ${amt(hi[0])}`;
      if (hi[1]) notes.push(`${capPhrase[0].toUpperCase()}${capPhrase.slice(1)}${component ? '' : `, ${amt(adultMg)}`}.`);
    } else {
      const [mg, cap, raw] = one(perKg);
      doseMg = mg;
      doseText = cap ? `${amt(mg)}${component ? ` of ${component.name}` : ''} (${perKg} mg/kg would be ${amt(raw)}; ${capPhrase})` : `${perKg} mg/kg x ${Math.round(doseKg * 10) / 10} kg = ${amt(mg)}`;
    }
    if (extra === 'fq') notes.push('The guideline says fluoroquinolones should not be routinely used for surgical prophylaxis in children.');
  }
  if (extra && extra !== 'fq') notes.push(extra);
  if (redose == null) notes.push('No redosing interval (NA): the table bases it on typical case length, and redosing may be needed in an unusually long procedure.');

  const start = parseWhen(o.startTime);
  const incision = parseWhen(o.incisionTime);
  if (String(o.startTime ?? '').trim() && start == null) return { valid: false, message: 'Enter the dose start time as a date and time.' };
  if (String(o.incisionTime ?? '').trim() && incision == null) return { valid: false, message: 'Enter the incision time as a date and time.' };
  let timing = null;
  if (start != null && redose != null) notes.push(`Redose at ${clock(start + redose * 3600000)}, ${redose} hours after the preoperative dose was started.`);
  if (start != null && incision != null) {
    const win = LONG_WINDOW.has(key) ? 120 : 60;
    const before = Math.round((incision - start) / 60000);
    timing = before > 0 && before <= win ? 'within' : 'outside';
    notes.push(before <= 0
      ? `Started ${before === 0 ? 'at' : `${-before} minutes after`} incision: the guideline asks for the start within ${win} minutes before it.`
      : `Started ${before} minutes before incision: ${timing === 'within' ? 'within' : 'earlier than'} the ${win}-minute window${win === 120 ? ' for vancomycin and fluoroquinolones' : ''}.`);
  }
  return {
    valid: true, doseMg: doseMg == null ? null : Math.round(doseMg * 10) / 10, redoseHours: redose, timing,
    band: `${name} (${pt}): ${doseText}; ${redose == null ? 'no redosing interval' : `redose every ${redose} hours from the start of the dose`}.`,
    bandLabel: doseMg == null ? doseText.split(': ').pop() : amt(doseMg), abnormal: timing === 'outside', notes, note: NOTE,
  };
}
