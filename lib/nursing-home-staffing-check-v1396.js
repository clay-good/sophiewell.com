// spec-v1396: nursing home minimum staffing check (New York, New Jersey, California).
//
// Sources, read 2026-09-19:
//   NY Public Health Law 2895-b (nysenate.gov): (3)(a) a daily average of 3.5 hours of care per
//     resident per day by a certified nurse aide, licensed nurse, or nurse aide, of which at least 2.2
//     by a certified nurse aide or nurse aide (certified aides only from January 1, 2023, (3)(b)) and
//     at least 1.1 by a licensed nurse. (2)(h) Time spent on administrative services does not count.
//   N.J.S.A. 30:13-18 (FindLaw, current as of January 1, 2024): day shift, one certified nurse aide to
//     every eight residents; evening shift, one direct care staff member to every 10 residents, at
//     least half of them CNAs; night shift, one direct care staff member to every 14 residents, each
//     signed in to work as a CNA. Direct care staff: RNs, LPNs, and CNAs.
//   CA Health & Safety Code 1276.65 (leginfo): from July 1, 2018, 3.5 direct care service hours per
//     patient day, of which at least 2.4 by certified nurse assistants; distinct-part SNFs of a general
//     acute hospital, and state hospitals and developmental centers, are excepted. Food, housekeeping,
//     laundry, and maintenance staff are not counted.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const NH_VERIFIED = '2026-09-19';
export const NH_STATES = stateOptions(['NY', 'NJ', 'CA']);
export const SHIFTS = [
  { value: 'day', text: 'Day' },
  { value: 'evening', text: 'Evening' },
  { value: 'night', text: 'Night' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function num(v, label, { whole = false, max = 100000 } = {}) {
  if (isBlank(v)) return { err: `Enter ${label}.` };
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0 || n > max || (whole && !Number.isInteger(n))) return { err: `Enter ${label} as ${whole ? 'a whole number' : 'a number'}.` };
  return { n };
}
const r2 = (x) => Math.round(x * 100) / 100;

export function nursingHomeStaffingCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const st = NH_STATES.find((s) => s.value === o.state);
  if (!st) return { valid: false, message: 'Choose New York, New Jersey, or California.' };
  const census = num(o.census, 'the resident census', { whole: true, max: 2000 });
  if (census.err) return { valid: false, message: census.err };
  if (census.n === 0) return { valid: false, message: 'Enter a census of at least one resident.' };
  const base = { valid: true, postureNote: scopeSentence(NH_VERIFIED) };

  if (st.value === 'NJ') {
    const shift = SHIFTS.find((s) => s.value === o.shift);
    if (!shift) return { valid: false, message: 'Choose the shift. New Jersey sets a ratio for each.' };
    const cna = num(o.cnas, 'the CNAs working this shift', { whole: true, max: 500 });
    if (cna.err) return { valid: false, message: cna.err };
    const lic = num(o.licensed, 'the RNs and LPNs giving direct care this shift (0 if none)', { whole: true, max: 500 });
    if (lic.err) return { valid: false, message: lic.err };
    const fails = [];
    let need;
    if (shift.value === 'day') {
      need = Math.ceil(census.n / 8);
      if (cna.n < need) fails.push(`${census.n} residents need at least ${need} CNAs on the day shift (1 to 8); ${cna.n} are working`);
    } else if (shift.value === 'evening') {
      need = Math.ceil(census.n / 10);
      const total = cna.n + lic.n;
      if (total < need) fails.push(`${census.n} residents need at least ${need} direct care staff on the evening shift (1 to 10); ${total} are working`);
      if (cna.n * 2 < total) fails.push(`at least half of the evening direct care staff must be CNAs; ${cna.n} of ${total} are`);
    } else {
      need = Math.ceil(census.n / 14);
      const total = cna.n + lic.n;
      if (total < need) fails.push(`${census.n} residents need at least ${need} direct care staff on the night shift (1 to 14), each signed in as a CNA; ${total} are working`);
    }
    return { ...base, meets: !fails.length, abnormal: fails.length > 0, bandLabel: fails.length ? 'Short of the New Jersey ratio' : 'Meets the New Jersey ratio', band: fails.length ? `Not met (N.J.S.A. 30:13-18): ${fails.join('; ')}.` : `Meets the ${shift.text.toLowerCase()}-shift ratio for ${census.n} residents (N.J.S.A. 30:13-18).`, lines: [] };
  }

  if (st.value === 'CA') {
    if (o.distinctPart !== 'yes' && o.distinctPart !== 'no') return { valid: false, message: 'Answer whether this is a distinct-part SNF of a general acute care hospital. Those are excepted.' };
    if (o.distinctPart === 'yes') return { ...base, meets: null, abnormal: false, bandLabel: 'Excepted: distinct-part SNF', band: 'Section 1276.65 excepts a skilled nursing facility that is a distinct part of a general acute care facility (or a state hospital or developmental center) from the 3.5-hour minimum.', lines: [] };
  }
  const total = num(o.totalHours, 'the direct care hours worked in the day', { max: 100000 });
  if (total.err) return { valid: false, message: total.err };
  const aide = num(o.aideHours, 'the certified nurse aide hours in the day', { max: 100000 });
  if (aide.err) return { valid: false, message: aide.err };
  let licensed = null;
  if (st.value === 'NY') {
    licensed = num(o.licensedHours, 'the licensed nurse hours in the day', { max: 100000 });
    if (licensed.err) return { valid: false, message: licensed.err };
  }
  const hprd = total.n / census.n;
  const aprd = aide.n / census.n;
  const rules = st.value === 'NY'
    ? [['total', 3.5, hprd, 'total hours of care'], ['aide', 2.2, aprd, 'certified nurse aide hours'], ['licensed', 1.1, licensed.n / census.n, 'licensed nurse hours']]
    : [['total', 3.5, hprd, 'direct care service hours'], ['aide', 2.4, aprd, 'certified nurse assistant hours']];
  const lines = rules.map(([, min, got, label]) => `${label}: ${r2(got)} per resident per day (minimum ${min})`);
  const fails = rules.filter(([, min, got]) => got + 1e-9 < min).map(([, min, got, label]) => `${label} ${r2(got)}, under ${min}`);
  const cite = st.value === 'NY' ? 'PHL 2895-b' : 'HSC 1276.65';
  return {
    ...base,
    meets: !fails.length,
    abnormal: fails.length > 0,
    bandLabel: fails.length ? `Short of the ${st.value === 'NY' ? 'New York' : 'California'} minimum` : `Meets the ${st.value === 'NY' ? 'New York' : 'California'} minimum`,
    band: fails.length ? `Not met (${cite}) for ${census.n} residents: ${fails.join('; ')} per resident per day.` : `Meets ${cite} for ${census.n} residents: ${r2(hprd)} hours of care per resident per day.`,
    lines,
    countNote: st.value === 'NY' ? 'Time spent on administrative services does not count (2895-b(2)(h)).' : 'Food, housekeeping, laundry, and maintenance staff are not counted (1276.65(b)).',
  };
}
