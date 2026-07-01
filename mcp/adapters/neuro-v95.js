// spec-v183 MCP wave 11: adapters for the six lib/neuro-v95.js neurology
// outcome / grading instruments (modified Rankin, GOS-E, Hoehn & Yahr,
// Spetzler-Martin + Lawton-Young supplement, House-Brackmann, MIDAS). dom keys
// mirror views/group-v21.js; the compute arg names are the verbatim keys that
// renderer passes. optNum inputs are 'number', the categorical selects are
// 'enum'. Default makeToArgs round-trips every documented example.

import * as F from '../../lib/neuro-v95.js';

export default [
  {
    id: 'mrs',
    summary: 'Modified Rankin Scale (van Swieten 1988): the 0-6 global disability grade after stroke; 0-2 marks functional independence, 6 is death.',
    compute: F.mrs,
    fields: [
      { dom: 'mrs-grade', arg: 'grade', kind: 'number', required: true, label: 'Modified Rankin grade (0-6)' },
    ],
  },
  {
    id: 'gose',
    summary: 'Glasgow Outcome Scale - Extended (Jennett 1981; Wilson 1998): the 1-8 traumatic-brain-injury outcome grade, from death to upper good recovery.',
    compute: F.gose,
    fields: [
      { dom: 'gose-cat', arg: 'category', kind: 'number', required: true, label: 'GOS-E category (1-8)' },
    ],
  },
  {
    id: 'hoehn-yahr',
    summary: 'Hoehn & Yahr stage (1967, modified): the Parkinson-disease motor stage 0-5, including the 1.5 and 2.5 modified half-stages.',
    compute: F.hoehnYahr,
    fields: [
      { dom: 'hy-stage', arg: 'stage', kind: 'enum', values: ['0', '1', '1.5', '2', '2.5', '3', '4', '5'], required: true, label: 'Hoehn & Yahr stage' },
    ],
  },
  {
    id: 'spetzler-martin',
    summary: 'Spetzler-Martin brain-AVM grade (1986) with the Lawton-Young supplementary score: surgical-risk grade for a cerebral arteriovenous malformation.',
    compute: F.spetzlerMartin,
    fields: [
      { dom: 'sm-size', arg: 'size', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Nidus size (<3 cm / 3-6 cm / >6 cm)' },
      { dom: 'sm-eloquent', arg: 'eloquent', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Eloquent cortex' },
      { dom: 'sm-deep', arg: 'deepVenous', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Deep venous drainage' },
      { dom: 'sm-age', arg: 'ageBand', kind: 'enum', values: ['1', '2', '3'], label: 'Age band (supplementary): <20 / 20-40 / >40' },
      { dom: 'sm-unruptured', arg: 'unruptured', kind: 'enum', values: ['yes', 'no'], label: 'Unruptured (supplementary)' },
      { dom: 'sm-diffuse', arg: 'diffuse', kind: 'enum', values: ['yes', 'no'], label: 'Diffuse nidus (supplementary)' },
    ],
  },
  {
    id: 'house-brackmann',
    summary: 'House-Brackmann facial-nerve grading (1985): the I-VI grade of facial-nerve function, from normal to total paralysis.',
    compute: F.houseBrackmann,
    fields: [
      { dom: 'hb-grade', arg: 'grade', kind: 'number', required: true, label: 'House-Brackmann grade (1-6)' },
    ],
  },
  {
    id: 'midas',
    summary: 'MIDAS (Stewart 2001): the Migraine Disability Assessment lost-days score, banded to a I-IV disability grade.',
    compute: F.midas,
    fields: [
      { dom: 'mi-q1', arg: 'q1', kind: 'number', required: true, label: 'Q1 missed work/school days' },
      { dom: 'mi-q2', arg: 'q2', kind: 'number', required: true, label: 'Q2 reduced-productivity work/school days' },
      { dom: 'mi-q3', arg: 'q3', kind: 'number', required: true, label: 'Q3 missed household days' },
      { dom: 'mi-q4', arg: 'q4', kind: 'number', required: true, label: 'Q4 reduced-productivity household days' },
      { dom: 'mi-q5', arg: 'q5', kind: 'number', required: true, label: 'Q5 missed family/social/leisure days' },
      { dom: 'mi-freq', arg: 'freq', kind: 'number', label: 'Ancillary A: headache days' },
      { dom: 'mi-int', arg: 'intensity', kind: 'number', label: 'Ancillary B: average pain intensity (0-10)' },
    ],
  },
];
