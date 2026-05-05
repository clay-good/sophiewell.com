// spec-v4 §6: shared table-lookup renderer for small bundled tables.
//
// Config: { columns: [{ key, label }], rows: [object], searchable, sortable,
//          copyableRows, manifestId? }

import { el, clear } from './dom.js';
import { copyText as clipboardCopyText } from './clipboard.js';

// --- Pure helpers ---

export function filterRows(rows, columns, query) {
  if (!query) return rows.slice();
  const q = String(query).toLowerCase();
  return rows.filter((r) =>
    columns.some((c) => String(r[c.key] == null ? '' : r[c.key]).toLowerCase().includes(q))
  );
}

export function sortRows(rows, columns, key, dir) {
  const col = columns.find((c) => c.key === key);
  if (!col) return rows.slice();
  const factor = dir === 'desc' ? -1 : 1;
  // Stable sort: tag with original index first.
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const av = a.r[key];
      const bv = b.r[key];
      const an = Number(av);
      const bn = Number(bv);
      let cmp;
      if (Number.isFinite(an) && Number.isFinite(bn) && String(av).trim() !== '' && String(bv).trim() !== '') {
        cmp = an - bn;
      } else {
        cmp = String(av == null ? '' : av).localeCompare(String(bv == null ? '' : bv));
      }
      if (cmp === 0) return a.i - b.i;
      return cmp * factor;
    })
    .map((x) => x.r);
}

export function formatRowAsTSV(row, columns) {
  return columns.map((c) => {
    const v = row[c.key];
    return v == null ? '' : String(v).replace(/\t/g, ' ').replace(/\n/g, ' ');
  }).join('\t');
}

// --- Render ---

export function renderTable(rootEl, opts) {
  const {
    columns,
    rows,
    searchable = true,
    sortable = true,
    copyableRows = true,
    manifestId,
    emptyText = 'No matches.',
  } = opts;

  let query = '';
  let sortKey = null;
  let sortDir = 'asc';

  clear(rootEl);

  if (manifestId) {
    const stamp = el('p', { class: 'source-stamp', text: `Source: ${manifestId} (loading version...)` });
    rootEl.appendChild(stamp);
    if (typeof fetch === 'function') {
      fetch(`data/${manifestId}/manifest.json`).then((r) => r.json()).then((m) => {
        stamp.textContent = `Source: ${m.label || manifestId}, fetched ${m.fetchDate || ''}`.trim();
      }).catch(() => {});
    }
  }

  if (searchable) {
    const search = el('input', {
      type: 'search',
      class: 'table-search',
      placeholder: 'Filter rows…',
      'aria-label': 'Filter rows',
    });
    search.addEventListener('input', () => {
      query = search.value;
      drawBody();
    });
    rootEl.appendChild(search);
  }

  const table = el('table', { class: 'lookup-table' });
  const thead = el('thead');
  const headRow = el('tr');
  for (const c of columns) {
    const th = el('th', { scope: 'col', text: c.label });
    if (sortable) {
      th.setAttribute('aria-sort', 'none');
      th.tabIndex = 0;
      th.style.cursor = 'pointer';
      const onSort = () => {
        if (sortKey === c.key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortKey = c.key; sortDir = 'asc'; }
        for (const t of headRow.children) t.setAttribute('aria-sort', 'none');
        th.setAttribute('aria-sort', sortDir === 'asc' ? 'ascending' : 'descending');
        drawBody();
      };
      th.addEventListener('click', onSort);
      th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(); } });
    }
    headRow.appendChild(th);
  }
  if (copyableRows) headRow.appendChild(el('th', { scope: 'col', text: '' }));
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  table.appendChild(tbody);
  rootEl.appendChild(table);

  function drawBody() {
    clear(tbody);
    let view = filterRows(rows, columns, query);
    if (sortable && sortKey) view = sortRows(view, columns, sortKey, sortDir);
    if (!view.length) {
      const tr = el('tr');
      tr.appendChild(el('td', { colspan: String(columns.length + (copyableRows ? 1 : 0)), text: emptyText }));
      tbody.appendChild(tr);
      return;
    }
    for (const r of view) {
      const tr = el('tr');
      for (const c of columns) {
        tr.appendChild(el('td', { text: r[c.key] == null ? '' : String(r[c.key]) }));
      }
      if (copyableRows) {
        const btn = el('button', { type: 'button', class: 'row-copy-btn', text: 'Copy' });
        btn.addEventListener('click', async () => {
          const ok = await clipboardCopyText(formatRowAsTSV(r, columns));
          btn.textContent = ok ? 'Copied' : 'Failed';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
        });
        tr.appendChild(el('td', {}, [btn]));
      }
      tbody.appendChild(tr);
    }
  }

  drawBody();
  return { rerender: drawBody, setQuery: (q) => { query = q; drawBody(); } };
}
