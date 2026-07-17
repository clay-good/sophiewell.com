// spec-v378: renderer for the Delbet (Delbet-Colonna) classification of a pediatric femoral neck /
// proximal femur fracture (types I-IV). Group G. The clinician picks the type; the tile reports the
// type, its anatomic description, and whether it is a higher-AVN-risk (type I-II) fracture.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Delbet type; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/delbet-femoral-neck-v378.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/delbet-femoral-neck-v378.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'delbet-femoral-neck'(root) {
    note(root, 'Delbet (Delbet-Colonna) classification of a pediatric femoral neck / proximal femur fracture, by the anatomic level of the fracture line. Pick the type. I: transepiphyseal (highest AVN risk); II: transcervical (most common, high AVN risk); III: cervicotrochanteric / basicervical (lower); IV: intertrochanteric (lowest). Near-neighbors: garden-classification, pauwels-femoral-neck.');
    root.appendChild(select('Delbet type', 'delbet-type', [
      ['I', 'Type I - transepiphyseal'],
      ['II', 'Type II - transcervical'],
      ['III', 'Type III - cervicotrochanteric (basicervical)'],
      ['IV', 'Type IV - intertrochanteric'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['delbet-type'], () => safe(o, () => {
      const r = M.delbetFemoralNeck({ type: val('delbet-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
