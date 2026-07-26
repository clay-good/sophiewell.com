// spec-v490: renderer for the Ruedi-Allgower pilon fracture classification (types I-III). Group G. The
// clinician picks the type; the tile reports the type and its displacement/comminution description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Ruedi-Allgower type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/ruedi-allgower-pilon-v490.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ruedi-allgower-pilon-v490.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic-trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ruedi-allgower-pilon'(root) {
    note(root, 'The Ruedi-Allgower classification of tibial pilon (plafond) fractures, by the displacement and comminution of the distal tibial articular surface. Pick the type. I: nondisplaced cleavage fracture; II: significant displacement with minimal comminution; III: comminution and impaction of the articular surface. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: lauge-hansen.');
    root.appendChild(select('Ruedi-Allgower type', 'ruedi-type', [
      ['I', 'I - nondisplaced cleavage fracture'],
      ['II', 'II - displaced, minimal comminution'],
      ['III', 'III - comminuted and impacted'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ruedi-type'], () => safe(o, () => {
      const r = M.ruediAllgowerPilon({ type: val('ruedi-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
