// Group C: Patient Bill and Insurance Tools (18-23).

import { el, clear } from '../lib/dom.js';
import { loadFile, loadAllShards } from '../lib/data.js';
import { decodeBillText, decodeEobText, gfeDisputeCheck } from '../lib/decoder.js';

function textarea(label, id, rows = 8) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const ta = el('textarea', { id, rows: String(rows), cols: '60', spellcheck: 'false' });
  wrap.appendChild(ta);
  return wrap;
}

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
  decoder(root) {
    root.appendChild(textarea('Paste bill text', 'bill', 12));
    const button = el('p', {}, [el('button', { id: 'decode-btn', type: 'button', text: 'Decode' }), document.createTextNode(' '), el('button', { id: 'print-btn', type: 'button', text: 'Print summary' })]);
    root.appendChild(button);
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);

    let icd10Idx = new Map(), hcpcsIdx = new Map(), posIdx = new Map(), revIdx = new Map(), carcIdx = new Map(), rarcIdx = new Map();
    Promise.all([
      loadAllShards('icd10cm'),
      loadAllShards('hcpcs'),
      loadFile('crosswalks', 'pos-codes.json'),
      loadFile('crosswalks', 'revenue-codes.json'),
      loadFile('crosswalks', 'carc.json'),
      loadFile('crosswalks', 'rarc.json'),
    ]).then(([icd10, hcpcs, pos, rev, carc, rarc]) => {
      icd10Idx = new Map(icd10.map((r) => [r.code, r]));
      hcpcsIdx = new Map(hcpcs.map((r) => [r.code, r]));
      posIdx = new Map(pos.map((r) => [r.code, r]));
      revIdx = new Map(rev.map((r) => [r.code, r]));
      carcIdx = new Map(carc.map((r) => [r.code, r]));
      rarcIdx = new Map(rarc.map((r) => [r.code, r]));
    });

    const renderDecoded = (text) => {
      const r = decodeBillText(text);
      clear(out);

      const sum = el('section', { class: 'decode-summary' });
      const totalCharges = r.dollars.reduce((a, b) => a + b, 0);
      sum.appendChild(el('h2', { text: 'Summary' }));
      sum.appendChild(el('ul', {}, [
        el('li', { text: `Total dollar amounts found: $${totalCharges.toFixed(2)} across ${r.dollars.length} amounts` }),
        el('li', { text: `ICD-10 codes: ${r.codes.icd10.length}, HCPCS: ${r.codes.hcpcs.length}, possible CPT: ${r.codes.cpt.length}` }),
        el('li', { text: `Revenue: ${r.codes.revenue.length}, POS: ${r.codes.pos.length}, NPIs (Luhn-valid): ${r.codes.npi.length}` }),
        el('li', { text: `CARC: ${r.codes.carc.length}, RARC: ${r.codes.rarc.length}` }),
      ]));
      out.appendChild(sum);

      const renderGroup = (title, codes, lookup, kind) => {
        if (codes.length === 0) return;
        const sec = el('section', {});
        sec.appendChild(el('h3', { text: title }));
        const ul = el('ul');
        for (const c of codes) {
          const r2 = lookup ? lookup.get(c) : null;
          const desc = r2 ? (r2.desc || r2.short || r2.long || r2.name || '') : '(not in bundled subset)';
          const assoc = r.associations.find((a) => a.code === c && a.kind === kind);
          const dollar = assoc ? ` - $${assoc.amount.toFixed(2)}` : '';
          ul.appendChild(el('li', { text: `${c} - ${desc}${dollar}` }));
        }
        sec.appendChild(ul);
        out.appendChild(sec);
      };
      renderGroup('ICD-10 diagnoses', r.codes.icd10, icd10Idx, 'icd10');
      renderGroup('HCPCS Level II', r.codes.hcpcs, hcpcsIdx, 'hcpcs');

      // CPT (5-digit, ambiguous): per spec section 5, no AMA descriptors.
      if (r.codes.cpt.length) {
        const sec = el('section', {});
        sec.appendChild(el('h3', { text: 'Five-digit codes (possible CPT)' }));
        sec.appendChild(el('p', { class: 'muted', text: 'AMA-owned CPT descriptors are not displayed. See the CPT Code Reference tool for structural data and a link-out to the AMA lookup.' }));
        const ul = el('ul');
        for (const c of r.codes.cpt) {
          const assoc = r.associations.find((a) => a.code === c && a.kind === 'cpt');
          const dollar = assoc ? ` - $${assoc.amount.toFixed(2)}` : '';
          ul.appendChild(el('li', {}, [
            document.createTextNode(`${c}${dollar} - `),
            el('a', { href: `#cpt/${encodeURIComponent(c)}`, text: 'open CPT reference' }),
          ]));
        }
        sec.appendChild(ul);
        out.appendChild(sec);
      }

      renderGroup('Revenue codes', r.codes.revenue, revIdx, 'revenue');

      if (r.codes.pos.length) {
        const sec = el('section', {});
        sec.appendChild(el('h3', { text: 'Place of Service' }));
        const ul = el('ul');
        for (const c of r.codes.pos) {
          const r2 = posIdx.get(c);
          ul.appendChild(el('li', { text: `${c} - ${r2 ? r2.name : '(unknown)'}` }));
        }
        sec.appendChild(ul);
        out.appendChild(sec);
      }

      if (r.codes.npi.length) {
        const sec = el('section', {});
        sec.appendChild(el('h3', { text: 'NPIs (Luhn-valid)' }));
        const ul = el('ul');
        for (const n of r.codes.npi) ul.appendChild(el('li', { text: n }));
        sec.appendChild(ul);
        out.appendChild(sec);
      }
      if (r.npiCandidates.length > r.codes.npi.length) {
        out.appendChild(el('p', { class: 'muted', text: `${r.npiCandidates.length - r.codes.npi.length} ten-digit candidate(s) failed the NPI check digit and were ignored.` }));
      }
    };

    document.getElementById('decode-btn').addEventListener('click', () => {
      renderDecoded(document.getElementById('bill').value);
    });
    document.getElementById('print-btn').addEventListener('click', () => {
      window.print();
    });
  },

  insurance(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Enter values from your card. Each field is explained next to it. Nothing leaves your browser.' }));
    const fields = [
      ['Member ID',        'memberId',  'Identifies you to the insurer. Always reference this on calls and bills.'],
      ['Group number',     'groupId',   'Identifies your employer or plan group. Determines benefits and network rules.'],
      ['Plan name',        'planName',  'Marketing name of your plan, e.g. "Gold PPO 1500".'],
      ['Plan type',        'planType',  'PPO, HMO, EPO, POS, HDHP. Determines referral and out-of-network rules.'],
      ['BIN',              'bin',       'Pharmacy bank identification number. Routes pharmacy claims.'],
      ['PCN',              'pcn',       'Processor control number. Pharmacy claim routing within the BIN.'],
      ['Group RxID',       'rxGroup',   'Pharmacy benefit group identifier within the PBM.'],
      ['Customer service', 'phone',     'Member services phone for pre-auth, claims, and benefits questions.'],
      ['Provider line',    'providerPhone', 'For your provider\'s billing office to call.'],
    ];
    for (const [lbl, id, expl] of fields) {
      root.appendChild(field(lbl, id, 'text'));
      root.appendChild(el('p', { class: 'muted', text: expl }));
    }
    root.appendChild(el('h2', { text: 'Worked example' }));
    root.appendChild(el('p', { text: 'A typical PPO card might list: Member ID W123456789, Group 0001, BIN 003858, PCN A4, Group RxID RXANTHEM. The PCP copay is on the front; the customer service number is on the back.' }));
  },

  'eob-decoder'(root) {
    root.appendChild(textarea('Paste EOB text', 'eob', 12));
    root.appendChild(el('p', {}, [el('button', { id: 'eob-btn', type: 'button', text: 'Decode' })]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);

    let carcIdx = new Map(), rarcIdx = new Map();
    Promise.all([loadFile('crosswalks', 'carc.json'), loadFile('crosswalks', 'rarc.json')]).then(([carc, rarc]) => {
      carcIdx = new Map(carc.map((r) => [r.code, r]));
      rarcIdx = new Map(rarc.map((r) => [r.code, r]));
    });

    document.getElementById('eob-btn').addEventListener('click', () => {
      const r = decodeEobText(document.getElementById('eob').value);
      clear(out);
      out.appendChild(el('h2', { text: 'EOB Summary' }));
      const f = r.fields || {};
      const list = [];
      for (const [k, label] of [['allowed', 'Allowed'], ['planPaid', 'Plan paid'], ['adjustment', 'Adjustment'], ['patientResp', 'Patient responsibility']]) {
        if (Number.isFinite(f[k])) list.push(el('li', { text: `${label}: $${f[k].toFixed(2)}` }));
      }
      if (list.length) out.appendChild(el('ul', {}, list));
      if (r.codes.carc.length) {
        out.appendChild(el('h3', { text: 'Claim Adjustment Reason Codes (CARC)' }));
        out.appendChild(el('ul', {}, r.codes.carc.map((c) => el('li', { text: `${c} - ${carcIdx.get(c) ? carcIdx.get(c).desc : '(unknown)'}` }))));
      }
      if (r.codes.rarc.length) {
        out.appendChild(el('h3', { text: 'Remittance Advice Remark Codes (RARC)' }));
        out.appendChild(el('ul', {}, r.codes.rarc.map((c) => el('li', { text: `${c} - ${rarcIdx.get(c) ? rarcIdx.get(c).desc : '(unknown)'}` }))));
      }
    });
  },

  'no-surprises'(root) {
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    loadFile('no-surprises', 'rules.json').then((rules) => {
      root.appendChild(el('p', { text: 'Select the scenario that best matches your situation.' }));
      const sel = el('select', { id: 'nsa-sel' });
      for (const s of rules.scenarios) sel.appendChild(el('option', { value: s.id, text: s.description }));
      root.appendChild(el('p', {}, [el('label', { for: 'nsa-sel', text: 'Scenario' }), el('br'), sel]));
      root.appendChild(out);
      const run = () => {
        const s = rules.scenarios.find((x) => x.id === sel.value);
        clear(out);
        out.appendChild(el('h2', { text: s.covered ? 'May fall under the No Surprises Act' : 'Not covered by the federal No Surprises Act' }));
        out.appendChild(el('p', { text: s.description }));
        out.appendChild(el('p', { text: `Statutory citation: ${s.statute}` }));
        out.appendChild(el('p', { class: 'muted', text: 'Reference only. Not legal advice. Verify your situation with the federal portal or counsel.' }));
        out.appendChild(el('p', {}, [el('a', { href: rules.portalUrl, rel: 'noopener', text: 'Federal No Surprises dispute portal' })]));
      };
      sel.addEventListener('change', run);
      run();
    });
  },

  gfe(root) {
    root.appendChild(field('Good Faith Estimate total ($)', 'gfe-est', 'number', '1200'));
    root.appendChild(field('Actual bill total ($)', 'gfe-bill', 'number', '1900'));
    const statusRow = el('p');
    statusRow.appendChild(el('label', { for: 'gfe-status', text: 'Patient status' }));
    statusRow.appendChild(el('br'));
    const sel = el('select', { id: 'gfe-status' }, []);
    for (const v of ['uninsured', 'self-pay', 'insured']) sel.appendChild(el('option', { value: v, text: v }));
    statusRow.appendChild(sel);
    root.appendChild(statusRow);
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      const r = gfeDisputeCheck({
        gfeTotal: Number(document.getElementById('gfe-est').value),
        actualBillTotal: Number(document.getElementById('gfe-bill').value),
        status: sel.value,
      });
      clear(out);
      out.appendChild(el('h2', { text: r.eligible ? 'Likely eligible for the federal Patient-Provider Dispute' : 'Not eligible by the federal threshold' }));
      out.appendChild(el('p', { text: `Bill exceeds GFE by $${r.overage.toFixed(2)}. Federal threshold is $${r.threshold}.` }));
      out.appendChild(el('p', { text: r.note }));
      out.appendChild(el('p', { class: 'muted', text: 'Reference only. The federal dispute resolution process applies to uninsured / self-pay patients within 120 days of the bill.' }));
    };
    ['gfe-est', 'gfe-bill'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    sel.addEventListener('change', run);
  },

  'state-rights'(root) {
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    loadFile('state-rights', 'states.json').then((data) => {
      const sel = el('select', { id: 'sr-sel' });
      for (const s of data.states) sel.appendChild(el('option', { value: s.code, text: s.name }));
      root.appendChild(el('p', {}, [el('label', { for: 'sr-sel', text: 'State' }), el('br'), sel]));
      root.appendChild(out);
      const run = () => {
        const s = data.states.find((x) => x.code === sel.value);
        clear(out);
        out.appendChild(el('h2', { text: s.name }));
        out.appendChild(el('h3', { text: 'Medical debt collection' }));
        out.appendChild(el('p', { text: s.medicalDebtCollection }));
        out.appendChild(el('h3', { text: 'Balance billing' }));
        out.appendChild(el('p', { text: s.balanceBilling }));
        out.appendChild(el('p', { class: 'muted', text: `Citations: ${(s.citations || []).join(', ') || 'see linked sources'}` }));
        out.appendChild(el('p', { class: 'muted', text: 'Reference only. Not legal advice.' }));
      };
      sel.addEventListener('change', run);
      run();
    });
  },
};
