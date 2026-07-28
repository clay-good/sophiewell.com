// spec-v576: the Ablett classification of tetanus severity. "ablett" was zero-hit and
// `grep -c "id: 'ablett-tetanus'" app.js` returned 0.
//
// A COMPANION-AXIS GAP, NOT A DUPLICATE. The catalog's existing `tetanus` tile is the TETANUS PROPHYLAXIS
// DECISION TREE -- wound management and immunization, which is the PREVENTION axis, applied to someone who
// does not have tetanus. Ablett grades the severity of ESTABLISHED DISEASE. The two never apply to the same
// patient at the same moment.
//
// **THIS IS A DESCRIPTOR, NOT A SCORE. THERE ARE NO POINTS, NO SUM AND NO ZERO.** The classification sorts
// a patient into one of four named pictures. Nothing is added, and there is no "grade 0" for a patient
// without tetanus.
//
// **GRADE 4 IS NOT A DISTINCT CLINICAL PICTURE -- IT IS GRADE 3 PLUS A MODIFIER.** The original defines it
// literally as grade 3 WITH severe autonomic instability. So the classification is really THREE severity
// levels and ONE BOOLEAN, which is why published series routinely report "Ablett III/IV" as a single
// stratum. This lib models it that way: the severity picture is chosen from three, and autonomic
// instability is a separate flag that promotes grade 3 to grade 4 and does nothing at grades 1 and 2,
// because the definition attaches it to grade 3 alone.
//
// **THE VITAL-SIGN FIGURES ARE ILLUSTRATIVE OF EACH PICTURE, NOT DECISION THRESHOLDS, AND THEY ARE NOT
// MONOTONE ACROSS THE ROWS.** Grade 2 mentions only a ventilatory frequency above 30. Grade 3 adds a pulse
// above 120 AND raises the ventilatory frequency to above 40. A patient with a respiratory rate of 35 and a
// pulse of 130 satisfies NEITHER row cleanly. Grading is a gestalt judgment over the whole descriptor set,
// so this lib takes the GRADE as the input and never tries to derive it from vital signs -- a tile that
// asked for a respiratory rate and returned a grade would be inventing a threshold test the classification
// does not contain.
//
// **GRADE 1 IS THE ONLY GRADE WITH NO NUMERIC CRITERION AT ALL.** Grades 2 to 4 each carry vital-sign
// figures; grade 1 is purely descriptive. That asymmetry is in the original.
//
// WORDING VARIES BETWEEN REPRODUCTIONS OF THE 1967 ORIGINAL, AND THIS LIB NAMES THE ONE IT QUOTES. Some
// reproductions give grade 1 as "no dysphagia" and others as "little or no dysphagia"; some give "mild
// trismus" and others "mild to moderate trismus". The NUMERIC figures -- ventilatory frequency above 30 and
// above 40, pulse above 120 -- are identical in every source fetched, so these are transcription variants
// rather than a disagreement about the classification (spec-v97).
//
// HIGH-STAKES: this grades an ESTABLISHED disease. It does NOT diagnose tetanus, which is a clinical
// diagnosis -- there is no confirmatory test that rules it in or out, and a negative wound culture means
// nothing. It does not decide airway management, and although grades 3 and 4 conventionally prompt
// intensive care and ventilation, that is a management corollary attached to the grades by practice rather
// than part of the classification, and it is not what this tile outputs. It does not indicate tetanus immune
// globulin, antibiotics, wound debridement, or any sedative or neuromuscular agent, and it says nothing
// about immunization, which the separate prophylaxis tile addresses (spec-v11 section 5.3). The clinical
// decision stays with the clinician.
//
// GRADES AND FIGURES RE-FETCHED, NEVER RECALLED (spec-v97), quoted from a named tabular reproduction and
// checked against an independent reproduction that gives the same grades in prose:
//   - Ablett JJL. Analysis and main experiences in 82 patients treated in the Leeds Tetanus Unit. In:
//     Ellis M, ed. Symposium on Tetanus in Great Britain. Leeds General Infirmary, 1967:1-10.

export const ABLETT_GRADES = [
  {
    grade: 1,
    label: 'Grade 1 (mild)',
    hasNumericCriteria: false,
    text: 'Mild trismus, general spasticity, no respiratory compromise, no spasms, no dysphagia.',
  },
  {
    grade: 2,
    label: 'Grade 2 (moderate)',
    hasNumericCriteria: true,
    text: 'Moderate trismus, rigidity, short spasms, mild dysphagia, moderate respiratory involvement, ventilatory frequency above 30.',
  },
  {
    grade: 3,
    label: 'Grade 3 (severe)',
    hasNumericCriteria: true,
    text: 'Severe trismus, generalized rigidity, prolonged spasms, severe dysphagia, apnoeic spells, pulse above 120, ventilatory frequency above 40.',
  },
];

export const GRADE_4 = {
  grade: 4,
  label: 'Grade 4 (very severe)',
  text: 'Grade 3 with severe autonomic instability involving the cardiovascular system: severe hypertension and tachycardia alternating with relative hypotension and bradycardia, either of which may be persistent.',
};

export const AUTONOMIC_PROMOTES_FROM = 3;

const DESCRIPTOR_TEXT = 'This is a descriptor, not a score: there are no points, no sum, and no grade 0.';

const GRADE_4_STRUCTURE = `Grade 4 is not a separate clinical picture. It is defined literally as grade ${AUTONOMIC_PROMOTES_FROM} WITH severe autonomic instability, so the classification is three severity levels and one boolean, which is why published series often report grades 3 and 4 together as one stratum.`;

const NOT_THRESHOLDS = 'The vital-sign figures illustrate each picture rather than acting as decision thresholds, and they are not monotone across the rows: grade 2 mentions only a ventilatory frequency above 30, while grade 3 adds a pulse above 120 and raises the frequency to above 40. A patient with a respiratory rate of 35 and a pulse of 130 satisfies neither row cleanly, so grading is a gestalt judgment over the whole descriptor set rather than a threshold test.';

const AUTONOMIC_AT_LOW_GRADE = `Severe autonomic instability was recorded, but the severity picture is not grade ${AUTONOMIC_PROMOTES_FROM}. The original defines grade 4 as grade ${AUTONOMIC_PROMOTES_FROM} WITH autonomic instability, so it does not promote a lower grade, and the grade is reported as chosen. Autonomic instability at a lower grade is worth noting clinically and is reported alongside.`;

const WORDING_NOTE = 'Reproductions of the 1967 original differ slightly in wording, some giving grade 1 as "no dysphagia" and others "little or no dysphagia", some "mild trismus" and others "mild to moderate trismus". The numeric figures are identical in every source, so these are transcription variants rather than a disagreement about the classification. The wording quoted here follows one named tabular reproduction.';

const NOTE = 'The Ablett classification (Ablett 1967) grades the severity of ESTABLISHED tetanus, and is the companion axis to a tetanus prophylaxis decision tree, which concerns prevention in someone who does not have the disease. It is a descriptor rather than a score: there are no points, no sum and no grade 0. Grade 1 is mild trismus, general spasticity, no respiratory compromise, no spasms and no dysphagia. Grade 2 is moderate trismus, rigidity, short spasms, mild dysphagia, moderate respiratory involvement and a ventilatory frequency above 30. Grade 3 is severe trismus, generalized rigidity, prolonged spasms, severe dysphagia, apnoeic spells, a pulse above 120 and a ventilatory frequency above 40. Grade 4 is grade 3 with severe autonomic instability involving the cardiovascular system, meaning severe hypertension and tachycardia alternating with relative hypotension and bradycardia, either of which may be persistent. Grade 4 is therefore not a separate clinical picture but grade 3 plus a modifier, so the classification is really three severity levels and one boolean, which is why published series often report grades 3 and 4 as a single stratum. The vital-sign figures illustrate each picture rather than acting as decision thresholds, and they are not monotone across the rows, since grade 2 mentions only a ventilatory frequency above 30 while grade 3 adds a pulse above 120 and raises the frequency to above 40; a patient with a respiratory rate of 35 and a pulse of 130 satisfies neither row cleanly, so grading is a gestalt judgment over the whole descriptor set. Grade 1 is the only grade with no numeric criterion at all. Reproductions of the original differ slightly in wording while agreeing on every number, so those are transcription variants rather than a disagreement. This grades an established disease. It does not diagnose tetanus, which is a clinical diagnosis with no confirmatory test that rules it in or out, and a negative wound culture means nothing. It does not decide airway management, and although grades 3 and 4 conventionally prompt intensive care and ventilation, that is a management corollary attached by practice rather than part of the classification. It does not indicate tetanus immune globulin, antibiotics, wound debridement, or any sedative or neuromuscular agent, and it says nothing about immunization.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input:
//   severityPicture -- 1, 2 or 3. The gestalt grade, NOT derived from vital signs.
//   autonomicInstability -- yes/no. Promotes grade 3 to grade 4, and only grade 3.
export function ablettTetanus(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rawGrade = o.severityPicture;
  if (rawGrade === '' || rawGrade === null || rawGrade === undefined) {
    return { valid: false, message: `Choose the severity picture: 1, 2 or 3. Grade 4 is not chosen directly, because it is defined as grade ${AUTONOMIC_PROMOTES_FROM} WITH severe autonomic instability. ${NOT_THRESHOLDS}` };
  }
  const n = Number(String(rawGrade).trim());
  const picture = ABLETT_GRADES.find((g) => g.grade === n);
  if (!picture) {
    return { valid: false, message: `The severity picture must be 1, 2 or 3. Grade 4 arises only from grade ${AUTONOMIC_PROMOTES_FROM} plus autonomic instability and is not selected directly.` };
  }

  const autonomic = readBool(o.autonomicInstability);
  if (autonomic === null) {
    return { valid: false, message: 'Say whether there is severe autonomic instability involving the cardiovascular system. It is the modifier that distinguishes grade 4 from grade 3.' };
  }
  if (Number.isNaN(autonomic)) {
    return { valid: false, message: 'The autonomic instability answer must be yes or no.' };
  }

  const promoted = autonomic && picture.grade === AUTONOMIC_PROMOTES_FROM;
  const finalGrade = promoted ? GRADE_4.grade : picture.grade;
  const finalLabel = promoted ? GRADE_4.label : picture.label;
  const finalText = promoted ? GRADE_4.text : picture.text;
  const autonomicAtLowGrade = autonomic && picture.grade < AUTONOMIC_PROMOTES_FROM;

  return {
    valid: true,
    grade: finalGrade,
    gradeLabel: finalLabel,
    severityPicture: picture.grade,
    autonomicInstability: autonomic,
    promotedToGrade4: promoted,
    autonomicAtLowGrade,
    bandLabel: `Ablett ${finalLabel}`,
    bandText: `${finalLabel}. ${finalText} ${DESCRIPTOR_TEXT} ${GRADE_4_STRUCTURE}${autonomicAtLowGrade ? ` ${AUTONOMIC_AT_LOW_GRADE}` : ''} ${NOT_THRESHOLDS} ${WORDING_NOTE} This grades established disease and does not diagnose tetanus, decide airway management, or indicate immune globulin, antibiotics or any drug.`,
    note: NOTE,
  };
}
