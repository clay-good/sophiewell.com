// spec-v917: the WHO Surgical Safety Checklist, and which of its three phases is incomplete.
//
// Source:
//   World Health Organization. WHO Guidelines for Safe Surgery 2009: Safe Surgery Saves Lives.
//   Geneva: WHO; 2009. Outcome report: Haynes AB, Weiser TG, Berry WR, et al. A surgical safety
//   checklist to reduce morbidity and mortality in a global population. N Engl J Med.
//   2009;360(5):491-499.
//
//   SIGN IN    before induction of anesthesia, with at least the nurse and the anesthetist.
//   TIME OUT   before skin incision, with the nurse, the anesthetist and the surgeon.
//   SIGN OUT   before the patient leaves the operating room.
//
// "THE TIME OUT" IS ONE OF THREE PHASES, NOT THE WHOLE CHECKLIST. The whole thing is routinely
// called the time out, and the phase that goes missing is SIGN OUT -- which is where the
// instrument, sponge and needle counts sit, where specimens are read back, and where the concerns
// that recovery needs are said out loud. So the result names the incomplete phase rather than
// giving one overall percentage.
//
// EACH PHASE HAS A MOMENT. Sign In happens before induction, Time Out before skin incision, Sign
// Out before the patient leaves the room. A phase carried out at a different moment is not that
// phase, and ticking it afterwards is not doing it.
//
// IT IS A PROMPT FOR SOMETHING SPOKEN. The source expects the checklist to be read aloud by a
// single coordinator and expects it to be adapted to the local setting -- it is not a form to
// complete after the fact.
//
// Item wording here is a neutral topic label, not the published text.
//
// Pure: no DOM, no clock, no network.

export const WHO_SSC_NOTE = 'The WHO Surgical Safety Checklist has three phases, each tied to a moment. Sign In happens before induction of anesthesia, with at least the nurse and the anesthetist: identity, site, procedure and consent; site marking; the anesthesia machine and medication check; the pulse oximeter; allergies; airway and aspiration risk; and the risk of significant blood loss with the access and fluids that answer it. Time Out happens before skin incision, with the nurse, the anesthetist and the surgeon: everyone introduced by name and role; the patient, procedure and incision site confirmed aloud; antibiotic prophylaxis within the last hour or not indicated; the anticipated critical events from each of the three; and essential imaging displayed or not needed. Sign Out happens before the patient leaves the room: the procedure named aloud; instrument, sponge and needle counts complete; specimens labeled and read back; equipment problems named; and the key concerns for recovery reviewed. Three things are worth stating plainly. The whole checklist is routinely called the time out, but that is one phase of three, and the one that goes missing is Sign Out -- which is where the counts, the specimen labels and the recovery concerns live. Each phase has a moment, and a phase carried out at a different moment is not that phase; ticking it afterwards is not doing it. And it is a prompt for something spoken aloud by one coordinator, which the source expects to be adapted to the local setting rather than completed as a form. This reports which phase is incomplete. It does not verify that anything was actually done.';

export const PHASES = [
  {
    key: 'signIn',
    name: 'Sign In',
    moment: 'before induction of anesthesia, with at least the nurse and the anesthetist',
    items: [
      { key: 'identitySiteProcedureConsent', text: 'Identity, site, procedure and consent confirmed' },
      { key: 'siteMarked', text: 'Site marked, or marking does not apply' },
      { key: 'anesthesiaCheck', text: 'Anesthesia machine and medication check complete' },
      { key: 'pulseOximeter', text: 'Pulse oximeter on the patient and working' },
      { key: 'allergies', text: 'Known allergies established' },
      { key: 'airwayRisk', text: 'Difficult airway or aspiration risk considered, with equipment and help available' },
      { key: 'bloodLossRisk', text: 'Risk of significant blood loss considered, with access and fluids planned' },
    ],
  },
  {
    key: 'timeOut',
    name: 'Time Out',
    moment: 'before skin incision, with the nurse, the anesthetist and the surgeon',
    items: [
      { key: 'introductions', text: 'Everyone introduced by name and role' },
      // `short` is what the MCP field label and the worked example print: the page clamps a
      // label past the mid-forties mid-phrase, and a clamped label says less than a short one.
      { key: 'confirmAloud', text: 'Patient, procedure and incision site confirmed aloud', short: 'Patient, procedure and site aloud' },
      { key: 'antibiotics', text: 'Antibiotic prophylaxis within the last hour, or not indicated' },
      { key: 'criticalEvents', text: 'Anticipated critical events reviewed by surgeon, anesthetist and nursing team', short: 'Critical events reviewed by each' },
      { key: 'imaging', text: 'Essential imaging displayed, or not needed' },
    ],
  },
  {
    key: 'signOut',
    name: 'Sign Out',
    moment: 'before the patient leaves the operating room',
    items: [
      { key: 'procedureNamed', text: 'Procedure named aloud by the nurse' },
      { key: 'counts', text: 'Instrument, sponge and needle counts complete' },
      { key: 'specimens', text: 'Specimens labeled and read back, patient name included' },
      { key: 'equipmentProblems', text: 'Equipment problems named' },
      { key: 'recoveryConcerns', text: 'Key concerns for recovery and management reviewed' },
    ],
  },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function whoSurgicalChecklist(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const phases = PHASES.map((p) => {
    const done = p.items.filter((i) => on(o[i.key]));
    const outstanding = p.items.filter((i) => !on(o[i.key]));
    return {
      key: p.key,
      name: p.name,
      moment: p.moment,
      total: p.items.length,
      doneCount: done.length,
      complete: outstanding.length === 0,
      outstanding: outstanding.map((i) => i.text),
    };
  });

  const incomplete = phases.filter((p) => !p.complete);
  const totalItems = PHASES.reduce((a, p) => a + p.items.length, 0);
  const doneItems = phases.reduce((a, p) => a + p.doneCount, 0);

  const signOut = phases.find((p) => p.key === 'signOut');

  const bandLabel = incomplete.length === 0
    ? 'All three phases complete'
    : incomplete.length === 1
      ? `${incomplete[0].name} incomplete`
      : `${incomplete.length} phases incomplete`;

  const band = incomplete.length === 0
    ? `All ${totalItems} items are recorded across Sign In, Time Out and Sign Out.`
    : `${incomplete.map((p) => `${p.name} (${p.doneCount} of ${p.total})`).join(', ')}. The phase is named rather than a percentage, because a checklist that is 90% done is 90% done in a particular place.`;

  // The phase people mean when they say "the time out" is one of three, and Sign Out is the
  // one that goes missing.
  const signOutNote = signOut.complete
    ? 'Sign Out is recorded. It is the phase that most often goes missing, and it is where the counts, the specimen labels and the recovery concerns live.'
    : `Sign Out is the phase that most often goes missing, and it is where the counts, the specimen labels and the recovery concerns live. ${signOut.doneCount} of ${signOut.total} of its items are recorded.`;

  const namingNote = 'The whole checklist is routinely called "the time out". Time Out is one phase of three, and the other two carry items it does not.';

  const momentNote = 'Each phase has a moment: Sign In before induction, Time Out before skin incision, Sign Out before the patient leaves the room. A phase carried out at a different moment is not that phase, and ticking it afterwards is not doing it.';

  const spokenNote = 'It is a prompt for something spoken aloud by a single coordinator, and the source expects it to be adapted to the local setting rather than completed as a form.';

  const wordingNote = 'The items here are neutral topic labels rather than the published wording, and several of them are satisfied by "does not apply".';

  const scopeNote = 'This reports which phase is incomplete. It does not verify that anything was actually done.';

  return {
    valid: true,
    phases,
    doneItems,
    totalItems,
    allComplete: incomplete.length === 0,
    incompletePhases: incomplete.map((p) => p.name),
    signOutNote,
    namingNote,
    momentNote,
    spokenNote,
    wordingNote,
    scopeNote,
    abnormal: incomplete.length > 0,
    bandLabel,
    band,
    detail: 'Sign In runs before induction of anesthesia with at least the nurse and the anesthetist. Time Out runs before skin incision with the nurse, the anesthetist and the surgeon. Sign Out runs before the patient leaves the operating room.',
    note: WHO_SSC_NOTE,
  };
}
