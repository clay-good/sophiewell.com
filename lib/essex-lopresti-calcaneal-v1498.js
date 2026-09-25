// spec-v1498: the Essex-Lopresti classification of calcaneal fractures, beside the Sanders CT
// classification.
//
// Sources, read 2026-09-25:
//   Essex-Lopresti P. The mechanism, reduction technique, and results in fractures of the os calcis.
//     Br J Surg. 1952;39(157):395-419 (the original).
//   The types as stated in Unfallchirurgie 2026 (PMC13216127), translated from the German: a primary
//     fracture line runs obliquely in the sagittal axis; in a tongue-type fracture the secondary line
//     runs horizontally and exits through the calcaneal tuberosity; in a joint-depression fracture it
//     runs vertically through or behind the posterior facet, which is displaced downward. The same
//     review maps the AO classes: 82A extra-articular, 82B tongue-type, 82C joint-depression.
//   J Orthop Surg Res 2026 (PMC13540938) reports cases by the same two intra-articular types.
//
// Derived from whether the subtalar joint is involved and where the secondary line exits.
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const EXIT = [
  { value: 'tuberosity', text: 'Horizontally, out through the tuberosity' },
  { value: 'facet', text: 'Vertically, through or behind the posterior facet' },
];

export function essexLoprestiCalcaneal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const joint = o.subtalar === 'yes' || o.subtalar === 'no' ? o.subtalar : null;
  if (!joint) return { valid: false, message: 'Choose whether the fracture involves the subtalar joint (the posterior facet).' };
  const notes = [
    'Both intra-articular types usually flatten the calcaneus, seen as a reduced Böhler angle.',
    'Sanders classifies the same fractures on CT by the number and position of the posterior facet fragments.',
  ];
  const note = 'Essex-Lopresti P, Br J Surg 1952; types as stated in Unfallchirurgie 2026. It describes the fracture; treatment is a clinical decision.';
  if (joint === 'no') {
    return { valid: true, type: 'extra-articular', abnormal: true, band: 'Extra-articular calcaneal fracture: the subtalar joint is not involved (AO 82A).', bandLabel: 'Extra-articular', notes, note };
  }
  const exit = EXIT.some((x) => x.value === o.exit) ? o.exit : null;
  if (!exit) return { valid: false, message: 'Choose where the secondary fracture line runs: out through the tuberosity, or through or behind the posterior facet.' };
  if (exit === 'tuberosity') {
    return { valid: true, type: 'tongue', abnormal: true, band: 'Tongue-type fracture: the secondary line runs horizontally and exits through the tuberosity, so the posterior facet stays on the tuberosity fragment (AO 82B).', bandLabel: 'Tongue-type', notes, note };
  }
  return { valid: true, type: 'joint-depression', abnormal: true, band: 'Joint-depression fracture: the secondary line runs vertically through or behind the posterior facet, which is displaced downward on its own fragment (AO 82C).', bandLabel: 'Joint-depression', notes, note };
}
