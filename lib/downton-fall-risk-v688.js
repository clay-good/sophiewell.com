// spec-v688: Downton Fall Risk Index.
//
// A nursing fall-risk screen for older people, especially in residential/inpatient care.
// Source: Downton JH. Falls in the Elderly. London: Edward Arnold; 1993. Point table and
// the >= 3 cut per Rosendahl E, Lundin-Olsson L, Kallin K, et al. Prediction of falls among
// older people in residential care facilities by the Downton index. Aging Clin Exp Res.
// 2003;15(2):142-147.
//
// Total 0-11, one point for each item present:
//   Known previous falls .......................... 1
//   Medications (1 each): tranquillizers/sedatives, diuretics, antihypertensives
//     (other than diuretics), antiparkinson drugs, antidepressants ...... up to 5
//   Sensory deficits (1 each): visual, hearing, limb (e.g. amputation/neuropathy) ... up to 3
//   Mental state: confused/cognitively impaired ... 1  (oriented = 0)
//   Gait: unsafe (with or without aids) ........... 1  (normal / safe with aids / unable = 0)
// A total of 3 or more indicates HIGH fall risk.
//
// Note the two quirks preserved here: "other medications" score 0 (only the five named
// classes count), and an "unable" gait scores 0 (a person who cannot walk is not at risk of
// falling while walking) whereas an "unsafe" gait scores 1.
//
// Pure: no DOM, no clock, no network.

export const DOWNTON_NOTE = 'Downton Fall Risk Index (Downton JH, Falls in the Elderly, 1993; cut-point per Rosendahl E, et al, Aging Clin Exp Res 2003;15(2):142-147). A fall-risk screen for older people that adds one point for each item present: known previous falls (1); each of five medication classes taken - tranquillizers or sedatives, diuretics, antihypertensives other than diuretics, antiparkinson drugs, and antidepressants (up to 5); each of three sensory deficits - visual, hearing, and limb, such as an amputation or neuropathy (up to 3); a confused or cognitively impaired mental state (1); and an unsafe gait (1). The total ranges from 0 to 11, and a score of 3 or more indicates a high risk of falls. Two quirks: other, unlisted medications score 0, and a patient who is unable to walk scores 0 for gait (not at risk of falling while walking) while an unsafe gait scores 1. It is a screening aid that should trigger fall-prevention measures, not a prediction of any individual fall, and it supports rather than replaces clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const MED_KEYS = ['medTranquilizer', 'medDiuretic', 'medAntihypertensive', 'medAntiparkinson', 'medAntidepressant'];
const SENSORY_KEYS = ['sensoryVisual', 'sensoryHearing', 'sensoryLimb'];

export function downtonFallRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (!(o.mentalState === 'oriented' || o.mentalState === 'confused')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'mentalState', message: 'Select mental state (oriented or confused).', note: DOWNTON_NOTE };
  }
  if (!(o.gait === 'normal' || o.gait === 'safe-with-aids' || o.gait === 'unsafe' || o.gait === 'unable')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'gait', message: 'Select gait (normal, safe with aids, unsafe, or unable).', note: DOWNTON_NOTE };
  }

  let total = 0;
  const factors = [];
  if (truthy(o.previousFalls)) { total += 1; factors.push('previous falls'); }

  let meds = 0;
  for (const k of MED_KEYS) if (truthy(o[k])) meds += 1;
  if (meds > 0) { total += meds; factors.push(`${meds} medication class${meds === 1 ? '' : 'es'}`); }

  let sensory = 0;
  for (const k of SENSORY_KEYS) if (truthy(o[k])) sensory += 1;
  if (sensory > 0) { total += sensory; factors.push(`${sensory} sensory deficit${sensory === 1 ? '' : 's'}`); }

  if (o.mentalState === 'confused') { total += 1; factors.push('confused'); }
  if (o.gait === 'unsafe') { total += 1; factors.push('unsafe gait'); }

  const high = total >= 3;
  return {
    valid: true,
    score: total,
    tier: high ? 'high' : 'low',
    abnormal: high,
    factors,
    bandLabel: `Downton ${total} of 11`,
    band: `Downton ${total} of 11 — ${high ? 'high' : 'low'} fall risk (>= 3).`,
    detail: high
      ? 'Score 3 or more: high fall risk; institute fall-prevention measures.'
      : 'Score under 3: lower fall risk by this screen; reassess if status changes.',
    note: DOWNTON_NOTE,
  };
}
