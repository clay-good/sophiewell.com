// spec-v1240: the AAST anatomic severity grade for acute cholecystitis (EGS grade I-V).
//
// Sources:
//   Tominaga GT, Staudenmayer KL, Shafi S, et al. The American Association for the Surgery of Trauma
//   grading scale for 16 emergency general surgery conditions. J Trauma Acute Care Surg.
//   2016;81(3):593-602. PMID 27257696 -- the grading system.
//   Hernandez M, Murphy B, Aho JM, et al. Validation of the AAST EGS acute cholecystitis grade and
//   comparison with the Tokyo guidelines. Surgery. 2018;163(4):739-746. PMID 29325783.
//   Schuster KM, O'Connor R, Cripps M, et al. Revision of the AAST grading scale for acute
//   cholecystitis with comparison to physiologic measures of severity. J Trauma Acute Care Surg.
//   2022;92(4):664-674. PMID 34936593 -- a later, expanded version of the same scale.
//
// THERE IS A 2022 REVISION AND THIS IS NOT IT. Schuster 2022 re-cut the grades by modified Delphi to
// spread patients more evenly and added clinical variables; its own conclusion is that even revised,
// the AAST grade did not outperform the Parkland grade. This tile implements the ORIGINAL 2016
// anatomic criteria, which are the ones printed in full in a source that could be read, and says so
// on screen -- a grade computed here should not be reported as a revised-scale grade.
//
// The five grades (reproduced in the open-access review PMC7649581, Table 3):
//   I    localized gallbladder inflammation
//        imaging: wall thickening, pericholecystic fluid, non-visualization of the gallbladder
//        operative: localized inflammatory changes
//   II   distended gallbladder with pus or hydrops, or wall necrosis / gangrene WITHOUT perforation
//        imaging: the above plus air in the gallbladder lumen, the wall, or the biliary tree
//   III  non-iatrogenic perforation with bile confined to the right upper quadrant
//        imaging: an extraluminal fluid collection limited to the right upper quadrant
//   IV   pericholecystic abscess, bilioenteric fistula, or gallstone ileus
//   V    grade IV disease with generalized peritonitis
//        imaging: free intraperitoneal fluid
//
// THE RULE THAT MAKES IT A CALCULATION: the AAST system grades on four categories -- clinical,
// imaging, operative and pathologic -- and WHERE THEY DISAGREE THE HIGHEST GRADE IS THE FINAL GRADE.
// That is the same rule `aast-organ-injury` applies to the trauma organ scales in this catalog.
//
// SO AN IMAGING GRADE IS A FLOOR, NOT A GRADE. A CT that shows a thickened wall is a grade I
// *on imaging*; the gangrene that makes it a grade II may only be visible once the gallbladder is
// out. This tile takes the imaging grade and the operative grade separately and says which it has,
// rather than presenting one of them as the answer.
//
// WHAT IT IS NOT. It is not the Tokyo Guidelines severity grade (`cholecystitis-severity` here).
// Tokyo grades the PATIENT -- organ dysfunction, the systemic response. AAST grades the DISEASE --
// how far it has spread anatomically. A patient can be anatomically grade I and Tokyo grade III at
// the same time, and the two do not convert into one another.
//
// This tile reproduces the imaging and operative criteria, which the source above prints in full.
// It does NOT reproduce the clinical and pathologic criteria, because it could not verify them
// verbatim; the field for them accepts a grade the user has assigned from the source instead.
//
// Pure: no DOM, no clock, no network.

export const AAST_CHOLECYSTITIS_NOTE = 'The AAST grade for acute cholecystitis (Tominaga 2016; validated against the Tokyo Guidelines by Hernandez 2018) describes how far the disease has spread anatomically, from inflammation confined to the gallbladder (I) to generalized peritonitis (V). The AAST system grades on clinical, imaging, operative and pathologic findings, and where they disagree the highest grade is the final one -- so a grade taken from imaging alone is a floor that the operation can only raise. It is not the Tokyo Guidelines severity grade, which grades the patient rather than the disease; a patient can be anatomically grade I and Tokyo grade III at once. A 2022 revision of this scale exists (Schuster 2022), which re-cut the grades and added clinical variables; this tool applies the original 2016 anatomic criteria, so a grade from it is not a revised-scale grade.';

export const AAST_CHOLECYSTITIS_GRADES = [
  {
    value: 'I',
    n: 1,
    label: 'I - localized gallbladder inflammation',
    imaging: 'wall thickening, pericholecystic fluid, or non-visualization of the gallbladder',
    operative: 'localized inflammatory changes',
    text: 'inflammation confined to the gallbladder',
  },
  {
    value: 'II',
    n: 2,
    label: 'II - distended gallbladder with pus or hydrops, or wall necrosis without perforation',
    imaging: 'the grade I findings plus air in the gallbladder lumen, the wall, or the biliary tree',
    operative: 'a distended gallbladder with pus or hydrops, or non-perforated wall necrosis or gangrene',
    text: 'a gallbladder that is failing but has not given way',
  },
  {
    value: 'III',
    n: 3,
    label: 'III - non-iatrogenic perforation, bile confined to the right upper quadrant',
    imaging: 'an extraluminal fluid collection limited to the right upper quadrant',
    operative: 'non-iatrogenic wall perforation with bile limited to the right upper quadrant',
    text: 'a perforation the right upper quadrant has walled off',
  },
  {
    value: 'IV',
    n: 4,
    label: 'IV - pericholecystic abscess, bilioenteric fistula, or gallstone ileus',
    imaging: 'a right upper quadrant abscess, a bilioenteric fistula, or gallstone ileus',
    operative: 'a pericholecystic abscess, a bilioenteric fistula, or gallstone ileus',
    text: 'disease that has left the gallbladder and organized outside it',
  },
  {
    value: 'V',
    n: 5,
    label: 'V - grade IV disease with generalized peritonitis',
    imaging: 'free intraperitoneal fluid',
    operative: 'the grade IV findings with generalized peritonitis',
    text: 'disease that is no longer local at all',
  },
];

const BY_VALUE = new Map(AAST_CHOLECYSTITIS_GRADES.map((g) => [g.value, g]));

export const AAST_CHOLECYSTITIS_ROUTES = [
  { key: 'imaging', label: 'Imaging grade' },
  { key: 'operative', label: 'Operative grade' },
  { key: 'clinicalPathologic', label: 'Clinical or pathologic grade' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

function parseGrade(key, v) {
  const raw = String(v).trim().toUpperCase();
  const g = BY_VALUE.get(raw);
  if (!g) throw new RangeError(`aast-cholecystitis: ${key} must be a grade I, II, III, IV or V`);
  return g;
}

export function aastCholecystitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const given = [];
  const absent = [];
  for (const route of AAST_CHOLECYSTITIS_ROUTES) {
    const raw = o[route.key];
    if (isBlank(raw)) { absent.push(route); continue; }
    given.push({ route, grade: parseGrade(route.key, raw) });
  }

  if (given.length === 0) {
    return {
      valid: false,
      message: 'Enter the grade from at least one of the imaging, operative, or clinical and pathologic findings.',
    };
  }

  const top = given.reduce((a, b) => (b.grade.n > a.grade.n ? b : a));
  const setBy = given.filter((g) => g.grade.n === top.grade.n).map((g) => g.route.label.toLowerCase());
  const disagree = given.some((g) => g.grade.n !== top.grade.n);
  const operativeSeen = given.some((g) => g.route.key === 'operative');

  return {
    valid: true,
    grade: top.grade.value,
    gradeNumber: top.grade.n,
    setBy,
    given: given.map((g) => ({ route: g.route.key, grade: g.grade.value })),
    provisional: !operativeSeen,
    abnormal: top.grade.n >= 3,
    bandLabel: `AAST grade ${top.grade.value}`,
    band: `AAST grade ${top.grade.value} of V for acute cholecystitis, set by the ${setBy.join(' and ')}: ${top.grade.text}.`,
    // The rule, printed exactly when it did work.
    highestNote: disagree
      ? `The categories entered do not agree (${given.map((g) => `${g.route.label.toLowerCase()} ${g.grade.value}`).join(', ')}). The AAST rule is that the highest of them is the final grade, so the answer is ${top.grade.value}.`
      : 'Where the clinical, imaging, operative and pathologic categories disagree, the AAST rule is that the highest of them is the final grade.',
    // And the one that matters more: an imaging-only grade is a floor.
    provisionalNote: operativeSeen
      ? null
      : `No operative grade was entered, so this is a floor rather than a settled grade. Grade ${top.grade.value} on imaging is compatible with a higher grade at operation -- wall necrosis and a walled-off perforation are both routinely found in a gallbladder that imaged as grade I or II.`,
    tokyoNote: 'AAST grades the disease, not the patient. The Tokyo Guidelines severity grade answers the second question, from organ dysfunction, and the two do not convert into one another.',
    criteria: {
      imaging: top.grade.imaging,
      operative: top.grade.operative,
    },
    note: AAST_CHOLECYSTITIS_NOTE,
  };
}
