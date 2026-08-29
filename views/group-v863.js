// spec-v863 §2: renderer for blood-lead — the CDC blood lead reference value (Clinical Scoring
// & Risk, Group G).
//
// The sample type is asked for because an elevated fingerstick is confirmed venous before it is
// acted on, and the tool says so when the sample type is left blank as well.

import { el, clear } from '../lib/dom.js';
import * as L from '../lib/lead-v863.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
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
  'blood-lead'(root) {
    note(root, 'The reference value is 3.5 micrograms per deciliter. It was lowered from 5 in 2021, so a result read against the old line leaves every child between 3.5 and 5 looking normal.');

    root.appendChild(el('h2', { text: 'The result' }));
    numField(root, 'Blood lead level (micrograms per deciliter)', 'bl-level', { min: '0', max: '500', step: '0.1' });
    selField(root, 'Sample type', 'bl-sample', [['', 'Not stated'], ['venous', 'Venous'], ['capillary', 'Capillary (fingerstick)']]);

    const o = out(); root.appendChild(o);
    wire(['bl-level', 'bl-sample'], () => safe(o, () => {
      const r = L.bloodLead({ level: val('bl-level'), sample: val('bl-sample') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.actionNote);
      if (r.loweredNote) note(o, r.loweredNote);
      if (r.capillaryNote) note(o, r.capillaryNote);
      note(o, r.notSafeNote);
      note(o, r.historyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a result against the published reference value. It does not schedule confirmatory testing, choose a chelating agent, or replace the local health department, the regional poison center, or a lead program.' }));
  },
};
