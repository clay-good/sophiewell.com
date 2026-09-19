// spec-v1398: MCP adapter. The dom keys mirror views/group-v1398.js and this tile's META example.

import * as AQ from '../../lib/aqi-pm25-v1398.js';

export default [
  {
    id: 'aqi-pm25',
    summary: 'Converts a 24-hour PM2.5 concentration to the Air Quality Index, or an AQI back to PM2.5, with EPA\'s 2024 breakpoints. Good now ends at 9.0 ug/m3 (it was 12.0), so older calculators call 10 ug/m3 Good; this one calls it Moderate. The concentration is truncated to one decimal before EPA\'s Equation 1, and the category comes with EPA\'s advice for everyone and for sensitive groups.',
    compute: AQ.aqiPm25,
    fields: [
      { dom: 'aqi-conc', arg: 'conc', kind: 'number', label: 'PM2.5, 24-hour (ug/m3)' },
      { dom: 'aqi-aqi', arg: 'aqi', kind: 'number', label: 'AQI value' },
      { dom: 'aqi-sensitive', arg: 'sensitive', kind: 'enum', label: 'Patient is in a sensitive group', values: ['yes', 'no'] },
    ],
  },
];
