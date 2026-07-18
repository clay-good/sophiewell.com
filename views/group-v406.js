// spec-v406: renderer for the Le Fort classification of midface fractures (types I/II/III). Group G. The
// clinician picks the type; the tile reports the type and its fracture-level description. As a
// fracture-type descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Le Fort type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/le-fort-v406.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/le-fort-v406.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the maxillofacial / trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'le-fort'(root) {
    note(root, 'Le Fort classification of a midface (maxillary) fracture, by the level of the transverse fracture plane (all three pass through the pterygoid plates). Pick the type. I: horizontal floating palate (Guerin); II: pyramidal floating maxilla; III: craniofacial disjunction (floating face). Patterns are often mixed or asymmetric.');
    root.appendChild(select('Le Fort type', 'lf-type', [
      ['I', 'Le Fort I - horizontal (floating palate)'],
      ['II', 'Le Fort II - pyramidal (floating maxilla)'],
      ['III', 'Le Fort III - craniofacial disjunction (floating face)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lf-type'], () => safe(o, () => {
      const r = M.leFort({ type: val('lf-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
