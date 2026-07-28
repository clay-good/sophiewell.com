// spec-v535: the CaPTHUS score, predicting single-gland disease in primary hyperparathyroidism. Zero-hit
// before this tile: "capthus", "kebebew", "parathyroid", and "sestamibi" across corpus.json, app.js, and
// lib/meta.js. The `hyperparathyroidism` hits sit inside the calcium/creatinine clearance ratio tile's
// interpretation text, which answers a different question (distinguishing familial hypocalciuric
// hypercalcemia from primary hyperparathyroidism) and is a DIAGNOSTIC test. CaPTHUS assumes the diagnosis is
// already made and predicts the SURGICAL ANATOMY.
//
// THE NAME IS THE MNEMONIC, AND IT IS WHY THE SCORE IS EASY TO MISREMEMBER:
//   Ca    preoperative total serum calcium at or above 3 mmol/L, equivalently 12 mg/dL
//   PTH   intact PTH at or above TWICE the upper limit of normal
//   U     Ultrasound positive for ONE enlarged parathyroid gland
//   S     Sestamibi positive for ONE enlarged parathyroid gland
//   +     the two scans CONCORDANT: the same single gland, on the same side
// Five criteria, one point each, total 0-5.
//
// **THE CALCIUM THRESHOLD IS 12 mg/dL, NOT 3 mg/dL.** The original states it in both units, "3 mmol/L
// [12 mg/dL]", and the number 3 sitting next to a score that also runs 0-5 is a standing invitation to
// misread the unit. A calculator that applied 3 mg/dL would award the calcium point to essentially every
// patient with primary hyperparathyroidism and inflate every score. This tile labels the unit on the field
// and states both conversions.
//
// THE FIFTH CRITERION IS NOT REDUNDANT WITH THE THIRD AND FOURTH. Concordance is scored SEPARATELY from the
// two scans being individually positive, so a patient whose ultrasound and sestamibi each localize a single
// gland but to DIFFERENT glands scores 2 for those criteria and NOT 3. Implementations that treat
// concordance as implied by two positive scans over-score exactly the discordant patient the criterion
// exists to catch.
//
// THE THRESHOLD AND WHAT IT ACTUALLY CLAIMS: a score of 3 or more predicted single-gland disease with a
// positive predictive value reported as 100 percent IN THE DERIVATION COHORT. That figure is the derivation
// performance and this tile labels it as such rather than presenting it as a general property. External
// validation runs lower and varies -- a positive predictive value in the mid-90s is more typical, and one
// widely cited secondary account gives 91 percent. Reporting a bare "100 percent" without that framing is
// the single most misleading thing this tile could do.
//
// AND THE ASYMMETRY THAT MATTERS MORE: the negative predictive value is POOR. A low score does NOT predict
// multigland disease; it predicts nothing much. The score is a rule-IN for a focused approach, not a
// rule-out, so a score below 3 is an absence of information rather than evidence of four-gland disease.
//
// HIGH-STAKES: this predicts anatomy, not the need for an operation. It does NOT diagnose primary
// hyperparathyroidism, does not establish that surgery is indicated -- that turns on the published operative
// criteria, symptoms, bone density, renal involvement, and age -- and is not a substitute for
// intraoperative PTH monitoring or for the surgeon's own judgment about converting to bilateral exploration
// (spec-v11 section 5.3). It says nothing about familial hypocalciuric hypercalcemia, which must be excluded
// before any of this applies, and nothing about parathyroid carcinoma. The operative decision stays with the
// surgeon.
//
// CRITERIA, UNITS, AND THE THRESHOLD RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the primary
// abstract and corroborating validation studies:
//   - Kebebew E, Hwang J, Reiff E, Duh QY, Clark OH. Predictors of single-gland vs multigland parathyroid
//     disease in primary hyperparathyroidism: a simple and accurate scoring model. Arch Surg.
//     2006;141(8):777-782.
//   - External validation cohorts reproducing the same five criteria and the same score-of-3 threshold, and
//     reporting the lower positive predictive values noted above.

export const CAPTHUS_CRITERIA = [
  {
    key: 'calcium',
    letter: 'Ca',
    text: 'Preoperative total serum calcium at or above 12 mg/dL (3 mmol/L)',
    detail: 'Note the unit: 12 mg/dL, equivalently 3 mmol/L. Reading the 3 as mg/dL would award this point to almost every patient.',
  },
  {
    key: 'pth',
    letter: 'PTH',
    text: 'Intact PTH at or above twice the upper limit of the reference range',
    detail: 'Twice the upper limit of normal, not twice the mid-range and not simply elevated.',
  },
  {
    key: 'ultrasound',
    letter: 'U',
    text: 'Neck ultrasound positive for ONE enlarged parathyroid gland',
    detail: 'One gland, not simply an abnormal study.',
  },
  {
    key: 'sestamibi',
    letter: 'S',
    text: 'Sestamibi scan positive for ONE enlarged parathyroid gland',
    detail: 'One gland, not simply an abnormal study.',
  },
  {
    key: 'concordant',
    letter: '+',
    text: 'The ultrasound and the sestamibi are CONCORDANT: the same single gland, on the same side',
    detail: 'Scored separately from the two scans being individually positive. Two positive scans pointing at DIFFERENT glands score 2 here, not 3.',
  },
];

const PREDICTS_AT = 3;

const NOTE = 'The CaPTHUS score (Kebebew and colleagues 2006) predicts single-gland disease in a patient already diagnosed with primary hyperparathyroidism. Five criteria score one point each: a preoperative total serum calcium at or above 12 mg/dL, equivalently 3 mmol/L; an intact PTH at or above twice the upper limit of normal; a neck ultrasound positive for one enlarged gland; a sestamibi scan positive for one enlarged gland; and concordance between the two scans on the same single gland. The calcium threshold is 12 mg/dL and not 3 mg/dL, and misreading the unit would award that point to almost every patient. Concordance is scored separately from the two scans being individually positive, so two positive scans pointing at different glands score 2 rather than 3. A score of 3 or more predicted single-gland disease with a positive predictive value reported as 100 percent in the derivation cohort; that is derivation performance, and external validation runs lower and varies, with figures in the mid-90s more typical. The negative predictive value is poor, so a low score does not predict multigland disease: this is a rule-in for a focused approach rather than a rule-out, and a score below 3 is an absence of information rather than evidence of four-gland disease. It predicts anatomy, not the need for an operation. It does not diagnose primary hyperparathyroidism, does not establish that surgery is indicated, which turns on the published operative criteria along with symptoms, bone density, renal involvement and age, and is not a substitute for intraoperative PTH monitoring or for the surgeon deciding to convert to bilateral exploration. It says nothing about familial hypocalciuric hypercalcemia, which must be excluded before any of this applies, and nothing about parathyroid carcinoma.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: calcium, pth, ultrasound, sestamibi, concordant -- each yes/no.
export function capthus(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = CAPTHUS_CRITERIA.map((c) => ({ c, v: readBool(o[c.key]) }));
  const missing = read.filter((r) => r.v === null);
  if (missing.length) {
    return { valid: false, message: `Answer every criterion. Still needed: ${missing.map((r) => r.c.letter).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.v));
  if (bad.length) {
    return { valid: false, message: `Each criterion must be yes or no. Unrecognized: ${bad.map((r) => r.c.letter).join(', ')}.` };
  }

  const met = read.filter((r) => r.v);
  const total = met.length;
  const predictsSingleGland = total >= PREDICTS_AT;

  const byKey = Object.fromEntries(read.map((r) => [r.c.key, r.v]));
  // Flag the discordant-but-both-positive case explicitly: it is the one the fifth criterion exists for.
  const discordantScans = byKey.ultrasound && byKey.sestamibi && !byKey.concordant;

  const discordNote = discordantScans
    ? ' Both scans localize a single gland but they are not concordant, so the concordance point is not awarded.'
    : '';

  return {
    valid: true,
    total,
    metLetters: met.map((r) => r.c.letter),
    predictsSingleGland,
    discordantScans,
    bandLabel: `CaPTHUS ${total} of 5`,
    band: `CaPTHUS ${total} of 5${met.length ? ` (${met.map((r) => r.c.letter).join(', ')})` : ''}.${discordNote} ${predictsSingleGland ? 'A score of 3 or more predicted single-gland disease, with a positive predictive value reported as 100 percent in the derivation cohort; external validation runs lower.' : 'Below 3. The negative predictive value is poor, so this does not predict multigland disease: it is an absence of information rather than evidence of four-gland disease.'} It predicts anatomy, not whether an operation is indicated.`,
    note: NOTE,
  };
}
