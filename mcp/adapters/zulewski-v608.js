// spec-v608 MCP wave: adapter for the Zulewski clinical score in lib/zulewski-v608.js. The dom keys mirror
// the browser renderer (views/group-v608.js) and META.zulewski.example.
//
// **THE AGE CORRECTION IS THE FINDING AND MOST REPRODUCTIONS DROP IT.** One point is added when the patient
// is UNDER 55 YEARS, so a patient under 55 with NO clinical findings scores 1, not 0, and the true maximum
// is 13, not 12. NEVER compute this score without asking the age.
//
// **THE BANDS ARE SET ON THE CORRECTED SCORE.** Applying them to an uncorrected score reads every patient
// under 55 one point too low - and the age point alone moves the band at both boundaries (2 to 3 and 5 to
// 6). The adapter returns `uncorrectedScore` and `uncorrectedBand` so the difference is visible.
//
// **THE THREE SKIN ITEMS ARE NOT THE SAME QUESTION.** Dry skin is a patient-reported SYMPTOM; coarse skin is
// a SIGN felt on the hands, forearms and elbows; cold skin is a SIGN read against the examiner's own hands.
// Collapsing them loses two of twelve points.
//
// **IT DOES NOT CORRELATE WITH TSH.** A high score is a reason to MEASURE TSH, never a substitute for it.
//
// Predictive values from validation cohorts are single-sourced and are NOT reported.

import * as Z from '../../lib/zulewski-v608.js';

export default [
  {
    id: 'zulewski',
    summary: `The Zulewski clinical score (Zulewski and colleagues 1997) rates clinical suspicion of hypothyroidism from ${Z.SYMPTOMS.length} symptoms [${Z.SYMPTOMS.map((s) => s.text).join('; ')}] and ${Z.SIGNS.length} signs [${Z.SIGNS.map((s) => s.text).join('; ')}], ONE POINT EACH. **THE AGE CORRECTION IS THE FINDING AND MOST REPRODUCTIONS DROP IT**: ${Z.AGE_CORRECTION_POINTS} point is ADDED when the patient is UNDER ${Z.AGE_CORRECTION_CUTOFF} YEARS, so a patient under ${Z.AGE_CORRECTION_CUTOFF} with NO clinical findings at all scores ${Z.AGE_CORRECTION_POINTS}, not 0, the age point is worth exactly as much as a delayed ankle reflex, and the true maximum is ${Z.CORRECTED_MAX}, not ${Z.ITEM_MAX}. NEVER compute this score without asking the age. The split in the literature is exact: the reproductions that print the twelve-item table state the maximum as ${Z.ITEM_MAX} and do NOT mention the correction, while the sources that state the correction do NOT print the item table. **THE BANDS ARE SET ON THE CORRECTED SCORE** - ${Z.BANDS.map((b) => b.text).join(' ')} Applying them to an UNcorrected score reads every patient under ${Z.AGE_CORRECTION_CUTOFF} one point too low, and the age point ALONE moves the band at both boundaries (2 to 3 and 5 to 6); \`uncorrectedScore\` and \`uncorrectedBand\` are returned so the difference is visible. **THE THREE SKIN ITEMS ARE NOT THE SAME QUESTION**: dry skin is a patient-reported SYMPTOM, coarse skin is a SIGN felt on the hands, forearms and elbows, and cold skin is a SIGN read against the examiner's own hands - skin is a QUARTER of the instrument and collapsing the three loses two points. **IT DOES NOT CORRELATE WITH TSH**: the score correlates with free T4 and free T3 but NOT with TSH, the gold standard for thyroid function testing, so a high score is a reason to MEASURE TSH and NEVER a substitute for it. The items were originally chosen by Billewicz, so this is the SUCCESSOR to that older index rather than an independent instrument. This is a clinical-suspicion score: it does NOT diagnose hypothyroidism, does NOT grade it, and does NOT start, stop or dose levothyroxine. Predictive values from validation cohorts are single-sourced and are NOT reported.`,
    compute: Z.zulewskiScore,
    fields: [
      { dom: 'zul-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: `Age in years. Under ${Z.AGE_CORRECTION_CUTOFF} ADDS ${Z.AGE_CORRECTION_POINTS} point - the correction most reproductions drop.` },
      ...Z.SYMPTOMS.map((s) => ({ dom: `zul-${s.key}`, arg: s.key, kind: 'enum', values: ['yes', 'no'], required: true, label: `SYMPTOM: ${s.text}. 1 point if present.` })),
      ...Z.SIGNS.map((s) => ({ dom: `zul-${s.key}`, arg: s.key, kind: 'enum', values: ['yes', 'no'], required: true, label: `SIGN: ${s.text}. 1 point if present.` })),
    ],
  },
];
