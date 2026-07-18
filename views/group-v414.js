// spec-v414: renderer for the Mayfield classification of progressive perilunar instability
// (stages I/II/III/IV). Group G. The clinician picks the stage; the tile reports the stage and its
// ligament-disruption description. As a staging descriptor it reports the stage the clinician has
// determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Mayfield stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/mayfield-perilunate-v414.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mayfield-perilunate-v414.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hand / orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mayfield-perilunate'(root) {
    note(root, 'Mayfield classification of progressive perilunar instability, staging a carpal ligamentous injury by how far the disruption has progressed around the lunate. Pick the stage. I: scapholunate dissociation; II: perilunate dislocation (capitolunate); III: midcarpal dislocation (lunotriquetral); IV: lunate dislocation (dorsal radiocarpal - the lunate is extruded volarly). Each stage adds the prior disruptions.');
    root.appendChild(select('Mayfield stage', 'mf-stage', [
      ['I', 'Stage I - scapholunate dissociation'],
      ['II', 'Stage II - perilunate dislocation (capitolunate)'],
      ['III', 'Stage III - midcarpal dislocation (lunotriquetral)'],
      ['IV', 'Stage IV - lunate dislocation (volar)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['mf-stage'], () => safe(o, () => {
      const r = M.mayfieldPerilunate({ stage: val('mf-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
