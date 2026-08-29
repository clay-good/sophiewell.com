// spec-v856: the five essential IRLSSG criteria for restless legs syndrome.
//
// Source:
//   Allen RP, Picchietti DL, Garcia-Borreguero D, et al. Restless legs syndrome / Willis-Ekbom
//   disease diagnostic criteria: updated International Restless Legs Syndrome Study Group
//   consensus criteria. Sleep Med. 2014;15(8):860-873.
//
//   1  An urge to move the legs, usually with an uncomfortable sensation in them.
//   2  It begins or worsens during rest or inactivity.
//   3  It is partly or wholly relieved by movement, for as long as the movement continues.
//   4  It is worse in the evening or at night than during the day.
//   5  It is not better accounted for by another condition.
//
//   ALL FIVE ARE ESSENTIAL. This is not a score and four of five is not a partial diagnosis.
//
// THE FIFTH CRITERION IS THE WHOLE POINT, AND THAT IS WHY THIS TILE EXISTS. The first four are
// met by a long list of ordinary things - leg cramps, positional discomfort, myalgia, venous
// stasis, leg edema, arthritis, habitual foot tapping. Each is an uncomfortable leg, worse at
// rest, better on moving and worse at the end of the day. The 2014 revision added the fifth
// criterion for exactly that reason.
//
// CRITERION 4 IS A COMPARISON, not an absolute: worse in the evening or night THAN DURING THE
// DAY. Symptoms equally bad at every hour do not satisfy it.
//
// THE TWO SPECIFIERS ARE NOT CRITERIA. Clinical significance is distress or interference with
// sleep or functioning. The course is chronic-persistent at an average of at least twice a week
// over the past year, and intermittent below that with at least five events in a lifetime.
//
// Pure: no DOM, no clock, no network.

export const RLS_NOTE = 'The criteria for restless legs syndrome (Allen RP, Picchietti DL, Garcia-Borreguero D, et al, Sleep Medicine 2014;15(8):860-873) are five, and all five are essential rather than scored. There has to be an urge to move the legs, usually with an uncomfortable sensation in them; it has to begin or worsen during rest or inactivity; it has to be partly or wholly relieved by movement for as long as the movement continues; it has to be worse in the evening or at night than during the day; and it must not be better accounted for by another condition. That last one is the reason the criteria were revised in 2014. The first four are satisfied by a long list of ordinary things, including leg cramps, positional discomfort, muscle pain, venous stasis, swollen legs, arthritis and habitual foot tapping, each of which is an uncomfortable leg that is worse at rest, better on moving and worse at the end of the day. Applying only the first four therefore picks up a great many people who do not have this condition, and the fifth criterion was added to stop that. Note also that the fourth criterion is a comparison rather than an absolute: symptoms equally bad at every hour of the day do not satisfy it. Two specifiers sit alongside the criteria without being criteria themselves. Symptoms are clinically significant when they cause distress or interfere with sleep or with functioning at work, at home or socially. The course is chronic-persistent when symptoms occur on average at least twice a week over the past year and intermittent when they occur less often than that, with at least five events in a lifetime. It applies published criteria to a history already taken. It does not select treatment and it does not assess iron status, which is a separate question.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const ESSENTIAL = [
  { arg: 'urge', n: 1, name: 'an urge to move the legs, usually with an uncomfortable sensation' },
  { arg: 'atRest', n: 2, name: 'it begins or worsens during rest or inactivity' },
  { arg: 'relievedByMovement', n: 3, name: 'it is relieved by movement for as long as the movement continues' },
  { arg: 'worseAtNight', n: 4, name: 'it is worse in the evening or at night than during the day' },
  { arg: 'notOtherCondition', n: 5, name: 'it is not better accounted for by another condition' },
];

const MIMICS = 'leg cramps, positional discomfort, muscle pain, venous stasis, swollen legs, arthritis and habitual foot tapping';

export function rlsCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const met = ESSENTIAL.filter((c) => truthy(o[c.arg]));
  const missing = ESSENTIAL.filter((c) => !truthy(o[c.arg]));
  const allMet = missing.length === 0;

  const significant = truthy(o.clinicallySignificant);
  const twiceWeekly = truthy(o.twiceWeeklyPastYear);
  const fiveLifetime = truthy(o.fiveLifetimeEvents);

  const firstFour = ESSENTIAL.slice(0, 4).every((c) => truthy(o[c.arg]));
  const fifthOnly = firstFour && !truthy(o.notOtherCondition);

  let course = null;
  if (allMet) {
    if (twiceWeekly) course = 'chronic-persistent: on average at least twice a week over the past year';
    else if (fiveLifetime) course = 'intermittent: less often than twice a week on average, with at least five events in a lifetime';
    else course = null;
  }

  const state = allMet
    ? 'all five essential criteria are met'
    : `${met.length} of the five essential criteria are recorded`;

  // The error this tile exists to prevent: the first four without the fifth.
  const mimicNote = fifthOnly
    ? `The first four criteria are met and the fifth is not recorded, so the diagnosis is NOT established. The first four are satisfied by a long list of ordinary things - ${MIMICS} - each of which is an uncomfortable leg that is worse at rest, better on moving and worse at the end of the day. The fifth criterion was added in 2014 for exactly that reason.`
    : null;

  const fifthNote = allMet
    ? `The fifth criterion is the one that carries the specificity: ${MIMICS} all satisfy the first four. Recording it as met means those have actually been considered and set aside.`
    : null;

  const notAScoreNote = !allMet && !fifthOnly && met.length > 0
    ? 'All five are essential, so this is not a score and a partial set is not a partial diagnosis. What is missing: ' + missing.map((c) => `criterion ${c.n}, ${c.name}`).join('; ') + '.'
    : null;

  const comparisonNote = !truthy(o.worseAtNight) && met.length >= 3
    ? 'The fourth criterion is a comparison rather than an absolute: worse in the evening or at night THAN DURING THE DAY. Symptoms equally bad at every hour do not satisfy it.'
    : null;

  const significanceNote = allMet
    ? (significant
      ? 'Clinically significant: the symptoms cause distress or interfere with sleep or with functioning. That is a specifier, not a criterion.'
      : 'Clinical significance is not recorded. It is a specifier rather than a criterion, so it does not change whether the criteria are met.')
    : null;

  const courseNote = allMet && !course
    ? 'The course is not recorded. It is chronic-persistent at an average of at least twice a week over the past year, and intermittent below that with at least five events in a lifetime. Neither is a criterion.'
    : null;

  const scopeNote = 'This applies published criteria to a history already taken. It does not select treatment, and it does not assess iron status, which is a separate question.';

  return {
    valid: true,
    criteriaMet: allMet,
    metCount: met.length,
    metCriteria: met.map((c) => c.n),
    missingCriteria: missing.map((c) => c.n),
    firstFourMet: firstFour,
    clinicallySignificant: significant,
    course,
    state,
    mimicNote,
    fifthNote,
    notAScoreNote,
    comparisonNote,
    significanceNote,
    courseNote,
    scopeNote,
    abnormal: allMet,
    bandLabel: allMet ? 'Criteria met' : 'Criteria not met',
    band: allMet
      ? `Restless legs criteria met — all five essential criteria${course ? `, ${course}` : ''}.`
      : `Restless legs criteria not met — ${state}.`,
    detail: 'The five essential criteria are an urge to move the legs usually with an uncomfortable sensation, beginning or worsening during rest, relieved by movement for as long as it continues, worse in the evening or at night than during the day, and not better accounted for by another condition. All five are required. Clinical significance and the course are specifiers rather than criteria.',
    note: RLS_NOTE,
  };
}
