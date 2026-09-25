// spec-v1446: renderer for hypoglycemia-level (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import { unitField, unitNumOpt, GLUCOSE_UNITS } from '../lib/field-units.js';
import * as HY from '../lib/hypoglycemia-level-v1446.js';
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

export const renderers = {
  'hypoglycemia-level'(root) {
    selectField(root, 'Altered mental or physical status, needing help to treat', 'hy-assist', HY.HYPO_YES_NO, '-- not answered --');
    root.appendChild(unitField('Glucose', 'hy-glucose', GLUCOSE_UNITS, { placeholder: 'e.g. 62' }));
    const ids = ['hy-assist', 'hy-glucose', 'hy-glucose-unit'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HY.hypoglycemiaLevel({ needsAssistance: val('hy-assist'), glucoseMgDl: unitNumOpt('hy-glucose') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ADA level', value: r.bandLabel },
      ]);
      list(o, r.steps);
      for (const n of r.notes) note(o, n);
      note(o, r.note);
    }));
  },
};
