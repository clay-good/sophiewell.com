// spec-v700 §2: renderer for malt-ipi — the MALT lymphoma prognostic index (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three checkboxes;
// a count 0-3 maps to a prognostic risk group.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/malt-ipi-v700.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The MALT-IPI is a prognostic stratification derived on the IELSG-19 trial, not a treatment decision. It supports rather than replaces clinical judgment and multidisciplinary care.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'malt-ipi'(root) {
    note(root, 'MALT-IPI (Thieblemont 2017): prognostic index for MALT lymphoma. One point each for age ≥ 70, Ann Arbor stage III/IV, and elevated LDH. Groups: 0 low, 1 intermediate, ≥ 2 high (5-year EFS ~70% / ~56% / ~29%).');
    root.appendChild(checkField('Age ≥ 70 years', 'malt-age'));
    root.appendChild(checkField('Ann Arbor stage III or IV', 'malt-stage'));
    root.appendChild(checkField('Elevated LDH (above upper limit of normal)', 'malt-ldh'));
    const ids = ['malt-age', 'malt-stage', 'malt-ldh'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.maltIpi({ ageOver70: checked('malt-age'), advancedStage: checked('malt-stage'), elevatedLdh: checked('malt-ldh') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/3` },
        { label: '5-yr EFS', value: r.survival },
      ]);
      note(o, r.factors.length ? `Factors: ${r.factors.join(', ')}.` : 'No risk factors (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
