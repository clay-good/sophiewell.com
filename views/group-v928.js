// spec-v928 §2: renderer for auto-peep — auto-PEEP by an end-expiratory hold (Clinical Scoring &
// Risk, Group G).
//
// The passive-patient line prints on every result, because a hold on an actively breathing
// patient is the commonest way this measurement goes wrong.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/auto-peep-v928.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal' }));
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
  'auto-peep'(root) {
    numField(root, 'PEEP set on the ventilator', 'ap-set', 'cmH2O');
    numField(root, 'Total PEEP, from an end-expiratory hold', 'ap-total', 'cmH2O');
    numField(root, 'Plateau pressure, to see what auto-PEEP does to the driving pressure', 'ap-plateau', 'cmH2O');
    checkField(root, 'The patient was passive for the hold', 'ap-passive');
    checkField(root, 'Expiratory flow does not return to zero before the next breath', 'ap-flownotzero');

    const ids = ['ap-set', 'ap-total', 'ap-plateau', 'ap-passive', 'ap-flownotzero'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = P.autoPeep({
        setPeep: val('ap-set'),
        totalPeep: val('ap-total'),
        plateauPressure: val('ap-plateau'),
        passive: checked('ap-passive'),
        expiratoryFlowNotReturningToZero: checked('ap-flownotzero'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.passiveNote);
      note(o, r.zeroNote);
      note(o, r.drivingNote);
      note(o, r.triggerNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is arithmetic on two pressures. It does not diagnose gas trapping, and it does not change a ventilator setting.' }));
  },
};
