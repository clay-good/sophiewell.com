// spec-v1637: federal pharmacy law as arithmetic: controlled substances, supply chain, product
// identifiers and packaging limits.
// dea-registration-renewal, cs-biennial-inventory, dea-222-validity, cs-theft-loss-clock,
// cs-five-percent-rule, c5-otc-sale-limit, otp-take-home-limit, mat-injection-admin-deadline,
// cs-disposal-clock, cmea-sales-limit, cs-record-retention, cs-rx-transfer-check, c2-rx-form-check,
// otp-admission-clock, oud-telemedicine-rx-window, dscsa-dispenser-clocks, dscsa-suspect-sample-size,
// dscsa-small-dispenser-check, unit-dose-repack-expiry, hw-generator-category.

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
import * as RR from '../lib/cs-record-retention-v1637.js';
import * as TR from '../lib/cs-rx-transfer-check-v1637.js';
import * as C2 from '../lib/c2-rx-form-check-v1637.js';
import * as OA from '../lib/otp-admission-clock-v1637.js';
import * as TW from '../lib/oud-telemedicine-rx-window-v1637.js';
import * as DC from '../lib/dscsa-dispenser-clocks-v1637.js';
import * as SS from '../lib/dscsa-suspect-sample-size-v1637.js';
import * as SD from '../lib/dscsa-small-dispenser-check-v1637.js';
import * as UD from '../lib/unit-dose-repack-expiry-v1637.js';
import * as HW from '../lib/hw-generator-category-v1637.js';

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
  'cs-record-retention'(root) {
    const pairs = [['crr-record', 'record'], ['crr-from', 'countedFrom'], ['crr-longer', 'longerYears']];
    selectField(root, 'Kind of record', 'crr-record', RR.RECORDS);
    dateField(root, 'Date the period is counted from', 'crr-from');
    numField(root, 'A longer period you must meet, in years (optional)', 'crr-longer', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(RR.csRecordRetention(args), o);
    }));
  },
  'cs-rx-transfer-check'(root) {
    const pairs = [['crt-schedule', 'schedule'], ['crt-filled', 'filled'], ['crt-form', 'form'], ['crt-before', 'transferredBefore'], ['crt-database', 'sharedDatabase'], ['crt-state', 'stateLaw']];
    selectField(root, 'Schedule', 'crt-schedule', TR.SCHEDULES);
    selectField(root, 'Has it been filled?', 'crt-filled', TR.FILLED);
    selectField(root, 'Form of the prescription', 'crt-form', TR.FORMS);
    selectField(root, 'Transferred before?', 'crt-before', TR.BEFORE);
    selectField(root, 'For refills: do the two pharmacies share a real-time, online database?', 'crt-database', TR.DATABASE);
    selectField(root, 'Does state law allow the transfer?', 'crt-state', TR.STATE);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TR.csRxTransferCheck(args), o);
    }));
  },
  'c2-rx-form-check'(root) {
    const pairs = [['c2f-arrived', 'arrived'], ['c2f-fax', 'faxCase'], ['c2f-hospice', 'hospiceNoted'], ['c2f-emergency', 'emergency'], ['c2f-pharmacy', 'pharmacy'], ['c2f-date', 'authorizedOn']];
    selectField(root, 'How the prescription arrived', 'c2f-arrived', C2.ARRIVED);
    selectField(root, 'For a fax, does one of these apply?', 'c2f-fax', C2.FAX_CASES);
    selectField(root, 'For a hospice patient, is the status noted on the prescription?', 'c2f-hospice', C2.HOSPICE_NOTED);
    selectField(root, 'For an oral order, is this an emergency situation?', 'c2f-emergency', C2.EMERGENCY);
    selectField(root, 'For an oral order, the kind of pharmacy', 'c2f-pharmacy', C2.PHARMACY);
    dateField(root, 'For an oral order, the date of the authorization (optional)', 'c2f-date');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(C2.c2RxFormCheck(args), o);
    }));
  },
  'otp-admission-clock'(root) {
    const pairs = [['oac-admitted', 'admitted'], ['oac-screened', 'screened'], ['oac-by', 'screenedBy'], ['oac-labs', 'labsDrawn'], ['oac-exam', 'fullExam'], ['oac-assessment', 'assessment'], ['oac-interim', 'interimStart']];
    dateField(root, 'Admission date', 'oac-admitted');
    dateField(root, 'Date of the screening examination (optional)', 'oac-screened');
    selectField(root, 'Who did the screening examination', 'oac-by', OA.SCREENERS);
    dateField(root, 'Date the labs were drawn (optional)', 'oac-labs');
    dateField(root, 'Date of the full in-person examination (optional)', 'oac-exam');
    dateField(root, 'Date of the psychosocial assessment and care plan (optional)', 'oac-assessment');
    dateField(root, 'Interim treatment start date (optional)', 'oac-interim');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(OA.otpAdmissionClock(args), o);
    }));
  },
  'oud-telemedicine-rx-window'(root) {
    const pairs = [['otw-date', 'prescribedOn'], ['otw-seen', 'inPerson'], ['otw-schedule', 'schedule'], ['otw-purpose', 'purpose'], ['otw-va', 'va'], ['otw-pdmp', 'pdmp'], ['otw-first', 'firstTelemedicineRx']];
    dateField(root, 'Date of the prescription', 'otw-date');
    selectField(root, 'In-person evaluation by the prescriber', 'otw-seen', TW.IN_PERSON);
    selectField(root, 'Schedule', 'otw-schedule', TW.SCHEDULES);
    selectField(root, 'Purpose', 'otw-purpose', TW.PURPOSES);
    selectField(root, 'Department of Veterans Affairs', 'otw-va', TW.VA);
    selectField(root, 'State drug-monitoring database', 'otw-pdmp', TW.PDMP);
    dateField(root, 'Date of the first telemedicine prescription to this patient (optional)', 'otw-first');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TW.oudTelemedicineRxWindow(args), o);
    }));
  },
  'dscsa-dispenser-clocks'(root) {
    const pairs = [['ddc-event', 'event'], ['ddc-when', 'when']];
    selectField(root, 'What happened', 'ddc-event', DC.EVENTS);
    dateField(root, 'Date and time it happened', 'ddc-when', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DC.dscsaDispenserClocks(args), o);
    }));
  },
  'dscsa-suspect-sample-size'(root) {
    const pairs = [['dss-packages', 'packages'], ['dss-dispenser', 'dispenser']];
    numField(root, 'Packages of the suspect product in your possession', 'dss-packages', '');
    selectField(root, 'Small business dispenser?', 'dss-dispenser', SS.SMALL);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SS.dscsaSuspectSampleSize(args, new Date()), o);
    }));
  },
  'dscsa-small-dispenser-check'(root) {
    const pairs = [['dsd-staff', 'fullTimeStaff']];
    numField(root, 'Full-time pharmacists and pharmacy technicians at the company that owns the dispenser, as of November 27, 2026', 'dsd-staff', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SD.dscsaSmallDispenserCheck(args, new Date()), o);
    }));
  },
  'unit-dose-repack-expiry'(root) {
    const pairs = [['udr-repackaged', 'repackaged'], ['udr-expiry', 'manufacturerExpiry'], ...UD.CONDITIONS.map((c) => [c.dom, c.arg])];
    dateField(root, 'Date of repackaging', 'udr-repackaged');
    dateField(root, 'Expiration date on the manufacturer\'s container (the last day of the month if only a month is printed)', 'udr-expiry');
    for (const c of UD.CONDITIONS) selectField(root, c.ask, c.dom, UD.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(UD.unitDoseRepackExpiry(args), o);
    }));
  },
  'hw-generator-category'(root) {
    const pairs = [['hwg-acute', 'acuteKg'], ['hwg-nonacute', 'nonAcuteKg'], ['hwg-residue', 'residueKg'], ['hwg-subpart', 'subpartP']];
    numField(root, 'Acute hazardous waste this calendar month, kg (0 if none)', 'hwg-acute', '');
    numField(root, 'Non-acute hazardous waste this calendar month, kg (0 if none)', 'hwg-nonacute', '');
    numField(root, 'Residues from a cleanup of acute hazardous waste, kg (0 if none)', 'hwg-residue', '');
    selectField(root, 'Are hazardous waste pharmaceuticals managed under 40 CFR part 266 subpart P?', 'hwg-subpart', HW.SUBPART_P);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(HW.hwGeneratorCategory(args), o);
    }));
  },
};
