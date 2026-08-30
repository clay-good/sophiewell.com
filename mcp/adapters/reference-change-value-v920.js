// spec-v920 MCP adapter: the reference change value in lib/reference-change-value-v920.js. The
// dom keys mirror the browser renderer (views/group-v920.js) and
// META['reference-change-value'].example.
//
// "Inside the reference change value" is never reported as "stable". Clinical domain.

import { referenceChangeValue } from '../../lib/reference-change-value-v920.js';

export default [
  {
    id: 'reference-change-value',
    summary: 'Reports whether a change between two results on the same patient is a real one. The reference change value is the size a difference has to exceed to be distinguishable from the variation that was always going to be there, and it is the square root of two, times a probability factor, times the square root of the analytical CV squared plus the within-subject biological CV squared. The analytical imprecision belongs to the assay and the laboratory knows it; the within-subject variation is a property of the ANALYTE and comes from published tables, not from this patient. A CHANGE SMALLER THAN IT IS NOT "STABLE" -- it is a change that cannot be told apart from analytical and biological variation, and those are different statements. A CHANGE LARGER THAN IT IS REAL AND NOT NECESSARILY IMPORTANT: the arithmetic answers whether something moved, not whether the movement matters. ONE-SIDED AND TWO-SIDED ARE DIFFERENT QUESTIONS, and using the two-sided factor when only a rise is watched for makes the test harder to pass than the question asked for. IT ASSUMES A STEADY STATE.',
    compute: referenceChangeValue,
    fields: [
      { dom: 'rcv-cva', arg: 'cvAnalytical', kind: 'number', required: true, label: 'Analytical imprecision, from the laboratory', unit: 'CV %' },
      { dom: 'rcv-cvi', arg: 'cvIntraindividual', kind: 'number', required: true, label: 'Within-subject biological variation, from published tables', unit: 'CV %' },
      { dom: 'rcv-probability', arg: 'probability', kind: 'enum', required: false, label: 'Probability and sidedness', values: ['two-95', 'one-95', 'two-99', 'one-99'] },
      { dom: 'rcv-previous', arg: 'previousResult', kind: 'number', required: false, label: 'Previous result, to compare against the current one' },
      { dom: 'rcv-current', arg: 'currentResult', kind: 'number', required: false, label: 'Current result' },
    ],
  },
];
