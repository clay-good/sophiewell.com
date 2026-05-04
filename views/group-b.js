// Group B: Pricing and Cost Reference utilities (13-17).

import { el, clear } from '../lib/dom.js';
import { loadAllShards, loadFile, loadManifest } from '../lib/data.js';
import { calcMpfsBoth, chargeToMedicareRatio } from '../lib/mpfs.js';
import { estimateOop } from '../lib/oop.js';

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
};
