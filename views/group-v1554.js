// spec-v1554: renderers for who-cotrimoxazole (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/who-cotrimoxazole-v1554.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, required) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [{ value: '', text: required ? '— choose —' : '— not entered —' }, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step: 'any', placeholder }));
  root.appendChild(wrap);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}

export const renderers = {
  'who-cotrimoxazole'(root) {
    const pairs = [['ctx-group', 'group'], ['ctx-weight', 'weight'], ['ctx-prev', 'highPrevalence'], ['ctx-tb', 'tb'], ['ctx-stage', 'advanced'], ['ctx-cd4', 'cd4']];
    selectField(root, 'Who it is for', 'ctx-group', M0.GROUP_OPTIONS, true);
    numField(root, 'Weight in kg (infants and children)', 'ctx-weight', 'e.g. 12', '150');
    selectField(root, 'High malaria or bacterial-infection setting (adults)', 'ctx-prev', M0.YES_NO, false);
    selectField(root, 'Active TB (adults)', 'ctx-tb', M0.YES_NO, false);
    selectField(root, 'WHO stage 3 or 4 (adults)', 'ctx-stage', M0.YES_NO, false);
    numField(root, 'CD4 count, cells/mm³ (adults)', 'ctx-cd4', 'e.g. 300', '3000');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.whoCotrimoxazole(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
};
