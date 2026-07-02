// spec-v194 §2: renderers for the four invasive- / echocardiographic-
// hemodynamics tiles — PAPi, transpulmonary & diastolic pressure gradients, the
// Tei myocardial performance index, and the pulmonary shunt fraction. Group E.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// zero-denominator edges are guarded in lib/hemo-v194.js. Per the spec-v50 §3
// posture note each tile defers the support-device / listing / management
// decision to the clinician (spec-v11 §5.3) — these quantify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hemo-v194.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value is the cited source’s formula, computed from the catheter / echo / blood-gas numbers you enter. The mechanical-support, transplant-listing, and pulmonary-hypertension-therapy decisions stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 papi ------------------------------------------------------------
  papi(root) {
    note(root, 'Pulmonary artery pulsatility index (Korabathina 2012; Lim 2020): PAPi = (PA systolic − PA diastolic) / right atrial pressure. Context-specific thresholds (< 1.0 acute RV/LVAD; < 1.85 advanced HF). Near-neighbors: hemodynamic-suite, rvsp-pasp, cardiac-power-output.');
    root.appendChild(num('PA systolic pressure (mmHg)', 'papi-pasp'));
    root.appendChild(num('PA diastolic pressure (mmHg)', 'papi-padp'));
    root.appendChild(num('Right atrial pressure (mmHg)', 'papi-rap'));
    const o = out(); root.appendChild(o);
    wire(['papi-pasp', 'papi-padp', 'papi-rap'], () => safe(o, () => {
      const r = M.papi({ pasp: val('papi-pasp'), padp: val('papi-padp'), rap: val('papi-rap') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PAPi', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 transpulmonary-gradient -----------------------------------------
  'transpulmonary-gradient'(root) {
    note(root, 'Transpulmonary (TPG = mean PAP − PCWP) and diastolic (DPG = PA diastolic − PCWP) gradients (Naeije 2013): TPG > 12 flags a pulmonary-vascular component; with PCWP > 15, DPG ≥ 7 marks combined pre-/post-capillary PH. Near-neighbors: hemodynamic-suite, rvsp-pasp.');
    root.appendChild(num('Mean PA pressure (mmHg)', 'tpg-mpap'));
    root.appendChild(num('PA diastolic pressure (mmHg)', 'tpg-padp'));
    root.appendChild(num('Mean PCWP (mmHg)', 'tpg-pcwp'));
    const o = out(); root.appendChild(o);
    wire(['tpg-mpap', 'tpg-padp', 'tpg-pcwp'], () => safe(o, () => {
      const r = M.pressureGradients({ mpap: val('tpg-mpap'), padp: val('tpg-padp'), pcwp: val('tpg-pcwp') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TPG', value: `${r.tpg} mmHg` }, { label: 'DPG', value: `${r.dpg} mmHg` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 tei-index -------------------------------------------------------
  'tei-index'(root) {
    note(root, 'Tei myocardial performance index (Tei 1995): MPI = (IVCT + IVRT) / ET. Higher = worse combined systolic-diastolic function (LV normal ~0.39 ± 0.05). Near-neighbors: teichholz-lvef, mitral-e-e-prime.');
    root.appendChild(num('Isovolumic contraction time IVCT (ms)', 'tei-ivct'));
    root.appendChild(num('Isovolumic relaxation time IVRT (ms)', 'tei-ivrt'));
    root.appendChild(num('Ejection time ET (ms)', 'tei-et'));
    const o = out(); root.appendChild(o);
    wire(['tei-ivct', 'tei-ivrt', 'tei-et'], () => safe(o, () => {
      const r = M.teiIndex({ ivct: val('tei-ivct'), ivrt: val('tei-ivrt'), et: val('tei-et') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Tei index', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 shunt-fraction --------------------------------------------------
  'shunt-fraction'(root) {
    note(root, 'Pulmonary shunt fraction Qs/Qt (Berggren 1942): oxygen contents CxO₂ = 1.34 × Hb × SxO₂ + 0.0031 × PxO₂, end-capillary saturation assumed 100%; Qs/Qt = (CcO₂ − CaO₂) / (CcO₂ − CvO₂). Normal ~4–10%. Near-neighbors: cao2-do2, aa-gradient, pf-ratio.');
    root.appendChild(num('Hemoglobin (g/dL)', 'shunt-hb'));
    root.appendChild(num('Alveolar / end-capillary O₂ tension (mmHg)', 'shunt-pao2a'));
    root.appendChild(num('Arterial SaO₂ (%)', 'shunt-sao2'));
    root.appendChild(num('Arterial PaO₂ (mmHg)', 'shunt-pao2'));
    root.appendChild(num('Mixed-venous SvO₂ (%)', 'shunt-svo2'));
    root.appendChild(num('Mixed-venous PvO₂ (mmHg)', 'shunt-pvo2'));
    const o = out(); root.appendChild(o);
    wire(['shunt-hb', 'shunt-pao2a', 'shunt-sao2', 'shunt-pao2', 'shunt-svo2', 'shunt-pvo2'], () => safe(o, () => {
      const r = M.shuntFraction({ hb: val('shunt-hb'), pAO2: val('shunt-pao2a'), sao2: val('shunt-sao2'), pao2: val('shunt-pao2'), svo2: val('shunt-svo2'), pvo2: val('shunt-pvo2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Qs/Qt', value: `${r.pct}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
