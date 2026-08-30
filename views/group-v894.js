// spec-v894 §2: renderer for tryptase — the acute rise that supports mast cell activation
// (Clinical Scoring & Risk, Group G).
//
// The rise-not-threshold sentence prints on every result, because a reader arrives holding one
// number and a laboratory reference range, and neither is what the rule uses.

import { el, clear } from '../lib/dom.js';
import * as T from '../lib/tryptase-v894.js';
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
  tryptase(root) {
    note(root, 'A rise from this person’s own baseline, not a threshold. Both levels are needed, and when each was drawn matters.');

    root.appendChild(el('h2', { text: 'The two levels' }));
    numField(root, 'Acute tryptase, ng/mL, drawn about 30 minutes to 4 hours after the reaction', 'try-acutetryptase', { min: '0', max: '2000', step: '0.1' });
    numField(root, 'Baseline tryptase, ng/mL, drawn at least 24 hours after everything settled', 'try-baselinetryptase', { min: '0', max: '2000', step: '0.1' });

    const o = out(); root.appendChild(o);
    wire(['try-acutetryptase', 'try-baselinetryptase'], () => safe(o, () => {
      const r = T.tryptase({
        acuteTryptase: val('try-acutetryptase'),
        baselineTryptase: val('try-baselinetryptase'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.notExcludedNote) note(o, r.notExcludedNote);
      if (r.baselineHighNote) note(o, r.baselineHighNote);
      note(o, r.notAThresholdNote);
      note(o, r.timingNote);
      note(o, r.singleValueNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This computes a published comparison from two levels already drawn. It does not diagnose anaphylaxis, and it does not diagnose a mast cell disorder.' }));
  },
};
