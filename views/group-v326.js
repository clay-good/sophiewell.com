// spec-v326: renderer for the ACR O-RADS US v2022 risk categories.
// Group G. The radiologist picks the risk category; the tile reports the descriptor, the
// risk-of-malignancy band, and a general management direction.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the risk category; it never asserts a diagnosis or an
// order (lib/o-rads-v326.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/o-rads-v326.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'o-rads'(root) {
    note(root, 'ACR O-RADS US v2022 risk categories (ovarian-adnexal ultrasound). Pick the risk category. 1–2 are normal or almost certainly benign; 3 low risk; 4 intermediate; 5 high risk. Management is guidance modified by symptoms and history. Near-neighbors: bi-rads.');
    root.appendChild(select('O-RADS risk category', 'orads-cat', [
      ['0', '0 — incomplete evaluation'],
      ['1', '1 — normal premenopausal ovary (0%)'],
      ['2', '2 — almost certainly benign (under 1%)'],
      ['3', '3 — low risk (1% to under 10%)'],
      ['4', '4 — intermediate risk (10% to under 50%)'],
      ['5', '5 — high risk (50% or more)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['orads-cat'], () => safe(o, () => {
      const r = M.oRads({ category: val('orads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: `${r.category}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
