// spec-v341: renderer for the Mason-Johnston classification of a radial head fracture (types I-IV).
// Group G. The clinician picks the fracture pattern; the tile reports the type, its description, and
// whether it is a more severe (type III-IV) pattern.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Mason type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/mason-radial-head-v341.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mason-radial-head-v341.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The operative and management decisions stay with the surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mason-radial-head'(root) {
    note(root, 'Mason-Johnston classification (Mason 1954; type IV added Johnston 1962) of a radial head fracture — the fracture pattern. Pick the type. I nondisplaced (< 2 mm), no block; II displaced (> 2 mm) partial-articular, may block motion; III comminuted whole head; IV with an associated elbow dislocation. The management shorthand is the classically taught association, not an order. Near-neighbors: neer-classification, garden-classification.');
    root.appendChild(select('Mason type', 'mason-type', [
      ['I', 'I — nondisplaced / minimally displaced (< 2 mm), no block'],
      ['II', 'II — displaced (> 2 mm) partial-articular, may block motion'],
      ['III', 'III — comminuted, entire radial head'],
      ['IV', 'IV — with an associated elbow dislocation (Johnston)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['mason-type'], () => safe(o, () => {
      const r = M.masonRadialHead({ type: val('mason-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
