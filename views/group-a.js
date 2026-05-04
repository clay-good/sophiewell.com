// Group A: Code Lookup utilities (1-12).
//
// Each utility uses the reusable code-search component.
// Detail views are rendered into a shared output region with a permalink in
// the URL hash (sub-route after a slash, e.g., #icd10/I10).

import { el, clear } from '../lib/dom.js';
import { loadAllShards, loadFile, loadManifest } from '../lib/data.js';
import { buildIndex } from '../lib/search.js';
import { normalizeNDC } from '../lib/codes.js';

function inputBlock(labelText, id, type = 'search', placeholder = '') {
  return el('p', {}, [
    el('label', { for: id, text: labelText }),
    el('br'),
    el('input', { id, type, autocomplete: 'off', spellcheck: 'false', placeholder }),
  ]);
}

function resultsList(results, renderItem) {
  const ul = el('ul', { class: 'result-list', role: 'list' });
  for (const r of results) ul.appendChild(el('li', {}, [renderItem(r)]));
  return ul;
}

function searchableLookup({ root, dataset, codeKey, textKeys, renderRow, renderDetail, hashPrefix }) {
  const input = inputBlock('Search by code or phrase', 'q');
  const results = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  const detail = el('div', { id: 'q-detail' });
  root.appendChild(input);
  root.appendChild(results);
  root.appendChild(detail);

  let index = null;

  const run = (q) => {
    if (!index) return;
    clear(results);
    const found = index.search(q, 50);
    if (found.length === 0) {
      results.appendChild(el('p', { class: 'muted', text: 'No results.' }));
      return;
    }
    results.appendChild(resultsList(found, (r) => {
      const codeStr = String(r[codeKey] || '');
      const link = el('a', { href: `#${hashPrefix}/${encodeURIComponent(codeStr)}`, text: codeStr });
      const wrap = el('span', {}, [link, document.createTextNode(' ')]);
      const meta = renderRow ? renderRow(r) : el('span', { class: 'muted', text: textKeys.map((k) => r[k]).filter(Boolean).join(' - ') });
      wrap.appendChild(meta);
      return wrap;
    }));
  };

  loadAllShards(dataset).then((records) => {
    index = buildIndex(records, { codeKey, textKeys });
    const sub = decodeURIComponent((window.location.hash.split('/')[1] || '')).toUpperCase();
    if (sub) {
      const r = index.byCode.get(sub);
      if (r) { clear(detail); detail.appendChild(renderDetail(r)); return; }
    }
    run('');
  }).catch((err) => {
    results.appendChild(el('p', { class: 'muted', text: `Failed to load data: ${err.message}` }));
  });

  document.getElementById('q').addEventListener('input', (e) => {
    run(e.target.value);
    detail.replaceChildren();
  });

  // Click on a result link updates detail too.
  results.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const code = decodeURIComponent(a.textContent || '').toUpperCase();
    const r = index && index.byCode.get(code);
    if (r) {
      clear(detail);
      detail.appendChild(renderDetail(r));
      window.history.replaceState(null, '', `#${hashPrefix}/${encodeURIComponent(code)}`);
    }
  });
}

// --- Crosswalk-style direct-table lookup for POS, modifier, revenue, CARC, RARC.
function crosswalkLookup({ root, dataset, file, codeKey = 'code', textKeys = ['desc', 'name'], hashPrefix }) {
  const input = inputBlock('Search by code or phrase', 'q');
  const results = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  root.appendChild(input);
  root.appendChild(results);

  loadFile(dataset, file).then((records) => {
    const index = buildIndex(records, { codeKey, textKeys });
    const update = (q) => {
      clear(results);
      const list = index.search(q, 100);
      if (list.length === 0) { results.appendChild(el('p', { class: 'muted', text: 'No results.' })); return; }
      const tbl = el('table', { class: 'lookup-table' });
      const thead = el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Code' }), el('th', { scope: 'col', text: 'Description' })])]);
      const tbody = el('tbody');
      for (const r of list) {
        const desc = textKeys.map((k) => r[k]).filter(Boolean).join(' - ');
        tbody.appendChild(el('tr', {}, [el('td', { text: String(r[codeKey]) }), el('td', { text: desc })]));
      }
      tbl.appendChild(thead); tbl.appendChild(tbody);
      results.appendChild(tbl);
    };
    update('');
    document.getElementById('q').addEventListener('input', (e) => update(e.target.value));
  }).catch((err) => {
    results.appendChild(el('p', { class: 'muted', text: `Failed to load data: ${err.message}` }));
  });
}

// --- Per-utility renderers ----------------------------------------------

export const renderers = {
  icd10(root) {
    searchableLookup({
      root, dataset: 'icd10cm', codeKey: 'code', textKeys: ['desc'], hashPrefix: 'icd10',
      renderDetail: (r) => el('section', {}, [
        el('h2', { text: r.code }),
        el('p', { text: r.desc }),
        el('p', { class: 'muted', text: 'Source: CMS / NCHS public-domain ICD-10-CM tabular list.' }),
      ]),
    });
  },

  hcpcs(root) {
    searchableLookup({
      root, dataset: 'hcpcs', codeKey: 'code', textKeys: ['short', 'long'], hashPrefix: 'hcpcs',
      renderDetail: (r) => el('section', {}, [
        el('h2', { text: r.code }),
        el('p', {}, [el('strong', { text: 'Short: ' }), document.createTextNode(r.short || '')]),
        el('p', {}, [el('strong', { text: 'Long: ' }), document.createTextNode(r.long || '')]),
        el('p', { class: 'muted', text: 'Source: CMS public-domain HCPCS Level II.' }),
      ]),
    });
  },

  cpt(root) {
    // Per spec section 5: NEVER show AMA descriptors. Resolve via HCPCS first,
    // then MPFS structural data + original plain-English category summary,
    // then a link to the AMA's free public CPT lookup with the code prefilled.
    root.appendChild(el('p', { class: 'notice', text:
      'CPT code descriptors are owned by the American Medical Association and are not bundled here. ' +
      'This tool shows the structural Medicare data (status code, global period, RVU components) and an original ' +
      'plain-English category summary. For the official CPT descriptor, use the AMA\'s free public CPT lookup linked below.' }));
    const input = inputBlock('Enter a five-digit CPT code', 'q', 'search', 'e.g. 99213');
    const detail = el('div', { id: 'q-detail' });
    root.appendChild(input);
    root.appendChild(detail);

    Promise.all([
      loadAllShards('hcpcs'),
      loadAllShards('mpfs'),
      loadFile('cpt-summaries', 'summaries.json'),
    ]).then(([hcpcs, mpfs, summaries]) => {
      const hcpcsIdx = new Map(hcpcs.map((r) => [r.code, r]));
      const mpfsIdx = new Map(mpfs.map((r) => [r.code, r]));
      document.getElementById('q').addEventListener('input', (e) => {
        const code = String(e.target.value || '').trim().toUpperCase();
        clear(detail);
        if (!/^\d{4}[0-9A-Z]$/.test(code)) {
          detail.appendChild(el('p', { class: 'muted', text: 'Enter a five-character code (five digits, or four digits and a letter).' }));
          return;
        }
        // HCPCS first.
        if (hcpcsIdx.has(code)) {
          const r = hcpcsIdx.get(code);
          detail.appendChild(el('h2', { text: code }));
          detail.appendChild(el('p', { class: 'muted', text: 'Resolved as HCPCS Level II.' }));
          detail.appendChild(el('p', {}, [el('strong', { text: 'Short: ' }), document.createTextNode(r.short || '')]));
          detail.appendChild(el('p', {}, [el('strong', { text: 'Long: ' }), document.createTextNode(r.long || '')]));
          return;
        }
        // MPFS structural row.
        if (mpfsIdx.has(code)) {
          const r = mpfsIdx.get(code);
          detail.appendChild(el('h2', { text: code }));
          detail.appendChild(el('p', { class: 'muted', text: 'CMS Medicare Physician Fee Schedule structural row.' }));
          detail.appendChild(el('ul', {}, [
            el('li', { text: `Status code: ${r.statusCode}` }),
            el('li', { text: `Global period: ${r.globalPeriod}` }),
            el('li', { text: `Work RVU: ${r.workRvu}` }),
            el('li', { text: `PE RVU (facility): ${r.peRvuFacility}` }),
            el('li', { text: `PE RVU (non-facility): ${r.peRvuNonFacility}` }),
            el('li', { text: `Malpractice RVU: ${r.mpRvu}` }),
          ]));
        }
        // Plain-English category summary.
        const summary = pickSummary(summaries, code);
        if (summary) {
          detail.appendChild(el('h3', { text: `Category: ${summary.family}` }));
          detail.appendChild(el('p', { text: summary.summary }));
          detail.appendChild(el('p', { class: 'muted', text: `Code range: ${summary.range}. Original plain-English summary by the project author. MIT-licensed. Not derived from AMA descriptors.` }));
        }
        // AMA link-out.
        detail.appendChild(el('p', {}, [
          el('a', {
            href: `https://www.ama-assn.org/practice-management/cpt/cpt-search?cpt=${encodeURIComponent(code)}`,
            rel: 'noopener',
            text: 'Open this code in the AMA\'s free public CPT lookup',
          }),
        ]));
      });
    }).catch((err) => {
      detail.appendChild(el('p', { class: 'muted', text: `Failed to load data: ${err.message}` }));
    });
  },

  ndc(root) {
    const input = inputBlock('Enter NDC (any standard format) or drug name', 'q');
    const status = el('p', { class: 'muted', id: 'ndc-status' });
    const results = el('div', { id: 'q-results' });
    root.appendChild(input);
    root.appendChild(status);
    root.appendChild(results);

    loadAllShards('ndc').then((records) => {
      const index = buildIndex(records, { codeKey: 'ndc', textKeys: ['proprietary', 'nonproprietary'] });
      document.getElementById('q').addEventListener('input', (e) => {
        const q = e.target.value.trim();
        clear(results);
        clear(status);
        if (!q) return;
        const norm = normalizeNDC(q);
        if (norm) {
          status.appendChild(document.createTextNode(`Normalized: ${norm.formatted} (canonical 11-digit ${norm.canonical}, parsed as ${norm.originalFormat}).`));
        }
        const found = index.search(norm ? norm.formatted : q, 50);
        if (found.length === 0) {
          results.appendChild(el('p', { class: 'muted', text: 'No matching products.' }));
          return;
        }
        for (const r of found) {
          results.appendChild(el('article', { class: 'result-card' }, [
            el('h3', { text: r.proprietary }),
            el('p', { class: 'muted', text: `${r.nonproprietary} - ${r.form} - ${r.route}` }),
            el('p', { class: 'muted', text: `NDC ${r.ndc} - Labeler ${r.labeler} - ${r.marketingStatus}` }),
          ]));
        }
      });
    }).catch((err) => {
      results.appendChild(el('p', { class: 'muted', text: `Failed to load data: ${err.message}` }));
    });
  },

  'pos-codes': (root) => crosswalkLookup({ root, dataset: 'crosswalks', file: 'pos-codes.json', textKeys: ['name', 'desc'], hashPrefix: 'pos-codes' }),
  'modifier-codes': (root) => crosswalkLookup({ root, dataset: 'crosswalks', file: 'modifier-codes.json', textKeys: ['name'], hashPrefix: 'modifier-codes' }),
  'revenue-codes': (root) => crosswalkLookup({ root, dataset: 'crosswalks', file: 'revenue-codes.json', textKeys: ['name'], hashPrefix: 'revenue-codes' }),
  carc: (root) => crosswalkLookup({ root, dataset: 'crosswalks', file: 'carc.json', textKeys: ['desc'], hashPrefix: 'carc' }),
  rarc: (root) => crosswalkLookup({ root, dataset: 'crosswalks', file: 'rarc.json', textKeys: ['desc'], hashPrefix: 'rarc' }),

  ncci(root) {
    const a = inputBlock('Column 1 code', 'codeA');
    const b = inputBlock('Column 2 code', 'codeB');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(a); root.appendChild(b); root.appendChild(out);
    loadAllShards('ncci').then((edits) => {
      const idx = new Map();
      for (const e of edits) idx.set(`${e.col1}|${e.col2}`, e);
      const run = () => {
        const ca = document.getElementById('codeA').value.trim().toUpperCase();
        const cb = document.getElementById('codeB').value.trim().toUpperCase();
        clear(out);
        if (!ca || !cb) return;
        const e = idx.get(`${ca}|${cb}`) || idx.get(`${cb}|${ca}`);
        if (!e) {
          out.appendChild(el('p', { text: `No NCCI PTP edit found between ${ca} and ${cb} in the bundled subset.` }));
          return;
        }
        out.appendChild(el('h2', { text: `${e.col1} vs ${e.col2}` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Modifier indicator: ${e.modifierIndicator} (${e.modifierIndicator === '1' ? 'modifier may unbundle' : 'cannot be unbundled'})` }),
          el('li', { text: `Effective date: ${e.effectiveDate}` }),
          el('li', { text: `Rationale: ${e.rationale}` }),
        ]));
      };
      document.getElementById('codeA').addEventListener('input', run);
      document.getElementById('codeB').addEventListener('input', run);
    });
  },

  mue(root) {
    const input = inputBlock('Code', 'q');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(input); root.appendChild(out);
    loadAllShards('mue').then((rows) => {
      const idx = new Map(rows.map((r) => [r.code, r]));
      document.getElementById('q').addEventListener('input', (e) => {
        const c = e.target.value.trim().toUpperCase();
        clear(out);
        if (!c) return;
        const r = idx.get(c);
        if (!r) { out.appendChild(el('p', { text: `No MUE found for ${c} in the bundled subset.` })); return; }
        out.appendChild(el('h2', { text: c }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Maximum units per claim: ${r.maxUnits}` }),
          el('li', { text: `Rationale: ${r.rationale} (code ${r.rationaleCode})` }),
        ]));
      });
    });
  },

  lcd(root) {
    const input = inputBlock('Code', 'q');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(input); root.appendChild(out);
    Promise.all([loadFile('coverage', 'lcd.json'), loadFile('coverage', 'ncd.json')]).then(([lcd, ncd]) => {
      document.getElementById('q').addEventListener('input', (e) => {
        const c = e.target.value.trim().toUpperCase();
        clear(out);
        if (!c) return;
        const lMatches = lcd.filter((p) => (p.codes || []).includes(c));
        const nMatches = ncd.filter((p) => (p.codes || []).includes(c));
        if (lMatches.length === 0 && nMatches.length === 0) {
          out.appendChild(el('p', { text: `No coverage articles found for ${c} in the bundled subset.` }));
          return;
        }
        if (nMatches.length) {
          out.appendChild(el('h2', { text: 'National Coverage Determinations' }));
          for (const p of nMatches) out.appendChild(el('p', { text: `${p.policyId} - ${p.title} (effective ${p.effectiveDate})` }));
        }
        if (lMatches.length) {
          out.appendChild(el('h2', { text: 'Local Coverage Determinations' }));
          for (const p of lMatches) out.appendChild(el('p', { text: `${p.policyId} - ${p.title} - MAC ${p.mac} (effective ${p.effectiveDate})` }));
        }
      });
    });
  },
};

function pickSummary(summaries, code) {
  const n = Number(code.slice(0, 5));
  if (!Number.isFinite(n)) return null;
  for (const s of summaries) {
    const m = s.range.match(/^(\d+)-(\d+)$/);
    if (!m) continue;
    if (n >= Number(m[1]) && n <= Number(m[2])) return s;
  }
  return null;
}
