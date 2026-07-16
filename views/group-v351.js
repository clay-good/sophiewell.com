// spec-v351: renderer for the Goligher classification of internal hemorrhoids (grades I-IV). Group G.
// The clinician picks the prolapse grade; the tile reports the grade, its description, and whether it
// is an advanced (grade III-IV) grade.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Goligher grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/goligher-hemorrhoids-v351.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/goligher-hemorrhoids-v351.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the colorectal / general surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'goligher-hemorrhoids'(root) {
    note(root, 'Goligher classification of internal hemorrhoids. Pick the prolapse grade. I: bleed, no prolapse; II: prolapse on straining, reduces spontaneously; III: prolapse, requires manual reduction; IV: irreducible / permanently prolapsed. Near-neighbors: forrest, rockall.');
    root.appendChild(select('Goligher grade', 'goligher-grade', [
      ['I', 'Grade I - bleed, no prolapse'],
      ['II', 'Grade II - prolapse on straining, reduces spontaneously'],
      ['III', 'Grade III - prolapse, requires manual reduction'],
      ['IV', 'Grade IV - irreducible / permanently prolapsed'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['goligher-grade'], () => safe(o, () => {
      const r = M.goligherHemorrhoids({ grade: val('goligher-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
