// spec-v1639: counter practice. Quantities, missed doses and the questions patients ask at the counter.
// quantity-to-dispense, topical-quantity-ftu, oral-suspension-course, contraceptive-missed-pill,
// contraception-start-backup, depot-injection-window, emergency-contraception-window,
// epinephrine-device-weight-band, nrt-step-schedule, out-of-fridge-discard-date, otc-child-label-dose,
// otc-daily-max-check, missed-dose-label-rule, lai-antipsychotic-missed-dose.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as QD from '../lib/quantity-to-dispense-v1639.js';
import * as FT from '../lib/topical-quantity-ftu-v1639.js';
import * as OS from '../lib/oral-suspension-course-v1639.js';
import * as MP from '../lib/contraceptive-missed-pill-v1639.js';
import * as SB from '../lib/contraception-start-backup-v1639.js';
import * as DW from '../lib/depot-injection-window-v1639.js';
import * as EC from '../lib/emergency-contraception-window-v1639.js';
import * as EP from '../lib/epinephrine-device-weight-band-v1639.js';
import * as NR from '../lib/nrt-step-schedule-v1639.js';
import * as FD from '../lib/out-of-fridge-discard-date-v1639.js';
import * as CD from '../lib/otc-child-label-dose-v1639.js';
import * as DM from '../lib/otc-daily-max-check-v1639.js';
import * as MD from '../lib/missed-dose-label-rule-v1639.js';
import * as LM from '../lib/lai-antipsychotic-missed-dose-v1639.js';

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

// A label tool's result names the labels it read; each gets its own link.
function labelLinks(r, o) {
  const links = r.labelLinks || (r.labelUrl ? [{ text: 'Current label on DailyMed', url: r.labelUrl }] : []);
  for (const l of links) { const p = el('p'); p.appendChild(el('a', { href: l.url, target: '_blank', rel: 'noreferrer', text: l.text })); o.appendChild(p); }
}

export const renderers = {
  'quantity-to-dispense'(root) {
    const pairs = [['qd-form', 'form'], ['qd-days', 'days'], ['qd-perdose', 'perDose'], ['qd-dpd', 'dosesPerDay'], ['qd-taper', 'taperSteps'], ['qd-doseml', 'doseMl'], ['qd-uday', 'unitsPerDay'], ['qd-inj', 'injectionsPerDay'], ['qd-prime', 'primingUnits'], ['qd-upml', 'unitsPerMl'], ['qd-mlpen', 'mlPerPen'], ['qd-discard', 'discardDays'], ['qd-puffs', 'puffsPerDose'], ['qd-act', 'actuations'], ['qd-primepuffs', 'primingPuffs'], ['qd-dpe', 'dropsPerEye'], ['qd-eyes', 'eyes'], ['qd-dpm', 'dropsPerMl'], ['qd-change', 'changeInterval'], ['qd-change-unit', 'changeUnit'], ['qd-worn', 'patchesWorn'], ['qd-uses', 'usesPerDay'], ['qd-pack', 'packageSize']];
    selectField(root, 'Dosage form', 'qd-form', QD.FORMS);
    numField(root, 'Days supply wanted (every form but a taper)', 'qd-days', 'e.g. 30');
    numField(root, 'Tablets or capsules: units per dose', 'qd-perdose', 'e.g. 1');
    numField(root, 'Doses per day (tablets, liquid, inhaler, drops)', 'qd-dpd', 'e.g. 2');
    areaField(root, 'Taper: one step a line, as units per dose, doses per day, days', 'qd-taper', '4, 1, 3');
    numField(root, 'Liquid: dose volume (mL)', 'qd-doseml', 'e.g. 5');
    numField(root, 'Insulin: units injected per day', 'qd-uday', 'e.g. 40');
    numField(root, 'Insulin: injections per day', 'qd-inj', 'e.g. 2');
    numField(root, 'Insulin: priming units per injection (from the label)', 'qd-prime', 'e.g. 2');
    numField(root, 'Insulin: units per mL', 'qd-upml', 'e.g. 100');
    numField(root, 'Insulin: mL per pen or vial', 'qd-mlpen', 'e.g. 3');
    numField(root, 'Insulin: in-use discard limit in days, if the label gives one', 'qd-discard', 'e.g. 28');
    numField(root, 'Inhaler: puffs per dose', 'qd-puffs', 'e.g. 2');
    numField(root, 'Inhaler: actuations per canister', 'qd-act', 'e.g. 120');
    numField(root, 'Inhaler: priming puffs per canister (optional)', 'qd-primepuffs', 'e.g. 4');
    numField(root, 'Drops: drops per eye per dose', 'qd-dpe', 'e.g. 1');
    numField(root, 'Drops: eyes treated', 'qd-eyes', 'e.g. 2');
    numField(root, 'Drops: drops per mL (manufacturer or plan figure)', 'qd-dpm', 'e.g. 20');
    numField(root, 'Patches: time between changes', 'qd-change', 'e.g. 72');
    selectField(root, 'Patches: that time is in', 'qd-change-unit', QD.CHANGE_UNITS);
    numField(root, 'Patches: worn at once', 'qd-worn', 'e.g. 1');
    numField(root, 'Supplies: uses per day', 'qd-uses', 'e.g. 3');
    numField(root, 'Package size: units, mL, pens, canisters or patches in one (optional)', 'qd-pack', 'e.g. 5');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(QD.quantityToDispense(args), o);
    }));
  },
  'topical-quantity-ftu'(root) {
    const pairs = [['ftu-sex', 'sex'], ['ftu-face', 'faceNeck'], ['ftu-front', 'frontTrunk'], ['ftu-back', 'backTrunk'], ['ftu-arms', 'arms'], ['ftu-hands', 'hands'], ['ftu-legs', 'legs'], ['ftu-feet', 'feet'], ['ftu-apps', 'applicationsPerDay'], ['ftu-days', 'days'], ['ftu-tube', 'tubeGrams']];
    selectField(root, 'Sex (sets the grams in one fingertip unit)', 'ftu-sex', FT.SEXES);
    for (const a of FT.AREAS) numField(root, `${a.label}: how many treated (0${a.max === 2 ? ', 1 or 2' : ' or 1'})`, a.dom, '0');
    numField(root, 'Applications per day', 'ftu-apps', 'e.g. 2');
    numField(root, 'Days of treatment', 'ftu-days', 'e.g. 14');
    numField(root, 'Tube size in grams (optional)', 'ftu-tube', 'e.g. 30');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(FT.topicalQuantityFtu(args), o);
    }));
  },
  'oral-suspension-course'(root) {
    const pairs = [['osc-doseml', 'doseMl'], ['osc-dosemg', 'doseMg'], ['osc-strength', 'mgPer5Ml'], ['osc-dpd', 'dosesPerDay'], ['osc-days', 'days'], ['osc-bottle', 'bottleMl'], ['osc-mixed', 'mixedOn'], ['osc-discard', 'discardAfterDays']];
    numField(root, 'Dose in mL', 'osc-doseml', 'e.g. 7.5');
    numField(root, 'Or the dose in mg', 'osc-dosemg', 'e.g. 400');
    numField(root, 'With the label strength: mg in each 5 mL', 'osc-strength', 'e.g. 250');
    numField(root, 'Doses per day', 'osc-dpd', 'e.g. 2');
    numField(root, 'Days of therapy', 'osc-days', 'e.g. 10');
    numField(root, 'Bottle size after mixing, mL (optional)', 'osc-bottle', 'e.g. 100');
    dateField(root, 'Date the bottle was mixed (optional)', 'osc-mixed');
    numField(root, 'The label\'s discard-after figure, days', 'osc-discard', 'e.g. 14');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(OS.oralSuspensionCourse(args), o);
    }));
  },
  'contraceptive-missed-pill'(root) {
    const pairs = [['cmp-type', 'pillType'], ['cmp-due', 'dueAt'], ['cmp-now', 'nowAt'], ['cmp-count', 'missedCount'], ['cmp-week', 'week'], ['cmp-upsi', 'intercourse']];
    selectField(root, 'Kind of pill', 'cmp-type', MP.PILL_TYPES);
    dateField(root, 'When the first late or missed hormonal pill was due', 'cmp-due', 'datetime-local');
    dateField(root, 'Date and time now', 'cmp-now', 'datetime-local');
    numField(root, 'Consecutive hormonal pills missed (optional cross-check)', 'cmp-count', 'e.g. 1');
    selectField(root, 'Week of hormonal pills the missed pills fall in', 'cmp-week', MP.WEEKS);
    // Kept out of the shareable link: a forwarded link must not carry this answer.
    selectField(root, 'Unprotected intercourse in the previous 5 days?', 'cmp-upsi', MP.UPSI).querySelector('select').setAttribute('data-private', '');
    note(root, 'For a norethindrone or norgestrel pill, CDC\'s line has no 5-day limit: answer for any unprotected intercourse.');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MP.contraceptiveMissedPill(args), o);
    }));
  },
  'contraception-start-backup'(root) {
    const pairs = [['csb-method', 'method'], ['csb-bleed', 'bleedingStarted'], ['csb-start', 'startDate']];
    selectField(root, 'Method being started', 'csb-method', SB.METHODS);
    dateField(root, 'Date menstrual bleeding started', 'csb-bleed');
    dateField(root, 'Date the method is started or placed', 'csb-start');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SB.contraceptionStartBackup(args), o);
    }));
  },
  'depot-injection-window'(root) {
    const pairs = [['diw-product', 'product'], ['diw-last', 'lastInjection'], ['diw-planned', 'plannedDate'], ['diw-sublocade', 'sublocadeNext']];
    selectField(root, 'Product', 'diw-product', DW.PRODUCTS);
    dateField(root, 'Date of the last injection', 'diw-last');
    dateField(root, 'Today\'s or the planned date (optional)', 'diw-planned');
    selectField(root, 'Sublocade: which injection is next', 'diw-sublocade', DW.SUBLOCADE_NEXT);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DW.depotInjectionWindow(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'emergency-contraception-window'(root) {
    const pairs = [['ecw-sex', 'intercourseAt'], ['ecw-now', 'nowAt']];
    dateField(root, 'Date and time of unprotected intercourse', 'ecw-sex', 'datetime-local').querySelector('input').setAttribute('data-private', '');
    dateField(root, 'Date and time now', 'ecw-now', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = EC.emergencyContraceptionWindow(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'epinephrine-device-weight-band'(root) {
    const pairs = [['edw-weight', 'weight'], ['edw-unit', 'weightUnit']];
    numField(root, 'Weight', 'edw-weight', 'e.g. 44');
    selectField(root, 'Weight is in', 'edw-unit', EP.UNITS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = EP.epinephrineDeviceWeightBand(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'nrt-step-schedule'(root) {
    const pairs = [['nrt-product', 'product'], ['nrt-age', 'age'], ['nrt-cigs', 'cigarettesPerDay'], ['nrt-minutes', 'minutesToFirst'], ['nrt-quit', 'quitDate']];
    selectField(root, 'Product', 'nrt-product', NR.PRODUCTS);
    selectField(root, 'Age of the user', 'nrt-age', NR.AGES);
    numField(root, 'Patch: cigarettes smoked per day', 'nrt-cigs', 'e.g. 20');
    numField(root, 'Gum or lozenge: minutes from waking to the first cigarette', 'nrt-minutes', 'e.g. 20');
    dateField(root, 'Quit date', 'nrt-quit');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NR.nrtStepSchedule(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'out-of-fridge-discard-date'(root) {
    const pairs = [['ofd-product', 'product'], ['ofd-kept', 'kept'], ['ofd-out', 'outOfFridge'], ['ofd-first', 'firstUse'], ['ofd-exp', 'expirationDate'], ['ofd-asof', 'asOf'], ['ofd-own-room', 'ownRoomDays'], ['ofd-own-inuse', 'ownInUseDays']];
    selectField(root, 'Product', 'ofd-product', FD.PRESETS);
    selectField(root, 'Kept within the label\'s temperature range?', 'ofd-kept', FD.KEPT);
    dateField(root, 'Date it left the refrigerator', 'ofd-out');
    dateField(root, 'Date of first use', 'ofd-first');
    dateField(root, 'Expiration date on the product (optional)', 'ofd-exp');
    dateField(root, 'Today\'s date, to count the days left (optional)', 'ofd-asof');
    numField(root, 'Another product: the label\'s days at room temperature', 'ofd-own-room', 'e.g. 14');
    numField(root, 'Another product: the label\'s days after first use', 'ofd-own-inuse', 'e.g. 28');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FD.outOfFridgeDiscardDate(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'otc-child-label-dose'(root) {
    const pairs = [['ocd-product', 'product'], ['ocd-weight', 'weight'], ['ocd-unit', 'weightUnit'], ['ocd-years', 'ageYears'], ['ocd-months', 'ageMonths']];
    note(root, 'This looks a child up in the chart printed on the carton. It covers only the products and strengths listed; another strength is not scaled.');
    selectField(root, 'Product and strength on the label', 'ocd-product', CD.PRODUCTS);
    numField(root, 'Child\'s weight', 'ocd-weight', 'e.g. 40');
    selectField(root, 'Weight is in', 'ocd-unit', CD.UNITS);
    numField(root, 'Age: whole years', 'ocd-years', 'e.g. 4');
    numField(root, 'Age: extra months (0 to 11)', 'ocd-months', 'e.g. 6').querySelector('input').setAttribute('max', '11');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CD.otcChildLabelDose(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'otc-daily-max-check'(root) {
    const pairs = [['odm-ingredient', 'ingredient'], ['odm-age', 'ageYears'], ['odm-amount', 'amount24h'], ['odm-unitmg', 'unitMg'], ['odm-single', 'singleDose'], ['odm-interval', 'intervalHours'], ['odm-days', 'days']];
    selectField(root, 'Active ingredient', 'odm-ingredient', DM.INGREDIENTS);
    numField(root, 'Age in years', 'odm-age', 'e.g. 30');
    numField(root, 'Units taken or planned in 24 hours (capsules, tablets, mL or doses)', 'odm-amount', 'e.g. 6');
    numField(root, 'Monograph ingredients: milligrams in each unit', 'odm-unitmg', 'e.g. 25');
    numField(root, 'Units in one dose (optional)', 'odm-single', 'e.g. 2');
    numField(root, 'Hours between doses (optional)', 'odm-interval', 'e.g. 6');
    numField(root, 'MiraLAX: days of use (optional)', 'odm-days', 'e.g. 3');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DM.otcDailyMaxCheck(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'missed-dose-label-rule'(root) {
    const pairs = [['mdl-product', 'product'], ['mdl-due', 'dueAt'], ['mdl-now', 'nowAt'], ['mdl-next', 'nextDoseAt'], ['mdl-last', 'lastDoseAt'], ['mdl-tablets', 'tabletsMissed']];
    selectField(root, 'Product and regimen', 'mdl-product', MD.PRODUCTS);
    dateField(root, 'When the missed dose was due', 'mdl-due', 'datetime-local');
    dateField(root, 'Date and time now', 'mdl-now', 'datetime-local');
    dateField(root, 'Next scheduled dose (dabigatran, Wegovy, Trulicity, monthly tablets)', 'mdl-next', 'datetime-local');
    dateField(root, 'Liraglutide: when the last dose was taken', 'mdl-last', 'datetime-local');
    selectField(root, 'Risedronate 75 mg: tablets missed', 'mdl-tablets', MD.TABLETS_MISSED);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MD.missedDoseLabelRule(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
  'lai-antipsychotic-missed-dose'(root) {
    const pairs = [['lmd-product', 'product'], ['lmd-last', 'lastInjection'], ['lmd-today', 'today']];
    selectField(root, 'Product', 'lmd-product', LM.PRODUCTS);
    dateField(root, 'Date of the last injection', 'lmd-last');
    dateField(root, 'Today\'s date', 'lmd-today');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LM.laiAntipsychoticMissedDose(args, new Date());
      show(r, o);
      if (r.valid) labelLinks(r, o);
    }));
  },
};
