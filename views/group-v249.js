// spec-v249 §2: renderers for the renal & respiratory bedside formulas — the renal
// failure index, the fractional excretion of uric acid, the bronchodilator
// responsiveness, and the integrative weaning index. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/renalpulm-v249.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
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
  'renal-failure-index'(root) {
    note(root, 'Renal failure index = urine Na x plasma Cr / urine Cr. < 1 prerenal, > 1 ATN. Unreliable with diuretics. Near-neighbors: fena-feurea.');
    root.appendChild(numInput('Urine sodium (mEq/L)', 'rfi-una', { min: '0' }));
    root.appendChild(numInput('Plasma creatinine (mg/dL)', 'rfi-pcr', { min: '0' }));
    root.appendChild(numInput('Urine creatinine (mg/dL)', 'rfi-ucr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['rfi-una', 'rfi-pcr', 'rfi-ucr'], () => safe(o, () => {
      render(o, M.renalFailureIndex({ urineNa: val('rfi-una'), plasmaCr: val('rfi-pcr'), urineCr: val('rfi-ucr') }), 'RFI');
    }));
    postureNote(root);
  },
  'feua'(root) {
    note(root, 'FEUA = 100 x (urine UA x serum Cr) / (serum UA x urine Cr). Normal 4-11%; aids hyponatremia / SIADH workup. Near-neighbors: fena-feurea.');
    root.appendChild(numInput('Urine uric acid (mg/dL)', 'feua-uua', { min: '0' }));
    root.appendChild(numInput('Serum creatinine (mg/dL)', 'feua-scr', { min: '0' }));
    root.appendChild(numInput('Serum uric acid (mg/dL)', 'feua-sua', { min: '0' }));
    root.appendChild(numInput('Urine creatinine (mg/dL)', 'feua-ucr', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['feua-uua', 'feua-scr', 'feua-sua', 'feua-ucr'], () => safe(o, () => {
      render(o, M.feua({ urineUA: val('feua-uua'), serumCr: val('feua-scr'), serumUA: val('feua-sua'), urineCr: val('feua-ucr') }), 'FEUA');
    }));
    postureNote(root);
  },
  'bronchodilator-response'(root) {
    note(root, 'Bronchodilator response (ATS/ERS 2022) = 100 x (post - pre) / predicted. > 10% of predicted is significant. Near-neighbors: predicted-spirometry.');
    root.appendChild(numInput('Pre-bronchodilator FEV1 or FVC (L)', 'bdr-pre', { min: '0' }));
    root.appendChild(numInput('Post-bronchodilator FEV1 or FVC (L)', 'bdr-post', { min: '0' }));
    root.appendChild(numInput('Predicted FEV1 or FVC (L)', 'bdr-pred', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['bdr-pre', 'bdr-post', 'bdr-pred'], () => safe(o, () => {
      render(o, M.bronchodilatorResponse({ pre: val('bdr-pre'), post: val('bdr-post'), predicted: val('bdr-pred') }), 'BDR');
    }));
    postureNote(root);
  },
  'integrative-weaning-index'(root) {
    note(root, 'IWI (Nemer 2009) = static compliance x SaO2 / RSBI. >= 25 predicts weaning success. Near-neighbors: rsbi.');
    root.appendChild(numInput('Static compliance (mL/cmH2O)', 'iwi-cst', { min: '0' }));
    root.appendChild(numInput('SaO2 (%)', 'iwi-sao2', { min: '0', max: '100' }));
    root.appendChild(numInput('RSBI / f/VT (breaths/min/L)', 'iwi-rsbi', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['iwi-cst', 'iwi-sao2', 'iwi-rsbi'], () => safe(o, () => {
      render(o, M.integrativeWeaningIndex({ compliance: val('iwi-cst'), sao2: val('iwi-sao2'), rsbi: val('iwi-rsbi') }), 'IWI');
    }));
    postureNote(root);
  },
};
