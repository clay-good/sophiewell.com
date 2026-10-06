// spec-v1561 MCP adapter: scabies-diagnosis-mda in lib/scabies-diagnosis-mda-v1561.js.
// The dom keys mirror views/group-v1561.js and META['scabies-diagnosis-mda'].example. Clinical domain.

import * as M from '../../lib/scabies-diagnosis-mda-v1561.js';

export default [
  {
    id: 'scabies-diagnosis-mda',
    summary: 'Classifies scabies by the 2020 IACS criteria (WHO 2025). Confirmed, clinical or suspected, with ivermectin by weight in 3 mg tablets, its contraindications, and the community mass-treatment threshold.',
    compute: M.scabiesDiagnosisMda,
    fields: [
      { dom: 'sc-micro', arg: 'micro', kind: 'enum', label: 'Mites, eggs or feces seen (microscopy, imaging or dermoscopy)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-burrows', arg: 'burrows', kind: 'enum', label: 'Burrows', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-genital', arg: 'genital', kind: 'enum', label: 'Typical lesions on the male genitals', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-lesions', arg: 'lesions', kind: 'enum', label: 'Lesions', values: M.LESION_OPTIONS.map((d) => d.value) },
      { dom: 'sc-itch', arg: 'itch', kind: 'enum', label: 'Itch', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-contact', arg: 'contact', kind: 'enum', label: 'A contact with itch', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-other', arg: 'otherLess', kind: 'enum', label: 'Other diagnoses less likely than scabies', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-prev', arg: 'prevalence', kind: 'number', label: 'Community prevalence, % (optional)', min: 0, max: 100 },
      { dom: 'sc-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (for ivermectin)', min: 1, max: 250 },
      { dom: 'sc-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-pp', arg: 'postpartum', kind: 'enum', label: 'Gave birth in the last week', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-warf', arg: 'warfarin', kind: 'enum', label: 'On warfarin', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sc-ill', arg: 'ill', kind: 'enum', label: 'Severely ill', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
