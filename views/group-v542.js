// spec-v542: renderer for the TWSTRS severity subscale. Group G. Ten selects under two h2 section headings
// separating maximal excursion from the remaining items (never h3 - an h3 under the page h1 is a
// heading-level skip).
//
// The duration label states that the item is DOUBLED, and the sagittal-deviation label states that
// anterocollis and retrocollis share one slot. Both are structural in the lib - duration carries a weight
// and there is no second sagittal item - so the labels explain behavior rather than asking the reader to
// remember a rule (lib/twstrs-severity-v542.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile rates motor appearance;
// it never diagnoses cervical dystonia and never indicates botulinum toxin.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/twstrs-severity-v542.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'twstrs-severity'(root) {
    note(root, `The severity (motor) subscale of the Toronto Western Spasmodic Torticollis Rating Scale, out of ${M.TWSTRS_SEVERITY_MAX}. This scores the severity subscale only — the full TWSTRS also has a disability subscale out of 30 and a pain subscale out of 20, whose item wording could not be verified to the standard this catalog requires, so they are not implemented rather than shipping a total that resembles the published instrument without being it. Note that duration is rated 0 to 5 and then doubled, and that anterocollis and retrocollis share one slot because a neck cannot be flexed and extended at once.`);

    const ids = [];
    const add = (item) => {
      const id = `twstrs-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    };

    heading(root, 'Maximal excursion (contributes 0 to 12)');
    for (const item of M.TWSTRS_ITEMS.filter((i) => i.group === 'excursion')) add(item);

    heading(root, 'Duration, sensory tricks, and range');
    for (const item of M.TWSTRS_ITEMS.filter((i) => i.group !== 'excursion')) add(item);

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.TWSTRS_ITEMS) args[item.key] = val(`twstrs-${item.key}`);
      const r = M.twstrsSeverity(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Severity subscale', value: `${r.total} of ${r.max}` },
        { label: 'Maximal excursion', value: `${r.excursionSubtotal} of 12` },
        { label: 'Duration', value: `rated ${r.durationRaw} of 5, doubled to ${r.durationPoints} of 10` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
