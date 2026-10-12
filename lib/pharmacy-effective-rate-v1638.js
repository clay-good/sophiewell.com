// spec-v1638 tool 24: a pharmacy's achieved effective rate against a contract guarantee.
//
// Source: the reader's contract and remittances. "Effective rate" has no federal definition; the
// formulas are the convention the spec states:
//   effective rate = 1 - (ingredient cost paid / AWP), as a discount off AWP
//   shortfall or overage against the guarantee = (guaranteed rate - achieved rate) x AWP, where a
//     positive figure is what a true-up would take back
//   net reimbursement per prescription = (ingredient cost + dispensing fees - concessions) /
//     prescriptions; net margin = that less acquisition cost per prescription
// For Medicare Part D, 42 CFR 423.100 (eCFR as current October 8, 2026; re-read October 12, 2026):
//   "Negotiated price means the price ... negotiated as the lowest possible reimbursement such
//   network entity will receive, in total, for a particular drug" and it "Includes all price
//   concessions ... from network pharmacies". An effective-rate true-up in a commercial contract
//   is not covered by that rule.
// No AWP or WAC ships. Which claims the contract counts (usual-and-customary, 340B, specialty) is
// the contract's own term; the reader enters the sums the contract counts.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100) / 100;
const pct = (n) => Math.round(n * 10000) / 100;

export function pharmacyEffectiveRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the sum of AWP for the claims the contract counts', o.awp, null, 1e12, 'dollars'], ['the ingredient cost paid on those claims', o.ingredientPaid, 0, 1e12, 'dollars']]);
  if (f) return { valid: false, message: f };
  const awp = Number(o.awp); const paid = Number(o.ingredientPaid);
  const achieved = 1 - paid / awp;
  const notes = [`Achieved effective rate: 1 - (${money(paid)} / ${money(awp)}) = AWP - ${pct(achieved)}%.`];
  const out = { valid: true, achievedDiscountPercent: pct(achieved) };
  let exposure = null;
  if (!blank(o.guaranteedDiscountPercent)) {
    const g = inputFault([['the guaranteed discount off AWP', o.guaranteedDiscountPercent, 0, 100, 'percent']]);
    if (g) return { valid: false, message: g };
    const guaranteed = Number(o.guaranteedDiscountPercent) / 100;
    exposure = cents((guaranteed - achieved) * awp);
    out.trueUpExposure = exposure;
    notes.push(exposure > 0 ? `Guarantee AWP - ${pct(guaranteed)}%: the pharmacy was paid at a shallower discount than the guarantee, by ${pct(guaranteed - achieved)} points. (${pct(guaranteed)}% - ${pct(achieved)}%) x ${money(awp)} = ${money(exposure)}, the amount a true-up to the guaranteed rate would take back.` : exposure < 0 ? `Guarantee AWP - ${pct(guaranteed)}%: the pharmacy was paid at a deeper discount than the guarantee. (${pct(guaranteed)}% - ${pct(achieved)}%) x ${money(awp)} = ${money(exposure)}; a true-up to the guaranteed rate would pay the pharmacy ${money(-exposure)}.` : `Guarantee AWP - ${pct(guaranteed)}%: the achieved rate equals it.`);
  } else notes.push('No guaranteed rate was entered, so no true-up exposure is shown.');
  const per = ['prescriptions', 'dispensingFees', 'concessions', 'acquisitionCost'];
  if (per.some((k) => !blank(o[k]))) {
    const g = inputFault([['the number of prescriptions', o.prescriptions, null, 1e9, ''], ['the dispensing fees paid (0 if none)', o.dispensingFees, 0, 1e12, 'dollars'], ['the price concessions and later fees taken (0 if none)', o.concessions, 0, 1e12, 'dollars'], ['the acquisition cost of the drugs dispensed', o.acquisitionCost, 0, 1e12, 'dollars']]);
    if (g) return { valid: false, message: g };
    const rx = Number(o.prescriptions); const fees = Number(o.dispensingFees); const conc = Number(o.concessions); const acq = Number(o.acquisitionCost);
    const net = paid + fees - conc;
    out.netReimbursementPerRx = cents(net / rx); out.netMarginPerRx = cents((net - acq) / rx); out.concessionPercentOfIngredient = paid > 0 ? pct(conc / paid) : null;
    notes.push(`Net reimbursement: (${money(paid)} + ${money(fees)} fees - ${money(conc)} concessions) / ${rx.toLocaleString('en-US')} prescriptions = ${money(net / rx)} each. After acquisition cost of ${money(acq)}: ${money((net - acq) / rx)} net margin a prescription.${paid > 0 ? ` Concessions are ${pct(conc / paid)}% of ingredient cost.` : ''}`);
    if (exposure !== null && exposure > 0) { out.netMarginPerRxAfterTrueUp = cents((net - acq - exposure) / rx); notes.push(`If the true-up were taken, net margin would be ${money((net - acq - exposure) / rx)} a prescription.`); }
  } else notes.push('No prescription count, fees, concessions or acquisition cost were entered, so no per-prescription figure is shown.');
  notes.push('Run brand and generic separately: contracts guarantee them at different rates, and a blended figure hides both. "Effective rate" has no federal definition, and contracts differ on which claims count; enter the sums for the claims your contract counts.');
  notes.push('For Medicare Part D since 2024, the negotiated price at the point of sale must be the lowest possible reimbursement the pharmacy will receive in total and include all pharmacy price concessions (42 CFR 423.100), so a later Part D clawback beyond it is unexpected. An effective-rate true-up in a commercial contract is not covered by that rule.');
  const owes = exposure !== null && exposure > 0;
  return { ...out, flag: exposure === null ? 'achieved-rate' : owes ? 'true-up-would-take-back' : exposure < 0 ? 'true-up-would-pay-pharmacy' : 'at-the-guarantee', abnormal: owes, band: `Achieved effective rate AWP - ${pct(achieved)}%.`, bandLabel: exposure === null ? 'Achieved rate' : owes ? `True-up exposure ${money(exposure)}` : exposure < 0 ? `Paid ${money(-exposure)} under the guarantee` : 'At the guarantee', notes, note: notes.join(' ') };
}
