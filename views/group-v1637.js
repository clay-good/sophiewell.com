// spec-v1637: federal pharmacy law as arithmetic: controlled substances, supply chain, product
// identifiers and packaging limits.
// dea-registration-renewal, cs-biennial-inventory, dea-222-validity, cs-theft-loss-clock,
// cs-five-percent-rule, c5-otc-sale-limit, otp-take-home-limit, mat-injection-admin-deadline,
// cs-disposal-clock, cmea-sales-limit.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as DR from '../lib/dea-registration-renewal-v1637.js';
import * as BI from '../lib/cs-biennial-inventory-v1637.js';
import * as F2 from '../lib/dea-222-validity-v1637.js';
import * as TL from '../lib/cs-theft-loss-clock-v1637.js';
import * as FP from '../lib/cs-five-percent-rule-v1637.js';
import * as OS from '../lib/c5-otc-sale-limit-v1637.js';
import * as TH from '../lib/otp-take-home-limit-v1637.js';
import * as MI from '../lib/mat-injection-admin-deadline-v1637.js';
import * as DS from '../lib/cs-disposal-clock-v1637.js';
import * as CM from '../lib/cmea-sales-limit-v1637.js';

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
  'dea-registration-renewal'(root) {
    const pairs = [['drr-kind', 'kind'], ['drr-expires', 'expires'], ['drr-submitted', 'submitted'], ['drr-registered', 'registered']];
    selectField(root, 'Kind of registrant', 'drr-kind', DR.KINDS);
    dateField(root, 'Expiration date on the certificate', 'drr-expires');
    dateField(root, 'Date the renewal application was submitted (optional)', 'drr-submitted');
    dateField(root, 'Date of first registration (optional, to check the first period)', 'drr-registered');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DR.deaRegistrationRenewal(args, new Date()), o);
    }));
  },
  'cs-biennial-inventory'(root) {
    const pairs = [['cbi-last', 'lastInventory'], ['cbi-state', 'stateIntervalMonths'], ['cbi-schedule', 'schedule'], ['cbi-container', 'container'], ['cbi-count', 'labeledCount'], ['cbi-effective', 'newlyScheduledEffective']];
    dateField(root, 'Date of the last inventory', 'cbi-last');
    numField(root, 'State inventory interval in months, if shorter than two years (optional)', 'cbi-state', '');
    selectField(root, 'Schedule of the drug in a container (optional)', 'cbi-schedule', BI.SCHEDULES);
    selectField(root, 'Container (optional)', 'cbi-container', BI.CONTAINERS);
    numField(root, 'Tablets or capsules the container holds (optional)', 'cbi-count', '');
    dateField(root, 'Effective date of a rule newly scheduling the drug (optional)', 'cbi-effective');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(BI.csBiennialInventory(args, new Date()), o);
    }));
  },
  'dea-222-validity'(root) {
    const pairs = [['d22-kind', 'kind'], ['d22-purchaser', 'purchaser'], ['d22-executed', 'executed'], ['d22-shipments', 'shipments']];
    selectField(root, 'Paper form or electronic order', 'd22-kind', F2.KINDS);
    selectField(root, 'Purchaser', 'd22-purchaser', F2.PURCHASERS);
    dateField(root, 'Date the purchaser executed the order', 'd22-executed');
    areaField(root, 'Shipment dates so far, one per line (optional)', 'd22-shipments', '2026-09-10');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(F2.dea222Validity(args, new Date()), o);
    }));
  },
  'cs-theft-loss-clock'(root) {
    const pairs = [['ctl-registrant', 'registrant'], ['ctl-discovered', 'discovered'], ['ctl-closed', 'closedDays']];
    selectField(root, 'Registrant', 'ctl-registrant', TL.REGISTRANTS);
    dateField(root, 'Date the theft or loss was discovered', 'ctl-discovered');
    areaField(root, 'Other days the business is closed, one per line (optional)', 'ctl-closed', '2026-11-27');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TL.csTheftLossClock(args, new Date()), o);
    }));
  },
  'cs-five-percent-rule'(root) {
    const pairs = [['cfr-dispensed', 'dispensed'], ['cfr-distributed', 'distributed'], ['cfr-ads', 'ltcAds'], ['cfr-planned', 'planned']];
    numField(root, 'Dosage units dispensed this calendar year', 'cfr-dispensed', '');
    numField(root, 'Dosage units distributed to other registrants this calendar year', 'cfr-distributed', '');
    numField(root, 'Of those, units sent to the pharmacy\'s own long-term care automated dispensing systems (optional)', 'cfr-ads', '');
    numField(root, 'A planned transfer, in dosage units (optional)', 'cfr-planned', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(FP.csFivePercentRule(args), o);
    }));
  },
  'c5-otc-sale-limit'(root) {
    const pairs = [['c5s-state', 'stateRule'], ['c5s-contents', 'contents'], ['c5s-form', 'form'], ['c5s-requested', 'requested'], ['c5s-age', 'age'], ['c5s-time', 'saleTime'], ['c5s-earlier', 'earlierSales']];
    selectField(root, 'Does state or local law require a prescription for this product?', 'c5s-state', OS.STATE_RULE);
    selectField(root, 'Contents', 'c5s-contents', OS.CONTENTS);
    selectField(root, 'Form', 'c5s-form', OS.FORMS);
    numField(root, 'Quantity requested (mL or dosage units)', 'c5s-requested', '');
    numField(root, 'Purchaser age, years', 'c5s-age', '');
    dateField(root, 'Date and time of this sale', 'c5s-time', 'datetime-local');
    areaField(root, 'Earlier sales to this purchaser, one per line: date and time, then the quantity (optional)', 'c5s-earlier', '2026-10-11 09:30, 60');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(OS.c5OtcSaleLimit(args), o);
    }));
  },
  'otp-take-home-limit'(root) {
    const pairs = [['oth-med', 'medication'], ['oth-admitted', 'admitted'], ['oth-on', 'dispensedOn'], ['oth-day', 'treatmentDay'], ['oth-proposed', 'proposedDays'], ['oth-state', 'stateCeilingDays'], ['oth-dose', 'firstDayDose']];
    selectField(root, 'Medication', 'oth-med', TH.MEDICATIONS);
    dateField(root, 'Admission date', 'oth-admitted');
    dateField(root, 'Date the supply would be dispensed', 'oth-on');
    numField(root, 'Or the treatment day, in place of the two dates', 'oth-day', '');
    numField(root, 'Proposed take-home supply, days (optional)', 'oth-proposed', '');
    numField(root, 'State ceiling in days, if lower (optional)', 'oth-state', '');
    numField(root, 'Total methadone dose on the first day, mg (optional)', 'oth-dose', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TH.otpTakeHomeLimit(args), o);
    }));
  },
  'mat-injection-admin-deadline'(root) {
    const pairs = [['mia-received', 'received']];
    dateField(root, 'Date the practitioner received the drug from the pharmacy', 'mia-received');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MI.matInjectionAdminDeadline(args, new Date()), o);
    }));
  },
  'cs-disposal-clock'(root) {
    const pairs = [['cdc-who', 'who'], ['cdc-trigger', 'trigger']];
    selectField(root, 'Who is disposing, and what started the clock', 'cdc-who', DS.WHO);
    dateField(root, 'The date it happened', 'cdc-trigger');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DS.csDisposalClock(args, new Date()), o);
    }));
  },
  'cmea-sales-limit'(root) {
    const pairs = [['cms-ingredient', 'ingredient'], ['cms-salt', 'salt'], ['cms-form', 'form'], ['cms-strength', 'strengthMg'], ['cms-per', 'perMl'], ['cms-units', 'unitsPerPackage'], ['cms-packages', 'packages'], ['cms-seller', 'seller'], ['cms-today', 'soldToday'], ['cms-thirty', 'soldThirtyDays'], ['cms-state', 'stateThirtyDayLimit']];
    selectField(root, 'Ingredient', 'cms-ingredient', CM.INGREDIENTS);
    selectField(root, 'Salt on the label', 'cms-salt', CM.SALTS);
    selectField(root, 'Form', 'cms-form', CM.FORMS);
    numField(root, 'Labeled strength, mg (per tablet or capsule, or per the mL below)', 'cms-strength', '');
    numField(root, 'Liquid only: the mL the strength is stated in', 'cms-per', '');
    numField(root, 'Tablets, capsules or mL in each package', 'cms-units', '');
    numField(root, 'Number of packages', 'cms-packages', '');
    selectField(root, 'Seller', 'cms-seller', CM.SELLERS);
    numField(root, 'Base grams already sold to this purchaser today (0 if none)', 'cms-today', '');
    numField(root, 'Base grams sold to this purchaser in the past 30 days, today included (mobile vendor, mail order, or a state limit)', 'cms-thirty', '');
    numField(root, 'State 30-day limit in grams, if any (optional)', 'cms-state', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CM.cmeaSalesLimit(args), o);
    }));
  },
};
