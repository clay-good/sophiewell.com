// spec-v1451: renderer for raymond-roy (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as RR from '../lib/raymond-roy-v1451.js';
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
  'raymond-roy'(root) {
    note(root, 'From the follow-up (or immediate) angiogram of a coiled aneurysm.');
    selectField(root, 'Contrast filling of the aneurysm', 'rroc-filling', RR.RR_FILLING, NA);
    selectField(root, 'Where the residual contrast sits (class III only)', 'rroc-location', RR.RR_LOCATION, NA);
    const ids = ['rroc-filling', 'rroc-location'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = RR.raymondRoy({ filling: val('rroc-filling'), location: val('rroc-location') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Raymond-Roy class', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
