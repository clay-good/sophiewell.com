// spec-v788: InterTAK Diagnostic Score (takotsubo syndrome vs acute coronary syndrome).
//
// Source:
//   Ghadri JR, Cammann VL, Jurisic S, et al. A novel clinical score (InterTAK Diagnostic
//   Score) to differentiate takotsubo syndrome from acute coronary syndrome: results from
//   the International Takotsubo Registry. Eur J Heart Fail. 2017;19(8):1036-1042.
//   Thresholds per the International Expert Consensus Document on Takotsubo Syndrome
//   (Part II), Eur Heart J. 2018;39(22):2047-2062.
//
// Seven weighted features, summing to exactly 100:
//   female sex                                              25
//   emotional trigger                                       24
//   physical trigger                                        13
//   absence of ST-segment depression (except in aVR)        12
//   psychiatric disorder                                    11
//   neurologic disorder                                      9
//   QT interval prolongation                                 6
//
// Consensus interpretation: 50 points corresponds to about an 18% probability of
// takotsubo; above 70 points, about 90%. A score of 70 or less is low to intermediate
// probability and a score of 70 or more is high probability.
//
// The consensus attaches a workup to each side: low probability leads to coronary
// angiography with left ventriculography, high probability to transthoracic
// echocardiography. Later validation cohorts have reported lower optimal cutoffs than 70,
// so the consensus threshold ships and the disagreement is stated rather than resolved.
//
// Pure: no DOM, no clock, no network.

export const INTERTAK_NOTE = 'The InterTAK Diagnostic Score (Ghadri JR, Cammann VL, Jurisic S, et al, Eur J Heart Fail 2017;19(8):1036-1042) estimates how likely a presentation that looks like a heart attack is actually takotsubo syndrome rather than an acute coronary syndrome. Seven features are weighted and summed to a maximum of exactly 100: female sex 25, an emotional trigger 24, a physical trigger 13, the absence of ST-segment depression other than in aVR 12, a psychiatric disorder 11, a neurologic disorder 9, and a prolonged QT interval 6. In the international expert consensus a score around 50 corresponds to roughly an 18 percent probability of takotsubo and a score above 70 to roughly 90 percent, with 70 or less treated as low to intermediate probability and 70 or more as high. The consensus pairs those with a workup rather than a conclusion: low probability leads to coronary angiography with left ventriculography, high probability to transthoracic echocardiography. Later validation cohorts have reported lower optimal cutoffs than 70, so the consensus threshold is the one shown here and the disagreement is stated rather than settled. A high score does not exclude a coronary occlusion, and this score decides nothing about angiography.';

const FEATURES = [
  { arg: 'femaleSex', points: 25, text: 'female sex' },
  { arg: 'emotionalTrigger', points: 24, text: 'emotional trigger' },
  { arg: 'physicalTrigger', points: 13, text: 'physical trigger' },
  { arg: 'noStDepression', points: 12, text: 'absence of ST-segment depression except in aVR' },
  { arg: 'psychiatricDisorder', points: 11, text: 'psychiatric disorder' },
  { arg: 'neurologicDisorder', points: 9, text: 'neurologic disorder' },
  { arg: 'qtProlongation', points: 6, text: 'QT interval prolongation' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function interTak(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  const present = [];
  for (const f of FEATURES) {
    if (truthy(o[f.arg])) { total += f.points; present.push(`${f.text} (${f.points})`); }
  }

  const high = total >= 70;
  const label = high
    ? 'high probability of takotsubo syndrome'
    : 'low to intermediate probability of takotsubo syndrome';

  return {
    valid: true,
    score: total,
    tier: high ? 'high' : 'low-intermediate',
    present,
    // The HIGH-probability side is the one that redirects the workup away from
    // the default coronary pathway.
    abnormal: high,
    bandLabel: `InterTAK ${total} of 100`,
    band: `InterTAK ${total} of 100 — ${label}.`,
    workup: high
      ? 'Consensus pathway: consider transthoracic echocardiography.'
      : 'Consensus pathway: coronary angiography with left ventriculography.',
    detail: 'Weights: female sex 25, emotional trigger 24, physical trigger 13, no ST-segment depression except aVR 12, psychiatric disorder 11, neurologic disorder 9, QT prolongation 6; maximum exactly 100. About 18 percent probability at 50 points and about 90 percent above 70. Later validation cohorts have proposed lower optimal cutoffs, so the consensus threshold of 70 is the one used here.',
    note: INTERTAK_NOTE,
  };
}
