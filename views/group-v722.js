// spec-v722 §2: renderer for loe-silness-gingival-index — the Loe-Silness Gingival Index
// (Clinical Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four count inputs
// (surfaces scored 0/1/2/3); the weighted mean maps to a gingivitis band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/loe-silness-gingival-index-v722.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Gingival Index grades gingival inflammation to guide oral-hygiene instruction; it does not diagnose periodontitis. It supports rather than replaces the clinical periodontal examination.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'loe-silness-gingival-index'(root) {
    note(root, 'Löe-Silness Gingival Index (Löe & Silness 1963): score each surface 0 (normal), 1 (mild, no bleeding), 2 (moderate, bleeds on probing), 3 (severe, spontaneous bleeding). Index = mean of surface scores. Bands: 0 healthy, 0.1–1.0 mild, 1.1–2.0 moderate, 2.1–3.0 severe.');
    root.appendChild(numberField('Surfaces scored 0 (normal)', 'gi-0'));
    root.appendChild(numberField('Surfaces scored 1 (mild, no bleeding)', 'gi-1'));
    root.appendChild(numberField('Surfaces scored 2 (moderate, bleeds on probing)', 'gi-2'));
    root.appendChild(numberField('Surfaces scored 3 (severe, spontaneous bleeding)', 'gi-3'));
    const ids = ['gi-0', 'gi-1', 'gi-2', 'gi-3'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.loeSilnessGingivalIndex({ score0: val('gi-0'), score1: val('gi-1'), score2: val('gi-2'), score3: val('gi-3') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'GI', value: `${r.index}` },
        { label: 'Surfaces', value: `${r.surfaces}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
