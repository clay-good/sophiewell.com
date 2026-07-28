// spec-v558: renderer for the Ocular Surface Disease Index. Group G. Each of the three sections gets its
// own h2 carrying the instrument's stem (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The "not applicable" option is offered ONLY on items 6 to 12, because the first section asks what the
// patient has experienced and is always answerable. Offering it everywhere would let the denominator fall
// below 5, which the instrument does not permit (lib/osdi-v558.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports symptoms; it
// never diagnoses dry eye disease and never selects treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/osdi-v558.js';
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

const SCALE = M.OSDI_OPTIONS.map((o) => [String(o.value), `${o.value} — ${o.text}`]);
const SCALE_WITH_NA = [...SCALE, [M.NOT_APPLICABLE, 'Not applicable']];

export const renderers = {
  osdi(root) {
    note(root, 'The Ocular Surface Disease Index asks 12 questions about the last week. The score is the sum of the answered items × 25, divided by the number of questions answered — so the denominator varies and the score is generally not a whole number. Items 6-12 may be answered “not applicable” and are then excluded from both the sum and the count; items 1-5 cannot.');

    for (const section of M.OSDI_SECTIONS) {
      heading(root, section.stem);
      for (const item of section.items) {
        root.appendChild(select(item.text, `osdi-${item.key}`,
          section.allowsNotApplicable ? SCALE_WITH_NA : SCALE));
      }
    }

    const o = out(); root.appendChild(o);
    wire(M.OSDI_ITEMS.map((i) => `osdi-${i.key}`), () => safe(o, () => {
      const input = {};
      for (const item of M.OSDI_ITEMS) input[item.key] = val(`osdi-${item.key}`);
      const r = M.osdi(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'OSDI', value: `${r.total} of ${r.max}` },
        { label: 'Severity', value: r.band },
        { label: 'Questions answered', value: `${r.questionsAnswered}${r.notApplicable.length ? ` (${r.notApplicable.length} not applicable, excluded)` : ''}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
