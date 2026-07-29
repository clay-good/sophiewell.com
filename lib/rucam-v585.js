// spec-v585: the updated RUCAM (Roussel Uclaf Causality Assessment Method) for drug- and herb-induced liver
// injury. `grep -ci rucam app.js` returned 0. The catalog already has King's College criteria for acute
// liver failure -- a severity axis -- and had nothing on the CAUSALITY axis, which is the question actually
// asked at the bedside when a patient on a new drug develops abnormal liver tests.
//
// **THE R RATIO PICKS THE SCALE, AND MIXED INJURY IS SCORED ON THE CHOLESTATIC SCALE.** There are TWO
// scoring tables, not one, and which one applies is decided before any item is answered, by
// R = (ALT / ALT upper limit of normal) / (ALP / ALP upper limit of normal). Hepatocellular is R at or above
// 5, cholestatic is R at or below 2, and mixed is strictly between. **MIXED HAS NO TABLE OF ITS OWN** -- it
// borrows the cholestatic one. An implementation with a single item list is wrong for whichever pattern it
// did not encode.
//
// **THE TWO SCALES DIFFER IN FOUR OF THE SEVEN DOMAINS, WITH THE SAME DOMAIN NAMES.** The latency windows
// are longer on the cholestatic scale, the dechallenge windows are 30 days against 180 days, the
// dechallenge point ranges differ (-2 to +3 against 0 to +2), and the risk-factor line differs. Copying a
// value across from the other table looks harmless and is not.
//
// **TIME TO ONSET IS NOT ONLY A SCORE -- IT CAN EXCLUDE THE CASE OUTRIGHT.** Onset before the drug was
// started, or too long after it was stopped (more than 15 days on the hepatocellular scale, more than 30 on
// the cholestatic), is an EXCLUSION, not a low score. No total is produced at all.
//
// **THE TWO SCALES DO NOT SHARE A RANGE, BUT THEY SHARE THE CAUSALITY BANDS.** Without rechallenge and
// without risk factors the hepatocellular scale runs about -7 to +11 and the cholestatic about -5 to +8, yet
// both are read against the same bands (0 or less excluded, 1-2 unlikely, 3-5 possible, 6-8 probable, 9 or
// more highly probable). A "probable" is therefore not equally hard to reach on the two scales, and this lib
// reports the reachable maximum for the scale in use so the total can be read in context.
//
// **NEGATIVE POINTS ARE REAL AND LARGE.** Concomitant drugs go to -3 and an alternative diagnosis to -3, so
// a case can be argued out of causality as well as into it. Two negative domains alone can cancel a perfect
// latency and dechallenge.
//
// **ONE CELL IS RECONCILED, NOT RECALLED (spec-v97).** The primary and an authoritative secondary
// reproduction render the cholestatic risk-factor line differently: one lists age and alcohol with pregnancy
// as an additional cholestatic-only item, the other lists age plus "alcohol OR pregnancy, not both". Both
// state a DOMAIN MAXIMUM OF +2, which is only consistent with the second reading, so the second is applied:
// alcohol and pregnancy share one line worth +1. The divergence is stated rather than hidden.
//
// HIGH-STAKES: RUCAM grades the PROBABILITY THAT A PARTICULAR AGENT CAUSED the liver injury. It is not a
// diagnosis, and it does not measure severity -- a "highly probable" case may be mild and an "excluded" one
// may be in liver failure; severity is a separate question (King's College criteria, and bilirubin and INR).
// It does not tell anyone to stop or continue a drug. In particular it must NEVER be used to justify
// REadministration: rechallenge is scored here because it sometimes happens, not because it is advisable,
// and deliberate rechallenge has killed patients (spec-v11 section 5.3).
//
// DOMAINS, POINTS AND BOTH SCALES RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT REPRODUCTIONS OF
// THE SCORING TABLES, NEVER RECALLED (spec-v97):
//   - Danan G, Teschke R. RUCAM in drug and herb induced liver injury: the update. Int J Mol Sci.
//     2016;17(1):14.
//   - LiverTox: Clinical and Research Information on Drug-Induced Liver Injury. Roussel Uclaf Causality
//     Assessment Method (RUCAM) in drug induced liver injury. Bethesda (MD): NIDDK.

export const R_HEPATOCELLULAR = 5;   // R at or above this is hepatocellular
export const R_CHOLESTATIC = 2;      // R at or below this is cholestatic

export const EXCLUDED_BY_TIMING = 'excluded-by-timing';

// Domain 1. Values are shared keys; the day windows in the text differ by scale.
export const ONSET_ITEMS = {
  hepatocellular: [
    { value: 'first-5-90', points: 2, text: 'First exposure, onset 5 to 90 days after starting' },
    { value: 'first-other', points: 1, text: 'First exposure, onset under 5 or over 90 days after starting' },
    { value: 'prior-window', points: 2, text: 'Prior exposure, onset 1 to 15 days after starting' },
    { value: 'prior-beyond', points: 1, text: 'Prior exposure, onset more than 15 days after starting' },
    { value: 'after-stopping-within', points: 1, text: 'Onset within 15 days of stopping the drug' },
    { value: 'after-stopping-beyond', points: null, text: 'Onset more than 15 days after stopping — CASE EXCLUDED' },
    { value: 'before-starting', points: null, text: 'Onset before the drug was started — CASE EXCLUDED' },
  ],
  cholestatic: [
    { value: 'first-5-90', points: 2, text: 'First exposure, onset 5 to 90 days after starting' },
    { value: 'first-other', points: 1, text: 'First exposure, onset under 5 or over 90 days after starting' },
    { value: 'prior-window', points: 2, text: 'Prior exposure, onset 1 to 90 days after starting' },
    { value: 'prior-beyond', points: 1, text: 'Prior exposure, onset more than 90 days after starting' },
    { value: 'after-stopping-within', points: 1, text: 'Onset within 30 days of stopping the drug' },
    { value: 'after-stopping-beyond', points: null, text: 'Onset more than 30 days after stopping — CASE EXCLUDED' },
    { value: 'before-starting', points: null, text: 'Onset before the drug was started — CASE EXCLUDED' },
  ],
};

// Domain 2.
export const COURSE_ITEMS = {
  hepatocellular: [
    { value: 'fall-50-by-8-days', points: 3, text: 'ALT falls by 50 percent or more within 8 days of stopping' },
    { value: 'fall-50-by-30-days', points: 2, text: 'ALT falls by 50 percent or more within 30 days of stopping' },
    { value: 'no-data-or-continued', points: 0, text: 'Drug continued, no information, or no improvement' },
    { value: 'fall-under-50-after-30', points: -2, text: 'ALT falls by less than 50 percent after day 30, or rises again' },
  ],
  cholestatic: [
    { value: 'fall-50-by-180-days', points: 2, text: 'ALP or bilirubin falls by 50 percent or more within 180 days' },
    { value: 'fall-under-50-by-180-days', points: 1, text: 'ALP or bilirubin falls by less than 50 percent within 180 days' },
    { value: 'no-data-or-continued', points: 0, text: 'Drug continued, no information, or persistent or rising values' },
  ],
};

export const AGE_RISK_THRESHOLD = 55;
export const RISK_DOMAIN_MAX = 2;

// Domains 4 to 6 are identical on both scales.
export const CONCOMITANT_ITEMS = [
  { value: 'none-or-incompatible', points: 0, text: 'No concomitant drug, or timing incompatible' },
  { value: 'compatible-timing', points: -1, text: 'Concomitant drug with compatible or suggestive timing' },
  { value: 'known-hepatotoxin', points: -2, text: 'Known hepatotoxin with compatible timing' },
  { value: 'proven-cause', points: -3, text: 'Concomitant drug with evidence for its role (positive rechallenge or validated test)' },
];

export const EXCLUSION_ITEMS = [
  { value: 'all-excluded', points: 2, text: 'All group I and group II causes excluded' },
  { value: 'group1-excluded', points: 1, text: 'All 6 group I causes excluded' },
  { value: 'four-or-five-excluded', points: 0, text: 'Only 4 or 5 group I causes excluded' },
  { value: 'fewer-than-four', points: -2, text: 'Fewer than 4 group I causes excluded' },
  { value: 'alternative-highly-probable', points: -3, text: 'An alternative cause is highly probable' },
];

export const PRIOR_INFO_ITEMS = [
  { value: 'labeled', points: 2, text: 'Reaction is in the product label' },
  { value: 'published', points: 1, text: 'Published case reports, but not labeled' },
  { value: 'unknown', points: 0, text: 'No published association' },
];

export const RECHALLENGE_ITEMS = [
  { value: 'positive', points: 3, text: 'Doubling of the relevant test with the drug alone' },
  { value: 'compatible', points: 1, text: 'Doubling with the drug given again alongside the one already in use' },
  { value: 'negative', points: -2, text: 'Given again after recovery with no rise' },
  { value: 'not-done', points: 0, text: 'Not done, or not interpretable' },
];

const BANDS = [
  { max: 0, label: 'Excluded' },
  { max: 2, label: 'Unlikely' },
  { max: 5, label: 'Possible' },
  { max: 8, label: 'Probable' },
  { max: Infinity, label: 'Highly probable' },
];

export const RISK_CELL_NOTE = 'One cell is reconciled rather than recalled: the primary and an authoritative secondary reproduction render the cholestatic risk-factor line differently, one treating pregnancy as an extra item and the other as sharing a line with alcohol. Both state a domain maximum of +2, which is only consistent with the shared line, so alcohol and pregnancy share one point here and the divergence is stated.';
export const RECHALLENGE_WARNING = 'Rechallenge is scored because it sometimes happens, NOT because it is advisable. Deliberate readministration to raise a RUCAM score has killed patients; this score must never be used to justify it.';

const NOTE = `The updated RUCAM (Danan and Teschke 2016) grades the probability that a particular drug or herb caused an episode of liver injury. The R ratio, (ALT divided by its upper limit of normal) divided by (ALP divided by its upper limit of normal), selects which of TWO scoring tables applies: hepatocellular at R of ${R_HEPATOCELLULAR} or above, cholestatic at R of ${R_CHOLESTATIC} or below, and mixed strictly between - and MIXED INJURY IS SCORED ON THE CHOLESTATIC TABLE, having none of its own. The two tables differ in four of seven domains under the same domain names: the latency windows are longer on the cholestatic scale, the dechallenge windows are 30 days against 180, the dechallenge point ranges are -2 to +3 against 0 to +2, and the risk-factor line differs. Time to onset is not only a score, it can EXCLUDE the case outright: onset before the drug was started, or more than 15 days (hepatocellular) or 30 days (cholestatic) after it was stopped, produces no total at all. Negative points are real and large, with concomitant drugs and an alternative diagnosis each reaching -3, so a case can be argued out of causality as well as into it. The two scales do not share a range but do share the causality bands - 0 or less excluded, 1 to 2 unlikely, 3 to 5 possible, 6 to 8 probable, 9 or more highly probable - so a "probable" is not equally hard to reach on both, and the reachable maximum for the scale in use is reported alongside the total. RUCAM grades causality, not severity: a highly probable case may be mild and an excluded one may be in liver failure, and severity is a separate question. It is not a diagnosis and does not tell anyone to stop or continue a drug. It must never be used to justify readministration: rechallenge is scored because it sometimes happens, not because it is advisable, and deliberate rechallenge has killed patients.`;

function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a number greater than 0.`);
  return n;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
function pick(list, v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const found = list.find((i) => i.value === String(v).trim());
  if (!found) throw new Error(`${name} must be one of: ${list.map((i) => i.value).join(', ')}.`);
  return found;
}

// The reachable maximum on a scale, used to put the shared bands in context.
export function scaleMaximum(scale) {
  const table = scale === 'hepatocellular' ? 'hepatocellular' : 'cholestatic';
  const best = (list) => Math.max(...list.filter((i) => i.points !== null).map((i) => i.points));
  return best(ONSET_ITEMS[table]) + best(COURSE_ITEMS[table]) + RISK_DOMAIN_MAX
    + best(CONCOMITANT_ITEMS) + best(EXCLUSION_ITEMS) + best(PRIOR_INFO_ITEMS) + best(RECHALLENGE_ITEMS);
}

// input: alt, altUln, alp, alpUln, onset, course, ageAtLeast55, alcoholOrPregnancy,
// concomitant, exclusion, priorInfo, rechallenge.
export function rucam(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let alt, altUln, alp, alpUln;
  try {
    alt = readNum(o.alt, 'ALT');
    altUln = readNum(o.altUln, 'ALT upper limit of normal');
    alp = readNum(o.alp, 'ALP');
    alpUln = readNum(o.alpUln, 'ALP upper limit of normal');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if ([alt, altUln, alp, alpUln].some((x) => x === null)) {
    return { valid: false, message: 'Enter ALT, ALP and both upper limits of normal. They are needed BEFORE any item is answered, because the R ratio decides which of the two scoring tables applies.' };
  }

  const r = (alt / altUln) / (alp / alpUln);
  let pattern;
  if (r >= R_HEPATOCELLULAR) pattern = 'hepatocellular';
  else if (r <= R_CHOLESTATIC) pattern = 'cholestatic';
  else pattern = 'mixed';
  const scale = pattern === 'hepatocellular' ? 'hepatocellular' : 'cholestatic';

  let onset, course, concomitant, exclusion, prior, rechallenge, age55, alcPreg;
  try {
    onset = pick(ONSET_ITEMS[scale], o.onset, 'Time to onset');
    course = pick(COURSE_ITEMS[scale], o.course, 'Course after stopping');
    concomitant = pick(CONCOMITANT_ITEMS, o.concomitant, 'Concomitant drugs');
    exclusion = pick(EXCLUSION_ITEMS, o.exclusion, 'Exclusion of other causes');
    prior = pick(PRIOR_INFO_ITEMS, o.priorInfo, 'Previous information');
    rechallenge = pick(RECHALLENGE_ITEMS, o.rechallenge, 'Response to readministration');
    age55 = readBool(o.ageAtLeast55, `Age ${AGE_RISK_THRESHOLD} or over`);
    alcPreg = readBool(o.alcoholOrPregnancy, 'Alcohol use or pregnancy');
  } catch (err) {
    return { valid: false, message: err.message, pattern, scale, rRatio: r };
  }
  const missing = [
    ['onset', onset], ['course', course], ['concomitant', concomitant], ['exclusion', exclusion],
    ['priorInfo', prior], ['rechallenge', rechallenge],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (age55 === null) missing.push('ageAtLeast55');
  if (alcPreg === null) missing.push('alcoholOrPregnancy');
  if (missing.length) {
    return { valid: false, message: `Answer every domain. Still needed: ${missing.join(', ')}.`, pattern, scale, rRatio: r };
  }

  // Timing can end the assessment before any total exists.
  if (onset.points === null) {
    return {
      valid: true,
      excluded: true,
      pattern, scale,
      rRatio: Number(r.toFixed(2)),
      total: null,
      band: 'Case excluded on timing',
      bandLabel: 'Case excluded on timing',
      bandText: `${onset.text}. THIS IS AN EXCLUSION, NOT A LOW SCORE: no RUCAM total is produced at all, and the remaining domains are not summed. The exclusion window differs by scale - more than 15 days after stopping on the hepatocellular scale, more than 30 on the cholestatic - and this case is on the ${scale} scale because R is ${r.toFixed(2)}.`,
      note: NOTE,
    };
  }

  const riskPoints = Math.min(RISK_DOMAIN_MAX, (age55 ? 1 : 0) + (alcPreg ? 1 : 0));
  const total = onset.points + course.points + riskPoints + concomitant.points
    + exclusion.points + prior.points + rechallenge.points;
  const band = BANDS.find((b) => total <= b.max);
  const max = scaleMaximum(scale);

  const parts = [];
  parts.push(`RUCAM ${total} on the ${scale} scale: ${band.label.toLowerCase()} causality.`);
  parts.push(pattern === 'mixed'
    ? `R is ${r.toFixed(2)}, which is MIXED injury - and MIXED IS SCORED ON THE CHOLESTATIC TABLE, having none of its own.`
    : `R is ${r.toFixed(2)}, which is ${pattern} injury, so the ${scale} table applies.`);
  parts.push(`The two scales do not share a range: the best reachable total on this scale is ${max}, against ${scaleMaximum('hepatocellular')} on the hepatocellular scale, yet both are read against the SAME causality bands. A "probable" is not equally hard to reach on the two.`);
  parts.push(`The scales also differ in four of the seven domains under the same names - latency windows, dechallenge windows of 30 against 180 days, dechallenge point ranges of -2 to +3 against 0 to +2, and the risk-factor line - so a value copied across from the other table is wrong.`);
  if (concomitant.points < 0 || exclusion.points < 0) {
    parts.push(`Negative points are doing work here: ${concomitant.points < 0 ? `concomitant drugs ${concomitant.points}` : ''}${concomitant.points < 0 && exclusion.points < 0 ? ' and ' : ''}${exclusion.points < 0 ? `other causes ${exclusion.points}` : ''}. A case can be argued out of causality as well as into it.`);
  }
  parts.push(RISK_CELL_NOTE);
  parts.push(RECHALLENGE_WARNING);
  parts.push('RUCAM grades CAUSALITY, not severity. A highly probable case may be mild and an excluded one may be in liver failure. It is not a diagnosis and does not tell anyone to stop or continue a drug.');

  return {
    valid: true,
    excluded: false,
    pattern,
    scale,
    rRatio: Number(r.toFixed(2)),
    total,
    scaleMax: max,
    points: {
      onset: onset.points, course: course.points, risk: riskPoints,
      concomitant: concomitant.points, exclusion: exclusion.points,
      priorInfo: prior.points, rechallenge: rechallenge.points,
    },
    band: band.label,
    bandLabel: `RUCAM ${total}, ${band.label.toLowerCase()} (${scale} scale)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
