// spec-v714 §2: renderer for prostate-health-index — the Prostate Health Index (phi)
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three number
// inputs; a formula returns the phi with a biopsy-probability band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/prostate-health-index-v714.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '0.1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. phi refines the biopsy decision within the 2–10 ng/mL total-PSA range; it does not diagnose cancer, and the probabilities are approximate reference figures. It supports rather than replaces urologic assessment and shared decision-making.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'prostate-health-index'(root) {
    note(root, 'Prostate Health Index (phi; Catalona 2011): phi = (p2PSA / free PSA) × √(total PSA), with p2PSA in pg/mL and PSA in ng/mL. Reference bands (total PSA 2–10, normal DRE): 0–26.9 ~11%, 27–35.9 ~21%, 36–54.9 ~33%, ≥ 55 ~50% probability of cancer on biopsy.');
    root.appendChild(numberField('Total PSA (ng/mL)', 'phi-total', '0.01'));
    root.appendChild(numberField('Free PSA (ng/mL)', 'phi-free', '0.01'));
    root.appendChild(numberField('p2PSA / [-2]proPSA (pg/mL)', 'phi-p2', '0.1'));
    const ids = ['phi-total', 'phi-free', 'phi-p2'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.prostateHealthIndex({ totalPsa: val('phi-total'), freePsa: val('phi-free'), p2psa: val('phi-p2') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'phi', value: `${r.phi}` },
        { label: 'Cancer prob.', value: r.probability },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
