// spec-v1632: dose checks read from the FDA label. Group F.
// doac-dose-check, lmwh-fondaparinux-dose-check, iv-antithrombotic-renal-check,
// antiviral-renal-dose, nrti-renal-dose, gabapentinoid-renal-dose, cns-renal-dose-check,
// diabetes-drug-egfr-check, dofetilide-dose-algorithm, cardiac-renal-dose-check,
// mra-potassium-dose-check, gout-drug-renal-dose, bisphosphonate-renal-check,
// tranexamic-acid-renal-dose, ketorolac-limit-check, gi-drug-dose-check, hepatic-label-dose,
// glp1-titration-check; and abx-renal, moved here from group-f when it joined the band engine.

import { el, clear } from '../lib/dom.js';
import * as DC from '../lib/doac-dose-check-v1632.js';
import * as LF from '../lib/lmwh-fondaparinux-dose-check-v1632.js';
import * as IA from '../lib/iv-antithrombotic-renal-check-v1632.js';
import * as AV from '../lib/antiviral-renal-dose-v1632.js';
import * as NR from '../lib/nrti-renal-dose-v1632.js';
import * as GB from '../lib/gabapentinoid-renal-dose-v1632.js';
import * as CN from '../lib/cns-renal-dose-check-v1632.js';
import * as DM from '../lib/diabetes-drug-egfr-check-v1632.js';
import * as DF from '../lib/dofetilide-dose-algorithm-v1632.js';
import * as CR from '../lib/cardiac-renal-dose-check-v1632.js';
import * as MR from '../lib/mra-potassium-dose-check-v1632.js';
import * as GT from '../lib/gout-drug-renal-dose-v1632.js';
import * as BP from '../lib/bisphosphonate-renal-check-v1632.js';
import * as TX from '../lib/tranexamic-acid-renal-dose-v1632.js';
import * as KT from '../lib/ketorolac-limit-check-v1632.js';
import * as GI from '../lib/gi-drug-dose-check-v1632.js';
import * as HP from '../lib/hepatic-label-dose-v1632.js';
import * as GL from '../lib/glp1-titration-check-v1632.js';
import * as AB from '../lib/abx-renal-v1632.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function dateField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'date' }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}

export const renderers = {
  'doac-dose-check'(root) {
    const pairs = [['doac-drug', 'drug'], ['doac-ind', 'indication'], ['doac-crcl', 'crcl'], ['doac-int', 'interaction'], ['doac-age', 'age'], ['doac-weight', 'weight'], ['doac-scr', 'creatinine']];
    selectField(root, 'Drug', 'doac-drug', DC.DRUGS);
    selectField(root, 'Indication', 'doac-ind', DC.INDICATIONS);
    numField(root, 'Creatinine clearance, mL/min (not used for apixaban)', 'doac-crcl', '');
    selectField(root, 'Takes an interacting drug the label names for this drug', 'doac-int', DC.INTERACTIONS);
    numField(root, 'Age, years (apixaban for atrial fibrillation)', 'doac-age', '');
    numField(root, 'Weight, kg (apixaban for atrial fibrillation; edoxaban for DVT or PE)', 'doac-weight', '');
    numField(root, 'Serum creatinine, mg/dL (apixaban for atrial fibrillation)', 'doac-scr', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DC.doacDoseCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'lmwh-fondaparinux-dose-check'(root) {
    const pairs = [['lf-drug', 'drug'], ['lf-ind', 'indication'], ['lf-weight', 'weight'], ['lf-crcl', 'crcl'], ['lf-month', 'month'], ['lf-plt', 'platelets']];
    selectField(root, 'Drug', 'lf-drug', LF.DRUGS);
    selectField(root, 'Indication', 'lf-ind', LF.INDICATIONS);
    numField(root, 'Weight, kg (where the label doses by it)', 'lf-weight', '');
    numField(root, 'Creatinine clearance, mL/min (fondaparinux; dalteparin in cancer)', 'lf-crcl', '');
    selectField(root, 'Dalteparin in cancer: month of treatment', 'lf-month', LF.MONTHS);
    numField(root, 'Dalteparin in cancer: platelets, × 1,000/mm³', 'lf-plt', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LF.lmwhFondaparinuxDoseCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'iv-antithrombotic-renal-check'(root) {
    const pairs = [['iva-drug', 'drug'], ['iva-weight', 'weight'], ['iva-crcl', 'crcl'], ['iva-dialysis', 'dialysis'], ['iva-setting', 'setting'], ['iva-hepatic', 'hepatic']];
    selectField(root, 'Drug', 'iva-drug', IA.DRUGS);
    numField(root, 'Weight, kg', 'iva-weight', '');
    numField(root, 'Creatinine clearance, mL/min (not used for argatroban)', 'iva-crcl', '');
    selectField(root, 'On dialysis (bivalirudin, eptifibatide)', 'iva-dialysis', IA.YES_NO);
    selectField(root, 'Eptifibatide: setting', 'iva-setting', IA.SETTINGS);
    selectField(root, 'Argatroban: hepatic function', 'iva-hepatic', IA.HEPATIC);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = IA.ivAntithromboticRenalCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'antiviral-renal-dose'(root) {
    const pairs = [['avr-regimen', 'regimen'], ['avr-dialysis', 'dialysis'], ['avr-kidney', 'kidney']];
    selectField(root, 'Drug and indication', 'avr-regimen', AV.REGIMENS);
    selectField(root, 'Dialysis', 'avr-dialysis', AV.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min (eGFR for Paxlovid; mL/min/1.73 m² for acyclovir)', 'avr-kidney', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AV.antiviralRenalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'nrti-renal-dose'(root) {
    const pairs = [['nrt-regimen', 'regimen'], ['nrt-dialysis', 'dialysis'], ['nrt-kidney', 'kidney']];
    selectField(root, 'Drug and use', 'nrt-regimen', NR.REGIMENS);
    selectField(root, 'Dialysis', 'nrt-dialysis', NR.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min', 'nrt-kidney', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NR.nrtiRenalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'gabapentinoid-renal-dose'(root) {
    const pairs = [['gbr-drug', 'drug'], ['gbr-crcl', 'crcl'], ['gbr-hd', 'hemodialysis'], ['gbr-normal', 'normalDose']];
    selectField(root, 'Drug', 'gbr-drug', GB.DRUGS);
    numField(root, 'Creatinine clearance, mL/min', 'gbr-crcl', '');
    selectField(root, 'On hemodialysis', 'gbr-hd', GB.YES_NO);
    selectField(root, 'Pregabalin: total daily dose for normal renal function', 'gbr-normal', GB.NORMAL_DOSES);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GB.gabapentinoidRenalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'cns-renal-dose-check'(root) {
    const pairs = [['cns-regimen', 'regimen'], ['cns-dialysis', 'dialysis'], ['cns-kidney', 'kidney'], ['cns-bsa', 'bsa']];
    selectField(root, 'Drug', 'cns-regimen', CN.REGIMENS);
    selectField(root, 'Dialysis', 'cns-dialysis', CN.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min (GFR for duloxetine)', 'cns-kidney', '');
    numField(root, 'Levetiracetam: body surface area, m²', 'cns-bsa', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CN.cnsRenalDoseCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'diabetes-drug-egfr-check'(root) {
    const pairs = [['dme-regimen', 'regimen'], ['dme-dialysis', 'dialysis'], ['dme-kidney', 'kidney']];
    selectField(root, 'Drug and use', 'dme-regimen', DM.REGIMENS);
    selectField(root, 'Dialysis', 'dme-dialysis', DM.DIALYSIS);
    numField(root, 'eGFR, mL/min/1.73 m² (creatinine clearance in mL/min for alogliptin)', 'dme-kidney', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DM.diabetesDrugEgfrCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'dofetilide-dose-algorithm'(root) {
    const pairs = [['dof-base', 'baselineQt'], ['dof-cond', 'conduction'], ['dof-crcl', 'crcl'], ['dof-first', 'firstDoseQt'], ['dof-later', 'laterQt']];
    numField(root, 'Baseline QTc, msec (QT if the heart rate is under 60)', 'dof-base', '');
    selectField(root, 'Ventricular conduction abnormality', 'dof-cond', DF.YES_NO);
    numField(root, 'Creatinine clearance, mL/min (Cockcroft-Gault, actual weight)', 'dof-crcl', '');
    numField(root, 'QTc or QT 2 to 3 hours after the first dose, msec (optional)', 'dof-first', '');
    numField(root, 'QTc or QT after a later dose, msec (optional)', 'dof-later', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DF.dofetilideDoseAlgorithm(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'cardiac-renal-dose-check'(root) {
    const pairs = [['crd-regimen', 'regimen'], ['crd-dialysis', 'dialysis'], ['crd-kidney', 'kidney']];
    selectField(root, 'Drug and indication', 'crd-regimen', CR.REGIMENS);
    selectField(root, 'Dialysis', 'crd-dialysis', CR.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min (eGFR for Entresto)', 'crd-kidney', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CR.cardiacRenalDoseCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'mra-potassium-dose-check'(root) {
    const pairs = [['mra-mode', 'mode'], ['mra-k', 'potassium'], ['mra-egfr', 'egfr'], ['mra-dose', 'currentDose'], ['mra-crcl', 'crcl'], ['mra-cyp', 'cyp3a'], ['mra-sex', 'sex'], ['mra-scr', 'creatinine'], ['mra-alb', 'microalbuminuria'], ['mra-ksp', 'potassiumSparing']];
    selectField(root, 'Drug and question', 'mra-mode', MR.MODES);
    numField(root, 'Serum potassium, mEq/L', 'mra-k', '');
    numField(root, 'Spironolactone: eGFR, mL/min/1.73 m²', 'mra-egfr', '');
    selectField(root, 'Eplerenone adjustment: current dose', 'mra-dose', MR.EPLERENONE_DOSES);
    numField(root, 'Eplerenone before starting: creatinine clearance, mL/min', 'mra-crcl', '');
    selectField(root, 'Eplerenone before starting: takes a strong CYP3A inhibitor', 'mra-cyp', MR.YES_NO);
    selectField(root, 'Eplerenone for hypertension: sex', 'mra-sex', MR.SEXES);
    numField(root, 'Eplerenone for hypertension: serum creatinine, mg/dL', 'mra-scr', '');
    selectField(root, 'Eplerenone for hypertension: type 2 diabetes with microalbuminuria', 'mra-alb', MR.YES_NO);
    selectField(root, 'Eplerenone for hypertension: potassium supplement or potassium-sparing diuretic', 'mra-ksp', MR.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MR.mraPotassiumDoseCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'gout-drug-renal-dose'(root) {
    const pairs = [['gdr-regimen', 'regimen'], ['gdr-dialysis', 'dialysis'], ['gdr-kidney', 'kidney']];
    selectField(root, 'Drug and indication', 'gdr-regimen', GT.REGIMENS);
    selectField(root, 'Dialysis', 'gdr-dialysis', GT.DIALYSIS);
    numField(root, 'eGFR for allopurinol, creatinine clearance for colchicine, mL/min', 'gdr-kidney', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GT.goutDrugRenalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'bisphosphonate-renal-check'(root) {
    const pairs = [['bpr-regimen', 'regimen'], ['bpr-dialysis', 'dialysis'], ['bpr-kidney', 'kidney']];
    selectField(root, 'Drug and indication', 'bpr-regimen', BP.REGIMENS);
    selectField(root, 'Dialysis', 'bpr-dialysis', BP.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min', 'bpr-kidney', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BP.bisphosphonateRenalCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'tranexamic-acid-renal-dose'(root) {
    const pairs = [['txa-route', 'route'], ['txa-scr', 'creatinine'], ['txa-weight', 'weight']];
    selectField(root, 'Route', 'txa-route', TX.ROUTES);
    numField(root, 'Serum creatinine, mg/dL (not a clearance)', 'txa-scr', '');
    numField(root, 'Intravenous: actual body weight, kg', 'txa-weight', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TX.tranexamicAcidRenalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'ketorolac-limit-check'(root) {
    const pairs = [['ket-route', 'route'], ['ket-age', 'age'], ['ket-weight', 'weight'], ['ket-renal', 'renal'], ['ket-days', 'daysSoFar'], ['ket-mg', 'mg24h']];
    selectField(root, 'Route and regimen', 'ket-route', KT.ROUTES);
    numField(root, 'Age, years', 'ket-age', '');
    numField(root, 'Weight, kg', 'ket-weight', '');
    selectField(root, 'Renal impairment', 'ket-renal', KT.RENAL);
    numField(root, 'Days of ketorolac so far, by any route', 'ket-days', '');
    numField(root, 'Ketorolac given in the last 24 hours, mg (multiple-dose regimens)', 'ket-mg', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = KT.ketorolacLimitCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'gi-drug-dose-check'(root) {
    const pairs = [['gid-regimen', 'regimen'], ['gid-dialysis', 'dialysis'], ['gid-kidney', 'kidney'], ['gid-hepatic', 'hepatic'], ['gid-pm', 'poorMetabolizer'], ['gid-inh', 'inhibitor']];
    selectField(root, 'Drug and indication', 'gid-regimen', GI.REGIMENS);
    selectField(root, 'Dialysis', 'gid-dialysis', GI.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min', 'gid-kidney', '');
    selectField(root, 'Metoclopramide: hepatic function', 'gid-hepatic', GI.HEPATIC);
    selectField(root, 'Metoclopramide: CYP2D6 poor metabolizer', 'gid-pm', GI.YES_NO);
    selectField(root, 'Metoclopramide: takes a strong CYP2D6 inhibitor', 'gid-inh', GI.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GI.giDrugDoseCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'hepatic-label-dose'(root) {
    const pairs = [['hep-drug', 'drug'], ['hep-class', 'childPugh']];
    selectField(root, 'Drug', 'hep-drug', HP.DRUGS);
    selectField(root, 'Child-Pugh class', 'hep-class', HP.CLASSES);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HP.hepaticLabelDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'glp1-titration-check'(root) {
    const pairs = [['glp-product', 'product'], ['glp-dose', 'currentDose'], ['glp-start', 'startDate'], ['glp-asof', 'asOf']];
    selectField(root, 'Product and indication', 'glp-product', GL.PRODUCTS);
    numField(root, 'Current dose, mg', 'glp-dose', '');
    dateField(root, 'Date the current dose began', 'glp-start');
    dateField(root, 'Date to check as of (blank uses today)', 'glp-asof');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = GL.glp1TitrationCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'abx-renal'(root) {
    const pairs = [['abx-drug', 'regimen'], ['abx-dialysis', 'dialysis'], ['abx-crcl', 'kidney']];
    selectField(root, 'Antibiotic and usual dose', 'abx-drug', AB.REGIMENS);
    selectField(root, 'Dialysis', 'abx-dialysis', AB.DIALYSIS);
    numField(root, 'Creatinine clearance, mL/min (not used on dialysis)', 'abx-crcl', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AB.abxRenal(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
};
