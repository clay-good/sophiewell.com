// spec-v205 §2: renderers for the pulmonology, COPD & sleep severity
// instruments — CAT, LENT, ADO, DOSE, and SACS-OSA. Group G. Shipped one tile at
// a time.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// point sums are bounded and finite-guarded in lib/pulm-copd-v205.js. Per the
// spec-v50 §3 posture note each tile defers the pleurodesis / inhaler / oxygen /
// polysomnography decision to the clinician and the patient (spec-v11 §5.3) —
// these stratify and screen, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pulm-copd-v205.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The pleurodesis, inhaler, oxygen, and sleep-study decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.4 cat-copd --------------------------------------------------------
  'cat-copd'(root) {
    note(root, 'COPD Assessment Test (Jones 2009): eight patient-completed items, each 0–5; total 0–40. Impact: low < 10, medium 10–20, high 21–30, very high > 30. GOLD uses ≥ 10 as the "more symptoms" threshold. Score each item 0 (no impact) to 5 (most impact). Near-neighbors: mmrc-dyspnea, gold-spirometry, decaf-score.');
    const items = [
      ['cat-cough', 'Cough (0 never – 5 all the time)'],
      ['cat-phlegm', 'Phlegm / mucus (0 none – 5 chest full)'],
      ['cat-chest', 'Chest tightness (0 none – 5 very tight)'],
      ['cat-breathless', 'Breathless walking up hills/stairs (0 not – 5 very)'],
      ['cat-activity', 'Activity limitation at home (0 not – 5 very limited)'],
      ['cat-confidence', 'Confidence leaving home (0 confident – 5 not at all)'],
      ['cat-sleep', 'Sleep (0 sound – 5 poor due to COPD)'],
      ['cat-energy', 'Energy (0 lots – 5 none)'],
    ];
    for (const [id, label] of items) root.appendChild(num(label, id, { min: '0', max: '5' }));
    const o = out(); root.appendChild(o);
    const ids = items.map((i) => i[0]);
    wire(ids, () => safe(o, () => {
      const r = M.cat({
        cough: val('cat-cough'), phlegm: val('cat-phlegm'), chest: val('cat-chest'), breathless: val('cat-breathless'),
        activity: val('cat-activity'), confidence: val('cat-confidence'), sleep: val('cat-sleep'), energy: val('cat-energy'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CAT', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
