// spec-v106 §2: renderers for the six VTE-workup tiles (peged, 4peps, bova-pe,
// hestia, geneva-original, constans-uedvt). The first Wave-2 renderer module of
// the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. peged
// and 4peps select a D-dimer strategy; bova-pe, hestia, geneva-original, and
// constans-uedvt sum criteria/threshold logic. Each tile renders the spec-v50 §3
// clinical posture note and frames its output as the cited rule's verdict / score
// / band -- none authors an imaging, anticoagulation, or admission order in
// Sophie's voice (spec-v11 §5.3); the image / treat / admit decision stays with
// the clinician and local protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vte-v106.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The verdict, score, and probability band are the cited rule’s, computed from the inputs you entered; they estimate, not guarantee, an outcome. The imaging, anticoagulation, and admission decisions stay with the clinician and local protocol.' }));
}
function derivation(root, caption, terms) {
  if (!terms || !terms.length) return;
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

export const renderers = {
  // ----- 2.1 peged ------------------------------------------------------
  peged(root) {
    root.appendChild(selectField('Clinical pretest probability (C-PTP, by Wells)', 'pg-tier', [
      { value: '', text: 'Select...' },
      { value: 'low', text: 'Low (Wells 0-4)' },
      { value: 'moderate', text: 'Moderate (Wells 4.5-6)' },
      { value: 'high', text: 'High (Wells > 6)' },
    ]));
    root.appendChild(field('Measured D-dimer (ng/mL FEU)', 'pg-dd', { min: 0, max: 50000, placeholder: '600' }));
    const o = out(); root.appendChild(o);
    wire(['pg-tier', 'pg-dd'], () => safe(o, () => {
      const r = M.peged({ tier: selVal('pg-tier'), dDimer: optNum('pg-dd') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'C-PTP tier', value: r.tier },
        { label: 'Verdict', value: r.tier === 'high' ? 'image' : (r.excluded ? 'PE excluded' : 'image') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 4peps ------------------------------------------------------
  '4peps'(root) {
    root.appendChild(field('Age (years)', 'pp-age', { min: 0, max: 120, placeholder: '55' }));
    root.appendChild(field('Heart rate (beats/min)', 'pp-hr', { min: 0, max: 300, placeholder: '88' }));
    root.appendChild(field('Pulse-oximetry O2 saturation (%)', 'pp-spo2', { min: 0, max: 100, placeholder: '97' }));
    root.appendChild(checkField('Male sex', 'pp-male'));
    root.appendChild(checkField('Chronic respiratory disease', 'pp-resp'));
    root.appendChild(checkField('Chest pain AND acute dyspnea', 'pp-cpd'));
    root.appendChild(checkField('Hormonal estrogenic treatment', 'pp-est'));
    root.appendChild(checkField('Prior VTE (DVT or PE)', 'pp-vte'));
    root.appendChild(checkField('Syncope', 'pp-syn'));
    root.appendChild(checkField('Immobility or surgery within 4 weeks', 'pp-imm'));
    root.appendChild(checkField('Calf pain and/or unilateral lower-limb edema', 'pp-calf'));
    root.appendChild(checkField('PE is the most likely diagnosis', 'pp-pe'));
    const o = out(); root.appendChild(o);
    const ids = ['pp-age', 'pp-hr', 'pp-spo2', 'pp-male', 'pp-resp', 'pp-cpd', 'pp-est', 'pp-vte', 'pp-syn', 'pp-imm', 'pp-calf', 'pp-pe'];
    wire(ids, () => safe(o, () => {
      const r = M.fourPeps({
        age: optNum('pp-age'), heartRate: optNum('pp-hr'), spo2: optNum('pp-spo2'),
        male: chk('pp-male'), chronicResp: chk('pp-resp'), chestPainDyspnea: chk('pp-cpd'),
        estrogen: chk('pp-est'), priorVte: chk('pp-vte'), syncope: chk('pp-syn'),
        immobility: chk('pp-imm'), calfPainEdema: chk('pp-calf'), peMostLikely: chk('pp-pe'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: '4PEPS total', value: (r.total >= 0 ? '+' : '') + r.total },
        { label: 'Probability', value: r.tier },
      ]);
      derivation(o, 'Scored items:', r.terms.filter((t) => t.value !== 0));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 bova-pe ----------------------------------------------------
  'bova-pe'(root) {
    root.appendChild(checkField('Systolic BP 90-100 mmHg', 'bv-sbp'));
    root.appendChild(checkField('Elevated cardiac troponin', 'bv-trop'));
    root.appendChild(checkField('RV dysfunction (echocardiography or CT)', 'bv-rv'));
    root.appendChild(checkField('Heart rate >= 110 beats/min', 'bv-hr'));
    const o = out(); root.appendChild(o);
    wire(['bv-sbp', 'bv-trop', 'bv-rv', 'bv-hr'], () => safe(o, () => {
      const r = M.bovaPe({ sbp90to100: chk('bv-sbp'), troponin: chk('bv-trop'), rvDysfunction: chk('bv-rv'), hr110: chk('bv-hr') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Bova Score', value: String(r.total) },
        { label: 'Stage', value: r.stage },
      ]);
      derivation(o, 'Scored items (total 0-7):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 hestia -----------------------------------------------------
  hestia(root) {
    const items = [
      ['Hemodynamically unstable', 'he-unstable'],
      ['Thrombolysis or embolectomy needed', 'he-thromb'],
      ['Active bleeding or high bleeding risk', 'he-bleed'],
      ['> 24 h oxygen needed to keep SaO2 > 90%', 'he-o2'],
      ['PE diagnosed while on anticoagulation', 'he-anticoag'],
      ['Severe pain needing IV analgesia > 24 h', 'he-pain'],
      ['Medical or social reason for admission > 24 h', 'he-social'],
      ['Creatinine clearance < 30 mL/min', 'he-renal'],
      ['Severe liver impairment', 'he-liver'],
      ['Pregnant', 'he-preg'],
      ['Documented history of HIT', 'he-hit'],
    ];
    for (const [label, id] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map(([, id]) => id);
    wire(ids, () => safe(o, () => {
      const r = M.hestia({
        unstable: chk('he-unstable'), thrombolysis: chk('he-thromb'), bleeding: chk('he-bleed'),
        oxygen: chk('he-o2'), onAnticoag: chk('he-anticoag'), severePain: chk('he-pain'),
        medSocial: chk('he-social'), renal: chk('he-renal'), liver: chk('he-liver'),
        pregnant: chk('he-preg'), hit: chk('he-hit'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Positive criteria', value: String(r.positive) },
        { label: 'Outpatient', value: r.eligible ? 'eligible' : 'not eligible' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 geneva-original --------------------------------------------
  'geneva-original'(root) {
    root.appendChild(field('Age (years)', 'gv-age', { min: 0, max: 120, placeholder: '65' }));
    root.appendChild(field('Heart rate (beats/min)', 'gv-hr', { min: 0, max: 300, placeholder: '95' }));
    root.appendChild(checkField('Previous DVT or PE', 'gv-vte'));
    root.appendChild(checkField('Surgery within 4 weeks', 'gv-surg'));
    root.appendChild(selectField('PaCO2 (arterial)', 'gv-co2', [
      { value: 'normal', text: '>= 39 mmHg (>= 5.2 kPa) -- 0' },
      { value: 'low1', text: '36-38.9 mmHg (4.8-5.19 kPa) -- +1' },
      { value: 'low2', text: '< 36 mmHg (< 4.8 kPa) -- +2' },
    ]));
    root.appendChild(selectField('PaO2 (arterial)', 'gv-o2', [
      { value: 'normal', text: '>= 82.5 mmHg (>= 11 kPa) -- 0' },
      { value: 'b1', text: '71.2-82.4 mmHg (9.5-10.99 kPa) -- +1' },
      { value: 'b2', text: '60-71.1 mmHg (8-9.49 kPa) -- +2' },
      { value: 'b3', text: '48.7-59.9 mmHg (6.5-7.99 kPa) -- +3' },
      { value: 'b4', text: '< 48.7 mmHg (< 6.5 kPa) -- +4' },
    ]));
    root.appendChild(checkField('Band (platelike) atelectasis on chest film', 'gv-atel'));
    root.appendChild(checkField('Elevated hemidiaphragm on chest film', 'gv-diaph'));
    const o = out(); root.appendChild(o);
    const ids = ['gv-age', 'gv-hr', 'gv-vte', 'gv-surg', 'gv-co2', 'gv-o2', 'gv-atel', 'gv-diaph'];
    wire(ids, () => safe(o, () => {
      const r = M.genevaOriginal({
        age: optNum('gv-age'), heartRate: optNum('gv-hr'), priorVte: chk('gv-vte'),
        recentSurgery: chk('gv-surg'), paco2Band: selVal('gv-co2'), pao2Band: selVal('gv-o2'),
        bandAtelectasis: chk('gv-atel'), elevatedHemidiaphragm: chk('gv-diaph'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Geneva score', value: String(r.total) },
        { label: 'Probability', value: r.probability },
      ]);
      derivation(o, 'Scored items (total 0-16):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 constans-uedvt ---------------------------------------------
  'constans-uedvt'(root) {
    root.appendChild(checkField('Venous material in the limb (central line or pacemaker)', 'co-mat'));
    root.appendChild(checkField('Localized pain', 'co-pain'));
    root.appendChild(checkField('Unilateral pitting edema', 'co-edema'));
    root.appendChild(checkField('Other diagnosis at least as plausible (-1)', 'co-other'));
    const o = out(); root.appendChild(o);
    wire(['co-mat', 'co-pain', 'co-edema', 'co-other'], () => safe(o, () => {
      const r = M.constansUedvt({
        venousMaterial: chk('co-mat'), localizedPain: chk('co-pain'),
        unilateralEdema: chk('co-edema'), otherDxPlausible: chk('co-other'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Constans score', value: (r.total >= 0 ? '+' : '') + r.total },
        { label: 'Probability', value: r.probability },
      ]);
      derivation(o, 'Scored items (total -1 to +3):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
