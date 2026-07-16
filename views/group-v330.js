// spec-v330: renderer for the Nottingham Prognostic Index (NPI) for breast cancer.
// Group G. The clinician enters the tumor size and selects the node stage and grade; the
// tile reports the NPI and its prognostic group.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cited prognostic score; it never asserts a diagnosis
// or a treatment decision (lib/nottingham-npi-v330.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nottingham-npi-v330.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The adjuvant-therapy decision stays with the multidisciplinary team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['npi-size', 'npi-node', 'npi-grade'];

export const renderers = {
  'nottingham-prognostic-index'(root) {
    note(root, 'Nottingham Prognostic Index (NPI) for early invasive breast cancer (Haybittle 1982 / Galea 1992). NPI = (0.2 × size in cm) + node stage + grade. Groups: excellent ≤ 2.4, good ≤ 3.4, moderate ≤ 5.4, poor > 5.4. Near-neighbors: bi-rads.');
    root.appendChild(field('Tumor size (cm)', 'npi-size', { step: '0.1', min: 0, placeholder: 'e.g. 2.5' }));
    root.appendChild(select('Lymph-node stage', 'npi-node', [
      ['1', '1 — no positive nodes'],
      ['2', '2 — 1 to 3 positive nodes'],
      ['3', '3 — 4 or more positive nodes'],
    ]));
    root.appendChild(select('Histologic grade', 'npi-grade', [
      ['1', '1 — grade I'],
      ['2', '2 — grade II'],
      ['3', '3 — grade III'],
    ]));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.nottinghamNpi({ size: val('npi-size'), nodeStage: val('npi-node'), grade: val('npi-grade') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'NPI', value: `${r.npi}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
