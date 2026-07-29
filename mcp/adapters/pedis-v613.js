// spec-v613 MCP wave: adapter for the PEDIS classification and score in lib/pedis-v613.js. The dom keys
// mirror the browser renderer (views/group-v613.js) and META.pedis.example.
//
// **THE GRADE AND THE SCORE ARE OFF BY ONE.** Grades are 1-based (grade 1 = the category is wholly intact);
// the score contribution is GRADE MINUS ONE. NEVER add the grades. Doing so inflates the total by 5 - a
// minimum ulcer reads 5 instead of 0, a maximum one 17 instead of 12. `gradeSum` is returned ONLY so the
// error is visible; it is NOT the score.
//
// **THE FIVE CATEGORIES HAVE DIFFERENT NUMBERS OF GRADES AND ARE NOT EQUALLY WEIGHTED**: extent, depth and
// infection reach 3 points each, perfusion 2, and SENSATION ONLY 1 - even though the neuropathy it measures
// is what defines the diabetic foot.
//
// **PEDIS HAS TWO IDENTITIES**: a research CLASSIFICATION reported as a profile (P1 E3 D2 I2 S2), and a
// summed SCORE added later by a validation study. Both are returned and must be kept separate.
//
// Its prognostic value in ordinary clinical practice is NOT established - it was built for research
// comparability.

import * as P from '../../lib/pedis-v613.js';

export default [
  {
    id: 'pedis',
    summary: `PEDIS (International Working Group on the Diabetic Foot) grades a diabetic foot ulcer on FIVE categories: ${P.CATEGORIES.map((c) => `${c.letter} = ${c.name} [${c.grades.map((g) => `grade ${g.grade} = ${g.text}`).join('; ')}]`).join('. ')}. **${P.OFFSET_NOTE}** NEVER add the grades - \`gradeSum\` is returned ONLY so the error is visible and is NOT the score. **${P.WEIGHT_NOTE}** **${P.SENSATION_NOTE}** **${P.IDENTITY_NOTE}** The profile is reported like "P1 E3 D2 I2 S2" and the score runs ${P.MIN_SCORE} to ${P.MAX_SCORE}; keep them separate. ${P.EXTENT_NOTE} Companion instruments in this catalog have different shapes on purpose: \`sinbad-score\` sums to 0-6 and \`ut-diabetic-foot\` does not sum at all. This DESCRIBES an ulcer for research comparability. It does NOT diagnose infection or peripheral arterial disease - those are the assessments that feed INTO the grades - does NOT decide antibiotics, revascularization or amputation, and its prognostic value in ordinary clinical practice is NOT established.`,
    compute: P.pedis,
    fields: P.CATEGORIES.map((c) => ({
      dom: `pedis-${c.key}`, arg: c.key, kind: 'enum',
      values: c.grades.map((g) => String(g.grade)), required: true,
      label: `${c.name} GRADE (1-based, not the score) [${c.grades.map((g) => `${g.grade} = ${g.text}, scores ${g.grade - 1}`).join('; ')}]. Contributes up to ${c.grades.length - 1} point${c.grades.length - 1 === 1 ? '' : 's'}.`,
    })),
  },
];
