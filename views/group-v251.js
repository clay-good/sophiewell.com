// spec-v251 §2: renderers for the cardiometabolic formulas — the corrected TIMI
// frame count, the Tp-e/QT ratio, SPISE, and the atherogenic index of plasma. Group
// G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardiometab-v251.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
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
  'corrected-timi-frame-count'(root) {
    note(root, 'Corrected TIMI frame count (Gibson 1996): frames to distal landmark, normalized to 30 fps; LAD divided by 1.7. Normal ~21. Near-neighbors: timi-stemi.');
    root.appendChild(numInput('Frame count to distal landmark', 'ctfc-frames', { min: '0' }));
    root.appendChild(numInput('Acquisition frame rate (frames/s)', 'ctfc-fps', { min: '0' }));
    root.appendChild(select('Vessel', 'ctfc-vessel', [['other', 'RCA or LCx'], ['lad', 'LAD (÷ 1.7)']]));
    const o = out(); root.appendChild(o);
    wire(['ctfc-frames', 'ctfc-fps', 'ctfc-vessel'], () => safe(o, () => {
      render(o, M.correctedTimiFrameCount({ frames: val('ctfc-frames'), fps: val('ctfc-fps'), vessel: val('ctfc-vessel') }), 'cTFC');
    }));
    postureNote(root);
  },
  'tpe-qt-ratio'(root) {
    note(root, 'Tp-e/QT ratio (Gupta 2008): T-peak-to-T-end / QT, a repolarization-dispersion marker. Reference ~0.21; > 0.25 increased. Near-neighbors: qtc-suite.');
    root.appendChild(numInput('Tp-e interval (ms)', 'tpe-tpe', { min: '0' }));
    root.appendChild(numInput('QT interval (ms)', 'tpe-qt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['tpe-tpe', 'tpe-qt'], () => safe(o, () => {
      render(o, M.tpeQtRatio({ tpe: val('tpe-tpe'), qt: val('tpe-qt') }), 'Tp-e/QT');
    }));
    postureNote(root);
  },
  'spise'(root) {
    note(root, 'SPISE (Paulmichl 2016) = 600 x HDL^0.185 / (TG^0.2 x BMI^1.338), lipids in mg/dL. < 5.4 suggests insulin resistance (adolescents). Near-neighbors: homa-ir, tyg-index.');
    root.appendChild(numInput('HDL cholesterol (mg/dL)', 'spise-hdl', { min: '0' }));
    root.appendChild(numInput('Triglycerides (mg/dL)', 'spise-tg', { min: '0' }));
    root.appendChild(numInput('BMI (kg/m^2)', 'spise-bmi', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['spise-hdl', 'spise-tg', 'spise-bmi'], () => safe(o, () => {
      render(o, M.spise({ hdl: val('spise-hdl'), tg: val('spise-tg'), bmi: val('spise-bmi') }), 'SPISE');
    }));
    postureNote(root);
  },
  'atherogenic-index-of-plasma'(root) {
    note(root, 'Atherogenic index of plasma (Dobiasova 2001) = log10(TG / HDL), mmol/L. < 0.11 low, 0.11-0.21 intermediate, > 0.21 high CV risk. Near-neighbors: tyg-index, non-hdl-remnant.');
    root.appendChild(numInput('Triglycerides (mmol/L)', 'aip-tg', { min: '0' }));
    root.appendChild(numInput('HDL cholesterol (mmol/L)', 'aip-hdl', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['aip-tg', 'aip-hdl'], () => safe(o, () => {
      render(o, M.atherogenicIndexOfPlasma({ tg: val('aip-tg'), hdl: val('aip-hdl') }), 'AIP');
    }));
    postureNote(root);
  },
};
