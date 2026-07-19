// spec-v458: renderer for the Boyd-Griffin trochanteric fracture classification (types I-IV). Group G. The
// clinician picks the type; the tile reports the type and its fracture-line description. As a type descriptor
// it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Boyd-Griffin type; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/boyd-griffin-v458.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/boyd-griffin-v458.js';
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
  'boyd-griffin'(root) {
    note(root, 'The Boyd-Griffin classification of trochanteric (intertrochanteric) femur fractures, by fracture line and comminution. Pick the type. I: simple intertrochanteric, undisplaced; II: comminuted intertrochanteric with secondary cortical lines; III: essentially subtrochanteric; IV: trochanteric region plus proximal shaft in at least two planes. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: seinsheimer-subtroch.');
    root.appendChild(select('Boyd-Griffin type', 'boyd-type', [
      ['I', 'I - simple intertrochanteric, undisplaced'],
      ['II', 'II - comminuted intertrochanteric'],
      ['III', 'III - essentially subtrochanteric'],
      ['IV', 'IV - trochanteric region plus proximal shaft'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['boyd-type'], () => safe(o, () => {
      const r = M.boydGriffin({ type: val('boyd-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
