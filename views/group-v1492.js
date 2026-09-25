// spec-v1492: renderer for bolton-ratio (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as BR from '../lib/bolton-ratio-v1492.js';
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
  'bolton-ratio'(root) {
    const pairs = [['br-max6', 'maxAnterior'], ['br-mand6', 'mandAnterior'], ['br-max12', 'maxOverall'], ['br-mand12', 'mandOverall']];
    numField(root, 'Maxillary canine to canine, sum of widths (mm)', 'br-max6', 'e.g. 47.5', '80', '0.1');
    numField(root, 'Mandibular canine to canine, sum of widths (mm)', 'br-mand6', 'e.g. 37.4', '80', '0.1');
    numField(root, 'Maxillary first molar to first molar, sum (mm)', 'br-max12', 'e.g. 96.4', '140', '0.1');
    numField(root, 'Mandibular first molar to first molar, sum (mm)', 'br-mand12', 'e.g. 88.9', '140', '0.1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BR.boltonRatio(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Bolton', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
