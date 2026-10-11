// spec-v1634 tool 16: an out-of-range INR on warfarin, as the CHEST 2012 guideline words it.
//
// Source: Holbrook A, Schulman S, Witt DM, et al. Evidence-based management of anticoagulant
// therapy: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest
// Physicians Evidence-Based Clinical Practice Guidelines. Chest 2012;141(2 Suppl):e152S-e184S
// (PMC3278055), summary of recommendations, re-read on October 11, 2026:
//   3.1  consistently stable INRs: "an INR testing frequency of up to 12 weeks rather than every 4
//        weeks (Grade 2B)".
//   3.2  previously stable therapeutic INRs with "a single out-of-range INR of <= 0.5 below or above
//        therapeutic": "continuing the current dose and testing the INR within 1 to 2 weeks
//        (Grade 2C)".
//   9.1a "INRs between 4.5 and 10 and with no evidence of bleeding": "we suggest against the routine
//        use of vitamin K (Grade 2B)".
//   9.1b "INRs > 10.0 and with no evidence of bleeding": "we suggest that oral vitamin K be
//        administered (Grade 2C)". The recommendation states no dose.
//   9.3  VKA-associated major bleeding: "rapid reversal of anticoagulation with four-factor
//        prothrombin complex concentrate (PCC) rather than with plasma (Grade 2C)" and "the
//        additional use of vitamin K 5 to 10 mg administered by slow IV injection" (Grade 2C).
// An INR these do not cover gets "no numbered recommendation", not an invented one.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const BLEEDING = [{ value: 'none', text: 'No evidence of bleeding' }, { value: 'major', text: 'Major bleeding' }];
const NOTE = 'These are the 2012 guideline\'s suggestions (all weak, Grade 2), quoted by number. They are not a dosing plan: whether to hold or change warfarin, and any dose of vitamin K, are clinical decisions the recommendations read here do not spell out. Bleeding that is not major is not covered by them.';

export function warfarinInrOutOfRange(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the INR', o.inr, 0.5, 30, ''], ['the lower end of the target range', o.targetLow, 1, 5, ''], ['the upper end of the target range', o.targetHigh, 1, 5, '']]);
  if (f) return { valid: false, message: f };
  const inr = Number(o.inr); const lo = Number(o.targetLow); const hi = Number(o.targetHigh);
  if (!(hi > lo)) return { valid: false, message: 'The upper end of the target range must be above the lower end.' };
  const bleeding = BLEEDING.find((b) => b.value === String(o.bleeding ?? '').trim());
  if (!bleeding) return { valid: false, message: 'Choose whether there is bleeding: none, or major bleeding.' };
  const cite = 'Holbrook A, et al. Chest 2012;141(2 Suppl):e152S-e184S.';
  if (bleeding.value === 'major') {
    return { valid: true, flag: 'major-bleeding', abnormal: true, recommendations: ['9.3'], band: 'Major bleeding on warfarin: the guideline suggests rapid reversal with four-factor prothrombin complex concentrate rather than plasma, with vitamin K 5 to 10 mg by slow IV injection (recommendation 9.3, Grade 2C).', bandLabel: 'Recommendation 9.3', notes: ['The guideline gives no dose of prothrombin complex concentrate in this recommendation; the product labels do.', cite], note: NOTE };
  }
  const stable = YES_NO.find((y) => y.value === String(o.stable ?? '').trim());
  if (!stable) return { valid: false, message: 'Choose whether the INRs were previously stable in range.' };
  const isStable = stable.value === 'yes';
  const out = inr < lo ? lo - inr : inr > hi ? inr - hi : 0;
  const recs = []; const lines = [];
  if (inr > 10) { recs.push('9.1b'); lines.push('INR above 10 with no evidence of bleeding: the guideline suggests that oral vitamin K be administered (recommendation 9.1b, Grade 2C). The recommendation states no dose, and none is given here.'); } else if (inr >= 4.5) { recs.push('9.1a'); lines.push('INR between 4.5 and 10 with no evidence of bleeding: the guideline suggests against the routine use of vitamin K (recommendation 9.1a, Grade 2B).'); }
  // A hair of tolerance so that 3.5 against a top of 3.0 reads as 0.5, not 0.5000000000000004.
  if (out > 0 && out <= 0.5 + 1e-9 && isStable) { recs.push('3.2'); lines.push(`Previously stable, and this INR is ${Number(out.toFixed(2))} ${inr < lo ? 'below' : 'above'} the range: if it is a single out-of-range value, the guideline suggests continuing the current dose and testing the INR within 1 to 2 weeks (recommendation 3.2, Grade 2C).`); }
  if (out === 0 && isStable) { recs.push('3.1'); lines.push('In range and previously stable: for consistently stable INRs the guideline suggests testing up to every 12 weeks rather than every 4 weeks (recommendation 3.1, Grade 2B).'); }
  const where = out === 0 ? 'in range' : `${Number(out.toFixed(2))} ${inr < lo ? 'below' : 'above'} the range`;
  if (!recs.length) {
    return { valid: true, flag: 'no-recommendation', abnormal: out > 0, recommendations: [], band: `INR ${inr} against a target of ${lo} to ${hi} (${where}): the guideline makes no numbered recommendation for this case.`, bandLabel: 'No numbered recommendation', notes: [out === 0 ? 'Recommendation 3.1 is about patients whose INRs are consistently stable.' : 'Recommendation 3.2 covers a single value no more than 0.5 outside the range in a previously stable patient; 9.1 covers an INR of 4.5 or more without bleeding.', cite], note: NOTE };
  }
  return { valid: true, flag: `rec-${recs.join('-')}`, abnormal: out > 0, recommendations: recs, band: `INR ${inr} against a target of ${lo} to ${hi} (${where}). ${lines[0]}`, bandLabel: `Recommendation ${recs.join(' and ')}`, notes: [...lines.slice(1), cite], note: NOTE };
}
