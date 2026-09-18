// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.

import * as OF from '../../lib/ny-hiv-hcv-test-offer-v1395.js';

export default [
  {
    id: 'ny-hiv-hcv-test-offer',
    summary: "Whether New York law requires offering an HIV test (age 13 and older) and a hepatitis C screen (age 18 and older). Under Public Health Law 2781-a and 2171, both are offered in inpatient, emergency department, and primary care settings, and younger patients are offered them when there is evidence or indication of risk activity. Neither is required while the person is being treated for a life-threatening emergency, lacks capacity to consent, or has already been offered or tested. A reactive hepatitis C screen is followed by an HCV RNA test and care or referral. New York has no hepatitis B offer law in these sections.",
    compute: OF.nyHivHcvTestOffer,
    fields: [
      { dom: 'nyo-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'nyo-setting', arg: 'setting', kind: 'enum', required: true, label: 'Setting', values: OF.SETTINGS.map((s) => s.value) },
      { dom: 'nyo-emergency', arg: 'emergency', kind: 'enum', required: true, label: 'Treated for a life-threatening emergency', values: ['yes', 'no'] },
      { dom: 'nyo-capacity', arg: 'capacity', kind: 'enum', required: true, label: 'Has capacity to consent', values: ['yes', 'no'] },
      { dom: 'nyo-prior-hiv', arg: 'priorHiv', kind: 'enum', required: true, label: 'HIV test already offered or done', values: ['yes', 'no'] },
      { dom: 'nyo-prior-hcv', arg: 'priorHcv', kind: 'enum', required: true, label: 'Hepatitis C screen already offered or done', values: ['yes', 'no'] },
      { dom: 'nyo-risk', arg: 'risk', kind: 'enum', label: 'Evidence or indication of risk activity', values: ['yes', 'no'] },
    ],
  },
];
