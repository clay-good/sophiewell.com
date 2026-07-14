// spec-v308: Graduated Return-to-Learn (RTL) strategy after sport-related
// concussion — the school companion to the return-to-sport tile (spec-v298). A
// student-athlete follows both: full RTL is completed before unrestricted RTS.
// Given the RTL step (1-4) the tile reports the mental activity, the activity at
// that step, and the goal.
//
// This reports the consensus strategy's own descriptors, NOT a clearance decision
// (spec-v11 §5.3) — the return-to-learn plan stays with the clinician, family, and
// school.
//
// TABLE RE-FETCHED, NEVER RECALLED (spec-v97), summarised in the tile's own words
// from Table 1 of the primary consensus statement (read directly from the fetched
// PDF) and cross-verified against the return-to-sport strategy (Table 2) shipped in
// spec-v298:
//   - Patricios JS, Schneider KJ, Dvorak J, et al. Consensus statement on
//     concussion in sport: the 6th International Conference on Concussion in
//     Sport-Amsterdam, October 2022. Br J Sports Med. 2023;57(11):695-711.
//     doi:10.1136/bjsports-2023-106898. (Table 1, RTL strategy.)

// Steps ordered 1..4. Descriptors are summarised, not reproduced verbatim.
const STEPS = [
  { step: 1, mental: 'Symptom-limited daily activity', activity: 'Typical daily activities (eg, reading) that do not more than mildly worsen symptoms, minimising screen time; start with 5-15 minutes at a time and build up gradually. Begin after the initial 24-48 h of relative rest.', goal: 'Gradual return to typical activities.' },
  { step: 2, mental: 'School activities (out of the classroom)', activity: 'Homework, reading, or other cognitive activities done outside of the classroom.', goal: 'Increase tolerance to cognitive work.' },
  { step: 3, mental: 'Return to school part time', activity: 'Gradual reintroduction of schoolwork; may need to start with a partial school day or with more frequent rest breaks and academic supports.', goal: 'Increase academic activities.' },
  { step: 4, mental: 'Return to school full time', activity: 'Gradually build back to a full school day tolerated without more than mild symptom worsening.', goal: 'Return to full academic activities and catch up on missed work.' },
];

const STEP_INDEX = new Map(STEPS.map((s, i) => [s.step, i]));

const NOTE = 'Graduated Return-to-Learn (RTL) strategy after sport-related concussion (Amsterdam 2022 consensus, Table 1). After an initial 24-48 h of relative rest, the student increases cognitive load one step at a time. Progression is symptom-limited: slow down (or drop back) whenever an activity causes more than a mild and brief symptom worsening (an increase of more than 2 points on a 0-10 scale for under an hour). A full RTL is completed before unrestricted return to sport. This reports the consensus strategy descriptor, not a clearance decision, which stays with the clinician, family, and school.';

// input.step: one of 1..4 (accepts a number or the string '1'..'4'). Returns the
// mental activity, the activity, and the goal for that step.
export function concussionRtlStep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = typeof o.step === 'string' ? o.step.trim() : o.step;
  if (raw === '' || raw === undefined || raw === null) {
    return { valid: false, message: 'Select the return-to-learn step (1-4).' };
  }
  const step = Number(raw);
  if (!Number.isInteger(step) || !STEP_INDEX.has(step)) {
    throw new RangeError('Return-to-learn step must be an integer from 1 to 4.');
  }
  const entry = STEPS[STEP_INDEX.get(step)];
  const finalStep = step === 4;

  let band = `Return-to-learn Step ${entry.step} of 4: ${entry.mental}. Progress only if symptoms do not more than mildly and briefly worsen.`;
  if (finalStep) {
    band += ' Complete a full return to learn before unrestricted return to sport.';
  }

  return {
    valid: true,
    step: entry.step,
    mental: entry.mental,
    activity: entry.activity,
    goal: entry.goal,
    finalStep,
    abnormal: false,
    bandLabel: `RTL Step ${entry.step}`,
    band,
    note: NOTE,
  };
}
