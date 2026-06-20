// spec-v120 §2: renderers for the five epilepsy-prognosis, headache-likelihood,
// and vertigo-localization instruments (stess, helps2b, mess-first-seizure,
// pound-migraine, hints). All five home in Clinical Scoring & Risk (Group G).
// v120 is a Wave 4 feature spec of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score, a
// risk band, or a localization, not management; none authors a treatment,
// monitoring, or imaging order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v120.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, risk band, or localization is the cited instrument’s, computed from the bedside exam or cEEG read you entered. The treat, admit, monitor, and imaging decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const STESS_CON_OPTS = [
  { value: '0', text: 'Alert, or somnolent / confused (0)' },
  { value: '1', text: 'Stuporous or comatose (1)' },
];
const STESS_SZ_OPTS = [
  { value: '0', text: 'Simple/complex partial, absence, or myoclonic (0)' },
  { value: '1', text: 'Generalized convulsive (1)' },
  { value: '2', text: 'Nonconvulsive SE in coma (2)' },
];

export const renderers = {
  // ----- 2.1 stess ------------------------------------------------------
  stess(root) {
    note(root, 'Status Epilepticus Severity Score (Rossetti 2008): a four-item prognostic score for status epilepticus. Grade consciousness and worst seizure type, and mark age 65 or older and the absence of a prior-seizure history. Total 0-6; a total of 3 or more is unfavorable.');
    root.appendChild(selectField('Level of consciousness', 'st-con', STESS_CON_OPTS));
    root.appendChild(selectField('Worst seizure type', 'st-sz', STESS_SZ_OPTS));
    root.appendChild(checkField('Age 65 or older -- +2', 'st-age'));
    root.appendChild(checkField('No, or unknown, history of prior seizures -- +1', 'st-prior'));
    const o = out(); root.appendChild(o);
    wire(['st-con', 'st-sz', 'st-age', 'st-prior'], () => safe(o, () => {
      const r = M.stess({ consciousness: selVal('st-con'), seizureType: selVal('st-sz'), age65: chk('st-age'), noPrior: chk('st-prior') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'STESS', value: `${r.total}/6` },
      ]);
      note(o, `Items contributing: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 helps2b ----------------------------------------------------
  helps2b(root) {
    note(root, '2HELPS2B (Struck 2017): a continuous-EEG seizure-risk score from six clinician-read items. Mark B(I)RDs, lateralized/bilateral-independent periodic discharges, sporadic epileptiform discharges, any pattern faster than 2 Hz, "plus" features, and a prior seizure history. Total 0-7, mapped to a calibrated 72-hour seizure risk through the published lookup.');
    root.appendChild(checkField('Brief potentially-ictal rhythmic discharges (B(I)RDs) -- +2', 'h2-birds'));
    root.appendChild(checkField('Lateralized periodic discharges / LRDA / BIPDs -- +1', 'h2-periodic'));
    root.appendChild(checkField('Sporadic epileptiform discharges -- +1', 'h2-sporadic'));
    root.appendChild(checkField('Any periodic/rhythmic pattern faster than 2 Hz -- +1', 'h2-fast'));
    root.appendChild(checkField('"Plus" features (superimposed rhythmic/sharp/fast activity) -- +1', 'h2-plus'));
    root.appendChild(checkField('Prior seizure history -- +1', 'h2-prior'));
    const o = out(); root.appendChild(o);
    wire(['h2-birds', 'h2-periodic', 'h2-sporadic', 'h2-fast', 'h2-plus', 'h2-prior'], () => safe(o, () => {
      const r = M.helps2b({
        birds: chk('h2-birds'), periodic: chk('h2-periodic'), sporadic: chk('h2-sporadic'),
        fast: chk('h2-fast'), plus: chk('h2-plus'), priorSeizure: chk('h2-prior'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: '2HELPS2B', value: `${r.total}/7` },
      ]);
      note(o, `Items present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 mess-first-seizure -----------------------------------------
  'mess-first-seizure'(root) {
    note(root, 'MESS first-seizure recurrence rule (Kim 2006, MRC MESS trial): groups seizure-recurrence risk after a single or early seizure. Select the number of seizures at presentation and mark a neurological disorder and an abnormal EEG. Total 0-4; low (0), medium (1), high (2 or more). Distinct from the v109 MESS mangled-extremity score.');
    root.appendChild(selectField('Seizures at presentation', 'me-sz', [
      { value: '0', text: '1 seizure (0)' },
      { value: '1', text: '2-3 seizures (+1)' },
      { value: '2', text: '4 or more seizures (+2)' },
    ]));
    root.appendChild(checkField('Neurological disorder (deficit / learning disability / developmental delay) -- +1', 'me-neuro'));
    root.appendChild(checkField('Abnormal EEG -- +1', 'me-eeg'));
    const o = out(); root.appendChild(o);
    wire(['me-sz', 'me-neuro', 'me-eeg'], () => safe(o, () => {
      const r = M.messFirstSeizure({ seizures: selVal('me-sz'), neuroDisorder: chk('me-neuro'), abnormalEeg: chk('me-eeg') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MESS group', value: `${r.group} (${r.total}/4)` },
      ]);
      note(o, `Factors present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 pound-migraine ---------------------------------------------
  'pound-migraine'(root) {
    note(root, 'POUND mnemonic (Detsky 2006): a bedside migraine-likelihood count. Mark each feature present -- Pulsatile/throbbing, hOurs duration (4-72 h), Unilateral, Nausea/vomiting, Disabling. Count 0-5; 4 or more strongly favors migraine, 2 or fewer makes it unlikely.');
    root.appendChild(checkField('Pulsatile or throbbing quality', 'po-puls'));
    root.appendChild(checkField('hOurs duration -- the headache lasts 4 to 72 hours', 'po-hours'));
    root.appendChild(checkField('Unilateral location', 'po-uni'));
    root.appendChild(checkField('Nausea or vomiting', 'po-nausea'));
    root.appendChild(checkField('Disabling intensity', 'po-dis'));
    const o = out(); root.appendChild(o);
    wire(['po-puls', 'po-hours', 'po-uni', 'po-nausea', 'po-dis'], () => safe(o, () => {
      const r = M.poundMigraine({
        pulsatile: chk('po-puls'), hours: chk('po-hours'), unilateral: chk('po-uni'),
        nausea: chk('po-nausea'), disabling: chk('po-dis'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'POUND', value: `${r.total}/5` },
      ]);
      note(o, `Features present: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 hints ------------------------------------------------------
  hints(root) {
    note(root, 'HINTS / HINTS-plus exam (Kattah 2009): a three-step bedside oculomotor exam for acute vestibular syndrome. Enter the Head-Impulse test, the Nystagmus direction, and the Test of Skew, plus any new hearing loss (HINTS-plus). A benign peripheral pattern needs all three reassuring; any one central feature -- including a normal head impulse -- flags a central (stroke) cause.');
    root.appendChild(selectField('Head-Impulse test', 'hi-impulse', [
      { value: 'abnormal', text: 'Abnormal -- corrective saccade present (peripheral)' },
      { value: 'normal', text: 'Normal / untestable -- no corrective saccade (central)' },
    ]));
    root.appendChild(selectField('Nystagmus', 'hi-nys', [
      { value: 'fixed', text: 'Direction-fixed horizontal (peripheral)' },
      { value: 'changing', text: 'Direction-changing on eccentric gaze (central)' },
    ]));
    root.appendChild(selectField('Test of Skew', 'hi-skew', [
      { value: 'absent', text: 'Absent (peripheral)' },
      { value: 'present', text: 'Present -- vertical skew on cover test (central)' },
    ]));
    root.appendChild(checkField('New unilateral hearing loss (HINTS-plus)', 'hi-hear'));
    const o = out(); root.appendChild(o);
    wire(['hi-impulse', 'hi-nys', 'hi-skew', 'hi-hear'], () => safe(o, () => {
      const r = M.hints({ headImpulse: selVal('hi-impulse'), nystagmus: selVal('hi-nys'), skew: selVal('hi-skew'), hearingLoss: chk('hi-hear') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'HINTS', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
