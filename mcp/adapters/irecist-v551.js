// spec-v551 MCP wave: adapter for the iRECIST time-point response in lib/irecist-v551.js. The dom keys
// mirror the browser renderer (views/group-v551.js) and META['irecist'].example.
//
// **iCPD IS NOT REACHABLE WITHOUT A PRIOR iUPD, AND THE TOOL ENFORCES THAT STRUCTURALLY.** Progression is
// never assigned on a single scan. An agent that knows RECIST 1.1 will reach for "PD" the moment the sum of
// measures grows by 20 percent or a new lesion appears; under iRECIST that is iUPD, unconfirmed, and it
// takes a further assessment at least 4 weeks and no more than 8 weeks later to become iCPD. `irecist-prior`
// is required for exactly this reason.
//
// **THE BAR RESETS, AND THIS IS THE ONE RULE THAT INVERTS RECIST 1.1 KNOWLEDGE.** Under RECIST 1.1 any
// progression permanently precludes a later complete response, partial response or stable disease. Under
// iRECIST, if the confirmatory scan shows shrinkage against BASELINE meeting iCR, iPR or iSD, the criteria
// for iCPD are not considered to have been met: that response is assigned, and iUPD must occur AGAIN from
// nadir and then be confirmed before iCPD can be reached. An agent applying its RECIST 1.1 prior here would
// refuse to assign a response it is required to assign. iUPD may therefore be assigned MULTIPLE TIMES so
// long as iCPD is never confirmed.
//
// **NO CHANGE FROM iUPD IS STILL iUPD.** Confirmation requires FURTHER increase, not persistence. Treating
// the confirmatory scan as a yes/no on "is the disease still progressed?" converts every stable-but-enlarged
// patient into confirmed progression, which is the precise failure mode iRECIST was written to prevent.
//
// **NEW LESIONS ARE NEVER ADDED TO THE BASELINE TARGET SUM.** They are recorded separately, up to five and
// no more than two per organ as new lesion-target, everything else as new lesion-non-target. Folding them
// into the sum of measures of the original target lesions would inflate that sum and manufacture the very
// progression iRECIST treats as provisional.
//
// THE FOUR CONFIRMATION FIELDS ARE SEPARATE BECAUSE THE THRESHOLDS ARE NOT UNIFORM: at least 5 mm for
// target disease, ANY further increase for non-target disease (explicitly need NOT be unequivocal
// progression), and for new lesions a 5 mm NLT sum increase OR any NLNT increase OR additional lesions.
// Collapsing them into one "did it get worse?" question would apply the 5 mm bar where the source does not
// put it and would miss confirmations the source counts.

import * as I from '../../lib/irecist-v551.js';

export default [
  {
    id: 'irecist',
    summary: 'iRECIST time-point response for clinical trials testing immunotherapeutics (Seymour and colleagues, Lancet Oncology 2017). It adapts RECIST 1.1 because immunotherapy can cause PSEUDOPROGRESSION: immune-cell infiltration transiently enlarges lesions, or makes undetectable lesions detectable, before a deep and durable response follows. THE CENTRAL RULE IS THAT PROGRESSION IS NEVER ASSIGNED ON A SINGLE SCAN. The first assessment meeting RECIST 1.1 progression criteria is iUPD (unconfirmed immune progressive disease), and confirmation as iCPD (confirmed) requires a further imaging assessment AT LEAST 4 WEEKS AND NO MORE THAN 8 WEEKS later. iCPD is therefore NOT REACHABLE without a prior iUPD, and this tool enforces that structurally rather than by warning. THE BAR RESETS, AND THIS INVERTS RECIST 1.1: under RECIST 1.1 any progression permanently precludes a later complete response, partial response or stable disease, but under iRECIST, if the next scan shows shrinkage AGAINST BASELINE meeting iCR, iPR or iSD criteria, the criteria for iCPD are NOT considered to have been met, that response IS assigned, and iUPD must occur again from nadir and then be confirmed before iCPD can be reached. iUPD may be assigned MULTIPLE TIMES so long as iCPD is never confirmed. NO CHANGE FROM A PRIOR iUPD REMAINS iUPD, NOT iCPD: confirmation requires FURTHER increase, not persistence, and treating the confirmatory scan as a yes/no on whether the disease is still progressed would convert every stable-but-enlarged patient into confirmed progression, the exact failure mode iRECIST exists to prevent. NEW LESIONS DO NOT AUTOMATICALLY MEAN PROGRESSION and are NEVER added to the sum of measures of the original target lesions: up to five, no more than two per organ, are recorded separately as new lesion-target (NLT), and all other measurable and non-measurable lesions as new lesion-non-target (NLNT). A new lesion produces iUPD; it takes a confirmatory scan to make it iCPD, and NLNT alone can drive iUPD or iCPD without any lesion meeting NLT criteria. THE CONFIRMATION THRESHOLDS ARE NOT UNIFORM ACROSS CATEGORIES: target disease requires a further increase in the sum of measures of AT LEAST 5 MM; non-target disease requires any further increase and explicitly NEED NOT meet RECIST 1.1 criteria for unequivocal progression; new lesions require an NLT sum-of-measures increase of at least 5 mm, OR any increase in NLNT, OR additional new lesions. Progression by RECIST 1.1 in a lesion category that had NOT previously progressed also confirms iCPD. This is a DATA-COLLECTION AND ANALYSIS standard for trials. The source states that it describes what data are to be collected, submitted and analysed, and that all decisions about continuing or stopping therapy rest with the patient and their health care provider. It does NOT decide whether to continue treatment past iUPD, and the source own condition for permitting that, namely that the patient be CLINICALLY STABLE, is a clinical judgment this tool does not make. It does not measure lesions, does not determine whether a new lesion is malignant rather than artefactual, and does not compute best overall response across time points.',
    compute: I.irecist,
    fields: [
      {
        dom: 'irecist-target', arg: 'target', kind: 'enum',
        values: I.TARGET_RESPONSES.map((r) => r.value), required: true,
        label: `Target-lesion response by RECIST 1.1 criteria [${I.TARGET_RESPONSES.map((r) => `${r.value} = ${r.text}`).join(' ')}]`,
      },
      {
        dom: 'irecist-nontarget', arg: 'nonTarget', kind: 'enum',
        values: I.NON_TARGET_RESPONSES.map((r) => r.value), required: true,
        label: `Non-target-lesion response [${I.NON_TARGET_RESPONSES.map((r) => `${r.value} = ${r.text}`).join(' ')}]`,
      },
      {
        dom: 'irecist-newlesions', arg: 'newLesions', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Whether new lesions are present. A new lesion produces iUPD but does not by itself confirm progression, and new lesions are recorded separately rather than added to the baseline target sum of measures.',
      },
      {
        dom: 'irecist-prior', arg: 'priorIupd', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Whether iUPD was recorded at the IMMEDIATELY PRECEDING assessment. REQUIRED: without a prior iUPD, iCPD is not reachable at all, because progression is never confirmed on a single scan.',
      },
      {
        dom: 'irecist-t-inc', arg: 'targetIncrease', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'Target disease: further increase in the sum of measures of AT LEAST 5 MM since the prior iUPD. Read only when iUPD was recorded previously and this assessment is still progressed.',
      },
      {
        dom: 'irecist-nt-inc', arg: 'nonTargetIncrease', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'Non-target disease: ANY further increase since the prior iUPD. It explicitly NEED NOT meet RECIST 1.1 criteria for unequivocal progression, so the 5 mm bar does not apply here.',
      },
      {
        dom: 'irecist-nl-inc', arg: 'newLesionIncrease', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'New lesions: sum of measures of new lesion-target up by at least 5 mm, OR any increase in new lesion-non-target, OR additional new lesions, since the prior iUPD.',
      },
      {
        dom: 'irecist-newcat', arg: 'newCategoryProgression', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'Whether RECIST 1.1 defined progression is now present in a lesion category that had NOT previously met progression criteria. This also confirms iCPD.',
      },
    ],
  },
];
