// spec-v102 §2: renderers for the four heart-failure / cardiogenic-shock tiles
// (maggic, h2fpef, hfa-peff, cardshock-score). (gwtg-hf is DEFERRED -- see
// docs/spec-v102.md.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The point
// scores render their counted components as a derivation. Each tile renders the
// spec-v50 §3 clinical posture note and frames its output as the cited rule's
// score / mortality / verdict -- none authors a disposition, device, or escalation
// order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardio-v102.js';
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
function selVal(id) { return document.getElementById(id).value; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, mortality estimate, and likelihood band are the cited rule’s, computed from the inputs you entered; they do not guarantee an outcome. The disposition, device, escalation, and listing decisions stay with the clinician and local protocol.' }));
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
  // ----- 2.1 maggic ------------------------------------------------------
  maggic(root) {
    root.appendChild(field('Age (years)', 'mg-age', { min: 18, max: 120, placeholder: '70' }));
    root.appendChild(checkField('Male sex', 'mg-male'));
    root.appendChild(field('Ejection fraction (%)', 'mg-ef', { min: 0, max: 90, placeholder: '30' }));
    root.appendChild(selectField('NYHA class', 'mg-nyha', [
      { value: '1', text: 'I (0)' },
      { value: '2', text: 'II (2)' },
      { value: '3', text: 'III (6)' },
      { value: '4', text: 'IV (8)' },
    ]));
    root.appendChild(field('Systolic BP (mmHg)', 'mg-sbp', { min: 0, max: 300, placeholder: '120' }));
    root.appendChild(field('BMI (kg/m^2)', 'mg-bmi', { min: 5, max: 80, step: '0.1', placeholder: '24' }));
    root.appendChild(field('Creatinine (mg/dL)', 'mg-creat', { min: 0, max: 50, step: '0.01', placeholder: '1.2' }));
    root.appendChild(checkField('Diabetes', 'mg-dm'));
    root.appendChild(checkField('COPD', 'mg-copd'));
    root.appendChild(checkField('Current smoker', 'mg-smoker'));
    root.appendChild(checkField('HF first diagnosed >= 18 months ago', 'mg-hfdur'));
    root.appendChild(checkField('On a beta-blocker', 'mg-bb'));
    root.appendChild(checkField('On an ACE-inhibitor or ARB', 'mg-ace'));
    const o = out(); root.appendChild(o);
    const ids = ['mg-age', 'mg-male', 'mg-ef', 'mg-nyha', 'mg-sbp', 'mg-bmi', 'mg-creat', 'mg-dm', 'mg-copd', 'mg-smoker', 'mg-hfdur', 'mg-bb', 'mg-ace'];
    wire(ids, () => safe(o, () => {
      const r = M.maggic({
        age: optNum('mg-age'), male: chk('mg-male'), lvef: optNum('mg-ef'), nyha: selVal('mg-nyha'),
        sbp: optNum('mg-sbp'), bmi: optNum('mg-bmi'), creatinine: optNum('mg-creat'),
        diabetes: chk('mg-dm'), copd: chk('mg-copd'), smoker: chk('mg-smoker'),
        hfOver18mo: chk('mg-hfdur'), onBetaBlocker: chk('mg-bb'), onAceArb: chk('mg-ace'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.mortality1yr >= 25 ? 'warn' : null },
        { label: 'MAGGIC points', value: String(r.total) },
        { label: '1-year mortality', value: `${r.mortality1yr}%` },
        { label: '3-year mortality', value: `${r.mortality3yr}%` },
      ]);
      derivation(o, 'Points by component (age and SBP scored by EF tier):', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 h2fpef ------------------------------------------------------
  h2fpef(root) {
    root.appendChild(checkField('BMI > 30 kg/m^2 (2)', 'h2-bmi'));
    root.appendChild(checkField('>= 2 antihypertensive medications (1)', 'h2-htn'));
    root.appendChild(checkField('Atrial fibrillation (3)', 'h2-af'));
    root.appendChild(checkField('Pulmonary hypertension: echo PASP > 35 mmHg (1)', 'h2-ph'));
    root.appendChild(checkField('Age > 60 years (1)', 'h2-age'));
    root.appendChild(checkField("Echo E/e' > 9 (1)", 'h2-ee'));
    const o = out(); root.appendChild(o);
    wire(['h2-bmi', 'h2-htn', 'h2-af', 'h2-ph', 'h2-age', 'h2-ee'], () => safe(o, () => {
      const r = M.h2fpef({
        obese: chk('h2-bmi'), antihypertensives: chk('h2-htn'), afib: chk('h2-af'),
        pulmHtn: chk('h2-ph'), ageOver60: chk('h2-age'), eeOver9: chk('h2-ee'),
      });
      resultRow(o, [
        { text: r.band, cls: r.prob === 'high' ? 'warn' : null },
        { label: 'H2FPEF total (0-9)', value: String(r.total) },
        { label: 'Probability band', value: r.prob },
      ]);
      derivation(o, 'Points by component:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 hfa-peff ----------------------------------------------------
  'hfa-peff'(root) {
    const opts = [
      { value: 'none', text: 'No criterion met (0)' },
      { value: 'minor', text: 'Minor criterion (1)' },
      { value: 'major', text: 'Major criterion (2)' },
    ];
    for (const d of M.HFAPEFF_DOMAIN_LIST) {
      root.appendChild(selectField(d.label, `hp-${d.key}`, opts));
    }
    const o = out(); root.appendChild(o);
    wire(['hp-functional', 'hp-morphological', 'hp-biomarker'], () => safe(o, () => {
      const r = M.hfaPeff({
        functional: selVal('hp-functional'), morphological: selVal('hp-morphological'), biomarker: selVal('hp-biomarker'),
      });
      resultRow(o, [
        { text: r.band, cls: r.verdict === 'confirmed' ? 'warn' : null },
        { label: 'HFA-PEFF total (0-6)', value: String(r.total) },
      ]);
      derivation(o, 'Points by domain (highest criterion per domain, capped at 2):', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 cardshock-score ---------------------------------------------
  'cardshock-score'(root) {
    root.appendChild(checkField('Age > 75 years (1)', 'cs-age'));
    root.appendChild(checkField('Confusion at presentation (1)', 'cs-confusion'));
    root.appendChild(checkField('Previous MI or CABG (1)', 'cs-mi'));
    root.appendChild(checkField('ACS etiology (1)', 'cs-acs'));
    root.appendChild(checkField('LVEF < 40% (1)', 'cs-ef'));
    root.appendChild(field('Blood lactate (mmol/L)', 'cs-lactate', { min: 0, max: 40, step: '0.1', placeholder: '2.5' }));
    root.appendChild(field('eGFR (mL/min/1.73m^2)', 'cs-egfr', { min: 0, max: 200, placeholder: '55' }));
    const o = out(); root.appendChild(o);
    const ids = ['cs-age', 'cs-confusion', 'cs-mi', 'cs-acs', 'cs-ef', 'cs-lactate', 'cs-egfr'];
    wire(ids, () => safe(o, () => {
      const r = M.cardShock({
        ageOver75: chk('cs-age'), confusion: chk('cs-confusion'), priorMiCabg: chk('cs-mi'),
        acs: chk('cs-acs'), lowEf: chk('cs-ef'), lactate: optNum('cs-lactate'), egfr: optNum('cs-egfr'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'CardShock total (0-9)', value: String(r.total) },
        { label: 'Risk band', value: r.risk },
      ]);
      derivation(o, 'Points by component:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
