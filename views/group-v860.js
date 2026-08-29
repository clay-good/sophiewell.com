// spec-v860 §2: renderer for mh-grading-scale — the malignant hyperthermia clinical grading
// scale (Clinical Scoring & Risk, Group G).
//
// Every published indicator is offered, not one picker per process, so the tile can show what
// adding them all up would have given. That over-call is the point.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mh-grading-scale-v860.js';
import { resultRow } from '../lib/result-copy.js';

const GROUPS = [
  ['Rigidity', 'rigidity'],
  ['Muscle breakdown', 'breakdown'],
  ['Respiratory acidosis', 'acidosis'],
  ['Temperature increase', 'temperature'],
  ['Cardiac involvement', 'cardiac'],
  ['Family history', 'family'],
  ['Other indicators', 'other'],
];

const domId = (key) => `mh-${key.toLowerCase()}`;

function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mh-grading-scale'(root) {
    note(root, 'This ranks how likely an episode was malignant hyperthermia, after the fact. It is not a treatment trigger: during a crisis dantrolene is given on clinical suspicion, and stopping to score is itself the harm.');

    for (const [heading, process] of GROUPS) {
      root.appendChild(el('h2', { text: `${heading} (highest one counts)` }));
      for (const ind of M.INDICATORS.filter((i) => i.process === process)) {
        checkField(root, `${ind.text} — ${ind.points} points`, domId(ind.key));
      }
    }

    const ids = M.INDICATORS.map((i) => domId(i.key));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const ind of M.INDICATORS) args[ind.key] = checked(domId(ind.key));
      const r = M.mhGradingScale(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.notATriggerNote);
      if (r.emptyNote) note(o, r.emptyNote);
      if (r.doubleCountNote) note(o, r.doubleCountNote);
      if (r.masseterNote) note(o, r.masseterNote);
      if (r.feverNote) note(o, r.feverNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This scores an episode that has already been described. It does not diagnose malignant hyperthermia, replace contracture or genetic testing, and it never decides whether to give dantrolene.' }));
  },
};
