// spec-v705 §2: renderer for pi-ll-mismatch — the spinopelvic PI-LL mismatch (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two number inputs
// (pelvic incidence, lumbar lordosis); the difference maps to an SRS-Schwab modifier.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pi-ll-mismatch-v705.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: step || '1', inputmode: 'decimal' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. PI-LL is one sagittal-alignment parameter among several; an age-adjusted target allows a larger mismatch in older patients. It supports rather than replaces the full deformity assessment and surgical planning.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pi-ll-mismatch'(root) {
    note(root, 'PI-LL mismatch (SRS-Schwab, Schwab 2012): pelvic incidence − lumbar lordosis (degrees). SRS-Schwab sagittal modifier: |PI−LL| < 10 = 0 (well aligned), 10–20 = +, > 20 = ++. Realignment target is within about ±10°.');
    root.appendChild(numberField('Pelvic incidence, PI (degrees)', 'pill-pi', '1'));
    root.appendChild(numberField('Lumbar lordosis magnitude, LL (degrees)', 'pill-ll', '1'));
    const ids = ['pill-pi', 'pill-ll'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.piLlMismatch({ pelvicIncidence: val('pill-pi'), lumbarLordosis: val('pill-ll') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PI−LL', value: `${r.mismatch}°` },
        { label: 'Modifier', value: r.modifier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
