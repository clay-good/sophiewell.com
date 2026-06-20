// spec-v128 §2: renderers for the five renal-excretion and dialysis-math tiles
// (fepo4, femg, npcr-pna, std-ktv, efwc). All home in Clinical Math & Conversions
// (Group E). v128 continues Wave 5 of the spec-v100 program, extending the
// fractional-excretion family (fena-feurea) and dialysis adequacy (ktv-urr).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames an excretion
// fraction, adequacy quantity, or signed clearance, not management (spec-v11
// §5.3). Each compute surfaces a complete-the-fields fallback rather than a bad
// number; every division denominator is guarded in lib/renal-v128.js.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/renal-v128.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The excretion fraction, adequacy quantity, or signed clearance is the cited instrument’s, computed from the values you entered. The management decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

export const renderers = {
  // ----- 2.1 fepo4 ------------------------------------------------------
  fepo4(root) {
    note(root, 'Fractional excretion of phosphate (Walton-Bijvoet 1975): FEPO4 = (urine PO4 × plasma Cr) / (plasma PO4 × urine Cr) × 100. In hypophosphatemia, above ~5% suggests renal phosphate wasting; at or below ~5% suggests an extra-renal or redistributive cause. Keep units consistent within each pair.');
    root.appendChild(field('Urine phosphate (mg/dL)', 'fp-up', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('Plasma phosphate (mg/dL)', 'fp-pp', { step: '0.1', min: 0, placeholder: 'e.g. 1.5' }));
    root.appendChild(field('Urine creatinine (mg/dL)', 'fp-uc', { step: '0.1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Plasma creatinine (mg/dL)', 'fp-pc', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    const o = out(); root.appendChild(o);
    wire(['fp-up', 'fp-pp', 'fp-uc', 'fp-pc'], () => safe(o, () => {
      const r = M.fepo4({ urinePhos: optNum('fp-up'), plasmaPhos: optNum('fp-pp'), urineCr: optNum('fp-uc'), plasmaCr: optNum('fp-pc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'FEPO4', value: `${r.fe}%` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 femg -------------------------------------------------------
  femg(root) {
    note(root, 'Fractional excretion of magnesium (Elisaf 1998): FEMg = (urine Mg × plasma Cr) / (0.7 × plasma Mg × urine Cr) × 100. The 0.7 corrects for the protein-bound, non-filterable fraction. In hypomagnesemia, above ~2% (Elisaf cutoff ~4%) suggests renal magnesium wasting. Keep units consistent within each pair.');
    root.appendChild(field('Urine magnesium (mg/dL)', 'fm-um', { step: '0.1', min: 0, placeholder: 'e.g. 2.0' }));
    root.appendChild(field('Plasma magnesium (mg/dL)', 'fm-pm', { step: '0.1', min: 0, placeholder: 'e.g. 1.2' }));
    root.appendChild(field('Urine creatinine (mg/dL)', 'fm-uc', { step: '0.1', min: 0, placeholder: 'e.g. 50' }));
    root.appendChild(field('Plasma creatinine (mg/dL)', 'fm-pc', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    const o = out(); root.appendChild(o);
    wire(['fm-um', 'fm-pm', 'fm-uc', 'fm-pc'], () => safe(o, () => {
      const r = M.femg({ urineMg: optNum('fm-um'), plasmaMg: optNum('fm-pm'), urineCr: optNum('fm-uc'), plasmaCr: optNum('fm-pc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'FEMg', value: `${r.fe}%` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 npcr-pna ---------------------------------------------------
  'npcr-pna'(root) {
    note(root, 'Normalized protein catabolic rate (Depner-Daugirdas 1996): nPCR = 0.22 + 0.864 × (pre-dialysis BUN − post-dialysis BUN) / interdialytic hours. Enter the post-dialysis BUN of one session and the pre-dialysis BUN of the next, with the interval between. Nutrition target ~1.0-1.2 g/kg/day; below ~0.8 suggests inadequate protein intake.');
    root.appendChild(field('Post-dialysis BUN, prior session (mg/dL)', 'np-post', { step: '0.1', min: 0, placeholder: 'e.g. 18' }));
    root.appendChild(field('Pre-dialysis BUN, next session (mg/dL)', 'np-pre', { step: '0.1', min: 0, placeholder: 'e.g. 70' }));
    root.appendChild(field('Interdialytic interval (hours)', 'np-hr', { step: '0.1', min: 0, placeholder: 'e.g. 44' }));
    const o = out(); root.appendChild(o);
    wire(['np-post', 'np-pre', 'np-hr'], () => safe(o, () => {
      const r = M.npcrPna({ postBun: optNum('np-post'), preBun: optNum('np-pre'), hours: optNum('np-hr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'nPCR', value: `${r.npcr} g/kg/day` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 std-ktv ----------------------------------------------------
  'std-ktv'(root) {
    note(root, 'Standard Kt/V (Leypoldt 2003, FHN fixed-volume form): the weekly, frequency-normalized dialysis dose. eKt/V = spKt/V × time / (time + 35); stdKt/V normalizes per-session dose over the week so schedules can be compared on one axis. KDOQI 2015 weekly target ≥ 2.1.');
    root.appendChild(field('Single-pool Kt/V per session', 'sk-sp', { step: '0.01', min: 0, placeholder: 'e.g. 1.4' }));
    root.appendChild(field('Session time (minutes)', 'sk-min', { step: '1', min: 0, placeholder: 'e.g. 240' }));
    root.appendChild(field('Sessions per week', 'sk-n', { step: '1', min: 0, placeholder: 'e.g. 3' }));
    const o = out(); root.appendChild(o);
    wire(['sk-sp', 'sk-min', 'sk-n'], () => safe(o, () => {
      const r = M.stdKtv({ spKtv: optNum('sk-sp'), minutes: optNum('sk-min'), sessions: optNum('sk-n') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'stdKt/V', value: `${r.std}/wk` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 efwc -------------------------------------------------------
  efwc(root) {
    note(root, 'Electrolyte-free water clearance (Rose 1986): EFWC = urine volume × [1 − (urine Na + urine K) / plasma Na]. Positive = net free-water excretion that raises plasma sodium (toward hypernatremia); negative = net free-water retention that lowers plasma sodium (drives hyponatremia). The result flips as urine Na + K crosses plasma Na.');
    root.appendChild(field('Urine volume (L)', 'ef-vol', { step: '0.1', min: 0, placeholder: 'e.g. 2.0' }));
    root.appendChild(field('Urine sodium (mEq/L)', 'ef-una', { step: '1', min: 0, placeholder: 'e.g. 20' }));
    root.appendChild(field('Urine potassium (mEq/L)', 'ef-uk', { step: '1', min: 0, placeholder: 'e.g. 15' }));
    root.appendChild(field('Plasma sodium (mEq/L)', 'ef-pna', { step: '1', min: 0, placeholder: 'e.g. 140' }));
    const o = out(); root.appendChild(o);
    wire(['ef-vol', 'ef-una', 'ef-uk', 'ef-pna'], () => safe(o, () => {
      const r = M.efwc({ volume: optNum('ef-vol'), urineNa: optNum('ef-una'), urineK: optNum('ef-uk'), plasmaNa: optNum('ef-pna') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'EFWC', value: `${r.efwc} L` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
