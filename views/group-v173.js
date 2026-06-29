// spec-v173 §2: renderers for the three cognition / dementia-staging tiles of
// the spec-v172 Long-Term Care & Geriatric Assessment program — bims (Brief
// Interview for Mental Status), ad8 (AD8 informant screen), and cdr-sob
// (Clinical Dementia Rating — Sum of Boxes). All Clinical Scoring & Risk
// (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a deterministic input -> score/band mapping (spec-v100 §2 classification
// clarification); an incomplete interview surfaces a complete-the-fields
// fallback. Per the spec-v50 §3 posture note each tile defers the clinical
// decision to the clinician (spec-v11 §5.3) and never authors a diagnosis.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v173.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and its interpretation are the cited instrument’s, derived from the observations you enter; it is a screen/stage, not a diagnosis. The clinical decision (further evaluation, care planning, hospice or coverage determinations) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
const YESNO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes, a change' }];

const BIMS_REP = [
  { value: '0', text: '0 — no words repeated' },
  { value: '1', text: '1 — one word' },
  { value: '2', text: '2 — two words' },
  { value: '3', text: '3 — all three words' },
];
const BIMS_YEAR = [
  { value: '0', text: '0 — missed by > 5 years or no answer' },
  { value: '1', text: '1 — missed by 2–5 years' },
  { value: '2', text: '2 — missed by 1 year' },
  { value: '3', text: '3 — correct' },
];
const BIMS_MONTH = [
  { value: '0', text: '0 — missed by > 1 month or no answer' },
  { value: '1', text: '1 — missed by 6 days to 1 month' },
  { value: '2', text: '2 — accurate within 5 days' },
];
const BIMS_DAY = [
  { value: '0', text: '0 — incorrect or no answer' },
  { value: '1', text: '1 — correct' },
];
const BIMS_RECALL = [
  { value: '0', text: '0 — could not recall' },
  { value: '1', text: '1 — recalled after a category cue' },
  { value: '2', text: '2 — recalled spontaneously (no cue)' },
];
const CDR_BOX5 = [
  { value: '0', text: '0 — none' },
  { value: '0.5', text: '0.5 — questionable' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — severe' },
];
const CDR_BOX4 = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — severe' },
];

export const renderers = {
  // ----- 2.1 bims ------------------------------------------------------------
  bims(root) {
    note(root, 'Brief Interview for Mental Status (MDS 3.0 §C): the CMS-mandated bedside cognition interview. Score word repetition, temporal orientation, and delayed recall of the three words (sock / blue / bed). Summary 0–15: 13–15 intact, 8–12 moderate, 0–7 severe impairment. Near-neighbor: mini-cog.');
    root.appendChild(pickField('Repetition of three words (first attempt)', 'bims-rep', BIMS_REP));
    root.appendChild(pickField('Able to report the correct year', 'bims-year', BIMS_YEAR));
    root.appendChild(pickField('Able to report the correct month', 'bims-month', BIMS_MONTH));
    root.appendChild(pickField('Able to report the correct day of the week', 'bims-day', BIMS_DAY));
    root.appendChild(pickField('Delayed recall — "sock"', 'bims-sock', BIMS_RECALL));
    root.appendChild(pickField('Delayed recall — "blue"', 'bims-blue', BIMS_RECALL));
    root.appendChild(pickField('Delayed recall — "bed"', 'bims-bed', BIMS_RECALL));
    const o = out(); root.appendChild(o);
    wire(['bims-rep', 'bims-year', 'bims-month', 'bims-day', 'bims-sock', 'bims-blue', 'bims-bed'], () => safe(o, () => {
      const r = M.bims({
        repetition: val('bims-rep'), year: val('bims-year'), month: val('bims-month'), day: val('bims-day'),
        recallSock: val('bims-sock'), recallBlue: val('bims-blue'), recallBed: val('bims-bed'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Summary', value: `${r.total}/15` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ad8 -------------------------------------------------------------
  ad8(root) {
    note(root, 'AD8 Dementia Screening Interview (Galvin 2005): eight informant yes/no items, each asking whether a change has occurred due to thinking/memory problems over the past several years. Total 0–8; ≥ 2 suggests cognitive impairment. Informant-report companion to mini-cog.');
    root.appendChild(pickField('Problems with judgment (bad decisions, problems with thinking)', 'ad8-judgment', YESNO));
    root.appendChild(pickField('Reduced interest in hobbies or activities', 'ad8-interest', YESNO));
    root.appendChild(pickField('Repeats the same things over and over', 'ad8-repeating', YESNO));
    root.appendChild(pickField('Trouble learning to use a tool, appliance, or gadget', 'ad8-learningTool', YESNO));
    root.appendChild(pickField('Forgets the correct month or year', 'ad8-dateRecall', YESNO));
    root.appendChild(pickField('Trouble handling complicated financial affairs', 'ad8-finances', YESNO));
    root.appendChild(pickField('Trouble remembering appointments', 'ad8-appointments', YESNO));
    root.appendChild(pickField('Daily problems with thinking and/or memory', 'ad8-dailyThinking', YESNO));
    const o = out(); root.appendChild(o);
    wire(['ad8-judgment', 'ad8-interest', 'ad8-repeating', 'ad8-learningTool', 'ad8-dateRecall', 'ad8-finances', 'ad8-appointments', 'ad8-dailyThinking'], () => safe(o, () => {
      const r = M.ad8({
        judgment: val('ad8-judgment'), interest: val('ad8-interest'), repeating: val('ad8-repeating'),
        learningTool: val('ad8-learningTool'), dateRecall: val('ad8-dateRecall'), finances: val('ad8-finances'),
        appointments: val('ad8-appointments'), dailyThinking: val('ad8-dailyThinking'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/8` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 cdr-sob ---------------------------------------------------------
  'cdr-sob'(root) {
    note(root, 'Clinical Dementia Rating — Sum of Boxes (Morris 1993; O\'Bryant 2008 staging): rate the six boxes and sum them, 0–18. Memory, orientation, judgment & problem-solving, community affairs, and home & hobbies score 0/0.5/1/2/3; personal care 0/1/2/3. 0 none, 0.5–4.0 questionable–very mild, 4.5–9.0 mild, 9.5–15.5 moderate, 16.0–18.0 severe. Near-neighbor: global-deterioration-scale.');
    root.appendChild(pickField('Memory', 'cdr-memory', CDR_BOX5));
    root.appendChild(pickField('Orientation', 'cdr-orientation', CDR_BOX5));
    root.appendChild(pickField('Judgment & problem-solving', 'cdr-judgment', CDR_BOX5));
    root.appendChild(pickField('Community affairs', 'cdr-community', CDR_BOX5));
    root.appendChild(pickField('Home & hobbies', 'cdr-home', CDR_BOX5));
    root.appendChild(pickField('Personal care', 'cdr-personalCare', CDR_BOX4));
    const o = out(); root.appendChild(o);
    wire(['cdr-memory', 'cdr-orientation', 'cdr-judgment', 'cdr-community', 'cdr-home', 'cdr-personalCare'], () => safe(o, () => {
      const r = M.cdrSob({
        memory: val('cdr-memory'), orientation: val('cdr-orientation'), judgment: val('cdr-judgment'),
        community: val('cdr-community'), home: val('cdr-home'), personalCare: val('cdr-personalCare'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Sum of Boxes', value: `${r.sob}/18` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV173 = renderers;
