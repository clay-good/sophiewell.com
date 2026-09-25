// spec-v1433: renderer for disability-rating-scale (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as DRS from '../lib/disability-rating-scale-v1433.js';
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

const NA = '-- not rated --';

export const renderers = {
  'disability-rating-scale'(root) {
    note(root, 'Rate all eight items with whole numbers. Feeding, toileting and grooming are rated on knowing how and when, not physical ability.');
    selectField(root, 'Eye opening', 'drs-eye', DRS.DRS_EYE, NA);
    selectField(root, 'Best communication ability', 'drs-communication', DRS.DRS_COMMUNICATION, NA);
    selectField(root, 'Best motor response', 'drs-motor', DRS.DRS_MOTOR, NA);
    selectField(root, 'Cognitive ability for feeding', 'drs-feeding', DRS.DRS_FEEDING, NA);
    selectField(root, 'Cognitive ability for toileting', 'drs-toileting', DRS.DRS_TOILETING, NA);
    selectField(root, 'Cognitive ability for grooming', 'drs-grooming', DRS.DRS_GROOMING, NA);
    selectField(root, 'Level of functioning', 'drs-functioning', DRS.DRS_FUNCTIONING, NA);
    selectField(root, 'Employability', 'drs-employability', DRS.DRS_EMPLOYABILITY, NA);
    const keys = ['eye', 'communication', 'motor', 'feeding', 'toileting', 'grooming', 'functioning', 'employability'];
    const ids = keys.map((k) => `drs-${k}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = DRS.disabilityRatingScale(Object.fromEntries(keys.map((k) => [k, val(`drs-${k}`)])));
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'DRS total', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
