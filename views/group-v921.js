// spec-v921 §2: renderer for sigma-metric — the sigma metric of a laboratory method
// (Clinical Scoring & Risk, Group G).
//
// The goal line prints on every result, because sigma is a property of a method AND a goal, and
// the same method scores differently against CLIA, biological-variation goals, RCPA and EFLM.

import { el, clear } from '../lib/dom.js';
import * as S from '../lib/sigma-metric-v921.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal' }));
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
  'sigma-metric'(root) {
    numField(root, 'Total allowable error, the goal', 'sm-tea', '%');
    numField(root, 'Bias, signed; it enters as its size', 'sm-bias', '%');
    numField(root, 'Imprecision', 'sm-cv', 'CV %');

    const ids = ['sm-tea', 'sm-bias', 'sm-cv'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = S.sigmaMetric({
        totalAllowableError: val('sm-tea'),
        bias: val('sm-bias'),
        cv: val('sm-cv'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.goalNote);
      note(o, r.biasNote);
      note(o, r.floorNote);
      note(o, r.signNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is arithmetic on three numbers that were already measured or chosen. It does not choose the goal, and it does not design a control rule.' }));
  },
};
