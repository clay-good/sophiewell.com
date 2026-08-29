// spec-v616: the Frisen papilledema grading scale. A WHOLE-CONCEPT gap - "papilledema", "optic disc" and
// "intracranial hypertension" were all zero-hit across app.js, and every slug spelling returned 0.
//
// **THE SCALE IS CUMULATIVE: EACH GRADE REQUIRES THE FEATURES OF THE ONE BELOW IT.** The published wording is
// literally "features of grade 2 plus...". So a disc cannot be grade 3 while its halo still shows a temporal
// gap. This lib checks the findings for that consistency and REPORTS a contradiction instead of quietly
// picking the higher grade.
//
// **THE TEMPORAL GAP IS THE ENTIRE DIFFERENCE BETWEEN GRADE 1 AND GRADE 2.** Grade 1 is a C-shaped halo with
// a gap at the temporal border; grade 2 is the same halo with that gap filled in. One feature, one whole
// grade. The gap exists for an anatomical reason - the temporal border is spared because those axons are of
// fine caliber - so it is a real finding, not an artefact of photography.
//
// **GRADE 3 AND GRADE 4 DIFFER BY WHERE THE OBSCURED VESSEL IS, NOT BY HOW MUCH IS OBSCURED.** Grade 3 is
// total obscuration of a portion of a major vessel AS IT LEAVES the disc; grade 4 is total obscuration of a
// portion of a major vessel ON the disc. Identical finding, different location.
//
// **GRADE 4 IS DEFINED BY AN EXCEPTION: AT LEAST ONE MAJOR VESSEL ON THE DISC MUST BE SPARED.** If none is
// spared the grade is 5. A negative condition inside a severity definition is easy to read past, and it is
// the only thing separating the top two grades.
//
// **PARTIAL AND TOTAL OBSCURATION ARE NOT THE SAME THING.** Grade 2 explicitly PERMITS partial obscuration of
// major vessels; grades 3 and above require TOTAL obscuration of a portion. Treating partial obscuration as
// qualifying jumps the grade by at least one and often more.
//
// **THE GRADE DOES NOT MEASURE INTRACRANIAL PRESSURE.** It describes the appearance of the optic disc.
// Neither source used here claims otherwise. A low grade does not exclude raised intracranial pressure and a
// high grade is not a pressure value.
//
// HIGH-STAKES: this grades a disc APPEARANCE. It does NOT diagnose papilledema or its cause, does NOT
// distinguish true papilledema from pseudopapilledema, does NOT measure or estimate intracranial pressure,
// does NOT indicate whether imaging or a lumbar puncture is needed, and does NOT decide treatment
// (spec-v11 section 5.3).
//
// GRADES RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97). Both sources give the same six grades
// with the same boundaries, including the spared-vessel condition on grade 4 and the partial-versus-total
// distinction at grade 2:
//   - Frisen L. Swelling of the optic nerve head: a staging scheme. J Neurol Neurosurg Psychiatry.
//     1982;45(1):13-18.

export const HALO_STATES = [
  { value: 'none', text: 'No C-shaped halo and no obscuration of the peripapillary nerve fiber layer' },
  { value: 'temporal-gap', text: 'C-shaped halo with scalloped or feathered borders and a TEMPORAL GAP' },
  { value: 'circumferential', text: 'The halo is circumferential - the temporal gap is filled in' },
];

export const VESSEL_FINDINGS = [
  { key: 'totalLeavingDisc', text: 'Total obscuration of a portion of at least one major vessel AS IT LEAVES the disc' },
  { key: 'totalOnDisc', text: 'Total obscuration of a portion of at least one major vessel ON the disc' },
  { key: 'everyVesselObscured', text: 'A segment of EVERY major vessel is totally obscured - none is spared' },
];

export const GRADES = [
  { grade: 0, text: 'No C-shaped halo and no obscuration of the peripapillary nerve fiber layer.' },
  { grade: 1, text: 'C-shaped halo with scalloped or feathered borders and a temporal gap that obscures underlying retinal detail.' },
  { grade: 2, text: 'The halo is circumferential, with the temporal gap filled in. Partial obscuration of major vessels is PERMITTED; total obscuration is not.' },
  { grade: 3, text: 'Features of grade 2 plus total obscuration of a portion of at least one major vessel as it LEAVES the disc.' },
  { grade: 4, text: 'Features of grade 3 plus total obscuration of a portion of a major vessel ON the disc, with at least one major vessel on the disc SPARED.' },
  { grade: 5, text: 'Features of grade 4 with total obscuration of a segment of EVERY major vessel. None is spared.' },
];

export const CUMULATIVE_NOTE = 'THE SCALE IS CUMULATIVE: each grade requires the features of the one below it, and the published wording is literally "features of grade 2 plus...". A disc cannot be grade 3 while its halo still shows a temporal gap.';
export const TEMPORAL_GAP_NOTE = 'THE TEMPORAL GAP IS THE ENTIRE DIFFERENCE BETWEEN GRADE 1 AND GRADE 2. Grade 1 is a C-shaped halo with a gap at the temporal border; grade 2 is the same halo with that gap filled in. The gap exists because the temporal border is spared, its axons being of fine caliber, so it is a real finding rather than a photographic artifact.';
export const LOCATION_NOTE = 'GRADE 3 AND GRADE 4 DIFFER BY WHERE THE OBSCURED VESSEL IS, NOT BY HOW MUCH IS OBSCURED: grade 3 is total obscuration of a portion of a major vessel AS IT LEAVES the disc, grade 4 is the same finding ON the disc.';
export const SPARED_NOTE = 'GRADE 4 IS DEFINED BY AN EXCEPTION: at least one major vessel on the disc must be SPARED. If none is spared the grade is 5. That negative condition is the only thing separating the top two grades.';
export const PARTIAL_NOTE = 'PARTIAL AND TOTAL OBSCURATION ARE NOT THE SAME THING. Grade 2 explicitly PERMITS partial obscuration of major vessels, while grades 3 and above require TOTAL obscuration of a portion. Treating partial obscuration as qualifying raises the grade by at least one.';
export const NOT_PRESSURE_NOTE = 'THE GRADE DOES NOT MEASURE INTRACRANIAL PRESSURE. It describes the appearance of the optic disc. A low grade does not exclude raised intracranial pressure, and a high grade is not a pressure value.';

const NOTE = `The Frisen scale (Frisen 1982) grades swelling of the optic nerve head from 0 to 5 on fundus appearance. ${CUMULATIVE_NOTE} ${TEMPORAL_GAP_NOTE} ${LOCATION_NOTE} ${SPARED_NOTE} ${PARTIAL_NOTE} ${NOT_PRESSURE_NOTE} This grades a disc appearance. It does not diagnose papilledema or its cause, does not distinguish true papilledema from pseudopapilledema, does not measure or estimate intracranial pressure, does not indicate whether imaging or a lumbar puncture is needed, and does not decide treatment.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

export function gradeText(grade) {
  const row = GRADES.find((g) => g.grade === grade);
  return row ? row.text : null;
}

// input: halo (a HALO_STATES value) plus a yes/no for each VESSEL_FINDINGS key.
export function frisenGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const halo = o.halo ? HALO_STATES.find((h) => h.value === String(o.halo).trim()) : null;
  const f = {};
  try {
    for (const v of VESSEL_FINDINGS) f[v.key] = readBool(o[v.key], v.text);
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (!halo || VESSEL_FINDINGS.some((v) => f[v.key] === null)) {
    return { valid: false, message: `Describe the halo and answer all ${VESSEL_FINDINGS.length} vessel findings. ${CUMULATIVE_NOTE}` };
  }

  const anyVesselFinding = VESSEL_FINDINGS.some((v) => f[v.key]);

  // The cumulative rule, enforced rather than assumed.
  const contradictions = [];
  if (halo.value !== 'circumferential' && anyVesselFinding) {
    contradictions.push('total vessel obscuration is reported, but grades 3 and above require the circumferential halo of grade 2, and the halo here is not circumferential');
  }
  if (f.everyVesselObscured && !f.totalOnDisc) {
    contradictions.push('every major vessel is reported as obscured, but obscuration of a vessel ON the disc is reported as absent');
  }
  if (f.totalOnDisc && !f.totalLeavingDisc) {
    contradictions.push('obscuration of a vessel ON the disc is reported, but grade 4 requires the grade 3 finding of obscuration as a vessel LEAVES the disc');
  }
  if (contradictions.length) {
    return {
      valid: true,
      grade: null,
      consistent: false,
      contradictions,
      band: 'Findings are not internally consistent',
      bandLabel: 'No grade returned — the findings are not internally consistent',
      bandText: `NO GRADE IS RETURNED. ${CUMULATIVE_NOTE} The findings entered conflict with that: ${contradictions.join('; ')}. ${TEMPORAL_GAP_NOTE} ${LOCATION_NOTE} ${SPARED_NOTE} ${PARTIAL_NOTE} ${NOT_PRESSURE_NOTE}`,
      note: NOTE,
    };
  }

  let grade;
  if (halo.value === 'none') grade = 0;
  else if (halo.value === 'temporal-gap') grade = 1;
  else if (f.everyVesselObscured) grade = 5;
  else if (f.totalOnDisc) grade = 4;
  else if (f.totalLeavingDisc) grade = 3;
  else grade = 2;

  const parts = [];
  parts.push(`Frisen grade ${grade}. ${gradeText(grade)}`);
  if (grade === 1) parts.push(TEMPORAL_GAP_NOTE);
  if (grade === 2) parts.push(PARTIAL_NOTE);
  if (grade === 3) parts.push(LOCATION_NOTE);
  if (grade === 4) parts.push(SPARED_NOTE);
  if (grade === 5) parts.push('Grade 5 is reached because no major vessel is spared. Grade 4 requires at least one to be spared.');
  parts.push(CUMULATIVE_NOTE);
  parts.push(NOT_PRESSURE_NOTE);
  parts.push('This grades a disc appearance. It does not diagnose papilledema or its cause, does not distinguish true papilledema from pseudopapilledema, does not measure or estimate intracranial pressure, does not indicate whether imaging or a lumbar puncture is needed, and does not decide treatment.');

  return {
    valid: true,
    grade,
    consistent: true,
    contradictions: [],
    haloState: halo.value,
    vesselFindings: VESSEL_FINDINGS.filter((v) => f[v.key]).map((v) => v.key),
    band: `Grade ${grade}`,
    bandLabel: `Frisen grade ${grade}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
