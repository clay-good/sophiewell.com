// spec-v298: Graduated Return-to-Sport (RTS) strategy after sport-related
// concussion (a noted catalog gap from the spec-v293 search sweep). Given the
// RTS step (1-6) the tile reports the exercise strategy, the activity at that
// step, the goal, and the gates the consensus places on progression (symptom
// resolution before Steps 4-6; an HCP's written determination of readiness
// before unrestricted return to sport).
//
// This reports the consensus strategy's own descriptors, NOT a clearance
// decision (spec-v11 §5.3) — the medical determination of readiness stays with
// the clinician.
//
// TABLE RE-FETCHED, NEVER RECALLED (spec-v97), transcribed verbatim from Table 2
// of the primary consensus statement and cross-verified against independent
// reproductions (Cleveland Clinic, Parachute/Coach.ca return-to-sport strategy
// handouts) that agree on the six-step ladder and the >=24h-per-step /
// drop-back-if-symptoms rule:
//   - Patricios JS, Schneider KJ, Dvorak J, et al. Consensus statement on
//     concussion in sport: the 6th International Conference on Concussion in
//     Sport-Amsterdam, October 2022. Br J Sports Med. 2023;57(11):695-711.
//     doi:10.1136/bjsports-2023-106898. (Table 2, RTS strategy.)

// Steps ordered 1..6. `resolution` marks the steps the consensus says must not
// begin until symptoms (and cognitive/clinical findings, including after
// exertion) have resolved. `clearance` marks the steps a written HCP
// determination of readiness gates (full contact and unrestricted RTS).
const STEPS = [
  { step: 1, strategy: 'Symptom-limited activity', activity: 'Daily activities that do not exacerbate symptoms (eg, walking). Begin within 24-48 h of injury.', goal: 'Gradual reintroduction of work/school activities.', resolution: false, clearance: false },
  { step: 2, strategy: 'Aerobic exercise — 2A light (up to ~55% max HR), then 2B moderate (up to ~70% max HR)', activity: 'Stationary cycling or walking at slow to medium pace. May start light resistance training that does not cause more than mild, brief symptom exacerbation.', goal: 'Increase heart rate.', resolution: false, clearance: false },
  { step: 3, strategy: 'Individual sport-specific exercise', activity: 'Sport-specific training away from the team environment (eg, running, change of direction, individual drills). No activities at risk of head impact — if head impact is possible, medical clearance should occur before Step 3.', goal: 'Add movement and change of direction.', resolution: false, clearance: false },
  { step: 4, strategy: 'Non-contact training drills', activity: 'Higher-intensity, more challenging drills (eg, passing drills, multiplayer training); may integrate into a team environment.', goal: 'Resume usual intensity of exercise, coordination and increased thinking.', resolution: true, clearance: false },
  { step: 5, strategy: 'Full contact practice', activity: 'Participate in normal training activities (following medical clearance).', goal: 'Restore confidence and assess functional skills by coaching staff.', resolution: true, clearance: true },
  { step: 6, strategy: 'Return to sport', activity: 'Normal game play.', goal: 'Unrestricted return to sport.', resolution: true, clearance: true },
];

const STEP_INDEX = new Map(STEPS.map((s, i) => [s.step, i]));

const NOTE = 'Graduated Return-to-Sport (RTS) strategy after sport-related concussion (Amsterdam 2022 consensus, Table 2). Each step typically takes a minimum of 24 hours, so the full strategy takes at least ~1 week; typical unrestricted RTS can take up to ~1 month. If more than mild/brief symptom exacerbation (>2 points on a 0-10 scale) occurs during Steps 1-3, stop and try again the next day; symptoms during Steps 4-6 mean returning to Step 3. Steps 4-6 begin only after symptoms and cognitive/clinical findings have resolved, including with and after exertion; a written HCP determination of readiness is required before unrestricted RTS. This reports the consensus strategy descriptor, not a clearance decision; the medical determination of readiness stays with the clinician.';

// input.step: one of 1..6 (accepts a number or the string '1'..'6'). Returns the
// exercise strategy, activity, goal, and the symptom-resolution / HCP-clearance
// gate flags for that step.
export function concussionRtsStep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = typeof o.step === 'string' ? o.step.trim() : o.step;
  if (raw === '' || raw === undefined || raw === null) {
    return { valid: false, message: 'Select the return-to-sport step (1-6).' };
  }
  const step = Number(raw);
  if (!Number.isInteger(step) || !STEP_INDEX.has(step)) {
    throw new RangeError('Return-to-sport step must be an integer from 1 to 6.');
  }
  const entry = STEPS[STEP_INDEX.get(step)];
  const resolutionRequired = entry.resolution;
  const clearanceRequired = entry.clearance;

  let band = `Return-to-sport Step ${entry.step}: ${entry.strategy}. Each step typically takes a minimum of 24 hours; progress only if symptoms do not more than mildly and briefly worsen.`;
  if (resolutionRequired) {
    band += ' Begin only after full resolution of symptoms and cognitive/clinical findings, including with and after exertion.';
  }
  if (clearanceRequired) {
    band += ' A written HCP determination of readiness is required before this step.';
  }

  return {
    valid: true,
    step: entry.step,
    strategy: entry.strategy,
    activity: entry.activity,
    goal: entry.goal,
    resolutionRequired,
    clearanceRequired,
    abnormal: resolutionRequired,
    bandLabel: `RTS Step ${entry.step}`,
    band,
    note: NOTE,
  };
}
