// spec-v629 wave 5: adapters for the lib/billing-v80.js E&M / time-based coding
// calculators (non-clinical / administrative). Most return codes and units; only
// anesthesia-units returns money, so it alone gets the withUsd formatResult that
// surfaces a dollar sibling for each *Cents field.

import * as C from '../../lib/billing-v80.js';

const withUsd = (raw) => {
  const out = { ...raw };
  for (const [k, v] of Object.entries(raw)) {
    if (k.endsWith('Cents') && typeof v === 'number' && Number.isFinite(v)) {
      out[`${k.slice(0, -'Cents'.length)}Usd`] = Math.round(v) / 100;
    }
  }
  return out;
};

export default [
  {
    id: 'em-mdm-2023',
    summary: '2023 E&M level by medical decision making: the level from the two-of-three highest of problems, data, and risk, mapped to the office/ED/inpatient code.',
    compute: C.emMdm2023,
    fields: [
      { dom: 'emm-setting', arg: 'setting', kind: 'enum', values: ['office', 'inpatient-initial', 'inpatient-subsequent', 'ed', 'snf-initial', 'snf-subsequent', 'home-new', 'home-established'], required: true, label: 'Setting of the encounter' },
      { dom: 'emm-prob', arg: 'problems', kind: 'number', required: true, label: 'Problems level (1 minimal to 4 high)', values: ['2', '3', '4', '5'] },
      { dom: 'emm-data', arg: 'data', kind: 'number', required: true, label: 'Data level (1 to 4)', values: ['2', '3', '4', '5'] },
      { dom: 'emm-risk', arg: 'risk', kind: 'number', required: true, label: 'Risk level (1 to 4)', values: ['2', '3', '4', '5'] },
    ],
  },
  {
    id: 'critical-care-time',
    summary: 'Critical-care time coding: net minutes (total minus separately-billable procedure time) mapped to 99291 and additional 99292 units.',
    compute: C.criticalCareTime,
    fields: [
      { dom: 'cc-total', arg: 'totalMinutes', kind: 'number', required: true, label: 'Total critical-care minutes' },
      { dom: 'cc-proc', arg: 'procedureMinutes', kind: 'number', label: 'Separately-billable procedure minutes to subtract' },
    ],
  },
  {
    id: 'split-shared',
    summary: 'Split/shared visit attribution: whether the physician or the NPP bills (by time or by who did the MDM) and the resulting payment percentage.',
    compute: C.splitShared,
    fields: [
      { dom: 'ss-basis', arg: 'basis', kind: 'enum', values: ['time', 'mdm'], required: true, label: 'Substantive-portion basis: time or medical decision making' },
      { dom: 'ss-phys', arg: 'physicianTime', kind: 'number', label: 'Physician minutes (time basis)' },
      { dom: 'ss-npp', arg: 'nppTime', kind: 'number', label: 'NPP minutes (time basis)' },
    ],
  },
  {
    id: 'prolonged-services',
    summary: 'Prolonged-services coding: for the primary E&M code, payer, and total time, which prolonged code (Medicare G2212 or AMA 99417) applies and how many units.',
    compute: C.prolongedServices,
    fields: [
      { dom: 'ps-code', arg: 'primaryCode', kind: 'enum', values: ['99205', '99215', '99223', '99233'], required: true, label: 'Primary E&M code the prolonged-services add-on attaches to' },
      { dom: 'ps-min', arg: 'totalMinutes', kind: 'number', required: true, label: 'Total time in minutes' },
      { dom: 'ps-payer', arg: 'payer', kind: 'enum', values: ['medicare', 'ama'], required: true, label: 'Whose prolonged-services rule to apply: medicare (G2212) or ama (CPT 99417)' },
    ],
  },
  {
    id: 'therapy-units',
    summary: 'Timed-therapy billable units from cumulative minutes under the Medicare 8-minute rule or the AMA/SPM substantial-portion rule.',
    compute: C.therapyUnits,
    fields: [
      { dom: 'tu-total', arg: 'totalMinutes', kind: 'number', required: true, label: 'Total timed treatment minutes' },
      { dom: 'tu-rule', arg: 'rule', kind: 'enum', values: ['medicare', 'rule-of-eights'], required: true, label: 'Timed-code rule: medicare (8-minute) or rule-of-eights (per service)' },
    ],
  },
  {
    id: 'anesthesia-units',
    summary: 'Anesthesia payment: (base + time + modifying) units x conversion factor, then the medical-direction percentage (AA personally-performed, QK/QY/QX directed).',
    compute: C.anesthesiaUnits,
    formatResult: withUsd,
    fields: [
      { dom: 'an-base', arg: 'baseUnits', kind: 'number', required: true, label: 'Base units (ASA base for the procedure)' },
      { dom: 'an-time', arg: 'timeMinutes', kind: 'number', required: true, label: 'Anesthesia time in minutes' },
      { dom: 'an-mod', arg: 'modifyingUnits', kind: 'number', label: 'Modifying units (physical status / qualifying circumstances)' },
      { dom: 'an-cf', arg: 'conversionFactor', kind: 'number', required: true, label: 'Anesthesia conversion factor ($ per unit)' },
      // spec-v1143: this defaulted to `aa` (100%) in the library, so an agent
      // that omitted it was quoted twice a medically-directed payment. Required.
      { dom: 'an-dir', arg: 'medicalDirection', kind: 'enum', values: ['aa', 'qz', 'qy', 'qk', 'qx', 'ad'], required: true, label: 'Medical direction: aa, qz (100%), qy, qk, qx (50%), ad (flat 3 base units)' },
    ],
  },
];
