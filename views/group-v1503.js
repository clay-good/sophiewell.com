// spec-v1503: renderers for the eight coverage and appeal clocks.

import { el, clear } from '../lib/dom.js';
import * as PD from '../lib/partd-appeals-v1503.js';
import * as MA from '../lib/ma-appeals-v1503.js';
import * as ER from '../lib/erisa-claim-clock-v1503.js';
import * as AC from '../lib/aca-external-review-v1503.js';
import * as MD from '../lib/medicaid-appeal-clock-v1503.js';
import * as QI from '../lib/qio-discharge-appeal-v1503.js';
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
  'partd-coverage-clock'(root) {
    const pairs = [['pdc-type', 'requestType'], ['pdc-received', 'received'], ['pdc-statement', 'statement']];
    selectField(root, 'Kind of request', 'pdc-type', PD.REQUEST_TYPES);
    dateInput(root, 'Plan received the request (date and time)', 'pdc-received', 'datetime-local');
    dateInput(root, 'Exceptions only: supporting statement received (blank if none yet)', 'pdc-statement', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PD.partdCoverageClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'partd-appeal-ladder'(root) {
    const pairs = [['pda-level', 'level'], ['pda-notice', 'noticeDate'], ['pda-received', 'receivedDate'], ['pda-amount', 'amount']];
    selectField(root, 'Decision notice you have', 'pda-level', PD.LEVELS);
    dateInput(root, 'Date printed on the notice', 'pda-notice', 'date');
    dateInput(root, 'Date received, only with proof of later receipt', 'pda-received', 'date');
    numField(root, 'Amount at stake in dollars (for an ALJ hearing)', 'pda-amount', 'e.g. 850', '1000000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PD.partdAppealLadder(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Next step', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'ma-org-determination-clock'(root) {
    const pairs = [['mao-type', 'requestType'], ['mao-received', 'received'], ['mao-extended', 'extended']];
    selectField(root, 'Kind of request', 'mao-type', MA.MA_REQUESTS);
    dateInput(root, 'Plan received the request (date and time)', 'mao-received', 'datetime-local');
    selectField(root, 'Did the plan take the 14-day extension, with written notice?', 'mao-extended', MA.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MA.maOrgDeterminationClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'ma-appeal-ladder'(root) {
    const pairs = [['maa-level', 'level'], ['maa-notice', 'noticeDate'], ['maa-received', 'receivedDate'], ['maa-amount', 'amount']];
    selectField(root, 'Decision notice you have', 'maa-level', MA.MA_LEVELS);
    dateInput(root, 'Date printed on the notice', 'maa-notice', 'date');
    dateInput(root, 'Date received, only with proof of later receipt', 'maa-received', 'date');
    numField(root, 'Amount at stake in dollars (for an ALJ hearing)', 'maa-amount', 'e.g. 850', '1000000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MA.maAppealLadder(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Next step', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'erisa-claim-clock'(root) {
    const pairs = [['er-type', 'claimType'], ['er-stage', 'stage'], ['er-received', 'received'], ['er-extended', 'extended'], ['er-extnotice', 'extensionNotice'], ['er-levels', 'levels'], ['er-denial', 'denialReceived']];
    selectField(root, 'Kind of claim', 'er-type', ER.CLAIM_TYPES);
    selectField(root, 'What the plan is deciding', 'er-stage', ER.STAGES);
    dateInput(root, 'Plan received it (time needed for urgent and concurrent care)', 'er-received', 'datetime-local');
    selectField(root, 'Claims only: did the plan take its one 15-day extension?', 'er-extended', ER.YES_NO);
    dateInput(root, 'Date of the extension notice', 'er-extnotice', 'date');
    selectField(root, 'Appeals only: levels of appeal the plan has', 'er-levels', ER.LEVELS);
    dateInput(root, 'Date the denial was received (for the 180-day appeal window)', 'er-denial', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = ER.erisaClaimClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'aca-external-review-clock'(root) {
    const pairs = [['acx-notice', 'noticeReceived'], ['acx-request', 'requestReceived'], ['acx-iro', 'iroReceived']];
    dateInput(root, 'Final internal denial received', 'acx-notice', 'date');
    dateInput(root, 'Plan received the external review request (optional)', 'acx-request', 'date');
    dateInput(root, 'Independent reviewer received the request (optional)', 'acx-iro', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AC.acaExternalReviewClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'medicaid-appeal-clock'(root) {
    const pairs = [['mdc-notice', 'noticeDate'], ['mdc-effective', 'effectiveDate'], ['mdc-received', 'appealReceived'], ['mdc-type', 'appealType'], ['mdc-extended', 'extended'], ['mdc-resolution', 'resolutionDate'], ['mdc-window', 'stateWindow']];
    dateInput(root, 'Date on the plan\'s adverse benefit determination notice', 'mdc-notice', 'date');
    dateInput(root, 'Intended effective date of the action (optional)', 'mdc-effective', 'date');
    dateInput(root, 'Plan received the appeal (optional; time needed if expedited)', 'mdc-received', 'datetime-local');
    selectField(root, 'Standard or expedited appeal', 'mdc-type', MD.APPEAL_TYPES);
    selectField(root, 'Did the plan take the 14-day extension?', 'mdc-extended', MD.YES_NO);
    dateInput(root, 'Date of the plan\'s notice of resolution (optional)', 'mdc-resolution', 'date');
    numField(root, 'State fair hearing window in days (90 to 120)', 'mdc-window', 'e.g. 120', '120', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MD.medicaidAppealClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'qio-discharge-appeal-clock'(root) {
    const pairs = [['qio-setting', 'setting'], ['qio-key', 'keyDate'], ['qio-requested', 'requested'], ['qio-end', 'servicesEnd']];
    selectField(root, 'What is ending', 'qio-setting', QI.SETTINGS);
    dateInput(root, 'Planned discharge date, or the date the notice was received', 'qio-key', 'date');
    dateInput(root, 'Other services only: QIO received the request (optional)', 'qio-requested', 'datetime-local');
    dateInput(root, 'Other services only: date services are to end (optional)', 'qio-end', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = QI.qioDischargeAppealClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
