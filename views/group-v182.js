// spec-v182 §2: renderers for the five continence / caregiver-strain / wound
// tiles closing the spec-v172 Long-Term Care & Geriatric Assessment program —
// sandvik-incontinence (Clinical Math & Conversions, Group E) and iciq-ui-sf,
// modified-caregiver-strain-index, caregiver-strain-index, bwat (Clinical
// Scoring & Risk, Group G). (waterlow is deferred — see lib/ltcga-v182.js.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is a
// deterministic input -> value/band mapping; an incomplete answer surfaces a
// complete-the-fields fallback. Per the spec-v50 §3 posture note each tile defers
// the clinical decision to the clinician (spec-v11 §5.3) and never authors a
// continence, wound, or caregiver-support order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v182.js';
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
function numField(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', '1');
  inp.setAttribute('inputmode', 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited instrument’s, derived from the answers you enter; it is a severity / strain / wound-status measure, not a diagnosis. The clinical decision — the continence care plan, the caregiver-support referral, and the wound-treatment plan — stays with the clinician, the social worker, and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YESNO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const MCSI012 = [
  { value: '0', text: '0 — no' },
  { value: '1', text: '1 — yes, sometimes' },
  { value: '2', text: '2 — yes, on a regular basis' },
];
const SANDVIK_FREQ = [
  { value: '1', text: '1 — less than once a month' },
  { value: '2', text: '2 — a few times a month' },
  { value: '3', text: '3 — a few times a week' },
  { value: '4', text: '4 — every day and/or night' },
];
const SANDVIK_AMT = [
  { value: '1', text: '1 — drops' },
  { value: '2', text: '2 — small splashes' },
  { value: '3', text: '3 — more' },
];
const BWAT15 = [
  { value: '1', text: '1 — healthy tissue' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
  { value: '4', text: '4' },
  { value: '5', text: '5 — severe degeneration' },
];

const MCSI_FIELDS = [
  ['Sleep is disturbed', 'mcsi-sleep', 'sleep'],
  ['It is a physical strain', 'mcsi-physical', 'physical'],
  ['It is confining', 'mcsi-confining', 'confining'],
  ['There have been family adjustments', 'mcsi-family', 'family'],
  ['There have been changes in personal plans', 'mcsi-plans', 'plans'],
  ['There have been other demands on my time', 'mcsi-other', 'otherDemands'],
  ['There have been emotional adjustments', 'mcsi-emotional', 'emotional'],
  ['Some behavior is upsetting', 'mcsi-upsetting', 'upsetting'],
  ['It is upsetting to find the person has changed so much', 'mcsi-changed', 'changed'],
  ['There have been work adjustments', 'mcsi-work', 'work'],
  ['It is a financial strain', 'mcsi-financial', 'financial'],
  ['I feel completely overwhelmed', 'mcsi-overwhelmed', 'overwhelmed'],
  ['I feel I cannot cope / completely overwhelmed by the demands', 'mcsi-completely', 'completelyOverwhelmed'],
];
const CSI_FIELDS = [
  ['Sleep is disturbed', 'csi-sleep', 'sleep'],
  ['It is inconvenient', 'csi-inconvenient', 'inconvenient'],
  ['It is a physical strain', 'csi-physical', 'physical'],
  ['It is confining', 'csi-confining', 'confining'],
  ['There have been family adjustments', 'csi-family', 'family'],
  ['There have been changes in personal plans', 'csi-plans', 'plans'],
  ['There have been other demands on my time', 'csi-other', 'otherDemands'],
  ['There have been emotional adjustments', 'csi-emotional', 'emotional'],
  ['Some behavior is upsetting', 'csi-upsetting', 'upsetting'],
  ['It is upsetting to find the person has changed so much', 'csi-changed', 'changed'],
  ['There have been work adjustments', 'csi-work', 'work'],
  ['It is a financial strain', 'csi-financial', 'financial'],
  ['I feel completely overwhelmed', 'csi-overwhelmed', 'overwhelmed'],
];
const BWAT_FIELDS = [
  ['Size', 'bwat-size', 'size'],
  ['Depth', 'bwat-depth', 'depth'],
  ['Edges', 'bwat-edges', 'edges'],
  ['Undermining', 'bwat-undermining', 'undermining'],
  ['Necrotic tissue type', 'bwat-nectype', 'necroticType'],
  ['Necrotic tissue amount', 'bwat-necamount', 'necroticAmount'],
  ['Exudate type', 'bwat-exutype', 'exudateType'],
  ['Exudate amount', 'bwat-exuamount', 'exudateAmount'],
  ['Skin color surrounding wound', 'bwat-skin', 'skinColor'],
  ['Peripheral tissue edema', 'bwat-edema', 'edema'],
  ['Peripheral tissue induration', 'bwat-induration', 'induration'],
  ['Granulation tissue', 'bwat-granulation', 'granulation'],
  ['Epithelialization', 'bwat-epithelialization', 'epithelialization'],
];

function payloadFrom(fields) { const p = {}; for (const [, id, key] of fields) p[key] = selVal(id); return p; }
function addPicks(root, fields, options) { for (const [label, id] of fields) root.appendChild(pickField(label, id, options)); }
function idsOf(fields) { return fields.map(([, id]) => id); }

export const renderers = {
  // ----- 2.1 sandvik-incontinence (Group E) ----------------------------------
  'sandvik-incontinence'(root) {
    note(root, 'Sandvik Severity Index (1993/2000): Severity Index = frequency × amount of leakage. Product 1–12; 1–2 slight, 3–6 moderate, 8–9 severe, 12 very severe. A two-question incontinence-severity measure. Companion to iciq-ui-sf.');
    root.appendChild(pickField('Frequency of leakage', 'sandvik-freq', SANDVIK_FREQ));
    root.appendChild(pickField('Amount of leakage', 'sandvik-amount', SANDVIK_AMT));
    const o = out(); root.appendChild(o);
    wire(['sandvik-freq', 'sandvik-amount'], () => safe(o, () => {
      const r = M.sandvikIncontinence({ frequency: selVal('sandvik-freq'), amount: selVal('sandvik-amount') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Index', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 iciq-ui-sf ------------------------------------------------------
  'iciq-ui-sf'(root) {
    note(root, 'ICIQ-UI Short Form (Avery 2004): score = frequency (0–5) + amount (0–6) + impact on daily life (0–10). Total 0–21; 1–5 slight, 6–12 moderate, 13–18 severe, 19–21 very severe. (A fourth self-diagnostic item is recorded but not scored.) The ICIQ is free to use, registered with the ICIQ Group, Bristol; this tile ships the scoring only.');
    root.appendChild(numField('Frequency of leakage (0–5)', 'iciq-freq', { min: 0, max: 5, placeholder: '0–5' }));
    root.appendChild(numField('Amount of leakage (0–6)', 'iciq-amount', { min: 0, max: 6, placeholder: '0–6' }));
    root.appendChild(numField('Overall impact on daily life (0–10)', 'iciq-impact', { min: 0, max: 10, placeholder: '0–10' }));
    const o = out(); root.appendChild(o);
    wire(['iciq-freq', 'iciq-amount', 'iciq-impact'], () => safe(o, () => {
      const r = M.iciqUiSf({ frequency: optNum('iciq-freq'), amount: optNum('iciq-amount'), impact: optNum('iciq-impact') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/21` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 modified-caregiver-strain-index ---------------------------------
  'modified-caregiver-strain-index'(root) {
    note(root, 'Modified Caregiver Strain Index (Thornton & Travis 2003): 13 items each 0 (no) / 1 (sometimes) / 2 (regularly). Total 0–26; higher = greater caregiver strain. No official cut. The free alternative to the licensed Zarit Burden Interview; companion to caregiver-strain-index.');
    addPicks(root, MCSI_FIELDS, MCSI012);
    const o = out(); root.appendChild(o);
    wire(idsOf(MCSI_FIELDS), () => safe(o, () => {
      const r = M.modifiedCaregiverStrainIndex(payloadFrom(MCSI_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/26` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 caregiver-strain-index ------------------------------------------
  'caregiver-strain-index'(root) {
    note(root, 'Caregiver Strain Index (Robinson 1983): 13 yes/no items, each yes = 1. Total 0–13; ≥ 7 indicates a high level of caregiver strain. The original short caregiver-strain screen; companion to the modified (0–2) version.');
    addPicks(root, CSI_FIELDS, YESNO);
    const o = out(); root.appendChild(o);
    wire(idsOf(CSI_FIELDS), () => safe(o, () => {
      const r = M.caregiverStrainIndex(payloadFrom(CSI_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/13` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 bwat ------------------------------------------------------------
  bwat(root) {
    note(root, 'Bates-Jensen Wound Assessment Tool: 13 wound items each 1 (healthy tissue) to 5 (severe degeneration). Total 13–65; lower = healing, higher = degeneration. Read the trajectory across serial scores. The full-trajectory companion to the live braden / norton-push pressure-injury tiles.');
    addPicks(root, BWAT_FIELDS, BWAT15);
    const o = out(); root.appendChild(o);
    wire(idsOf(BWAT_FIELDS), () => safe(o, () => {
      const r = M.bwat(payloadFrom(BWAT_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/65` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV182 = renderers;
