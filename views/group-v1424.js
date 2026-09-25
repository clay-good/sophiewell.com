// spec-v1424: renderer for aospine-sacral (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as AS from '../lib/aospine-sacral-v1424.js';
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
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const NA = '-- not entered --';

export const renderers = {
  'aospine-sacral'(root) {
    note(root, 'From CT of the sacrum. Answer the pattern question for the type you chose; the others are ignored.');
    selectField(root, 'Where the fracture runs', 'aosac-region', AS.AOSAC_REGION, NA);
    selectField(root, 'Type A pattern', 'aosac-a', AS.AOSAC_A, NA);
    selectField(root, 'Type B fracture line', 'aosac-b', AS.AOSAC_B, NA);
    selectField(root, 'Type C pattern', 'aosac-c', AS.AOSAC_C, NA);
    selectField(root, 'Neurologic status (optional)', 'aosac-neuro', AS.AOSAC_NEURO, NA);
    for (const m of AS.AOSAC_MODIFIERS) checkField(root, m.label, `aosac-${m.key}`);
    const ids = ['aosac-region', 'aosac-a', 'aosac-b', 'aosac-c', 'aosac-neuro', ...AS.AOSAC_MODIFIERS.map((m) => `aosac-${m.key}`)];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = AS.aospineSacral({
        region: val('aosac-region'), aPattern: val('aosac-a'), bLine: val('aosac-b'), cPattern: val('aosac-c'),
        neuro: val('aosac-neuro'), m1: checked('aosac-m1'), m2: checked('aosac-m2'), m3: checked('aosac-m3'), m4: checked('aosac-m4'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'AOSpine sacral', value: r.code },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
