// spec-v231 §2: renderers for the nutrition/inflammation prognostic tools — the
// Naples Prognostic Score, the neutrophil-to-monocyte ratio, and the fibrinogen-
// to-albumin ratio. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/prognostic-v231.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'naples-prognostic-score'(root) {
    note(root, 'Naples Prognostic Score (Galizia 2017): albumin < 4 g/dL, cholesterol <= 180, NLR > 2.96, LMR <= 4.44 each +1. Group 0 (0), 1 (1-2), 2 (3-4). Near-neighbors: nlr, lmr.');
    root.appendChild(num('Serum albumin (g/dL)', 'nap-alb', { min: '0' }));
    root.appendChild(num('Total cholesterol (mg/dL)', 'nap-chol', { min: '0' }));
    root.appendChild(num('Neutrophil-to-lymphocyte ratio (NLR)', 'nap-nlr', { min: '0' }));
    root.appendChild(num('Lymphocyte-to-monocyte ratio (LMR)', 'nap-lmr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['nap-alb', 'nap-chol', 'nap-nlr', 'nap-lmr'], () => safe(o, () => {
      render(o, M.naples({ albumin: val('nap-alb'), cholesterol: val('nap-chol'), nlr: val('nap-nlr'), lmr: val('nap-lmr') }), 'NPS');
    }));
    postureNote(root);
  },
  'nmr'(root) {
    note(root, 'Neutrophil-to-monocyte ratio = ANC / AMC. Higher = less favorable. Near-neighbors: nlr, lmr.');
    root.appendChild(num('Absolute neutrophil count (10³/µL)', 'nmr-anc', { min: '0' }));
    root.appendChild(num('Absolute monocyte count (10³/µL)', 'nmr-amc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['nmr-anc', 'nmr-amc'], () => safe(o, () => {
      render(o, M.nmr({ anc: val('nmr-anc'), amc: val('nmr-amc') }), 'NMR');
    }));
    postureNote(root);
  },
  'far'(root) {
    note(root, 'Fibrinogen-to-albumin ratio = fibrinogen (mg/dL) / albumin (g/dL). Higher = less favorable. Near-neighbors: crp-albumin-ratio, siri.');
    root.appendChild(num('Fibrinogen (mg/dL)', 'far-fib', { min: '0' }));
    root.appendChild(num('Serum albumin (g/dL)', 'far-alb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['far-fib', 'far-alb'], () => safe(o, () => {
      render(o, M.far({ fibrinogen: val('far-fib'), albumin: val('far-alb') }), 'FAR');
    }));
    postureNote(root);
  },
};
