// spec-v881 §2: renderer for vitamin-d-level — a serum 25-hydroxyvitamin D level read against
// the two frameworks that disagree about it (Clinical Scoring & Risk, Group G).
//
// Both readings print side by side on every result. The tile does not pick one, because the
// published bodies have not.

import { el, clear } from '../lib/dom.js';
import * as V from '../lib/vitamin-d-level-v881.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vitamin-d-level'(root) {
    note(root, 'Two published bodies read this number differently. Both readings are shown, and neither is offered here as the answer.');

    root.appendChild(el('h2', { text: 'The level' }));
    numField(root, 'Serum 25-hydroxyvitamin D', 'vd-level', { min: '0', max: '1000', step: '0.1' });
    // Written out rather than mapped from V.UNITS: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Units', 'vd-unit', [
      { value: 'ng-ml', text: 'ng/mL' },
      { value: 'nmol-l', text: 'nmol/L' },
    ]);

    const o = out(); root.appendChild(o);
    wire(['vd-level', 'vd-unit'], () => safe(o, () => {
      const r = V.vitaminDLevel({ level: val('vd-level'), unit: val('vd-unit') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.unitNote) note(o, r.unitNote);
      note(o, r.disagreementNote);
      if (r.assayNote) note(o, r.assayNote);
      if (r.toxicityNote) note(o, r.toxicityNote);
      note(o, r.populationNote);
      note(o, r.testingNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a number against published thresholds. It does not diagnose deficiency, and it does not decide whether to supplement.' }));
  },
};
