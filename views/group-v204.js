// spec-v204 §2: renderers for the nephrology, fluid-balance & renal-tubular
// instruments — CCCR, urinary calcium, ABL, electrolyte-free water clearance,
// and TmP/GFR. Groups F / G. Shipped one tile at a time; opens the Frontline &
// Bedside Decision Instruments program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// ratio computes are finite-guarded against zero/blank denominators in
// lib/nephro-fluids-v204.js. Per the spec-v50 §3 posture note each tile defers
// the fluid / transfusion / dialysis / surgical-referral decision to the
// clinician and the patient (spec-v11 §5.3) — these quantify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nephro-fluids-v204.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value is the cited source’s, computed from the inputs you enter. The fluid, transfusion, dialysis, and surgical-referral decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 cccr ------------------------------------------------------------
  cccr(root) {
    note(root, 'Calcium/Creatinine Clearance Ratio (Christensen 2008): CCCR = (urine Ca × serum Cr) / (serum Ca × urine Cr). < 0.01 suggests FHH; > 0.02 suggests primary hyperparathyroidism; 0.01–0.02 indeterminate. Enter calcium terms in one shared unit and creatinine terms in one shared unit. Near-neighbors: corrected-calcium, tmp-gfr.');
    root.appendChild(num('Urine calcium (shared calcium unit)', 'cccr-uca', { min: '0' }));
    root.appendChild(num('Serum calcium (shared calcium unit)', 'cccr-sca', { min: '0' }));
    root.appendChild(num('Serum creatinine (shared creatinine unit)', 'cccr-scr', { min: '0' }));
    root.appendChild(num('Urine creatinine (shared creatinine unit)', 'cccr-ucr', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['cccr-uca', 'cccr-sca', 'cccr-scr', 'cccr-ucr'];
    wire(ids, () => safe(o, () => {
      const r = M.cccr({ urineCa: val('cccr-uca'), serumCa: val('cccr-sca'), serumCr: val('cccr-scr'), urineCr: val('cccr-ucr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CCCR', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
