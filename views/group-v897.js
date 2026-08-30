// spec-v897 §2: renderer for preop-fasting — the preoperative fasting intervals (Clinical
// Scoring & Risk, Group G).
//
// The minimums-not-targets sentence prints on every result, because "nothing by mouth after
// midnight" is what a reader is usually comparing against.

import { el, clear } from '../lib/dom.js';
import * as F from '../lib/preop-fasting-v897.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
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
  'preop-fasting'(root) {
    note(root, 'Minimum intervals before an elective procedure, measured to induction. They are not targets, and a longer fast is not a safer one.');

    root.appendChild(el('h2', { text: 'The last intake' }));
    // Written out rather than mapped from F.INTAKES: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'What was taken', 'pf-lastintake', [
      { value: 'clear-liquid', text: 'Clear liquids: water, pulp-free juice, carbonated drinks, black tea or coffee' },
      { value: 'breast-milk', text: 'Breast milk' },
      { value: 'formula', text: 'Infant formula' },
      { value: 'light-meal', text: 'Nonhuman milk, or a light meal' },
      { value: 'heavy-meal', text: 'Fried or fatty food, or meat' },
    ]);
    numField(root, 'Hours since then, counted to induction', 'pf-hourssinceintake', { min: '0', max: '72', step: '0.5' });

    const o = out(); root.appendChild(o);
    wire(['pf-lastintake', 'pf-hourssinceintake'], () => safe(o, () => {
      const r = F.preopFasting({
        lastIntake: val('pf-lastintake'),
        hoursSinceIntake: val('pf-hourssinceintake'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.overshootNote) note(o, r.overshootNote);
      if (r.clearNote) note(o, r.clearNote);
      note(o, r.clockNote);
      note(o, r.minimumNote);
      note(o, r.scopeOfTableNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a published table against an interval already elapsed. It does not clear a patient for anesthesia, and it does not overrule the anesthesia team.' }));
  },
};
