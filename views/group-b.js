// Group B: Pricing and Cost Reference utilities (13-17).

import { el, clear } from '../lib/dom.js';
import { loadAllShards, loadFile, loadManifest } from '../lib/data.js';
import { calcMpfsBoth, chargeToMedicareRatio } from '../lib/mpfs.js';
import { estimateOop } from '../lib/oop.js';
import { renderTable } from '../lib/table.js';
import { fplBands } from '../lib/fpl.js';

function field(label, id, type = 'number', placeholder = '') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type, autocomplete: 'off' });
  if (placeholder) inp.setAttribute('placeholder', placeholder);
  if (type === 'number') inp.setAttribute('step', 'any');
  wrap.appendChild(inp);
  return wrap;
}

export const renderers = {
  mpfs(root) {
    const codeInput = field('Code (HCPCS or CPT five characters)', 'mpfs-code', 'search', '99213');
    const localitySelect = el('p', {}, [
      el('label', { for: 'mpfs-loc', text: 'Locality' }),
      el('br'),
      el('select', { id: 'mpfs-loc' }),
    ]);
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(codeInput);
    root.appendChild(localitySelect);
    root.appendChild(out);

    Promise.all([
      loadAllShards('mpfs'),
      loadFile('mpfs', 'gpci.json'),
      loadFile('mpfs', 'conversion-factor.json'),
    ]).then(([rows, gpciList, cfData]) => {
      const codeIdx = new Map(rows.map((r) => [r.code, r]));
      const sel = document.getElementById('mpfs-loc');
      for (const g of gpciList) {
        const opt = el('option', { value: g.localityCode, text: g.name });
        sel.appendChild(opt);
      }
      const run = () => {
        clear(out);
        const code = document.getElementById('mpfs-code').value.trim().toUpperCase();
        const locId = sel.value;
        const row = codeIdx.get(code);
        const gpci = gpciList.find((g) => g.localityCode === locId);
        if (!code) return;
        if (!row) {
          out.appendChild(el('p', { text: `Code ${code} not found in the bundled MPFS subset. Note: AMA-owned CPT descriptors are not displayed; structural data only.` }));
          return;
        }
        const result = calcMpfsBoth({
          code, mpfs: row, gpci: { workGpci: gpci.workGpci, peGpci: gpci.peGpci, mpGpci: gpci.mpGpci },
          conversionFactor: cfData.conversionFactor,
        });
        out.appendChild(el('h2', { text: `Code ${code} in ${gpci.name}` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Facility allowable: $${result.facility.toFixed(2)}` }),
          el('li', { text: `Non-facility allowable: $${result.nonFacility.toFixed(2)}` }),
        ]));
        out.appendChild(el('h3', { text: 'Components' }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Work RVU ${row.workRvu} x work GPCI ${gpci.workGpci}` }),
          el('li', { text: `PE RVU (facility) ${row.peRvuFacility} / (non-facility) ${row.peRvuNonFacility} x PE GPCI ${gpci.peGpci}` }),
          el('li', { text: `MP RVU ${row.mpRvu} x MP GPCI ${gpci.mpGpci}` }),
          el('li', { text: `Conversion factor $${cfData.conversionFactor} (effective ${cfData.effectiveDate})` }),
        ]));
        out.appendChild(el('p', { class: 'muted', text: 'This is what Medicare pays a participating provider in this locality. Commercial insurance and self-pay rates differ.' }));
      };
      document.getElementById('mpfs-code').addEventListener('input', run);
      sel.addEventListener('change', run);
    });
  },

  nadac(root) {
    const search = field('NDC or drug name', 'q', 'search');
    const qty = field('Quantity dispensed', 'qty', 'number', '30');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(search); root.appendChild(qty); root.appendChild(out);
    loadAllShards('nadac').then((rows) => {
      const run = () => {
        const q = document.getElementById('q').value.trim().toLowerCase();
        const quantity = Number(document.getElementById('qty').value) || 0;
        clear(out);
        if (!q) return;
        const matches = rows.filter((r) => r.ndc.includes(q.toUpperCase()) || (r.drug || '').toLowerCase().includes(q));
        if (matches.length === 0) { out.appendChild(el('p', { text: 'No matches in bundled subset.' })); return; }
        for (const r of matches) {
          const total = quantity > 0 ? (quantity * r.perUnit).toFixed(2) : null;
          const items = [
            el('h3', { text: `${r.drug} (${r.ndc})` }),
            el('p', { text: `NADAC: $${r.perUnit.toFixed(5)} per ${r.unit.toLowerCase()} (effective ${r.effectiveDate})` }),
          ];
          if (total) items.push(el('p', { text: `For ${quantity} units: $${total}` }));
          items.push(el('p', { class: 'muted', text: 'NADAC reflects retail pharmacy acquisition cost; it is not the patient price. The patient price depends on insurance, copay, and dispensing fee.' }));
          out.appendChild(el('article', { class: 'result-card' }, items));
        }
      };
      document.getElementById('q').addEventListener('input', run);
      document.getElementById('qty').addEventListener('input', run);
    });
  },

  ratio(root) {
    const codeI = field('Code', 'r-code', 'search', '99213');
    const localityI = el('p', {}, [el('label', { for: 'r-loc', text: 'Locality' }), el('br'), el('select', { id: 'r-loc' })]);
    const chargedI = field('Charged amount', 'r-charge', 'number', '350');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(codeI); root.appendChild(localityI); root.appendChild(chargedI); root.appendChild(out);

    Promise.all([
      loadAllShards('mpfs'),
      loadFile('mpfs', 'gpci.json'),
      loadFile('mpfs', 'conversion-factor.json'),
    ]).then(([rows, gpciList, cf]) => {
      const codeIdx = new Map(rows.map((r) => [r.code, r]));
      const sel = document.getElementById('r-loc');
      for (const g of gpciList) sel.appendChild(el('option', { value: g.localityCode, text: g.name }));
      const run = () => {
        clear(out);
        const code = document.getElementById('r-code').value.trim().toUpperCase();
        const charged = Number(document.getElementById('r-charge').value);
        const g = gpciList.find((x) => x.localityCode === sel.value);
        const row = codeIdx.get(code);
        if (!code || !Number.isFinite(charged) || charged <= 0 || !row) return;
        const result = calcMpfsBoth({ code, mpfs: row, gpci: { workGpci: g.workGpci, peGpci: g.peGpci, mpGpci: g.mpGpci }, conversionFactor: cf.conversionFactor });
        const ratioFacility = chargeToMedicareRatio(charged, result.facility);
        const ratioNonFacility = chargeToMedicareRatio(charged, result.nonFacility);
        out.appendChild(el('h2', { text: `Charge $${charged.toFixed(2)} vs Medicare in ${g.name}` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Facility ratio: ${ratioFacility}x ($${result.facility.toFixed(2)} Medicare)` }),
          el('li', { text: `Non-facility ratio: ${ratioNonFacility}x ($${result.nonFacility.toFixed(2)} Medicare)` }),
        ]));
        out.appendChild(el('p', { class: 'muted', text:
          'Calibration: commercial insurance commonly pays 1.5 to 3 times Medicare. Ratios above 4 are typical of out-of-network or self-pay charges where negotiation is often possible.' }));
      };
      ['r-code', 'r-charge'].forEach((id) => document.getElementById(id).addEventListener('input', run));
      sel.addEventListener('change', run);
    });
  },

  'hospital-prices'(root) {
    const hospSel = el('p', {}, [el('label', { for: 'hp-h', text: 'Hospital' }), el('br'), el('select', { id: 'hp-h' })]);
    const codeI = field('Code', 'hp-code', 'search');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(el('p', { class: 'notice', text: 'Coverage is intentionally partial. The full federal hospital price transparency dataset is too large to bundle.' }));
    root.appendChild(hospSel);
    root.appendChild(codeI);
    root.appendChild(out);
    loadManifest('hospital-prices').then(async (m) => {
      const sel = document.getElementById('hp-h');
      for (const h of (m.hospitals || [])) sel.appendChild(el('option', { value: h.id, text: h.name }));
      const data = {};
      for (const h of (m.hospitals || [])) {
        data[h.id] = await loadFile('hospital-prices', h.file);
      }
      const run = () => {
        clear(out);
        const id = sel.value; const code = document.getElementById('hp-code').value.trim().toUpperCase();
        if (!id || !code) return;
        const h = data[id];
        const matches = (h.rates || []).filter((r) => String(r.code).toUpperCase() === code);
        if (matches.length === 0) { out.appendChild(el('p', { text: `No published rate for ${code} at ${h.hospitalName}.` })); return; }
        out.appendChild(el('h2', { text: `${h.hospitalName} - code ${code}` }));
        const tbl = el('table', { class: 'lookup-table' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Payer' }), el('th', { scope: 'col', text: 'Plan' }), el('th', { scope: 'col', text: 'Rate' })])]));
        const tbody = el('tbody');
        for (const r of matches) {
          tbody.appendChild(el('tr', {}, [el('td', { text: r.payer }), el('td', { text: r.plan }), el('td', { text: `$${r.rate.toFixed(2)}` })]));
        }
        tbl.appendChild(tbody);
        out.appendChild(tbl);
        out.appendChild(el('p', { class: 'muted', text: `Source: ${h.sourceUrl} (fetched ${h.fetchDate}).` }));
      };
      sel.addEventListener('change', run);
      document.getElementById('hp-code').addEventListener('input', run);
    });
  },

  oop(root) {
    const fields = [
      ['Allowed amount', 'allowed', '500'],
      ['Annual deductible', 'deductible', '1500'],
      ['Deductible met to date', 'deductibleMet', '0'],
      ['Coinsurance percent', 'coinsurance', '20'],
      ['Copay (flat dollars)', 'copay', '0'],
      ['Out-of-pocket maximum', 'oopMax', '6000'],
      ['Out-of-pocket met to date', 'oopMet', '0'],
    ];
    for (const [lbl, id, ph] of fields) root.appendChild(field(lbl, id, 'number', ph));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      try {
        const get = (id) => Number(document.getElementById(id).value);
        const result = estimateOop({
          allowedAmount: get('allowed'),
          deductible: get('deductible'),
          deductibleMet: get('deductibleMet'),
          coinsurance: get('coinsurance'),
          copay: get('copay'),
          oopMax: get('oopMax'),
          oopMet: get('oopMet'),
        });
        out.appendChild(el('h2', { text: `Estimated patient responsibility: $${result.patientResponsibility.toFixed(2)}` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Deductible applied: $${result.deductibleApplied.toFixed(2)}` }),
          el('li', { text: `Coinsurance applied: $${result.coinsuranceApplied.toFixed(2)}` }),
          el('li', { text: `Copay applied: $${result.copayApplied.toFixed(2)}` }),
          el('li', { text: `Plan pays: $${result.planPays.toFixed(2)}` }),
          el('li', { text: result.cappedByOopMax ? 'Capped by remaining out-of-pocket maximum.' : 'Not capped by OOP max.' }),
        ]));
        out.appendChild(el('p', { class: 'muted', text:
          'Assumptions: in-network, plan year, no balance billing. Real plans may apply rules not modeled here. Reference only.' }));
      } catch (err) {
        out.appendChild(el('p', { text: err.message }));
      }
    };
    for (const [, id] of fields) document.getElementById(id).addEventListener('input', run);
  },

  // --- spec-v4 §5: Group B extensions (utilities 94-104) ----------------

  dmepos(root) {
    const codeI = field('HCPCS code', 'd-code', 'search', 'E0114');
    const stateI = el('p', {}, [
      el('label', { for: 'd-state', text: 'State' }), el('br'),
      el('select', { id: 'd-state' }),
    ]);
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(codeI); root.appendChild(stateI); root.appendChild(out);
    loadFile('dmepos', 'dmepos.json').then((rows) => {
      const states = Array.from(new Set(rows.flatMap((r) => Object.keys(r.cbState || {})))).sort();
      const sel = document.getElementById('d-state');
      for (const s of states) sel.appendChild(el('option', { value: s, text: s }));
      const idx = new Map(rows.map((r) => [r.hcpcs, r]));
      const run = () => {
        clear(out);
        const code = document.getElementById('d-code').value.trim().toUpperCase();
        const state = sel.value;
        if (!code) return;
        const r = idx.get(code);
        if (!r) { out.appendChild(el('p', { text: `No DMEPOS rate for ${code} in the bundled subset.` })); return; }
        const cb = r.cbState[state];
        out.appendChild(el('h2', { text: `${code} - ${r.description}` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: cb != null ? `Competitive-bidding rate (${state}): $${cb.toFixed(2)}` : `No competitive-bidding rate published for ${state}.` }),
          el('li', { text: `Non-CB rate: $${r.nonCb.toFixed(2)}` }),
        ]));
        out.appendChild(el('p', { class: 'muted', text: 'CMS DMEPOS Fee Schedule. CB applies in designated competitive-bidding areas only.' }));
      };
      document.getElementById('d-code').addEventListener('input', run);
      sel.addEventListener('change', run);
    });
  },

  clfs(root) {
    const codeI = field('HCPCS lab code', 'cl-code', 'search', '80053');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(codeI); root.appendChild(out);
    loadFile('clfs', 'clfs.json').then((rows) => {
      const idx = new Map(rows.map((r) => [r.hcpcs, r]));
      document.getElementById('cl-code').addEventListener('input', (e) => {
        clear(out);
        const code = e.target.value.trim().toUpperCase();
        if (!code) return;
        const r = idx.get(code);
        if (!r) { out.appendChild(el('p', { text: `No CLFS rate for ${code} in the bundled subset.` })); return; }
        out.appendChild(el('h2', { text: `${code} - ${r.description}` }));
        out.appendChild(el('p', { text: `National limitation amount: $${r.nationalLimitationAmount.toFixed(2)}` }));
        out.appendChild(el('p', { class: 'muted', text: 'CMS Clinical Laboratory Fee Schedule.' }));
      });
    });
  },

  asp(root) {
    const codeI = field('HCPCS J-code', 'a-code', 'search', 'J1885');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(codeI); root.appendChild(out);
    loadFile('asp', 'asp.json').then((rows) => {
      const idx = new Map(rows.map((r) => [r.hcpcs, r]));
      document.getElementById('a-code').addEventListener('input', (e) => {
        clear(out);
        const code = e.target.value.trim().toUpperCase();
        if (!code) return;
        const r = idx.get(code);
        if (!r) { out.appendChild(el('p', { text: `No ASP for ${code} in the bundled subset.` })); return; }
        out.appendChild(el('h2', { text: `${code} - ${r.description}` }));
        out.appendChild(el('p', { text: `ASP per unit: $${r.perUnit.toFixed(4)}` }));
        out.appendChild(el('p', { class: 'muted', text: 'CMS Average Sales Price quarterly file. Medicare typically pays ASP + 6% (less applicable sequestration) for Part B drugs.' }));
      });
    });
  },

  asc(root) {
    const codeI = field('HCPCS code', 'asc-code', 'search', '66984');
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(codeI); root.appendChild(out);
    loadFile('asc', 'asc.json').then((rows) => {
      const idx = new Map(rows.map((r) => [r.hcpcs, r]));
      document.getElementById('asc-code').addEventListener('input', (e) => {
        clear(out);
        const code = e.target.value.trim().toUpperCase();
        if (!code) return;
        const r = idx.get(code);
        if (!r) { out.appendChild(el('p', { text: `No ASC payment for ${code} in the bundled subset.` })); return; }
        out.appendChild(el('h2', { text: `${code} - ${r.description}` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Payment indicator: ${r.paymentIndicator}` }),
          el('li', { text: `Rate: $${r.rate.toFixed(2)}` }),
        ]));
        out.appendChild(el('p', { class: 'muted', text: 'CMS ASC Addendum AA/BB.' }));
      });
    });
  },

  'wage-index'(root) {
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(region);
    loadFile('wage-index', 'wage-index.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'cbsa', label: 'CBSA' },
          { key: 'name', label: 'Name' },
          { key: 'wageIndex', label: 'Wage Index' },
        ],
        rows,
      });
    });
  },

  gpci(root) {
    const region = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(region);
    loadFile('gpci', 'gpci.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'localityCode', label: 'Locality' },
          { key: 'name', label: 'Name' },
          { key: 'work', label: 'Work GPCI' },
          { key: 'pe', label: 'PE GPCI' },
          { key: 'mp', label: 'MP GPCI' },
        ],
        rows,
      });
    });
  },

  'medicare-deductibles'(root) {
    const out = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(out);
    Promise.all([
      loadFile('cms-deductibles', 'deductibles.json'),
      loadFile('irmaa', 'irmaa.json'),
    ]).then(([d, i]) => {
      out.appendChild(el('h2', { text: `Calendar year ${d.year}` }));
      out.appendChild(el('h3', { text: 'Medicare Part A' }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Inpatient deductible: $${d.partA.inpatientDeductible}` }),
        el('li', { text: `Days 61-90 coinsurance: $${d.partA.daysCoinsurance61to90}/day` }),
        el('li', { text: `Days 91+ (lifetime reserve): $${d.partA.daysCoinsurance91plus}/day` }),
      ]));
      out.appendChild(el('h3', { text: 'Medicare Part B' }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Annual deductible: $${d.partB.deductible}` }),
        el('li', { text: `Baseline monthly premium: $${d.partB.baselinePremium.toFixed(2)}` }),
      ]));
      for (const [status, brackets] of Object.entries(i.filingStatus)) {
        out.appendChild(el('h3', { text: `IRMAA brackets - ${status}` }));
        const tbl = el('table', { class: 'lookup-table' });
        tbl.appendChild(el('thead', {}, [el('tr', {}, [
          el('th', { scope: 'col', text: 'MAGI from' }),
          el('th', { scope: 'col', text: 'MAGI to' }),
          el('th', { scope: 'col', text: 'Part B surcharge' }),
          el('th', { scope: 'col', text: 'Part D surcharge' }),
        ])]));
        const tbody = el('tbody');
        for (const b of brackets) {
          tbody.appendChild(el('tr', {}, [
            el('td', { text: `$${b.from.toLocaleString()}` }),
            el('td', { text: b.to == null ? '+' : `$${b.to.toLocaleString()}` }),
            el('td', { text: `$${b.partBSurcharge.toFixed(2)}` }),
            el('td', { text: `$${b.partDSurcharge.toFixed(2)}` }),
          ]));
        }
        tbl.appendChild(tbody);
        out.appendChild(tbl);
      }
      out.appendChild(el('p', { class: 'muted', text: 'Source: CMS annual notice + SSA IRMAA notice. Reference values; verify against the current published table.' }));
    });
  },

  'aca-thresholds'(root) {
    const out = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('aca-thresholds', 'aca.json').then((d) => {
      out.appendChild(el('h2', { text: `Plan year ${d.year}` }));
      out.appendChild(el('h3', { text: 'Out-of-pocket maximums' }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Self-only: $${d.oopMaxSelf.toLocaleString()}` }),
        el('li', { text: `Family: $${d.oopMaxFamily.toLocaleString()}` }),
      ]));
      out.appendChild(el('h3', { text: 'Actuarial value bands by metal tier' }));
      const tbl = el('table', { class: 'lookup-table' });
      tbl.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { scope: 'col', text: 'Tier' }),
        el('th', { scope: 'col', text: 'AV range (low)' }),
        el('th', { scope: 'col', text: 'AV range (high)' }),
      ])]));
      const tbody = el('tbody');
      for (const [tier, range] of Object.entries(d.avBands)) {
        tbody.appendChild(el('tr', {}, [
          el('td', { text: tier }),
          el('td', { text: `${(range[0] * 100).toFixed(0)}%` }),
          el('td', { text: `${(range[1] * 100).toFixed(0)}%` }),
        ]));
      }
      tbl.appendChild(tbody); out.appendChild(tbl);
      out.appendChild(el('p', { class: 'muted', text: 'Source: CMS / HHS Notice of Benefit and Payment Parameters.' }));
    });
  },

  'hsa-fsa'(root) {
    const out = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('hsa-fsa-limits', 'hsa-fsa.json').then((d) => {
      out.appendChild(el('h2', { text: `Calendar year ${d.year}` }));
      out.appendChild(el('h3', { text: 'HSA contribution limits' }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Self-only: $${d.hsa.contributionSelf.toLocaleString()}` }),
        el('li', { text: `Family: $${d.hsa.contributionFamily.toLocaleString()}` }),
        el('li', { text: `Age 55+ catch-up: $${d.hsa.catchUp55.toLocaleString()}` }),
      ]));
      out.appendChild(el('h3', { text: 'HDHP limits' }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Minimum deductible (self-only / family): $${d.hdhp.minDeductibleSelf.toLocaleString()} / $${d.hdhp.minDeductibleFamily.toLocaleString()}` }),
        el('li', { text: `Maximum OOP (self-only / family): $${d.hdhp.maxOopSelf.toLocaleString()} / $${d.hdhp.maxOopFamily.toLocaleString()}` }),
      ]));
      out.appendChild(el('h3', { text: 'FSA limits' }));
      out.appendChild(el('ul', {}, [
        el('li', { text: `Health FSA elective contribution: $${d.fsa.healthFsa.toLocaleString()}` }),
        el('li', { text: `Health FSA carryover (if plan permits): $${d.fsa.healthFsaCarryover.toLocaleString()}` }),
        el('li', { text: `Dependent care FSA: $${d.fsa.dependentCare.toLocaleString()}` }),
      ]));
      out.appendChild(el('p', { class: 'muted', text: 'Source: IRS Revenue Procedure (current year).' }));
    });
  },

  fpl(root) {
    const hh = field('Household size', 'fpl-h', 'number', '1');
    const reg = el('p', {}, [
      el('label', { for: 'fpl-r', text: 'Region' }), el('br'),
      el('select', { id: 'fpl-r' }, [
        el('option', { value: 'contiguous48', text: '48 contiguous states + DC' }),
        el('option', { value: 'alaska', text: 'Alaska' }),
        el('option', { value: 'hawaii', text: 'Hawaii' }),
      ]),
    ]);
    const out = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(hh); root.appendChild(reg); root.appendChild(out);
    loadFile('fpl', 'fpl.json').then((tbl) => {
      const run = () => {
        clear(out);
        const h = Math.floor(Number(document.getElementById('fpl-h').value));
        const region = document.getElementById('fpl-r').value;
        if (!Number.isInteger(h) || h < 1) return;
        const row = tbl[region];
        const bands = fplBands(h, row);
        out.appendChild(el('h2', { text: `Household of ${h} - ${region === 'contiguous48' ? '48 states + DC' : region === 'alaska' ? 'Alaska' : 'Hawaii'}` }));
        const t = el('table', { class: 'lookup-table' });
        t.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Percent of FPL' }), el('th', { scope: 'col', text: 'Annual income threshold' })])]));
        const body = el('tbody');
        for (const b of bands) body.appendChild(el('tr', {}, [el('td', { text: `${b.percent}%` }), el('td', { text: `$${b.threshold.toLocaleString()}` })]));
        t.appendChild(body); out.appendChild(t);
        out.appendChild(el('p', { class: 'muted', text: `Source: HHS Poverty Guidelines (CY${tbl.year}). 138% used by ACA Medicaid expansion; 400% by ACA premium tax credit eligibility (subject to current law).` }));
      };
      document.getElementById('fpl-h').addEventListener('input', run);
      document.getElementById('fpl-r').addEventListener('change', run);
    });
  },

  'irs-mileage'(root) {
    const out = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('irs-mileage', 'mileage.json').then((rows) => {
      const t = el('table', { class: 'lookup-table' });
      t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { scope: 'col', text: 'Year' }),
        el('th', { scope: 'col', text: 'Business' }),
        el('th', { scope: 'col', text: 'Medical' }),
        el('th', { scope: 'col', text: 'Charitable' }),
        el('th', { scope: 'col', text: 'Moving' }),
      ])]));
      const tb = el('tbody');
      for (const r of rows) {
        tb.appendChild(el('tr', {}, [
          el('td', { text: String(r.year) }),
          el('td', { text: `$${r.business.toFixed(3)}/mi` }),
          el('td', { text: `$${r.medical.toFixed(3)}/mi` }),
          el('td', { text: `$${r.charitable.toFixed(3)}/mi` }),
          el('td', { text: `$${r.moving.toFixed(3)}/mi` }),
        ]));
      }
      t.appendChild(tb); out.appendChild(t);
      out.appendChild(el('p', { class: 'muted', text: 'IRS standard mileage rates. Medical mileage applies as an itemized deduction subject to the 7.5% AGI floor; verify with current IRS guidance.' }));
    });
  },
};
