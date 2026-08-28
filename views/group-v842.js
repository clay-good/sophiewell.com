// spec-v842 §2: renderer for hf-stages-abcd — the ACC/AHA/HFSA heart failure stages
// (Clinical Scoring & Risk, Group G).
//
// Current and previous symptoms are SEPARATE checkboxes because stage C is defined to include
// previous ones. A single "symptoms" tick could not express a patient whose symptoms have
// resolved, and those patients are exactly the ones wrongly moved back to stage B.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hf-stages-abcd-v842.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hf-stages-abcd'(root) {
    note(root, 'Stage C includes previous symptoms. Symptoms resolving on treatment does not move a patient back to stage B.');

    root.appendChild(el('h2', { text: 'Risk' }));
    root.appendChild(checkField('Risk factors: hypertension, cardiovascular disease, obesity, diabetes, cardiotoxic exposure, a genetic variant for cardiomyopathy or a family history of one', 'hfs-risk'));

    root.appendChild(el('h2', { text: 'Evidence of pre-heart failure' }));
    root.appendChild(checkField('Structural heart disease: reduced ejection fraction, chamber enlargement, a wall-motion abnormality or valve disease', 'hfs-structural'));
    root.appendChild(checkField('Raised filling pressures on echocardiography', 'hfs-filling'));
    root.appendChild(checkField('Raised natriuretic peptide, or persistently elevated cardiac troponin', 'hfs-biomarkers'));

    root.appendChild(el('h2', { text: 'Symptoms' }));
    root.appendChild(checkField('Current symptoms of heart failure', 'hfs-current'));
    root.appendChild(checkField('Previous symptoms of heart failure, now resolved', 'hfs-previous'));
    root.appendChild(checkField('Symptoms interfere with daily life, resist control, and cause recurrent hospitalizations despite guideline-directed medical therapy', 'hfs-advanced'));

    const ids = ['hfs-risk', 'hfs-structural', 'hfs-filling', 'hfs-biomarkers',
      'hfs-current', 'hfs-previous', 'hfs-advanced'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hfStagesAbcd({
        riskFactors: checked('hfs-risk'),
        structuralHeartDisease: checked('hfs-structural'),
        raisedFillingPressures: checked('hfs-filling'),
        raisedBiomarkers: checked('hfs-biomarkers'),
        currentSymptoms: checked('hfs-current'),
        previousSymptoms: checked('hfs-previous'),
        advancedFeatures: checked('hfs-advanced'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.directionNote) note(o, r.directionNote);
      if (r.biomarkerNote) note(o, r.biomarkerNote);
      if (r.orphanBiomarkerNote) note(o, r.orphanBiomarkerNote);
      if (r.symptomsWithoutStructureNote) note(o, r.symptomsWithoutStructureNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to findings already gathered. It does not select or adjust therapy.' }));
  },
};
