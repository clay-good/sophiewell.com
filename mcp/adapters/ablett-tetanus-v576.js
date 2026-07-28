// spec-v576 MCP wave: adapter for the Ablett tetanus classification in lib/ablett-tetanus-v576.js. The dom
// keys mirror the browser renderer (views/group-v576.js) and META['ablett-tetanus'].example.
//
// **A COMPANION AXIS TO THE EXISTING `tetanus` TILE, NOT A DUPLICATE.** That tile is the TETANUS
// PROPHYLAXIS DECISION TREE - wound management and immunization, applied to someone who does NOT have
// tetanus. Ablett grades ESTABLISHED disease. The two never apply to the same patient at the same moment.
//
// **THIS IS A DESCRIPTOR, NOT A SCORE.** No points, no sum, and NO GRADE 0 - there is no "grade 0" for a
// patient without tetanus.
//
// **GRADE 4 IS NOT A DISTINCT PICTURE: IT IS GRADE 3 PLUS A MODIFIER.** The original defines it literally
// as grade 3 WITH severe autonomic instability, so the classification is THREE severity levels and ONE
// BOOLEAN - which is why series report "Ablett III/IV" as one stratum. The tool takes the picture as 1-3
// and the modifier separately, and autonomic instability promotes ONLY grade 3; at grades 1-2 it is
// reported but does not create a grade 4.
//
// **THE VITAL-SIGN FIGURES ARE ILLUSTRATIVE, NOT THRESHOLDS, AND THEY ARE NOT MONOTONE.** Grade 2 mentions
// only ventilatory frequency >30; grade 3 adds pulse >120 AND raises frequency to >40. A patient with RR 35
// and pulse 130 satisfies NEITHER row cleanly. Grading is a GESTALT judgment over the descriptor set, so
// this tool takes the GRADE as input and deliberately accepts NO vital signs - deriving a grade from a
// respiratory rate would invent a threshold test the classification does not contain.
//
// Grade 1 is the only grade with no numeric criterion at all. Wording varies between reproductions of the
// 1967 original ("no" vs "little or no" dysphagia; "mild" vs "mild to moderate" trismus) while every number
// is identical, so those are transcription variants rather than a disagreement.

import * as A from '../../lib/ablett-tetanus-v576.js';

export default [
  {
    id: 'ablett-tetanus',
    summary: `The ABLETT CLASSIFICATION of tetanus severity (Ablett 1967), which grades ESTABLISHED disease. **THIS IS THE COMPANION AXIS TO A TETANUS PROPHYLAXIS DECISION TREE, NOT A DUPLICATE OF ONE**: prophylaxis concerns wound management and immunization in someone who does NOT have tetanus, while this grades someone who does, so the two never apply to the same patient at the same moment. **IT IS A DESCRIPTOR, NOT A SCORE**: no points, no sum, and NO GRADE 0 - there is no grade for a patient without tetanus. GRADE 1 (mild): mild trismus, general spasticity, no respiratory compromise, no spasms, no dysphagia. GRADE 2 (moderate): moderate trismus, rigidity, short spasms, mild dysphagia, moderate respiratory involvement, ventilatory frequency above 30. GRADE 3 (severe): severe trismus, generalized rigidity, prolonged spasms, severe dysphagia, apnoeic spells, pulse above 120, ventilatory frequency above 40. GRADE 4 (very severe): grade 3 with severe autonomic instability involving the cardiovascular system - severe hypertension and tachycardia alternating with relative hypotension and bradycardia, either of which may be persistent. **GRADE 4 IS NOT A DISTINCT CLINICAL PICTURE - IT IS GRADE ${A.AUTONOMIC_PROMOTES_FROM} PLUS A MODIFIER.** The classification is therefore THREE severity levels and ONE BOOLEAN, which is why published series routinely report grades 3 and 4 together as a single stratum. This tool takes the severity picture as 1, 2 or 3 and the autonomic-instability modifier separately; autonomic instability promotes ONLY grade ${A.AUTONOMIC_PROMOTES_FROM}, and at grades 1 or 2 it is reported but does not create a grade 4, because the original attaches it to grade 3 alone. **THE VITAL-SIGN FIGURES ILLUSTRATE EACH PICTURE RATHER THAN ACTING AS DECISION THRESHOLDS, AND THEY ARE NOT MONOTONE ACROSS THE ROWS**: grade 2 mentions only a ventilatory frequency above 30, while grade 3 adds a pulse above 120 AND raises the frequency to above 40, so a patient with a respiratory rate of 35 and a pulse of 130 satisfies NEITHER row cleanly. Grading is a GESTALT judgment over the whole descriptor set, and this tool therefore takes the GRADE as its input and accepts NO vital signs at all - deriving a grade from a respiratory rate would invent a threshold test the classification does not contain. Grade 1 is the only grade with no numeric criterion. Reproductions of the 1967 original differ slightly in wording, some giving grade 1 as "no dysphagia" and others "little or no dysphagia", some "mild trismus" and others "mild to moderate trismus", while every number is identical, so those are transcription variants rather than a disagreement about the classification. This grades ESTABLISHED disease. It does NOT diagnose tetanus, which is a CLINICAL diagnosis with no confirmatory test that rules it in or out - a negative wound culture means nothing. It does NOT decide airway management: although grades 3 and 4 conventionally prompt intensive care and ventilation, that is a management corollary attached by practice rather than part of the classification. It does not indicate tetanus immune globulin, antibiotics, wound debridement, or any sedative or neuromuscular agent, and it says nothing about immunization.`,
    compute: A.ablettTetanus,
    fields: [
      {
        dom: 'ablett-picture', arg: 'severityPicture', kind: 'enum',
        values: A.ABLETT_GRADES.map((g) => String(g.grade)), required: true,
        label: `The severity PICTURE, chosen as a gestalt judgment over the whole descriptor set. ONLY 1, 2 or 3 - grade 4 is not selected directly, because it is grade ${A.AUTONOMIC_PROMOTES_FROM} plus autonomic instability [${A.ABLETT_GRADES.map((g) => `${g.grade} = ${g.text}`).join(' ')}]`,
      },
      {
        dom: 'ablett-autonomic', arg: 'autonomicInstability', kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Severe autonomic instability involving the cardiovascular system. This is the modifier that makes grade ${A.AUTONOMIC_PROMOTES_FROM} into grade 4. It promotes ONLY grade ${A.AUTONOMIC_PROMOTES_FROM}; at grades 1 and 2 it is reported but does not create a grade 4.`,
      },
    ],
  },
];
