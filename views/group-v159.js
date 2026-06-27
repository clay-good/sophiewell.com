// spec-v159 §2: renderers for the four neurology / spine disability scales of
// the spec-v157 Subspecialty Depth program — edss (Expanded Disability Status
// Scale), asiaImpairment (ASIA Impairment Scale A–E), mjoa (modified Japanese
// Orthopaedic Association), and nurick (Nurick grade). All Clinical Scoring &
// Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a deterministic input -> grade/step mapping where every valid combination
// resolves to exactly one defined grade (spec-v100 §2 classification
// clarification); an incomplete exam input surfaces a complete-the-fields
// fallback. Per the spec-v50 §3 posture note each tile defers the management
// decision to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-disability-v159.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade and its interpretation are the cited scale’s, derived from the exam findings you enter. The management decision (disease-modifying therapy, decompression timing, rehabilitation plan) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
// 0..max integer option list, with an optional per-value label suffix map.
function gradeOpts(max, labels) {
  const out2 = [];
  for (let i = 0; i <= max; i += 1) out2.push({ value: String(i), text: labels && labels[i] ? `${i} — ${labels[i]}` : String(i) });
  return out2;
}
const YESNO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const MJOA_UE = { 0: 'unable to move hands', 1: 'cannot eat with a spoon', 2: 'cannot button a shirt', 3: 'buttons with great difficulty', 4: 'buttons with slight difficulty', 5: 'no dysfunction' };
const MJOA_LE = { 0: 'complete loss of motor/sensory', 1: 'cannot move legs', 2: 'cannot walk', 3: 'walks on flat floor with aid', 4: 'walks stairs with handrail', 5: 'moderate–marked gait disturbance, unaided', 6: 'mild gait disturbance, unaided', 7: 'no dysfunction' };
const MJOA_SENS = { 0: 'complete loss of hand sensation', 1: 'severe sensory loss/pain', 2: 'mild sensory loss', 3: 'no sensory loss' };
const MJOA_SPH = { 0: 'unable to urinate voluntarily', 1: 'marked difficulty', 2: 'mild–moderate difficulty', 3: 'normal' };

const NURICK_OPTS = [
  { value: '0', text: '0 — root signs only, no cord involvement' },
  { value: '1', text: '1 — cord signs, normal gait' },
  { value: '2', text: '2 — mild gait difficulty, fully employed' },
  { value: '3', text: '3 — gait difficulty preventing employment' },
  { value: '4', text: '4 — walks only with assistance' },
  { value: '5', text: '5 — chairbound or bedridden' },
];

const EDSS_AMB = [
  { value: 'unrestricted', text: 'Fully ambulatory without aid (~500 m+) — FS grades govern' },
  { value: 'walk-300', text: 'Without aid ~300 m (4.5)' },
  { value: 'walk-200', text: 'Without aid ~200 m (5.0)' },
  { value: 'walk-100', text: 'Without aid ~100 m (5.5)' },
  { value: 'unilateral-100', text: 'Unilateral aid ~100 m (6.0)' },
  { value: 'bilateral-20', text: 'Bilateral aid ~20 m (6.5)' },
  { value: 'wheelchair-5', text: 'Wheelchair, walks ≤ 5 m, wheels self (7.0)' },
  { value: 'wheelchair-transfer', text: 'Wheelchair, cannot walk, needs transfer aid (7.5)' },
  { value: 'bed-chair-arms', text: 'Restricted to bed/chair, out much of day, effective arms (8.0)' },
  { value: 'bed-some-arms', text: 'Mostly bed, some arm use (8.5)' },
  { value: 'helpless-comm', text: 'Helpless, bed-bound, communicates/eats (9.0)' },
  { value: 'helpless-nocomm', text: 'Totally helpless, cannot communicate/eat (9.5)' },
  { value: 'death', text: 'Death due to MS (10.0)' },
];
const EDSS_FS = [
  ['Pyramidal (weakness) (0–6)', 'edss-pyramidal', 6],
  ['Cerebellar (ataxia) (0–5)', 'edss-cerebellar', 5],
  ['Brainstem (0–5)', 'edss-brainstem', 5],
  ['Sensory (0–6)', 'edss-sensory', 6],
  ['Bowel & bladder (0–6)', 'edss-bowelBladder', 6],
  ['Visual (0–6)', 'edss-visual', 6],
  ['Cerebral / mental (0–5)', 'edss-cerebral', 5],
  ['Other (0–1)', 'edss-other', 1],
];

export const renderers = {
  // ----- 2.3 mjoa ------------------------------------------------------------
  mjoa(root) {
    note(root, 'modified Japanese Orthopaedic Association score (Benzel 1991) for cervical myelopathy: four domains summed to 0–18. HIGHER is BETTER (18 = no dysfunction), the opposite of most scores. Severity: mild ≥ 15, moderate 12–14, severe ≤ 11. Near-neighbors: nurick, sins-score.');
    root.appendChild(pickField('Motor — upper extremity', 'mjoa-ue', gradeOpts(5, MJOA_UE)));
    root.appendChild(pickField('Motor — lower extremity', 'mjoa-le', gradeOpts(7, MJOA_LE)));
    root.appendChild(pickField('Sensory — upper extremity', 'mjoa-sensory', gradeOpts(3, MJOA_SENS)));
    root.appendChild(pickField('Sphincter / bladder', 'mjoa-sphincter', gradeOpts(3, MJOA_SPH)));
    const o = out(); root.appendChild(o);
    wire(['mjoa-ue', 'mjoa-le', 'mjoa-sensory', 'mjoa-sphincter'], () => safe(o, () => {
      const r = M.mjoa({ motorUe: val('mjoa-ue'), motorLe: val('mjoa-le'), sensoryUe: val('mjoa-sensory'), sphincter: val('mjoa-sphincter') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'mJOA', value: `${r.score}/18` },
        { label: 'Severity', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 nurick ----------------------------------------------------------
  nurick(root) {
    note(root, 'Nurick grade (Nurick 1972) for cervical spondylotic myelopathy — a gait-focused 0–5 ordinal scale from root signs only (0) to chairbound/bedridden (5). Near-neighbors: mjoa.');
    root.appendChild(pickField('Gait / ambulation status', 'nurick-grade', NURICK_OPTS));
    const o = out(); root.appendChild(o);
    wire(['nurick-grade'], () => safe(o, () => {
      const r = M.nurick({ grade: val('nurick-grade') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Nurick grade', value: `${r.grade}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 asia-impairment -------------------------------------------------
  'asia-impairment'(root) {
    note(root, 'ASIA Impairment Scale (ISNCSCI, Kirshblum 2011): A complete, B sensory incomplete, C/D motor incomplete, E normal. Sacral sparing at S4–S5 is the complete-vs-incomplete gate; the proportion of key muscles below the level at grade ≥ 3 is the C-vs-D gate. Reports the AIS grade from your exam findings — it does not re-derive the full dermatome/myotome worksheet. Near-neighbors: nurick, mjoa.');
    root.appendChild(pickField('All sensory & motor function normal (patient has a prior documented deficit)?', 'asia-allnormal', YESNO));
    root.appendChild(pickField('Sacral sparing at S4–S5 (sensation, deep anal pressure, or voluntary anal contraction)?', 'asia-sacral', YESNO));
    root.appendChild(pickField('Motor function preserved below the neurological level (VAC, or motor > 3 levels below)?', 'asia-motor', YESNO));
    root.appendChild(pickField('At least half of the key muscles below the level are grade ≥ 3?', 'asia-half', YESNO));
    const o = out(); root.appendChild(o);
    wire(['asia-allnormal', 'asia-sacral', 'asia-motor', 'asia-half'], () => safe(o, () => {
      const r = M.asiaImpairment({ allNormal: val('asia-allnormal'), sacralSparing: val('asia-sacral'), motorIncomplete: val('asia-motor'), halfGrade3: val('asia-half') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'AIS grade', value: r.grade },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.1 edss ------------------------------------------------------------
  edss(root) {
    note(root, 'Expanded Disability Status Scale (Kurtzke 1983), 0–10 in 0.5 steps. The low range follows the eight Functional-System grades; the 4.0–9.5 range follows ambulation. A precise FS→step rating is not fully algorithmic, so this tile uses the standard simplified FS-count table and the authoritative ambulation anchors, reporting the HIGHER of the two. For a definitive rating use a trained Neurostatus assessment. Near-neighbors: mrs, gose.');
    root.appendChild(pickField('Ambulation status', 'edss-ambulation', EDSS_AMB));
    const ids = ['edss-ambulation'];
    for (const [label, id, max] of EDSS_FS) { root.appendChild(pickField(label, id, gradeOpts(max))); ids.push(id); }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.edss({
        ambulation: val('edss-ambulation'),
        pyramidal: val('edss-pyramidal'),
        cerebellar: val('edss-cerebellar'),
        brainstem: val('edss-brainstem'),
        sensory: val('edss-sensory'),
        bowelBladder: val('edss-bowelBladder'),
        visual: val('edss-visual'),
        cerebral: val('edss-cerebral'),
        other: val('edss-other'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'EDSS', value: r.score.toFixed(1) },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
