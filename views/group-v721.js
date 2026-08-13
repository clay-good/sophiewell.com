// spec-v721 §2: renderer for plaque-control-record — the Plaque Control Record (O'Leary)
// (Clinical Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two count inputs
// (teeth present, plaque-positive surfaces); a percentage maps to a hygiene band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/plaque-control-record-v721.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: max || '', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The plaque record measures oral-hygiene performance over time; it does not diagnose periodontal disease. It supports rather than replaces the clinical dental and periodontal examination.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'plaque-control-record'(root) {
    note(root, "Plaque Control Record (O'Leary 1972): percent of surfaces with plaque = (plaque-positive surfaces / total surfaces) × 100, where total = 4 × teeth present. Goal ≤ 10% (some use 20%).");
    root.appendChild(numberField('Number of teeth present', 'pcr-teeth', '32'));
    root.appendChild(numberField('Plaque-positive surfaces (4 checked per tooth)', 'pcr-surfaces', '128'));
    const ids = ['pcr-teeth', 'pcr-surfaces'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.plaqueControlRecord({ teethPresent: val('pcr-teeth'), plaqueSurfaces: val('pcr-surfaces') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Plaque', value: `${r.percent}%` },
        { label: 'Surfaces', value: `${r.totalSurfaces}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
