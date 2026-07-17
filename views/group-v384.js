// spec-v384: renderer for the Spetzler-Ponce classification of a cerebral AVM (Classes A/B/C). Group G.
// The clinician picks the class (or the underlying Spetzler-Martin grade); the tile reports the class,
// its SM-grade grouping and surgical-risk level, and whether it is the highest-risk (Class C) group.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Spetzler-Ponce class; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/spetzler-ponce-v384.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/spetzler-ponce-v384.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgical / neurovascular team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'spetzler-ponce'(root) {
    note(root, 'Spetzler-Ponce classification of a cerebral AVM - a 3-tier simplification of the Spetzler-Martin grade. Pick the class. A: Spetzler-Martin grade I-II (lowest surgical risk); B: grade III (intermediate); C: grade IV-V (highest surgical risk). Near-neighbors: spetzler-martin.');
    root.appendChild(select('Spetzler-Ponce class', 'sp-class', [
      ['A', 'Class A - Spetzler-Martin grade I-II'],
      ['B', 'Class B - Spetzler-Martin grade III'],
      ['C', 'Class C - Spetzler-Martin grade IV-V'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sp-class'], () => safe(o, () => {
      const r = M.spetzlerPonce({ class: val('sp-class') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.bandLabel },
        { label: 'Spetzler-Martin grades', value: r.spetzlerMartinGrades },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
