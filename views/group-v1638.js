// spec-v1638: the pharmacy as a business and as a regulated Medicare and Medicaid provider.
// rx-pricing-math, inventory-turns, med-pass-error-rate, psychotropic-prn-clock, gdr-attempt-check,
// partd-daily-cost-share, partb-supply-dispensing-fee, dmepos-refill-window, ltc-short-cycle-check,
// partd-prompt-pay-clock, partd-insulin-cost-cap, cost-of-dispensing, medicaid-ful-check,
// medicaid-drug-payment-check, partd-transition-fill, pharmacy-effective-rate, mtm-eligibility-check,
// ccm-time-units, vaccine-interval-validity, partd-dmp-criteria-check, partd-opioid-safety-edit,
// partd-dmp-notice-clock, ltc-mrr-tracker, glucose-supply-quantity-check, supd-measure,
// partd-concurrent-use-measures, partd-opioid-measures, mtm-service-clock.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as PM from '../lib/rx-pricing-math-v1638.js';
import * as IT from '../lib/inventory-turns-v1638.js';
import * as ME from '../lib/med-pass-error-rate-v1638.js';
import * as PC from '../lib/psychotropic-prn-clock-v1638.js';
import * as GD from '../lib/gdr-attempt-check-v1638.js';
import * as DC from '../lib/partd-daily-cost-share-v1638.js';
import * as SF from '../lib/partb-supply-dispensing-fee-v1638.js';
import * as DR from '../lib/dmepos-refill-window-v1638.js';
import * as SC from '../lib/ltc-short-cycle-check-v1638.js';
import * as PP from '../lib/partd-prompt-pay-clock-v1638.js';
import * as IC from '../lib/partd-insulin-cost-cap-v1638.js';
import * as CD from '../lib/cost-of-dispensing-v1638.js';
import * as MF from '../lib/medicaid-ful-check-v1638.js';
import { loadFulLookup } from '../lib/aca-ful-load.js';
import { normalizeNdc } from '../lib/nadac-margin.js';
import * as MP from '../lib/medicaid-drug-payment-check-v1638.js';
import * as TF from '../lib/partd-transition-fill-v1638.js';
import * as ER from '../lib/pharmacy-effective-rate-v1638.js';
import * as MT from '../lib/mtm-eligibility-check-v1638.js';
import * as CC from '../lib/ccm-time-units-v1638.js';
import * as VI from '../lib/vaccine-interval-validity-v1638.js';
import * as DM from '../lib/partd-dmp-criteria-check-v1638.js';
import * as OE from '../lib/partd-opioid-safety-edit-v1638.js';
import * as NC from '../lib/partd-dmp-notice-clock-v1638.js';
import * as MR from '../lib/ltc-mrr-tracker-v1638.js';
import * as GS from '../lib/glucose-supply-quantity-check-v1638.js';
import * as SU from '../lib/supd-measure-v1638.js';
import * as CU from '../lib/partd-concurrent-use-measures-v1638.js';
import * as OM from '../lib/partd-opioid-measures-v1638.js';
import * as MC from '../lib/mtm-service-clock-v1638.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function dateField(root, label, id, type = 'date') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}

export const renderers = {
  'rx-pricing-math'(root) {
    const pairs = [['rpm-cost', 'cost'], ['rpm-price', 'price'], ['rpm-markup', 'markupPercent'], ['rpm-margin', 'marginPercent'], ['rpm-target', 'targetMarginPercent'], ['rpm-fee', 'fee']];
    note(root, 'Enter any two of the first four.');
    numField(root, 'Acquisition cost, dollars', 'rpm-cost', '');
    numField(root, 'Selling price, dollars', 'rpm-price', '');
    numField(root, 'Markup on cost, percent', 'rpm-markup', '');
    numField(root, 'Gross margin on price, percent', 'rpm-margin', '');
    numField(root, 'A target margin to price for, percent (optional)', 'rpm-target', '');
    numField(root, 'Dispensing fee added to that price, dollars (optional)', 'rpm-fee', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PM.rxPricingMath(args), o);
    }));
  },
  'inventory-turns'(root) {
    const pairs = [['inv-cogs', 'cogs'], ['inv-days', 'periodDays'], ['inv-begin', 'beginningInventory'], ['inv-end', 'endingInventory'], ['inv-target', 'targetDaysOnHand'], ['inv-use', 'dailyUse'], ['inv-lead', 'leadTimeDays'], ['inv-safety', 'safetyStock']];
    numField(root, 'Cost of goods sold for the period, dollars', 'inv-cogs', '');
    numField(root, 'Days in the period', 'inv-days', '');
    numField(root, 'Beginning inventory at cost, dollars', 'inv-begin', '');
    numField(root, 'Ending inventory at cost, dollars', 'inv-end', '');
    numField(root, 'Target days on hand (optional)', 'inv-target', '');
    numField(root, 'One item: average daily use, units', 'inv-use', '');
    numField(root, 'One item: supplier lead time, days', 'inv-lead', '');
    numField(root, 'One item: safety stock, units (0 if none)', 'inv-safety', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IT.inventoryTurns(args), o);
    }));
  },
  'med-pass-error-rate'(root) {
    const pairs = [['mpe-given', 'dosesGiven'], ['mpe-omitted', 'dosesOmitted'], ['mpe-errors', 'errors'], ['mpe-significant', 'significantErrors']];
    numField(root, 'Doses observed being administered', 'mpe-given', '');
    numField(root, 'Doses ordered but not administered (0 if none)', 'mpe-omitted', '');
    numField(root, 'Errors observed, significant and non-significant together (0 if none)', 'mpe-errors', '');
    numField(root, 'How many of the errors were significant (0 if none)', 'mpe-significant', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(ME.medPassErrorRate(args), o);
    }));
  },
  'psychotropic-prn-clock'(root) {
    const pairs = [['ppc-kind', 'kind'], ['ppc-started', 'started'], ['ppc-extension', 'extension'], ['ppc-duration', 'durationDays'], ['ppc-evaluated', 'evaluated']];
    selectField(root, 'The PRN order is for', 'ppc-kind', PC.KINDS);
    dateField(root, 'Date the PRN order started', 'ppc-started');
    selectField(root, 'Not an antipsychotic: is an extension documented?', 'ppc-extension', PC.RATIONALE);
    numField(root, 'The documented duration of the order, days', 'ppc-duration', '');
    dateField(root, 'Antipsychotic: date the prescriber examined the resident (optional)', 'ppc-evaluated');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PC.psychotropicPrnClock(args, new Date()), o);
    }));
  },
  'gdr-attempt-check'(root) {
    const pairs = [['gdr-started', 'started'], ['gdr-attempts', 'attempts'], ['gdr-contra', 'contraindication']];
    dateField(root, 'Date admitted on the psychotropic, or the date it was started', 'gdr-started');
    areaField(root, 'Dates of the GDR attempts, one per line (YYYY-MM-DD)', 'gdr-attempts', '2026-03-01');
    selectField(root, 'Clinical contraindication', 'gdr-contra', GD.CONTRAINDICATION);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(GD.gdrAttemptCheck(args), o);
    }));
  },
  'partd-daily-cost-share'(root) {
    const pairs = [['pdc-sharing', 'sharing'], ['pdc-copay', 'monthlyCopay'], ['pdc-pct', 'coinsurancePercent'], ['pdc-price', 'priceDispensed'], ['pdc-month', 'monthDays'], ['pdc-days', 'daysDispensed'], ['pdc-solid', 'solidOral'], ['pdc-abx', 'antibiotic'], ['pdc-orig', 'originalContainer']];
    selectField(root, 'The plan charges', 'pdc-sharing', DC.SHARING);
    numField(root, 'Copayment: the monthly copayment, dollars', 'pdc-copay', '');
    numField(root, 'Coinsurance: the percentage', 'pdc-pct', '');
    numField(root, 'Coinsurance: price of the supply actually dispensed, dollars', 'pdc-price', '');
    numField(root, 'Days in the approved one-month supply', 'pdc-month', '');
    numField(root, 'Days actually dispensed', 'pdc-days', '');
    selectField(root, 'Is it a solid oral dose (a tablet or capsule)?', 'pdc-solid', DC.YES_NO);
    selectField(root, 'Is it an antibiotic?', 'pdc-abx', DC.YES_NO);
    selectField(root, 'Is it dispensed in its original container or packaging?', 'pdc-orig', DC.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DC.partdDailyCostShare(args), o);
    }));
  },
  'partb-supply-dispensing-fee'(root) {
    const pairs = [['psf-category', 'category'], ['psf-count', 'prescriptions'], ['psf-first', 'first'], ['psf-transplant', 'transplant'], ['psf-supply', 'supply']];
    selectField(root, 'Drug category', 'psf-category', SF.CATEGORIES);
    numField(root, 'Prescriptions supplied in this 30-day period (not for inhalation drugs)', 'psf-count', '');
    selectField(root, 'The first prescription in the period', 'psf-first', SF.FIRST);
    selectField(root, 'Immunosuppressive: is it the initial prescription in the first 30 days after a transplant?', 'psf-transplant', SF.TRANSPLANT);
    selectField(root, 'Inhalation drug: the supply dispensed', 'psf-supply', SF.SUPPLY);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SF.partbSupplyDispensingFee(args), o);
    }));
  },
  'dmepos-refill-window'(root) {
    const pairs = [['drw-last', 'lastService'], ['drw-qty', 'quantity'], ['drw-use', 'dailyUse'], ['drw-end', 'expectedEnd'], ['drw-contact', 'contacted'], ['drw-planned', 'plannedService']];
    dateField(root, 'Date of the last delivery or shipment', 'drw-last');
    numField(root, 'Quantity delivered', 'drw-qty', '');
    numField(root, 'Daily use', 'drw-use', '');
    dateField(root, 'Or the expected end of the current supply, in place of the three above', 'drw-end');
    dateField(root, 'Date the supplier contacted the beneficiary (optional)', 'drw-contact');
    dateField(root, 'Planned delivery or shipping date (optional)', 'drw-planned');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DR.dmeposRefillWindow(args), o);
    }));
  },
  'ltc-short-cycle-check'(root) {
    const pairs = [['lsc-drug', 'drug'], ['lsc-facility', 'facility'], ['lsc-solid', 'solidOral'], ['lsc-abx', 'antibiotic'], ['lsc-orig', 'originalContainer'], ['lsc-days', 'daysToDispense'], ['lsc-total', 'totalDays']];
    selectField(root, 'Brand or generic', 'lsc-drug', SC.DRUGS);
    selectField(root, 'Facility or pharmacy type', 'lsc-facility', SC.FACILITIES);
    selectField(root, 'Is it a solid oral dose (a tablet or capsule)?', 'lsc-solid', SC.YES_NO);
    selectField(root, 'Is it an antibiotic?', 'lsc-abx', SC.YES_NO);
    selectField(root, 'Is it dispensed in its original container or packaging?', 'lsc-orig', SC.YES_NO);
    numField(root, 'Days supply to dispense (optional)', 'lsc-days', '');
    numField(root, 'Total days ordered (optional)', 'lsc-total', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SC.ltcShortCycleCheck(args), o);
    }));
  },
  'partd-prompt-pay-clock'(root) {
    const pairs = [['ppp-pharmacy', 'pharmacy'], ['ppp-claim', 'claim'], ['ppp-sent', 'sent'], ['ppp-notice', 'deficiencyNotice'], ['ppp-info', 'additionalInfo'], ['ppp-paid', 'paid'], ['ppp-amount', 'amount'], ['ppp-rate', 'treasuryRatePercent']];
    selectField(root, 'Pharmacy type', 'ppp-pharmacy', PP.PHARMACIES);
    selectField(root, 'Kind of claim', 'ppp-claim', PP.CLAIMS);
    dateField(root, 'Date the claim was transferred, or its postmark date', 'ppp-sent');
    dateField(root, 'Date of any deficiency notice (optional)', 'ppp-notice');
    dateField(root, 'Date additional information was received (optional)', 'ppp-info');
    dateField(root, 'Date paid (optional)', 'ppp-paid');
    numField(root, 'Claim amount, dollars (optional, for interest)', 'ppp-amount', '');
    numField(root, '3-month Treasury rate for the period, percent (optional, for interest)', 'ppp-rate', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PP.partdPromptPayClock(args), o);
    }));
  },
  'partd-insulin-cost-cap'(root) {
    const pairs = [['pic-year', 'planYear'], ['pic-days', 'daysSupply'], ['pic-month', 'monthDays'], ['pic-price', 'negotiatedPrice'], ['pic-mfp', 'maxFairPrice'], ['pic-charged', 'charged']];
    numField(root, 'Plan year', 'pic-year', '');
    numField(root, 'Days supply of the fill', 'pic-days', '');
    numField(root, 'Days in a one-month supply under the plan', 'pic-month', '');
    numField(root, 'Negotiated price for a one-month supply, dollars', 'pic-price', '');
    numField(root, 'Maximum fair price for a one-month supply, dollars (if the insulin has one)', 'pic-mfp', '');
    numField(root, 'Cost sharing the claim charged, dollars (optional)', 'pic-charged', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IC.partdInsulinCostCap(args), o);
    }));
  },
  'cost-of-dispensing'(root) {
    const pairs = [['cod-rx', 'prescriptions'], ...CD.CATEGORIES.map((c) => [c.dom, c.arg]), ['cod-shared', 'sharedCost'], ['cod-alloc', 'allocationPercent'], ['cod-fee', 'dispensingFee'], ['cod-fixed', 'fixedCosts'], ['cod-reimb', 'averageReimbursement'], ['cod-ingredient', 'averageIngredientCost'], ['cod-variable', 'variableCostPerRx']];
    numField(root, 'Prescriptions dispensed in the period', 'cod-rx', '');
    for (const c of CD.CATEGORIES) numField(root, `${c.label}, dollars`, c.dom, '');
    numField(root, 'Shared rent, utilities, equipment and systems, dollars', 'cod-shared', '');
    numField(root, 'Percent of that shared cost allocated to the prescription department', 'cod-alloc', '');
    numField(root, 'Average dispensing fee received, dollars (optional)', 'cod-fee', '');
    numField(root, 'Break-even: fixed costs for the period, dollars (optional)', 'cod-fixed', '');
    numField(root, 'Break-even: average reimbursement per prescription, dollars', 'cod-reimb', '');
    numField(root, 'Break-even: average ingredient cost per prescription, dollars', 'cod-ingredient', '');
    numField(root, 'Break-even: variable cost per prescription, dollars (0 if none)', 'cod-variable', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CD.costOfDispensing(args), o);
    }));
  },
  'medicaid-ful-check'(root) {
    const pairs = [['mfc-ndc', 'ndc'], ['mfc-amp', 'weightedAmp'], ['mfc-nadac', 'surveyCost'], ['mfc-qty', 'quantity'], ['mfc-fee', 'dispensingFee']];
    // spec-v1638 tool 18, file mode: an NDC reads CMS's federal upper limits file (data/aca-ful).
    const ndcWrap = el('p');
    ndcWrap.appendChild(el('label', { for: 'mfc-ndc', text: 'NDC, to read the limit from CMS\'s file (optional)' }));
    ndcWrap.appendChild(el('br'));
    ndcWrap.appendChild(el('input', { id: 'mfc-ndc', type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: 'e.g. 00093-3542-56' }));
    root.appendChild(ndcWrap);
    numField(root, 'Weighted average of the monthly AMPs, dollars per unit (by hand)', 'mfc-amp', '');
    numField(root, 'National survey acquisition cost (NADAC), dollars per unit (optional)', 'mfc-nadac', '');
    numField(root, 'Quantity, units (optional)', 'mfc-qty', '');
    numField(root, 'State professional dispensing fee, dollars (with a quantity)', 'mfc-fee', '');
    const o = out(); root.appendChild(o);
    let seq = 0;
    wire(pairs.map(([d]) => d), () => {
      const mine = ++seq;
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const ndc = String(args.ndc).trim() ? normalizeNdc(args.ndc).ndc : null;
      if (!ndc) { safe(o, () => show(MF.medicaidFulCheck(args), o)); return; }
      safe(o, () => note(o, 'Looking up this NDC in CMS\'s federal upper limits file...'));
      loadFulLookup(ndc).then((lookup) => { if (mine === seq) safe(o, () => show(MF.medicaidFulCheck({ ...args, lookup }), o)); });
    });
  },
  'medicaid-drug-payment-check'(root) {
    const pairs = [['mdp-aac', 'aacPerUnit'], ['mdp-qty', 'quantity'], ['mdp-fee', 'dispensingFee'], ['mdp-uc', 'usualAndCustomary'], ['mdp-ful', 'fulPerUnit'], ['mdp-mac', 'stateMacPerUnit'], ['mdp-paid', 'amountPaid']];
    numField(root, 'State actual acquisition cost, dollars per unit', 'mdp-aac', '');
    numField(root, 'Quantity, units', 'mdp-qty', '');
    numField(root, 'State professional dispensing fee, dollars', 'mdp-fee', '');
    numField(root, 'Usual and customary charge for the prescription, dollars', 'mdp-uc', '');
    numField(root, 'Federal upper limit, dollars per unit (if the drug has one)', 'mdp-ful', '');
    numField(root, 'State maximum allowable cost, dollars per unit (if any)', 'mdp-mac', '');
    numField(root, 'Amount paid, dollars (optional)', 'mdp-paid', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MP.medicaidDrugPaymentCheck(args), o);
    }));
  },
  'partd-transition-fill'(root) {
    const pairs = [['ptf-status', 'drugStatus'], ['ptf-effective', 'coverageEffective'], ['ptf-requested', 'requested'], ['ptf-month', 'monthDays'], ['ptf-already', 'alreadySupplied'], ['ptf-change', 'immediateChange'], ['ptf-written', 'daysWritten'], ['ptf-adjudicated', 'adjudicated'], ['ptf-member', 'memberType'], ['ptf-ltc', 'ltcResident'], ['ptf-prior', 'priorEmergency']];
    selectField(root, 'Status of the drug on the plan', 'ptf-status', TF.STATUS);
    dateField(root, 'Date coverage under the plan took effect', 'ptf-effective');
    dateField(root, 'Date of the fill request', 'ptf-requested');
    numField(root, 'Days in the approved one-month supply', 'ptf-month', '');
    numField(root, 'Days already supplied under transition for this drug (0 if none)', 'ptf-already', '');
    selectField(root, 'Is this an immediate formulary change?', 'ptf-change', TF.CHANGE);
    numField(root, 'Days written on the prescription (optional)', 'ptf-written', '');
    dateField(root, 'Date the temporary fill adjudicated (optional)', 'ptf-adjudicated');
    // spec-v1638 tool 3: CMS manual chapter 6, 30.4.5 and 30.4.6.
    selectField(root, 'New to the plan, or a continuing member? (optional)', 'ptf-member', TF.MEMBER);
    selectField(root, 'Lives in a long-term care facility? (optional)', 'ptf-ltc', TF.YES_NO);
    selectField(root, 'Emergency supply of this drug already given this stay? (if a resident)', 'ptf-prior', TF.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TF.partdTransitionFill(args), o);
    }));
  },
  'pharmacy-effective-rate'(root) {
    const pairs = [['per-awp', 'awp'], ['per-paid', 'ingredientPaid'], ['per-guarantee', 'guaranteedDiscountPercent'], ['per-rx', 'prescriptions'], ['per-fees', 'dispensingFees'], ['per-conc', 'concessions'], ['per-acq', 'acquisitionCost']];
    note(root, 'Run brand and generic claims separately, with the sums for the claims your contract counts.');
    numField(root, 'Sum of AWP, dollars', 'per-awp', '');
    numField(root, 'Ingredient cost paid, dollars', 'per-paid', '');
    numField(root, 'Guaranteed discount off AWP, percent (optional)', 'per-guarantee', '');
    numField(root, 'Number of prescriptions (optional, with the three below)', 'per-rx', '');
    numField(root, 'Dispensing fees paid, dollars (0 if none)', 'per-fees', '');
    numField(root, 'Price concessions and later fees taken, dollars (0 if none)', 'per-conc', '');
    numField(root, 'Acquisition cost of the drugs dispensed, dollars', 'per-acq', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(ER.pharmacyEffectiveRate(args), o);
    }));
  },
  'mtm-eligibility-check'(root) {
    const pairs = [['mtm-year', 'planYear'], ['mtm-min-dis', 'planMinDiseases'], ['mtm-min-drugs', 'planMinDrugs'], ['mtm-dis', 'memberDiseases'], ['mtm-drugs', 'memberDrugs'], ['mtm-cost', 'annualCost'], ['mtm-risk', 'atRisk'], ['mtm-threshold', 'thresholdOverride']];
    numField(root, 'Plan year', 'mtm-year', '');
    numField(root, 'The minimum number of chronic diseases the plan requires', 'mtm-min-dis', '');
    numField(root, 'The minimum number of Part D drugs the plan requires', 'mtm-min-drugs', '');
    numField(root, 'The member\'s chronic diseases that the plan counts', 'mtm-dis', '');
    numField(root, 'The member\'s Part D drugs that the plan counts', 'mtm-drugs', '');
    numField(root, 'Projected annual covered Part D drug cost, dollars', 'mtm-cost', '');
    selectField(root, 'Is the member an at-risk beneficiary under a drug management program?', 'mtm-risk', MT.AT_RISK);
    numField(root, 'The MTM cost threshold, dollars (only for a year this tool has no figure for)', 'mtm-threshold', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MT.mtmEligibilityCheck(args), o);
    }));
  },
  'ccm-time-units'(root) {
    const pairs = [['ccm-kind', 'kind'], ['ccm-staff', 'staffMinutes'], ['ccm-own', 'practitionerMinutes']];
    selectField(root, 'Codes being reported', 'ccm-kind', CC.KINDS);
    numField(root, 'Clinical staff minutes this calendar month', 'ccm-staff', '');
    numField(root, 'Minutes spent personally by the billing practitioner', 'ccm-own', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CC.ccmTimeUnits(args), o);
    }));
  },
  'vaccine-interval-validity'(root) {
    const pairs = [['viv-dose', 'doseDate'], ['viv-live', 'live'], ['viv-grace', 'graceRule'], ['viv-prev', 'previousDose'], ['viv-interval', 'minInterval'], ['viv-interval-unit', 'minIntervalUnit'], ['viv-birth', 'birthDate'], ['viv-age', 'minAge'], ['viv-age-unit', 'minAgeUnit'], ['viv-other-live', 'otherLiveDate'], ['viv-together', 'previousWithOtherLive'], ['viv-special', 'specialGraceMonths']];
    note(root, 'The minimum age and minimum interval come from the current CDC schedule. None is supplied here.');
    dateField(root, 'Date of the dose being checked', 'viv-dose');
    selectField(root, 'Kind of vaccine', 'viv-live', VI.LIVE);
    selectField(root, 'Grace period rule', 'viv-grace', VI.GRACE);
    dateField(root, 'Date of the previous dose (for a minimum interval)', 'viv-prev');
    numField(root, 'Minimum interval from the previous dose', 'viv-interval', '');
    selectField(root, 'Unit of the minimum interval', 'viv-interval-unit', VI.UNITS);
    dateField(root, 'Date of birth (for a minimum age)', 'viv-birth');
    numField(root, 'Minimum age for this dose', 'viv-age', '');
    selectField(root, 'Unit of the minimum age', 'viv-age-unit', VI.UNITS);
    dateField(root, 'Live vaccine: date of the most recent other live injectable or intranasal vaccine (optional)', 'viv-other-live');
    selectField(root, 'Live vaccine with an interval: was the previous dose given the same day as a different live vaccine?', 'viv-together', VI.TOGETHER);
    numField(root, 'A special grace period the schedule gives this dose, in months (optional)', 'viv-special', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(VI.vaccineIntervalValidity(args), o);
    }));
  },
  'partd-dmp-criteria-check'(root) {
    const pairs = [['dmp-exempt', 'exemption'], ['dmp-mme', 'averageDailyMme'], ['dmp-prescribers', 'prescribers'], ['dmp-pharmacies', 'pharmacies'], ['dmp-opioid', 'opioidFill'], ['dmp-overdose', 'overdoseClaim']];
    selectField(root, 'Exemption', 'dmp-exempt', DM.EXEMPT);
    numField(root, 'Highest average daily MME in the most recent 6 months, buprenorphine left out (0 if no opioid)', 'dmp-mme', '');
    numField(root, 'Opioid prescribers in the most recent 6 months', 'dmp-prescribers', '');
    numField(root, 'Opioid dispensing pharmacies in the most recent 6 months', 'dmp-pharmacies', '');
    selectField(root, 'A Part D opioid fill, not for opioid use disorder, in the most recent 6 months?', 'dmp-opioid', DM.YES_NO);
    selectField(root, 'An opioid-related overdose claim in the most recent 12 months?', 'dmp-overdose', DM.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DM.partdDmpCriteriaCheck(args), o);
    }));
  },
  'partd-opioid-safety-edit'(root) {
    const pairs = [['ose-exempt', 'exemption'], ['ose-mme', 'cumulativeMme'], ['ose-days', 'daysSupply'], ['ose-recent', 'recentOpioidFill'], ['ose-hard', 'hardEdit200'], ['ose-benzo', 'benzodiazepine'], ['ose-la', 'duplicateLongActing'], ['ose-plan-rx', 'planPrescriberCount'], ['ose-plan-ph', 'planPharmacyCount'], ['ose-rx', 'prescribers'], ['ose-ph', 'pharmacies']];
    selectField(root, 'Exemption', 'ose-exempt', OE.EXEMPT);
    numField(root, 'Cumulative daily MME across the active opioid prescriptions', 'ose-mme', '');
    numField(root, 'Days supply of the new opioid prescription', 'ose-days', '');
    selectField(root, 'Has the member filled an opioid within the plan\'s lookback window?', 'ose-recent', OE.YES_NO);
    selectField(root, 'Does the plan use the optional hard edit at 200 MME?', 'ose-hard', OE.YES_NO);
    selectField(root, 'Is the member also on a benzodiazepine?', 'ose-benzo', OE.YES_NO);
    selectField(root, 'Is there more than one long-acting opioid?', 'ose-la', OE.YES_NO);
    numField(root, 'Prescriber count the plan attaches to its MME edits (optional)', 'ose-plan-rx', '');
    numField(root, 'Pharmacy count the plan attaches to its MME edits (optional)', 'ose-plan-ph', '');
    numField(root, 'Number of opioid prescribers the member has (with a plan count)', 'ose-rx', '');
    numField(root, 'Number of opioid pharmacies the member has (with a plan count)', 'ose-ph', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(OE.partdOpioidSafetyEdit(args), o);
    }));
  },
  'partd-dmp-notice-clock'(root) {
    const pairs = [['dnc-initial', 'initialNotice'], ['dnc-determination', 'determination'], ['dnc-found', 'found'], ['dnc-sent', 'secondNoticeSent'], ['dnc-attempts', 'outreachAttempts'], ['dnc-effective', 'limitationEffective'], ['dnc-extended', 'extended']];
    dateField(root, 'Date of the initial notice', 'dnc-initial');
    dateField(root, 'Date of the sponsor\'s determination (optional)', 'dnc-determination');
    selectField(root, 'With a determination: what it found', 'dnc-found', NC.FOUND);
    dateField(root, 'Date the second notice was sent (optional)', 'dnc-sent');
    areaField(root, 'Dates of attempts to reach prescribers, one per line (optional)', 'dnc-attempts', '2026-03-02');
    dateField(root, 'Effective date of the limitation (optional)', 'dnc-effective');
    selectField(root, 'With a limitation: was it extended?', 'dnc-extended', NC.EXTENDED);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(NC.partdDmpNoticeClock(args), o);
    }));
  },
  'ltc-mrr-tracker'(root) {
    const pairs = [['mrr-residents', 'residents'], ['mrr-asof', 'asOf'], ['mrr-days', 'responseDays']];
    // Rows carry resident names: kept out of the shareable link.
    areaField(root, 'Residents, one per line: resident, admitted, last review, report sent, physician response (dates as YYYY-MM-DD; the last three may be blank)', 'mrr-residents', 'A, 2026-06-01, 2026-08-20').querySelector('textarea').setAttribute('data-private', '');
    dateField(root, 'As-of date', 'mrr-asof');
    numField(root, 'The facility\'s own time frame for the physician\'s response, days (optional)', 'mrr-days', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MR.ltcMrrTracker(args), o);
    }));
  },
  'glucose-supply-quantity-check'(root) {
    const pairs = [['gsq-cgm', 'cgm'], ['gsq-insulin', 'insulin'], ['gsq-basic', 'basicCriteria'], ['gsq-strips', 'strips'], ['gsq-lancets', 'lancets'], ['gsq-tests', 'testsPerDay'], ['gsq-order', 'orderDate'], ['gsq-visit', 'visitDate'], ['gsq-adherence', 'adherenceVerified'], ['gsq-dispense', 'dispenseDate'], ['gsq-devices', 'lancingDevices'], ['gsq-dstrips', 'dispenseStrips'], ['gsq-dlancets', 'dispenseLancets']];
    selectField(root, 'Does the beneficiary have a non-adjunctive continuous glucose monitor?', 'gsq-cgm', GS.CGM);
    selectField(root, 'Insulin treatment', 'gsq-insulin', GS.INSULIN);
    selectField(root, 'The two basic coverage criteria (diabetes; trained on the device)', 'gsq-basic', GS.BASIC);
    numField(root, 'Test strips ordered for 3 months', 'gsq-strips', 'e.g. 450');
    numField(root, 'Lancets ordered for 3 months', 'gsq-lancets', 'e.g. 450');
    numField(root, 'Or tests per day (used when the two quantities are blank)', 'gsq-tests', 'e.g. 5');
    dateField(root, 'Date of the order for the higher quantity', 'gsq-order');
    dateField(root, 'Date of the treating practitioner\'s visit that evaluated the need', 'gsq-visit');
    dateField(root, 'Date adherence to the high-use regimen was last verified', 'gsq-adherence');
    dateField(root, 'Dispensing date', 'gsq-dispense');
    numField(root, 'Spring-powered lancing devices in the last 6 months (optional)', 'gsq-devices', 'e.g. 1');
    numField(root, 'Strips to dispense now (optional)', 'gsq-dstrips', '');
    numField(root, 'Lancets to dispense now (optional)', 'gsq-dlancets', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(GS.glucoseSupplyQuantityCheck(args), o);
    }));
  },
  'supd-measure'(root) {
    const pairs = [['supd-year', 'measurementYear'], ['supd-members', 'members'], ['supd-fills', 'fills']];
    numField(root, 'Measurement year', 'supd-year', 'e.g. 2025');
    // Rows carry member references: kept out of the shareable link.
    areaField(root, 'Members, one per line: member, age, continuously enrolled (yes or no), exclusion (optional)', 'supd-members', 'A, 60, yes').querySelector('textarea').setAttribute('data-private', '');
    note(root, `Exclusions: ${SU.EXCLUSIONS.join(', ')}.`);
    areaField(root, 'Fills, one per line: member, fill date (YYYY-MM-DD), class (diabetes or statin)', 'supd-fills', 'A, 2025-01-10, diabetes').querySelector('textarea').setAttribute('data-private', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SU.supdMeasure(args), o);
    }));
  },
  'partd-concurrent-use-measures'(root) {
    const pairs = [['cum-year', 'measurementYear'], ['cum-members', 'members'], ['cum-fills', 'fills']];
    numField(root, 'Measurement year', 'cum-year', 'e.g. 2025');
    // Rows carry member references: kept out of the shareable link.
    areaField(root, 'Members, one per line: member, age, continuously enrolled (yes or no), exclusions separated by semicolons (optional)', 'cum-members', 'A, 70, yes').querySelector('textarea').setAttribute('data-private', '');
    note(root, `Exclusions: ${CU.EXCLUSIONS.join(', ')}. Classes: ${CU.CLASSES.join(', ')}.`);
    areaField(root, 'Fills, one per line: member, fill date (YYYY-MM-DD), days supply, medication, class', 'cum-fills', 'A, 2025-01-01, 30, oxycodone, opioid').querySelector('textarea').setAttribute('data-private', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CU.partdConcurrentUseMeasures(args), o);
    }));
  },
  'partd-opioid-measures'(root) {
    const pairs = [['pom-year', 'measurementYear'], ['pom-members', 'members'], ['pom-fills', 'fills']];
    numField(root, 'Measurement year', 'pom-year', 'e.g. 2024');
    // Rows carry member references: kept out of the shareable link.
    areaField(root, 'Members, one per line: member, age, months enrolled, enrolled through (YYYY-MM-DD), exclusion (optional)', 'pom-members', 'A, 50, 12, 2024-12-31').querySelector('textarea').setAttribute('data-private', '');
    note(root, `Exclusions: ${OM.EXCLUSIONS.join(', ')}. Fills from the 90 days before the year may be listed; they are used only as the lookback.`);
    areaField(root, 'Opioid fills, one per line: member, fill date (YYYY-MM-DD), days supply, MME per day, prescriber, pharmacy', 'pom-fills', 'A, 2024-01-01, 30, 120, p1, x1').querySelector('textarea').setAttribute('data-private', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(OM.partdOpioidMeasures(args), o);
    }));
  },
  'mtm-service-clock'(root) {
    const pairs = [['msc-year', 'contractYear'], ['msc-asof', 'asOf'], ['msc-enrollees', 'enrollees']];
    numField(root, 'Contract year', 'msc-year', 'e.g. 2026');
    dateField(root, 'As-of date', 'msc-asof');
    note(root, 'Each line: enrollee, MTM enrollment date, enrolled last year (yes or no), last CMR offer date, CMR dates, TMR dates, opt-out date, age at the start of the year, hospice (yes or no), met CMS criteria (yes or no). Dates are YYYY-MM-DD; several dates in one place are separated by semicolons; a date that does not apply is left blank.');
    // Rows carry enrollee references: kept out of the shareable link.
    areaField(root, 'Enrollees, one per line', 'msc-enrollees', 'A, 2026-03-01, no, , , 2026-03-10, , 70, no, yes').querySelector('textarea').setAttribute('data-private', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MC.mtmServiceClock(args), o);
    }));
  },
};
