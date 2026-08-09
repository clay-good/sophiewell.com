// spec-v677 MCP adapter: McMahon Score for rhabdomyolysis in lib/mcmahon-rhabdo-v677.js.
// The dom keys mirror the browser renderer (views/group-v677.js) and
// META['mcmahon-rhabdo'].example. Six age/lab numbers plus two enums (sex, cause);
// a weighted sum 0-19 predicts death or renal replacement. Clinical domain.

import { mcmahonRhabdo } from '../../lib/mcmahon-rhabdo-v677.js';

export default [
  {
    id: 'mcmahon-rhabdo',
    summary: 'McMahon Score for rhabdomyolysis (McMahon 2013): predicts in-hospital death or AKI needing renal replacement from admission values. Points: age (51-70=1.5, 71-80=2.5, >80=3), female sex (1), creatinine (1.4-2.2=1.5, >2.2=3 mg/dL), calcium <7.5 mg/dL (2), CPK >40,000 U/L (2), cause not seizure/syncope/exercise/statin/myositis (3), phosphate (4.0-5.4=1.5, >5.4=3 mg/dL), bicarbonate <19 mEq/L (2). Total 0-19; <6 low (~2-3%), >=6 high risk.',
    compute: mcmahonRhabdo,
    fields: [
      { dom: 'mcm-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: 'Age (years)' },
      { dom: 'mcm-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex (female adds 1 point)' },
      { dom: 'mcm-creat', arg: 'creatinine', kind: 'number', unit: 'mg/dL', required: true, label: 'Initial creatinine (mg/dL)' },
      { dom: 'mcm-ca', arg: 'calcium', kind: 'number', unit: 'mg/dL', required: true, label: 'Initial calcium (mg/dL; < 7.5 adds 2)' },
      { dom: 'mcm-cpk', arg: 'cpk', kind: 'number', unit: 'U/L', required: true, label: 'Initial CPK / creatine kinase (U/L; > 40,000 adds 2)' },
      { dom: 'mcm-cause', arg: 'cause', kind: 'enum', values: ['benign', 'other'], required: true, label: 'Cause: benign (seizures/syncope/exercise/statins/myositis) or other (adds 3)' },
      { dom: 'mcm-phos', arg: 'phosphate', kind: 'number', unit: 'mg/dL', required: true, label: 'Initial phosphate (mg/dL)' },
      { dom: 'mcm-bicarb', arg: 'bicarbonate', kind: 'number', unit: 'mEq/L', required: true, label: 'Initial bicarbonate (mEq/L; < 19 adds 2)' },
    ],
  },
];
