// spec-v1551: renderer for act-weight-band-dose -- the WHO 2026 weight-band dose of an ACT for uncomplicated
// falciparum malaria (Medication & Infusion, Group F; field-health program, spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/act-weight-band-dose-v1551.js';
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
  'act-weight-band-dose'(root) {
    const pairs = [['act-regimen', 'regimen'], ['act-weight', 'weight']];
    selectField(root, 'ACT (artemisinin-based combination)', 'act-regimen', M.REGIMEN_OPTIONS);
    numField(root, 'Weight in kg', 'act-weight', 'e.g. 18', '150', 'any');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = M.actWeightBandDose(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2026 band', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
