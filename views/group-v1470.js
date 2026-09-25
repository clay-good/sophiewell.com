// spec-v1470: renderer for lateral-center-edge-angle (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as LC from '../lib/lateral-center-edge-angle-v1470.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', {
    id, type: 'number', step: '0.5', min: String(LC.LCEA_MIN), max: String(LC.LCEA_MAX), inputmode: 'decimal', placeholder,
  }));
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
  'lateral-center-edge-angle'(root) {
    numField(root, 'Lateral center-edge angle on an AP pelvic radiograph (degrees)', 'lcea-angle', 'e.g. 22');
    const ids = ['lcea-angle'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = LC.lateralCenterEdgeAngle({ angle: val('lcea-angle') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Reading', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
