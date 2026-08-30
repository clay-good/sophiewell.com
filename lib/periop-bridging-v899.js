// spec-v899: periprocedural interruption of oral anticoagulation, and whether to bridge.
//
// Sources:
//   Douketis JD, Spyropoulos AC, Murad MH, et al. Perioperative Management of Antithrombotic
//   Therapy: an American College of Chest Physicians Clinical Practice Guideline.
//   Chest. 2022;162(5):e207-e243.
//   Douketis JD, Spyropoulos AC, Kaatz S, et al. Perioperative bridging anticoagulation in
//   patients with atrial fibrillation (BRIDGE). N Engl J Med. 2015;373(9):823-833.
//
//   A DIRECT ORAL ANTICOAGULANT IS NEVER BRIDGED. It is interrupted for a period set by the
//   procedure's bleeding risk and by renal function; its short half-life is the bridge.
//
//   On WARFARIN, bridging with heparin is reserved for the small high-thrombotic-risk group. For
//   most patients with atrial fibrillation the BRIDGE trial showed bridging increases major
//   bleeding without reducing thromboembolism, so the default is not to bridge.
//
// THE DEFAULT IS NOT TO BRIDGE, AND THAT IS WHY THIS TILE EXISTS. Bridging was routine for years
// and the evidence reversed it; the question is now whether this patient is one of the few
// exceptions, not whether there is a reason to skip it.
//
// A DIRECT ORAL ANTICOAGULANT IS NEVER BRIDGED, and its interruption is timed on renal function
// and bleeding risk rather than on an INR.
//
// A PROCEDURE WITH MINIMAL BLEEDING RISK MAY NOT NEED INTERRUPTION AT ALL. Many dental,
// dermatologic, ophthalmic and endoscopic procedures are done on anticoagulation.
//
// Pure: no DOM, no clock, no network.

export const BRIDGE_NOTE = 'Periprocedural management of an oral anticoagulant is two questions: whether to interrupt it, and whether to bridge. A direct oral anticoagulant is never bridged; it is interrupted for a period set by the bleeding risk of the procedure and by renal function, and its short half-life is the bridge. On warfarin, bridging with heparin is reserved for the small group at high thrombotic risk, because the BRIDGE trial showed that in most patients with atrial fibrillation bridging increases major bleeding without reducing thromboembolism. Three things about this are worth stating plainly. The default is not to bridge: bridging was routine for years and the evidence reversed it, so the question is now whether this patient is one of the few exceptions rather than whether there is a reason to skip it. A direct oral anticoagulant is never bridged, and its interruption is timed on renal function and bleeding risk rather than on an INR. And a procedure with minimal bleeding risk may not need interruption at all, since many dental, dermatologic, ophthalmic and endoscopic procedures are done on anticoagulation. It applies published guidance to a drug, a procedure risk and a thrombotic risk already characterized. It does not prescribe, and it does not set an interruption schedule.';

export const AGENTS = [
  { value: 'doac', text: 'A direct oral anticoagulant' },
  { value: 'warfarin', text: 'Warfarin' },
];

export const PROCEDURE_RISKS = [
  { value: 'minimal', text: 'Minimal bleeding risk: many dental, dermatologic, ophthalmic and endoscopic procedures' },
  { value: 'low', text: 'Low bleeding risk' },
  { value: 'high', text: 'High bleeding risk' },
];

export const THROMBOTIC_RISKS = [
  { value: 'low', text: 'Low or moderate thrombotic risk' },
  { value: 'high', text: 'High thrombotic risk: a mechanical mitral valve, a stroke or venous thromboembolism within 3 months, or an equivalent' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function periopBridging(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const agent = oneOf(AGENTS, o.agent, 'doac');
  const procedure = oneOf(PROCEDURE_RISKS, o.procedureRisk, 'low');
  const thrombotic = oneOf(THROMBOTIC_RISKS, o.thromboticRisk, 'low');

  const interruptionNeeded = procedure !== 'minimal';

  const verdict = !interruptionNeeded
    ? 'no-interruption'
    : agent === 'doac'
      ? 'doac-never-bridged'
      : thrombotic === 'high'
        ? 'warfarin-consider-bridge'
        : 'warfarin-no-bridge';

  const action = {
    'no-interruption': 'A procedure of minimal bleeding risk may not need the anticoagulant interrupted at all. Many dental, dermatologic, ophthalmic and endoscopic procedures are done on anticoagulation, and no bridging question arises.',
    'doac-never-bridged': 'A direct oral anticoagulant is interrupted, and it is never bridged. The interruption is timed on the bleeding risk of the procedure and on renal function; the short half-life is the bridge.',
    'warfarin-no-bridge': 'Warfarin is interrupted, and the guidance is not to bridge. In most patients the BRIDGE trial showed bridging increases major bleeding without reducing thromboembolism.',
    'warfarin-consider-bridge': 'Warfarin is interrupted, and this is the small high-thrombotic-risk group in which bridging is considered. It remains a judgment weighed against the bleeding risk of bridging itself.',
  }[verdict];

  // The reason the tile exists, on every result.
  const defaultNote = 'The default is not to bridge. Bridging was routine for years and the evidence reversed it, so the question is whether this patient is one of the few exceptions, not whether there is a reason to skip it.';

  const doacNote = agent === 'doac'
    ? 'A direct oral anticoagulant is never bridged, and its interruption is not timed on an INR. Renal function and the bleeding risk of the procedure set the interval, and impaired renal function lengthens it.'
    : 'Had this been a direct oral anticoagulant, the bridging question would not arise at all: those are never bridged.';

  const inrNote = agent === 'warfarin'
    ? 'An INR is checked before the procedure, and the interruption interval is the time warfarin needs to fall rather than a fixed number of days for everyone.'
    : null;

  const minimalNote = procedure === 'minimal'
    ? null
    : 'Before asking about bridging, it is worth asking whether interruption is needed at all. Many procedures of minimal bleeding risk are done on anticoagulation.';

  const resumeNote = interruptionNeeded
    ? 'Resumption is its own decision, timed on hemostasis rather than on the calendar, and a therapeutic-dose resumption after a high-bleeding-risk procedure is usually delayed further than a prophylactic one.'
    : null;

  const scopeNote = 'This applies published guidance to a drug, a procedure risk and a thrombotic risk already characterized. It does not prescribe, and it does not set an interruption schedule.';

  return {
    valid: true,
    agent,
    procedureRisk: procedure,
    thromboticRisk: thrombotic,
    interruptionNeeded,
    verdict,
    action,
    defaultNote,
    doacNote,
    inrNote,
    minimalNote,
    resumeNote,
    scopeNote,
    abnormal: verdict === 'warfarin-consider-bridge',
    bandLabel: {
      'no-interruption': 'Interruption may not be needed',
      'doac-never-bridged': 'Interrupt, never bridge',
      'warfarin-no-bridge': 'Interrupt, do not bridge',
      'warfarin-consider-bridge': 'Interrupt, bridging considered',
    }[verdict],
    band: action,
    detail: 'A direct oral anticoagulant is interrupted on the basis of procedural bleeding risk and renal function, and is never bridged. Warfarin is interrupted, and bridging is reserved for the small high-thrombotic-risk group; in most patients bridging increases major bleeding without reducing thromboembolism. A procedure of minimal bleeding risk may need no interruption at all.',
    note: BRIDGE_NOTE,
  };
}
