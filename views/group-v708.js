// spec-v708 §2: renderer for meniere-aao-hns — the AAO-HNS Meniere hearing stage (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four pure-tone
// threshold inputs; their mean (PTA) maps to a hearing stage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/meniere-aao-hns-v708.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: "Decision support, not a verdict. This staging applies to definite Meniere's disease and uses the worst audiogram in the 6 months before treatment; it supports rather than replaces the full audiologic and clinical evaluation." }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'meniere-aao-hns'(root) {
    note(root, "AAO-HNS hearing stage for Meniere's disease (1995): PTA = mean of the pure-tone thresholds at 500, 1000, 2000, and 3000 Hz. Stage 1 ≤ 25 dB, 2 = 26–40, 3 = 41–70, 4 > 70 dB.");
    root.appendChild(numberField('Threshold at 500 Hz (dB HL)', 'men-500'));
    root.appendChild(numberField('Threshold at 1000 Hz (dB HL)', 'men-1000'));
    root.appendChild(numberField('Threshold at 2000 Hz (dB HL)', 'men-2000'));
    root.appendChild(numberField('Threshold at 3000 Hz (dB HL)', 'men-3000'));
    const ids = ['men-500', 'men-1000', 'men-2000', 'men-3000'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.meniereAaoHns({ threshold500: val('men-500'), threshold1000: val('men-1000'), threshold2000: val('men-2000'), threshold3000: val('men-3000') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PTA', value: `${r.pta} dB` },
        { label: 'Stage', value: `${r.stage} of 4` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
