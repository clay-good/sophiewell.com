// spec-v1638 tool 14: Medicare Part B supplying and dispensing fees.
//
// Source: 42 CFR 414.1001, read on eCFR as current October 8, 2026 (re-read October 12, 2026).
//   (a)(1) "A supplying fee of $24 is paid to a pharmacy (no more often than once every 30 days)
//     for the first prescription of drugs and biologicals described in sections 1861(s)(2)(J),
//     1861(s)(2)(Q), and 1861(s)(2)(T) of the Act" (immunosuppressive drugs, oral anticancer
//     drugs and oral antiemetics).
//   (a)(2) "$50 ... for the initial supplied prescription of [immunosuppressive drugs] ... during
//     the first 30-day period following a transplant."
//   (a)(3) "$16 ... for each prescription following the first prescription".
//   (a)(4) "A separate supplying fee is paid ... for each prescription".
//   (b)(1) "$57 ... for the initial dispensed 30-day supply of inhalation drugs furnished through
//     durable medical equipment ..., regardless of the number of partial shipments"; (b)(2) "$33
//     ... for each dispensed 30-day supply" otherwise; (c) "$66 ... for each dispensed 90-day
//     supply".
// These are regulation constants "[b]eginning in CY 2006", not annual figures. The fee is apart
// from the payment for the drug itself.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const CATEGORIES = [
  opt('immunosuppressive-drug', 'Immunosuppressive drug'),
  opt('oral-anticancer-drug', 'Oral anticancer drug'),
  opt('oral-antiemetic-drug', 'Oral antiemetic'),
  opt('inhalation-drug-through-dme', 'Inhalation drug through durable medical equipment'),
];
export const FIRST = [opt('first-prescription-in-30-days', 'Includes the beneficiary\'s first prescription in this 30-day period'), opt('first-already-paid', 'A first-prescription fee was already paid in this 30-day period')];
export const TRANSPLANT = [opt('initial-after-transplant', 'Yes: the initial prescription in the first 30 days after a transplant'), opt('not-initial-after-transplant', 'No')];
export const SUPPLY = [opt('initial-30-day-supply', 'The initial dispensed 30-day supply'), opt('later-30-day-supply', 'A later 30-day supply'), opt('ninety-day-supply', 'A 90-day supply')];
const money = (n) => `$${n.toLocaleString('en-US')}`;

export function partbSupplyDispensingFee(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cat = CATEGORIES.find((c) => c.value === String(o.category ?? '').trim());
  if (!cat) return { valid: false, message: 'Choose the drug category: the supplying fees and the inhalation dispensing fees are separate schedules.' };
  const notes = []; const fees = [];
  if (cat.value === 'inhalation-drug-through-dme') {
    const s = SUPPLY.find((x) => x.value === String(o.supply ?? '').trim());
    if (!s) return { valid: false, message: 'Choose the supply: the initial 30-day supply, a later 30-day supply, or a 90-day supply.' };
    const fee = s.value === 'initial-30-day-supply' ? 57 : s.value === 'later-30-day-supply' ? 33 : 66;
    const para = s.value === 'initial-30-day-supply' ? '(b)(1)' : s.value === 'later-30-day-supply' ? '(b)(2)' : '(c)';
    fees.push({ what: s.text, fee });
    notes.push(`Inhalation drugs through durable medical equipment, ${s.text.charAt(0).toLowerCase()}${s.text.slice(1)}: a dispensing fee of ${money(fee)}, whatever the number of partial shipments (42 CFR 414.1001${para}).`);
  } else {
    const f = inputFault([['the number of prescriptions supplied in this 30-day period', o.prescriptions, 1, 200, '']]);
    if (f) return { valid: false, message: f };
    if (!Number.isInteger(Number(o.prescriptions))) return { valid: false, message: 'Enter the number of prescriptions as a whole number.' };
    const n = Number(o.prescriptions);
    const first = FIRST.find((x) => x.value === String(o.first ?? '').trim());
    if (!first) return { valid: false, message: 'Choose whether these include the beneficiary\'s first prescription in the 30-day period: the first is paid at a different fee, once.' };
    let rest = n;
    if (first.value === 'first-prescription-in-30-days') {
      let firstFee = 24; let para = '(a)(1)';
      if (cat.value === 'immunosuppressive-drug') {
        const t = TRANSPLANT.find((x) => x.value === String(o.transplant ?? '').trim());
        if (!t) return { valid: false, message: 'Choose whether this is the initial immunosuppressive prescription in the first 30 days after a transplant: that one is paid $50.' };
        if (t.value === 'initial-after-transplant') { firstFee = 50; para = '(a)(2)'; }
      }
      fees.push({ what: 'First prescription', fee: firstFee });
      notes.push(`First prescription in the 30-day period: ${money(firstFee)}${firstFee === 50 ? ', the initial immunosuppressive prescription in the first 30 days after a transplant' : ', paid no more often than once every 30 days'} (42 CFR 414.1001${para}).`);
      rest = n - 1;
    }
    if (rest > 0) { fees.push({ what: `${rest} further prescription${rest === 1 ? '' : 's'}`, fee: rest * 16 }); notes.push(`${rest} prescription${rest === 1 ? '' : 's'} after the first: $16 each, ${money(rest * 16)} (414.1001(a)(3)). A separate supplying fee is paid for each prescription (414.1001(a)(4)).`); }
    notes.push('The $24, $16 and $50 fees apply to immunosuppressive drugs, oral anticancer drugs and oral antiemetics alike; only the $50 transplant fee is limited to immunosuppressives.');
  }
  const total = fees.reduce((sum, x) => sum + x.fee, 0);
  notes.push('These amounts are fixed in the regulation beginning in 2006 and are not updated yearly. The fee is separate from Medicare\'s payment for the drug.');
  return { valid: true, flag: 'fee', fees, total, abnormal: false, band: `Total fee ${money(total)}.`, bandLabel: fees.map((x) => `${x.what}: ${money(x.fee)}`).join('; '), notes, note: notes.join(' ') };
}
