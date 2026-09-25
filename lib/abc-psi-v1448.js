// spec-v1448: ABC classification of posterior shoulder instability (PSI).
//
// Sources, read 2026-09-24:
//   Moroder P, et al. SECEC Didier Patte Prize 2023: the ABC classification of posterior shoulder instability.
//     J Shoulder Elbow Surg 2024;33 -- the classification.
//   Paksoy A, Akgun D, Lappen S, et al. Diagnosis and treatment of posterior shoulder instability
//     based on the ABC classification. EFORT Open Rev 2024;9(5):403-412 (PMC11099582):
//     Group A "a first-time singular PSI event less than three months in the past, regardless of
//       etiology"; A1 "a posterior subluxation with immediate spontaneous reduction"; A2 "a
//       dislocation requiring a self- or aided reduction maneuver".
//     Group B "recurrent dynamic PSI, regardless of the time since onset"; B1 "functional shoulder
//       instability ... due to pathological activation pattern of the rotator cuff as well as
//       periscapular muscles"; B2 "instability caused by structural damages such as posterior
//       Bankart lesion, posterior glenoid bone loss, RHSL [reverse Hill-Sachs lesion], or a
//       combination".
//     Group C "static posterior glenohumeral decentering more than three months in the past
//       regardless of etiology", "either of constitutional (type C1) or acquired (type C2) origin";
//       C1 "inherent and thus atraumatic".
//   The review shows a patient progressing from A1 to C2 over three years: the type can change.
//
// The type is derived from the history, then the one question that splits each group.
// Pure: no DOM, no clock, no network.

export const ABC_PATTERN = [
  { value: 'first', text: 'A first-time single event, less than 3 months ago' },
  { value: 'recurrent', text: 'Recurrent dynamic instability' },
  { value: 'static', text: 'Static posterior decentering, more than 3 months' },
];
export const ABC_ACUTE = [
  { value: 'subluxation', text: 'Subluxation that reduced by itself at once' },
  { value: 'dislocation', text: 'Dislocation needing a reduction maneuver' },
];
export const ABC_DYNAMIC = [
  { value: 'functional', text: 'Functional: abnormal muscle activation' },
  { value: 'structural', text: 'Structural: posterior Bankart, glenoid bone loss, or reverse Hill-Sachs' },
];
export const ABC_STATIC = [
  { value: 'constitutional', text: 'Constitutional (inherent, atraumatic)' },
  { value: 'acquired', text: 'Acquired' },
];

const WORDS = {
  A1: 'a first-time posterior subluxation that reduced spontaneously, within the last 3 months',
  A2: 'a first-time posterior dislocation needing a reduction maneuver, within the last 3 months',
  B1: 'recurrent dynamic instability from an abnormal muscle activation pattern (functional)',
  B2: 'recurrent dynamic instability from structural damage (posterior Bankart, glenoid bone loss or reverse Hill-Sachs)',
  C1: 'static posterior decentering of constitutional (inherent, atraumatic) origin',
  C2: 'static posterior decentering of acquired origin',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function abcPsi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pattern = pick(ABC_PATTERN, o.pattern);
  if (!pattern) return { valid: false, message: 'Choose the pattern of instability: a first event, recurrent dynamic, or static.' };
  let type;
  if (pattern === 'first') {
    const v = pick(ABC_ACUTE, o.acute);
    if (!v) return { valid: false, message: 'Choose whether the first event was a subluxation that reduced itself or a dislocation that needed reducing.' };
    type = v === 'subluxation' ? 'A1' : 'A2';
  } else if (pattern === 'recurrent') {
    const v = pick(ABC_DYNAMIC, o.dynamic);
    if (!v) return { valid: false, message: 'Choose whether the recurrent instability is functional or structural.' };
    type = v === 'functional' ? 'B1' : 'B2';
  } else {
    const v = pick(ABC_STATIC, o.static);
    if (!v) return { valid: false, message: 'Choose whether the static decentering is constitutional or acquired.' };
    type = v === 'constitutional' ? 'C1' : 'C2';
  }
  return {
    valid: true,
    abnormal: true,
    type,
    band: `ABC type ${type}: ${WORDS[type]}.`,
    bandLabel: `Type ${type}`,
    notes: [
      'The type can change over time: the source review shows a subluxation (A1) progressing to acquired static instability (C2) over three years.',
      'The classification describes the instability; the treatment is a separate decision.',
    ],
    note: 'Moroder P et al, J Shoulder Elbow Surg 2024; definitions as given in Paksoy A et al, EFORT Open Rev 2024.',
  };
}
