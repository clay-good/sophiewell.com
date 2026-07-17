// spec-v375: renderer for the Pipkin classification of a femoral head fracture (types I-IV). Group G.
// The clinician picks the type; the tile reports the type, its description, and whether it is a complex
// (type III-IV, associated neck/acetabular fracture) pattern.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Pipkin type; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/pipkin-femoral-head-v375.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pipkin-femoral-head-v375.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The reduction / fixation decision stays with the orthopedic surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pipkin-femoral-head'(root) {
    note(root, 'Pipkin classification (Pipkin 1957) of a femoral head fracture (typically with a posterior hip dislocation). Pick the type. I: below the fovea centralis (spares the weight-bearing surface); II: above the fovea centralis (involves the weight-bearing surface); III: type I/II plus a femoral neck fracture; IV: type I/II plus an acetabular fracture. Near-neighbors: garden-classification, pauwels-femoral-neck.');
    root.appendChild(select('Pipkin type', 'pipkin-type', [
      ['I', 'Type I - below the fovea centralis'],
      ['II', 'Type II - above the fovea centralis (weight-bearing)'],
      ['III', 'Type III - + associated femoral neck fracture'],
      ['IV', 'Type IV - + associated acetabular fracture'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['pipkin-type'], () => safe(o, () => {
      const r = M.pipkinFemoralHead({ type: val('pipkin-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
