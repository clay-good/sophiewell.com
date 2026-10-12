// spec-v1636 tool 10: succimer, edetate calcium disodium and dimercaprol by weight or surface area.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   CHEMET (succimer), Recordati (set 62035612-..., version 10). 2.2: "10 mg/kg or 350 mg/m2 orally
//     every 8 hours for five days followed by 10 mg/kg or 350 mg/m2 orally every 12 hours for an
//     additional 14 days"; "The total treatment course consists of 19 days." Table 1: 8 to 15 kg,
//     100 mg (1 capsule); 16 to 23 kg, 200 mg (2); 24 to 34 kg, 300 mg (3); 35 to 44 kg, 400 mg (4);
//     >45 kg, 500 mg (5).
//   Edetate Calcium Disodium Injection, Rising (set 710a2c8c-..., version 3): blood lead above 20 and
//     below 70 mcg/dL, "1,000 mg/m2/day whether given via intravenous infusion or intramuscularly",
//     for five days; intravenous in 250 to 500 mL over 8 to 12 hours; 200 mg/mL. Lead nephropathy in
//     adults: "500 mg/m2 every 24 hours for 5 days for patients with serum creatinine levels of 2 to
//     3 mg/dL, every 48 hours for 3 doses for ... 3 to 4 mg/dL, and once weekly for ... above 4".
//   BAL in Oil (dimercaprol), Akorn (set bee9a137-..., version 5): mild arsenic or gold poisoning,
//     2.5 mg/kg four times daily for two days, two times on the third day, once daily thereafter for
//     ten days; severe, 3 mg/kg every four hours for two days, four times on the third day, then
//     twice daily for ten days; mercury, 5 mg/kg initially, then 2.5 mg/kg one or two times daily for
//     ten days; acute lead encephalopathy, 4 mg/kg alone in the first dose and thereafter at
//     four-hour intervals with edetate calcium disodium (3 mg/kg after the first dose for less severe
//     poisoning), for two to seven days. 100 mg/mL, deep intramuscular injection only.
//
// The succimer table is printed in whole kilograms and leaves 45 kg itself unstated ("35 to 44"
// then ">45"); a weight in a gap returns both rows. The edetate creatinine rows share the value 3.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  succimer: { name: 'CHEMET', setId: '62035612-9505-3a3f-1ac8-e2dbd711d24e' },
  edetate: { name: 'Edetate Calcium Disodium Injection', setId: '710a2c8c-3620-4f6f-b8fc-fb19ab9e9f22' },
  dimercaprol: { name: 'BAL in Oil', setId: 'bee9a137-160f-47e8-a551-ca461ae4f51e' },
};
export const REGIMENS = [
  { value: 'succimer-lead', text: 'Succimer: lead poisoning in a pediatric patient', label: 'succimer' },
  { value: 'edetate-lead', text: 'Edetate calcium disodium: blood lead above 20 and below 70 mcg/dL', label: 'edetate' },
  { value: 'edetate-lead-nephropathy', text: 'Edetate calcium disodium: adult with lead nephropathy', label: 'edetate' },
  { value: 'dimercaprol-arsenic-gold-mild', text: 'Dimercaprol: mild arsenic or gold poisoning', label: 'dimercaprol' },
  { value: 'dimercaprol-arsenic-gold-severe', text: 'Dimercaprol: severe arsenic or gold poisoning', label: 'dimercaprol' },
  { value: 'dimercaprol-mercury', text: 'Dimercaprol: mercury poisoning', label: 'dimercaprol' },
  { value: 'dimercaprol-lead-encephalopathy', text: 'Dimercaprol: acute lead encephalopathy', label: 'dimercaprol' },
];
// [low kg, high kg, mg, capsules]
const SUCC = [[8, 15, 100, 1], [16, 23, 200, 2], [24, 34, 300, 3], [35, 44, 400, 4]];
const NOTE = 'The labeled dose and course for the regimen chosen. Which chelator, at what blood level, and whether to treat at all are decided with a poison center or toxicologist; the labels themselves refer to published protocols for combined therapy.';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

export function chelationDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMENS.find((r) => r.value === String(o.regimen ?? '').trim());
  if (!reg) return { valid: false, message: 'Choose the agent and the poisoning. Each label has its own dose and course.' };
  const edetate = reg.label === 'edetate';
  let kg = null; let bsa = null; let cr = null;
  if (edetate) {
    const f = inputFault([['the body surface area', o.bsa, 0.1, 3.5, 'm²']]);
    if (f) return { valid: false, message: `${f} The label doses edetate calcium disodium by surface area.` };
    bsa = Number(o.bsa);
    if (reg.value === 'edetate-lead-nephropathy') {
      const cf = inputFault([['the serum creatinine', o.creatinine, 0.1, 25, 'mg/dL']]);
      if (cf) return { valid: false, message: cf };
      cr = Number(o.creatinine);
    }
  } else {
    const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
    if (f) return { valid: false, message: f };
    kg = Number(o.weight);
  }
  const L = LABELS[reg.label];
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const base = { valid: true, flag: 'dose', abnormal: false, labelUrl: lr.url, note: NOTE };

  if (reg.value === 'succimer-lead') {
    const course = 'Course: every 8 hours for 5 days (15 doses), then every 12 hours for 14 days (28 doses); 19 days and 43 doses in all.';
    const perKg = `10 mg/kg at ${kg} kg is ${n0(10 * kg)} mg.`;
    const row = SUCC.find(([lo, hi]) => kg >= lo && kg <= hi);
    if (row || kg > 45) {
      const mg = row ? row[2] : 500; const caps = row ? row[3] : 5;
      return { ...base, doseMg: mg, capsules: caps, courseCapsules: caps * 43, band: `Succimer ${mg} mg (${caps} capsule${caps === 1 ? '' : 's'} of 100 mg) per dose, the label's row for ${row ? `${row[0]} to ${row[1]} kg` : 'over 45 kg'}. Every 8 hours for 5 days, then every 12 hours for 14 days.`, bandLabel: `${mg} mg per dose`,
        notes: [course, `Capsules for the whole course: 43 × ${caps} = ${caps * 43}.`, `The label also states the dose as 10 mg/kg or 350 mg/m²: ${perKg} The table rounds to whole 100 mg capsules.`, 'Label: interrupt for an absolute neutrophil count under 1,200/mcL; starting at higher doses is not recommended; uninterrupted dosing longer than 3 weeks is not recommended.', ...tail] };
    }
    if (kg < 8) return { ...base, flag: 'weight-not-in-table', abnormal: true, band: `The label's capsule table starts at 8 kg and has no row for ${kg} kg. Arithmetic only, not a table row: ${perKg}`, bandLabel: 'No table row', notes: [course, ...tail] };
    const all = [...SUCC, [45.000001, Infinity, 500, 5]];
    const below = [...all].reverse().find(([, hi]) => hi < kg); const above = all.find(([lo]) => lo > kg);
    const name = (r) => (r[1] === Infinity ? 'over 45 kg: 500 mg (5 capsules)' : `${r[0]} to ${r[1]} kg: ${r[2]} mg (${r[3]} capsule${r[3] === 1 ? '' : 's'})`);
    return { ...base, flag: 'between-rows', abnormal: true, band: `${kg} kg falls between two rows of the label's table (${name(below)} and ${name(above)})${kg === 45 ? ', which prints "35 to 44 kg" and then ">45 kg" and leaves 45 kg itself unstated' : ''}. Both are shown; none is chosen.`, bandLabel: 'Two rows shown', notes: [perKg, course, ...tail] };
  }
  if (reg.value === 'edetate-lead') {
    const mg = 1000 * bsa;
    return { ...base, dailyMg: Number(mg.toFixed(0)), volumeMl: Number((mg / 200).toFixed(2)), band: `Edetate calcium disodium ${n0(mg)} mg a day (1,000 mg/m² × ${bsa} m²), ${n2(mg / 200)} mL of 200 mg/mL, for 5 days.`, bandLabel: `${n0(mg)} mg a day`,
      notes: ['Intravenous: the day\'s dose in 250 to 500 mL of 5% dextrose or 0.9% sodium chloride, infused over 8 to 12 hours. Intramuscular: the same daily total, divided.', `Five-day course: ${n0(mg * 5)} mg. The label then interrupts therapy for 2 to 4 days; two courses are usual.`, 'Label: above 70 mcg/dL, or with symptoms, edetate is used with dimercaprol and not alone; it refers to published protocols for the combined doses.', 'Label: reduced doses in pre-existing mild renal disease; never exceed the recommended daily dose.', ...tail] };
  }
  if (reg.value === 'edetate-lead-nephropathy') {
    const mg = 500 * bsa; const dose = `${n0(mg)} mg (500 mg/m² × ${bsa} m², ${n2(mg / 200)} mL of 200 mg/mL)`;
    const rows = [];
    if (cr >= 2 && cr <= 3) rows.push('creatinine 2 to 3 mg/dL: every 24 hours for 5 days');
    if (cr >= 3 && cr <= 4) rows.push('creatinine 3 to 4 mg/dL: every 48 hours for 3 doses');
    if (cr > 4) rows.push('creatinine above 4 mg/dL: once weekly');
    if (!rows.length) return { ...base, flag: 'creatinine-not-in-table', abnormal: true, band: `A serum creatinine of ${cr} mg/dL is below 2 mg/dL, where the label's lead nephropathy regimens start. It gives no row for it.`, bandLabel: 'No label row', notes: tail };
    const two = rows.length > 1;
    return { ...base, flag: two ? 'label-does-not-settle' : 'dose', abnormal: two, doseMg: Number(mg.toFixed(0)), band: two ? `Edetate calcium disodium ${dose} per dose. A creatinine of exactly 3 mg/dL is in two of the label's rows (${rows.join('; and ')}); both are shown and none is chosen.` : `Edetate calcium disodium ${dose}, ${rows[0].split(': ')[1]} (${rows[0].split(': ')[0]}).`, bandLabel: `${n0(mg)} mg per dose`,
      notes: ['The label describes these regimens as suggested for adults with lead nephropathy, and says they may be repeated at one-month intervals.', ...tail] };
  }
  // Dimercaprol.
  const d = (perKg) => `${n1(perKg * kg)} mg (${perKg} mg/kg × ${kg} kg, ${n2(perKg * kg / 100)} mL of 100 mg/mL)`;
  const common = ['Deep intramuscular injection only. The ampule holds 3 mL at 100 mg/mL.', ...tail];
  if (reg.value === 'dimercaprol-arsenic-gold-mild') return { ...base, doseMg: Number((2.5 * kg).toFixed(1)), courseDoses: 20, band: `Dimercaprol ${d(2.5)} per dose: four times daily for 2 days, twice on day 3, then once daily for 10 days.`, bandLabel: `${n1(2.5 * kg)} mg per dose`, notes: [`Doses in the course: 8 + 2 + 10 = 20; total ${n0(2.5 * kg * 20)} mg.`, ...common] };
  if (reg.value === 'dimercaprol-arsenic-gold-severe') return { ...base, doseMg: Number((3 * kg).toFixed(1)), courseDoses: 36, band: `Dimercaprol ${d(3)} per dose: every 4 hours for 2 days, four times on day 3, then twice daily for 10 days.`, bandLabel: `${n1(3 * kg)} mg per dose`, notes: [`Doses in the course: 12 + 4 + 20 = 36; total ${n0(3 * kg * 36)} mg.`, ...common] };
  if (reg.value === 'dimercaprol-mercury') return { ...base, flag: 'label-gives-a-choice', abnormal: true, doseMg: Number((5 * kg).toFixed(1)), band: `Dimercaprol ${d(5)} first, then ${d(2.5)} one or two times daily for 10 days.`, bandLabel: `${n1(5 * kg)} mg, then ${n1(2.5 * kg)} mg`, notes: ['The label gives the following doses as once or twice daily and does not choose: 10 or 20 doses after the first.', ...common] };
  return { ...base, flag: 'label-gives-a-choice', abnormal: true, doseMg: Number((4 * kg).toFixed(1)), band: `Dimercaprol ${d(4)} alone as the first dose, then every 4 hours together with edetate calcium disodium at a separate site, for 2 to 7 days.`, bandLabel: `${n1(4 * kg)} mg first`, notes: [`For less severe poisoning the label allows ${d(3)} after the first dose.`, 'The duration (2 to 7 days) depends on the clinical response; the label gives a range and does not pick a point in it.', ...common] };
}
