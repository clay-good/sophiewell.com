// spec-v163 §2: renderers for the three evidence-based-medicine bedside-math
// tiles of the spec-v162 Cross-Discipline Completion program — faganPostTest
// (post-test probability), diagnostic2x2 (sens/spec/PV/LR), and nntArr
// (ARR/RRR/RR/NNT). All Clinical Math & Conversions (Group E).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each
// compute is closed-form arithmetic over finite-checked values; every odds/ratio
// division is guarded in lib/ebm-v163.js (a blank / non-finite / zero-denominator
// input renders a surfaced complete-the-fields fallback, never NaN / Infinity).
// Per the spec-v50 §3 posture note each tile defers interpretation to the
// clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ebm-v163.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. These are interpretive aids computed from the values you enter; whether the inputs apply to your patient and population is the clinician’s judgment. The management decision stays with the reading clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const FAGAN_MODE_OPTS = [
  { value: 'lr', text: 'Enter a likelihood ratio' },
  { value: 'sensspec', text: 'Enter sensitivity & specificity' },
];

export const renderers = {
  // ----- 2.1 fagan-post-test -------------------------------------------------
  'fagan-post-test'(root) {
    note(root, 'Fagan post-test probability (Fagan 1975): pre-test odds = p/(1−p); post-test odds = pre-test odds × likelihood ratio; post-test probability = odds/(1+odds). Enter an LR directly, or enter sensitivity & specificity to derive LR+ and LR− and see the post-test probability after a positive and a negative result. Near-neighbors: diagnostic-2x2, nnt-arr.');
    root.appendChild(selectField('Input mode', 'fagan-mode', FAGAN_MODE_OPTS));
    root.appendChild(num('Pre-test probability (%) — 0 to 100, exclusive', 'fagan-pretest', { min: '0', max: '100' }));
    root.appendChild(num('Likelihood ratio (LR+ or LR−) — used in “likelihood ratio” mode', 'fagan-lr', { min: '0' }));
    root.appendChild(num('Sensitivity (%) — used in “sensitivity & specificity” mode', 'fagan-sens', { min: '0', max: '100' }));
    root.appendChild(num('Specificity (%) — used in “sensitivity & specificity” mode', 'fagan-spec', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['fagan-mode', 'fagan-pretest', 'fagan-lr', 'fagan-sens', 'fagan-spec'], () => safe(o, () => {
      const r = M.faganPostTest({ mode: val('fagan-mode'), pretest: val('fagan-pretest'), lr: val('fagan-lr'), sens: val('fagan-sens'), spec: val('fagan-spec') });
      if (!r.valid) { showInvalid(o, r); return; }
      if (r.mode === 'sensspec') {
        resultRow(o, [
          { text: r.band },
          { label: 'Post-test (positive)', value: `${r.postPos} %` },
          { label: 'Post-test (negative)', value: `${r.postNeg} %` },
          { label: 'LR+', value: `${r.lrPos}` },
          { label: 'LR−', value: `${r.lrNeg}` },
        ]);
      } else {
        resultRow(o, [
          { text: r.band },
          { label: 'Post-test probability', value: `${r.posttest} %` },
          { label: 'LR', value: `${r.lr}` },
        ]);
      }
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 diagnostic-2x2 --------------------------------------------------
  'diagnostic-2x2'(root) {
    note(root, 'Diagnostic test 2×2 (Altman & Bland 1994): from the four cells — sensitivity = TP/(TP+FN), specificity = TN/(TN+FP), PPV = TP/(TP+FP), NPV = TN/(TN+FN), LR+ = sens/(1−spec), LR− = (1−sens)/spec. The sample PPV/NPV reflect the study prevalence; enter a target prevalence to recompute them by Bayes. Near-neighbors: fagan-post-test, nnt-arr.');
    root.appendChild(num('True positives (diseased, test positive)', 'dx-tp', { min: '0', step: '1' }));
    root.appendChild(num('False positives (well, test positive)', 'dx-fp', { min: '0', step: '1' }));
    root.appendChild(num('False negatives (diseased, test negative)', 'dx-fn', { min: '0', step: '1' }));
    root.appendChild(num('True negatives (well, test negative)', 'dx-tn', { min: '0', step: '1' }));
    root.appendChild(num('Target prevalence (%) — optional, recomputes PPV/NPV by Bayes', 'dx-prev', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['dx-tp', 'dx-fp', 'dx-fn', 'dx-tn', 'dx-prev'], () => safe(o, () => {
      const r = M.diagnostic2x2({ tp: val('dx-tp'), fp: val('dx-fp'), fn: val('dx-fn'), tn: val('dx-tn'), prevalence: val('dx-prev') });
      if (!r.valid) { showInvalid(o, r); return; }
      const items = [
        { text: r.band },
        { label: 'Sensitivity', value: `${r.sens} %` },
        { label: 'Specificity', value: `${r.spec} %` },
        { label: 'PPV (sample)', value: r.ppv === null ? '—' : `${r.ppv} %` },
        { label: 'NPV (sample)', value: r.npv === null ? '—' : `${r.npv} %` },
        { label: 'Accuracy', value: `${r.accuracy} %` },
      ];
      if (r.targetPrev !== null) {
        items.push({ label: `PPV @ ${r.targetPrev}%`, value: r.bayesPpv === null ? '—' : `${r.bayesPpv} %` });
        items.push({ label: `NPV @ ${r.targetPrev}%`, value: r.bayesNpv === null ? '—' : `${r.bayesNpv} %` });
      }
      resultRow(o, items);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 nnt-arr ---------------------------------------------------------
  'nnt-arr'(root) {
    note(root, 'Number needed to treat / absolute risk reduction (Laupacis 1988): ARR = CER − EER; RRR = ARR/CER; relative risk RR = EER/CER; NNT = 1/ARR. When the experimental event rate exceeds control the result is a number needed to harm (NNH). Near-neighbors: fagan-post-test, diagnostic-2x2.');
    root.appendChild(num('Control event rate CER (%)', 'nnt-cer', { min: '0', max: '100' }));
    root.appendChild(num('Experimental event rate EER (%)', 'nnt-eer', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['nnt-cer', 'nnt-eer'], () => safe(o, () => {
      const r = M.nntArr({ cer: val('nnt-cer'), eer: val('nnt-eer') });
      if (!r.valid) { showInvalid(o, r); return; }
      const items = [
        { text: r.band, cls: r.harm ? 'warn' : null },
        { label: 'ARR', value: `${r.arr} %` },
        { label: r.harm ? 'NNH' : 'NNT', value: r.nnt === null ? '—' : `${r.nnt}` },
      ];
      if (r.rr !== null) items.push({ label: 'Relative risk', value: `${r.rr}` });
      if (r.rrr !== null) items.push({ label: 'RRR', value: `${r.rrr} %` });
      resultRow(o, items);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
