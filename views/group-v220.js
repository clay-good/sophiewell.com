// spec-v220 §2: renderers for the hepatology prognosis & fibrosis instruments —
// FIPS, ALBI-PLT, D'Amico staging, aMAP, NACSELD-ACLF, and FibroQ. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the TIPS / endoscopy / transplant /
// treatment decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hepatology-prognosis-v220.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The TIPS, endoscopy, transplant, and treatment decisions stay with the clinician and the patient.' }));
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
  'fips-score'(root) {
    note(root, 'FIPS (Bettinger 2021): FIPS = 1.43·log10(bili) − 1.71·(1/creatinine) + 0.02·age − 0.02·albumin + 0.8074 (mg/dL, g/dL). >= 0.92 = high post-TIPS mortality. Near-neighbors: meld-na, meld-childpugh.');
    root.appendChild(num('Total bilirubin (mg/dL)', 'fips-bili', { min: '0' }));
    root.appendChild(num('Creatinine (mg/dL)', 'fips-cr', { min: '0' }));
    root.appendChild(num('Age (years)', 'fips-age', { min: '0' }));
    root.appendChild(num('Albumin (g/dL)', 'fips-alb', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['fips-bili', 'fips-cr', 'fips-age', 'fips-alb'], () => safe(o, () => {
      const r = M.fips({ bilirubin: val('fips-bili'), creatinine: val('fips-cr'), age: val('fips-age'), albumin: val('fips-alb') });
      render(o, r, 'FIPS', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'albi-plt'(root) {
    note(root, 'ALBI-PLT (Chen 2018): ALBI grade points + platelet points (2-5). A score of 2 marks very low high-risk-varices risk (screening deferrable). Near-neighbors: albi-grade, baveno-vii.');
    root.appendChild(num('Total bilirubin (µmol/L)', 'ap-bili', { min: '0' }));
    root.appendChild(num('Albumin (g/L)', 'ap-alb', { min: '0' }));
    root.appendChild(num('Platelet count (×10⁹/L)', 'ap-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ap-bili', 'ap-alb', 'ap-plt'], () => safe(o, () => {
      const r = M.albiPlt({ bilirubin: val('ap-bili'), albumin: val('ap-alb'), platelets: val('ap-plt') });
      render(o, r, 'ALBI-PLT', r.score !== undefined ? `${r.score}` : '');
    }));
    postureNote(root);
  },
  'damico-cirrhosis-stage'(root) {
    note(root, "D'Amico staging (D'Amico 2006): Stage 1 no varices/ascites (~1%); 2 varices (~3.4%); 3 ascites (~20%); 4 variceal bleeding (~57%). Near-neighbors: meld-childpugh, baveno-vii.");
    root.appendChild(check('Gastroesophageal varices present', 'dam-varices'));
    root.appendChild(check('Ascites present', 'dam-ascites'));
    root.appendChild(check('Variceal bleeding', 'dam-bleeding'));
    const o = out(); root.appendChild(o);
    wire(['dam-varices', 'dam-ascites', 'dam-bleeding'], () => safe(o, () => {
      const r = M.damicoStage({ varices: chk('dam-varices'), ascites: chk('dam-ascites'), bleeding: chk('dam-bleeding') });
      render(o, r, 'Stage', `${r.stage}`);
    }));
    postureNote(root);
  },
  'amap-score'(root) {
    note(root, 'aMAP score (Fan 2020): age, sex, ALBI, platelets → HCC risk. < 50 low, 50-60 medium, > 60 high. Near-neighbors: albi-grade, fib4.');
    root.appendChild(num('Age (years)', 'amap-age', { min: '0' }));
    root.appendChild(num('Total bilirubin (µmol/L)', 'amap-bili', { min: '0' }));
    root.appendChild(num('Albumin (g/L)', 'amap-alb', { min: '0' }));
    root.appendChild(num('Platelet count (×10⁹/L)', 'amap-plt', { min: '0' }));
    root.appendChild(check('Male sex', 'amap-male'));
    const o = out(); root.appendChild(o);
    wire(['amap-age', 'amap-bili', 'amap-alb', 'amap-plt', 'amap-male'], () => safe(o, () => {
      const r = M.amap({ age: val('amap-age'), bilirubin: val('amap-bili'), albumin: val('amap-alb'), platelets: val('amap-plt'), male: chk('amap-male') });
      render(o, r, 'aMAP', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'nacseld-aclf'(root) {
    note(root, "NACSELD-ACLF (O'Leary 2018): count of extrahepatic organ failures (0-4). >= 2 = ACLF; 30-day survival ~93% at 0 to ~19% at 4. Near-neighbors: clif-c-aclf, meld-na.");
    root.appendChild(check('Circulatory failure (shock / vasopressors)', 'nac-circ'));
    root.appendChild(check('Brain failure (grade III/IV hepatic encephalopathy)', 'nac-brain'));
    root.appendChild(check('Renal failure (dialysis)', 'nac-renal'));
    root.appendChild(check('Respiratory failure (mechanical ventilation)', 'nac-resp'));
    const o = out(); root.appendChild(o);
    wire(['nac-circ', 'nac-brain', 'nac-renal', 'nac-resp'], () => safe(o, () => {
      const r = M.nacseldAclf({ circulatory: chk('nac-circ'), brain: chk('nac-brain'), renal: chk('nac-renal'), respiratory: chk('nac-resp') });
      render(o, r, 'Organ failures', `${r.count}`);
    }));
    postureNote(root);
  },
  'fibroq'(root) {
    note(root, 'FibroQ (Hsieh 2009): FibroQ = 10 × (age × AST × INR) / (ALT × platelets). > 1.6 predicts significant fibrosis (≥ F2). Near-neighbors: fib4, apri.');
    root.appendChild(num('Age (years)', 'fq-age', { min: '0' }));
    root.appendChild(num('AST (IU/L)', 'fq-ast', { min: '0' }));
    root.appendChild(num('INR', 'fq-inr', { min: '0' }));
    root.appendChild(num('ALT (IU/L)', 'fq-alt', { min: '0' }));
    root.appendChild(num('Platelet count (×10⁹/L)', 'fq-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['fq-age', 'fq-ast', 'fq-inr', 'fq-alt', 'fq-plt'], () => safe(o, () => {
      const r = M.fibroq({ age: val('fq-age'), ast: val('fq-ast'), inr: val('fq-inr'), alt: val('fq-alt'), platelets: val('fq-plt') });
      render(o, r, 'FibroQ', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
};
