// spec-v1241: the Herbert classification of scaphoid fractures.
//
// Source:
//   Herbert TJ, Fisher WE. Management of the fractured scaphoid using a new bone screw. J Bone Joint
//   Surg Br. 1984;66(1):114-123. PMID 6693468.
//
// The classification, and the one thing it is FOR: Herbert sorts a scaphoid fracture by whether it
// is stable, and the answer decides whether a cast is a defensible treatment.
//
//   A  acute, STABLE      A1 tubercle fracture
//                         A2 incomplete fracture through the waist
//   B  acute, UNSTABLE    B1 distal oblique fracture
//                         B2 complete fracture of the waist
//                         B3 proximal pole fracture
//                         B4 fracture-dislocation (trans-scaphoid perilunate)
//                         B5 comminuted fracture
//   C  delayed union
//   D  established non-union   D1 fibrous union
//                              D2 sclerotic pseudarthrosis
//
// THE LETTER IS NOT THE STABILITY. A1 and A2 are stable; every B is unstable; C and D are neither --
// they are what happened afterwards, and a tool that answered "unstable" or "stable" for a D2 would
// be answering a question the classification stopped asking. So this reports the group as well as the
// letter, and says plainly which of the three questions it has answered.
//
// PROXIMAL POLE IS THE ONE WORTH SAYING OUT LOUD. B3 is a B like the others, and it is the one whose
// blood supply enters distally, so it carries the high rate of avascular necrosis and non-union. The
// letter alone does not tell a reader that.
//
// Russe is in this catalog and is a different classification: it sorts by the fracture LINE relative
// to the long axis (horizontal oblique, transverse, vertical oblique). Herbert sorts by stability and
// by time. They answer different questions and neither converts into the other.
//
// Pure: no DOM, no clock, no network.

export const HERBERT_NOTE = 'The Herbert classification (Herbert and Fisher 1984) sorts a scaphoid fracture by whether it is stable, and then by what has happened since. Types A1 and A2 are the acute stable fractures; B1 to B5 are the acute unstable ones; C is a delayed union and D an established non-union, which are outcomes rather than stability grades. It reports what the fracture is, not what to do about it.';

export const HERBERT_TYPES = [
  { value: 'A1', text: 'A1 - tubercle fracture', group: 'A', groupText: 'acute, stable', stable: true },
  { value: 'A2', text: 'A2 - incomplete fracture through the waist', group: 'A', groupText: 'acute, stable', stable: true },
  { value: 'B1', text: 'B1 - distal oblique fracture', group: 'B', groupText: 'acute, unstable', stable: false },
  { value: 'B2', text: 'B2 - complete fracture of the waist', group: 'B', groupText: 'acute, unstable', stable: false },
  { value: 'B3', text: 'B3 - proximal pole fracture', group: 'B', groupText: 'acute, unstable', stable: false },
  { value: 'B4', text: 'B4 - fracture-dislocation (trans-scaphoid perilunate)', group: 'B', groupText: 'acute, unstable', stable: false },
  { value: 'B5', text: 'B5 - comminuted fracture', group: 'B', groupText: 'acute, unstable', stable: false },
  { value: 'C', text: 'C - delayed union', group: 'C', groupText: 'delayed union', stable: null },
  { value: 'D1', text: 'D1 - established non-union, fibrous', group: 'D', groupText: 'established non-union', stable: null },
  { value: 'D2', text: 'D2 - established non-union, sclerotic pseudarthrosis', group: 'D', groupText: 'established non-union', stable: null },
];

const BY_VALUE = new Map(HERBERT_TYPES.map((t) => [t.value, t]));

export function herbertScaphoid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.type == null ? '' : String(o.type).trim().toUpperCase();
  if (raw === '') {
    return { valid: false, message: 'Choose the Herbert type. There is no default: A2 and B2 are both waist fractures and only one of them is stable.' };
  }
  const t = BY_VALUE.get(raw);
  if (!t) {
    return { valid: false, message: `The Herbert type must be one of: ${HERBERT_TYPES.map((x) => x.value).join(', ')}.` };
  }

  const stabilityText = t.stable === true
    ? 'This is one of the two acute stable fractures.'
    : t.stable === false
      ? 'This is an acute unstable fracture.'
      : 'Stability is not what this type records. C and D describe what happened after the fracture -- a union that is late, or one that never came -- so neither "stable" nor "unstable" is the answer to the question this type answers.';

  const proximalPoleNote = t.value === 'B3'
    ? 'The proximal pole is the fragment whose blood supply enters from the far end, which is why B3 carries the highest rates of avascular necrosis and non-union in the group. The letter B does not say that on its own.'
    : null;

  const nonunionNote = t.group === 'D'
    ? `D1 and D2 differ in what is between the fragments -- fibrous tissue against a sclerotic pseudarthrosis -- and that is ${t.value === 'D1' ? 'fibrous tissue here' : 'a sclerotic pseudarthrosis here'}. The distinction is the one the classification draws; what follows from it is a surgical judgment this tool does not make.`
    : null;

  return {
    valid: true,
    type: t.value,
    group: t.group,
    stable: t.stable,
    acute: t.group === 'A' || t.group === 'B',
    abnormal: t.stable === false || t.group === 'C' || t.group === 'D',
    bandLabel: `Herbert ${t.value}`,
    band: `Herbert type ${t.value}: ${t.text.split(' - ')[1]}. That is group ${t.group}, ${t.groupText}. ${stabilityText}`,
    proximalPoleNote,
    nonunionNote,
    russeNote: 'Russe, also in this catalog, sorts the same fracture by the direction of the fracture line rather than by stability. The two answer different questions and neither converts into the other.',
    postureNote: 'The type describes the fracture. Whether it is cast or fixed is a decision that also takes the displacement, the patient and the surgeon, and this tool makes none of it.',
    note: HERBERT_NOTE,
  };
}
