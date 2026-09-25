// spec-v1469: renderer for blackburne-peel (Clinical Scoring & Risk, Group G). A patellar-height
// ratio beside the Caton-Deschamps index and the Insall-Salvati ratio.

import { el, clear } from '../lib/dom.js';
import * as BP from '../lib/blackburne-peel-v1469.js';
import { resultRow } from '../lib/result-copy.js';

// min/max mirror the library's bounds (A 0-80 mm, B 10-80 mm).
function numField(root, label, id, min, max, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '0.1', min, max, inputmode: 'decimal', placeholder }));
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
  'blackburne-peel'(root) {
    numField(root, 'Distance A (inferior patellar articular surface to the tibial plateau line, mm)', 'bp-a', '0', '80', 'e.g. 24');
    numField(root, 'Length B (patellar articular surface, mm)', 'bp-b', '10', '80', 'e.g. 30');
    const ids = ['bp-a', 'bp-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = BP.blackburnePeel({ distanceA: val('bp-a'), lengthB: val('bp-b') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Blackburne-Peel index', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
