// spec-v786 §2: renderer for arvc-tfc — the 2010 Task Force Criteria for arrhythmogenic
// right ventricular cardiomyopathy (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six selects, one
// per category, each offering none / minor / major - the shape enforces the rule that a
// category contributes at most one criterion.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/arvc-tfc-v786.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a diagnostic framework to findings already gathered and interpreted. It does not read an image, an ECG or a biopsy, and it makes no decision about defibrillators, exercise restriction or family screening.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const LEVEL = [
  { value: 'none', text: 'Neither criterion met (0)' },
  { value: 'minor', text: 'Minor criterion met (1)' },
  { value: 'major', text: 'Major criterion met (2)' },
];

export const renderers = {
  'arvc-tfc'(root) {
    note(root, '2010 Task Force Criteria (Marcus 2010): pick the highest criterion met in each of the six categories. A category counts once, so several major findings within one category still score 2. Major is 2 points and minor 1. Four or more points is definite, three is borderline, two is possible.');
    root.appendChild(selectField('I. Global or regional dysfunction and structural alterations (echo, MRI, angiography)', 'arvc-structural', LEVEL));
    root.appendChild(selectField('II. Tissue characterization of the wall (biopsy)', 'arvc-tissue', LEVEL));
    root.appendChild(selectField('III. Repolarization abnormalities (T-wave inversion)', 'arvc-repol', LEVEL));
    root.appendChild(selectField('IV. Depolarization or conduction abnormalities (epsilon wave, late potentials, terminal activation duration)', 'arvc-depol', LEVEL));
    root.appendChild(selectField('V. Arrhythmias (ventricular tachycardia morphology, ectopic burden)', 'arvc-arrhythmia', LEVEL));
    root.appendChild(selectField('VI. Family history, including genetics', 'arvc-family', LEVEL));
    const ids = ['arvc-structural', 'arvc-tissue', 'arvc-repol', 'arvc-depol', 'arvc-arrhythmia', 'arvc-family'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.arvcTfc({
        structural: val('arvc-structural'),
        tissue: val('arvc-tissue'),
        repolarization: val('arvc-repol'),
        depolarization: val('arvc-depol'),
        arrhythmias: val('arvc-arrhythmia'),
        family: val('arvc-family'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Points', value: `${r.points}` },
        { label: 'Criteria met', value: r.met.length ? r.met.join(', ') : 'none' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
