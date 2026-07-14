// spec-v304: renderer for the 1-mg overnight dexamethasone suppression test (DST)
// interpretation. Group G (clinical scoring & reference). The clinician enters the
// post-dexamethasone 8 am serum cortisol and its unit; the tile reports whether it
// suppressed below the 1.8 µg/dL (50 nmol/L) cutoff.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cited threshold's interpretation; it never
// asserts a diagnosis (lib/dst-v304.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dst-v304.js';
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
  'dexamethasone-suppression'(root) {
    note(root, 'Overnight 1-mg dexamethasone suppression test (DST) interpretation. Enter the 8 am serum cortisol drawn after 1 mg dexamethasone at ~11 pm; the tile compares it with the suppression cutoff of 1.8 µg/dL (50 nmol/L). Below the cutoff is normal suppression; at or above is a failure to suppress that must be confirmed. Near-neighbors: cosyntropin-stim.');
    root.appendChild(numInput('Post-dexamethasone 8 am cortisol', 'dst-cortisol', { min: '0' }));
    root.appendChild(select('Unit', 'dst-unit', [
      ['µg/dL', 'µg/dL'],
      ['nmol/L', 'nmol/L'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['dst-cortisol', 'dst-unit'], () => safe(o, () => {
      const r = M.dexSuppressionTest({ cortisol: val('dst-cortisol'), unit: val('dst-unit') });
      if (!r.valid) { note(o, r.message || 'Enter the cortisol.'); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Suppression cutoff', value: `${r.cutoff} ${r.unit}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
