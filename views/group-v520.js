// spec-v520: renderer for the Spigelman classification of duodenal polyposis in FAP. Group G. Four selects,
// each 1-3 points, under two h2 section headings separating what the endoscopist scores from what the
// pathologist scores (never h3 - an h3 under the page h1 is a heading-level skip).
//
// There is deliberately NO zero option on any select: the Spigelman table has no zero row, so stage 0 means
// no duodenal adenomas were found at all rather than four zeros. The copy says so, and the tile refuses to
// invent an option the source does not define (lib/spigelman-v520.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a severity stage;
// it never emits a surveillance interval and never indicates resection or duodenal surgery.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/spigelman-v520.js';
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

const ENDOSCOPIC = new Set(['number', 'size']);

export const renderers = {
  'spigelman'(root) {
    note(root, 'The Spigelman classification of duodenal polyposis in familial adenomatous polyposis: four parameters, each worth 1 to 3 points, totaling 4 to 12. Stage 0 is 0 points, I is 1 to 4, II is 5 to 6, III is 7 to 8, IV is 9 to 12. No parameter has a zero row, so once any adenoma is present the lowest reachable total is 4 — stage 0 means no duodenal adenomas were found at all. It is a severity stage, not a surveillance interval.');

    const ids = [];
    heading(root, 'Scored at endoscopy');
    for (const item of M.SPIGELMAN_ITEMS.filter((i) => ENDOSCOPIC.has(i.key))) {
      const id = `spig-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    }

    heading(root, 'Scored on the biopsy');
    for (const item of M.SPIGELMAN_ITEMS.filter((i) => !ENDOSCOPIC.has(i.key))) {
      const id = `spig-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.SPIGELMAN_ITEMS) args[item.key] = val(`spig-${item.key}`);
      const r = M.spigelman(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 12` },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
