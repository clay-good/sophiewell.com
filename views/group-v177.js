// spec-v177 §2: renderers for the four frailty / sarcopenia case-finder tiles of
// the spec-v172 Long-Term Care & Geriatric Assessment program — sarc-f,
// sarc-calf, prisma-7, sof-frailty-index. All Clinical Scoring & Risk (Group G).
// (clinical-frailty-scale, groningen-frailty-indicator, and edmonton-frail-scale
// are deferred — see lib/ltcga-v177.js.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a bounded sum mapped to published bands; an incomplete answer surfaces a
// complete-the-fields fallback. Per the spec-v50 §3 posture note each tile defers
// the clinical decision to the clinician (spec-v11 §5.3) and never authors a
// care-plan order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v177.js';
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
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and its band are the cited instrument’s, derived from the answers you enter; it is a frailty / sarcopenia screen, not a diagnosis. The clinical decision — the geriatric work-up, the exercise/nutrition plan, and any referral — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SARCF03 = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — some difficulty' },
  { value: '2', text: '2 — a lot of difficulty / unable' },
];
const YESNO = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];
const SEX = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];

const SARCF_FIELDS = [
  ['Strength: difficulty lifting/carrying ~10 lb', 'sarcf-strength', 'strength'],
  ['Assistance walking across a room', 'sarcf-walk', 'assistanceWalking'],
  ['Rise from a chair or bed', 'sarcf-rise', 'riseFromChair'],
  ['Climb a flight of ten stairs', 'sarcf-stairs', 'climbStairs'],
  ['Falls in the past year', 'sarcf-falls', 'falls'],
];

function sarcfPayload() {
  const p = {};
  for (const [, id, key] of SARCF_FIELDS) p[key] = selVal(id);
  return p;
}
function addSarcf(root) {
  for (const [label, id] of SARCF_FIELDS) root.appendChild(pickField(label, id, SARCF03));
}
function sarcfIds() { return SARCF_FIELDS.map(([, id]) => id); }

export const renderers = {
  // ----- 2.2 sarc-f ----------------------------------------------------------
  'sarc-f'(root) {
    note(root, 'SARC-F (Malmstrom 2013): the 5-item sarcopenia screen — Strength, Assistance walking, Rise from a chair, Climb stairs, Falls — each 0 (none) / 1 (some) / 2 (a lot / unable). Total 0–10; ≥ 4 predicts sarcopenia and poor outcomes. Pairs with sarc-calf, which adds a calf-circumference measure.');
    addSarcf(root);
    const o = out(); root.appendChild(o);
    wire(sarcfIds(), () => safe(o, () => {
      const r = M.sarcF(sarcfPayload());
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/10` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 sarc-calf -------------------------------------------------------
  'sarc-calf'(root) {
    note(root, 'SARC-CalF (Barbosa-Silva 2016): SARC-F plus a calf-circumference add-on. A calf below the sex-specific cutoff (< 34 cm men, < 33 cm women) adds 10 points. Total 0–20; ≥ 11 is a positive sarcopenia screen — more sensitive than SARC-F alone.');
    addSarcf(root);
    root.appendChild(numField('Calf circumference (cm)', 'calf-cm', { step: '0.1', min: 0, placeholder: 'e.g. 32' }));
    root.appendChild(pickField('Sex', 'calf-sex', SEX));
    const o = out(); root.appendChild(o);
    wire([...sarcfIds(), 'calf-cm', 'calf-sex'], () => safe(o, () => {
      const r = M.sarcCalf({ ...sarcfPayload(), calfCm: optNum('calf-cm'), sex: selVal('calf-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/20` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 prisma-7 --------------------------------------------------------
  'prisma-7'(root) {
    note(root, 'PRISMA-7 (Raîche 2008): a 7-item frailty / disability case-finder. Each item scores 1 — including the support item, which scores when you CANNOT count on someone close. Total 0–7; ≥ 3 suggests frailty or moderate-to-severe disability.');
    root.appendChild(pickField('Are you older than 85 years?', 'prisma-age', YESNO));
    root.appendChild(pickField('Are you male?', 'prisma-male', YESNO));
    root.appendChild(pickField('Do health problems limit your activities?', 'prisma-limit', YESNO));
    root.appendChild(pickField('Do you need someone to help you on a regular basis?', 'prisma-help', YESNO));
    root.appendChild(pickField('Do health problems require you to stay at home?', 'prisma-home', YESNO));
    root.appendChild(pickField('If you need help, can you count on someone close to you?', 'prisma-support', YESNO));
    root.appendChild(pickField('Do you regularly use a cane, walker, or wheelchair?', 'prisma-aid', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['prisma-age', 'prisma-male', 'prisma-limit', 'prisma-help', 'prisma-home', 'prisma-support', 'prisma-aid'];
    wire(ids, () => safe(o, () => {
      const r = M.prisma7({ over85: selVal('prisma-age'), male: selVal('prisma-male'), healthLimitActivities: selVal('prisma-limit'), needHelpRegularly: selVal('prisma-help'), healthStayHome: selVal('prisma-home'), canCountOnSomeone: selVal('prisma-support'), usesMobilityAid: selVal('prisma-aid') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/7` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 sof-frailty-index -----------------------------------------------
  'sof-frailty-index'(root) {
    note(root, 'SOF frailty index (Ensrud 2008): three items — weight loss ≥ 5% over the past year, inability to rise from a chair 5 times without using the arms, and reduced energy (“no” to feeling full of energy). Total 0–3; 0 robust, 1 pre-frail, ≥ 2 frail. The shortest of the multidomain frailty screens.');
    root.appendChild(pickField('Weight loss of 5% or more over the past year?', 'sof-weight', YESNO));
    root.appendChild(pickField('Unable to rise from a chair 5 times without using the arms?', 'sof-rise', YESNO));
    root.appendChild(pickField('Reduced energy — answered “no” to “do you feel full of energy?”', 'sof-energy', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['sof-weight', 'sof-rise', 'sof-energy'];
    wire(ids, () => safe(o, () => {
      const r = M.sofFrailtyIndex({ weightLoss5pct: selVal('sof-weight'), cannotRise5x: selVal('sof-rise'), reducedEnergy: selVal('sof-energy') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/3` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV177 = renderers;
