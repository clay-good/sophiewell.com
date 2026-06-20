// spec-v121 §2: renderers for the four neuromuscular-emergency instruments
// (egris, megos, brighton-gbs, mgfa). All four home in Clinical Scoring & Risk
// (Group G). v121 is a Wave 4 feature spec of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score, a
// risk band, a certainty level, or a class, not management; none authors an IVIG,
// PLEX, intubation, or monitoring order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v121.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, risk band, certainty level, or class is the cited instrument’s, computed from the bedside exam, MRC sum-score read, or paraclinical determination you entered. The treat, monitor, and airway decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const ADL_OPTS = [
  { value: '0', text: '0 — normal' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — severe' },
];

export const renderers = {
  // ----- 2.1 egris ------------------------------------------------------
  egris(root) {
    note(root, 'Erasmus GBS Respiratory Insufficiency Score (Walgaard 2010): the risk of needing mechanical ventilation in the first week of Guillain-Barre syndrome. Enter the days from onset of weakness to admission, mark facial and/or bulbar weakness, and select the MRC sum-score band at admission. Total 0-7; low (0-2) ~4%, intermediate (3-4) ~24%, high (5+) ~65%.');
    root.appendChild(selectField('Days from onset of weakness to admission', 'eg-days', [
      { value: '0', text: 'More than 7 days (0)' },
      { value: '1', text: '4 to 7 days (+1)' },
      { value: '2', text: '3 days or fewer (+2)' },
    ]));
    root.appendChild(checkField('Facial and/or bulbar weakness — +1', 'eg-fb'));
    root.appendChild(selectField('MRC sum score at admission', 'eg-mrc', [
      { value: '0', text: '60-51 (0)' },
      { value: '1', text: '50-41 (+1)' },
      { value: '2', text: '40-31 (+2)' },
      { value: '3', text: '30-21 (+3)' },
      { value: '4', text: '20 or below (+4)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['eg-days', 'eg-fb', 'eg-mrc'], () => safe(o, () => {
      const r = M.egris({ daysOnset: selVal('eg-days'), facialBulbar: chk('eg-fb'), mrc: selVal('eg-mrc') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'EGRIS', value: `${r.total}/7` },
      ]);
      note(o, `Items contributing: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 megos ------------------------------------------------------
  megos(root) {
    note(root, 'Modified Erasmus GBS Outcome Score (Walgaard 2011): the probability of being unable to walk unaided at 4 and 26 weeks in Guillain-Barre syndrome. Select age, mark preceding diarrhea, choose the assessment timing, and select the MRC sum-score band (the MRC weighting differs at admission vs day 7). Total 0-9 at admission, 0-12 at day 7.');
    root.appendChild(selectField('Age', 'mg-age', [
      { value: '0', text: '40 or younger (0)' },
      { value: '1', text: '41 to 60 (+1)' },
      { value: '2', text: 'Over 60 (+2)' },
    ]));
    root.appendChild(checkField('Preceding diarrhea — +1', 'mg-diar'));
    root.appendChild(selectField('Assessment timing', 'mg-time', [
      { value: 'admission', text: 'At admission (MRC band weighted 0/2/4/6)' },
      { value: 'day7', text: 'At day 7 / week 1 (MRC band weighted 0/3/6/9)' },
    ]));
    root.appendChild(selectField('MRC sum score', 'mg-mrc', [
      { value: '0', text: '51-60' },
      { value: '1', text: '41-50' },
      { value: '2', text: '31-40' },
      { value: '3', text: '30 or below' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['mg-age', 'mg-diar', 'mg-time', 'mg-mrc'], () => safe(o, () => {
      const r = M.megos({ age: selVal('mg-age'), diarrhea: chk('mg-diar'), timing: selVal('mg-time'), mrc: selVal('mg-mrc') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'mEGOS', value: `${r.total}/${r.max}` },
      ]);
      note(o, `Items contributing: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 brighton-gbs -----------------------------------------------
  'brighton-gbs'(root) {
    note(root, 'Brighton Collaboration GBS case definition (Sejvar 2011; Fokke 2014): grades diagnostic certainty (Level 1 highest – 4 lowest). Mark the three core clinical features and the absence of an alternative diagnosis, then enter the CSF and nerve-conduction findings. Level 1 needs both CSF dissociation and consistent NCS; Level 2 needs either; Level 3 is clinical-only; Level 4 = insufficient evidence.');
    root.appendChild(checkField('Bilateral and flaccid limb weakness', 'br-weak'));
    root.appendChild(checkField('Decreased or absent deep tendon reflexes in weak limbs', 'br-aref'));
    root.appendChild(checkField('Monophasic course, onset-to-nadir 12 h to 28 days', 'br-mono'));
    root.appendChild(checkField('Absence of an identified alternative diagnosis', 'br-noalt'));
    root.appendChild(selectField('CSF findings', 'br-csf', [
      { value: 'not-done', text: 'Not done / unavailable' },
      { value: 'dissociation', text: 'Albuminocytologic dissociation (cells < 50/µL, elevated protein)' },
      { value: 'cells-normal-protein', text: 'Cells < 50/µL with normal protein' },
    ]));
    root.appendChild(checkField('Nerve-conduction studies consistent with a GBS subtype', 'br-ncs'));
    const o = out(); root.appendChild(o);
    wire(['br-weak', 'br-aref', 'br-mono', 'br-noalt', 'br-csf', 'br-ncs'], () => safe(o, () => {
      const r = M.brightonGbs({
        weakness: chk('br-weak'), areflexia: chk('br-aref'), monophasic: chk('br-mono'),
        noAltDx: chk('br-noalt'), csf: selVal('br-csf'), ncs: chk('br-ncs'),
      });
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Brighton', value: `Level ${r.level}` },
      ]);
      note(o, `Features met: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 mgfa -------------------------------------------------------
  mgfa(root) {
    note(root, 'MGFA clinical classification (Jaretzki 2000) + MG-ADL (Wolfe 1999): grades myasthenia gravis severity and the symptomatic burden. Select the predominant weakness pattern and severity (and the a/b subtype for generalized disease), then score each of the eight MG-ADL items 0-3. Class I-V with a/b subtype; MG-ADL total 0-24.');
    root.appendChild(selectField('Predominant weakness pattern / severity', 'mf-sev', [
      { value: 'ocular', text: 'Ocular weakness only — Class I' },
      { value: 'mild', text: 'Mild generalized — Class II' },
      { value: 'moderate', text: 'Moderate generalized — Class III' },
      { value: 'severe', text: 'Severe generalized — Class IV' },
      { value: 'intubation', text: 'Intubation (crisis) — Class V' },
    ]));
    root.appendChild(selectField('Subtype (generalized Classes II–IV)', 'mf-sub', [
      { value: 'a', text: 'a — limb/axial-predominant' },
      { value: 'b', text: 'b — oropharyngeal/respiratory-predominant' },
    ]));
    root.appendChild(selectField('MG-ADL — talking', 'mf-talk', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — chewing', 'mf-chew', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — swallowing', 'mf-swal', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — breathing', 'mf-breath', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — brushing teeth / combing hair', 'mf-hyg', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — rising from a chair', 'mf-rise', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — double vision', 'mf-dip', ADL_OPTS));
    root.appendChild(selectField('MG-ADL — eyelid droop', 'mf-pto', ADL_OPTS));
    const o = out(); root.appendChild(o);
    wire(['mf-sev', 'mf-sub', 'mf-talk', 'mf-chew', 'mf-swal', 'mf-breath', 'mf-hyg', 'mf-rise', 'mf-dip', 'mf-pto'], () => safe(o, () => {
      const r = M.mgfa({
        severity: selVal('mf-sev'), subtype: selVal('mf-sub'),
        talking: selVal('mf-talk'), chewing: selVal('mf-chew'), swallowing: selVal('mf-swal'),
        breathing: selVal('mf-breath'), hygiene: selVal('mf-hyg'), rising: selVal('mf-rise'),
        diplopia: selVal('mf-dip'), ptosis: selVal('mf-pto'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MGFA', value: `Class ${r.cls}` },
        { label: 'MG-ADL', value: `${r.adlTotal}/24` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
