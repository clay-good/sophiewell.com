// spec-v142 §2: renderers for the six surgical / anesthetic risk tiles
// (possum, p-possum, sort, goldman-cardiac-risk, wilson-airway,
// surgical-risk-scale). All are Clinical Scoring & Risk (Group G); v142 opens
// Wave 8 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score or
// predicted risk, not a proceed/cancel/optimize order in Sophie's voice
// (spec-v11 §5.3). POSSUM / P-POSSUM / SORT surface a complete-the-fields
// fallback rather than a probability from a partial input (lib/surg-v142.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/surg-v142.js';
import { resultRow } from '../lib/result-copy.js';

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
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or predicted risk is the cited instrument’s, computed from the values you entered. The operative decision — proceed, optimize, or cancel — stays with the surgeon, anesthetist, and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

// A banded select whose option values are the point grades; a leading blank
// placeholder so an unfilled variable surfaces the complete-the-fields fallback.
function gradeField(label, id, opts) {
  const options = [{ value: '', text: '— select —' }];
  for (const op of opts) options.push({ value: String(op.v), text: `${op.v} — ${op.text}` });
  return selectField(label, id, options);
}

// --- shared POSSUM 18-variable config (possum + p-possum) --------------------
const POSSUM_VARS = [
  ['phys', 'Physiological variables'],
  ['age', 'Age', [{ v: 1, text: '≤ 60 years' }, { v: 2, text: '61–70 years' }, { v: 4, text: '≥ 71 years' }]],
  ['cardiac', 'Cardiac signs / chest radiograph', [{ v: 1, text: 'no failure, normal CXR' }, { v: 2, text: 'cardiac drugs or steroids' }, { v: 4, text: 'peripheral edema, warfarin, or borderline cardiomegaly' }, { v: 8, text: 'raised JVP or cardiomegaly on CXR' }]],
  ['respiratory', 'Respiratory history / chest radiograph', [{ v: 1, text: 'no dyspnoea, normal CXR' }, { v: 2, text: 'dyspnoea on exertion or mild COPD' }, { v: 4, text: 'dyspnoea limiting to one flight, or moderate COPD' }, { v: 8, text: 'dyspnoea at rest, fibrosis or consolidation' }]],
  ['sbp', 'Systolic blood pressure (mmHg)', [{ v: 1, text: '110–130' }, { v: 2, text: '100–109 or 131–170' }, { v: 4, text: '90–99 or ≥ 171' }, { v: 8, text: '≤ 89' }]],
  ['pulse', 'Pulse (beats/min)', [{ v: 1, text: '50–80' }, { v: 2, text: '40–49 or 81–100' }, { v: 4, text: '101–120' }, { v: 8, text: '≤ 39 or ≥ 121' }]],
  ['gcs', 'Glasgow Coma Score', [{ v: 1, text: '15' }, { v: 2, text: '12–14' }, { v: 4, text: '9–11' }, { v: 8, text: '≤ 8' }]],
  ['hb', 'Hemoglobin (g/dL)', [{ v: 1, text: '13–16' }, { v: 2, text: '11.5–12.9 or 16.1–17' }, { v: 4, text: '10–11.4 or 17.1–18' }, { v: 8, text: '≤ 9.9 or ≥ 18.1' }]],
  ['wcc', 'White-cell count (×10¹²/L)', [{ v: 1, text: '4–10' }, { v: 2, text: '3.1–4.0 or 10.1–20.0' }, { v: 4, text: '≤ 3.0 or ≥ 20.1' }]],
  ['urea', 'Urea (mmol/L)', [{ v: 1, text: '≤ 7.5' }, { v: 2, text: '7.6–10.0' }, { v: 4, text: '10.1–15.0' }, { v: 8, text: '≥ 15.1' }]],
  ['sodium', 'Sodium (mmol/L)', [{ v: 1, text: '≥ 136' }, { v: 2, text: '131–135' }, { v: 4, text: '126–130' }, { v: 8, text: '≤ 125' }]],
  ['potassium', 'Potassium (mmol/L)', [{ v: 1, text: '3.5–5.0' }, { v: 2, text: '3.2–3.4 or 5.1–5.3' }, { v: 4, text: '2.9–3.1 or 5.4–5.9' }, { v: 8, text: '≤ 2.8 or ≥ 6.0' }]],
  ['ecg', 'ECG', [{ v: 1, text: 'normal' }, { v: 4, text: 'atrial fibrillation, rate 60–90' }, { v: 8, text: 'any other abnormal rhythm, ≥ 5 ectopics/min, Q waves, or ST/T changes' }]],
  ['op', 'Operative variables'],
  ['opSeverity', 'Operative severity', [{ v: 1, text: 'minor' }, { v: 2, text: 'moderate (e.g. appendicectomy, cholecystectomy)' }, { v: 4, text: 'major (e.g. laparotomy, bowel resection)' }, { v: 8, text: 'major+ (e.g. aortic, AP resection, oesophagogastrectomy)' }]],
  ['procedures', 'Number of procedures (within 30 days)', [{ v: 1, text: '1' }, { v: 4, text: '2' }, { v: 8, text: '> 2' }]],
  ['bloodLoss', 'Total blood loss (mL)', [{ v: 1, text: '≤ 100' }, { v: 2, text: '101–500' }, { v: 4, text: '501–999' }, { v: 8, text: '≥ 1000' }]],
  ['soiling', 'Peritoneal soiling', [{ v: 1, text: 'none' }, { v: 2, text: 'minor or serous fluid' }, { v: 4, text: 'local pus' }, { v: 8, text: 'free bowel content, pus, or blood' }]],
  ['malignancy', 'Malignancy', [{ v: 1, text: 'none' }, { v: 2, text: 'primary cancer only' }, { v: 4, text: 'nodal metastases' }, { v: 8, text: 'distant metastases' }]],
  ['urgency', 'Mode of surgery', [{ v: 1, text: 'elective' }, { v: 4, text: 'emergency, resuscitation of > 2 h possible' }, { v: 8, text: 'emergency, immediate (< 2 h)' }]],
];

// Build the 18 selects (+ two sub-headings) under id prefix `pfx`; return the
// list of input ids and a reader that maps them back to the compute keys.
function possumForm(root, pfx) {
  const ids = [];
  for (const v of POSSUM_VARS) {
    if (v.length === 2) { note(root, v[1] + ':'); continue; }
    const [key, label, opts] = v;
    const id = `${pfx}-${key}`;
    root.appendChild(gradeField(label, id, opts));
    ids.push([id, key]);
  }
  return {
    ids: ids.map((p) => p[0]),
    read() { const o = {}; for (const [id, key] of ids) o[key] = selVal(id); return o; },
  };
}

export const renderers = {
  // ----- 2.1 possum -----------------------------------------------------
  possum(root) {
    note(root, 'POSSUM (Copeland 1991): the physiological score (12–88) and operative score (6–48) drive two logistic equations for predicted 30-day morbidity and mortality. Grade all 18 variables.');
    const form = possumForm(root, 'ps');
    const o = out(); root.appendChild(o);
    wire(form.ids, () => safe(o, () => {
      const r = M.possum(form.read());
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Physiological score', value: r.physScore },
        { label: 'Operative score', value: r.opScore },
        { label: 'Predicted 30-day morbidity', value: `${r.morbidity}%` },
        { label: 'Predicted 30-day mortality', value: `${r.mortality}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 p-possum ---------------------------------------------------
  'p-possum'(root) {
    note(root, 'P-POSSUM (Prytherch 1998): the Portsmouth-recalibrated POSSUM mortality, shown beside the original POSSUM mortality for the same scores so the low-risk over-prediction is visible. Grade all 18 variables.');
    const form = possumForm(root, 'pp');
    const o = out(); root.appendChild(o);
    wire(form.ids, () => safe(o, () => {
      const r = M.pPossum(form.read());
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Physiological score', value: r.physScore },
        { label: 'Operative score', value: r.opScore },
        { label: 'P-POSSUM predicted mortality', value: `${r.mortality}%` },
        { label: 'Original POSSUM mortality', value: `${r.possumMortality}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 sort -------------------------------------------------------
  sort(root) {
    note(root, 'SORT (Protopapa 2014): a six-variable logistic estimate of 30-day mortality, the modern bedside companion to P-POSSUM. No intraoperative data needed.');
    root.appendChild(selectField('ASA physical-status grade', 'sort-asa', [
      { value: '1', text: 'I — normal healthy patient' },
      { value: '2', text: 'II — mild systemic disease' },
      { value: '3', text: 'III — severe systemic disease' },
      { value: '4', text: 'IV — severe disease, constant threat to life' },
      { value: '5', text: 'V — moribund, not expected to survive without operation' },
    ]));
    root.appendChild(selectField('Urgency of surgery', 'sort-urg', [
      { value: 'elective', text: 'Elective' },
      { value: 'expedited', text: 'Expedited' },
      { value: 'urgent', text: 'Urgent' },
      { value: 'immediate', text: 'Immediate' },
    ]));
    root.appendChild(selectField('Age band', 'sort-age', [
      { value: 'under65', text: 'Under 65 years' },
      { value: '65to79', text: '65–79 years' },
      { value: '80plus', text: '80 years or older' },
    ]));
    root.appendChild(checkField('High-risk surgical specialty (gastrointestinal, thoracic, or vascular)', 'sort-hr'));
    root.appendChild(checkField('High surgical severity (Xmajor or complex)', 'sort-sev'));
    root.appendChild(checkField('Cancer (malignancy within the last 5 years)', 'sort-ca'));
    const o = out(); root.appendChild(o);
    wire(['sort-asa', 'sort-urg', 'sort-age', 'sort-hr', 'sort-sev', 'sort-ca'], () => safe(o, () => {
      const r = M.sort({ asa: selVal('sort-asa'), urgency: selVal('sort-urg'), age: selVal('sort-age'), highRisk: chk('sort-hr'), severity: chk('sort-sev'), cancer: chk('sort-ca') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Predicted 30-day mortality', value: `${r.mortality}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 goldman-cardiac-risk ---------------------------------------
  'goldman-cardiac-risk'(root) {
    note(root, 'Goldman Cardiac Risk Index (Goldman 1977): the original nine-factor weighted preoperative cardiac index, the ancestor of the RCRI. Check each factor present; the total maps to Class I–IV.');
    const factors = [
      ['gold-s3', 'Third heart sound or jugular venous distension (11)'],
      ['gold-mi', 'Myocardial infarction within 6 months (10)'],
      ['gold-pvc', '> 5 premature ventricular contractions per minute (7)'],
      ['gold-rhythm', 'Rhythm other than sinus, or premature atrial contractions on last ECG (7)'],
      ['gold-age', 'Age over 70 years (5)'],
      ['gold-emerg', 'Emergency operation (4)'],
      ['gold-intraop', 'Intraperitoneal, intrathoracic, or aortic operation (3)'],
      ['gold-as', 'Important aortic stenosis (3)'],
      ['gold-status', 'Poor general medical status (3)'],
    ];
    for (const [id, label] of factors) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    wire(factors.map((f) => f[0]), () => safe(o, () => {
      const r = M.goldmanCardiacRisk({
        s3jvd: chk('gold-s3'), mi6mo: chk('gold-mi'), pvc: chk('gold-pvc'), nonsinus: chk('gold-rhythm'),
        age70: chk('gold-age'), emergency: chk('gold-emerg'), intraop: chk('gold-intraop'),
        aorticstenosis: chk('gold-as'), poorstatus: chk('gold-status'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Goldman points', value: `${r.score}/53` },
        { label: 'Cardiac-risk class', value: r.class },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 wilson-airway ----------------------------------------------
  'wilson-airway'(root) {
    note(root, 'Wilson Risk Sum Score (Wilson 1988): five anatomic factors each 0–2, summing 0–10. In the derivation a score above 2 identified ~75% of difficult intubations; a score of 2 or more is the common sensitive screen.');
    root.appendChild(gradeField('Body weight', 'wil-weight', [{ v: 0, text: '< 90 kg' }, { v: 1, text: '90–110 kg' }, { v: 2, text: '> 110 kg' }]));
    root.appendChild(gradeField('Head and neck movement', 'wil-headneck', [{ v: 0, text: '> 90°' }, { v: 1, text: 'about 90°' }, { v: 2, text: '< 90°' }]));
    root.appendChild(gradeField('Jaw movement (inter-incisor gap, subluxation)', 'wil-jaw', [{ v: 0, text: 'gap ≥ 5 cm or subluxation forward' }, { v: 1, text: 'gap < 5 cm and jaw to neutral' }, { v: 2, text: 'gap < 5 cm and cannot bring jaw forward' }]));
    root.appendChild(gradeField('Receding mandible', 'wil-mandible', [{ v: 0, text: 'normal' }, { v: 1, text: 'moderate' }, { v: 2, text: 'severe' }]));
    root.appendChild(gradeField('Buck teeth (prominent upper incisors)', 'wil-teeth', [{ v: 0, text: 'normal' }, { v: 1, text: 'moderate' }, { v: 2, text: 'severe' }]));
    const o = out(); root.appendChild(o);
    wire(['wil-weight', 'wil-headneck', 'wil-jaw', 'wil-mandible', 'wil-teeth'], () => safe(o, () => {
      const r = M.wilsonAirway({ weight: selVal('wil-weight'), headneck: selVal('wil-headneck'), jaw: selVal('wil-jaw'), mandible: selVal('wil-mandible'), teeth: selVal('wil-teeth') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Wilson Risk Sum', value: `${r.score}/10` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 surgical-risk-scale ----------------------------------------
  'surgical-risk-scale'(root) {
    note(root, 'Surgical Risk Scale (Sutton 2002): CEPOD urgency + ASA grade + BUPA operative magnitude, summing to 3–14. Higher scores carry a higher in-hospital mortality; ≥ 8 is a common high-risk threshold.');
    root.appendChild(selectField('CEPOD operative urgency', 'srs-cepod', [
      { value: '1', text: 'Elective (1)' },
      { value: '2', text: 'Scheduled (2)' },
      { value: '3', text: 'Urgent (3)' },
      { value: '4', text: 'Emergency (4)' },
    ]));
    root.appendChild(selectField('ASA physical-status grade', 'srs-asa', [
      { value: '1', text: 'I (1)' },
      { value: '2', text: 'II (2)' },
      { value: '3', text: 'III (3)' },
      { value: '4', text: 'IV (4)' },
      { value: '5', text: 'V (5)' },
    ]));
    root.appendChild(selectField('BUPA operative-magnitude grade', 'srs-bupa', [
      { value: '1', text: 'Minor (1)' },
      { value: '2', text: 'Intermediate (2)' },
      { value: '3', text: 'Major (3)' },
      { value: '4', text: 'Major-plus (4)' },
      { value: '5', text: 'Complex-major (5)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['srs-cepod', 'srs-asa', 'srs-bupa'], () => safe(o, () => {
      const r = M.surgicalRiskScale({ cepod: selVal('srs-cepod'), asa: selVal('srs-asa'), bupa: selVal('srs-bupa') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Surgical Risk Scale', value: `${r.score}/14` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
