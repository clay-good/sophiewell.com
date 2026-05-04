// Group D: Provider and Plan Lookup (24-26).

import { el, clear } from '../lib/dom.js';
import { loadAllShards, loadFile } from '../lib/data.js';
import { buildIndex } from '../lib/search.js';
import { isValidNPI } from '../lib/codes.js';

function input(label, id) {
  const w = el('p', {}, [el('label', { for: id, text: label }), el('br'),
    el('input', { id, type: 'search', autocomplete: 'off', spellcheck: 'false' })]);
  return w;
}

export const renderers = {
  npi(root) {
    root.appendChild(input('Search by NPI or name', 'q'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    Promise.all([
      loadAllShards('npi'),
      loadFile('enforcement', 'oig-exclusions.json'),
      loadFile('enforcement', 'medicare-opt-out.json'),
    ]).then(([npis, oig, optOut]) => {
      const idx = buildIndex(npis, { codeKey: 'npi', textKeys: ['name', 'taxonomy'] });
      const oigByNpi = new Map(oig.map((r) => [r.npi, r]));
      const optByNpi = new Map(optOut.map((r) => [r.npi, r]));
      document.getElementById('q').addEventListener('input', (e) => {
        const q = e.target.value.trim();
        clear(out);
        if (!q) return;
        if (/^\d{10}$/.test(q) && !isValidNPI(q)) {
          out.appendChild(el('p', { class: 'muted', text: 'Ten-digit input failed the NPI Luhn check digit. Search by name instead.' }));
        }
        const found = idx.search(q, 50);
        if (found.length === 0) { out.appendChild(el('p', { text: 'No matches in the bundled subset.' })); return; }
        for (const r of found) {
          const items = [
            el('h3', { text: r.name }),
            el('p', { class: 'muted', text: `NPI ${r.npi} - ${r.taxonomy} - ${r.state} - ${r.status}` }),
          ];
          if (oigByNpi.has(r.npi)) {
            items.push(el('p', { class: 'notice', text: `OIG EXCLUSION: ${oigByNpi.get(r.npi).exclusionType} effective ${oigByNpi.get(r.npi).exclusionDate}` }));
          }
          if (optByNpi.has(r.npi)) {
            const o = optByNpi.get(r.npi);
            items.push(el('p', { class: 'notice', text: `Medicare opt-out: effective ${o.effectiveDate} through ${o.endDate}` }));
          }
          out.appendChild(el('article', { class: 'result-card' }, items));
        }
      });
    }).catch((err) => {
      out.appendChild(el('p', { class: 'muted', text: `Failed to load data: ${err.message}` }));
    });
  },

  oig(root) {
    root.appendChild(input('Search by name or NPI', 'q'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('enforcement', 'oig-exclusions.json').then((rows) => {
      const idx = buildIndex(rows, { codeKey: 'npi', textKeys: ['lastName', 'firstName', 'exclusionType'] });
      document.getElementById('q').addEventListener('input', (e) => {
        const q = e.target.value.trim();
        clear(out);
        if (!q) return;
        const found = idx.search(q, 50);
        if (found.length === 0) { out.appendChild(el('p', { text: 'No matches in the bundled subset.' })); return; }
        const tbl = el('table', { class: 'lookup-table' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Name' }), el('th', { scope: 'col', text: 'NPI' }), el('th', { scope: 'col', text: 'Authority' }), el('th', { scope: 'col', text: 'Date' })])]));
        const tbody = el('tbody');
        for (const r of found) tbody.appendChild(el('tr', {}, [
          el('td', { text: `${r.lastName}, ${r.firstName}` }),
          el('td', { text: r.npi || '-' }),
          el('td', { text: r.exclusionType }),
          el('td', { text: r.exclusionDate }),
        ]));
        tbl.appendChild(tbody);
        out.appendChild(tbl);
      });
    });
  },

  'opt-out'(root) {
    root.appendChild(input('Search by name or NPI', 'q'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('enforcement', 'medicare-opt-out.json').then((rows) => {
      const idx = buildIndex(rows, { codeKey: 'npi', textKeys: ['lastName', 'firstName', 'specialty', 'state'] });
      document.getElementById('q').addEventListener('input', (e) => {
        const q = e.target.value.trim();
        clear(out);
        if (!q) return;
        const found = idx.search(q, 50);
        if (found.length === 0) { out.appendChild(el('p', { text: 'No matches in the bundled subset.' })); return; }
        const tbl = el('table', { class: 'lookup-table' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Name' }), el('th', { scope: 'col', text: 'NPI' }), el('th', { scope: 'col', text: 'Specialty' }), el('th', { scope: 'col', text: 'State' }), el('th', { scope: 'col', text: 'Effective' }), el('th', { scope: 'col', text: 'End' })])]));
        const tbody = el('tbody');
        for (const r of found) tbody.appendChild(el('tr', {}, [
          el('td', { text: `${r.lastName}, ${r.firstName}` }),
          el('td', { text: r.npi || '-' }),
          el('td', { text: r.specialty || '-' }),
          el('td', { text: r.state || '-' }),
          el('td', { text: r.effectiveDate }),
          el('td', { text: r.endDate }),
        ]));
        tbl.appendChild(tbody);
        out.appendChild(tbl);
      });
    });
  },
};
