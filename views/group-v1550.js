// spec-v1550: renderers for who-anemia-hb -- is this hemoglobin anemic, by the WHO 2024 cutoffs with the
// elevation and smoking adjustments (Clinical Scoring & Risk, Group G) -- and vitamin-a-dose-child (Group N)
// and deworming-dose-who (Group F); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as A from '../lib/who-anemia-hb-v1550.js';
import * as V from '../lib/vitamin-a-dose-child-v1550.js';
import * as W from '../lib/deworming-dose-who-v1550.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options, { blank = true, selected } = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [...(blank ? [NA] : []), ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  if (selected) s.value = selected;
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step, placeholder }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'who-anemia-hb'(root) {
    const pairs = [['ahb-hb', 'hb'], ['ahb-unit', 'unit'], ['ahb-group', 'group'], ['ahb-elev', 'elevation'], ['ahb-smoke', 'smoking']];
    numField(root, 'Hemoglobin', 'ahb-hb', 'e.g. 11.2', '250', 'any');
    selectField(root, 'Unit', 'ahb-unit', A.UNITS, { blank: false, selected: 'gdl' });
    selectField(root, 'Group (age, sex, pregnancy)', 'ahb-group', A.GROUPS);
    numField(root, 'Elevation where the person lives, meters (optional)', 'ahb-elev', 'e.g. 1600', '4999', '1');
    selectField(root, 'Smoking (optional)', 'ahb-smoke', A.SMOKING);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = A.whoAnemiaHb(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2024', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'vitamin-a-dose-child'(root) {
    const pairs = [['va-reason', 'reason'], ['va-age', 'age'], ['va-recent', 'recent'], ['va-rutf', 'rutf']];
    selectField(root, 'Reason', 'va-reason', V.REASON_OPTIONS);
    numField(root, 'Age in months', 'va-age', 'e.g. 18', '60', 'any');
    selectField(root, 'Vitamin A dose in the past month (routine, diarrhea)', 'va-recent', V.YES_NO);
    selectField(root, 'On RUTF (routine, diarrhea)', 'va-rutf', V.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = V.vitaminADoseChild(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Vitamin A', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'deworming-dose-who'(root) {
    const pairs = [['dw-group', 'group'], ['dw-age', 'age'], ['dw-prev', 'prevalence'], ['dw-trimester', 'trimester'], ['dw-criteria', 'criteria']];
    selectField(root, 'Group', 'dw-group', W.GROUP_OPTIONS);
    numField(root, 'Age in months (child)', 'dw-age', 'e.g. 36', '228', 'any');
    selectField(root, 'Local soil-transmitted helminth prevalence', 'dw-prev', W.PREVALENCE_OPTIONS);
    selectField(root, 'Trimester (pregnant)', 'dw-trimester', W.TRIMESTER_OPTIONS);
    selectField(root, 'Hookworm or whipworm 20% or more, and anemia 40% or more of pregnant women (pregnant)', 'dw-criteria', W.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = W.dewormingDoseWho(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2017', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
