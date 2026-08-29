// spec-v873 MCP adapter: the CDC two-tier Lyme serology algorithm in lib/lyme-two-tier-v873.js.
// The dom keys mirror the browser renderer (views/group-v873.js) and META['lyme-two-tier'].example.
//
// It reads results already obtained. It does not decide whether to test or to treat.
// Clinical domain.

import { lymeTwoTier } from '../../lib/lyme-two-tier-v873.js';

export default [
  {
    id: 'lyme-two-tier',
    summary: 'Reads Lyme disease serology through the CDC two-tier algorithm and says what the pair of results means. An enzyme immunoassay or immunofluorescence assay runs first; a negative ends the testing, and a positive or equivocal calls for a second tier, either an IgM and IgG immunoblot or, under the 2019 modified algorithm, a second different enzyme immunoassay as an equal alternative. A reactive IgG second tier is positive. ERYTHEMA MIGRANS IS A CLINICAL DIAGNOSIS AND SHOULD NOT BE SEROLOGY-TESTED, since antibodies take weeks to appear and a test drawn at the rash is frequently negative. THE SECOND TIER IS ONLY INTERPRETABLE AFTER A REACTIVE FIRST TIER. AN IgM RESULT COUNTS ONLY WITHIN 30 DAYS OF SYMPTOM ONSET, and beyond that IgM without IgG is a false positive. SEROLOGY DOES NOT MEASURE TREATMENT RESPONSE.',
    compute: lymeTwoTier,
    fields: [
      { dom: 'lyme-erythemamigrans', arg: 'erythemaMigrans', kind: 'boolean', required: false, label: 'Erythema migrans is present (a clinical diagnosis; serology is not indicated)' },
      { dom: 'lyme-dayssinceonset', arg: 'daysSinceOnset', kind: 'number', required: false, label: 'Days since symptom onset (an IgM-only second tier counts only within 30)' },
      { dom: 'lyme-firsttier', arg: 'firstTier', kind: 'enum', required: false, label: 'First tier: enzyme immunoassay or immunofluorescence assay', values: ['not-done', 'negative', 'equivocal', 'positive'] },
      { dom: 'lyme-secondtier', arg: 'secondTier', kind: 'enum', required: false, label: 'Second tier: immunoblot, or a second enzyme immunoassay', values: ['not-done', 'negative', 'igm-only', 'igg'] },
    ],
  },
];
