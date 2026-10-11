// spec-v1632: dose checks read from the FDA label. Group F.
// doac-dose-check, lmwh-fondaparinux-dose-check, iv-antithrombotic-renal-check,
// antiviral-renal-dose, nrti-renal-dose, gabapentinoid-renal-dose.

import { el, clear } from '../lib/dom.js';
import * as DC from '../lib/doac-dose-check-v1632.js';
import * as LF from '../lib/lmwh-fondaparinux-dose-check-v1632.js';
import * as IA from '../lib/iv-antithrombotic-renal-check-v1632.js';
import * as AV from '../lib/antiviral-renal-dose-v1632.js';
import * as NR from '../lib/nrti-renal-dose-v1632.js';
import * as GB from '../lib/gabapentinoid-renal-dose-v1632.js';
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
};
