// spec-v482: renderer for the Russell-Taylor subtrochanteric fracture classification (types IA/IB/IIA/IIB).
// Group G. The clinician picks the type; the tile reports the type and its piriformis-fossa / lesser-trochanter
// description. As a type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Russell-Taylor type; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/russell-taylor-subtroch-v482.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/russell-taylor-subtroch-v482.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic-trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'russell-taylor-subtroch'(root) {
    note(root, 'The Russell-Taylor classification of subtrochanteric femur fractures, by whether the fracture involves the piriformis fossa (type I intact, type II involved) and whether the lesser trochanter is attached (A) or detached (B). Devised to guide intramedullary nail selection. Pick the type. IA: piriformis intact, lesser trochanter attached; IB: piriformis intact, lesser trochanter detached; IIA: piriformis involved, lesser trochanter attached; IIB: piriformis involved, lesser trochanter detached. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: seinsheimer-subtroch.');
    root.appendChild(select('Russell-Taylor type', 'rt-type', [
      ['IA', 'IA - piriformis intact, lesser trochanter attached'],
      ['IB', 'IB - piriformis intact, lesser trochanter detached'],
      ['IIA', 'IIA - piriformis involved, lesser trochanter attached'],
      ['IIB', 'IIB - piriformis involved, lesser trochanter detached'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['rt-type'], () => safe(o, () => {
      const r = M.russellTaylorSubtroch({ type: val('rt-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
