// spec-v850 §2: renderer for rope-score — the RoPE index (Clinical Scoring & Risk, Group G).
//
// The four history items are worded as the ABSENCE of a risk factor, exactly as the source
// scores them: a checkbox here means the patient does NOT have that disease.

import { el, clear } from '../lib/dom.js';
import * as R from '../lib/rope-score-v850.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'numeric' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rope-score'(root) {
    note(root, 'For a patient who has already had a cryptogenic stroke and in whom a hole between the atria has already been found. It answers whether that hole is the cause or a coincidence. It is not a risk score, and a high number goes with a LOWER chance of another stroke.');

    root.appendChild(el('h2', { text: 'Age' }));
    numField(root, 'Age (years)', 'rope-age', { min: '18', max: '120', step: '1' });

    root.appendChild(el('h2', { text: 'Each of these scores 1 point' }));
    root.appendChild(checkField('No history of high blood pressure', 'rope-htn'));
    root.appendChild(checkField('No history of diabetes', 'rope-dm'));
    root.appendChild(checkField('No previous stroke or transient ischemic attack', 'rope-prior'));
    root.appendChild(checkField('Nonsmoker', 'rope-smoke'));
    root.appendChild(checkField('Cortical infarct on imaging', 'rope-cortical'));

    const ids = ['rope-age', 'rope-htn', 'rope-dm', 'rope-prior', 'rope-smoke', 'rope-cortical'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = R.ropeScore({
        age: val('rope-age'),
        noHypertension: checked('rope-htn'),
        noDiabetes: checked('rope-dm'),
        noPriorStroke: checked('rope-prior'),
        nonsmoker: checked('rope-smoke'),
        corticalInfarct: checked('rope-cortical'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band }]);
      note(o, r.directionNote);
      if (r.nonMonotonicNote) note(o, r.nonMonotonicNote);
      if (r.ageNote) note(o, r.ageNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports a published index and the published figures that go with it. It does not select or adjust treatment, and the decision to close a hole between the atria stays with the treating team.' }));
  },
};
