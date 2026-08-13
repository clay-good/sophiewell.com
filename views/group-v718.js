// spec-v718 §2: renderer for ellis-tooth-fracture — the Ellis dental-fracture classification
// (Clinical Scoring & Risk, Group G). Dentistry / emergency-medicine vein (dental trauma).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One select (deepest
// tissue layer); decision logic returns the Ellis class and management urgency.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ellis-tooth-fracture-v718.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Ellis class guides the urgency of a traumatic crown fracture, not the definitive treatment. It supports rather than replaces dental evaluation and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const LAYER = [
  ['enamel', 'Enamel only (rough edge, non-tender)'],
  ['dentin', 'Enamel + dentin (yellow dentin, sensitive to hot/cold/air)'],
  ['pulp', 'Enamel + dentin + pulp (pink/red or bleeding center)'],
];

export const renderers = {
  'ellis-tooth-fracture'(root) {
    note(root, 'Ellis classification (dental trauma): grades a traumatic crown fracture by the deepest tissue involved. Class I enamel only; Class II enamel + dentin; Class III pulp exposed (dental emergency).');
    root.appendChild(selectField('Deepest tissue layer involved', 'ellis-layer', CHOICE(LAYER)));
    const ids = ['ellis-layer'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ellisToothFracture({ deepestLayer: val('ellis-layer') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.ellisClass },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
