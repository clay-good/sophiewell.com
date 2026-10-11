// spec-v1631 tool 19: augmented renal clearance risk (the ARC and ARCTIC scores).
//
// ARC score. Udy AA, Roberts JA, Shorr AF, Boots RJ, Lipman J. Crit Care. 2013;17:R35 (PMC4056783,
// CC BY 2.0), re-read on October 11, 2026: "Age <=50 years was assigned six points, admission
// post-trauma three points and modified SOFA score <=4 one point." Augmented clearance was a
// measured creatinine clearance of 130 mL/min/1.73 m2 or more; patients with a plasma creatinine
// above 110 micromol/L were excluded. The paper states no cutoff and calls the scoring system's
// implications "primarily speculative" pending validation, so the total is shown without a band.
//
// ARCTIC score. Barletta JF, Mangram AJ, Byrne M, et al. J Trauma Acute Care Surg.
// 2017;82(4):665-671 (PMID 28129261, abstract re-read the same day), in trauma intensive care
// patients with a serum creatinine of 1.3 mg/dL or less: "4 points if younger than 56 years, 3
// points if aged 56 years to 75 years, 3 points if SCr less than 0.7 mg/dL, and 2 points if male
// sex. ... An ARCTIC score of 6 or higher had a sensitivity, specificity, positive predictive value,
// and negative predictive value of 0.843, 0.682, 0.843, and 0.682", for a measured clearance of 130
// mL/min or greater. The full text was not opened.
//
// Neither score measures clearance; a measured (timed-urine) creatinine clearance does.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SEXES = [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const NOTE = 'Two screening scores from single-center studies of patients with a normal creatinine; neither measures clearance. A timed-urine creatinine clearance does. The tool adds the points; it does not say how to dose.';

const show = (x) => Number(Number(x).toPrecision(4)).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function arcRiskScores(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = String(o.sex ?? '').trim();
  if (sex !== 'male' && sex !== 'female') return { valid: false, message: 'Choose the sex: the ARCTIC score gives points for male sex.' };
  const trauma = String(o.trauma ?? '').trim();
  if (trauma !== 'yes' && trauma !== 'no') return { valid: false, message: 'Answer whether this is an admission after trauma: both scores turn on it.' };
  const f = inputFault([['the age', o.age, 18, 120, 'years'], ['the serum creatinine', o.creatinine, null, 20, 'mg/dL'], ['the modified SOFA score', o.modifiedSofa, 0, 20, '']]);
  if (f) return { valid: false, message: `${f} The modified SOFA score is the SOFA score without its neurological part.` };
  const age = Number(o.age); const scr = Number(o.creatinine); const sofa = Number(o.modifiedSofa);
  if (!Number.isInteger(sofa)) return { valid: false, message: 'The modified SOFA score must be a whole number.' };

  const arcParts = [[age <= 50, 6, 'age 50 or younger'], [trauma === 'yes', 3, 'admission after trauma'], [sofa <= 4, 1, 'modified SOFA 4 or lower']];
  const arc = arcParts.reduce((s, [on, pts]) => s + (on ? pts : 0), 0);
  const notes = [`ARC score (Udy 2013): ${arcParts.map(([on, pts, what]) => `${what} ${on ? pts : 0}`).join(', ')}; total ${arc} of 10. The paper gives no cutoff and calls the score speculative pending validation.`];
  if (scr > 1.24) notes.push(`The ARC score was derived in patients with a creatinine of 110 µmol/L (1.24 mg/dL) or less; ${show(scr)} mg/dL is above that.`);
  const out = { valid: true, arcScore: arc };
  let band = `ARC score ${arc} of 10 (no cutoff is published)`;
  if (trauma === 'no') {
    notes.push('ARCTIC score: not worked out. It was derived in trauma intensive care patients.');
    out.arctic = null;
  } else if (scr > 1.3) {
    notes.push(`ARCTIC score: not worked out. Its study excluded patients with a serum creatinine above 1.3 mg/dL, and this one is ${show(scr)}.`);
    out.arctic = null;
  } else {
    const parts = [[age < 56 ? 4 : age <= 75 ? 3 : 0, age < 56 ? 'age under 56' : age <= 75 ? 'age 56 to 75' : 'age over 75'], [scr < 0.7 ? 3 : 0, 'creatinine below 0.7 mg/dL'], [sex === 'male' ? 2 : 0, 'male sex']];
    const arctic = parts.reduce((s, [pts]) => s + pts, 0);
    const high = arctic >= 6;
    Object.assign(out, { arctic, arcticAtOrAboveSix: high });
    notes.push(`ARCTIC score (Barletta 2017): ${parts.map(([pts, what]) => `${what} ${pts}`).join(', ')}; total ${arctic} of 9. ${high ? 'That is 6 or higher' : 'That is under 6'}: in the study a score of 6 or higher had a sensitivity of 0.843 and a specificity of 0.682 for a measured clearance of 130 mL/min or more.`);
    band += `; ARCTIC score ${arctic} of 9, ${high ? '6 or higher' : 'under 6'}`;
  }
  notes.push('Neither score is a clearance. To know it, measure it: a timed-urine creatinine clearance.');
  return { ...out, band: `${band}.`, bandLabel: out.arctic === null ? `ARC ${arc}` : `ARC ${arc}, ARCTIC ${out.arctic}`, notes, note: NOTE };
}
