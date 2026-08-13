// spec-v716 §2: renderer for dmft-caries — the DMFT caries-experience index (Clinical
// Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three count inputs
// (D, M, F); the sum 0-32 maps to a population caries-severity level.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dmft-caries-v716.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '32', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. DMFT describes lifetime caries experience; the severity levels give population context, not an individual diagnosis. It supports rather than replaces the clinical dental examination.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'dmft-caries'(root) {
    note(root, 'DMFT index: DMFT = D (decayed) + M (missing due to caries) + F (filled) permanent teeth. Population severity levels (mean DMFT): 0–1.1 very low, 1.2–2.6 low, 2.7–4.4 moderate, 4.5–6.5 high, ≥ 6.6 very high.');
    root.appendChild(numberField('D — decayed permanent teeth', 'dmft-d'));
    root.appendChild(numberField('M — permanent teeth missing due to caries', 'dmft-m'));
    root.appendChild(numberField('F — filled permanent teeth', 'dmft-f'));
    const ids = ['dmft-d', 'dmft-m', 'dmft-f'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.dmftCaries({ decayed: val('dmft-d'), missing: val('dmft-m'), filled: val('dmft-f') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'DMFT', value: `${r.score}` },
        { label: 'Level', value: r.severityLevel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
