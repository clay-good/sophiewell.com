// spec-v1512: renderers for vial-rounding, rate-escalation-schedule, dose-calendar.

import { el, clear } from '../lib/dom.js';
import * as VR from '../lib/vial-rounding-v1512.js';
import * as RE from '../lib/rate-escalation-v1512.js';
import * as DC from '../lib/dose-calendar-v1512.js';
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
  'vial-rounding'(root) {
    const pairs = [['vr-basis', 'basis'], ['vr-dose', 'dose'], ['vr-weight', 'weight'], ['vr-bsa', 'bsa'], ['vr-v1', 'vial1'], ['vr-c1', 'cost1'], ['vr-v2', 'vial2'], ['vr-c2', 'cost2'], ['vr-v3', 'vial3'], ['vr-c3', 'cost3'], ['vr-th', 'threshold']];
    selectField(root, 'Dose ordered in', 'vr-basis', VR.BASES);
    numField(root, 'Ordered dose', 'vr-dose', 'e.g. 5', '1000000', '0.001');
    numField(root, 'Weight, kg (for mg/kg)', 'vr-weight', 'e.g. 84', '350', '0.1');
    numField(root, 'Body surface area, m² (for mg/m²)', 'vr-bsa', 'e.g. 1.9', '4', '0.01');
    numField(root, 'Vial size 1, mg', 'vr-v1', 'e.g. 100', '1000000', '0.001');
    numField(root, 'Vial 1 cost, dollars (optional)', 'vr-c1', 'e.g. 700', '10000000', '0.01');
    numField(root, 'Vial size 2, mg (optional)', 'vr-v2', 'e.g. 500', '1000000', '0.001');
    numField(root, 'Vial 2 cost, dollars (optional)', 'vr-c2', 'e.g. 3400', '10000000', '0.01');
    numField(root, 'Vial size 3, mg (optional)', 'vr-v3', 'e.g. 40', '1000000', '0.001');
    numField(root, 'Vial 3 cost, dollars (optional)', 'vr-c3', 'e.g. 300', '10000000', '0.01');
    numField(root, 'Rounding threshold, percent (blank for 10%)', 'vr-th', 'e.g. 10', '25', '0.1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = VR.vialRounding(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Rounded', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'rate-escalation-schedule'(root) {
    const pairs = [['re-unit', 'unit'], ['re-total', 'total'], ['re-start', 'startRate'], ['re-inc', 'increment'], ['re-every', 'interval'], ['re-max', 'maxRate'], ['re-time', 'startTime']];
    selectField(root, 'Amounts in', 're-unit', RE.UNITS);
    numField(root, 'Total to infuse', 're-total', 'e.g. 700', '1000000', '0.01');
    numField(root, 'Starting rate, per hour', 're-start', 'e.g. 50', '100000', '0.01');
    numField(root, 'Increase at each step, per hour', 're-inc', 'e.g. 50', '100000', '0.01');
    numField(root, 'Minutes between increases', 're-every', 'e.g. 30', '1440', '1');
    numField(root, 'Maximum rate, per hour', 're-max', 'e.g. 400', '100000', '0.01');
    dateInput(root, 'Start time (optional)', 're-time', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = RE.rateEscalation(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Time', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'dose-calendar'(root) {
    const pairs = [['dc-start', 'startDate'], ['dc-w2', 'loadWeek2'], ['dc-w3', 'loadWeek3'], ['dc-every', 'everyWeeks'], ['dc-count', 'maintenanceDoses'], ['dc-win', 'windowDays'], ['dc-actual', 'actualDate'], ['dc-actual-n', 'actualDose']];
    dateInput(root, 'Date of the first dose (week 0)', 'dc-start', 'date');
    numField(root, 'Loading dose 2 at week (optional)', 'dc-w2', 'e.g. 2', '52', '1');
    numField(root, 'Loading dose 3 at week (optional)', 'dc-w3', 'e.g. 6', '52', '1');
    numField(root, 'Then every N weeks', 'dc-every', 'e.g. 8', '52', '1');
    numField(root, 'Maintenance doses to show (blank for 6)', 'dc-count', 'e.g. 6', '26', '1');
    numField(root, 'Allowed window, plus or minus days (optional)', 'dc-win', 'e.g. 3', '14', '1');
    dateInput(root, 'A dose actually given on (optional)', 'dc-actual', 'date');
    numField(root, 'Which dose number that was (optional)', 'dc-actual-n', 'e.g. 3', '30', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DC.doseCalendar(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Doses', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
