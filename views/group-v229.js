// spec-v229 §2: renderers for the CBC-derived count & inflammation indices — the
// absolute eosinophil count and the neutrophil-to-lymphocyte, platelet-to-
// lymphocyte, and systemic immune-inflammation ratios. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hematology-v229.js';
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
  'aec'(root) {
    note(root, 'Absolute eosinophil count = WBC x eosinophil %. Bands: < 500 normal, 500-1500 mild, 1500-5000 moderate, > 5000 severe (cells/µL); >= 1500 = hypereosinophilia. Near-neighbors: nlr, anc.');
    root.appendChild(num('Total WBC (10³/µL)', 'aec-wbc', { min: '0' }));
    root.appendChild(num('Eosinophils (%)', 'aec-eos', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['aec-wbc', 'aec-eos'], () => safe(o, () => {
      render(o, M.aec({ wbc: val('aec-wbc'), eosPct: val('aec-eos') }), 'AEC');
    }));
    postureNote(root);
  },
  'nlr'(root) {
    note(root, 'Neutrophil-to-lymphocyte ratio = ANC / ALC (Zahorec 2001). Healthy reference roughly 1-3; > 3 commonly regarded as elevated. Near-neighbors: plr, sii.');
    root.appendChild(num('Absolute neutrophil count (10³/µL)', 'nlr-anc', { min: '0' }));
    root.appendChild(num('Absolute lymphocyte count (10³/µL)', 'nlr-alc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['nlr-anc', 'nlr-alc'], () => safe(o, () => {
      render(o, M.nlr({ anc: val('nlr-anc'), alc: val('nlr-alc') }), 'NLR');
    }));
    postureNote(root);
  },
  'plr'(root) {
    note(root, 'Platelet-to-lymphocyte ratio = platelets / ALC (Gasparyan 2019). Commonly cited healthy values below roughly 180. Near-neighbors: nlr, sii.');
    root.appendChild(num('Platelet count (10³/µL)', 'plr-plt', { min: '0' }));
    root.appendChild(num('Absolute lymphocyte count (10³/µL)', 'plr-alc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['plr-plt', 'plr-alc'], () => safe(o, () => {
      render(o, M.plr({ plt: val('plr-plt'), alc: val('plr-alc') }), 'PLR');
    }));
    postureNote(root);
  },
  'sii'(root) {
    note(root, 'Systemic immune-inflammation index = platelets x ANC / ALC (Hu 2014). Higher values reflect a more pro-inflammatory state; no universal cutoff. Near-neighbors: nlr, plr.');
    root.appendChild(num('Platelet count (10³/µL)', 'sii-plt', { min: '0' }));
    root.appendChild(num('Absolute neutrophil count (10³/µL)', 'sii-anc', { min: '0' }));
    root.appendChild(num('Absolute lymphocyte count (10³/µL)', 'sii-alc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['sii-plt', 'sii-anc', 'sii-alc'], () => safe(o, () => {
      render(o, M.sii({ plt: val('sii-plt'), anc: val('sii-anc'), alc: val('sii-alc') }), 'SII');
    }));
    postureNote(root);
  },
};
