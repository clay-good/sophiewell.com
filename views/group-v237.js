// spec-v237 §2: renderers for the cardiology ECG / echo bedside calculators — the
// Romhilt-Estes LVH score, the Wilkins mitral-valve score, the mitral valve area
// by pressure half-time, the aortic dimensionless index, and the rate-pressure
// product. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardioecho-v237.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
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
const G14 = [['1', '1 (normal/mild)'], ['2', '2'], ['3', '3'], ['4', '4 (severe)']];

export const renderers = {
  'romhilt-estes'(root) {
    note(root, 'Romhilt-Estes LVH score (1968): voltage 3, ST-T strain 3 (1 on digitalis), LA abnormality 3, LAD 2, QRS >= 90 ms 1, intrinsicoid 1. >= 5 definite LVH. Near-neighbors: lvh-criteria.');
    root.appendChild(check('Voltage criterion met (3)', 're-volt'));
    root.appendChild(select('ST-T strain pattern', 're-stt', [['0', 'None (0)'], ['3', 'Typical, not on digitalis (3)'], ['1', 'Typical, on digitalis (1)']]));
    root.appendChild(check('Left atrial abnormality (3)', 're-la'));
    root.appendChild(check('Left axis deviation >= -30 deg (2)', 're-lad'));
    root.appendChild(check('QRS duration >= 90 ms (1)', 're-qrs'));
    root.appendChild(check('Intrinsicoid deflection V5/V6 >= 50 ms (1)', 're-intr'));
    const o = out(); root.appendChild(o);
    wire(['re-volt', 're-stt', 're-la', 're-lad', 're-qrs', 're-intr'], () => safe(o, () => {
      render(o, M.romhiltEstes({ voltage: chk('re-volt'), strain: val('re-stt'), laAbnormality: chk('re-la'), leftAxis: chk('re-lad'), qrs: chk('re-qrs'), intrinsicoid: chk('re-intr') }), 'RE');
    }));
    postureNote(root);
  },
  'wilkins-score'(root) {
    note(root, 'Wilkins mitral-valve echo score (1988): mobility + thickening + calcification + subvalvular, each 1-4 (4-16). <= 8 favorable for balloon valvuloplasty. Near-neighbors: mitral-valve-area-pht.');
    root.appendChild(select('Leaflet mobility', 'wk-mob', G14));
    root.appendChild(select('Leaflet thickening', 'wk-thick', G14));
    root.appendChild(select('Leaflet calcification', 'wk-calc', G14));
    root.appendChild(select('Subvalvular thickening', 'wk-sub', G14));
    const o = out(); root.appendChild(o);
    wire(['wk-mob', 'wk-thick', 'wk-calc', 'wk-sub'], () => safe(o, () => {
      render(o, M.wilkinsScore({ mobility: val('wk-mob'), thickening: val('wk-thick'), calcification: val('wk-calc'), subvalvular: val('wk-sub') }), 'Wilkins');
    }));
    postureNote(root);
  },
  'mitral-valve-area-pht'(root) {
    note(root, 'Mitral valve area = 220 / pressure half-time (ms). > 1.5 mild, 1.0-1.5 moderate, < 1.0 severe MS. Near-neighbors: wilkins-score.');
    root.appendChild(numInput('Pressure half-time (ms)', 'mva-pht', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['mva-pht'], () => safe(o, () => {
      render(o, M.mitralValveAreaPht({ pht: val('mva-pht') }), 'MVA');
    }));
    postureNote(root);
  },
  'aortic-dvi'(root) {
    note(root, 'Aortic dimensionless index = LVOT VTI / aortic-valve VTI (or peak velocities). <= 0.25 severe, 0.25-0.50 moderate, > 0.50 mild AS. Near-neighbors: aortic-valve-area.');
    root.appendChild(numInput('LVOT VTI (or peak velocity)', 'dvi-lvot', { min: '0' }));
    root.appendChild(numInput('Aortic-valve VTI (or peak velocity)', 'dvi-av', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['dvi-lvot', 'dvi-av'], () => safe(o, () => {
      render(o, M.aorticDvi({ lvot: val('dvi-lvot'), av: val('dvi-av') }), 'DVI');
    }));
    postureNote(root);
  },
  'rate-pressure-product'(root) {
    note(root, 'Rate-pressure product = heart rate x systolic BP; a myocardial oxygen-demand surrogate. Near-neighbors: map.');
    root.appendChild(numInput('Heart rate (bpm)', 'rpp-hr', { min: '0' }));
    root.appendChild(numInput('Systolic BP (mmHg)', 'rpp-sbp', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['rpp-hr', 'rpp-sbp'], () => safe(o, () => {
      render(o, M.ratePressureProduct({ hr: val('rpp-hr'), sbp: val('rpp-sbp') }), 'RPP');
    }));
    postureNote(root);
  },
};
