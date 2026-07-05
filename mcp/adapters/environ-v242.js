// spec-v183 MCP wave: adapters for the environmental heat / cold exposure indices
// in lib/environ-v242.js — the NWS heat index, the Canadian humidex, the 2001
// wind-chill index, and the wet-bulb globe temperature (WBGT). dom keys mirror
// views/group-v242.js; wbgt-setting is an outdoor/indoor enum, the rest are numeric.

import * as F from '../../lib/environ-v242.js';

export default [
  {
    id: 'heat-index',
    summary: 'NWS heat index (Rothfusz regression): apparent temperature from air temperature (F) and relative humidity (%).',
    compute: F.heatIndex,
    fields: [
      { dom: 'hi-temp', arg: 'tempF', kind: 'number', required: true, label: 'Air temperature', unit: 'F' },
      { dom: 'hi-rh', arg: 'humidity', kind: 'number', required: true, label: 'Relative humidity', unit: '%' },
    ],
  },
  {
    id: 'humidex',
    summary: 'Canadian humidex (Masterton & Richardson 1979): comfort index from air temperature and dewpoint (C).',
    compute: F.humidex,
    fields: [
      { dom: 'hx-temp', arg: 'tempC', kind: 'number', required: true, label: 'Air temperature', unit: 'C' },
      { dom: 'hx-dew', arg: 'dewpointC', kind: 'number', required: true, label: 'Dewpoint', unit: 'C' },
    ],
  },
  {
    id: 'wind-chill',
    summary: '2001 wind-chill index (JAG/TI): perceived temperature from air temperature (C) and wind speed (km/h).',
    compute: F.windChill,
    fields: [
      { dom: 'wc-temp', arg: 'tempC', kind: 'number', required: true, label: 'Air temperature', unit: 'C' },
      { dom: 'wc-wind', arg: 'windKmh', kind: 'number', required: true, label: 'Wind speed', unit: 'km/h' },
    ],
  },
  {
    id: 'wbgt',
    summary: 'Wet-bulb globe temperature (Yaglou & Minard 1957; ISO 7243): heat-stress index from wet-bulb, globe, and dry-bulb temperatures.',
    compute: F.wbgt,
    fields: [
      { dom: 'wbgt-setting', arg: 'setting', kind: 'enum', required: true, label: 'Setting', values: ['outdoor', 'indoor'] },
      { dom: 'wbgt-nwb', arg: 'naturalWetBulb', kind: 'number', required: true, label: 'Natural wet-bulb temperature' },
      { dom: 'wbgt-globe', arg: 'globe', kind: 'number', required: true, label: 'Globe temperature (outdoor only)' },
      { dom: 'wbgt-dry', arg: 'dryBulb', kind: 'number', required: true, label: 'Dry-bulb (air) temperature' },
    ],
  },
];
