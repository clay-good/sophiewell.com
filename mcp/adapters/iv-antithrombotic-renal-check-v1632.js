// spec-v1632 MCP adapter: iv-antithrombotic-renal-check in
// lib/iv-antithrombotic-renal-check-v1632.js. The dom keys mirror views/group-v1632.js and
// META['iv-antithrombotic-renal-check'].example. Clinical domain. Four label rows.

import * as IA from '../../lib/iv-antithrombotic-renal-check-v1632.js';

export default [
  {
    id: 'iv-antithrombotic-renal-check',
    summary: 'The infusion rate the FDA label gives for bivalirudin, eptifibatide, tirofiban or argatroban. It reports the bolus and the rate for the creatinine clearance, dialysis status or (argatroban) hepatic function entered, in the label units and in mass per time at the weight entered. It gives no pump rate in mL/h and recommends nothing.',
    compute: IA.ivAntithromboticRenalCheck,
    fields: [
      { dom: 'iva-drug', arg: 'drug', kind: 'enum', required: true, values: IA.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'iva-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'iva-crcl', arg: 'crcl', kind: 'number', label: 'Creatinine clearance (not used for argatroban)', unit: 'mL/min' },
      { dom: 'iva-dialysis', arg: 'dialysis', kind: 'enum', values: IA.YES_NO.map((y) => y.value), label: 'On dialysis (bivalirudin, eptifibatide)' },
      { dom: 'iva-setting', arg: 'setting', kind: 'enum', values: IA.SETTINGS.map((x) => x.value), label: 'Eptifibatide: setting (acs or pci)' },
      { dom: 'iva-hepatic', arg: 'hepatic', kind: 'enum', values: IA.HEPATIC.map((h) => h.value), label: 'Argatroban: hepatic function' },
    ],
  },
];
