// spec-v316: renderer for the GOLD ABE assessment tool (COPD group A / B / E).
// Group G. The clinician enters the symptom burden (mMRC grade and/or CAT score) and
// the exacerbation history over the past 12 months; the tile reports the GOLD group.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the group assignment; it never authors a treatment
// order (lib/gold-abe-v316.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gold-abe-v316.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', '1');
  inp.setAttribute('inputmode', 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The pharmacotherapy choice and the management plan stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['gold-mmrc', 'gold-cat', 'gold-exac-mod', 'gold-exac-hosp'];

export const renderers = {
  'gold-abe'(root) {
    note(root, 'GOLD ABE assessment tool (GOLD 2025 Report): assigns a COPD patient to group A, B, or E from symptom burden and exacerbation history. Enter mMRC and/or CAT (either one suffices) and the past-year exacerbations. More symptoms = mMRC ≥ 2 or CAT ≥ 10; high exacerbation risk (group E) = ≥ 2 moderate or ≥ 1 hospitalized. Near-neighbors: gold-spirometry, mmrc-dyspnea, cat-copd.');
    note(root, 'Symptom burden (enter at least one):');
    root.appendChild(field('mMRC dyspnea grade (0-4)', 'gold-mmrc', { min: 0, max: 4, placeholder: 'e.g. 2' }));
    root.appendChild(field('CAT score (0-40)', 'gold-cat', { min: 0, max: 40, placeholder: 'e.g. 15' }));
    note(root, 'Exacerbations in the past 12 months:');
    root.appendChild(field('Moderate exacerbations (not hospitalized)', 'gold-exac-mod', { min: 0, placeholder: 'e.g. 1' }));
    root.appendChild(check('≥ 1 exacerbation leading to hospital admission', 'gold-exac-hosp'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.goldAbe({
        mmrc: val('gold-mmrc'), cat: val('gold-cat'),
        moderateExacerbations: val('gold-exac-mod'), hospitalizedExacerbation: chk('gold-exac-hosp'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Group', value: r.group },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
