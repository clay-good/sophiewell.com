// spec-v372: renderer for the CAD-RADS 2.0 coronary-CTA categories (0-5, with 4A/4B). Group G. The
// radiologist picks the category; the tile reports the category, its stenosis description, and whether
// it is obstructive (category 3+).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the CAD-RADS category; it never asserts a diagnosis, a management order,
// or a prognosis (lib/cad-rads-v372.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cad-rads-v372.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the cardiology / radiology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cad-rads'(root) {
    note(root, 'CAD-RADS 2.0 (Cury 2022) - coronary-CT-angiography category by maximal coronary stenosis. Pick the category. 0: 0% (no plaque); 1: 1-24% minimal; 2: 25-49% mild; 3: 50-69% moderate (obstructive); 4A: 70-99% severe; 4B: left main >= 50% or three-vessel obstructive; 5: 100% occlusion. Modifiers (N/S/G/HRP/I/E) and the P-score are out of scope. Part of the RADS family: bi-rads, li-rads, c-rads, o-rads.');
    root.appendChild(select('CAD-RADS category', 'cadrads-cat', [
      ['0', '0 - 0% (no plaque or stenosis)'],
      ['1', '1 - minimal (1-24%)'],
      ['2', '2 - mild (25-49%)'],
      ['3', '3 - moderate (50-69%), obstructive'],
      ['4A', '4A - severe (70-99%)'],
      ['4B', '4B - left main >= 50% or three-vessel obstructive'],
      ['5', '5 - total occlusion (100%)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['cadrads-cat'], () => safe(o, () => {
      const r = M.cadRads({ category: val('cadrads-cat') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
