// spec-v183 MCP wave 11: adapters for the five lib/pulmnod-v115.js pulmonary
// nodule, pulmonary-hypertension, and pleural-infection instruments (Mayo and
// Brock solitary-pulmonary-nodule malignancy probability, Fleischner 2017
// follow-up, REVEAL Lite 2, RAPID pleural-infection score). dom keys mirror
// views/group-v40.js; the compute arg names are the verbatim keys that renderer
// passes. optNum inputs are 'number', chk inputs 'bool', and the categorical
// selects 'enum'. Default makeToArgs round-trips every documented example.

import * as F from '../../lib/pulmnod-v115.js';

export default [
  {
    id: 'mayo-spn',
    summary: 'Mayo Clinic solitary-pulmonary-nodule model (Swensen 1997): estimates malignancy probability from age, diameter, smoking, prior cancer, spiculation, and upper-lobe location.',
    compute: F.mayoSpn,
    fields: [
      { dom: 'ms-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'ms-diam', arg: 'diameter', kind: 'number', required: true, label: 'Nodule diameter (mm)' },
      { dom: 'ms-smoke', arg: 'smoking', kind: 'bool', label: 'Current or former smoker' },
      { dom: 'ms-cancer', arg: 'cancer', kind: 'bool', label: 'History of extrathoracic cancer (> 5 years prior)' },
      { dom: 'ms-spic', arg: 'spiculation', kind: 'bool', label: 'Spiculation on CT' },
      { dom: 'ms-upper', arg: 'upperlobe', kind: 'bool', label: 'Upper-lobe location' },
    ],
  },
  {
    id: 'brock-nodule',
    summary: 'Brock University nodule model (McWilliams 2013): estimates malignancy probability of a screen-detected pulmonary nodule from size, type, and clinical factors.',
    compute: F.brockNodule,
    fields: [
      { dom: 'bn-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'bn-size', arg: 'size', kind: 'number', required: true, label: 'Nodule diameter (mm)' },
      { dom: 'bn-count', arg: 'count', kind: 'number', required: true, label: 'Number of nodules' },
      { dom: 'bn-type', arg: 'type', kind: 'enum', values: ['solid', 'part-solid', 'non-solid'], required: true, label: 'Nodule type' },
      { dom: 'bn-female', arg: 'female', kind: 'bool', label: 'Female sex' },
      { dom: 'bn-fh', arg: 'familyHistory', kind: 'bool', label: 'Family history of lung cancer' },
      { dom: 'bn-emph', arg: 'emphysema', kind: 'bool', label: 'Emphysema on CT' },
      { dom: 'bn-upper', arg: 'upperlobe', kind: 'bool', label: 'Upper-lobe location' },
      { dom: 'bn-spic', arg: 'spiculation', kind: 'bool', label: 'Spiculation on CT' },
    ],
  },
  {
    id: 'fleischner-2017',
    summary: 'Fleischner Society 2017 pulmonary-nodule follow-up recommendation (MacMahon 2017): the surveillance advice for an incidental nodule by size, type, multiplicity, and risk.',
    compute: F.fleischner2017,
    fields: [
      { dom: 'fl-size', arg: 'size', kind: 'number', required: true, label: 'Nodule diameter (mm)' },
      { dom: 'fl-type', arg: 'type', kind: 'enum', values: ['solid', 'part-solid', 'ground-glass'], required: true, label: 'Nodule type' },
      { dom: 'fl-mult', arg: 'multiplicity', kind: 'enum', values: ['single', 'multiple'], required: true, label: 'Single or multiple' },
      { dom: 'fl-risk', arg: 'risk', kind: 'enum', values: ['low', 'high'], required: true, label: 'Patient risk category' },
    ],
  },
  {
    id: 'reveal-lite-2',
    summary: 'REVEAL Lite 2 (Benza 2021): a simplified pulmonary-arterial-hypertension risk score (1-14) predicting 1-year mortality from six routinely collected variables.',
    compute: F.revealLite2,
    fields: [
      { dom: 'rv-egfr', arg: 'egfr', kind: 'number', required: true, label: 'eGFR (mL/min/1.73 m^2)' },
      { dom: 'rv-who', arg: 'who', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'WHO functional class' },
      { dom: 'rv-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP (mm Hg)' },
      { dom: 'rv-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate (beats/min)' },
      { dom: 'rv-mwd', arg: 'mwd', kind: 'number', required: true, label: '6-minute walk distance (m)' },
      { dom: 'rv-bnp', arg: 'bnp', kind: 'enum', values: ['low', 'mid', 'high1', 'high2'], required: true, label: 'BNP / NT-proBNP band' },
    ],
  },
  {
    id: 'rapid-pleural',
    summary: 'RAPID score (Rahman 2014): risk-stratifies pleural infection (0-7) from renal, age, purulence, infection source, and dietary/albumin factors.',
    compute: F.rapidPleural,
    fields: [
      { dom: 'rp-urea', arg: 'urea', kind: 'enum', values: ['low', 'mid', 'high'], required: true, label: 'Serum urea band' },
      { dom: 'rp-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'rp-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin (g/L)' },
      { dom: 'rp-nonpur', arg: 'nonPurulent', kind: 'bool', label: 'Non-purulent pleural fluid' },
      { dom: 'rp-hosp', arg: 'hospitalAcquired', kind: 'bool', label: 'Hospital-acquired infection' },
    ],
  },
];
