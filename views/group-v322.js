// spec-v322: renderer for the ACR BI-RADS assessment categories (breast imaging).
// Group G. The radiologist picks the final assessment category (0-6, with 4A/4B/4C); the
// tile reports the category, its likelihood-of-malignancy band, and the standard management.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the assessment category; it never asserts a diagnosis
// or an order (lib/bi-rads-v322.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bi-rads-v322.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The biopsy or follow-up decision stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bi-rads'(root) {
    note(root, 'ACR BI-RADS assessment categories (breast imaging, 5th ed). Pick the final assessment category. Categories 4–5 (suspicious to highly suggestive) warrant biopsy; 6 is known malignancy. Near-neighbors: acr-tirads.');
    root.appendChild(select('BI-RADS final assessment category', 'birads-cat', [
      ['0', '0 — incomplete; need more imaging or prior comparison'],
      ['1', '1 — negative (about 0%)'],
      ['2', '2 — benign (about 0%)'],
      ['3', '3 — probably benign (up to 2%)'],
      ['4', '4 — suspicious (over 2% to under 95%); biopsy'],
      ['4A', '4A — low suspicion (over 2% to 10%)'],
      ['4B', '4B — moderate suspicion (over 10% to 50%)'],
      ['4C', '4C — high suspicion (over 50% to under 95%)'],
      ['5', '5 — highly suggestive of malignancy (at least 95%)'],
      ['6', '6 — known biopsy-proven malignancy'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['birads-cat'], () => safe(o, () => {
      const r = M.biRads({ category: val('birads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
