// spec-v1240: the Parkland Grading Scale for Cholecystitis (PGS) -- an INTRAOPERATIVE grade, 1 to 5,
// assigned from what the gallbladder looks like once it has been exposed.
//
// Source:
//   Madni TD, Leshikar DE, Minshall CT, Nakonezny PA, Cornelius CC, Imran JB, et al. The Parkland
//   grading scale for cholecystitis. Am J Surg. 2018;215(4):625-630. PMID 28619262.
//
// The five grades, as reproduced in the open-access validations (Patient Safety in Surgery 2023,
// PMC10207752; Gastroenterol Res Pract 2020, PMC7710418):
//   1  normal gallbladder, no adhesions
//   2  minor adhesions at the neck, otherwise normal
//   3  ANY of: hyperemia, pericholecystic fluid, adhesions to the body, distended gallbladder
//   4  ANY of: adhesions obscuring the majority of the gallbladder; OR a grade 1-3 picture WITH
//      abnormal liver anatomy, an intrahepatic gallbladder, or an impacted stone (Mirizzi)
//   5  ANY of: perforation, necrosis, inability to see the gallbladder at all for adhesions
//
// THE GRADE IS THE HIGHEST FINDING, NOT A SUM. Nothing here is added up; a single grade 5 finding
// makes it a grade 5 whatever else is or is not present.
//
// GRADE 4 IS THE COUNTERINTUITIVE ONE and it is why this tile derives rather than asks. Its second
// clause attaches to an OTHERWISE MILD picture: a gallbladder with no adhesions at all is a grade 4
// if the stone is impacted, because the anatomy is what makes the operation hard. Reading the scale
// as a ladder of inflammation gets that case wrong every time.
//
// WHAT IT IS NOT. It does not grade the patient's illness -- that is the Tokyo Guidelines severity
// grade (`cholecystitis-severity` in this catalog), which reads organ dysfunction and is assigned
// before the operation. Parkland is assigned during it, from the view. The two answer different
// questions and neither substitutes for the other.
//
// Pure: no DOM, no clock, no network.

export const PARKLAND_NOTE = 'The Parkland Grading Scale (Madni 2018) grades a gallbladder from 1 to 5 by what the surgeon sees once it is exposed. The grade is the highest finding present, never a sum. Grades 1-3 are the group associated with an easier cholecystectomy and grades 4-5 with a harder one, but the scale describes the operative field -- it does not grade how ill the patient is, which is what the Tokyo Guidelines severity grade does, and it cannot be assigned before the gallbladder has been seen.';

// Each finding carries the grade it establishes. Order within a grade is the source's order.
export const PARKLAND_FINDINGS = [
  { key: 'neckAdhesions', grade: 2, label: 'Minor adhesions at the neck only' },
  { key: 'hyperemia', grade: 3, label: 'Hyperemia' },
  { key: 'pericholecysticFluid', grade: 3, label: 'Pericholecystic fluid' },
  { key: 'bodyAdhesions', grade: 3, label: 'Adhesions to the body' },
  { key: 'distended', grade: 3, label: 'Distended gallbladder' },
  { key: 'adhesionsObscuringMost', grade: 4, label: 'Adhesions obscuring the majority of the gallbladder' },
  { key: 'abnormalLiverAnatomy', grade: 4, label: 'Abnormal liver anatomy' },
  { key: 'intrahepatic', grade: 4, label: 'Intrahepatic gallbladder' },
  { key: 'impactedStone', grade: 4, label: 'Impacted stone (Mirizzi)', phrase: 'an impacted stone (Mirizzi)' },
  { key: 'perforation', grade: 5, label: 'Perforation' },
  { key: 'necrosis', grade: 5, label: 'Necrosis' },
  { key: 'notVisualized', grade: 5, label: 'Gallbladder cannot be seen at all for adhesions' },
];

const GRADE_TEXT = {
  1: 'a normal gallbladder with no adhesions',
  2: 'minor adhesions at the neck, otherwise normal',
  3: 'inflammatory change short of obscured anatomy',
  4: 'obscured anatomy, or anatomy that is abnormal in its own right',
  5: 'perforation, necrosis, or a gallbladder that cannot be seen',
};

// The findings that reach grade 4 through the anatomy clause rather than through adhesions.
const ANATOMY_CLAUSE = ['abnormalLiverAnatomy', 'intrahepatic', 'impactedStone'];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function parklandGallbladder(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = PARKLAND_FINDINGS.filter((f) => on(o[f.key]));
  const grade = present.reduce((g, f) => Math.max(g, f.grade), 1);
  const difficult = grade >= 4;

  const driving = present.filter((f) => f.grade === grade).map((f) => f.phrase || f.label.toLowerCase());
  const anatomyOnly = grade === 4
    && present.every((f) => f.grade < 4 || ANATOMY_CLAUSE.includes(f.key))
    && present.some((f) => ANATOMY_CLAUSE.includes(f.key));

  const band = grade === 1
    ? 'Parkland grade 1 of 5: a normal gallbladder with no adhesions. This is the mild end of the scale and the group associated with a straightforward cholecystectomy.'
    : `Parkland grade ${grade} of 5, set by ${driving.join(' and ')}. That is ${GRADE_TEXT[grade]}. `
      + `${difficult ? 'Grades 4 and 5 are the group associated with a more difficult cholecystectomy, longer operating time, and higher rates of partial and open conversion.' : 'Grades 1 to 3 are the group associated with a more straightforward cholecystectomy.'}`;

  const highestNote = present.length > 1
    ? 'The grade is the highest finding present. Nothing is added up, so the other findings recorded here do not raise it further.'
    : 'The grade is the highest finding present, never a sum of findings.';

  // The branch the scale is most often read wrongly on, printed exactly when it applies.
  const anatomyNote = anatomyOnly
    ? 'This reached grade 4 through the anatomy clause, not through inflammation: a gallbladder that otherwise looks grade 1 to 3 is a grade 4 when the liver anatomy is abnormal, the gallbladder is intrahepatic, or a stone is impacted. Read as a ladder of inflammation, this case grades too low.'
    : null;

  // Grade 1 is a finding, and an empty form is not that finding.
  const emptyNote = present.length === 0
    ? 'Nothing was recorded. Grade 1 describes a gallbladder that has been exposed and looks normal; it is not what an unfilled form means. If the operative findings have not been entered yet, there is no grade here.'
    : null;

  const tokyoNote = 'Parkland grades the operative field. It does not grade the patient: the Tokyo Guidelines severity grade, which reads organ dysfunction and is assigned before the operation, answers that question instead.';

  return {
    valid: true,
    grade,
    difficult,
    group: difficult ? 2 : 1,
    present: present.map((f) => f.label),
    count: present.length,
    abnormal: difficult,
    bandLabel: `Parkland grade ${grade}`,
    band,
    highestNote,
    anatomyNote,
    emptyNote,
    tokyoNote,
    note: PARKLAND_NOTE,
  };
}
