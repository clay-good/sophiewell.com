// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.

import * as NH from '../../lib/nursing-home-staffing-check-v1396.js';

export default [
  {
    id: 'nursing-home-staffing-check',
    summary: 'Checks a nursing home against the New York, New Jersey, or California minimum staffing law. New York (PHL 2895-b) needs 3.5 hours of care per resident per day, at least 2.2 by aides and 1.1 by licensed nurses. California (HSC 1276.65) needs 3.5, at least 2.4 by CNAs. New Jersey (N.J.S.A. 30:13-18) sets CNA or direct-care ratios of 1:8 days, 1:10 evenings, and 1:14 nights.',
    compute: NH.nursingHomeStaffingCheck,
    fields: [
      { dom: 'nh-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: NH.NH_STATES.map((s) => s.value) },
      { dom: 'nh-census', arg: 'census', kind: 'number', required: true, label: 'Resident census' },
      { dom: 'nh-dp', arg: 'distinctPart', kind: 'enum', label: 'CA: distinct-part SNF of a general acute hospital', values: ['yes', 'no'] },
      { dom: 'nh-total', arg: 'totalHours', kind: 'number', label: 'NY, CA: direct care hours in the day' },
      { dom: 'nh-aide', arg: 'aideHours', kind: 'number', label: 'NY, CA: certified nurse aide hours in the day' },
      { dom: 'nh-licensed', arg: 'licensedHours', kind: 'number', label: 'NY: licensed nurse hours in the day' },
      { dom: 'nh-shift', arg: 'shift', kind: 'enum', label: 'NJ: shift', values: NH.SHIFTS.map((s) => s.value) },
      { dom: 'nh-cnas', arg: 'cnas', kind: 'number', label: 'NJ: CNAs working this shift' },
      { dom: 'nh-lic', arg: 'licensed', kind: 'number', label: 'NJ: RNs and LPNs giving direct care this shift' },
    ],
  },
];
