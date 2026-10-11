// spec-v1634 MCP adapter: riosord in lib/riosord-v1634.js. The dom keys mirror
// views/group-v1634.js and META.riosord.example. Clinical domain. Every item of the version chosen
// must be answered; items of the other version are ignored.

import * as RO from '../../lib/riosord-v1634.js';

export default [
  {
    id: 'riosord',
    summary: 'RIOSORD score and risk class for opioid overdose or serious respiratory depression. It sums the published points of the veterans (2015) or commercially insured (2018) version, names each item that scored, and gives the risk class with its average predicted probability over 6 months. That probability comes from a case-control sample and is not a population incidence.',
    compute: RO.riosord,
    fields: [
      { dom: 'rio-version', arg: 'version', kind: 'enum', required: true, values: RO.VERSIONS.map((x) => x.value), label: 'Version' },
      ...RO.ITEMS.map((it) => ({ dom: `rio-${it.dom}`, arg: it.arg, kind: 'enum', values: ['yes', 'no'], label: it.text })),
      { dom: 'rio-mme', arg: 'mme', kind: 'number', required: true, label: 'Maximum prescribed opioid dose', unit: 'MME/day' },
    ],
  },
];
