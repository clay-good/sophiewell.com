// spec-v1396: hospital nurse staffing committee -- composition and cadence (New York, Texas).
//
// Sources, read 2026-09-19:
//   NY Public Health Law 2805-t (nysenate.gov): (2)(c) at least one-half of the clinical staffing
//     committee are registered nurses, licensed practical nurses, and ancillary members of the
//     frontline team currently providing or supporting direct patient care, selected under their
//     collective bargaining agreement or, without one, by their peers; up to one-half are selected by
//     hospital administration. (6) The committee produces the annual clinical staffing plan by July 1.
//     No meeting frequency is stated.
//   TX Health & Safety Code 257.004 (official mirror): the chief nursing officer is a voting member;
//     at least 60 percent of members are RNs who give direct care at least 50 percent of their work
//     time and are selected by peers who do the same; the committee meets at least quarterly;
//     evaluates the staffing plan at least semiannually; and reports to the governing body at least
//     semiannually.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const SC_VERIFIED = '2026-09-19';
export const SC_STATES = stateOptions(['NY', 'TX']);
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function whole(v, label) {
  if (isBlank(v)) return { err: `Enter the number of ${label}.` };
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 200) return { err: `Enter the number of ${label} as a whole number.` };
  return { n };
}
const yn = (v) => (v === 'yes' || v === 'no' ? v : null);

export function staffingCommitteeCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const st = SC_STATES.find((s) => s.value === o.state);
  if (!st) return { valid: false, message: 'Choose New York or Texas.' };
  const total = whole(o.members, 'committee members');
  if (total.err) return { valid: false, message: total.err };
  if (total.n === 0) return { valid: false, message: 'Enter at least one committee member.' };
  const front = whole(o.frontline, st.value === 'NY' ? 'frontline members (RNs, LPNs, and ancillary staff giving or supporting direct care)' : 'RNs who give direct care at least half their work time');
  if (front.err) return { valid: false, message: front.err };
  if (front.n > total.n) return { valid: false, message: 'The frontline members cannot outnumber the committee.' };
  const asks = st.value === 'NY'
    ? [['peerSelected', 'whether the frontline members were chosen under their bargaining agreement or by their peers'], ['planByJuly', 'whether the committee produced this year\'s clinical staffing plan by July 1']]
    : [['peerSelected', 'whether those RNs were selected by their direct-care peers'], ['cnoVoting', 'whether the chief nursing officer is a voting member'], ['quarterly', 'whether the committee met at least once in each of the last four quarters'], ['semiannual', 'whether it evaluated the plan and reported to the governing body at least every six months']];
  for (const [k, what] of asks) if (!yn(o[k])) return { valid: false, message: `Answer ${what}.` };

  const share = front.n / total.n;
  const pct = Math.round(share * 1000) / 10;
  const need = st.value === 'NY' ? 0.5 : 0.6;
  const fails = [];
  if (share < need) fails.push(`${front.n} of ${total.n} members (${pct}%) are ${st.value === 'NY' ? 'frontline staff; at least half must be' : 'direct-care RNs; at least 60% must be'}`);
  if (o.peerSelected === 'no') fails.push(st.value === 'NY' ? 'frontline members were not chosen under the bargaining agreement or by peers (2805-t(2)(c))' : 'the direct-care RNs were not selected by their peers (257.004(d)(2))');
  if (st.value === 'NY' && o.planByJuly === 'no') fails.push('the annual clinical staffing plan was not produced by July 1 (2805-t(6))');
  if (st.value === 'TX' && o.cnoVoting === 'no') fails.push('the chief nursing officer must be a voting member (257.004(c))');
  if (st.value === 'TX' && o.quarterly === 'no') fails.push('the committee must meet at least quarterly (257.004(e))');
  if (st.value === 'TX' && o.semiannual === 'no') fails.push('the plan must be evaluated, and a report made to the governing body, at least semiannually (257.004(g))');
  const minFront = Math.ceil(total.n * need);
  return {
    valid: true,
    meets: fails.length === 0,
    abnormal: fails.length > 0,
    bandLabel: fails.length ? `Does not meet: ${fails.length}` : 'Meets the committee requirements',
    band: fails.length
      ? `Not met: ${fails.join('; ')}.`
      : `${front.n} of ${total.n} members (${pct}%) are ${st.value === 'NY' ? 'frontline staff' : 'direct-care RNs'}, and the other requirements checked are met.`,
    compositionNote: `With ${total.n} members, at least ${minFront} must be ${st.value === 'NY' ? 'frontline staff' : 'direct-care RNs'}.`,
    cadenceNote: st.value === 'NY' ? 'Section 2805-t sets no meeting frequency; the annual plan is due July 1.' : null,
    postureNote: scopeSentence(SC_VERIFIED),
  };
}
