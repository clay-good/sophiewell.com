// spec-v164 §2: renderers for the three ophthalmology tiles of the spec-v162
// Cross-Discipline Completion program — iolPower (SRK II), visualAcuityConverter
// (Snellen / logMAR / decimal), and ocularPerfusionPressure (OPP). All Clinical
// Math & Conversions (Group E).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each
// compute is closed-form arithmetic over finite-checked values; every log /
// division / subtraction is guarded in lib/ophtho-v164.js (a blank / non-finite /
// zero / negative input renders a surfaced complete-the-fields fallback, never
// NaN / Infinity). Per the spec-v50 §3 posture note each tile defers the decision
// to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ophtho-v164.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value and its interpretation are the cited source’s, computed from the measurements you enter; IOL power does not replace device biometry and OPP is one of several glaucoma-risk factors. The management decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const VA_MODE_OPTS = [
  { value: 'snellen20', text: 'Snellen imperial (20/x)' },
  { value: 'snellen6', text: 'Snellen metric (6/x)' },
  { value: 'decimal', text: 'Decimal' },
  { value: 'logmar', text: 'logMAR' },
];

export const renderers = {
  // ----- 2.1 iol-power -------------------------------------------------------
  'iol-power'(root) {
    note(root, 'Intraocular-lens power, SRK II (Sanders/Retzlaff/Kraff 1988): P = A1 − 0.9·K − 2.5·AL, where A1 is the A-constant adjusted for axial length (AL<20 +3, 20–21 +2, 21–22 +1, 22–24.5 0, ≥24.5 −0.5). A regression formula superseded by optical formulas (SRK/T, Barrett); it does not replace device biometry. Near-neighbors: visual-acuity-converter, bw-bsa-suite.');
    root.appendChild(num('Lens A-constant', 'iol-a', { min: '0' }));
    root.appendChild(num('Axial length AL (mm)', 'iol-al', { min: '0' }));
    root.appendChild(num('Average keratometry K (D)', 'iol-k', { min: '0' }));
    root.appendChild(num('Target refraction (D) — 0 for emmetropia', 'iol-target'));
    const o = out(); root.appendChild(o);
    wire(['iol-a', 'iol-al', 'iol-k', 'iol-target'], () => safe(o, () => {
      const r = M.iolPower({ aConst: val('iol-a'), al: val('iol-al'), k: val('iol-k'), target: val('iol-target') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'IOL power', value: `${r.power} D` },
        { label: 'Emmetropic', value: `${r.emmetropic} D` },
        { label: 'AL adjustment', value: `${r.adjust >= 0 ? '+' : ''}${r.adjust}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 visual-acuity-converter -----------------------------------------
  'visual-acuity-converter'(root) {
    note(root, 'Visual-acuity converter (Holladay 2004): logMAR = log10(Snellen denominator/20) = −log10(decimal); decimal = 20/denominator. Enter a value in any one notation to see the equivalent in the others. 20/20 = decimal 1.0 = logMAR 0. Near-neighbors: iol-power, ocular-perfusion-pressure.');
    root.appendChild(selectField('Notation you are entering', 'va-mode', VA_MODE_OPTS));
    root.appendChild(num('Value — Snellen denominator (e.g. 40 for 20/40), decimal, or logMAR', 'va-value'));
    const o = out(); root.appendChild(o);
    wire(['va-mode', 'va-value'], () => safe(o, () => {
      const r = M.visualAcuityConverter({ mode: val('va-mode'), value: val('va-value') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Snellen (20/x)', value: `20/${r.snellen20}` },
        { label: 'Snellen (6/x)', value: `6/${r.snellen6}` },
        { label: 'Decimal', value: `${r.decimal}` },
        { label: 'logMAR', value: `${r.logmar}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 ocular-perfusion-pressure ---------------------------------------
  'ocular-perfusion-pressure'(root) {
    note(root, 'Ocular perfusion pressure (Costa 2014): MAP = DBP + ⅓·(SBP − DBP); mean OPP = ⅔·MAP − IOP; systolic OPP = SBP − IOP; diastolic OPP = DBP − IOP. A low mean OPP (≈ below 50 mmHg) is one of several vascular associations with glaucoma risk. Near-neighbors: map, iop-pressure.');
    root.appendChild(num('Systolic BP (mmHg)', 'opp-sbp', { min: '0' }));
    root.appendChild(num('Diastolic BP (mmHg)', 'opp-dbp', { min: '0' }));
    root.appendChild(num('Intraocular pressure IOP (mmHg)', 'opp-iop', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['opp-sbp', 'opp-dbp', 'opp-iop'], () => safe(o, () => {
      const r = M.ocularPerfusionPressure({ sbp: val('opp-sbp'), dbp: val('opp-dbp'), iop: val('opp-iop') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Mean OPP', value: `${r.meanOpp} mmHg` },
        { label: 'Systolic OPP', value: `${r.systolicOpp} mmHg` },
        { label: 'Diastolic OPP', value: `${r.diastolicOpp} mmHg` },
        { label: 'MAP', value: `${r.map} mmHg` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
