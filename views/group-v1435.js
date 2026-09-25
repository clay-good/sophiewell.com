// spec-v1435: renderer for hatch-af (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as HA from '../lib/hatch-af-v1435.js';
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
  'hatch-af'(root) {
    note(root, 'For a patient with paroxysmal atrial fibrillation. Answer every item.');
    selectField(root, 'Hypertension', 'hat-htn', HA.HATCH_YES_NO, NA);
    selectField(root, 'Age 75 or older', 'hat-age', HA.HATCH_YES_NO, NA);
    selectField(root, 'Prior TIA or stroke', 'hat-tia', HA.HATCH_YES_NO, NA);
    selectField(root, 'COPD', 'hat-copd', HA.HATCH_YES_NO, NA);
    selectField(root, 'Heart failure', 'hat-hf', HA.HATCH_YES_NO, NA);
    const ids = ['hat-htn', 'hat-age', 'hat-tia', 'hat-copd', 'hat-hf'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HA.hatchAf({ htn: val('hat-htn'), age75: val('hat-age'), tiaStroke: val('hat-tia'), copd: val('hat-copd'), hf: val('hat-hf') });
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
