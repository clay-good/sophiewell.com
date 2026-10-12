// spec-v1638 MCP adapter: glucose-supply-quantity-check in lib/glucose-supply-quantity-check-v1638.js.
// The dom keys mirror views/group-v1638.js and META['glucose-supply-quantity-check'].example.
// Administrative domain. No clock.

import * as GS from '../../lib/glucose-supply-quantity-check-v1638.js';

export default [
  {
    id: 'glucose-supply-quantity-check',
    summary: 'Medicare home glucose test strips and lancets against LCD L33822. Usual utilization is 100 and 100 every 3 months without insulin and 300 and 300 with insulin. Above that, checks the visit within 6 months before the order and the 6-month adherence check, and shows the excess that would be denied. Gives billing units (50 strips, 100 lancets) and the KX or KS modifier.',
    compute: GS.glucoseSupplyQuantityCheck,
    fields: [
      { dom: 'gsq-cgm', arg: 'cgm', kind: 'enum', required: true, values: GS.CGM.map((x) => x.value), label: 'Does the beneficiary have a non-adjunctive continuous glucose monitor?' },
      { dom: 'gsq-insulin', arg: 'insulin', kind: 'enum', values: GS.INSULIN.map((x) => x.value), label: 'Insulin treatment' },
      { dom: 'gsq-basic', arg: 'basicCriteria', kind: 'enum', values: GS.BASIC.map((x) => x.value), label: 'The two basic coverage criteria (diabetes; trained on the device)' },
      { dom: 'gsq-strips', arg: 'strips', kind: 'number', label: 'Test strips ordered for 3 months' },
      { dom: 'gsq-lancets', arg: 'lancets', kind: 'number', label: 'Lancets ordered for 3 months' },
      { dom: 'gsq-tests', arg: 'testsPerDay', kind: 'number', label: 'Or tests per day (used when the two quantities are blank)' },
      { dom: 'gsq-order', arg: 'orderDate', kind: 'string', label: 'Date of the order for the higher quantity (YYYY-MM-DD)' },
      { dom: 'gsq-visit', arg: 'visitDate', kind: 'string', label: 'Date of the treating practitioner\'s visit that evaluated the need (YYYY-MM-DD)' },
      { dom: 'gsq-adherence', arg: 'adherenceVerified', kind: 'string', label: 'Date adherence to the high-use regimen was last verified (YYYY-MM-DD)' },
      { dom: 'gsq-dispense', arg: 'dispenseDate', kind: 'string', label: 'Dispensing date (YYYY-MM-DD)' },
      { dom: 'gsq-devices', arg: 'lancingDevices', kind: 'number', label: 'Spring-powered lancing devices in the last 6 months (optional)' },
      { dom: 'gsq-dstrips', arg: 'dispenseStrips', kind: 'number', label: 'Strips to dispense now (optional)' },
      { dom: 'gsq-dlancets', arg: 'dispenseLancets', kind: 'number', label: 'Lancets to dispense now (optional)' },
    ],
  },
];
