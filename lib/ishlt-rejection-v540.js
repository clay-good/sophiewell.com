// spec-v540: the ISHLT grading of acute cellular rejection in a CARDIAC allograft. Zero-hit before this
// tile: "ishlt" and "myocyte" across corpus.json, app.js, and lib/meta.js. The `stewart` hits belong to the
// Stewart acid-base strong-ion tile, an unrelated eponym.
//
// A DIFFERENT ORGAN AND A DIFFERENT LESION SET FROM THE EXISTING banff-tcmr TILE. Banff grades T-cell
// mediated rejection in a KIDNEY allograft from interstitial inflammation, tubulitis, and arteritis -- three
// lesions that do not exist in myocardium. This grades a heart biopsy from lymphocytic infiltrate and
// MYOCYTE DAMAGE. The two share a concept and share nothing else, and a grade from one cannot be read on the
// other's scale.
//
// FOUR GRADES, AND THE "R" IS NOT DECORATION. The 2004/2005 revision appended R for "revised" precisely
// because the numbers were reused: the old scheme also had grades 1, 2, 3 and 4, and they do not mean the
// same things. An unqualified "grade 3" in a record is genuinely ambiguous, and this tile therefore returns
// the R form always and reports which old grades map into it.
//   0R  no rejection: unremarkable endomyocardium, no lymphocytic infiltration
//   1R  mild, low grade: interstitial and/or perivascular infiltrate with UP TO ONE FOCUS of myocyte damage
//   2R  moderate, intermediate grade: TWO OR MORE FOCI of infiltrate with associated myocyte damage,
//       with uninvolved myocardium between the foci
//   3R  severe, high grade: DIFFUSE infiltrate with MULTIFOCAL myocyte damage, with or without edema,
//       hemorrhage, or vasculitis
//
// **THE MAPPING IS MANY-TO-ONE AND ASYMMETRIC, WHICH IS WHERE THE ERROR LIVES:**
//   1990 grade 0            -> 0R
//   1990 grades 1A, 1B, 2   -> 1R      <-- THREE old grades collapse into one
//   1990 grade 3A           -> 2R
//   1990 grades 3B and 4    -> 3R
// The trap is 3A and 3B. They sit adjacent in the old scheme and they land in DIFFERENT revised grades: 3A
// becomes 2R and 3B becomes 3R. A source reproducing this mapping incorrectly claims both collapse into 2R;
// that reading would move a severe rejection down a grade, across the threshold that usually decides
// treatment. This tile carries the correct mapping and states the collapse count on every grade.
//
// THE TREATMENT THRESHOLD IS CONVENTIONALLY BETWEEN 1R AND 2R: 0R and 1R are read as low grade and 2R and 3R
// as high grade. That convention is reported because it is the reason the grade is assigned at all, but it
// is a convention rather than an order -- the decision also turns on time since transplant, hemodynamics,
// symptoms, donor-specific antibody, and prior rejection history.
//
// HIGH-STAKES: this grades ACUTE CELLULAR rejection only. It is blind to ANTIBODY-MEDIATED rejection, which
// is graded on a separate ISHLT pAMR scale using immunohistochemistry rather than these features, and a
// biopsy can be 0R and still show antibody-mediated rejection. It is also blind to cardiac allograft
// vasculopathy, the chronic process that limits long-term survival. It does not diagnose rejection clinically
// -- it reports what a biopsy shows -- and is not an indication to pulse steroids or change immunosuppression
// (spec-v11 section 5.3). Sampling matters: rejection is patchy, so a low grade on a biopsy with few
// evaluable fragments does not exclude a higher grade elsewhere. The treatment decision stays with the
// transplant team.
//
// GRADES, DEFINITIONS, AND THE 1990 MAPPING RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two
// independent sources agreeing on every grade and on the mapping:
//   - Stewart S, Winters GL, Fishbein MC, et al. Revision of the 1990 working formulation for the
//     standardization of nomenclature in the diagnosis of heart rejection. J Heart Lung Transplant.
//     2005;24(11):1710-1720.
//   - An independent pathology reference and a transplant-rejection review reproducing the same four grades
//     and the same many-to-one mapping.

export const ISHLT_GRADES = [
  {
    value: '0R',
    label: 'Grade 0R (no rejection)',
    text: 'No evidence of rejection: unremarkable endomyocardium with no lymphocytic infiltration.',
    legacy: ['0'],
    highGrade: false,
  },
  {
    value: '1R',
    label: 'Grade 1R (mild, low grade)',
    text: 'Interstitial and/or perivascular infiltrate with up to one focus of myocyte damage. Myocardial architecture is otherwise intact.',
    legacy: ['1A', '1B', '2'],
    highGrade: false,
  },
  {
    value: '2R',
    label: 'Grade 2R (moderate, intermediate grade)',
    text: 'Two or more foci of infiltrate with associated myocyte damage, with uninvolved myocardium present between the foci.',
    legacy: ['3A'],
    highGrade: true,
  },
  {
    value: '3R',
    label: 'Grade 3R (severe, high grade)',
    text: 'Diffuse infiltrate with multifocal myocyte damage, with or without edema, hemorrhage, or vasculitis. A diffuse process in which distinct foci cannot be made out.',
    legacy: ['3B', '4'],
    highGrade: true,
  },
];

const NOTE = 'The ISHLT grading of acute cellular rejection in a cardiac allograft (Stewart and colleagues 2005) has four grades. 0R is no rejection; 1R is mild, an interstitial or perivascular infiltrate with up to one focus of myocyte damage; 2R is moderate, two or more foci of infiltrate with associated myocyte damage and uninvolved myocardium between them; and 3R is severe, a diffuse infiltrate with multifocal myocyte damage. The R stands for revised and is not decoration: the 1990 scheme also had grades 1, 2, 3 and 4 and they do not mean the same things, so an unqualified grade 3 in a record is genuinely ambiguous. The mapping from the old scheme is many-to-one and asymmetric: 1990 grade 0 becomes 0R; grades 1A, 1B and 2 all collapse into 1R; grade 3A becomes 2R; and grades 3B and 4 become 3R. The trap is that 3A and 3B are adjacent in the old scheme but land in different revised grades, 2R and 3R respectively, and at least one published source reproduces this incorrectly by claiming both collapse into 2R, which would move a severe rejection down a grade across the threshold that usually decides treatment. Conventionally 0R and 1R are read as low grade and 2R and 3R as high grade, which is where treatment is usually considered, but that is a convention rather than an order and the decision also turns on time since transplant, hemodynamics, symptoms, donor-specific antibody, and prior rejection history. This grades acute cellular rejection only. It is blind to antibody-mediated rejection, which is graded on a separate ISHLT pAMR scale using immunohistochemistry, so a biopsy can be 0R and still show antibody-mediated rejection, and it is blind to cardiac allograft vasculopathy, the chronic process that limits long-term survival. It reports what a biopsy shows rather than diagnosing rejection clinically, and it is not an indication to pulse steroids or change immunosuppression. Rejection is patchy, so a low grade on a biopsy with few evaluable fragments does not exclude a higher grade elsewhere. It also grades a different organ and a different lesion set from the Banff classification, which grades T-cell mediated rejection in a kidney allograft from interstitial inflammation, tubulitis, and arteritis.';

// input: grade -- '0R','1R','2R','3R'. Bare 0-4 and the 1990 forms are REJECTED with guidance, because an
// unqualified number is ambiguous between the two schemes.
export function ishltRejection(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.grade;

  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, message: 'Choose a revised grade: 0R, 1R, 2R, or 3R.' };
  }
  const key = String(raw).trim().toUpperCase().replace(/\s+/g, '');

  const entry = ISHLT_GRADES.find((g) => g.value === key);
  if (entry) {
    return {
      valid: true,
      grade: entry.value,
      highGrade: entry.highGrade,
      legacyGrades: entry.legacy.slice(),
      bandLabel: `ISHLT ${entry.label}`,
      band: `${entry.label} ${entry.text} Maps from 1990 grade${entry.legacy.length > 1 ? 's' : ''} ${entry.legacy.join(', ')}${entry.legacy.length > 1 ? `, which all collapse into this one grade` : ''}. Conventionally ${entry.highGrade ? 'high grade, where treatment is usually considered' : 'low grade'} — a convention, not an order. This grades acute cellular rejection only and is blind to antibody-mediated rejection and to allograft vasculopathy.`,
      note: NOTE,
    };
  }

  // A 1990-scheme grade, or a bare number: refuse and explain rather than guess which scheme was meant.
  const legacyOwner = ISHLT_GRADES.find((g) => g.legacy.includes(key));
  if (legacyOwner) {
    return {
      valid: false,
      message: `"${key}" is a 1990-scheme grade, not a revised one. It maps to ${legacyOwner.value}. Enter the revised grade directly, since the two schemes reuse the same numbers.`,
    };
  }
  if (/^[0-4]$/.test(key)) {
    return {
      valid: false,
      message: `"${key}" is ambiguous: the 1990 and revised schemes both use that number and they do not mean the same thing. Enter 0R, 1R, 2R, or 3R.`,
    };
  }
  return { valid: false, message: 'Grade must be 0R, 1R, 2R, or 3R.' };
}
