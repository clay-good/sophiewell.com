// spec-v483: renderer for the Vancouver periprosthetic femoral fracture classification (types AG/AL/B1/B2/B3/C).
// Group G. The clinician picks the type; the tile reports the type and its location / stem-stability / bone-
// stock description. As a type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Vancouver type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/vancouver-periprosthetic-v483.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vancouver-periprosthetic-v483.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic-trauma / arthroplasty team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vancouver-periprosthetic'(root) {
    note(root, 'The Vancouver classification of periprosthetic femoral fractures after hip replacement, by location, stem stability, and bone stock. Pick the type. AG/AL: trochanteric (greater/lesser); B1: around the stem, stem well-fixed; B2: around the stem, stem loose, adequate bone; B3: around the stem, stem loose, deficient bone; C: well below the stem tip. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: seinsheimer-subtroch.');
    root.appendChild(select('Vancouver type', 'vancouver-type', [
      ['AG', 'AG - greater trochanter'],
      ['AL', 'AL - lesser trochanter'],
      ['B1', 'B1 - around the stem, stem well-fixed'],
      ['B2', 'B2 - around the stem, stem loose, adequate bone'],
      ['B3', 'B3 - around the stem, stem loose, deficient bone'],
      ['C', 'C - well below the stem tip'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['vancouver-type'], () => safe(o, () => {
      const r = M.vancouverPeriprosthetic({ type: val('vancouver-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
