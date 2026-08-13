// spec-v723 §2: renderer for silness-loe-plaque-index — the Silness-Loe Plaque Index
// (Clinical Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four count inputs
// (surfaces scored 0/1/2/3); the weighted mean maps to an oral-hygiene band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/silness-loe-plaque-index-v723.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Plaque Index measures plaque to guide oral-hygiene instruction; the interpretation bands are advisory. It supports rather than replaces the clinical dental and periodontal examination.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'silness-loe-plaque-index'(root) {
    note(root, 'Silness-Löe Plaque Index (Silness & Löe 1964): score each surface 0 (no plaque), 1 (film, only after disclosing/probing), 2 (moderate, visible), 3 (abundant). Index = mean of surface scores. Advisory bands: 0 excellent, 0.1–0.9 good, 1.0–1.9 fair, 2.0–3.0 poor.');
    root.appendChild(numberField('Surfaces scored 0 (no plaque)', 'pli-0'));
    root.appendChild(numberField('Surfaces scored 1 (film, only after disclosing)', 'pli-1'));
    root.appendChild(numberField('Surfaces scored 2 (moderate, visible)', 'pli-2'));
    root.appendChild(numberField('Surfaces scored 3 (abundant soft matter)', 'pli-3'));
    const ids = ['pli-0', 'pli-1', 'pli-2', 'pli-3'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.silnessLoePlaqueIndex({ score0: val('pli-0'), score1: val('pli-1'), score2: val('pli-2'), score3: val('pli-3') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PlI', value: `${r.index}` },
        { label: 'Surfaces', value: `${r.surfaces}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
