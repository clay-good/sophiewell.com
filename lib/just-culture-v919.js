// spec-v919: the Just Culture behavior categories, and the response each one calls for.
//
// Sources:
//   Marx D. Patient Safety and the "Just Culture": A Primer for Health Care Executives. New York:
//   Columbia University; 2001.
//   Agency for Healthcare Research and Quality. Patient Safety Network primer: Culture of Safety.
//
//   HUMAN ERROR      an inadvertent slip, lapse or mistake. CONSOLE the person, and examine the
//                    system around them: the process, the procedure, the training, the design,
//                    the environment.
//   AT-RISK BEHAVIOR a choice where the risk was not seen, or was mistakenly believed justified.
//                    COACH: remove the incentives that made the risky choice attractive, create
//                    incentives for the safe one, and increase situational awareness.
//   RECKLESS         a conscious disregard of a substantial and unjustifiable risk. DISCIPLINE,
//                    and it does not depend on how it turned out.
//
// THE RESPONSE FOLLOWS THE BEHAVIOR, NOT THE OUTCOME. Two people who do exactly the same thing
// get exactly the same response, whether the patient was unharmed or died. Judging by outcome is
// the thing this model exists to replace, so the outcome is taken as an input here and then
// reported as having changed nothing.
//
// "CONSOLE" IS A RESPONSE, NOT THE ABSENCE OF ONE. Human error is where the system gets examined,
// and that is where the work is.
//
// A REPEAT OF THE SAME AT-RISK CHOICE AFTER COACHING is a reason to look at whether the coaching
// and the incentives around it actually changed anything -- before escalating. Escalating because
// the second time happened to end badly is the same outcome-based judgment under another name.
//
// Pure: no DOM, no clock, no network.

export const JUST_CULTURE_NOTE = 'Just Culture sorts what happened into three behaviors and attaches a response to each. Human error is an inadvertent slip, lapse or mistake: console the person and examine the system around them -- the process, the procedure, the training, the design, the environment. At-risk behavior is a choice where the risk was not seen or was mistakenly believed justified: coach, by removing the incentives that made the risky choice attractive, creating incentives for the safe one, and increasing situational awareness. Reckless behavior is a conscious disregard of a substantial and unjustifiable risk: discipline, and it does not depend on how it turned out. Three things are worth stating plainly. The response follows the behavior and not the outcome -- two people who do exactly the same thing get exactly the same response whether the patient was unharmed or died, and judging by outcome is the thing this model exists to replace. Console is a response and not the absence of one: human error is where the system gets examined, and that is where the work is. And a repeat of the same at-risk choice after coaching is a reason to ask whether the coaching and the incentives around it changed anything, before escalating; escalating because the second time ended badly is outcome-based judgment under another name. This reports the published response for a behavior someone has already characterized. It does not characterize the behavior, and it is not a disciplinary decision.';

export const BEHAVIOR_OPTIONS = [
  { value: 'unset', text: 'Not yet characterized' },
  { value: 'human-error', text: 'Human error - an inadvertent slip, lapse or mistake' },
  { value: 'at-risk', text: 'At-risk - a choice whose risk was not seen or was believed justified' },
  { value: 'reckless', text: 'Reckless - conscious disregard of a substantial, unjustifiable risk' },
  { value: 'knowing-harm', text: 'Knowingly caused harm, or knowingly violated a rule to cause it' },
];

export const OUTCOME_OPTIONS = [
  { value: 'unset', text: 'Not recorded' },
  { value: 'none', text: 'No harm reached the patient' },
  { value: 'minor', text: 'Minor or temporary harm' },
  { value: 'serious', text: 'Serious or permanent harm' },
  { value: 'death', text: 'Death' },
];

const RESPONSES = {
  'human-error': {
    label: 'Console, and examine the system',
    text: 'Console the person. The work is in the system around them: the process, the procedure, the training, the design and the environment that let an inadvertent slip reach a patient.',
  },
  'at-risk': {
    label: 'Coach',
    text: 'Coach. Remove the incentives that made the risky choice attractive, create incentives for the safe one, and increase situational awareness so the risk is seen next time.',
  },
  reckless: {
    label: 'Disciplinary action',
    text: 'Disciplinary action, and it does not depend on how this turned out. Reckless means a substantial and unjustifiable risk was seen and disregarded.',
  },
  'knowing-harm': {
    label: 'Outside this model',
    text: 'This is outside the model. Knowingly causing harm goes to local policy and, where it applies, to the law - not to a behavior-and-response table.',
  },
};

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function justCulture(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const behavior = RESPONSES[String(o.behavior)] ? String(o.behavior) : 'unset';
  const outcome = OUTCOME_OPTIONS.some((x) => x.value === String(o.outcome)) ? String(o.outcome) : 'unset';
  const repeated = on(o.repeatedAfterCoaching);

  if (behavior === 'unset') {
    return { valid: false, message: 'Characterize the behavior first. The response follows from what the person did, and nothing else here can stand in for that.' };
  }

  const response = RESPONSES[behavior];

  // The outcome is taken and then reported as having changed nothing. That is the point.
  const outcomeText = OUTCOME_OPTIONS.find((x) => x.value === outcome).text;
  const outcomeNote = outcome === 'unset'
    ? 'No outcome was recorded, and none is needed: the response follows the behavior. Two people who do the same thing get the same response whether the patient was unharmed or died.'
    : `Recorded outcome: ${outcomeText.toLowerCase()}. It did not change the answer above, and that is deliberate - the response follows the behavior, and judging by outcome is what this model exists to replace.`;

  const repeatNote = behavior === 'at-risk' && repeated
    ? 'This is a repeat of the same at-risk choice after coaching. That is a reason to ask whether the coaching and the incentives around it actually changed anything, before escalating. Escalating because the second time ended badly is outcome-based judgment under another name.'
    : behavior === 'at-risk'
      ? 'If the same at-risk choice repeats after coaching, the first question is whether the coaching and the incentives around it changed anything.'
      : 'The repeat question belongs to at-risk behavior, where coaching is what is being tested.';

  const consoleNote = behavior === 'human-error'
    ? 'Console is a response, not the absence of one. Human error is where the system gets examined, and that is where the work is.'
    : 'For human error the response is to console and examine the system - that is a response, not the absence of one.';

  const scopeNote = 'This reports the published response for a behavior someone has already characterized. It does not characterize the behavior, and it is not a disciplinary decision.';

  return {
    valid: true,
    behavior,
    outcome,
    repeated,
    response: response.text,
    outcomeNote,
    repeatNote,
    consoleNote,
    scopeNote,
    // Nothing here is normal or abnormal; a behavior is not a lab value.
    abnormal: behavior === 'reckless' || behavior === 'knowing-harm',
    bandLabel: response.label,
    band: response.text,
    detail: 'Human error is an inadvertent slip, lapse or mistake and calls for consoling the person and examining the system. At-risk behavior is a choice whose risk was not seen or was believed justified, and calls for coaching. Reckless behavior is conscious disregard of a substantial, unjustifiable risk, and calls for disciplinary action.',
    note: JUST_CULTURE_NOTE,
  };
}
