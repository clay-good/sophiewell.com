// spec-v197 §2: renderers for the five thyroid-homeostasis / beta-cell-function
// tiles — SPINA-GT, SPINA-GD, Jostel's TSH index, HOMA-B, and the oral
// disposition index. Group E.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// log-domain and zero-denominator edges are guarded in lib/endo-quant-v197.js.
// Per the spec-v50 §3 posture note each tile defers the diagnostic / treatment
// decision to the clinician (spec-v11 §5.3) — these quantify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/endo-quant-v197.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value is the cited source’s formula, computed from the labs you enter. The diagnosis and hormone / antidiabetic decisions stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 spina-gt --------------------------------------------------------
  'spina-gt'(root) {
    note(root, 'SPINA-GT — thyroid secretory capacity (Dietrich 2016): from TSH (mIU/L) and free T4 (pmol/L). Reference ~1.4–8.7 pmol/s; low = reduced capacity. Near-neighbors: free-thyroxine-index, spina-gd.');
    root.appendChild(num('TSH (mIU/L)', 'spinagt-tsh'));
    root.appendChild(num('Free T4 (pmol/L)', 'spinagt-ft4'));
    const o = out(); root.appendChild(o);
    wire(['spinagt-tsh', 'spinagt-ft4'], () => safe(o, () => {
      const r = M.spinaGt({ tsh: val('spinagt-tsh'), ft4: val('spinagt-ft4') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GT', value: `${r.value} pmol/s` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 spina-gd --------------------------------------------------------
  'spina-gd'(root) {
    note(root, 'SPINA-GD — sum activity of peripheral deiodinases (Dietrich 2016): from free T4 and free T3 (pmol/L). Reference ~20–60 nmol/s. Near-neighbors: spina-gt, free-thyroxine-index.');
    root.appendChild(num('Free T4 (pmol/L)', 'spinagd-ft4'));
    root.appendChild(num('Free T3 (pmol/L)', 'spinagd-ft3'));
    const o = out(); root.appendChild(o);
    wire(['spinagd-ft4', 'spinagd-ft3'], () => safe(o, () => {
      const r = M.spinaGd({ ft4: val('spinagd-ft4'), ft3: val('spinagd-ft3') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GD', value: `${r.value} nmol/s` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 jostel-tsh-index ------------------------------------------------
  'jostel-tsh-index'(root) {
    note(root, 'Jostel’s TSH index (Jostel 2009): TSHI = ln(TSH) + 0.1345 × FT4 (pmol/L); standardized sTSHI = (TSHI − 2.7) / 0.676. A low index suggests central hypothyroidism. Near-neighbors: free-thyroxine-index, spina-gt.');
    root.appendChild(num('TSH (mIU/L)', 'jostel-tsh'));
    root.appendChild(num('Free T4 (pmol/L)', 'jostel-ft4'));
    const o = out(); root.appendChild(o);
    wire(['jostel-tsh', 'jostel-ft4'], () => safe(o, () => {
      const r = M.jostelTshIndex({ tsh: val('jostel-tsh'), ft4: val('jostel-ft4') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TSHI', value: `${r.tshi}` }, { label: 'sTSHI', value: `${r.stshi}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 homa-beta -------------------------------------------------------
  'homa-beta'(root) {
    note(root, 'HOMA-B — steady-state β-cell function (Matthews 1985): 20 × fasting insulin (µU/mL) / (fasting glucose (mmol/L) − 3.5). The β-cell arm complementing HOMA-IR. Near-neighbors: homa-ir, quicki.');
    root.appendChild(num('Fasting insulin (µU/mL)', 'homab-ins'));
    root.appendChild(num('Fasting glucose (mmol/L)', 'homab-glu'));
    const o = out(); root.appendChild(o);
    wire(['homab-ins', 'homab-glu'], () => safe(o, () => {
      const r = M.homaBeta({ insulin: val('homab-ins'), glucose: val('homab-glu') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HOMA-B', value: `${r.value}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 oral-disposition-index ------------------------------------------
  'oral-disposition-index'(root) {
    note(root, 'Oral disposition index DIo (Utzschneider 2009): insulinogenic index = ΔInsulin(0–30) / ΔGlucose(0–30); DIo = insulinogenic index × (1 / fasting insulin). Lower predicts higher future-diabetes risk. Near-neighbors: homa-beta, matsuda-index.');
    root.appendChild(num('Fasting (0-min) insulin (µU/mL)', 'dio-i0'));
    root.appendChild(num('30-min insulin (µU/mL)', 'dio-i30'));
    root.appendChild(num('Fasting (0-min) glucose (mg/dL)', 'dio-g0'));
    root.appendChild(num('30-min glucose (mg/dL)', 'dio-g30'));
    const o = out(); root.appendChild(o);
    wire(['dio-i0', 'dio-i30', 'dio-g0', 'dio-g30'], () => safe(o, () => {
      const r = M.oralDispositionIndex({ i0: val('dio-i0'), i30: val('dio-i30'), g0: val('dio-g0'), g30: val('dio-g30') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'DIo', value: `${r.value}` }, { label: 'Insulinogenic index', value: `${r.igi}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
