// spec-v525: renderer for the Cornell Assessment of Pediatric Delirium (CAPD). Group G. Eight selects, each
// carrying its OWN anchor list: items 1-4 (preserved function) run never=4 to always=0, items 5-8 (abnormal
// behavior) run never=0 to always=4. One shared option list would invert half the instrument.
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Section headings, if any, are h2 and never h3 (an h3 under
// the page h1 is a heading-level skip). Per spec-v11 section 5.3 the tile sums what an observer rates; it
// never asserts a diagnosis, a cause, or an indication for antipsychotics, a sedation change, or restraint
// (lib/capd-v525.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/capd-v525.js';
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the PICU team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'capd'(root) {
    note(root, 'The Cornell Assessment of Pediatric Delirium, eight observations over a nursing shift. The anchors are reversed between the two halves: items 1 to 4 ask about preserved function, so never scores 4, while items 5 to 8 ask about abnormal behavior, so never scores 0. Each select below already carries its own anchors. Total 0 to 32, and 9 or more is the positive screen. Rate every item against the child’s own developmental baseline.');

    const ids = [];
    M.CAPD_ITEMS.forEach((item, i) => {
      const id = `capd-${item.key}`;
      ids.push(id);
      root.appendChild(select(`${i + 1}. ${item.text}`, id, item.options.map((o) => [o.value, o.text])));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.CAPD_ITEMS) args[item.key] = val(`capd-${item.key}`);
      const r = M.capd(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
