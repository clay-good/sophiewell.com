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

import { boundsAdvisory } from './bounds.js';

// spec-v1234: this tile's criteria are threshold comparisons, so past a
// threshold the size of the number stops mattering. Envelope and wording from
// BOUNDS + boundsAdvisory in lib/bounds.js; nothing clinical is decided here,
// and the check runs after the tile's own missing-value branch (spec-v1207) so a
// blank field is still asked for by name.
function envelopeFault(rows, note) {
  for (const [key, v] of rows) {
    // spec-v1234: `Number('')` is 0 and 0 is finite, so a blank field reached
    // `boundsAdvisory` as a measurement of zero -- which is BELOW several
    // envelopes. `phoenix-sepsis`'s own worked example leaves the INR out, and
    // this printed "Input below the plausible range for INR (0.5 to 20)" over the
    // whole tile. The repo has hit this exact trap at spec-v1038, spec-v1040 and
    // spec-v1213; `measured()` in lib/num.js exists for it.
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (!Number.isFinite(Number(v))) continue;
    const fault = boundsAdvisory(key, Number(v));
    if (fault) return { valid: false, code: 'INVALID_INPUT', message: fault, band: fault, note };
  }
  return null;
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
  const sanoFault = envelopeFault([['bilirubin', bilirubin]], SANO_NOTE);
  if (sanoFault) return sanoFault;

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
