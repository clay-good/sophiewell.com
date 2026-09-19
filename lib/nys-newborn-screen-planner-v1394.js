// spec-v1394: New York newborn screening specimen planner (Wadsworth Center protocol).
//
// Source: Wadsworth Center, Newborn Screening Program, specimen collection page and Specimen
// Collection Guide (updated March 2026), read 2026-09-18:
//   Routine: collect "after the newborn is at least 24 hours old". Discharged under 24 hours: a
//     specimen at discharge and a second "between 24 hours and 120 hours of age".
//   NICU: first "upon admission"; second "at 48 to 72 hours of life" if the first was collected at
//     under 24 hours or the birth weight was under 2,000 g; third "at 28 days of life, or discharge,
//     whichever comes first" if under 2,000 g.
//   Transfusion: collect before transfusion if at all possible. "Infants receiving transfusions with
//     no prior newborn screening test need two specimens": one "three days or more after the most
//     recent transfusion" and one "four months after the final transfusion".
//   TPN: collect before if possible; with no prior screen, collect "three days or more after the last
//     administration of TPN".
//   Readmission within the first 28 days: the admitting hospital submits a specimen "unless proof of a
//     screen negative result is available".
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime } from './state-calendar.js';

export const NBS_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
const HOUR = 3600000;
const DAY = 24 * HOUR;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function when(t) {
  const d = new Date(t);
  const h = d.getUTCHours();
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}, ${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}
function plusMonths(t, n) {
  const d = new Date(t);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d.getUTCDate(), last), d.getUTCHours(), d.getUTCMinutes());
}
function opt(v, label) {
  if (isBlank(v)) return { t: null };
  const t = parseDateTime(v);
  if (t === null) return { err: `Enter ${label} as a date and time.` };
  return { t };
}

export function nysNewbornScreenPlanner(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.birth)) return { valid: false, message: 'Enter the date and time of birth. Every specimen window runs from it.' };
  const birth = parseDateTime(o.birth);
  if (birth === null) return { valid: false, message: 'Enter the birth as a date and time.' };
  if (isBlank(o.weightG)) return { valid: false, message: 'Enter the birth weight in grams. Under 2,000 g adds NICU specimens.' };
  const g = Number(String(o.weightG).trim());
  if (!Number.isFinite(g) || g < 200 || g > 7000) return { valid: false, message: 'Enter a birth weight between 200 and 7,000 g.' };
  if (o.nicu !== 'yes' && o.nicu !== 'no') return { valid: false, message: 'Answer whether the infant was admitted to the NICU. The NICU protocol differs.' };

  const f = {};
  for (const [k, label] of [['first', 'the first specimen'], ['discharge', 'the discharge'], ['transfusionFirst', 'the first transfusion'], ['transfusionLast', 'the last transfusion'], ['tpnLast', 'the last TPN']]) {
    const r = opt(o[k], label);
    if (r.err) return { valid: false, message: r.err };
    f[k] = r.t;
  }
  const small = g < 2000;
  const specimens = [];
  if (o.nicu === 'yes') {
    specimens.push(`1. On NICU admission.${f.first !== null ? ` Drawn ${when(f.first)}.` : ''}`);
    const firstEarly = f.first !== null && f.first - birth < 24 * HOUR;
    if (small || firstEarly) {
      specimens.push(`2. At 48 to 72 hours of life: ${when(birth + 48 * HOUR)} to ${when(birth + 72 * HOUR)} (${small ? 'birth weight under 2,000 g' : 'first specimen drawn under 24 hours'}).`);
    } else if (f.first === null) {
      specimens.push(`2. At 48 to 72 hours of life (${when(birth + 48 * HOUR)} to ${when(birth + 72 * HOUR)}) if the first is drawn under 24 hours of age.`);
    }
    if (small) specimens.push(`3. At 28 days of life (${when(birth + 28 * DAY)}) or discharge, whichever comes first (birth weight under 2,000 g).`);
  } else if (f.discharge !== null && f.discharge - birth < 24 * HOUR) {
    specimens.push('1. At discharge, since the infant leaves before 24 hours of age.');
    specimens.push(`2. Between 24 and 120 hours of age: ${when(birth + 24 * HOUR)} to ${when(birth + 120 * HOUR)}.`);
  } else {
    specimens.push(`1. After 24 hours of age: from ${when(birth + 24 * HOUR)}.`);
  }

  const extra = [];
  const tLast = f.transfusionLast !== null ? f.transfusionLast : f.transfusionFirst;
  if (tLast !== null) {
    const firstTx = f.transfusionFirst !== null ? f.transfusionFirst : tLast;
    const prior = f.first !== null && f.first < firstTx;
    if (prior) extra.push('Transfusion: a specimen was drawn before the first transfusion, so the two post-transfusion specimens are not required.');
    else extra.push(`Transfused with no prior screen: one specimen 3 or more days after the most recent transfusion (from ${when(tLast + 3 * DAY)}) and one 4 months after the final transfusion (${when(plusMonths(tLast, 4))}).`);
  }
  if (f.tpnLast !== null) {
    const prior = f.first !== null && f.first < f.tpnLast;
    extra.push(prior
      ? 'TPN: if the first specimen came before TPN began, no extra TPN specimen is needed; otherwise collect 3 or more days after the last TPN.'
      : `TPN with no prior screen: collect 3 or more days after the last TPN (from ${when(f.tpnLast + 3 * DAY)}).`);
  }
  if (o.readmitted === 'yes') {
    extra.push(o.priorNegative === 'yes'
      ? 'Readmitted within 28 days with proof of a screen-negative result: no new specimen is required.'
      : 'Readmitted within 28 days: the admitting hospital submits a specimen unless proof of a screen-negative result is available.');
  }
  return {
    valid: true,
    abnormal: false,
    bandLabel: `${specimens.length} routine or NICU specimen${specimens.length === 1 ? '' : 's'}${extra.length ? ', plus conditions below' : ''}`,
    band: `${o.nicu === 'yes' ? 'NICU' : 'Well newborn'}, ${g.toLocaleString('en-US')} g at birth, under the Wadsworth Center protocol (Specimen Collection Guide, March 2026).`,
    specimens,
    extra,
    beforeNote: 'Before a transfusion or TPN, draw a specimen first if at all possible: transfusion can mask a hemoglobinopathy or galactosemia.',
  };
}
