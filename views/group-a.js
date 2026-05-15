// Group A: Code Lookup utilities (1-12).
//
// Each utility uses the reusable code-search component.
// Detail views are rendered into a shared output region with a permalink in
// the URL hash (sub-route after a slash, e.g., #icd10/I10).

import { el, clear } from '../lib/dom.js';
import { loadAllShards, loadFile, loadManifest } from '../lib/data.js';
import { buildIndex } from '../lib/search.js';
import { normalizeNDC } from '../lib/codes.js';
import { renderTable } from '../lib/table.js';
import { decodeTob } from '../lib/tob.js';

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
  rarc: (root) => crosswalkLookup({ root, dataset: 'crosswalks', file: 'rarc.json', textKeys: ['desc'], hashPrefix: 'rarc' }),};

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

// --- spec-v4 §5: Group A extensions (utilities 82-93) -------------------

function tableShell(root) {
  const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  root.appendChild(region);
  return region;
}

function failMessage(region, msg) {
  clear(region);
  region.appendChild(el('p', { class: 'muted', text: msg }));
}

renderers['hcpcs-mod'] = function (root) {
  const region = tableShell(root);
  loadFile('hcpcs-modifiers', 'modifiers.json').then((rows) => {
    renderTable(region, {
      columns: [
        { key: 'modifier', label: 'Modifier' },
        { key: 'description', label: 'Description' },
        { key: 'commonUse', label: 'Common Use' },
        { key: 'pairingCaution', label: 'Pairing Caution' },
      ],
      rows,
    });
  }).catch((err) => failMessage(region, `Failed to load HCPCS modifiers: ${err.message}`));
};

renderers['pos-lookup'] = function (root) {
  const region = tableShell(root);
  loadFile('pos-codes', 'pos.json').then((rows) => {
    renderTable(region, {
      columns: [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'setting', label: 'Setting' },
        { key: 'facility', label: 'Facility / Non-facility' },
      ],
      rows,
    });
  }).catch((err) => failMessage(region, `Failed to load POS codes: ${err.message}`));
};

renderers['tob-decode'] = function (root) {
  const input = inputBlock('Type of Bill (3 or 4 digits)', 'q', 'search', 'e.g. 0111');
  const out = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  root.appendChild(input); root.appendChild(out);
  loadFile('tob-codes', 'tob.json').then((table) => {
    document.getElementById('q').addEventListener('input', (e) => {
      clear(out);
      const r = decodeTob(e.target.value, table);
      if (!r.ok) { out.appendChild(el('p', { class: 'muted', text: r.error })); return; }
      const fmt = (row, fallback) => row ? `${row.digit} - ${row.label}` : fallback;
      out.appendChild(el('h2', { text: `TOB ${r.input}` }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Type of Facility: ${fmt(r.facility, 'Unknown digit')}` }),
        el('li', { text: `Bill Classification: ${fmt(r.classification, 'Unknown digit')}` }),
        el('li', { text: `Frequency: ${fmt(r.frequency, 'Unknown digit')}` }),
      ]));
    });
  }).catch((err) => failMessage(out, `Failed to load TOB table: ${err.message}`));
};

renderers['rev-table'] = function (root) {
  const region = tableShell(root);
  loadFile('revenue-codes', 'revenue.json').then((rows) => {
    renderTable(region, {
      columns: [
        { key: 'code', label: 'Revenue Code' },
        { key: 'category', label: 'Category' },
        { key: 'typicalPairing', label: 'Typical Pairing' },
      ],
      rows,
    });
  }).catch((err) => failMessage(region, `Failed to load revenue codes: ${err.message}`));
};

renderers['nubc-codes'] = function (root) {
  // Three sub-tables in one tile: condition / occurrence / value codes.
  const region = tableShell(root);
  loadFile('nubc-special-codes', 'special.json').then((data) => {
    const sections = [
      { title: 'Condition Codes', rows: data.condition },
      { title: 'Occurrence Codes', rows: data.occurrence },
      { title: 'Value Codes', rows: data.value },
    ];
    for (const sec of sections) {
      region.appendChild(el('h2', { text: sec.title }));
      const sub = el('div');
      region.appendChild(sub);
      renderTable(sub, {
        columns: [{ key: 'code', label: 'Code' }, { key: 'desc', label: 'Description' }],
        rows: sec.rows || [],
        searchable: true,
        sortable: true,
        copyableRows: true,
      });
    }
  }).catch((err) => failMessage(region, `Failed to load NUBC special codes: ${err.message}`));
};

renderers['drg-lookup'] = function (root) {
  const region = tableShell(root);
  loadFile('drg', 'drg.json').then((rows) => {
    renderTable(region, {
      columns: [
        { key: 'drg', label: 'DRG' },
        { key: 'title', label: 'Title' },
        { key: 'mdc', label: 'MDC' },
        { key: 'relativeWeight', label: 'Rel. Weight' },
        { key: 'gmlos', label: 'GMLOS' },
        { key: 'amlos', label: 'AMLOS' },
      ],
      rows,
    });
  }).catch((err) => failMessage(region, `Failed to load DRG: ${err.message}`));
};

renderers['apc-lookup'] = function (root) {
  const region = tableShell(root);
  loadFile('apc', 'apc.json').then((rows) => {
    renderTable(region, {
      columns: [
        { key: 'apc', label: 'APC' },
        { key: 'title', label: 'Group Title' },
        { key: 'statusIndicator', label: 'Status Indicator' },
        { key: 'relativeWeight', label: 'Rel. Weight' },
        { key: 'paymentRate', label: 'Payment Rate' },
      ],
      rows,
    });
  }).catch((err) => failMessage(region, `Failed to load APC: ${err.message}`));
};

renderers['pcs-lookup'] = function (root) {
  const input = inputBlock('Search ICD-10-PCS by code or description', 'q');
  const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  root.appendChild(input); root.appendChild(region);
  loadFile('icd10-pcs', 'pcs.json').then((rows) => {
    const idx = buildIndex(rows, { codeKey: 'code', textKeys: ['description', 'section', 'bodySystem', 'operation'] });
    const update = (q) => {
      clear(region);
      const found = idx.search(q, 50);
      if (!found.length) { region.appendChild(el('p', { class: 'muted', text: 'No results.' })); return; }
      for (const r of found) {
        region.appendChild(el('article', { class: 'result-card' }, [
          el('h3', { text: r.code }),
          el('p', { text: r.description }),
          el('p', { class: 'muted', text: `${r.section} - ${r.bodySystem} - ${r.operation}` }),
        ]));
      }
    };
    update('');
    document.getElementById('q').addEventListener('input', (e) => update(e.target.value));
  }).catch((err) => failMessage(region, `Failed to load ICD-10-PCS: ${err.message}`));
};

renderers['rxnorm-lookup'] = function (root) {
  const input = inputBlock('Search by RxCUI or drug name', 'q');
  const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  root.appendChild(input); root.appendChild(region);
  loadFile('rxnorm', 'rxnorm.json').then((rows) => {
    const idx = buildIndex(rows, { codeKey: 'rxcui', textKeys: ['name', 'ingredient', 'doseForm'] });
    const update = (q) => {
      clear(region);
      const found = idx.search(q, 50);
      if (!found.length) { region.appendChild(el('p', { class: 'muted', text: 'No results.' })); return; }
      for (const r of found) {
        region.appendChild(el('article', { class: 'result-card' }, [
          el('h3', { text: `${r.name}` }),
          el('p', { class: 'muted', text: `RxCUI ${r.rxcui} - ${r.tty}${r.ingredient ? ' - ingredient ' + r.ingredient : ''}` }),
          r.strength || r.doseForm ? el('p', { text: [r.strength, r.doseForm].filter(Boolean).join(' - ') }) : null,
        ].filter(Boolean)));
      }
    };
    update('');
    document.getElementById('q').addEventListener('input', (e) => update(e.target.value));
  }).catch((err) => failMessage(region, `Failed to load RxNorm subset: ${err.message}`));
};

renderers['ndc-rxnorm'] = function (root) {
  const input = inputBlock('Enter NDC (any standard format)', 'q');
  const status = el('p', { class: 'muted', id: 'nx-status' });
  const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
  root.appendChild(input); root.appendChild(status); root.appendChild(region);
  Promise.all([
    loadAllShards('ndc'),
    loadFile('rxnorm', 'rxnorm.json'),
  ]).then(([ndc, rxnorm]) => {
    // Build a name-keyed index into RxNorm so we can crosswalk by ingredient
    // when a direct rxcui field isn't present on the NDC record.
    const byIngredient = new Map();
    for (const r of rxnorm) {
      const key = String(r.ingredient || r.name || '').toLowerCase();
      if (!key) continue;
      if (!byIngredient.has(key)) byIngredient.set(key, []);
      byIngredient.get(key).push(r);
    }
    const ndcIdx = new Map(ndc.map((r) => [String(r.ndc), r]));
    document.getElementById('q').addEventListener('input', (e) => {
      const raw = e.target.value.trim();
      clear(region); clear(status);
      if (!raw) return;
      const norm = normalizeNDC(raw);
      if (norm) status.textContent = `Normalized: ${norm.formatted} (canonical 11-digit ${norm.canonical}).`;
      const product = ndcIdx.get(norm ? norm.formatted : raw)
        || ndc.find((r) => String(r.ndc).replace(/[^0-9]/g, '') === (norm ? norm.canonical : raw.replace(/[^0-9]/g, '')));
      if (!product) { region.appendChild(el('p', { class: 'muted', text: 'No NDC product found in the bundled subset.' })); return; }
      const ingredient = String(product.nonproprietary || product.proprietary || '').toLowerCase();
      const matches = (byIngredient.get(ingredient) || []).slice(0, 10);
      region.appendChild(el('article', { class: 'result-card' }, [
        el('h3', { text: product.proprietary || product.nonproprietary || product.ndc }),
        el('p', { class: 'muted', text: `NDC ${product.ndc} - ${product.form || ''} - ${product.route || ''}` }),
      ]));
      if (matches.length === 0) {
        region.appendChild(el('p', { class: 'muted', text: 'No RxNorm crosswalk match in the bundled subset.' }));
        return;
      }
      region.appendChild(el('h3', { text: 'RxNorm matches' }));
      for (const r of matches) {
        region.appendChild(el('p', { text: `RxCUI ${r.rxcui} - ${r.name} (${r.tty})` }));
      }
    });
  }).catch((err) => failMessage(region, `Failed to load crosswalk data: ${err.message}`));
};
