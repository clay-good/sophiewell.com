// spec-v277 §2: renderer for the measured (timed-urine) creatinine clearance. Group E.
// It joins the renal tiles beside the Cockcroft-Gault and eGFR estimators.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/renal-v277.js';
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
  'measured-crcl'(root) {
    note(root, 'Measured creatinine clearance = (urine Cr × urine volume) / (serum Cr × collection time). The direct clearance from a timed urine, distinct from the Cockcroft-Gault estimate. Near-neighbors: cockcroft-gault, egfr, uacr-upcr.');
    root.appendChild(num('Urine creatinine (mg/dL)', 'mcrcl-ucr', { min: '0' }));
    root.appendChild(num('Urine volume over the collection (mL)', 'mcrcl-uvol', { min: '0' }));
    root.appendChild(num('Serum creatinine (mg/dL)', 'mcrcl-scr', { min: '0' }));
    root.appendChild(num('Collection time (hours)', 'mcrcl-hours', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['mcrcl-ucr', 'mcrcl-uvol', 'mcrcl-scr', 'mcrcl-hours'], () => safe(o, () => {
      render(o, M.measuredCrcl({ urineCr: val('mcrcl-ucr'), urineVolume: val('mcrcl-uvol'), serumCr: val('mcrcl-scr'), hours: val('mcrcl-hours') }), 'CrCl');
    }));
    postureNote(root);
  },
};
