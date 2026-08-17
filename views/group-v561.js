// spec-v561: renderer for the Shoulder Pain and Disability Index. Group G. The two subscales get their own
// h2 headings carrying the instrument's own stems (never h3 - an h3 under the page h1 is a heading-level
// skip).
//
// The intro states the mean-of-subscales rule and its weighting consequence up front, because thirteen
// items on one 0-10 scale look like a single questionnaire and inviting the reader to sum them over 130 is
// the failure mode this instrument has (lib/spadi-v561.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports self-reported
// pain and function; it never diagnoses the cause and never indicates imaging or surgery.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/spadi-v561.js';
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

const SCALE = Array.from({ length: 11 }, (_, i) => [String(i), String(i)]);

export const renderers = {
  spadi(root) {
    note(root, 'The SPADI has 13 items in two subscales, each rated 0-10. The total is the MEAN of the two subscale percentages — not the sum of all 13 items over 130, which gives a different and wrong answer. Five pain items therefore carry half the total and eight disability items the other half, so one pain item is worth 1.6 times one disability item. All 13 items are required: the published rules for handling omissions disagree with one another, so only complete forms are scored.');

    heading(root, 'Pain subscale (5 items)');
    note(root, M.PAIN_ANCHORS);
    for (const item of M.SPADI_PAIN_ITEMS) {
      root.appendChild(select(item.text, `spadi-${item.key}`, SCALE));
    }

    heading(root, 'Disability subscale (8 items)');
    note(root, M.DISABILITY_ANCHORS);
    for (const item of M.SPADI_DISABILITY_ITEMS) {
      root.appendChild(select(item.text, `spadi-${item.key}`, SCALE));
    }

    const o = out(); root.appendChild(o);
    wire(M.SPADI_ITEMS.map((i) => `spadi-${i.key}`), () => safe(o, () => {
      const input = {};
      for (const item of M.SPADI_ITEMS) input[item.key] = val(`spadi-${item.key}`);
      const r = M.spadi(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'SPADI total', value: `${r.total}%` },
        { label: 'Pain subscale', value: `${r.painPercent}% (${r.painSum} of ${M.PAIN_MAX})` },
        { label: 'Disability subscale', value: `${r.disabilityPercent}% (${r.disabilitySum} of ${M.DISABILITY_MAX})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
