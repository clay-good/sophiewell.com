// spec-v592 MCP wave: adapter for the Amsterdam II criteria in lib/amsterdam-ii-v592.js. The dom keys mirror
// the browser renderer (views/group-v592.js) and META['amsterdam-ii'].example.
//
// **ALL SIX REQUIREMENTS MUST BE MET. IT IS A CONJUNCTION, NOT A COUNT.** There is no score, no threshold
// and no partial credit: a family meeting five of six FAILS. Never report "5 of 6" as a near miss or a
// probability.
//
// **THE "3-2-1" MNEMONIC OMITS HALF THE RULE, AND THE PART IT OMITS IS THE PART FAMILIES FAIL.** It covers
// three affected relatives, two successive generations and one diagnosed under 50. It LEAVES OUT that one of
// the three must be a FIRST-DEGREE relative of the other two, that familial adenomatous polyposis must be
// excluded, and that tumors must be VERIFIED BY PATHOLOGICAL EXAMINATION. Three affected COUSINS satisfy "3"
// and fail the criteria.
//
// **THE CANCER SPECTRUM IS CLOSED AND SHORTER THAN THE SYNDROME**: only colorectal, endometrium, small
// intestine, ureter and renal pelvis count toward the three. A relative with a cancer outside that list
// contributes NOTHING, however strongly the history suggests Lynch syndrome. The list is the criteria's, not
// a summary of which cancers Lynch syndrome causes.
//
// **THE PREDECESSOR COUNTED COLORECTAL CANCER ONLY**, so the same family can meet Amsterdam II and fail
// Amsterdam I. Both are returned from the same inputs.
//
// **A NEGATIVE RESULT MUST NOT STOP AN EVALUATION.** The Bethesda guidelines exist because the Amsterdam
// criteria were found TOO STRICT, and are reported to be more sensitive. Failing Amsterdam II is NOT
// evidence against Lynch syndrome and is NOT a reason to withhold mismatch-repair immunohistochemistry,
// microsatellite-instability testing or germline testing.
//
// **THE SENSITIVITY AND SPECIFICITY PERCENTAGES ARE DELIBERATELY WITHHELD** - `sensitivityPercent` and
// `specificityPercent` are ALWAYS null. The commonly quoted figures appeared in only one of the two sources
// checked. Do not substitute them.

import * as A from '../../lib/amsterdam-ii-v592.js';

export default [
  {
    id: 'amsterdam-ii',
    summary: `The AMSTERDAM II CRITERIA (Vasen and colleagues 1999) identify families that may have LYNCH SYNDROME, also called hereditary non-polyposis colorectal cancer. **ALL ${A.REQUIREMENTS.length} REQUIREMENTS MUST BE MET - THIS IS A CONJUNCTION, NOT A COUNT**, with no score, no threshold and no partial credit, so a family meeting ${A.REQUIREMENTS.length - 1} of ${A.REQUIREMENTS.length} FAILS and must never be reported as a near miss. THE REQUIREMENTS: ${A.REQUIREMENTS.map((r) => r.text).join('; ')}. **THE "3-2-1" MNEMONIC OMITS HALF THE RULE, AND THE PART IT OMITS IS THE PART FAMILIES FAIL**: it covers only three affected relatives, two successive generations and one diagnosed under ${A.AGE_THRESHOLD}, leaving out the FIRST-DEGREE relationship, the exclusion of familial adenomatous polyposis, and the requirement that tumors be VERIFIED BY PATHOLOGICAL EXAMINATION. THREE AFFECTED COUSINS SATISFY "3" AND FAIL THE CRITERIA. **THE CANCER SPECTRUM IS CLOSED AND SHORTER THAN THE SYNDROME**: only ${A.SPECTRUM.join(', ')} count toward the ${A.MIN_RELATIVES}, and a relative with a cancer outside that list contributes NOTHING however strongly the family history suggests Lynch syndrome - the list is the criteria's, not a summary of which cancers Lynch syndrome causes. **THE PREDECESSOR AMSTERDAM I COUNTED COLORECTAL CANCER ONLY**, so a family whose three cancers include an endometrial one MEETS Amsterdam II and FAILS Amsterdam I; both are returned from the same inputs via \`allThreeColorectal\`. **A NEGATIVE RESULT MUST NOT STOP AN EVALUATION**: the Bethesda guidelines were introduced because the Amsterdam criteria were found TOO STRICT and are reported to be more sensitive, so failing these criteria is NOT evidence against Lynch syndrome and is NOT a reason to withhold mismatch-repair immunohistochemistry, microsatellite-instability testing or germline testing. **THE SENSITIVITY AND SPECIFICITY PERCENTAGES ARE DELIBERATELY WITHHELD** - \`sensitivityPercent\` and \`specificityPercent\` are ALWAYS null, because the commonly quoted figures appeared in only one of the two sources checked. DO NOT SUBSTITUTE THEM. These are FAMILY-HISTORY criteria. They do NOT diagnose Lynch syndrome, which is a GERMLINE diagnosis made by genetic testing; they do NOT identify which gene; they do NOT assess an individual's cancer risk or set surveillance intervals; and they say nothing about a family that has not been asked the right questions or whose relatives' tumors were never confirmed. Genetic testing carries implications for RELATIVES and belongs with genetic counseling.`,
    compute: A.amsterdamII,
    fields: [
      ...A.REQUIREMENTS.map((r) => ({
        dom: `ams-${r.key}`, arg: r.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${r.text}. ${r.inMnemonic ? 'Covered by the "3-2-1" mnemonic.' : 'NOT covered by the "3-2-1" mnemonic - this is one of the three requirements the mnemonic omits.'}`,
      })),
      {
        dom: 'ams-allThreeColorectal', arg: 'allThreeColorectal', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Are all three cancers colorectal? Used only for the Amsterdam I comparison, whose spectrum was colorectal cancer only.',
      },
    ],
  },
];
