// spec-v190 §2: renderers for four hepatology / GI tiles — PALBI grade, MELD-Na,
// the Clichy acute-liver-failure criteria, and the Rome IV IBS criteria. Groups
// E (clinical math) and G (classification / criteria).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the transplant-referral / diagnosis
// decision to the treating team (spec-v11 §5.3) — these grade, score, and
// classify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hepgi-v190.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
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
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function invalid(o, r) { note(o, 'Complete the remaining fields.'); note(o, r.note); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade, score, or criteria result is the cited source’s, computed from the inputs you enter. The transplant-referral, listing, and diagnosis decisions stay with the treating team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SUBTYPE_OPTS = [
  { value: '', text: '— choose predominant stool pattern —' },
  { value: 'ibs-c', text: 'IBS-C (constipation-predominant)' },
  { value: 'ibs-d', text: 'IBS-D (diarrhea-predominant)' },
  { value: 'ibs-m', text: 'IBS-M (mixed)' },
  { value: 'ibs-u', text: 'IBS-U (unclassified)' },
];

export const renderers = {
  // ----- 2.1 palbi -----------------------------------------------------------
  palbi(root) {
    note(root, 'PALBI grade (Liu 2017): refines ALBI by adding the platelet count (a portal-hypertension marker). Grade 1 (≤ −2.53), 2 (−2.53 to −2.09), 3 (> −2.09). Near-neighbors: albi-grade, bclc-hcc.');
    root.appendChild(num('Total bilirubin (mg/dL)', 'palbi-bilirubin'));
    root.appendChild(num('Albumin (g/dL)', 'palbi-albumin'));
    root.appendChild(num('Platelet count (×10⁹/L, i.e. thousands/µL)', 'palbi-platelets'));
    const o = out(); root.appendChild(o);
    wire(['palbi-bilirubin', 'palbi-albumin', 'palbi-platelets'], () => safe(o, () => {
      const r = M.palbi({ bilirubin: val('palbi-bilirubin'), albumin: val('palbi-albumin'), platelets: val('palbi-platelets') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PALBI score', value: `${r.score}` },
        { label: 'Grade', value: `${r.grade}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 meld-na ---------------------------------------------------------
  'meld-na'(root) {
    note(root, 'MELD-Na (Kim 2008; OPTN/UNOS operational coefficients): the sodium-augmented waitlist mortality score that preceded MELD 3.0. Sodium is applied only when MELD > 11; the score is bounded to 6–40. Near-neighbors: meld-childpugh.');
    root.appendChild(num('Total bilirubin (mg/dL)', 'meldna-bilirubin'));
    root.appendChild(num('INR', 'meldna-inr'));
    root.appendChild(num('Creatinine (mg/dL)', 'meldna-creatinine'));
    root.appendChild(num('Sodium (mmol/L)', 'meldna-sodium'));
    root.appendChild(checkField('Dialysis ≥ 2× (or CVVHD ≥ 24 h) in the prior week', 'meldna-dialysis'));
    const o = out(); root.appendChild(o);
    wire(['meldna-bilirubin', 'meldna-inr', 'meldna-creatinine', 'meldna-sodium', 'meldna-dialysis'], () => safe(o, () => {
      const r = M.meldNa({ bilirubin: val('meldna-bilirubin'), inr: val('meldna-inr'), creatinine: val('meldna-creatinine'), sodium: val('meldna-sodium'), dialysis: chk('meldna-dialysis') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MELD-Na', value: `${r.score}` },
        { label: 'MELD(i)', value: `${r.meldI}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 clichy ----------------------------------------------------------
  clichy(root) {
    note(root, 'Clichy criteria (Bernuau 1986): emergency liver-transplant evaluation when encephalopathy is present AND factor V is < 20% (age < 30) or < 30% (age ≥ 30). A complement to King’s College. Near-neighbors: kings-college.');
    root.appendChild(num('Age (years)', 'clichy-age'));
    root.appendChild(num('Coagulation factor V (% of normal)', 'clichy-factorV'));
    root.appendChild(checkField('Hepatic encephalopathy (grade 3–4: confusion or coma)', 'clichy-encephalopathy'));
    const o = out(); root.appendChild(o);
    wire(['clichy-age', 'clichy-factorV', 'clichy-encephalopathy'], () => safe(o, () => {
      const r = M.clichy({ age: val('clichy-age'), factorV: val('clichy-factorV'), encephalopathy: chk('clichy-encephalopathy') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria', value: r.met ? 'met' : 'not met' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 rome-iv-ibs -----------------------------------------------------
  'rome-iv-ibs'(root) {
    note(root, 'Rome IV IBS criteria (Lacy 2016): recurrent abdominal pain ≥ 1 day/week (3 months, onset ≥ 6 months prior) plus ≥ 2 of three associated features; subtype by predominant stool pattern. Assumes alarm features absent.');
    root.appendChild(checkField('Recurrent abdominal pain, on average ≥ 1 day/week in the last 3 months', 'rome-painFrequency'));
    root.appendChild(checkField('Symptom onset ≥ 6 months before diagnosis', 'rome-onset6mo'));
    note(root, 'Associated with ≥ 2 of the following:');
    root.appendChild(checkField('Related to defecation', 'rome-defecation'));
    root.appendChild(checkField('Associated with a change in stool frequency', 'rome-stoolFrequency'));
    root.appendChild(checkField('Associated with a change in stool form (appearance)', 'rome-stoolForm'));
    root.appendChild(selectField('Predominant stool pattern (subtype)', 'rome-subtype', SUBTYPE_OPTS));
    const o = out(); root.appendChild(o);
    wire(['rome-painFrequency', 'rome-onset6mo', 'rome-defecation', 'rome-stoolFrequency', 'rome-stoolForm', 'rome-subtype'], () => safe(o, () => {
      const r = M.romeIvIbs({ painFrequency: chk('rome-painFrequency'), onset6mo: chk('rome-onset6mo'), defecation: chk('rome-defecation'), stoolFrequency: chk('rome-stoolFrequency'), stoolForm: chk('rome-stoolForm'), subtype: val('rome-subtype') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria', value: r.met ? 'met' : 'not met' },
        { label: 'Associated features', value: `${r.associated}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
