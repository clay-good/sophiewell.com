// spec-v160 §2: renderers for the four rheumatology activity / classification
// tiles of the spec-v157 Subspecialty Depth program — rapid3 (RA PRO), dapsa
// (PsA activity), sliccSle (SLICC 2012), and sle2019EularAcr (2019 EULAR/ACR).
// All Clinical Scoring & Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage.
// rapid3/dapsa are bounded weighted sums over finite-checked inputs; sliccSle /
// sle2019EularAcr are deterministic classification rules over checkboxes where
// every input resolves to a single verdict (spec-v100 §2 classification
// clarification). Per the spec-v50 §3 posture note each tile states that
// classification criteria are for study/standardization, not a clinical
// diagnosis, and defers the decision to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheum-v160.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function numField(label, id, max) {
  return field(label, id, { type: 'number', min: '0', max: max == null ? undefined : String(max), step: 'any', inputmode: 'decimal' });
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Activity indices and classification criteria are the cited instrument’s, computed from the values you enter; classification criteria are for study/standardization, not a substitute for clinical diagnosis. The diagnosis and treatment stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

// SLICC checkbox sets.
const SLICC_CLINICAL = [
  ['Acute cutaneous lupus', 'slicc-acuteCutaneous'],
  ['Chronic cutaneous lupus', 'slicc-chronicCutaneous'],
  ['Oral or nasal ulcers', 'slicc-oralNasalUlcers'],
  ['Nonscarring alopecia', 'slicc-alopecia'],
  ['Synovitis (≥ 2 joints)', 'slicc-synovitis'],
  ['Serositis', 'slicc-serositis'],
  ['Renal', 'slicc-renal'],
  ['Neurologic', 'slicc-neurologic'],
  ['Hemolytic anemia', 'slicc-hemolyticAnemia'],
  ['Leukopenia or lymphopenia', 'slicc-leukopenia'],
  ['Thrombocytopenia', 'slicc-thrombocytopenia'],
];
const SLICC_IMMUNO = [
  ['ANA', 'slicc-ana'],
  ['Anti-dsDNA', 'slicc-antiDsDna'],
  ['Anti-Sm', 'slicc-antiSm'],
  ['Antiphospholipid antibody', 'slicc-antiphospholipid'],
  ['Low complement (C3/C4/CH50)', 'slicc-lowComplement'],
  ['Direct Coombs (no hemolytic anemia)', 'slicc-directCoombs'],
];
const SLICC_KEYMAP = {
  'slicc-acuteCutaneous': 'acuteCutaneous', 'slicc-chronicCutaneous': 'chronicCutaneous', 'slicc-oralNasalUlcers': 'oralNasalUlcers', 'slicc-alopecia': 'alopecia', 'slicc-synovitis': 'synovitis', 'slicc-serositis': 'serositis', 'slicc-renal': 'renal', 'slicc-neurologic': 'neurologic', 'slicc-hemolyticAnemia': 'hemolyticAnemia', 'slicc-leukopenia': 'leukopenia', 'slicc-thrombocytopenia': 'thrombocytopenia', 'slicc-ana': 'ana', 'slicc-antiDsDna': 'antiDsDna', 'slicc-antiSm': 'antiSm', 'slicc-antiphospholipid': 'antiphospholipid', 'slicc-lowComplement': 'lowComplement', 'slicc-directCoombs': 'directCoombs', 'slicc-biopsyNephritis': 'biopsyNephritis',
};

// 2019 EULAR/ACR weighted items, grouped by domain (highest-weighted per domain
// counts — the renderer shows the weight so the rule is transparent).
const SLE2019_ITEMS = [
  ['Constitutional — fever (+2)', 'sle19-fever', 'fever'],
  ['Hematologic — leukopenia (+3)', 'sle19-leukopenia', 'leukopenia'],
  ['Hematologic — thrombocytopenia (+4)', 'sle19-thrombocytopenia', 'thrombocytopenia'],
  ['Hematologic — autoimmune hemolysis (+4)', 'sle19-hemolysis', 'hemolysis'],
  ['Neuropsychiatric — delirium (+2)', 'sle19-delirium', 'delirium'],
  ['Neuropsychiatric — psychosis (+3)', 'sle19-psychosis', 'psychosis'],
  ['Neuropsychiatric — seizure (+5)', 'sle19-seizure', 'seizure'],
  ['Mucocutaneous — non-scarring alopecia (+2)', 'sle19-alopecia', 'alopecia'],
  ['Mucocutaneous — oral ulcers (+2)', 'sle19-oralUlcers', 'oralUlcers'],
  ['Mucocutaneous — subacute cutaneous or discoid (+4)', 'sle19-subacuteOrDiscoid', 'subacuteOrDiscoid'],
  ['Mucocutaneous — acute cutaneous (+6)', 'sle19-acuteCutaneous', 'acuteCutaneous'],
  ['Serosal — pleural/pericardial effusion (+5)', 'sle19-effusion', 'effusion'],
  ['Serosal — acute pericarditis (+6)', 'sle19-pericarditis', 'pericarditis'],
  ['Musculoskeletal — joint involvement (+6)', 'sle19-jointInvolvement', 'jointInvolvement'],
  ['Renal — proteinuria > 0.5 g/24h (+4)', 'sle19-proteinuria', 'proteinuria'],
  ['Renal — biopsy class II or V (+8)', 'sle19-biopsyClass2or5', 'biopsyClass2or5'],
  ['Renal — biopsy class III or IV (+10)', 'sle19-biopsyClass3or4', 'biopsyClass3or4'],
  ['Antiphospholipid antibodies (+2)', 'sle19-antiphospholipid', 'antiphospholipid'],
  ['Complement — low C3 or C4 (+3)', 'sle19-lowC3orC4', 'lowC3orC4'],
  ['Complement — low C3 and C4 (+4)', 'sle19-lowC3andC4', 'lowC3andC4'],
  ['SLE-specific antibodies — anti-dsDNA or anti-Sm (+6)', 'sle19-dsDnaOrSm', 'dsDnaOrSm'],
];

export const renderers = {
  // ----- 2.1 rapid3 ----------------------------------------------------------
  rapid3(root) {
    note(root, 'Routine Assessment of Patient Index Data 3 (Pincus 2008): three patient-reported 0–10 components — physical function (the 10-item MDHAQ FN, each 0–3, summed 0–30 then ÷3), pain VAS, and patient-global VAS — summed to 0–30. Categories: near-remission ≤ 3, low 3.1–6, moderate 6.1–12, high > 12. Near-neighbors: dapsa, das28, cdai-ra.');
    root.appendChild(numField('MDHAQ function sum (10 items × 0–3, 0–30)', 'rapid3-fn', 30));
    root.appendChild(numField('Pain VAS (0–10)', 'rapid3-pain', 10));
    root.appendChild(numField('Patient global VAS (0–10)', 'rapid3-global', 10));
    const o = out(); root.appendChild(o);
    wire(['rapid3-fn', 'rapid3-pain', 'rapid3-global'], () => safe(o, () => {
      const r = M.rapid3({ fnRaw: val('rapid3-fn'), pain: val('rapid3-pain'), global: val('rapid3-global') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'RAPID3', value: `${r.score}/30` },
        { label: 'Severity', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 dapsa -----------------------------------------------------------
  dapsa(root) {
    note(root, 'Disease Activity in Psoriatic Arthritis (Schoels 2016): TJC68 + SJC66 + patient-global VAS (0–10) + pain VAS (0–10) + CRP in mg/dL. CRP is mg/dL, NOT mg/L. Cutoffs: remission ≤ 4, low 5–14, moderate 15–28, high > 28. Near-neighbors: rapid3, caspar, das28.');
    root.appendChild(numField('68-joint tender count', 'dapsa-tjc', 68));
    root.appendChild(numField('66-joint swollen count', 'dapsa-sjc', 66));
    root.appendChild(numField('Patient global VAS (0–10)', 'dapsa-global', 10));
    root.appendChild(numField('Pain VAS (0–10)', 'dapsa-pain', 10));
    root.appendChild(numField('CRP (mg/dL)', 'dapsa-crp'));
    const o = out(); root.appendChild(o);
    wire(['dapsa-tjc', 'dapsa-sjc', 'dapsa-global', 'dapsa-pain', 'dapsa-crp'], () => safe(o, () => {
      const r = M.dapsa({ tjc68: val('dapsa-tjc'), sjc66: val('dapsa-sjc'), global: val('dapsa-global'), pain: val('dapsa-pain'), crp: val('dapsa-crp') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'DAPSA', value: `${r.score}` },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 slicc-sle -------------------------------------------------------
  'slicc-sle'(root) {
    note(root, 'SLICC 2012 SLE classification criteria (Petri 2012): 11 clinical + 6 immunologic criteria. Classifies if ≥ 4 criteria with ≥ 1 clinical AND ≥ 1 immunologic; OR biopsy-proven lupus nephritis with ANA or anti-dsDNA (the shortcut pathway). A study classification, not a clinical diagnosis. Near-neighbors: sle-2019-eular-acr, sledai-2k.');
    root.appendChild(el('h2', { text: 'Clinical criteria' }));
    const ids = [];
    for (const [label, id] of SLICC_CLINICAL) { root.appendChild(checkField(label, id)); ids.push(id); }
    root.appendChild(el('h2', { text: 'Immunologic criteria' }));
    for (const [label, id] of SLICC_IMMUNO) { root.appendChild(checkField(label, id)); ids.push(id); }
    root.appendChild(el('h2', { text: 'Shortcut pathway' }));
    root.appendChild(checkField('Biopsy-proven lupus nephritis (compatible with SLE)', 'slicc-biopsyNephritis'));
    ids.push('slicc-biopsyNephritis');
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[SLICC_KEYMAP[id]] = chk(id);
      const r = M.sliccSle(args);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.classifies ? 'warn' : null },
        { label: 'Clinical', value: `${r.clinical}` },
        { label: 'Immunologic', value: `${r.immunologic}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 sle-2019-eular-acr ----------------------------------------------
  'sle-2019-eular-acr'(root) {
    note(root, '2019 EULAR/ACR SLE classification criteria (Aringer 2019): a positive ANA ≥ 1:80 ever is a hard entry gate. Across 7 clinical + 3 immunologic domains only the highest-weighted item per domain counts. Classifies if entry met AND weighted total ≥ 10 AND ≥ 1 clinical criterion. A study classification, not a clinical diagnosis. Near-neighbors: slicc-sle, sledai-2k.');
    root.appendChild(checkField('Entry criterion — ANA ≥ 1:80 on HEp-2 cells (ever)', 'sle19-anaEntry'));
    const ids = ['sle19-anaEntry'];
    const keymap = { 'sle19-anaEntry': 'anaEntry' };
    for (const [label, id, key] of SLE2019_ITEMS) { root.appendChild(checkField(label, id)); ids.push(id); keymap[id] = key; }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[keymap[id]] = chk(id);
      const r = M.sle2019EularAcr(args);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.classifies ? 'warn' : null },
        { label: 'Weighted total', value: `${r.total}` },
        { label: 'Entry (ANA)', value: r.entry ? 'met' : 'not met' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
