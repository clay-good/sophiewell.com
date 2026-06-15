// Group C: Patient Bill and Insurance Tools.
//
// spec-v29 wave 29-2: most Group C tiles removed (decoder, insurance,
// eob-decoder, no-surprises, insurance-card, abn-explainer, msn-decoder,
// idr-eligibility, birthday-rule, cobra-timeline, medicare-enrollment,
// aca-sep). The router sends their permalink hashes to the home view
// with a one-line removed-note (app.js REMOVED_V29_IDS, spec-v29 sec
// 2.7). The surviving workflow generators (appeal-letter, hipaa-roa)
// remain per spec-v29 sec 10 open question 1.

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import { renderPrintable, renderCompleteness } from '../lib/print.js';
import { lintGenerator } from '../lib/regulatory.js';
import * as Pat from '../lib/billing-v82.js';

function field(label, id, type = 'text', placeholder = '') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type, autocomplete: 'off' });
  if (placeholder) inp.setAttribute('placeholder', placeholder);
  wrap.appendChild(inp);
  return wrap;
}

// ---- spec-v82 calculator helpers (mirror views/group-b.js; reads top-to-bottom
// on a phone with no sideways scroll) ----------------------------------------
function numField(label, id, placeholder, value) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off', step: 'any', inputmode: 'decimal' });
  if (placeholder) inp.setAttribute('placeholder', placeholder);
  if (value !== undefined) inp.value = value;
  wrap.appendChild(inp);
  return wrap;
}
function moneyField(label, id, placeholder, value) { return numField(label, id, placeholder, value); }
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id, on) {
  const wrap = el('p');
  const lab = el('label', { for: id });
  const box = el('input', { id, type: 'checkbox' });
  if (on) box.checked = true;
  lab.appendChild(box);
  lab.appendChild(document.createTextNode(' ' + label));
  wrap.appendChild(lab);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function str(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function rawEmpty(id) { return str(id).trim() === ''; }
function numv(id) { return Number(str(id)); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function wire(ids, run) {
  ids.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener('input', run);
    node.addEventListener('change', run);
  });
  run();
}
const usd = (cents) => '$' + fmt(cents / 100, { digits: 2, fallback: '--' });
function derivation(pairs) {
  const dl = el('dl', { class: 'derivation' });
  for (const [term, def] of pairs) {
    if (def === null || def === undefined) continue;
    dl.appendChild(el('dt', { text: term }));
    dl.appendChild(el('dd', { text: def }));
  }
  return dl;
}
function postureNote(text) { return el('p', { class: 'muted', text }); }
function verdictLine(o, text, tone) { o.appendChild(el('p', { class: tone || null, text })); }

export const renderers = {
  'appeal-letter'(root) {
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
      // spec-v63 OA3: completeness check against 42 CFR 405.944(b).
      const filled = (id) => (document.getElementById(id).value || '').trim() !== '';
      renderCompleteness(printRegion, lintGenerator('appeal-letter', {
        name: filled('al-pt'),
        memberId: filled('al-id'),
        service: filled('al-svc') || filled('al-dos'),
        reason: filled('al-reason'),
        basis: filled('al-dx'),
      }));
    });
  },

  'hipaa-roa'(root) {
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
      // spec-v63 OA3: completeness check against 45 CFR 164.524.
      const filled = (id) => (document.getElementById(id).value || '').trim() !== '';
      renderCompleteness(printRegion, lintGenerator('hipaa-roa', {
        individual: filled('roa-pt') || filled('roa-dob'),
        entity: filled('roa-fac'),
        records: filled('roa-recs') || filled('roa-range'),
        format: filled('roa-fmt'),
        delivery: filled('roa-deliver'),
      }));
    });
  },

  // ===== spec-v82: patient responsibility & coordination of benefits =========
  // spec-v78 computes what the payer pays; these four compute what the PATIENT
  // owes. Money is integer cents; the renderer converts dollars at the edge and
  // formats once through fmt(). The protection / network gate is hard, never
  // advisory. lib/billing-v82.js.

  // ----- 2.1 medicare-cost-share -------------------------------------------
  'medicare-cost-share'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'The Medicare patient liability that lands on the statement -- Part B (annual deductible then 20% of the approved amount), Part A inpatient (the per-benefit-period deductible, days 61-90 and lifetime-reserve coinsurance), or SNF (days 21-100 daily coinsurance). This is the share BEFORE any Medigap / secondary coverage -- run cob-calc to coordinate it. Defaults are the CY2026 CMS amounts; override for a prior year.' }));
    root.appendChild(selectField('Coverage', 'mc-part', [
      { value: 'B', text: 'Part B (outpatient / physician)' },
      { value: 'A', text: 'Part A inpatient hospital' },
      { value: 'SNF', text: 'Skilled nursing facility (SNF)' },
    ]));
    root.appendChild(moneyField('Part B: Medicare-approved amount ($)', 'mc-allowed', '500'));
    root.appendChild(moneyField('Part B: deductible remaining ($)', 'mc-ded', '283', '283'));
    root.appendChild(numField('Part A / SNF: length of stay (days)', 'mc-days', '95'));
    root.appendChild(numField('Part A: lifetime-reserve days elected', 'mc-lrd', '0', '0'));
    root.appendChild(checkField('Part A: per-benefit-period deductible not yet met', 'mc-ded-applies', true));
    const o = out(); root.appendChild(o);
    wire(['mc-part', 'mc-allowed', 'mc-ded', 'mc-days', 'mc-lrd', 'mc-ded-applies'], () => safe(o, () => {
      const part = str('mc-part') || 'B';
      let r;
      if (part === 'B') {
        if (rawEmpty('mc-allowed')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the Medicare-approved amount.' })); return; }
        r = Pat.medicareCostShare({ part: 'B',
          allowedCents: Pat.dollarsToCents(numv('mc-allowed')),
          deductibleRemainingCents: rawEmpty('mc-ded') ? Pat.PART_B_DEDUCTIBLE_CY2026 : Pat.dollarsToCents(numv('mc-ded')) });
        const afterDed = r.allowedCents - r.deductibleAppliedCents;
        o.appendChild(el('h2', { text: `Patient owes ${usd(r.patientCents)}` }));
        verdictLine(o, r.note);
        o.appendChild(derivation([
          ['Coverage', 'Part B'],
          ['Medicare-approved amount', usd(r.allowedCents)],
          ['Deductible applied', usd(r.deductibleAppliedCents)],
          [`Coinsurance (20% of ${usd(afterDed)})`, usd(r.coinsuranceCents)],
          ['Patient responsibility', usd(r.patientCents)],
          ['Medicare pays', usd(r.programPaysCents)],
        ]));
      } else if (part === 'A') {
        if (rawEmpty('mc-days')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the length of stay in days.' })); return; }
        r = Pat.medicareCostShare({ part: 'A',
          lengthOfStay: numv('mc-days'),
          deductibleApplies: checked('mc-ded-applies'),
          lifetimeReserveElected: rawEmpty('mc-lrd') ? 0 : numv('mc-lrd') });
        o.appendChild(el('h2', { text: `Patient owes ${usd(r.patientCents)}` }));
        verdictLine(o, r.note, r.uncoveredDays > 0 ? 'flag' : null);
        o.appendChild(derivation([
          ['Coverage', `Part A inpatient, ${r.lengthOfStay} day(s)`],
          ['Per-benefit-period deductible', usd(r.deductibleCents)],
          [`Days 61-90 coinsurance (${r.days6190} day(s))`, usd(r.coins6190Cents)],
          [`Lifetime-reserve days used (${r.lrdUsed})`, usd(r.coinsLrdCents)],
          ['Uncovered days past day 90', r.uncoveredDays > 0 ? `${r.uncoveredDays} (patient liable for ALL costs)` : '0'],
          ['Patient responsibility', usd(r.patientCents)],
        ]));
      } else {
        if (rawEmpty('mc-days')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the SNF length of stay in days.' })); return; }
        r = Pat.medicareCostShare({ part: 'SNF', snfDays: numv('mc-days') });
        o.appendChild(el('h2', { text: `Patient owes ${usd(r.patientCents)}` }));
        verdictLine(o, r.note, r.uncoveredDays > 0 ? 'flag' : null);
        o.appendChild(derivation([
          ['Coverage', `SNF, ${r.snfDays} day(s)`],
          ['Days 1-20', '$0.00 (fully covered)'],
          [`Days 21-100 coinsurance (${r.coinsuranceDays} day(s) x ${usd(r.snfDailyCents)})`, usd(r.patientCents)],
          ['Uncovered days past day 100', r.uncoveredDays > 0 ? `${r.uncoveredDays} (patient liable for ALL costs)` : '0'],
          ['Patient responsibility', usd(r.patientCents)],
        ]));
      }
      o.appendChild(postureNote('SSA Title XVIII; CMS CY2026 Medicare cost-sharing amounts. This is the rule\'s math, not a coverage determination -- it is the patient share BEFORE Medigap / secondary coverage. Near-neighbor: sequestration-adjust reduces the program payment, NOT this patient share.'));
    }));
  },

  // ----- 2.2 cob-calc -------------------------------------------------------
  'cob-calc'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Coordinates a dual-coverage claim: given what the primary allowed and paid, the secondary\'s allowed and what it would pay as primary, it computes the secondary payment and the patient\'s residual under each named method -- lesser-of, come-out-whole, non-duplication, or Medicare Secondary Payer. The method is explicit; the tool never silently picks one. The single most error-prone arithmetic in a billing office.' }));
    root.appendChild(selectField('COB method', 'cob-method', [
      { value: 'lesser-of', text: 'Lesser-of (standard COB)' },
      { value: 'come-out-whole', text: 'Come-out-whole (benefits-less-paid)' },
      { value: 'non-duplication', text: 'Non-duplication' },
      { value: 'msp', text: 'Medicare Secondary Payer (MSP)' },
    ]));
    root.appendChild(moneyField('Billed charge ($)', 'cob-charge', '1000'));
    root.appendChild(moneyField('Primary allowed ($)', 'cob-pri-allowed', '600'));
    root.appendChild(moneyField('Primary paid ($)', 'cob-pri-paid', '480'));
    root.appendChild(moneyField('Secondary allowed ($)', 'cob-sec-allowed', '500'));
    root.appendChild(moneyField('Secondary would-pay as primary ($)', 'cob-sec-would', '400'));
    const o = out(); root.appendChild(o);
    wire(['cob-method', 'cob-charge', 'cob-pri-allowed', 'cob-pri-paid', 'cob-sec-allowed', 'cob-sec-would'], () => safe(o, () => {
      if (rawEmpty('cob-pri-allowed') || rawEmpty('cob-pri-paid')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the primary allowed and paid amounts.' })); return; }
      const r = Pat.cobCalc({
        method: str('cob-method') || 'lesser-of',
        billedChargeCents: Pat.dollarsToCents(numv('cob-charge') || 0),
        primaryAllowedCents: Pat.dollarsToCents(numv('cob-pri-allowed')),
        primaryPaidCents: Pat.dollarsToCents(numv('cob-pri-paid')),
        secondaryAllowedCents: Pat.dollarsToCents(numv('cob-sec-allowed') || 0),
        secondaryWouldPayCents: Pat.dollarsToCents(numv('cob-sec-would') || 0),
      });
      o.appendChild(el('h2', { text: `Secondary pays ${usd(r.secondaryPaysCents)}; patient owes ${usd(r.patientResidualCents)}` }));
      verdictLine(o, r.note, r.patientResidualCents > 0 ? 'flag' : null);
      o.appendChild(derivation([
        ['Method', r.method],
        ['Balance after primary (allowed - paid)', usd(r.patientAfterPrimaryCents)],
        ['Secondary payment', usd(r.secondaryPaysCents)],
        ['Patient residual', usd(r.patientResidualCents)],
        ['Contractual write-off (charge - primary allowed)', usd(r.writeOffCents)],
      ]));
      o.appendChild(postureNote('42 CFR Part 411; CMS Pub. 100-05 (Medicare Secondary Payer Manual). The patient share after the primary is the primary allowed minus the primary payment (the charge-minus-allowed gap is a contractual write-off -- see allowed-amount). Near-neighbor: medicare-cost-share computes the Medicare-primary share this can coordinate.'));
    }));
  },

  // ----- 2.3 allowed-amount -------------------------------------------------
  'allowed-amount'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Reconciles a single-payer line: the contractual write-off (charge minus the contracted allowed), the patient responsibility (deductible + coinsurance/copay on the ALLOWED, not the charge), and the payer payment. On an in-network claim the charge-minus-allowed gap must be written off, NOT billed to the patient (balance billing is prohibited); out-of-network the tool refuses to invent a write-off.' }));
    root.appendChild(moneyField('Billed charge ($)', 'aa-charge', '1000'));
    root.appendChild(moneyField('Contracted allowed amount ($)', 'aa-allowed', '600'));
    root.appendChild(moneyField('Deductible remaining ($)', 'aa-ded', '100', '0'));
    root.appendChild(numField('Coinsurance (%)', 'aa-coins', '20', '0'));
    root.appendChild(moneyField('Copay ($)', 'aa-copay', '0', '0'));
    root.appendChild(checkField('Provider is in-network (write-off required)', 'aa-innet', true));
    const o = out(); root.appendChild(o);
    wire(['aa-charge', 'aa-allowed', 'aa-ded', 'aa-coins', 'aa-copay', 'aa-innet'], () => safe(o, () => {
      if (rawEmpty('aa-charge') || rawEmpty('aa-allowed')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the billed charge and the contracted allowed amount.' })); return; }
      const r = Pat.allowedAmount({
        billedChargeCents: Pat.dollarsToCents(numv('aa-charge')),
        allowedCents: Pat.dollarsToCents(numv('aa-allowed')),
        deductibleRemainingCents: Pat.dollarsToCents(numv('aa-ded') || 0),
        coinsurancePct: numv('aa-coins') || 0,
        copayCents: Pat.dollarsToCents(numv('aa-copay') || 0),
        inNetwork: checked('aa-innet'),
      });
      o.appendChild(el('h2', { text: `Patient owes ${usd(r.patientResponsibilityCents)}` }));
      verdictLine(o, r.note, r.balanceBillProhibited ? 'flag' : null);
      o.appendChild(derivation([
        ['Network status', r.inNetwork ? 'In-network' : 'Out-of-network'],
        ['Contractual write-off', r.inNetwork ? usd(r.contractualWriteOffCents) : 'none (out-of-network)'],
        ['Deductible applied', usd(r.deductibleAppliedCents)],
        ['Coinsurance', usd(r.coinsuranceCents)],
        ['Copay', usd(r.copayCents)],
        ['Patient responsibility', usd(r.patientResponsibilityCents)],
        ['Payer payment', usd(r.payerPaymentCents)],
        ['Balance billing the gap', r.balanceBillProhibited ? 'PROHIBITED (must be written off)' : (r.inNetwork ? 'n/a (charge = allowed)' : 'permitted (out-of-network)')],
      ]));
      o.appendChild(postureNote('Third-party-payer contract accounting; the prohibition on balance-billing a contracted allowable. allowed = payer payment + patient responsibility; charge = allowed + write-off. Near-neighbor: era-balance (v83) checks a posted remittance balances; this projects it from the contract.'));
    }));
  },

  // ----- 2.4 nsa-cost-share -------------------------------------------------
  'nsa-cost-share'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'The legally maximum a patient owes on a surprise bill. For an NSA-protected service (emergency, or ancillary care at an in-network facility) the cost-share is computed as if in-network off the Qualifying Payment Amount (QPA), and balance billing is prohibited. A non-protected service gets a hard refusal -- the cap does NOT apply. Computes the cost-share number only, not an NSA/IDR eligibility tree.' }));
    root.appendChild(selectField('Service category', 'nsa-cat', [
      { value: 'emergency', text: 'Protected: emergency service' },
      { value: 'ancillary-in-network-facility', text: 'Protected: ancillary at an in-network facility' },
      { value: 'non-protected', text: 'Not protected (cap does NOT apply)' },
    ]));
    root.appendChild(moneyField('Qualifying Payment Amount / QPA ($)', 'nsa-qpa', '800'));
    root.appendChild(moneyField('Provider billed charge ($)', 'nsa-charge', '1000'));
    root.appendChild(moneyField('Deductible remaining ($)', 'nsa-ded', '0', '0'));
    root.appendChild(numField('Coinsurance (%)', 'nsa-coins', '20', '0'));
    root.appendChild(moneyField('Copay ($)', 'nsa-copay', '0', '0'));
    const o = out(); root.appendChild(o);
    wire(['nsa-cat', 'nsa-qpa', 'nsa-charge', 'nsa-ded', 'nsa-coins', 'nsa-copay'], () => safe(o, () => {
      if (rawEmpty('nsa-qpa')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the QPA for the service.' })); return; }
      const r = Pat.nsaCostShare({
        serviceCategory: str('nsa-cat') || 'emergency',
        qpaCents: Pat.dollarsToCents(numv('nsa-qpa')),
        billedChargeCents: Pat.dollarsToCents(numv('nsa-charge') || 0),
        deductibleRemainingCents: Pat.dollarsToCents(numv('nsa-ded') || 0),
        coinsurancePct: numv('nsa-coins') || 0,
        copayCents: Pat.dollarsToCents(numv('nsa-copay') || 0),
      });
      if (!r.protected) {
        o.appendChild(el('h2', { text: 'Not NSA-protected' }));
        verdictLine(o, r.note, 'flag');
        o.appendChild(postureNote('No Surprises Act (PHSA §2799A-1/§2799A-2; 45 CFR Part 149). The cap applies only to protected services; this is the rule\'s math, not a protection determination.'));
        return;
      }
      o.appendChild(el('h2', { text: `Patient owes ${usd(r.patientCostShareCents)}` }));
      verdictLine(o, r.note, 'flag');
      o.appendChild(derivation([
        ['Protected service', r.serviceCategory === 'emergency' ? 'emergency' : 'ancillary at in-network facility'],
        ['Qualifying Payment Amount (QPA)', usd(r.qpaCents)],
        ['Deductible applied', usd(r.deductibleAppliedCents)],
        ['Coinsurance', usd(r.coinsuranceCents)],
        ['Copay', usd(r.copayCents)],
        ['Patient cost-share (capped at in-network)', usd(r.patientCostShareCents)],
        ['Plan pays', usd(r.planPaysCents)],
        ['Prohibited balance bill', usd(r.prohibitedBalanceBillCents)],
      ]));
      o.appendChild(postureNote('No Surprises Act (PHSA §2799A-1/§2799A-2; 45 CFR Part 149). Balance billing the amount above the QPA is prohibited for a protected service. Computes the cost-share number only -- not the NSA/IDR eligibility process.'));
    }));
  },
};
