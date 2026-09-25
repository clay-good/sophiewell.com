// spec-v1482: renderer for cairo-recession (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as CR from '../lib/cairo-recession-v1482.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '20', step: '0.5', inputmode: 'decimal', placeholder }));
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
  'cairo-recession'(root) {
    numField(root, 'Buccal attachment loss at the recession (mm)', 'cr-buccal', 'e.g. 3');
    numField(root, 'Interproximal attachment loss (mm, 0 if none)', 'cr-inter', 'e.g. 2');
    const ids = ['cr-buccal', 'cr-inter'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CR.cairoRecession({ buccalCal: val('cr-buccal'), interproximalCal: val('cr-inter') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band }, { label: 'Cairo', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
