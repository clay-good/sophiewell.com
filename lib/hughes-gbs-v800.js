// spec-v800: Hughes Functional Grading Scale for Guillain-Barre syndrome.
//
// Sources:
//   Hughes RA, Newsom-Davis JM, Perkin GD, Pierce JM. Controlled trial of prednisolone in
//   acute polyneuropathy. Lancet. 1978;2(8093):750-753. (PMID 80682.) Grade definitions as
//   reproduced across contemporary GBS outcome literature.
//
// Seven grades, 0 to 6, higher meaning worse:
//   0  healthy, no symptoms attributable to the illness
//   1  minor symptoms, able to run
//   2  able to walk 10 meters or more without support, unable to run
//   3  able to walk 10 meters with help
//   4  bedridden or wheelchair-bound
//   5  requires assisted ventilation
//   6  death
//
// Grade 3 is the threshold that matters: it is where independent walking is lost, and it is
// the endpoint the GBS prognostic scores in this catalog are built around. mEGOS predicts
// exactly this scale, and EGRIS predicts the step to grade 5.
//
// Pure: no DOM, no clock, no network.

export const HUGHES_NOTE = 'The Hughes Functional Grading Scale (Hughes RA, Newsom-Davis JM, Perkin GD, Pierce JM, Lancet 1978;2(8093):750-753) is the standard measure of disability in Guillain-Barre syndrome and runs from 0 to 6 with higher meaning worse: 0 healthy, 1 minor symptoms but able to run, 2 able to walk ten meters or more without support but unable to run, 3 able to walk ten meters only with help, 4 bedridden or wheelchair-bound, 5 requiring assisted ventilation, and 6 death. Grade 3 is the threshold that matters, because it is where independent walking is lost, and grades 3 and above are what the literature counts as disability. It is also the scale the prognostic tools are built around: mEGOS predicts this grade at six months and EGRIS predicts the step to grade 5. It records a functional state at one moment and it is not a prognosis, a treatment decision, or a measure of sensory symptoms or pain, which it does not capture at all.';

const GRADES = {
  0: 'healthy, no symptoms attributable to the illness',
  1: 'minor symptoms, able to run',
  2: 'able to walk 10 meters or more without support, unable to run',
  3: 'able to walk 10 meters with help',
  4: 'bedridden or wheelchair-bound',
  5: 'requires assisted ventilation',
  6: 'death',
};

export function hughesGbs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const raw = o.grade;
  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'grade', message: 'Choose a grade from 0 to 6.', note: HUGHES_NOTE };
  }
  const grade = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(grade) || grade < 0 || grade > 6) {
    return { valid: false, code: 'INVALID_INPUT', field: 'grade', message: 'Grade must be a whole number from 0 to 6.', note: HUGHES_NOTE };
  }

  // Grade 3 and above is the published definition of disability on this scale.
  const disabled = grade >= 3;
  const ventilated = grade >= 5;

  return {
    valid: true,
    grade,
    description: GRADES[grade],
    disabled,
    ventilated,
    abnormal: disabled,
    bandLabel: `Hughes grade ${grade} of 6`,
    band: `Hughes grade ${grade} of 6 — ${GRADES[grade]}${grade === 6 ? '.' : (disabled
      ? '. At or above grade 3, so independent walking is lost.'
      : '. Below grade 3, so independent walking is retained.')}`,
    detail: 'Grades: 0 healthy; 1 minor symptoms, able to run; 2 walks 10 meters unaided but cannot run; 3 walks 10 meters only with help; 4 bedridden or wheelchair-bound; 5 needs assisted ventilation; 6 death. Grade 3 or above is what the literature counts as disability, because it is where independent walking is lost. This is the scale mEGOS predicts at six months, and EGRIS predicts the step to grade 5.',
    note: HUGHES_NOTE,
  };
}
