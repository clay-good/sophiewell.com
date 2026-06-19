// spec-v118 §2: renderers for the five hemorrhagic-stroke / SAH / IVH /
// unruptured-aneurysm instruments (modified-fisher, graeb-ivh, bat-score,
// phases, elapss). All five home in Clinical Scoring & Risk (Group G). v118 is a
// Wave 4 feature spec of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a grade, a
// burden score, or a rupture/growth/expansion-risk band, not management; none
// authors a coiling, clipping, surveillance, or surgical order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v118.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade, burden score, or risk band is the cited instrument’s, computed from the imaging read and values you entered. The coiling, clipping, surveillance, and surgical decisions stay with the neurosurgery / neurocritical-care team and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const GRAEB_LARGE_OPTS = [
  { value: '0', text: 'No blood (0)' },
  { value: '1', text: 'Trace (1)' },
  { value: '2', text: 'Less than half filled (2)' },
  { value: '3', text: 'More than half filled (3)' },
  { value: '4', text: 'Filled (4)' },
];
const GRAEB_HORN_OPTS = [
  { value: '0', text: 'No blood (0)' },
  { value: '1', text: 'Partially filled (1)' },
  { value: '2', text: 'Completely filled (2)' },
];

export const renderers = {
  // ----- 2.1 modified-fisher --------------------------------------------
  'modified-fisher'(root) {
    note(root, 'Modified Fisher Scale: grades the radiographic blood burden after aneurysmal subarachnoid hemorrhage to predict symptomatic vasospasm. Choose the cisternal SAH thickness and mark intraventricular hemorrhage. Frontera used a subjective thin-vs-thick read; the < 1 mm / >= 1 mm cutoff is a downstream convention. Grade 0-4.');
    root.appendChild(selectField('Cisternal subarachnoid blood', 'mf-sah', [
      { value: 'none', text: 'None' },
      { value: 'thin', text: 'Thin SAH (focal or diffuse)' },
      { value: 'thick', text: 'Thick SAH (focal or diffuse)' },
    ]));
    root.appendChild(checkField('Intraventricular hemorrhage present', 'mf-ivh'));
    const o = out(); root.appendChild(o);
    wire(['mf-sah', 'mf-ivh'], () => safe(o, () => {
      const r = M.modifiedFisher({ sah: selVal('mf-sah'), ivh: chk('mf-ivh') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Modified Fisher', value: `grade ${r.grade}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 graeb-ivh --------------------------------------------------
  'graeb-ivh'(root) {
    note(root, 'Modified Graeb Score: intraventricular-hemorrhage burden across eight compartments, total 0-32. Grade the fill of each lateral ventricle, the third and fourth ventricles (0-4), and the occipital and temporal horns (0-2); add the expansion checkbox for any compartment expanded beyond its normal anatomic limits by clot (+1 each).');
    const large = [
      ['gr-rl', 'rightLateral', 'Right lateral ventricle'],
      ['gr-ll', 'leftLateral', 'Left lateral ventricle'],
      ['gr-3', 'third', 'Third ventricle'],
      ['gr-4', 'fourth', 'Fourth ventricle'],
    ];
    const horns = [
      ['gr-ro', 'rightOccipital', 'Right occipital horn'],
      ['gr-lo', 'leftOccipital', 'Left occipital horn'],
      ['gr-rt', 'rightTemporal', 'Right temporal horn'],
      ['gr-lt', 'leftTemporal', 'Left temporal horn'],
    ];
    for (const [id, , label] of large) {
      root.appendChild(selectField(label, id, GRAEB_LARGE_OPTS));
      root.appendChild(checkField(`${label}: expanded by clot -- +1`, `${id}-exp`));
    }
    for (const [id, , label] of horns) {
      root.appendChild(selectField(label, id, GRAEB_HORN_OPTS));
      root.appendChild(checkField(`${label}: expanded by clot -- +1`, `${id}-exp`));
    }
    const o = out(); root.appendChild(o);
    const all = [...large, ...horns];
    const ids = all.flatMap((c) => [c[0], `${c[0]}-exp`]);
    wire(ids, () => safe(o, () => {
      const arg = {};
      for (const [id, key] of all) { const v = selVal(id); arg[key] = v === '' ? 0 : Number(v); arg[`${key}Exp`] = chk(`${id}-exp`); }
      const r = M.graebIvh(arg);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Modified Graeb', value: `${r.total}/32` },
      ]);
      note(o, `Compartments scored: ${r.scored}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 bat-score --------------------------------------------------
  'bat-score'(root) {
    note(root, 'BAT score: hematoma-expansion risk in intracerebral hemorrhage from three non-contrast CT markers. Mark the blend sign, any intrahematoma hypodensity, and onset-to-NCCT under 2.5 hours. Total 0-5; the validated cutoff is 3 or more.');
    root.appendChild(checkField('Blend sign present -- +1', 'bt-blend'));
    root.appendChild(checkField('Any intrahematoma hypodensity present -- +2', 'bt-hypo'));
    root.appendChild(checkField('Onset-to-baseline-NCCT < 2.5 hours -- +2', 'bt-timing'));
    const o = out(); root.appendChild(o);
    wire(['bt-blend', 'bt-hypo', 'bt-timing'], () => safe(o, () => {
      const r = M.batScore({ blend: chk('bt-blend'), hypodensity: chk('bt-hypo'), timing: chk('bt-timing') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'BAT', value: `${r.total}/5` },
      ]);
      note(o, `Markers present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 phases -----------------------------------------------------
  'phases'(root) {
    note(root, 'PHASES score: 5-year cumulative rupture risk of an unruptured intracranial aneurysm. Choose the population and aneurysm site, enter the age and aneurysm size, and mark the hypertension and earlier-SAH items. Total 0-22.');
    root.appendChild(selectField('Population', 'ph-pop', [
      { value: 'na', text: 'North American / European (0)' },
      { value: 'japanese', text: 'Japanese (+3)' },
      { value: 'finnish', text: 'Finnish (+5)' },
    ]));
    root.appendChild(checkField('Hypertension -- +1', 'ph-htn'));
    root.appendChild(field('Age (years)', 'ph-age', { min: 0, placeholder: 'e.g. 72' }));
    root.appendChild(field('Aneurysm size (mm)', 'ph-size', { step: '0.1', min: 0, placeholder: 'e.g. 8' }));
    root.appendChild(checkField('Earlier SAH from a different aneurysm -- +1', 'ph-sah'));
    root.appendChild(selectField('Site of aneurysm', 'ph-site', [
      { value: 'ica', text: 'Internal carotid artery (0)' },
      { value: 'mca', text: 'Middle cerebral artery (+2)' },
      { value: 'acaPcomPost', text: 'ACA / Pcom / posterior circulation (+4)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ph-pop', 'ph-htn', 'ph-age', 'ph-size', 'ph-sah', 'ph-site'], () => safe(o, () => {
      const r = M.phases({
        population: selVal('ph-pop'), htn: chk('ph-htn'), age: optNum('ph-age'),
        size: optNum('ph-size'), earlierSah: chk('ph-sah'), site: selVal('ph-site'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PHASES', value: `${r.total}/22` },
        { label: '5-yr rupture', value: `~${r.risk}` },
      ]);
      note(o, `Points counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 elapss -----------------------------------------------------
  'elapss'(root) {
    note(root, 'ELAPSS score: 3- and 5-year cumulative growth risk of an unruptured intracranial aneurysm. Choose the earlier-SAH, location, population, and shape items, and enter the age and aneurysm size. Note: NO earlier SAH adds +1. Published total range 0-40.');
    root.appendChild(selectField('Earlier subarachnoid hemorrhage', 'el-sah', [
      { value: 'no', text: 'No (+1)' },
      { value: 'yes', text: 'Yes (0)' },
    ]));
    root.appendChild(selectField('Location of aneurysm', 'el-loc', [
      { value: 'icaAcaAcom', text: 'ICA / ACA / ACOM (0)' },
      { value: 'mca', text: 'Middle cerebral artery (+3)' },
      { value: 'pcomPost', text: 'PCOM / posterior circulation (+5)' },
    ]));
    root.appendChild(field('Age (years)', 'el-age', { min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(selectField('Population', 'el-pop', [
      { value: 'na', text: 'North America / China / Europe (0)' },
      { value: 'japan', text: 'Japan (+1)' },
      { value: 'finland', text: 'Finland (+7)' },
    ]));
    root.appendChild(field('Aneurysm size (mm)', 'el-size', { step: '0.1', min: 0, placeholder: 'e.g. 6' }));
    root.appendChild(checkField('Irregular shape -- +4', 'el-irregular'));
    const o = out(); root.appendChild(o);
    wire(['el-sah', 'el-loc', 'el-age', 'el-pop', 'el-size', 'el-irregular'], () => safe(o, () => {
      const r = M.elapss({
        earlierSah: selVal('el-sah') === 'yes', location: selVal('el-loc'),
        age: optNum('el-age'), population: selVal('el-pop'),
        size: optNum('el-size'), irregular: chk('el-irregular'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ELAPSS', value: `${r.total}/40` },
        { label: 'Growth 3/5-yr', value: `~${r.riskThree} / ~${r.riskFive}` },
      ]);
      note(o, `Points counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
