// spec-v485: renderer for the Dejour trochlear dysplasia classification (types A-D). Group G. The clinician
// picks the type; the tile reports the type and its trochlear-morphology description. As a type descriptor it
// reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Dejour type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/dejour-trochlea-v485.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dejour-trochlea-v485.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'dejour-trochlea'(root) {
    note(root, 'The Dejour classification of trochlear dysplasia, by the radiographic / CT appearance of the femoral trochlea. Pick the type. A: shallow but symmetric (low-grade); B: flat or convex with a supratrochlear spur (high-grade); C: facet asymmetry (double contour) without a spur (high-grade); D: asymmetry plus a spur with a facet "cliff" (high-grade). Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: ahlback-knee-oa.');
    root.appendChild(select('Dejour type', 'dejour-type', [
      ['A', 'A - shallow but symmetric (low-grade)'],
      ['B', 'B - flat/convex with a spur (high-grade)'],
      ['C', 'C - facet asymmetry, no spur (high-grade)'],
      ['D', 'D - asymmetry plus a spur (high-grade)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['dejour-type'], () => safe(o, () => {
      const r = M.dejourTrochlea({ type: val('dejour-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
