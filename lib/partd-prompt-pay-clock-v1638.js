// spec-v1638 tool 10: Part D prompt payment due date and interest.
//
// Source: 42 CFR 423.520(a)-(e), read on eCFR as current October 8, 2026 (re-read October 12,
// 2026).
//   (a)(1)  clean claims "submitted by network pharmacies (other than mail-order and long-term
//     care pharmacies)" are paid within "14 days after the date on which the claim is received
//     ... for an electronic claim; or 30 days ... for any other claim."
//   (a)(2)  received "On the date on which the claim is transferred, for an electronic claim; or
//     On the 5th day after the postmark day of the claim or the date specified in the time stamp
//     of the transmission, for any other claim, whichever is sooner."
//   (c)(1)  deemed clean if the sponsor gives no notice of a deficiency within 10 days
//     (electronic) or 15 days (other) of receipt; (c)(2)(ii) after additional information, if no
//     notice of a remaining defect "within 10 days of the date on which additional information is
//     received".
//   (d)  paid on the date the payment is transferred (electronic) or submitted to the Postal
//     Service or a common carrier (other).
//   (e)(1)  interest "at a rate equal to the weighted average of interest on 3-month marketable
//     Treasury securities determined for such period, increased by 0.1 percentage point for the
//     period beginning on the day after the required payment date and ending on the date on which
//     the payment is made".
// The rule states no day-count basis; the tool uses 365 and says so. No Treasury rate ships. The
// rule does not say how a deficiency notice moves the payment date, and the tool does not guess:
// it reports whether the claim is deemed clean and counts lateness from the original due date
// only when no timely notice was given.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const PHARMACIES = [opt('retail-network-pharmacy', 'Retail network pharmacy'), opt('mail-order-pharmacy', 'Mail-order pharmacy'), opt('ltc-pharmacy', 'Long-term care pharmacy')];
export const CLAIMS = [opt('electronic-claim', 'Electronic claim'), opt('paper-or-other-claim', 'Paper or other claim')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const days = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function partdPromptPayClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ph = PHARMACIES.find((p) => p.value === String(o.pharmacy ?? '').trim());
  if (!ph) return { valid: false, message: 'Choose the pharmacy type: the prompt payment rule leaves out mail-order and long-term care pharmacies.' };
  if (ph.value !== 'retail-network-pharmacy') {
    const notes = [`42 CFR 423.520(a)(1) covers clean claims from network pharmacies other than mail-order and long-term care pharmacies, so its 14-day and 30-day clocks do not apply to a ${ph.text.toLowerCase()}. Payment timing is whatever the pharmacy's contract with the plan says.`];
    if (ph.value === 'ltc-pharmacy') notes.push('A separate contract term gives a long-term care pharmacy not less than 30 nor more than 90 days to submit claims (42 CFR 423.505(b)(20), as the spec read it; not re-read at build).');
    return { valid: true, flag: 'rule-does-not-apply', abnormal: false, band: 'The Part D prompt payment clocks do not apply to this pharmacy type.', bandLabel: 'Outside the rule', notes, note: notes.join(' ') };
  }
  const claim = CLAIMS.find((c) => c.value === String(o.claim ?? '').trim());
  if (!claim) return { valid: false, message: 'Choose an electronic claim or another kind: the clocks are 14 days and 30 days.' };
  const electronic = claim.value === 'electronic-claim';
  const sent = date(o.sent);
  if (!sent) return { valid: false, message: electronic ? 'Enter the date the claim was transferred.' : 'Enter the postmark date or the transmission time-stamp date of the claim.' };
  const received = electronic ? sent : addCalendarDaysUtc(sent, 5);
  const due = addCalendarDaysUtc(received, electronic ? 14 : 30);
  const noticeBy = addCalendarDaysUtc(received, electronic ? 10 : 15);
  const notes = [electronic ? `Received ${say(received)}, the date the claim was transferred (42 CFR 423.520(a)(2)(i)).` : `Received ${say(received)}: the 5th day after the postmark, or the date of the transmission time stamp, whichever is sooner (423.520(a)(2)(ii)). The date entered was taken as the postmark; if it is a time stamp, the claim was received that day and each date below is 5 days earlier.`];
  notes.push(`Payment due ${say(due)}, ${electronic ? 14 : 30} days after receipt (423.520(a)(1)).`);
  const out = { valid: true, received: fmtUtc(received), paymentDue: fmtUtc(due), deficiencyNoticeBy: fmtUtc(noticeBy) };
  let contested = false;
  if (!blank(o.deficiencyNotice)) {
    const n = date(o.deficiencyNotice);
    if (!n) return { valid: false, message: 'Enter the date of the deficiency notice as a real date, or leave it blank.' };
    contested = n.getTime() <= noticeBy.getTime();
    notes.push(contested ? `A deficiency notice on ${say(n)} is within ${electronic ? 10 : 15} days of receipt, so the claim is not deemed clean on its first submission (423.520(c)(1)).` : `A deficiency notice on ${say(n)} is after ${say(noticeBy)}, the ${electronic ? 10 : 15}th day from receipt, so the claim is deemed clean (423.520(c)(1)).`);
    if (contested && !blank(o.additionalInfo)) {
      const ai = date(o.additionalInfo);
      if (!ai) return { valid: false, message: 'Enter the date the additional information was received as a real date, or leave it blank.' };
      const again = addCalendarDaysUtc(ai, 10);
      out.remainingDefectNoticeBy = fmtUtc(again);
      notes.push(`Additional information was received ${say(ai)}. If the sponsor gives no notice of a remaining or new defect by ${say(again)}, 10 days later, the claim is deemed clean (423.520(c)(2)(ii)). The rule does not say when a claim made clean this way must be paid, and this does not guess a date.`);
    } else if (contested) notes.push('No date for additional information was entered.');
  } else notes.push(`No deficiency notice was entered. With none by ${say(noticeBy)}, the claim is deemed clean (423.520(c)(1)).`);
  out.deemedClean = !contested;
  if (!blank(o.paid)) {
    const paid = date(o.paid);
    if (!paid) return { valid: false, message: 'Enter the date paid as a real date, or leave it blank.' };
    const late = contested ? null : Math.max(0, days(paid, due));
    out.paid = fmtUtc(paid);
    if (contested) notes.push(`Paid ${say(paid)}. Because a timely deficiency notice was given, lateness is not counted from the original due date here.`);
    else {
      out.daysLate = late;
      notes.push(late ? `Paid ${say(paid)}: ${late} day${late === 1 ? '' : 's'} after the due date. The payment date is the day it was transferred, or handed to the Postal Service or a carrier (423.520(d)).` : `Paid ${say(paid)}: on time.`);
      if (late && !blank(o.amount) && !blank(o.treasuryRatePercent)) {
        const f = inputFault([['the claim amount', o.amount, 0, 1e9, 'dollars'], ['the 3-month Treasury rate for the period', o.treasuryRatePercent, 0, 100, 'percent']]);
        if (f) return { valid: false, message: f };
        const rate = Number(o.treasuryRatePercent) + 0.1;
        out.interest = Math.round(Number(o.amount) * (rate / 100) * (late / 365) * 100) / 100;
        notes.push(`Interest: ${money(Number(o.amount))} x (${Number(o.treasuryRatePercent)}% + 0.1 point = ${Math.round(rate * 1000) / 1000}%) x ${late} / 365 = ${money(out.interest)} (423.520(e)(1)). The rule states no day-count basis; 365 is this tool's assumption.`);
      } else if (late) notes.push('Interest runs from the day after the due date through the payment date, at the weighted average 3-month Treasury rate for the period plus 0.1 percentage point (423.520(e)(1)). Enter the claim amount and that rate to compute it; no rate is supplied here.');
    }
  } else notes.push('No payment date was entered.');
  notes.push('CMS may excuse interest in exigent circumstances such as a natural disaster (423.520(e)(2)).');
  const lateFlag = out.daysLate > 0;
  return { ...out, flag: lateFlag ? 'paid-late' : contested ? 'deficiency-notice-given' : 'due-date', abnormal: lateFlag, band: `Payment due ${say(due)}.`, bandLabel: lateFlag ? `${out.daysLate} day${out.daysLate === 1 ? '' : 's'} late${out.interest !== undefined ? `; interest ${money(out.interest)}` : ''}` : contested ? 'Not deemed clean on first submission' : 'Deemed clean', notes, note: notes.join(' ') };
}
