// spec-v174 §2: renderers for the five behavioral-symptom / observational
// delirium / mood tiles of the spec-v172 Long-Term Care & Geriatric Assessment
// program — nu-desc (Nursing Delirium Screening Scale), doss (Delirium
// Observation Screening Scale), cornell-csdd (Cornell Scale for Depression in
// Dementia), interrai-abs (interRAI Aggressive Behavior Scale), and cmai
// (Cohen-Mansfield Agitation Inventory). All Clinical Scoring & Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a deterministic input -> score/band mapping (spec-v100 §2 classification
// clarification); an incomplete observation surfaces a complete-the-fields
// fallback. Per the spec-v50 §3 posture note each tile defers the clinical
// decision to the clinician (spec-v11 §5.3) and never authors a diagnosis.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v174.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and its interpretation are the cited instrument’s, derived from the observations you enter; it is a screen/quantifier, not a diagnosis. The clinical decision (further evaluation, the behavioral or care plan, and any medication review) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEV012 = [
  { value: '0', text: '0 — absent' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — severe' },
];
const PRESENT = [
  { value: '0', text: 'Absent' },
  { value: '1', text: 'Present' },
];
const CSDD012 = [
  { value: 'a', text: 'Unable to evaluate' },
  { value: '0', text: '0 — absent' },
  { value: '1', text: '1 — mild or intermittent' },
  { value: '2', text: '2 — severe' },
];
const ABS03 = [
  { value: '0', text: '0 — not exhibited' },
  { value: '1', text: '1 — 1–3 days' },
  { value: '2', text: '2 — 4–6 days (not daily)' },
  { value: '3', text: '3 — daily' },
];
const FREQ17 = [
  { value: '1', text: '1 — never' },
  { value: '2', text: '2 — less than once a week' },
  { value: '3', text: '3 — once or twice a week' },
  { value: '4', text: '4 — several times a week' },
  { value: '5', text: '5 — once or twice a day' },
  { value: '6', text: '6 — several times a day' },
  { value: '7', text: '7 — several times an hour' },
];

// Item label/id tables (renderer field id <- compute key).
const NUDESC_FIELDS = [
  ['Disorientation', 'nudesc-disorientation', 'disorientation'],
  ['Inappropriate behavior', 'nudesc-behavior', 'inappropriateBehavior'],
  ['Inappropriate communication', 'nudesc-communication', 'inappropriateCommunication'],
  ['Illusions / hallucinations', 'nudesc-illusions', 'illusionsHallucinations'],
  ['Psychomotor retardation', 'nudesc-psychomotor', 'psychomotorRetardation'],
];
const DOSS_FIELDS = [
  ['Dozes off during conversation or activities', 'doss-dozes', 'dozesOff'],
  ['Is easily distracted by the environment', 'doss-distracted', 'distracted'],
  ['Does not maintain attention to conversation or action', 'doss-attention', 'noAttention'],
  ['Does not finish a question or answer', 'doss-unfinished', 'unfinishedAnswers'],
  ['Gives answers that do not fit the question', 'doss-mismatch', 'mismatchedAnswers'],
  ['Reacts slowly to instructions', 'doss-slow', 'slowReactions'],
  ['Thinks they are somewhere else', 'doss-elsewhere', 'thinksElsewhere'],
  ['Does not know which part of the day it is', 'doss-timeofday', 'unknownTimeOfDay'],
  ['Does not remember a recent event', 'doss-recall', 'noRecentRecall'],
  ['Is picking, disorderly, restless', 'doss-restless', 'restlessPicking'],
  ['Pulls at IV tubes, feeding tubes, catheters', 'doss-tubes', 'pullsTubes'],
  ['Is easily or suddenly emotional', 'doss-emotion', 'suddenEmotion'],
  ['Sees or hears things that are not there', 'doss-perception', 'seesHearsThings'],
];
const CSDD_FIELDS = [
  ['Anxiety (anxious expression, worrying)', 'csdd-anxiety', 'anxiety'],
  ['Sadness (sad expression or voice, tearfulness)', 'csdd-sadness', 'sadness'],
  ['Lack of reactivity to pleasant events', 'csdd-reactivity', 'noReactivity'],
  ['Irritability (annoyed, short-tempered)', 'csdd-irritability', 'irritability'],
  ['Agitation (restlessness, hand-wringing)', 'csdd-agitation', 'agitation'],
  ['Retardation (slow movements, speech, reactions)', 'csdd-retardation', 'retardation'],
  ['Multiple physical complaints', 'csdd-complaints', 'physicalComplaints'],
  ['Loss of interest (acute change, < 1 month)', 'csdd-interest', 'lossOfInterest'],
  ['Appetite loss (eating less than usual)', 'csdd-appetite', 'appetiteLoss'],
  ['Weight loss (severe if > 5 lb in a month)', 'csdd-weight', 'weightLoss'],
  ['Lack of energy (fatigues easily)', 'csdd-energy', 'lackOfEnergy'],
  ['Diurnal variation of mood (worse in the morning)', 'csdd-diurnal', 'diurnalVariation'],
  ['Difficulty falling asleep', 'csdd-fallasleep', 'difficultyFallingAsleep'],
  ['Multiple awakenings during sleep', 'csdd-awakenings', 'multipleAwakenings'],
  ['Early-morning awakening', 'csdd-earlywake', 'earlyAwakening'],
  ['Suicidal (feels life not worth living, suicidal wishes)', 'csdd-suicide', 'suicide'],
  ['Self-depreciation (self-blame, feelings of failure)', 'csdd-selfblame', 'selfDepreciation'],
  ['Pessimism (anticipates the worst)', 'csdd-pessimism', 'pessimism'],
  ['Mood-congruent delusions (poverty, illness, loss)', 'csdd-delusions', 'delusions'],
];
const ABS_FIELDS = [
  ['Verbal abuse', 'abs-verbal', 'verbalAbuse'],
  ['Physical abuse', 'abs-physical', 'physicalAbuse'],
  ['Socially inappropriate or disruptive behavior', 'abs-social', 'sociallyInappropriate'],
  ['Resists care', 'abs-resists', 'resistsCare'],
];
const CMAI_FIELDS = [
  ['Pacing, aimless wandering', 'cmai-pacing', 'pacing'],
  ['Inappropriate dressing or disrobing', 'cmai-dressing', 'dressing'],
  ['Spitting', 'cmai-spitting', 'spitting'],
  ['Cursing or verbal aggression', 'cmai-cursing', 'cursing'],
  ['Constant unwarranted request for attention or help', 'cmai-requests', 'requests'],
  ['Repetitive sentences or questions', 'cmai-repetitive', 'repetitive'],
  ['Hitting (including self)', 'cmai-hitting', 'hitting'],
  ['Kicking', 'cmai-kicking', 'kicking'],
  ['Grabbing onto people or things', 'cmai-grabbing', 'grabbing'],
  ['Pushing', 'cmai-pushing', 'pushing'],
  ['Throwing things', 'cmai-throwing', 'throwing'],
  ['Making strange noises (weird laughter or crying)', 'cmai-noises', 'noises'],
  ['Screaming', 'cmai-screaming', 'screaming'],
  ['Biting', 'cmai-biting', 'biting'],
  ['Scratching', 'cmai-scratching', 'scratching'],
  ['Trying to get to a different place', 'cmai-trying', 'tryingToGet'],
  ['Intentional falling', 'cmai-falling', 'falling'],
  ['Complaining', 'cmai-complaining', 'complaining'],
  ['Negativism', 'cmai-negativism', 'negativism'],
  ['Eating or drinking inappropriate substances', 'cmai-eating', 'eatingSubstances'],
  ['Hurting self or others', 'cmai-hurting', 'hurting'],
  ['Handling things inappropriately', 'cmai-handling', 'handlingThings'],
  ['Hiding things', 'cmai-hiding', 'hiding'],
  ['Hoarding things', 'cmai-hoarding', 'hoarding'],
  ['Tearing things or destroying property', 'cmai-tearing', 'tearing'],
  ['Performing repetitious mannerisms', 'cmai-mannerisms', 'mannerisms'],
  ['Making verbal sexual advances', 'cmai-verbalsex', 'verbalSexual'],
  ['Making physical sexual advances', 'cmai-physicalsex', 'physicalSexual'],
  ['General restlessness', 'cmai-restlessness', 'restlessness'],
];

// Build a payload object {computeKey: fieldValue} from a field table.
function payload(fields) {
  const p = {};
  for (const [, id, key] of fields) p[key] = val(id);
  return p;
}
function addFields(root, fields, options) {
  for (const [label, id] of fields) root.appendChild(pickField(label, id, options));
}
function fieldIds(fields) { return fields.map(([, id]) => id); }

export const renderers = {
  // ----- 2.1 nu-desc ---------------------------------------------------------
  'nu-desc'(root) {
    note(root, 'Nursing Delirium Screening Scale (Gaudreau 2005): five features a nurse rates from a full shift’s observation, each 0 (absent) / 1 (mild) / 2 (severe). Total 0–10; ≥ 2 is a positive delirium screen. The shift-observation companion to the interview-based cam and 4at; sibling of doss.');
    addFields(root, NUDESC_FIELDS, SEV012);
    const o = out(); root.appendChild(o);
    wire(fieldIds(NUDESC_FIELDS), () => safe(o, () => {
      const r = M.nuDesc(payload(NUDESC_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/10` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 doss ------------------------------------------------------------
  doss(root) {
    note(root, 'Delirium Observation Screening Scale (Schuurmans 2003), 13-item short form: mark each behavior present or absent across the shift. Total 0–13; ≥ 3 suggests delirium. Three items (attention, time-of-day, recent recall) are reverse-scored on the original form and are written here in their abnormal direction. Sibling of nu-desc; confirm with cam.');
    addFields(root, DOSS_FIELDS, PRESENT);
    const o = out(); root.appendChild(o);
    wire(fieldIds(DOSS_FIELDS), () => safe(o, () => {
      const r = M.doss(payload(DOSS_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/13` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 cornell-csdd ----------------------------------------------------
  'cornell-csdd'(root) {
    note(root, 'Cornell Scale for Depression in Dementia (Alexopoulos 1988): 19 items rated 0 (absent) / 1 (mild) / 2 (severe), or “unable to evaluate” (scores 0). Total 0–38; > 10 probable, > 18 definite major depression. Built for moderate-to-severe dementia precisely because gds15 and phq9 (self-report) are not valid there — it uses observation and a caregiver informant instead.');
    addFields(root, CSDD_FIELDS, CSDD012);
    const o = out(); root.appendChild(o);
    wire(fieldIds(CSDD_FIELDS), () => safe(o, () => {
      const r = M.cornellCsdd(payload(CSDD_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/38` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 interrai-abs ----------------------------------------------------
  'interrai-abs'(root) {
    note(root, 'interRAI Aggressive Behavior Scale (Perlman & Hirdes 2008): four behaviors each rated on the MDS 7-day frequency scale 0 (not exhibited) to 3 (daily). Total 0–12. The original scale defines no named bands; the none/mild/moderate/severe split (0 / 1–2 / 3–5 / 6–12) is a secondary-literature convention. Quantifies the BPSD that drive the behavioral care plan; companion to cmai.');
    addFields(root, ABS_FIELDS, ABS03);
    const o = out(); root.appendChild(o);
    wire(fieldIds(ABS_FIELDS), () => safe(o, () => {
      const r = M.interraiAbs(payload(ABS_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/12` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 cmai ------------------------------------------------------------
  cmai(root) {
    note(root, 'Cohen-Mansfield Agitation Inventory (1989), 29-item long form: rate each behavior’s frequency over the prior two weeks, 1 (never) to 7 (several times an hour). Total 29–203 — the floor is 29, not 0, so a “low” score is not zero agitation. The CMAI manual advises against a total severity cut; it is read as a frequency quantifier and by its three factor subscales. Companion to interrai-abs.');
    addFields(root, CMAI_FIELDS, FREQ17);
    const o = out(); root.appendChild(o);
    wire(fieldIds(CMAI_FIELDS), () => safe(o, () => {
      const r = M.cmai(payload(CMAI_FIELDS));
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/203` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV174 = renderers;
