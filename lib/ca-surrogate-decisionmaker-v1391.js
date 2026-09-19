// spec-v1391: California surrogate decision-maker, Probate Code 4711, 4712, 4715.
//
// Source: leginfo text read 2026-09-18.
//   4711(a) A patient may designate an adult as surrogate by personally informing the supervising
//     provider or a facility designee; it is recorded in the record. (b) It lasts for the course of
//     treatment or illness, or the stay, or 60 days, whichever is shorter, unless the patient sets a
//     shorter period. (d) It has priority over an agent under a power of attorney for health care for
//     that period, without revoking the agent's designation.
//   4712(a) If a patient lacks capacity, these legally recognized decisionmakers act, in DESCENDING
//     ORDER OF PRIORITY: (1) the 4711 surrogate; (2) the agent under an advance health care directive
//     or power of attorney for health care; (3) the conservator or guardian with authority to make
//     health care decisions.
//   4712(b) Except as 4715 provides, if there is none, a provider or facility designee may choose a
//     surrogate: an adult who has demonstrated special care and concern for the patient, is familiar
//     with the patient's values and beliefs to the extent known, and is reasonably available and
//     willing. A surrogate "may be chosen from any of" spouse or domestic partner, adult child,
//     parent, adult sibling, adult grandchild, adult relative or close personal friend. This list
//     is NOT ranked (AB 2338, Stats. 2022, ch. 782, effective January 1, 2023).
//   4715 A patient with capacity may disqualify anyone, family included, by a signed writing or by
//     personally telling the supervising provider.
//
// New Jersey has no general default-surrogate statute, so no New Jersey finder is offered.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const CAS_VERIFIED = '2026-09-18';
export const AVAILABLE = [
  { value: 'yes', text: 'Available and willing' },
  { value: 'no', text: 'None, or not available' },
];
export const FAMILY = [
  ['spouse', 'Spouse or domestic partner'],
  ['adultChild', 'Adult child'],
  ['parent', 'Parent'],
  ['sibling', 'Adult sibling'],
  ['grandchild', 'Adult grandchild'],
  ['relativeFriend', 'Adult relative or close personal friend'],
];

const st = (v) => (v === 'yes' || v === 'no' ? v : null);

const TIER_A = [
  ['designated', 'the surrogate the patient named (4711)', 'the patient named a surrogate to the provider (4711)'],
  ['agent', 'the agent under an advance health care directive or power of attorney for health care', 'there is an agent under an advance health care directive or power of attorney for health care'],
  ['conservator', 'the conservator or guardian with authority over health care decisions', 'there is a conservator or guardian with authority over health care decisions'],
];

export function caSurrogateDecisionmaker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tier = TIER_A.map(([k, label, ask]) => ({ k, label, ask, state: st(o[k]) }));
  const base = { valid: true, njNote: 'New Jersey has no general default-surrogate statute, so this finder covers California only.', postureNote: scopeSentence(CAS_VERIFIED) };

  // 4712(a) is ordered: the first "yes" decides, but only once every higher class is answered.
  for (let i = 0; i < tier.length; i += 1) {
    const t = tier[i];
    if (t.state === null) {
      return { valid: false, message: `Answer whether ${t.ask}. Probate Code 4712(a) is a priority order, and an unanswered class above the rest cannot be skipped.` };
    }
    if (t.state === 'yes') {
      const note = t.k === 'designated'
        ? 'A 4711 designation lasts for the course of treatment or illness, or the stay, or 60 days, whichever is shorter. For that period it outranks an agent without revoking the agent.'
        : null;
      return {
        ...base, decider: t.k, eligible: [], abnormal: false,
        bandLabel: `Decides: ${t.label.replace(/^the /, '')}`,
        band: `Probate Code 4712(a)(${i + 1}): ${t.label} decides. The (a) order is mandatory, so the family list in (b) is not reached.`,
        note,
      };
    }
  }

  const fam = FAMILY.map(([k, label]) => ({ k, label, state: st(o[k]) }));
  const unanswered = fam.filter((f) => f.state === null).map((f) => f.label.toLowerCase());
  const eligible = fam.filter((f) => f.state === 'yes').map((f) => f.label);
  const duty = 'The provider or facility designee chooses an adult who has shown special care and concern for the patient, knows the patient\'s values and beliefs as far as they are known, and is reasonably available and willing (4712(b)).';
  const disqNote = 'Leave out anyone the patient disqualified in a signed writing or by telling the supervising provider (4715).';

  if (!eligible.length && unanswered.length) {
    return { valid: false, message: `Answer who is available: ${unanswered.join(', ')}. With no 4712(a) decisionmaker, the surrogate is chosen from them.` };
  }
  if (!eligible.length) {
    return {
      ...base, decider: null, eligible: [], abnormal: true, bandLabel: 'No surrogate available',
      band: 'No 4712(a) decisionmaker and no one in the 4712(b) classes is available. The sections read here do not name who decides next; follow facility policy and counsel.',
      duty, note: disqNote,
    };
  }
  return {
    ...base, decider: 'chosen', eligible, abnormal: false,
    bandLabel: 'Eligible surrogates, unranked',
    band: `No 4712(a) decisionmaker. Under 4712(b) a surrogate may be chosen from any of these; the list is not ranked: ${eligible.join('; ')}.`,
    duty,
    note: `${disqNote}${unanswered.length ? ` Not yet answered: ${unanswered.join(', ')}.` : ''}`,
  };
}
