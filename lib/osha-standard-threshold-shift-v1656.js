// spec-v1656 tool 2: OSHA standard threshold shift, uncorrected and with Appendix F age correction.
//
// Source: 29 CFR 1910.95(g) and Appendix F (non-mandatory), read on the eCFR (title 29 current to
// October 16, 2026) on October 19, 2026:
//   (g)(10)(i): "a change in hearing threshold relative to the baseline audiogram of an average of
//     10 dB or more at 2000, 3000, and 4000 Hz in either ear."
//   (g)(10)(ii): allowance "may be made for the contribution of aging (presbycusis)" by correcting
//     the annual audiogram as Appendix F describes.
//   App. F: for each frequency, the Table F-1 (males) or F-2 (females) value at the age of the most
//     recent audiogram minus the value at the age of the baseline; that difference is subtracted
//     from the recent threshold before the baseline is. Worked example: a 32-year-old male, 4000 Hz
//     recent 25 and baseline 5 (age 27): shift 20; corrections 10 - 7 = 3; adjusted 22; shift 17.
//   (g)(7)(ii) retest within 30 days; (g)(8)(i) written notice within 21 days of the determination;
//     (g)(8)(ii)(A)-(D) protectors fitted or refitted, referral when needed, unless a physician
//     determines the shift is not work related; (g)(9) a revised baseline is the reviewer's judgment.
// Tables F-1 and F-2 below are the eCFR's rows ("20 or younger" through "60 or older") at 2000, 3000
// and 4000 Hz, the three frequencies the shift is defined on; the full five-frequency rows were
// diffed against the spec-v1654 transcription at build and matched.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const FREQS = [2000, 3000, 4000];

// [2000, 3000, 4000] Hz, dB, by age in years.
const MALE = {
  20: [3, 4, 5], 21: [3, 4, 5], 22: [3, 4, 5], 23: [3, 4, 6], 24: [3, 5, 6], 25: [3, 5, 7], 26: [4, 5, 7],
  27: [4, 6, 7], 28: [4, 6, 8], 29: [4, 6, 8], 30: [4, 6, 9], 31: [4, 7, 9], 32: [5, 7, 10], 33: [5, 7, 10],
  34: [5, 8, 11], 35: [5, 8, 11], 36: [5, 9, 12], 37: [6, 9, 12], 38: [6, 9, 13], 39: [6, 10, 14],
  40: [6, 10, 14], 41: [6, 10, 14], 42: [7, 11, 16], 43: [7, 12, 16], 44: [7, 12, 17], 45: [7, 13, 18],
  46: [8, 13, 19], 47: [8, 14, 19], 48: [8, 14, 20], 49: [9, 15, 21], 50: [9, 16, 22], 51: [9, 16, 23],
  52: [10, 17, 24], 53: [10, 18, 25], 54: [10, 18, 26], 55: [11, 19, 27], 56: [11, 20, 28], 57: [11, 21, 29],
  58: [12, 22, 31], 59: [12, 22, 32], 60: [13, 23, 33],
};
const FEMALE = {
  20: [4, 3, 3], 21: [4, 4, 3], 22: [4, 4, 4], 23: [5, 4, 4], 24: [5, 4, 4], 25: [5, 4, 4], 26: [5, 5, 4],
  27: [5, 5, 5], 28: [5, 5, 5], 29: [5, 5, 5], 30: [6, 5, 5], 31: [6, 6, 5], 32: [6, 6, 6], 33: [6, 6, 6],
  34: [6, 6, 6], 35: [6, 7, 7], 36: [7, 7, 7], 37: [7, 7, 7], 38: [7, 7, 7], 39: [7, 8, 8], 40: [7, 8, 8],
  41: [8, 8, 8], 42: [8, 9, 9], 43: [8, 9, 9], 44: [8, 9, 9], 45: [8, 10, 10], 46: [9, 10, 10],
  47: [9, 10, 11], 48: [9, 11, 11], 49: [9, 11, 11], 50: [10, 11, 12], 51: [10, 12, 12], 52: [10, 12, 13],
  53: [10, 13, 13], 54: [11, 13, 14], 55: [11, 14, 14], 56: [11, 14, 15], 57: [11, 15, 15], 58: [12, 15, 16],
  59: [12, 16, 16], 60: [12, 16, 17],
};

// The table is written "20 or younger" and "60 or older".
export function ageCorrection(sex, age) {
  const t = sex === 'female' ? FEMALE : MALE;
  return t[Math.min(60, Math.max(20, age))];
}

const EARS = [['right', 'Right'], ['left', 'Left']];
const KEYS = ['b2', 'b3', 'b4', 'r2', 'r3', 'r4'];
const LABELS = { b2: 'baseline 2000 Hz', b3: 'baseline 3000 Hz', b4: 'baseline 4000 Hz', r2: 'recent 2000 Hz', r3: 'recent 3000 Hz', r4: 'recent 4000 Hz' };
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

const FOLLOW_UP = [
  'If the shift is confirmed, the employee is told in writing within 21 days of the determination (§1910.95(g)(8)(i)); the employer may first retest within 30 days and use the retest as the annual audiogram ((g)(7)(ii)).',
  'Unless a physician determines it is not work related, hearing protectors are fitted, or refitted with greater attenuation if needed, and the employee is referred for evaluation when further testing is needed ((g)(8)(ii)).',
  'Whether the annual audiogram becomes the new baseline is the reviewing audiologist\'s, otolaryngologist\'s or physician\'s judgment ((g)(9)), not this tool\'s.',
];

// The fewest decimals (one or more) at which the shown value still falls on the same side of the cut-off as
// the unrounded one, so a printed number never contradicts the category beside it.
const agree = (x, test, from = 1) => {
  for (let dp = from; dp <= 6; dp += 1) {
    const v = Math.round(x * 10 ** dp) / 10 ** dp;
    if (test(v) === test(x)) return v;
  }
  return x;
};

// A 10 dB average is a shift; the sum is compared with a float tolerance so 9.9 + 10 + 10.1 counts.
const isShift = (sum) => sum >= 30 - 1e-9;

export function oshaStandardThresholdShift(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const correct = o.ageCorrection === 'yes';
  if (correct) {
    if (o.sex !== 'male' && o.sex !== 'female') return { valid: false, message: 'Choose the sex for the age correction table (Table F-1 males, F-2 females).' };
    const f = inputFault([['the age at the baseline audiogram', o.baselineAge, 0, 120, 'years'], ['the age at the recent audiogram', o.recentAge, 0, 120, 'years']]);
    if (f) return { valid: false, message: f };
    if (!Number.isInteger(Number(o.baselineAge)) || !Number.isInteger(Number(o.recentAge))) return { valid: false, message: 'Enter the ages in whole years, as Tables F-1 and F-2 are written.' };
    if (Number(o.recentAge) < Number(o.baselineAge)) return { valid: false, message: 'The age at the recent audiogram is younger than at the baseline. Check the ages.' };
  }
  const corr = correct
    ? ageCorrection(o.sex, Number(o.recentAge)).map((v, i) => v - ageCorrection(o.sex, Number(o.baselineAge))[i])
    : null;

  const ears = [];
  for (const [key, name] of EARS) {
    // Flat args: rightB2 is the right ear's baseline at 2000 Hz, leftR4 the left ear's recent 4000 Hz.
    const e = Object.fromEntries(KEYS.map((k) => [k, o[`${key}${k.toUpperCase()}`]]));
    if (KEYS.every((k) => blank(e[k]))) continue;
    const f = inputFault(KEYS.map((k) => [`the ${name.toLowerCase()} ear ${LABELS[k]} threshold`, e[k], -10, 120, 'dB']));
    if (f) return { valid: false, message: f };
    const b = [e.b2, e.b3, e.b4].map(Number);
    const r = [e.r2, e.r3, e.r4].map(Number);
    const shifts = r.map((v, i) => v - b[i]);
    const sum = shifts.reduce((s, v) => s + v, 0);
    const sts = isShift(sum);
    const avg = agree(sum / 3, (v) => isShift(v * 3));
    const ear = { ear: name, shifts, average: avg, sts };
    if (corr) {
      const adj = r.map((v, i) => v - corr[i]);
      ear.adjustedRecent = adj;
      ear.correctedShifts = adj.map((v, i) => v - b[i]);
      const csum = ear.correctedShifts.reduce((s, v) => s + v, 0);
      ear.correctedSts = isShift(csum);
      ear.correctedAverage = agree(csum / 3, (v) => isShift(v * 3));
    }
    ears.push(ear);
  }
  if (!ears.length) return { valid: false, message: 'Enter the baseline and recent thresholds at 2000, 3000 and 4000 Hz for at least one ear.' };

  const sts = ears.some((e) => e.sts);
  const decided = corr ? ears.some((e) => e.correctedSts) : sts;
  const perEar = ears.map((e) => {
    const base = `${e.ear} ear: shifts ${e.shifts.join(', ')} dB at 2000, 3000 and 4000 Hz, average ${e.average} dB`;
    return corr
      ? `${base}; age-corrected (corrections ${corr.join(', ')} dB) ${e.correctedShifts.join(', ')} dB, average ${e.correctedAverage} dB.`
      : `${base}.`;
  });
  const which = ears.filter((e) => (corr ? e.correctedSts : e.sts)).map((e) => e.ear.toLowerCase());
  const band = decided
    ? `Standard threshold shift${corr ? ' after age correction' : ''}: an average of 10 dB or more at 2000, 3000 and 4000 Hz in the ${which.join(' and ')} ear${which.length > 1 ? 's' : ''}.`
    : `No standard threshold shift${corr ? ' after age correction' : ''}: the average shift is under 10 dB in ${ears.length > 1 ? 'both ears' : 'the ear entered'}.`;
  const notes = [...perEar];
  if (o.ageCorrection !== 'yes' && o.ageCorrection !== 'no') notes.push('Choose whether to apply the Appendix F age correction; until then the shift is shown uncorrected.');
  if (corr && sts !== decided) notes.push(`Without the age correction the result would be ${sts ? 'a' : 'no'} standard threshold shift. Appendix F is non-mandatory; the employer may apply it.`);
  if (decided) notes.push(...FOLLOW_UP);
  return {
    valid: true, sts: decided, uncorrectedSts: sts, ears, corrections: corr, abnormal: decided,
    band, bandLabel: decided ? 'Standard threshold shift' : 'No standard threshold shift',
    notes,
    note: 'The shift is defined on 2000, 3000 and 4000 Hz only (§1910.95(g)(10)(i)). Ages under 20 use the "20 or younger" row and over 60 the "60 or older" row, as Tables F-1 and F-2 are written.',
  };
}
