// spec-v167 §2: renderers for the six single-formula tiles of the spec-v162
// Cross-Discipline Completion program — meanAirwayPressure, cerebroplacentalRatio,
// toeBrachialIndex, stoolOsmoticGap, pureToneAverage (Clinical Math &
// Conversions, Group E) and rutgeerts (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Every
// division (Pₘₐw Ti+Te, CPR UA-PI, TBI brachial) and sum is guarded in
// lib/oneformula-v167.js; rutgeerts resolves every finding to one i-grade. Per
// the spec-v50 §3 posture note each tile defers the decision to the clinician
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/oneformula-v167.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
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
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value or grade and its interpretation are the cited source’s, computed from the measurements you enter. The management decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RUTGEERTS_OPTS = [
  { value: 'i0', text: 'i0 — no lesions' },
  { value: 'i1', text: 'i1 — ≤ 5 aphthous lesions' },
  { value: 'i2', text: 'i2 — > 5 aphthous lesions (normal mucosa between), skip areas, or lesions confined to the anastomosis' },
  { value: 'i3', text: 'i3 — diffuse aphthous ileitis with diffusely inflamed mucosa' },
  { value: 'i4', text: 'i4 — diffuse inflammation with large ulcers, nodules, and/or stenosis' },
];

export const renderers = {
  // ----- 2.1 mean-airway-pressure --------------------------------------------
  'mean-airway-pressure'(root) {
    note(root, 'Mean airway pressure (Marini 1992): Pₘₐw = [(PIP·Ti) + (PEEP·Te)] / (Ti + Te), the square-wave approximation. A determinant of oxygenation and of the oxygenation index. Near-neighbors: oxygenation-index.');
    root.appendChild(num('Peak inspiratory pressure PIP (cmH₂O)', 'maw-pip', { min: '0' }));
    root.appendChild(num('PEEP (cmH₂O)', 'maw-peep', { min: '0' }));
    root.appendChild(num('Inspiratory time Ti (s)', 'maw-ti', { min: '0' }));
    root.appendChild(num('Expiratory time Te (s)', 'maw-te', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['maw-pip', 'maw-peep', 'maw-ti', 'maw-te'], () => safe(o, () => {
      const r = M.meanAirwayPressure({ pip: val('maw-pip'), peep: val('maw-peep'), ti: val('maw-ti'), te: val('maw-te') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Mean airway pressure', value: `${r.maw} cmH₂O` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 cerebroplacental-ratio ------------------------------------------
  'cerebroplacental-ratio'(root) {
    note(root, 'Cerebroplacental ratio (Gramellini 1992): CPR = MCA-PI / UA-PI. A CPR below 1 (or below the gestational-age centile) indicates cerebral redistribution ("brain-sparing") and is associated with adverse outcome. Near-neighbors: hadlock-efw, bpp.');
    root.appendChild(num('MCA pulsatility index (MCA-PI)', 'cpr-mca', { min: '0' }));
    root.appendChild(num('Umbilical-artery pulsatility index (UA-PI)', 'cpr-ua', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['cpr-mca', 'cpr-ua'], () => safe(o, () => {
      const r = M.cerebroplacentalRatio({ mca: val('cpr-mca'), ua: val('cpr-ua') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'CPR', value: `${r.cpr}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 toe-brachial-index ----------------------------------------------
  'toe-brachial-index'(root) {
    note(root, 'Toe-brachial index (Aboyans 2012): TBI = toe systolic / higher brachial systolic pressure. A TBI below 0.70 is abnormal (PAD); the test of choice when the ABI is non-compressible (> 1.40). Near-neighbors: abi.');
    root.appendChild(num('Toe systolic pressure (mmHg)', 'tbi-toe', { min: '0' }));
    root.appendChild(num('Brachial systolic pressure — the higher arm (mmHg)', 'tbi-brachial', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['tbi-toe', 'tbi-brachial'], () => safe(o, () => {
      const r = M.toeBrachialIndex({ toe: val('tbi-toe'), brachial: val('tbi-brachial') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'TBI', value: `${r.tbi}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 stool-osmotic-gap -----------------------------------------------
  'stool-osmotic-gap'(root) {
    note(root, 'Stool osmotic gap (Eherer & Fordtran 1992): gap = 290 − 2·(stool Na + K). > 100 osmotic diarrhea, < 50 secretory, 50–100 indeterminate. Fixed 290 mOsm/kg assumption. Near-neighbors: anion-gap.');
    root.appendChild(num('Stool sodium (mEq/L)', 'sog-na', { min: '0' }));
    root.appendChild(num('Stool potassium (mEq/L)', 'sog-k', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['sog-na', 'sog-k'], () => safe(o, () => {
      const r = M.stoolOsmoticGap({ na: val('sog-na'), k: val('sog-k') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Osmotic gap', value: `${r.gap} mOsm/kg` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 pure-tone-average -----------------------------------------------
  'pure-tone-average'(root) {
    note(root, 'Pure-tone average: 3FA = mean(500, 1000, 2000 Hz); 4FA adds 4000 Hz. Severity (dB HL): normal ≤25, mild 26–40, moderate 41–55, moderately severe 56–70, severe 71–90, profound >90.');
    root.appendChild(num('500 Hz threshold (dB HL)', 'pta-500'));
    root.appendChild(num('1000 Hz threshold (dB HL)', 'pta-1000'));
    root.appendChild(num('2000 Hz threshold (dB HL)', 'pta-2000'));
    root.appendChild(num('4000 Hz threshold (dB HL) — optional, enables the 4-frequency PTA', 'pta-4000'));
    const o = out(); root.appendChild(o);
    wire(['pta-500', 'pta-1000', 'pta-2000', 'pta-4000'], () => safe(o, () => {
      const r = M.pureToneAverage({ t500: val('pta-500'), t1000: val('pta-1000'), t2000: val('pta-2000'), t4000: val('pta-4000') });
      if (!r.valid) { showInvalid(o, r); return; }
      const items = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: '3-frequency PTA', value: `${r.pta3} dB HL` },
      ];
      if (r.pta4 !== null) items.push({ label: '4-frequency PTA', value: `${r.pta4} dB HL` });
      resultRow(o, items);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 rutgeerts -------------------------------------------------------
  'rutgeerts'(root) {
    note(root, 'Rutgeerts score (Rutgeerts 1990): endoscopic grading of post-operative Crohn’s recurrence in the neoterminal ileum (i0–i4). A grade ≥ i2 predicts clinical recurrence. Near-neighbors: harvey-bradshaw, cdai-crohns.');
    root.appendChild(pickField('Neoterminal-ileum endoscopic finding', 'rutg-finding', RUTGEERTS_OPTS));
    const o = out(); root.appendChild(o);
    wire(['rutg-finding'], () => safe(o, () => {
      const r = M.rutgeerts({ finding: val('rutg-finding') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
