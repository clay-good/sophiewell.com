// spec-v99 §2: renderers for the five ID / critical-care / burns tiles
// (duke-endocarditis, pitt-bacteremia, saps-ii, lund-browder, refeeding-risk).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. saps-ii
// renders its banded points as a derivation; lund-browder takes a per-region
// burned-fraction and shows the contributing regions and the independent
// Rule-of-Nines cross-check. Each tile renders the spec-v50 §3 clinical posture
// note and frames its output as the cited rule's verdict/score -- none authors an
// antibiotic, imaging, surgical, or feeding-rate order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/idcrit-v99.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, TEMP_UNITS } from '../lib/field-units.js';

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
function selVal(id) { return document.getElementById(id).value; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The verdict, score, and probability are the cited rule’s, computed from the inputs you entered; they do not guarantee an outcome. The antibiotic, imaging, surgical, fluid, and feeding decisions stay with the clinician and local protocol.' }));
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

export const renderers = {
  // ----- 2.1 duke-endocarditis -------------------------------------------
  'duke-endocarditis'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Major criteria met:' }));
    const majIds = [];
    for (const c of M.DUKE_MAJOR_CRITERIA) {
      const id = `duke-maj-${c.key}`;
      root.appendChild(checkField(c.label, id));
      majIds.push({ id, key: c.key });
    }
    root.appendChild(el('p', { class: 'muted', text: 'Minor criteria met:' }));
    const minIds = [];
    for (const c of M.DUKE_MINOR_CRITERIA) {
      const id = `duke-min-${c.key}`;
      root.appendChild(checkField(c.label, id));
      minIds.push({ id, key: c.key });
    }
    const o = out(); root.appendChild(o);
    const ids = [...majIds.map((m) => m.id), ...minIds.map((m) => m.id)];
    wire(ids, () => safe(o, () => {
      const major = majIds.filter((m) => chk(m.id)).map((m) => m.key);
      const minor = minIds.filter((m) => chk(m.id)).map((m) => m.key);
      const r = M.dukeEndocarditis({ major, minor });
      resultRow(o, [
        { text: r.band, cls: r.verdict === 'definite' ? 'warn' : null },
        { label: 'Major criteria', value: String(r.majorCount) },
        { label: 'Minor criteria', value: String(r.minorCount) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 pitt-bacteremia ---------------------------------------------
  'pitt-bacteremia'(root) {
    root.appendChild(selectField('Temperature', 'pitt-temp', [
      { value: 'normal', text: '36.1-38.9 C (0)' },
      { value: 'mild', text: '39.0-39.9 C or 35.1-36.0 C (1)' },
      { value: 'severe', text: '>= 40.0 C or <= 35.0 C (2)' },
    ]));
    root.appendChild(checkField('Hypotension (2)', 'pitt-hypotension'));
    root.appendChild(checkField('Mechanical ventilation (2)', 'pitt-vent'));
    root.appendChild(checkField('Cardiac arrest (4)', 'pitt-arrest'));
    root.appendChild(selectField('Mental status', 'pitt-mental', [
      { value: 'alert', text: 'Alert (0)' },
      { value: 'disoriented', text: 'Disoriented (1)' },
      { value: 'stupor', text: 'Stuporous (2)' },
      { value: 'coma', text: 'Comatose (4)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['pitt-temp', 'pitt-hypotension', 'pitt-vent', 'pitt-arrest', 'pitt-mental'], () => safe(o, () => {
      const r = M.pittBacteremia({
        temperature: selVal('pitt-temp'), hypotension: chk('pitt-hypotension'),
        mechVent: chk('pitt-vent'), cardiacArrest: chk('pitt-arrest'),
        mentalStatus: selVal('pitt-mental'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.highRisk ? 'warn' : null },
        { label: 'Total score (0-14)', value: String(r.total) },
      ]);
      derivation(o, 'Points by component:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 saps-ii -----------------------------------------------------
  'saps-ii'(root) {
    root.appendChild(field('Age (years)', 'saps-age', { min: 0, max: 130, placeholder: '70' }));
    root.appendChild(field('Heart rate (bpm, worst)', 'saps-hr', { min: 0, max: 400, placeholder: '130' }));
    root.appendChild(field('Systolic BP (mmHg, worst)', 'saps-sbp', { min: 0, max: 400, placeholder: '90' }));
    root.appendChild(unitField('Temperature (highest)', 'saps-temp', TEMP_UNITS, { placeholder: '38' }));
    root.appendChild(checkField('Mechanically ventilated or CPAP', 'saps-vent'));
    root.appendChild(field('PaO2 (mmHg) -- if ventilated', 'saps-pao2', { min: 0, max: 800, placeholder: '80' }));
    root.appendChild(field('FiO2 (fraction) -- if ventilated', 'saps-fio2', { min: 0, max: 1, step: '0.01', placeholder: '0.5' }));
    root.appendChild(field('Urine output (L/day)', 'saps-urine', { min: 0, max: 20, step: '0.1', placeholder: '0.4' }));
    root.appendChild(field('BUN (mg/dL)', 'saps-bun', { min: 0, max: 300, placeholder: '60' }));
    root.appendChild(field('Sodium (mEq/L)', 'saps-na', { min: 80, max: 200, placeholder: '140' }));
    root.appendChild(field('Potassium (mEq/L)', 'saps-k', { min: 0, max: 12, step: '0.1', placeholder: '4.0' }));
    root.appendChild(field('Bicarbonate (mEq/L)', 'saps-hco3', { min: 0, max: 60, placeholder: '18' }));
    root.appendChild(field('Bilirubin (mg/dL)', 'saps-bili', { min: 0, max: 80, step: '0.1', placeholder: '2.0' }));
    root.appendChild(field('WBC (x10^3/mm^3)', 'saps-wbc', { min: 0, max: 200, step: '0.1', placeholder: '15' }));
    root.appendChild(field('Glasgow Coma Scale (3-15)', 'saps-gcs', { min: 3, max: 15, placeholder: '12' }));
    root.appendChild(selectField('Chronic disease', 'saps-chronic', [
      { value: 'none', text: 'None (0)' },
      { value: 'metastatic', text: 'Metastatic cancer (9)' },
      { value: 'hematologic', text: 'Hematologic malignancy (10)' },
      { value: 'aids', text: 'AIDS (17)' },
    ]));
    root.appendChild(selectField('Type of admission', 'saps-admit', [
      { value: 'scheduled-surgical', text: 'Scheduled surgical (0)' },
      { value: 'medical', text: 'Medical (6)' },
      { value: 'unscheduled-surgical', text: 'Unscheduled surgical (8)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['saps-age', 'saps-hr', 'saps-sbp', 'saps-temp', 'saps-temp-unit', 'saps-vent', 'saps-pao2', 'saps-fio2',
      'saps-urine', 'saps-bun', 'saps-na', 'saps-k', 'saps-hco3', 'saps-bili', 'saps-wbc', 'saps-gcs',
      'saps-chronic', 'saps-admit'];
    wire(ids, () => safe(o, () => {
      const r = M.sapsII({
        age: optNum('saps-age'), heartRate: optNum('saps-hr'), sbp: optNum('saps-sbp'),
        temperature: unitNumOpt('saps-temp'), ventilated: chk('saps-vent'),
        paO2: optNum('saps-pao2'), fio2: optNum('saps-fio2'), urineOutput: optNum('saps-urine'),
        bun: optNum('saps-bun'), sodium: optNum('saps-na'), potassium: optNum('saps-k'),
        bicarbonate: optNum('saps-hco3'), bilirubin: optNum('saps-bili'), wbc: optNum('saps-wbc'),
        gcs: optNum('saps-gcs'), chronicDisease: selVal('saps-chronic'), admissionType: selVal('saps-admit'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.mortality >= 25 ? 'warn' : null },
        { label: 'SAPS II points', value: String(r.score) },
        { label: 'Predicted hospital mortality', value: `${r.mortality}%` },
      ]);
      derivation(o, 'Points by variable:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 lund-browder ------------------------------------------------
  'lund-browder'(root) {
    root.appendChild(selectField('Age band', 'lb-age', M.LB_AGE_BANDS.map((b) => ({ value: b.key, text: b.label }))));
    root.appendChild(el('p', { class: 'muted', text: 'Fraction of each region burned (0 = none, 1 = entirely; partial-thickness and deeper):' }));
    const regionIds = [];
    for (const r of M.LB_REGION_LIST) {
      const id = `lb-${r.key}`;
      root.appendChild(field(r.label, id, { min: 0, max: 1, step: '0.1', placeholder: '0' }));
      regionIds.push({ id, key: r.key });
    }
    const o = out(); root.appendChild(o);
    const ids = ['lb-age', ...regionIds.map((r) => r.id)];
    wire(ids, () => safe(o, () => {
      const regions = {};
      for (const r of regionIds) { const v = optNum(r.id); if (v != null) regions[r.key] = v; }
      const r = M.lundBrowder({ ageBand: selVal('lb-age'), regions });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.tbsa >= 20 ? 'warn' : null },
        { label: 'Lund-Browder %TBSA', value: `${r.tbsa}%` },
        { label: 'Rule of Nines cross-check', value: `${r.ruleOfNines}%` },
      ]);
      if (r.implausible) note(o, 'Total exceeds 100% -- re-check the region fractions entered.');
      if (r.items.length) derivation(o, 'Burned regions:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 refeeding-risk ----------------------------------------------
  'refeeding-risk'(root) {
    root.appendChild(field('BMI (kg/m^2)', 'ref-bmi', { min: 5, max: 80, step: '0.1', placeholder: '15' }));
    root.appendChild(field('Unintentional weight loss (% over 3-6 months)', 'ref-wl', { min: 0, max: 100, step: '0.1', placeholder: '12' }));
    root.appendChild(field('Days with little or no nutritional intake', 'ref-days', { min: 0, max: 60, placeholder: '6' }));
    root.appendChild(checkField('Low pre-feeding potassium, magnesium, or phosphate', 'ref-electrolytes'));
    root.appendChild(checkField('History of alcohol misuse, or use of insulin, chemotherapy, antacids, or diuretics', 'ref-history'));
    const o = out(); root.appendChild(o);
    wire(['ref-bmi', 'ref-wl', 'ref-days', 'ref-electrolytes', 'ref-history'], () => safe(o, () => {
      const r = M.refeedingRisk({
        bmi: optNum('ref-bmi'), weightLoss: optNum('ref-wl'), daysNoIntake: optNum('ref-days'),
        lowElectrolytes: chk('ref-electrolytes'), historyFlag: chk('ref-history'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.highRisk ? 'warn' : null },
        { label: 'Major criteria', value: String(r.majorCount) },
        { label: 'Minor criteria', value: String(r.minorCount) },
      ]);
      if (r.major.length) derivation(o, 'Major criteria met:', r.major.map((m) => ({ label: m, value: 1 })));
      if (r.minor.length) derivation(o, 'Minor criteria met:', r.minor.map((m) => ({ label: m, value: 1 })));
      note(o, r.note);
    }));
    postureNote(root);
  },
};
