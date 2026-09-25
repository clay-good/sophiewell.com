// spec-v1495: renderer for ohat-oral-health (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as OH from '../lib/ohat-oral-health-v1495.js';
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
  'ohat-oral-health'(root) {
    const pairs = [['ohat-lips', 'lips'], ['ohat-tongue', 'tongue'], ['ohat-gums', 'gums'], ['ohat-saliva', 'saliva'], ['ohat-teeth', 'teeth'], ['ohat-dentures', 'dentures'], ['ohat-cleanliness', 'cleanliness'], ['ohat-pain', 'pain']];
    selectField(root, 'Lips', 'ohat-lips', OH.LEVELS);
    selectField(root, 'Tongue', 'ohat-tongue', OH.LEVELS);
    selectField(root, 'Gums and tissues', 'ohat-gums', OH.LEVELS);
    selectField(root, 'Saliva', 'ohat-saliva', OH.LEVELS);
    selectField(root, 'Natural teeth', 'ohat-teeth', OH.LEVELS);
    selectField(root, 'Dentures', 'ohat-dentures', OH.LEVELS);
    selectField(root, 'Oral cleanliness', 'ohat-cleanliness', OH.LEVELS);
    selectField(root, 'Dental pain', 'ohat-pain', OH.LEVELS);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = OH.ohatOralHealth(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'OHAT', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
