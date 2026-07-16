// spec-v344: renderer for the Ficat-Arlet staging of femoral-head osteonecrosis (AVN) (stages 0-IV).
// Group G. The clinician picks the radiographic stage; the tile reports the stage, its description,
// and whether it is a post-collapse (stage III-IV) stage.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Ficat-Arlet stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/ficat-arlet-v344.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ficat-arlet-v344.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ficat-arlet'(root) {
    note(root, 'Ficat-Arlet staging (Ficat 1985; Ficat & Arlet 1980) of femoral-head osteonecrosis (avascular necrosis). Pick the stage. 0 silent (normal X-ray); I pre-radiographic (abnormal MRI); II pre-collapse (sclerosis / cysts, sphericity preserved); III collapse (crescent sign, flattening); IV secondary osteoarthritis. The pre-collapse (0-II) vs post-collapse (III-IV) split is the classic joint-preservation-vs-replacement watershed. Near-neighbors: hawkins-talar, kellgren-lawrence.');
    root.appendChild(select('Ficat-Arlet stage', 'ficat-stage', [
      ['0', '0 — silent hip (normal X-ray)'],
      ['I', 'I — pre-radiographic (abnormal MRI)'],
      ['II', 'II — pre-collapse (sclerosis / cysts, sphericity preserved)'],
      ['III', 'III — collapse (crescent sign, flattening)'],
      ['IV', 'IV — secondary osteoarthritis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ficat-stage'], () => safe(o, () => {
      const r = M.ficatArlet({ stage: val('ficat-stage') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
