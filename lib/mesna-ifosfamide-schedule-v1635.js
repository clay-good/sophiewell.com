// spec-v1635 tool 6: mesna doses and times from the ifosfamide dose, as the MESNEX label states them.
//
// Source: MESNEX (mesna) injection and tablets label, Baxter, DailyMed set id 2e8eebc3-..., version 10,
// re-read October 11, 2026:
//   2.1  "MESNEX injection is given as intravenous bolus injections in a dosage equal to 20% of the
//        ifosfamide dosage weight by weight (w/w) at the time of ifosfamide administration and 4 and
//        8 hours after each dose of ifosfamide. The total daily dose of MESNEX is 60% of the
//        ifosfamide dose." Table 1: ifosfamide 1.2 g/m2 -> 240 mg/m2 at 0, 4 and 8 hours.
//   2.2  20% intravenously at the time of ifosfamide, then "MESNEX tablets are given orally in a
//        dosage equal to 40% of the ifosfamide dose 2 and 6 hours after each dose of ifosfamide. The
//        total daily dose of MESNEX is 100% of the ifosfamide dose." Table 2: 240, then 480 and
//        480 mg/m2. "The efficacy and safety of this ratio of intravenous and oral MESNEX has not
//        been established as being effective for daily doses of ifosfamide higher than 2 g/m2.
//        Patients who vomit within two hours of taking oral MESNEX should repeat the dose or receive
//        intravenous MESNEX."
//   3    injection 100 mg/mL; tablets 400 mg with a functional score.
// Bolus ifosfamide only, as labeled. Mesna by continuous infusion is not in the label and is not here.
// The oral doses are not rounded to tablets: the label gives no rounding rule.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'MESNEX', setId: '2e8eebc3-ea75-4c57-bfe1-2c5dc2c37806' };
export const UNITS = [
  { value: 'mg', text: 'mg (the whole dose)' },
  { value: 'mg-m2', text: 'mg/m²' },
  { value: 'g-m2', text: 'g/m²' },
];
export const PLANS = [
  { value: 'iv', text: 'All intravenous (0, 4 and 8 hours)' },
  { value: 'iv-oral', text: 'Intravenous, then oral (0, 2 and 6 hours)' },
];
const PLAN = {
  iv: [[0, 20, 'intravenous bolus'], [4, 20, 'intravenous bolus'], [8, 20, 'intravenous bolus']],
  'iv-oral': [[0, 20, 'intravenous bolus'], [2, 40, 'by mouth'], [6, 40, 'by mouth']],
};
const NOT_ESTABLISHED = 'The label says the efficacy and safety of this ratio of intravenous and oral mesna "has not been established as being effective for daily doses of ifosfamide higher than 2 g/m²."';
const NOTE = 'The labeled schedule for bolus ifosfamide, repeated on each day ifosfamide is given. It does not say whether a dose is right for a patient, and mesna by continuous infusion is not in the label.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');

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

export function mesnaIfosfamideSchedule(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the unit of the ifosfamide dose: mg, mg/m² or g/m².' };
  const top = { mg: 30000, 'mg-m2': 10000, 'g-m2': 10 }[unit.value];
  const f = inputFault([['the ifosfamide dose', o.dose, null, top, unit.text.split(' ')[0]]]);
  if (f) return { valid: false, message: f };
  const perM2 = unit.value !== 'mg';
  let bsa = null;
  if (perM2 || !blank(o.bsa)) {
    const bf = inputFault([['the body surface area', o.bsa, 0.1, 3.5, 'm²']]);
    if (bf) return { valid: false, message: bf };
    bsa = Number(o.bsa);
  }
  const plan = PLAN[String(o.plan ?? '').trim()] && Object.prototype.hasOwnProperty.call(PLAN, String(o.plan).trim()) ? String(o.plan).trim() : null;
  if (!plan) return { valid: false, message: 'Choose the route plan: all intravenous, or intravenous then oral. The percentages and the hours differ.' };
  let start = null;
  if (!blank(o.start)) {
    start = parseWhen(o.start);
    if (start === null) return { valid: false, message: 'Enter the ifosfamide start as a date and time (YYYY-MM-DDTHH:MM).' };
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The MESNEX label figures are withheld: ${lr.why}. Read the schedule from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const raw = Number(o.dose);
  const ifosMg = unit.value === 'mg' ? raw : (unit.value === 'g-m2' ? raw * 1000 : raw) * bsa;
  const ifosGm2 = bsa === null ? null : ifosMg / bsa / 1000;
  const doses = PLAN[plan].map(([hour, pct, route]) => ({ hour, percent: pct, route, mg: Number((ifosMg * pct / 100).toFixed(1)), at: start === null ? null : clock(start + hour * 3600000) }));
  const total = PLAN[plan].reduce((s, [, pct]) => s + pct, 0);
  const totalMg = ifosMg * total / 100;
  const above = plan === 'iv-oral' && ifosGm2 !== null && ifosGm2 > 2 + 1e-9;
  const unchecked = plan === 'iv-oral' && ifosGm2 === null;

  const notes = [];
  if (above) notes.push(`Ifosfamide ${n1(ifosGm2)} g/m², taken as the dose for the day, is above 2 g/m². ${NOT_ESTABLISHED}`);
  if (unchecked) notes.push(`${NOT_ESTABLISHED} That is not checked here: enter the body surface area to check it.`);
  notes.push(`Ifosfamide ${n1(ifosMg)} mg${perM2 ? ` (${raw.toLocaleString('en-US')} ${unit.text} × ${bsa} m²)` : ''}.`);
  for (const d of doses) notes.push(`${d.at === null ? `Hour ${d.hour}` : `${d.at} (hour ${d.hour})`}: mesna ${n1(d.mg)} mg ${d.route} (${d.percent}%${d.route === 'intravenous bolus' ? `, ${n1(d.mg / 100)} mL of the 100 mg/mL injection` : ''}).`);
  notes.push(`Daily total: ${n1(totalMg)} mg, ${total}% of the ifosfamide dose.`);
  if (plan === 'iv-oral') notes.push('Oral doses are MESNEX tablets, 400 mg with a functional score; the label gives no rounding rule, so the doses are not rounded here. The label says a patient who vomits within two hours of an oral dose should repeat it or receive intravenous mesna.');
  notes.push(plan === 'iv'
    ? 'The label\'s own row: ifosfamide 1.2 g/m² with mesna 240 mg/m² at 0, 4 and 8 hours.'
    : 'The label\'s own row: ifosfamide 1.2 g/m² with mesna 240 mg/m² intravenously at 0 hours, then 480 mg/m² by mouth at 2 and 6 hours.');
  if (start === null) notes.push('Hours are counted from the time of the ifosfamide dose; enter its start for clock times.');
  else notes.push('Clock times are elapsed hours from the ifosfamide start, read as written; a daylight-saving change in between is not adjusted for.');
  notes.push(`Label: ${lr.edition}.`);
  const list = doses.map((d) => `${n1(d.mg)} mg at ${d.hour} h`).join(', ');
  return {
    valid: true, flag: above ? 'oral-ratio-not-established' : unchecked ? 'oral-ratio-unchecked' : 'schedule', abnormal: above || unchecked, labelUrl: lr.url,
    ifosfamideMg: Number(ifosMg.toFixed(1)), doses, totalMg: Number(totalMg.toFixed(1)), totalPercent: total,
    band: `Mesna ${list} (${plan === 'iv' ? 'all intravenous' : 'intravenous, then by mouth'}); ${n1(totalMg)} mg a day.${above ? ' Above 2 g/m² of ifosfamide the label has not established this oral ratio.' : ''}`,
    bandLabel: `${n1(totalMg)} mg a day`, notes, note: NOTE,
  };
}
