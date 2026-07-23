// spec-v499: renderer for the Dorr classification of proximal femoral morphology (types A, B, C). Group G.
// The clinician picks the type; the tile reports the type and its cortical / canal description. As a
// morphologic descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Dorr type; it never asserts a diagnosis, a bone-quality diagnosis,
// or a cemented-versus-cementless stem recommendation (lib/dorr-femur-v499.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dorr-femur-v499.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The implant decision stays with the arthroplasty surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'dorr-femur'(root) {
    note(root, 'The Dorr classification of proximal femoral bone morphology on a plain radiograph, from the cortical thickness and the canal-to-calcar ratio. Pick the type. A: the champagne-flute femur, thick cortices and a narrow canal (ratio below 0.5); B: intermediate (ratio 0.5 to 0.75); C: the stovepipe femur, thin cortices and a wide canal (ratio above 0.75). Reports the morphologic type the clinician has determined, not a bone-quality diagnosis or a stem recommendation. Near-neighbors: barrack-cement, vancouver-periprosthetic.');
    root.appendChild(select('Dorr type', 'dorr-type', [
      ['A', 'A - champagne flute (thick cortices, narrow canal)'],
      ['B', 'B - intermediate'],
      ['C', 'C - stovepipe (thin cortices, wide canal)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['dorr-type'], () => safe(o, () => {
      const r = M.dorrFemur({ type: val('dorr-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
