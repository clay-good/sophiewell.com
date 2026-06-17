// spec-v97 §2: renderers for the five perioperative risk tiles
// (gupta-mica, gupta-respiratory-failure, arozullah-pneumonia, el-ganzouri,
// pospom).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The two
// Gupta logistic models render their linear-predictor terms as a spec-v48
// derivation; the weighted indices (arozullah, el-ganzouri) and the POSPOM point
// score render their contributing items. Each tile renders the spec-v50 §3 clinical
// posture note and frames its output as a probability/score estimate per the cited
// model -- none authors a clearance, cancellation, or management order in Sophie's
// voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/periop-v97.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', 'numeric');
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
function selVal(id) { return document.getElementById(id).value; }
function chk(id) { return document.getElementById(id).checked; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a clearance. The probability, score, and threshold are the cited model’s, computed from the inputs you entered; they do not guarantee an outcome. The decision to proceed, optimize, or cancel stays with the clinician and local protocol.' }));
}
// Render a contributing-terms derivation: a labeled list of "label: ±value" lines
// under a small caption. Values are finite on the valid path (guarded computes).
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

const ASA_OPTIONS = [
  { value: '1', text: 'I — healthy' },
  { value: '2', text: 'II — mild systemic disease' },
  { value: '3', text: 'III — severe systemic disease' },
  { value: '4', text: 'IV — life-threatening disease' },
  { value: '5', text: 'V — moribund' },
];
const FUNCTIONAL_OPTIONS = [
  { value: 'independent', text: 'Independent' },
  { value: 'partial', text: 'Partially dependent' },
  { value: 'total', text: 'Totally dependent' },
];

export const renderers = {
  // ----- 2.1 gupta-mica --------------------------------------------------
  'gupta-mica'(root) {
    root.appendChild(field('Age (years)', 'mica-age', { min: 0, max: 120, placeholder: '65' }));
    root.appendChild(selectField('ASA physical status class', 'mica-asa', ASA_OPTIONS));
    root.appendChild(selectField('Functional status', 'mica-func', FUNCTIONAL_OPTIONS));
    root.appendChild(selectField('Serum creatinine', 'mica-creat', [
      { value: 'normal', text: 'Normal (≤ 1.5 mg/dL)' },
      { value: 'elevated', text: 'Elevated (> 1.5 mg/dL)' },
      { value: 'unknown', text: 'Unknown' },
    ]));
    root.appendChild(selectField('Procedure type', 'mica-surg', M.SURGERY_OPTIONS));
    const o = out(); root.appendChild(o);
    const ids = ['mica-age', 'mica-asa', 'mica-func', 'mica-creat', 'mica-surg'];
    wire(ids, () => safe(o, () => {
      const r = M.guptaMica({
        age: optNum('mica-age'), asa: selVal('mica-asa'), functional: selVal('mica-func'),
        creatinine: selVal('mica-creat'), surgery: selVal('mica-surg'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk >= 1 ? 'warn' : null },
        { label: 'Predicted MI / cardiac arrest', value: `${r.risk}%` },
        { label: 'Linear predictor x', value: String(r.x) },
      ]);
      derivation(o, 'Linear predictor x = sum of:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 gupta-respiratory-failure -----------------------------------
  'gupta-respiratory-failure'(root) {
    root.appendChild(selectField('ASA physical status class', 'resp-asa', ASA_OPTIONS));
    root.appendChild(selectField('Preoperative sepsis status', 'resp-sepsis', [
      { value: 'none', text: 'None' },
      { value: 'sirs', text: 'SIRS' },
      { value: 'sepsis', text: 'Sepsis' },
      { value: 'septic-shock', text: 'Septic shock' },
    ]));
    root.appendChild(selectField('Functional status', 'resp-func', FUNCTIONAL_OPTIONS));
    root.appendChild(selectField('Emergency case', 'resp-emerg', [
      { value: 'no', text: 'No (elective)' },
      { value: 'yes', text: 'Yes (emergency)' },
    ]));
    root.appendChild(selectField('Procedure type', 'resp-surg', M.SURGERY_OPTIONS));
    const o = out(); root.appendChild(o);
    const ids = ['resp-asa', 'resp-sepsis', 'resp-func', 'resp-emerg', 'resp-surg'];
    wire(ids, () => safe(o, () => {
      const r = M.guptaRespiratoryFailure({
        asa: selVal('resp-asa'), sepsis: selVal('resp-sepsis'), functional: selVal('resp-func'),
        emergency: selVal('resp-emerg'), surgery: selVal('resp-surg'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk >= 5 ? 'warn' : null },
        { label: 'Predicted respiratory failure', value: `${r.risk}%` },
        { label: 'Linear predictor x', value: String(r.x) },
      ]);
      derivation(o, 'Linear predictor x = sum of:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 arozullah-pneumonia -----------------------------------------
  'arozullah-pneumonia'(root) {
    root.appendChild(selectField('Type of surgery', 'aroz-surg', [
      { value: 'other', text: 'Other (0)' },
      { value: 'aaa', text: 'Abdominal aortic aneurysm repair (15)' },
      { value: 'thoracic', text: 'Thoracic (14)' },
      { value: 'upper-abdominal', text: 'Upper abdominal (10)' },
      { value: 'neck', text: 'Neck (8)' },
      { value: 'neurosurgery', text: 'Neurosurgery (8)' },
      { value: 'vascular', text: 'Vascular (3)' },
    ]));
    root.appendChild(selectField('Age band', 'aroz-age', [
      { value: 'under-50', text: '< 50 (0)' },
      { value: '50-59', text: '50–59 (4)' },
      { value: '60-69', text: '60–69 (9)' },
      { value: '70-79', text: '70–79 (13)' },
      { value: '80+', text: '≥ 80 (17)' },
    ]));
    root.appendChild(selectField('Functional status', 'aroz-func', [
      { value: 'independent', text: 'Independent (0)' },
      { value: 'partial', text: 'Partially dependent (6)' },
      { value: 'total', text: 'Totally dependent (10)' },
    ]));
    root.appendChild(selectField('Blood urea nitrogen (BUN)', 'aroz-bun', [
      { value: 'under-8', text: '< 8 mg/dL (4)' },
      { value: '8-21', text: '8–21 mg/dL (0)' },
      { value: '22-30', text: '22–30 mg/dL (2)' },
      { value: 'over-30', text: '≥ 30 mg/dL (3)' },
    ]));
    root.appendChild(checkField('Weight loss > 10% in 6 months (7)', 'aroz-weightloss'));
    root.appendChild(checkField('History of COPD (5)', 'aroz-copd'));
    root.appendChild(checkField('General anesthesia (4)', 'aroz-ga'));
    root.appendChild(checkField('Impaired sensorium (4)', 'aroz-sensorium'));
    root.appendChild(checkField('History of cerebrovascular accident (4)', 'aroz-cva'));
    root.appendChild(checkField('Transfusion > 4 units (3)', 'aroz-transfusion'));
    root.appendChild(checkField('Emergency surgery (3)', 'aroz-emergency'));
    root.appendChild(checkField('Chronic steroid use (3)', 'aroz-steroids'));
    root.appendChild(checkField('Current smoker within 1 year (3)', 'aroz-smoker'));
    root.appendChild(checkField('Alcohol > 2 drinks/day (2)', 'aroz-alcohol'));
    const o = out(); root.appendChild(o);
    const ids = ['aroz-surg', 'aroz-age', 'aroz-func', 'aroz-bun', 'aroz-weightloss', 'aroz-copd',
      'aroz-ga', 'aroz-sensorium', 'aroz-cva', 'aroz-transfusion', 'aroz-emergency', 'aroz-steroids',
      'aroz-smoker', 'aroz-alcohol'];
    wire(ids, () => safe(o, () => {
      const r = M.arozullahPneumonia({
        surgery: selVal('aroz-surg'), age: selVal('aroz-age'), functional: selVal('aroz-func'),
        bun: selVal('aroz-bun'),
        weightLoss: chk('aroz-weightloss'), copd: chk('aroz-copd'), generalAnesthesia: chk('aroz-ga'),
        sensorium: chk('aroz-sensorium'), cva: chk('aroz-cva'), transfusion: chk('aroz-transfusion'),
        emergency: chk('aroz-emergency'), steroids: chk('aroz-steroids'), smoker: chk('aroz-smoker'),
        alcohol: chk('aroz-alcohol'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.riskClass >= 3 ? 'warn' : null },
        { label: 'Total points', value: String(r.total) },
        { label: 'Risk class', value: `${r.riskClass} of 5` },
        { label: 'Predicted pneumonia risk', value: r.probability },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 el-ganzouri -------------------------------------------------
  'el-ganzouri'(root) {
    root.appendChild(selectField('Mouth opening (interincisor gap)', 'eg-mouth', [
      { value: 'ge-4', text: '≥ 4 cm (0)' },
      { value: 'lt-4', text: '< 4 cm (1)' },
    ]));
    root.appendChild(selectField('Thyromental distance', 'eg-thyro', [
      { value: 'gt-6.5', text: '> 6.5 cm (0)' },
      { value: '6-6.5', text: '6.0–6.5 cm (1)' },
      { value: 'lt-6', text: '< 6.0 cm (2)' },
    ]));
    root.appendChild(selectField('Mallampati class', 'eg-mall', [
      { value: '1', text: 'I (0)' },
      { value: '2', text: 'II (0)' },
      { value: '3', text: 'III (1)' },
      { value: '4', text: 'IV (2)' },
    ]));
    root.appendChild(selectField('Neck movement (range of motion)', 'eg-neck', [
      { value: 'gt-90', text: '> 90° (0)' },
      { value: '80-90', text: '80–90° (1)' },
      { value: 'lt-80', text: '< 80° (2)' },
    ]));
    root.appendChild(selectField('Ability to prognath (protrude jaw)', 'eg-prog', [
      { value: 'yes', text: 'Yes (0)' },
      { value: 'no', text: 'No (1)' },
    ]));
    root.appendChild(selectField('Body weight', 'eg-weight', [
      { value: 'under-90', text: '< 90 kg (0)' },
      { value: '90-110', text: '90–110 kg (1)' },
      { value: 'over-110', text: '> 110 kg (2)' },
    ]));
    root.appendChild(selectField('History of difficult intubation', 'eg-history', [
      { value: 'none', text: 'None (0)' },
      { value: 'questionable', text: 'Questionable (1)' },
      { value: 'definite', text: 'Definite (2)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['eg-mouth', 'eg-thyro', 'eg-mall', 'eg-neck', 'eg-prog', 'eg-weight', 'eg-history'];
    wire(ids, () => safe(o, () => {
      const r = M.elGanzouri({
        mouth: selVal('eg-mouth'), thyromental: selVal('eg-thyro'), mallampati: selVal('eg-mall'),
        neck: selVal('eg-neck'), prognath: selVal('eg-prog'), weight: selVal('eg-weight'),
        history: selVal('eg-history'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.difficult ? 'warn' : null },
        { label: 'Total score (0–12)', value: String(r.total) },
        { label: 'Difficult-laryngoscopy threshold', value: `≥ ${r.threshold} (${r.difficult ? 'met' : 'not met'})` },
      ]);
      derivation(o, 'Points by factor:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 pospom ------------------------------------------------------
  'pospom'(root) {
    root.appendChild(field('Age (years)', 'pospom-age', { min: 18, max: 120, placeholder: '70' }));
    root.appendChild(selectField('Planned surgery category', 'pospom-surg', M.POSPOM_SURGERY_OPTIONS));
    root.appendChild(el('p', { class: 'muted', text: 'Comorbidities (check all that apply):' }));
    const comorbIds = [];
    for (const c of M.POSPOM_COMORBIDITIES) {
      const id = `pospom-${c.key}`;
      root.appendChild(checkField(`${c.label} (${c.pts})`, id));
      comorbIds.push({ id, key: c.key });
    }
    const o = out(); root.appendChild(o);
    const ids = ['pospom-age', 'pospom-surg', ...comorbIds.map((c) => c.id)];
    wire(ids, () => safe(o, () => {
      const comorbidities = comorbIds.filter((c) => chk(c.id)).map((c) => c.key);
      const r = M.pospom({ age: optNum('pospom-age'), comorbidities, surgery: selVal('pospom-surg') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.total >= 26 ? 'warn' : null },
        { label: 'Total points', value: String(r.total) },
        { label: 'Predicted in-hospital mortality', value: r.mortality },
      ]);
      derivation(o, 'Points by component:', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
