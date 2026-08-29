// spec-v873 §2: renderer for lyme-two-tier — the CDC serologic testing algorithm for Lyme
// disease (Clinical Scoring & Risk, Group G).
//
// The erythema migrans sentence prints on every result, because the commonest misuse of this
// algorithm is running it on a rash that is already diagnostic.

import { el, clear } from '../lib/dom.js';
import * as L from '../lib/lyme-two-tier-v873.js';
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
  'lyme-two-tier'(root) {
    note(root, 'For later or non-specific presentations. Erythema migrans is a clinical diagnosis and is treated on sight, without serology.');

    root.appendChild(el('h2', { text: 'Presentation' }));
    checkField(root, 'Erythema migrans is present', 'lyme-erythemamigrans');
    numField(root, 'Days since symptom onset', 'lyme-dayssinceonset', { min: '0', max: '3650', step: '1' });

    root.appendChild(el('h2', { text: 'Results' }));
    // Written out rather than mapped from the lib constants: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'First tier: enzyme immunoassay or immunofluorescence assay', 'lyme-firsttier', [
      { value: 'not-done', text: 'Not done' },
      { value: 'negative', text: 'Negative' },
      { value: 'equivocal', text: 'Equivocal' },
      { value: 'positive', text: 'Positive' },
    ]);
    selectField(root, 'Second tier: immunoblot, or a second enzyme immunoassay', 'lyme-secondtier', [
      { value: 'not-done', text: 'Not done' },
      { value: 'negative', text: 'Negative' },
      { value: 'igm-only', text: 'IgM reactive, IgG not reactive' },
      { value: 'igg', text: 'IgG reactive' },
    ]);

    const ids = ['lyme-erythemamigrans', 'lyme-dayssinceonset', 'lyme-firsttier', 'lyme-secondtier'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = L.lymeTwoTier({
        erythemaMigrans: checked('lyme-erythemamigrans'),
        daysSinceOnset: val('lyme-dayssinceonset'),
        firstTier: val('lyme-firsttier'),
        secondTier: val('lyme-secondtier'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.igmNote) note(o, r.igmNote);
      if (r.earlyNote) note(o, r.earlyNote);
      if (r.orderNote) note(o, r.orderNote);
      if (r.mtttNote) note(o, r.mtttNote);
      note(o, r.emNote);
      note(o, r.treatmentNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published testing algorithm to results already obtained. It does not diagnose Lyme disease, and it does not decide whether to treat.' }));
  },
};
