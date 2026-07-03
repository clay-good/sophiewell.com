// spec-v213 §2: renderers for the ED disposition & injury/physiology bedside
// instruments — HEART Pathway, Ottawa Heart Failure Risk Scale, Light's
// criteria, and the classic and revised Baux burn-mortality scores. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the admission / discharge / drainage
// / treatment decision to the clinician and the patient (spec-v11 §5.3) — these
// stratify and classify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acute-injury-v213.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function check(label, id) {
  const wrap = el('p');
  const box = el('input', { id, type: 'checkbox' });
  wrap.appendChild(box);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The admission, discharge, drainage, and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const OHFRS_FIELDS = [
  ['ohf-stroke', 'strokeTia', 'History of stroke or TIA (+1)'],
  ['ohf-intub', 'intubation', 'Prior intubation for respiratory distress (+2)'],
  ['ohf-hr-arr', 'hrArrival', 'Heart rate >= 110 on ED arrival (+2)'],
  ['ohf-spo2', 'spo2', 'SaO2 < 90% on arrival (+1)'],
  ['ohf-hr-walk', 'hrWalk', 'Heart rate >= 110 on 3-minute walk / too ill to walk (+1)'],
  ['ohf-ecg', 'ischemia', 'New ischemic changes on ECG (+2)'],
  ['ohf-urea', 'urea', 'Serum urea >= 12 mmol/L (+1)'],
  ['ohf-co2', 'co2', 'Serum CO2 >= 35 mmol/L (+2)'],
  ['ohf-trop', 'troponin', 'Troponin elevated to MI level (+2)'],
  ['ohf-bnp', 'ntprobnp', 'NT-proBNP >= 5000 ng/L (+1)'],
];

export const renderers = {
  // ----- 2.1 heart-pathway ---------------------------------------------------
  'heart-pathway'(root) {
    note(root, 'HEART Pathway (Mahler 2015): pairs the HEART score with serial troponin. HEART 0-3 AND a non-elevated troponin at 0 h and 3 h = low risk, an early-discharge candidate (~0.9-2% 30-day MACE); HEART >= 4 or any elevated troponin = not low risk. Enter the HEART score from the HEART tile. Near-neighbors: heart, timi.');
    root.appendChild(num('HEART score (0-10)', 'hp-heart', { min: '0', max: '10' }));
    root.appendChild(check('0-hour troponin elevated', 'hp-trop0'));
    root.appendChild(check('3-hour troponin elevated', 'hp-trop3'));
    const o = out(); root.appendChild(o);
    const ids = ['hp-heart', 'hp-trop0', 'hp-trop3'];
    wire(ids, () => safe(o, () => {
      const r = M.heartPathway({ heartScore: val('hp-heart'), trop0: chk('hp-trop0'), trop3: chk('hp-trop3') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Disposition', value: r.lowRisk ? 'early discharge candidate' : 'observe / test' }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ottawa-heart-failure --------------------------------------------
  'ottawa-heart-failure'(root) {
    note(root, 'Ottawa Heart Failure Risk Scale (Stiell 2013): 10 weighted items (0-15) for ED heart-failure patients. Serious-adverse-event risk rises from ~2.8% at 0 to ~89% at the high end; the authors recommend an admission threshold of > 1. Near-neighbors: adhere-hf, gwtg-hf.');
    for (const [id, , label] of OHFRS_FIELDS) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    const ids = OHFRS_FIELDS.map((f) => f[0]);
    wire(ids, () => safe(o, () => {
      const inp = {};
      for (const [id, key] of OHFRS_FIELDS) inp[key] = chk(id);
      const r = M.ottawaHf(inp);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'OHFRS', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 light-criteria --------------------------------------------------
  'light-criteria'(root) {
    note(root, "Light's criteria (Light 1972): a pleural effusion is an exudate if ANY of - pleural/serum protein ratio > 0.5; pleural/serum LDH ratio > 0.6; pleural LDH > two-thirds the upper limit of normal serum LDH. None met = transudate. Near-neighbors: saag, pleural-fluid.");
    root.appendChild(num('Pleural fluid total protein (g/dL)', 'lc-pprot', { min: '0' }));
    root.appendChild(num('Serum total protein (g/dL)', 'lc-sprot', { min: '0' }));
    root.appendChild(num('Pleural fluid LDH (IU/L)', 'lc-pldh', { min: '0' }));
    root.appendChild(num('Serum LDH (IU/L)', 'lc-sldh', { min: '0' }));
    root.appendChild(num('Upper limit of normal for serum LDH (IU/L)', 'lc-uln', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['lc-pprot', 'lc-sprot', 'lc-pldh', 'lc-sldh', 'lc-uln'];
    wire(ids, () => safe(o, () => {
      const r = M.lightCriteria({ pleuralProtein: val('lc-pprot'), serumProtein: val('lc-sprot'), pleuralLdh: val('lc-pldh'), serumLdh: val('lc-sldh'), serumLdhUln: val('lc-uln') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Classification', value: r.exudate ? 'exudate' : 'transudate' }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 baux-score ------------------------------------------------------
  'baux-score'(root) {
    note(root, 'Baux score (Baux 1961): burn mortality estimate = age + burned %TBSA. A score near 100 was near-universally fatal in the pre-modern era; modern burn care shifts survivable thresholds higher. Near-neighbors: revised-baux, burn-fluid.');
    root.appendChild(num('Age (years)', 'bx-age', { min: '0' }));
    root.appendChild(num('Burned total body surface area (%TBSA, 0-100)', 'bx-tbsa', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    const ids = ['bx-age', 'bx-tbsa'];
    wire(ids, () => safe(o, () => {
      const r = M.bauxScore({ age: val('bx-age'), tbsa: val('bx-tbsa') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Baux', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 revised-baux ----------------------------------------------------
  'revised-baux'(root) {
    note(root, 'Revised Baux score (Osler 2010): age + burned %TBSA + 17 if inhalation injury is present. The LD50 in the best modern burn units is a score of ~130-140. Reports the classic Baux too. Near-neighbors: baux-score, burn-fluid.');
    root.appendChild(num('Age (years)', 'rbx-age', { min: '0' }));
    root.appendChild(num('Burned total body surface area (%TBSA, 0-100)', 'rbx-tbsa', { min: '0', max: '100' }));
    root.appendChild(check('Inhalation injury present (+17)', 'rbx-inh'));
    const o = out(); root.appendChild(o);
    const ids = ['rbx-age', 'rbx-tbsa', 'rbx-inh'];
    wire(ids, () => safe(o, () => {
      const r = M.revisedBaux({ age: val('rbx-age'), tbsa: val('rbx-tbsa'), inhalation: chk('rbx-inh') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Revised Baux', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
