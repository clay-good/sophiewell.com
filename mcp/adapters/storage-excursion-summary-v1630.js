// spec-v1630 MCP adapter: storage-excursion-summary in lib/storage-excursion-summary-v1630.js. The
// dom keys mirror views/group-v1630.js and META['storage-excursion-summary'].example. CDC Vaccine
// Storage and Handling Toolkit, July 2026; administrative domain. Never says a product is usable.

import * as SE from '../../lib/storage-excursion-summary-v1630.js';

export default [
  {
    id: 'storage-excursion-summary',
    summary: 'Lists the excursions in a storage temperature log, each with its start, end, duration and extreme reading. Totals the time above and below range. Uses CDC\'s refrigerator, freezer or ultra-cold range, or a range from the package insert. Flags refrigerator readings at 0°C (32°F) or colder. It never says a product is still usable: the manufacturer decides.',
    compute: SE.storageExcursionSummary,
    fields: [
      { dom: 'se-unit', arg: 'unit', kind: 'enum', required: true, values: SE.UNITS.map((u) => u.value), label: 'Unit of the readings: Celsius (C) or Fahrenheit (F)' },
      { dom: 'se-range', arg: 'range', kind: 'enum', required: true, values: SE.RANGE_OPTIONS.map((r) => r.value), label: 'Storage range: refrigerator, freezer, ultra-cold, or custom (from the package insert)' },
      { dom: 'se-low', arg: 'low', kind: 'number', required: false, label: 'Custom range: lowest temperature' },
      { dom: 'se-high', arg: 'high', kind: 'number', required: false, label: 'Custom range: highest temperature' },
      { dom: 'se-readings', arg: 'readings', kind: 'string', required: true, label: 'Readings, one per line: date and time (YYYY-MM-DD HH:MM), then the temperature' },
    ],
  },
];
