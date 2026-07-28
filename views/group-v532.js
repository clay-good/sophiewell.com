// spec-v532: renderer for the Columbia classification of FSGS. Group G. Six yes/no selects under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The tile asks for FINDINGS and applies the precedence hierarchy itself, rather than asking the reader to
// name a variant they have already decided on. That is the point: the order is easy to get wrong by hand,
// and the tip step is a VETO rather than a rank comparison - a qualifying tip lesion plus perihilar
// sclerosis anywhere is not tip (lib/columbia-fsgs-v532.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile names a morphologic
// variant; it never diagnoses FSGS, never distinguishes primary from secondary disease, and never
// recommends therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/columbia-fsgs-v532.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'columbia-fsgs'(root) {
    note(root, 'The Columbia classification sorts focal segmental glomerulosclerosis into five mutually exclusive variants, applied in a fixed order: collapsing, tip, cellular, perihilar, then not otherwise specified. Enter the findings and the order is applied for you. Note that the tip variant carries a veto rather than a ranking — any perihilar sclerosis in the biopsy excludes it, even though tip sits above perihilar in the order. It names a variant; it does not diagnose FSGS and does not distinguish primary from secondary disease.');

    heading(root, 'Findings on the biopsy');
    const ids = [];
    for (const f of M.FSGS_FINDINGS) {
      const id = `fsgs-${f.key}`;
      ids.push(id);
      root.appendChild(select(`${f.text}. ${f.detail}`, id, YES_NO));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const f of M.FSGS_FINDINGS) args[f.key] = val(`fsgs-${f.key}`);
      const r = M.columbiaFsgs(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band }];
      if (r.variantName) rows.push({ label: 'Variant', value: r.variantName });
      if (r.tipVetoed) rows.push({ label: 'Tip veto', value: 'applied — perihilar sclerosis excludes the tip variant' });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
