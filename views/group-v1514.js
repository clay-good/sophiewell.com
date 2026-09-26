// spec-v1514: renderers for moon-deadline, nomnc-deadline, snf-qualifying-stay, hospice-period-clock.

import { el, clear } from '../lib/dom.js';
import * as PA from '../lib/post-acute-clocks-v1514.js';
import * as HC from '../lib/hospice-cap-v1514.js';
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
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function dateInput(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
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

export const renderers = {
  'moon-deadline'(root) {
    const pairs = [['moon-start', 'observationStart'], ['moon-end', 'endTime']];
    dateInput(root, 'Observation began (date and time)', 'moon-start', 'datetime-local');
    dateInput(root, 'Released, transferred or admitted (optional)', 'moon-end', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.moonDeadline(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'MOON', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'nomnc-deadline'(root) {
    const pairs = [['nomnc-setting', 'setting'], ['nomnc-last', 'lastCovered'], ['nomnc-delivered', 'delivered']];
    selectField(root, 'Setting', 'nomnc-setting', PA.NOMNC_SETTINGS);
    dateInput(root, 'Last covered day of services', 'nomnc-last', 'date');
    dateInput(root, 'Date the notice was delivered (optional)', 'nomnc-delivered', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.nomncDeadline(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'NOMNC', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'snf-qualifying-stay'(root) {
    const pairs = [['snf-admit', 'inpatientAdmit'], ['snf-discharge', 'inpatientDischarge'], ['snf-snfadmit', 'snfAdmit'], ['snf-used', 'daysUsed']];
    dateInput(root, 'Inpatient admission date (not observation)', 'snf-admit', 'date');
    dateInput(root, 'Hospital discharge date', 'snf-discharge', 'date');
    dateInput(root, 'SNF admission date (optional)', 'snf-snfadmit', 'date');
    numField(root, 'SNF days already used this benefit period (optional)', 'snf-used', 'e.g. 10', '100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.snfQualifyingStay(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Stay', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'hospice-period-clock'(root) {
    const pairs = [['hosp-elect', 'electionDate'], ['hosp-asof', 'asOf']];
    dateInput(root, 'Hospice election date', 'hosp-elect', 'date');
    dateInput(root, 'Date to check (optional)', 'hosp-asof', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.hospicePeriodClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Period', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'hospice-aggregate-cap'(root) {
    const pairs = [['hac-year', 'capYear'], ['hac-benes', 'beneficiaries'], ['hac-method', 'method'], ['hac-paid', 'payments']];
    numField(root, 'Cap year, federal fiscal year (blank for the current one)', 'hac-year', 'e.g. 2026', '2100', '1');
    numField(root, 'Medicare beneficiaries for the cap year (may be fractional)', 'hac-benes', 'e.g. 100', '1000000', '0.001');
    selectField(root, 'Counting method (optional)', 'hac-method', HC.METHODS);
    numField(root, 'Medicare hospice payments for the cap year, dollars', 'hac-paid', 'e.g. 3700000', '10000000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HC.hospiceAggregateCap(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Cap', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'im-notice-timing'(root) {
    const pairs = [['im-admit', 'admission'], ['im-first', 'firstDelivered'], ['im-discharge', 'discharge']];
    dateInput(root, 'Inpatient admission, date and time', 'im-admit', 'datetime-local');
    dateInput(root, 'Date the first IM was delivered (optional)', 'im-first', 'date');
    dateInput(root, 'Planned discharge, date and time (optional)', 'im-discharge', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.imNoticeTiming(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Status', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'home-health-cert-clock'(root) {
    const pairs = [['hh-soc', 'startOfCare'], ['hh-f2f', 'faceToFace'], ['hh-ref', 'referral']];
    dateInput(root, 'Start-of-care date', 'hh-soc', 'date');
    dateInput(root, 'Face-to-face encounter date (optional)', 'hh-f2f', 'date');
    dateInput(root, 'Referral date (optional)', 'hh-ref', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.homeHealthCertClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Status', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'dme-rental-clock'(root) {
    const pairs = [['dme-item', 'item'], ['dme-delivered', 'delivered'], ['dme-stop', 'lastUse'], ['dme-resume', 'resumed']];
    selectField(root, 'Item type', 'dme-item', PA.DME_ITEMS);
    dateInput(root, 'Delivery date', 'dme-delivered', 'date');
    dateInput(root, 'Last day of use before a break (optional)', 'dme-stop', 'date');
    dateInput(root, 'Day use resumed (optional)', 'dme-resume', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.dmeRentalClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Status', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'irf-compliance-clock'(root) {
    const pairs = [['irf-admit', 'admission'], ['irf-screen', 'screening'], ['irf-update', 'screeningUpdate'], ['irf-therapy', 'firstTherapy'], ['irf-discharge', 'discharge']];
    dateInput(root, 'IRF admission, date and time', 'irf-admit', 'datetime-local');
    dateInput(root, 'Preadmission screening, date and time (optional)', 'irf-screen', 'datetime-local');
    dateInput(root, 'Screening update, date and time (optional)', 'irf-update', 'datetime-local');
    dateInput(root, 'First therapy session, date and time (optional)', 'irf-therapy', 'datetime-local');
    dateInput(root, 'Discharge date (optional)', 'irf-discharge', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.irfComplianceClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Status', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'mcsn-appeal-rights'(root) {
    const pairs = [['mcsn-start', 'hospitalStart'], ['mcsn-admit', 'admitted'], ['mcsn-reclass', 'reclassified'], ['mcsn-partb', 'partB'], ['mcsn-release', 'release']];
    dateInput(root, 'First day of the hospital stay (including emergency or observation time)', 'mcsn-start', 'date');
    dateInput(root, 'Inpatient admission date', 'mcsn-admit', 'date');
    dateInput(root, 'Date reclassified to outpatient observation', 'mcsn-reclass', 'date');
    selectField(root, 'Did the patient have Part B during the stay?', 'mcsn-partb', PA.PART_B_OPTIONS);
    dateInput(root, 'Expected release, date and time (optional)', 'mcsn-release', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PA.mcsnAppealRights(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Appeal', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
