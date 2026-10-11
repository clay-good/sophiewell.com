// spec-v1630 MCP adapter: room-air-changes in lib/room-air-changes-v1630.js. The dom keys mirror
// views/group-v1630.js and META['room-air-changes'].example. CDC Appendix B, Table B.1 formula;
// administrative domain. A required air change rate is the reader's; none is applied.

import * as RA from '../../lib/room-air-changes-v1630.js';

export default [
  {
    id: 'room-air-changes',
    summary: 'Air changes per hour from airflow and room size, with CDC\'s times to remove 99% and 99.9% of an airborne contaminant. Also the airflow a required air change rate takes. CDC\'s times assume an empty room, no aerosol source and perfect mixing. No requirement is applied unless the reader enters one.',
    compute: RA.roomAirChanges,
    fields: [
      { dom: 'ra-aunit', arg: 'airflowUnit', kind: 'enum', required: true, values: RA.AIRFLOW_UNITS.map((u) => u.value), label: 'Airflow unit: cubic feet per minute (cfm) or cubic meters per hour (m3h)' },
      { dom: 'ra-air', arg: 'airflow', kind: 'number', required: true, label: 'Supply or exhaust airflow' },
      { dom: 'ra-runit', arg: 'roomUnit', kind: 'enum', required: true, values: RA.ROOM_UNITS.map((u) => u.value), label: 'Room unit: feet and cubic feet (ft) or meters and cubic meters (m)' },
      { dom: 'ra-vol', arg: 'volume', kind: 'number', required: false, label: 'Room volume (or enter the three dimensions)' },
      { dom: 'ra-len', arg: 'length', kind: 'number', required: false, label: 'Room length' },
      { dom: 'ra-wid', arg: 'width', kind: 'number', required: false, label: 'Room width' },
      { dom: 'ra-hgt', arg: 'height', kind: 'number', required: false, label: 'Room height' },
      { dom: 'ra-req', arg: 'requiredAch', kind: 'number', required: false, label: 'Required air changes per hour, from your own standard (optional)' },
    ],
  },
];
