// spec-v228 §2: renderers for the microcytic-anemia RBC discrimination indices —
// England & Fraser, Sirdah, the RDW Index (RDWI), Srivastava, and Ehsani. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and the confirmatory
// testing (hemoglobin electrophoresis, iron studies) to the clinician and the
// patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mixed-v228.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Hemoglobin electrophoresis, iron studies, and the diagnosis stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Index', value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'england-fraser-index'(root) {
    note(root, 'England & Fraser (1973): DF = MCV - RBC - (5 x Hb) - 3.4. < 0 favors beta-thalassemia trait, > 0 favors iron deficiency. Near-neighbors: mentzer, sirdah-index.');
    root.appendChild(num('MCV (fL)', 'ef-mcv', { min: '0' }));
    root.appendChild(num('RBC count (10^6/µL)', 'ef-rbc', { min: '0' }));
    root.appendChild(num('Hemoglobin (g/dL)', 'ef-hb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ef-mcv', 'ef-rbc', 'ef-hb'], () => safe(o, () => {
      render(o, M.englandFraser({ mcv: val('ef-mcv'), rbc: val('ef-rbc'), hb: val('ef-hb') }));
    }));
    postureNote(root);
  },
  'sirdah-index'(root) {
    note(root, 'Sirdah (2008): MCV - RBC - (3 x Hb). < 27 favors beta-thalassemia trait, > 27 favors iron deficiency. Near-neighbors: england-fraser-index, ehsani-index.');
    root.appendChild(num('MCV (fL)', 'sd-mcv', { min: '0' }));
    root.appendChild(num('RBC count (10^6/µL)', 'sd-rbc', { min: '0' }));
    root.appendChild(num('Hemoglobin (g/dL)', 'sd-hb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['sd-mcv', 'sd-rbc', 'sd-hb'], () => safe(o, () => {
      render(o, M.sirdah({ mcv: val('sd-mcv'), rbc: val('sd-rbc'), hb: val('sd-hb') }));
    }));
    postureNote(root);
  },
  'rdw-index'(root) {
    note(root, 'RDW Index / RDWI (Jayabose 1999): (MCV x RDW) / RBC. < 220 favors beta-thalassemia trait, > 220 favors iron deficiency. Near-neighbors: mentzer, srivastava-index.');
    root.appendChild(num('MCV (fL)', 'rdwi-mcv', { min: '0' }));
    root.appendChild(num('RDW (%)', 'rdwi-rdw', { min: '0' }));
    root.appendChild(num('RBC count (10^6/µL)', 'rdwi-rbc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['rdwi-mcv', 'rdwi-rdw', 'rdwi-rbc'], () => safe(o, () => {
      render(o, M.rdwi({ mcv: val('rdwi-mcv'), rdw: val('rdwi-rdw'), rbc: val('rdwi-rbc') }));
    }));
    postureNote(root);
  },
  'srivastava-index'(root) {
    note(root, 'Srivastava (1973): MCH / RBC. < 3.8 favors beta-thalassemia trait, > 3.8 favors iron deficiency. Near-neighbors: mentzer, rdw-index.');
    root.appendChild(num('MCH (pg)', 'sv-mch', { min: '0' }));
    root.appendChild(num('RBC count (10^6/µL)', 'sv-rbc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['sv-mch', 'sv-rbc'], () => safe(o, () => {
      render(o, M.srivastava({ mch: val('sv-mch'), rbc: val('sv-rbc') }));
    }));
    postureNote(root);
  },
  'ehsani-index'(root) {
    note(root, 'Ehsani: MCV - (10 x RBC). < 15 favors beta-thalassemia trait, > 15 favors iron deficiency. Near-neighbors: mentzer, sirdah-index.');
    root.appendChild(num('MCV (fL)', 'eh-mcv', { min: '0' }));
    root.appendChild(num('RBC count (10^6/µL)', 'eh-rbc', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['eh-mcv', 'eh-rbc'], () => safe(o, () => {
      render(o, M.ehsani({ mcv: val('eh-mcv'), rbc: val('eh-rbc') }));
    }));
    postureNote(root);
  },
};
