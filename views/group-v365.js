// spec-v365: renderer for the Prague C&M criteria for Barrett's esophagus. Group G. The endoscopist
// enters the circumferential (C) and maximal (M) extent in cm above the GEJ; the tile reports the Prague
// notation and the traditional short-/long-segment descriptor, and validates that M >= C.
//
// Same input/render contract as the rest of the codebase: the inputs have real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Prague notation; it never asserts a diagnosis, a dysplasia grade,
// or a surveillance decision (lib/prague-barrett-v365.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/prague-barrett-v365.js';
import { resultRow } from '../lib/result-copy.js';

function numField(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Barrett’s requires biopsy-confirmed intestinal metaplasia; the surveillance decision stays with the gastroenterologist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'prague-barrett'(root) {
    note(root, 'Prague C&M criteria (Sharma 2006) for grading the extent of Barrett\'s esophagus. Enter the circumferential (C) and maximal (M) extent in cm above the gastroesophageal junction; M must be at least as long as C. Reports the Prague notation (C_ M_) and the traditional short-/long-segment (M >= 3 cm) descriptor. Near-neighbors: la-esophagitis.');
    root.appendChild(numField('Circumferential extent C (cm above GEJ)', 'pr-c', { min: '0', max: '25', step: '0.5' }));
    root.appendChild(numField('Maximal extent M (cm above GEJ)', 'pr-m', { min: '0', max: '25', step: '0.5' }));

    const o = out(); root.appendChild(o);
    wire(['pr-c', 'pr-m'], () => safe(o, () => {
      const r = M.pragueBarrett({ c: val('pr-c'), m: val('pr-m') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Prague', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
