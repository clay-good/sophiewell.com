// spec-v261 §2: renderers for the acute-abdomen & emergency-general-surgery risk
// instruments — the RIPASA appendicitis score, the PULP peptic-ulcer-perforation
// mortality score, and the Emergency Surgery Score (ESS). Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the operative, imaging, admission, and
// discharge decision to the surgeon and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acute-abdomen-v261.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The decision to operate, scan, admit, or discharge stays with the surgeon and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'ripasa'(root) {
    note(root, 'RIPASA appendicitis score (Chong 2010): a higher-sensitivity alternative to Alvarado. Max 16; 7.5 = optimal diagnostic cutoff. Bands: < 5 unlikely, 5-7 low/moderate, 7.5-11.5 high, >= 12 very high. Near-neighbors: alvarado-pas, air-score, adult-appendicitis-score.');
    root.appendChild(select('Gender', 'rp-gender', [['male', 'Male (+1)'], ['female', 'Female (+0.5)']]));
    root.appendChild(select('Age', 'rp-age', [['le40', 'Age <= 40 (+1)'], ['gt40', 'Age > 40 (+0.5)']]));
    root.appendChild(select('Symptom duration', 'rp-dur', [['lt48', 'Duration < 48h (+1)'], ['gt48', 'Duration > 48h (+0.5)']]));
    root.appendChild(check('RIF pain (+0.5)', 'rp-rifpain'));
    root.appendChild(check('Migration of pain to RIF (+0.5)', 'rp-migration'));
    root.appendChild(check('Anorexia (+1)', 'rp-anorexia'));
    root.appendChild(check('Nausea & vomiting (+1)', 'rp-nausea'));
    root.appendChild(check('RIF tenderness (+1)', 'rp-riftender'));
    root.appendChild(check('Guarding (+2)', 'rp-guarding'));
    root.appendChild(check('Rebound tenderness (+1)', 'rp-rebound'));
    root.appendChild(check("Rovsing's sign (+2)", 'rp-rovsing'));
    root.appendChild(check('Fever 37-39 C (+1)', 'rp-fever'));
    root.appendChild(check('Raised WBC (+1)', 'rp-wbc'));
    root.appendChild(check('Negative urinalysis (+1)', 'rp-urine'));
    root.appendChild(check('Foreign NRIC (+1)', 'rp-nric'));
    const o = out(); root.appendChild(o);
    wire(['rp-gender', 'rp-age', 'rp-dur', 'rp-rifpain', 'rp-migration', 'rp-anorexia', 'rp-nausea', 'rp-riftender', 'rp-guarding', 'rp-rebound', 'rp-rovsing', 'rp-fever', 'rp-wbc', 'rp-urine', 'rp-nric'], () => safe(o, () => {
      render(o, M.ripasa({
        gender: val('rp-gender'), ageBand: val('rp-age'), duration: val('rp-dur'),
        rifPain: chk('rp-rifpain'), migration: chk('rp-migration'), anorexia: chk('rp-anorexia'),
        nauseaVomiting: chk('rp-nausea'), rifTenderness: chk('rp-riftender'), guarding: chk('rp-guarding'),
        rebound: chk('rp-rebound'), rovsing: chk('rp-rovsing'), fever: chk('rp-fever'),
        raisedWbc: chk('rp-wbc'), negativeUrinalysis: chk('rp-urine'), foreignNric: chk('rp-nric'),
      }), 'RIPASA');
    }));
    postureNote(root);
  },
  'pulp'(root) {
    note(root, 'PULP (Peptic Ulcer Perforation) score (Møller 2012): 30-day mortality after peptic-ulcer-perforation surgery, total 0-18. <= 7 low risk (< 25%), >= 8 high risk (> 25%). Near-neighbors: boey-score, mannheim-peritonitis-index, p-possum.');
    root.appendChild(check('Age > 65 (+3)', 'pu-age'));
    root.appendChild(check('Active malignancy or AIDS (+1)', 'pu-malig'));
    root.appendChild(check('Liver cirrhosis (+2)', 'pu-cirr'));
    root.appendChild(check('Concomitant steroid use (+1)', 'pu-steroid'));
    root.appendChild(check('Perforation to admission > 24h (+1)', 'pu-delay'));
    root.appendChild(check('Shock on admission (SBP < 100) (+1)', 'pu-shock'));
    root.appendChild(check('Serum creatinine > 130 umol/L (+2)', 'pu-creat'));
    root.appendChild(select('ASA class', 'pu-asa', [['1', 'ASA 1 (0)'], ['2', 'ASA 2 (+1)'], ['3', 'ASA 3 (+3)'], ['4', 'ASA 4 (+5)'], ['5', 'ASA 5 (+7)']]));
    const o = out(); root.appendChild(o);
    wire(['pu-age', 'pu-malig', 'pu-cirr', 'pu-steroid', 'pu-delay', 'pu-shock', 'pu-creat', 'pu-asa'], () => safe(o, () => {
      render(o, M.pulp({
        ageOver65: chk('pu-age'), malignancyAids: chk('pu-malig'), cirrhosis: chk('pu-cirr'),
        steroids: chk('pu-steroid'), delayedAdmission: chk('pu-delay'), shock: chk('pu-shock'),
        creatinine: chk('pu-creat'), asa: val('pu-asa'),
      }), 'PULP');
    }));
    postureNote(root);
  },
  'emergency-surgery-score'(root) {
    note(root, 'Emergency Surgery Score (ESS) (Sangji 2016): 22 preoperative variables, total 0-29, predicting 30-day mortality on a monotone gradient. The white-race term is a derivation coefficient reproduced as published, not a clinical recommendation. Near-neighbors: possum, p-possum, pulp.');
    note(root, 'Demographic:');
    root.appendChild(check('Age > 60 (+2)', 'es-age'));
    root.appendChild(check('White race (+1, derivation coefficient)', 'es-race'));
    root.appendChild(select('Transfer source', 'es-transfer', [['none', 'None (0)'], ['ed', 'Outside ED (+1)'], ['inpatient', 'Acute-care inpatient facility (+1)']]));
    note(root, 'Comorbidity:');
    root.appendChild(check('Ascites (+1)', 'es-ascites'));
    root.appendChild(check('BMI < 20 (+1)', 'es-bmi'));
    root.appendChild(check('Dyspnea (+1)', 'es-dyspnea'));
    root.appendChild(check('Functional dependence (+1)', 'es-funcdep'));
    root.appendChild(check('COPD (+1)', 'es-copd'));
    root.appendChild(check('Hypertension (+1)', 'es-htn'));
    root.appendChild(check('Steroid use (+1)', 'es-steroid'));
    root.appendChild(check('> 10% weight loss in 6 months (+1)', 'es-wtloss'));
    root.appendChild(check('Disseminated cancer (+3)', 'es-cancer'));
    root.appendChild(check('Ventilator dependence within 48h preop (+3)', 'es-vent'));
    note(root, 'Laboratory:');
    root.appendChild(check('Albumin < 3.0 (+1)', 'es-alb'));
    root.appendChild(check('Alkaline phosphatase > 125 (+1)', 'es-alkphos'));
    root.appendChild(check('BUN > 40 (+1)', 'es-bun'));
    root.appendChild(check('INR > 1.5 (+1)', 'es-inr'));
    root.appendChild(check('Platelets < 150k (+1)', 'es-plt'));
    root.appendChild(check('AST > 40 (+1)', 'es-ast'));
    root.appendChild(check('Sodium > 145 (+1)', 'es-na'));
    root.appendChild(check('Creatinine > 1.2 (+2)', 'es-creat'));
    root.appendChild(select('WBC band', 'es-wbc', [['normal', 'Normal 4.5-15k (0)'], ['abnormal', '< 4.5 or 15-25k (+1)'], ['high', '> 25k (+2)']]));
    const o = out(); root.appendChild(o);
    wire(['es-age', 'es-race', 'es-transfer', 'es-ascites', 'es-bmi', 'es-dyspnea', 'es-funcdep', 'es-copd', 'es-htn', 'es-steroid', 'es-wtloss', 'es-cancer', 'es-vent', 'es-alb', 'es-alkphos', 'es-bun', 'es-inr', 'es-plt', 'es-ast', 'es-na', 'es-creat', 'es-wbc'], () => safe(o, () => {
      render(o, M.emergencySurgeryScore({
        ageOver60: chk('es-age'), whiteRace: chk('es-race'), transfer: val('es-transfer'),
        ascites: chk('es-ascites'), bmiUnder20: chk('es-bmi'), dyspnea: chk('es-dyspnea'),
        functionalDependence: chk('es-funcdep'), copd: chk('es-copd'), hypertension: chk('es-htn'),
        steroids: chk('es-steroid'), weightLoss: chk('es-wtloss'), disseminatedCancer: chk('es-cancer'),
        ventilatorDependence: chk('es-vent'), albumin: chk('es-alb'), alkPhos: chk('es-alkphos'),
        bun: chk('es-bun'), inr: chk('es-inr'), platelets: chk('es-plt'), ast: chk('es-ast'),
        sodium: chk('es-na'), creatinine: chk('es-creat'), wbc: val('es-wbc'),
      }), 'ESS');
    }));
    postureNote(root);
  },
};
