// spec-v108 §2: renderers for the six trauma severity / decision tiles (triss,
// niss, tash-score, rabt-score, gcs-pupils, nexus-chest-ct). The third Wave-2
// renderer module of the spec-v100 program. triss and niss are homed in Group E
// (a probability / severity computation); the other four are Group G scoring
// rules.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. triss
// and tash-score guard their logistic math; niss applies the AIS-6 convention;
// gcs-pupils bounds the index to 1-15; nexus-chest-ct and rabt-score are
// bounded rules. Each tile renders the spec-v50 §3 clinical posture note and
// frames its output as the cited rule's score / probability / verdict -- none
// authors a transfusion, CT, or trauma-bay order in Sophie's voice (spec-v11
// §5.3); the order stays with the clinician and local protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/trauma-v108.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, probability, and verdict band are the cited rule’s, computed from the inputs you entered; they estimate, not guarantee, an outcome. The transfusion, imaging, and trauma-bay decisions stay with the clinician and local protocol.' }));
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
  // ----- 2.1 triss ------------------------------------------------------
  triss(root) {
    note(root, 'The live "Injury Severity Score + Revised Trauma Score" tile computes the ISS and coded RTS this model consumes.');
    root.appendChild(selectField('Mechanism', 'tr-mech', [
      { value: 'blunt', text: 'Blunt' },
      { value: 'penetrating', text: 'Penetrating' },
    ]));
    root.appendChild(field('Coded Revised Trauma Score (0 to 7.8408)', 'tr-rts', { step: '0.0001', min: 0, max: 7.8408, placeholder: '7.8408' }));
    root.appendChild(field('Injury Severity Score (0-75)', 'tr-iss', { min: 0, max: 75, placeholder: '25' }));
    root.appendChild(field('Age (years)', 'tr-age', { min: 0, max: 120, placeholder: '60' }));
    const o = out(); root.appendChild(o);
    wire(['tr-mech', 'tr-rts', 'tr-iss', 'tr-age'], () => safe(o, () => {
      const r = M.triss({ mechanism: selVal('tr-mech'), rts: optNum('tr-rts'), iss: optNum('tr-iss'), age: optNum('tr-age') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Probability of survival', value: `${r.pct}%` },
        { label: 'Coefficient set', value: r.mechanism },
      ]);
      derivation(o, 'Logistic exponent b = sum of:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 niss -------------------------------------------------------
  niss(root) {
    note(root, 'Enter the three highest AIS severities (1-6) from any body region -- unlike ISS, they need not be in three different regions.');
    root.appendChild(field('Highest AIS (1-6)', 'ni-a1', { min: 1, max: 6, placeholder: '5' }));
    root.appendChild(field('Second-highest AIS (1-6)', 'ni-a2', { min: 1, max: 6, placeholder: '4' }));
    root.appendChild(field('Third-highest AIS (1-6)', 'ni-a3', { min: 1, max: 6, placeholder: '3' }));
    const o = out(); root.appendChild(o);
    wire(['ni-a1', 'ni-a2', 'ni-a3'], () => safe(o, () => {
      const r = M.niss({ ais1: optNum('ni-a1'), ais2: optNum('ni-a2'), ais3: optNum('ni-a3') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'NISS', value: String(r.score) },
        { label: 'Major trauma', value: r.major ? 'yes (>= 16)' : 'no' },
      ]);
      derivation(o, 'Three worst AIS, squared:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 tash-score -------------------------------------------------
  'tash-score'(root) {
    root.appendChild(field('Hemoglobin (g/dL)', 'ta-hb', { step: '0.1', min: 0, max: 25, placeholder: '9.5' }));
    root.appendChild(field('Base excess (mmol/L)', 'ta-be', { step: '0.1', placeholder: '-7' }));
    root.appendChild(field('Systolic BP (mmHg)', 'ta-sbp', { min: 0, max: 300, placeholder: '95' }));
    root.appendChild(field('Heart rate (bpm)', 'ta-hr', { min: 0, max: 300, placeholder: '130' }));
    root.appendChild(checkField('Positive FAST (free intraabdominal fluid)', 'ta-fast'));
    root.appendChild(checkField('Clinically unstable pelvic fracture', 'ta-pelvis'));
    root.appendChild(checkField('Open or dislocated femur fracture', 'ta-femur'));
    root.appendChild(checkField('Male sex', 'ta-male'));
    const o = out(); root.appendChild(o);
    wire(['ta-hb', 'ta-be', 'ta-sbp', 'ta-hr', 'ta-fast', 'ta-pelvis', 'ta-femur', 'ta-male'], () => safe(o, () => {
      const r = M.tashScore({
        hb: optNum('ta-hb'), baseExcess: optNum('ta-be'), sbp: optNum('ta-sbp'), hr: optNum('ta-hr'),
        fast: chk('ta-fast'), pelvis: chk('ta-pelvis'), femur: chk('ta-femur'), male: chk('ta-male'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'TASH score', value: String(r.total) },
        { label: 'Mass transfusion', value: `${r.pct}%` },
      ]);
      derivation(o, 'Scored variables (total 0-31):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 rabt-score -------------------------------------------------
  'rabt-score'(root) {
    note(root, 'Shock index (heart rate / systolic BP) > 1 scores the first point; enter heart rate and systolic BP to compute it.');
    root.appendChild(field('Heart rate (bpm)', 'ra-hr', { min: 0, max: 300, placeholder: '130' }));
    root.appendChild(field('Systolic BP (mmHg)', 'ra-sbp', { min: 0, max: 300, placeholder: '100' }));
    root.appendChild(checkField('Pelvic fracture', 'ra-pelvis'));
    root.appendChild(checkField('Penetrating mechanism', 'ra-pen'));
    root.appendChild(checkField('Positive FAST', 'ra-fast'));
    const o = out(); root.appendChild(o);
    wire(['ra-hr', 'ra-sbp', 'ra-pelvis', 'ra-pen', 'ra-fast'], () => safe(o, () => {
      const r = M.rabtScore({
        hr: optNum('ra-hr'), sbp: optNum('ra-sbp'),
        pelvis: chk('ra-pelvis'), penetrating: chk('ra-pen'), fast: chk('ra-fast'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'RABT score', value: String(r.total) },
        { label: 'Shock index', value: r.shockIndex == null ? '(enter HR & SBP)' : String(r.shockIndex) },
      ]);
      derivation(o, 'Scored items (total 0-4):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 gcs-pupils -------------------------------------------------
  'gcs-pupils'(root) {
    root.appendChild(field('Glasgow Coma Scale total (3-15)', 'gp-gcs', { min: 3, max: 15, placeholder: '6' }));
    root.appendChild(selectField('Pupils unreactive to light', 'gp-pupils', [
      { value: '0', text: 'Both pupils react -- 0' },
      { value: '1', text: 'One pupil unreactive -- 1' },
      { value: '2', text: 'Both pupils unreactive -- 2' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['gp-gcs', 'gp-pupils'], () => safe(o, () => {
      const r = M.gcsPupils({ gcs: optNum('gp-gcs'), pupils: Number(selVal('gp-pupils')) });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'GCS-P', value: String(r.index) },
        { label: 'Pupil penalty', value: String(r.prs) },
      ]);
      derivation(o, 'GCS-P = GCS total - pupil reactivity penalty:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 nexus-chest-ct ---------------------------------------------
  'nexus-chest-ct'(root) {
    note(root, 'Applies to blunt thoracic trauma. If all seven criteria are negative, chest CT can be deferred.');
    const items = [
      ['Abnormal chest x-ray', 'nx-cxr'],
      ['Distracting painful injury', 'nx-distract'],
      ['Chest wall, sternum, thoracic spine, or scapular tenderness', 'nx-tender'],
      ['Rapid-deceleration mechanism (fall > 20 ft or MVC > 40 mph)', 'nx-decel'],
      ['Age > 60 years', 'nx-age'],
      ['Intoxication', 'nx-intox'],
      ['Abnormal alertness or mental status', 'nx-mental'],
    ];
    for (const [label, id] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map(([, id]) => id);
    wire(ids, () => safe(o, () => {
      const r = M.nexusChestCt({
        abnormalCxr: chk('nx-cxr'), distractingInjury: chk('nx-distract'), chestTenderness: chk('nx-tender'),
        rapidDeceleration: chk('nx-decel'), ageOver60: chk('nx-age'), intoxication: chk('nx-intox'),
        abnormalAlertness: chk('nx-mental'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Positive criteria', value: String(r.positive) },
        { label: 'Chest CT', value: r.ctIndicated ? 'may be indicated' : 'can be deferred' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
