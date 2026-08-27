// spec-v823 MCP adapter: 2015 NMOSD criteria in lib/nmosd-2015-v823.js.
// The dom keys mirror the browser renderer (views/group-v823.js) and
// META['nmosd-2015'].example. `aqp4` is a three-way enum because it selects WHICH RULE
// applies, and "unknown" follows the seronegative one. Clinical domain.

import { nmosd2015 } from '../../lib/nmosd-2015-v823.js';

export default [
  {
    id: 'nmosd-2015',
    summary: 'Applies the 2015 international consensus criteria for neuromyelitis optica spectrum disorder. The antibody chooses the rule: with a positive AQP4-IgG, one core clinical characteristic plus exclusion suffices; without it or with unknown status, TWO different core characteristics are required, at least one being optic neuritis, longitudinally extensive myelitis or area postrema syndrome, with the MRI requirement met for each characteristic that carries one.',
    compute: nmosd2015,
    fields: [
      { dom: 'nmo-aqp4', arg: 'aqp4', kind: 'enum', required: false, label: 'AQP4-IgG status', values: ['positive', 'negative', 'unknown'] },
      { dom: 'nmo-on', arg: 'opticNeuritis', kind: 'boolean', required: false, label: 'Optic neuritis' },
      { dom: 'nmo-myelitis', arg: 'acuteMyelitis', kind: 'boolean', required: false, label: 'Acute myelitis' },
      { dom: 'nmo-areapostrema', arg: 'areaPostrema', kind: 'boolean', required: false, label: 'Area postrema syndrome' },
      { dom: 'nmo-brainstem', arg: 'brainstemSyndrome', kind: 'boolean', required: false, label: 'Acute brainstem syndrome' },
      { dom: 'nmo-diencephalic', arg: 'diencephalicSyndrome', kind: 'boolean', required: false, label: 'Narcolepsy or diencephalic syndrome' },
      { dom: 'nmo-cerebral', arg: 'cerebralSyndrome', kind: 'boolean', required: false, label: 'Symptomatic cerebral syndrome' },
      { dom: 'nmo-mri-on', arg: 'mriOpticNerve', kind: 'boolean', required: false, label: 'MRI requirement for optic neuritis' },
      { dom: 'nmo-mri-letm', arg: 'mriLetm', kind: 'boolean', required: false, label: 'Longitudinally extensive cord lesion' },
      { dom: 'nmo-mri-ap', arg: 'mriAreaPostrema', kind: 'boolean', required: false, label: 'Dorsal medulla or area postrema lesion' },
      { dom: 'nmo-mri-brainstem', arg: 'mriBrainstem', kind: 'boolean', required: false, label: 'Periependymal brainstem lesions' },
      { dom: 'nmo-excluded', arg: 'alternativesExcluded', kind: 'boolean', required: false, label: 'Alternative diagnoses excluded' },
    ],
  },
];
