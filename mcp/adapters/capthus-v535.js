// spec-v535 MCP wave: adapter for the CaPTHUS score in lib/capthus-v535.js. The dom keys mirror the browser
// renderer (views/group-v535.js) and META['capthus'].example: cap-<key> maps to the lib arg <key>.
//
// THE CALCIUM FIELD LABEL CARRIES BOTH UNITS AND SAYS WHICH IS WHICH. The threshold is 12 mg/dL, equivalently
// 3 mmol/L, and the bare number 3 sits next to a score that also runs 0-5. An agent that read the 3 as mg/dL
// would award the calcium point to essentially every patient with primary hyperparathyroidism and inflate
// every score it produced.
//
// CONCORDANCE IS ITS OWN FIELD, NOT DERIVED. Two positive scans pointing at DIFFERENT glands score 2, not 3.
// An agent given only "ultrasound positive" and "sestamibi positive" and left to infer concordance would
// over-score exactly the discordant patient the fifth criterion exists to catch. The result exposes a
// `discordantScans` flag so a caller can see when that case arises.
//
// THE SUMMARY LABELS THE 100 PERCENT AS DERIVATION-COHORT PERFORMANCE. Reporting a bare "100 percent
// positive predictive value" is the single most misleading thing this tool could say; external validation
// runs lower and varies, and a secondary account of 91 percent circulates.
//
// IT ALSO STATES THE ASYMMETRY, which is the part agents get wrong in the other direction: the NEGATIVE
// predictive value is poor. A score below 3 does not predict multigland disease - it is an absence of
// information. An agent that reports "CaPTHUS 1, suggests four-gland hyperplasia" has inverted the
// instrument.

import * as C from '../../lib/capthus-v535.js';

export default [
  {
    id: 'capthus',
    summary: 'The CaPTHUS score (Kebebew and colleagues 2006) predicts single-gland disease in a patient ALREADY DIAGNOSED with primary hyperparathyroidism. Five criteria score one point each: a preoperative total serum calcium at or above 12 mg/dL, which is equivalently 3 mmol/L and is NOT 3 mg/dL; an intact PTH at or above twice the upper limit of the reference range; a neck ultrasound positive for ONE enlarged parathyroid gland; a sestamibi scan positive for ONE enlarged parathyroid gland; and CONCORDANCE between the two scans on the same single gland on the same side. Concordance is scored separately from the two scans being individually positive, so two positive scans pointing at different glands score 2 rather than 3. A score of 3 or more predicted single-gland disease with a positive predictive value reported as 100 percent IN THE DERIVATION COHORT; that is derivation performance rather than a general property, and external validation runs lower and varies, with figures in the mid-90s more typical. The NEGATIVE predictive value is poor, which matters in the other direction: a score below 3 does NOT predict multigland disease, it is an absence of information rather than evidence of four-gland disease, so this is a rule-in for a focused approach and not a rule-out. It predicts anatomy, not the need for an operation. It does not diagnose primary hyperparathyroidism, does not establish that surgery is indicated - that turns on the published operative criteria along with symptoms, bone density, renal involvement and age - and is not a substitute for intraoperative PTH monitoring or for the surgeon deciding to convert to bilateral exploration. It says nothing about familial hypocalciuric hypercalcemia, which must be excluded before any of this applies, and nothing about parathyroid carcinoma.',
    compute: C.capthus,
    fields: C.CAPTHUS_CRITERIA.map((c) => ({
      dom: `cap-${c.key}`,
      arg: c.key,
      kind: 'enum',
      values: ['no', 'yes'],
      required: true,
      label: `${c.letter} - ${c.text}? ${c.detail}`,
    })),
  },
];
