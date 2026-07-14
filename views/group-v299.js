// spec-v299: renderer for the Cosyntropin (ACTH) stimulation test interpretation.
// Group G (clinical scoring & reference). The clinician enters the peak stimulated
// serum cortisol and its unit; the tile reports whether the response meets the
// standard-immunoassay threshold, with a caveat for newer assays.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cited threshold's interpretation; it never
// asserts a diagnosis (lib/cosyntropin-v299.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cosyntropin-v299.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cosyntropin-stim'(root) {
    note(root, 'Cosyntropin (ACTH) stimulation test interpretation. Enter the peak stimulated serum cortisol (30 or 60 min after 250 µg cosyntropin); the tile compares it with the standard-immunoassay threshold of 18 µg/dL (500 nmol/L). Newer, more specific assays use lower cutoffs — use your laboratory’s. Near-neighbors: steroid-equiv, adrenal-ct-washout.');
    root.appendChild(numInput('Peak stimulated cortisol', 'csy-cortisol', { min: '0' }));
    root.appendChild(select('Unit', 'csy-unit', [
      ['µg/dL', 'µg/dL'],
      ['nmol/L', 'nmol/L'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['csy-cortisol', 'csy-unit'], () => safe(o, () => {
      const r = M.cosyntropinTest({ cortisol: val('csy-cortisol'), unit: val('csy-unit') });
      if (!r.valid) { note(o, r.message || 'Enter the peak cortisol.'); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Threshold', value: `${r.threshold} ${r.unit}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
