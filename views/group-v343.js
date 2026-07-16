// spec-v343: renderer for the Sanders classification of an intra-articular calcaneal fracture (types
// I-IV). Group G. The clinician picks the CT-based fragmentation pattern; the tile reports the type,
// its description, and whether it is a more comminuted (type III-IV) pattern.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Sanders type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/sanders-calcaneal-v343.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sanders-calcaneal-v343.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The operative and management decisions stay with the surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sanders-calcaneal'(root) {
    note(root, 'Sanders classification (Sanders 1993) of an intra-articular calcaneal fracture — the CT-based grade of posterior-facet fragmentation. Pick the type. I nondisplaced (< 2 mm); II two-part (one fracture line); III three-part (two fracture lines) with a depressed middle fragment; IV four or more parts (highly comminuted). Graded on the coronal CT at the widest undersurface of the posterior facet. Near-neighbors: hawkins-talar, weber-ankle.');
    root.appendChild(select('Sanders type', 'sanders-type', [
      ['I', 'I — nondisplaced (< 2 mm)'],
      ['II', 'II — two-part (one fracture line)'],
      ['III', 'III — three-part (two fracture lines), depressed fragment'],
      ['IV', 'IV — four or more parts (highly comminuted)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sanders-type'], () => safe(o, () => {
      const r = M.sandersCalcaneal({ type: val('sanders-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
