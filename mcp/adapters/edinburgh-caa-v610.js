// spec-v610 MCP wave: adapter for the Edinburgh CT criteria in lib/edinburgh-caa-v610.js. The dom keys
// mirror the browser renderer (views/group-v610.js) and META['edinburgh-caa'].example.
//
// **BOTH VERSIONS ARE RETURNED.** `original` uses subarachnoid extension, finger-like projections and APOE
// e4; `simplified` uses the two CT findings only. When APOE is "unknown" - the usual state when the CT is
// read - `original` is null and MUST NOT be guessed.
//
// **THE SIMPLIFIED VERSION CAN ONLY EVER READ LOWER, NEVER HIGHER.** Three of the eight combinations differ
// and the original is higher in all three; the entire gap is APOE e4.
//
// **IT IS NOT A COUNT OF ANY TWO OF THREE FINDINGS.** A widely-repeated restatement says so; the derivation
// paper does not. High risk requires subarachnoid extension AND at least one other predictor, so
// subarachnoid extension is a GATE. Finger-like projections plus APOE e4 WITHOUT subarachnoid extension is
// NOT high risk.
//
// **FINGER-LIKE PROJECTIONS NEVER COUNT ON THEIR OWN, IN EITHER VERSION.**
//
// This applies ONLY to LOBAR hemorrhage already seen on CT. It does not diagnose the hemorrhage, does not
// establish CAA, does not replace the MRI-based Boston criteria, and does not decide anticoagulation.

import * as E from '../../lib/edinburgh-caa-v610.js';

export default [
  {
    id: 'edinburgh-caa',
    summary: `The EDINBURGH CT CRITERIA (Rodrigues and colleagues 2018) estimate the probability that CEREBRAL AMYLOID ANGIOPATHY CAUSED a LOBAR intracerebral hemorrhage ALREADY SEEN on non-contrast CT. **BOTH VERSIONS ARE RETURNED**: the ORIGINAL uses subarachnoid extension, finger-like projections and the APOE e4 genotype [low = neither subarachnoid extension nor APOE e4; high = subarachnoid extension AND at least one other predictor; medium = everything else], and the SIMPLIFIED CT-only version uses the two CT findings alone [low = no subarachnoid extension; medium = subarachnoid extension; high = subarachnoid extension AND finger-like projections]. ${E.APOE_NOTE} When APOE is "unknown" the \`original\` field is NULL and MUST NOT be guessed. **${E.DIRECTION_NOTE}** **${E.NOT_A_COUNT_NOTE}** **${E.FLP_NOTE}** ${E.RULE_OUT} ${E.RULE_IN} There is one disclosed ambiguity: the derivation paper describes low risk as "when no predictors were present" while its own rule-out criterion is the absence of subarachnoid extension and APOE e4, which places FINGER-LIKE PROJECTIONS ALONE in the low group even though a predictor is present; the simplified criteria settle it as low probability and that is what is returned, with the ambiguity stated at that combination only. This applies ONLY to LOBAR hemorrhage. It does NOT diagnose the hemorrhage, does NOT apply to deep or infratentorial hemorrhage, does NOT establish cerebral amyloid angiopathy - only pathology does that - does NOT replace the MRI-based Boston criteria (\`boston-caa\`, which needs MRI), and does NOT decide anticoagulation.`,
    compute: E.edinburghCaa,
    fields: [
      { dom: 'edin-subarachnoidExtension', arg: 'subarachnoidExtension', kind: 'enum', values: ['yes', 'no'], required: true, label: `${E.FINDINGS[0].text}. THE GATE: without it neither version can reach high probability.` },
      { dom: 'edin-fingerLikeProjections', arg: 'fingerLikeProjections', kind: 'enum', values: ['yes', 'no'], required: true, label: `${E.FINDINGS[1].text}. Never counts on its own - it raises the category only once subarachnoid extension is present.` },
      { dom: 'edin-apoe', arg: 'apoe', kind: 'enum', values: ['positive', 'negative', 'unknown'], required: true, label: 'APOE e4 status. Use "unknown" if the genotype is not back - that is the usual state when the CT is read, and it is why the simplified version exists. With "unknown" the original criteria are not computed.' },
    ],
  },
];
