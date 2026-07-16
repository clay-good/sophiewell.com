// spec-v325: renderer for the ACR Lung-RADS v2022 assessment categories.
// Group G. The radiologist picks the assessment category; the tile reports the descriptor
// and the standard management recommendation.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the assessment category; it never asserts a diagnosis
// or an order (lib/lung-rads-v325.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lung-rads-v325.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The follow-up or workup decision stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lung-rads'(root) {
    note(root, 'ACR Lung-RADS v2022 assessment categories (lung cancer screening LDCT). Pick the final assessment category. 1–2 continue annual screening; 3 is a 6-month follow-up; 4A–4X are suspicious (short-interval or diagnostic workup). An S modifier flags significant non-lung findings. Near-neighbors: bi-rads.');
    root.appendChild(select('Lung-RADS assessment category', 'lungrads-cat', [
      ['0', '0 — incomplete (comparison or more imaging needed)'],
      ['1', '1 — negative'],
      ['2', '2 — benign appearance or behavior'],
      ['3', '3 — probably benign'],
      ['4A', '4A — suspicious'],
      ['4B', '4B — very suspicious'],
      ['4X', '4X — category 3/4 with additional suspicious features'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lungrads-cat'], () => safe(o, () => {
      const r = M.lungRads({ category: val('lungrads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
