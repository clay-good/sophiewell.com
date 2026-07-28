// spec-v557 MCP wave: adapter for the modified Severity-Weighted Assessment Tool in lib/mswat-v557.js. The
// dom keys mirror the browser renderer (views/group-v557.js) and META['mswat'].example.
//
// **THE SCORE RUNS 0 TO 400, NOT 0 TO 100.** Every input is a percentage of body surface area, so the
// output looks like it should be one too. It is not: 100 percent of the body covered in tumor scores 4 x
// 100 = 400. An agent that caps its expectation at 100 will call an ordinary score of 180 impossible, or
// will report it as "180 percent of body surface area", which is a different and false claim.
//
// **THE THREE CATEGORIES ARE MUTUALLY EXCLUSIVE PER UNIT OF SKIN.** Each square centimetre is counted ONCE,
// as one category only, so the three percentages sum to at most 100. They are NOT three independent
// measurements of the same skin, and three fields each accepting 0-100 invite exactly that error. The tool
// enforces the ceiling.
//
// **THE TUMOR WEIGHT IS 4 IN mSWAT AND WAS 3 IN THE ORIGINAL SWAT.** That is what the "m" modifies. A score
// quoted from older work without its version is not comparable, so both weights are exposed.
//
// **THE TWO FORMS USE DIFFERENT LESION VOCABULARIES FOR IDENTICAL ARITHMETIC.** Erythrodermic patients are
// scored as patch / plaque / tumor; nonerythrodermic patients as mild infiltration / moderate infiltration /
// tumor. Weights 1, 2 and 4 either way. `mswat-erythrodermic` is required because it selects which question
// is actually being asked, even though it does not change the sum.
//
// **THERE ARE NO SEVERITY BANDS AND THE TOOL INVENTS NONE.** mSWAT is a continuous burden measure. Its
// published threshold is a CHANGE from the same patient's baseline - a reduction of 50 percent or more is a
// partial skin response - which belongs to a comparison of two scores, not to one score. An agent asked "is
// an mSWAT of 60 severe?" should answer that the instrument publishes no such categories.

import * as M from '../../lib/mswat-v557.js';

export default [
  {
    id: 'mswat',
    summary: `The modified Severity-Weighted Assessment Tool (mSWAT; Olsen and colleagues, J Clin Oncol 2011), which measures SKIN TUMOR BURDEN in mycosis fungoides and Sezary syndrome. It multiplies the percentage of body surface area involved by each lesion type by that type's weight and sums the products: weight 1, weight 2, and weight ${M.MSWAT_TUMOR_WEIGHT} for tumors or ulcers. THE SCORE RUNS 0 TO ${M.MSWAT_MAX}, NOT 0 TO 100. Every input is a percentage of body surface area, so the output looks like it should be one too - it is not, because a body wholly covered in tumor scores 4 times 100. A score above 100 is ordinary rather than impossible, and it must never be reported as a percentage of body surface area. THE THREE CATEGORIES ARE MUTUALLY EXCLUSIVE PER UNIT OF SKIN: each square centimetre is counted ONCE, in one category only, so the three percentages together cannot exceed 100. They are NOT three independent measurements of the same skin, and the tool refuses totals above 100. THE TUMOR WEIGHT IS ${M.MSWAT_TUMOR_WEIGHT} IN mSWAT AND WAS ${M.SWAT_ORIGINAL_TUMOR_WEIGHT} IN THE ORIGINAL SWAT - that is what the modification refers to - so a score quoted from older work without its version is not comparable. THE ERYTHRODERMIC AND NONERYTHRODERMIC FORMS USE DIFFERENT LESION VOCABULARIES FOR IDENTICAL ARITHMETIC: erythrodermic patients are scored as patch, plaque and tumor, while nonerythrodermic patients are scored as mild infiltration, moderate infiltration and tumor, with the same weights of 1, 2 and 4. The erythrodermic argument is required because it selects which question is being asked, even though it does not change the sum. Area is measured with the PATIENT'S OWN palm plus fingers taken as 1 percent of body surface area, so the unit is patient-relative rather than absolute; some protocols additionally use the palm without fingers as 0.5 percent. THERE ARE NO PUBLISHED SEVERITY BANDS AND NONE IS INVENTED HERE. mSWAT is a continuous burden measure, and its published threshold is a CHANGE from the same patient's own baseline: a reduction of ${M.PARTIAL_SKIN_RESPONSE_REDUCTION} percent or more is a partial skin response. That belongs to a comparison between two scores, not to a single score, so asked whether some particular mSWAT is "severe", the correct answer is that the instrument publishes no such categories. This measures SKIN BURDEN ONLY. It does NOT stage mycosis fungoides or Sezary syndrome, which is a TNMB classification requiring assessment of nodes, viscera and BLOOD - and Sezary syndrome is defined by blood involvement this instrument cannot see at all, so a patient with limited skin disease and a high blood tumor burden scores LOW while having ADVANCED disease. It does not diagnose cutaneous lymphoma, which requires biopsy with clonality studies, and does not distinguish it from the inflammatory dermatoses it can mimic for years. It does not detect large-cell transformation, does not select therapy, and is not a response assessment on its own, because global response combines skin with the other compartments.`,
    compute: M.mswat,
    fields: [
      {
        dom: 'mswat-erythrodermic', arg: 'erythrodermic', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Whether the patient is erythrodermic. REQUIRED: it selects the lesion vocabulary (patch and plaque versus mild and moderate infiltration), though the weights and the arithmetic are identical either way.',
      },
      ...M.MSWAT_CATEGORIES.map((category) => ({
        dom: `mswat-${category.key}`, arg: category.key, kind: 'number', unit: '% BSA', required: false,
        label: `Percent body surface area of "${category.erythrodermic}" (erythrodermic) / "${category.nonerythrodermic}" (nonerythrodermic). WEIGHT ${category.weight}. Counted once per square centimetre: the three categories are mutually exclusive and together cannot exceed 100 percent.`,
      })),
    ],
  },
];
