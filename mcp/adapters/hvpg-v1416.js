// spec-v1416: MCP adapter. The dom keys mirror views/group-v1416.js and this tile's META example.

import * as HV from '../../lib/hvpg-v1416.js';

export default [
  {
    id: 'hvpg',
    summary: 'Computes the hepatic venous pressure gradient (wedged minus free hepatic vein pressure) and reads it against Baveno VII. Above 5 mmHg is sinusoidal portal hypertension and 10 or more is clinically significant portal hypertension; it adds the 16 mmHg surgical-risk and 20 mmHg pre-emptive TIPS statements where they apply.',
    compute: HV.hvpg,
    fields: [
      { dom: 'hv-whvp', arg: 'whvp', kind: 'number', required: true, label: 'Wedged hepatic vein pressure', unit: 'mmHg' },
      { dom: 'hv-fhvp', arg: 'fhvp', kind: 'number', required: true, label: 'Free hepatic vein pressure', unit: 'mmHg' },
      { dom: 'hv-ivc', arg: 'ivc', kind: 'number', label: 'IVC pressure at the hepatic vein ostium', unit: 'mmHg' },
      { dom: 'hv-etiology', arg: 'etiology', kind: 'enum', label: 'Cause of liver disease', values: HV.HVPG_ETIOLOGIES.map((e) => e.value) },
      { dom: 'hv-bleeding', arg: 'bleeding', kind: 'enum', label: 'Measured during acute variceal bleeding', values: ['yes', 'no'] },
      { dom: 'hv-signs', arg: 'signs', kind: 'enum', label: 'Signs of portal hypertension (varices, ascites, collaterals)', values: ['yes', 'no'] },
    ],
  },
];
