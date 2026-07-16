// spec-v350: renderer for the Oestern-Tscherne classification of a closed-fracture soft-tissue injury
// (grades 0-III / C0-C3). Group G. The clinician picks the soft-tissue grade; the tile reports the
// grade, its description, and whether it is a higher-energy (grade II-III) injury.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Tscherne grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/tscherne-closed-v350.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tscherne-closed-v350.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / trauma surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'tscherne-closed'(root) {
    note(root, 'Oestern-Tscherne classification (Tscherne & Oestern 1982) of a closed-fracture soft-tissue injury. Pick the grade. 0/C0 little or no injury (low-energy); I/C1 superficial abrasion / contusion; II/C2 deep contaminated abrasion, local contusion, impending compartment syndrome; III/C3 extensive crush, degloving, overt compartment syndrome, or major vascular injury. The closed-fracture counterpart to Gustilo-Anderson (open fractures). Near-neighbors: gustilo-anderson.');
    root.appendChild(select('Tscherne grade', 'tscherne-grade', [
      ['0', 'Grade 0 (C0) - little or no soft-tissue injury'],
      ['I', 'Grade I (C1) - superficial abrasion / contusion'],
      ['II', 'Grade II (C2) - deep abrasion, contusion, impending compartment syndrome'],
      ['III', 'Grade III (C3) - crush, degloving, overt compartment syndrome, or vascular injury'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['tscherne-grade'], () => safe(o, () => {
      const r = M.tscherneClosed({ grade: val('tscherne-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
