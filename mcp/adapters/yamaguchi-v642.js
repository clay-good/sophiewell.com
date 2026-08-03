// spec-v642 MCP adapter: Yamaguchi criteria for Adult-Onset Still's Disease in
// lib/yamaguchi-v642.js. The dom keys mirror the browser renderer
// (views/group-v642.js) and META['yamaguchi-aosd'].example. This is NOT a
// sum-and-threshold score: classification requires >= 5 of the 8 criteria
// INCLUDING >= 2 of the 4 major, AND no exclusion present (any of the three
// exclusion flags vetoes classification). Every input is optional; empty inputs
// return a valid, unclassified result. Clinical domain.

import { yamaguchiAosd } from '../../lib/yamaguchi-v642.js';

export default [
  {
    id: 'yamaguchi-aosd',
    summary: 'Yamaguchi criteria for Adult-Onset Still’s Disease: classify when ≥ 5 of 8 criteria are present including ≥ 2 of the 4 major, and no exclusion (infection, malignancy, or other rheumatic disease) is present.',
    compute: yamaguchiAosd,
    fields: [
      { dom: 'yam-fever', arg: 'feverMajor', kind: 'bool', required: false, label: 'MAJOR: fever ≥ 39°C lasting ≥ 1 week' },
      { dom: 'yam-arthralgia', arg: 'arthralgia', kind: 'bool', required: false, label: 'MAJOR: arthralgia lasting ≥ 2 weeks' },
      { dom: 'yam-rash', arg: 'rash', kind: 'bool', required: false, label: 'MAJOR: typical salmon-pink macular/maculopapular rash during fever' },
      { dom: 'yam-leuko', arg: 'leukocytosis', kind: 'bool', required: false, label: 'MAJOR: leukocytosis ≥ 10,000/mm³ with ≥ 80% granulocytes' },
      { dom: 'yam-throat', arg: 'soreThroat', kind: 'bool', required: false, label: 'MINOR: sore throat' },
      { dom: 'yam-lymph', arg: 'lymphSpleen', kind: 'bool', required: false, label: 'MINOR: lymphadenopathy and/or splenomegaly' },
      { dom: 'yam-liver', arg: 'liverDysfunction', kind: 'bool', required: false, label: 'MINOR: liver dysfunction (elevated transaminases/LDH)' },
      { dom: 'yam-rfana', arg: 'negativeRfAna', kind: 'bool', required: false, label: 'MINOR: negative rheumatoid factor AND negative ANA' },
      { dom: 'yam-infection', arg: 'exclInfection', kind: 'bool', required: false, label: 'EXCLUSION: infection (e.g. sepsis, infectious mononucleosis)' },
      { dom: 'yam-malignancy', arg: 'exclMalignancy', kind: 'bool', required: false, label: 'EXCLUSION: malignancy (e.g. malignant lymphoma)' },
      { dom: 'yam-rheumatic', arg: 'exclRheumatic', kind: 'bool', required: false, label: 'EXCLUSION: other rheumatic disease (e.g. polyarteritis nodosa, rheumatoid vasculitis)' },
    ],
  },
];
