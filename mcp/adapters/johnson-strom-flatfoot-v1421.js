// spec-v1421: MCP adapter. The dom keys mirror views/group-v1421.js and this tile's META example.

import * as JS from '../../lib/johnson-strom-flatfoot-v1421.js';

export default [
  {
    id: 'johnson-strom-flatfoot',
    summary: 'Stages adult-acquired flatfoot deformity (posterior tibial tendon dysfunction) by Johnson and Strom, with the Myerson stage IV. Ankle valgus makes stage IV A or B; otherwise an absent, flexible or fixed hindfoot deformity makes stage I, II or III, and the heel rise, too many toes sign and arthritis are checked against the table.',
    compute: JS.johnsonStromFlatfoot,
    fields: [
      { dom: 'jsf-deformity', arg: 'deformity', kind: 'enum', required: true, label: 'Hindfoot deformity', values: JS.JSF_DEFORMITY.map((x) => x.value) },
      { dom: 'jsf-ankle', arg: 'ankle', kind: 'enum', required: true, label: 'Ankle', values: JS.JSF_ANKLE.map((x) => x.value) },
      { dom: 'jsf-heelrise', arg: 'heelRise', kind: 'enum', label: 'Single-leg heel rise', values: JS.JSF_HEELRISE.map((x) => x.value) },
      { dom: 'jsf-toes', arg: 'toes', kind: 'enum', label: 'Too many toes sign', values: JS.JSF_TOES.map((x) => x.value) },
      { dom: 'jsf-arthritis', arg: 'arthritis', kind: 'enum', label: 'Radiographs', values: JS.JSF_ARTHRITIS.map((x) => x.value) },
    ],
  },
];
