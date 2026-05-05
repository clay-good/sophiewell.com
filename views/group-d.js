// Group D: Provider and Plan Lookup (24-26).

import { el, clear } from '../lib/dom.js';
import { loadAllShards, loadFile } from '../lib/data.js';
import { buildIndex } from '../lib/search.js';
import { isValidNPI } from '../lib/codes.js';
import { validateDEA } from '../lib/dea.js';

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

  // --- spec-v4 §5: Group D extensions (utilities 115-116) ---------------

  'dea-validator'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'Validator only. A passing checksum does not confirm the registrant is licensed or authorized for any controlled substance. ' +
      'DEA validation is not license verification.' }));
    root.appendChild(input('DEA registration number (2 letters + 7 digits)', 'dea-q'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    document.getElementById('dea-q').addEventListener('input', (e) => {
      clear(out);
      const raw = String(e.target.value || '').trim();
      if (!raw) return;
      const r = validateDEA(raw);
      out.appendChild(el('h2', { text: r.ok ? `${r.input}: VALID checksum` : `${raw.toUpperCase()}: INVALID` }));
      if (r.error) out.appendChild(el('p', { text: r.error }));
      if (r.digits) {
        out.appendChild(el('h3', { text: 'Checksum trace' }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Registrant letter: ${r.registrant}` }),
          el('li', { text: `Last-name initial: ${r.nameInitial}` }),
          el('li', { text: `Digits: ${r.digits.slice(0, 6).join(' ')} | check ${r.digits[6]}` }),
          el('li', { text: `sum1 = d1+d3+d5 = ${r.digits[0]}+${r.digits[2]}+${r.digits[4]} = ${r.sum1}` }),
          el('li', { text: `sum2 = d2+d4+d6 = ${r.digits[1]}+${r.digits[3]}+${r.digits[5]} = ${r.sum2}` }),
          el('li', { text: `total = sum1 + 2*sum2 = ${r.total}` }),
          el('li', { text: `expected check digit = total mod 10 = ${r.expectedCheckDigit}` }),
          el('li', { text: `got check digit = ${r.gotCheckDigit}` }),
        ]));
      }
    });
  },

  'nucc-taxonomy'(root) {
    root.appendChild(input('NUCC taxonomy code (10 characters) or text', 'tx-q'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('nucc-taxonomy', 'taxonomy.json').then((rows) => {
      const idx = buildIndex(rows, { codeKey: 'code', textKeys: ['type', 'classification', 'specialization'] });
      const update = (q) => {
        clear(out);
        const found = idx.search(q, 50);
        if (!found.length) { out.appendChild(el('p', { class: 'muted', text: 'No results.' })); return; }
        for (const r of found) {
          out.appendChild(el('article', { class: 'result-card' }, [
            el('h3', { text: r.code }),
            el('p', { text: r.type }),
            el('p', { class: 'muted', text: `${r.classification}${r.specialization ? ' - ' + r.specialization : ''}` }),
          ]));
        }
      };
      update('');
      document.getElementById('tx-q').addEventListener('input', (e) => update(e.target.value));
    });
  },
};
