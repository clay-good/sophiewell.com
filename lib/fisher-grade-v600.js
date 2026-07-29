// spec-v600: the original Fisher grade for subarachnoid hemorrhage. A PREDECESSOR GAP: `modified-fisher` is
// already in the catalog, and the scale it modified was absent. Every slug spelling and filename search
// returned 0.
//
// **THE GRADES ARE NOT ORDINAL FOR THE RISK THEY GRADE.** This is the central fact and it inverts the
// expectation every reader brings to a 1-to-4 scale. Vasospasm risk rises from grade 1 to grade 3, and then
// GRADE 4 DOES NOT CONTINUE THE TREND: grade 3 carries the highest vasospasm risk, higher than grade 4. A
// higher Fisher grade therefore does NOT mean higher vasospasm risk, and any consumer that treats the number
// as a severity ordering is wrong at the top of the scale.
//
// **GRADE 4 IS DEFINED BY LOCATION, NOT BY AMOUNT, WHICH IS WHY THE ORDERING BREAKS.** Grade 4 is
// intracerebral or intraventricular blood "with diffuse or NO subarachnoid blood". It is not "more blood
// than grade 3" -- it is DIFFERENT blood in a DIFFERENT COMPARTMENT. A patient with a speck of
// intraventricular blood and no subarachnoid blood at all is grade 4, while a patient with thick cisternal
// subarachnoid clot is grade 3. The scale changes what it is measuring between grade 3 and grade 4.
//
// **THE SAME GRADE 4 COVERS A SPECK AND A VENTRICLE FULL OF CLOT.** That documented flaw -- one grade
// spanning trivial and catastrophic intraventricular blood -- is the stated reason the modified scale was
// proposed.
//
// **THE MODIFIED SCALE IS NOT A RENUMBERING AND THE GRADES DO NOT MAP ACROSS.** The modified scale adds a
// GRADE 0 and separates blood THICKNESS from INTRAVENTRICULAR HEMORRHAGE into two independent axes. A Fisher
// 3 is NOT a modified Fisher 3. A grade cannot be converted between the two scales, and this lib refuses to
// imply one.
//
// **THE 1 MM THRESHOLD WAS MEASURED ON 1980-ERA COMPUTED TOMOGRAPHY.** Slice thickness, resolution and
// windowing have changed beyond recognition since, so a 1 mm layer identified on a modern scanner is not the
// same observation the scale was built on. The threshold is applied as published and the caveat is stated.
//
// HIGH-STAKES: this grades the APPEARANCE OF BLOOD ON A CT SCAN in a patient who already has a diagnosis of
// subarachnoid hemorrhage. It does NOT diagnose subarachnoid hemorrhage, does not grade CLINICAL severity --
// that is what Hunt and Hess and the WFNS scale do, and both are in this catalog -- and does not localize or
// identify an aneurysm. It does not indicate nimodipine, transcranial Doppler surveillance, angiography or
// any intervention, and a low grade is NOT a reason to relax vasospasm monitoring (spec-v11 section 5.3).
//
// GRADE DEFINITIONS AND THE NON-ORDINAL RISK PATTERN RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT
// SOURCES, NEVER RECALLED (spec-v97):
//   - Fisher CM, Kistler JP, Davis JM. Relation of cerebral vasospasm to subarachnoid hemorrhage visualized
//     by computerized tomographic scanning. Neurosurgery. 1980;6(1):1-9.

export const THICKNESS_THRESHOLD_MM = 1;
export const HIGHEST_VASOSPASM_RISK_GRADE = 3;

export const GRADES = [
  {
    grade: 1,
    text: 'No subarachnoid blood detected',
    compartment: 'none',
  },
  {
    grade: 2,
    text: `Diffuse or vertical layer of subarachnoid blood less than ${THICKNESS_THRESHOLD_MM} mm thick`,
    compartment: 'subarachnoid',
  },
  {
    grade: 3,
    text: `Localized clot, or a vertical layer of subarachnoid blood ${THICKNESS_THRESHOLD_MM} mm thick or more`,
    compartment: 'subarachnoid',
  },
  {
    grade: 4,
    text: 'Intracerebral or intraventricular blood, with diffuse or NO subarachnoid blood',
    compartment: 'intracerebral or intraventricular',
  },
];

export const NON_ORDINAL_NOTE = `The grades are NOT ordinal for the risk they grade. Vasospasm risk rises from grade 1 to grade ${HIGHEST_VASOSPASM_RISK_GRADE}, and grade 4 does NOT continue the trend - grade ${HIGHEST_VASOSPASM_RISK_GRADE} carries the highest vasospasm risk. A higher Fisher grade does not mean higher vasospasm risk.`;
export const COMPARTMENT_NOTE = 'Grade 4 is defined by LOCATION, not by amount, which is why the ordering breaks. It is intracerebral or intraventricular blood with diffuse or NO subarachnoid blood - not "more blood than grade 3" but DIFFERENT blood in a DIFFERENT COMPARTMENT. A speck of intraventricular blood with no subarachnoid blood is grade 4; thick cisternal subarachnoid clot is grade 3.';
export const SPECK_NOTE = 'The same grade 4 covers a speck of intraventricular blood and a ventricle full of clot. That documented flaw is the stated reason the modified scale was proposed.';
export const NO_MAPPING_NOTE = 'The modified scale is NOT a renumbering: it adds a GRADE 0 and separates blood thickness from intraventricular hemorrhage into two independent axes. A Fisher 3 is NOT a modified Fisher 3, and a grade cannot be converted between the two scales.';
export const CT_ERA_NOTE = `The ${THICKNESS_THRESHOLD_MM} mm threshold was measured on 1980-era computed tomography. Slice thickness, resolution and windowing have changed beyond recognition since, so a ${THICKNESS_THRESHOLD_MM} mm layer identified on a modern scanner is not the same observation the scale was built on.`;

const NOTE = `The original Fisher grade (Fisher, Kistler and Davis 1980) grades the appearance of blood on the computed tomogram after subarachnoid hemorrhage. Grade 1 is no subarachnoid blood detected; grade 2 a diffuse or vertical layer less than ${THICKNESS_THRESHOLD_MM} mm thick; grade 3 a localized clot or a vertical layer ${THICKNESS_THRESHOLD_MM} mm thick or more; grade 4 intracerebral or intraventricular blood with diffuse or no subarachnoid blood. The grades are NOT ordinal for the risk they grade: vasospasm risk rises from grade 1 to grade ${HIGHEST_VASOSPASM_RISK_GRADE} and grade 4 does not continue the trend, so grade ${HIGHEST_VASOSPASM_RISK_GRADE} carries the highest vasospasm risk and a higher grade does not mean higher risk. Grade 4 is defined by location rather than amount, which is why the ordering breaks: it is different blood in a different compartment, so a speck of intraventricular blood with no subarachnoid blood is grade 4 while thick cisternal subarachnoid clot is grade 3. The same grade 4 covers a speck and a ventricle full of clot, and that flaw is the stated reason the modified scale was proposed. The modified scale is not a renumbering, since it adds a grade 0 and separates thickness from intraventricular hemorrhage into two independent axes, so a Fisher 3 is not a modified Fisher 3 and grades cannot be converted between the scales. The ${THICKNESS_THRESHOLD_MM} mm threshold was measured on 1980-era computed tomography and a layer identified on a modern scanner is not the same observation. This grades the appearance of blood on a scan in a patient who already has a diagnosis of subarachnoid hemorrhage. It does not diagnose subarachnoid hemorrhage, does not grade clinical severity, which is what the Hunt and Hess and WFNS scales do, and does not localize or identify an aneurysm. It does not indicate nimodipine, transcranial Doppler surveillance, angiography or any intervention, and a low grade is not a reason to relax vasospasm monitoring.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: intracerebralOrIntraventricular (yes/no), subarachnoidBlood
// ('none' | 'thin' | 'thick-or-localized-clot').
export function fisherGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const SAH = ['none', 'thin', 'thick-or-localized-clot'];
  let ivh, sah;
  try {
    ivh = readBool(o.intracerebralOrIntraventricular, 'Intracerebral or intraventricular blood');
    sah = o.subarachnoidBlood === '' || o.subarachnoidBlood === undefined || o.subarachnoidBlood === null
      ? null : String(o.subarachnoidBlood).trim();
    if (sah !== null && !SAH.includes(sah)) {
      throw new Error(`Subarachnoid blood must be one of: ${SAH.join(', ')}.`);
    }
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (ivh === null || sah === null) {
    return { valid: false, message: 'Answer whether there is intracerebral or intraventricular blood, and describe the subarachnoid blood. Grade 4 is decided by COMPARTMENT, not by how much blood there is.' };
  }

  // Grade 4 is decided by compartment and takes precedence over the subarachnoid description.
  let grade;
  if (ivh) grade = 4;
  else if (sah === 'thick-or-localized-clot') grade = 3;
  else if (sah === 'thin') grade = 2;
  else grade = 1;

  const definition = GRADES.find((g) => g.grade === grade);
  const gradedByCompartment = grade === 4;
  const outrankedByGradeThree = grade === 4;

  const parts = [];
  parts.push(`Fisher grade ${grade}: ${definition.text}.`);
  if (gradedByCompartment) {
    parts.push(`This is grade 4 because of WHERE the blood is, not how much there is. ${COMPARTMENT_NOTE}`);
    parts.push(`AND GRADE 4 IS NOT THE HIGHEST VASOSPASM RISK: grade ${HIGHEST_VASOSPASM_RISK_GRADE} is. ${NON_ORDINAL_NOTE}`);
    parts.push(SPECK_NOTE);
  } else {
    parts.push(NON_ORDINAL_NOTE);
    if (grade === HIGHEST_VASOSPASM_RISK_GRADE) {
      parts.push(`This grade carries the HIGHEST vasospasm risk on the scale - higher than grade 4.`);
    }
  }
  parts.push(NO_MAPPING_NOTE);
  parts.push(CT_ERA_NOTE);
  parts.push('This grades the appearance of blood on a scan. It does not diagnose subarachnoid hemorrhage, does not grade clinical severity - the Hunt and Hess and WFNS scales do that - and does not indicate nimodipine, Doppler surveillance or angiography. A low grade is not a reason to relax vasospasm monitoring.');

  return {
    valid: true,
    grade,
    definition: definition.text,
    compartment: definition.compartment,
    gradedByCompartment,
    carriesHighestVasospasmRisk: grade === HIGHEST_VASOSPASM_RISK_GRADE,
    outrankedByGradeThree,
    band: `Fisher grade ${grade}`,
    bandLabel: `Fisher grade ${grade}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
