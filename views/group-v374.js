// spec-v374: renderer for the Pauwels classification of a femoral neck fracture (types I-III). Group G.
// The clinician picks the type; the tile reports the type, its angle/force description, and whether it
// is a high-shear (type III) pattern.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Pauwels type; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/pauwels-femoral-neck-v374.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pauwels-femoral-neck-v374.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The fixation / osteotomy decision stays with the orthopedic surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pauwels-femoral-neck'(root) {
    note(root, 'Pauwels classification (Pauwels 1935) of a femoral neck fracture, by the angle of the fracture line from the horizontal. Pick the type. I: < 30 degrees (compression dominant, most stable); II: 30-50 degrees (shear appears); III: > 50 degrees (shear dominant, highest nonunion / AVN risk). The shear-angle counterpart to the Garden classification (displacement). Near-neighbors: garden-classification.');
    root.appendChild(select('Pauwels type', 'pauwels-type', [
      ['I', 'Type I - < 30 degrees (compression dominant)'],
      ['II', 'Type II - 30-50 degrees (shear appears)'],
      ['III', 'Type III - > 50 degrees (shear dominant, high risk)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['pauwels-type'], () => safe(o, () => {
      const r = M.pauwelsFemoralNeck({ type: val('pauwels-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
