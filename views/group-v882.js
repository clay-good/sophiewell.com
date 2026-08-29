// spec-v882 §2: renderer for polyp-surveillance — the US Multi-Society Task Force
// post-polypectomy intervals (Clinical Scoring & Risk, Group G).
//
// The complete-and-adequate-examination sentence prints on every result, because every number in
// the table rests on it and a reader entering findings will not think to check.

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/polyp-surveillance-v882.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'polyp-surveillance'(root) {
    note(root, 'Average-risk surveillance after polypectomy. Every interval below presumes the examination reached the cecum with an adequate preparation.');

    root.appendChild(el('h2', { text: 'The examination' }));
    checkField(root, 'Complete to the cecum', 'ps-completetocecum');
    checkField(root, 'Preparation adequate', 'ps-adequatepreparation');

    root.appendChild(el('h2', { text: 'Findings' }));
    // Written out rather than mapped from P.HISTOLOGY: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Worst histology found', 'ps-histology', [
      { value: 'none', text: 'No polyps found' },
      { value: 'hyperplastic-small', text: 'Hyperplastic polyps under 10 mm, rectum or sigmoid only' },
      { value: 'tubular-adenoma', text: 'Tubular adenoma' },
      { value: 'villous', text: 'Villous or tubulovillous adenoma' },
    ]);
    numField(root, 'Number of adenomas', 'ps-adenomacount', { min: '0', max: '200', step: '1' });
    numField(root, 'Largest adenoma, mm', 'ps-largestsizemm', { min: '0', max: '200', step: '1' });
    checkField(root, 'High-grade dysplasia', 'ps-highgradedysplasia');
    checkField(root, 'Piecemeal resection of an adenoma 20 mm or larger', 'ps-piecemealtwentymm');

    const ids = ['ps-completetocecum', 'ps-adequatepreparation', 'ps-histology', 'ps-adenomacount',
      'ps-largestsizemm', 'ps-highgradedysplasia', 'ps-piecemealtwentymm'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = P.polypSurveillance({
        completeToCecum: checked('ps-completetocecum'),
        adequatePreparation: checked('ps-adequatepreparation'),
        histology: val('ps-histology'),
        adenomaCount: val('ps-adenomacount'),
        largestSizeMm: val('ps-largestsizemm'),
        highGradeDysplasia: checked('ps-highgradedysplasia'),
        piecemealTwentyMm: checked('ps-piecemealtwentymm'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.piecemealNote) note(o, r.piecemealNote);
      if (r.sizeNote) note(o, r.sizeNote);
      note(o, r.examNote);
      note(o, r.scopeOfTableNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published interval table to findings already recorded. It does not decide when a patient is scheduled.' }));
  },
};
