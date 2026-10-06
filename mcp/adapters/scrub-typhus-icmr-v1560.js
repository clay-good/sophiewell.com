// spec-v1560 MCP adapter: scrub-typhus-icmr in lib/scrub-typhus-icmr-v1560.js.
// The dom keys mirror views/group-v1560b.js and META['scrub-typhus-icmr'].example. Clinical domain.

import * as M from '../../lib/scrub-typhus-icmr-v1560.js';

export default [
  {
    id: 'scrub-typhus-icmr',
    summary: 'Classifies scrub typhus as suspected, probable or confirmed by ICMR 2015 and gives doxycycline or azithromycin by weight. An eschar counts before 5 days of fever; azithromycin in pregnancy; IV options when complicated.',
    compute: M.scrubTyphusIcmr,
    fields: [
      { dom: 'st-days', arg: 'feverDays', kind: 'number', required: true, label: 'Days of fever', min: 0, max: 60 },
      { dom: 'st-eschar', arg: 'eschar', kind: 'enum', label: 'Eschar', values: M.YES_NO.map((d) => d.value) },
      { dom: 'st-ruled', arg: 'ruledOut', kind: 'enum', label: 'Malaria, dengue and typhoid ruled out', values: M.YES_NO.map((d) => d.value) },
      { dom: 'st-wf', arg: 'wf', kind: 'enum', label: 'Weil-Felix 1:80 or more (OX2, OX19, OXK)', values: M.TEST_OPTIONS.map((d) => d.value) },
      { dom: 'st-igm', arg: 'igm', kind: 'enum', label: 'IgM ELISA OD above 0.5', values: M.TEST_OPTIONS.map((d) => d.value) },
      { dom: 'st-confirm', arg: 'confirm', kind: 'enum', label: 'PCR, or rising paired titers (IFA or IPA)', values: M.TEST_OPTIONS.map((d) => d.value) },
      { dom: 'st-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 2, max: 250 },
      { dom: 'st-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant', values: M.YES_NO.map((d) => d.value) },
      { dom: 'st-comp', arg: 'complicated', kind: 'enum', label: 'Complicated (ARDS, kidney failure, meningoencephalitis, multi-organ dysfunction)', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
