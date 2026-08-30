// spec-v912 §2: renderer for nichd-fhr — the NICHD three-tier categorization of a fetal heart
// rate tracing (Clinical Scoring & Risk, Group G).
//
// The minimal-is-not-absent line prints on every result, because reading minimal variability as
// absent is the most common way this system is got wrong.
//
// Each select is written as `'<dom-id>', N.SOME_OPTIONS` so that scripts/lib/option-labels.mjs,
// which reads views statically, resolves the option text from the exported list rather than
// printing the raw values.

import { el, clear } from '../lib/dom.js';
import * as N from '../lib/nichd-fhr-v912.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
  root.appendChild(wrap);
}
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
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
  'nichd-fhr'(root) {
    numField(root, 'Baseline fetal heart rate', 'nf-baseline', 'beats per minute');
    selectField(root, 'Baseline variability', 'nf-variability', N.VARIABILITY_OPTIONS);
    selectField(root, 'Late decelerations', 'nf-latedecels', N.DECEL_OPTIONS);
    selectField(root, 'Variable decelerations', 'nf-variabledecels', N.DECEL_OPTIONS);
    selectField(root, 'Sinusoidal pattern', 'nf-sinusoidal', N.PRESENCE_OPTIONS);

    const ids = ['nf-baseline', 'nf-variability', 'nf-latedecels', 'nf-variabledecels', 'nf-sinusoidal'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = N.nichdFhr({
        baseline: val('nf-baseline'),
        variability: val('nf-variability'),
        lateDecels: val('nf-latedecels'),
        variableDecels: val('nf-variabledecels'),
        sinusoidal: val('nf-sinusoidal'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.minimalNote);
      note(o, r.residualNote);
      note(o, r.momentNote);
      note(o, r.ignoredNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This sorts findings already read from the tracing. It does not interpret the tracing itself, and it does not decide on delivery.' }));
  },
};
