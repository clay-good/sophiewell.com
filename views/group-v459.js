// spec-v459: renderer for the Thompson-Epstein posterior hip dislocation classification (types I-V). Group G.
// The clinician picks the type; the tile reports the type and its associated-fracture description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Thompson-Epstein type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/thompson-epstein-v459.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/thompson-epstein-v459.js';
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
  'thompson-epstein'(root) {
    note(root, 'The Thompson-Epstein classification of posterior hip dislocations, by the associated acetabular or femoral-head fracture. Pick the type. I: no or minor rim fracture; II: a single large posterior rim fracture; III: a comminuted rim fracture; IV: an acetabular rim and floor fracture; V: a femoral-head fracture. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: pipkin-femoral-head.');
    root.appendChild(select('Thompson-Epstein type', 'te-type', [
      ['I', 'I - no or minor rim fracture'],
      ['II', 'II - single large posterior rim fracture'],
      ['III', 'III - comminuted rim fracture'],
      ['IV', 'IV - acetabular rim and floor fracture'],
      ['V', 'V - femoral-head fracture'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['te-type'], () => safe(o, () => {
      const r = M.thompsonEpstein({ type: val('te-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
