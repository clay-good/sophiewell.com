// spec-v274 §2: renderer for the albumin-to-globulin ratio (A/G ratio). Group E. It
// joins the group-E lab tiles (protein / lipid / metabolic ratios).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/proteins-v274.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
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
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'agr'(root) {
    note(root, 'Albumin-to-globulin ratio = albumin / (total protein − albumin). A lower / reversed ratio (< ~1) is a recognized flag. Enter both in the same units. Near-neighbors: non-hdl-remnant, tsat.');
    root.appendChild(num('Serum albumin (g/dL)', 'agr-albumin', { min: '0' }));
    root.appendChild(num('Total protein (g/dL)', 'agr-tp', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['agr-albumin', 'agr-tp'], () => safe(o, () => {
      render(o, M.agr({ albumin: val('agr-albumin'), totalProtein: val('agr-tp') }), 'A/G');
    }));
    postureNote(root);
  },
};
