// spec-v469: renderer for the Steinbrocker RA functional classification (classes I-IV). Group G. The clinician
// picks the class; the tile reports the class and its functional-capacity description. As a class descriptor it
// reports the class the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Steinbrocker class; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/steinbrocker-ra-v469.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/steinbrocker-ra-v469.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the rheumatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'steinbrocker-ra'(root) {
    note(root, 'The Steinbrocker functional classification of rheumatoid arthritis, by global functional capacity. Pick the class. I: complete capacity, all usual duties; II: adequate for normal activities despite discomfort or limited joint mobility; III: adequate for little or none of the usual occupation or self-care; IV: largely or wholly incapacitated (bedridden or wheelchair-bound). The ACR revised the wording in 1991. Reports the class the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: das28.');
    root.appendChild(select('Steinbrocker class', 'steinbrocker-class', [
      ['I', 'I - complete capacity, all usual duties'],
      ['II', 'II - adequate despite discomfort / limited mobility'],
      ['III', 'III - limited occupation or self-care'],
      ['IV', 'IV - largely or wholly incapacitated'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['steinbrocker-class'], () => safe(o, () => {
      const r = M.steinbrockerRa({ cls: val('steinbrocker-class') });
      resultRow(o, [
        { text: r.band },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
