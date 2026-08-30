// spec-v920 §2: renderer for reference-change-value — whether a change between two results on
// the same patient is bigger than the variation that was always going to be there
// (Clinical Scoring & Risk, Group G).
//
// The not-stable line prints on every result, because "inside the reference change value" and
// "stable" are different statements and only the first one follows from the arithmetic.
//
// The probability select is written as `'rcv-probability', R.PROBABILITY_OPTIONS` so that
// scripts/lib/option-labels.mjs, which reads views statically, resolves the option text.

import { el, clear } from '../lib/dom.js';
import * as R from '../lib/reference-change-value-v920.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
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
  'reference-change-value'(root) {
    numField(root, 'Analytical imprecision, from the laboratory', 'rcv-cva', 'CV %');
    numField(root, 'Within-subject biological variation, from published tables', 'rcv-cvi', 'CV %');
    selectField(root, 'Probability', 'rcv-probability', R.PROBABILITY_OPTIONS);

    root.appendChild(el('h2', { text: 'Two results to compare, if you have them' }));
    numField(root, 'Previous result', 'rcv-previous');
    numField(root, 'Current result', 'rcv-current');

    const ids = ['rcv-cva', 'rcv-cvi', 'rcv-probability', 'rcv-previous', 'rcv-current'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = R.referenceChangeValue({
        cvAnalytical: val('rcv-cva'),
        cvIntraindividual: val('rcv-cvi'),
        probability: val('rcv-probability'),
        previousResult: val('rcv-previous'),
        currentResult: val('rcv-current'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.notStableNote);
      note(o, r.notImportantNote);
      note(o, r.sidedNote);
      note(o, r.steadyStateNote);
      note(o, r.sourceOfCviNote);
      note(o, r.asymmetryNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This compares a difference against a published formula. It does not decide whether a change matters.' }));
  },
};
