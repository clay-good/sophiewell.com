// spec-v927 §2: renderer for airway-resistance — inspiratory airway resistance on a ventilated
// patient (Clinical Scoring & Risk, Group G).
//
// The peak-versus-plateau distinction prints on every result, because that is the whole reason
// the number is computed at the bedside.

import { el, clear } from '../lib/dom.js';
import * as A from '../lib/airway-resistance-v927.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
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
  'airway-resistance'(root) {
    numField(root, 'Peak inspiratory pressure', 'ar-peak', 'cmH2O');
    numField(root, 'Plateau pressure, from an end-inspiratory hold', 'ar-plateau', 'cmH2O');
    numField(root, 'Set inspiratory flow', 'ar-flow', 'L/min');

    const ids = ['ar-peak', 'ar-plateau', 'ar-flow'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = A.airwayResistance({
        peakPressure: val('ar-peak'),
        plateauPressure: val('ar-plateau'),
        inspiratoryFlow: val('ar-flow'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.distinctionNote);
      note(o, r.plateauNote);
      note(o, r.flowNote);
      note(o, r.tubeNote);
      note(o, r.passiveNote);
      note(o, r.complianceNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is arithmetic on three ventilator numbers. It does not diagnose the cause and it does not choose a treatment.' }));
  },
};
