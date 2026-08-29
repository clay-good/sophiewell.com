// spec-v858: the WHO grades of hearing loss.
//
// Source:
//   World Health Organization. World report on hearing. Geneva: WHO; 2021.
//
//   Each ear's average is taken over 0.5, 1, 2 and 4 kHz. The grade is read from the BETTER ear.
//
//     0  under 20 dB      no impairment
//     1  20 to under 35   mild
//     2  35 to under 50   moderate
//     3  50 to under 65   moderately severe
//     4  65 to under 80   severe
//     5  80 to under 95   profound
//     6  95 and above     complete or total
//
//   UNILATERAL HEARING LOSS: better ear under 20 dB AND worse ear 35 dB or more. A separate
//   category, not a grade.
//
// ONE DEAF EAR IS ITS OWN CATEGORY, NOT GRADE 5, AND THAT IS THE POINT OF THIS TILE. A
// profoundly deaf ear beside a normal one has no honest place on the bilateral scale. Graded on
// the BETTER ear it is grade 0, which describes the hearing but not the disability; graded on
// the WORSE ear it is grade 5, which describes neither. The 2021 revision made it a category of
// its own.
//
// THE GRADE IS THE BETTER EAR, AND ONLY THE BETTER EAR. Reading the worse ear over-calls every
// asymmetric loss.
//
// MILD STARTS AT 20 dB, NOT 26. The earlier grading began at 26, so read against it the whole
// 20 to 25 dB band disappears.
//
// THE AVERAGE INCLUDES 4 kHz. A three-frequency average over 0.5, 1 and 2 kHz is a different
// number, and in noise-induced and age-related loss it under-calls the grade.
//
// Pure: no DOM, no clock, no network.

export const WHO_HEARING_NOTE = 'The World Health Organization grades of hearing loss (World report on hearing, Geneva, 2021) are read from the average of the thresholds at 0.5, 1, 2 and 4 kHz in the BETTER ear. Under 20 decibels is grade 0, no impairment; 20 to under 35 is grade 1, mild; 35 to under 50 is grade 2, moderate; 50 to under 65 is grade 3, moderately severe; 65 to under 80 is grade 4, severe; 80 to under 95 is grade 5, profound; and 95 or more is grade 6, complete or total. The steps are an even 15 decibels by design. The 2021 revision also created a separate category for a loss in one ear only, defined as a better ear under 20 decibels with a worse ear at 35 decibels or more. That category exists because a deaf ear beside a normal one has no honest place on the bilateral scale: graded on the better ear it comes out as no impairment, which describes the hearing but not the disability, and graded on the worse ear it comes out as profound, which describes neither. Two other things are worth knowing. The grade is the better ear and only the better ear, so reading the worse one over-calls every asymmetric loss. And mild begins at 20 decibels rather than the 26 used by the earlier grading, so a whole band from 20 to 25 disappears if the old line is used. The average has to include 4 kHz; a three-frequency average over 0.5, 1 and 2 kHz is a different number and under-calls hearing loss caused by noise or by age, where the high frequencies are the worst. It applies a published grading to thresholds already measured. It does not interpret the shape of an audiogram, separate conductive from sensorineural loss, or select a device.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const GRADES = [
  { max: 20, grade: 0, label: 'grade 0, no impairment' },
  { max: 35, grade: 1, label: 'grade 1, mild' },
  { max: 50, grade: 2, label: 'grade 2, moderate' },
  { max: 65, grade: 3, label: 'grade 3, moderately severe' },
  { max: 80, grade: 4, label: 'grade 4, severe' },
  { max: 95, grade: 5, label: 'grade 5, profound' },
  { max: Infinity, grade: 6, label: 'grade 6, complete or total' },
];

function gradeFor(pta) {
  return GRADES.find((g) => pta < g.max);
}

function earAverage(o, prefix) {
  const direct = num(o[`${prefix}Pta`]);
  if (direct !== null) return { pta: direct, derived: false };
  const vals = ['500', '1000', '2000', '4000'].map((f) => num(o[`${prefix}${f}`]));
  if (vals.some((v) => v === null)) return { pta: null, derived: false };
  return { pta: Math.round((vals.reduce((a, b) => a + b, 0) / 4) * 10) / 10, derived: true };
}

export function whoHearingGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const all = ['right', 'left'].flatMap((e) => ['500', '1000', '2000', '4000'].map((f) => o[`${e}${f}`]).concat([o[`${e}Pta`]]));
  for (const v of all) {
    const n = num(v);
    if (n !== null && (n < -10 || n > 130)) {
      return { valid: false, message: 'A hearing threshold is outside a plausible range of -10 to 130 dB.' };
    }
  }

  const right = earAverage(o, 'right');
  const left = earAverage(o, 'left');

  if (right.pta === null && left.pta === null) {
    return { valid: false, message: 'Enter the thresholds at 0.5, 1, 2 and 4 kHz for at least one ear, or that ear\'s four-frequency average.' };
  }

  const oneEarOnly = right.pta === null || left.pta === null;
  const better = oneEarOnly ? (right.pta === null ? left.pta : right.pta) : Math.min(right.pta, left.pta);
  const worse = oneEarOnly ? null : Math.max(right.pta, left.pta);

  const unilateral = !oneEarOnly && better < 20 && worse >= 35;
  const graded = unilateral ? null : gradeFor(better);

  const state = unilateral
    ? 'hearing loss in one ear, which is its own category and not a grade'
    : `${graded.label}, from a better-ear average of ${better} dB`;

  // The error this tile exists to prevent: forcing an asymmetric loss onto the bilateral scale.
  const unilateralNote = unilateral
    ? `The better ear averages ${better} dB and the worse ear ${worse} dB. The 2021 revision made that its own category rather than a grade, because a deaf ear beside a normal one has no honest place on the bilateral scale: read on the better ear it is grade 0, which describes the hearing but not the disability, and read on the worse ear it is grade 5, which describes neither.`
    : null;

  const betterEarNote = !oneEarOnly && !unilateral && worse > better
    ? `The grade is the better ear and only the better ear. This one averages ${better} dB; the other averages ${worse} dB and does not set the grade. Reading the worse ear would return ${gradeFor(worse).label} and over-call it.`
    : null;

  const oldThresholdNote = !unilateral && better >= 20 && better < 26
    ? `A better-ear average of ${better} dB is mild under this grading, which starts mild at 20 dB. The earlier WHO grading started at 26, and read against that line this is normal. The whole 20 to 25 dB band disappears if the old threshold is used.`
    : null;

  const singleEarNote = oneEarOnly
    ? 'Only one ear is entered. The grade is defined on the better of the two, and the separate one-ear category needs both, so enter the other ear before relying on this.'
    : null;

  const frequencyNote = (right.derived || left.derived)
    ? 'The average is over four frequencies including 4 kHz. A three-frequency average over 0.5, 1 and 2 kHz is a different number, and it under-calls hearing loss caused by noise or by age, where the high frequencies are the worst.'
    : null;

  const scopeNote = 'This applies a published grading to thresholds already measured. It does not interpret the shape of an audiogram, separate conductive from sensorineural loss, or select a device.';

  return {
    valid: true,
    rightPta: right.pta,
    leftPta: left.pta,
    betterEarPta: better,
    worseEarPta: worse,
    grade: graded ? graded.grade : null,
    gradeLabel: graded ? graded.label : 'hearing loss in one ear',
    unilateral,
    oneEarOnly,
    state,
    unilateralNote,
    betterEarNote,
    oldThresholdNote,
    singleEarNote,
    frequencyNote,
    scopeNote,
    abnormal: unilateral || (graded && graded.grade > 0),
    bandLabel: unilateral ? 'Hearing loss in one ear' : graded.label,
    band: `WHO hearing grade — ${state}.`,
    detail: 'Each ear averages its thresholds at 0.5, 1, 2 and 4 kHz, and the grade is read from the better ear: under 20 dB is grade 0, then 15 dB steps to grade 5 at 80 to under 95, and grade 6 at 95 or more. A better ear under 20 dB with a worse ear at 35 dB or more is loss in one ear, a separate category rather than a grade.',
    note: WHO_HEARING_NOTE,
  };
}
