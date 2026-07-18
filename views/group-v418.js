// spec-v418: renderer for the Milch classification of lateral humeral condyle fractures (types I/II).
// Group G. The clinician picks the type; the tile reports the type and its groove/stability description. As
// a fracture-type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Milch type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/milch-condyle-v418.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/milch-condyle-v418.js';
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
  'milch-condyle'(root) {
    note(root, 'Milch classification of a lateral humeral condyle fracture (a common pediatric elbow injury), by whether the fracture line reaches the trochlear groove and involves the lateral trochlear ridge. Pick the type. I: lateral to the groove, ridge intact (elbow stable); II: into the groove, ridge involved (elbow unstable, the forearm can translate laterally). Near-neighbors: mason-radial-head, regan-morrey.');
    root.appendChild(select('Milch type', 'mi-type', [
      ['I', 'Type I - lateral to the groove, ridge intact (stable)'],
      ['II', 'Type II - into the groove, ridge involved (unstable)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['mi-type'], () => safe(o, () => {
      const r = M.milchCondyle({ type: val('mi-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
