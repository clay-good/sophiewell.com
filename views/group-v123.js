// spec-v123 §2: renderers for the five public-domain / free-to-use psychiatry
// instruments (aims-tardive, bfcrs, bars-akathisia, scoff, ces-d). All five home
// in Clinical Scoring & Risk (Group G). v123 closes Wave 4 of the spec-v100
// program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score,
// screen, or rating, not management; none authors a diagnosis or treatment order
// in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/psych-v123.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, screen, or rating is the cited instrument’s, computed from the items you entered. These are screens and severity scales, not diagnoses; the assessment and treatment decision stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const OPTS_0_4 = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — minimal' },
  { value: '2', text: '2 — mild' },
  { value: '3', text: '3 — moderate' },
  { value: '4', text: '4 — severe' },
];
const OPTS_0_3 = [
  { value: '0', text: '0 — absent' },
  { value: '1', text: '1 — mild/occasional' },
  { value: '2', text: '2 — moderate/frequent' },
  { value: '3', text: '3 — severe/constant' },
];
const OPTS_0_3_BIN = [
  { value: '0', text: '0 — absent' },
  { value: '3', text: '3 — present' },
];
const OPTS_CESD = [
  { value: '0', text: '0 — rarely / none (< 1 day)' },
  { value: '1', text: '1 — some / a little (1–2 days)' },
  { value: '2', text: '2 — occasionally / moderate (3–4 days)' },
  { value: '3', text: '3 — most or all (5–7 days)' },
];

// AIMS 7 movement items + global. id -> compute key.
const AIMS_FIELDS = [
  ['ai-face', 'face', 'Facial expression muscles'],
  ['ai-lips', 'lips', 'Lips and perioral area'],
  ['ai-jaw', 'jaw', 'Jaw'],
  ['ai-tongue', 'tongue', 'Tongue'],
  ['ai-upper', 'upper', 'Upper extremity (arms/wrists/hands/fingers)'],
  ['ai-lower', 'lower', 'Lower extremity (legs/knees/ankles/toes)'],
  ['ai-trunk', 'trunk', 'Trunk (neck, shoulders, hips)'],
];
// BFCRS 23 items. [id, key, label, binary]
const BFCRS_FIELDS = [
  ['bf-immob', 'immobility', '1. Immobility/stupor', false],
  ['bf-mutism', 'mutism', '2. Mutism', false],
  ['bf-staring', 'staring', '3. Staring', false],
  ['bf-posturing', 'posturing', '4. Posturing/catalepsy', false],
  ['bf-grimacing', 'grimacing', '5. Grimacing', false],
  ['bf-echo', 'echo', '6. Echopraxia/echolalia', false],
  ['bf-stereotypy', 'stereotypy', '7. Stereotypy', false],
  ['bf-mannerisms', 'mannerisms', '8. Mannerisms', false],
  ['bf-verbig', 'verbigeration', '9. Verbigeration', false],
  ['bf-rigidity', 'rigidity', '10. Rigidity', false],
  ['bf-negativism', 'negativism', '11. Negativism', false],
  ['bf-waxy', 'waxy', '12. Waxy flexibility (0 / 3)', true],
  ['bf-withdrawal', 'withdrawal', '13. Withdrawal', false],
  ['bf-excitement', 'excitement', '14. Excitement', false],
  ['bf-impuls', 'impulsivity', '15. Impulsivity', false],
  ['bf-autoob', 'autoObedience', '16. Automatic obedience', false],
  ['bf-mitgehen', 'mitgehen', '17. Mitgehen (0 / 3)', true],
  ['bf-gegen', 'gegenhalten', '18. Gegenhalten (0 / 3)', true],
  ['bf-ambi', 'ambitendency', '19. Ambitendency (0 / 3)', true],
  ['bf-grasp', 'grasp', '20. Grasp reflex (0 / 3)', true],
  ['bf-persev', 'perseveration', '21. Perseveration (0 / 3)', true],
  ['bf-combat', 'combativeness', '22. Combativeness', false],
  ['bf-autonomic', 'autonomic', '23. Autonomic abnormality', false],
];
const SCOFF_FIELDS = [
  ['sc-sick', 'sick', 'Sick — do you make yourself sick because you feel uncomfortably full?'],
  ['sc-control', 'control', 'Control — do you worry you have lost control over how much you eat?'],
  ['sc-stone', 'oneStone', 'One stone — have you recently lost more than one stone (~6.35 kg) in 3 months?'],
  ['sc-fat', 'fat', 'Fat — do you believe yourself to be fat when others say you are too thin?'],
  ['sc-food', 'food', 'Food — would you say that food dominates your life?'],
];
const CESD_STEMS = [
  'bothered by things that usually don’t bother me',
  'did not feel like eating; appetite was poor',
  'could not shake off the blues even with help from family/friends',
  'felt I was just as good as other people (reverse-scored)',
  'had trouble keeping my mind on what I was doing',
  'felt depressed',
  'felt that everything I did was an effort',
  'felt hopeful about the future (reverse-scored)',
  'thought my life had been a failure',
  'felt fearful',
  'my sleep was restless',
  'was happy (reverse-scored)',
  'talked less than usual',
  'felt lonely',
  'people were unfriendly',
  'enjoyed life (reverse-scored)',
  'had crying spells',
  'felt sad',
  'felt that people disliked me',
  'could not get going',
];

export const renderers = {
  // ----- 2.1 aims-tardive -----------------------------------------------
  'aims-tardive'(root) {
    note(root, 'Abnormal Involuntary Movement Scale (AIMS, Guy 1976 — NIMH public domain): tardive-dyskinesia severity. Rate each of the seven movement items 0-4, plus the global severity. The movement total runs 0-28; ≥ 2 in two or more areas, or ≥ 3 in one, is a commonly cited probable-tardive-dyskinesia threshold.');
    for (const [id, , label] of AIMS_FIELDS) root.appendChild(selectField(label, id, OPTS_0_4));
    root.appendChild(selectField('Global severity of abnormal movements', 'ai-global', OPTS_0_4));
    const o = out(); root.appendChild(o);
    wire([...AIMS_FIELDS.map((f) => f[0]), 'ai-global'], () => safe(o, () => {
      const payload = { global: selVal('ai-global') };
      for (const [id, key] of AIMS_FIELDS) payload[key] = selVal(id);
      const r = M.aimsTardive(payload);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'AIMS movement', value: `${r.total}/28` },
      ]);
      note(o, `Movements present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 bfcrs ------------------------------------------------------
  bfcrs(root) {
    note(root, 'Bush-Francis Catatonia Rating Scale (Bush 1996): the first 14 items form the screen (≥ 2 present suggests catatonia); all 23 items score 0-3 for a severity total 0-69. Six items (12, 17-21) are scored 0 or 3 only. Rate each item from the standardized examination.');
    for (const [id, , label, bin] of BFCRS_FIELDS) root.appendChild(selectField(label, id, bin ? OPTS_0_3_BIN : OPTS_0_3));
    const o = out(); root.appendChild(o);
    wire(BFCRS_FIELDS.map((f) => f[0]), () => safe(o, () => {
      const payload = {};
      for (const [id, key] of BFCRS_FIELDS) payload[key] = selVal(id);
      const r = M.bfcrs(payload);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Screen', value: `${r.screenCount}/14` },
        { label: 'Severity', value: `${r.severity}/69` },
      ]);
      note(o, `Signs elicited: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 bars-akathisia ---------------------------------------------
  'bars-akathisia'(root) {
    note(root, 'Barnes Akathisia Rating Scale (Barnes 1989): drug-induced akathisia. Rate objective restlessness, subjective awareness, and subjective distress (each 0-3), plus the global clinical assessment 0-5 (absent / questionable / mild / moderate / marked / severe).');
    root.appendChild(selectField('Objective akathisia (observed restlessness)', 'ba-obj', OPTS_0_3));
    root.appendChild(selectField('Subjective awareness of restlessness', 'ba-aware', OPTS_0_3));
    root.appendChild(selectField('Subjective distress related to restlessness', 'ba-distress', OPTS_0_3));
    root.appendChild(selectField('Global clinical assessment of akathisia', 'ba-global', [
      { value: '0', text: '0 — absent' },
      { value: '1', text: '1 — questionable' },
      { value: '2', text: '2 — mild akathisia' },
      { value: '3', text: '3 — moderate akathisia' },
      { value: '4', text: '4 — marked akathisia' },
      { value: '5', text: '5 — severe akathisia' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ba-obj', 'ba-aware', 'ba-distress', 'ba-global'], () => safe(o, () => {
      const r = M.barsAkathisia({ objective: selVal('ba-obj'), awareness: selVal('ba-aware'), distress: selVal('ba-distress'), global: selVal('ba-global') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Global', value: `${r.global}/5` },
        { label: 'Subtotal', value: `${r.subtotal}/9` },
      ]);
      note(o, `Components: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 scoff ------------------------------------------------------
  scoff(root) {
    note(root, 'SCOFF questionnaire (Morgan 1999 — free to use): a five-item eating-disorder screen. Mark each "yes". A count of 2 or more flags a likely eating disorder warranting further assessment.');
    for (const [id, , label] of SCOFF_FIELDS) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    wire(SCOFF_FIELDS.map((f) => f[0]), () => safe(o, () => {
      const payload = {};
      for (const [id, key] of SCOFF_FIELDS) payload[key] = chk(id);
      const r = M.scoff(payload);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SCOFF', value: `${r.total}/5` },
      ]);
      note(o, `Positive items: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 ces-d ------------------------------------------------------
  'ces-d'(root) {
    note(root, 'CES-D (Radloff 1977 — NIMH public domain): a 20-item self-report depression scale rated over the past week, each item 0-3. The four positively-worded items (4, 8, 12, 16) are reverse-scored automatically. Total 0-60; ≥ 16 commonly flags clinically significant depressive symptoms.');
    CESD_STEMS.forEach((stem, i) => {
      root.appendChild(selectField(`${i + 1}. ${stem}`, `cd-q${i + 1}`, OPTS_CESD));
    });
    const o = out(); root.appendChild(o);
    wire(CESD_STEMS.map((_, i) => `cd-q${i + 1}`), () => safe(o, () => {
      const payload = {};
      for (let i = 1; i <= 20; i += 1) payload[`q${i}`] = selVal(`cd-q${i}`);
      const r = M.cesD(payload);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'CES-D', value: `${r.total}/60` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
