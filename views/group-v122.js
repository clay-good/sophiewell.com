// spec-v122 §2: renderers for the three general-neurology and rehabilitation
// instruments (hachinski, modified-ashworth, bickerstaff). All three home in
// Clinical Scoring & Risk (Group G). v122 is a Wave 4 feature spec of the
// spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score,
// grade, or determination, not management; none authors a diagnosis or a
// treatment order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v122.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, grade, or determination is the cited instrument’s, computed from the exam and history you entered. The diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const HACHINSKI_FIELDS = [
  ['ha-abrupt', 'Abrupt onset — +2'],
  ['ha-step', 'Stepwise deterioration — +1'],
  ['ha-fluct', 'Fluctuating course — +2'],
  ['ha-noct', 'Nocturnal confusion — +1'],
  ['ha-pers', 'Relative preservation of personality — +1'],
  ['ha-depr', 'Depression — +1'],
  ['ha-soma', 'Somatic complaints — +1'],
  ['ha-emot', 'Emotional incontinence — +1'],
  ['ha-htn', 'History or presence of hypertension — +1'],
  ['ha-stroke', 'History of strokes — +2'],
  ['ha-ather', 'Associated atherosclerosis — +1'],
  ['ha-fsym', 'Focal neurological symptoms — +2'],
  ['ha-fsign', 'Focal neurological signs — +2'],
];
const HACHINSKI_KEYS = ['abruptOnset', 'stepwise', 'fluctuating', 'nocturnal', 'preservedPersonality', 'depression', 'somatic', 'emotionalIncontinence', 'hypertension', 'strokeHistory', 'atherosclerosis', 'focalSymptoms', 'focalSigns'];

export const renderers = {
  // ----- 2.1 hachinski --------------------------------------------------
  hachinski(root) {
    note(root, 'Hachinski Ischemic Score (Hachinski 1975): distinguishes a vascular (multi-infarct) from a primary degenerative (Alzheimer-type) dementia. Mark each feature present — five score 2 points, eight score 1 point. Total 0-18; ≤ 4 favors a degenerative cause, 5-6 is indeterminate, ≥ 7 favors a vascular cause.');
    for (const [id, label] of HACHINSKI_FIELDS) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    wire(HACHINSKI_FIELDS.map((f) => f[0]), () => safe(o, () => {
      const payload = {};
      HACHINSKI_FIELDS.forEach(([id], i) => { payload[HACHINSKI_KEYS[i]] = chk(id); });
      const r = M.hachinski(payload);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Hachinski', value: `${r.total}/18` },
      ]);
      note(o, `Features present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 modified-ashworth ------------------------------------------
  'modified-ashworth'(root) {
    note(root, 'Modified Ashworth Scale (Bohannon & Smith 1987): the bedside ordinal grade of muscle spasticity, scored per muscle group on resistance to passive movement. Select the single grade that matches the resistance. The "1+" level is a distinct ordinal step, not an average.');
    root.appendChild(selectField('Resistance to passive movement', 'ma-grade', [
      { value: '0', text: '0 — no increase in muscle tone' },
      { value: '1', text: '1 — slight increase: catch and release, or minimal resistance at end of range' },
      { value: '1plus', text: '1+ — slight increase: catch, then minimal resistance through < half the range' },
      { value: '2', text: '2 — more marked increase through most of range, but part easily moved' },
      { value: '3', text: '3 — considerable increase, passive movement difficult' },
      { value: '4', text: '4 — part rigid in flexion or extension' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ma-grade'], () => safe(o, () => {
      const r = M.modifiedAshworth({ grade: selVal('ma-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MAS grade', value: r.grade },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 bickerstaff ------------------------------------------------
  bickerstaff(root) {
    note(root, 'Bickerstaff brainstem encephalitis checklist (Odaka 2003; spectrum framework Wakerley 2014): the required core is progressive symmetric external ophthalmoplegia AND ataxia (within ~4 weeks) PLUS altered consciousness OR hyperreflexia. The anti-GQ1b antibody, a brainstem MRI lesion, and CSF dissociation are supportive only — never required. A research/classification reading, not a validated gold standard.');
    root.appendChild(checkField('Progressive, relatively symmetric external ophthalmoplegia', 'bi-oph'));
    root.appendChild(checkField('Ataxia', 'bi-atax'));
    root.appendChild(checkField('Altered consciousness (drowsiness / stupor / coma)', 'bi-cons'));
    root.appendChild(checkField('Hyperreflexia', 'bi-hyper'));
    root.appendChild(checkField('Supportive: positive serum anti-GQ1b IgG antibody', 'bi-gq1b'));
    root.appendChild(checkField('Supportive: brainstem lesion on MRI', 'bi-mri'));
    root.appendChild(checkField('Supportive: CSF albuminocytologic dissociation', 'bi-csf'));
    const o = out(); root.appendChild(o);
    wire(['bi-oph', 'bi-atax', 'bi-cons', 'bi-hyper', 'bi-gq1b', 'bi-mri', 'bi-csf'], () => safe(o, () => {
      const r = M.bickerstaff({
        ophthalmoplegia: chk('bi-oph'), ataxia: chk('bi-atax'), consciousness: chk('bi-cons'),
        hyperreflexia: chk('bi-hyper'), gq1b: chk('bi-gq1b'), mri: chk('bi-mri'), csf: chk('bi-csf'),
      });
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'BBE', value: r.consistent ? 'core met' : 'core not met' },
      ]);
      note(o, `Features: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
