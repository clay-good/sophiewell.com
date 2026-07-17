// spec-v382: renderer for the (modified) Eichenholtz classification of Charcot neuroarthropathy (stages
// 0-3). Group G. The clinician picks the stage; the tile reports the stage, its temporal/radiographic
// description, and whether it is one of the acutely-active (stage 0-1) phases.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Eichenholtz stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/eichenholtz-charcot-v382.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/eichenholtz-charcot-v382.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'eichenholtz-charcot'(root) {
    note(root, '(Modified) Eichenholtz classification of Charcot neuroarthropathy, by temporal and radiographic findings. Pick the stage. 0: prodromal / pre-radiographic (warm, swollen; normal radiographs); 1: development / fragmentation (inflammation + fragmentation, subluxation); 2: coalescence (debris absorption, sclerosis); 3: reconstruction / consolidation (remodeling, stable deformity). Stages 0-1 are the acutely-active, at-risk phase. Near-neighbors: wagner-dfu.');
    root.appendChild(select('Eichenholtz stage', 'eich-stage', [
      ['0', 'Stage 0 - prodromal / pre-radiographic'],
      ['1', 'Stage 1 - development / fragmentation'],
      ['2', 'Stage 2 - coalescence'],
      ['3', 'Stage 3 - reconstruction / consolidation'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['eich-stage'], () => safe(o, () => {
      const r = M.eichenholtzCharcot({ stage: val('eich-stage') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
