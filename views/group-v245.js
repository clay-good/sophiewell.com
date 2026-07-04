// spec-v245 §2: renderers for the hematology discrimination indices + HS severity
// — the Shine & Lal index, the Green & King index, the percent platelet recovery,
// and the IHS4 score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hemederm-v245.js';
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
  'shine-lal-index'(root) {
    note(root, 'Shine & Lal index (1977) = (MCV^2 x MCH) / 100. < 1530 suggests thalassemia trait. Near-neighbors: mentzer, green-king-index.');
    root.appendChild(numInput('MCV (fL)', 'sl-mcv', { min: '0' }));
    root.appendChild(numInput('MCH (pg)', 'sl-mch', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['sl-mcv', 'sl-mch'], () => safe(o, () => {
      render(o, M.shineLal({ mcv: val('sl-mcv'), mch: val('sl-mch') }), 'Shine-Lal');
    }));
    postureNote(root);
  },
  'green-king-index'(root) {
    note(root, 'Green & King index (1989) = (MCV^2 x RDW) / (Hb x 100). < 65 suggests thalassemia trait. Near-neighbors: shine-lal-index, mentzer.');
    root.appendChild(numInput('MCV (fL)', 'gk-mcv', { min: '0' }));
    root.appendChild(numInput('RDW (%)', 'gk-rdw', { min: '0' }));
    root.appendChild(numInput('Hemoglobin (g/dL)', 'gk-hb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['gk-mcv', 'gk-rdw', 'gk-hb'], () => safe(o, () => {
      render(o, M.greenKing({ mcv: val('gk-mcv'), rdw: val('gk-rdw'), hb: val('gk-hb') }), 'Green-King');
    }));
    postureNote(root);
  },
  'percent-platelet-recovery'(root) {
    note(root, 'PPR = [(post - pre) x blood volume] / platelets transfused. > 30% at 1 h = good response; low PPR suggests refractoriness. Near-neighbors: cci-platelet.');
    root.appendChild(numInput('Pre-transfusion platelet count (x10^9/L)', 'ppr-pre', { min: '0' }));
    root.appendChild(numInput('Post-transfusion platelet count (x10^9/L)', 'ppr-post', { min: '0' }));
    root.appendChild(numInput('Blood volume (L)', 'ppr-bv', { min: '0' }));
    root.appendChild(numInput('Platelets transfused (x10^11)', 'ppr-tx', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ppr-pre', 'ppr-post', 'ppr-bv', 'ppr-tx'], () => safe(o, () => {
      render(o, M.percentPlateletRecovery({ pre: val('ppr-pre'), post: val('ppr-post'), bloodVolume: val('ppr-bv'), transfused: val('ppr-tx') }), 'PPR');
    }));
    postureNote(root);
  },
  'ihs4'(root) {
    note(root, 'IHS4 (Zouboulis 2017) = nodules x 1 + abscesses x 2 + draining tunnels x 4. 0-3 mild, 4-10 moderate, >= 11 severe HS. Near-neighbors: hurley-stage, hiscr.');
    root.appendChild(numInput('Inflammatory nodules (count)', 'ihs4-nod', { min: '0' }));
    root.appendChild(numInput('Abscesses (count)', 'ihs4-abs', { min: '0' }));
    root.appendChild(numInput('Draining tunnels (count)', 'ihs4-tun', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ihs4-nod', 'ihs4-abs', 'ihs4-tun'], () => safe(o, () => {
      render(o, M.ihs4({ nodules: val('ihs4-nod'), abscesses: val('ihs4-abs'), tunnels: val('ihs4-tun') }), 'IHS4');
    }));
    postureNote(root);
  },
};
