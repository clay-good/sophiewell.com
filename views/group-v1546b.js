// spec-v1546b: renderers for imci-oral-drug-bands (Group F); imci-prereferral-injectables (Group F); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/imci-oral-drug-bands-v1546.js';
import * as M1 from '../lib/imci-prereferral-injectables-v1546.js';
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
  'imci-oral-drug-bands'(root) {
    const pairs = [['iod-drug', 'drug'], ['iod-weight', 'weight'], ['iod-age', 'age'], ['iod-zinc', 'edition'], ['iod-rutf', 'rutf']];
    selectField(root, 'Drug', 'iod-drug', M0.DRUG_OPTIONS, true);
    numField(root, 'Weight in kg (preferred)', 'iod-weight', 'e.g. 12', '60');
    numField(root, 'Age in months', 'iod-age', 'e.g. 18', '120');
    selectField(root, 'Zinc: edition', 'iod-zinc', M0.ZINC_OPTIONS, false);
    selectField(root, 'Iron: child on RUTF', 'iod-rutf', M0.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.imciOralDrugBands(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'IMCI 2014', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'imci-prereferral-injectables'(root) {
    const pairs = [['ipi-drug', 'drug'], ['ipi-weight', 'weight'], ['ipi-age', 'age']];
    selectField(root, 'Drug', 'ipi-drug', M1.DRUG_OPTIONS, true);
    numField(root, 'Weight in kg (preferred)', 'ipi-weight', 'e.g. 8', '60');
    numField(root, 'Age in months', 'ipi-age', 'e.g. 9', '120');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.imciPrereferralInjectables(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'IMCI 2014', value: r.bandLabel }]);
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
