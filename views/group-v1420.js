// spec-v1420: renderer for paprosky-femoral (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as PF from '../lib/paprosky-femoral-v1420.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const NA = '-- not entered --';

export const renderers = {
  'paprosky-femoral'(root) {
    note(root, 'From full-length AP and lateral femoral radiographs before revision; the final type is confirmed at surgery.');
    selectField(root, 'Metaphysis', 'ppfem-metaphysis', PF.PPF_METAPHYSIS, NA);
    selectField(root, 'Diaphysis', 'ppfem-diaphysis', PF.PPF_DIAPHYSIS, NA);
    selectField(root, 'Isthmus', 'ppfem-isthmus', PF.PPF_ISTHMUS, NA);
    selectField(root, 'Intact diaphysis available for a scratch fit', 'ppfem-intact', PF.PPF_INTACT, NA);
    const ids = ['ppfem-metaphysis', 'ppfem-diaphysis', 'ppfem-isthmus', 'ppfem-intact'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PF.paproskyFemoral({ metaphysis: val('ppfem-metaphysis'), diaphysis: val('ppfem-diaphysis'), isthmus: val('ppfem-isthmus'), intact: val('ppfem-intact') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Paprosky femoral type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
