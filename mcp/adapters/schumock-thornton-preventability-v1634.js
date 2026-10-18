// spec-v1634 MCP adapter: schumock-thornton-preventability in lib/schumock-thornton-preventability-v1634.js. The
// dom keys mirror views/group-v1634.js and META['schumock-thornton-preventability'].example. Clinical domain.

import * as ST from '../../lib/schumock-thornton-preventability-v1634.js';

const yn = ST.YES_NO.map((x) => x.value);
const LABELS = {
  allergyHistory: 'History of allergy or previous reaction to the drug',
  inappropriateDrug: 'Drug inappropriate for the clinical condition',
  inappropriateDose: 'Dose, route or frequency inappropriate',
  toxicLevel: 'Toxic level or lab monitoring result documented',
  knownTreatment: 'A known treatment for the reaction',
  monitoringNotDone: 'Required monitoring or lab test not done',
  interaction: 'A drug interaction was involved',
  poorAdherence: 'Poor adherence was involved',
  preventionNotGiven: 'Preventive measures not prescribed or given',
};
const DOM = { allergyHistory: 'st-allergy', inappropriateDrug: 'st-drug', inappropriateDose: 'st-dose', toxicLevel: 'st-toxic', knownTreatment: 'st-known', monitoringNotDone: 'st-monitor', interaction: 'st-inter', poorAdherence: 'st-adhere', preventionNotGiven: 'st-prevent' };
export default [
  {
    id: 'schumock-thornton-preventability',
    summary: 'Preventability of an adverse drug reaction by the modified Schumock and Thornton criteria. A yes in section A is definitely preventable, then a yes in section B probably preventable, otherwise not preventable.',
    compute: ST.schumockThorntonPreventability,
    fields: [...ST.SECTION_A, ...ST.SECTION_B].map(([arg]) => ({ dom: DOM[arg], arg, kind: 'enum', required: true, values: yn, label: LABELS[arg] })),
  },
];
