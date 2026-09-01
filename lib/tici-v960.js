// spec-v960: the mTICI reperfusion grade after endovascular therapy for acute ischemic stroke,
// and the place where it and the original TICI scale disagree about the same angiogram.
//
// Source:
//   Zaidat OO, Yoo AJ, Khatri P, et al. Recommendations on angiographic revascularization
//   grading standards for acute ischemic stroke: a consensus statement.
//   Stroke. 2013;44(9):2650-2663.
//
//   Table 2, verbatim -- Modified Treatment in Cerebral Ischemia (mTICI):
//     Grade 0  No perfusion.
//     Grade 1  Antegrade reperfusion past the initial occlusion, but limited distal branch
//              filling with little or slow distal reperfusion.
//     Grade 2a Antegrade reperfusion of LESS than half of the occluded target artery previously
//              ischemic territory.
//     Grade 2b Antegrade reperfusion of MORE than half of the previously occluded target artery
//              ischemic territory.
//     Grade 3  COMPLETE antegrade reperfusion of the previously occluded target artery ischemic
//              territory, with absence of visualized occlusion in all distal branches.
//
// THE TWO SCALES PUT 2b IN DIFFERENT PLACES, AND THAT IS WHY THIS TILE EXISTS. The panel wrote
// it plainly: "TICI 2b has been dichotomized into 2 main variations: (1) more than half (mTICI)
// and (2) more than two thirds (original TICI) reperfusion", and it "recommended that TICI 2b
// should be defined as more than half but less than full antegrade reperfusion". So an angiogram
// with, say, 60% of the territory reperfused is mTICI 2b -- a procedural SUCCESS -- and original
// TICI 2a -- a FAILURE. Same picture, opposite verdict, and the difference is which paper the
// reader has in mind. This grades on both and says when they part.
//
// 2b-3 IS THE SUCCESS THRESHOLD, AND IT IS NOT THE OLD ONE. The consensus reports mTICI 2b-3 as
// "the optimal threshold for predicting good outcome in 313 AIS undergoing IAT (sensitivity 78%,
// specificity 65%) versus mTICI 2a-3", against a literature in which "the most frequent
// definition of IAT angiographic success has been TIMI 2 to 3 or TICI 2a-3". A success rate
// quoted from an older trial is often counting 2a.
//
// GRADE 3 MEANS COMPLETE. The panel chose "complete antegrade reperfusion, without any distal
// branch occlusion or stagnation" over "near complete", partly to make 2b and 3 easier to tell
// apart between readers.
//
// WHAT THE GRADES BUY, from IMS III core-laboratory adjudication: mTICI 3 and 2b were associated
// with 80% and 46.3% good clinical outcome at 90 days (mRS 2 or less), against 19.4% for 2a.
//
// Pure: no DOM, no clock, no network.

export const TICI_NOTE = 'The mTICI grade scores how much of the previously occluded territory has been reperfused after endovascular therapy for acute ischemic stroke: 0 is no perfusion, 1 is flow past the occlusion with little distal filling, 2a is less than half the territory, 2b is more than half, and 3 is complete reperfusion with no visualized occlusion in any distal branch. Three things are worth stating plainly. The two scales in circulation disagree about 2b: the modified scale sets it at more than HALF the territory and the original TICI scale at more than TWO THIRDS, so an angiogram in between is a success on one scale and a failure on the other. Success is mTICI 2b to 3, which the consensus reports as the optimal threshold for predicting a good outcome, whereas most older trials defined angiographic success as TIMI 2 to 3 or TICI 2a to 3 -- so a success rate quoted from an older paper is often counting 2a. And grade 3 means complete, not near complete: the panel chose that wording deliberately, partly so that 2b and 3 are easier to tell apart between readers. From IMS III, mTICI 3 and 2b were associated with 80% and 46.3% good clinical outcome at 90 days, against 19.4% for 2a.';

export const REPERFUSION_OPTIONS = [
  { value: 'none', text: 'No perfusion beyond the occlusion' },
  { value: 'minimal', text: 'Flow past the occlusion, limited distal filling' },
  { value: 'under-half', text: 'Less than half the territory reperfused' },
  { value: 'half-to-two-thirds', text: 'More than half but less than two thirds' },
  { value: 'over-two-thirds', text: 'Two thirds or more, but not complete' },
  { value: 'complete', text: 'Complete, no occlusion in any distal branch' },
];

// mTICI (the modified scale: 2b is more than HALF) and the original TICI (2b is more than
// TWO THIRDS). They differ on exactly one option, which is the point.
const GRADES = {
  none: { mtici: '0', tici: '0', label: 'No perfusion' },
  minimal: { mtici: '1', tici: '1', label: 'Flow past the occlusion without distal perfusion' },
  'under-half': { mtici: '2a', tici: '2a', label: 'Less than half the territory' },
  'half-to-two-thirds': { mtici: '2b', tici: '2a', label: 'More than half but less than two thirds' },
  'over-two-thirds': { mtici: '2b', tici: '2b', label: 'Two thirds or more, short of complete' },
  complete: { mtici: '3', tici: '3', label: 'Complete reperfusion' },
};

const SUCCESS = new Set(['2b', '3']);

const MTICI_TEXT = {
  0: 'mTICI 0: no perfusion.',
  1: 'mTICI 1: antegrade reperfusion past the initial occlusion, but limited distal branch filling with little or slow distal reperfusion.',
  '2a': 'mTICI 2a: antegrade reperfusion of less than half of the previously occluded territory.',
  '2b': 'mTICI 2b: antegrade reperfusion of more than half of the previously occluded territory.',
  3: 'mTICI 3: complete antegrade reperfusion, with absence of visualized occlusion in all distal branches.',
};

const OUTCOME_TEXT = {
  '2a': 'In IMS III core-laboratory adjudication, mTICI 2a was associated with 19.4% good clinical outcome at 90 days (mRS 2 or less).',
  '2b': 'In IMS III core-laboratory adjudication, mTICI 2b was associated with 46.3% good clinical outcome at 90 days (mRS 2 or less).',
  3: 'In IMS III core-laboratory adjudication, mTICI 3 was associated with 80% good clinical outcome at 90 days (mRS 2 or less).',
};

export function ticiGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.reperfusion === null || o.reperfusion === undefined ? '' : o.reperfusion).trim();
  const g = GRADES[key];

  if (!g) {
    return { valid: false, message: 'Say how much of the previously occluded territory is reperfused on the final angiogram. The two scales in use split at different places -- more than half on mTICI, more than two thirds on the original TICI -- so the answer needs the fraction, not just "partial".' };
  }

  const success = SUCCESS.has(g.mtici);
  const scalesDiffer = g.mtici !== g.tici;

  const disagreementNote = scalesDiffer
    ? `THE TWO SCALES DISAGREE HERE. This is mTICI ${g.mtici} -- a procedural success -- and original TICI ${g.tici}, which is not, because the original scale puts 2b at more than two thirds of the territory rather than more than half. Same angiogram, opposite verdict; the consensus panel recommended the half threshold.`
    : `Both scales grade this the same: mTICI ${g.mtici} and original TICI ${g.tici}. They part only between one half and two thirds of the territory.`;

  const successNote = success
    ? 'mTICI 2b to 3 is the success threshold the consensus reports as optimal for predicting a good outcome (sensitivity 78%, specificity 65%, against mTICI 2a to 3).'
    : 'Below the mTICI 2b to 3 success threshold. Note that most older trials defined angiographic success as TIMI 2 to 3 or TICI 2a to 3, so a success rate quoted from an older paper is often counting 2a.';

  const outcomeNote = OUTCOME_TEXT[g.mtici] || '';

  const completeNote = g.mtici === '3'
    ? 'Grade 3 means complete, not near complete. The panel chose that wording deliberately, partly so that 2b and 3 are easier to tell apart between readers.'
    : '';

  return {
    valid: true,
    mtici: g.mtici,
    originalTici: g.tici,
    scalesDiffer,
    successfulReperfusion: success,
    abnormal: !success,
    bandLabel: `mTICI ${g.mtici}`,
    band: MTICI_TEXT[g.mtici],
    reperfusionLabel: g.label,
    disagreementNote,
    successNote,
    outcomeNote,
    completeNote,
    scopeNote: 'A grade of the final angiogram, not a decision. It says what was achieved; it does not say what to do next.',
    detail: 'mTICI: 0 no perfusion, 1 flow past the occlusion without distal perfusion, 2a less than half the territory, 2b more than half, 3 complete. The original TICI scale sets 2b at more than two thirds instead.',
    note: TICI_NOTE,
  };
}
