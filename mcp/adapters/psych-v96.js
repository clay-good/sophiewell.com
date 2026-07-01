// spec-v183 MCP wave 11: adapters for the six lib/psych-v96.js clinician-rated
// psychiatry severity scales (HAM-D, HAM-A, MADRS, MDQ, Y-BOCS, PCL-5). dom keys
// mirror views/group-v22.js. The item-summed scales take an `items` ARRAY; the
// renderer builds it with readItems([...]) over the flat per-item fields, so the
// adapter exposes those same flat scalar fields and rebuilds the array in a
// custom toArgs (the spec-v183 flat->array pattern first used for the Drug
// Burden Index). MDQ likewise rebuilds its 13-symptom array. Every documented
// example round-trips to its META.example.expected.

import * as F from '../../lib/psych-v96.js';

// Build N flat numeric item fields dom `${prefix}-${i}` and a toArgs that
// collects them into the `items` array the lib function expects (optNum: a
// numeric string becomes a Number, an absent field becomes null).
function itemScale(prefix, n) {
  const fields = [];
  for (let i = 1; i <= n; i += 1) {
    fields.push({ dom: `${prefix}-${i}`, arg: `item${i}`, kind: 'number', required: true, label: `Item ${i}` });
  }
  const toArgs = (inputs) => ({
    items: Array.from({ length: n }, (_, i) => {
      const v = inputs[`${prefix}-${i + 1}`];
      return (v === undefined || v === '' || v === null) ? null : Number(v);
    }),
  });
  return { fields, toArgs };
}

const hamd = itemScale('hamd', 17);
const hama = itemScale('hama', 14);
const madrs = itemScale('madrs', 10);
const ybocs = itemScale('ybocs', 10);
const pcl5 = itemScale('pcl5', 20);

export default [
  {
    id: 'hamd',
    summary: 'Hamilton Depression Rating Scale, 17-item (Hamilton 1960): the clinician-rated depression-severity total (0-52) with a severity band.',
    compute: F.hamd,
    fields: hamd.fields,
    toArgs: hamd.toArgs,
  },
  {
    id: 'hama',
    summary: 'Hamilton Anxiety Rating Scale, 14-item (Hamilton 1959): the clinician-rated anxiety-severity total (0-56) with a severity band.',
    compute: F.hama,
    fields: hama.fields,
    toArgs: hama.toArgs,
  },
  {
    id: 'madrs',
    summary: 'Montgomery-Asberg Depression Rating Scale (Montgomery 1979): the 10-item clinician-rated depression-severity total (0-60) with a severity band.',
    compute: F.madrs,
    fields: madrs.fields,
    toArgs: madrs.toArgs,
  },
  {
    id: 'mdq',
    summary: 'Mood Disorder Questionnaire (Hirschfeld 2000): the bipolar-spectrum screen; positive requires 7+ of 13 symptoms, co-occurrence, and moderate/serious impairment.',
    compute: F.mdq,
    fields: [
      ...Array.from({ length: 13 }, (_, i) => ({ dom: `mdq-s${i + 1}`, arg: `s${i + 1}`, kind: 'enum', values: ['yes', 'no'], label: `Symptom ${i + 1}` })),
      { dom: 'mdq-cooccur', arg: 'coOccurrence', kind: 'enum', values: ['yes', 'no'], label: 'Several symptoms during the same period' },
      { dom: 'mdq-impair', arg: 'impairment', kind: 'enum', values: ['none', 'minor', 'moderate', 'serious'], label: 'Degree of functional problem caused' },
    ],
    toArgs(inputs) {
      return {
        symptoms: Array.from({ length: 13 }, (_, i) => {
          const v = inputs[`mdq-s${i + 1}`];
          return v === undefined ? '' : String(v);
        }),
        coOccurrence: inputs['mdq-cooccur'] === undefined ? '' : String(inputs['mdq-cooccur']),
        impairment: inputs['mdq-impair'] === undefined ? '' : String(inputs['mdq-impair']),
      };
    },
  },
  {
    id: 'ybocs',
    summary: 'Yale-Brown Obsessive Compulsive Scale (Goodman 1989): the 10-item obsessive-compulsive severity total (0-40) split into obsession and compulsion subscores.',
    compute: F.ybocs,
    fields: ybocs.fields,
    toArgs: ybocs.toArgs,
  },
  {
    id: 'pcl5',
    summary: 'PTSD Checklist for DSM-5 (Weathers 2013): the 20-item self-report severity total (0-80) with the provisional cutoff and per-cluster counts.',
    compute: F.pcl5,
    fields: pcl5.fields,
    toArgs: pcl5.toArgs,
  },
];
