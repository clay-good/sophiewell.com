// spec-v1638 MCP adapter: vaccine-interval-validity in lib/vaccine-interval-validity-v1638.js. The
// dom keys mirror views/group-v1638.js and META['vaccine-interval-validity'].example. Clinical
// domain: it reports validity under a CDC best-practice rule and supplies no schedule. No clock.

import * as VI from '../../lib/vaccine-interval-validity-v1638.js';

export default [
  {
    id: 'vaccine-interval-validity',
    summary: 'Whether a vaccine dose counts under CDC\'s minimum age and interval rule. A dose 4 or fewer days early is valid; 5 or more is repeated, spaced from the invalid dose. Two live injectable or intranasal vaccines need 28 days with no grace. The caller enters the minimum age and interval from the current schedule; none is supplied.',
    compute: VI.vaccineIntervalValidity,
    fields: [
      { dom: 'viv-dose', arg: 'doseDate', kind: 'string', required: true, label: 'Date of the dose being checked (YYYY-MM-DD)' },
      { dom: 'viv-live', arg: 'live', kind: 'enum', required: true, values: VI.LIVE.map((k) => k.value), label: 'Kind of vaccine' },
      { dom: 'viv-grace', arg: 'graceRule', kind: 'enum', required: true, values: VI.GRACE.map((k) => k.value), label: 'Grace period rule' },
      { dom: 'viv-prev', arg: 'previousDose', kind: 'string', label: 'Date of the previous dose (YYYY-MM-DD)' },
      { dom: 'viv-interval', arg: 'minInterval', kind: 'number', label: 'Minimum interval from the previous dose' },
      { dom: 'viv-interval-unit', arg: 'minIntervalUnit', kind: 'enum', values: VI.UNITS.map((k) => k.value), label: 'Unit of the minimum interval' },
      { dom: 'viv-birth', arg: 'birthDate', kind: 'string', label: 'Date of birth (YYYY-MM-DD)' },
      { dom: 'viv-age', arg: 'minAge', kind: 'number', label: 'Minimum age for this dose' },
      { dom: 'viv-age-unit', arg: 'minAgeUnit', kind: 'enum', values: VI.UNITS.map((k) => k.value), label: 'Unit of the minimum age' },
      { dom: 'viv-other-live', arg: 'otherLiveDate', kind: 'string', label: 'Date of the most recent other live injectable or intranasal vaccine (YYYY-MM-DD)' },
      { dom: 'viv-together', arg: 'previousWithOtherLive', kind: 'enum', values: VI.TOGETHER.map((k) => k.value), label: 'Previous dose given the same day as a different live vaccine' },
      { dom: 'viv-special', arg: 'specialGraceMonths', kind: 'number', label: 'A special grace period the schedule gives this dose', unit: 'months' },
    ],
  },
];
