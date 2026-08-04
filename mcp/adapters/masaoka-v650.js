// spec-v650 MCP adapter: Masaoka-Koga thymoma staging in lib/masaoka-v650.js. The
// dom keys mirror the browser renderer (views/group-v650.js) and
// META['masaoka-koga'].example. A decision-logic classifier (returns a stage code):
// the most advanced finding checked sets the stage; none checked is Stage I. Every
// input is an optional bool. Clinical domain.

import { masaokaKoga } from '../../lib/masaoka-v650.js';

export default [
  {
    id: 'masaoka-koga',
    summary: 'Masaoka-Koga staging of thymic epithelial tumors (thymoma): the most advanced finding sets the stage. I completely encapsulated; IIa microscopic transcapsular invasion; IIb macroscopic fat invasion or gross pleural/pericardial adherence; III macroscopic invasion into a neighboring organ; IVa pleural/pericardial dissemination; IVb lymphogenous or hematogenous metastasis.',
    compute: masaokaKoga,
    fields: [
      { dom: 'mk-micro', arg: 'microInvasion', kind: 'bool', required: false, label: 'Microscopic transcapsular invasion (through the capsule) — Stage IIa' },
      { dom: 'mk-macro', arg: 'macroInvasion', kind: 'bool', required: false, label: 'Macroscopic invasion into surrounding fat, or gross adherence to (not through) pleura/pericardium — Stage IIb' },
      { dom: 'mk-organ', arg: 'organInvasion', kind: 'bool', required: false, label: 'Macroscopic invasion into a neighboring organ (pericardium, great vessel, lung) — Stage III' },
      { dom: 'mk-dissem', arg: 'dissemination', kind: 'bool', required: false, label: 'Pleural or pericardial dissemination (separate implant nodules) — Stage IVa' },
      { dom: 'mk-mets', arg: 'distantMets', kind: 'bool', required: false, label: 'Lymphogenous or hematogenous (nodal/distant) metastasis — Stage IVb' },
    ],
  },
];
