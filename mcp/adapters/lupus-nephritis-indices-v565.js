// spec-v565 MCP wave: adapter for the modified NIH lupus nephritis indices in
// lib/lupus-nephritis-indices-v565.js. The dom keys mirror the browser renderer (views/group-v565.js) and
// META['lupus-nephritis-indices'].example.
//
// **TWO SEPARATE INDICES THAT MUST NEVER BE ADDED TOGETHER.** Activity runs 0-24 and chronicity 0-12. They
// measure OPPOSITE things - what may still respond to treatment against what is already scarred - so a
// combined "36" is meaningless. An agent presented with two numbers from one biopsy will be tempted to sum
// them; the tool returns them as separate fields and never emits a total.
//
// **ONLY TWO COMPONENTS ARE WEIGHTED, AND ONLY IN THE ACTIVITY INDEX.** Fibrinoid necrosis and cellular or
// fibrocellular crescents count double. Six components each 0-3 would cap at 18, and the published maximum
// is 24 - the difference is entirely those two terms. The chronicity index is wholly unweighted, so its
// maximum really is 4 x 3.
//
// **TWO DIFFERENT 0-3 RUBRICS COEXIST INSIDE THE SAME TOTAL AND ARE INCOMMENSURABLE.** Glomerular
// components are scored by PERCENTAGE OF GLOMERULI (1 = under 25%, 2 = 25-50%, 3 = over 50%).
// Tubulointerstitial components - interstitial inflammation, tubular atrophy, interstitial fibrosis - are
// scored MILD / MODERATE / SEVERE. Identical numeric range, different question. Each field's label carries
// its own rubric.
//
// **THE DENOMINATOR IS THE GLOMERULI IN THE SAMPLE, SO AN INADEQUATE BIOPSY CAN ONLY LOWER THE SCORE.** A
// low activity index on a core with few glomeruli may reflect sampling rather than disease - a silent
// failure mode worth stating.
//
// **THE 2018 AND 1984 INDICES ARE NOT INTERCONVERTIBLE.** Karyorrhexis was SEPARATED from fibrinoid
// necrosis and MERGED with neutrophil infiltration (the original's "leukocyte exudation"), so one original
// component was split and re-glued to another. The 2018 revision also ABOLISHED the A / A-C / C subscripts
// on classes III and IV: a report reading "Class IV-G (A/C)" is on the superseded 2003 scheme, and these
// indices are what replaced it.

import * as L from '../../lib/lupus-nephritis-indices-v565.js';

export default [
  {
    id: 'lupus-nephritis-indices',
    summary: `The MODIFIED NIH ACTIVITY AND CHRONICITY INDICES for lupus nephritis, from the 2018 ISN/RPS revision (Bajema and colleagues, Kidney Int 2018). These were introduced specifically TO REPLACE the A, A/C and C subscripts that the 2003 scheme appended to classes III and IV - a report reading "Class IV-G (A/C)" is using the SUPERSEDED scheme. TWO SEPARATE INDICES THAT ARE NEVER ADDED TOGETHER: the ACTIVITY index runs 0 to ${L.ACTIVITY_MAX} and the CHRONICITY index 0 to ${L.CHRONICITY_MAX}. They measure OPPOSITE things - what may still respond to treatment against what is already scarred - so a combined figure is meaningless, and this tool returns them as separate fields and never emits a sum. ACTIVITY INDEX components, each 0-3: endocapillary hypercellularity (x1); neutrophils and/or karyorrhexis (x1); FIBRINOID NECROSIS (x2); hyaline deposits, meaning wire loops and/or hyaline thrombi (x1); CELLULAR AND/OR FIBROCELLULAR CRESCENTS (x2); interstitial inflammation (x1). ONLY THOSE TWO COMPONENTS ARE WEIGHTED, AND ONLY IN THE ACTIVITY INDEX: six components each scored 0 to 3 would cap at 18, and the published maximum of ${L.ACTIVITY_MAX} comes entirely from the two doubled terms. CHRONICITY INDEX components, each 0-3 and ALL UNWEIGHTED: total glomerulosclerosis (GLOBAL AND SEGMENTAL, not global alone - a secondary source writing "global glomerulosclerosis" would omit segmental lesions and undercount chronicity); fibrous crescents; tubular atrophy; interstitial fibrosis. TWO DIFFERENT 0-3 RUBRICS COEXIST INSIDE THE SAME TOTAL AND ARE INCOMMENSURABLE: GLOMERULAR components are scored by the PERCENTAGE OF GLOMERULI affected (1 = under 25 percent, 2 = 25 to 50 percent, 3 = over 50 percent), while interstitial inflammation, tubular atrophy and interstitial fibrosis are scored MILD, MODERATE or SEVERE. The numeric range is identical and the meaning is not, so applying a percentage rubric to interstitial fibrosis answers a different question. THE DENOMINATOR IS THE GLOMERULI THE BIOPSY CORE ACTUALLY CAPTURED, so an INADEQUATE BIOPSY CAN ONLY LOWER the glomerular scores, and a low activity index on a core with few glomeruli may reflect SAMPLING rather than disease. THE 2018 AND 1984 INDICES ARE NOT INTERCONVERTIBLE: karyorrhexis was SEPARATED from fibrinoid necrosis and MERGED with neutrophil infiltration, which the original scored as leukocyte exudation, so one original component was split and re-glued to another and a score copied from an older report is not comparable. These are HISTOLOGIC indices scored by a renal pathologist on a biopsy. They do NOT diagnose lupus or lupus nephritis, do NOT assign the ISN/RPS class, which is a separate classification this does not compute, and do NOT measure kidney function, so they say nothing about proteinuria or the estimated glomerular filtration rate. They are not by themselves an indication to start, escalate or withdraw immunosuppression, and a HIGH CHRONICITY INDEX IN PARTICULAR IS NOT A REASON TO WITHHOLD TREATMENT, since activity and chronicity coexist and the activity is what may still respond.`,
    compute: L.lupusNephritisIndices,
    fields: [...L.ACTIVITY_COMPONENTS, ...L.CHRONICITY_COMPONENTS].map((c) => ({
      dom: `lni-${c.key}`, arg: c.key, kind: 'enum',
      values: L.rubricFor(c).map((r) => String(r.value)), required: true,
      label: `${L.ACTIVITY_COMPONENTS.includes(c) ? 'ACTIVITY' : 'CHRONICITY'} index. ${c.text}. Weight x${c.weight}. Rubric: ${L.rubricFor(c).map((r) => `${r.value} = ${r.text}`).join('; ')}`,
    })),
  },
];
