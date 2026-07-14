// spec-v301: Diabetic retinopathy severity — the International Clinical Diabetic
// Retinopathy (ICDR) disease severity scale (a catalog gap surfaced by the
// SESSION-40 fresh-domain search sweep). Given the dilated-ophthalmoscopy
// findings the tile reports the ICDR grade (1-5) — no apparent retinopathy, mild
// / moderate / severe non-proliferative DR (NPDR), or proliferative DR (PDR) —
// by taking the highest-severity level whose criteria are met.
//
// This reports the classification's own grade, NOT a diagnosis or a treatment /
// follow-up plan (spec-v11 §5.3) — the examination, grading, and management stay
// with the ophthalmologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against
// two independent sources that agree on the five levels and the severe-NPDR
// "4-2-1 rule":
//   - Wilkinson CP, Ferris FL 3rd, Klein RE, et al. Proposed international
//     clinical diabetic retinopathy and diabetic macular edema disease severity
//     scales. Ophthalmology. 2003;110(9):1677-1682 (the ICDR scale).
//   - medicalcriteria.com ICDR reference table, which reproduces the same five
//     levels and the 4-2-1 severe-NPDR criteria verbatim.

// Grades ordered 1..5, most severe last. `name` is the ICDR level.
const GRADES = {
  5: { name: 'Proliferative DR (PDR)', detail: 'Neovascularization and/or vitreous or preretinal hemorrhage.' },
  4: { name: 'Severe NPDR', detail: 'The 4-2-1 rule is met: >20 intraretinal hemorrhages in each of 4 quadrants, or definite venous beading in ≥2 quadrants, or prominent IRMA in ≥1 quadrant, with no signs of PDR.' },
  3: { name: 'Moderate NPDR', detail: 'More than microaneurysms alone but less than severe NPDR.' },
  2: { name: 'Mild NPDR', detail: 'Microaneurysms only.' },
  1: { name: 'No apparent retinopathy', detail: 'No abnormalities.' },
};

const NOTE = 'International Clinical Diabetic Retinopathy (ICDR) severity scale (Wilkinson 2003). The grade is the highest-severity level whose findings are present: proliferative DR (neovascularization or vitreous/preretinal hemorrhage) > severe NPDR (the 4-2-1 rule: >20 intraretinal hemorrhages in each of 4 quadrants, OR venous beading in ≥2 quadrants, OR IRMA in ≥1 quadrant) > moderate NPDR (more than microaneurysms but less than severe) > mild NPDR (microaneurysms only) > no apparent retinopathy. This reports the ICDR grade, not a diagnosis or a follow-up plan; the dilated examination, grading, and management stay with the ophthalmologist.';

// input booleans (from the dilated fundus exam):
//   neovascularization, vitreousHemorrhage  -> PDR
//   hem4quadrants (>20 IRH in each of 4 quadrants), venousBeading2 (>=2 quadrants),
//   irma1 (>=1 quadrant)                     -> severe NPDR (4-2-1 rule)
//   beyondMicroaneurysms                     -> moderate NPDR
//   microaneurysms                           -> mild NPDR
export function drSeverityIcdr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';

  const pdr = b(o.neovascularization) || b(o.vitreousHemorrhage);
  const severe = b(o.hem4quadrants) || b(o.venousBeading2) || b(o.irma1);
  const moderate = b(o.beyondMicroaneurysms);
  const mild = b(o.microaneurysms);

  let grade;
  if (pdr) grade = 5;
  else if (severe) grade = 4;
  else if (moderate) grade = 3;
  else if (mild) grade = 2;
  else grade = 1;

  const entry = GRADES[grade];
  const band = `ICDR grade ${grade} of 5 (${entry.name}): ${entry.detail}`;

  return {
    valid: true,
    grade,
    name: entry.name,
    detail: entry.detail,
    proliferative: grade === 5,
    abnormal: grade >= 4,
    bandLabel: entry.name,
    band,
    note: NOTE,
  };
}
