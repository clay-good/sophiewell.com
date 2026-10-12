// spec-v1638 tool 25: a pharmacy's cost of dispensing per prescription, and break-even volume.
//
// Source: the cost categories are those in the federal definition of a professional dispensing
// fee, 42 CFR 447.502 (eCFR as current October 8, 2026; re-read October 12, 2026): "pharmacy costs
// associated with ensuring that possession of the appropriate covered outpatient drug is
// transferred to a Medicaid beneficiary ... a pharmacist's time in checking the computer for
// information about an individual's coverage, performing drug utilization review and preferred
// drug list review activities, measurement or mixing of the covered outpatient drug, filling the
// container, beneficiary counseling, physically providing the completed prescription ...,
// delivery, special packaging, and overhead associated with maintaining the facility and
// equipment necessary to operate the pharmacy". It is "in excess of the ingredient cost" and
// "Does not include administrative costs incurred by the State".
// The arithmetic (cost per prescription; break-even = fixed costs / contribution per
// prescription) is stated arithmetic. No survey figure ships: the reader's own number is the
// point.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const CATEGORIES = [
  { arg: 'staffCost', dom: 'cod-staff', label: 'Pharmacist and staff pay and benefits for dispensing' },
  { arg: 'professionalCost', dom: 'cod-professional', label: 'Counseling, coverage checks and utilization review, if costed apart from staff pay' },
  { arg: 'packagingCost', dom: 'cod-packaging', label: 'Packaging, labels and containers' },
  { arg: 'deliveryCost', dom: 'cod-delivery', label: 'Delivery' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100) / 100;

export function costOfDispensing(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the prescriptions dispensed in the period', o.prescriptions, null, 1e8, '']]);
  if (f) return { valid: false, message: f };
  const rx = Number(o.prescriptions);
  const rows = []; const missing = [];
  for (const c of CATEGORIES) {
    if (blank(o[c.arg])) { missing.push(c.label.toLowerCase()); continue; }
    const g = inputFault([[c.label.charAt(0).toLowerCase() + c.label.slice(1), o[c.arg], 0, 1e10, 'dollars']]);
    if (g) return { valid: false, message: g };
    rows.push({ label: c.label, amount: Number(o[c.arg]) });
  }
  if (!blank(o.sharedCost)) {
    const g = inputFault([['the shared rent, utilities, equipment and systems cost', o.sharedCost, 0, 1e10, 'dollars'], ['the percent of that shared cost allocated to the prescription department', o.allocationPercent, 0, 100, 'percent']]);
    if (g) return { valid: false, message: g };
    rows.push({ label: `Rent, utilities, equipment and systems, ${Number(o.allocationPercent)}% allocated`, amount: Number(o.sharedCost) * Number(o.allocationPercent) / 100 });
  } else missing.push('shared rent, utilities, equipment and systems');
  if (!rows.length) return { valid: false, message: 'Enter at least one cost for the period: staff, packaging, delivery, or the shared overhead with the percent allocated to the prescription department.' };
  const total = rows.reduce((s, r) => s + r.amount, 0);
  if (total <= 0) return { valid: false, message: 'Enter costs that add to more than zero.' };
  const perRx = total / rx;
  const notes = [`Allocated costs ${money(total)} over ${rx.toLocaleString('en-US')} prescriptions: ${money(perRx)} a prescription.`];
  for (const r of rows) notes.push(`${r.label}: ${money(r.amount)}, ${Math.round((r.amount / total) * 1000) / 10}% of the total, ${money(r.amount / rx)} a prescription.`);
  if (missing.length) notes.push(`Not entered, so not in the figure: ${missing.join('; ')}. A cost left out lowers the result.`);
  const out = { valid: true, totalCost: cents(total), costPerPrescription: cents(perRx), categories: rows.map((r) => ({ label: r.label, amount: cents(r.amount) })) };
  let shortfall = null;
  if (!blank(o.dispensingFee)) {
    const g = inputFault([['the average dispensing fee received', o.dispensingFee, 0, 10000, 'dollars']]);
    if (g) return { valid: false, message: g };
    shortfall = cents(perRx - Number(o.dispensingFee));
    out.shortfallPerPrescription = shortfall;
    notes.push(shortfall > 0 ? `Against an average dispensing fee of ${money(Number(o.dispensingFee))}, the cost is ${money(shortfall)} a prescription more than the fee.` : `Against an average dispensing fee of ${money(Number(o.dispensingFee))}, the fee covers the cost by ${money(-shortfall)} a prescription.`);
  }
  const be = ['fixedCosts', 'averageReimbursement', 'averageIngredientCost', 'variableCostPerRx'];
  if (be.some((k) => !blank(o[k]))) {
    const g = inputFault([['the fixed costs for the period', o.fixedCosts, 0, 1e10, 'dollars'], ['the average reimbursement per prescription', o.averageReimbursement, 0, 1e6, 'dollars'], ['the average ingredient cost per prescription', o.averageIngredientCost, 0, 1e6, 'dollars'], ['the variable cost per prescription (0 if none)', o.variableCostPerRx, 0, 1e6, 'dollars']]);
    if (g) return { valid: false, message: g };
    const contribution = Number(o.averageReimbursement) - Number(o.averageIngredientCost) - Number(o.variableCostPerRx);
    out.contributionPerPrescription = cents(contribution);
    if (contribution <= 0) notes.push(`Break-even: each prescription contributes ${money(contribution)} after ingredient and variable cost, so no volume covers the fixed costs on these figures.`);
    else {
      out.breakEvenPrescriptions = Math.ceil(Number(o.fixedCosts) / contribution);
      notes.push(`Break-even: fixed costs ${money(Number(o.fixedCosts))} / (${money(Number(o.averageReimbursement))} - ${money(Number(o.averageIngredientCost))} - ${money(Number(o.variableCostPerRx))} = ${money(contribution)} a prescription) is ${out.breakEvenPrescriptions.toLocaleString('en-US')} prescriptions, against ${rx.toLocaleString('en-US')} dispensed.`);
    }
  }
  notes.push('The categories follow the federal definition of a professional dispensing fee (42 CFR 447.502), which leaves out the ingredient cost and the state\'s own administrative costs. How much of a shared cost belongs to the prescription department is the reader\'s allocation, and the result moves with it. No survey or benchmark figure is used.');
  const under = shortfall !== null && shortfall > 0;
  return { ...out, flag: under ? 'cost-above-the-fee' : 'cost-per-prescription', abnormal: under, band: `Cost of dispensing ${money(perRx)} a prescription.`, bandLabel: under ? `${money(shortfall)} above the fee` : out.breakEvenPrescriptions !== undefined ? `Break-even at ${out.breakEvenPrescriptions.toLocaleString('en-US')} prescriptions` : 'Cost per prescription', notes, note: notes.join(' ') };
}
