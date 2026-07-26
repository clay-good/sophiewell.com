// spec-v454: renderer for the Bado Monteggia fracture classification (types I-IV). Group G. The clinician
// picks the type; the tile reports the type and its dislocation/fracture description. As a type descriptor it
// reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Bado type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/bado-v454.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bado-v454.js';
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
  'bado'(root) {
    note(root, 'The Bado classification of Monteggia fractures, by the direction of radial-head dislocation and the ulnar fracture. Pick the type. I: anterior dislocation, anterior ulnar angulation (most common); II: posterior dislocation, posterior ulnar angulation; III: lateral dislocation with an ulnar metaphyseal fracture; IV: anterior dislocation with both-bone proximal-third fractures. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: mason-radial-head.');
    root.appendChild(select('Bado type', 'bado-type', [
      ['I', 'I - anterior radial-head dislocation'],
      ['II', 'II - posterior radial-head dislocation'],
      ['III', 'III - lateral dislocation, ulnar metaphysis'],
      ['IV', 'IV - anterior dislocation, both-bone fracture'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bado-type'], () => safe(o, () => {
      const r = M.bado({ type: val('bado-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
