// spec-v544 MCP wave: adapter for NEMS in lib/nems-v544.js. The dom keys mirror the browser renderer
// (views/group-v544.js) and META['nems'].example: nems-<key> maps to the lib arg <key>.
//
// **THE TWO EXCLUSIVE PAIRS ARE PUBLISHED AS THREE-WAY ENUMS, NOT AS FOUR BOOLEANS, AND THAT IS THE DESIGN
// POINT.** The instrument names nine items, so the obvious schema is nine booleans - and it would be wrong.
// Mechanical ventilatory support EXCLUDES supplementary ventilatory care, and multiple vasoactive drugs
// REPLACES the single-drug score. Publishing four booleans would let an agent score 12 + 3 and 12 + 7,
// reaching 66 on a scale whose maximum is 56. Collapsing each pair into one enum makes that unrepresentable.
//
// THE SUMMARY GIVES THE ARITHMETIC PROOF, because an agent that has read the nine-item list elsewhere may
// believe the tool is under-scoring. Summing all nine weights gives 66; the published maximum of 56 is
// reachable only as 9 + 6 + 12 + 12 + 6 + 5 + 6, that is, exactly one item from each exclusive pair. The
// exclusivity is not an interpretation, it is the only reading under which the instrument's own stated
// maximum is achievable.
//
// **THE AXIS WARNING IS THE MOST IMPORTANT LINE IN THE SUMMARY.** Every other ICU instrument an agent knows
// - APACHE, SOFA, SAPS - scores illness severity or mortality. NEMS scores NURSING WORKLOAD CONSUMED. An
// agent that reports "NEMS 45" as though it meant a critically ill patient has said something the
// instrument does not support: a stable ventilated patient on two infusions scores high, and a patient dying
// of an untreatable illness may score low.
//
// The interventions-in-ICU label spells out the routine-care exclusion, which is the commonest scoring
// error: routine radiographs, echocardiograms, ECGs, dressings, and line insertion do NOT count, and
// counting them inflates a large fraction of ICU patients by five points.

import * as N from '../../lib/nems-v544.js';

export default [
  {
    id: 'nems',
    summary: `NEMS, the Nine Equivalents of Nursing Manpower Use Score (Reis Miranda and colleagues 1997), scoring 0 to ${N.NEMS_MAX}. CRITICAL AXIS WARNING: this measures the NURSING WORKLOAD a patient consumed over a shift, NOT illness severity and NOT mortality risk. Unlike APACHE, SOFA or SAPS, a high NEMS does not mean a sicker patient: a stable ventilated patient on two vasoactive infusions is expensive in nursing time and may have an unremarkable severity score, while a patient dying of an untreatable illness may consume very little. The item weights are: basic monitoring 9; intravenous medication 6, bolus or continuous, NOT including vasoactive or inotropic drugs; mechanical ventilatory support 12; supplementary ventilatory care 3; a single vasoactive medication 7; multiple vasoactive medications 12; dialysis techniques 6; specific interventions IN the ICU 5; and specific interventions OUTSIDE the ICU 6. TWO PAIRS ARE MUTUALLY EXCLUSIVE and are therefore published here as single three-way choices rather than as four separate booleans: mechanical ventilatory support EXCLUDES supplementary ventilatory care rather than adding to it, and multiple vasoactive medications REPLACES the single-drug score rather than adding to it. The arithmetic proves this: summing all nine weights naively gives ${N.NEMS_NAIVE_SUM}, while the published maximum of ${N.NEMS_MAX} is reachable only as 9 plus 6 plus 12 plus 12 plus 6 plus 5 plus 6, that is, exactly one item from each exclusive pair. One published source states the maximum as 63, which is inconsistent with the item weights under any exclusivity rule. The specific-interventions-in-the-ICU item means intubation, pacemaker insertion, cardioversion, endoscopy, emergency operation in the past 24 hours, or gastric lavage; it explicitly does NOT include routine radiographs, echocardiograms, ECGs, dressings, or venous and arterial line insertion, and counting routine care there inflates a large fraction of ICU patients by five points. NEMS measures workload for a period already worked. It is not a triage tool, it is not a nurse-to-patient ratio, and it does not by itself determine safe staffing, which depends on skill mix, unit layout, patient acuity NEMS does not capture, and local standards. It says nothing about psychological and family-support work, which occupies real nursing time and appears in none of its nine items, so it systematically under-counts the care of the dying and of distressed families.`,
    compute: N.nems,
    fields: [
      {
        dom: 'nems-ventilation', arg: 'ventilation', kind: 'enum',
        values: N.NEMS_VENTILATION.map((v) => v.value), required: true,
        label: `Ventilatory support - ONE choice, because mechanical support and supplementary care are mutually exclusive [${N.NEMS_VENTILATION.map((v) => `${v.value} = ${v.text} (${v.points})`).join('; ')}]`,
      },
      {
        dom: 'nems-vasoactive', arg: 'vasoactive', kind: 'enum',
        values: N.NEMS_VASOACTIVE.map((v) => v.value), required: true,
        label: `Vasoactive or inotropic support - ONE choice, because multiple replaces single rather than adding to it [${N.NEMS_VASOACTIVE.map((v) => `${v.value} = ${v.text} (${v.points})`).join('; ')}]`,
      },
      ...N.NEMS_INDEPENDENT.map((i) => ({
        dom: `nems-${i.key}`, arg: i.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${i.text} [yes = ${i.points}; no = 0]`,
      })),
    ],
  },
];
