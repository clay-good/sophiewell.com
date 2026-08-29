// spec-v886 §2: renderer for noise-exposure — allowable occupational noise exposure under the
// NIOSH and OSHA limits (Clinical Scoring & Risk, Group G).
//
// Both allowances print side by side on every result. The tile does not pick one, because the
// two standards genuinely disagree and the gap is the finding.

import { el, clear } from '../lib/dom.js';
import * as N from '../lib/noise-exposure-v886.js';
import { resultRow } from '../lib/result-copy.js';

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
  'noise-exposure'(root) {
    note(root, 'Two standards, two different exchange rates. Both allowances are shown, and neither is offered here as the answer.');

    root.appendChild(el('h2', { text: 'The exposure' }));
    numField(root, 'Measured sound level, dBA', 'ne-leveldba', { min: '40', max: '140', step: '0.1' });
    numField(root, 'Exposure duration, hours', 'ne-exposurehours', { min: '0', max: '24', step: '0.1' });

    root.appendChild(el('h2', { text: 'Hearing protection' }));
    numField(root, 'Noise reduction rating on the label, dB', 'ne-protectornrr', { min: '0', max: '40', step: '1' });

    const o = out(); root.appendChild(o);
    wire(['ne-leveldba', 'ne-exposurehours', 'ne-protectornrr'], () => safe(o, () => {
      const r = N.noiseExposure({
        levelDba: val('ne-leveldba'),
        exposureHours: val('ne-exposurehours'),
        protectorNrr: val('ne-protectornrr'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.actionLevelNote) note(o, r.actionLevelNote);
      note(o, r.derateNote);
      note(o, r.exchangeRateNote);
      note(o, r.ceilingNote);
      note(o, r.cumulativeNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes published limits from a measured level. It does not certify compliance, and it does not select hearing protection.' }));
  },
};
