// spec-v1242: the ECST method of measuring carotid stenosis, the NASCET method beside it, and the
// conversion between them.
//
// Sources:
//   European Carotid Surgery Trialists' Collaborative Group. MRC European Carotid Surgery Trial:
//   interim results for symptomatic patients with severe (70-99%) or with mild (0-29%) carotid
//   stenosis. Lancet. 1991;337(8752):1235-1243. PMID 1674060 -- the ECST method.
//   Rothwell PM, Gibson RJ, Slattery J, Sellar RJ, Warlow CP. Equivalence of measurements of carotid
//   stenosis. A comparison of three methods on 1001 angiograms. Stroke. 1994;25(12):2435-2439.
//   PMID 7974586 -- the conversion, ECST = 0.6 x NASCET + 40.
//
// ONE ARTERY, TWO NUMBERS. Both methods divide the narrowest residual lumen by a denominator, and
// they choose different denominators:
//
//   NASCET   residual lumen against the DISTAL internal carotid, beyond the bulb, where the walls
//            are parallel
//   ECST     residual lumen against the ESTIMATED ORIGINAL diameter of the artery at the site of the
//            stenosis -- a diameter that no longer exists and has to be judged from the outline
//
// The ECST denominator is the larger of the two, so ECST always reports the higher percentage. The
// gap is not small: Rothwell's regression makes ECST 70% the same artery as NASCET 50%.
//
// THIS IS THE REASON THE TILE EXISTS. "70% stenosis" is not one finding. A trial threshold, a
// guideline, a referral letter and a radiology report may each mean a different artery by it, and
// nothing in the number says which method produced it. NASCET is in this catalog already; this
// computes both from one set of measurements and prints the conversion in both directions.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const ECST_NOTE = 'ECST and NASCET both measure a carotid stenosis as the narrowest residual lumen over a denominator, and they use different denominators: NASCET uses the distal internal carotid beyond the bulb, ECST the estimated original diameter at the site of the narrowing. ECST therefore always reports the higher figure, and Rothwell 1994 puts the two on one scale as ECST = 0.6 x NASCET + 40 -- so an ECST 70% stenosis is a NASCET 50% one. This reports both from the same measurements; it does not decide whether an artery should be operated on.';

function blankIfEmpty(v) {
  return typeof v === 'string' && v.trim() === '' ? '' : v;
}
function num(v) {
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function pct(x) {
  return Math.round(x * 10) / 10;
}

// Rothwell 1994, on 1001 angiograms.
export const ECST_FROM_NASCET_SLOPE = 0.6;
export const ECST_FROM_NASCET_INTERCEPT = 40;

export function ecstFromNascet(n) {
  return ECST_FROM_NASCET_SLOPE * n + ECST_FROM_NASCET_INTERCEPT;
}
export function nascetFromEcst(e) {
  return (e - ECST_FROM_NASCET_INTERCEPT) / ECST_FROM_NASCET_SLOPE;
}

export function ecstCarotid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = blankIfEmpty;

  const fault = inputFault([
    ['the narrowest residual lumen', b(o.residual), null, 20, 'mm'],
    ['the distal internal carotid diameter', b(o.distalIca), null, 20, 'mm'],
    ['the estimated original diameter at the stenosis', b(o.originalBulb), null, 30, 'mm'],
  ]);
  if (fault) return { valid: false, message: fault };

  const residual = num(o.residual);
  const distal = num(o.distalIca);
  const original = num(o.originalBulb);

  // A residual lumen wider than its own denominator is a negative stenosis, which is a transcription
  // error rather than a finding. Arithmetic has no opinion about it (spec-v1225); say so here.
  if (residual > distal) {
    return { valid: false, message: `The residual lumen (${residual} mm) is wider than the distal internal carotid (${distal} mm). That is a negative NASCET stenosis, so one of the two measurements is not the one it is labeled as.` };
  }
  if (residual > original) {
    return { valid: false, message: `The residual lumen (${residual} mm) is wider than the estimated original diameter at the stenosis (${original} mm). The original diameter is the artery before it narrowed, so it cannot be the smaller of the two.` };
  }
  // The ECST denominator is the vessel at the bulb and the NASCET denominator is the artery beyond
  // it, so the first is normally the larger. The reverse is possible but is usually two swapped
  // fields, and saying so costs nothing.
  const denominatorsSwapped = original < distal;

  const nascet = pct((1 - residual / distal) * 100);
  const ecst = pct((1 - residual / original) * 100);
  const ecstPredicted = pct(ecstFromNascet(nascet));
  const nascetFromMeasuredEcst = pct(nascetFromEcst(ecst));

  return {
    valid: true,
    nascet,
    ecst,
    ecstPredicted,
    nascetFromMeasuredEcst,
    denominatorsSwapped,
    abnormal: nascet >= 50,
    bandLabel: `NASCET ${nascet}% / ECST ${ecst}%`,
    band: `The same artery is a ${nascet}% stenosis by NASCET and a ${ecst}% stenosis by ECST. NASCET divides the residual lumen by the distal internal carotid; ECST divides it by the estimated original diameter at the narrowing, which is the larger denominator, so ECST reads higher.`,
    conversionNote: `On Rothwell's regression, ECST = 0.6 x NASCET + 40. A NASCET ${nascet}% predicts an ECST of about ${ecstPredicted}%, and the measured ECST of ${ecst}% corresponds to a NASCET of about ${nascetFromMeasuredEcst}%. The regression describes 1001 angiograms rather than this one, so it and the direct measurement will not agree exactly.`,
    thresholdNote: 'A trial threshold, a guideline and a report may each mean a different artery by "70%", and the number alone does not say which method produced it. ECST 70% is NASCET 50% on this regression.',
    swapNote: denominatorsSwapped
      ? 'The estimated original diameter at the stenosis is smaller than the distal internal carotid. That is the reverse of the usual relationship, because the bulb is normally the wider segment, and it is worth checking that the two denominators have not been entered the other way round.'
      : null,
    postureNote: 'Decision support, not a verdict. The percentage is a measurement, and whether an artery is operated on also takes the symptoms, the timing and the patient.',
    note: ECST_NOTE,
  };
}
