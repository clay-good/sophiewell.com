// spec-v589 MCP wave: adapter for the Sternbach criteria in lib/sternbach-v589.js. The dom keys mirror the
// browser renderer (views/group-v589.js) and META['sternbach'].example.
//
// **THREE OF THE FOUR REQUIREMENTS ARE NOT SYMPTOMS, AND ONE OF THEM IS A NEGATIVE.** Meeting 3 of the 10
// features is NECESSARY AND NOT SUFFICIENT. The diagnosis also requires that the features coincided with the
// ADDITION OR INCREASE of a serotonergic agent, that other causes have been RULED OUT, and that A
// NEUROLEPTIC HAD NOT BEEN STARTED OR INCREASED IN DOSAGE before onset. That last is a HARD NEGATIVE and it
// is the one implementations drop; it exists because neuroleptic malignant syndrome is the differential, so
// a symptom count that ignores it will label an NMS patient with serotonin syndrome.
//
// **THE SUPERIORITY OF THE SUCCESSOR IS CONTESTED.** The usual summary is that Hunter is simply better
// (sensitivity 84 against 75 percent, specificity 97 against 96). A published re-examination notes the
// Hunter derivation dataset OVERLAPPED SUBSTANTIALLY WITH ITS VALIDATION DATA, so the comparison cannot be
// upheld as stated, and reports that in its own case series Sternbach missed 10 percent of cases against
// Hunter's 37 percent. Do not report "Sternbach is obsolete" as settled.
//
// **THE TEN FEATURES ARE MOSTLY NON-SPECIFIC.** Agitation, diaphoresis, shivering, tremor, diarrhea and
// fever are shared with many acute illnesses, so a patient on an SSRI with a febrile gastroenteritis can
// reach 3 of 10 without serotonin toxicity. The exclusion requirement is load-bearing, not decorative.
//
// **ONE REPRODUCTION ADDS AN ELEVENTH FEATURE AND THAT CAN CHANGE A VERDICT.** At least one authoritative
// review prints an eleven-item list adding RIGIDITY. Because the bar is 3 of N, a patient with rigidity and
// exactly two of the ten is POSITIVE under the eleven-item rendering and NEGATIVE under the ten-item one.
// The ten-item list is applied; rigidity is asked separately and
// `verdictDependsOnDisputedFeature` flags every case whose answer would flip. Report that flag.
//
// **FAILING THESE CRITERIA DOES NOT EXCLUDE SEROTONIN SYNDROME.** Early or mild cases commonly do not meet
// them. Never use this to rule the diagnosis out.

import * as S from '../../lib/sternbach-v589.js';

export default [
  {
    id: 'sternbach',
    summary: `The STERNBACH CRITERIA for SEROTONIN SYNDROME (Sternbach 1991). At least ${S.FEATURES_REQUIRED} of ${S.FEATURES.length} clinical features - ${S.FEATURES.map((f) => f.text).join('; ')} - PLUS ALL THREE of these requirements, WHICH ARE NOT SYMPTOMS: ${S.REQUIREMENTS.map((r) => r.text).join('; ')}. **MEETING ${S.FEATURES_REQUIRED} OF ${S.FEATURES.length} IS NECESSARY AND NOT SUFFICIENT.** The neuroleptic requirement is a HARD NEGATIVE and is the one implementations drop: it exists because NEUROLEPTIC MALIGNANT SYNDROME IS THE DIFFERENTIAL, so a symptom count that ignores it will label an NMS patient with serotonin syndrome. **THE TEN FEATURES ARE MOSTLY NON-SPECIFIC** - agitation, diaphoresis, shivering, tremor, diarrhea and fever are shared with many acute illnesses, so a patient on an SSRI with a febrile gastroenteritis can reach ${S.FEATURES_REQUIRED} of ${S.FEATURES.length} WITHOUT serotonin toxicity, which is why the exclusion requirement is load-bearing and why the successor Hunter criteria were built around clonus, a specific sign. **THE SUPERIORITY OF THAT SUCCESSOR IS CONTESTED**: the headline figures are Hunter sensitivity ${S.SENSITIVITY.hunter} percent against Sternbach ${S.SENSITIVITY.sternbach} and specificity ${S.SPECIFICITY.hunter} against ${S.SPECIFICITY.sternbach}, but a published re-examination notes the Hunter derivation dataset overlapped substantially with its validation data, so the comparison cannot be upheld as stated, and reports that in its own case series Sternbach missed 10 percent of cases against Hunter's 37 percent. DO NOT report "Sternbach is obsolete" as settled. **ONE REPRODUCTION ADDS AN ELEVENTH FEATURE AND THAT CAN CHANGE A VERDICT**: at least one authoritative review prints an eleven-item list adding ${S.DISPUTED_FEATURE}, and because the bar is ${S.FEATURES_REQUIRED} of N a patient with ${S.DISPUTED_FEATURE} and exactly two of the ten is POSITIVE under that rendering and NEGATIVE under this one. The ten-item list is applied, ${S.DISPUTED_FEATURE} is asked separately, and \`verdictDependsOnDisputedFeature\` flags every case whose answer would flip - report that flag. These are diagnostic criteria for a clinical diagnosis that can deteriorate quickly. **FAILING THEM DOES NOT EXCLUDE SEROTONIN SYNDROME** - early or mild cases commonly do not meet them - and this must NEVER be used to rule the diagnosis out. Meeting them does NOT grade severity and does NOT select treatment: not cyproheptadine, not sedation, not paralysis and intubation for hyperthermia, and not which drug to stop. Serotonin syndrome and neuroleptic malignant syndrome overlap clinically, and the neuroleptic requirement is a CRITERION rather than a reliable way to tell them apart.`,
    compute: S.sternbach,
    fields: [
      ...S.FEATURES.map((f) => ({
        dom: `stern-${f.key}`, arg: f.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${f.text}. One of the ${S.FEATURES.length} features; ${S.FEATURES_REQUIRED} are required and are not sufficient on their own.`,
      })),
      {
        dom: `stern-${S.DISPUTED_FEATURE}`, arg: S.DISPUTED_FEATURE, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${S.DISPUTED_FEATURE.charAt(0).toUpperCase()}${S.DISPUTED_FEATURE.slice(1)}. THE DISPUTED ELEVENTH FEATURE: present in one authoritative reproduction and not in the widely used ten-item list. It is NOT counted here, but it sets \`verdictDependsOnDisputedFeature\` when counting it would change the answer.`,
      },
      ...S.REQUIREMENTS.map((r) => ({
        dom: `stern-${r.key}`, arg: r.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${r.text}. A REQUIREMENT, NOT A SYMPTOM: "no" defeats the diagnosis however many features are present.`,
      })),
    ],
  },
];
