// spec-v1448: renderer for abc-psi (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as AB from '../lib/abc-psi-v1448.js';
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

const NA = '-- not chosen --';

export const renderers = {
  'abc-psi'(root) {
    note(root, 'Choose the pattern, then the one question for that pattern.');
    selectField(root, 'Pattern of posterior instability', 'abc-pattern', AB.ABC_PATTERN, NA);
    selectField(root, 'If a first event: subluxation or dislocation', 'abc-acute', AB.ABC_ACUTE, NA);
    selectField(root, 'If recurrent: functional or structural', 'abc-dynamic', AB.ABC_DYNAMIC, NA);
    selectField(root, 'If static: constitutional or acquired', 'abc-static', AB.ABC_STATIC, NA);
    const ids = ['abc-pattern', 'abc-acute', 'abc-dynamic', 'abc-static'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = AB.abcPsi({ pattern: val('abc-pattern'), acute: val('abc-acute'), dynamic: val('abc-dynamic'), static: val('abc-static') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ABC type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
