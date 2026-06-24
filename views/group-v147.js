// spec-v147 §2: renderers for the seven rheumatology disease-activity and
// classification tiles (cdai-ra, sdai-ra, acr-eular-2010-ra, sledai-2k,
// gout-acr-eular-2015, caspar, fibromyalgia-acr-2016). All seven are Clinical
// Scoring & Risk (Group G) and cross-link the existing das28 anchor. v147
// continues Wave 8 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 classification clarification each tile CONSUMES the clinician's
// read of the joint exam, serology, synovial fluid, and imaging and COMPUTES a
// score / classification; it is not a no-input reference table. Per the spec-v50
// §3 clinical-posture note, each tile renders that it frames a computed value,
// not a treat/escalate/DMARD order in Sophie's voice (spec-v11 §5.3). A blank
// required input renders a complete-the-fields fallback rather than scoring a
// partial total.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheum-v147.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(label, id, opts = {}) {
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, band, or classification is the cited system’s, computed from the joint exam, serology, synovial fluid, and imaging you entered — the tile takes your read, it does not interpret a lab or radiograph. The management decision — start or escalate a DMARD, biologic, or urate-lowering therapy, or refer — stays with the rheumatologist and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SSS_OPTIONS = [
  { value: 's0', text: '0 — no problem' },
  { value: 's1', text: '1 — slight / mild, intermittent' },
  { value: 's2', text: '2 — moderate, often present' },
  { value: 's3', text: '3 — severe, pervasive, life-disturbing' },
];

export const renderers = {
  // ----- 2.1 cdai-ra ----------------------------------------------------
  'cdai-ra'(root) {
    note(root, 'CDAI (Aletaha 2005): lab-free RA disease activity, the sum of swollen + tender joint counts and the patient and physician global VAS, total 0–76. Remission ≤ 2.8, low ≤ 10, moderate ≤ 22, high > 22. Near-neighbors: das28, sdai-ra.');
    root.appendChild(numField('Swollen-joint count (0–28)', 'cdai-sjc', { min: 0, max: 28, placeholder: 'e.g. 6' }));
    root.appendChild(numField('Tender-joint count (0–28)', 'cdai-tjc', { min: 0, max: 28, placeholder: 'e.g. 8' }));
    root.appendChild(numField('Patient global assessment (0–10 cm VAS)', 'cdai-pga', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 3' }));
    root.appendChild(numField('Physician global assessment (0–10 cm VAS)', 'cdai-ega', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 2' }));
    const ids = ['cdai-sjc', 'cdai-tjc', 'cdai-pga', 'cdai-ega'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cdaiRa({ sjc: optNum('cdai-sjc'), tjc: optNum('cdai-tjc'), pga: optNum('cdai-pga'), ega: optNum('cdai-ega') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/76` },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 sdai-ra ----------------------------------------------------
  'sdai-ra'(root) {
    note(root, 'SDAI (Smolen 2003): the CDAI plus CRP in mg/dL, total 0–86. Remission ≤ 3.3, low ≤ 11, moderate ≤ 26, high > 26. Enter CRP in mg/dL — a value reported in mg/L is 10× larger. Near-neighbors: das28, cdai-ra.');
    root.appendChild(numField('Swollen-joint count (0–28)', 'sdai-sjc', { min: 0, max: 28, placeholder: 'e.g. 6' }));
    root.appendChild(numField('Tender-joint count (0–28)', 'sdai-tjc', { min: 0, max: 28, placeholder: 'e.g. 8' }));
    root.appendChild(numField('Patient global assessment (0–10 cm VAS)', 'sdai-pga', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 3' }));
    root.appendChild(numField('Physician global assessment (0–10 cm VAS)', 'sdai-ega', { step: '0.1', min: 0, max: 10, placeholder: 'e.g. 2' }));
    root.appendChild(numField('CRP (mg/dL)', 'sdai-crp', { step: '0.1', min: 0, max: 50, placeholder: 'e.g. 1.5' }));
    const ids = ['sdai-sjc', 'sdai-tjc', 'sdai-pga', 'sdai-ega', 'sdai-crp'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sdaiRa({ sjc: optNum('sdai-sjc'), tjc: optNum('sdai-tjc'), pga: optNum('sdai-pga'), ega: optNum('sdai-ega'), crp: optNum('sdai-crp') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/86` },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 acr-eular-2010-ra ------------------------------------------
  'acr-eular-2010-ra'(root) {
    note(root, '2010 ACR/EULAR RA classification (Aletaha 2010): four weighted domains, total 0–10; ≥ 6 classifies as definite RA. Apply only after confirming the entry condition (≥ 1 joint of definite clinical synovitis not better explained by another disease). Near-neighbor: das28.');
    root.appendChild(checkField('Entry condition met — ≥ 1 joint with definite clinical synovitis, not better explained by another disease', 'acr-entry'));
    root.appendChild(pickField('Joint involvement', 'acr-joints', [
      { value: 'large1', text: '1 large joint (0)' },
      { value: 'large2to10', text: '2–10 large joints (1)' },
      { value: 'small1to3', text: '1–3 small joints (2)' },
      { value: 'small4to10', text: '4–10 small joints (3)' },
      { value: 'over10', text: '>10 joints, at least 1 small (5)' },
    ]));
    root.appendChild(pickField('Serology (RF / anti-CCP)', 'acr-serology', [
      { value: 'negative', text: 'RF and ACPA negative (0)' },
      { value: 'low', text: 'Low-positive RF or ACPA — ≤ 3× ULN (2)' },
      { value: 'high', text: 'High-positive RF or ACPA — > 3× ULN (3)' },
    ]));
    root.appendChild(pickField('Acute-phase reactants', 'acr-acute', [
      { value: 'normal', text: 'Normal CRP and ESR (0)' },
      { value: 'abnormal', text: 'Abnormal CRP or ESR (1)' },
    ]));
    root.appendChild(pickField('Symptom duration', 'acr-duration', [
      { value: 'under6', text: 'Less than 6 weeks (0)' },
      { value: 'over6', text: '6 weeks or more (1)' },
    ]));
    const ids = ['acr-entry', 'acr-joints', 'acr-serology', 'acr-acute', 'acr-duration'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.acrEular2010Ra({ entry: chk('acr-entry'), joints: selVal('acr-joints'), serology: selVal('acr-serology'), acutePhase: selVal('acr-acute'), duration: selVal('acr-duration') });
      if (!r.valid) { showInvalid(o, r); return; }
      if (r.applicable === false) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 sledai-2k --------------------------------------------------
  'sledai-2k'(root) {
    note(root, 'SLEDAI-2K (Gladman 2002): SLE disease activity from 24 weighted descriptors (8/4/2/1) present in the prior 10 days, total 0–105. ≥ 6 denotes clinically important active disease; the 0 / 1–5 / 6–10 / 11–19 / ≥20 grouping is a convention. SLEDAI-2K credits ongoing rash, alopecia, mucosal ulcers, and proteinuria.');
    const groups = [
      ['Weight 8 — CNS & vascular', [
        ['sle-seizure', 'Seizure'], ['sle-psychosis', 'Psychosis'], ['sle-obs', 'Organic brain syndrome'],
        ['sle-visual', 'Visual disturbance'], ['sle-cranial', 'Cranial-nerve disorder'], ['sle-headache', 'Lupus headache'],
        ['sle-cva', 'CVA'], ['sle-vasculitis', 'Vasculitis'],
      ]],
      ['Weight 4 — renal & musculoskeletal', [
        ['sle-arthritis', 'Arthritis'], ['sle-myositis', 'Myositis'], ['sle-casts', 'Urinary casts'],
        ['sle-hematuria', 'Hematuria'], ['sle-proteinuria', 'Proteinuria (ongoing counts)'], ['sle-pyuria', 'Pyuria'],
      ]],
      ['Weight 2 — mucocutaneous, serosal & immunologic', [
        ['sle-rash', 'Rash (ongoing counts)'], ['sle-alopecia', 'Alopecia (ongoing counts)'], ['sle-ulcers', 'Mucosal ulcers (ongoing counts)'],
        ['sle-pleurisy', 'Pleurisy'], ['sle-pericarditis', 'Pericarditis'], ['sle-complement', 'Low complement'], ['sle-dna', 'Increased DNA binding'],
      ]],
      ['Weight 1 — constitutional & hematologic', [
        ['sle-fever', 'Fever'], ['sle-thrombocytopenia', 'Thrombocytopenia'], ['sle-leukopenia', 'Leukopenia'],
      ]],
    ];
    const ids = [];
    for (const [heading, items] of groups) {
      root.appendChild(el('p', { class: 'muted', text: heading }));
      for (const [id, label] of items) { root.appendChild(checkField(label, id)); ids.push(id); }
    }
    const keyById = {
      'sle-seizure': 'seizure', 'sle-psychosis': 'psychosis', 'sle-obs': 'organicBrain', 'sle-visual': 'visual',
      'sle-cranial': 'cranialNerve', 'sle-headache': 'lupusHeadache', 'sle-cva': 'cva', 'sle-vasculitis': 'vasculitis',
      'sle-arthritis': 'arthritis', 'sle-myositis': 'myositis', 'sle-casts': 'urinaryCasts', 'sle-hematuria': 'hematuria',
      'sle-proteinuria': 'proteinuria', 'sle-pyuria': 'pyuria', 'sle-rash': 'rash', 'sle-alopecia': 'alopecia',
      'sle-ulcers': 'mucosalUlcers', 'sle-pleurisy': 'pleurisy', 'sle-pericarditis': 'pericarditis', 'sle-complement': 'lowComplement',
      'sle-dna': 'dnaBinding', 'sle-fever': 'fever', 'sle-thrombocytopenia': 'thrombocytopenia', 'sle-leukopenia': 'leukopenia',
    };
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const arg = {};
      for (const [id, key] of Object.entries(keyById)) arg[key] = chk(id);
      const r = M.sledai2k(arg);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/105` },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 gout-acr-eular-2015 ----------------------------------------
  'gout-acr-eular-2015'(root) {
    note(root, '2015 ACR/EULAR gout classification (Neogi 2015): after the entry criterion (≥ 1 episode of peripheral joint/bursa swelling, pain, or tenderness), MSU crystals classify directly; otherwise the weighted domains sum to 0–23 and ≥ 8 classifies as gout. Serum urate < 4 mg/dL and a negative synovial tap subtract points.');
    root.appendChild(checkField('Entry criterion — ≥ 1 episode of swelling, pain, or tenderness in a peripheral joint or bursa', 'gout-entry'));
    root.appendChild(checkField('Sufficient criterion — MSU crystals in a symptomatic joint/bursa or tophus (classifies directly)', 'gout-msu'));
    root.appendChild(pickField('Pattern of joint involvement (ever)', 'gout-pattern', [
      { value: 'other', text: 'Other joint / polyarticular (0)' },
      { value: 'anklemid', text: 'Ankle or midfoot, no 1st MTP (1)' },
      { value: 'mtp1', text: '1st MTP involved (2)' },
    ]));
    root.appendChild(pickField('Episode characteristics — erythema / intolerable to touch / difficulty walking', 'gout-char', [
      { value: 'c0', text: 'None (0)' },
      { value: 'c1', text: 'One characteristic (1)' },
      { value: 'c2', text: 'Two characteristics (2)' },
      { value: 'c3', text: 'Three characteristics (3)' },
    ]));
    root.appendChild(pickField('Time-course of episodes (≥2 of <24 h to peak / ≤14 d resolution / complete resolution between)', 'gout-time', [
      { value: 'none', text: 'No typical episode (0)' },
      { value: 'one', text: 'One typical episode (1)' },
      { value: 'recurrent', text: 'Recurrent typical episodes (2)' },
    ]));
    root.appendChild(pickField('Serum urate (highest ever)', 'gout-urate', [
      { value: 'lt4', text: 'Less than 4 mg/dL (−4)' },
      { value: 'u4to6', text: '4 to <6 mg/dL (0)' },
      { value: 'u6to8', text: '6 to <8 mg/dL (2)' },
      { value: 'u8to10', text: '8 to <10 mg/dL (3)' },
      { value: 'ge10', text: '10 mg/dL or more (4)' },
    ]));
    root.appendChild(pickField('Synovial-fluid analysis of a symptomatic joint/bursa', 'gout-synovial', [
      { value: 'notdone', text: 'Not assessed (0)' },
      { value: 'negative', text: 'MSU-negative (−2)' },
    ]));
    root.appendChild(checkField('Clinical tophus (+4)', 'gout-tophus'));
    root.appendChild(checkField('Imaging urate deposition — US double-contour sign or DECT (+4)', 'gout-imgurate'));
    root.appendChild(checkField('Imaging gout-related erosion on radiograph (+4)', 'gout-imgdamage'));
    const ids = ['gout-entry', 'gout-msu', 'gout-pattern', 'gout-char', 'gout-time', 'gout-urate', 'gout-synovial', 'gout-tophus', 'gout-imgurate', 'gout-imgdamage'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.goutAcrEular2015({
        entry: chk('gout-entry'), msuCrystals: chk('gout-msu'), pattern: selVal('gout-pattern'),
        characteristics: selVal('gout-char'), timeCourse: selVal('gout-time'), serumUrate: selVal('gout-urate'),
        synovial: selVal('gout-synovial'), tophus: chk('gout-tophus'), imagingUrate: chk('gout-imgurate'), imagingDamage: chk('gout-imgdamage'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      if (r.applicable === false) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Result', value: r.bandLabel },
        ...(r.score != null ? [{ label: 'Score', value: `${r.score}/23` }] : []),
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 caspar -----------------------------------------------------
  caspar(root) {
    note(root, 'CASPAR (Taylor 2006): psoriatic-arthritis classification. After confirming established inflammatory articular disease (joint, spine, or entheseal), ≥ 3 of a maximum 6 points classifies. Current psoriasis is the only 2-point item. Near-neighbors: das28, acr-eular-2010-ra.');
    root.appendChild(checkField('Entry condition — established inflammatory articular disease (joint, spine, or entheseal)', 'caspar-entry'));
    root.appendChild(pickField('Psoriasis (highest applies)', 'caspar-psoriasis', [
      { value: 'current', text: 'Current psoriasis (2)' },
      { value: 'personal', text: 'Personal history of psoriasis (1)' },
      { value: 'family', text: 'Family history of psoriasis (1)' },
      { value: 'none', text: 'No psoriasis (0)' },
    ]));
    root.appendChild(checkField('Psoriatic nail dystrophy — onycholysis, pitting, hyperkeratosis (1)', 'caspar-nail'));
    root.appendChild(checkField('Negative rheumatoid factor — any method except latex (1)', 'caspar-rf'));
    root.appendChild(checkField('Dactylitis — current swelling of a whole digit or rheumatologist-recorded history (1)', 'caspar-dactylitis'));
    root.appendChild(checkField('Juxta-articular new bone formation on hand/foot radiograph (1)', 'caspar-bone'));
    const ids = ['caspar-entry', 'caspar-psoriasis', 'caspar-nail', 'caspar-rf', 'caspar-dactylitis', 'caspar-bone'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.caspar({ entry: chk('caspar-entry'), psoriasis: selVal('caspar-psoriasis'), nail: chk('caspar-nail'), rfNegative: chk('caspar-rf'), dactylitis: chk('caspar-dactylitis'), juxtaBone: chk('caspar-bone') });
      if (!r.valid) { showInvalid(o, r); return; }
      if (r.applicable === false) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/6` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.7 fibromyalgia-acr-2016 --------------------------------------
  'fibromyalgia-acr-2016'(root) {
    note(root, '2016 revised ACR fibromyalgia criteria (Wolfe 2016): met when (WPI ≥ 7 and SSS ≥ 5) OR (WPI 4–6 and SSS ≥ 9), AND generalized pain (≥ 4 of 5 regions), AND symptoms ≥ 3 months. The diagnosis is valid irrespective of other diagnoses. Near-neighbor: das28.');
    root.appendChild(numField('Widespread Pain Index — painful regions (0–19)', 'fib-wpi', { min: 0, max: 19, placeholder: 'e.g. 8' }));
    root.appendChild(selectField('Fatigue severity', 'fib-fatigue', SSS_OPTIONS));
    root.appendChild(selectField('Waking unrefreshed', 'fib-waking', SSS_OPTIONS));
    root.appendChild(selectField('Cognitive symptoms', 'fib-cognitive', SSS_OPTIONS));
    root.appendChild(el('p', { class: 'muted', text: 'Somatic-symptom count (over the past 6 months):' }));
    root.appendChild(checkField('Headaches', 'fib-headache'));
    root.appendChild(checkField('Pain or cramps in the lower abdomen', 'fib-abdominal'));
    root.appendChild(checkField('Depression', 'fib-depression'));
    root.appendChild(numField('Generalized pain — regions with pain (of 5: left/right upper, left/right lower, axial)', 'fib-regions', { min: 0, max: 5, placeholder: 'e.g. 4' }));
    root.appendChild(checkField('Symptoms present at a similar level for ≥ 3 months', 'fib-duration'));
    const ids = ['fib-wpi', 'fib-fatigue', 'fib-waking', 'fib-cognitive', 'fib-headache', 'fib-abdominal', 'fib-depression', 'fib-regions', 'fib-duration'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fibromyalgiaAcr2016({
        wpi: optNum('fib-wpi'), fatigue: selVal('fib-fatigue'), waking: selVal('fib-waking'), cognitive: selVal('fib-cognitive'),
        somHeadache: chk('fib-headache'), somAbdominal: chk('fib-abdominal'), somDepression: chk('fib-depression'),
        genRegions: optNum('fib-regions'), duration: chk('fib-duration'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'WPI', value: `${r.score}/19` },
        { label: 'SSS', value: `${r.sss}/12` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
