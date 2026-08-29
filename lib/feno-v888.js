// spec-v888: interpreting a fractional exhaled nitric oxide measurement.
//
// Source:
//   Dweik RA, Boggs PB, Erzurum SC, et al. An official ATS clinical practice guideline:
//   interpretation of exhaled nitric oxide levels (FENO) for clinical applications.
//   Am J Respir Crit Care Med. 2011;184(5):602-615.
//
//   Adults (12 years and older): below 25 ppb low, 25 to 50 intermediate, above 50 high.
//   Children under 12 years:     below 20 ppb low, 20 to 35 intermediate, above 35 high.
//
// IT MEASURES EOSINOPHILIC AIRWAY INFLAMMATION, NOT ASTHMA, AND THAT IS WHY THIS TILE EXISTS. A
// low value does not exclude asthma; it argues against eosinophilic inflammation and against a
// response to inhaled corticosteroids in that moment.
//
// THE INTERMEDIATE BAND IS NOT "MILDLY RAISED". The guideline's instruction for it is to
// interpret cautiously and in the clinical context, which is a different thing from acting on a
// mid-range number as if it were a weak positive.
//
// THE CUTPOINTS DIFFER BY AGE, and the same 40 ppb is intermediate in an adult and high in a
// child under twelve.
//
// A GREAT DEAL MOVES IT. Inhaled and oral corticosteroids lower it, active smoking lowers it,
// atopy, allergen exposure and rhinitis raise it, and a recent spirometry or a nitrate-rich meal
// can move it. A single value against a population cutpoint says less than a change over time in
// the same person.
//
// Pure: no DOM, no clock, no network.

export const FENO_NOTE = 'The American Thoracic Society guideline of 2011 interprets a fractional exhaled nitric oxide measurement against age-specific cutpoints: in a person twelve years or older, below 25 parts per billion is low, 25 to 50 is intermediate and above 50 is high; in a child under twelve, below 20 is low, 20 to 35 is intermediate and above 35 is high. Four things about the measurement are worth stating plainly. It measures eosinophilic airway inflammation rather than asthma, so a low value does not exclude asthma and instead argues against eosinophilic inflammation and against a response to inhaled corticosteroids at that moment. The intermediate band is not a mildly raised result: the guideline says to interpret it cautiously and in the clinical context, which is different from treating a mid-range number as a weak positive. The cutpoints differ by age, so the same 40 parts per billion is intermediate in an adult and high in a child under twelve. And a great deal moves the number, since inhaled and oral corticosteroids lower it, active smoking lowers it, atopy and allergen exposure and rhinitis raise it, and a recent spirometry or a nitrate-rich meal can move it, so a single value against a population cutpoint says less than a change over time in the same person. It reads a number against published cutpoints. It does not diagnose asthma, and it does not decide whether to start or change a corticosteroid.';

export const ADULT_LOW = 25;
export const ADULT_HIGH = 50;
export const CHILD_LOW = 20;
export const CHILD_HIGH = 35;
export const CHILD_AGE_YEARS = 12;

export const AGE_GROUPS = [
  { value: 'adult', text: 'Twelve years and older' },
  { value: 'child', text: 'Under twelve years' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function feno(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ppb = num(o.fenoPpb);
  const group = oneOf(AGE_GROUPS, o.ageGroup, 'adult');

  if (ppb === null) return { valid: false, message: 'Enter the fractional exhaled nitric oxide in parts per billion.' };
  if (ppb < 0 || ppb > 500) return { valid: false, message: 'Enter the fractional exhaled nitric oxide between 0 and 500 parts per billion.' };

  const low = group === 'child' ? CHILD_LOW : ADULT_LOW;
  const high = group === 'child' ? CHILD_HIGH : ADULT_HIGH;

  const band = ppb < low ? 'low' : ppb > high ? 'high' : 'intermediate';

  const action = {
    low: `${ppb} ppb is low for this age group, below ${low}. Eosinophilic airway inflammation, and a response to an inhaled corticosteroid, are both unlikely at this moment.`,
    intermediate: `${ppb} ppb is intermediate for this age group, from ${low} to ${high}. The guideline's instruction here is to interpret cautiously and in the clinical context, which is not the same as a weak positive.`,
    high: `${ppb} ppb is high for this age group, above ${high}. Eosinophilic airway inflammation, and a response to an inhaled corticosteroid, are both likely.`,
  }[band];

  // The reason the tile exists, on every result.
  const notAsthmaNote = 'This measures eosinophilic airway inflammation, not asthma. A low value does not exclude asthma; it argues against eosinophilic inflammation and against a corticosteroid response at this moment.';

  const intermediateNote = band === 'intermediate'
    ? 'The intermediate band is not a mildly raised result. It is the band in which the number should not be acted on alone.'
    : null;

  const ageNote = `Read against the ${group === 'child' ? `under-${CHILD_AGE_YEARS}` : `${CHILD_AGE_YEARS}-and-over`} cutpoints of ${low} and ${high} ppb. The cutpoints differ by age: at ${ppb} ppb the other age group would read ${(() => {
    const oLow = group === 'child' ? ADULT_LOW : CHILD_LOW;
    const oHigh = group === 'child' ? ADULT_HIGH : CHILD_HIGH;
    return ppb < oLow ? 'low' : ppb > oHigh ? 'high' : 'intermediate';
  })()}.`;

  const confounders = [];
  if (on(o.onCorticosteroid)) confounders.push('an inhaled or oral corticosteroid, which lowers it');
  if (on(o.currentSmoker)) confounders.push('active smoking, which lowers it');
  if (on(o.atopyOrRhinitis)) confounders.push('atopy, allergen exposure or rhinitis, which raise it');
  if (on(o.recentSpirometry)) confounders.push('a recent spirometry, which can move it');

  const confounderNote = confounders.length
    ? `Recorded alongside the measurement: ${confounders.join('; ')}. ${confounders.some((c) => c.includes('lowers')) && band === 'low' ? 'A low value in that setting is expected, and it argues less than a low value without it.' : 'The number should be read with that in mind rather than against the cutpoint alone.'}`
    : 'A great deal moves this number: corticosteroids and active smoking lower it, atopy and allergen exposure and rhinitis raise it, and a recent spirometry or a nitrate-rich meal can move it.';

  const serialNote = 'A change over time in the same person says more than a single value against a population cutpoint, and the guideline is built around serial measurement.';

  const scopeNote = 'This reads a number against published cutpoints. It does not diagnose asthma, and it does not decide whether to start or change a corticosteroid.';

  return {
    valid: true,
    fenoPpb: ppb,
    ageGroup: group,
    band,
    cutpoints: { low, high },
    action,
    notAsthmaNote,
    intermediateNote,
    ageNote,
    confounderNote,
    serialNote,
    scopeNote,
    abnormal: band === 'high',
    bandLabel: band === 'low' ? 'Low' : band === 'high' ? 'High' : 'Intermediate',
    band: action,
    detail: `Twelve years and older: below ${ADULT_LOW} ppb low, ${ADULT_LOW} to ${ADULT_HIGH} intermediate, above ${ADULT_HIGH} high. Under twelve: below ${CHILD_LOW} low, ${CHILD_LOW} to ${CHILD_HIGH} intermediate, above ${CHILD_HIGH} high. Low argues against eosinophilic inflammation and a corticosteroid response; high argues for both; intermediate is to be read in context.`,
    note: FENO_NOTE,
  };
}
