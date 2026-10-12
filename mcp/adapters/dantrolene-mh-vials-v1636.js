// spec-v1636 MCP adapter: dantrolene-mh-vials in lib/dantrolene-mh-vials-v1636.js. The dom keys mirror
// views/group-v1636.js and META['dantrolene-mh-vials'].example. Clinical domain. Three label rows.

import * as DM from '../../lib/dantrolene-mh-vials-v1636.js';

export default [
  {
    id: 'dantrolene-mh-vials',
    summary: 'Dantrolene for malignant hyperthermia: the dose in mg, vials, sterile water and volume for Ryanodex, Dantrium Intravenous or Revonto. The treatment dose per kg is the reader\'s entry (the labels give a minimum of 1 mg/kg and a maximum cumulative 10 mg/kg); prevention is the labels\' 2.5 mg/kg. It also gives the vials needed to reach 10 mg/kg.',
    compute: (args) => DM.dantroleneMhVials(args, new Date()),
    fields: [
      { dom: 'dmv-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'dmv-product', arg: 'product', kind: 'enum', required: true, values: DM.PRODUCTS.map((x) => x.value), label: 'Product' },
      { dom: 'dmv-use', arg: 'use', kind: 'enum', required: true, values: DM.USES.map((x) => x.value), label: 'Use' },
      { dom: 'dmv-dose', arg: 'dosePerKg', kind: 'number', label: 'Treatment: dose for this bolus', unit: 'mg/kg' },
      { dom: 'dmv-given', arg: 'cumulativeGiven', kind: 'number', label: 'Treatment: dantrolene already given in this crisis (0 if none)', unit: 'mg' },
    ],
  },
];
