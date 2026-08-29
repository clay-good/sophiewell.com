// spec-v865 §2: renderer for carboxyhemoglobin — reading a carboxyhemoglobin level (Clinical
// Scoring & Risk, Group G).
//
// The clinical features sit above the readings on purpose: they are what escalation rests on,
// and the level is not. The oximeter reading is asked for only so the tool can refuse it.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/carboxyhemoglobin-v865.js';
import { resultRow } from '../lib/result-copy.js';

const OXYGEN = [
  ['', 'Not stated'],
  ['none', 'None, room air'],
  ['high-flow', 'High-flow oxygen'],
  ['hyperbaric', 'Hyperbaric oxygen'],
];

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

const domId = (key) => `cx-${key.toLowerCase()}`;

export const renderers = {
  carboxyhemoglobin(root) {
    note(root, 'The level confirms exposure and nothing more. It does not correlate with severity and does not predict outcome, so what follows rests on the clinical features rather than on the number.');

    root.appendChild(el('h2', { text: 'What escalation rests on' }));
    for (const f of C.SEVERE_FEATURES) checkField(root, f.text, domId(f.key));

    root.appendChild(el('h2', { text: 'Co-oximetry' }));
    numField(root, 'Carboxyhemoglobin (percent)', 'cx-level', { min: '0', max: '100', step: '0.1' });
    checkField(root, 'Smoker', 'cx-smoker');

    root.appendChild(el('h2', { text: 'When the sample was drawn' }));
    selField(root, 'Oxygen already running', 'cx-oxygen', OXYGEN);
    numField(root, 'Hours on oxygen before the sample', 'cx-hours', { min: '0', max: '100', step: '0.5' });

    root.appendChild(el('h2', { text: 'The reading that does not measure it' }));
    numField(root, 'Pulse oximeter reading (percent)', 'cx-spo2', { min: '0', max: '100', step: '1' });

    const ids = ['cx-level', 'cx-smoker', 'cx-oxygen', 'cx-hours', 'cx-spo2'].concat(C.SEVERE_FEATURES.map((f) => domId(f.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        level: val('cx-level'), smoker: checked('cx-smoker'), oxygen: val('cx-oxygen'),
        hoursOnOxygen: val('cx-hours'), spo2: val('cx-spo2'),
      };
      for (const f of C.SEVERE_FEATURES) args[f.key] = checked(domId(f.key));
      const r = C.carboxyhemoglobin(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.notSeverityNote);
      note(o, r.featuresNote);
      if (r.belowBaselineNote) note(o, r.belowBaselineNote);
      if (r.smokerNote) note(o, r.smokerNote);
      note(o, r.timingNote);
      note(o, r.oximeterNote);
      note(o, r.gasNote);
      note(o, r.oxygenFirstNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a measured level against a baseline. It does not grade severity, decide hyperbaric oxygen, or replace the regional poison center.' }));
  },
};
