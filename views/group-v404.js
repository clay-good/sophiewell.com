// spec-v404: renderer for the Regan-Morrey classification of coronoid process fractures (types I/II/III).
// Group G. The clinician picks the type; the tile reports the type and its height description. As a
// fracture-type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Regan-Morrey type; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/regan-morrey-v404.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/regan-morrey-v404.js';
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
  'regan-morrey'(root) {
    note(root, 'Regan-Morrey classification of a coronoid process fracture of the ulna, by the height of the fragment. Pick the type. I: avulsion of the coronoid tip; II: 50% or less of the coronoid height; III: more than 50% of the coronoid height (each subdivided A without / B with an elbow dislocation). Near-neighbors: mason-radial-head.');
    root.appendChild(select('Regan-Morrey type', 'rm-type', [
      ['I', 'Type I - avulsion of the coronoid tip'],
      ['II', 'Type II - 50% or less of the coronoid height'],
      ['III', 'Type III - more than 50% of the coronoid height'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['rm-type'], () => safe(o, () => {
      const r = M.reganMorrey({ type: val('rm-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
