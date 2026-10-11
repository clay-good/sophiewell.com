// spec-v1631 tool 7: a phenytoin dose from two steady-state levels (Michaelis-Menten).
//
// Ludden TM, Allen JP, Valutsky WA, et al. Clin Pharmacol Ther. 1977;21(3):287-293 (PMID 837647;
// abstract re-read on October 11, 2026): "Individual Michaelis-Menten pharmacokinetic parameters for
// phenytoin were estimated from two reliable steady-state phenytoin serum concentrations resulting
// from different daily doses". The full text was not opened; the equations are the algebra of the
// steady-state Michaelis-Menten relation R = Vmax x C / (Km + C) through two points:
//   Km   = (R1 - R2) / (R2 / C2 - R1 / C1)
//   Vmax = R1 + Km x R1 / C1
//   dose for a target level = Vmax x target / (Km + target)
//   level at a dose R       = Km x R / (Vmax - R), and none at all once R reaches Vmax
//
// Doses are put on one basis first. Dilantin label (Viatris, DailyMed version 3), a label row
// (spec-v1628 section 1), re-read the same day: the suspension and chewable tablets hold the free
// acid, the capsules and injection the sodium salt, and "there is approximately an 8% increase in
// drug content with the free acid form over that of the sodium salt"; so sodium-salt dose x 0.92 =
// phenytoin acid. The same label gives the clinically effective total concentration as 10 to 20
// mcg/mL (unbound 1 to 2 mcg/mL); it is shown as text, and the target is the reader's.
//
// Two pairs only. The tool refuses pairs that imply a negative Km or Vmax (levels not at steady
// state, or adherence changed). It does not correct levels for albumin. When the label is withheld
// the tool still works on doses of one form, and refuses to mix forms.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { setId: '86dd27d1-9cee-48ae-b55d-e2d2f7dbc593', saltToAcid: 0.92, range: [10, 20] };
export const FORMS = [
  { value: 'sodium', text: 'Sodium salt (capsules, injection)' },
  { value: 'acid', text: 'Free acid (suspension, chewable tablets)' },
];
const SODIUM_DOSES = [200, 230, 260, 300, 330, 360, 400, 430, 460, 500, 600];
const NOTE = 'Two levels fix the curve only if both were at steady state on doses that were taken. Phenytoin\'s curve is steep: near the maximum rate a small dose change moves the level a long way. The tool does the algebra; it does not choose a dose.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function phenytoinMmDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f1 = String(o.form1 ?? '').trim(); const f2 = String(o.form2 ?? '').trim();
  if (!FORMS.some((x) => x.value === f1) || !FORMS.some((x) => x.value === f2)) return { valid: false, message: 'Choose the product form for each dose: sodium salt (capsules, injection) or free acid (suspension, chewable tablets).' };
  const f = inputFault([['the first daily dose', o.dose1, null, 2000, 'mg/day'], ['the first level', o.level1, null, 100, 'mcg/mL'], ['the second daily dose', o.dose2, null, 2000, 'mg/day'], ['the second level', o.level2, null, 100, 'mcg/mL'], ['the target level', o.target, null, 100, 'mcg/mL']]);
  if (f) return { valid: false, message: f };
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers && f1 !== f2) return { valid: false, message: `The two doses are different forms, and the label's 8% difference between them is withheld: ${row.why}. Enter both doses as one form.`, withheld: true, labelUrl: row.url };
  const k1 = f1 === 'sodium' && row.answers ? LABEL.saltToAcid : 1; const k2 = f2 === 'sodium' && row.answers ? LABEL.saltToAcid : 1;
  const basis = row.answers ? 'phenytoin acid' : (f1 === 'sodium' ? 'sodium salt' : 'phenytoin acid');
  const r1 = Number(o.dose1) * k1; const r2 = Number(o.dose2) * k2; const c1 = Number(o.level1); const c2 = Number(o.level2); const target = Number(o.target);
  if (sig(r1) === sig(r2)) return { valid: false, message: 'The two doses are the same once on one basis, so they fix one point, not a curve. Two different daily doses are needed.' };
  if ((r1 - r2) * (c1 - c2) <= 0) return { valid: false, message: 'The higher dose did not give the higher level. The levels were not both at steady state, or doses were missed; the method cannot use them.' };
  const km = (r1 - r2) / (r2 / c2 - r1 / c1); const vmax = r1 + (km * r1) / c1;
  if (!(km > 0) || !(vmax > 0) || !Number.isFinite(km)) return { valid: false, message: 'These two pairs imply a negative Km or maximum rate: the level rose less than in proportion to the dose, which saturable metabolism cannot do. The levels were not both at steady state, or adherence changed.' };
  const dose = (vmax * target) / (km + target);
  const notes = [];
  if (row.answers && (f1 === 'sodium' || f2 === 'sodium')) notes.push(`On one basis (sodium salt × 0.92 = phenytoin acid, from the label's 8% difference): ${show(r1)} mg/day gave ${show(c1)} mcg/mL and ${show(r2)} mg/day gave ${show(c2)} mcg/mL.`);
  notes.push(`Km = (${show(r1)} − ${show(r2)}) ÷ (${show(r2)} ÷ ${show(c2)} − ${show(r1)} ÷ ${show(c1)}) = ${show(km)} mcg/mL. Vmax = ${show(r1)} + ${show(km)} × ${show(r1)} ÷ ${show(c1)} = ${show(vmax)} mg/day of ${basis}.`);
  const out = { valid: true, km: sig(km), vmax: sig(vmax), doseForTarget: sig(dose), basis };
  if (row.answers) {
    out.doseForTargetSodium = sig(dose / LABEL.saltToAcid);
    notes.push(`Dose for ${show(target)} mcg/mL: ${show(vmax)} × ${show(target)} ÷ (${show(km)} + ${show(target)}) = ${show(dose)} mg/day as phenytoin acid, which is ${show(dose / LABEL.saltToAcid)} mg/day as the sodium salt.`);
    const rowsOut = [];
    for (const d of SODIUM_DOSES) {
      const r = d * LABEL.saltToAcid;
      rowsOut.push({ sodiumDose: d, level: r < vmax ? sig((km * r) / (vmax - r)) : null });
    }
    out.table = rowsOut;
    const reachable = rowsOut.filter((x) => x.level !== null && x.level <= 60);
    notes.push(`Predicted steady-state levels by sodium-salt dose: ${reachable.map((x) => `${x.sodiumDose} mg/day, ${show(x.level)} mcg/mL`).join('; ')}.${rowsOut.some((x) => x.level === null) ? ` From ${rowsOut.find((x) => x.level === null).sodiumDose} mg/day the dose exceeds the estimated maximum rate of metabolism, and no steady state is reached.` : ''}`);
    notes.push(`The label gives the clinically effective total concentration as 10 to 20 mcg/mL (unbound 1 to 2 mcg/mL); the target is yours. Label: ${row.edition}.`);
  } else {
    notes.push(`Dose for ${show(target)} mcg/mL: ${show(vmax)} × ${show(target)} ÷ (${show(km)} + ${show(target)}) = ${show(dose)} mg/day, in the form entered.`);
    notes.push(`The label's figures (the 8% difference between forms and its concentration range) are withheld: ${row.why}.`);
    out.withheld = true; out.labelUrl = row.url;
  }
  if (!blank(o.testDose)) {
    const tf = inputFault([['the dose to test', o.testDose, null, 2000, 'mg/day']]);
    if (tf) return { valid: false, message: tf };
    const tform = String(o.testForm ?? '').trim();
    if (!FORMS.some((x) => x.value === tform)) return { valid: false, message: 'Choose the product form of the dose to test.' };
    if (!row.answers && tform !== f1) return { valid: false, message: 'The label\'s difference between forms is withheld, so the dose to test must be the same form as the doses entered.' };
    const r = Number(o.testDose) * (tform === 'sodium' && row.answers ? LABEL.saltToAcid : 1);
    if (r >= vmax) return { valid: false, message: `${show(Number(o.testDose))} mg/day exceeds the estimated maximum rate of metabolism (${show(vmax)} mg/day of ${basis}): no steady-state level is reached and the level keeps rising.` };
    out.testLevel = sig((km * r) / (vmax - r));
    notes.push(`At ${show(Number(o.testDose))} mg/day: ${show(km)} × ${show(r)} ÷ (${show(vmax)} − ${show(r)}) = ${show(out.testLevel)} mcg/mL.`);
  }
  return {
    ...out,
    band: row.answers
      ? `About ${show(dose / LABEL.saltToAcid)} mg/day as the sodium salt (${show(dose)} mg/day as phenytoin acid) for a level of ${show(target)} mcg/mL; Km ${show(km)} mcg/mL, Vmax ${show(vmax)} mg/day.`
      : `About ${show(dose)} mg/day, in the form entered, for a level of ${show(target)} mcg/mL; Km ${show(km)} mcg/mL, Vmax ${show(vmax)} mg/day.`,
    bandLabel: `${show(row.answers ? dose / LABEL.saltToAcid : dose)} mg/day`,
    notes, note: NOTE,
  };
}
