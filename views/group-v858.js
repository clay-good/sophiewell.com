// spec-v858 §2: renderer for who-hearing-grade — the WHO grades of hearing loss (Clinical
// Scoring & Risk, Group G).
//
// Both ears are asked for even though only the better one sets the grade, because the separate
// one-ear category cannot be recognised without the other side.

import { el, clear } from '../lib/dom.js';
import * as W from '../lib/who-hearing-grade-v858.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
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

const DB = { min: '-10', max: '130', step: '1' };

export const renderers = {
  'who-hearing-grade'(root) {
    note(root, 'The grade is read from the better ear, and only the better ear. A deaf ear beside a normal one is not grade 5: it is its own category, which is why both ears are asked for.');

    root.appendChild(el('h2', { text: 'Right ear thresholds' }));
    numField(root, '0.5 kHz (dB)', 'wh-r500', DB);
    numField(root, '1 kHz (dB)', 'wh-r1000', DB);
    numField(root, '2 kHz (dB)', 'wh-r2000', DB);
    numField(root, '4 kHz (dB)', 'wh-r4000', DB);

    root.appendChild(el('h2', { text: 'Left ear thresholds' }));
    numField(root, '0.5 kHz (dB)', 'wh-l500', DB);
    numField(root, '1 kHz (dB)', 'wh-l1000', DB);
    numField(root, '2 kHz (dB)', 'wh-l2000', DB);
    numField(root, '4 kHz (dB)', 'wh-l4000', DB);

    root.appendChild(el('h2', { text: 'Or, if the four-frequency average is already worked out' }));
    numField(root, 'Right ear average over the four frequencies (dB)', 'wh-rpta', DB);
    numField(root, 'Left ear average over the four frequencies (dB)', 'wh-lpta', DB);

    const ids = ['wh-r500', 'wh-r1000', 'wh-r2000', 'wh-r4000', 'wh-l500', 'wh-l1000', 'wh-l2000', 'wh-l4000', 'wh-rpta', 'wh-lpta'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = W.whoHearingGrade({
        right500: val('wh-r500'), right1000: val('wh-r1000'), right2000: val('wh-r2000'), right4000: val('wh-r4000'),
        left500: val('wh-l500'), left1000: val('wh-l1000'), left2000: val('wh-l2000'), left4000: val('wh-l4000'),
        rightPta: val('wh-rpta'), leftPta: val('wh-lpta'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.unilateralNote) note(o, r.unilateralNote);
      if (r.betterEarNote) note(o, r.betterEarNote);
      if (r.oldThresholdNote) note(o, r.oldThresholdNote);
      if (r.singleEarNote) note(o, r.singleEarNote);
      if (r.frequencyNote) note(o, r.frequencyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published grading to thresholds already measured. It does not interpret the shape of an audiogram, separate conductive from sensorineural loss, or select a device.' }));
  },
};
