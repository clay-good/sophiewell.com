// spec-v117 §2: renderers for the six acute-stroke imaging-prognosis and
// thrombolysis-risk instruments (aspects, ich-volume-abc2, dragon-stroke,
// hat-score, sedan-score, thrive-stroke). Five home in Clinical Scoring & Risk
// (Group G); ich-volume-abc2 is Clinical Math & Conversions (Group E). v117
// opens Wave 4 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames an imaging
// score, a hematoma volume, or a prognostic/hemorrhage-risk band, not management;
// none authors a thrombolysis, thrombectomy, surveillance, or surgical order in
// Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v117.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, volume, or risk band is the cited instrument’s, computed from the imaging read and values you entered. The thrombolysis, thrombectomy, surveillance, and surgical decisions stay with the stroke team and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 aspects ----------------------------------------------------
  'aspects'(root) {
    note(root, 'Alberta Stroke Program Early CT Score: a 10-point topographic read of early ischemic change on the baseline non-contrast CT. Check each MCA-territory region showing early change; the score is 10 minus the regions checked.');
    const regions = [
      ['as-c', 'caudate', 'caudate'],
      ['as-l', 'lentiform', 'lentiform nucleus'],
      ['as-ic', 'internalCapsule', 'internal capsule'],
      ['as-i', 'insula', 'insular ribbon'],
      ['as-m1', 'm1', 'M1 (anterior MCA cortex)'],
      ['as-m2', 'm2', 'M2 (MCA cortex lateral to insula)'],
      ['as-m3', 'm3', 'M3 (posterior MCA cortex)'],
      ['as-m4', 'm4', 'M4 (anterior MCA, superior to M1)'],
      ['as-m5', 'm5', 'M5 (lateral MCA, superior to M2)'],
      ['as-m6', 'm6', 'M6 (posterior MCA, superior to M3)'],
    ];
    for (const [id, , label] of regions) root.appendChild(checkField(`${label} -- early ischemic change`, id));
    const o = out(); root.appendChild(o);
    wire(regions.map((r) => r[0]), () => safe(o, () => {
      const arg = {};
      for (const [id, key] of regions) arg[key] = chk(id);
      const r = M.aspects(arg);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ASPECTS', value: `${r.score}/10` },
      ]);
      note(o, `Regions with early ischemic change: ${r.regions}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ich-volume-abc2 --------------------------------------------
  'ich-volume-abc2'(root) {
    note(root, 'ABC/2 intracerebral hemorrhage volume: the ellipsoid bedside estimate from three orthogonal CT diameters. Volume (mL) = A x B x C / 2 with all lengths in cm. C is the vertical extent (measured, or slices with hemorrhage times slice thickness).');
    root.appendChild(field('A -- greatest diameter on the largest slice (cm)', 'iv-a', { step: '0.1', min: 0, placeholder: 'e.g. 5' }));
    root.appendChild(field('B -- diameter perpendicular to A on that slice (cm)', 'iv-b', { step: '0.1', min: 0, placeholder: 'e.g. 4' }));
    root.appendChild(field('C -- vertical extent (cm)', 'iv-c', { step: '0.1', min: 0, placeholder: 'e.g. 3' }));
    const o = out(); root.appendChild(o);
    wire(['iv-a', 'iv-b', 'iv-c'], () => safe(o, () => {
      const r = M.ichVolumeAbc2({ a: optNum('iv-a'), b: optNum('iv-b'), c: optNum('iv-c') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Volume', value: `${r.volume} mL` },
      ]);
      note(o, `Computed as ${r.detail}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 dragon-stroke ----------------------------------------------
  'dragon-stroke'(root) {
    note(root, 'DRAGON score: 3-month functional outcome after IV thrombolysis. Enter the age, onset-to-treatment time, and baseline NIHSS, choose the CT finding, and mark the prestroke-mRS and glucose items. Total 0-10.');
    root.appendChild(selectField('Baseline CT: dense cerebral artery sign / early infarct signs', 'dr-ct', [
      { value: 'neither', text: 'Neither present (0)' },
      { value: 'either', text: 'One present (+1)' },
      { value: 'both', text: 'Both present (+2)' },
    ]));
    root.appendChild(checkField('Prestroke modified Rankin Scale > 1 -- +1', 'dr-mrs'));
    root.appendChild(field('Age (years)', 'dr-age', { min: 0, placeholder: 'e.g. 72' }));
    root.appendChild(checkField('Baseline glucose > 8 mmol/L (> 144 mg/dL) -- +1', 'dr-glu'));
    root.appendChild(field('Onset-to-treatment time (min)', 'dr-ott', { min: 0, placeholder: 'e.g. 120' }));
    root.appendChild(field('Baseline NIHSS', 'dr-nihss', { min: 0, placeholder: 'e.g. 12' }));
    const o = out(); root.appendChild(o);
    wire(['dr-ct', 'dr-mrs', 'dr-age', 'dr-glu', 'dr-ott', 'dr-nihss'], () => safe(o, () => {
      const r = M.dragonStroke({
        ct: selVal('dr-ct'), mrs: chk('dr-mrs'), age: optNum('dr-age'),
        glucose: chk('dr-glu'), onset: optNum('dr-ott'), nihss: optNum('dr-nihss'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'DRAGON', value: `${r.total}/10` },
        { label: 'Prognosis', value: r.tier },
      ]);
      note(o, `Points counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 hat-score --------------------------------------------------
  'hat-score'(root) {
    note(root, 'HAT score: hemorrhage after IV thrombolysis. Enter the baseline NIHSS, choose the CT hypodensity extent, and mark the diabetes / glucose item. Total 0-5.');
    root.appendChild(field('Baseline NIHSS', 'ht-nihss', { min: 0, placeholder: 'e.g. 18' }));
    root.appendChild(selectField('Hypodensity on initial CT', 'ht-hypo', [
      { value: 'none', text: 'None (0)' },
      { value: 'third', text: '<= 1/3 of the MCA territory (+1)' },
      { value: 'more', text: '> 1/3 of the MCA territory (+2)' },
    ]));
    root.appendChild(checkField('History of diabetes OR admission glucose > 200 mg/dL -- +1', 'ht-dm'));
    const o = out(); root.appendChild(o);
    wire(['ht-nihss', 'ht-hypo', 'ht-dm'], () => safe(o, () => {
      const r = M.hatScore({ nihss: optNum('ht-nihss'), hypodensity: selVal('ht-hypo'), diabetes: chk('ht-dm') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'HAT', value: `${r.total}/5` },
        { label: 'Symptomatic ICH', value: `~${r.sich}` },
      ]);
      note(o, `Points counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 sedan-score ------------------------------------------------
  'sedan-score'(root) {
    note(root, 'SEDAN score: symptomatic ICH after IV thrombolysis. Choose the glucose band, enter the age and baseline NIHSS, and mark the early-infarct and dense-artery items. Total 0-6.');
    root.appendChild(selectField('Baseline blood glucose', 'se-glu', [
      { value: 'low', text: '<= 8.0 mmol/L (<= 144 mg/dL) (0)' },
      { value: 'mid', text: '8.1-12.0 mmol/L (145-216 mg/dL) (+1)' },
      { value: 'high', text: '> 12.0 mmol/L (> 216 mg/dL) (+2)' },
    ]));
    root.appendChild(checkField('Early infarct signs on admission CT -- +1', 'se-early'));
    root.appendChild(checkField('(hyper)dense cerebral artery sign -- +1', 'se-dense'));
    root.appendChild(field('Age (years)', 'se-age', { min: 0, placeholder: 'e.g. 80' }));
    root.appendChild(field('Baseline NIHSS', 'se-nihss', { min: 0, placeholder: 'e.g. 12' }));
    const o = out(); root.appendChild(o);
    wire(['se-glu', 'se-early', 'se-dense', 'se-age', 'se-nihss'], () => safe(o, () => {
      const r = M.sedanScore({
        glucose: selVal('se-glu'), early: chk('se-early'), dense: chk('se-dense'),
        age: optNum('se-age'), nihss: optNum('se-nihss'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SEDAN', value: `${r.total}/6` },
        { label: 'Symptomatic ICH', value: `~${r.sich}` },
      ]);
      note(o, `Points counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 thrive-stroke ----------------------------------------------
  'thrive-stroke'(root) {
    note(root, 'THRIVE score: long-term outcome after ischemic stroke. Enter the baseline NIHSS and age, and mark the hypertension, diabetes, and atrial-fibrillation items. Total 0-9.');
    root.appendChild(field('Baseline NIHSS', 'tv-nihss', { min: 0, placeholder: 'e.g. 16' }));
    root.appendChild(field('Age (years)', 'tv-age', { min: 0, placeholder: 'e.g. 78' }));
    root.appendChild(checkField('Hypertension -- +1', 'tv-htn'));
    root.appendChild(checkField('Diabetes mellitus -- +1', 'tv-dm'));
    root.appendChild(checkField('Atrial fibrillation -- +1', 'tv-af'));
    const o = out(); root.appendChild(o);
    wire(['tv-nihss', 'tv-age', 'tv-htn', 'tv-dm', 'tv-af'], () => safe(o, () => {
      const r = M.thriveStroke({
        nihss: optNum('tv-nihss'), age: optNum('tv-age'),
        htn: chk('tv-htn'), diabetes: chk('tv-dm'), afib: chk('tv-af'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'THRIVE', value: `${r.total}/9` },
        { label: 'Risk', value: r.tier },
      ]);
      note(o, `Points counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
