// spec-v557: renderer for the modified Severity-Weighted Assessment Tool. Group G. Inputs under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The three area labels are REBUILT on every run from the erythroderma answer, because the source uses
// different lesion vocabularies for the same weights - patch/plaque for erythrodermic disease, mild/moderate
// infiltration otherwise. Fixed labels would ask a question the source does not ask (lib/mswat-v557.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile measures skin burden; it
// never stages the disease and never selects therapy.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mswat-v557.js';
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
function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '100', step: '0.5' }));
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
  mswat(root) {
    note(root, 'mSWAT multiplies the percentage of body surface area involved by each lesion type by that type’s weight — 1, 2, and 4 for tumors or ulcers — and sums the products. The score runs 0 to 400, not 0 to 100: a body wholly covered in tumor scores 4 × 100. Each square centimeter is counted once, in one category only, so the three percentages cannot total more than 100. Area is measured with the patient’s own palm plus fingers as 1% of body surface area.');

    heading(root, 'Form');
    root.appendChild(select('Is the patient erythrodermic? (selects the lesion vocabulary — the weights are the same either way)',
      'mswat-erythrodermic', [['no', 'No'], ['yes', 'Yes']]));

    heading(root, 'Body surface area by lesion type');
    for (const category of M.MSWAT_CATEGORIES) {
      root.appendChild(number(`${category.erythrodermic} / ${category.nonerythrodermic} — % BSA (weight ${category.weight})`, `mswat-${category.key}`));
    }

    const ids = ['mswat-erythrodermic', ...M.MSWAT_CATEGORIES.map((c) => `mswat-${c.key}`)];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { erythrodermic: val('mswat-erythrodermic') };
      for (const category of M.MSWAT_CATEGORIES) input[category.key] = val(`mswat-${category.key}`);
      const r = M.mswat(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'mSWAT', value: `${r.total} of ${r.max}` },
        { label: 'Total involved', value: `${r.totalBsa}% BSA` },
        { label: 'Contributions', value: r.categories.map((c) => `${c.label} ${c.percent}%×${c.weight}=${c.contribution}`).join(', ') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
