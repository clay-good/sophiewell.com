// spec-v1452: MCP adapter. The dom keys mirror views/group-v1452.js and this tile's META example.

import * as PC from '../../lib/pc-aspects-v1452.js';

const READ = PC.PCAS_READ.map((x) => x.value);

export default [
  {
    id: 'pc-aspects',
    summary: 'Scores posterior circulation ASPECTS from 10 by subtracting points for each region with early ischemic change. Each thalamus, cerebellar hemisphere and PCA territory costs 1 point and the midbrain and pons 2 each; every region must be read, and a blank is asked for rather than counted as normal.',
    compute: PC.pcAspects,
    fields: [
      { dom: 'pcas-lth', arg: 'leftThalamus', kind: 'enum', required: true, label: 'Left thalamus', values: READ },
      { dom: 'pcas-rth', arg: 'rightThalamus', kind: 'enum', required: true, label: 'Right thalamus', values: READ },
      { dom: 'pcas-lcb', arg: 'leftCerebellum', kind: 'enum', required: true, label: 'Left cerebellar hemisphere', values: READ },
      { dom: 'pcas-rcb', arg: 'rightCerebellum', kind: 'enum', required: true, label: 'Right cerebellar hemisphere', values: READ },
      { dom: 'pcas-lpca', arg: 'leftPca', kind: 'enum', required: true, label: 'Left PCA territory (occipital lobe)', values: READ },
      { dom: 'pcas-rpca', arg: 'rightPca', kind: 'enum', required: true, label: 'Right PCA territory (occipital lobe)', values: READ },
      { dom: 'pcas-mid', arg: 'midbrain', kind: 'enum', required: true, label: 'Midbrain', values: READ },
      { dom: 'pcas-pons', arg: 'pons', kind: 'enum', required: true, label: 'Pons', values: READ },
    ],
  },
];
