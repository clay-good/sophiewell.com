// spec-v115 §2: renderers for the five pulmonary decision rules (mayo-spn,
// brock-nodule, fleischner-2017, reveal-lite-2, rapid-pleural). All five home in
// Clinical Scoring & Risk (Group G). v115 closes Wave 3 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames pretest
// probability, a guideline interval, or a risk band, not management; none authors
// a biopsy, PET, surveillance, or drainage order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pulmnod-v115.js';
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
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The probability, interval, or score is the cited instrument’s, computed from the values you entered; it frames pretest probability, guideline follow-up, or risk. The biopsy, PET, surveillance, escalate-care, and drainage decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 mayo-spn ---------------------------------------------------
  'mayo-spn'(root) {
    note(root, 'Mayo Clinic SPN model: a logistic estimate of the probability of malignancy in an incidental solitary pulmonary nodule. Enter the age and nodule diameter and mark the clinical/radiographic items.');
    root.appendChild(field('Age (years)', 'ms-age', { min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Nodule diameter (mm)', 'ms-diam', { step: '0.1', min: 0, placeholder: 'e.g. 12' }));
    root.appendChild(checkField('Current or former smoker', 'ms-smoke'));
    root.appendChild(checkField('Prior extrathoracic cancer diagnosed > 5 years ago', 'ms-cancer'));
    root.appendChild(checkField('Spiculation on CT', 'ms-spic'));
    root.appendChild(checkField('Upper-lobe location', 'ms-upper'));
    const o = out(); root.appendChild(o);
    wire(['ms-age', 'ms-diam', 'ms-smoke', 'ms-cancer', 'ms-spic', 'ms-upper'], () => safe(o, () => {
      const r = M.mayoSpn({
        age: optNum('ms-age'), diameter: optNum('ms-diam'), smoking: chk('ms-smoke'),
        cancer: chk('ms-cancer'), spiculation: chk('ms-spic'), upperlobe: chk('ms-upper'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Probability', value: `${r.pct}%` },
        { label: 'Pretest', value: `${r.tier} (${r.cut})` },
      ]);
      note(o, `Positive descriptors: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 brock-nodule -----------------------------------------------
  'brock-nodule'(root) {
    note(root, 'Brock University / PanCan model: a logistic estimate of cancer probability validated on lung-screening cohorts. Enter the age, nodule size, and nodule count, choose the type, and mark the items.');
    root.appendChild(field('Age (years)', 'bn-age', { min: 0, placeholder: 'e.g. 65' }));
    root.appendChild(field('Nodule size (mm)', 'bn-size', { step: '0.1', min: 0, placeholder: 'e.g. 15' }));
    root.appendChild(field('Number of nodules', 'bn-count', { min: 1, placeholder: 'e.g. 1' }));
    root.appendChild(selectField('Nodule type', 'bn-type', [
      { value: 'solid', text: 'Solid' },
      { value: 'part-solid', text: 'Part-solid' },
      { value: 'non-solid', text: 'Non-solid (pure ground-glass)' },
    ]));
    root.appendChild(checkField('Female sex', 'bn-female'));
    root.appendChild(checkField('Family history of lung cancer', 'bn-fh'));
    root.appendChild(checkField('Emphysema on CT', 'bn-emph'));
    root.appendChild(checkField('Upper-lobe location', 'bn-upper'));
    root.appendChild(checkField('Spiculation on CT', 'bn-spic'));
    const o = out(); root.appendChild(o);
    wire(['bn-age', 'bn-size', 'bn-count', 'bn-type', 'bn-female', 'bn-fh', 'bn-emph', 'bn-upper', 'bn-spic'], () => safe(o, () => {
      const r = M.brockNodule({
        age: optNum('bn-age'), size: optNum('bn-size'), count: optNum('bn-count'), type: selVal('bn-type'),
        female: chk('bn-female'), familyHistory: chk('bn-fh'), emphysema: chk('bn-emph'),
        upperlobe: chk('bn-upper'), spiculation: chk('bn-spic'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Probability', value: `${r.pct}%` },
        { label: 'Pretest', value: `${r.tier} (${r.cut})` },
      ]);
      note(o, `Nodule: ${r.detail}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 fleischner-2017 --------------------------------------------
  'fleischner-2017'(root) {
    note(root, 'Fleischner Society 2017: the recommended CT-surveillance interval for an incidental pulmonary nodule. Applies to patients >= 35 years, not to screening, a known cancer, or immunosuppression.');
    root.appendChild(field('Nodule size (mm)', 'fl-size', { step: '0.1', min: 0, placeholder: 'e.g. 7' }));
    root.appendChild(selectField('Nodule type', 'fl-type', [
      { value: 'solid', text: 'Solid' },
      { value: 'part-solid', text: 'Part-solid' },
      { value: 'ground-glass', text: 'Pure ground-glass' },
    ]));
    root.appendChild(selectField('Number of nodules', 'fl-mult', [
      { value: 'single', text: 'Single' },
      { value: 'multiple', text: 'Multiple' },
    ]));
    root.appendChild(selectField('Patient risk (solid nodules)', 'fl-risk', [
      { value: 'low', text: 'Low risk (minimal/absent smoking, few risk factors)' },
      { value: 'high', text: 'High risk (smoking, older age, upper lobe, spiculation, emphysema/fibrosis, family history)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['fl-size', 'fl-type', 'fl-mult', 'fl-risk'], () => safe(o, () => {
      const r = M.fleischner2017({
        size: optNum('fl-size'), type: selVal('fl-type'), multiplicity: selVal('fl-mult'), risk: selVal('fl-risk'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Cell', value: r.cell },
      ]);
      note(o, 'Patient risk only changes the solid-nodule cells; subsolid recommendations assume a persistent nodule. Size is the average of long and short axis.');
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 reveal-lite-2 ----------------------------------------------
  'reveal-lite-2'(root) {
    note(root, 'REVEAL Lite 2: an abridged, all-noninvasive 1-year-risk score for pulmonary arterial hypertension. Starts from a base of 6; enter the six variables. Total 1-14, banded low 1-5 / intermediate 6-7 / high >= 8.');
    root.appendChild(field('eGFR (mL/min/1.73 m^2)', 'rv-egfr', { step: '1', min: 0, placeholder: 'e.g. 72' }));
    root.appendChild(selectField('WHO / NYHA functional class', 'rv-who', [
      { value: '1', text: 'Class I (-1)' },
      { value: '2', text: 'Class II (0)' },
      { value: '3', text: 'Class III (+1)' },
      { value: '4', text: 'Class IV (+2)' },
    ]));
    root.appendChild(field('Systolic BP (mm Hg)', 'rv-sbp', { step: '1', min: 0, placeholder: 'e.g. 104' }));
    root.appendChild(field('Heart rate (beats/min)', 'rv-hr', { step: '1', min: 0, placeholder: 'e.g. 88' }));
    root.appendChild(field('6-minute walk distance (m)', 'rv-mwd', { step: '1', min: 0, placeholder: 'e.g. 300' }));
    root.appendChild(selectField('BNP / NT-proBNP band', 'rv-bnp', [
      { value: 'low', text: 'BNP < 50 / NT-proBNP < 300 pg/mL (-2)' },
      { value: 'mid', text: 'BNP 50 to < 200 / NT-proBNP 300 to < 1100 pg/mL (0)' },
      { value: 'high1', text: 'BNP 200 to < 800 pg/mL (+1)' },
      { value: 'high2', text: 'BNP >= 800 / NT-proBNP >= 1100 pg/mL (+2)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['rv-egfr', 'rv-who', 'rv-sbp', 'rv-hr', 'rv-mwd', 'rv-bnp'], () => safe(o, () => {
      const r = M.revealLite2({
        egfr: optNum('rv-egfr'), who: selVal('rv-who'), sbp: optNum('rv-sbp'),
        hr: optNum('rv-hr'), mwd: optNum('rv-mwd'), bnp: selVal('rv-bnp'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total} (1-14)` },
        { label: 'Risk', value: `${r.tier} (${r.mortality})` },
      ]);
      note(o, `Adjustments from base 6: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 rapid-pleural ----------------------------------------------
  'rapid-pleural'(root) {
    note(root, 'RAPID score: 3-month mortality in pleural infection. Renal (urea), Age, Purulence, Infection source, and Dietary albumin. Total 0-7, banded low 0-2 / medium 3-4 / high 5-7.');
    root.appendChild(selectField('Serum urea band', 'rp-urea', [
      { value: 'low', text: '< 5 mmol/L (0)' },
      { value: 'mid', text: '5-8 mmol/L (+1)' },
      { value: 'high', text: '> 8 mmol/L (+2)' },
    ]));
    root.appendChild(field('Age (years)', 'rp-age', { min: 0, placeholder: 'e.g. 74' }));
    root.appendChild(field('Serum albumin (g/L)', 'rp-alb', { step: '0.1', min: 0, placeholder: 'e.g. 24' }));
    root.appendChild(checkField('Non-purulent pleural fluid -- +1', 'rp-nonpur'));
    root.appendChild(checkField('Hospital-acquired infection -- +1', 'rp-hosp'));
    const o = out(); root.appendChild(o);
    wire(['rp-urea', 'rp-age', 'rp-alb', 'rp-nonpur', 'rp-hosp'], () => safe(o, () => {
      const r = M.rapidPleural({
        urea: selVal('rp-urea'), age: optNum('rp-age'), albumin: optNum('rp-alb'),
        nonPurulent: chk('rp-nonpur'), hospitalAcquired: chk('rp-hosp'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/7` },
        { label: 'Risk', value: `${r.tier} (${r.mortality})` },
      ]);
      note(o, `Items counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
