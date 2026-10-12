// spec-v1637 MCP adapter: cs-record-retention in lib/cs-record-retention-v1637.js. The dom keys
// mirror views/group-v1637.js and META['cs-record-retention'].example. Administrative domain.
// No clock.

import * as RR from '../../lib/cs-record-retention-v1637.js';

export default [
  {
    id: 'cs-record-retention',
    summary: 'The earliest date federal law stops requiring a pharmacy record. Two years for controlled-substance inventories and records, DEA Form 222, CSOS orders, transferred prescriptions and pseudoephedrine logbook entries; six years for DSCSA transaction and investigation records. Names the rule and takes a longer state or contract period.',
    compute: RR.csRecordRetention,
    fields: [
      { dom: 'crr-record', arg: 'record', kind: 'enum', required: true, values: RR.RECORDS.map((k) => k.value), label: 'Kind of record' },
      { dom: 'crr-from', arg: 'countedFrom', kind: 'string', required: true, label: 'Date the period is counted from (YYYY-MM-DD)' },
      { dom: 'crr-longer', arg: 'longerYears', kind: 'number', label: 'A longer period you must meet (state law, contract)', unit: 'years' },
    ],
  },
];
