// spec-v878: the KDIGO 2021 risk categories for membranous nephropathy.
//
// Source:
//   Kidney Disease: Improving Global Outcomes (KDIGO) Glomerular Diseases Work Group. KDIGO 2021
//   Clinical Practice Guideline for the Management of Glomerular Diseases.
//   Kidney Int. 2021;100(4S):S1-S276.
//
//   Low          normal eGFR, proteinuria below 3.5 g/day, and serum albumin above 3.0 g/dL; or
//                proteinuria that has fallen by more than 50% after six months of supportive
//                therapy.
//   Moderate     normal eGFR, proteinuria above 3.5 g/day that has NOT fallen by more than 50%
//                after six months of supportive therapy, and the high-risk criteria not met.
//   High         eGFR below 60, or proteinuria above 8 g/day for more than six months; or normal
//                eGFR with proteinuria above 3.5 g/day and at least one of a serum albumin below
//                2.5 g/dL, an anti-PLA2R above 50 RU/mL, or raised urinary alpha-1 microglobulin
//                or IgG excretion.
//   Very high    life-threatening nephrotic syndrome, or a rapid unexplained fall in kidney
//                function.
//
// THE CATEGORY IS THE THING THAT DRIVES IMMUNOSUPPRESSION, NOT THE PROTEINURIA ALONE, AND THAT IS
// WHY THIS TILE EXISTS. Heavy proteinuria in a patient who has not yet had six months of
// supportive therapy is a moderate-risk picture, not an indication by itself.
//
// SIX MONTHS OF SUPPORTIVE THERAPY IS PART OF THE DEFINITION. The low and moderate categories
// are separated by what happened over that period, so the answer changes with time and not only
// with the numbers.
//
// A HIGH ANTI-PLA2R DOES NOT MAKE A CASE HIGH RISK ON ITS OWN. It counts only alongside
// proteinuria above 3.5 g/day.
//
// VERY HIGH RISK IS A CLINICAL PICTURE, NOT A NUMBER. Nothing in the laboratory panel produces
// it.
//
// Pure: no DOM, no clock, no network.

export const MN_NOTE = 'The KDIGO 2021 guideline for glomerular diseases sorts membranous nephropathy into four risk categories that guide whether immunosuppression is considered. Low risk is a normal eGFR with proteinuria below 3.5 g per day and a serum albumin above 3.0 g/dL, or proteinuria that has fallen by more than half after six months of supportive therapy. Moderate risk is a normal eGFR with proteinuria above 3.5 g per day that has not fallen by more than half over six months of supportive therapy, without the high-risk features. High risk is an eGFR below 60, or proteinuria above 8 g per day persisting beyond six months, or a normal eGFR with proteinuria above 3.5 g per day together with at least one of a serum albumin below 2.5 g/dL, an anti-PLA2R antibody above 50 RU/mL, or raised urinary alpha-1 microglobulin or IgG excretion. Very high risk is a life-threatening nephrotic syndrome or a rapid unexplained fall in kidney function. Four things about the categories are worth stating plainly. The category, not the proteinuria alone, is what drives the decision about immunosuppression. Six months of supportive therapy is part of the definition, so the low and moderate categories are separated by what happened over that period and the answer changes with time rather than only with the numbers. A high anti-PLA2R antibody does not make a case high risk on its own, since it counts only alongside proteinuria above 3.5 g per day. And very high risk is a clinical picture rather than a number, so nothing in the laboratory panel produces it. It applies published risk categories to values already recorded. It does not decide whether to start immunosuppression.';

export const PROTEINURIA_NEPHROTIC = 3.5;
export const PROTEINURIA_HIGH = 8;
export const ALBUMIN_LOW = 3.0;
export const ALBUMIN_VERY_LOW = 2.5;
export const PLA2R_HIGH = 50;
export const EGFR_LOW = 60;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function membranousRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const egfr = num(o.egfr);
  const proteinuria = num(o.proteinuria);
  const albumin = num(o.albumin);
  const pla2r = num(o.pla2r);

  for (const [label, v, lo, hi] of [
    ['eGFR', egfr, 0, 200],
    ['proteinuria in grams per day', proteinuria, 0, 50],
    ['serum albumin in g/dL', albumin, 0, 8],
    ['anti-PLA2R in RU/mL', pla2r, 0, 5000],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  const lifeThreatening = on(o.lifeThreateningNephrotic);
  const rapidDecline = on(o.rapidUnexplainedDecline);
  const sixMonthsSupportive = on(o.sixMonthsSupportive);
  const halvedProteinuria = on(o.proteinuriaHalved);
  const persistentEightPlus = on(o.proteinuriaOverEightSixMonths);
  const urinaryMarkers = on(o.urinaryMarkersRaised);

  const normalEgfr = egfr !== null && egfr >= EGFR_LOW;
  const lowEgfr = egfr !== null && egfr < EGFR_LOW;
  const nephroticRange = proteinuria !== null && proteinuria > PROTEINURIA_NEPHROTIC;

  const highAddOn = (albumin !== null && albumin < ALBUMIN_VERY_LOW)
    || (pla2r !== null && pla2r > PLA2R_HIGH)
    || urinaryMarkers;

  const highRisk = lowEgfr
    || persistentEightPlus
    || (normalEgfr && nephroticRange && highAddOn);

  const lowRisk = (normalEgfr && proteinuria !== null && proteinuria < PROTEINURIA_NEPHROTIC && albumin !== null && albumin > ALBUMIN_LOW)
    || (sixMonthsSupportive && halvedProteinuria);

  const category = lifeThreatening || rapidDecline
    ? 'very-high'
    : highRisk
      ? 'high'
      : lowRisk
        ? 'low'
        : normalEgfr && nephroticRange
          ? 'moderate'
          : 'not-categorized';

  const reasons = [];
  if (category === 'very-high') {
    if (lifeThreatening) reasons.push('a life-threatening nephrotic syndrome');
    if (rapidDecline) reasons.push('a rapid unexplained fall in kidney function');
  } else if (category === 'high') {
    if (lowEgfr) reasons.push(`an eGFR of ${egfr}, below ${EGFR_LOW}`);
    if (persistentEightPlus) reasons.push(`proteinuria above ${PROTEINURIA_HIGH} g/day persisting beyond six months`);
    if (normalEgfr && nephroticRange && highAddOn) {
      const addOns = [];
      if (albumin !== null && albumin < ALBUMIN_VERY_LOW) addOns.push(`a serum albumin of ${albumin} g/dL, below ${ALBUMIN_VERY_LOW.toFixed(1)}`);
      if (pla2r !== null && pla2r > PLA2R_HIGH) addOns.push(`an anti-PLA2R of ${pla2r} RU/mL, above ${PLA2R_HIGH}`);
      if (urinaryMarkers) addOns.push('raised urinary alpha-1 microglobulin or IgG excretion');
      reasons.push(`proteinuria above ${PROTEINURIA_NEPHROTIC} g/day with ${addOns.join(', ')}`);
    }
  } else if (category === 'low') {
    if (sixMonthsSupportive && halvedProteinuria) reasons.push('proteinuria that has fallen by more than half over six months of supportive therapy');
    else reasons.push(`proteinuria below ${PROTEINURIA_NEPHROTIC} g/day with a preserved eGFR and a serum albumin above ${ALBUMIN_LOW.toFixed(1)} g/dL`);
  }

  const action = {
    'very-high': `Very high risk, on ${reasons.join(' and ')}.`,
    high: `High risk, on ${reasons.join('; and on ')}.`,
    moderate: `Moderate risk: a preserved eGFR with proteinuria above ${PROTEINURIA_NEPHROTIC} g/day and none of the high-risk features.`,
    low: `Low risk, on ${reasons.join(' and ')}.`,
    'not-categorized': 'The entered values do not place this in a category. The categories are built on the eGFR, the daily proteinuria, the serum albumin and the response to six months of supportive therapy.',
  }[category];

  // The reason the tile exists, on every result.
  const categoryDrivesNote = 'The category, not the proteinuria alone, is what the guideline uses to decide whether immunosuppression is considered.';

  const supportiveNote = category === 'moderate' && !sixMonthsSupportive
    ? 'Six months of supportive therapy is part of the definition. Until that period has been given and its effect measured, this reads as moderate risk rather than as an indication in itself, and the answer can change with time rather than only with the numbers.'
    : null;

  const pla2rNote = pla2r !== null && pla2r > PLA2R_HIGH && !nephroticRange
    ? `An anti-PLA2R of ${pla2r} RU/mL does not raise the category on its own. It counts only alongside proteinuria above ${PROTEINURIA_NEPHROTIC} g/day.`
    : null;

  const veryHighNote = 'Very high risk is a clinical picture, not a number. Nothing in the laboratory panel produces it: it is a life-threatening nephrotic syndrome or a rapid unexplained fall in kidney function.';

  const recordedNote = `Recorded: eGFR ${egfr === null ? 'not entered' : egfr}, proteinuria ${proteinuria === null ? 'not entered' : `${proteinuria} g/day`}, albumin ${albumin === null ? 'not entered' : `${albumin} g/dL`}, anti-PLA2R ${pla2r === null ? 'not entered' : `${pla2r} RU/mL`}.`;

  const scopeNote = 'This applies published risk categories to values already recorded. It does not decide whether to start immunosuppression.';

  return {
    valid: true,
    category,
    egfr,
    proteinuria,
    albumin,
    pla2r,
    reasons,
    action,
    recordedNote,
    categoryDrivesNote,
    supportiveNote,
    pla2rNote,
    veryHighNote,
    scopeNote,
    abnormal: category === 'high' || category === 'very-high',
    bandLabel: {
      'very-high': 'Very high risk',
      high: 'High risk',
      moderate: 'Moderate risk',
      low: 'Low risk',
      'not-categorized': 'Not categorized',
    }[category],
    band: action,
    detail: `Low is a preserved eGFR with proteinuria below ${PROTEINURIA_NEPHROTIC} g/day and albumin above ${ALBUMIN_LOW.toFixed(1)} g/dL, or proteinuria halved after six months of supportive therapy. Moderate is a preserved eGFR with proteinuria above ${PROTEINURIA_NEPHROTIC} g/day and no high-risk feature. High is an eGFR below ${EGFR_LOW}, proteinuria above ${PROTEINURIA_HIGH} g/day beyond six months, or nephrotic-range proteinuria with a low albumin, a high anti-PLA2R or raised urinary markers. Very high is a life-threatening nephrotic syndrome or a rapid unexplained decline.`,
    note: MN_NOTE,
  };
}
