// spec-v86 (first feature spec of the spec-v85 Advanced Clinical Calculators
// program): three deterministic toxicology decision rules.
//
//   serotoninToxicity  - Hunter Serotonin Toxicity Criteria (Dunkley 2003)
//   salicylateToxicity - EXTRIP hemodialysis-indication rule (Juurlink 2015)
//   toxicAlcohol       - ethanol-corrected osmolar gap + AACT fomepizole rule
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v12.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz
// harness can drive each field through its adversarial matrix; each guards its
// arithmetic so no non-finite value reaches a returned string (spec-v59).
// num/r1 come from lib/num.js (spec-v53 §4.1). None authors a treatment order
// in Sophie's voice (spec-v11 §5.3) - each surfaces the rule's verdict and the
// criterion that fired, attributed to the cited source.

import { r1 } from './num.js';

// Loose boolean coercion: a checkbox value, '1'/'true', or a real boolean.
const B = (v) => v === true || v === 1 || v === '1' || v === 'true';
// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined) is treated
// as "not provided" rather than throwing, so optional clinical fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Non-negative finite, defaulting to 0 (for additive osmolality terms).
const nn = (v) => { const f = fin(v); return f != null && f >= 0 ? f : 0; };

// --- 2.1 serotoninToxicity - Hunter Serotonin Toxicity Criteria -------------
// Dunkley 2003: in the presence of a serotonergic agent, serotonin toxicity is
// diagnosed when ANY of five decision branches is satisfied. Pure boolean
// branch logic; no arithmetic. Gates on the serotonergic-agent precondition -
// without it the rule does not apply (returns a surfaced "not applicable",
// never a silent negative).
export function serotoninToxicity({
  serotonergicAgent, spontaneousClonus, inducibleClonus, ocularClonus,
  agitation, diaphoresis, tremor, hyperreflexia, hypertonia, tempOver38,
} = {}) {
  const agent = B(serotonergicAgent);
  if (!agent) {
    return {
      applicable: false,
      meets: false,
      branch: null,
      band: 'Criteria not applicable: the Hunter rule assumes a serotonergic exposure.',
      note: 'Enter the serotonergic-agent precondition. A negative finding here does not exclude another diagnosis.',
    };
  }
  const sClonus = B(spontaneousClonus);
  const iClonus = B(inducibleClonus);
  const oClonus = B(ocularClonus);
  const agit = B(agitation);
  const diaph = B(diaphoresis);
  const trem = B(tremor);
  const hyper = B(hyperreflexia);
  const tone = B(hypertonia);
  const hot = B(tempOver38);

  let branch = null;
  if (sClonus) branch = 'spontaneous clonus';
  else if (iClonus && (agit || diaph)) branch = 'inducible clonus with agitation or diaphoresis';
  else if (oClonus && (agit || diaph)) branch = 'ocular clonus with agitation or diaphoresis';
  else if (trem && hyper) branch = 'tremor with hyperreflexia';
  else if (tone && hot && (oClonus || iClonus)) branch = 'hypertonia, temperature over 38 C, and ocular or inducible clonus';

  const meets = branch !== null;
  return {
    applicable: true,
    meets,
    branch,
    band: meets
      ? `Meets Hunter criteria for serotonin toxicity (${branch}).`
      : 'Does not meet Hunter criteria for serotonin toxicity.',
    note: 'Hunter criteria are more specific than the older Sternbach criteria (sensitivity 84 percent, specificity 97 percent vs a toxicologist diagnosis, Dunkley 2003). Decision support, not a diagnosis; correlate with the full clinical picture and poison-control input.',
  };
}

// --- 2.2 salicylateToxicity - EXTRIP hemodialysis indication ----------------
// Juurlink 2015 (EXTRIP Workgroup): extracorporeal treatment (intermittent
// hemodialysis preferred) is RECOMMENDED when any cited threshold trips and
// SUGGESTED when standard therapy fails or is unavailable. The whole value is
// naming which criterion tripped. The discredited Done nomogram is not used.
// Level is unit-aware (mg/dL <-> mmol/L; salicylate MW 138.12, so 1 mmol/L =
// 13.81 mg/dL).
export function salicylateToxicity({
  level, unit, pH, poisoningType, alteredMentalStatus, hypoxemia,
  impairedKidney, standardTherapyFailing,
} = {}) {
  const rawLevel = fin(level);
  const levelMgDl = rawLevel != null && rawLevel > 0
    ? (unit === 'mmoll' ? rawLevel * 13.81 : rawLevel)
    : null;
  const acute = poisoningType !== 'chronic';
  const ph = fin(pH);
  const ams = B(alteredMentalStatus);
  const hypox = B(hypoxemia);
  const ckd = B(impairedKidney);
  const failing = B(standardTherapyFailing);

  const recommendCriteria = [];
  if (ams) recommendCriteria.push('altered mental status');
  if (hypox) recommendCriteria.push('new hypoxemia requiring supplemental oxygen');
  if (ph != null && ph > 6.5 && ph < 8 && ph <= 7.20) recommendCriteria.push('arterial pH 7.20 or below despite optimal care');
  if (levelMgDl != null && acute && levelMgDl > 100) recommendCriteria.push('salicylate over 100 mg/dL in acute poisoning');
  if (levelMgDl != null && ckd && levelMgDl > 90) recommendCriteria.push('salicylate over 90 mg/dL with impaired kidney function');

  let recommendation;
  let criteria;
  if (recommendCriteria.length) {
    recommendation = 'Hemodialysis recommended (EXTRIP).';
    criteria = recommendCriteria;
  } else if (failing) {
    recommendation = 'Hemodialysis suggested (EXTRIP): standard therapy failing or unavailable.';
    criteria = ['standard therapy (fluids, urinary alkalinization) failing or unavailable'];
  } else {
    recommendation = 'No listed EXTRIP hemodialysis criterion met on the entered data.';
    criteria = [];
  }

  // Severity framing by level (approximate, acute) - context, not a threshold.
  let severity = null;
  if (levelMgDl != null) {
    if (levelMgDl >= 100) severity = 'severe by level';
    else if (levelMgDl >= 60) severity = 'moderate-to-severe by level';
    else if (levelMgDl >= 30) severity = 'mild-to-moderate by level';
    else severity = 'low / therapeutic range by level';
  }

  return {
    levelMgDl: levelMgDl != null ? r1(levelMgDl) : null,
    recommendation,
    criteria,
    criteriaText: criteria.length ? criteria.join('; ') : null,
    severity,
    note: 'EXTRIP recommends intermittent hemodialysis as the preferred modality. The Done nomogram is not used (it misclassifies chronic and post-acute poisoning). Decision support per the cited EXTRIP recommendation; confirm with your toxicology / poison-control consult and local protocol.',
  };
}

// --- 2.3 toxicAlcohol - osmolar gap + AACT fomepizole indication ------------
// Smithline 1976 calculated osmolality, ethanol-corrected; the osmolar gap is
// measured - calculated (signed, not clamped - a strongly negative gap is a
// measurement-error flag). The AACT (Barceloux) fomepizole indication fires on
// a documented level over 20 mg/dL, or recent ingestion with gap over 10, or a
// strong suspicion with at least two of (pH < 7.3, bicarbonate < 20, gap > 10).
// A normal gap late in the course does NOT exclude toxic alcohol.
export function toxicAlcohol({
  measuredOsm, sodium, glucose, bun, ethanol, pH, bicarbonate,
  knownLevel, recentIngestion, strongSuspicion,
} = {}) {
  const osmMeasured = fin(measuredOsm);
  const na = fin(sodium);
  if (osmMeasured == null || osmMeasured <= 0 || na == null || na <= 0) return null;

  const glu = nn(glucose);
  const urea = nn(bun);
  const etoh = nn(ethanol);
  // Calculated osmolality (mOsm/kg): 2*Na + glucose/18 + BUN/2.8 + ethanol/3.7.
  const calcOsm = 2 * na + glu / 18 + urea / 2.8 + etoh / 3.7;
  const gap = osmMeasured - calcOsm;

  const ph = fin(pH);
  const bicarb = fin(bicarbonate);
  const level = fin(knownLevel);
  const recent = B(recentIngestion);
  const suspicion = B(strongSuspicion);

  const limbs = [];
  if (level != null && level > 20) limbs.push('documented methanol or ethylene-glycol level over 20 mg/dL');
  if (recent && gap > 10) limbs.push('recent-ingestion history with osmolar gap over 10');
  if (suspicion) {
    let supportive = 0;
    if (ph != null && ph > 6.5 && ph < 8 && ph < 7.3) supportive += 1;
    if (bicarb != null && bicarb >= 0 && bicarb < 20) supportive += 1;
    if (gap > 10) supportive += 1;
    if (supportive >= 2) limbs.push(`strong suspicion with ${supportive} of (pH under 7.3, bicarbonate under 20, gap over 10)`);
  }
  const indicated = limbs.length > 0;

  return {
    calcOsm: r1(calcOsm),
    osmolarGap: r1(gap),
    indicated,
    limbs,
    limbsText: limbs.length ? limbs.join('; ') : null,
    band: indicated
      ? 'Fomepizole indicated per the AACT criteria on the entered data.'
      : 'No AACT fomepizole indication met on the entered data.',
    note: 'A NORMAL osmolar gap does not exclude toxic alcohol once the parent has been metabolized to its acids; at that point the anion gap rises instead. Ethanol defaults to 0 when not entered (its term drops out). Decision support per the cited AACT guidance; confirm a measured methanol / ethylene-glycol level and consult toxicology / poison control.',
  };
}
