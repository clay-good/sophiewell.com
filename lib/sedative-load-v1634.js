// spec-v1634 tool 23: sedative load (Linjakumpu model).
//
// Source: Linjakumpu T, Hartikainen S, Klaukka T, et al. A model to classify the sedative load of drugs. Int J
// Geriatr Psychiatry. 2003;18:542-544 (not open). Built on the owner's rule of October 17, 2026 that a verified
// reprint is a source. Two open papers state the model the same way:
//   Parsons C et al. BMC Geriatr. 2011;11:56 (PMC3197480, CC BY): group 1 primary sedatives; group 2 sedation as a
//   prominent side effect, or a preparation with a sedating component; group 3 sedation as a potential adverse
//   effect; group 4 no known sedative properties. Groups 1 and 2 are rated 2 and 1, and the load is the sum.
//   PMC11588458 (2024): drugs rated 0 to 2, 0 for groups 3 and 4 and 2 for group 1, summed over the drugs taken.
// The model's own drug-to-group list is not reprinted in either paper, so the reader assigns each drug's group.
// No band is given: neither paper states one.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'The Linjakumpu sedative load model (2003), as stated in two open papers. It counts regularly taken drugs; the group for each drug is the reader\'s, from the model\'s classification or a pharmacist\'s judgment. No threshold is part of the model.';

export function sedativeLoad(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of group 1 drugs', o.group1, 0, 50, ''], ['the number of group 2 drugs', o.group2, 0, 50, '']]);
  if (f) return { valid: false, message: f };
  const g1 = Number(o.group1); const g2 = Number(o.group2);
  if (!Number.isInteger(g1) || !Number.isInteger(g2)) return { valid: false, message: 'Enter whole numbers of drugs in each group.' };
  const load = 2 * g1 + g2;
  return {
    valid: true, load, group1: g1, group2: g2,
    band: `Sedative load ${load}: ${g1} primary sedative${g1 === 1 ? '' : 's'} (rated 2 each) and ${g2} drug${g2 === 1 ? '' : 's'} with sedation as a prominent side effect (rated 1 each).`,
    bandLabel: `Load ${load}`, abnormal: load > 0,
    notes: ['Group 3 (sedation only as a potential adverse effect) and group 4 (no known sedative properties) are rated 0 and are not entered.'],
    note: NOTE,
  };
}
