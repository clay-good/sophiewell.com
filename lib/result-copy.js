// spec-v61 §2 A3: shared chart-ready labeled-copy helper.
//
// A multi-output tile builds its results as items and renders them as a list
// plus a "Copy results" button that pastes clean `Label: Value Units` lines via
// lib/clipboard.js `formatCopyAll` -- instead of the universal "Copy all"
// scraping `innerText` into a chart blob. Each item is one of:
//   { label, value, units?, cls? }  -- a labeled numeric result, or
//   { text, cls? }                  -- a free band / interpretation line.
// The <li> text is byte-identical to a hand-built list, so the spec-v9 numeric-
// correctness sweep is unaffected; the copy payload is the same join the list
// shows. Pure DOM (no innerHTML, no third-party deps).
//
// Extracted from views/group-v11.js so group-e, group-v11, and future view
// modules share one implementation (spec-v61 A3 rollout).

import { el } from './dom.js';
import { copyButton, formatCopyAll } from './clipboard.js';

const li = (text, cls) => el('li', cls ? { class: cls, text } : { text });

export function resultRow(o, items) {
  const rows = items.filter(Boolean);
  o.appendChild(el('ul', {}, rows.map((it) => {
    const text = it.text !== undefined
      ? it.text
      : (it.units ? `${it.label}: ${it.value} ${it.units}` : `${it.label}: ${it.value}`);
    return li(text, it.cls || null);
  })));
  const copyItems = rows.map((it) => (it.text !== undefined
    ? { value: it.text }
    : { label: it.label, value: it.value, units: it.units }));
  const live = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
  o.appendChild(el('p', { class: 'copy-row' }, [
    copyButton(() => formatCopyAll(copyItems), { label: 'Copy results', live }),
    live,
  ]));
}
