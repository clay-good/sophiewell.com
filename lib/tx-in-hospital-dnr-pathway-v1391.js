// spec-v1391: Texas in-hospital DNR order -- which 166.203(a) pathway, and what notice is owed.
//
// Sources (official mirror tcss.legis.texas.gov, Health & Safety Code ch. 166, subch. E, added by SB 11
// (2019), read 2026-09-18):
//   166.203(a) A DNR order is valid only if DATED and:
//     (1) issued by a physician providing direct care, in compliance with (A) a competent patient's
//         written, dated directions; (B) a competent patient's oral directions delivered to or
//         observed by two competent adult witnesses, at least one not an employee of the attending
//         physician or a direct-care or management employee of the facility (166.003(2)(E), (F));
//         (C) an advance directive; (D) the directions of a legal guardian, a medical power of
//         attorney agent, or a directive proxy; or (E) a 166.039 treatment decision; or
//     (2) issued by the attending physician when the order is not contrary to a competent patient's
//         directions and, in the attending's reasonable medical judgment, death is imminent, within
//         minutes to hours, regardless of CPR, and the order is medically appropriate; or
//     (3) issued by the attending physician for an incompetent patient, on a decision agreed by the
//         attending and the person responsible for the patient's decisions and concurred in by
//         another physician not involved in direct treatment, or an ethics or medical committee
//         representative.
//   166.203(c) Before an (a)(2) order is placed in the record -- unless 166.204(a) notice was given --
//     staff inform the patient or, if the patient is incompetent, make a reasonably diligent effort
//     to inform the known agent or guardian, or else a person in 166.039(b)(1)-(3).
//   166.204(a) If such a person arrives and tells a physician, PA, or nurse, one with actual
//     knowledge of the order discloses it. (b) Failing to give notice does NOT affect the order's
//     validity. (d) Notice to the first person in priority suffices.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const IHD_VERIFIED = '2026-09-18';
export const CRITERION = [
  { value: 'met', text: 'Met' },
  { value: 'not-met', text: 'Not met' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const BASES = [
  { value: 'written', text: "A competent patient's written, dated directions", ref: '(a)(1)(A)' },
  { value: 'oral', text: "A competent patient's oral directions before two witnesses", ref: '(a)(1)(B)' },
  { value: 'directive', text: 'An advance directive', ref: '(a)(1)(C)' },
  { value: 'decider', text: "A guardian's, agent's, or directive proxy's directions", ref: '(a)(1)(D)' },
  { value: 'treatment-decision', text: 'A 166.039 treatment decision (no directive)', ref: '(a)(1)(E)' },
  { value: 'imminent', text: "The attending physician's judgment that death is imminent", ref: '(a)(2)' },
  { value: 'concurred', text: 'An agreed decision for an incompetent patient, with a second physician', ref: '(a)(3)' },
];

const s3 = (v) => (v === 'met' || v === 'not-met' ? v : null);
const yn = (v) => (v === 'yes' || v === 'no' ? v : null);

const ELEMENTS = {
  oral: [['witnesses', 'two competent adult witnesses, at least one not the physician\'s employee or facility direct-care or management staff']],
  imminent: [
    ['notContrary', "not contrary to a competent patient's directions"],
    ['deathImminent', 'death imminent, within minutes to hours, regardless of CPR'],
    ['appropriate', 'the order is medically appropriate'],
  ],
  concurred: [
    ['incompetent', 'the patient is incompetent or unable to communicate'],
    ['agreed', "agreed by the attending and the person responsible for the patient's decisions"],
    ['secondPhysician', 'concurred in by another physician not involved in direct treatment, or an ethics or medical committee representative'],
  ],
};

export function txInHospitalDnrPathway(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = BASES.find((x) => x.value === o.basis);
  if (!b) return { valid: false, message: 'Choose what the order rests on. Each 166.203(a) pathway has its own requirements.' };
  const dated = yn(o.dated);
  if (!dated) return { valid: false, message: 'Answer whether the order is dated. An undated order is not valid.' };

  const rows = [{ label: 'the order is dated', state: dated === 'yes' ? 'met' : 'not-met' }];
  for (const [k, label] of ELEMENTS[b.value] || []) rows.push({ label, state: s3(o[k]) });
  const unassessed = rows.filter((r) => !r.state).map((r) => r.label);
  const failed = rows.filter((r) => r.state === 'not-met').map((r) => r.label);

  let notice = null;
  if (b.value === 'imminent') {
    const comp = yn(o.patientCompetent);
    if (!comp) return { valid: false, message: 'Answer whether the patient is competent. It decides who must be told of an imminent-death order.' };
    notice = comp === 'yes'
      ? 'Before the order goes into the record, inform the patient of it (166.203(c)(1)).'
      : 'Before the order goes into the record, make a reasonably diligent effort to inform the known agent or guardian or, if none, a spouse, adult child, or parent in that order; telling the first person reached suffices (166.203(c)(2), 166.204(d)). If one of them later arrives and says so, whoever knows of the order discloses it (166.204(a)).';
    notice += ' Missing the notice does not make the order invalid (166.204(b)), but the effort is recorded in the chart.';
  }

  let verdict;
  let bandLabel;
  let band;
  if (unassessed.length) {
    verdict = null;
    bandLabel = 'Incomplete';
    band = `Not decided for 166.203${b.ref}. Still needed: ${unassessed.join('; ')}.${failed.length ? ` Recorded as not met: ${failed.join('; ')}.` : ''}`;
  } else if (failed.length) {
    verdict = 'invalid';
    bandLabel = 'Not a valid DNR order';
    band = `Not valid under 166.203${b.ref}. Not met: ${failed.join('; ')}.`;
  } else {
    verdict = 'valid';
    bandLabel = `Valid under 166.203${b.ref}`;
    band = `Valid under 166.203${b.ref}: ${b.text.toLowerCase()}, and the order is dated. It takes effect when issued and goes into the record as soon as practicable.`;
  }
  return {
    valid: true,
    verdict,
    pathway: b.ref,
    abnormal: verdict === 'invalid',
    bandLabel,
    band,
    notice,
    concurNote: b.value === 'concurred' || b.value === 'treatment-decision' ? 'A second physician: (a)(3) always needs one; an (a)(1)(E) decision needs one when no spouse, adult child, parent, or nearest relative was available (166.039(e)).' : null,
    postureNote: scopeSentence(IHD_VERIFIED),
  };
}
