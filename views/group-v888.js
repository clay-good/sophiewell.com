// spec-v888 §2: renderer for feno — interpreting a fractional exhaled nitric oxide measurement
// (Clinical Scoring & Risk, Group G).
//
// The measures-inflammation-not-asthma sentence prints on every result, because a low value is
// routinely read as ruling asthma out.

import { el, clear } from '../lib/dom.js';
import * as F from '../lib/feno-v888.js';
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
  feno(root) {
    note(root, 'This measures eosinophilic airway inflammation, not asthma. The cutpoints differ by age.');

    root.appendChild(el('h2', { text: 'The measurement' }));
    numField(root, 'Fractional exhaled nitric oxide, parts per billion', 'fe-fenoppb', { min: '0', max: '500', step: '0.1' });
    // Written out rather than mapped from F.AGE_GROUPS: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Age group, for the cutpoints', 'fe-agegroup', [
      { value: 'adult', text: 'Twelve years and older' },
      { value: 'child', text: 'Under twelve years' },
    ]);

    root.appendChild(el('h2', { text: 'Things that move the number' }));
    checkField(root, 'On an inhaled or oral corticosteroid', 'fe-oncorticosteroid');
    checkField(root, 'Currently smoking', 'fe-currentsmoker');
    checkField(root, 'Atopy, allergen exposure, or rhinitis', 'fe-atopyorrhinitis');
    checkField(root, 'Spirometry performed shortly before', 'fe-recentspirometry');

    const ids = ['fe-fenoppb', 'fe-agegroup', 'fe-oncorticosteroid', 'fe-currentsmoker',
      'fe-atopyorrhinitis', 'fe-recentspirometry'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = F.feno({
        fenoPpb: val('fe-fenoppb'),
        ageGroup: val('fe-agegroup'),
        onCorticosteroid: checked('fe-oncorticosteroid'),
        currentSmoker: checked('fe-currentsmoker'),
        atopyOrRhinitis: checked('fe-atopyorrhinitis'),
        recentSpirometry: checked('fe-recentspirometry'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.intermediateNote) note(o, r.intermediateNote);
      note(o, r.ageNote);
      note(o, r.confounderNote);
      note(o, r.notAsthmaNote);
      note(o, r.serialNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a number against published cutpoints. It does not diagnose asthma, and it does not decide whether to start or change a corticosteroid.' }));
  },
};
