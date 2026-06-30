// spec-v179 §2: renderers for the three polypharmacy-burden tiles of the
// spec-v172 Long-Term Care & Geriatric Assessment program — anticholinergic-
// burden (ACB) and anticholinergic-risk-scale (ARS) in Clinical Scoring & Risk
// (Group G), and drug-burden-index (DBI) in Clinical Math & Conversions (Group E,
// it returns a value). (medication-regimen-complexity is deferred — see
// lib/ltcga-v179.js.)
//
// Per the spec-v100 §2 clarification, none of these renders a drug database: the
// clinician reads each drug's level/point/dose from the published scale and enters
// the per-level counts (ACB/ARS) or per-drug doses (DBI). Every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The DBI
// ratio is δ>0-guarded; a blank/partial row surfaces a complete-the-fields
// fallback rather than NaN. Per the spec-v50 §3 posture note each defers the
// clinical decision to the clinician (spec-v11 §5.3) and never authors a dosing or
// deprescribing order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v179.js';
import { resultRow } from '../lib/result-copy.js';

function numField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function rawVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or index is the cited scale’s, derived from the medication inputs you enter; it is a cumulative-burden quantifier, not a diagnosis. The clinical decision — the deprescribing review, the alternative agent, and any dose change — stays with the pharmacist, the prescriber, and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const DBI_ROWS = 5;

export const renderers = {
  // ----- 2.1 anticholinergic-burden (ACB) ------------------------------------
  'anticholinergic-burden'(root) {
    note(root, 'Anticholinergic Cognitive Burden (ACB, Boustani 2008): read each current medication’s level from the published ACB list and enter how many the patient takes at each level. Total = 1×(level-1) + 2×(level-2) + 3×(level-3). ≥ 3 is commonly treated as clinically relevant. Complements beers-check and anticholinergic-risk-scale.');
    root.appendChild(numField('Number of level-1 (possible anticholinergic) drugs', 'acb-l1', { min: 0, placeholder: '0' }));
    root.appendChild(numField('Number of level-2 drugs', 'acb-l2', { min: 0, placeholder: '0' }));
    root.appendChild(numField('Number of level-3 (definite anticholinergic) drugs', 'acb-l3', { min: 0, placeholder: '0' }));
    const o = out(); root.appendChild(o);
    wire(['acb-l1', 'acb-l2', 'acb-l3'], () => safe(o, () => {
      const r = M.anticholinergicBurden({ level1Count: rawVal('acb-l1'), level2Count: rawVal('acb-l2'), level3Count: rawVal('acb-l3') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'ACB', value: `${r.total}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 anticholinergic-risk-scale (ARS) --------------------------------
  'anticholinergic-risk-scale'(root) {
    note(root, 'Anticholinergic Risk Scale (ARS, Rudolph 2008): read each current medication’s ARS point value (1, 2, or 3) from the published list and enter how many the patient takes at each value. Total = 1×(1-point) + 2×(2-point) + 3×(3-point). A higher total means greater anticholinergic adverse-effect risk; the scale defines no official cut. Companion to anticholinergic-burden.');
    root.appendChild(numField('Number of 1-point ARS drugs', 'ars-p1', { min: 0, placeholder: '0' }));
    root.appendChild(numField('Number of 2-point ARS drugs', 'ars-p2', { min: 0, placeholder: '0' }));
    root.appendChild(numField('Number of 3-point ARS drugs', 'ars-p3', { min: 0, placeholder: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ars-p1', 'ars-p2', 'ars-p3'], () => safe(o, () => {
      const r = M.anticholinergicRiskScale({ point1Count: rawVal('ars-p1'), point2Count: rawVal('ars-p2'), point3Count: rawVal('ars-p3') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'ARS', value: `${r.total}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 drug-burden-index (DBI, Group E) --------------------------------
  'drug-burden-index'(root) {
    note(root, 'Drug Burden Index (DBI, Hilmer 2007): for each anticholinergic or sedative medication, enter the daily dose taken (D) and the minimum recommended daily dose (δ). DBI = Σ D/(D + δ). A higher DBI predicts poorer physical and cognitive function. Each ratio is bounded below 1 and δ-guarded. Up to 5 drugs.');
    const ids = [];
    for (let i = 1; i <= DBI_ROWS; i += 1) {
      root.appendChild(numField(`Drug ${i}: daily dose taken (D)`, `dbi-d${i}`, { step: 'any', min: 0, placeholder: i === 1 ? 'e.g. 10' : '' }));
      root.appendChild(numField(`Drug ${i}: minimum recommended dose (δ)`, `dbi-min${i}`, { step: 'any', min: 0, placeholder: i === 1 ? 'e.g. 5' : '' }));
      ids.push(`dbi-d${i}`, `dbi-min${i}`);
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const drugs = [];
      for (let i = 1; i <= DBI_ROWS; i += 1) drugs.push({ dose: rawVal(`dbi-d${i}`), minDose: rawVal(`dbi-min${i}`) });
      const r = M.drugBurdenIndex({ drugs });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'DBI', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV179 = renderers;
