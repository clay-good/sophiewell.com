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

// spec-v752: the first labeled number in a result is the answer -- it is what
// the reader opened the tile for -- so it is set as a headline rather than as
// the first line of a list, and a free band/interpretation line renders as a
// pill beside it. Everything after that is unchanged.
//
// The <li> TEXT is identical either way: the headline is still one <li>, and
// the string it carries is the same `Label: Value Units` join, split across
// spans. The spec-v9 numeric-correctness sweep reads textContent, and
// formatCopyAll is untouched, so both see exactly what they saw before.
function headlineLi(it) {
  const node = el('li', { class: 'result-primary' });
  node.appendChild(el('span', { class: 'rp-label', text: `${it.label}: ` }));
  node.appendChild(el('span', { class: 'rp-value', text: String(it.value) }));
  if (it.units) node.appendChild(el('span', { class: 'rp-units', text: ` ${it.units}` }));
  return node;
}

export function resultRow(o, items) {
  const rows = items.filter(Boolean);
  // The headline is the first item that is a labeled number. A tile whose first
  // item is a band (many scoring tiles lead with the interpretation) keeps the
  // band first and promotes the number that follows it.
  const headlineIndex = rows.findIndex((it) => it.text === undefined && it.label !== undefined);
  o.appendChild(el('ul', {}, rows.map((it, i) => {
    if (i === headlineIndex) return headlineLi(it);
    const text = it.text !== undefined
      ? it.text
      : (it.units ? `${it.label}: ${it.value} ${it.units}` : `${it.label}: ${it.value}`);
    const cls = it.text !== undefined
      ? `result-band${it.cls ? ` ${it.cls}` : ''}`
      : (it.cls || null);
    return li(text, cls);
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
