// spec-v1511: renderers for cs-refill-validity, c2-fill-deadlines, c2-multiple-rx-series.

import { el, clear } from '../lib/dom.js';
import * as CS from '../lib/cs-dispensing-v1511.js';
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
  'cs-refill-validity'(root) {
    const pairs = [['csr-schedule', 'schedule'], ['csr-issued', 'issued'], ['csr-check', 'checkDate'], ['csr-auth', 'authorized'], ['csr-done', 'dispensed']];
    selectField(root, 'Schedule', 'csr-schedule', CS.SCHEDULES);
    dateInput(root, 'Date the prescription was issued', 'csr-issued', 'date');
    dateInput(root, 'Date of the fill being checked', 'csr-check', 'date');
    numField(root, 'Refills authorized', 'csr-auth', 'e.g. 5', '99', '1');
    numField(root, 'Refills already dispensed', 'csr-done', 'e.g. 2', '99', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CS.csRefillValidity(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Refills', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'c2-fill-deadlines'(root) {
    const pairs = [['c2f-case', 'case'], ['c2f-start', 'start']];
    selectField(root, 'Which case applies', 'c2f-case', CS.C2_CASES);
    dateInput(root, 'Partial fill, date written, issue or authorization (date and time)', 'c2f-start', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CS.c2FillDeadlines(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'c2-multiple-rx-series'(root) {
    const pairs = [['c2m-issued', 'issued'], ['c2m-d1', 'rx1Days'], ['c2m-e1', 'rx1Earliest'], ['c2m-d2', 'rx2Days'], ['c2m-e2', 'rx2Earliest'], ['c2m-d3', 'rx3Days'], ['c2m-e3', 'rx3Earliest']];
    dateInput(root, 'Date the prescriptions were issued', 'c2m-issued', 'date');
    numField(root, 'Prescription 1: days supply', 'c2m-d1', 'e.g. 30', '90', '1');
    dateInput(root, 'Prescription 1: earliest fill date (blank to fill at once)', 'c2m-e1', 'date');
    numField(root, 'Prescription 2: days supply', 'c2m-d2', 'e.g. 30', '90', '1');
    dateInput(root, 'Prescription 2: earliest fill date', 'c2m-e2', 'date');
    numField(root, 'Prescription 3: days supply', 'c2m-d3', 'e.g. 30', '90', '1');
    dateInput(root, 'Prescription 3: earliest fill date', 'c2m-e3', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CS.c2MultipleRxSeries(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Series', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
