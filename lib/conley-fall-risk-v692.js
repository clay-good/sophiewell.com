// spec-v692: Conley Fall Risk Scale.
//
// A six-item nursing fall-risk screen for the general-hospital adult, combining a brief
// patient/interview part with nurse observation. Source:
//   Conley D, Schultz AA, Selvin R. The challenge of predicting patients at risk for
//   falling: development of the Conley Scale. Medsurg Nurs. 1999;8(6):348-354. Item weights
//   confirmed in Guzzo AS, et al. Conley Scale: assessment of a fall risk prevention tool in
//   a General Hospital. J Prev Med Hyg. 2015;56(2):E77-E81 (PMC4718351).
//
// Total 0-10, points added when present:
//   Interview: fallen in the last 3 months (2); dizziness or vertigo (1); loss of urine or
//     stool on the way to the bathroom / urgency (1).
//   Nurse observation: impaired judgment / lack of safety awareness (3); agitation (2);
//     impaired gait (shuffling, wide base, or unsteady walk) (1).
// A score of 2 or more (or any fall during the stay) should initiate fall-prevention
// strategies.
//
// Pure: no DOM, no clock, no network.

export const CONLEY_NOTE = 'Conley Fall Risk Scale (Conley D, Schultz AA, Selvin R, Medsurg Nurs 1999;8(6):348-354; weights per Guzzo AS, et al, J Prev Med Hyg 2015;56(2):E77-E81). A six-item nursing fall-risk screen for the general-hospital adult. Interview part: having fallen in the last 3 months adds 2, dizziness or vertigo adds 1, and loss of urine or stool on the way to the bathroom (urgency) adds 1. Nurse-observation part: impaired judgment or a lack of safety awareness adds 3, agitation adds 2, and an impaired gait - shuffling, wide-based, or unsteady - adds 1. The total ranges from 0 to 10, and a score of 2 or more (or any fall during the hospital stay) should trigger fall-prevention strategies. It is a screening aid to prompt prevention, not a prediction of any individual fall, and it supports rather than replaces clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const ITEMS = [
  { key: 'previousFalls', pts: 2, label: 'fell in last 3 months' },
  { key: 'dizziness', pts: 1, label: 'dizziness or vertigo' },
  { key: 'incontinence', pts: 1, label: 'urgency / incontinence to bathroom' },
  { key: 'impairedJudgment', pts: 3, label: 'impaired judgment' },
  { key: 'agitation', pts: 2, label: 'agitation' },
  { key: 'impairedGait', pts: 1, label: 'impaired gait' },
];

export function conleyFallRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const factors = [];
  for (const it of ITEMS) {
    if (truthy(o[it.key])) { total += it.pts; factors.push(`${it.label} (${it.pts})`); }
  }

  const atRisk = total >= 2;
  return {
    valid: true,
    score: total,
    tier: atRisk ? 'at-risk' : 'low',
    abnormal: atRisk,
    factors,
    bandLabel: `Conley ${total} of 10`,
    band: `Conley ${total} of 10 — ${atRisk ? 'at risk of falling' : 'lower fall risk'} (>= 2).`,
    detail: atRisk
      ? 'Score 2 or more (or any fall during the stay): initiate fall-prevention strategies.'
      : 'Score under 2: lower fall risk by this screen; reassess if status changes.',
    note: CONLEY_NOTE,
  };
}
