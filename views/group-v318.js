// spec-v318: renderer for the Los Angeles (LA) classification of erosive esophagitis.
// Group G. The endoscopist picks the grade (A-D); the tile reports the grade and its
// standard definition.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification grade; it never asserts a
// diagnosis or a treatment decision (lib/la-esophagitis-v318.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/la-esophagitis-v318.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'la-esophagitis'(root) {
    note(root, 'Los Angeles (LA) classification of erosive esophagitis (Lundell 1999). Pick the endoscopic grade. Grades A–B are mild (breaks not bridging fold tops); C–D are severe (bridging folds; D ≥ 75% circumference). It grades erosive disease, not non-erosive reflux or Barrett esophagus. Near-neighbors: forrest.');
    root.appendChild(select('LA grade (extent of mucosal breaks)', 'la-grade', [
      ['A', 'A — break(s) ≤ 5 mm, not between two fold tops'],
      ['B', 'B — break(s) > 5 mm, not between two fold tops'],
      ['C', 'C — break(s) between ≥ 2 fold tops, < 75% circumference'],
      ['D', 'D — break(s) ≥ 75% of the circumference'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['la-grade'], () => safe(o, () => {
      const r = M.laEsophagitis({ grade: val('la-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
