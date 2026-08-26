// spec-v793: Simple Shoulder Test (SST).
//
// Source:
//   Lippitt SB, Harryman DT, Matsen FA. A practical tool for evaluating function: the
//   Simple Shoulder Test. In: Matsen FA, Fu FH, Hawkins RJ, eds. The Shoulder: A Balance
//   of Mobility and Stability. Rosemont: AAOS; 1993:501-518.
//
// Twelve yes-or-no questions about what the shoulder can actually do. Yes scores 1 and no
// scores 0, so the total runs 0 to 12 and HIGHER IS BETTER - 12 is a shoulder that does
// everything asked of it.
//
// Two questions cover comfort, three cover reach, six cover strength and carrying, and the
// last covers work. There are no subscales and no weights: every question counts the same.
//
// The percentage is the total divided by 12, multiplied by 100. Published descriptions
// divide either by 12 or by the number of questions answered; this tile requires all
// twelve, so the two rules give the same number and the ambiguity cannot bite.
//
// Pure: no DOM, no clock, no network.

export const SST_NOTE = 'The Simple Shoulder Test (Lippitt SB, Harryman DT, Matsen FA, 1993) asks twelve plain yes-or-no questions about what a shoulder can actually do: whether it is comfortable at rest and in bed, whether it can reach behind the back and behind the head, whether it can lift a pint, a gallon and twenty pounds, whether it can throw, wash the opposite shoulder, and hold down a full-time job. Each yes scores one point, so the total runs from 0 to 12 and higher is better, with 12 meaning a shoulder that does everything asked of it. There are no subscales and no weights; every question counts the same, which is the point of the instrument. It records what a patient reports they can do and is most useful compared against the same shoulder before and after treatment, so it is not an examination, a diagnosis, or a decision about surgery.';

export const QUESTIONS = [
  { arg: 'comfortAtRest', text: 'shoulder comfortable with the arm at rest by the side' },
  { arg: 'sleepComfortably', text: 'shoulder allows sleeping comfortably' },
  { arg: 'reachSmallOfBack', text: 'can reach the small of the back to tuck in a shirt' },
  { arg: 'handBehindHead', text: 'can place the hand behind the head with the elbow out to the side' },
  { arg: 'coinOnShelf', text: 'can place a coin on a shelf at shoulder level without bending the elbow' },
  { arg: 'liftOnePound', text: 'can lift one pound to shoulder level without bending the elbow' },
  { arg: 'liftEightPounds', text: 'can lift eight pounds to shoulder level without bending the elbow' },
  { arg: 'carryTwentyPounds', text: 'can carry twenty pounds at the side' },
  { arg: 'tossUnderhand', text: 'could toss a ball underhand twenty yards' },
  { arg: 'tossOverhand', text: 'could toss a ball overhand twenty yards' },
  { arg: 'washOppositeShoulder', text: 'can wash the back of the opposite shoulder' },
  { arg: 'workFullTime', text: 'shoulder allows working full-time at the regular job' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function simpleShoulderTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const yes = QUESTIONS.filter((q) => truthy(o[q.arg]));
  const score = yes.length;
  const percent = Math.round((score / QUESTIONS.length) * 1000) / 10;

  return {
    valid: true,
    score,
    percent,
    yesAnswers: yes.map((q) => q.text),
    // Higher is better here, so a LOW score is the state worth noticing.
    abnormal: score < 12,
    bandLabel: `Simple Shoulder Test ${score} of 12`,
    band: `Simple Shoulder Test ${score} of 12 (${percent.toFixed(1)}%) — higher is better; 12 is a shoulder that does everything asked of it.`,
    detail: 'Each yes scores 1 and each no scores 0, giving 0 to 12. There are no subscales and no weights: every question counts the same. The percentage is the total divided by 12. Most useful compared against the same shoulder before and after treatment rather than read as a single number.',
    note: SST_NOTE,
  };
}
