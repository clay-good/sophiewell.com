// spec-v903 §2: renderer for cuff-leak — the cuff leak test before extubation (Clinical Scoring
// & Risk, Group G).
//
// The who-to-test sentence prints on every result, because performing this on everybody is the
// error the guideline was written to stop.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/cuff-leak-v903.js';
import { resultRow } from '../lib/result-copy.js';

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
  'cuff-leak'(root) {
    note(root, 'Recommended only in patients at high risk of post-extubation stridor. Two cutoffs are in use, and neither is settled.');

    root.appendChild(el('h2', { text: 'The volumes' }));
    numField(root, 'Inspired tidal volume with the cuff up, mL', 'cl-inspiredml', { min: '0', max: '2000', step: '1' });
    numField(root, 'Averaged expired volume with the cuff down, mL', 'cl-expiredcuffdownml', { min: '0', max: '2000', step: '1' });

    root.appendChild(el('h2', { text: 'The patient' }));
    checkField(root, 'At high risk of post-extubation stridor', 'cl-highrisk');

    const o = out(); root.appendChild(o);
    wire(['cl-inspiredml', 'cl-expiredcuffdownml', 'cl-highrisk'], () => safe(o, () => {
      const r = C.cuffLeak({
        inspiredMl: val('cl-inspiredml'),
        expiredCuffDownMl: val('cl-expiredcuffdownml'),
        highRisk: checked('cl-highrisk'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.thresholdNote);
      if (r.failNote) note(o, r.failNote);
      note(o, r.predictiveNote);
      note(o, r.whoToTestNote);
      note(o, r.techniqueNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes a published comparison from two volumes already measured. It does not decide whether to extubate.' }));
  },
};
