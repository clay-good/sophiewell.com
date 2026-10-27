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
import { statusChip, statGrid } from './components.js';
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

// One result row as a list item: a band/interpretation line, or a labeled
// number written as the `Label: Value Units` string the copy payload uses.
function rowLi(it) {
  const text = it.text !== undefined
    ? it.text
    : (it.units ? `${it.label}: ${it.value} ${it.units}` : `${it.label}: ${it.value}`);
  const cls = it.text !== undefined
    ? `result-band${it.cls ? ` ${it.cls}` : ''}`
    : (it.cls || null);
  const node = li(text, cls);
  // A band line may carry an authored severity -> status chip (the chip's
  // label is a short tier word; the band text is unchanged, so the copy
  // payload and the numeric-correctness sweep are untouched).
  if (it.text !== undefined && it.severity && it.severityLabel) {
    node.appendChild(statusChip(it.severity, it.severityLabel));
  }
  return node;
}

const isNumberRow = (it) => it.text === undefined && it.label !== undefined;

// `{ stats: true }` (design-system wave 3.3) renders the labeled numbers as the
// shared stat grid instead of as list rows -- for a tile that outputs several
// numbers at once, where a stack of `Label: Value` sentences buries the one the
// reader wants. Document order is kept: each run of consecutive numbers becomes
// one grid, and band/interpretation lines stay list rows between the grids, so
// a tile that heads a group of numbers with a line still reads in order. The
// first number overall is the primary cell. Opt-in per call; the copy payload
// is built from the items either way, so it does not change.
export function resultRow(o, items, { stats = false } = {}) {
  const rows = items.filter(Boolean);
  if (stats) {
    let primaryTaken = false;
    let i = 0;
    while (i < rows.length) {
      const numeric = isNumberRow(rows[i]);
      const run = [];
      while (i < rows.length && isNumberRow(rows[i]) === numeric) run.push(rows[i++]);
      if (numeric) {
        o.appendChild(statGrid(run.map((it, k) => ({ ...it, primary: !primaryTaken && k === 0 }))));
        primaryTaken = true;
      } else {
        o.appendChild(el('ul', {}, run.map(rowLi)));
      }
    }
    appendCopyRow(o, rows);
    return;
  }
  // The headline is the first item that is a labeled number. A tile whose first
  // item is a band (many scoring tiles lead with the interpretation) keeps the
  // band first and promotes the number that follows it.
  const headlineIndex = rows.findIndex(isNumberRow);
  o.appendChild(el('ul', {}, rows.map((it, i) => (i === headlineIndex ? headlineLi(it) : rowLi(it)))));
  appendCopyRow(o, rows);
}

function appendCopyRow(o, rows) {
  const copyItems = rows.map((it) => (it.text !== undefined
    ? { value: it.text }
    : { label: it.label, value: it.value, units: it.units }));
  const live = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
  o.appendChild(el('p', { class: 'copy-row' }, [
    copyButton(() => formatCopyAll(copyItems), { label: 'Copy results', live }),
    live,
  ]));
}
