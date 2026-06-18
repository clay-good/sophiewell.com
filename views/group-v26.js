// spec-v101 §2: renderers for the five AF stroke-risk / QT-prolongation tiles
// (chads2, cha2ds2-va, chads-65, atria-stroke, tisdale-qtc).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// point scores render their counted factors as a derivation. Each tile renders the
// spec-v50 §3 clinical posture note and frames its output as the cited rule's
// score / band / pathway verdict -- none authors an anticoagulation or dosing
// order in Sophie's voice (spec-v11 §5.3); the AF-anticoagulation decision stays
// with the clinician and local protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cardio-v101.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, stroke rate, and pathway are the cited rule’s, computed from the inputs you entered; they do not guarantee an outcome. The anticoagulation start, agent, and dosing decisions stay with the clinician and local protocol.' }));
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
  // ----- 2.1 chads2 ------------------------------------------------------
  chads2(root) {
    root.appendChild(checkField('Congestive heart failure (1)', 'chads2-chf'));
    root.appendChild(checkField('Hypertension (1)', 'chads2-htn'));
    root.appendChild(checkField('Age >= 75 (1)', 'chads2-age'));
    root.appendChild(checkField('Diabetes mellitus (1)', 'chads2-dm'));
    root.appendChild(checkField('Prior stroke or TIA (2)', 'chads2-stroke'));
    const o = out(); root.appendChild(o);
    wire(['chads2-chf', 'chads2-htn', 'chads2-age', 'chads2-dm', 'chads2-stroke'], () => safe(o, () => {
      const r = M.chads2({
        chf: chk('chads2-chf'), hypertension: chk('chads2-htn'), age75: chk('chads2-age'),
        diabetes: chk('chads2-dm'), stroke: chk('chads2-stroke'),
      });
      resultRow(o, [
        { text: r.band, cls: r.total >= 2 ? 'warn' : null },
        { label: 'CHADS2 total (0-6)', value: String(r.total) },
        { label: 'Adjusted annual stroke rate', value: `${r.rate}%/yr` },
      ]);
      derivation(o, 'Points by component:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 cha2ds2-va --------------------------------------------------
  'cha2ds2-va'(root) {
    root.appendChild(field('Age (years)', 'va-age', { min: 0, max: 130, placeholder: '70' }));
    root.appendChild(checkField('CHF / LV dysfunction (1)', 'va-chf'));
    root.appendChild(checkField('Hypertension (1)', 'va-htn'));
    root.appendChild(checkField('Diabetes mellitus (1)', 'va-dm'));
    root.appendChild(checkField('Prior stroke / TIA / thromboembolism (2)', 'va-stroke'));
    root.appendChild(checkField('Vascular disease (1)', 'va-vasc'));
    const o = out(); root.appendChild(o);
    wire(['va-age', 'va-chf', 'va-htn', 'va-dm', 'va-stroke', 'va-vasc'], () => safe(o, () => {
      const r = M.cha2ds2Va({
        age: optNum('va-age'), chf: chk('va-chf'), hypertension: chk('va-htn'),
        diabetes: chk('va-dm'), stroke: chk('va-stroke'), vascular: chk('va-vasc'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.favorsOac ? 'warn' : null },
        { label: 'CHA2DS2-VA total (0-8)', value: String(r.total) },
      ]);
      derivation(o, 'Points by component (age scored by band; no sex point):', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 chads-65 ----------------------------------------------------
  'chads-65'(root) {
    root.appendChild(field('Age (years)', 'c65-age', { min: 0, max: 130, placeholder: '70' }));
    root.appendChild(checkField('Congestive heart failure', 'c65-chf'));
    root.appendChild(checkField('Hypertension', 'c65-htn'));
    root.appendChild(checkField('Diabetes mellitus', 'c65-dm'));
    root.appendChild(checkField('Prior stroke or TIA', 'c65-stroke'));
    root.appendChild(checkField('Coronary or peripheral arterial disease', 'c65-vasc'));
    const o = out(); root.appendChild(o);
    wire(['c65-age', 'c65-chf', 'c65-htn', 'c65-dm', 'c65-stroke', 'c65-vasc'], () => safe(o, () => {
      const r = M.chads65({
        age: optNum('c65-age'), chf: chk('c65-chf'), hypertension: chk('c65-htn'),
        diabetes: chk('c65-dm'), stroke: chk('c65-stroke'), vascularDisease: chk('c65-vasc'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.verdict === 'oac' ? 'warn' : null },
        { label: 'Gate that fired', value: r.gate },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 atria-stroke ------------------------------------------------
  'atria-stroke'(root) {
    root.appendChild(field('Age (years)', 'atria-age', { min: 0, max: 130, placeholder: '72' }));
    root.appendChild(checkField('Prior stroke (selects the age-point column)', 'atria-stroke-hx'));
    root.appendChild(checkField('Female sex (1)', 'atria-female'));
    root.appendChild(checkField('Diabetes mellitus (1)', 'atria-dm'));
    root.appendChild(checkField('Congestive heart failure (1)', 'atria-chf'));
    root.appendChild(checkField('Hypertension (1)', 'atria-htn'));
    root.appendChild(checkField('Proteinuria (1)', 'atria-proteinuria'));
    root.appendChild(checkField('eGFR < 45 mL/min or ESRD (1)', 'atria-renal'));
    const o = out(); root.appendChild(o);
    const ids = ['atria-age', 'atria-stroke-hx', 'atria-female', 'atria-dm', 'atria-chf', 'atria-htn', 'atria-proteinuria', 'atria-renal'];
    wire(ids, () => safe(o, () => {
      const r = M.atriaStroke({
        age: optNum('atria-age'), priorStroke: chk('atria-stroke-hx'), female: chk('atria-female'),
        diabetes: chk('atria-dm'), chf: chk('atria-chf'), hypertension: chk('atria-htn'),
        proteinuria: chk('atria-proteinuria'), renal: chk('atria-renal'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'ATRIA total (0-15)', value: String(r.total) },
        { label: 'Risk band', value: r.risk },
      ]);
      derivation(o, 'Points by component (age from the prior-stroke / no-prior-stroke column):', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 tisdale-qtc -------------------------------------------------
  'tisdale-qtc'(root) {
    root.appendChild(checkField('Age >= 68 years (1)', 'tis-age'));
    root.appendChild(checkField('Female sex (1)', 'tis-female'));
    root.appendChild(checkField('Loop diuretic (1)', 'tis-loop'));
    root.appendChild(checkField('Serum potassium <= 3.5 mEq/L (2)', 'tis-k'));
    root.appendChild(checkField('Admission QTc >= 450 ms (2)', 'tis-qtc'));
    root.appendChild(checkField('Acute MI (2)', 'tis-mi'));
    root.appendChild(checkField('Sepsis (3)', 'tis-sepsis'));
    root.appendChild(checkField('Heart failure (3)', 'tis-hf'));
    root.appendChild(selectField('QT-prolonging drugs', 'tis-drugs', [
      { value: 'none', text: 'None (0)' },
      { value: 'one', text: 'One QT-prolonging drug (3)' },
      { value: 'two-plus', text: 'Two or more QT-prolonging drugs (6)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['tis-age', 'tis-female', 'tis-loop', 'tis-k', 'tis-qtc', 'tis-mi', 'tis-sepsis', 'tis-hf', 'tis-drugs'];
    wire(ids, () => safe(o, () => {
      const r = M.tisdaleQtc({
        age68: chk('tis-age'), female: chk('tis-female'), loopDiuretic: chk('tis-loop'),
        hypokalemia: chk('tis-k'), qtcProlonged: chk('tis-qtc'), acuteMi: chk('tis-mi'),
        sepsis: chk('tis-sepsis'), heartFailure: chk('tis-hf'), qtDrugs: selVal('tis-drugs'),
      });
      resultRow(o, [
        { text: r.band, cls: r.risk === 'high' ? 'warn' : null },
        { label: 'Tisdale total (0-21)', value: String(r.total) },
        { label: 'Risk band', value: r.risk },
      ]);
      derivation(o, 'Points by risk factor:', r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
