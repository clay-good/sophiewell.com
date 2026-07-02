// spec-v202 §2: renderers for the cardiovascular & heart-failure risk / survival
// engines — MECKI, UKPDS, ADVANCE, Seattle HF, and QRISK3. Group G. Shipped one
// tile at a time.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// logistic / exponential engines are finite-guarded and risk-clamped to [0,100]%
// in lib/cvrisk-engines-v202.js. Per the spec-v50 §3 posture note each tile
// defers the statin / anticoagulant / device / therapy decision to the clinician
// and the patient (spec-v11 §5.3) — these estimate risk, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cvrisk-engines-v202.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The estimate is the cited model’s, computed from the inputs you enter. The statin, anticoagulant, device, and therapy decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.3 mecki -----------------------------------------------------------
  mecki(root) {
    note(root, 'MECKI score (Agostoni 2013): a cardiopulmonary-exercise-anchored heart-failure prognostic score from six variables — hemoglobin, sodium, LVEF, peak VO₂ (% predicted), VE/VCO₂ slope, and MDRD-eGFR. The score is the model’s estimated 2-year risk of cardiovascular death, urgent transplant, or LVAD. Near-neighbors: seattle-hf, maggic.');
    root.appendChild(num('Hemoglobin (g/dL)', 'mecki-hb', { min: '3', max: '25' }));
    root.appendChild(num('Sodium (mEq/L)', 'mecki-na', { min: '100', max: '180' }));
    root.appendChild(num('LVEF (%)', 'mecki-lvef', { min: '5', max: '80' }));
    root.appendChild(num('Peak VO₂ (% predicted)', 'mecki-ppvo2', { min: '5' }));
    root.appendChild(num('VE/VCO₂ slope', 'mecki-veco2', { min: '10' }));
    root.appendChild(num('MDRD-eGFR (mL/min/1.73 m²)', 'mecki-egfr', { min: '3' }));
    const o = out(); root.appendChild(o);
    const ids = ['mecki-hb', 'mecki-na', 'mecki-lvef', 'mecki-ppvo2', 'mecki-veco2', 'mecki-egfr'];
    wire(ids, () => safe(o, () => {
      const r = M.mecki({ hb: val('mecki-hb'), sodium: val('mecki-na'), lvef: val('mecki-lvef'), ppvo2: val('mecki-ppvo2'), veco2: val('mecki-veco2'), egfr: val('mecki-egfr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'MECKI', value: `${r.score}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
