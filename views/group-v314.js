// spec-v314: renderer for the Deauville 5-point score (FDG-PET metabolic response in
// lymphoma). Group G. The clinician picks the 5-point uptake score; the tile reports
// the score, its uptake description, and the standard Lugano interpretation.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the classification score; it never asserts a
// treatment decision (lib/deauville-v314.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/deauville-v314.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The response assessment and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'deauville-score'(root) {
    note(root, 'Deauville 5-point score (Lugano classification): FDG-PET response assessment in lymphoma. Pick the uptake score (1–5). Scores 1–2 are negative (complete metabolic response); 4–5 are positive; 3 is read in the clinical context. Near-neighbors: ann-arbor.');
    root.appendChild(select('Deauville score (uptake vs reference regions)', 'deauville-score-in', [
      ['1', '1 — no uptake above background'],
      ['2', '2 — uptake ≤ mediastinum'],
      ['3', '3 — uptake > mediastinum but ≤ liver'],
      ['4', '4 — uptake moderately > liver at any site'],
      ['5', '5 — uptake markedly > liver, and/or new lesions'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['deauville-score-in'], () => safe(o, () => {
      const r = M.deauvilleScore({ score: val('deauville-score-in') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
