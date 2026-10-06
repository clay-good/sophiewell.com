// spec-v1560 MCP adapter: meningitis-who-2025 in lib/meningitis-who-2025-v1560.js.
// The dom keys mirror views/group-v1560b.js and META['meningitis-who-2025'].example. Clinical domain.

import * as M from '../../lib/meningitis-who-2025-v1560.js';

export default [
  {
    id: 'meningitis-who-2025',
    summary: 'Walks WHO 2025 suspected bacterial meningitis decisions: image first or defer the puncture, empiric antibiotics with Listeria and resistance add-ons, steroids and duration by setting, and contact prophylaxis.',
    compute: M.meningitisWho2025,
    fields: [
      { dom: 'mw-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'mw-setting', arg: 'setting', kind: 'enum', required: true, label: 'Setting', values: M.SETTING_OPTIONS.map((d) => d.value) },
      { dom: 'mw-imaging', arg: 'imaging', kind: 'enum', required: true, label: 'Cranial imaging readily accessible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-gcs', arg: 'gcs', kind: 'enum', label: 'GCS below 10', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-focal', arg: 'focal', kind: 'enum', label: 'Focal neurological signs', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-cranial', arg: 'cranial', kind: 'enum', label: 'Cranial nerve deficits', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-papill', arg: 'papill', kind: 'enum', label: 'Papilledema', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-seizure', arg: 'seizure', kind: 'enum', label: 'New-onset seizures (adult)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-immuno', arg: 'immuno', kind: 'enum', label: 'Severe immunocompromised state', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-listeria', arg: 'listeria', kind: 'enum', label: 'Other Listeria risk factor (pregnancy, immunosuppressive therapy, transplant, cancer, advanced HIV, diabetes, end-stage kidney disease, cirrhosis, alcohol)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-resistant', arg: 'resistant', kind: 'enum', label: 'High local pneumococcal resistance', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-ceph', arg: 'cephAvailable', kind: 'enum', label: 'Ceftriaxone or cefotaxime available', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-malaria', arg: 'malaria', kind: 'enum', label: 'Cerebral malaria suspected', values: M.YES_NO.map((d) => d.value) },
      { dom: 'mw-ahd', arg: 'ahd', kind: 'enum', label: 'Advanced HIV disease', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
