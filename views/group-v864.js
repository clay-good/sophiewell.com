// spec-v864 §2: renderer for methemoglobin — reading a methemoglobin level (Clinical Scoring &
// Risk, Group G).
//
// The pulse oximeter reading and the arterial oxygen tension are asked for only so the tool can
// say what they do not mean. Neither changes the band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/methemoglobin-v864.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  methemoglobin(root) {
    note(root, 'A pulse oximeter and an arterial blood gas both read reassuringly in methemoglobinemia. Only co-oximetry measures it.');

    root.appendChild(el('h2', { text: 'Co-oximetry' }));
    numField(root, 'Methemoglobin (percent)', 'mh-level', { min: '0', max: '100', step: '0.1' });

    root.appendChild(el('h2', { text: 'The patient' }));
    checkField(root, 'Symptoms attributable to the methemoglobinemia', 'mh-symptoms');
    checkField(root, 'Known G6PD deficiency', 'mh-g6pd');
    checkField(root, 'Taking a serotonergic drug', 'mh-serotonergic');

    root.appendChild(el('h2', { text: 'The two readings that do not measure it' }));
    numField(root, 'Pulse oximeter reading (percent)', 'mh-spo2', { min: '0', max: '100', step: '1' });
    numField(root, 'Arterial oxygen tension (mmHg)', 'mh-pao2', { min: '0', max: '700', step: '1' });

    const ids = ['mh-level', 'mh-symptoms', 'mh-g6pd', 'mh-serotonergic', 'mh-spo2', 'mh-pao2'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.methemoglobin({
        level: val('mh-level'), spo2: val('mh-spo2'), pao2: val('mh-pao2'),
        symptoms: checked('mh-symptoms'), g6pd: checked('mh-g6pd'), serotonergic: checked('mh-serotonergic'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.effect);
      note(o, r.treatmentNote);
      if (r.g6pdNote) note(o, r.g6pdNote);
      if (r.serotonergicNote) note(o, r.serotonergicNote);
      if (r.gapNote) note(o, r.gapNote);
      note(o, r.oximeterNote);
      note(o, r.gasNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a measured level against published bands. It does not prescribe methylene blue, set a dose, or replace the regional poison center.' }));
  },
};
