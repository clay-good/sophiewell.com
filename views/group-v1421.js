// spec-v1421: renderer for johnson-strom-flatfoot (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as JS from '../lib/johnson-strom-flatfoot-v1421.js';
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
  'johnson-strom-flatfoot'(root) {
    note(root, 'From the standing examination and weight-bearing foot and ankle radiographs.');
    selectField(root, 'Hindfoot deformity', 'jsf-deformity', JS.JSF_DEFORMITY, NA);
    selectField(root, 'Ankle', 'jsf-ankle', JS.JSF_ANKLE, NA);
    selectField(root, 'Single-leg heel rise (optional)', 'jsf-heelrise', JS.JSF_HEELRISE, NA);
    selectField(root, '"Too many toes" sign (optional)', 'jsf-toes', JS.JSF_TOES, NA);
    selectField(root, 'Radiographs (optional)', 'jsf-arthritis', JS.JSF_ARTHRITIS, NA);
    const ids = ['jsf-deformity', 'jsf-ankle', 'jsf-heelrise', 'jsf-toes', 'jsf-arthritis'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = JS.johnsonStromFlatfoot({ deformity: val('jsf-deformity'), ankle: val('jsf-ankle'), heelRise: val('jsf-heelrise'), toes: val('jsf-toes'), arthritis: val('jsf-arthritis') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Johnson and Strom stage', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
