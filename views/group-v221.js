// spec-v221 §2: renderers for the pulmonary & critical-care risk scores —
// Simplified Revised Geneva, SCAP, CORB, RESP, ILD-GAP, du Bois IPF, and the
// Collins pneumothorax-size formula. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the anticoagulation / ECMO / admission
// / drainage decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pulmonary-risk-v221.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The anticoagulation, ECMO, admission, and drainage decisions stay with the clinician and the patient.' }));
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
  'simplified-revised-geneva'(root) {
    note(root, 'Simplified Revised Geneva (Klok 2008): age > 65, previous DVT/PE, surgery/fracture, malignancy, limb pain, hemoptysis, palpation pain + edema, HR band (0-8). Unlikely 0-2, likely >= 3. Near-neighbors: wells-pe-geneva, geneva-original.');
    root.appendChild(num('Heart rate (bpm)', 'sg-hr', { min: '0' }));
    const items = [['sg-age', 'ageOver65', 'Age > 65 (+1)'], ['sg-vte', 'priorVte', 'Previous DVT/PE (+1)'], ['sg-surg', 'surgeryFracture', 'Surgery or fracture <= 1 month (+1)'], ['sg-malig', 'malignancy', 'Active malignancy (+1)'], ['sg-limb', 'limbPain', 'Unilateral lower-limb pain (+1)'], ['sg-hemo', 'hemoptysis', 'Hemoptysis (+1)'], ['sg-palp', 'palpationEdema', 'Pain on deep venous palpation + unilateral edema (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(['sg-hr', ...items.map((i) => i[0])], () => safe(o, () => {
      const inp = { heartRate: val('sg-hr') }; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.simplifiedGeneva(inp), 'Geneva', `${M.simplifiedGeneva(inp).score}`);
    }));
    postureNote(root);
  },
  'scap-score'(root) {
    note(root, 'SCAP / España (España 2006): major pH < 7.30 (13), SBP < 90 (11); minor RR > 30 (9), hypoxemia (6), BUN > 30 (5), AMS (5), age >= 80 (5), multilobar (5). >= 10 high risk. Near-neighbors: psi, curb-65.');
    const items = [['scap-ph', 'phLow', 'Arterial pH < 7.30 (+13)'], ['scap-sbp', 'sbpLow', 'Systolic BP < 90 mmHg (+11)'], ['scap-rr', 'rrHigh', 'Respiratory rate > 30 (+9)'], ['scap-o2', 'hypoxemia', 'PaO2 < 54 or PaO2/FiO2 < 250 (+6)'], ['scap-bun', 'bunHigh', 'BUN > 30 mg/dL (+5)'], ['scap-ams', 'ams', 'Altered mental status (+5)'], ['scap-age', 'ageOld', 'Age >= 80 (+5)'], ['scap-multi', 'multilobar', 'Multilobar / bilateral infiltrate (+5)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.scap(inp), 'SCAP', `${M.scap(inp).score}`);
    }));
    postureNote(root);
  },
  'corb-score'(root) {
    note(root, 'CORB (Buising 2007): Confusion, Oxygen saturation <= 90%, Respiratory rate >= 30, Blood pressure (SBP < 90 or DBP <= 60) (0-4). >= 2 severe. Near-neighbors: curb-65, crb-65.');
    const items = [['corb-conf', 'confusion', 'Acute confusion (+1)'], ['corb-o2', 'oxygen', 'Oxygen saturation <= 90% (+1)'], ['corb-rr', 'respRate', 'Respiratory rate >= 30 (+1)'], ['corb-bp', 'bp', 'Systolic BP < 90 or diastolic <= 60 (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.corb(inp), 'CORB', `${M.corb(inp).score}`);
    }));
    postureNote(root);
  },
  'resp-score'(root) {
    note(root, 'RESP score (Schmidt 2014): age band, immunocompromise, pre-ECMO ventilation, diagnosis, and acute modifiers → predicted respiratory-ECMO survival (class I-V). Near-neighbors: murray-lung-injury, pf-ratio.');
    root.appendChild(select('Age', 'resp-age', [['0', '18-49 (0)'], ['-2', '50-59 (-2)'], ['-3', '>= 60 (-3)']]));
    root.appendChild(select('Mechanical ventilation before ECMO', 'resp-mv', [['3', '< 48 hours (+3)'], ['1', '48 hours - 7 days (+1)'], ['0', '> 7 days (0)']]));
    root.appendChild(select('Acute respiratory diagnosis', 'resp-dx', [['3', 'Viral pneumonia (+3)'], ['3', 'Bacterial pneumonia (+3)'], ['11', 'Asthma (+11)'], ['3', 'Trauma / burn (+3)'], ['5', 'Aspiration pneumonitis (+5)'], ['1', 'Other acute respiratory (+1)'], ['0', 'Non-respiratory / chronic (0)']]));
    const items = [['resp-immuno', 'immunocompromised', 'Immunocompromised (-2)'], ['resp-cns', 'cns', 'CNS dysfunction (-7)'], ['resp-infxn', 'nonPulmInfection', 'Non-pulmonary infection (-3)'], ['resp-nmb', 'nmb', 'Neuromuscular blockade (+1)'], ['resp-no', 'nitricOxide', 'Inhaled nitric oxide (-1)'], ['resp-bicarb', 'bicarbonate', 'Bicarbonate infusion (-2)'], ['resp-arrest', 'cardiacArrest', 'Cardiac arrest (-2)'], ['resp-paco2', 'paco2High', 'PaCO2 >= 75 mmHg (-1)'], ['resp-pip', 'pipHigh', 'Peak inspiratory pressure >= 42 (-1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(['resp-age', 'resp-mv', 'resp-dx', ...items.map((i) => i[0])], () => safe(o, () => {
      const inp = { ageBand: val('resp-age'), mvBand: val('resp-mv'), diagnosis: val('resp-dx') };
      for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.resp(inp), 'RESP', `${M.resp(inp).score}`);
    }));
    postureNote(root);
  },
  'ild-gap'(root) {
    note(root, 'ILD-GAP (Ryerson 2014): ILD subtype, sex, age band, FVC %pred, DLCO band → stage I-IV mortality. Near-neighbors: gap-ipf, du-bois-ipf.');
    root.appendChild(select('ILD subtype', 'ild-sub', [['0', 'IPF / unclassifiable (0)'], ['-2', 'CTD-ILD / idiopathic NSIP / chronic HP (-2)']]));
    root.appendChild(select('Age band', 'ild-age', [['0', '<= 60 (0)'], ['1', '61-65 (+1)'], ['2', '> 65 (+2)']]));
    root.appendChild(num('FVC % predicted', 'ild-fvc', { min: '0' }));
    root.appendChild(select('DLCO % predicted', 'ild-dlco', [['0', '> 55 (0)'], ['1', '36-55 (+1)'], ['2', '<= 35 (+2)'], ['3', 'Cannot perform (+3)']]));
    root.appendChild(check('Male sex (+1)', 'ild-male'));
    const o = out(); root.appendChild(o);
    wire(['ild-sub', 'ild-age', 'ild-fvc', 'ild-dlco', 'ild-male'], () => safe(o, () => {
      const r = M.ildGap({ subtype: val('ild-sub'), ageBand: val('ild-age'), fvc: val('ild-fvc'), dlcoBand: val('ild-dlco'), male: chk('ild-male') });
      render(o, r, 'Stage', r.stage);
    }));
    postureNote(root);
  },
  'du-bois-ipf'(root) {
    note(root, 'du Bois IPF score (du Bois 2011): age, respiratory hospitalization, baseline FVC %pred, and 24-week FVC change → 1-year mortality (0-61). Near-neighbors: gap-ipf, ild-gap.');
    root.appendChild(num('Age (years)', 'db-age', { min: '0' }));
    root.appendChild(num('Baseline FVC % predicted', 'db-fvc', { min: '0' }));
    root.appendChild(num('24-week change in FVC % predicted (signed)', 'db-dfvc', { step: 'any' }));
    root.appendChild(check('Respiratory hospitalization in prior 6 months (+14)', 'db-hosp'));
    const o = out(); root.appendChild(o);
    wire(['db-age', 'db-fvc', 'db-dfvc', 'db-hosp'], () => safe(o, () => {
      const r = M.duBoisIpf({ age: val('db-age'), fvc: val('db-fvc'), deltaFvc: val('db-dfvc'), hospitalization: chk('db-hosp') });
      render(o, r, 'du Bois', `${r.score}`);
    }));
    postureNote(root);
  },
  'pneumothorax-volume'(root) {
    note(root, 'Pneumothorax size (Collins 1995): % = 4.2 + 4.7 × (A + B + C), where A, B, C are interpleural distances (cm) at apex, mid-upper, and mid-lower lung. Near-neighbors: light-criteria, driving-pressure.');
    root.appendChild(num('Apex interpleural distance (cm)', 'ptx-a', { min: '0' }));
    root.appendChild(num('Mid-upper interpleural distance (cm)', 'ptx-b', { min: '0' }));
    root.appendChild(num('Mid-lower interpleural distance (cm)', 'ptx-c', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ptx-a', 'ptx-b', 'ptx-c'], () => safe(o, () => {
      const r = M.pneumothoraxVolume({ apex: val('ptx-a'), midUpper: val('ptx-b'), midLower: val('ptx-c') });
      render(o, r, 'Pneumothorax', r.percent !== undefined ? `${r.percent}%` : '');
    }));
    postureNote(root);
  },
};
