// spec-v257 §2: renderers for the diving / hyperbaric-medicine formulas — the
// nitrox MOD, the nitrox EAD, and the pulmonary OTU. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dive-v257.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
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
  'maximum-operating-depth'(root) {
    note(root, 'Nitrox MOD = 10 x (PO2max / FO2 - 1) metres. PO2max typically 1.4 (working) / 1.6 (contingency). Near-neighbors: equivalent-air-depth.');
    root.appendChild(numInput('Oxygen fraction FO2 (e.g. 0.32 for EAN32)', 'mod-fo2', { min: '0', max: '1' }));
    root.appendChild(numInput('PO2 limit (bar, e.g. 1.4)', 'mod-po2', { min: '1', max: '2' }));
    const o = out(); root.appendChild(o);
    wire(['mod-fo2', 'mod-po2'], () => safe(o, () => {
      render(o, M.maximumOperatingDepth({ fo2: val('mod-fo2'), po2max: val('mod-po2') }), 'MOD');
    }));
    postureNote(root);
  },
  'equivalent-air-depth'(root) {
    note(root, 'Nitrox EAD = (depth + 10) x (FN2 / 0.79) - 10 metres, FN2 = 1 - FO2. For use with air decompression tables. Near-neighbors: maximum-operating-depth.');
    root.appendChild(numInput('Actual depth (m)', 'ead-depth', { min: '0' }));
    root.appendChild(numInput('Oxygen fraction FO2 (e.g. 0.32)', 'ead-fo2', { min: '0', max: '1' }));
    const o = out(); root.appendChild(o);
    wire(['ead-depth', 'ead-fo2'], () => safe(o, () => {
      render(o, M.equivalentAirDepth({ depth: val('ead-depth'), fo2: val('ead-fo2') }), 'EAD');
    }));
    postureNote(root);
  },
  'oxygen-toxicity-units'(root) {
    note(root, 'Pulmonary OTU = t x [(PO2 - 0.5) / 0.5]^0.83 (t minutes, PO2 ATA). Single-dive limit ~615. Near-neighbors: maximum-operating-depth.');
    root.appendChild(numInput('Oxygen partial pressure PO2 (ATA)', 'otu-po2', { min: '0' }));
    root.appendChild(numInput('Exposure time (minutes)', 'otu-time', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['otu-po2', 'otu-time'], () => safe(o, () => {
      render(o, M.oxygenToxicityUnits({ po2: val('otu-po2'), time: val('otu-time') }), 'OTU');
    }));
    postureNote(root);
  },
};
