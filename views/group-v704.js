// spec-v704 §2: renderer for caton-deschamps — the Caton-Deschamps patellar-height index
// (Clinical Scoring & Risk, Group G). Companion to the Insall-Salvati ratio.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two number inputs
// (distance A and length B); a ratio returns the index.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/caton-deschamps-v704.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '0.1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Caton-Deschamps index is a radiographic measurement of patellar height; it supports rather than replaces the full clinical and imaging assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'caton-deschamps'(root) {
    note(root, 'Caton-Deschamps index (Caton 1982): patellar height on a lateral knee radiograph at ~30° flexion. Index = A / B (A = inferior patellar articular surface to anterosuperior tibial plateau; B = patellar articular surface length). Normal ~0.6–1.2; < 0.6 patella baja; > 1.2 patella alta.');
    root.appendChild(numberField('Distance A (inferior articular surface to tibial plateau, mm)', 'cd-a', '0.1'));
    root.appendChild(numberField('Length B (patellar articular surface, mm)', 'cd-b', '0.1'));
    const ids = ['cd-a', 'cd-b'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.catonDeschamps({ distanceA: val('cd-a'), lengthB: val('cd-b') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Index', value: `${r.index}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
