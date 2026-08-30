// spec-v925 §2: renderer for delta-check — how far a result has moved from the last one, three
// ways (Clinical Scoring & Risk, Group G).
//
// The rate prints whether or not a threshold exists for it, because a laboratory that sets only
// an absolute threshold flags slow drift and misses fast change.

import { el, clear } from '../lib/dom.js';
import * as D from '../lib/delta-check-v925.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', step: 'any', inputmode: 'decimal' }, opts || {})));
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
  'delta-check'(root) {
    numField(root, 'Previous result', 'dc-previous');
    numField(root, 'Current result, in the same units', 'dc-current');
    numField(root, 'Hours between the two', 'dc-hours', { min: '0' });

    root.appendChild(el('h2', { text: 'Your thresholds, if you have them' }));
    numField(root, 'Absolute delta threshold', 'dc-absthreshold', { min: '0' });
    numField(root, 'Percent delta threshold', 'dc-pctthreshold', { min: '0' });
    numField(root, 'Rate threshold, per 24 hours', 'dc-ratethreshold', { min: '0' });

    const ids = ['dc-previous', 'dc-current', 'dc-hours', 'dc-absthreshold', 'dc-pctthreshold', 'dc-ratethreshold'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = D.deltaCheck({
        previousResult: val('dc-previous'),
        currentResult: val('dc-current'),
        hoursBetween: val('dc-hours'),
        absoluteThreshold: val('dc-absthreshold'),
        percentThreshold: val('dc-pctthreshold'),
        rateThreshold: val('dc-ratethreshold'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      for (const c of r.checks) {
        if (c.value === null) continue;
        note(o, c.flagged === null
          ? `${c.name}: ${c.value}. No threshold entered.`
          : `${c.name}: ${c.value}, against a threshold of ${c.threshold}. ${c.flagged ? 'Past it.' : 'Inside it.'}`);
      }
      note(o, r.rateNote);
      note(o, r.localNote);
      note(o, r.notAnErrorNote);
      note(o, r.rcvNote);
      if (r.zeroNote) note(o, r.zeroNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports how far a result has moved and compares it with thresholds someone else chose. It does not decide whether the change is real, clinically important, or a specimen problem.' }));
  },
};
