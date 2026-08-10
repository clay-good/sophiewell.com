// spec-v680: Kobayashi score — prediction of IVIG resistance in Kawasaki disease.
//
// Completes the Kawasaki IVIG-resistance cluster alongside the egami tile. Source:
//   Kobayashi T, Inoue Y, Takeuchi K, et al. Prediction of intravenous immunoglobulin
//   unresponsiveness in patients with Kawasaki disease. Circulation. 2006;113(22):2606-2612.
//   (PMID 16735679.) Point table cross-checked against later comparison studies.
//
// Weighted sum (0-11), each criterion adds its points when met:
//   serum sodium <= 133 mmol/L         -> 2
//   days of illness at treatment <= 4  -> 2
//   AST >= 100 IU/L                    -> 2
//   neutrophil percentage >= 80%       -> 2
//   CRP >= 10 mg/dL                    -> 1
//   age <= 12 months                   -> 1
//   platelets <= 300 x10^3/uL          -> 1
// A score >= 4 marks HIGH risk of IVIG resistance (Japanese derivation ~76-86% sensitive
// / ~68-70% specific; discrimination is lower in Western and infant cohorts). It is a
// resistance-risk band, not an IVIG or adjunctive-therapy order.
//
// Pure: no DOM, no clock, no network.

export const KOBAYASHI_NOTE = 'Kobayashi score for predicting resistance to intravenous immunoglobulin (IVIG) in Kawasaki disease (Kobayashi T, Inoue Y, Takeuchi K, et al, Circulation 2006;113(22):2606-2612). From pre-treatment values it adds points for serum sodium 133 mmol/L or less (2), treatment started on day 4 of illness or earlier (2), AST 100 IU/L or more (2), neutrophils 80 percent or more (2), CRP 10 mg/dL or more (1), age 12 months or younger (1), and platelets 300,000/uL or fewer (1), for a total of 0 to 11. A score of 4 or more marks a high risk of IVIG resistance (about 76 to 86 percent sensitive and 68 to 70 percent specific in the Japanese derivation), which may prompt considering intensified primary therapy; discrimination is lower in Western and infant cohorts. It is a resistance-risk estimate for the team, not an order for IVIG or adjunctive therapy, and it supports rather than replaces clinical judgment.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

export function kobayashiKawasaki(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sodium = num(o.sodium);
  if (!Number.isFinite(sodium) || sodium <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'sodium', message: 'Enter serum sodium in mmol/L.', note: KOBAYASHI_NOTE };
  }
  const day = num(o.illnessDay);
  if (!Number.isFinite(day) || day < 0 || day > 60) {
    return { valid: false, code: 'MISSING_INPUT', field: 'illnessDay', message: 'Enter the day of illness at the start of treatment.', note: KOBAYASHI_NOTE };
  }
  const ast = num(o.ast);
  if (!Number.isFinite(ast) || ast < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'ast', message: 'Enter AST in IU/L.', note: KOBAYASHI_NOTE };
  }
  const neutrophil = num(o.neutrophil);
  if (!Number.isFinite(neutrophil) || neutrophil < 0 || neutrophil > 100) {
    return { valid: false, code: 'MISSING_INPUT', field: 'neutrophil', message: 'Enter neutrophil percentage (0-100).', note: KOBAYASHI_NOTE };
  }
  const crp = num(o.crp);
  if (!Number.isFinite(crp) || crp < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'crp', message: 'Enter CRP in mg/dL.', note: KOBAYASHI_NOTE };
  }
  const ageMonths = num(o.ageMonths);
  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 300) {
    return { valid: false, code: 'MISSING_INPUT', field: 'ageMonths', message: 'Enter age in months.', note: KOBAYASHI_NOTE };
  }
  const platelets = num(o.platelets);
  if (!Number.isFinite(platelets) || platelets <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'platelets', message: 'Enter platelet count in x10^3/uL (e.g. 250 for 250,000/uL).', note: KOBAYASHI_NOTE };
  }

  let total = 0;
  const factors = [];
  const add = (pts, label) => { if (pts > 0) { total += pts; factors.push(`${label} (${pts})`); } };

  add(sodium <= 133 ? 2 : 0, 'sodium 133 or less');
  add(day <= 4 ? 2 : 0, 'treatment by day 4');
  add(ast >= 100 ? 2 : 0, 'AST 100 or more');
  add(neutrophil >= 80 ? 2 : 0, 'neutrophils 80% or more');
  add(crp >= 10 ? 1 : 0, 'CRP 10 or more');
  add(ageMonths <= 12 ? 1 : 0, 'age 12 months or less');
  add(platelets <= 300 ? 1 : 0, 'platelets 300 or less');

  const high = total >= 4;
  return {
    valid: true,
    score: total,
    tier: high ? 'high' : 'low',
    abnormal: high,
    factors,
    bandLabel: `Kobayashi ${total} of 11`,
    band: `Kobayashi ${total} of 11 — ${high ? 'high' : 'low'} risk of IVIG resistance (>= 4).`,
    detail: high
      ? 'Score 4 or more: high risk of IVIG resistance; consider intensified primary therapy. Discrimination is lower in Western and infant cohorts.'
      : 'Score under 4: lower risk of IVIG resistance by this score.',
    note: KOBAYASHI_NOTE,
  };
}
