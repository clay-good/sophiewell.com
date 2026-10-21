// spec-v1638 tool 24: a pharmacy's achieved effective rate against a contract guarantee, from sums or
// from a claims list.
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
import { rowsOf } from './csv-rows.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100) / 100;
const pct = (n) => Math.round(n * 10000) / 100;
// A discount off AWP as "AWP - 20%"; a payment above AWP as "AWP + 20%", not "AWP - -20%".
const awpRate = (d) => (d < 0 ? `AWP + ${pct(-d)}%` : `AWP - ${pct(d)}%`);

const CONTRACT_NOTE = 'For Medicare Part D since 2024, the negotiated price at the point of sale must be the lowest possible reimbursement the pharmacy will receive in total and include all pharmacy price concessions (42 CFR 423.100), so a later Part D clawback beyond it is unexpected. An effective-rate true-up in a commercial contract is not covered by that rule.';

export function pharmacyEffectiveRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (typeof o.claims === 'string' && o.claims.trim() !== '') return claimsMode(o);
  const f = inputFault([['the sum of AWP for the claims the contract counts', o.awp, null, 1e12, 'dollars'], ['the ingredient cost paid on those claims', o.ingredientPaid, 0, 1e12, 'dollars']]);
  if (f) return { valid: false, message: f };
  const awp = Number(o.awp); const paid = Number(o.ingredientPaid);
  const achieved = 1 - paid / awp;
  const notes = [`Achieved effective rate: 1 - (${money(paid)} / ${money(awp)}) = ${awpRate(achieved)}.`];
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
  const owes = exposure !== null && exposure > 0;
  return { ...out, flag: exposure === null ? 'achieved-rate' : owes ? 'true-up-would-take-back' : exposure < 0 ? 'true-up-would-pay-pharmacy' : 'at-the-guarantee', abnormal: owes, band: `Achieved effective rate ${awpRate(achieved)}.`, bandLabel: exposure === null ? 'Achieved rate' : owes ? `True-up exposure ${money(exposure)}` : exposure < 0 ? `Paid ${money(-exposure)} under the guarantee` : 'At the guarantee', notes, note: CONTRACT_NOTE };
}

// spec-v1638 tool 24, claims mode: a pasted claims list with a header row. Each claim is brand or generic;
// the sums for each go through the same arithmetic as the form, against that type's guarantee. The batch
// check lists claims where the patient paid more than the pharmacy kept (ingredient cost paid plus fees,
// less concessions). Columns are found by name; the reader's list is the contract's set of claims.
const COLUMNS = [
  ['type', /^(type|brand\/generic|brand or generic|b\/g|multisource|drug type)$/],
  ['awp', /^(awp|awp amount|sum of awp|average wholesale price)$/],
  ['paid', /^(ingredient cost paid|ingredient paid|ingredient cost|paid ingredient|ingredient)$/],
  ['fee', /^(dispensing fee|dispensing fee paid|fee|fees)$/],
  ['concession', /^(concession|concessions|price concession|dir|clawback|fees taken)$/],
  ['acquisition', /^(acquisition cost|acquisition|invoice cost|cost)$/],
  ['patientPay', /^(patient pay|patient paid|copay|copayment|coinsurance|patient responsibility)$/],
  ['claim', /^(claim|claim id|claim number|rx|rx number|reference|id)$/],
];
const TYPE = { brand: 'brand', b: 'brand', 'single source': 'brand', generic: 'generic', g: 'generic', 'multi source': 'generic', 'multisource': 'generic' };
function claimsMode(o) {
  const rows = rowsOf(String(o.claims)).filter((r) => r.some((c) => String(c ?? '').trim() !== ''));
  if (rows.length < 2) return { valid: false, message: 'Enter the claims with a header row: type (brand or generic), AWP and ingredient cost paid, then optionally dispensing fee, concessions, acquisition cost and patient pay.' };
  if (rows.length > 50001) return { valid: false, message: 'Enter no more than 50,000 claims.' };
  const head = rows[0].map((h) => String(h ?? '').trim().toLowerCase().replace(/\s+/g, ' '));
  const at = {};
  head.forEach((h, i) => { const hit = COLUMNS.find(([k, re]) => re.test(h) && at[k] === undefined); if (hit) at[hit[0]] = i; });
  for (const [k, word] of [['type', 'type (brand or generic)'], ['awp', 'AWP'], ['paid', 'ingredient cost paid']]) {
    if (at[k] === undefined) return { valid: false, message: `Enter a header row that names the ${word} column. The first row read was: ${rows[0].map((c) => String(c ?? '').trim()).join(', ').slice(0, 120)}.` };
  }
  const num = (cells, k) => { if (at[k] === undefined) return 0; const s = String(cells[at[k]] ?? '').replace(/[$,]/g, '').trim(); return s === '' ? 0 : Number(s); };
  const sums = { brand: null, generic: null };
  const flagged = []; let skipped = 0;
  rows.slice(1).forEach((cells, i) => {
    const t = TYPE[String(cells[at.type] ?? '').trim().toLowerCase()];
    const v = { awp: num(cells, 'awp'), paid: num(cells, 'paid'), fee: num(cells, 'fee'), concession: num(cells, 'concession'), acquisition: num(cells, 'acquisition'), patientPay: num(cells, 'patientPay') };
    if (!t || Object.values(v).some((x) => !Number.isFinite(x) || x < 0) || v.awp <= 0) { skipped += 1; return; }
    const s = sums[t] || (sums[t] = { n: 0, awp: 0, paid: 0, fee: 0, concession: 0, acquisition: 0 });
    s.n += 1; for (const k of ['awp', 'paid', 'fee', 'concession', 'acquisition']) s[k] += v[k];
    const kept = v.paid + v.fee - v.concession;
    if (at.patientPay !== undefined && v.patientPay > kept + 1e-9) flagged.push(`${at.claim !== undefined ? String(cells[at.claim] ?? '').trim() || `row ${i + 2}` : `row ${i + 2}`}: patient paid ${money(v.patientPay)}, the pharmacy kept ${money(kept)}`);
  });
  if (!sums.brand && !sums.generic) return { valid: false, message: `Enter at least one claim with a type of brand or generic and an AWP above zero; ${skipped} row${skipped === 1 ? ' was' : 's were'} not readable.` };
  const notes = []; const out = { valid: true, mode: 'claims' };
  let owes = false;
  for (const t of ['generic', 'brand']) {
    const s = sums[t];
    if (!s) { notes.push(`No ${t} claims in the list.`); continue; }
    const guarantee = t === 'brand' ? o.guaranteedBrandPercent : o.guaranteedGenericPercent;
    const r = pharmacyEffectiveRate({ awp: s.awp, ingredientPaid: s.paid, guaranteedDiscountPercent: guarantee, prescriptions: s.n, dispensingFees: s.fee, concessions: s.concession, acquisitionCost: s.acquisition });
    if (!r.valid) return { valid: false, message: `${t}: ${r.message}` };
    out[t] = { claims: s.n, achievedDiscountPercent: r.achievedDiscountPercent, trueUpExposure: r.trueUpExposure ?? null, netMarginPerRx: r.netMarginPerRx ?? null };
    if (r.trueUpExposure > 0) owes = true;
    notes.push(`${t === 'brand' ? 'Brand' : 'Generic'}, ${s.n.toLocaleString('en-US')} claim${s.n === 1 ? '' : 's'}: ${r.notes[0]} ${blank(guarantee) ? `No ${t} guarantee was entered, so no true-up exposure is shown.` : r.notes[1]}${r.netMarginPerRx !== undefined ? ` Net margin ${money(r.netMarginPerRx)} a prescription.` : ''}`);
  }
  const total = (sums.brand ? sums.brand.n : 0) + (sums.generic ? sums.generic.n : 0);
  out.genericDispensingRatePercent = pct((sums.generic ? sums.generic.n : 0) / total);
  notes.push(`Generic dispensing rate: ${out.genericDispensingRatePercent}% of ${total.toLocaleString('en-US')} claims.`);
  if (at.patientPay === undefined) notes.push('The list has no patient pay column, so no claim was checked for a patient paying more than the pharmacy kept.');
  else notes.push(flagged.length ? `Patient paid more than the pharmacy kept on ${flagged.length} claim${flagged.length === 1 ? '' : 's'}: ${flagged.slice(0, 20).join('; ')}${flagged.length > 20 ? `; and ${flagged.length - 20} more` : ''}.` : 'No claim has the patient paying more than the pharmacy kept.');
  if (skipped) notes.push(`${skipped} row${skipped === 1 ? ' was' : 's were'} left out: no brand or generic type, an AWP of zero, or a number that could not be read.`);
  if (!blank(o.awp) || !blank(o.ingredientPaid)) notes.push('The sums entered in the form were not used; the claims list was.');
  out.patientPaidMoreThanKept = flagged.length;
  return { ...out, flag: owes ? 'true-up-would-take-back' : 'claims', abnormal: owes || flagged.length > 0, band: `Claims list: ${['generic', 'brand'].filter((t) => out[t]).map((t) => `${t} AWP - ${out[t].achievedDiscountPercent}%`).join('; ')}.`, bandLabel: flagged.length ? `${flagged.length} claim${flagged.length === 1 ? '' : 's'} with patient pay above what was kept` : owes ? 'True-up exposure' : 'Achieved rates', notes, note: CONTRACT_NOTE };
}
