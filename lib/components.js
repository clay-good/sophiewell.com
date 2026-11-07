// Design-system wave 2 (docs/design.md §5): shared DOM builders for the modern
// component set. Built with lib/dom.js el() -- no HTML strings. Only builders a
// view actually consumes live here; the status-chip and stat-grid builders land
// with their calculator consumers in a later wave.
import { el, clear } from './dom.js';
import { geometry, describe, VIEW } from './plot.js';

// Wrap a native <input type="file"> in the shared .dropzone card. The input
// stays the real, accessible control (keyboard and assistive tech reach it
// directly); the card is the visible target, adds drag-and-drop, and lists the
// chosen files as removable chips. A drop assigns the files to the input and
// dispatches a native 'change', so the caller's existing change handler is the
// one code path for both choosing and dropping -- the worker parse, size limit,
// and "stays in this tab" guarantees are untouched. Returns the dropzone element
// to append where the input used to go.
export function dropzone(input, { hint = 'Drag and drop here, or choose below.' } = {}) {
  const zone = el('div', { class: 'dropzone' });
  zone.appendChild(el('span', { class: 'dropzone-icon', 'aria-hidden': 'true', text: '⬆' }));
  if (hint) zone.appendChild(el('p', { class: 'dropzone-hint', text: hint }));
  zone.appendChild(input);
  const fileList = el('div', { class: 'dropzone-files' });
  zone.appendChild(fileList);

  // Assigning input.files needs a DataTransfer; where it is unavailable the
  // native picker still works, so a failed assign degrades, it does not throw.
  const setFiles = (files) => {
    try {
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      input.files = dt.files;
    } catch { return false; }
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drop-active'); });
  zone.addEventListener('dragleave', (e) => { if (e.target === zone) zone.classList.remove('drop-active'); });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drop-active');
    const dropped = e.dataTransfer && e.dataTransfer.files;
    if (dropped && dropped.length) setFiles(dropped);
  });

  // Reflect the current selection as input chips on every change (pick or drop).
  input.addEventListener('change', () => {
    clear(fileList);
    const chosen = [...(input.files || [])];
    chosen.forEach((file, index) => {
      const chip = el('span', { class: 'chip chip--input' });
      chip.appendChild(el('span', { class: 'chip-name', text: file.name }));
      const remove = el('button', {
        type: 'button', class: 'chip-remove', 'aria-label': `Remove ${file.name}`, text: '✕',
      });
      remove.addEventListener('click', () => {
        if (!setFiles(chosen.filter((_, i) => i !== index))) {
          input.value = '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      chip.appendChild(remove);
      fileList.appendChild(chip);
    });
  });

  return zone;
}

// Render a <select> as a segmented control WITHOUT disturbing the value model.
// The select stays in the DOM as the single source of truth -- visually hidden
// but a real form control -- so trackHashState still serializes it, applyExample
// and applyHashState still set its .value, and the tile's compute (wired to the
// select's change event) is untouched. The buttons are a view over it: a click
// sets select.value and dispatches input+change (driving compute), and the
// buttons mirror the select's value on every change (so a loaded example or a
// deep link updates them too). Use only for 2-4 short, mutually exclusive
// options; keep a plain <select> for long or open lists. Mutates in place and
// returns the radiogroup.
export function segmentedFromSelect(select, { ariaLabel } = {}) {
  select.classList.add('visually-hidden');
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;

  // Name the radiogroup from the field's own label when none is passed, so the
  // control is announced the same as the <select> it replaces.
  const labelNode = (select.labels && select.labels[0])
    || (select.parentElement && [...select.parentElement.querySelectorAll('label')]
      .find((l) => !l.getAttribute('for') || l.getAttribute('for') === select.id));
  const label = ariaLabel || (labelNode && labelNode.textContent) || null;

  const group = el('div', { class: 'segmented', role: 'radiogroup', 'aria-label': label });
  // A leading blank/placeholder option stays in the <select> (so "nothing
  // chosen yet" is still representable and deep-links to it) but gets no button.
  const options = [...select.options].filter((o) => o.value !== '');
  const buttons = options.map((opt) => {
    const b = el('button', { type: 'button', role: 'radio', text: opt.textContent });
    b.dataset.value = opt.value;
    b.addEventListener('click', () => choose(opt.value, true));
    group.appendChild(b);
    return b;
  });

  const sync = () => {
    buttons.forEach((b) => {
      const on = b.dataset.value === select.value;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (!buttons.some((b) => b.getAttribute('aria-checked') === 'true') && buttons[0]) buttons[0].tabIndex = 0;
  };

  function choose(value, focus) {
    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      sync();
    }
    if (focus) { const b = buttons.find((x) => x.dataset.value === value); if (b) b.focus(); }
  }

  group.addEventListener('keydown', (e) => {
    const n = options.length;
    const idx = Math.max(0, buttons.findIndex((b) => b.getAttribute('aria-checked') === 'true'));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose(options[(idx + 1) % n].value, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose(options[(idx - 1 + n) % n].value, true); }
  });

  // External updates (applyExample / applyHashState) set select.value and
  // dispatch change -- mirror them onto the buttons.
  select.addEventListener('change', sync);
  select.addEventListener('input', sync);
  sync();

  select.after(group);
  return group;
}

// A status chip naming a result band at a glance. `severity` is one of
// low|moderate|high|critical (drives the color token); `label` is the band word
// that always accompanies it, so the chip is never color-only. The severity is
// authored by the caller from the band the compute already decided -- it adds no
// threshold and changes no value. Append it next to the answer line.
export function statusChip(severity, label) {
  const chip = el('span', { class: 'chip chip--status', 'data-severity': severity });
  chip.appendChild(el('span', { class: 'chip-dot', 'aria-hidden': 'true' }));
  chip.appendChild(el('span', { text: label }));
  return chip;
}

// Render labeled numbers as the shared stat grid (docs/design.md 5, "Metric/
// stat tile"): one cell per number, the value large and its label as the
// caption under it, so a tile with several outputs reads as a panel of numbers
// instead of a stack of sentences. Each cell is
// `{ label, value, units?, cls?, primary? }` -- the same item shape the result
// list takes, so a caller opts in without restating its numbers. `primary`
// marks the answer the reader came for (larger value, accent edge). The cell
// text carries the same characters the list row did, so the numeric-correctness
// sweep and the copy payload are untouched.
export function statGrid(cells) {
  const grid = el('div', { class: 'stat-grid' });
  for (const c of cells) {
    const cls = ['stat', c.primary ? 'stat--primary' : null, c.cls || null].filter(Boolean).join(' ');
    const cell = el('div', { class: cls });
    const value = el('div', { class: 'stat-value', text: String(c.value) });
    if (c.units) value.appendChild(el('span', { class: 'stat-units', text: ` ${c.units}` }));
    cell.appendChild(value);
    cell.appendChild(el('div', { class: 'stat-label', text: c.label }));
    grid.appendChild(cell);
  }
  return grid;
}

// The shared plot (docs/design.md 4, "Plot"): an inline SVG of one or more line series, drawn from lib/plot.js's
// geometry, with every number also in a `.lookup-table` inside a `<details>` so a screen reader, a printout and
// a reader who wants the figures get them. The SVG is `role="img"` with a text alternative naming what is plotted
// and its range. Colors come from token-backed classes (`.plot-line--0` ...), never inline. A plot is never the
// only place a number appears, and no answer depends on it.
// plot({ title, xLabel, yLabel, series: [{ label, points: [[x, y], ...] }], table: { headers, rows }, xLog })
// -> a <figure>, or null when there is nothing to draw.
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}, text) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = text;
  return n;
}
export function plot({ title, xLabel, yLabel, series, table, xLog = false, yFromZero = true }) {
  const g = geometry({ series, xLog, yFromZero });
  if (g.error) return null;
  const fig = el('figure', { class: 'plot' });
  const svg = svgEl('svg', { viewBox: `0 0 ${VIEW.width} ${VIEW.height}`, role: 'img', 'aria-label': describe(title, xLabel, yLabel, g), class: 'plot-svg' });
  const { box } = g;
  for (const t of g.yTicks) {
    svg.appendChild(svgEl('line', { x1: box.x, x2: box.x + box.w, y1: t.at, y2: t.at, class: 'plot-grid' }));
    svg.appendChild(svgEl('text', { x: box.x - 4, y: t.at + 3, 'text-anchor': 'end', class: 'plot-tick' }, t.label));
  }
  for (const t of g.xTicks) svg.appendChild(svgEl('text', { x: t.at, y: box.y + box.h + 12, 'text-anchor': 'middle', class: 'plot-tick' }, t.label));
  svg.appendChild(svgEl('line', { x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, class: 'plot-axis' }));
  svg.appendChild(svgEl('line', { x1: box.x, x2: box.x, y1: box.y, y2: box.y + box.h, class: 'plot-axis' }));
  svg.appendChild(svgEl('text', { x: box.x + box.w / 2, y: VIEW.height - 4, 'text-anchor': 'middle', class: 'plot-label' }, xLabel));
  g.paths.forEach((d, i) => { if (d) svg.appendChild(svgEl('path', { d, class: `plot-line plot-line--${i % 3}` })); });
  fig.appendChild(svg);
  const cap = el('figcaption', { class: 'plot-caption' });
  cap.appendChild(el('span', { text: `${title}. ${yLabel} against ${xLabel}.` }));
  if (series.length > 1) {
    for (const [i, s] of series.entries()) {
      const key = el('span', { class: 'plot-key' });
      key.appendChild(el('span', { class: `plot-swatch plot-swatch--${i % 3}`, 'aria-hidden': 'true' }));
      key.appendChild(el('span', { text: s.label }));
      cap.appendChild(key);
    }
  }
  fig.appendChild(cap);
  if (table && table.rows && table.rows.length) {
    const det = el('details', { class: 'plot-values' });
    det.appendChild(el('summary', { text: 'The values plotted' }));
    const scroll = el('div', { class: 'table-scroll' });
    const t = el('table', { class: 'lookup-table' });
    const head = el('tr');
    for (const h of table.headers) head.appendChild(el('th', { scope: 'col', text: h }));
    t.appendChild(el('thead', null, [head]));
    const body = el('tbody');
    for (const row of table.rows) {
      const tr = el('tr');
      for (const c of row) tr.appendChild(el('td', { text: String(c) }));
      body.appendChild(tr);
    }
    t.appendChild(body);
    scroll.appendChild(t);
    det.appendChild(scroll);
    fig.appendChild(det);
  }
  return fig;
}
