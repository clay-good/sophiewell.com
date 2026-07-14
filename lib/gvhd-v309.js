// spec-v309: Acute graft-versus-host disease (GVHD) grade — the modified
// Glucksberg overall grade from the skin, liver, and gastrointestinal organ
// stages (a catalog gap surfaced by the SESSION-40 final probe; used constantly on
// allogeneic-transplant / cellular-therapy units, in the same cluster as the
// CRS/ICANS tiles). Given the three organ stages (0-4 each) the tile reports the
// overall acute GVHD grade (0-IV).
//
// This reports the classification's own grade, NOT a treatment order
// (spec-v11 §5.3) — staging (skin by BSA, liver by bilirubin, gut by stool volume)
// and management (steroids, etc.) stay with the transplant team.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against
// two independent sources that agree on the organ staging and the modified
// Glucksberg overall-grade grouping:
//   - Przepiorka D, Weisdorf D, Martin P, et al. 1994 Consensus Conference on
//     Acute GVHD Grading. Bone Marrow Transplant. 1995;15(6):825-828 (modified
//     Glucksberg).
//   - StatPearls (Graft Versus Host Disease, NBK538235), which reproduces the same
//     staging and overall grades.
// Other systems (MAGIC/Mount Sinai 2016, IBMTR) stage similarly with minor
// wording differences; this tile uses the modified Glucksberg overall grade.

const ROMAN = { 0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
const STAGE_KEYS = { skin: 'skinStage', liver: 'liverStage', gi: 'giStage' };

function parseStage(raw, label) {
  const n = Number(typeof raw === 'string' ? raw.trim() : raw);
  if (!Number.isInteger(n) || n < 0 || n > 4) {
    throw new RangeError(`${label} stage must be a whole number from 0 to 4.`);
  }
  return n;
}

const NOTE = 'Acute GVHD overall grade (modified Glucksberg; Przepiorka 1995 consensus). Organ staging: skin by body-surface-area rash (stage 1 <25%, 2 = 25-50%, 3 = generalized erythroderma, 4 = bullae/desquamation); liver by bilirubin (1 = 2-3, 2 = 3-6, 3 = 6-15, 4 = >15 mg/dL); lower GI by diarrhea volume (1 >500, 2 >1000, 3 >1500, 4 >2000 mL/day or severe pain/ileus). Overall grade: IV if any organ is stage 4; III if liver or gut is stage 2-3; II if skin is stage 3 or liver/gut is stage 1; I if skin is stage 1-2 with no liver/gut involvement. Grades III-IV are severe. Other systems (MAGIC 2016, IBMTR) grade similarly with minor differences. This reports the classification grade, not a treatment order, which stays with the transplant team.';

// input.skinStage / liverStage / giStage: 0-4 each. Returns the modified Glucksberg
// overall acute GVHD grade (0-4) and the severe (grade III-IV) flag.
export function gvhdGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const skin = parseStage(o[STAGE_KEYS.skin] ?? 0, 'Skin');
  const liver = parseStage(o[STAGE_KEYS.liver] ?? 0, 'Liver');
  const gi = parseStage(o[STAGE_KEYS.gi] ?? 0, 'GI');

  let grade;
  if (skin === 4 || liver === 4 || gi === 4) grade = 4;
  else if (liver >= 2 || gi >= 2) grade = 3;
  else if (skin === 3 || liver === 1 || gi === 1) grade = 2;
  else if (skin >= 1) grade = 1;
  else grade = 0;

  const severe = grade >= 3;
  const label = grade === 0 ? 'No acute GVHD' : `Acute GVHD grade ${ROMAN[grade]}`;

  let band;
  if (grade === 0) {
    band = 'No acute GVHD (all organ stages 0).';
  } else {
    band = `${label} (modified Glucksberg) from skin stage ${skin}, liver stage ${liver}, GI stage ${gi}.`;
  }
  if (severe) band += ' Severe (grade III-IV).';

  return {
    valid: true,
    grade,
    gradeRoman: ROMAN[grade],
    skinStage: skin,
    liverStage: liver,
    giStage: gi,
    severe,
    abnormal: severe,
    hasGvhd: grade >= 1,
    bandLabel: label,
    band,
    note: NOTE,
  };
}
