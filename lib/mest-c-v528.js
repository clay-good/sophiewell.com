// spec-v528: the Oxford classification (MEST-C) of IgA nephropathy. Zero-hit before this tile: "mest",
// "mesangial", "endocapillary", and "berger" across corpus.json, app.js, and lib/meta.js. The four
// non-zero probe tokens were all read in context and belong elsewhere: "iga" is a myeloma isotype VALUE,
// "haas" is a Banff co-author, "oxford" is the OASIS severity score and a journal name, and "nephropathy"
// is the Mehran contrast-nephropathy tile.
//
// A DIFFERENT AXIS FROM THE EXISTING kfre TILE, which estimates the risk of kidney failure from serum and
// urine measures. MEST-C grades what the BIOPSY shows in one specific glomerulonephritis. A serum-based
// progression estimate and a histologic grading are different quantities, the same way the catalog already
// carries both non-invasive liver-fibrosis estimates and the histologic METAVIR stage.
//
// **THIS TILE RETURNS A CODE, NOT A SCORE, AND THAT IS THE POINT.** MEST-C is reported as its five
// individual lesion scores side by side -- M1 E0 S1 T1 C0 -- and is NOT summed. Summed "total Oxford scores"
// running 0-7, with O-grades I/II/III, exist only as a research grading proposal and are not the standard
// biopsy report. A calculator that added the five up would be inventing a report format that pathologists do
// not issue, and would flatten five independent lesions, which carry different implications and are acted on
// differently, into one number that means nothing on its own. So this tile emits the code, reports each
// lesion separately with its definition, and explicitly refuses to produce a total.
//
// THE FIVE LESIONS:
//   M  mesangial hypercellularity   M0 mesangial score at or below 0.5 / M1 above 0.5
//   E  endocapillary hypercellularity  E0 absent / E1 present in any glomerulus
//   S  segmental glomerulosclerosis    S0 absent / S1 present
//   T  tubular atrophy and interstitial fibrosis, as a share of cortical area
//                                      T0 0-25% / T1 26-50% / T2 above 50%
//   C  cellular or fibrocellular crescents, as a share of glomeruli
//                                      C0 none / C1 above 0 and below 25% / C2 25% or more
//
// THE M THRESHOLD IS DELIBERATELY THE MESANGIAL SCORE, NOT A PERCENTAGE OF GLOMERULI. Sources reproducing
// the M definition as "more than 50% of glomeruli" disagree with each other about whether the boundary is
// strictly above 50% or at-or-above 50%. The underlying mesangial hypercellularity score threshold -- above
// 0.5 -- is unambiguous and consistent across sources, so that is what this tile asks for and what its copy
// states. Asking a pathologist for the score they already computed is also closer to how the biopsy is read
// than asking them to re-derive a percentage.
//
// HIGH-STAKES: MEST-C describes a biopsy. It does not diagnose IgA nephropathy, which requires mesangial IgA
// deposition on immunofluorescence rather than any of these five light-microscopy lesions. It is not a
// treatment algorithm: management turns on proteinuria, blood pressure, and the eGFR trajectory alongside
// the histology, and the decision to use immunosuppression in particular is not read off a letter code
// (spec-v11 section 5.3). The lesions are also scored on the tissue sampled, so a biopsy with few glomeruli
// can miss focal findings, and C in particular can only be scored on what was sampled. The management
// decision stays with the clinician.
//
// LESION DEFINITIONS AND CUT POINTS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// sources agreeing on every threshold:
//   - Working Group of the International IgA Nephropathy Network and the Renal Pathology Society;
//     Cattran DC, Coppo R, Cook HT, et al. The Oxford classification of IgA nephropathy: rationale,
//     clinicopathological correlations, and classification. Kidney Int. 2009;76(5):534-545.
//   - Trimarchi H, Barratt J, Cattran DC, et al. Oxford Classification of IgA nephropathy 2016: an update
//     from the IgA Nephropathy Classification Working Group. Kidney Int. 2017;91(5):1014-1021, which added
//     the C lesion.

export const MEST_C_LESIONS = [
  {
    key: 'M',
    name: 'Mesangial hypercellularity',
    options: [
      { value: 'M0', text: 'M0 — mesangial hypercellularity score at or below 0.5' },
      { value: 'M1', text: 'M1 — mesangial hypercellularity score above 0.5' },
    ],
    detail: 'Scored from the mesangial hypercellularity score, not from a percentage of glomeruli: sources reproducing it as a percentage disagree about the boundary at exactly 50 percent, while the score threshold of 0.5 is consistent.',
  },
  {
    key: 'E',
    name: 'Endocapillary hypercellularity',
    options: [
      { value: 'E0', text: 'E0 — absent' },
      { value: 'E1', text: 'E1 — present in any glomerulus' },
    ],
    detail: 'Present in any glomerulus is enough for E1.',
  },
  {
    key: 'S',
    name: 'Segmental glomerulosclerosis',
    options: [
      { value: 'S0', text: 'S0 — absent' },
      { value: 'S1', text: 'S1 — present' },
    ],
    detail: 'Any segmental sclerosis or adhesion.',
  },
  {
    key: 'T',
    name: 'Tubular atrophy and interstitial fibrosis',
    options: [
      { value: 'T0', text: 'T0 — 0 to 25 percent of cortical area' },
      { value: 'T1', text: 'T1 — 26 to 50 percent of cortical area' },
      { value: 'T2', text: 'T2 — above 50 percent of cortical area' },
    ],
    detail: 'Estimated as a share of the cortical area, not of glomeruli.',
  },
  {
    key: 'C',
    name: 'Cellular or fibrocellular crescents',
    options: [
      { value: 'C0', text: 'C0 — no crescents' },
      { value: 'C1', text: 'C1 — crescents in above 0 and below 25 percent of glomeruli' },
      { value: 'C2', text: 'C2 — crescents in 25 percent or more of glomeruli' },
    ],
    detail: 'Added by the 2016 update. Scored on the glomeruli sampled, so a biopsy with few glomeruli can miss focal crescents.',
  },
];

const NOTE = 'The Oxford classification (MEST-C) grades five lesions on an IgA nephropathy biopsy: mesangial hypercellularity M0 or M1 at a mesangial score of 0.5, endocapillary hypercellularity E0 or E1, segmental glomerulosclerosis S0 or S1, tubular atrophy and interstitial fibrosis T0 for 0 to 25 percent of cortical area, T1 for 26 to 50 percent and T2 above 50 percent, and cellular or fibrocellular crescents C0 for none, C1 for above 0 and below 25 percent of glomeruli and C2 for 25 percent or more. It is reported as the five scores side by side and is not summed. Summed total Oxford scores running 0 to 7, with grades I to III, exist only as a research proposal and are not the standard biopsy report, so no total is produced here: adding five independent lesions that carry different implications into one number would flatten information rather than add it. The M threshold is deliberately taken from the mesangial hypercellularity score rather than from a percentage of glomeruli, because sources reproducing the percentage form disagree about the boundary at exactly 50 percent while the score threshold of 0.5 is consistent. This describes a biopsy. It does not diagnose IgA nephropathy, which requires mesangial IgA deposition on immunofluorescence rather than any of these five light-microscopy lesions. It is not a treatment algorithm: management turns on proteinuria, blood pressure, and the eGFR trajectory alongside the histology, and the decision to use immunosuppression is not read off a letter code. The lesions are scored on the tissue sampled, so a biopsy with few glomeruli can miss focal findings.';

// input: M, E, S, T, C -- each set to one of that lesion's option values (case-insensitive).
export function mestC(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const picked = MEST_C_LESIONS.map((lesion) => {
    const raw = o[lesion.key];
    if (raw === '' || raw === null || raw === undefined) return { lesion, option: null };
    const key = String(raw).trim().toUpperCase();
    const option = lesion.options.find((opt) => opt.value.toUpperCase() === key);
    return { lesion, option: option || undefined };
  });

  const missing = picked.filter((p) => p.option === null);
  if (missing.length) {
    return { valid: false, message: `Score every lesion. Still needed: ${missing.map((p) => `${p.lesion.key} (${p.lesion.name})`).join(', ')}.` };
  }
  const bad = picked.filter((p) => p.option === undefined);
  if (bad.length) {
    return {
      valid: false,
      message: `Unrecognized score for: ${bad.map((p) => `${p.lesion.key} (expected ${p.lesion.options.map((x) => x.value).join(' or ')})`).join('; ')}.`,
    };
  }

  const code = picked.map((p) => p.option.value).join(' ');
  const lesions = picked.map((p) => ({
    key: p.lesion.key,
    name: p.lesion.name,
    score: p.option.value,
    text: p.option.text,
  }));

  return {
    valid: true,
    code,
    lesions,
    bandLabel: `MEST-C ${code}`,
    band: `${code}. Reported as five separate lesion scores, not as a total: the Oxford classification is not summed, and the summed 0 to 7 grading is a research proposal rather than the standard biopsy report. This describes the biopsy and is not a diagnosis of IgA nephropathy or a treatment plan.`,
    note: NOTE,
  };
}
