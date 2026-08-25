// spec-v668 §2: renderer for cac-agatston — coronary artery calcium (CAC) Agatston score
// interpretation (Clinical Scoring & Risk, Group G). A standalone interpretation distinct
// from the built MESA CHD risk model (which uses the CAC score only as an input).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One integer
// score input classifies the calcified plaque burden.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cac-agatston-v668.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The category classifies the calcified plaque burden from the score entered; the statin-decision context applies only to borderline/intermediate-risk primary prevention and is advisory, not an order. A score of 0 lowers but does not eliminate risk. The decision stays with the clinician and patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cac-agatston'(root) {
    note(root, 'Coronary artery calcium (CAC) Agatston score (Agatston 1990): a total score of 0 = no identifiable plaque, 1-99 = mild, 100-399 = moderate, 400 or more = severe/extensive. In borderline/intermediate-risk primary prevention, the 2018 ACC/AHA guideline uses CAC to guide the statin decision.');
    root.appendChild(numberField('Total coronary artery calcium (Agatston) score', 'cac-score'));
    const ids = ['cac-score'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cacAgatston({ score: val('cac-score') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.range },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
