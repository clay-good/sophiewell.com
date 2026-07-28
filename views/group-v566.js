// spec-v566: renderer for the NIH Chronic Prostatitis Symptom Index. Group G. One h2 per subscale (never
// h3 - an h3 under the page h1 is a heading-level skip).
//
// Each item's select is built from ITS OWN option list, because the ranges are heterogeneous: six yes/no
// items, two 0-3, three 0-5, one 0-6, one 0-10. A shared list would misrepresent every item but one
// (lib/nih-cpsi-v566.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports symptoms; it
// never diagnoses prostatitis and never indicates antibiotics.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nih-cpsi-v566.js';
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

const SECTIONS = [
  { key: 'pain', title: 'Pain or discomfort (0-21)' },
  { key: 'urinary', title: 'Urination (0-10)' },
  { key: 'qol', title: 'Impact of symptoms and quality of life (0-12)' },
];

export const renderers = {
  'nih-cpsi'(root) {
    note(root, 'Nine numbered questions but 13 scored items — question 1 has four yes/no sub-parts and question 2 has two, so 4 + 2 + 7 = 13. Both counts describe the same instrument. Note that the item ranges differ a lot: the average-pain rating alone is 10 of the 43 points, worth ten times any one yes/no item. All answers refer to the last week.');

    for (const section of SECTIONS) {
      heading(root, section.title);
      for (const item of M.CPSI_ITEMS.filter((i) => i.subscale === section.key)) {
        root.appendChild(select(`${item.question}. ${item.text}`, `cpsi-${item.key}`,
          item.options.map((o) => [String(o.value), `${o.value} — ${o.text}`])));
      }
    }

    const o = out(); root.appendChild(o);
    wire(M.CPSI_ITEMS.map((i) => `cpsi-${i.key}`), () => safe(o, () => {
      const input = {};
      for (const item of M.CPSI_ITEMS) input[item.key] = val(`cpsi-${item.key}`);
      const r = M.nihCpsi(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Total', value: `${r.total} of ${r.max}` },
        { label: 'Subscales', value: `pain ${r.pain}/${r.subscaleMaxima.pain}, urinary ${r.urinary}/${r.subscaleMaxima.urinary}, quality of life ${r.qol}/${r.subscaleMaxima.qol}` },
        { label: 'Severity band', value: `${r.band} (from a later cohort, not the original paper)` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
