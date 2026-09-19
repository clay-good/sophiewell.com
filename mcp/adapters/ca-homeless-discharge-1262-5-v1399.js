// spec-v1399: MCP adapter. The dom keys mirror views/group-v1399.js and this tile's META example.
// A blank item is "not documented", never done.

import * as HD from '../../lib/ca-homeless-discharge-1262-5-v1399.js';

const S = HD.STATUS.map((s) => s.value);

export default [
  {
    id: 'ca-homeless-discharge-1262-5',
    summary: 'Lists what California\'s HSC 1262.5 requires before a homeless patient is discharged, and names what is missing. That is a destination, clinical stability, a meal, weather-appropriate clothing, follow-up care, medication, infectious disease screening, vaccinations, a medical screening exam with behavioral health follow-up, coverage enrollment help, and transportation within 30 minutes or 30 miles. A blank item is never counted as done.',
    compute: HD.caHomelessDischarge12625,
    fields: [
      { dom: 'hd-destination', arg: 'destination', kind: 'enum', label: '(n)(4) Postdischarge destination identified', values: S },
      { dom: 'hd-stability', arg: 'stability', kind: 'enum', label: '(o)(1) the physician\'s clinical-stability determination', values: S },
      { dom: 'hd-meal', arg: 'meal', kind: 'enum', label: '(o)(2) a meal offered', values: S },
      { dom: 'hd-clothing', arg: 'clothing', kind: 'enum', label: '(o)(3) weather-appropriate clothing offered', values: S },
      { dom: 'hd-follow-up', arg: 'followUp', kind: 'enum', label: '(o)(4) referral to follow-up care', values: S },
      { dom: 'hd-medication', arg: 'medication', kind: 'enum', label: '(o)(5) a prescription', values: S },
      { dom: 'hd-infection', arg: 'infection', kind: 'enum', label: '(o)(6) infectious disease screening offered or referred', values: S },
      { dom: 'hd-vaccines', arg: 'vaccines', kind: 'enum', label: '(o)(7) vaccinations offered', values: S },
      { dom: 'hd-screening', arg: 'screening', kind: 'enum', label: '(o)(8) medical screening exam', values: S },
      { dom: 'hd-coverage', arg: 'coverage', kind: 'enum', label: '(o)(9) coverage screening and enrollment help', values: S },
      { dom: 'hd-transport', arg: 'transport', kind: 'enum', label: '(o)(10) Transportation offered (within 30 minutes or 30 miles)', values: S },
    ],
  },
];
