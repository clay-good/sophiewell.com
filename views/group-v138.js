// spec-v138 §2: renderers for the six obstetrics / maternal-fetal-medicine
// instruments (hadlock-efw, fullpiers, minipiers, afi, barnhart-hcg, iom-gwg).
// hadlock-efw, afi, barnhart-hcg, and iom-gwg read in Clinical Math & Conversions
// (Group E); fullpiers and minipiers are Clinical Scoring & Risk (Group G). v138
// opens Wave 7 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames an estimate,
// probability, or range, not management; none authors a delivery / transfer order
// in Sophie's voice (spec-v11 §5.3). The log10 and logistic tiles surface a
// complete-the-fields fallback rather than a number from a bad input
// (lib/ob-v138.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ob-v138.js';
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
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The estimate, probability, or range is the cited instrument’s, computed from the values you entered. The management decision — image, deliver, transfer, or counsel — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

export const renderers = {
  // ----- 2.1 hadlock-efw ------------------------------------------------
  'hadlock-efw'(root) {
    note(root, 'Hadlock estimated fetal weight, four-parameter model (Hadlock 1985): enter the four sonographic biometry measurements in centimeters. The tile returns a point weight estimate; the percentile interpretation is left to the clinician.');
    root.appendChild(field('Biparietal diameter, BPD (cm)', 'he-bpd', { step: '0.1', min: 0, placeholder: 'e.g. 9.0' }));
    root.appendChild(field('Head circumference, HC (cm)', 'he-hc', { step: '0.1', min: 0, placeholder: 'e.g. 33.0' }));
    root.appendChild(field('Abdominal circumference, AC (cm)', 'he-ac', { step: '0.1', min: 0, placeholder: 'e.g. 30.0' }));
    root.appendChild(field('Femur length, FL (cm)', 'he-fl', { step: '0.1', min: 0, placeholder: 'e.g. 7.0' }));
    const o = out(); root.appendChild(o);
    wire(['he-bpd', 'he-hc', 'he-ac', 'he-fl'], () => safe(o, () => {
      const r = M.hadlockEfw({ bpd: optNum('he-bpd'), hc: optNum('he-hc'), ac: optNum('he-ac'), fl: optNum('he-fl') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'EFW', value: `${r.efw} g` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 fullpiers --------------------------------------------------
  'fullpiers'(root) {
    note(root, 'fullPIERS (von Dadelszen 2011): the probability of an adverse maternal outcome within 48 h of pre-eclampsia. Enter creatinine in µmol/L. A predicted probability of 30% or more is the high-risk rule-in cut-point.');
    root.appendChild(field('Gestational age (weeks)', 'fp-ga', { step: '0.1', min: 0, max: 45, placeholder: 'e.g. 32' }));
    root.appendChild(checkField('Chest pain or dyspnea', 'fp-chest'));
    root.appendChild(field('Oxygen saturation, SpO₂ (%)', 'fp-spo2', { step: '1', min: 0, max: 100, placeholder: 'e.g. 96' }));
    root.appendChild(field('Platelet count (×10⁹/L)', 'fp-plt', { step: '1', min: 0, placeholder: 'e.g. 120' }));
    root.appendChild(field('Creatinine (µmol/L)', 'fp-creat', { step: '1', min: 0, placeholder: 'e.g. 90' }));
    root.appendChild(field('AST (U/L)', 'fp-ast', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    const o = out(); root.appendChild(o);
    wire(['fp-ga', 'fp-chest', 'fp-spo2', 'fp-plt', 'fp-creat', 'fp-ast'], () => safe(o, () => {
      const r = M.fullPiers({ ga: optNum('fp-ga'), chestPainDyspnea: chk('fp-chest'), spo2: optNum('fp-spo2'), platelets: optNum('fp-plt'), creatinine: optNum('fp-creat'), ast: optNum('fp-ast') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Probability', value: `${r.probability}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 minipiers --------------------------------------------------
  'minipiers'(root) {
    note(root, 'miniPIERS (Payne 2014): a bedside-only probability of adverse maternal outcome — no labs. Gestational age and systolic blood pressure enter as natural logs. A predicted probability of 25% or more is the high-risk rule-in cut-point.');
    root.appendChild(checkField('Multiparous (one or more prior births)', 'mp-multip'));
    root.appendChild(field('Gestational age (weeks)', 'mp-ga', { step: '0.1', min: 1, max: 45, placeholder: 'e.g. 34' }));
    root.appendChild(field('Systolic blood pressure (mmHg)', 'mp-sbp', { step: '1', min: 1, placeholder: 'e.g. 160' }));
    root.appendChild(selectField('Dipstick proteinuria', 'mp-prot', [
      { value: 'lt2', text: 'Negative, trace, or 1+' },
      { value: '2+', text: '2+' },
      { value: '3+', text: '3+' },
      { value: '4+', text: '4+' },
    ]));
    root.appendChild(checkField('Headache or visual changes', 'mp-hv'));
    root.appendChild(checkField('Chest pain or dyspnea', 'mp-cpd'));
    root.appendChild(checkField('Vaginal bleeding with abdominal pain', 'mp-vbap'));
    const o = out(); root.appendChild(o);
    wire(['mp-multip', 'mp-ga', 'mp-sbp', 'mp-prot', 'mp-hv', 'mp-cpd', 'mp-vbap'], () => safe(o, () => {
      const r = M.miniPiers({ multiparous: chk('mp-multip'), ga: optNum('mp-ga'), sbp: optNum('mp-sbp'), proteinuria: selVal('mp-prot'), headacheVisual: chk('mp-hv'), chestPainDyspnea: chk('mp-cpd'), vaginalBleedingAbdPain: chk('mp-vbap') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Probability', value: `${r.probability}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 afi --------------------------------------------------------
  'afi'(root) {
    note(root, 'Amniotic Fluid Index (Moore & Cayle 1990): sum the deepest vertical pocket (cm) in each of the four uterine quadrants. AFI < 5 cm is oligohydramnios; > 24 cm is polyhydramnios; 5-8 cm is low-normal.');
    root.appendChild(field('Right upper quadrant pocket (cm)', 'af-q1', { step: '0.1', min: 0, placeholder: 'e.g. 4.5' }));
    root.appendChild(field('Right lower quadrant pocket (cm)', 'af-q2', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Left upper quadrant pocket (cm)', 'af-q3', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Left lower quadrant pocket (cm)', 'af-q4', { step: '0.1', min: 0, placeholder: 'e.g. 4.5' }));
    const o = out(); root.appendChild(o);
    wire(['af-q1', 'af-q2', 'af-q3', 'af-q4'], () => safe(o, () => {
      const r = M.afi({ q1: optNum('af-q1'), q2: optNum('af-q2'), q3: optNum('af-q3'), q4: optNum('af-q4') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'AFI', value: `${r.afi.toFixed(1)} cm` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 barnhart-hcg -----------------------------------------------
  'barnhart-hcg'(root) {
    note(root, 'Minimal serial-hCG rise (Barnhart 2004): the slowest normal rise for a potentially viable intrauterine pregnancy is 53% over 48 h. Enter the two serum values and the interval. A sub-minimal rise is abnormal but not by itself diagnostic.');
    root.appendChild(field('Initial hCG (mIU/mL)', 'bh-init', { step: '1', min: 0, placeholder: 'e.g. 1000' }));
    root.appendChild(field('Repeat hCG (mIU/mL)', 'bh-rep', { step: '1', min: 0, placeholder: 'e.g. 1400' }));
    root.appendChild(field('Interval between draws (hours)', 'bh-hrs', { step: '0.5', min: 0, placeholder: 'e.g. 48' }));
    const o = out(); root.appendChild(o);
    wire(['bh-init', 'bh-rep', 'bh-hrs'], () => safe(o, () => {
      const r = M.barnhartHcg({ initial: optNum('bh-init'), repeat: optNum('bh-rep'), hours: optNum('bh-hrs') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Observed rise', value: `${r.observed.toFixed(1)}%` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 iom-gwg ----------------------------------------------------
  'iom-gwg'(root) {
    note(root, 'IOM gestational weight gain (IOM 2009 / ACOG CO 548): the recommended total gain and weekly rate by pre-pregnancy BMI category. Enter pre-pregnancy weight in pounds and height in inches; check the box for a twin pregnancy.');
    root.appendChild(field('Pre-pregnancy weight (lb)', 'ig-wt', { step: '0.1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('Height (in)', 'ig-ht', { step: '0.1', min: 0, placeholder: 'e.g. 64' }));
    root.appendChild(checkField('Twin pregnancy', 'ig-twin'));
    const o = out(); root.appendChild(o);
    wire(['ig-wt', 'ig-ht', 'ig-twin'], () => safe(o, () => {
      const r = M.iomGwg({ weight: optNum('ig-wt'), height: optNum('ig-ht'), twin: chk('ig-twin') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'BMI', value: r.bmi.toFixed(1) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
