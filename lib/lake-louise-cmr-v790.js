// spec-v790: 2018 Lake Louise Criteria for myocarditis on cardiac MRI.
//
// Source:
//   Ferreira VM, Schulz-Menger J, Holmvang G, et al. Cardiovascular magnetic resonance in
//   nonischemic myocardial inflammation: expert recommendations. J Am Coll Cardiol.
//   2018;72(24):3158-3176. (PMID 30545455.)
//
// The 2018 revision replaced the old three-of-three test with a TWO-PRONGED one. A positive
// study needs at least one marker from EACH prong - never two from the same prong:
//
//   T2-based prong (edema)
//     increased myocardial T2 relaxation time on mapping
//     visible myocardial edema on T2-weighted images
//     increased T2 signal intensity ratio
//
//   T1-based prong (injury)
//     increased myocardial T1 relaxation time on mapping
//     increased extracellular volume fraction
//     late gadolinium enhancement in a non-ischemic pattern
//
// Reported sensitivity about 88% and specificity about 96% against biopsy in a validation
// cohort, a gain in sensitivity over the 2009 criteria.
//
// Nothing here is a distinct id from lake-louise-ams, the acute mountain sickness score -
// two unrelated instruments named after the same conference venue.
//
// Pure: no DOM, no clock, no network.

export const LAKE_LOUISE_CMR_NOTE = 'The 2018 Lake Louise Criteria (Ferreira VM, Schulz-Menger J, Holmvang G, et al, J Am Coll Cardiol 2018;72(24):3158-3176) read a cardiac MRI for myocarditis using two prongs rather than the older three-part test. One prong looks for swelling of the muscle and is satisfied by a raised myocardial T2 relaxation time on mapping, visible edema on T2-weighted images, or a raised T2 signal intensity ratio. The other looks for injury to the muscle and is satisfied by a raised myocardial T1 relaxation time, a raised extracellular volume fraction, or late gadolinium enhancement in a non-ischemic pattern. A study supports acute myocarditis only when at least one marker from EACH prong is present, so two markers from the same prong do not meet the criteria however striking they are. Reported sensitivity is about 88 percent against about 96 percent specificity compared with biopsy. This reads a study a radiologist has already reported; it does not interpret images, and it is not the same instrument as the Lake Louise acute mountain sickness score, which shares only the name of the conference venue.';

const T2_MARKERS = [
  { arg: 't2Mapping', text: 'increased myocardial T2 relaxation time' },
  { arg: 't2Edema', text: 'visible myocardial edema on T2-weighted images' },
  { arg: 't2Ratio', text: 'increased T2 signal intensity ratio' },
];
const T1_MARKERS = [
  { arg: 't1Mapping', text: 'increased myocardial T1 relaxation time' },
  { arg: 'ecv', text: 'increased extracellular volume fraction' },
  { arg: 'lge', text: 'late gadolinium enhancement in a non-ischemic pattern' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function lakeLouiseCmr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const t2 = T2_MARKERS.filter((m) => truthy(o[m.arg])).map((m) => m.text);
  const t1 = T1_MARKERS.filter((m) => truthy(o[m.arg])).map((m) => m.text);
  const met = t2.length > 0 && t1.length > 0;

  let missing = null;
  if (!met) {
    if (t2.length === 0 && t1.length === 0) missing = 'neither prong';
    else if (t2.length === 0) missing = 'no T2-based marker (edema)';
    else missing = 'no T1-based marker (injury)';
  }

  return {
    valid: true,
    t2Markers: t2,
    t1Markers: t1,
    t2Met: t2.length > 0,
    t1Met: t1.length > 0,
    met,
    missing,
    abnormal: met,
    bandLabel: met ? 'Lake Louise 2018: criteria met' : 'Lake Louise 2018: criteria not met',
    band: met
      ? `2018 Lake Louise Criteria met — a T2-based and a T1-based marker are both present, supporting acute myocarditis.`
      : `2018 Lake Louise Criteria not met — ${missing}. Both prongs are required.`,
    detail: 'One marker from each prong is required, never two from the same one. T2-based: raised myocardial T2 relaxation time, visible edema on T2-weighted images, or a raised T2 signal intensity ratio. T1-based: raised myocardial T1 relaxation time, raised extracellular volume fraction, or late gadolinium enhancement in a non-ischemic pattern. Reported sensitivity about 88 percent, specificity about 96 percent against biopsy.',
    note: LAKE_LOUISE_CMR_NOTE,
  };
}
