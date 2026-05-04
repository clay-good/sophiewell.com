// Group E: Clinical Math and Conversions (27-40).
// Each utility is a small form that calls a pure function from lib/clinical.js.
// All numeric inputs use type=number step=any. The clinical inline notice is
// rendered by the router for any utility flagged clinical.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/clinical.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  if (opts.value != null) inp.value = String(opts.value);
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

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function num(id) { return Number(document.getElementById(id).value); }

function safe(out, fn) {
  clear(out);
  try { fn(); } catch (err) { out.appendChild(el('p', { class: 'muted', text: err.message })); }
}

export const renderers = {
  'unit-converter'(root) {
    root.appendChild(selectField('Quantity', 'kind', [
      { value: 'weight', text: 'Weight (kg, g, mg, lb, oz)' },
      { value: 'volume', text: 'Volume (mL, L, fl_oz, cup)' },
      { value: 'temperature', text: 'Temperature (C, F, K)' },
    ]));
    root.appendChild(field('Value', 'val'));
    root.appendChild(field('From unit', 'from', { type: 'text', placeholder: 'kg' }));
    root.appendChild(field('To unit', 'to', { type: 'text', placeholder: 'lb' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const kind = document.getElementById('kind').value;
      const v = num('val'); const from = document.getElementById('from').value.trim(); const to = document.getElementById('to').value.trim();
      if (!from || !to) return;
      const r = C.convert(v, from, to, kind);
      o.appendChild(el('p', { text: `${v} ${from} = ${r} ${to}` }));
    });
    ['kind', 'val', 'from', 'to'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  bmi(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Height (m)', 'h'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.bmi({ weightKg: num('w'), heightM: num('h') });
      o.appendChild(el('p', { text: `BMI: ${r.bmi} kg/m^2 (${r.category})` }));
    });
    ['w', 'h'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  bsa(root) {
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Height (cm)', 'h'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const w = num('w'), h = num('h');
      o.appendChild(el('ul', {}, [
        el('li', { text: `Du Bois: ${C.bsaDuBois({ weightKg: w, heightCm: h })} m^2` }),
        el('li', { text: `Mosteller: ${C.bsaMosteller({ weightKg: w, heightCm: h })} m^2` }),
      ]));
    });
    ['w', 'h'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  map(root) {
    root.appendChild(field('Systolic BP (mmHg)', 's'));
    root.appendChild(field('Diastolic BP (mmHg)', 'd'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      o.appendChild(el('p', { text: `MAP: ${C.map({ sbp: num('s'), dbp: num('d') })} mmHg` }));
    });
    ['s', 'd'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'anion-gap'(root) {
    root.appendChild(field('Sodium (mEq/L)', 'na'));
    root.appendChild(field('Chloride (mEq/L)', 'cl'));
    root.appendChild(field('Bicarbonate (mEq/L)', 'hco3'));
    root.appendChild(field('Albumin (g/dL, optional)', 'alb'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const alb = document.getElementById('alb').value;
      const r = C.anionGap({ sodium: num('na'), chloride: num('cl'), bicarbonate: num('hco3'), albuminGdl: alb === '' ? null : Number(alb) });
      const items = [el('li', { text: `Anion gap: ${r.anionGap}` })];
      if (r.correctedAnionGap != null) items.push(el('li', { text: `Albumin-corrected: ${r.correctedAnionGap}` }));
      o.appendChild(el('ul', {}, items));
    });
    ['na', 'cl', 'hco3', 'alb'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'corrected-calcium'(root) {
    root.appendChild(field('Measured calcium (mg/dL)', 'ca'));
    root.appendChild(field('Albumin (g/dL)', 'alb'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      o.appendChild(el('p', { text: `Corrected calcium: ${C.correctedCalcium({ measuredCa: num('ca'), albuminGdl: num('alb') })} mg/dL` }));
    });
    ['ca', 'alb'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'corrected-sodium'(root) {
    root.appendChild(field('Measured sodium (mEq/L)', 'na'));
    root.appendChild(field('Glucose (mg/dL)', 'g'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.correctedSodium({ measuredNa: num('na'), glucose: num('g') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Corrected Na (factor 1.6): ${r.naBy1_6} mEq/L` }),
        el('li', { text: `Corrected Na (factor 2.4): ${r.naBy2_4} mEq/L` }),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'Both correction factors are reported per the literature (Katz 1973; Hillier 1999).' }));
    });
    ['na', 'g'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'aa-gradient'(root) {
    root.appendChild(field('FiO2 (0-1, e.g. 0.21)', 'fio2'));
    root.appendChild(field('PaCO2 (mmHg)', 'paco2'));
    root.appendChild(field('PaO2 (mmHg)', 'pao2'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.aaGradient({ fio2: num('fio2'), paco2: num('paco2'), pao2: num('pao2') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `PAO2: ${r.PAO2} mmHg` }),
        el('li', { text: `A-a gradient: ${r.aaGradient} mmHg` }),
      ]));
    });
    ['fio2', 'paco2', 'pao2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  egfr(root) {
    root.appendChild(field('Serum creatinine (mg/dL)', 'scr'));
    root.appendChild(field('Age (years)', 'age'));
    root.appendChild(selectField('Sex', 'sex', [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const v = C.egfrCkdEpi2021({ scr: num('scr'), age: num('age'), sex: document.getElementById('sex').value });
      o.appendChild(el('p', { text: `eGFR: ${v} mL/min/1.73 m^2 (CKD-EPI 2021 race-free)` }));
    });
    ['scr', 'age', 'sex'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'cockcroft-gault'(root) {
    root.appendChild(field('Age (years)', 'age'));
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Serum creatinine (mg/dL)', 'scr'));
    root.appendChild(selectField('Sex', 'sex', [{ value: 'M', text: 'Male' }, { value: 'F', text: 'Female' }]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const v = C.cockcroftGault({ age: num('age'), weightKg: num('w'), scr: num('scr'), sex: document.getElementById('sex').value });
      o.appendChild(el('p', { text: `Creatinine clearance: ${v} mL/min` }));
    });
    ['age', 'w', 'scr', 'sex'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'pack-years'(root) {
    root.appendChild(field('Packs per day', 'p'));
    root.appendChild(field('Years smoked', 'y'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      o.appendChild(el('p', { text: `Pack-years: ${C.packYears({ packsPerDay: num('p'), years: num('y') })}` }));
    });
    ['p', 'y'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'due-date'(root) {
    root.appendChild(field('Last menstrual period (YYYY-MM-DD)', 'lmp', { type: 'text', placeholder: '2025-01-01' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.naegele({ lmpIso: document.getElementById('lmp').value });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Estimated due date: ${r.dueDate}` }),
        el('li', { text: `Current gestational age: ${r.gestationalWeeks} weeks ${r.gestationalDays} days` }),
      ]));
    });
    document.getElementById('lmp').addEventListener('input', run);
  },

  qtc(root) {
    root.appendChild(field('QT interval (ms)', 'qt'));
    root.appendChild(field('Heart rate (bpm)', 'hr'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.qtc({ qtMs: num('qt'), hrBpm: num('hr') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Bazett: ${r.bazett} ms` }),
        el('li', { text: `Fridericia: ${r.fridericia} ms` }),
        el('li', { text: `Framingham: ${r.framingham} ms` }),
        el('li', { text: `Hodges: ${r.hodges} ms` }),
      ]));
    });
    ['qt', 'hr'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'pf-ratio'(root) {
    root.appendChild(field('PaO2 (mmHg)', 'pao2'));
    root.appendChild(field('FiO2 (0-1)', 'fio2'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.pfRatio({ pao2: num('pao2'), fio2: num('fio2') });
      o.appendChild(el('p', { text: `P/F ratio: ${r.ratio} (${r.category})` }));
    });
    ['pao2', 'fio2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },
};
