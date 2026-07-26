// spec-v452: renderer for the Brooker heterotopic ossification classification (classes I-IV). Group G. The
// clinician picks the class; the tile reports the class and its radiographic description. As a class
// descriptor it reports the class the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Brooker class; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/brooker-v452.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/brooker-v452.js';
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
  'brooker'(root) {
    note(root, 'The Brooker classification of heterotopic (ectopic) ossification about the hip, by the radiographic extent of ectopic bone. Pick the class. I: islands of bone in soft tissue; II: spurs leaving at least 1 cm between opposing surfaces; III: spurs reducing the gap to less than 1 cm; IV: apparent bony ankylosis. Reports the class the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: outerbridge-cartilage.');
    root.appendChild(select('Brooker class', 'brooker-class', [
      ['I', 'I - islands of bone in soft tissue'],
      ['II', 'II - spurs, >= 1 cm gap between surfaces'],
      ['III', 'III - spurs, < 1 cm gap between surfaces'],
      ['IV', 'IV - apparent bony ankylosis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['brooker-class'], () => safe(o, () => {
      const r = M.brooker({ cls: val('brooker-class') });
      resultRow(o, [
        { text: r.band },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
