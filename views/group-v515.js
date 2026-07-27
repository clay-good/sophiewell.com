// spec-v515: renderer for the Simpson-Angus Scale (SAS). Group G. Ten examination selects, each 0-4,
// reported as the mean item score with the total alongside it.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Section headings are h2, never h3
// (an h3 under the page h1 is a heading-level skip). Per spec-v11 section 5.3 the tile sums the ratings an
// examiner assigns; it never asserts a diagnosis or an indication to change a medication
// (lib/simpson-angus-v515.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/simpson-angus-v515.js';
import { resultRow } from '../lib/result-copy.js';

const SCALE = [
  ['0', '0 - normal'],
  ['1', '1 - slight'],
  ['2', '2 - mild'],
  ['3', '3 - moderate'],
  ['4', '4 - severe'],
];

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The medication decision stays with the prescriber.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'simpson-angus'(root) {
    note(root, 'The Simpson-Angus Scale for drug-induced parkinsonism. Rate ten examination items 0 (normal) to 4 (severe). The scale is conventionally reported as the mean item score, not the total, and a mean above 0.3 is the threshold in common use; both numbers are shown below so the two cannot be confused. It does not rate akathisia or tardive dyskinesia, which have their own scales.');

    const ids = [];
    M.SAS_ITEMS.forEach((label, i) => {
      const id = `sa-q${i + 1}`;
      ids.push(id);
      root.appendChild(select(`${i + 1}. ${label}`, id, SCALE));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`q${i + 1}`] = val(id); });
      const r = M.simpsonAngus(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Mean item score', value: r.mean.toFixed(2) },
        { label: 'Total', value: `${r.total} of 40` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
