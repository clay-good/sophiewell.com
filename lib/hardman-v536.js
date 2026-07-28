// spec-v536: the Hardman index for mortality after a ruptured abdominal aortic aneurysm. Zero-hit before
// this tile: "hardman" and "glasgow aneurysm" across corpus.json, app.js, and lib/meta.js. The catalog's
// existing aneurysm tiles are all INTRACRANIAL (hunt-hess-wfns, phases, elapss, ogilvy-carter) or describe
// ANATOMIC EXTENT rather than outcome (crawford-taaa, thoracoabdominal). There was no abdominal aortic
// aneurysm outcome instrument at all.
//
// FIVE CRITERIA, ONE POINT EACH, TOTAL 0-5:
//   age over 76 years
//   serum creatinine over 190 micromol/L (0.19 mmol/L, about 2.15 mg/dL)
//   hemoglobin below 9.0 g/dL (90 g/L)
//   loss of consciousness after presentation
//   ECG evidence of ischemia: ST depression over 1 mm and/or associated T-wave changes
//
// **THIS TILE EXISTS AS MUCH TO CARRY THE REFUTATION AS THE SCORE, AND THAT IS THE POINT.**
//
// The original 1996 series reported that every patient with three or more factors died -- 8 of 8. That
// figure entered practice as a rule for DENYING SURGERY, and it has since been repeatedly refuted:
//   - A pooled analysis of about 970 patients found mortality at an index of 3 or more to be 77 percent, not
//     100, and concluded in terms that leave no room for interpretation: an index of 3 or more cannot be
//     used as an absolute limit for denial of surgery.
//   - A validation of 178 patients found mortality of 44, 46, 68, 79 and 100 percent at scores 0 through 4,
//     and found that loss of consciousness, hemoglobin below 9, and creatinine above 0.19 mmol/L were NOT
//     individually significant predictors. Its conclusion: high-risk patients may still survive and should
//     not be denied surgical repair on the basis of the scoring system alone.
//   - A further validation of 59 patients found no significant association between an index of 3 or more and
//     death at all.
// So this tile reports the score and the ORIGINAL series' mortality figures as history, labeled as a single
// small 1996 cohort of 154 patients with 8 patients in the highest group, and states the refutation in the
// result itself whenever the score reaches 3. A calculator that printed "100 percent mortality" and stopped
// would be reproducing the exact error the subsequent literature exists to correct.
//
// A NOTE ON THE 16, 37 AND 72 PERCENT FIGURES: only the 100-percent-at-three-or-more element is
// independently restated in later work. The lower bands trace to the original abstract alone, so they are
// reported as that series' observation rather than as validated performance.
//
// UNITS ARE SPELLED OUT BECAUSE ONE SOURCE DISAGREES. The creatinine threshold is 190 micromol/L; a single
// secondary paper renders it as 180, which is a transcription error against the original's own "over 0.19
// mmol/L". This tile uses 190 and offers the conventional mg/dL equivalent alongside it.
//
// HIGH-STAKES: a ruptured abdominal aortic aneurysm is fatal without repair. This score does not identify
// patients who should be denied an operation, and the literature is explicit that it must not be used that
// way. It does not diagnose rupture, does not choose between open repair and endovascular repair, and does
// not substitute for a conversation about goals of care, which is the decision it is most often wrongly
// invoked to settle (spec-v11 section 5.3). The operative decision stays with the surgeon and the patient.
//
// CRITERIA, THRESHOLDS, AND THE REFUTATION RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from sources
// agreeing on every criterion:
//   - Hardman DT, Fisher CM, Patel MI, et al. Ruptured abdominal aortic aneurysms: who should be offered
//     surgery? J Vasc Surg. 1996;23(1):123-129.
//   - A pooled systematic review and multiple independent validation cohorts reproducing the same five
//     criteria and reporting the lower mortality figures quoted above.

export const HARDMAN_CRITERIA = [
  {
    key: 'age',
    text: 'Age over 76 years',
    detail: 'Strictly over 76.',
  },
  {
    key: 'creatinine',
    text: 'Serum creatinine over 190 micromol/L (0.19 mmol/L, about 2.15 mg/dL)',
    detail: 'One secondary source renders this as 180 micromol/L; that is a transcription error against the original.',
  },
  {
    key: 'hemoglobin',
    text: 'Hemoglobin below 9.0 g/dL (90 g/L)',
    detail: 'Measured on presentation.',
  },
  {
    key: 'unconscious',
    text: 'Loss of consciousness after presentation',
    detail: 'After arrival, not a transient episode before it.',
  },
  {
    key: 'ecgIschemia',
    text: 'ECG evidence of ischemia: ST depression over 1 mm and/or associated T-wave changes',
    detail: 'The original defines it by that ECG appearance rather than by a clinical history of ischemia.',
  },
];

// The 1996 series' own observed mortality, reported as history, not as validated performance.
const ORIGINAL_SERIES = {
  0: '16 percent in the original series (62 patients)',
  1: '37 percent in the original series (52 patients)',
  2: '72 percent in the original series (32 patients)',
  3: '100 percent in the original series, but that group held only 8 patients',
  4: '100 percent in the original series, but that group held only 8 patients',
  5: '100 percent in the original series, but that group held only 8 patients',
};

const REFUTATION = 'Later work refutes reading this as certain death: a pooled analysis of about 970 patients found 77 percent mortality at an index of 3 or more and concluded that it cannot be used as an absolute limit for denial of surgery, and a 178-patient validation found that loss of consciousness, hemoglobin below 9, and creatinine above 0.19 mmol/L were not individually significant predictors.';

const NOTE = 'The Hardman index (Hardman and colleagues 1996) counts five factors present at presentation with a ruptured abdominal aortic aneurysm: age over 76, creatinine over 190 micromol/L, hemoglobin below 9.0 g/dL, loss of consciousness after presentation, and ECG evidence of ischemia. Each scores one point, for a total of 0 to 5. The original series reported that all eight patients with three or more factors died, and that figure entered practice as a rule for denying surgery. It has since been repeatedly refuted. A pooled analysis of about 970 patients found mortality at an index of three or more to be 77 percent rather than 100, and concluded that an index of three or more cannot be used as an absolute limit for denial of surgery. A validation of 178 patients found mortality of 44, 46, 68, 79 and 100 percent at scores 0 through 4, found that loss of consciousness, hemoglobin below 9, and creatinine above 0.19 mmol/L were not individually significant predictors, and concluded that high-risk patients may still survive and should not be denied surgical repair on the basis of the scoring system alone. A further validation of 59 patients found no significant association between an index of three or more and death. The mortality figures from the original series are reported here as that single 1996 cohort of 154 patients observed, with only 8 patients in the highest group, and not as validated performance; only the hundred-percent element is independently restated in later work, so the lower bands trace to the original alone. The creatinine threshold is 190 micromol/L, and a single secondary paper rendering it as 180 is a transcription error. A ruptured abdominal aortic aneurysm is fatal without repair. This score does not identify patients who should be denied an operation, and the literature is explicit that it must not be used that way. It does not diagnose rupture, does not choose between open and endovascular repair, and does not substitute for a conversation about goals of care, which is the decision it is most often wrongly invoked to settle.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: age, creatinine, hemoglobin, unconscious, ecgIschemia -- each yes/no.
export function hardman(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = HARDMAN_CRITERIA.map((c) => ({ c, v: readBool(o[c.key]) }));
  const missing = read.filter((r) => r.v === null);
  if (missing.length) {
    return { valid: false, message: `Answer every factor. Still needed: ${missing.map((r) => r.c.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.v));
  if (bad.length) {
    return { valid: false, message: `Each factor must be yes or no. Unrecognized: ${bad.map((r) => r.c.key).join(', ')}.` };
  }

  const met = read.filter((r) => r.v);
  const total = met.length;
  const atOrAboveThree = total >= 3;

  return {
    valid: true,
    total,
    metFactors: met.map((r) => r.c.key),
    atOrAboveThree,
    originalSeriesMortality: ORIGINAL_SERIES[total],
    refutation: REFUTATION,
    bandLabel: `Hardman index ${total} of 5`,
    band: `Hardman index ${total} of 5. The original 1996 series observed ${ORIGINAL_SERIES[total]}.${atOrAboveThree ? ` ${REFUTATION}` : ''} This score does not identify patients who should be denied an operation, and the literature is explicit that it must not be used that way.`,
    note: NOTE,
  };
}
