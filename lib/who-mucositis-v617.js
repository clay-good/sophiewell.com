// spec-v617: the WHO oral mucositis (oral toxicity) scale. A WHOLE-CONCEPT gap - "mucositis" and
// "stomatitis" were both zero-hit across app.js, and every slug spelling returned 0.
//
// **THE SCALE CONFLATES TWO DIFFERENT AXES IN ONE ORDINAL GRADE.** Grades 0 to 2 are driven by what the
// mucosa LOOKS LIKE - soreness and erythema, then ulcers. Grades 2 to 4 are driven by what the patient CAN
// EAT - solids, then liquids only, then nothing. Grade 2 is the hinge where the axis changes.
//
// **ABOVE GRADE 2 THE APPEARANCE STOPS MATTERING ENTIRELY.** Grades 3 and 4 are separated purely by diet.
// This lib returns `appearanceIgnored` for those grades, because it is the single most consequential property
// of the scale and it is invisible in the grade number.
//
// **SO EXTENSIVE ULCERATION DOES NOT RAISE THE GRADE PAST 2 IF THE PATIENT CAN STILL EAT SOLIDS.** The extent
// of ulceration is not scored at all - only its presence. A mouth that looks far worse than another can carry
// the same grade, and a mouth that looks better can carry a higher one. This is not an anatomic severity
// measure.
//
// **GRADE 4 IS A FEEDING FINDING, NOT A MUCOSAL ONE**: "oral alimentation is not possible".
//
// **THE DEFINITIONS SAY WHAT THE PATIENT CAN TOLERATE, NOT WHY.** Nothing in the grade wording requires the
// eating limitation to be attributable to the mucositis, so a high grade does not by itself establish that
// the mucosa is the cause. This lib flags `intakeUnexplainedByMucosa` when intake is limited while the mucosa
// is recorded as normal - it still returns the grade the scale specifies, because the scale is the source,
// but it does not let the combination pass silently.
//
// **IT WAS BUILT FOR REPORTING, NOT FOR BEDSIDE MANAGEMENT.** It comes from the 1979 WHO handbook and exists
// to standardize the reporting of cancer-treatment complications, so its purpose is comparability across
// trials.
//
// HIGH-STAKES: this grades a toxicity for reporting. It does NOT diagnose mucositis or its cause, does NOT
// measure pain, does NOT decide analgesia, oral care, feeding-tube placement or parenteral nutrition, and
// does NOT decide whether to modify or interrupt cancer treatment (spec-v11 section 5.3).
//
// GRADES RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97). Both sources give the same five grades
// with the same wording, including ulcers first appearing at grade 2 and the solids/liquids/nothing ladder
// above it:
//   - World Health Organization. WHO Handbook for Reporting Results of Cancer Treatment. Geneva: WHO; 1979.

export const APPEARANCE = [
  { value: 'normal', rank: 0, text: 'Normal mucosa - no mucositis' },
  { value: 'soreness-erythema', rank: 1, text: 'Soreness or erythema only, without ulcers' },
  { value: 'ulcers', rank: 2, text: 'Erythema and ulcers' },
];

export const INTAKE = [
  { value: 'solids', rank: 0, text: 'Able to tolerate solids' },
  { value: 'liquids-only', rank: 1, text: 'Unable to tolerate solids, able to tolerate liquids' },
  { value: 'none', rank: 2, text: 'Unable to tolerate solids or liquids - oral alimentation is not possible' },
];

export const GRADES = [
  { grade: 0, text: 'No mucositis.' },
  { grade: 1, text: 'Soreness or erythema only.' },
  { grade: 2, text: 'Erythema and ulcers, able to tolerate solids.' },
  { grade: 3, text: 'Unable to tolerate solids but able to tolerate liquids.' },
  { grade: 4, text: 'Unable to tolerate solids or liquids. Oral alimentation is not possible.' },
];

export const TWO_AXIS_NOTE = 'THE SCALE CONFLATES TWO DIFFERENT AXES IN ONE ORDINAL GRADE: grades 0 to 2 are driven by what the mucosa LOOKS LIKE - soreness and erythema, then ulcers - and grades 2 to 4 are driven by what the patient CAN EAT - solids, then liquids only, then nothing. Grade 2 is the hinge where the axis changes.';
export const APPEARANCE_IGNORED_NOTE = 'ABOVE GRADE 2 THE APPEARANCE STOPS MATTERING ENTIRELY: grades 3 and 4 are separated purely by diet.';
export const EXTENT_NOTE = 'EXTENSIVE ULCERATION DOES NOT RAISE THE GRADE PAST 2 IF THE PATIENT CAN STILL EAT SOLIDS. The EXTENT of ulceration is not scored at all - only its presence. A mouth that looks far worse than another can carry the same grade, and a mouth that looks better can carry a higher one, so this is not an anatomic severity measure.';
export const ATTRIBUTION_NOTE = 'THE DEFINITIONS SAY WHAT THE PATIENT CAN TOLERATE, NOT WHY. Nothing in the grade wording requires the eating limitation to be attributable to the mucositis, so a high grade does not by itself establish that the mucosa is the cause.';
export const PURPOSE_NOTE = 'IT WAS BUILT FOR REPORTING, NOT FOR BEDSIDE MANAGEMENT: it comes from the 1979 WHO handbook and exists to standardize the reporting of cancer-treatment complications, so its purpose is comparability across trials.';

const NOTE = `The WHO oral toxicity scale (WHO Handbook for Reporting Results of Cancer Treatment, 1979) grades oral mucositis from 0 to 4. ${TWO_AXIS_NOTE} ${APPEARANCE_IGNORED_NOTE} ${EXTENT_NOTE} ${ATTRIBUTION_NOTE} ${PURPOSE_NOTE} This grades a toxicity for reporting. It does not diagnose mucositis or its cause, does not measure pain, does not decide analgesia, oral care, feeding-tube placement or parenteral nutrition, and does not decide whether to modify or interrupt cancer treatment.`;

export function gradeText(grade) {
  const row = GRADES.find((g) => g.grade === grade);
  return row ? row.text : null;
}

// input: appearance (an APPEARANCE value) and intake (an INTAKE value).
export function whoMucositis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const appearance = o.appearance ? APPEARANCE.find((a) => a.value === String(o.appearance).trim()) : null;
  const intake = o.intake ? INTAKE.find((i) => i.value === String(o.intake).trim()) : null;
  if (!appearance || !intake) {
    const missing = [];
    if (!appearance) missing.push(`the mucosal appearance (${APPEARANCE.map((a) => a.value).join(', ')})`);
    if (!intake) missing.push(`what the patient can tolerate (${INTAKE.map((i) => i.value).join(', ')})`);
    return { valid: false, message: `Choose ${missing.join(' and ')}. ${TWO_AXIS_NOTE}` };
  }

  let grade;
  if (intake.value === 'none') grade = 4;
  else if (intake.value === 'liquids-only') grade = 3;
  else grade = appearance.rank; // 0, 1 or 2, all with solids tolerated

  const appearanceIgnored = grade >= 3;
  const intakeUnexplainedByMucosa = intake.rank > 0 && appearance.value === 'normal';
  const ulcersNotEscalating = appearance.value === 'ulcers' && intake.value === 'solids';

  const parts = [];
  parts.push(`WHO grade ${grade}. ${gradeText(grade)}`);
  if (appearanceIgnored) {
    parts.push(`The mucosal appearance did not affect this grade. ${APPEARANCE_IGNORED_NOTE}`);
  }
  if (ulcersNotEscalating) {
    parts.push(`Ulcers are present and the grade is still 2, because solids are tolerated. ${EXTENT_NOTE}`);
  }
  if (intakeUnexplainedByMucosa) {
    parts.push(`The mucosa is recorded as normal while oral intake is limited, so the grade rests entirely on the feeding finding. ${ATTRIBUTION_NOTE}`);
  }
  parts.push(TWO_AXIS_NOTE);
  parts.push(EXTENT_NOTE);
  parts.push(PURPOSE_NOTE);
  parts.push('This grades a toxicity for reporting. It does not diagnose mucositis or its cause, does not measure pain, does not decide analgesia, oral care, feeding-tube placement or parenteral nutrition, and does not decide whether to modify or interrupt cancer treatment.');

  return {
    valid: true,
    grade,
    appearance: appearance.value,
    intake: intake.value,
    appearanceIgnored,
    intakeUnexplainedByMucosa,
    ulcersNotEscalating,
    band: `Grade ${grade}`,
    bandLabel: `WHO oral mucositis grade ${grade}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
