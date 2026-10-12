// spec-v1637 tool 4: the earliest date a federal rule stops requiring a pharmacy record.
//
// Sources, re-read October 12, 2026 (21 CFR on eCFR as current October 8, 2026; 21 U.S.C. 360eee-1
// in the 2024 edition of the United States Code on govinfo.gov):
//   21 CFR 1304.04(a)  every inventory and other record "for at least 2 years from the date of such
//     inventory or record".
//   1305.17(c)  "DEA Forms 222 are required to be kept available for inspection for a period of two
//     years." The paragraph names no starting date.
//   1305.27(a), (b)  the original signed electronic order "and all linked records for that order
//     for two years". No starting date is named.
//   1306.25(c)  "The original and transferred prescription(s) must be maintained for a period of
//     two years from the date of last refill."
//   1306.08(h)  records of the transfer of an electronic prescription "for a period of two years
//     from the date of the transfer by both the pharmacy transferring ... and the pharmacy
//     receiving".
//   1314.30(e)  each logbook entry "for not fewer than two years after the date on which the entry
//     is made".
//   21 U.S.C. 360eee-1(d)(1)(A)(iii)  a dispenser keeps transaction information, history and
//     statements "for not less than 6 years after the transaction"; (d)(4)(A)(iv) records of a
//     suspect product investigation "for not less than 6 years after the conclusion of the
//     investigation"; (d)(4)(B)(v) records of the disposition of an illegitimate product "for not
//     less than 6 years after the conclusion of the disposition". (k)(1): the provision and receipt
//     of transaction history has no force from November 27, 2023; records already captured keep
//     their period.
//
// Where a paragraph names no starting date, the tool counts from the date entered and says the
// later of the dates on the record is the safer one to enter.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addMonthsUtc } from './deadline.js';
import { inputFault } from './num.js';

export const RECORDS = [
  { value: 'cs-inventory-or-other-record', text: 'Controlled-substance inventory or other required record', years: 2, from: 'the date of the inventory or record', rule: '21 CFR 1304.04(a)', words: 'at least 2 years from the date of such inventory or record' },
  { value: 'executed-form-222', text: 'DEA Form 222 (executed)', years: 2, from: 'the form', rule: '21 CFR 1305.17(c)', words: 'kept available for inspection for a period of two years', noStart: true },
  { value: 'csos-electronic-order', text: 'Electronic (CSOS) order and its linked records', years: 2, from: 'the order', rule: '21 CFR 1305.27', words: 'for two years', noStart: true },
  { value: 'refill-transfer-c3-to-c5', text: 'Schedule III to V prescription transferred for refills', years: 2, from: 'the date of the last refill', rule: '21 CFR 1306.25(c)', words: 'two years from the date of last refill' },
  { value: 'electronic-rx-first-fill-transfer', text: 'Electronic prescription transferred for its first fill', years: 2, from: 'the date of the transfer', rule: '21 CFR 1306.08(h)', words: 'two years from the date of the transfer, by both pharmacies' },
  { value: 'pseudoephedrine-logbook-entry', text: 'Pseudoephedrine or ephedrine logbook entry', years: 2, from: 'the date the entry was made', rule: '21 CFR 1314.30(e)', words: 'not fewer than two years after the date on which the entry is made' },
  { value: 'dscsa-transaction-records', text: 'DSCSA transaction information, history and statement', years: 6, from: 'the transaction', rule: '21 U.S.C. 360eee-1(d)(1)(A)(iii)', words: 'not less than 6 years after the transaction', dscsa: true },
  { value: 'dscsa-suspect-product-investigation', text: 'DSCSA suspect-product investigation record', years: 6, from: 'the conclusion of the investigation', rule: '21 U.S.C. 360eee-1(d)(4)(A)(iv)', words: 'not less than 6 years after the conclusion of the investigation' },
  { value: 'dscsa-illegitimate-product-disposition', text: 'DSCSA illegitimate-product disposition record', years: 6, from: 'the conclusion of the disposition', rule: '21 U.S.C. 360eee-1(d)(4)(B)(v)', words: 'not less than 6 years after the conclusion of the disposition' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function csRecordRetention(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rec = RECORDS.find((r) => r.value === String(o.record ?? '').trim());
  if (!rec) return { valid: false, message: 'Choose the kind of record: the period and the date it is counted from differ.' };
  const start = date(o.countedFrom);
  if (!start) return { valid: false, message: `Enter the date the period is counted from: ${rec.from}.` };
  let longer = null;
  if (!blank(o.longerYears)) {
    const f = inputFault([['the longer period you must meet', o.longerYears, 0, 100, 'years']]);
    if (f) return { valid: false, message: f };
    longer = Number(o.longerYears);
  }
  const federal = addMonthsUtc(start, rec.years * 12);
  const notes = [`${rec.text}: ${rec.words} (${rec.rule}). Counted from ${say(start)}, federal law requires it until at least ${say(federal)}.`];
  if (rec.noStart) notes.push('This paragraph names no starting date. If the record carries more than one date (a later shipment or receipt), entering the latest one gives the safer answer.');
  if (rec.dscsa) notes.push('The duty to provide and receive transaction history ended November 27, 2023 (21 U.S.C. 360eee-1(k)(1)); a history already captured keeps its 6 years.');
  const out = { valid: true, federalUntil: fmtUtc(federal), years: rec.years, rule: rec.rule };
  let until = federal;
  if (longer !== null) {
    const other = addMonthsUtc(start, Math.round(longer * 12));
    out.longerUntil = fmtUtc(other);
    if (other.getTime() > federal.getTime()) { until = other; notes.push(`The longer period entered, ${longer} years, runs to ${say(other)} and governs.`); }
    else notes.push(`The period entered, ${longer} years, is not longer than the federal one.`);
  } else notes.push('No longer period was entered. State law, Medicare and Medicaid contracts and a litigation hold commonly run longer, and the longest one governs.');
  notes.push('These are minimums ("at least", "not less than"): the date is the earliest the federal rule stops requiring the record, not a date to destroy it. HIPAA and Medicare Part D retention are separate rules this does not compute.');
  out.keepUntil = fmtUtc(until);
  return { ...out, flag: 'keep-until', band: `Keep until at least ${say(until)}.`, bandLabel: longer !== null && until.getTime() > federal.getTime() ? 'The longer period entered governs' : `Federal minimum, ${rec.years} years`, notes, note: notes.join(' ') };
}
