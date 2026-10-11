// spec-v1633 tool 10: the IV iron course each product's label gives.
//
// Five label rows (spec-v1628 section 1), each re-read on October 11, 2026, section 2 of each:
//   Injectafer (ferric carboxymaltose; American Regent, DailyMed version 30; 50 mg/mL): 50 kg or
//     more, "750 mg intravenously in two doses separated by at least 7 days for a total cumulative
//     dose of 1,500 mg"; adults, "15 mg/kg body weight up to a maximum of 1,000 mg ... as a
//     single-dose"; under 50 kg, "15 mg/kg ... in two doses separated by at least 7 days". Heart
//     failure, Table 1 (weight under or at least 70 kg; Hb < 10, 10 to 14, > 14 to < 15): day 1 and
//     week 6 doses; "maintenance dose of 500 mg at 12, 24 and 36 weeks if serum ferritin <100 ng/mL or
//     serum ferritin 100-300 ng/mL with transferrin saturation <20%"; "no data ... beyond 36 weeks or
//     with Hb >=15 g/dL".
//   Venofer (iron sucrose; American Regent, version 45; 20 mg/mL): hemodialysis, 100 mg "per
//     consecutive hemodialysis session", "usual total treatment course ... 1000 mg"; non-dialysis,
//     200 mg "on 5 different occasions over a 14 day period"; peritoneal dialysis, "2 infusions each
//     of 300 mg ... 14 days apart followed by one 400 mg infusion ... 14 days later"; pediatric
//     maintenance (2 years and older), 0.5 mg/kg "not to exceed 100 mg per dose", every two weeks
//     (hemodialysis) or every four weeks (non-dialysis or peritoneal dialysis) for 12 weeks.
//   Feraheme (ferumoxytol; AMAG, version 23; 30 mg/mL): "an initial 510 mg dose followed by a second
//     510 mg dose 3 to 8 days later".
//   Monoferric (ferric derisomaltose; Pharmacosmos, version 13; 100 mg/mL): 50 kg or more, 1,000 mg
//     as a single dose; under 50 kg, "20 mg/kg actual body weight".
//   INFeD (iron dextran; Allergan, version 19; 50 mg/mL): "Dose (mL) = 0.0442 (Desired Hb - Observed
//     Hb) x LBW + (0.26 x LBW)"; lean body weight 50 kg (males) or 45.5 kg (females) "+ 2.3 kg for
//     each inch of patient's height over 5 feet", "or actual body weight if less"; children 5 to 15
//     kg use body weight; blood loss, "[Blood loss (in mL) x hematocrit] / 50 mg/mL"; "The maximum
//     daily dose of INFeD should not exceed 2 mL"; intramuscular, 0.5 mL a day under 5 kg and 1 mL
//     under 10 kg.
//
// The INFeD formula is the label's own and differs from the Ganzoni formula; the result says which
// formula it is.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { parseDate } from './pa/date.js';

const INJECTAFER = { brand: 'Injectafer', setId: '517b4a19-45b3-4286-9f6a-ced4e10447de', mgPerMl: 50 };
const VENOFER = { brand: 'Venofer', setId: '626dc9e5-c6b4-4f9c-9bf4-774fd3ae619a', mgPerMl: 20 };
const FERAHEME = { brand: 'Feraheme', setId: '32b0e320-a739-11dc-a704-0002a5d5c51b', mgPerMl: 30 };
const MONOFERRIC = { brand: 'Monoferric', setId: '55859d2d-0456-4fa9-b41f-f535accc97db', mgPerMl: 100 };
const INFED = { brand: 'INFeD', setId: '94b01b1e-794b-4bea-8e24-2e54683fc023', mgPerMl: 50 };
export const LABELS = { injectafer: INJECTAFER, venofer: VENOFER, feraheme: FERAHEME, monoferric: MONOFERRIC, infed: INFED };
export const REGIMENS = [
  { value: 'injectafer-ida', text: 'Injectafer: iron deficiency anemia', label: INJECTAFER, needs: ['weight'] },
  { value: 'injectafer-ida-single', text: 'Injectafer: iron deficiency anemia, adult single-dose alternative', label: INJECTAFER, needs: ['weight'] },
  { value: 'injectafer-hf', text: 'Injectafer: iron deficiency with heart failure', label: INJECTAFER, needs: ['weight', 'hb'] },
  { value: 'venofer-hdd', text: 'Venofer: adult, hemodialysis-dependent CKD', label: VENOFER, needs: [] },
  { value: 'venofer-ndd', text: 'Venofer: adult, non-dialysis-dependent CKD', label: VENOFER, needs: [] },
  { value: 'venofer-pdd', text: 'Venofer: adult, peritoneal dialysis-dependent CKD', label: VENOFER, needs: [] },
  { value: 'venofer-pediatric-hdd', text: 'Venofer: pediatric maintenance, hemodialysis', label: VENOFER, needs: ['weight'] },
  { value: 'venofer-pediatric-ndd-pdd', text: 'Venofer: pediatric maintenance, non-dialysis or peritoneal dialysis', label: VENOFER, needs: ['weight'] },
  { value: 'feraheme', text: 'Feraheme', label: FERAHEME, needs: [] },
  { value: 'monoferric', text: 'Monoferric', label: MONOFERRIC, needs: ['weight'] },
  { value: 'infed-deficiency', text: 'INFeD: iron deficiency anemia (label formula)', label: INFED, needs: ['weight', 'hb', 'desiredHb'] },
  { value: 'infed-blood-loss', text: 'INFeD: replacement for blood loss', label: INFED, needs: ['bloodLoss', 'hematocrit'] },
];
export const SEXES = [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];
const NOTE = 'This reports the course the product\'s label gives for these inputs. It does not prescribe, and it does not choose between products.';
const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, n) => new Date(d.getTime() + n * DAY);
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (x) => Number(x).toLocaleString('en-US');

export function ivIronCourse(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMENS.find((r) => r.value === String(o.regimen ?? '').trim());
  if (!reg) return { valid: false, message: 'Choose the product and indication. Each label gives its own course.' };
  const L = reg.label;
  const checks = [];
  if (reg.needs.includes('weight')) checks.push(['the weight', o.weightKg, 0.5, 400, 'kg']);
  if (reg.needs.includes('hb')) checks.push(['the hemoglobin', o.hb, 1, 25, 'g/dL']);
  if (reg.needs.includes('desiredHb')) checks.push(['the desired hemoglobin', o.desiredHb, 5, 20, 'g/dL']);
  if (reg.needs.includes('bloodLoss')) checks.push(['the blood loss', o.bloodLossMl, null, 20000, 'mL']);
  if (reg.needs.includes('hematocrit')) checks.push(['the hematocrit', o.hematocrit, 5, 70, '%']);
  const f = inputFault(checks);
  if (f) return { valid: false, message: f };
  let start = null;
  if (!blank(o.startDate)) { start = parseDate(o.startDate); if (!start) return { valid: false, message: 'Enter the date of the first dose as YYYY-MM-DD, or leave it blank.' }; }
  const w = Number(o.weightKg); const hb = Number(o.hb);

  // INFeD needs its own inputs before anything is reported.
  let infed = null;
  if (reg.value === 'infed-deficiency') {
    const desired = Number(o.desiredHb);
    if (!(desired > hb)) return { valid: false, message: 'The desired hemoglobin must be above the observed hemoglobin: the label\'s formula is on their difference.' };
    if (w < 5) return { valid: false, message: 'The INFeD label\'s formulas start at a body weight of 5 kg.' };
    if (w <= 15) infed = { lbw: w, basis: 'body weight (children 5 to 15 kg)', desired };
    else {
      const sex = String(o.sex ?? '').trim();
      if (sex !== 'male' && sex !== 'female') return { valid: false, message: 'Choose the sex: the INFeD label\'s lean body weight starts at 50 kg for males and 45.5 kg for females.' };
      const hf = inputFault([['the height', o.heightCm, 60, 250, 'cm']]);
      if (hf) return { valid: false, message: `${hf} The INFeD label's formula uses lean body weight, from height.` };
      const inchesOver = Number(o.heightCm) / 2.54 - 60;
      const lean = (sex === 'male' ? 50 : 45.5) + 2.3 * Math.max(0, inchesOver);
      const useActual = w < lean;
      infed = { lbw: useActual ? w : lean, basis: useActual ? `actual body weight, ${say(r1(w))} kg, which is less than the lean body weight of ${say(r1(lean))} kg` : `lean body weight, ${say(r1(lean))} kg${inchesOver < 0 ? ' (the label\'s formula adds height over 5 feet; none is added below it)' : ''}`, desired };
    }
  }

  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's course is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the course from the label in hand.'], note: NOTE };
  const ml = (mg) => r2(mg / L.mgPerMl);
  const dose = (label, mg, when) => ({ label, mg: r1(mg), mL: ml(mg), ...(when ? { when } : {}) });
  const base = { valid: true, regimen: reg.value, labelUrl: lr.url, mgPerMl: L.mgPerMl, note: NOTE };
  const finish = (doses, band, bandLabel, notes = [], extra = {}) => {
    const total = r1(doses.reduce((a, d) => a + d.mg, 0));
    return { ...base, flag: 'dose', abnormal: false, doses, totalMg: total, ...extra, band, bandLabel, notes: [...doses.map((d) => `${d.label}: ${say(d.mg)} mg (${say(d.mL)} mL of ${L.mgPerMl} mg/mL)${d.when ? `, ${d.when}` : ''}.`), ...notes, `Label: ${lr.edition}.`] };
  };
  const none = (band, bandLabel, notes = []) => ({ ...base, flag: 'no-recommendation-given', abnormal: true, band, bandLabel, notes: [...notes, `Label: ${lr.edition}.`] });

  if (reg.value === 'injectafer-ida') {
    const each = w >= 50 ? 750 : 15 * w;
    const second = start ? `no sooner than ${iso(plus(start, 7))}` : 'at least 7 days after the first';
    return finish([dose('First dose', each, start ? iso(start) : null), dose('Second dose', each, second)],
      w >= 50 ? 'The Injectafer label, at 50 kg or more: 750 mg in two doses at least 7 days apart, 1,500 mg per course.' : `The Injectafer label, under 50 kg: 15 mg/kg (${say(r1(each))} mg) in two doses at least 7 days apart.`,
      `${say(r1(each))} mg × 2`, ['The label says to check serum phosphate before a repeat course in patients at risk of low phosphate, and in anyone repeating a course within three months.']);
  }
  if (reg.value === 'injectafer-ida-single') {
    if (w < 50) return none('The Injectafer label gives the single-dose alternative for adults weighing 50 kg or more only. Under 50 kg its course is 15 mg/kg in two doses.', 'Not given under 50 kg');
    const mg = Math.min(1000, 15 * w);
    return finish([dose('Single dose', mg, start ? iso(start) : null)], `The Injectafer label's alternative for adults at 50 kg or more: 15 mg/kg up to a maximum of 1,000 mg, as a single dose per course: ${say(r1(mg))} mg.`, `${say(r1(mg))} mg once`, ['This alternative is stated for adult patients.']);
  }
  if (reg.value === 'injectafer-hf') {
    if (hb >= 15) return none(`The Injectafer label says there are no data to guide dosing with a hemoglobin of 15 g/dL or more; ${hb} g/dL is outside its table.`, 'No data at Hb 15 or more');
    const heavy = w >= 70; const col = hb < 10 ? 0 : hb <= 14 ? 1 : 2;
    const day1 = [1000, 1000, 500][col]; const week6 = heavy ? [1000, 500, 0][col] : [500, 0, 0][col];
    const doses = [dose('Day 1', day1, start ? iso(start) : null)];
    if (week6) doses.push(dose('Week 6', week6, start ? iso(plus(start, 42)) : null));
    const maint = start ? ` (weeks 12, 24 and 36 fall on ${iso(plus(start, 84))}, ${iso(plus(start, 168))} and ${iso(plus(start, 252))})` : '';
    return finish(doses, `The Injectafer label's heart failure table, weight ${heavy ? '70 kg or more' : 'under 70 kg'}, hemoglobin ${['below 10', '10 to 14', 'above 14 and below 15'][col]} g/dL: ${say(day1)} mg on day 1${week6 ? ` and ${say(week6)} mg at week 6` : ', and no dose at week 6'}.`, week6 ? `${say(day1)} mg, then ${say(week6)} mg` : `${say(day1)} mg once`,
      [`Maintenance, by the label: 500 mg at 12, 24 and 36 weeks if serum ferritin is below 100 ng/mL, or 100 to 300 ng/mL with transferrin saturation below 20%${maint}.`, 'The label has no data to guide dosing beyond 36 weeks.']);
  }
  if (reg.value === 'venofer-hdd') {
    return finish([dose('Each consecutive hemodialysis session', 100)], 'The Venofer label, hemodialysis-dependent CKD: 100 mg at each consecutive hemodialysis session; the usual total course is 1,000 mg, which is 10 sessions.', '100 mg per session, 1,000 mg in all', ['The dates follow the dialysis schedule, so none are listed.', 'Given early in the session, generally within the first hour.'], { totalMg: 1000, sessions: 10 });
  }
  if (reg.value === 'venofer-ndd') {
    const win = start ? `, between ${iso(start)} and ${iso(plus(start, 13))}` : '';
    return finish(Array.from({ length: 5 }, (_, i) => dose(`Dose ${i + 1}`, 200)), `The Venofer label, non-dialysis-dependent CKD: 200 mg on 5 different occasions over a 14-day period, 1,000 mg in all${win}.`, '200 mg × 5 in 14 days', ['The label notes limited experience with 500 mg on day 1 and day 14.']);
  }
  if (reg.value === 'venofer-pdd') {
    return finish([dose('First infusion', 300, start ? iso(start) : null), dose('Second infusion', 300, start ? iso(plus(start, 14)) : '14 days after the first'), dose('Third infusion', 400, start ? iso(plus(start, 28)) : '14 days after the second')], 'The Venofer label, peritoneal dialysis-dependent CKD: 300 mg, 300 mg 14 days later, then 400 mg 14 days after that, 1,000 mg within 28 days.', '300, 300, then 400 mg');
  }
  if (reg.value === 'venofer-pediatric-hdd' || reg.value === 'venofer-pediatric-ndd-pdd') {
    const hdd = reg.value === 'venofer-pediatric-hdd'; const mg = Math.min(100, 0.5 * w);
    return finish([dose('Each dose', mg)], `The Venofer label, pediatric maintenance (2 years and older): 0.5 mg/kg, not to exceed 100 mg, which is ${say(r1(mg))} mg, every ${hdd ? 'two' : 'four'} weeks for 12 weeks.`, `${say(r1(mg))} mg every ${hdd ? '2' : '4'} weeks`, ['This is maintenance dosing. The label says dosing for iron replacement in these pediatric patients has not been established.', ...(hdd ? [] : ['The label states this for patients on erythropoietin therapy.'])], { totalMg: undefined });
  }
  if (reg.value === 'feraheme') {
    const second = start ? `between ${iso(plus(start, 3))} and ${iso(plus(start, 8))}` : '3 to 8 days after the first';
    return finish([dose('First dose', 510, start ? iso(start) : null), dose('Second dose', 510, second)], 'The Feraheme label: 510 mg, then a second 510 mg dose 3 to 8 days later.', '510 mg × 2', ['The label says to evaluate the hematologic response at least one month after the second infusion.']);
  }
  if (reg.value === 'monoferric') {
    const mg = w >= 50 ? 1000 : 20 * w;
    return finish([dose('Single dose', mg, start ? iso(start) : null)], w >= 50 ? 'The Monoferric label, at 50 kg or more: 1,000 mg as a single dose.' : `The Monoferric label, under 50 kg: 20 mg/kg of actual body weight as a single dose, ${say(r1(mg))} mg.`, `${say(r1(mg))} mg once`, ['The label repeats the dose if iron deficiency anemia recurs.']);
  }
  if (reg.value === 'infed-deficiency') {
    const mL = 0.0442 * (infed.desired - hb) * infed.lbw + 0.26 * infed.lbw;
    const mg = mL * 50; const days = Math.ceil(mL / 2 - 1e-9);
    const notes = [`The label's formula: 0.0442 × (${infed.desired} − ${hb}) × ${say(r1(infed.lbw))} + 0.26 × ${say(r1(infed.lbw))} = ${say(r2(mL))} mL. The weight used is ${infed.basis}.`,
      `The label's normal hemoglobin is 14.8 g/dL above 15 kg and 12 g/dL at 15 kg or less; ${infed.desired} g/dL was entered as the desired value.`,
      `The maximum daily dose is 2 mL, so the total takes at least ${days} day${days === 1 ? '' : 's'}. Intramuscular daily limits are lower in small children: 0.5 mL under 5 kg and 1 mL under 10 kg.`,
      'A 0.5 mL test dose comes before the first therapeutic dose.',
      'This is the INFeD label\'s own formula. It is not the Ganzoni formula, and the two give different numbers.'];
    return { ...base, flag: 'dose', abnormal: false, totalMl: r2(mL), totalMg: r1(mg), minimumDays: days, band: `The INFeD label's formula gives a total of ${say(r2(mL))} mL (${say(r1(mg))} mg of iron).`, bandLabel: `${say(r2(mL))} mL in all`, notes: [...notes, `Label: ${lr.edition}.`] };
  }
  // infed-blood-loss
  const loss = Number(o.bloodLossMl); const hct = Number(o.hematocrit) / 100;
  const iron = loss * hct; const mL = iron / 50; const days = Math.ceil(mL / 2 - 1e-9);
  return { ...base, flag: 'dose', abnormal: false, totalMl: r2(mL), totalMg: r1(iron), minimumDays: days, band: `The INFeD label's blood-loss formula: ${say(loss)} mL × ${o.hematocrit}% = ${say(r1(iron))} mg of iron, which is ${say(r2(mL))} mL of INFeD.`, bandLabel: `${say(r2(mL))} mL in all`, notes: ['The label\'s example: 500 mL of blood loss at a hematocrit of 20% is 100 mg of iron, or 2 mL.', 'The formula rests on the approximation that 1 mL of normocytic, normochromic red cells contains 1 mg of elemental iron.', `The maximum daily dose is 2 mL, so the total takes at least ${days} day${days === 1 ? '' : 's'}.`, `Label: ${lr.edition}.`] };
}
