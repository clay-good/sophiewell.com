// spec-v1635: oncology pharmacy, investigational drug service and nuclear pharmacy.
// ind-safety-report-clock, emergency-ind-clock, ind-annual-report-due, trial-record-retention,
// occupational-dose-limit-check, sealed-source-leak-test, nrc-medical-event-screen,
// rad-package-label-category, rad-package-receipt-check, ids-accountability-reconcile.

import { el, clear } from '../lib/dom.js';
import * as IS from '../lib/ind-safety-report-clock-v1635.js';
import * as EI from '../lib/emergency-ind-clock-v1635.js';
import * as IA from '../lib/ind-annual-report-due-v1635.js';
import * as TR from '../lib/trial-record-retention-v1635.js';
import * as OD from '../lib/occupational-dose-limit-check-v1635.js';
import * as SL from '../lib/sealed-source-leak-test-v1635.js';
import * as ME from '../lib/nrc-medical-event-screen-v1635.js';
import * as RP from '../lib/rad-package-label-category-v1635.js';
import * as RR from '../lib/rad-package-receipt-check-v1635.js';
import * as IR from '../lib/ids-accountability-reconcile-v1635.js';
import { resultRow } from '../lib/result-copy.js';

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
  'ind-safety-report-clock'(root) {
    const pairs = [['isr-role', 'role'], ['isr-fatal', 'fatalOrLifeThreatening'], ['isr-determined', 'determined'], ['isr-received', 'received'], ['isr-request', 'fdaRequest']];
    selectField(root, 'Who is reporting', 'isr-role', IS.ROLES);
    selectField(root, 'Sponsor: an unexpected fatal or life-threatening suspected adverse reaction?', 'isr-fatal', IS.YES_NO);
    dateField(root, 'Sponsor: date it determined the information qualifies for reporting', 'isr-determined');
    dateField(root, 'Sponsor: date it first received the information (for the 7-day deadline)', 'isr-received');
    dateField(root, 'Date of an FDA request for more data (optional)', 'isr-request');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IS.indSafetyReportClock(args, new Date()), o);
    }));
  },
  'emergency-ind-clock'(root) {
    const pairs = [['eic-authorized', 'authorized'], ['eic-used', 'used']];
    dateField(root, 'Date FDA authorized the emergency use', 'eic-authorized');
    dateField(root, 'Date of the emergency use at the institution', 'eic-used');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(EI.emergencyIndClock(args), o);
    }));
  },
  'ind-annual-report-due'(root) {
    const pairs = [['iar-received', 'received'], ['iar-may-begin', 'mayBegin'], ['iar-investigator', 'investigatorAdded']];
    dateField(root, 'Date FDA received the IND', 'iar-received');
    dateField(root, 'Earlier date FDA said the study may begin (optional)', 'iar-may-begin');
    dateField(root, 'Date a new investigator was added (optional)', 'iar-investigator');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IA.indAnnualReportDue(args, new Date()), o);
    }));
  },
  'trial-record-retention'(root) {
    const pairs = [['trr-role', 'role'], ['trr-event', 'event'], ['trr-date', 'date'], ['trr-longer', 'longerUntil']];
    selectField(root, 'Role', 'trr-role', TR.ROLES);
    selectField(root, 'What started the clock', 'trr-event', TR.EVENTS);
    dateField(root, 'Date of that event (the later of discontinuation and FDA being notified)', 'trr-date');
    dateField(root, 'A longer retention date from the protocol, contract or state law (optional)', 'trr-longer');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TR.trialRecordRetention(args), o);
    }));
  },
  'occupational-dose-limit-check'(root) {
    const pairs = [['odl-unit', 'unit'], ...OD.LIMITS.map((l) => [`odl-${l.dom}`, l.arg]), ['odl-months', 'monthsElapsed']];
    selectField(root, 'Unit of the doses', 'odl-unit', OD.UNITS);
    root.appendChild(el('p', { text: 'Enter the year-to-date dose for each quantity monitored; leave the rest blank.' }));
    for (const l of OD.LIMITS) numField(root, l.text, `odl-${l.dom}`, '');
    numField(root, 'Months of the monitoring year elapsed (optional, for the projection)', 'odl-months', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(OD.occupationalDoseLimitCheck(args), o);
    }));
  },
  'sealed-source-leak-test'(root) {
    const pairs = [['slt-exemption', 'exemption'], ['slt-cpm', 'netCpm'], ['slt-eff', 'efficiencyPercent'], ['slt-date', 'testDate']];
    selectField(root, 'Does an exemption in 10 CFR 35.67(f) apply to the source?', 'slt-exemption', SL.EXEMPTIONS);
    numField(root, 'Net counts per minute on the wipe', 'slt-cpm', '');
    numField(root, 'Counter efficiency, %', 'slt-eff', '');
    dateField(root, 'Date of the leak test (optional)', 'slt-date');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SL.sealedSourceLeakTest(args), o);
    }));
  },
  'nrc-medical-event-screen'(root) {
    const pairs = [['mes-intervention', 'patientIntervention'], ['mes-damage', 'permanentDamage'], ['mes-wrong', 'wrongAdministration'], ['mes-kind', 'doseKind'], ['mes-dose', 'doseRem'], ['mes-prescribed', 'prescribed'], ['mes-delivered', 'delivered'], ['mes-range', 'outsideRange'], ['mes-fraction-prescribed', 'prescribedFraction'], ['mes-fraction-delivered', 'deliveredFraction'], ['mes-site-dose', 'otherSiteDoseRem'], ['mes-site-expected', 'otherSiteExpectedRem'], ['mes-discovered', 'discovered']];
    selectField(root, 'Did the event result from intervention by the patient or research subject?', 'mes-intervention', ME.YES_NO);
    selectField(root, 'With patient intervention: unintended permanent functional damage, as determined by a physician?', 'mes-damage', ME.YES_NO);
    selectField(root, 'Wrong drug, route, individual or mode, or a leaking sealed source?', 'mes-wrong', ME.WRONG);
    selectField(root, 'Kind of dose estimated', 'mes-kind', ME.DOSE_KINDS);
    numField(root, 'Dose difference from prescribed, or the dose from a wrong administration, rem', 'mes-dose', '');
    numField(root, 'Prescribed total dose or dosage (any unit)', 'mes-prescribed', '');
    numField(root, 'Delivered total dose or dosage (same unit)', 'mes-delivered', '');
    selectField(root, 'Dosage outside the prescribed range? (optional)', 'mes-range', ME.YES_NO);
    numField(root, 'Prescribed dose for one fraction (optional)', 'mes-fraction-prescribed', '');
    numField(root, 'Delivered dose for that fraction', 'mes-fraction-delivered', '');
    numField(root, 'Dose to skin, organ or tissue other than the treatment site, rem (optional)', 'mes-site-dose', '');
    numField(root, 'Dose expected at that site under the written directive, rem', 'mes-site-expected', '');
    dateField(root, 'Date of discovery (optional)', 'mes-discovered');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(ME.nrcMedicalEventScreen(args), o);
    }));
  },
  'rad-package-label-category'(root) {
    const pairs = [['rpl-unit', 'unit'], ['rpl-surface', 'surface'], ['rpl-one-meter', 'oneMeter'], ['rpl-hrcq', 'highwayRouteControlled']];
    selectField(root, 'Unit of the dose rates', 'rpl-unit', RP.UNITS);
    numField(root, 'Maximum dose rate at the package surface', 'rpl-surface', '');
    numField(root, 'Maximum dose rate at 1 meter from the surface', 'rpl-one-meter', '');
    selectField(root, 'Does the package hold a highway route controlled quantity?', 'rpl-hrcq', RP.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(RP.radPackageLabelCategory(args), o);
    }));
  },
  'rad-package-receipt-check'(root) {
    const pairs = [['rpr-received', 'received'], ['rpr-working', 'duringWorkingHours'], ['rpr-next-day', 'nextWorkingDayStart'], ['rpr-labeled', 'labeled'], ['rpr-damaged', 'damaged'], ['rpr-gas', 'gasOrSpecialForm'], ['rpr-type-a', 'aboveTypeA'], ['rpr-emitter', 'emitter'], ['rpr-cpm', 'netCpm'], ['rpr-eff', 'efficiencyPercent'], ['rpr-area', 'areaCm2'], ['rpr-wipe-eff', 'wipeEfficiencyPercent'], ['rpr-surface', 'surfaceMremH'], ['rpr-one-meter', 'oneMeterMremH']];
    root.appendChild(el('p', { text: 'Four parts, each optional and checked on its own: the monitoring deadline, which monitoring the rule requires, the wipe, and the dose rates.' }));
    dateField(root, 'Date and time received', 'rpr-received', 'datetime-local');
    selectField(root, 'Received during normal working hours?', 'rpr-working', RR.YES_NO);
    dateField(root, 'If after hours: when the next working day begins', 'rpr-next-day', 'datetime-local');
    selectField(root, 'Bears a Radioactive White I, Yellow II or Yellow III label?', 'rpr-labeled', RR.YES_NO);
    selectField(root, 'Evidence of degradation (crushed, wet or damaged)?', 'rpr-damaged', RR.YES_NO);
    selectField(root, 'Holds only a gas or special form material?', 'rpr-gas', RR.YES_NO);
    selectField(root, 'Contents exceed a Type A quantity?', 'rpr-type-a', RR.YES_NO);
    selectField(root, 'Wipe: emitter type', 'rpr-emitter', RR.EMITTERS);
    numField(root, 'Wipe: net counts per minute', 'rpr-cpm', '');
    numField(root, 'Wipe: counter efficiency, %', 'rpr-eff', '');
    numField(root, 'Wipe: area wiped, cm² (the rule\'s method wipes 300)', 'rpr-area', '');
    numField(root, 'Wipe efficiency, % (optional; 10% is assumed if blank, as the rule allows)', 'rpr-wipe-eff', '');
    numField(root, 'Dose rate at the package surface, mrem/h', 'rpr-surface', '');
    numField(root, 'Dose rate at 1 meter, mrem/h', 'rpr-one-meter', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(RR.radPackageReceiptCheck(args), o);
    }));
  },
  'ids-accountability-reconcile'(root) {
    const pairs = [['iac-visits', 'visits'], ['iac-low', 'rangeLow'], ['iac-high', 'rangeHigh'], ['iac-received', 'received'], ['iac-dispensed', 'dispensedTotal'], ['iac-restocked', 'returnedToStock'], ['iac-destroyed', 'destroyed'], ['iac-sponsor', 'returnedToSponsor'], ['iac-on-hand', 'onHand']];
    areaField(root, 'Visits, one per line: subject and visit code, units dispensed, units returned, dispense date, return date, units per day, hold days (optional). Use study codes, not names.', 'iac-visits', 'S01-V2, 60, 6, 2026-09-01, 2026-09-29, 2');
    numField(root, 'Protocol compliance range, lower end, % (optional)', 'iac-low', '');
    numField(root, 'Protocol compliance range, upper end, % (optional)', 'iac-high', '');
    root.appendChild(el('p', { text: 'Site balance (optional; enter all six, and zero is an answer):' }));
    numField(root, 'Units received', 'iac-received', '');
    numField(root, 'Units dispensed', 'iac-dispensed', '');
    numField(root, 'Units returned to stock', 'iac-restocked', '');
    numField(root, 'Units destroyed', 'iac-destroyed', '');
    numField(root, 'Units returned to the sponsor', 'iac-sponsor', '');
    numField(root, 'Count on hand', 'iac-on-hand', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IR.idsAccountabilityReconcile(args), o);
    }));
  },
};
