// spec-v1635: oncology pharmacy, investigational drug service and nuclear pharmacy.
// ind-safety-report-clock, emergency-ind-clock, ind-annual-report-due, trial-record-retention,
// occupational-dose-limit-check, sealed-source-leak-test, nrc-medical-event-screen,
// rad-package-label-category, rad-package-receipt-check, ids-accountability-reconcile,
// radioactive-decay, radiopharm-dispense-volume, patient-release-rg839,
// nuc-med-breastfeeding-interruption, generator-breakthrough-check, radiation-distance-shielding,
// rasburicase-dose, dexrazoxane-ratio-dose, capecitabine-tablet-dose,
// mesna-ifosfamide-schedule, glucarpidase-dose, it-methotrexate-age-dose, hdmtx-leucovorin-rescue,
// gcsf-timing-check, cumulative-dose-limit, esa-chemo-dose-adjust.

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
import * as RK from '../lib/radioactive-decay-v1635.js';
import * as DV from '../lib/radiopharm-dispense-volume-v1635.js';
import * as PR from '../lib/patient-release-rg839-v1635.js';
import * as BF from '../lib/nuc-med-breastfeeding-interruption-v1635.js';
import * as GB from '../lib/generator-breakthrough-check-v1635.js';
import * as RS from '../lib/radiation-distance-shielding-v1635.js';
import * as RB from '../lib/rasburicase-dose-v1635.js';
import * as DX from '../lib/dexrazoxane-ratio-dose-v1635.js';
import * as CP from '../lib/capecitabine-tablet-dose-v1635.js';
import * as MS from '../lib/mesna-ifosfamide-schedule-v1635.js';
import * as GD from '../lib/glucarpidase-dose-v1635.js';
import * as IT from '../lib/it-methotrexate-age-dose-v1635.js';
import * as HL from '../lib/hdmtx-leucovorin-rescue-v1635.js';
import * as GT from '../lib/gcsf-timing-check-v1635.js';
import * as CD from '../lib/cumulative-dose-limit-v1635.js';
import * as EA from '../lib/esa-chemo-dose-adjust-v1635.js';
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
  'radioactive-decay'(root) {
    const pairs = [['rdk-nuclide', 'nuclide'], ['rdk-half-life', 'halfLife'], ['rdk-half-life-unit', 'halfLifeUnit'], ['rdk-activity', 'activity'], ['rdk-unit', 'unit'], ['rdk-calibration', 'calibration'], ['rdk-target', 'target'], ['rdk-target-activity', 'targetActivity']];
    selectField(root, 'Radionuclide (half-life from its FDA label)', 'rdk-nuclide', RK.NUCLIDES);
    numField(root, 'Half-life, for another radionuclide', 'rdk-half-life', '');
    selectField(root, 'Half-life unit', 'rdk-half-life-unit', RK.HALF_LIFE_UNITS);
    numField(root, 'Activity at calibration', 'rdk-activity', '');
    selectField(root, 'Activity unit', 'rdk-unit', RK.ACTIVITY_UNITS);
    dateField(root, 'Calibration date and time', 'rdk-calibration', 'datetime-local');
    dateField(root, 'Target date and time (earlier than calibration works too)', 'rdk-target', 'datetime-local');
    numField(root, 'Or a target activity, to get the time it is reached', 'rdk-target-activity', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = RK.radioactiveDecay(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'radiopharm-dispense-volume'(root) {
    const pairs = [['rdv-nuclide', 'nuclide'], ['rdv-half-life', 'halfLife'], ['rdv-half-life-unit', 'halfLifeUnit'], ['rdv-unit', 'unit'], ['rdv-vial-activity', 'vialActivity'], ['rdv-vial-volume', 'vialVolume'], ['rdv-calibration', 'calibration'], ['rdv-prescribed', 'prescribed'], ['rdv-draw', 'draw'], ['rdv-administration', 'administration'], ['rdv-measured', 'measured'], ['rdv-range-low', 'rangeLow'], ['rdv-range-high', 'rangeHigh']];
    selectField(root, 'Radionuclide (half-life from its FDA label)', 'rdv-nuclide', RK.NUCLIDES);
    numField(root, 'Half-life, for another radionuclide', 'rdv-half-life', '');
    selectField(root, 'Half-life unit', 'rdv-half-life-unit', RK.HALF_LIFE_UNITS);
    selectField(root, 'Activity unit (vial and prescription)', 'rdv-unit', RK.ACTIVITY_UNITS);
    numField(root, 'Vial activity at calibration', 'rdv-vial-activity', '');
    numField(root, 'Vial volume, mL', 'rdv-vial-volume', '');
    dateField(root, 'Vial calibration date and time', 'rdv-calibration', 'datetime-local');
    numField(root, 'Prescribed activity at administration', 'rdv-prescribed', '');
    dateField(root, 'Draw date and time', 'rdv-draw', 'datetime-local');
    dateField(root, 'Administration date and time (blank if given when drawn)', 'rdv-administration', 'datetime-local');
    numField(root, 'Measured activity at draw time (optional)', 'rdv-measured', '');
    numField(root, 'Prescribed range, lower end (optional)', 'rdv-range-low', '');
    numField(root, 'Prescribed range, upper end (optional)', 'rdv-range-high', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DV.radiopharmDispenseVolume(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'patient-release-rg839'(root) {
    const pairs = [['prg-nuclide', 'nuclide'], ['prg-activity', 'activity'], ['prg-unit', 'unit'], ['prg-rate', 'doseRateMremH'], ['prg-gamma', 'gamma'], ['prg-half-life', 'halfLifeDays'], ['prg-condition', 'condition'], ['prg-e1', 'occupancyFirst8h'], ['prg-e2', 'occupancyAfter']];
    selectField(root, 'Radionuclide', 'prg-nuclide', PR.NUCLIDES);
    numField(root, 'Administered activity', 'prg-activity', '');
    selectField(root, 'Activity unit', 'prg-unit', PR.UNITS);
    numField(root, 'Measured dose rate at 1 meter, mrem/h (optional)', 'prg-rate', '');
    numField(root, 'Another radionuclide: exposure rate constant, R·cm²/(mCi·h)', 'prg-gamma', '');
    numField(root, 'Another radionuclide: physical half-life, days', 'prg-half-life', '');
    selectField(root, 'I-131 patient-specific calculation: condition treated (optional)', 'prg-condition', PR.CONDITIONS);
    numField(root, 'I-131: occupancy factor for the first 8 hours (the guide\'s examples use 0.75)', 'prg-e1', '');
    numField(root, 'I-131: occupancy factor after 8 hours (the guide\'s examples use 0.25)', 'prg-e2', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PR.patientReleaseRg839(args), o);
    }));
  },
  'nuc-med-breastfeeding-interruption'(root) {
    const pairs = [['nbi-agent', 'agent'], ['nbi-activity', 'activity'], ['nbi-unit', 'unit']];
    selectField(root, 'Radiopharmaceutical', 'nbi-agent', BF.AGENTS);
    numField(root, 'Administered activity (not needed for the rows with a duration only)', 'nbi-activity', '');
    selectField(root, 'Activity unit', 'nbi-unit', BF.UNITS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(BF.nucMedBreastfeedingInterruption(args), o);
    }));
  },
  'generator-breakthrough-check'(root) {
    const pairs = [['gbc-generator', 'generator'], ['gbc-mo99', 'mo99MicroCi'], ['gbc-tc99m', 'tc99mMilliCi'], ['gbc-hours', 'hoursToAdministration'], ['gbc-aluminum', 'aluminumMcgPerMl'], ['gbc-sr82', 'sr82'], ['gbc-sr85', 'sr85'], ['gbc-volume', 'cumulativeVolumeL'], ['gbc-days', 'daysSinceCalibration']];
    selectField(root, 'Generator', 'gbc-generator', GB.GENERATORS);
    numField(root, 'Technetium generator: Mo-99 at elution, µCi', 'gbc-mo99', '');
    numField(root, 'Technetium generator: Tc-99m at elution, mCi', 'gbc-tc99m', '');
    numField(root, 'Technetium generator: hours from elution to administration (optional)', 'gbc-hours', '');
    numField(root, 'Technetium generator: aluminum in the eluate, µg/mL (optional)', 'gbc-aluminum', '');
    numField(root, 'Rubidium generator: Sr-82, µCi per mCi Rb-82', 'gbc-sr82', '');
    numField(root, 'Rubidium generator: Sr-85, µCi per mCi Rb-82', 'gbc-sr85', '');
    numField(root, 'Rubidium generator: cumulative eluate volume, L (optional)', 'gbc-volume', '');
    numField(root, 'Rubidium generator: days since calibration (optional)', 'gbc-days', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GB.generatorBreakthroughCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'radiation-distance-shielding'(root) {
    const pairs = [['rds-rate', 'rate'], ['rds-distance', 'distance'], ['rds-new-distance', 'newDistance'], ['rds-shield', 'shield'], ['rds-thickness', 'thicknessCm'], ['rds-hvl', 'halfValueLayerCm'], ['rds-limit', 'doseLimit']];
    numField(root, 'Measured dose rate, per hour (any unit; the answer is in the same unit)', 'rds-rate', '');
    numField(root, 'Distance of the measurement', 'rds-distance', '');
    numField(root, 'New distance (same unit)', 'rds-new-distance', '');
    selectField(root, 'Lead shield: source (optional)', 'rds-shield', RS.SHIELDS);
    numField(root, 'Lead thickness, cm', 'rds-thickness', '');
    numField(root, 'Half-value layer in lead, cm (for another source)', 'rds-hvl', '');
    numField(root, 'Dose to stay under, in the same dose unit (optional)', 'rds-limit', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = RS.radiationDistanceShielding(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'rasburicase-dose'(root) {
    const pairs = [['rbd-weight', 'weight'], ['rbd-g6pd', 'g6pd'], ['rbd-day', 'day']];
    numField(root, 'Weight, kg', 'rbd-weight', '');
    selectField(root, 'G6PD status', 'rbd-g6pd', RB.G6PD);
    numField(root, 'Day of the course (optional)', 'rbd-day', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = RB.rasburicaseDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'dexrazoxane-ratio-dose'(root) {
    const pairs = [['dxr-dose', 'doxorubicinDose'], ['dxr-unit', 'unit'], ['dxr-crcl', 'crcl'], ['dxr-cumulative', 'cumulativeDoxorubicin']];
    numField(root, 'Doxorubicin dose', 'dxr-dose', '');
    selectField(root, 'Dose unit', 'dxr-unit', DX.UNITS);
    numField(root, 'Creatinine clearance, mL/min', 'dxr-crcl', '');
    numField(root, 'Cumulative doxorubicin to date, mg/m² (optional)', 'dxr-cumulative', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DX.dexrazoxaneRatioDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'capecitabine-tablet-dose'(root) {
    const pairs = [['cap-level', 'level'], ['cap-typed', 'typedLevel'], ['cap-bsa', 'bsa'], ['cap-crcl', 'crcl'], ['cap-percent', 'percent'], ['cap-days', 'daysOn']];
    selectField(root, 'Dose level per dose', 'cap-level', CP.LEVELS);
    numField(root, 'Another dose level, mg/m² per dose', 'cap-typed', '');
    numField(root, 'Body surface area, m²', 'cap-bsa', '');
    numField(root, 'Creatinine clearance by Cockcroft-Gault, mL/min', 'cap-crcl', '');
    selectField(root, 'Percent of the dose for this cycle', 'cap-percent', CP.PERCENTS);
    numField(root, 'Days of treatment in the cycle (optional, for example 14)', 'cap-days', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CP.capecitabineTabletDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'mesna-ifosfamide-schedule'(root) {
    const pairs = [['mis-dose', 'dose'], ['mis-unit', 'unit'], ['mis-bsa', 'bsa'], ['mis-plan', 'plan'], ['mis-start', 'start']];
    numField(root, 'Ifosfamide dose', 'mis-dose', '');
    selectField(root, 'Dose unit', 'mis-unit', MS.UNITS);
    numField(root, 'Body surface area, m² (needed for a dose per m²)', 'mis-bsa', '');
    selectField(root, 'Route plan', 'mis-plan', MS.PLANS);
    dateField(root, 'Ifosfamide start (optional, for clock times)', 'mis-start', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MS.mesnaIfosfamideSchedule(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'glucarpidase-dose'(root) {
    const pairs = [['gcd-weight', 'weight'], ['gcd-mtx', 'methotrexate'], ['gcd-delayed', 'delayed'], ['gcd-when', 'glucarpidaseTime'], ['gcd-last', 'lastLeucovorin'], ['gcd-next', 'nextLeucovorin']];
    numField(root, 'Weight, kg', 'gcd-weight', '');
    numField(root, 'Plasma methotrexate, µmol/L', 'gcd-mtx', '');
    selectField(root, 'Delayed methotrexate clearance from impaired renal function', 'gcd-delayed', GD.DELAYED);
    dateField(root, 'Planned glucarpidase time (optional)', 'gcd-when', 'datetime-local');
    dateField(root, 'Last leucovorin dose (optional)', 'gcd-last', 'datetime-local');
    dateField(root, 'Next leucovorin dose (optional)', 'gcd-next', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GD.glucarpidaseDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'it-methotrexate-age-dose'(root) {
    const pairs = [['itm-age', 'age'], ['itm-unit', 'ageUnit']];
    numField(root, 'Age', 'itm-age', '');
    selectField(root, 'Age unit', 'itm-unit', IT.AGE_UNITS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = IT.itMethotrexateAgeDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'hdmtx-leucovorin-rescue'(root) {
    const pairs = [['hlr-hours', 'hours'], ['hlr-level', 'level'], ['hlr-unit', 'levelUnit'], ['hlr-base-cr', 'baselineCreatinine'], ['hlr-cur-cr', 'currentCreatinine'], ['hlr-level72', 'level72']];
    numField(root, 'Hours since the methotrexate infusion started', 'hlr-hours', '');
    numField(root, 'Serum methotrexate level', 'hlr-level', '');
    selectField(root, 'Level unit', 'hlr-unit', HL.LEVEL_UNITS);
    numField(root, 'Baseline serum creatinine (optional; same unit as the current value)', 'hlr-base-cr', '');
    numField(root, 'Current serum creatinine (optional)', 'hlr-cur-cr', '');
    numField(root, 'The 72-hour level in µmol/L, for a 96-hour level (optional)', 'hlr-level72', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HL.hdmtxLeucovorinRescue(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'gcsf-timing-check'(root) {
    const pairs = [['gtc-product', 'product'], ['gtc-chemo', 'chemoEnd'], ['gtc-planned', 'planned'], ['gtc-next', 'nextChemo'], ['gtc-pop', 'population'], ['gtc-weight', 'weight']];
    selectField(root, 'Product', 'gtc-product', GT.PRODUCTS);
    dateField(root, 'This cycle: chemotherapy last given', 'gtc-chemo', 'datetime-local');
    dateField(root, 'Planned growth-factor date and time', 'gtc-planned', 'datetime-local');
    dateField(root, 'Next cycle: chemotherapy start (optional)', 'gtc-next', 'datetime-local');
    selectField(root, 'Pegfilgrastim: adult or pediatric patient', 'gtc-pop', GT.POPULATIONS);
    numField(root, 'Pegfilgrastim: weight, kg (needed for a pediatric patient)', 'gtc-weight', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GT.gcsfTimingCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'cumulative-dose-limit'(root) {
    const pairs = [['cdl-agent', 'agent'], ['cdl-doses', 'doses'], ['cdl-dauno-group', 'daunorubicinGroup'], ['cdl-radiation', 'heartRadiation'], ['cdl-mito-use', 'mitoxantroneUse'], ['cdl-other', 'otherEquivalent']];
    selectField(root, 'Agent', 'cdl-agent', CD.AGENTS);
    areaField(root, 'Prior doses, one per line: mg/m² (bleomycin: units; daunorubicin under 2 years: mg/kg). Or the dose in mg, a comma, and the body surface area (or weight) at that dose.', 'cdl-doses', '60');
    selectField(root, 'Daunorubicin: age group', 'cdl-dauno-group', CD.DAUNORUBICIN_GROUPS);
    selectField(root, 'Daunorubicin, adult: radiation therapy that encompassed the heart', 'cdl-radiation', CD.HEART_RADIATION);
    selectField(root, 'Mitoxantrone: used for', 'cdl-mito-use', CD.MITOXANTRONE_USES);
    numField(root, 'Prior other anthracyclines or anthracenediones, already converted by you to this agent (optional)', 'cdl-other', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CD.cumulativeDoseLimit(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'esa-chemo-dose-adjust'(root) {
    const pairs = [['eca-schedule', 'schedule'], ['eca-stage', 'stage'], ['eca-hgb', 'hemoglobin'], ['eca-weight', 'weight'], ['eca-months', 'monthsPlanned'], ['eca-dose', 'currentDose'], ['eca-weeks', 'weeksOnTherapy'], ['eca-hgb-2wk', 'hemoglobinTwoWeeksAgo'], ['eca-hgb-start', 'hemoglobinAtStart'], ['eca-level', 'transfusionLevel'], ['eca-still', 'transfusionsStillRequired'], ['eca-complete', 'chemoCompleted']];
    selectField(root, 'Agent and schedule', 'eca-schedule', EA.SCHEDULES);
    selectField(root, 'Stage', 'eca-stage', EA.STAGES);
    numField(root, 'Hemoglobin now, g/dL', 'eca-hgb', '');
    numField(root, 'Weight, kg (needed for a schedule dosed per kg)', 'eca-weight', '');
    numField(root, 'Not started: months of chemotherapy still planned', 'eca-months', '');
    numField(root, 'On therapy: current dose per administration (Units for epoetin, mcg for darbepoetin)', 'eca-dose', '');
    numField(root, 'On therapy: weeks on the ESA', 'eca-weeks', '');
    numField(root, 'On therapy: hemoglobin 2 weeks ago, g/dL (optional)', 'eca-hgb-2wk', '');
    numField(root, 'On therapy: hemoglobin when the ESA was started, g/dL (optional)', 'eca-hgb-start', '');
    selectField(root, 'On therapy: hemoglobin against the level needed to avoid transfusion', 'eca-level', EA.TRANSFUSION_LEVELS);
    selectField(root, 'On therapy: red cell transfusions still required', 'eca-still', EA.YES_NO);
    selectField(root, 'On therapy: chemotherapy course completed', 'eca-complete', EA.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = EA.esaChemoDoseAdjust(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
};
