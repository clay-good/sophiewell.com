// spec-v119 §2: renderers for the four prehospital LVO-triage and
// cerebrovascular-diagnosis instruments (cpsss, fast-ed, boston-caa, cvt-risk).
// All four home in Clinical Scoring & Risk (Group G). v119 is a Wave 4 feature
// spec of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a field
// occlusion-likelihood score, a diagnostic-certainty category, or an outcome-risk
// band, not management; none authors a destination, bypass, anticoagulation, or
// treatment order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v119.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The field score, diagnostic category, or outcome-risk band is the cited instrument’s, computed from the field exam or imaging read you entered. The destination, bypass, anticoagulation, and treatment decisions stay with the EMS crew, stroke team, and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const FASTED_ARM_OPTS = [
  { value: '0', text: 'No drift (0)' },
  { value: '1', text: 'Drift or some effort against gravity (1)' },
  { value: '2', text: 'No effort against gravity / no movement (2)' },
];
const FASTED_SPEECH_OPTS = [
  { value: '0', text: 'Absent (0)' },
  { value: '1', text: 'Mild to moderate (1)' },
  { value: '2', text: 'Severe, global aphasia, or mute (2)' },
];
const FASTED_EYE_OPTS = [
  { value: '0', text: 'Absent (0)' },
  { value: '1', text: 'Partial gaze deviation (1)' },
  { value: '2', text: 'Forced deviation (2)' },
];
const FASTED_NEGLECT_OPTS = [
  { value: '0', text: 'Absent (0)' },
  { value: '1', text: 'Extinction to bilateral stimulation, one modality (1)' },
  { value: '2', text: 'Does not recognize own hand / orients to one side (2)' },
];

export const renderers = {
  // ----- 2.1 cpsss / C-STAT ---------------------------------------------
  cpsss(root) {
    note(root, 'Cincinnati Prehospital Stroke Severity Scale (C-STAT): a field large-vessel-occlusion screen from three NIHSS-derived items. Mark conjugate gaze deviation, level-of-consciousness questions/commands answered incorrectly, and severe arm weakness (the arm cannot be held against gravity). Total 0-4; a total of 2 or more predicts an occlusion.');
    root.appendChild(checkField('Conjugate gaze deviation -- +2', 'cp-gaze'));
    root.appendChild(checkField('LOC questions/commands incorrect (age, month, or commands) -- +1', 'cp-loc'));
    root.appendChild(checkField('Severe arm weakness (cannot hold against gravity) -- +1', 'cp-arm'));
    const o = out(); root.appendChild(o);
    wire(['cp-gaze', 'cp-loc', 'cp-arm'], () => safe(o, () => {
      const r = M.cpsss({ gaze: chk('cp-gaze'), loc: chk('cp-loc'), arm: chk('cp-arm') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'C-STAT / CPSSS', value: `${r.total}/4` },
      ]);
      note(o, `Items present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 fast-ed ----------------------------------------------------
  'fast-ed'(root) {
    note(root, 'FAST-ED: a field large-vessel-occlusion screen from five NIHSS-derived items. Grade facial palsy, arm weakness, speech changes, eye deviation, and denial/neglect. Total 0-9; a total of 4 or more predicts an occlusion and supports comprehensive-center triage.');
    root.appendChild(selectField('Facial palsy', 'fe-facial', [
      { value: '0', text: 'Normal or minor (0)' },
      { value: '1', text: 'Partial or complete paralysis (1)' },
    ]));
    root.appendChild(selectField('Arm weakness', 'fe-arm', FASTED_ARM_OPTS));
    root.appendChild(selectField('Speech changes', 'fe-speech', FASTED_SPEECH_OPTS));
    root.appendChild(selectField('Eye deviation', 'fe-eye', FASTED_EYE_OPTS));
    root.appendChild(selectField('Denial / neglect', 'fe-neglect', FASTED_NEGLECT_OPTS));
    const o = out(); root.appendChild(o);
    wire(['fe-facial', 'fe-arm', 'fe-speech', 'fe-eye', 'fe-neglect'], () => safe(o, () => {
      const r = M.fastEd({
        facial: selVal('fe-facial'), arm: selVal('fe-arm'), speech: selVal('fe-speech'),
        eye: selVal('fe-eye'), neglect: selVal('fe-neglect'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FAST-ED', value: `${r.total}/9` },
      ]);
      note(o, `Items scored: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 boston-caa -------------------------------------------------
  'boston-caa'(root) {
    note(root, 'Boston Criteria v2.0 for cerebral amyloid angiopathy: grades diagnostic certainty (definite / probable with pathology / probable / possible). The in-vivo categories require age 50 or older, a compatible presentation, and no deep hemorrhagic lesion. Mark the strictly lobar hemorrhagic lesions (lobar ICH, cerebral microbleeds, cortical superficial siderosis) and the v2.0 white-matter feature.');
    root.appendChild(selectField('Pathology available', 'bc-path', [
      { value: 'none', text: 'None -- classify in vivo on MRI' },
      { value: 'specimen', text: 'Biopsy / evacuated-hematoma specimen showing CAA' },
      { value: 'postmortem', text: 'Full postmortem showing severe CAA' },
    ]));
    root.appendChild(checkField('Age 50 or older', 'bc-age'));
    root.appendChild(checkField('Compatible presentation (lobar ICH, transient focal episodes, or cognitive impairment)', 'bc-pres'));
    root.appendChild(selectField('Strictly lobar hemorrhagic lesions (lobar ICH / microbleeds / siderosis)', 'bc-lobar', [
      { value: '0', text: 'None (0)' },
      { value: '1', text: '1 lobar hemorrhagic lesion' },
      { value: '2', text: '2 or more lobar hemorrhagic lesions' },
    ]));
    root.appendChild(checkField('White-matter feature (centrum-semiovale perivascular spaces > 20, or WMH multispot)', 'bc-wm'));
    root.appendChild(checkField('Deep hemorrhagic lesion present (exclusion)', 'bc-deep'));
    const o = out(); root.appendChild(o);
    wire(['bc-path', 'bc-age', 'bc-pres', 'bc-lobar', 'bc-wm', 'bc-deep'], () => safe(o, () => {
      const r = M.bostonCaa({
        pathology: selVal('bc-path'), age50: chk('bc-age'), presentation: chk('bc-pres'),
        lobar: selVal('bc-lobar'), wm: chk('bc-wm'), deep: chk('bc-deep'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Boston v2.0', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 cvt-risk ---------------------------------------------------
  'cvt-risk'(root) {
    note(root, 'Cerebral venous thrombosis outcome risk score (Ferro 2009, ISCVT): predicts poor outcome (mRS > 2) from six items. Mark malignancy, coma (GCS < 9), deep venous system thrombosis, mental-status disturbance, male sex, and intracranial hemorrhage. Total 0-9; a total of 3 or more predicts a poor outcome.');
    root.appendChild(checkField('Malignancy -- +2', 'cv-malig'));
    root.appendChild(checkField('Coma (GCS < 9) -- +2', 'cv-coma'));
    root.appendChild(checkField('Deep venous system thrombosis -- +2', 'cv-deep'));
    root.appendChild(checkField('Mental-status disturbance -- +1', 'cv-mental'));
    root.appendChild(checkField('Male sex -- +1', 'cv-male'));
    root.appendChild(checkField('Intracranial hemorrhage -- +1', 'cv-ich'));
    const o = out(); root.appendChild(o);
    wire(['cv-malig', 'cv-coma', 'cv-deep', 'cv-mental', 'cv-male', 'cv-ich'], () => safe(o, () => {
      const r = M.cvtRisk({
        malignancy: chk('cv-malig'), coma: chk('cv-coma'), deepCvt: chk('cv-deep'),
        mentalStatus: chk('cv-mental'), male: chk('cv-male'), ich: chk('cv-ich'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'CVT risk', value: `${r.total}/9` },
      ]);
      note(o, `Items present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
