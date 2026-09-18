// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.

import * as SA from '../../lib/tx-sa-forensic-exam-window-v1395.js';

export default [
  {
    id: 'tx-sa-forensic-exam-window',
    summary: "Whether a Texas sexual assault survivor is eligible for a forensic medical examination. Under Code of Criminal Procedure article 56A.303 a minor is examined whenever they arrive, and an adult within 120 hours of the assault, or later when referred by law enforcement or by a physician, sexual assault examiner, or nurse examiner after a preliminary evaluation; consent is required. Under Health and Safety Code 323.004 a facility that is not SAFE-ready tells the survivor, names nearby SAFE-ready facilities, and offers care there or a consented transfer after confirming an examiner is available.",
    compute: SA.txSaForensicExamWindow,
    fields: [
      { dom: 'sa-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'sa-hours', arg: 'hours', kind: 'number', label: 'Hours since the assault (adults)' },
      { dom: 'sa-referral', arg: 'referral', kind: 'enum', label: 'Referral for the examination', values: SA.REFERRALS.map((r) => r.value) },
      { dom: 'sa-safe', arg: 'safeReady', kind: 'enum', required: true, label: 'This facility is SAFE-ready', values: ['yes', 'no'] },
    ],
  },
];
