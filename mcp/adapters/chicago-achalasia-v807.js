// spec-v807 MCP adapter: Chicago Classification v4.0 achalasia subtypes in
// lib/chicago-achalasia-v807.js. The dom keys mirror the browser renderer
// (views/group-v807.js) and META['chicago-achalasia'].example. Two gates, then the
// esophageal body picks the subtype. Clinical domain.

import { chicagoAchalasia } from '../../lib/chicago-achalasia-v807.js';

export default [
  {
    id: 'chicago-achalasia',
    summary: 'Assigns the manometric subtype of achalasia (Chicago Classification v4.0). Two requirements gate all three subtypes: an abnormal median integrated relaxation pressure AND 100% absent peristalsis. With both met, 20% or more premature/spastic swallows is type III, panesophageal pressurization in 20% or more is type II, and neither is type I. Spasm is checked first because it defines type III.',
    compute: chicagoAchalasia,
    fields: [
      { dom: 'chi-irp', arg: 'abnormalIrp', kind: 'boolean', required: false, label: 'Abnormal median IRP' },
      { dom: 'chi-peristalsis', arg: 'absentPeristalsis', kind: 'boolean', required: false, label: '100% absent peristalsis' },
      { dom: 'chi-spasm', arg: 'prematureSwallows', kind: 'boolean', required: false, label: 'Premature swallows >= 20%' },
      { dom: 'chi-pep', arg: 'panesophagealPressurization', kind: 'boolean', required: false, label: 'Pressurization >= 20%' },
    ],
  },
];
