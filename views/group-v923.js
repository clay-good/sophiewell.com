// spec-v923 §2: renderer for biological-variation-goals — analytical performance specifications
// derived from biological variation (Clinical Scoring & Risk, Group G).
//
// All three tiers print, always. "The" biological-variation goal almost always means the
// desirable tier, and showing only that one hides the other two.

import { el, clear } from '../lib/dom.js';
import * as B from '../lib/biological-variation-goals-v923.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, unit) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: unit ? `${label} (${unit})` : label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
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
  'biological-variation-goals'(root) {
    numField(root, 'Within-subject biological variation', 'bvg-cvi', 'CV %');
    numField(root, 'Between-subject biological variation, for the bias goals', 'bvg-cvg', 'CV %');

    const ids = ['bvg-cvi', 'bvg-cvg'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = B.biologicalVariationGoals({
        cvWithinSubject: val('bvg-cvi'),
        cvBetweenSubject: val('bvg-cvg'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band }]);
      for (const t of r.tiers) {
        note(o, t.bias === null
          ? `${t.tier[0].toUpperCase()}${t.tier.slice(1)}: imprecision at or below ${t.imprecision}%.`
          : `${t.tier[0].toUpperCase()}${t.tier.slice(1)}: imprecision at or below ${t.imprecision}%, bias at or below ${t.bias}%, total error at or below ${t.totalError}%.`);
      }
      note(o, r.tiersNote);
      note(o, r.biasInputNote);
      note(o, r.sourceNote);
      note(o, r.hierarchyNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is arithmetic on published variation estimates. It does not choose which tier applies, and it does not judge a method.' }));
  },
};
