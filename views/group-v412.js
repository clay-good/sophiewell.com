// spec-v412: renderer for the Myerson classification of Lisfranc (tarsometatarsal) injuries
// (types A/B1/B2/C1/C2). Group G. The clinician picks the type; the tile reports the type and its
// incongruity/displacement description. As a fracture-type descriptor it reports the type the clinician has
// determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Myerson type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/lisfranc-myerson-v412.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lisfranc-myerson-v412.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the foot-and-ankle team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lisfranc-myerson'(root) {
    note(root, 'Myerson classification of a Lisfranc (tarsometatarsal) injury, by the pattern and direction of the tarsometatarsal incongruity. Pick the type. A: total incongruity (all five metatarsals, same direction); B1: partial, medial (first metatarsal); B2: partial, lateral (one or more of the lateral four); C1: divergent, partial; C2: divergent, total. Near-neighbors: hawkins-talar, sanders-calcaneal, lauge-hansen.');
    root.appendChild(select('Myerson type', 'lf-type', [
      ['A', 'Type A - total incongruity (all five, same direction)'],
      ['B1', 'Type B1 - partial, medial (first metatarsal)'],
      ['B2', 'Type B2 - partial, lateral (lateral four)'],
      ['C1', 'Type C1 - divergent, partial'],
      ['C2', 'Type C2 - divergent, total (all five)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lf-type'], () => safe(o, () => {
      const r = M.lisfrancMyerson({ type: val('lf-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
