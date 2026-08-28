// spec-v840 §2: renderer for hf-ef-classification — the 2021 universal definition of heart
// failure by ejection fraction (Clinical Scoring & Risk, Group G).
//
// The baseline ejection fraction is a first-class field rather than an optional extra,
// because HFimpEF is a trajectory: without a baseline the category cannot be reached at all,
// and those patients get quietly classified as HFmrEF instead.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hf-ef-classification-v840.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hf-ef-classification'(root) {
    note(root, 'HFimpEF is a trajectory, not a threshold: it needs a baseline at or below 40, a rise of at least 10 points, and a current value above 40. All three.');

    root.appendChild(el('h2', { text: 'The diagnosis' }));
    root.appendChild(checkField('Symptomatic heart failure is present', 'hfef-symptomatic'));

    root.appendChild(el('h2', { text: 'Ejection fraction' }));
    numField(root, 'Current left ventricular ejection fraction, percent', 'hfef-current', { min: '0', max: '100', step: '1' });
    numField(root, 'Baseline ejection fraction, percent, if there was an earlier measurement', 'hfef-baseline', { min: '0', max: '100', step: '1' });

    const ids = ['hfef-symptomatic', 'hfef-current', 'hfef-baseline'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hfEfClassification({
        symptomaticHeartFailure: checked('hfef-symptomatic'),
        currentLvef: val('hfef-current'),
        baselineLvef: val('hfef-baseline'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.symptomNote) note(o, r.symptomNote);
      if (r.improvedNote) note(o, r.improvedNote);
      if (r.singleMeasurementNote) note(o, r.singleMeasurementNote);
      if (r.recoveredNote) note(o, r.recoveredNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published classification to measurements already made. It does not start, change or withdraw any treatment.' }));
  },
};
