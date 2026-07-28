// spec-v552 MCP wave: adapter for the SNOT-22 in lib/snot22-v552.js. The dom keys mirror the browser
// renderer (views/group-v552.js) and META['snot22'].example: snot22-<itemKey> map to the lib args of the
// same name.
//
// **A SCORE BELOW 8 IS NOT "MILD", AND AN AGENT WILL CALL IT MILD UNLESS TOLD OTHERWISE.** The
// stratification defines mild as 8 to 20 inclusive, moderate as above 20 up to 50, and severe as above 50 -
// and defines NOTHING below 8, describing such a score as having no clinically significant symptoms. A
// three-band scale whose lowest band starts at 8 rather than 0 looks like an off-by-one to fix. It is not.
// The tool returns a distinct band with `namedBand: false` for 0-7, so a symptom-free patient is not filed
// alongside one scoring 20.
//
// **THE BANDS ARE NOT PART OF THE INSTRUMENT.** The 22 items and their anchors are the Washington
// University questionnaire, which defines NO severity bands at all; the cut points come from a separate
// 2016 stratification study of 65 patients. The summary says so, because an agent that believes the
// instrument ships with bands will over-trust them and will not flag the small derivation sample.
//
// **THE "MOST IMPORTANT ITEMS" SELECTION IS NEVER SCORED.** The form's second question asks the patient to
// mark up to five items most affecting their health. It is a separate checkbox column: not summed, not
// weighted, and it does not modify any item's contribution. An agent that up-weighted the marked items
// would return a number that is not a SNOT-22 score. The tool records the selection, caps it at five, and
// returns it strictly alongside the total.
//
// THE MCID IS A PROPERTY OF A COMPARISON, NOT OF A SINGLE SCORE. An absolute difference of 8.9 or more
// between two SNOT-22 scores from the same patient is considered clinically meaningful. Attached to a lone
// total it would read as a threshold, which it is not, so the summary states what it applies to.
//
// A COMPANION TO `lund-mackay`, NOT A DUPLICATE. That stages the CT; this asks the patient. The two
// correlate poorly by design, so an agent must not treat one as a proxy for the other.

import * as S from '../../lib/snot22-v552.js';

export default [
  {
    id: 'snot22',
    summary: `The 22-item Sino-Nasal Outcome Test (SNOT-22), a PATIENT-REPORTED measure of the symptom burden of rhinosinusitis. Twenty-two items, each rated 0 for no problem, 1 very mild, 2 mild or slight, 3 moderate, 4 severe, and 5 a problem as bad as it can be, giving a total of 0 to ${S.SNOT22_MAX} where HIGHER IS WORSE. The recall period is fixed at the PAST TWO WEEKS and is part of the instrument rather than a setting. IT IS A COMPANION TO lund-mackay, NOT A DUPLICATE: that stages the CT scan, this asks the patient, and the two correlate poorly with one another by design, so a near-normal CT can accompany a severe symptom burden and the reverse. Do not treat one as a proxy for the other. A SCORE BELOW 8 IS NOT MILD AND HAS NO NAMED BAND: the stratification defines mild as 8 to 20 INCLUSIVE, moderate as above 20 and up to 50, and severe as above 50, and defines nothing below 8, describing a score in that range as having no clinically significant symptoms. A three-band scale whose lowest band starts at 8 rather than 0 looks like an off-by-one to correct, and it is not - rounding 0 to 7 into mild would invent a band the source does not contain and would file a symptom-free patient alongside one scoring 20. The tool returns a distinct band with namedBand false for that range. THE BANDS ARE NOT PART OF THE QUESTIONNAIRE, WHICH DEFINES NONE: the 22 items and their anchors are the Washington University instrument, while the cut points come from a separate 2016 stratification study of 65 patients, and are reported as that study proposal rather than as part of the questionnaire. THE FORM SECOND QUESTION IS A DESCRIPTOR AND IS NEVER SCORED: it asks the patient to mark up to five items most affecting their health, and that selection is not summed, not weighted, and does not modify any item contribution. A total that included it would not be a SNOT-22 score. The optional mostImportant argument records the selection, caps it at five, and returns it strictly alongside the total. THE MINIMAL CLINICALLY IMPORTANT DIFFERENCE OF ${S.SNOT22_MCID} APPLIES TO THE DIFFERENCE BETWEEN TWO SCORES from the same patient, not to a single total: it says nothing about whether one score is high. This is a patient-reported symptom measure. It does NOT diagnose chronic rhinosinusitis, which requires symptom duration together with objective confirmation by endoscopy or CT, and it does not distinguish rhinosinusitis from allergic rhinitis, migraine, or the other causes of facial pain and nasal symptoms. Many of its items, including sleep, fatigue, concentration and sadness, are NOT SPECIFIC TO THE NOSE and move with depression, sleep disorders and general health, so a high total is not by itself evidence of sinus disease. It is not an indication for surgery and does not select medical therapy.`,
    compute: S.snot22,
    fields: [
      ...S.SNOT22_ITEMS.map((item) => ({
        dom: `snot22-${item.key}`, arg: item.key, kind: 'enum',
        values: S.SNOT22_OPTIONS.map((o) => String(o.value)), required: true,
        label: `${item.text}, over the past two weeks [${S.SNOT22_OPTIONS.map((o) => `${o.value} = ${o.text}`).join('; ')}]`,
      })),
      {
        dom: 'snot22-most-important', arg: 'mostImportant', kind: 'string', required: false,
        label: `Optional, NEVER SCORED. A comma-separated list of up to ${S.MOST_IMPORTANT_LIMIT} item keys the patient marked as most affecting their health. Recorded alongside the total; not summed, not weighted, and it does not change any item contribution.`,
      },
    ],
  },
];
