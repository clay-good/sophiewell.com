// spec-v905 §2: renderer for dka-resolution — the criteria for resolution of diabetic
// ketoacidosis (Clinical Scoring & Risk, Group G).
//
// The resolution-is-not-the-glucose sentence prints on every result, because the glucose is the
// number that falls first and the one an infusion gets stopped on.

import { el, clear } from '../lib/dom.js';
import * as D from '../lib/dka-resolution-v905.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
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
  'dka-resolution'(root) {
    note(root, 'A glucose below 200 is one of four conditions, not the answer. Two of the other three are needed with it.');

    root.appendChild(el('h2', { text: 'The values' }));
    numField(root, 'Glucose, mg/dL', 'dr-glucosemgdl', { min: '0', max: '2000', step: '1' });
    numField(root, 'Serum bicarbonate, mEq/L', 'dr-bicarbonate', { min: '0', max: '60', step: '0.1' });
    numField(root, 'Venous pH', 'dr-venousph', { min: '6.5', max: '8', step: '0.01' });
    numField(root, 'Anion gap, mEq/L', 'dr-aniongap', { min: '0', max: '60', step: '0.1' });

    const o = out(); root.appendChild(o);
    wire(['dr-glucosemgdl', 'dr-bicarbonate', 'dr-venousph', 'dr-aniongap'], () => safe(o, () => {
      const r = D.dkaResolution({
        glucoseMgDl: val('dr-glucosemgdl'),
        bicarbonate: val('dr-bicarbonate'),
        venousPh: val('dr-venousph'),
        anionGap: val('dr-aniongap'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.metNote);
      if (r.missingNote) note(o, r.missingNote);
      if (r.overlapNote) note(o, r.overlapNote);
      note(o, r.notGlucoseNote);
      note(o, r.twoOfThreeNote);
      note(o, r.ketoneNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This compares values already measured against a published definition. It does not manage an infusion, and it does not decide when to transition.' }));
  },
};
