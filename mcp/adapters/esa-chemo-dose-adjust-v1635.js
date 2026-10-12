// spec-v1635 MCP adapter: esa-chemo-dose-adjust in lib/esa-chemo-dose-adjust-v1635.js. The dom keys
// mirror views/group-v1635.js and META['esa-chemo-dose-adjust'].example. Clinical domain. Two label
// rows: Epogen and Aranesp.

import * as EA from '../../lib/esa-chemo-dose-adjust-v1635.js';

export default [
  {
    id: 'esa-chemo-dose-adjust',
    summary: 'Epoetin and darbepoetin in chemotherapy anemia, by the Epogen and Aranesp label rules. Not started: it tests hemoglobin under 10 g/dL and two more months of chemotherapy, and gives the starting dose. On therapy: it applies the reduce, withhold, increase and discontinue rules and gives the new dose. The transfusion-avoiding hemoglobin is the reader\'s determination; the label states it in words.',
    compute: (args) => EA.esaChemoDoseAdjust(args, new Date()),
    fields: [
      { dom: 'eca-schedule', arg: 'schedule', kind: 'enum', required: true, values: EA.SCHEDULES.map((x) => x.value), label: 'Agent and schedule' },
      { dom: 'eca-stage', arg: 'stage', kind: 'enum', required: true, values: EA.STAGES.map((x) => x.value), label: 'Stage' },
      { dom: 'eca-hgb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin now', unit: 'g/dL' },
      { dom: 'eca-weight', arg: 'weight', kind: 'number', label: 'Weight (needed for a schedule dosed per kg)', unit: 'kg' },
      { dom: 'eca-months', arg: 'monthsPlanned', kind: 'number', label: 'Not started: months of chemotherapy still planned', unit: 'months' },
      { dom: 'eca-dose', arg: 'currentDose', kind: 'number', label: 'On therapy: current dose per administration (Units for epoetin, mcg for darbepoetin)' },
      { dom: 'eca-weeks', arg: 'weeksOnTherapy', kind: 'number', label: 'On therapy: weeks on the ESA', unit: 'weeks' },
      { dom: 'eca-hgb-2wk', arg: 'hemoglobinTwoWeeksAgo', kind: 'number', label: 'On therapy: hemoglobin 2 weeks ago (optional)', unit: 'g/dL' },
      { dom: 'eca-hgb-start', arg: 'hemoglobinAtStart', kind: 'number', label: 'On therapy: hemoglobin when the ESA was started (optional)', unit: 'g/dL' },
      { dom: 'eca-level', arg: 'transfusionLevel', kind: 'enum', values: EA.TRANSFUSION_LEVELS.map((x) => x.value), label: 'On therapy: transfusion-avoiding level, where the hemoglobin stands' },
      { dom: 'eca-still', arg: 'transfusionsStillRequired', kind: 'enum', values: EA.YES_NO.map((x) => x.value), label: 'On therapy: red cell transfusions still required' },
      { dom: 'eca-complete', arg: 'chemoCompleted', kind: 'enum', values: EA.YES_NO.map((x) => x.value), label: 'On therapy: chemotherapy course completed' },
    ],
  },
];
