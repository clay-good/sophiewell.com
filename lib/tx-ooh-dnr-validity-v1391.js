// spec-v1391: Texas out-of-hospital DNR order -- is it validly executed, and is it still in force?
//
// Sources (official mirror tcss.legis.texas.gov, Health & Safety Code ch. 166, read 2026-09-18):
//   166.082(b) The declarant signs in the presence of two witnesses qualified under 166.003, at
//     least one qualified under 166.003(2); the witnesses sign; the attending physician signs. In
//     place of witnesses, the declarant may have the signature acknowledged before a notary.
//     (c) For an incompetent person with an earlier directive, the physician may rely on it and signs
//     in place of the person. (d), (e) A proxy under a directive, or a medical power of attorney
//     agent, decides and signs in place of the person.
//   166.084 A competent ADULT may issue one by nonwritten communication, in the presence of the
//     attending physician and two witnesses (one qualified under 166.003(2)); they sign.
//   166.085 For a minor: the parents, legal guardian, or managing conservator, and only if a
//     physician has diagnosed a terminal or irreversible condition.
//   166.088 An incompetent adult with no order: (a) the attending physician and a guardian, proxy, or
//     agent (no witness requirement is stated for this route); or (b), with none, a qualified relative in the 166.039(b) priority, in the presence of two
//     witnesses (one qualified under 166.003(2)); with no relative, a second physician not involved
//     in treatment, or an ethics or medical committee representative, concurs.
//   166.086 The desire of a competent person, including a competent minor, supersedes the order when
//     communicated to responding professionals.
//   166.092 The declarant may revoke at any time "without regard to the declarant's mental state or
//     competency", by destroying the form or removing the identification device, or by
//     communicating intent to revoke; so may a guardian, qualified relative, or agent who executed
//     it. An oral revocation takes effect when communicated to responders or the physician at the
//     scene, who record the time, date, and place.
//   166.003(2) The qualified witness is not the designated decision-maker, a relative by blood or
//     marriage, an heir or claimant to the estate, the attending physician or an employee of that
//     physician, or a facility employee giving direct care or in management.
//
// Where someone signs "in lieu of" the person, the tile reads the rest of 166.082(b) -- the
// witnesses and the physician's signature -- as still required, and says so.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const OOH_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const EXECUTORS = [
  { value: 'self', text: 'The person, in writing (166.082(b))' },
  { value: 'nonwritten', text: 'The person, by nonwritten communication, as an adult (166.084)' },
  { value: 'directive', text: 'The physician, relying on an earlier directive (166.082(c))' },
  { value: 'agent', text: 'A directive proxy or medical power of attorney agent (166.082(d), (e))' },
  { value: 'guardian', text: 'A legal guardian, with the physician (166.088(a))' },
  { value: 'relative', text: 'A qualified relative, with the physician (166.088(b))' },
  { value: 'second-physician', text: 'The physician, no relative available, with a concurring physician (166.088(f))' },
  { value: 'minor-parent', text: "A minor's parent, guardian, or managing conservator (166.085)" },
];
export const WITNESSING = [
  { value: 'two-qualified', text: 'Two competent adult witnesses, at least one qualified under 166.003(2)' },
  { value: 'two-unqualified', text: 'Two witnesses, neither qualified under 166.003(2)' },
  { value: 'notary', text: 'Signature acknowledged before a notary, no witnesses' },
  { value: 'none', text: 'Neither witnesses nor a notary' },
];

const st = (v) => (v === 'yes' || v === 'no' ? v : null);

export function txOohDnrValidity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ex = EXECUTORS.find((e) => e.value === o.executor);
  if (!ex) return { valid: false, message: 'Choose who executed the order. Each route has its own requirements.' };
  const w = WITNESSING.find((x) => x.value === o.witnessing);
  if (!w) return { valid: false, message: 'Choose how it was witnessed: two witnesses (one qualified), a notary, or neither.' };
  const phys = st(o.physicianSigned);
  if (!phys) return { valid: false, message: 'Answer whether the attending physician signed it.' };
  const rev = st(o.revoked);
  if (!rev) return { valid: false, message: 'Answer whether it has been revoked, or the person now expresses a contrary wish. Either ends it.' };
  let dx = null;
  if (ex.value === 'minor-parent') {
    dx = st(o.terminalDx);
    if (!dx) return { valid: false, message: 'Answer whether a physician has diagnosed the minor with a terminal or irreversible condition. A parent may not execute one otherwise.' };
  }
  let concur = null;
  if (ex.value === 'second-physician') {
    concur = st(o.concurred);
    if (!concur) return { valid: false, message: 'Answer whether another physician not involved in treatment, or an ethics or medical committee representative, concurred.' };
  }

  const fails = [];
  if (phys === 'no') fails.push('the attending physician did not sign (166.082(b))');
  const notaryOk = ex.value === 'self';
  const witnessRule = ex.value !== 'guardian';
  if (witnessRule && w.value === 'notary' && !notaryOk) fails.push('a notary replaces the witnesses only when the person signs for themselves (166.082(b)); this route needs two witnesses');
  if (witnessRule && w.value === 'two-unqualified') fails.push('neither witness is qualified under 166.003(2): not a relative, heir, the named decision-maker, the attending physician or their employee, or facility staff giving direct care');
  if (witnessRule && w.value === 'none') fails.push('it has neither two witnesses nor a notary acknowledgment');
  if (dx === 'no') fails.push('a parent, guardian, or managing conservator may execute one for a minor only after a physician diagnoses a terminal or irreversible condition (166.085(b))');
  if (concur === 'no') fails.push('with no qualified relative available, another physician not involved in treatment, or an ethics or medical committee representative, must concur (166.088(f))');

  const executedOk = fails.length === 0;
  let bandLabel;
  let band;
  if (!executedOk) {
    bandLabel = 'Not validly executed';
    band = `Not validly executed as entered: ${fails.join('; ')}.`;
  } else if (rev === 'yes') {
    bandLabel = 'Revoked: do not honor';
    band = 'Validly executed, but revoked or superseded. The person may revoke at any time regardless of mental state or competency, and a competent person\'s present wish, a minor\'s included, supersedes the order (166.086, 166.092). Record the time, date, and place of the revocation.';
  } else {
    bandLabel = 'Valid: honor it';
    band = `Validly executed as entered, by ${ex.text[0].toLowerCase()}${ex.text.slice(1)}, and not revoked. It is effective on execution (166.082(g)).`;
  }
  return {
    valid: true,
    honor: executedOk && rev === 'no',
    abnormal: !(executedOk && rev === 'no'),
    bandLabel,
    band,
    readingNote: ex.value === 'guardian'
      ? 'Section 166.088(a) states no witness requirement for an order a guardian executes with the physician, so it is not failed on witnesses here.'
      : (['directive', 'agent', 'minor-parent'].includes(ex.value)
        ? 'Read here: when someone signs in place of the person, the witnesses and the physician\'s signature in 166.082(b) still apply.'
        : null),
    limitsNote: 'Not read here: the standard form (166.083) and what responders must see to honor it, such as the form or an identification device (166.089, 166.090).',
    postureNote: scopeSentence(OOH_VERIFIED),
  };
}
