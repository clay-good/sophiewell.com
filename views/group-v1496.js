// spec-v1496: renderer for turesky-plaque (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as TP from '../lib/turesky-plaque-v1496.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
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
  'turesky-plaque'(root) {
    const pairs = [['tqh-n0', 'n0'], ['tqh-n1', 'n1'], ['tqh-n2', 'n2'], ['tqh-n3', 'n3'], ['tqh-n4', 'n4'], ['tqh-n5', 'n5']];
    numField(root, 'Surfaces scored 0: no plaque (0 if none)', 'tqh-n0', 'e.g. 10', '200', '1');
    numField(root, 'Surfaces scored 1: flecks at the margin (0 if none)', 'tqh-n1', 'e.g. 10', '200', '1');
    numField(root, 'Surfaces scored 2: thin band at the margin (0 if none)', 'tqh-n2', 'e.g. 10', '200', '1');
    numField(root, 'Surfaces scored 3: under a third of the surface (0 if none)', 'tqh-n3', 'e.g. 10', '200', '1');
    numField(root, 'Surfaces scored 4: a third to two thirds (0 if none)', 'tqh-n4', 'e.g. 10', '200', '1');
    numField(root, 'Surfaces scored 5: two thirds or more (0 if none)', 'tqh-n5', 'e.g. 10', '200', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TP.tureskyPlaque(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TQHPI', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
