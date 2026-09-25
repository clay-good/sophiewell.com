// spec-v1413: renderer for nasal-o2-fio2 (Clinical Math & Conversions, Group E).

import { el, clear } from '../lib/dom.js';
import * as NF from '../lib/nasal-o2-fio2-v1413.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
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
  'nasal-o2-fio2'(root) {
    numField(root, 'Oxygen flow by nasal cannula (L/min)', 'nof-flow', 'e.g. 3');
    const o = out(); root.appendChild(o);
    wire(['nof-flow'], () => safe(o, () => {
      const r = NF.nasalO2Fio2({ flowLpm: val('nof-flow') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Estimated FiO2', value: r.bandLabel },
      ]);
      for (const n of r.notes) note(o, n);
      note(o, r.note);
    }));
  },
};
