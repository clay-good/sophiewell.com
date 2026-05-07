// Group C: Patient Bill and Insurance Tools (18-23).

import { el, clear } from '../lib/dom.js';
import { loadFile, loadAllShards } from '../lib/data.js';
import { decodeBillText, decodeEobText, gfeDisputeCheck } from '../lib/decoder.js';
import { renderDecisionTree } from '../lib/tree.js';
import { renderPrintable } from '../lib/print.js';
import { cobraTimeline, COBRA_MAX_MONTHS } from '../lib/cobra.js';
import { medicareEnrollment, SEP_SCENARIOS } from '../lib/medicare-enrollment.js';
import { ACA_SEP_EVENTS, sepFor } from '../lib/aca-sep.js';
import { birthdayRulePrimary } from '../lib/birthday-rule.js';

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
  // --- spec-v4 §5: Group C extensions (utilities 105-114) ---------------

  'insurance-card'(root) {
    // 105: free-form labeled inputs that produce a plain-English print-ready
    // reference card via lib/print.js.
    const fields = [
      ['Member ID', 'ic-member', 'Identifies you to the insurer. Reference on calls and bills.'],
      ['Group number', 'ic-group', 'Identifies your employer / plan group. Drives benefits and network rules.'],
      ['Plan name', 'ic-plan', 'Marketing name of the plan, e.g. "Gold PPO 1500".'],
      ['Plan type', 'ic-type', 'PPO / HMO / EPO / POS / HDHP. Drives referral and out-of-network rules.'],
      ['BIN', 'ic-bin', 'Pharmacy bank ID number. Routes pharmacy claims.'],
      ['PCN', 'ic-pcn', 'Processor control number. Pharmacy claim routing within the BIN.'],
      ['Group RxID', 'ic-rxgroup', 'Pharmacy benefit group identifier within the PBM.'],
      ['Customer service', 'ic-csphone', 'Member services phone for benefits and claims questions.'],
      ['Provider line', 'ic-provphone', 'For your provider\'s billing office to call.'],
    ];
    for (const [lbl, id, expl] of fields) {
      root.appendChild(field(lbl, id, 'text'));
      root.appendChild(el('p', { class: 'muted', text: expl }));
    }
    const printRegion = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const renderBtn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable card' });
    root.appendChild(el('p', {}, [renderBtn]));
    root.appendChild(printRegion);
    renderBtn.addEventListener('click', () => {
      const get = (id) => document.getElementById(id).value || '';
      renderPrintable(printRegion, {
        title: 'Insurance Card Reference',
        warnings: ['Generated locally. Verify against your physical card.'],
        sections: [
          { heading: 'Identifiers',
            items: [
              `Member ID: ${get('ic-member') || '(blank)'}`,
              `Group: ${get('ic-group') || '(blank)'}`,
              `Plan name: ${get('ic-plan') || '(blank)'}`,
              `Plan type: ${get('ic-type') || '(blank)'}`,
            ] },
          { heading: 'Pharmacy routing',
            items: [
              `BIN: ${get('ic-bin') || '(blank)'}`,
              `PCN: ${get('ic-pcn') || '(blank)'}`,
              `Group RxID: ${get('ic-rxgroup') || '(blank)'}`,
            ] },
          { heading: 'Phone numbers',
            items: [
              `Customer service: ${get('ic-csphone') || '(blank)'}`,
              `Provider billing line: ${get('ic-provphone') || '(blank)'}`,
            ] },
        ],
      });
    });
  },

  'abn-explainer'(root) {
    // 106: Static box-by-box reference for CMS-R-131 in plain English.
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    renderPrintable(region, {
      title: 'ABN (CMS-R-131) Box-by-Box Reference',
      warnings: ['Reference only. Not legal advice. CMS publishes the authoritative ABN form and instructions.'],
      sections: [
        { heading: 'Section A - Notifier', paragraphs: ['Your provider\'s name and address. Identifies who is asking you to sign.'] },
        { heading: 'Section B - Patient name', paragraphs: ['Your full legal name as it appears on your Medicare card.'] },
        { heading: 'Section C - Identification number', paragraphs: ['An optional internal account or chart number used by the provider. Not your Medicare number.'] },
        { heading: 'Section D - Item or service',
          paragraphs: ['What the provider believes Medicare may not pay for, written in plain language.'] },
        { heading: 'Section E - Reason Medicare may not pay',
          paragraphs: ['Why the provider expects denial: e.g., "Medicare does not pay for this service for your condition," or "Medicare does not pay for this many of these in this short a time."'] },
        { heading: 'Section F - Estimated cost',
          paragraphs: ['The provider\'s good-faith estimate of what you will owe if Medicare denies the claim.'] },
        { heading: 'Section G - Options',
          items: [
            'Option 1: Receive the item/service. Provider will bill Medicare. You may appeal.',
            'Option 2: Receive the item/service. Provider will NOT bill Medicare. You pay directly. No appeal right.',
            'Option 3: Refuse the item/service. You owe nothing.',
          ] },
        { heading: 'Section H - Additional information', paragraphs: ['Any extra notes the provider wants to record.'] },
        { heading: 'Section I - Signature & Section J - Date',
          paragraphs: ['Your signature and the date. The provider must give you a copy.'] },
      ],
    });
  },

  'msn-decoder'(root) {
    // 107: paste-once flow mirroring the EOB decoder.
    root.appendChild(textarea('Paste MSN text', 'msn', 12));
    root.appendChild(el('p', {}, [el('button', { id: 'msn-btn', type: 'button', text: 'Decode' })]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    document.getElementById('msn-btn').addEventListener('click', () => {
      // The MSN format mirrors EOB enough that the existing parser works.
      const r = decodeEobText(document.getElementById('msn').value);
      clear(out);
      out.appendChild(el('h2', { text: 'Medicare Summary Notice' }));
      const f = r.fields || {};
      const list = [];
      for (const [k, label] of [
        ['allowed', 'Medicare-approved amount'],
        ['planPaid', 'Medicare paid'],
        ['adjustment', 'Provider adjustment / not approved'],
        ['patientResp', 'Maximum you may be billed'],
      ]) {
        if (Number.isFinite(f[k])) list.push(el('li', { text: `${label}: $${f[k].toFixed(2)}` }));
      }
      if (list.length) out.appendChild(el('ul', {}, list));
      out.appendChild(el('p', { class: 'muted', text: 'MSN reflects the previous quarter\'s Original Medicare claims. If you have a Medicare Advantage plan, your plan sends an EOB instead.' }));
    });
  },

  'idr-eligibility'(root) {
    // 108: decision tree built on lib/tree.js (extends NSA).
    const tree = {
      question: 'Were the services emergency services, or air-ambulance services?',
      options: [
        { label: 'Yes - emergency or air ambulance',
          next: { question: 'Did the patient consent in writing to non-network billing using the standard CMS notice?',
            options: [
              { label: 'No', result: 'Likely IDR-eligible (NSA-protected).',
                rationale: 'CAA No Surprises Act / 45 CFR 149: emergency and air-ambulance services without valid notice & consent fall within IDR.' },
              { label: 'Yes', result: 'Likely NOT IDR-eligible.',
                rationale: 'Valid notice & consent removes most NSA protections.' },
            ] } },
        { label: 'No - non-emergency at an in-network facility',
          next: { question: 'Was the provider out-of-network?',
            options: [
              { label: 'Yes', result: 'Likely IDR-eligible.',
                rationale: 'Out-of-network providers at in-network facilities are NSA-protected unless valid consent exists.' },
              { label: 'No', result: 'Likely NOT IDR-eligible (in-network).',
                rationale: 'In-network providers settle billing through normal contract terms, not IDR.' },
            ] } },
        { label: 'Patient is on traditional Medicare or Medicaid',
          result: 'IDR does not apply.',
          rationale: 'Federal IDR is limited to commercial / ERISA / individual market plans. Medicare and Medicaid have their own appeal processes.' },
      ],
    };
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    renderDecisionTree(region, tree, { stateKey: 'idr' });
  },

  'appeal-letter'(root) {
    // 109: deterministic Mad-Libs producing a print-ready letter.
    root.appendChild(el('p', { class: 'notice', text:
      'Reference template only. Not legal advice. Adapt to your plan\'s specific appeal procedure and address.' }));
    const inputs = [
      ['Patient name', 'al-pt'],
      ['Patient member ID', 'al-id'],
      ['Date of service', 'al-dos'],
      ['Provider name', 'al-prov'],
      ['Service / procedure description', 'al-svc'],
      ['Diagnosis (ICD-10)', 'al-dx'],
      ['Plan name', 'al-plan'],
      ['Denial date', 'al-denial'],
      ['Denial reason from EOB', 'al-reason'],
    ];
    for (const [lbl, id] of inputs) root.appendChild(field(lbl, id, 'text'));
    const printRegion = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable letter' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(printRegion);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '[blank]';
      renderPrintable(printRegion, {
        title: 'Appeal of Adverse Determination',
        warnings: ['Educational template. Verify your plan\'s specific appeal address, deadline, and required attachments.'],
        sections: [
          { heading: 'Heading', paragraphs: [
            `Date: ${new Date().toISOString().slice(0, 10)}`,
            `${v('al-plan')} - Appeals Department`,
            `Re: ${v('al-pt')}, Member ID ${v('al-id')}`,
            `Date of service: ${v('al-dos')}; Provider: ${v('al-prov')}`,
          ] },
          { heading: 'Letter body', paragraphs: [
            `To Whom It May Concern,`,
            `I am writing to formally appeal the denial dated ${v('al-denial')} regarding the ${v('al-svc')} provided on ${v('al-dos')} by ${v('al-prov')} for diagnosis ${v('al-dx')}.`,
            `The denial cites: "${v('al-reason')}". I respectfully disagree and request reconsideration based on the medical necessity established in the attached records.`,
            `Please reverse this denial and process the claim. I have attached the following: provider records, an itemized bill, the EOB, and any prior-authorization documentation.`,
            `If you require additional information, please contact me at the address on file.`,
            `Sincerely,`,
            `${v('al-pt')}`,
          ] },
          { heading: 'Attachments', items: [
            'Itemized bill', 'Explanation of Benefits showing denial', 'Provider records', 'Prior-authorization documentation (if applicable)',
          ] },
        ],
      });
    });
  },

  'hipaa-roa'(root) {
    // 110: HIPAA Right of Access (45 CFR 164.524) request generator.
    root.appendChild(el('p', { class: 'notice', text:
      '45 CFR 164.524 grants you the right to access your own records. Covered entities must respond within 30 days (one 30-day extension possible).' }));
    const inputs = [
      ['Patient name', 'roa-pt'],
      ['Date of birth', 'roa-dob'],
      ['Provider / facility name', 'roa-fac'],
      ['Date range requested (e.g., 2024-01-01 to 2025-01-01)', 'roa-range'],
      ['Specific records requested', 'roa-recs'],
      ['Format requested (paper, electronic, secure email)', 'roa-fmt'],
      ['Delivery address (mail / email / portal)', 'roa-deliver'],
    ];
    for (const [lbl, id] of inputs) root.appendChild(field(lbl, id, 'text'));
    const printRegion = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    const btn = el('button', { type: 'button', class: 'render-btn', text: 'Build printable request' });
    root.appendChild(el('p', {}, [btn]));
    root.appendChild(printRegion);
    btn.addEventListener('click', () => {
      const v = (id) => document.getElementById(id).value || '[blank]';
      renderPrintable(printRegion, {
        title: 'HIPAA Right of Access Request - 45 CFR 164.524',
        warnings: ['Fee cap reminder: covered entities may only charge a reasonable, cost-based fee (labor, supplies, postage). Per-page or flat "search" fees are generally not allowed.'],
        sections: [
          { heading: 'Header', paragraphs: [
            `Date: ${new Date().toISOString().slice(0, 10)}`,
            `${v('roa-fac')} - Health Information Management / Privacy Officer`,
          ] },
          { heading: 'Request', paragraphs: [
            `Patient: ${v('roa-pt')}, DOB ${v('roa-dob')}.`,
            `Pursuant to 45 CFR 164.524 I request access to my designated record set for the dates ${v('roa-range')}.`,
            `Specifically: ${v('roa-recs')}.`,
            `Format requested: ${v('roa-fmt')}. Delivery: ${v('roa-deliver')}.`,
            `Please respond within 30 days. If you must extend, you may take one additional 30 days with written notice. The fee is limited to actual labor, supplies, and postage as required by 45 CFR 164.524(c)(4).`,
          ] },
          { heading: 'Signature', paragraphs: [
            `Signed: __________________________  Date: __________`,
            `Printed name: ${v('roa-pt')}`,
          ] },
        ],
      });
    });
  },

  'birthday-rule'(root) {
    // 111: form -> pure resolver -> result card.
    root.appendChild(el('p', { class: 'notice', text:
      'Reference only. Some plans (e.g., self-funded ERISA) interpret the birthday rule differently. Always confirm with the plans involved.' }));
    root.appendChild(field('Parent A date of birth (YYYY-MM-DD)', 'br-a-dob', 'text'));
    root.appendChild(field('Parent B date of birth (YYYY-MM-DD)', 'br-b-dob', 'text'));
    const custodyP = el('p', {}, [el('label', { for: 'br-cust', text: 'Custody' }), el('br'), el('select', { id: 'br-cust' }, [
      el('option', { value: 'shared', text: 'Shared / married' }),
      el('option', { value: 'custodial-A', text: 'Parent A is custodial' }),
      el('option', { value: 'custodial-B', text: 'Parent B is custodial' }),
    ])]);
    const orderP = el('p', {}, [el('label', { for: 'br-court', text: 'Court order' }), el('br'), el('select', { id: 'br-court' }, [
      el('option', { value: '', text: 'No court order' }),
      el('option', { value: 'A', text: 'Court order assigns Parent A' }),
      el('option', { value: 'B', text: 'Court order assigns Parent B' }),
    ])]);
    root.appendChild(custodyP); root.appendChild(orderP);
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      const aDob = document.getElementById('br-a-dob').value.trim();
      const bDob = document.getElementById('br-b-dob').value.trim();
      if (!aDob || !bDob) return;
      try {
        const r = birthdayRulePrimary({
          parentA: { dob: aDob }, parentB: { dob: bDob },
          custodyArrangement: document.getElementById('br-cust').value,
          courtOrder: document.getElementById('br-court').value || null,
        });
        const label = r.primary === 'A' ? 'Parent A' : r.primary === 'B' ? 'Parent B' : 'Tie - longer-tenured plan governs';
        out.appendChild(el('h2', { text: `Primary: ${label}` }));
        out.appendChild(el('p', { text: `Reason: ${r.reason}` }));
      } catch (err) {
        out.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    ['br-a-dob', 'br-b-dob'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('br-cust').addEventListener('change', run);
    document.getElementById('br-court').addEventListener('change', run);
  },

  'cobra-timeline'(root) {
    // 112: live-render absolute dates.
    root.appendChild(field('Qualifying event date (YYYY-MM-DD)', 'cb-date', 'text'));
    const sel = el('select', { id: 'cb-type' });
    for (const k of Object.keys(COBRA_MAX_MONTHS)) sel.appendChild(el('option', { value: k, text: k }));
    root.appendChild(el('p', {}, [el('label', { for: 'cb-type', text: 'Qualifying event type' }), el('br'), sel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      const date = document.getElementById('cb-date').value.trim();
      const type = sel.value;
      if (!date || !type) return;
      try {
        const r = cobraTimeline({ qualifyingEventDate: date, qualifyingEventType: type });
        out.appendChild(el('h2', { text: `COBRA timeline (${r.maxMonths}-month max)` }));
        out.appendChild(el('ol', {}, [
          el('li', { text: `Qualifying event: ${r.qualifyingEventDate}` }),
          el('li', { text: `Election deadline (60 days): ${r.electionDeadline}` }),
          el('li', { text: `First payment deadline (45 days after election): ${r.firstPaymentDeadline}` }),
          el('li', { text: `Coverage end if elected: ${r.coverageEndIfElected}` }),
        ]));
        out.appendChild(el('p', { class: 'muted', text:
          'Reference only. Plan administrators may set earlier internal deadlines or require specific notification procedures.' }));
      } catch (err) {
        out.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    document.getElementById('cb-date').addEventListener('input', run);
    sel.addEventListener('change', run);
  },

  'medicare-enrollment'(root) {
    root.appendChild(field('Date of birth (YYYY-MM-DD)', 'me-dob', 'text'));
    const sel = el('select', { id: 'me-scenario' }, [
      el('option', { value: '', text: 'Standard (turning 65)' }),
      ...Object.keys(SEP_SCENARIOS).map((k) => el('option', { value: k, text: k })),
    ]);
    root.appendChild(el('p', {}, [el('label', { for: 'me-scenario', text: 'First-eligibility scenario' }), el('br'), sel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      const dob = document.getElementById('me-dob').value.trim();
      if (!dob) return;
      try {
        const r = medicareEnrollment({ dob, scenario: sel.value || 'none' });
        out.appendChild(el('h2', { text: `Initial Enrollment Period` }));
        out.appendChild(el('p', { text: `${r.iep.start} through ${r.iep.end} (covers 65th birthday: ${r.iep.birthdayMonth})` }));
        out.appendChild(el('h3', { text: 'General Enrollment Period (current year)' }));
        out.appendChild(el('p', { text: `${r.gep.start} through ${r.gep.end}` }));
        if (r.sep) {
          out.appendChild(el('h3', { text: 'Special Enrollment Period' }));
          out.appendChild(el('p', { text: r.sep.note }));
          if (r.sep.lengthMonths) out.appendChild(el('p', { text: `Window: ${r.sep.lengthMonths} months from ${r.sep.start}.` }));
        }
        out.appendChild(el('p', { class: 'muted', text: r.partDLEP }));
      } catch (err) {
        out.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    document.getElementById('me-dob').addEventListener('input', run);
    sel.addEventListener('change', run);
  },

  'aca-sep'(root) {
    const sel = el('select', { id: 'sep-evt' }, Object.entries(ACA_SEP_EVENTS).map(([k, e]) =>
      el('option', { value: k, text: e.label })));
    root.appendChild(el('p', {}, [el('label', { for: 'sep-evt', text: 'Qualifying life event' }), el('br'), sel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      const e = sepFor(sel.value);
      if (!e) return;
      out.appendChild(el('h2', { text: e.label }));
      const windowText = e.windowAlsoBefore
        ? `Window: ${e.windowAlsoBefore} days before AND ${e.windowDays} days after the event.`
        : `Window: ${e.windowDays} days after the event.`;
      out.appendChild(el('p', { text: windowText }));
      out.appendChild(el('p', { text: `Coverage starts: ${e.coverageStarts}` }));
      out.appendChild(el('h3', { text: 'Documentation typically required' }));
      out.appendChild(el('ul', {}, e.documentation.map((d) => el('li', { text: d }))));
      if (e.note) out.appendChild(el('p', { class: 'muted', text: e.note }));
    };
    sel.addEventListener('change', run);
    run();
  },
};
