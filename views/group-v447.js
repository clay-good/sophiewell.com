// spec-v447: renderer for the Anderson-Montesano occipital condyle fracture classification (types I-III).
// Group G. The clinician picks the type; the tile reports the type and its morphology description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Anderson-Montesano type; it never asserts a diagnosis, a stability
// determination, a treatment decision, or a prognosis (lib/anderson-montesano-v447.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/anderson-montesano-v447.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the spine / neurosurgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'anderson-montesano'(root) {
    note(root, 'The Anderson-Montesano classification of occipital condyle fractures, by fracture morphology and mechanism. Pick the type. I: impacted/comminuted from axial load (typically stable); II: extending from a basioccipital / skull-base fracture (usually stable); III: alar-ligament avulsion (potentially unstable). Stability is judged with the full clinical and imaging picture. Reports the type the clinician has determined, not a diagnosis or a stability determination. Near-neighbor: levine-edwards.');
    root.appendChild(select('Anderson-Montesano type', 'am-type', [
      ['I', 'I - impacted/comminuted (axial load), typically stable'],
      ['II', 'II - extending from a basioccipital/skull-base fracture'],
      ['III', 'III - alar-ligament avulsion, potentially unstable'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['am-type'], () => safe(o, () => {
      const r = M.andersonMontesano({ type: val('am-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
