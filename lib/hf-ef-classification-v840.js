// spec-v840: classification of heart failure by ejection fraction, from the 2021 universal
// definition.
//
// Source:
//   Bozkurt B, Coats AJS, Tsutsui H, et al. Universal definition and classification of heart
//   failure: a report of the Heart Failure Society of America, Heart Failure Association of
//   the ESC, Japanese Heart Failure Society and Writing Committee of the Universal Definition
//   of Heart Failure. Eur J Heart Fail. 2021;23(3):352-380.
//
// THE CATEGORIES, all requiring SYMPTOMATIC heart failure:
//   HFrEF    LVEF <= 40%
//   HFimpEF  a baseline LVEF <= 40%, a rise of AT LEAST 10 POINTS from that baseline, AND a
//            second measurement above 40%
//   HFmrEF   LVEF 41-49%
//   HFpEF    LVEF >= 50%
//
// HFimpEF IS DEFINED BY A TRAJECTORY WITH THREE CONDITIONS, NOT BY CROSSING 40%. All three
// must hold. A baseline of 38% improving to 42% is NOT HFimpEF - it crosses the line but
// rises only 4 points. This is the part most easily simplified into something wrong.
//
// AND A SINGLE MEASUREMENT CANNOT DECIDE IT. The same 45% is HFmrEF in a patient with no
// prior measurement and HFimpEF in one whose baseline was 30%. Same number, different
// category, different conversation. Any tool that classifies from one ejection fraction
// cannot express HFimpEF at all, and will silently call these patients HFmrEF.
//
// HFimpEF IS NOT "RECOVERED" HEART FAILURE. The TRED-HF trial withdrew therapy from patients
// with recovered dilated cardiomyopathy and saw relapse. The improvement describes the
// ejection fraction, not the disease, and it is not a reason to stop treatment.
//
// AN EJECTION FRACTION IS NOT A DIAGNOSIS. Every category here requires symptomatic heart
// failure; a number on its own classifies nothing.
//
// Pure: no DOM, no clock, no network.

export const HF_NOTE = 'The 2021 universal definition of heart failure (Bozkurt B, Coats AJS, Tsutsui H, et al, Eur J Heart Fail 2021;23(3):352-380) classifies symptomatic heart failure by ejection fraction into four categories. Reduced ejection fraction is 40 percent or below. Mildly reduced is 41 to 49. Preserved is 50 or above. Improved ejection fraction requires three things together: a baseline at or below 40 percent, a rise of at least ten points from that baseline, and a second measurement above 40. That third category is the one most easily got wrong, because it is a trajectory rather than a threshold: a baseline of 38 improving to 42 crosses the line but rises only four points and is not in it. A single measurement cannot decide the category either, since the same 45 percent is mildly reduced in someone with no prior measurement and improved in someone whose baseline was 30, which is the same number, a different category and a different conversation. A tool classifying from one ejection fraction cannot express the improved category at all and will quietly call those patients mildly reduced. Improved does not mean recovered: the TRED-HF trial withdrew treatment from patients whose cardiomyopathy had recovered and saw relapse, so the improvement describes the ejection fraction rather than the disease and is not a reason to stop therapy. And every category requires symptomatic heart failure, so an ejection fraction on its own classifies nothing. It applies a published classification to measurements already made and it does not start, change or withdraw any treatment.';

export const HFREF_MAX = 40;
export const HFMREF_MIN = 41;
export const HFMREF_MAX = 49;
export const HFPEF_MIN = 50;
export const IMPROVEMENT_POINTS = 10;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function hfEfClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const current = num(o.currentLvef);
  const baseline = num(o.baselineLvef);
  for (const [label, v] of [['Current LVEF', current], ['Baseline LVEF', baseline]]) {
    if (v !== null && (v < 0 || v > 100)) return { valid: false, message: `${label} must be between 0 and 100 percent.` };
  }

  const symptomatic = truthy(o.symptomaticHeartFailure);

  if (!symptomatic) {
    return result({
      category: null, current, baseline, symptomatic,
      symptomNote: current !== null
        ? 'An ejection fraction on its own classifies nothing. Every category in the universal definition requires symptomatic heart failure.'
        : null,
      improvedNote: null, singleMeasurementNote: null, recoveredNote: null,
    });
  }

  // HFimpEF: all three conditions.
  const baselineLow = baseline !== null && baseline <= HFREF_MAX;
  const rise = (baseline !== null && current !== null) ? current - baseline : null;
  const roseEnough = rise !== null && rise >= IMPROVEMENT_POINTS;
  const nowAbove = current !== null && current > HFREF_MAX;
  const improved = baselineLow && roseEnough && nowAbove;

  let category = null;
  if (improved) category = 'HFimpEF';
  else if (current !== null && current <= HFREF_MAX) category = 'HFrEF';
  else if (current !== null && current >= HFPEF_MIN) category = 'HFpEF';
  else if (current !== null && current >= HFMREF_MIN && current <= HFMREF_MAX) category = 'HFmrEF';

  // The near-miss: crossed 40 but did not rise 10 points.
  const improvedNote = (baselineLow && nowAbove && !roseEnough)
    ? `The ejection fraction rose from ${baseline} to ${current}, a ${rise}-point increase. That crosses ${HFREF_MAX} percent but is short of the ${IMPROVEMENT_POINTS} points HFimpEF requires, so this is ${category}. The category needs all three conditions, not just crossing the line.`
    : null;

  // What a single measurement cannot see.
  const singleMeasurementNote = (category === 'HFmrEF' && baseline === null)
    ? `With no baseline measurement this is HFmrEF. The same ${current} percent in a patient whose baseline was 30 would be HFimpEF - a different category and a different conversation - so a single ejection fraction cannot settle this.`
    : null;

  const recoveredNote = improved
    ? 'HFimpEF is not recovered heart failure. The TRED-HF trial withdrew therapy from patients whose cardiomyopathy had recovered and saw relapse; the improvement describes the ejection fraction, not the disease, and is not a reason to stop treatment.'
    : null;

  return result({ category, current, baseline, symptomatic, symptomNote: null, improvedNote, singleMeasurementNote, recoveredNote });
}

function result({ category, current, baseline, symptomatic, symptomNote, improvedNote, singleMeasurementNote, recoveredNote }) {
  return {
    valid: true,
    category,
    currentLvef: current,
    baselineLvef: baseline,
    symptomatic,
    symptomNote,
    improvedNote,
    singleMeasurementNote,
    recoveredNote,
    abnormal: !!category,
    bandLabel: category || 'Not classified',
    band: category
      ? `${category} — ejection fraction ${current} percent${baseline !== null ? `, from a baseline of ${baseline}` : ''}.`
      : (symptomatic
        ? 'Not classified: an ejection fraction is needed.'
        : 'Not classified: the universal definition requires symptomatic heart failure.'),
    detail: `HFrEF is ${HFREF_MAX} percent or below; HFmrEF ${HFMREF_MIN} to ${HFMREF_MAX}; HFpEF ${HFPEF_MIN} or above. HFimpEF needs ALL THREE of a baseline at or below ${HFREF_MAX}, a rise of at least ${IMPROVEMENT_POINTS} points, and a current value above ${HFREF_MAX}.`,
    note: HF_NOTE,
  };
}
