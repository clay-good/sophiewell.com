// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as IHD from '../../lib/tx-in-hospital-dnr-pathway-v1391.js';

const C = ['met', 'not-met'];

export default [
  {
    id: 'tx-in-hospital-dnr-pathway',
    summary: 'Identifies which Health and Safety Code 166.203(a) pathway a Texas hospital DNR order rests on, and whether its elements are met. Every order must be dated. An order on the physician\'s judgment that death is imminent needs notice to the patient or, if incompetent, their agent, guardian, or nearest family. Missing that notice does not invalidate it (166.204(b)). An agreed decision for an incompetent patient needs a second physician\'s concurrence.',
    compute: IHD.txInHospitalDnrPathway,
    fields: [
      { dom: 'ihd-basis', arg: 'basis', kind: 'enum', required: true, label: 'The order rests on', values: IHD.BASES.map((b) => b.value) },
      { dom: 'ihd-dated', arg: 'dated', kind: 'enum', required: true, label: 'The order is dated', values: ['yes', 'no'] },
      { dom: 'ihd-witnesses', arg: 'witnesses', kind: 'enum', label: 'Oral directions: two qualifying witnesses', values: C },
      { dom: 'ihd-not-contrary', arg: 'notContrary', kind: 'enum', label: 'Not contrary to a competent patient\'s directions', values: C },
      { dom: 'ihd-imminent', arg: 'deathImminent', kind: 'enum', label: 'Death imminent within minutes to hours', values: C },
      { dom: 'ihd-appropriate', arg: 'appropriate', kind: 'enum', label: 'The order is medically appropriate', values: C },
      { dom: 'ihd-competent', arg: 'patientCompetent', kind: 'enum', label: 'The patient is competent', values: ['yes', 'no'] },
      { dom: 'ihd-incompetent', arg: 'incompetent', kind: 'enum', label: 'The patient is incompetent', values: C },
      { dom: 'ihd-agreed', arg: 'agreed', kind: 'enum', label: 'Attending and decision-maker agree', values: C },
      { dom: 'ihd-second', arg: 'secondPhysician', kind: 'enum', label: 'A second physician or ethics representative concurred', values: C },
    ],
  },
];
