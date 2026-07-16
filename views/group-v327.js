// spec-v327: renderer for the ACR LI-RADS v2018 CT/MRI diagnostic categories.
// Group G. The radiologist picks the diagnostic category; the tile reports the descriptor
// and a general management direction.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the diagnostic category; it never asserts a diagnosis
// or an order (lib/li-rads-v327.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/li-rads-v327.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The workup and treatment stay with the multidisciplinary team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'li-rads'(root) {
    note(root, 'ACR LI-RADS v2018 CT/MRI diagnostic categories (liver observations in patients at risk for HCC). Pick the assigned category. LR-1/2 are benign; LR-3 intermediate; LR-4/5 probable/definite HCC; LR-M non-HCC malignancy; LR-TIV tumor in vein. Near-neighbors: bclc-hcc.');
    root.appendChild(select('LI-RADS diagnostic category', 'lirads-cat', [
      ['LR-1', 'LR-1 — definitely benign'],
      ['LR-2', 'LR-2 — probably benign'],
      ['LR-3', 'LR-3 — intermediate probability of malignancy'],
      ['LR-4', 'LR-4 — probably HCC'],
      ['LR-5', 'LR-5 — definitely HCC'],
      ['LR-M', 'LR-M — malignant, not HCC specific'],
      ['LR-TIV', 'LR-TIV — tumor in vein'],
      ['LR-NC', 'LR-NC — not categorizable'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lirads-cat'], () => safe(o, () => {
      const r = M.liRads({ category: val('lirads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
