// spec-v677: McMahon Score for rhabdomyolysis.
//
// Predicts the composite risk of in-hospital death OR acute kidney injury requiring
// renal replacement therapy (RRT) in rhabdomyolysis, from admission variables. This is
// the first rhabdomyolysis tile in the catalog. Source:
//   McMahon GM, Zeng X, Waikar SS. A risk prediction score for kidney failure or
//   mortality in rhabdomyolysis. JAMA Intern Med. 2013;173(19):1821-1828. PMID 24000014.
//
// Weighted sum (0-19):
//   age: <=50 = 0, 51-70 = 1.5, 71-80 = 2.5, >80 = 3
//   female sex = 1
//   initial creatinine (mg/dL): <1.4 = 0, 1.4-2.2 = 1.5, >2.2 = 3
//   initial calcium < 7.5 mg/dL = 2
//   initial CPK > 40,000 U/L = 2
//   rhabdomyolysis NOT due to seizures/syncope/exercise/statins/myositis = 3
//   initial phosphate (mg/dL): <4.0 = 0, 4.0-5.4 = 1.5, >5.4 = 3
//   initial bicarbonate < 19 mEq/L = 2
// A score >= 6 marks high risk (consider renal-protective therapy irrespective of CPK);
// < 6 is low risk (~2-3%). The >= 6 cut is ~86% sensitive / ~68% specific for RRT.
//
// Pure: no DOM, no clock, no network.

export const MCMAHON_NOTE = 'McMahon Score for rhabdomyolysis (McMahon GM, Zeng X, Waikar SS, JAMA Intern Med 2013;173(19):1821-1828). Calculated from admission values, it predicts the composite risk of in-hospital death or acute kidney injury needing renal replacement therapy. Points: age (51 to 70 adds 1.5, 71 to 80 adds 2.5, over 80 adds 3), female sex (1), initial creatinine (1.4 to 2.2 mg/dL adds 1.5, above 2.2 adds 3), calcium below 7.5 mg/dL (2), creatine kinase above 40,000 U/L (2), rhabdomyolysis not caused by seizures, syncope, exercise, statins, or myositis (3), phosphate (4.0 to 5.4 mg/dL adds 1.5, above 5.4 adds 3), and bicarbonate below 19 mEq/L (2), for a total of 0 to 19. TWO CUT-OFFS ARE IN CIRCULATION AND THIS TOOL USES THE LATER ONE. The derivation itself cut at 5: McMahon reported that a score below 5 carried about a 3 percent risk of the composite outcome, with a negative predictive value of 97 percent, and that a score above 10 carried 59 percent. Subsequent validation work and a trauma critical-care consensus statement settled on 6 or more, which is about 86 percent sensitive and 68 percent specific for needing renal replacement, and that is the threshold used here. A score of exactly 5 therefore sits below the cut used here and at or above the one the derivation used, which is worth knowing when comparing a result against the original paper. Six or more should prompt consideration of renal-protective therapy regardless of the CPK; scores above 10 carry a substantially higher risk. It is intended for adults with rhabdomyolysis (CPK typically above 5,000 within 72 hours), not for pre-existing end-stage renal disease or CK from myocardial infarction, and it supports rather than replaces clinical judgment.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function agePts(a) { if (a <= 50) return 0; if (a <= 70) return 1.5; if (a <= 80) return 2.5; return 3; }
function creatPts(c) { if (c < 1.4) return 0; if (c <= 2.2) return 1.5; return 3; }
function phosPts(p) { if (p < 4.0) return 0; if (p <= 5.4) return 1.5; return 3; }

function band(total) {
  if (total < 6) return { tier: 'low', label: 'low risk', risk: 'about 2-3%' };
  if (total <= 10) return { tier: 'high', label: 'high risk', risk: 'substantially elevated' };
  return { tier: 'very-high', label: 'very high risk', risk: 'roughly 50% or more' };
}

export function mcmahonRhabdo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = num(o.age);
  if (!Number.isFinite(age) || age < 0 || age > 130) {
    return { valid: false, code: 'MISSING_INPUT', field: 'age', message: 'Enter age in years.' };
  }
  if (!(o.sex === 'male' || o.sex === 'female')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sex', message: 'Select sex (male or female).' };
  }
  const creat = num(o.creatinine);
  if (!Number.isFinite(creat) || creat <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'creatinine', message: 'Enter initial creatinine in mg/dL.' };
  }
  const calcium = num(o.calcium);
  if (!Number.isFinite(calcium) || calcium <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'calcium', message: 'Enter initial calcium in mg/dL.' };
  }
  const cpk = num(o.cpk);
  if (!Number.isFinite(cpk) || cpk < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'cpk', message: 'Enter initial CPK (creatine kinase) in U/L.' };
  }
  if (!(o.cause === 'benign' || o.cause === 'other')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'cause', message: 'Select the cause: seizures/syncope/exercise/statins/myositis, or other.' };
  }
  const phosphate = num(o.phosphate);
  if (!Number.isFinite(phosphate) || phosphate <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'phosphate', message: 'Enter initial phosphate in mg/dL.' };
  }
  const bicarb = num(o.bicarbonate);
  if (!Number.isFinite(bicarb) || bicarb <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'bicarbonate', message: 'Enter initial bicarbonate in mEq/L.' };
  }

  let total = 0;
  const factors = [];
  const add = (pts, label) => { if (pts > 0) { total += pts; factors.push(`${label} (${pts})`); } };

  add(agePts(age), 'age');
  add(o.sex === 'female' ? 1 : 0, 'female sex');
  add(creatPts(creat), 'creatinine');
  add(calcium < 7.5 ? 2 : 0, 'calcium < 7.5');
  add(cpk > 40000 ? 2 : 0, 'CPK > 40,000');
  add(o.cause === 'other' ? 3 : 0, 'non-benign cause');
  add(phosPts(phosphate), 'phosphate');
  add(bicarb < 19 ? 2 : 0, 'bicarbonate < 19');

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // Flag the actionable high-risk cutoff (>= 6).
    abnormal: total >= 6,
    factors,
    band: `McMahon ${total}/19 — ${b.label} of death or renal replacement (risk ${b.risk}).`,
    detail: total >= 6
      ? 'Score 6 or more: high risk. The authors suggest considering renal-protective therapy regardless of the CPK.'
      : 'Score under 6: low risk (about a 2-3% chance of death or renal replacement).',
    note: MCMAHON_NOTE,
  };
}
