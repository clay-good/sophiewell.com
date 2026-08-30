// spec-v918 §2: renderer for fmea-rpn — the FMEA risk priority number (Communication & Handoff,
// Group H).
//
// The result is deliberately NOT banded: there is no standard threshold, and banding it would be
// the exact claim this tile exists to refuse.

import { el, clear } from '../lib/dom.js';
import * as F from '../lib/fmea-rpn-v918.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '1', max: '10', step: '1', inputmode: 'numeric' }));
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
  'fmea-rpn'(root) {
    numField(root, 'Severity, 1 to 10', 'fr-severity');
    numField(root, 'Occurrence, 1 to 10', 'fr-occurrence');
    numField(root, 'Detection, 1 to 10, where 1 is almost certain to be caught', 'fr-detection');

    const ids = ['fr-severity', 'fr-occurrence', 'fr-detection'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = F.fmeaRpn({
        severity: val('fr-severity'),
        occurrence: val('fr-occurrence'),
        detection: val('fr-detection'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band }]);
      note(o, r.driverNote);
      note(o, r.rankingNote);
      note(o, r.severityNote);
      note(o, r.detectionNote);
      note(o, r.thresholdNote);
      note(o, r.supersededNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This multiplies three scores that were already assigned. It does not assign them, and it does not decide what to act on.' }));
  },
};
