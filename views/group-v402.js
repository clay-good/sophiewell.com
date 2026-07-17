// spec-v402: renderer for the Lauge-Hansen classification of rotational ankle fractures (SA/SER/PAB/PER/PD).
// Group G. The clinician picks the mechanism; the tile reports the mechanism and its injury-sequence
// description. As a mechanism descriptor it does not flag any pattern as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Lauge-Hansen mechanism; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/lauge-hansen-v402.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lauge-hansen-v402.js';
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
  'lauge-hansen'(root) {
    note(root, 'Lauge-Hansen classification of a rotational ankle fracture, by mechanism (foot position + deforming force) - the mechanistic companion to the anatomic Danis-Weber classification. Pick the mechanism. SA: supination-adduction; SER: supination-external-rotation (most common, Weber B); PAB: pronation-abduction (Weber C); PER: pronation-external-rotation (Weber C); PD: pronation-dorsiflexion (pilon-type). Near-neighbors: weber-ankle.');
    root.appendChild(select('Lauge-Hansen mechanism', 'lh-mech', [
      ['SA', 'SA - supination-adduction'],
      ['SER', 'SER - supination-external-rotation (most common)'],
      ['PAB', 'PAB - pronation-abduction'],
      ['PER', 'PER - pronation-external-rotation'],
      ['PD', 'PD - pronation-dorsiflexion'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lh-mech'], () => safe(o, () => {
      const r = M.laugeHansen({ mechanism: val('lh-mech') });
      resultRow(o, [
        { text: r.band },
        { label: 'Mechanism', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
