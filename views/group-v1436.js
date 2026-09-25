// spec-v1436: renderer for rcvs2 (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as RC from '../lib/rcvs2-v1436.js';
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
  rcvs2(root) {
    note(root, 'For a patient whose vessel imaging shows a large or medium intracranial arteriopathy. Answer every item.');
    selectField(root, 'Recurrent or single thunderclap headache', 'rc2-tch', RC.RCVS2_YES_NO, NA);
    selectField(root, 'Intracranial carotid artery involved', 'rc2-carotid', RC.RCVS2_YES_NO, NA);
    selectField(root, 'Vasoconstrictive trigger', 'rc2-trigger', RC.RCVS2_YES_NO, NA);
    selectField(root, 'Sex', 'rc2-sex', RC.RCVS2_SEX, NA);
    selectField(root, 'Subarachnoid hemorrhage', 'rc2-sah', RC.RCVS2_YES_NO, NA);
    const ids = ['rc2-tch', 'rc2-carotid', 'rc2-trigger', 'rc2-sex', 'rc2-sah'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = RC.rcvs2({ tch: val('rc2-tch'), carotid: val('rc2-carotid'), trigger: val('rc2-trigger'), sex: val('rc2-sex'), sah: val('rc2-sah') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'RCVS2', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
