// spec-v911 §2: renderer for cgvhd-severity — the NIH 2014 consensus global severity of chronic
// graft-versus-host disease (Clinical Scoring & Risk, Group G).
//
// The lung override prints on every result, because it is the part of the algorithm most often
// missed.
//
// Each select is written as `'<dom-id>', C.ORGAN_SCORE_OPTIONS` so that
// scripts/lib/option-labels.mjs, which reads views statically, can resolve the option text from
// the exported list rather than printing the raw values.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/cgvhd-severity-v911.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cgvhd-severity'(root) {
    selectField(root, 'Skin', 'cg-skin', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Mouth', 'cg-mouth', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Eyes', 'cg-eyes', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Gastrointestinal tract', 'cg-gi', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Liver', 'cg-liver', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Lungs', 'cg-lungs', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Joints and fascia', 'cg-joints', C.ORGAN_SCORE_OPTIONS);
    selectField(root, 'Genital tract', 'cg-genital', C.ORGAN_SCORE_OPTIONS);

    const ids = C.ORGANS.map((organ) => `cg-${organ.key}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const organ of C.ORGANS) args[organ.key] = val(`cg-${organ.key}`);
      const r = C.cgvhdSeverity(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.lungNote);
      note(o, r.notAssessedNote);
      note(o, r.diagnosisNote);
      note(o, r.acuteNote);
      note(o, r.treatmentNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a published algorithm from organ scores already assigned. It does not diagnose, and it does not choose therapy.' }));
  },
};
