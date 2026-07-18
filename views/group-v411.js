// spec-v411: renderer for the Levine-Edwards classification of hangman's fractures (types I/II/IIa/III).
// Group G. The clinician picks the type; the tile reports the type and its displacement/angulation
// description. As a fracture-type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Levine-Edwards type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/levine-edwards-v411.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/levine-edwards-v411.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the spine team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'levine-edwards'(root) {
    note(root, 'Levine-Edwards classification of a hangman\'s fracture (traumatic spondylolisthesis of the axis), by translation and angulation. Pick the type. I: <3 mm translation, no angulation (stable); II: >3 mm translation with angulation (unstable); IIa: minimal translation but severe angulation (flexion - traction contraindicated); III: type I plus bilateral C2-C3 facet dislocation. Near-neighbors: anderson-dalonzo.');
    root.appendChild(select('Levine-Edwards type', 'le-type', [
      ['I', 'Type I - <3 mm translation, no angulation (stable)'],
      ['II', 'Type II - >3 mm translation with angulation (unstable)'],
      ['IIa', 'Type IIa - severe angulation, minimal translation (no traction)'],
      ['III', 'Type III - plus bilateral C2-C3 facet dislocation'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['le-type'], () => safe(o, () => {
      const r = M.levineEdwards({ type: val('le-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
