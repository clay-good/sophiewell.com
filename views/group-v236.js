// spec-v236 §2: renderers for the ophthalmology / refractive calculators — the
// spherical equivalent, the vertex-distance conversion, the percent tissue altered,
// and the Randleman Ectasia Risk Score System. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ophtho-v236.js';
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
  'spherical-equivalent'(root) {
    note(root, 'Spherical equivalent = sphere + cylinder / 2. Near-neighbors: vertex-distance.');
    root.appendChild(numInput('Sphere (D)', 'se-sph'));
    root.appendChild(numInput('Cylinder (D)', 'se-cyl'));
    const o = out(); root.appendChild(o);
    wire(['se-sph', 'se-cyl'], () => safe(o, () => {
      render(o, M.sphericalEquivalent({ sphere: val('se-sph'), cylinder: val('se-cyl') }), 'SE');
    }));
    postureNote(root);
  },
  'vertex-distance'(root) {
    note(root, 'Vertex-corrected power = Fs / (1 - d·Fs), d in meters. Significant beyond ~+/-4 D. Near-neighbors: spherical-equivalent.');
    root.appendChild(numInput('Spectacle-plane power (D)', 'vx-power'));
    root.appendChild(numInput('Vertex distance (mm)', 'vx-mm', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['vx-power', 'vx-mm'], () => safe(o, () => {
      render(o, M.vertexDistance({ power: val('vx-power'), vertexMm: val('vx-mm') }), 'Fc');
    }));
    postureNote(root);
  },
  'percent-tissue-altered'(root) {
    note(root, 'PTA (Santhiago 2014) = (flap thickness + ablation depth) / central corneal thickness x 100. >= 40% high ectasia risk. Near-neighbors: randleman-erss.');
    root.appendChild(numInput('Flap thickness (um)', 'pta-flap', { min: '0' }));
    root.appendChild(numInput('Ablation depth (um)', 'pta-abl', { min: '0' }));
    root.appendChild(numInput('Central corneal thickness (um)', 'pta-cct', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['pta-flap', 'pta-abl', 'pta-cct'], () => safe(o, () => {
      render(o, M.percentTissueAltered({ flap: val('pta-flap'), ablation: val('pta-abl'), cct: val('pta-cct') }), 'PTA');
    }));
    postureNote(root);
  },
  'randleman-erss'(root) {
    note(root, 'Randleman ERSS (2008): topography + residual stromal bed + age + corneal thickness + MRSE, each 0-4. 0-2 low, 3 moderate, >= 4 high ectasia risk. Near-neighbors: percent-tissue-altered.');
    root.appendChild(select('Topography', 'er-topo', [['0', 'Normal / symmetric bowtie (0)'], ['2', 'Asymmetric bowtie (2)'], ['3', 'Inferior steepening / skewed axis (3)'], ['4', 'Abnormal (4)']]));
    root.appendChild(numInput('Residual stromal bed (um)', 'er-rsb', { min: '0' }));
    root.appendChild(numInput('Age (years)', 'er-age', { min: '0' }));
    root.appendChild(numInput('Central corneal thickness (um)', 'er-cct', { min: '0' }));
    root.appendChild(numInput('Manifest refraction spherical equivalent (D)', 'er-mrse'));
    const o = out(); root.appendChild(o);
    wire(['er-topo', 'er-rsb', 'er-age', 'er-cct', 'er-mrse'], () => safe(o, () => {
      render(o, M.randlemanErss({ topo: val('er-topo'), rsb: val('er-rsb'), age: val('er-age'), cct: val('er-cct'), mrse: val('er-mrse') }), 'ERSS');
    }));
    postureNote(root);
  },
};
