// spec-v715 §2: renderer for bewe — the Basic Erosive Wear Examination (Clinical Scoring &
// Risk, Group G). First tile in the dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six sextant selects
// (each 0-3); the sum 0-18 maps to an erosive-wear risk level.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bewe-v715.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. BEWE screens erosive tooth wear and guides follow-up intervals; it does not diagnose the cause. It supports rather than replaces the full dental examination and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SCORE = [{ value: '', text: '— 0-3 —' },
  { value: '0', text: '0 - no erosive wear' },
  { value: '1', text: '1 - initial loss of surface texture' },
  { value: '2', text: '2 - distinct defect, hard-tissue loss under 50%' },
  { value: '3', text: '3 - hard-tissue loss 50% or more' }];

export const renderers = {
  'bewe'(root) {
    note(root, 'Basic Erosive Wear Examination (Bartlett 2008): score the most-affected surface in each of six sextants, 0–3. Total 0–18. Levels: 0–2 none, 3–8 low, 9–13 medium, ≥ 14 high.');
    root.appendChild(selectField('Sextant 1 (upper right)', 'bewe-s1', SCORE));
    root.appendChild(selectField('Sextant 2 (upper anterior)', 'bewe-s2', SCORE));
    root.appendChild(selectField('Sextant 3 (upper left)', 'bewe-s3', SCORE));
    root.appendChild(selectField('Sextant 4 (lower left)', 'bewe-s4', SCORE));
    root.appendChild(selectField('Sextant 5 (lower anterior)', 'bewe-s5', SCORE));
    root.appendChild(selectField('Sextant 6 (lower right)', 'bewe-s6', SCORE));
    const ids = ['bewe-s1', 'bewe-s2', 'bewe-s3', 'bewe-s4', 'bewe-s5', 'bewe-s6'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.bewe({
        sextant1: val('bewe-s1'), sextant2: val('bewe-s2'), sextant3: val('bewe-s3'),
        sextant4: val('bewe-s4'), sextant5: val('bewe-s5'), sextant6: val('bewe-s6'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/18` },
        { label: 'Risk', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
