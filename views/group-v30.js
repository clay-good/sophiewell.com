// spec-v105 §2: renderers for the four peripheral-artery and cardiac-surgery-risk
// tiles (abi, rutherford-fontaine, wifi, euroscore2). The closing renderer of
// Wave 1 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. abi reads
// per-leg ankle/brachial pressures; rutherford-fontaine and wifi map a clinical
// picture / grade triple; euroscore2 sums the published logistic terms and renders
// them as a derivation. Each tile renders the spec-v50 §3 clinical posture note and
// frames its output as the cited rule's index / stage / mortality estimate -- none
// authors a revascularization, amputation, or operative order in Sophie's voice
// (spec-v11 §5.3); the operate / revascularize / amputate decision stays with the
// clinician and local protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vascular-v105.js';
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
function optNum(id) {
  const n = document.getElementById(id);
  return n && n.value !== '' ? Number(n.value) : null;
}
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The index, stage, and mortality estimate are the cited rule’s, computed from the inputs you entered; they estimate, not guarantee, an outcome. The revascularization, amputation, and operative decisions stay with the clinician, heart team, and local protocol.' }));
}
function derivation(root, caption, terms) {
  root.appendChild(el('p', { class: 'muted', text: caption }));
  root.appendChild(el('ul', {}, terms.map((t) => {
    const v = typeof t.value === 'number' && Number.isFinite(t.value)
      ? (t.value >= 0 ? `+${t.value}` : String(t.value))
      : '--';
    return el('li', { class: 'muted', text: `${t.label}: ${v}` });
  })));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const GRADE_0_3 = [
  { value: '0', text: 'Grade 0' },
  { value: '1', text: 'Grade 1' },
  { value: '2', text: 'Grade 2' },
  { value: '3', text: 'Grade 3' },
];

export const renderers = {
  // ----- 2.1 abi ---------------------------------------------------------
  abi(root) {
    root.appendChild(field('Right ankle systolic pressure (higher of DP / PT, mmHg)', 'abi-ra', { min: 0, max: 400, placeholder: '120' }));
    root.appendChild(field('Left ankle systolic pressure (higher of DP / PT, mmHg)', 'abi-la', { min: 0, max: 400, placeholder: '120' }));
    root.appendChild(field('Right brachial systolic pressure (mmHg)', 'abi-rb', { min: 0, max: 400, placeholder: '130' }));
    root.appendChild(field('Left brachial systolic pressure (mmHg)', 'abi-lb', { min: 0, max: 400, placeholder: '130' }));
    const o = out(); root.appendChild(o);
    wire(['abi-ra', 'abi-la', 'abi-rb', 'abi-lb'], () => safe(o, () => {
      const r = M.abi({
        rightAnkle: optNum('abi-ra'), leftAnkle: optNum('abi-la'),
        rightBrachial: optNum('abi-rb'), leftBrachial: optNum('abi-lb'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Right ABI', value: r.legs[0].value != null ? r.legs[0].value.toFixed(2) : '--' },
        { label: 'Left ABI', value: r.legs[1].value != null ? r.legs[1].value.toFixed(2) : '--' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 rutherford-fontaine ----------------------------------------
  'rutherford-fontaine'(root) {
    root.appendChild(selectField('Clinical picture', 'rf-pic', [
      { value: '', text: 'Select...' },
      { value: 'asymptomatic', text: 'Asymptomatic' },
      { value: 'mild-claudication', text: 'Mild claudication' },
      { value: 'moderate-claudication', text: 'Moderate claudication' },
      { value: 'severe-claudication', text: 'Severe claudication' },
      { value: 'rest-pain', text: 'Ischemic rest pain' },
      { value: 'minor-tissue-loss', text: 'Minor tissue loss (ulcer / focal gangrene)' },
      { value: 'major-tissue-loss', text: 'Major tissue loss (above transmetatarsal)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['rf-pic'], () => safe(o, () => {
      const r = M.rutherfordFontaine({ picture: selVal('rf-pic') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.rutherford >= 4 ? 'warn' : null },
        { label: 'Rutherford category', value: String(r.rutherford) },
        { label: 'Fontaine stage', value: r.fontaine },
      ]);
      note(o, r.clinical);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 wifi --------------------------------------------------------
  wifi(root) {
    root.appendChild(selectField('Wound (W) grade: 0 none, 1 small/shallow, 2 deeper ulcer/limited gangrene, 3 extensive', 'wifi-w', GRADE_0_3));
    root.appendChild(selectField('Ischemia (I) grade: 0 ABI >= 0.80, 1 ABI 0.6-0.79, 2 ABI 0.4-0.59, 3 ABI <= 0.39', 'wifi-i', GRADE_0_3));
    root.appendChild(selectField('foot Infection (fI) grade: 0 none, 1 local mild, 2 local moderate, 3 SIRS / sepsis', 'wifi-fi', GRADE_0_3));
    const o = out(); root.appendChild(o);
    wire(['wifi-w', 'wifi-i', 'wifi-fi'], () => safe(o, () => {
      const r = M.wifi({ wound: selVal('wifi-w'), ischemia: selVal('wifi-i'), infection: selVal('wifi-fi') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'WIfI grades', value: `W${r.wound} I${r.ischemia} fI${r.infection}` },
        { label: 'Clinical stage', value: String(r.stage) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 euroscore2 --------------------------------------------------
  euroscore2(root) {
    root.appendChild(field('Age (years)', 'es-age', { min: 0, max: 120, placeholder: '70' }));
    root.appendChild(checkField('Female sex', 'es-female'));
    root.appendChild(selectField('NYHA class', 'es-nyha', [
      { value: '1', text: 'I' }, { value: '2', text: 'II' }, { value: '3', text: 'III' }, { value: '4', text: 'IV' },
    ]));
    root.appendChild(checkField('CCS class 4 angina', 'es-ccs4'));
    root.appendChild(checkField('Insulin-dependent diabetes', 'es-ins'));
    root.appendChild(checkField('Chronic pulmonary dysfunction', 'es-cpd'));
    root.appendChild(checkField('Extracardiac arteriopathy', 'es-eca'));
    root.appendChild(checkField('Poor mobility (neuro/musculoskeletal)', 'es-mob'));
    root.appendChild(checkField('Previous cardiac surgery', 'es-redo'));
    root.appendChild(checkField('Active endocarditis', 'es-endo'));
    root.appendChild(checkField('Critical preoperative state', 'es-crit'));
    root.appendChild(checkField('Recent MI (within 90 days)', 'es-mi'));
    root.appendChild(checkField('Surgery on thoracic aorta', 'es-aorta'));
    root.appendChild(selectField('LV function / ejection fraction', 'es-lv', [
      { value: 'good', text: 'Good (> 50%)' },
      { value: 'moderate', text: 'Moderate (31-50%)' },
      { value: 'poor', text: 'Poor (21-30%)' },
      { value: 'very-poor', text: 'Very poor (<= 20%)' },
    ]));
    root.appendChild(selectField('Pulmonary artery systolic pressure', 'es-pa', [
      { value: 'none', text: 'Normal (< 31 mmHg)' },
      { value: 'moderate', text: 'Moderate (31-55 mmHg)' },
      { value: 'severe', text: 'Severe (> 55 mmHg)' },
    ]));
    root.appendChild(selectField('Renal impairment (Cockcroft-Gault CrCl)', 'es-renal', [
      { value: 'normal', text: 'CrCl > 85 mL/min' },
      { value: 'cc51-85', text: 'CrCl 51-85 mL/min' },
      { value: 'cc-le50', text: 'CrCl <= 50 mL/min (not on dialysis)' },
      { value: 'dialysis', text: 'On dialysis (any CrCl)' },
    ]));
    root.appendChild(selectField('Urgency', 'es-urg', [
      { value: 'elective', text: 'Elective' },
      { value: 'urgent', text: 'Urgent' },
      { value: 'emergency', text: 'Emergency' },
      { value: 'salvage', text: 'Salvage' },
    ]));
    root.appendChild(selectField('Weight of intervention', 'es-wt', [
      { value: 'cabg', text: 'Isolated CABG' },
      { value: 'single', text: 'Single non-CABG procedure' },
      { value: 'two', text: 'Two procedures' },
      { value: 'three', text: 'Three or more procedures' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['es-age', 'es-female', 'es-nyha', 'es-ccs4', 'es-ins', 'es-cpd', 'es-eca', 'es-mob', 'es-redo', 'es-endo', 'es-crit', 'es-mi', 'es-aorta', 'es-lv', 'es-pa', 'es-renal', 'es-urg', 'es-wt'];
    wire(ids, () => safe(o, () => {
      const r = M.euroScore2({
        age: optNum('es-age'), female: chk('es-female'), nyha: selVal('es-nyha'),
        ccs4: chk('es-ccs4'), insulinDiabetes: chk('es-ins'), chronicPulmonary: chk('es-cpd'),
        extracardiacArteriopathy: chk('es-eca'), poorMobility: chk('es-mob'),
        previousCardiacSurgery: chk('es-redo'), activeEndocarditis: chk('es-endo'),
        criticalPreop: chk('es-crit'), recentMi: chk('es-mi'), thoracicAorta: chk('es-aorta'),
        lvFunction: selVal('es-lv'), pulmonaryHypertension: selVal('es-pa'),
        renal: selVal('es-renal'), urgency: selVal('es-urg'), weightOfIntervention: selVal('es-wt'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Predicted mortality', value: `${r.mortality.toFixed(2)}%` },
        { label: 'Risk tier', value: r.tier },
      ]);
      derivation(o, 'Logistic terms (y = -5.324537 + sum; mortality = e^y / (1 + e^y)):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
