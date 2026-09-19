// spec-v1397: MCP adapter. The dom keys mirror views/group-v1397.js and this tile's META example.

import * as NLT from '../../lib/nurse-license-training-requirements-v1397.js';

export default [
  {
    id: 'nurse-license-training-requirements',
    summary: "Which mandated trainings and continuing education hours a nurse's license needs in NY, NJ, CA, or TX. New York: the one-time child-abuse course, updated by Chapter 25 of the Laws of 2024 and due November 17, 2026 (a 15-minute addendum for those trained November 2022 to August 2025), and infection control every four years. New Jersey: 30 hours per two years with one on opioids. California: 30 hours per two years. Texas: 20 hours or a certification, plus jurisprudence, older-adult, forensic, trafficking, and APRN pharmacology hours where they apply.",
    compute: NLT.nurseLicenseTrainingRequirements,
    fields: [
      { dom: 'nlt-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: NLT.NLT_STATES.map((s) => s.value) },
      { dom: 'nlt-license', arg: 'license', kind: 'enum', required: true, label: 'License', values: NLT.LICENSES.map((s) => s.value) },
      { dom: 'nlt-practicing', arg: 'practicingNY', kind: 'enum', label: 'NY: practicing in New York', values: ['yes', 'no'] },
      { dom: 'nlt-abuse', arg: 'abuseDate', kind: 'string', label: 'Child abuse identification course completed (YYYY-MM-DD)' },
      { dom: 'nlt-exempt', arg: 'abuseExempt', kind: 'enum', label: 'Child abuse training exemption claimed', values: ['yes', 'no'] },
      { dom: 'nlt-infection', arg: 'infectionDate', kind: 'string', label: 'Infection control course completed (YYYY-MM-DD)' },
      { dom: 'nlt-hours', arg: 'hours', kind: 'number', label: 'NJ, CA, TX: CE hours this renewal period' },
      { dom: 'nlt-nj-opioid', arg: 'njOpioid', kind: 'enum', label: 'NJ: an hour on prescription opioids', values: ['yes', 'no'] },
      { dom: 'nlt-tx-cert', arg: 'txCert', kind: 'enum', label: 'TX: national certification in area of practice', values: ['yes', 'no'] },
      { dom: 'nlt-tx-juris', arg: 'txJuris', kind: 'enum', label: 'TX: jurisprudence and ethics', values: NLT.DONE_NA.map((d) => d.value) },
      { dom: 'nlt-tx-older', arg: 'txOlder', kind: 'enum', label: 'TX: older adult care hours', values: NLT.DONE_NA.map((d) => d.value) },
      { dom: 'nlt-tx-forensic', arg: 'txForensic', kind: 'enum', label: 'TX: forensic evidence collection (ER)', values: NLT.DONE_NA.map((d) => d.value) },
      { dom: 'nlt-tx-trafficking', arg: 'txTrafficking', kind: 'enum', label: 'TX: human trafficking course', values: NLT.DONE_NA.map((d) => d.value) },
      { dom: 'nlt-tx-pharm', arg: 'txPharm', kind: 'enum', label: 'TX: APRN pharmacotherapeutics hours', values: NLT.DONE_NA.map((d) => d.value) },
    ],
  },
];
