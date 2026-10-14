// spec-v1640 MCP adapter: pgx-label-dose-limit in lib/pgx-label-dose-limit-v1640.js. The dom keys mirror
// views/group-v1640.js and META['pgx-label-dose-limit'].example. Clinical domain. Eleven label rows.

import * as PL from '../../lib/pgx-label-dose-limit-v1640.js';

export default [
  {
    id: 'pgx-label-dose-limit',
    summary: 'The dose ceiling or fraction an FDA label states for a poor metabolizer, set beside the dose entered. Tetrabenazine, deutetrabenazine, valbenazine, pimozide, aripiprazole, brexpiprazole, vortioxetine, iloperidone, pitolisant (CYP2D6), citalopram (CYP2C19) and celecoxib (CYP2C9). Each field is read only by the rows that name it.',
    compute: (args) => PL.pgxLabelDoseLimit(args, new Date()),
    fields: [
      { dom: 'pld-drug', arg: 'drug', kind: 'enum', required: true, values: PL.DRUGS.map((x) => x.value), label: 'Drug' },
      { dom: 'pld-status', arg: 'status', kind: 'enum', required: true, values: PL.STATUSES.map((x) => x.value), label: 'Metabolizer status on the report' },
      { dom: 'pld-daily', arg: 'dailyDose', kind: 'number', label: 'Planned daily dose (ceiling rows)', unit: 'mg' },
      { dom: 'pld-single', arg: 'singleDose', kind: 'number', label: 'Single dose (tetrabenazine; iloperidone twice daily)', unit: 'mg' },
      { dom: 'pld-usual', arg: 'usualDose', kind: 'number', label: 'Usual dose (aripiprazole, brexpiprazole, celecoxib)', unit: 'mg' },
      { dom: 'pld-population', arg: 'population', kind: 'enum', values: PL.POPULATIONS.map((x) => x.value), label: 'Adult or child (pimozide, pitolisant)' },
      { dom: 'pld-weight', arg: 'weight', kind: 'number', label: 'Weight of a child (pimozide, pitolisant)', unit: 'kg' },
      { dom: 'pld-indication', arg: 'indication', kind: 'enum', values: PL.INDICATIONS.map((x) => x.value), label: 'Use (aripiprazole, iloperidone, celecoxib)' },
      { dom: 'pld-3a4', arg: 'cyp3a4Inhibitor', kind: 'enum', values: PL.CYP3A4.map((x) => x.value), label: 'CYP3A4 inhibitor (aripiprazole, brexpiprazole)' },
      { dom: 'pld-days', arg: 'daysSinceIncrease', kind: 'number', label: 'Days since the last dose increase (pimozide)', unit: 'days' },
    ],
  },
];
