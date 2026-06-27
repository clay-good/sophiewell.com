// spec-v166 (the fourth feature spec of the spec-v162 Cross-Discipline
// Completion program): generic pharmacokinetics + the antipsychotic
// chlorpromazine-equivalent converter. These fill the generic-PK gap (beside the
// drug-specific vanc/aminoglycoside/digoxin tiles) and the psych-equivalence gap
// (the parallel to the live opioid/benzo/steroid converters). None duplicates a
// live tile; v166 runs no AI and makes no runtime network call.
//
//   pkSuite                  - loading / maintenance dose, k, half-life, time to
//                              steady state (first-order PK relations)
//   chlorpromazineEquivalents - antipsychotic chlorpromazine-equivalent daily dose
//
// Per the spec-v100 §2 doctrine each is closed-form arithmetic over the entered
// values. Citations live inline in lib/meta.js; the renderers in
// views/group-v166.js render the spec-v50 §3 posture note and defer the decision
// to the clinician (spec-v11 §5.3).
//
// DEFERRAL (spec-v97): lithium-maintenance (Cooper 1973 nomogram) is NOT shipped.
// The discrete level→dose band table cannot be cross-verified to >= 2 independent
// sources — the primary (Am J Psychiatry 1973;130(5):601-603) is paywalled and
// the only secondary carrying the full table presents it as a non-extractable
// image, and the one published closed-form (D = e^(4.80−7.5·C) mmol/day) does not
// cleanly reproduce the commonly-cited band table. Parked with crib-ii /
// gail-bcrat until a verbatim second source is available.
//
// SOURCE-GOVERNANCE (cross-verified, spec-v97):
//   - pkSuite (Rowland M, Tozer TN, Clinical Pharmacokinetics and
//     Pharmacodynamics, 4th ed; first-order relations): loading dose = Vd·Cp/F;
//     maintenance dose per interval = CL·Css·τ/F; elimination rate constant
//     k = CL/Vd; half-life t½ = 0.693·Vd/CL = ln2/k; time to steady state = 5·t½.
//     Each output is computed only when its inputs are present; every division
//     (F, Vd, CL) is guarded.
//   - chlorpromazineEquivalents (Woods SW, J Clin Psychiatry 2003;64(6):663-667;
//     each factor confirmed across >= 2 sources — the Woods abstract, the
//     chlorpromazineR package encoding, and the Andreasen 2010 comparison):
//     daily mg equivalent to 100 mg chlorpromazine — chlorpromazine 100,
//     haloperidol 2, risperidone 2, olanzapine 5, quetiapine 75, ziprasidone 60,
//     aripiprazole 7.5. CPZ-equivalent mg = daily dose × (100 / factor). Woods
//     2003 covers the newer atypicals with haloperidol as the anchor; equivalence
//     methods differ (DDD vs consensus vs Woods) so the method is named and the
//     result is an approximation. Agents outside this set are not converted (to
//     avoid mixing methods).

import { num, r1, r2 } from './num.js';

// Strictly positive bounded reader (returns null on blank / non-finite / <= 0).
function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

// --- 2.1 Pharmacokinetics suite ---------------------------------------------
const PK_NOTE = 'Pharmacokinetics suite, first-order relations (Rowland & Tozer, Clinical Pharmacokinetics and Pharmacodynamics, 4th ed). Loading dose = Vd·Cp/F; maintenance dose per interval = CL·Css·τ/F; elimination rate constant k = CL/Vd; half-life t½ = 0.693·Vd/CL = ln2/k; time to steady state ≈ 5·t½. Each relation is computed only when its inputs are present. These are point estimates requiring individualization and therapeutic monitoring, not a Bayesian/population estimator.';

export function pkSuite(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vd = pos(o.vd, 1e6);
  const cl = pos(o.cl, 1e6);
  const cp = pos(o.cp, 1e6); // target / desired concentration (mg/L)
  const fRaw = o.f === '' || o.f === null || o.f === undefined ? 1 : Number(o.f);
  const f = Number.isFinite(fRaw) && fRaw > 0 && fRaw <= 1 ? fRaw : null;
  const tau = o.tau === '' || o.tau === null || o.tau === undefined ? null : pos(o.tau, 1000);
  if (f === null) return { valid: false, message: 'Bioavailability F must be between 0 (exclusive) and 1.' };
  // Need at least one computable relation.
  const loading = vd !== null && cp !== null ? r1(num('loading dose', (vd * cp) / f, { min: 0, max: 1e9 })) : null;
  const maintenance = cl !== null && cp !== null && tau !== null ? r1(num('maintenance dose', (cl * cp * tau) / f, { min: 0, max: 1e9 })) : null;
  const k = vd !== null && cl !== null ? r2(num('k', cl / vd, { min: 0, max: 1e6 })) : null;
  const halfLife = vd !== null && cl !== null ? r2(num('half-life', (0.693 * vd) / cl, { min: 0, max: 1e6 })) : null;
  const steadyState = halfLife !== null ? r2(num('time to steady state', 5 * halfLife, { min: 0, max: 1e7 })) : null;
  if (loading === null && maintenance === null && halfLife === null) {
    return { valid: false, message: 'Enter at least Vd and CL (for k / half-life), or Vd and target concentration (for a loading dose).' };
  }
  const parts = [];
  if (halfLife !== null) parts.push(`half-life ${halfLife} h`);
  if (steadyState !== null) parts.push(`steady state ≈ ${steadyState} h`);
  if (loading !== null) parts.push(`loading dose ${loading} mg`);
  if (maintenance !== null) parts.push(`maintenance ${maintenance} mg/interval`);
  return {
    valid: true,
    loading,
    maintenance,
    k,
    halfLife,
    steadyState,
    f,
    bandLabel: 'Pharmacokinetics',
    band: parts.length ? `${parts.join('; ')}.` : 'Enter the parameters for the relation you need.',
    detail: `${k !== null ? `Elimination rate constant k = CL/Vd = ${k}/h. ` : ''}Each relation is computed only from the inputs you supply (Vd, CL, target concentration, F, interval τ).`,
    note: PK_NOTE,
  };
}

// --- 2.2 Chlorpromazine equivalents -----------------------------------------
const CPZ_NOTE = 'Antipsychotic chlorpromazine equivalents (Woods SW, J Clin Psychiatry 2003;64(6):663-667). The daily dose equivalent to 100 mg chlorpromazine: chlorpromazine 100, haloperidol 2, risperidone 2, olanzapine 5, quetiapine 75, ziprasidone 60, aripiprazole 7.5. CPZ-equivalent mg = daily dose × (100 / agent factor). Woods 2003 covers the newer atypicals with haloperidol as the anchor; equivalence methods differ (DDD, consensus, Woods) and conversions are approximations, not a substitute for individualized cross-titration.';

// Daily mg equivalent to 100 mg chlorpromazine (Woods 2003).
const CPZ_FACTOR = {
  chlorpromazine: { mg: 100, label: 'Chlorpromazine' },
  haloperidol: { mg: 2, label: 'Haloperidol' },
  risperidone: { mg: 2, label: 'Risperidone' },
  olanzapine: { mg: 5, label: 'Olanzapine' },
  quetiapine: { mg: 75, label: 'Quetiapine' },
  ziprasidone: { mg: 60, label: 'Ziprasidone' },
  aripiprazole: { mg: 7.5, label: 'Aripiprazole' },
};

export function chlorpromazineEquivalents(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const agent = typeof o.agent === 'string' && Object.prototype.hasOwnProperty.call(CPZ_FACTOR, o.agent) ? o.agent : '';
  const dose = pos(o.dose, 1e5);
  const missing = [];
  if (!agent) missing.push('antipsychotic agent');
  if (dose === null) missing.push('total daily dose (mg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const { mg, label } = CPZ_FACTOR[agent];
  const cpzEq = r1(num('CPZ equivalent', dose * (100 / mg), { min: 0, max: 1e7 }));
  return {
    valid: true,
    agent,
    label,
    factor: mg,
    cpzEq,
    bandLabel: 'Chlorpromazine equivalent',
    band: `${label} ${dose} mg/day ≈ ${cpzEq} mg chlorpromazine equivalent (Woods 2003).`,
    detail: `${label} ${mg} mg ≈ 100 mg chlorpromazine; CPZ-eq = ${dose} × (100/${mg}). Equivalence methods differ — this is the Woods 2003 anchor and an approximation.`,
    note: CPZ_NOTE,
  };
}
