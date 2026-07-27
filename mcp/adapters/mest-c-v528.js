// spec-v528 MCP wave: adapter for the Oxford MEST-C classification in lib/mest-c-v528.js. The dom keys
// mirror the browser renderer (views/group-v528.js) and META['mest-c'].example: mest-M .. mest-C map to the
// lib args M, E, S, T, C.
//
// THE RESULT IS A CODE, AND THE SUMMARY SAYS SO TWICE, because an agent handed five small integers will
// reach for a total almost by reflex. MEST-C is reported as its five scores side by side and is NOT summed;
// the summed 0-7 grading with grades I to III is a research proposal, not the standard biopsy report. The
// compute function returns `code` and a per-lesion breakdown and deliberately exposes no total field, so
// there is nothing for a caller to add up even if it tried.
//
// THE ENUM VALUES ARE THE FULL LESION LABELS ('M0','M1','T2'), NOT BARE INTEGERS. That is deliberate: a bare
// 0/1/2 vocabulary shared across five fields would let a caller send a T-level to the M field and have it
// silently accepted, and "1" means different things on M (binary) and T (0-2). Prefixed values make a
// misrouted score a validation error rather than a wrong answer, and the lib rejects it by name.
//
// The field labels carry each lesion's DENOMINATOR, because T is a share of CORTICAL AREA and C a share of
// GLOMERULI - an agent that swapped them would produce a plausible, wrong code. The M label states that the
// threshold is the mesangial hypercellularity SCORE above 0.5, not a percentage of glomeruli, since sources
// rendering M as a percentage disagree with each other at exactly 50 percent.

import * as X from '../../lib/mest-c-v528.js';

export default [
  {
    id: 'mest-c',
    summary: 'The Oxford classification (MEST-C) of an IgA nephropathy biopsy. Five lesions are scored: M mesangial hypercellularity, M0 at a mesangial hypercellularity score of 0.5 or below and M1 above 0.5; E endocapillary hypercellularity, E0 absent and E1 present in any glomerulus; S segmental glomerulosclerosis, S0 absent and S1 present; T tubular atrophy and interstitial fibrosis as a share of cortical area, T0 for 0 to 25 percent, T1 for 26 to 50 percent and T2 above 50 percent; and C cellular or fibrocellular crescents as a share of glomeruli, C0 for none, C1 for above 0 and below 25 percent and C2 for 25 percent or more. THE RESULT IS A CODE, NOT A SCORE: MEST-C is reported as the five lesion scores side by side, for example M1 E0 S1 T1 C0, and is not summed. Summed total Oxford scores running 0 to 7, with grades I to III, exist only as a research proposal and are not the standard biopsy report, so no total is produced and none should be computed from these five values: adding five independent lesions that carry different implications would flatten information rather than add it. Note that T and C use different denominators, cortical area and glomeruli respectively. This describes a biopsy. It does not diagnose IgA nephropathy, which requires mesangial IgA deposition on immunofluorescence rather than any of these five light-microscopy lesions. It is not a treatment algorithm: management turns on proteinuria, blood pressure, and the eGFR trajectory alongside the histology, and the decision to use immunosuppression is not read off a letter code. The lesions are scored on the tissue sampled, so a biopsy with few glomeruli can miss focal findings.',
    compute: X.mestC,
    fields: X.MEST_C_LESIONS.map((lesion) => ({
      dom: `mest-${lesion.key}`,
      arg: lesion.key,
      kind: 'enum',
      values: lesion.options.map((o) => o.value),
      required: true,
      label: `${lesion.key} - ${lesion.name}. ${lesion.detail} [${lesion.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
