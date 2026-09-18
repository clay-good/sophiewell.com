// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.

import * as MR from '../../lib/mandated-report-router-v1395.js';

export default [
  {
    id: 'mandated-report-router',
    summary: "Where a mandated report goes and how fast, in New York, New Jersey, California, or Texas. New York (Social Services Law 415): child abuse by telephone immediately, written within 48 hours; nursing-home abuse to the Department of Health immediately, written within 48 hours (Public Health Law 2803-d). New Jersey: any person reports child abuse immediately (N.J.S.A. 9:6-8.10); vulnerable-adult abuse goes to county adult protective services with no set deadline. California: child abuse by telephone immediately, written within 36 hours; in long-term care a police call within two hours unless the abuser is a resident with diagnosed dementia and there is no serious bodily injury; firearm and assaultive injuries within two working days. Texas: a professional reports child abuse within 24 hours, cut from 48 by S.B. 571 in 2025.",
    compute: MR.mandatedReportRouter,
    fields: [
      { dom: 'mr-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: MR.MR_STATES.map((s) => s.value) },
      { dom: 'mr-victim', arg: 'victim', kind: 'enum', required: true, label: 'The report is about', values: MR.VICTIMS.map((s) => s.value) },
      { dom: 'mr-time', arg: 'suspected', kind: 'string', required: true, label: 'First had reasonable cause to suspect (YYYY-MM-DDTHH:MM)' },
      { dom: 'mr-dementia', arg: 'dementiaResident', kind: 'enum', label: 'Abuser is a resident with diagnosed dementia (CA)', values: ['yes', 'no'] },
      { dom: 'mr-injury', arg: 'seriousInjury', kind: 'enum', label: 'Serious bodily injury (CA long-term care)', values: ['yes', 'no'] },
    ],
  },
];
