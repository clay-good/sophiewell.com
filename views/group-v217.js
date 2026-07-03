// spec-v217 §2: renderers for the stroke & neuro-vascular risk scores — Canadian
// TIA, ASTRAL, SOAR, PLAN, SITS-SICH, VASOGRADE, and Ogilvy-Carter. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the thrombolysis / admission /
// surgical decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/stroke-risk-v217.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The thrombolysis, admission, and surgical decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'canadian-tia-score'(root) {
    note(root, 'Canadian TIA Score (Perry 2014): 13 clinical and investigation variables (-3 to 23). Low <= 3, medium 4-8, high >= 9 for 7-day stroke. Near-neighbors: abcd2, abcd3-i.');
    const items = [
      ['ctia-first', 'firstTia', 'First TIA in lifetime (+2)'],
      ['ctia-dur', 'duration10', 'Symptoms >= 10 minutes (+2)'],
      ['ctia-carotid', 'carotid', 'History of carotid stenosis (+2)'],
      ['ctia-ap', 'antiplatelet', 'Already on antiplatelet therapy (+3)'],
      ['ctia-gait', 'gait', 'History of gait disturbance (+1)'],
      ['ctia-weak', 'weakness', 'History of unilateral weakness (+1)'],
      ['ctia-vertigo', 'vertigo', 'History of vertigo (-3)'],
      ['ctia-dbp', 'dbp110', 'Triage diastolic BP >= 110 mmHg (+3)'],
      ['ctia-dys', 'dysarthria', 'Dysarthria or aphasia (+1)'],
      ['ctia-af', 'afEcg', 'Atrial fibrillation on ECG (+2)'],
      ['ctia-ct', 'infarctCt', 'Infarction on CT (+1)'],
      ['ctia-plt', 'plt400', 'Platelets >= 400 ×10⁹/L (+2)'],
      ['ctia-glu', 'glucose15', 'Glucose >= 15 mmol/L (+3)'],
    ];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      const r = M.canadianTia(inp);
      render(o, r, 'Canadian TIA', `${r.score}`);
    }));
    postureNote(root);
  },
  'astral-score'(root) {
    note(root, 'ASTRAL score (Ntaios 2012): 1 pt/5 y age + 1 pt/NIHSS point + onset > 3 h +2 + visual defect +2 + glucose out of range +1 + impaired consciousness +3. Higher = worse 90-day outcome. Near-neighbors: nihss, ich-score.');
    root.appendChild(num('Age (years)', 'ast-age', { min: '0' }));
    root.appendChild(num('Admission NIHSS (0-42)', 'ast-nihss', { min: '0', max: '42' }));
    root.appendChild(check('Onset-to-admission > 3 hours (or unknown) (+2)', 'ast-onset'));
    root.appendChild(check('Any new visual-field defect (+2)', 'ast-visual'));
    root.appendChild(check('Admission glucose > 7.3 or < 3.7 mmol/L (+1)', 'ast-glu'));
    root.appendChild(check('Impaired consciousness (+3)', 'ast-loc'));
    const o = out(); root.appendChild(o);
    wire(['ast-age', 'ast-nihss', 'ast-onset', 'ast-visual', 'ast-glu', 'ast-loc'], () => safe(o, () => {
      const r = M.astral({ age: val('ast-age'), nihss: val('ast-nihss'), onsetOver3h: chk('ast-onset'), visualDefect: chk('ast-visual'), glucoseAbnormal: chk('ast-glu'), impairedConsciousness: chk('ast-loc') });
      render(o, r, 'ASTRAL', `${r.score}`);
    }));
    postureNote(root);
  },
  'soar-score'(root) {
    note(root, 'SOAR score (Myint 2014): stroke subtype + OCSP class + age band + prestroke Rankin (0-7). Higher = higher early mortality. Near-neighbors: nihss, ich-score.');
    root.appendChild(select('Stroke subtype', 'soar-sub', [['0', 'Ischemic (0)'], ['1', 'Hemorrhagic (1)']]));
    root.appendChild(select('OCSP (Bamford) classification', 'soar-ocsp', [['0', 'PACS or LACS (0)'], ['1', 'POCS (1)'], ['2', 'TACS (2)']]));
    root.appendChild(select('Age band', 'soar-age', [['0', '<= 65 (0)'], ['1', '66-85 (1)'], ['2', '>= 85 (2)']]));
    root.appendChild(select('Prestroke modified Rankin', 'soar-rankin', [['0', '0-2 (0)'], ['1', '3-4 (1)'], ['2', '5 (2)']]));
    const o = out(); root.appendChild(o);
    wire(['soar-sub', 'soar-ocsp', 'soar-age', 'soar-rankin'], () => safe(o, () => {
      const r = M.soar({ subtype: val('soar-sub'), ocsp: val('soar-ocsp'), ageBand: val('soar-age'), rankin: val('soar-rankin') });
      render(o, r, 'SOAR', `${r.score}`);
    }));
    postureNote(root);
  },
  'plan-score'(root) {
    note(root, 'PLAN score (O’Donnell 2012): preadmission comorbidities + level of consciousness + age + neurologic deficits (0-25). Higher = higher 30-day mortality. Near-neighbors: nihss, ich-score.');
    root.appendChild(num('Age (years)', 'plan-age', { min: '0' }));
    root.appendChild(check('Preadmission dependence (+1.5)', 'plan-dep'));
    root.appendChild(check('Cancer (+1.5)', 'plan-cancer'));
    root.appendChild(check('Congestive heart failure (+1)', 'plan-chf'));
    root.appendChild(check('Atrial fibrillation (+1)', 'plan-af'));
    root.appendChild(check('Reduced level of consciousness (+5)', 'plan-loc'));
    root.appendChild(check('Significant/total arm weakness (+2)', 'plan-arm'));
    root.appendChild(check('Significant/total leg weakness (+2)', 'plan-leg'));
    root.appendChild(check('Aphasia or neglect (+1)', 'plan-aphasia'));
    const o = out(); root.appendChild(o);
    wire(['plan-age', 'plan-dep', 'plan-cancer', 'plan-chf', 'plan-af', 'plan-loc', 'plan-arm', 'plan-leg', 'plan-aphasia'], () => safe(o, () => {
      const r = M.plan({ age: val('plan-age'), dependence: chk('plan-dep'), cancer: chk('plan-cancer'), chf: chk('plan-chf'), af: chk('plan-af'), reducedLoc: chk('plan-loc'), armWeakness: chk('plan-arm'), legWeakness: chk('plan-leg'), aphasiaNeglect: chk('plan-aphasia') });
      render(o, r, 'PLAN', `${r.score}`);
    }));
    postureNote(root);
  },
  'sits-sich'(root) {
    note(root, 'SITS-SICH (Mazya 2012): antiplatelet + NIHSS band + glucose + SBP + weight + age + onset + hypertension (0-15). Predicts symptomatic ICH after IV alteplase. Near-neighbors: hat-score, sedan-score.');
    root.appendChild(select('Antiplatelet therapy', 'sits-ap', [['0', 'None (0)'], ['1', 'Aspirin alone (1)'], ['2', 'Aspirin + clopidogrel (2)']]));
    root.appendChild(num('Admission NIHSS', 'sits-nihss', { min: '0', max: '42' }));
    root.appendChild(num('Blood glucose (mg/dL)', 'sits-glu', { min: '0' }));
    root.appendChild(num('Systolic BP (mmHg)', 'sits-sbp', { min: '0' }));
    root.appendChild(num('Weight (kg)', 'sits-wt', { min: '0' }));
    root.appendChild(num('Age (years)', 'sits-age', { min: '0' }));
    root.appendChild(check('Onset-to-treatment >= 180 minutes (+1)', 'sits-onset'));
    root.appendChild(check('History of hypertension (+1)', 'sits-htn'));
    const o = out(); root.appendChild(o);
    wire(['sits-ap', 'sits-nihss', 'sits-glu', 'sits-sbp', 'sits-wt', 'sits-age', 'sits-onset', 'sits-htn'], () => safe(o, () => {
      const r = M.sitsSich({ antiplatelet: val('sits-ap'), nihss: val('sits-nihss'), glucose: val('sits-glu'), sbp: val('sits-sbp'), weight: val('sits-wt'), age: val('sits-age'), onset180: chk('sits-onset'), hypertension: chk('sits-htn') });
      render(o, r, 'SITS-SICH', `${r.score}`);
    }));
    postureNote(root);
  },
  'vasograde'(root) {
    note(root, 'VASOGRADE (de Oliveira Manoel 2015): combines modified Fisher and WFNS after aneurysmal SAH. Green (low), Yellow, Red (high) delayed-cerebral-ischemia risk. Near-neighbors: modified-fisher, hunt-hess-wfns.');
    root.appendChild(select('Modified Fisher scale', 'vaso-mf', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]));
    root.appendChild(select('WFNS grade', 'vaso-wfns', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]));
    const o = out(); root.appendChild(o);
    wire(['vaso-mf', 'vaso-wfns'], () => safe(o, () => {
      const r = M.vasograde({ modifiedFisher: val('vaso-mf'), wfns: val('vaso-wfns') });
      render(o, r, 'VASOGRADE', r.grade);
    }));
    postureNote(root);
  },
  'ogilvy-carter'(root) {
    note(root, 'Ogilvy-Carter grading (Ogilvy 1998): one point each for age > 50, Hunt-Hess 4-5, Fisher 3-4, aneurysm > 10 mm, posterior giant >= 25 mm (0-5). Near-neighbors: hunt-hess-wfns, modified-fisher.');
    root.appendChild(check('Age > 50 years (+1)', 'oc-age'));
    root.appendChild(check('Hunt-Hess grade 4-5 (+1)', 'oc-hh'));
    root.appendChild(check('Fisher grade 3-4 (+1)', 'oc-fisher'));
    root.appendChild(check('Aneurysm size > 10 mm (+1)', 'oc-size'));
    root.appendChild(check('Posterior-circulation giant aneurysm >= 25 mm (+1)', 'oc-post'));
    const o = out(); root.appendChild(o);
    wire(['oc-age', 'oc-hh', 'oc-fisher', 'oc-size', 'oc-post'], () => safe(o, () => {
      const r = M.ogilvyCarter({ ageOver50: chk('oc-age'), huntHess45: chk('oc-hh'), fisher34: chk('oc-fisher'), sizeOver10: chk('oc-size'), posteriorGiant: chk('oc-post') });
      render(o, r, 'Ogilvy-Carter', `${r.score}`);
    }));
    postureNote(root);
  },
};
