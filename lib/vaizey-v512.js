// spec-v512: the Vaizey (St Marks) fecal incontinence score. Companion gap to the existing `wexner` tile:
// Wexner scores four leakage types plus lifestyle on one 0-4 frequency scale (total 0-20), while Vaizey adds
// the three items Wexner leaves out - the need to wear a pad or plug, the use of constipating medicines, and
// the inability to defer defecation for 15 minutes - for a total of 0-24. "vaizey" and "st marks" were both
// zero-hit across the corpus and app.js.
//
// Four frequency rows, each 0-4:
//   solid stool, liquid stool, gas, alteration in lifestyle
// Three yes/no rows with their own weights:
//   pad or plug worn (2), constipating medicines taken (2), cannot defer defecation for 15 minutes (4)
//
// Total 0 (perfect continence) to 24 (totally incontinent).
//
// HIGH-STAKES: this sums what the patient reports over the preceding four weeks. It is NOT a diagnosis, NOT
// an anorectal physiology study, and NOT an indication for biofeedback, sacral neuromodulation, sphincter
// repair, or a stoma (spec-v11 section 5.3). The score does not identify a cause - obstetric sphincter
// injury, neuropathy, overflow from constipation, and inflammatory bowel disease can all produce the same
// number - and a low score does not mean the symptom is not worth investigating. The management decision
// stays with the colorectal and pelvic-floor team.
//
// ITEMS AND WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Vaizey CJ, Carapeti E, Cahill JA, Kamm MA. Prospective comparison of fecal incontinence grading
//     systems. Gut. 1999;44(1):77-80.
//   - Colorectal and pelvic-floor references reproducing the same four frequency rows on the same 0-4 scale,
//     the same three weighted yes/no rows, and the same 0-24 range.

export const FREQUENCY_ROWS = [
  { key: 'solid', label: 'Incontinence for solid stool' },
  { key: 'liquid', label: 'Incontinence for liquid stool' },
  { key: 'gas', label: 'Incontinence for gas' },
  { key: 'lifestyle', label: 'Alteration in lifestyle' },
];

export const FREQUENCY_SCALE = [
  { value: '0', text: '0 - never' },
  { value: '1', text: '1 - rarely (less than once a month)' },
  { value: '2', text: '2 - sometimes (less than once a week, at least once a month)' },
  { value: '3', text: '3 - weekly (at least once a week, less than once a day)' },
  { value: '4', text: '4 - daily (once a day or more)' },
];

export const YES_NO_ROWS = [
  { key: 'pad', label: 'Need to wear a pad or plug', points: 2 },
  { key: 'meds', label: 'Taking constipating medicines', points: 2 },
  { key: 'defer', label: 'Lack of ability to defer defecation for 15 minutes', points: 4 },
];

const NOTE = 'The Vaizey (St Marks) score (Vaizey and colleagues 1999) rates incontinence for solid stool, for liquid stool, for gas, and alteration in lifestyle, each 0 (never) to 4 (daily), then adds 2 for wearing a pad or plug, 2 for taking constipating medicines, and 4 for being unable to defer defecation for 15 minutes. Total 0 (perfect continence) to 24 (totally incontinent). It sums what the patient reports. It does not identify a cause, it is not an anorectal physiology study, and it is not an indication for biofeedback, neuromodulation, sphincter repair, or a stoma. A low score does not mean the symptom is not worth investigating.';

function readFrequency(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

function readYesNo(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === 'yes' || v === true || v === 1 || v === '1') return 1;
  if (v === 'no' || v === false || v === 0 || v === '0') return 0;
  return NaN;
}

// input:
//   solid, liquid, gas, lifestyle: each 0-4 (all four required).
//   pad, meds, defer: 'yes' or 'no' (all three required).
export function vaizey(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const freq = FREQUENCY_ROWS.map((row) => readFrequency(o[row.key]));
  const flags = YES_NO_ROWS.map((row) => readYesNo(o[row.key]));
  const all = [...freq, ...flags];

  if (all.some((n) => n === null)) {
    return { valid: false, message: 'Rate all four frequency rows 0 to 4 and answer all three yes/no rows.' };
  }
  if (all.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each frequency must be a whole number from 0 to 4, and each yes/no row must be yes or no.' };
  }

  const frequencyTotal = freq.reduce((a, b) => a + b, 0);
  const addedTotal = flags.reduce((sum, yes, i) => sum + (yes ? YES_NO_ROWS[i].points : 0), 0);
  const total = frequencyTotal + addedTotal;

  return {
    valid: true,
    frequencyTotal,
    addedTotal,
    total,
    bandLabel: `Vaizey ${total} of 24`,
    band: `Vaizey (St Marks) score ${total} of 24: ${frequencyTotal} from the four frequency rows plus ${addedTotal} from the pad, medicine, and deferral rows. 0 is perfect continence and 24 is totally incontinent.`,
    note: NOTE,
  };
}
