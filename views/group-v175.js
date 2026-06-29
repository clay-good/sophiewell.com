// spec-v175 §2: renderers for the three observational pain-assessment tiles of
// the spec-v172 Long-Term Care & Geriatric Assessment program — abbey-pain (the
// Abbey Pain Scale), cnpi (the Checklist of Nonverbal Pain Indicators), and
// doloplus-2 (the DOLOPLUS-2 behavioral pain scale). All Clinical Scoring &
// Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a deterministic input -> score/band mapping (spec-v100 §2 classification
// clarification); an incomplete observation surfaces a complete-the-fields
// fallback. Per the spec-v50 §3 posture note each tile defers the clinical
// decision to the clinician (spec-v11 §5.3) and never authors an analgesic order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v175.js';
import { resultRow } from '../lib/result-copy.js';

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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and its interpretation are the cited instrument’s, derived from the observations you enter; it is an observational pain screen, not a diagnosis. The clinical decision — further pain assessment, the analgesic plan, and any medication order — stays with the clinician and local pain protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEV0123 = [
  { value: '0', text: '0 — absent' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — severe' },
];
const PRESENT = [
  { value: '0', text: 'Absent' },
  { value: '1', text: 'Present' },
];
const DOLO03 = [
  { value: '0', text: '0' },
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
];

const ABBEY_FIELDS = [
  ['Vocalization (whimpering, groaning, crying)', 'abbey-vocal', 'vocalization'],
  ['Facial expression (tense, frowning, grimacing, frightened)', 'abbey-facial', 'facialExpression'],
  ['Change in body language (fidgeting, rocking, guarding, withdrawn)', 'abbey-body', 'bodyLanguage'],
  ['Behavioral change (more confused, refusing food, altered routine)', 'abbey-behavior', 'behavioralChange'],
  ['Physiological change (temperature, pulse or BP outside normal, sweating, pallor)', 'abbey-physiological', 'physiologicalChange'],
  ['Physical change (skin tears, pressure areas, arthritis, contractures, injuries)', 'abbey-physical', 'physicalChange'],
];
// CNPI: each behavior is observed in two conditions. Field ids carry the
// condition suffix; compute keys are `${behavior}Rest` / `${behavior}Move`.
const CNPI_BEHAVIOURS = [
  ['Nonverbal vocal complaints (sighs, moans, groans, gasps)', 'nonverbalVocal'],
  ['Facial grimacing or wincing', 'facialGrimace'],
  ['Bracing (clutching or holding onto a rail or furniture)', 'bracing'],
  ['Restlessness (constant or intermittent shifting, rocking, inability to keep still)', 'restlessness'],
  ['Rubbing (massaging the affected area)', 'rubbing'],
  ['Verbal vocal complaints (words expressing discomfort, cursing)', 'verbalVocal'],
];
const DOLO_FIELDS = [
  ['Somatic complaints', 'dolo-complaints', 'somaticComplaints'],
  ['Protective body postures adopted at rest', 'dolo-posture', 'protectivePostureRest'],
  ['Protection of sore areas', 'dolo-protection', 'protectionSoreAreas'],
  ['Facial expression', 'dolo-facial', 'facialExpression'],
  ['Sleep pattern', 'dolo-sleep', 'sleepPattern'],
  ['Washing and/or dressing', 'dolo-washing', 'washingDressing'],
  ['Mobility', 'dolo-mobility', 'mobility'],
  ['Communication', 'dolo-communication', 'communication'],
  ['Social life', 'dolo-social', 'socialLife'],
  ['Behavioral problems', 'dolo-behavior', 'behaviorProblems'],
];

function payload(fields) {
  const p = {};
  for (const [, id, key] of fields) p[key] = val(id);
  return p;
}
function addFields(root, fields, options) {
  for (const [label, id] of fields) root.appendChild(pickField(label, id, options));
}
function fieldIds(fields) { return fields.map(([, id]) => id); }

// Build CNPI field table: two fields per behavior (rest, movement).
const CNPI_FIELDS = CNPI_BEHAVIOURS.flatMap(([label, key]) => [
  [`${label} — at rest`, `cnpi-${key}-rest`, `${key}Rest`],
  [`${label} — with movement`, `cnpi-${key}-move`, `${key}Move`],
]);

export const renderers = {
  // ----- 2.1 abbey-pain ------------------------------------------------------
  'abbey-pain'(root) {
    note(root, 'Abbey Pain Scale (Abbey 2004): a 1-minute observational scale for people with end-stage dementia. Six items each rated 0 (absent) / 1 (mild) / 2 (moderate) / 3 (severe). Total 0–18; 0–2 no pain, 3–7 mild, 8–13 moderate, 14+ severe. The aged-care companion to painad; the standard scale in Australian and UK aged care.');
    addFields(root, ABBEY_FIELDS, SEV0123);
    const o = out(); root.appendChild(o);
    wire(fieldIds(ABBEY_FIELDS), () => safe(o, () => {
      const r = M.abbeyPain(payload(ABBEY_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/18` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 cnpi ------------------------------------------------------------
  cnpi(root) {
    note(root, 'Checklist of Nonverbal Pain Indicators (Feldt 2000): six behaviors, each marked present or absent twice — once at rest and once with movement (a transfer). Rest 0–6, movement 0–6, combined 0–12. Unlike painad, CNPI structures the with-movement assessment separately. There is no formal cut: any indicator in either condition warrants further pain assessment.');
    for (const [label, key] of CNPI_BEHAVIOURS) {
      root.appendChild(el('p', { class: 'muted', text: label }));
      root.appendChild(pickField('At rest', `cnpi-${key}-rest`, PRESENT));
      root.appendChild(pickField('With movement', `cnpi-${key}-move`, PRESENT));
    }
    const o = out(); root.appendChild(o);
    wire(fieldIds(CNPI_FIELDS), () => safe(o, () => {
      const r = M.cnpi(payload(CNPI_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Rest', value: `${r.restScore}/6` }, { label: 'Movement', value: `${r.moveScore}/6` }, { label: 'Combined', value: `${r.total}/12` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 doloplus-2 ------------------------------------------------------
  'doloplus-2'(root) {
    note(root, 'DOLOPLUS-2 (Wary 2001): a 10-item behavioral pain scale across somatic, psychomotor, and psychosocial reactions, each item 0–3. Total 0–30; a score of 5 or more indicates pain. The standard observational scale in French and European geriatric care; companion to abbey-pain and painad.');
    addFields(root, DOLO_FIELDS, DOLO03);
    const o = out(); root.appendChild(o);
    wire(fieldIds(DOLO_FIELDS), () => safe(o, () => {
      const r = M.doloplus2(payload(DOLO_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/30` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV175 = renderers;
