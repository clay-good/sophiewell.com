// spec-v1392: New Jersey Medical Aid in Dying for the Terminally Ill Act -- when a prescription may
// first be written, N.J.S.A. 26:16-10.
//
// Source: N.J.S.A. 26:16-10 (FindLaw text, "current as of January 1, 2024", read 2026-09-18):
//   "at least 15 days shall elapse between the initial oral request and the second oral request";
//   the written request may be submitted with the initial oral request "or at any time thereafter";
//   "at least 15 days shall elapse between the patient's initial oral request and the writing of a
//   prescription"; and "at least 48 hours shall elapse between the attending physician's receipt of
//   the patient's written request and the writing of a prescription". No exception shortens the
//   15 days in the text read. A patient may rescind at any time and in any manner.
//
// The tile computes dates and checks documented steps; it never assesses eligibility.
// Residency proof (another section) is not read here.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const NJMAID_VERIFIED = '2026-09-18';
const DAY = 86400000;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function njMaidTimeline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.firstOral)) return { valid: false, message: 'Enter when the first oral request was made. Both 15-day periods run from it.' };
  const first = parseDateTime(o.firstOral);
  if (first === null) return { valid: false, message: 'Enter the first oral request as a date and time.' };
  if (isBlank(o.written)) return { valid: false, message: 'Enter when the attending physician received the written request. The 48 hours run from it.' };
  const written = parseDateTime(o.written);
  if (written === null) return { valid: false, message: 'Enter the written request as a date and time.' };
  if (written < first) return { valid: false, message: 'Enter a written request on or after the first oral request; the Act lets it come with that request or later.' };
  let second = null;
  if (!isBlank(o.secondOral)) {
    second = parseDateTime(o.secondOral);
    if (second === null) return { valid: false, message: 'Enter the second oral request as a date and time.' };
  }

  const fifteen = first + 15 * DAY;
  const fortyEight = addHours(written, 48);
  const secondOk = second !== null && second >= fifteen;
  const candidates = [
    { at: fifteen, why: '15 days after the first oral request' },
    { at: fortyEight.endWall, why: '48 hours after the written request was received' },
  ];
  if (secondOk) candidates.push({ at: second, why: 'the second oral request' });
  const bind = candidates.reduce((a, b) => (b.at > a.at ? b : a));
  const lines = candidates.map((c) => `${c.why}: ${formatDeadline(first, c.at, 'the first oral request')}${c === bind ? ' (binds)' : ''}`);

  let secondNote;
  if (second === null) secondNote = `A second oral request is still needed, at least 15 days after the first: on or after ${formatDeadline(first, fifteen, 'the first oral request')}.`;
  else if (!secondOk) secondNote = 'The second oral request came less than 15 days after the first, so it does not count. Another one is needed at least 15 days after the first.';
  else secondNote = 'The second oral request is at least 15 days after the first.';

  const ready = secondOk;
  return {
    valid: true,
    earliestAt: bind.at,
    binding: bind.why,
    abnormal: false,
    bandLabel: ready ? 'Earliest prescription date' : 'Not yet: a second oral request is still needed',
    band: ready
      ? `The prescription may be written no earlier than ${formatDeadline(first, bind.at, 'the first oral request')}. Binding rule: ${bind.why}.`
      : `Not before ${formatDeadline(first, bind.at, 'the first oral request')} (binding: ${bind.why}), and only after a second oral request made at least 15 days after the first.`,
    lines,
    secondNote,
    rescindNote: 'The patient may rescind the request at any time and in any manner, without regard to mental state. Participation is voluntary for every clinician.',
    postureNote: scopeSentence(NJMAID_VERIFIED),
  };
}
