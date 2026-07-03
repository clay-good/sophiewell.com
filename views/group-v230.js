// spec-v230 §2: renderers for the prognostic inflammation indices — the
// lymphocyte-to-monocyte ratio, the systemic inflammation response index, the
// pan-immune-inflammation value, and the CRP-to-albumin ratio. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/inflam-v230.js';
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
  'lmr'(root) {
    note(root, 'Lymphocyte-to-monocyte ratio = ALC / AMC. A lower value is less favorable. Near-neighbors: nlr, siri.');
    root.appendChild(num('Absolute lymphocyte count (10³/µL)', 'lmr-alc', { min: '0' }));
    root.appendChild(num('Absolute monocyte count (10³/µL)', 'lmr-amc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['lmr-alc', 'lmr-amc'], () => safe(o, () => {
      render(o, M.lmr({ alc: val('lmr-alc'), amc: val('lmr-amc') }), 'LMR');
    }));
    postureNote(root);
  },
  'siri'(root) {
    note(root, 'Systemic inflammation response index = ANC x AMC / ALC (Qi 2016). Higher = more pro-inflammatory. Near-neighbors: sii, piv.');
    root.appendChild(num('Absolute neutrophil count (10³/µL)', 'siri-anc', { min: '0' }));
    root.appendChild(num('Absolute monocyte count (10³/µL)', 'siri-amc', { min: '0' }));
    root.appendChild(num('Absolute lymphocyte count (10³/µL)', 'siri-alc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['siri-anc', 'siri-amc', 'siri-alc'], () => safe(o, () => {
      render(o, M.siri({ anc: val('siri-anc'), amc: val('siri-amc'), alc: val('siri-alc') }), 'SIRI');
    }));
    postureNote(root);
  },
  'piv'(root) {
    note(root, 'Pan-immune-inflammation value = ANC x platelets x AMC / ALC (Fuca 2020). Higher = more pro-inflammatory. Near-neighbors: sii, siri.');
    root.appendChild(num('Absolute neutrophil count (10³/µL)', 'piv-anc', { min: '0' }));
    root.appendChild(num('Platelet count (10³/µL)', 'piv-plt', { min: '0' }));
    root.appendChild(num('Absolute monocyte count (10³/µL)', 'piv-amc', { min: '0' }));
    root.appendChild(num('Absolute lymphocyte count (10³/µL)', 'piv-alc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['piv-anc', 'piv-plt', 'piv-amc', 'piv-alc'], () => safe(o, () => {
      render(o, M.piv({ anc: val('piv-anc'), plt: val('piv-plt'), amc: val('piv-amc'), alc: val('piv-alc') }), 'PIV');
    }));
    postureNote(root);
  },
  'crp-albumin-ratio'(root) {
    note(root, 'CRP-to-albumin ratio = CRP (mg/L) / albumin (g/dL). Higher = greater inflammatory burden relative to nutrition. Near-neighbors: siri, nlr.');
    root.appendChild(num('C-reactive protein (mg/L)', 'car-crp', { min: '0' }));
    root.appendChild(num('Serum albumin (g/dL)', 'car-alb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['car-crp', 'car-alb'], () => safe(o, () => {
      render(o, M.car({ crp: val('car-crp'), albumin: val('car-alb') }), 'CAR');
    }));
    postureNote(root);
  },
};
