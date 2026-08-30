// spec-v892 §2: renderer for lvp-albumin — albumin replacement after a large-volume paracentesis
// (Clinical Scoring & Risk, Group G).
//
// The volume-not-level sentence prints on every result, because the serum albumin is what a
// reader reaches for and it is not what decides this.

import { el, clear } from '../lib/dom.js';
import * as L from '../lib/lvp-albumin-v892.js';
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
  'lvp-albumin'(root) {
    note(root, 'The trigger is the volume removed, not the serum albumin. The dose is per liter across the whole volume.');

    root.appendChild(el('h2', { text: 'The paracentesis' }));
    numField(root, 'Ascitic fluid removed, liters', 'lvp-litersremoved', { min: '0', max: '30', step: '0.1' });
    // Written out rather than mapped from L.CONCENTRATIONS: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Albumin concentration stocked', 'lvp-concentration', [
      { value: '25', text: '25 percent (12.5 g per 50 mL bottle)' },
      { value: '20', text: '20 percent (10 g per 50 mL bottle)' },
      { value: '5', text: '5 percent (12.5 g per 250 mL bottle)' },
    ]);

    const o = out(); root.appendChild(o);
    wire(['lvp-litersremoved', 'lvp-concentration'], () => safe(o, () => {
      const r = L.lvpAlbumin({
        litersRemoved: val('lvp-litersremoved'),
        concentration: val('lvp-concentration'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.bottlesNote) note(o, r.bottlesNote);
      note(o, r.arithmeticNote);
      note(o, r.volumeNotLevelNote);
      note(o, r.notNutritionNote);
      note(o, r.diagnosticNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes a published dose from a volume already removed. It does not decide whether to drain, and it does not prescribe.' }));
  },
};
