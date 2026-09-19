// spec-v1391: New York surrogate under the Family Health Care Decisions Act, Public Health Law 2994-d.
//
// Sources (nysenate.gov text read 2026-09-18):
//   2994-d(1) "One person from the following list from the class highest in priority when persons in
//     prior classes are not reasonably available, willing, and competent to act, shall be the
//     surrogate for an adult patient who lacks decision-making capacity": (a) an Article 81
//     guardian authorized to decide about health care; (b) the spouse, if not legally separated,
//     or the domestic partner; (c) a son or daughter 18 or older; (d) a parent; (e) a brother or
//     sister 18 or older; (f) a close friend.
//   2994-d(5)(a) A surrogate may refuse life-sustaining treatment only if (i) treatment would be an
//     extraordinary burden AND the attending practitioner, with the independent concurrence of
//     another physician, NP, or PA, determines the patient has an illness or injury expected to
//     cause death within six months, or is permanently unconscious; or (ii) treatment would involve
//     such pain, suffering, or other burden that it would reasonably be deemed inhumane or
//     extraordinarily burdensome, and the patient has an irreversible or incurable condition.
//     (b) In a residential health care facility, a (ii) refusal needs ethics review committee review.
//   2994-b A health care agent under Article 29-C decides, with priority over anyone else. A person
//     with an SCPA Article 17-A guardian is governed by SCPA 1750-b, not this article.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const FH_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const AVAILABLE = [
  { value: 'yes', text: 'Reasonably available, willing, and competent' },
  { value: 'no', text: 'None, or not available' },
];
export const CLASSES = [
  ['guardian', '(a)', 'the Article 81 guardian authorized to decide about health care'],
  ['spouse', '(b)', 'the spouse (not legally separated) or domestic partner'],
  ['child', '(c)', 'a son or daughter 18 or older'],
  ['parent', '(d)', 'a parent'],
  ['sibling', '(e)', 'a brother or sister 18 or older'],
  ['friend', '(f)', 'a close friend'],
];

const st = (v) => (v === 'yes' || v === 'no' ? v : null);

export function nyFhcdaSurrogate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const proxy = st(o.proxy);
  if (!proxy) return { valid: false, message: 'Answer whether the patient has a health care proxy agent available. An agent decides, and the surrogate list is not reached.' };
  const standard = 'Refusing life-sustaining treatment needs one of two FHCDA standards (2994-d(5)): an extraordinary burden with death expected within six months or permanent unconsciousness, confirmed by a second practitioner, or a burden so great it would be inhumane with an irreversible or incurable condition. They are stated here, not applied.';
  const base = { valid: true, standardNote: standard, njNote: 'New Jersey has no general default-surrogate statute, so this finder covers New York only.', postureNote: scopeSentence(FH_VERIFIED) };
  if (proxy === 'yes') {
    return { ...base, surrogate: 'agent', abnormal: false, bandLabel: 'The health care agent decides', band: 'The health care agent under the proxy decides (Article 29-C). The FHCDA surrogate list does not apply (2994-b).', standardNote: null };
  }
  const g17a = st(o.article17a);
  if (!g17a) return { valid: false, message: 'Answer whether the patient has an SCPA Article 17-A guardian. If so, SCPA 1750-b governs instead of the FHCDA.' };
  if (g17a === 'yes') {
    return { ...base, surrogate: '17a', abnormal: false, bandLabel: 'SCPA 1750-b governs', band: 'With an Article 17-A guardian, health care decisions follow SCPA 1750-b, not the FHCDA surrogate list (2994-b).', standardNote: null };
  }
  for (const [k, ref, label] of CLASSES) {
    const s = st(o[k]);
    if (s === null) return { valid: false, message: `Answer whether there is ${label}. The list is ranked, and a higher class cannot be skipped unanswered.` };
    if (s === 'yes') {
      const partner = k === 'spouse' ? ' A domestic partner ranks with a spouse.' : '';
      return {
        ...base, surrogate: k, abnormal: false,
        bandLabel: `Surrogate: ${label.replace(/^(the|a) /, '')}`,
        band: `PHL 2994-d(1)${ref}: ${label} is the surrogate, as the highest class with someone reasonably available, willing, and competent.${partner}`,
      };
    }
  }
  return {
    ...base, surrogate: null, abnormal: true, bandLabel: 'No surrogate on the list',
    band: 'No one on the 2994-d(1) list is available. Decisions for a patient without a surrogate follow PHL 2994-g, which is not read here.',
  };
}
