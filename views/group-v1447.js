// spec-v1447: renderer for cpak (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as CP from '../lib/cpak-v1447.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal', placeholder }));
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
  cpak(root) {
    note(root, 'From a long-leg standing radiograph, both angles in degrees.');
    numField(root, 'Medial proximal tibial angle, MPTA (degrees)', 'cpak-mpta', 'e.g. 87');
    numField(root, 'Lateral distal femoral angle, LDFA (degrees)', 'cpak-ldfa', 'e.g. 89');
    const o = out(); root.appendChild(o);
    wire(['cpak-mpta', 'cpak-ldfa'], () => safe(o, () => {
      const r = CP.cpak({ mpta: val('cpak-mpta'), ldfa: val('cpak-ldfa') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'CPAK', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
