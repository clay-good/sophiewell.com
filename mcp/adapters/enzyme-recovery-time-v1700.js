// spec-v1700 MCP adapter: enzyme-recovery-time in lib/enzyme-recovery-time-v1700.js. The dom keys mirror views/group-v1700.js and
// META['enzyme-recovery-time'].example.

import * as ERT from '../../lib/enzyme-recovery-time-v1700.js';

export default [
  {
    id: 'enzyme-recovery-time',
    summary: "Time for a CYP enzyme to return toward baseline after an inducer or irreversible inhibitor is stopped. First-order turnover at ICH M12's kdeg.",
    compute: ERT.enzymeRecoveryTime,
    fields: [
      { dom: 'ert-enzyme', arg: 'enzyme', kind: 'enum', values: ['CYP1A2', 'CYP2B6', 'CYP2C8', 'CYP2C9', 'CYP2C19', 'CYP2D6', 'CYP3A4', 'CYP3A4-gut'], required: false, label: 'Enzyme for Table 6 kdeg' },
      { dom: 'ert-kdeg', arg: 'kdeg', kind: 'number', required: false, label: 'kdeg (per minute)' },
      { dom: 'ert-e0', arg: 'startLevel', kind: 'number', required: true, label: 'Starting level, fraction of baseline' },
      { dom: 'ert-hours', arg: 'hoursSinceStop', kind: 'number', required: false, label: 'Hours since stopping' },
      { dom: 'ert-washout', arg: 'washoutHours', kind: 'number', required: false, label: 'Washout delay (hours)' },
    ]
  },
];
