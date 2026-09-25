// spec-v1434: renderer for c2hest (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as C2 from '../lib/c2hest-v1434.js';
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

const NA = '-- not answered --';

export const renderers = {
  'c2hest'(root) {
    note(root, 'Answer every item. The score was derived in adults without structural heart disease.');
    selectField(root, 'Structural heart disease', 'c2h-shd', C2.C2HEST_YES_NO, NA);
    selectField(root, 'Coronary artery disease', 'c2h-cad', C2.C2HEST_YES_NO, NA);
    selectField(root, 'COPD', 'c2h-copd', C2.C2HEST_YES_NO, NA);
    selectField(root, 'Hypertension', 'c2h-htn', C2.C2HEST_YES_NO, NA);
    selectField(root, 'Age 75 or older', 'c2h-age', C2.C2HEST_YES_NO, NA);
    selectField(root, 'Systolic heart failure', 'c2h-hf', C2.C2HEST_YES_NO, NA);
    selectField(root, 'Hyperthyroidism', 'c2h-thyroid', C2.C2HEST_YES_NO, NA);
    const ids = ['c2h-shd', 'c2h-cad', 'c2h-copd', 'c2h-htn', 'c2h-age', 'c2h-hf', 'c2h-thyroid'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = C2.c2hest({ shd: val('c2h-shd'), cad: val('c2h-cad'), copd: val('c2h-copd'), htn: val('c2h-htn'), age75: val('c2h-age'), systolicHf: val('c2h-hf'), hyperthyroid: val('c2h-thyroid') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
