// spec-v700: MALT-IPI (MALT lymphoma International Prognostic Index).
//
// A prognostic index for extranodal marginal-zone (MALT) lymphoma. Source:
//   Thieblemont C, Cascione L, Conconi A, et al. A MALT lymphoma prognostic index.
//   Blood. 2017;130(12):1409-1417. (PMID 28720586.) Derived on the IELSG-19 trial.
//
// Three factors, each worth 1 point (total 0-3):
//   Age >= 70 years
//   Ann Arbor stage III or IV
//   Elevated LDH (above the upper limit of normal)
//
// Risk groups: 0 = low; 1 = intermediate; >= 2 = high. Approximate 5-year event-free
// survival: low ~70%, intermediate ~56%, high ~29%.
//
// Pure: no DOM, no clock, no network.

export const MALT_IPI_NOTE = 'MALT-IPI, the MALT lymphoma International Prognostic Index (Thieblemont C, Cascione L, Conconi A, et al, Blood 2017;130(12):1409-1417). For extranodal marginal-zone (MALT) lymphoma it adds one point each for age 70 years or older, Ann Arbor stage III or IV, and an elevated LDH above the upper limit of normal, for a total of 0 to 3. A score of 0 is low risk, 1 is intermediate risk, and 2 or more is high risk, with approximate 5-year event-free survival of about 70 percent, 56 percent, and 29 percent respectively. It is a prognostic stratification derived on the IELSG-19 trial, not a treatment decision, and it supports rather than replaces clinical judgment and multidisciplinary care.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function maltIpi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const factors = [];
  if (truthy(o.ageOver70)) { total += 1; factors.push('age >= 70'); }
  if (truthy(o.advancedStage)) { total += 1; factors.push('Ann Arbor stage III/IV'); }
  if (truthy(o.elevatedLdh)) { total += 1; factors.push('elevated LDH'); }

  let tier, label, survival;
  if (total === 0) { tier = 'low'; label = 'low risk'; survival = 'about 70%'; }
  else if (total === 1) { tier = 'intermediate'; label = 'intermediate risk'; survival = 'about 56%'; }
  else { tier = 'high'; label = 'high risk'; survival = 'about 29%'; }

  return {
    valid: true,
    score: total,
    tier,
    abnormal: total >= 2,
    factors,
    survival,
    bandLabel: `MALT-IPI ${total} of 3`,
    band: `MALT-IPI ${total} of 3 — ${label} (5-year EFS ${survival}).`,
    detail: `Age >= 70, Ann Arbor stage III/IV, elevated LDH - one point each. Groups: 0 low, 1 intermediate, >= 2 high. Approximate 5-year event-free survival: low ~70%, intermediate ~56%, high ~29%.`,
    note: MALT_IPI_NOTE,
  };
}
