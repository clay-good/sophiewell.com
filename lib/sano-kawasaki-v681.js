// spec-v681: Sano score — prediction of IVIG resistance in Kawasaki disease.
//
// The third of the Japanese IVIG-resistance risk scores, completing the cluster with
// the egami and kobayashi-kawasaki tiles. Source:
//   Sano T, Kurotobi S, Matsuzaki K, et al. Prediction of non-responsiveness to standard
//   high-dose gamma-globulin therapy in patients with acute Kawasaki disease before
//   starting initial treatment. Eur J Pediatr. 2007;166(2):131-137. (PMID 16896641.)
//
// Three pre-treatment criteria, each worth 1 point (count of criteria met, 0-3):
//   AST >= 200 IU/L
//   total bilirubin >= 0.9 mg/dL
//   CRP >= 7 mg/dL
// Meeting >= 2 of the 3 marks HIGH risk of IVIG resistance (derivation ~77% sensitive /
// ~86% specific). It is a resistance-risk band, not an IVIG or adjunctive-therapy order.
//
// Pure: no DOM, no clock, no network.

export const SANO_NOTE = 'Sano score for predicting resistance to intravenous immunoglobulin (IVIG) in Kawasaki disease (Sano T, Kurotobi S, Matsuzaki K, et al, Eur J Pediatr 2007;166(2):131-137). Before starting treatment it counts three findings, each worth 1 point: AST 200 IU/L or more, total bilirubin 0.9 mg/dL or more, and CRP 7 mg/dL or more, for a total of 0 to 3. Meeting 2 or more of the 3 criteria marks a high risk of IVIG resistance (about 77 percent sensitive and 86 percent specific in the derivation), which may prompt considering intensified primary therapy; discrimination is lower in Western and infant cohorts. It is a resistance-risk estimate for the team, not an order for IVIG or adjunctive therapy, and it supports rather than replaces clinical judgment.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

export function sanoKawasaki(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ast = num(o.ast);
  if (!Number.isFinite(ast) || ast < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'ast', message: 'Enter AST in IU/L.', note: SANO_NOTE };
  }
  const bilirubin = num(o.bilirubin);
  if (!Number.isFinite(bilirubin) || bilirubin < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'bilirubin', message: 'Enter total bilirubin in mg/dL.', note: SANO_NOTE };
  }
  const crp = num(o.crp);
  if (!Number.isFinite(crp) || crp < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'crp', message: 'Enter CRP in mg/dL.', note: SANO_NOTE };
  }

  const factors = [];
  const check = (met, label) => { if (met) factors.push(label); return met ? 1 : 0; };
  let total = 0;
  total += check(ast >= 200, 'AST 200 or more');
  total += check(bilirubin >= 0.9, 'bilirubin 0.9 or more');
  total += check(crp >= 7, 'CRP 7 or more');

  const high = total >= 2;
  return {
    valid: true,
    score: total,
    tier: high ? 'high' : 'low',
    abnormal: high,
    factors,
    bandLabel: `Sano ${total} of 3`,
    band: `Sano ${total} of 3 — ${high ? 'high' : 'low'} risk of IVIG resistance (>= 2).`,
    detail: high
      ? 'Two or more criteria met: high risk of IVIG resistance; consider intensified primary therapy. Discrimination is lower in Western and infant cohorts.'
      : 'Fewer than two criteria met: lower risk of IVIG resistance by this score.',
    note: SANO_NOTE,
  };
}
