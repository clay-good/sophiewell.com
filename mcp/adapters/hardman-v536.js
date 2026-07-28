// spec-v536 MCP wave: adapter for the Hardman index in lib/hardman-v536.js. The dom keys mirror the browser
// renderer (views/group-v536.js) and META['hardman'].example: hard-<key> maps to the lib arg <key>.
//
// **THE SUMMARY LEADS WITH THE REFUTATION, NOT THE SCORE, AND THAT IS THE ENTIRE DESIGN POINT OF THIS
// ADAPTER.** The original 1996 finding - that all eight patients with three or more factors died - entered
// practice as a rule for DENYING SURGERY, and it has been repeatedly refuted since. An agent that fetched
// "Hardman index 4" and reported "100 percent mortality" would be reproducing the exact error the later
// literature exists to correct, in the one clinical situation where that error is irreversible: a ruptured
// abdominal aortic aneurysm is fatal without repair, so a wrongly withheld operation is not a conservative
// choice.
//
// The compute result therefore never returns a bare mortality figure. `originalSeriesMortality` is a
// sentence, not a number, and at every score of 3 or more it is accompanied by a `refutation` field carrying
// the pooled 77-percent figure and the explicit finding that the index cannot be used as an absolute limit
// for denial of surgery. Every band, at every score, states that the index does not identify patients who
// should be denied an operation.
//
// UNITS ARE SPELLED OUT ON THE FIELD LABELS. Creatinine is over 190 micromol/L with the mg/dL equivalent
// given, because one secondary source renders it as 180 and because an agent working in mg/dL has no way to
// convert a micromol/L threshold it was never told about. Hemoglobin is given in both g/dL and g/L.
//
// All five are required: this is a count of factors, so an omitted factor is not the same as an absent one
// and would silently deflate the index.

import * as H from '../../lib/hardman-v536.js';

export default [
  {
    id: 'hardman',
    summary: 'The Hardman index (Hardman and colleagues 1996) counts five factors present at presentation with a RUPTURED abdominal aortic aneurysm: age over 76 years, serum creatinine over 190 micromol/L (0.19 mmol/L, about 2.15 mg/dL), hemoglobin below 9.0 g/dL (90 g/L), loss of consciousness after presentation, and ECG evidence of ischemia defined as ST depression over 1 mm and/or associated T-wave changes. Each scores one point, total 0 to 5. CRITICAL CONTEXT, WHICH MUST ACCOMPANY ANY REPORT OF THIS SCORE: the original series reported that all eight patients with three or more factors died, and that figure entered practice as a rule for DENYING SURGERY. It has since been repeatedly refuted. A pooled analysis of about 970 patients found mortality at an index of three or more to be 77 percent rather than 100, and concluded that an index of three or more cannot be used as an absolute limit for denial of surgery. A validation of 178 patients found mortality of 44, 46, 68, 79 and 100 percent at scores 0 through 4, found that loss of consciousness, hemoglobin below 9, and creatinine above 0.19 mmol/L were NOT individually significant predictors, and concluded that high-risk patients may still survive and should not be denied surgical repair on the basis of the scoring system alone. A further validation of 59 patients found no significant association between an index of three or more and death. The mortality figures from the original series are reported as that single 1996 cohort of 154 patients observed, with only 8 patients in the highest group, and NOT as validated performance; only the hundred-percent element is independently restated in later work. A ruptured abdominal aortic aneurysm is fatal without repair, so this score does not identify patients who should be denied an operation and must not be used that way. It does not diagnose rupture, does not choose between open and endovascular repair, and does not substitute for a conversation about goals of care, which is the decision it is most often wrongly invoked to settle.',
    compute: H.hardman,
    fields: H.HARDMAN_CRITERIA.map((c) => ({
      dom: `hard-${c.key}`,
      arg: c.key,
      kind: 'enum',
      values: ['no', 'yes'],
      required: true,
      label: `${c.text}? ${c.detail}`,
    })),
  },
];
