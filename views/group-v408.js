// spec-v408: renderer for the Meyers-McKeever classification of tibial eminence fractures (types
// I/II/III/IV). Group G. The clinician picks the type; the tile reports the type and its displacement
// description. As a fracture-type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Meyers-McKeever type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/meyers-mckeever-v408.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/meyers-mckeever-v408.js';
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
  'meyers-mckeever'(root) {
    note(root, 'Meyers-McKeever classification of a tibial intercondylar-eminence fracture (the bony ACL avulsion off the tibia), by fragment displacement. Pick the type. I: minimally / non-displaced; II: anterior beak, hinged posteriorly; III: completely displaced, no bony apposition; IV: comminuted (Zaricznyj). Displaced types (III-IV) are classically more often operative.');
    root.appendChild(select('Meyers-McKeever type', 'mm-type', [
      ['I', 'Type I - minimally / non-displaced'],
      ['II', 'Type II - anterior beak, hinged posteriorly'],
      ['III', 'Type III - completely displaced, no apposition'],
      ['IV', 'Type IV - comminuted (Zaricznyj)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['mm-type'], () => safe(o, () => {
      const r = M.meyersMckeever({ type: val('mm-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
