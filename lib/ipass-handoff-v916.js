// spec-v916: the I-PASS handoff structure, and a check on whether the handoff is finished.
//
// Source:
//   Starmer AJ, Spector ND, Srivastava R, et al. Changes in medical errors after implementation
//   of a resident handoff bundle. N Engl J Med. 2014;371(19):1803-1812.
//
//   I  Illness severity -- stable, "watcher", or unstable.
//   P  Patient summary -- the summary statement, the events leading to admission, the hospital
//      course so far, the ongoing assessment and the plan.
//   A  Action list -- what is to be done, by when, and by whom.
//   S  Situation awareness and contingency planning -- what to watch for, and what to do if it
//      happens.
//   S  Synthesis by the receiver -- the receiver summarizes it back, asks questions, and restates
//      the key actions.
//
// THE SECOND S IS THE ONE THAT GETS DROPPED, AND IT IS THE ONE THE EVIDENCE RESTS ON. A handoff
// is not finished when the sender stops talking; it is finished when the receiver has said it
// back. So this reports the synthesis separately from the rest and says plainly when it is
// missing, rather than counting it as one blank among five.
//
// "WATCHER" IS A CATEGORY, NOT A HEDGE. It names a patient someone is worried about who is not
// yet unstable, and it exists so that worry is handed over rather than left with the person going
// home.
//
// THE MNEMONIC ORDERS WHAT IS SAID. It does not shorten it, and it does not replace the
// conversation.
//
// Pure: no DOM, no clock, no network.

export const IPASS_NOTE = 'I-PASS orders a handoff into five parts. Illness severity is stable, watcher or unstable. Patient summary carries the summary statement, the events leading to admission, the hospital course, the ongoing assessment and the plan. Action list says what is to be done, by when and by whom. Situation awareness and contingency planning says what to watch for and what to do if it happens. Synthesis by the receiver is the receiver summarizing it back, asking questions and restating the key actions. Three things are worth stating plainly. The second S is the part that gets dropped and it is the part the evidence rests on: a handoff is not finished when the sender stops talking, it is finished when the receiver has said it back, so it is reported separately here rather than counted as one blank among five. Watcher is a category and not a hedge -- it names a patient someone is worried about who is not yet unstable, and it exists so that worry is handed over rather than left with the person going home. And the mnemonic orders what is said; it does not shorten it and it does not replace the conversation. Nothing entered here is sent anywhere or stored.';

export const ILLNESS_SEVERITY_OPTIONS = [
  { value: 'unset', text: 'Not recorded' },
  { value: 'stable', text: 'Stable' },
  { value: 'watcher', text: 'Watcher - not unstable, but a patient to worry about' },
  { value: 'unstable', text: 'Unstable' },
];

const SEVERITY_TEXT = {
  stable: 'Stable',
  watcher: 'Watcher - not unstable, but a patient to worry about',
  unstable: 'Unstable',
};

export const SECTIONS = [
  { key: 'illnessSeverity', letter: 'I', heading: 'Illness severity' },
  { key: 'patientSummary', letter: 'P', heading: 'Patient summary' },
  { key: 'actionList', letter: 'A', heading: 'Action list' },
  { key: 'situationAwareness', letter: 'S', heading: 'Situation awareness and contingency planning' },
  { key: 'synthesisByReceiver', letter: 'S', heading: 'Synthesis by the receiver' },
];

function text(v) {
  return typeof v === 'string' ? v.trim() : '';
}

export function ipassHandoff(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const severity = SEVERITY_TEXT[String(o.illnessSeverity)] ? String(o.illnessSeverity) : 'unset';
  const values = {
    illnessSeverity: severity === 'unset' ? '' : SEVERITY_TEXT[severity],
    patientSummary: text(o.patientSummary),
    actionList: text(o.actionList),
    situationAwareness: text(o.situationAwareness),
    synthesisByReceiver: text(o.synthesisByReceiver),
  };

  const filled = SECTIONS.filter((s) => values[s.key]);
  const missing = SECTIONS.filter((s) => !values[s.key]);
  const synthesisRecorded = Boolean(values.synthesisByReceiver);

  const handoff = SECTIONS
    .map((s) => `${s.letter} - ${s.heading}:\n${values[s.key] || '(blank)'}`)
    .join('\n\n');

  // The synthesis is reported on its own, not as one blank among five.
  const synthesisNote = synthesisRecorded
    ? 'The receiver has summarized it back. That is the step the evidence rests on, and it is the one most often skipped.'
    : 'The receiver has not summarized it back. That is the step the evidence rests on and the one most often skipped: a handoff is not finished when the sender stops talking, it is finished when the receiver has said it back.';

  const missingOther = missing.filter((s) => s.key !== 'synthesisByReceiver');

  const bandLabel = synthesisRecorded && !missingOther.length
    ? 'Complete'
    : !synthesisRecorded && missingOther.length
      ? 'Not finished, and parts are blank'
      : synthesisRecorded
        ? 'Parts are blank'
        : 'Not finished';

  const band = synthesisRecorded && !missingOther.length
    ? 'All five parts are recorded, including the receiver summarizing it back.'
    : !synthesisRecorded && !missingOther.length
      ? 'Four parts are recorded and the receiver has not summarized it back, so the handoff is not finished.'
      : `${missingOther.length} of the first four parts ${missingOther.length === 1 ? 'is' : 'are'} blank: ${missingOther.map((s) => s.heading.toLowerCase()).join(', ')}.${synthesisRecorded ? '' : ' The receiver has also not summarized it back.'}`;

  const watcherNote = severity === 'watcher'
    ? 'Watcher is a category, not a hedge between stable and unstable. It names a patient someone is worried about who is not yet unstable, and it exists so that worry is handed over rather than left with the person going home.'
    : 'Illness severity has three levels, and watcher is one of them rather than a hedge: it names a patient someone is worried about who is not yet unstable.';

  const structureNote = 'The mnemonic orders what is said. It does not shorten it, and it does not replace the conversation.';

  const privacyNote = 'Nothing entered here is sent anywhere or stored. It is assembled in the page and goes when the page does.';

  const scopeNote = 'This lays out a handoff in a published structure and says which parts are blank. It does not judge whether what was written is right.';

  return {
    valid: true,
    severity,
    handoff,
    sections: SECTIONS.map((s) => ({ ...s, value: values[s.key], filled: Boolean(values[s.key]) })),
    filledCount: filled.length,
    missing: missing.map((s) => s.heading),
    synthesisRecorded,
    synthesisNote,
    watcherNote,
    structureNote,
    privacyNote,
    scopeNote,
    abnormal: !synthesisRecorded,
    bandLabel,
    band,
    detail: 'I is illness severity: stable, watcher or unstable. P is the patient summary. A is the action list, with a time and an owner. The first S is situation awareness and contingency planning. The second S is the receiver summarizing it back.',
    note: IPASS_NOTE,
  };
}
