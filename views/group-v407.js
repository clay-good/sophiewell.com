// spec-v407: renderer for the Steinberg staging of femoral-head osteonecrosis (stages 0/I/II/III/IV/V/VI).
// Group G. The clinician picks the stage; the tile reports the stage and its radiographic description. As a
// staging descriptor it reports the stage the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Steinberg stage; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/steinberg-avn-v407.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/steinberg-avn-v407.js';
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
  'steinberg-avn'(root) {
    note(root, 'Steinberg (University of Pennsylvania) staging of femoral-head osteonecrosis (AVN), by imaging. Pick the stage. 0: normal imaging; I: normal XR, abnormal MRI; II: cystic/sclerotic; III: subchondral collapse (crescent) without flattening; IV: flattening; V: joint narrowing / acetabular changes; VI: degenerative. Stages I-V are quantified A (<15%) / B (15-30%) / C (>30%) by extent. Near-neighbors: ficat-arlet.');
    root.appendChild(select('Steinberg stage', 'stb-stage', [
      ['0', 'Stage 0 - normal imaging (at-risk hip)'],
      ['I', 'Stage I - normal XR, abnormal MRI / bone scan'],
      ['II', 'Stage II - cystic / sclerotic changes'],
      ['III', 'Stage III - subchondral collapse (crescent), no flattening'],
      ['IV', 'Stage IV - flattening of the femoral head'],
      ['V', 'Stage V - joint narrowing / acetabular changes'],
      ['VI', 'Stage VI - advanced degenerative changes'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['stb-stage'], () => safe(o, () => {
      const r = M.steinbergAvn({ stage: val('stb-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
