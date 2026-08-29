// spec-v890 §2: renderer for methacholine — interpreting a methacholine challenge (Clinical
// Scoring & Risk, Group G).
//
// The dose-versus-concentration sentence prints on every result, because a PC20 carried between
// laboratories is the reading the 2017 standard exists to stop.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/methacholine-v890.js';
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
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  methacholine(root) {
    note(root, 'The 2017 standard reads a delivered dose, not a concentration. A concentration is not comparable between laboratories.');

    root.appendChild(el('h2', { text: 'The result' }));
    // Written out rather than mapped from M.METRICS: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Which metric was reported', 'mc-metric', [
      { value: 'pd20', text: 'PD20, the dose in micrograms (the 2017 standard)' },
      { value: 'pc20', text: 'PC20, the concentration in mg/mL (the legacy metric)' },
    ]);
    numField(root, 'The reported value', 'mc-value', { min: '0', max: '10000', step: '0.01' });

    root.appendChild(el('h2', { text: 'How the test was done' }));
    checkField(root, 'Medications were withheld for the required intervals', 'mc-medicationswithheld');

    const o = out(); root.appendChild(o);
    wire(['mc-metric', 'mc-value', 'mc-medicationswithheld'], () => safe(o, () => {
      const r = M.methacholine({
        metric: val('mc-metric'),
        value: val('mc-value'),
        medicationsWithheld: checked('mc-medicationswithheld'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.negativeNote) note(o, r.negativeNote);
      if (r.positiveNote) note(o, r.positiveNote);
      note(o, r.withholdNote);
      note(o, r.metricNote);
      note(o, r.safetyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a result against published cutpoints. It does not diagnose asthma, and it does not decide treatment.' }));
  },
};
