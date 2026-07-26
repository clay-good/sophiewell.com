// spec-v461: renderer for the DeBakey aortic dissection classification (types I / II / IIIa / IIIb). Group G.
// The clinician picks the type; the tile reports the type and its origin / extent description. As a type
// descriptor it reports the type the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the DeBakey type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/debakey-v461.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/debakey-v461.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the cardiac-surgery / vascular team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'debakey'(root) {
    note(root, 'The DeBakey classification of aortic dissection, by the site of origin and the extent of the flap. Pick the type. I: ascending aorta, extending through the arch into the descending (and often abdominal) aorta; II: confined to the ascending aorta; IIIa: descending thoracic aorta, limited above the diaphragm; IIIb: descending thoracic aorta, extending below the diaphragm. Types I and II are Stanford A; type III is Stanford B. Reports the type the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: add-rs.');
    root.appendChild(select('DeBakey type', 'debakey-type', [
      ['I', 'I - ascending + arch + descending'],
      ['II', 'II - confined to the ascending aorta'],
      ['IIIa', 'IIIa - descending, above the diaphragm'],
      ['IIIb', 'IIIb - descending, below the diaphragm'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['debakey-type'], () => safe(o, () => {
      const r = M.debakey({ type: val('debakey-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
