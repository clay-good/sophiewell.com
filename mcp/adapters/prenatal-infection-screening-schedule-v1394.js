// spec-v1394: MCP adapter. The dom keys mirror views/group-v1394.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as PNS from '../../lib/prenatal-infection-screening-schedule-v1394.js';

export default [
  {
    id: 'prenatal-infection-screening-schedule',
    summary: 'Lists the prenatal syphilis, HIV, and hepatitis B tests a state requires now (NY, NJ, CA, TX), and what comes next. Texas requires all three at the first visit, syphilis and HIV from 28 weeks, and hepatitis B and syphilis at delivery; with no third-trimester result, an expedited HIV test or a newborn sample within 2 hours. California requires syphilis three times and an emergency department screen before discharge when no result exists this pregnancy. New York requires syphilis at diagnosis, at 28 to 32 weeks, and at delivery; hepatitis B prenatally; and at delivery, with no result, an expedited HIV test within 12 hours and hepatitis B within 24 to 48 hours.',
    compute: PNS.prenatalInfectionScreeningSchedule,
    fields: [
      { dom: 'pns-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: PNS.PNS_STATES.map((s) => s.value) },
      { dom: 'pns-setting', arg: 'setting', kind: 'enum', required: true, label: 'Setting', values: PNS.SETTINGS.map((s) => s.value) },
      { dom: 'pns-ga', arg: 'ga', kind: 'number', required: true, label: 'Gestational age (weeks)' },
      { dom: 'pns-syph1', arg: 'syphFirst', kind: 'enum', label: 'First-visit syphilis result on record', values: ['yes', 'no'] },
      { dom: 'pns-syph3', arg: 'syph3', kind: 'enum', label: 'Third-trimester syphilis result on record', values: ['yes', 'no'] },
      { dom: 'pns-hiv1', arg: 'hivFirst', kind: 'enum', label: 'First-visit HIV result on record', values: ['yes', 'no'] },
      { dom: 'pns-hiv3', arg: 'hiv3', kind: 'enum', label: 'Third-trimester HIV result on record', values: ['yes', 'no'] },
      { dom: 'pns-hbv', arg: 'hbv', kind: 'enum', label: 'Hepatitis B result on record', values: ['yes', 'no'] },
    ],
  },
];
