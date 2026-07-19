// spec-v474: renderer for the Rastelli complete-AVSD classification (types A/B/C). Group G. The clinician picks
// the type; the tile reports the type and its bridging-leaflet-morphology description. As a type descriptor it
// reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Rastelli type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/rastelli-avsd-v474.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rastelli-avsd-v474.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the congenital cardiac-surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rastelli-avsd'(root) {
    note(root, 'The Rastelli classification of the complete atrioventricular septal defect (complete AV canal), by the morphology of the superior (anterior) bridging leaflet. Pick the type. A: attached by chordae to the crest of the ventricular septum (most common); B: anomalous chordal attachments to a right-ventricular papillary muscle (rarest); C: free-floating, unattached to the septum (often with tetralogy of Fallot). Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: sievers-bav.');
    root.appendChild(select('Rastelli type', 'rastelli-type', [
      ['A', 'A - attached to the ventricular septal crest (most common)'],
      ['B', 'B - anomalous attachment to an RV papillary muscle (rarest)'],
      ['C', 'C - free-floating, unattached to the septum'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['rastelli-type'], () => safe(o, () => {
      const r = M.rastelliAvsd({ type: val('rastelli-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
