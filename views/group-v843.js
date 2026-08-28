// spec-v843 §2: renderer for bp-categories — the ACC/AHA blood pressure categories
// (Clinical Scoring & Risk, Group G).
//
// Both numbers are entered because the category is decided by whichever of them is higher.
// A systolic-only entry would answer the wrong question on exactly the readings that matter.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bp-categories-v843.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bp-categories'(root) {
    note(root, 'Where the systolic and the diastolic fall in different categories, the higher one applies.');

    root.appendChild(el('h2', { text: 'Blood pressure' }));
    numField(root, 'Systolic pressure (mmHg)', 'bpc-sbp', { min: '50', max: '300', step: '1' });
    numField(root, 'Diastolic pressure (mmHg)', 'bpc-dbp', { min: '20', max: '200', step: '1' });

    const ids = ['bpc-sbp', 'bpc-dbp'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.bpCategories({ systolic: val('bpc-sbp'), diastolic: val('bpc-dbp') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.severeNote) note(o, r.severeNote);
      if (r.higherCategoryNote) note(o, r.higherCategoryNote);
      if (r.noElevatedByDiastoleNote) note(o, r.noElevatedByDiastoleNote);
      note(o, r.averagingNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published classification to readings already taken. It does not select or adjust therapy.' }));
  },
};
