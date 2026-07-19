// spec-v430: renderer for the Papile grade of germinal matrix / IVH (grades I-IV). Group G. The clinician
// picks the grade; the tile reports the grade and its imaging description. As an imaging-grade descriptor it
// reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Papile grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/papile-ivh-v430.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/papile-ivh-v430.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neonatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'papile-ivh'(root) {
    note(root, 'The Papile grading of germinal matrix / intraventricular hemorrhage (IVH) in the preterm newborn, by the extent of hemorrhage on cranial imaging. Pick the grade. I: confined to the germinal matrix (subependymal); II: IVH without ventricular dilatation; III: IVH with ventricular dilatation; IV: IVH with parenchymal extension. Reports the original four-grade scheme, not a diagnosis or a treatment decision. Near-neighbor: sarnat-hie.');
    root.appendChild(select('Papile grade', 'papile-grade', [
      ['I', 'I - germinal matrix (subependymal) only'],
      ['II', 'II - IVH without ventricular dilatation'],
      ['III', 'III - IVH with ventricular dilatation'],
      ['IV', 'IV - IVH with parenchymal extension'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['papile-grade'], () => safe(o, () => {
      const r = M.papileIvh({ grade: val('papile-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
