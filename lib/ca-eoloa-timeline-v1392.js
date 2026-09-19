// spec-v1392: California End of Life Option Act -- request timing and the written request's
// witnesses, Health & Safety Code 443.2 and 443.3.
//
// Source: leginfo text read 2026-09-18.
//   443.3(a) Two oral requests "a minimum of 48 hours apart", and a written request, to the
//     attending physician, who receives them directly and documents each date (SB 380, Stats. 2021,
//     ch. 542, effective January 1, 2022; before that the gap was 15 days).
//   443.3(b) The written request is signed and dated before two adult witnesses who attest to
//     identity, voluntariness, and sound mind.
//   443.3(c) "Only one of the two witnesses" may (1) be related by blood, marriage, registered
//     domestic partnership, or adoption, or be entitled to part of the estate; (2) own, operate, or
//     be employed at a health care entity where the individual is treated or lives.
//   443.3(d) The attending, consulting physician, or mental health specialist may not be a witness.
//   443.2(a) Eligibility: adult, capacity, terminal disease, voluntary, California resident, able to
//     self-administer. (c) Only the individual may request; no agent, conservator, or surrogate.
//
// The tile computes dates and checks documented steps; eligibility enters as physician findings.
// The Act's sunset (443.215) did not load in research, so no sunset date is printed.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, elapsedHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const EOLOA_VERIFIED = '2026-09-18';
export const WITNESS = [
  { value: 'none', text: 'Neither of these' },
  { value: 'relative', text: 'Related, a registered domestic partner, or an heir' },
  { value: 'entity', text: 'Owns, runs, or works at the health care entity treating or housing the patient' },
  { value: 'both', text: 'Both of these' },
  { value: 'clinician', text: 'The attending, consulting physician, or mental health specialist' },
];
export const CRITERION = [
  { value: 'met', text: 'Documented' },
  { value: 'not-met', text: 'Not met' },
];
const FINDINGS = [
  ['adult', 'adult (18 or older)'],
  ['capacity', 'capacity to make medical decisions'],
  ['terminal', 'terminal disease, death expected within six months'],
  ['resident', 'California resident, with proof'],
  ['selfAdminister', 'able to self-administer'],
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const s3 = (v) => (v === 'met' || v === 'not-met' ? v : null);

export function caEoloaTimeline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.oral1)) return { valid: false, message: 'Enter when the first oral request was made. The second must be at least 48 hours later.' };
  const a = parseDateTime(o.oral1);
  if (a === null) return { valid: false, message: 'Enter the first oral request as a date and time.' };
  const earliestSecond = addHours(a, 48);

  const problems = [];
  let timing;
  if (isBlank(o.oral2)) {
    timing = `The second oral request may be made no earlier than ${formatDeadline(a, earliestSecond.endWall, 'the first oral request')}.`;
  } else {
    const b = parseDateTime(o.oral2);
    if (b === null) return { valid: false, message: 'Enter the second oral request as a date and time.' };
    const gap = elapsedHours(a, b);
    if (gap < 48) {
      problems.push(`the oral requests are ${Math.round(gap * 10) / 10} hours apart; they must be at least 48 hours apart (443.3(a)). A new oral request no earlier than ${formatDeadline(a, earliestSecond.endWall, 'the first oral request')} would count`);
      timing = null;
    } else {
      timing = `The oral requests are ${Math.round(gap * 10) / 10} hours apart, at least the 48 hours required.`;
    }
  }

  const w1 = WITNESS.find((w) => w.value === o.witness1);
  const w2 = WITNESS.find((w) => w.value === o.witness2);
  let witnessText = 'Witnesses not entered.';
  let witnessOpen = true;
  if (w1 && w2) {
    witnessOpen = false;
    const rel = [w1, w2].filter((w) => w.value === 'relative' || w.value === 'both').length;
    const ent = [w1, w2].filter((w) => w.value === 'entity' || w.value === 'both').length;
    if (w1.value === 'clinician' || w2.value === 'clinician') problems.push('the attending, consulting physician, or mental health specialist may not be a witness (443.3(d))');
    if (rel > 1) problems.push('both witnesses are relatives or heirs; only one of the two may be (443.3(c)(1))');
    if (ent > 1) problems.push('both witnesses are tied to the health care entity; only one of the two may be (443.3(c)(2))');
    const crossed = rel === 1 && ent === 1 && !(w1.value === 'both' || w2.value === 'both') && w1.value !== w2.value;
    witnessText = crossed
      ? 'One witness is a relative or heir and the other is tied to the health care entity. Section 443.3(c) can be read as allowing one of each or as allowing only one witness from either list; confirm with counsel.'
      : 'The witness pair meets 443.3(c) and (d) as entered.';
  }

  const findings = FINDINGS.map(([k, label]) => ({ label, state: s3(o[k]) }));
  const notMet = findings.filter((f) => f.state === 'not-met').map((f) => f.label);
  const open = findings.filter((f) => !f.state).map((f) => f.label);

  let bandLabel;
  let band;
  if (problems.length) {
    bandLabel = 'Does not meet 443.3';
    band = `Does not meet 443.3 as entered: ${problems.join('; ')}.`;
  } else if (notMet.length) {
    bandLabel = 'A physician finding is not met';
    band = `Not met: ${notMet.join('; ')}. The request process under 443.3 does not reach a prescription without them.`;
  } else if (open.length || witnessOpen || isBlank(o.oral2)) {
    bandLabel = 'Incomplete';
    const need = [...(isBlank(o.oral2) ? ['the second oral request'] : []), ...(witnessOpen ? ['both witnesses'] : []), ...open.map((x) => `physician finding: ${x}`)];
    band = `Not decided. Still needed: ${need.join('; ')}.${timing ? ` ${timing}` : ''}`;
  } else {
    bandLabel = 'Requests and findings documented';
    band = `The two oral requests, the written request's witnesses, and the physician findings are documented as 443.2 and 443.3 require. ${timing}`;
  }
  return {
    valid: true,
    abnormal: problems.length > 0 || notMet.length > 0,
    bandLabel,
    band,
    witnessText,
    findings: findings.map((f) => `${f.label}: ${f.state === 'met' ? 'documented' : f.state === 'not-met' ? 'not met' : 'not assessed'}`),
    requestNote: 'Only the patient may make the requests, never an agent, conservator, or surrogate (443.2(c)). Participation is voluntary for every clinician. The Act\'s sunset date was not read, so none is printed.',
    postureNote: scopeSentence(EOLOA_VERIFIED),
  };
}
