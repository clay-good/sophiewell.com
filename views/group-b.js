// spec-v78 §2: Group B "Billing & Reimbursement" -- the five MPFS reimbursement
// renderers (spec-v77 program). Same input/render contract as the rest of the
// catalog: every input has a real <label for>, no innerHTML, no network beyond
// the same-origin bundled CMS data, no storage; nullable / not-payable outputs
// route through safe(). Money is formatted once at the edge through fmt()
// (lib/num.js) so no NaN / Infinity / undefined can reach the DOM. Each tile
// renders the spec-v77 §2 "this is the rule's math, not a payment guarantee or
// coding advice" posture note; the inline citation is rendered by the shared
// References block (renderMetaBlock) from META[id].
//
// The reimbursement chain composes in a fixed order (spec-v78 §3): base allowed
// (rvu-payment) -> bilateral -> multiple-procedure ranking (mppr) -> assistant /
// co / team percentage (multi-surgeon-pay) -> sequestration (sequestration-adjust).
// Each tile states where in the chain it sits.

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import { loadAllShards, loadFile } from '../lib/data.js';
import * as Bill from '../lib/billing-v78.js';
import * as Edit from '../lib/billing-v79.js';

// ---- shared local helpers (mirrors views/group-v63.js) ----------------------
function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'text', autocomplete: 'off' });
  if (opts.type === 'number') {
    inp.setAttribute('step', opts.step || 'any');
    inp.setAttribute('inputmode', opts.inputmode || 'decimal');
  }
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  if (opts.value !== undefined) inp.value = opts.value;
  wrap.appendChild(inp);
  return wrap;
}
function moneyField(label, id, placeholder) {
  return field(label, id, { type: 'number', inputmode: 'decimal', placeholder });
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function str(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function rawEmpty(id) { return str(id).trim() === ''; }
function numv(id) { return Number(str(id)); }
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
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
const usd = (cents) => '$' + fmt(cents / 100, { digits: 2, fallback: '--' });
// A definition-list derivation (spec-v48 <dl> show-your-work block); reads
// top-to-bottom on a phone with no sideways scroll.
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
const r2 = (n) => Math.round(n * 100) / 100;
function dateField(label, id) { return field(label, id, { type: 'date' }); }
// A labeled checkbox (its <label> wraps the box so the whole row is the hit
// target; reads top-to-bottom on a phone with no sideways scroll).
function checkField(label, id) {
  const wrap = el('p');
  const lab = el('label', { for: id });
  lab.appendChild(el('input', { id, type: 'checkbox' }));
  lab.appendChild(document.createTextNode(' ' + label));
  wrap.appendChild(lab);
  return wrap;
}
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
// Render a verdict line; `tone` 'flag' (red) for a not-payable / refusal gate,
// null for a normal/payable verdict.
function verdictLine(o, text, tone) { o.appendChild(el('p', { class: tone || null, text })); }

export const renderers = {
  // ----- 2.1 rvu-payment ----------------------------------------------------
  'rvu-payment'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Computes the Medicare-allowed amount for one professional line from RVUs, the locality GPCI, and the conversion factor. The bundled RVU/GPCI/CF values are a convenience; enter your own to model any code, locality, or percent-of-Medicare contract. This is the fee-schedule math, not a payment guarantee.' }));

    root.appendChild(field('CPT / HCPCS code (optional -- fills bundled RVUs)', 'rvu-code', { placeholder: '99214' }));
    root.appendChild(moneyField('Work RVU', 'rvu-work', '1.92'));
    root.appendChild(moneyField('Practice-expense RVU (non-facility)', 'rvu-penf', '1.5'));
    root.appendChild(moneyField('Practice-expense RVU (facility)', 'rvu-pef', '0.69'));
    root.appendChild(moneyField('Malpractice RVU', 'rvu-mp', '0.13'));

    const locSel = selectField('Medicare locality (or enter GPCI by hand)', 'rvu-loc', [
      { value: 'manual', text: 'Enter GPCI triplet by hand' },
    ]);
    root.appendChild(locSel);
    root.appendChild(moneyField('Work GPCI', 'rvu-wg', '1.000'));
    root.appendChild(moneyField('Practice-expense GPCI', 'rvu-peg', '1.000'));
    root.appendChild(moneyField('Malpractice GPCI', 'rvu-mpg', '1.000'));
    root.appendChild(moneyField('Conversion factor ($ per RVU)', 'rvu-cf', '32.7442'));
    root.appendChild(field('Units', 'rvu-units', { type: 'number', inputmode: 'numeric', placeholder: '1' }));

    const o = out(); root.appendChild(o);

    // Bundled-data convenience layer (doctrine clause 2): load the MPFS RVU rows,
    // the GPCI triplets, and the default conversion factor. The tile works fully
    // without them (manual entry); a load failure degrades silently to manual.
    const rvuByCode = new Map();
    const gpciByLocality = new Map();
    const sel = document.getElementById('rvu-loc');

    function fillFromCode() {
      const row = rvuByCode.get(str('rvu-code').trim().toUpperCase());
      if (!row) return;
      document.getElementById('rvu-work').value = row.workRvu;
      document.getElementById('rvu-penf').value = row.peRvuNonFacility;
      document.getElementById('rvu-pef').value = row.peRvuFacility;
      document.getElementById('rvu-mp').value = row.mpRvu;
    }
    function fillFromLocality() {
      const code = str('rvu-loc');
      if (code === 'manual') return;
      const g = gpciByLocality.get(code);
      if (!g) return;
      document.getElementById('rvu-wg').value = g.workGpci;
      document.getElementById('rvu-peg').value = g.peGpci;
      document.getElementById('rvu-mpg').value = g.mpGpci;
    }
    document.getElementById('rvu-code').addEventListener('input', fillFromCode);
    document.getElementById('rvu-code').addEventListener('change', fillFromCode);
    sel.addEventListener('change', fillFromLocality);

    function run() {
      safe(o, () => {
        if (!(numv('rvu-cf') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the conversion factor.' })); return; }
        if (rawEmpty('rvu-work') && rawEmpty('rvu-penf') && rawEmpty('rvu-pef') && rawEmpty('rvu-mp')) {
          o.appendChild(el('p', { class: 'muted', text: 'Enter a CPT/HCPCS code or the RVU components.' })); return;
        }
        if (!(numv('rvu-wg') > 0) || !(numv('rvu-peg') > 0) || !(numv('rvu-mpg') > 0)) {
          o.appendChild(el('p', { class: 'muted', text: 'Enter the GPCI triplet (or pick a locality).' })); return;
        }
        const r = Bill.rvuPayment({
          workRvu: numv('rvu-work') || 0,
          peRvuNonFacility: numv('rvu-penf') || 0,
          peRvuFacility: numv('rvu-pef') || 0,
          mpRvu: numv('rvu-mp') || 0,
          workGpci: numv('rvu-wg'), peGpci: numv('rvu-peg'), mpGpci: numv('rvu-mpg'),
          conversionFactor: numv('rvu-cf'), units: Math.max(1, Math.round(numv('rvu-units') || 1)),
        });
        o.appendChild(el('h2', { text: `Non-facility allowed: ${usd(r.nonFacilityCents)}` }));
        o.appendChild(el('p', { text: `Facility allowed: ${usd(r.facilityCents)}` }));
        o.appendChild(el('h3', { text: 'How this is computed' }));
        o.appendChild(derivation([
          ['Work x GPCI', `${r2(r.adjWork)} adjusted RVU`],
          ['PE x GPCI (non-facility)', `${r2(r.adjPeNonFacility)} adjusted RVU`],
          ['PE x GPCI (facility)', `${r2(r.adjPeFacility)} adjusted RVU`],
          ['MP x GPCI', `${r2(r.adjMp)} adjusted RVU`],
          ['Total RVU (non-facility)', `${r2(r.totalRvuNonFacility)}`],
          ['Total RVU (facility)', `${r2(r.totalRvuFacility)}`],
          ['x Conversion factor', `$${fmt(numv('rvu-cf'), { digits: 4 })} per RVU${r.units > 1 ? `, x ${r.units} units` : ''}`],
          ['Site-of-service differential', `${usd(r.siteDifferentialCents)} more in the non-facility setting`],
        ]));
        o.appendChild(postureNote('42 CFR 414.20-414.22 (RVU + GPCI); the dated CMS PFS conversion factor. This is the professional fee; the facility payment (DRG/APC) is computed separately. The anchor amount every other v78 reduction is taken from.'));
      });
    }
    wire(['rvu-code', 'rvu-work', 'rvu-penf', 'rvu-pef', 'rvu-mp', 'rvu-loc', 'rvu-wg', 'rvu-peg', 'rvu-mpg', 'rvu-cf', 'rvu-units'], run);

    loadFile('mpfs', 'conversion-factor.json').then((cf) => {
      if (!root.isConnected) return;
      if (cf && typeof cf.conversionFactor === 'number' && rawEmpty('rvu-cf')) {
        document.getElementById('rvu-cf').value = cf.conversionFactor;
        run();
      }
    }).catch(() => {});
    loadFile('mpfs', 'gpci.json').then((rows) => {
      if (!root.isConnected || !Array.isArray(rows)) return;
      for (const g of rows) gpciByLocality.set(g.localityCode, g);
      for (const g of rows) sel.appendChild(el('option', { value: g.localityCode, text: g.name }));
      if (gpciByLocality.size) { sel.value = rows[0].localityCode; fillFromLocality(); run(); }
    }).catch(() => {});
    loadAllShards('mpfs').then((rows) => {
      if (!root.isConnected || !Array.isArray(rows)) return;
      for (const row of rows) if (row && row.code) rvuByCode.set(String(row.code).toUpperCase(), row);
    }).catch(() => {});
  },

  // ----- 2.2 mppr -----------------------------------------------------------
  'mppr'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Re-ranks surgical lines by fee and applies the multiple-procedure reduction: 100% of the highest, the cited percentage on each subsequent line. The reduction is the math; it does not decide whether a line is separately reportable.' }));
    root.appendChild(selectField('Reduction policy', 'mppr-mode', [
      { value: 'surgical', text: 'Surgical 100 / 50 / 50 (Pub. 100-04 Ch.12 40.6)' },
      { value: 'endoscopy', text: 'Endoscopy base-code rule (40.7)' },
      { value: 'custom', text: 'Other category -- set the subsequent percentage' },
    ]));
    root.appendChild(field('Subsequent-line percentage', 'mppr-pct', { type: 'number', inputmode: 'numeric', placeholder: '50', value: '50' }));
    root.appendChild(moneyField('Endoscopic base value ($, endoscopy only)', 'mppr-base', '200.00'));

    const rowsContainer = el('div');
    const addBtn = el('button', { type: 'button', text: 'Add line' });
    root.appendChild(rowsContainer);
    root.appendChild(el('p', {}, [addBtn]));
    const o = out(); root.appendChild(o);
    let counter = 0;

    function run() {
      safe(o, () => {
        const fees = [];
        for (const row of rowsContainer.querySelectorAll('.mppr-row')) {
          const v = Number(document.getElementById(`${row.id}-fee`).value);
          if (v > 0) fees.push(Math.round(v * 100));
        }
        if (!fees.length) { o.appendChild(el('p', { class: 'muted', text: 'Add at least one line fee.' })); return; }
        const mode = str('mppr-mode');
        const r = Bill.mppr({
          lines: fees.map((feeCents) => ({ feeCents })),
          mode,
          subsequentPct: mode === 'custom' ? (Number(str('mppr-pct')) || 50) : 50,
          baseFeeCents: mode === 'endoscopy' ? Math.round((Number(str('mppr-base')) || 0) * 100) : 0,
        });
        o.appendChild(el('h2', { text: `Total expected allowed: ${usd(r.allowedTotalCents)}` }));
        o.appendChild(el('p', { text: `Withheld by the reduction: ${usd(r.withheldCents)} (full ${usd(r.fullCents)}).` }));
        o.appendChild(el('h3', { text: 'Per-line, ranked by fee' }));
        o.appendChild(el('ul', {}, r.lines.map((l) =>
          li(`Rank ${l.rank}: ${usd(l.feeCents)} fee -> ${usd(l.allowedCents)} allowed (${l.appliedPct}%).`))));
        o.appendChild(postureNote('CMS Pub. 100-04 Claims Processing Manual, Ch. 12 40.6 (surgical 100/50/50) / 40.7 (endoscopy base rule). Pair with bilateral-pay for a single line at 150%.'));
      });
    }

    function addRow(initial) {
      counter += 1;
      const id = `mppr-row-${counter}`;
      const fee = el('input', { id: `${id}-fee`, type: 'number', step: 'any', inputmode: 'decimal', placeholder: 'line fee $', 'aria-label': `Line fee in dollars (line ${counter})` });
      if (initial !== undefined) fee.value = initial;
      const rm = el('button', { type: 'button', text: 'Remove' });
      const row = el('p', { class: 'mppr-row', id }, [fee, ' ', rm]);
      rm.addEventListener('click', () => { row.remove(); run(); });
      fee.addEventListener('input', run);
      rowsContainer.appendChild(row);
    }
    addBtn.addEventListener('click', () => { addRow(); run(); });
    ['mppr-mode', 'mppr-pct', 'mppr-base'].forEach((mid) => {
      const n = document.getElementById(mid);
      n.addEventListener('input', run); n.addEventListener('change', run);
    });
    addRow(); addRow();
    run();
  },

  // ----- 2.3 bilateral-pay --------------------------------------------------
  'bilateral-pay'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Returns the payable amount for a modifier-50 bilateral service by the code\'s MPFS bilateral indicator. The indicator gates payment; it never guesses. This is the rule\'s math, not a coverage determination.' }));
    root.appendChild(moneyField('Line fee ($, the one-side fee schedule amount)', 'bil-fee', '500.00'));
    root.appendChild(selectField('MPFS bilateral (BILAT SURG) indicator', 'bil-ind', [
      { value: '1', text: '1 -- 150% of the fee for the pair (most surgical codes)' },
      { value: '2', text: '2 -- already priced as bilateral (pay 100%)' },
      { value: '3', text: '3 -- pay each side at full (200%)' },
      { value: '0', text: '0 -- modifier 50 not payable for this code' },
      { value: '9', text: '9 -- concept does not apply' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['bil-fee', 'bil-ind'], () => safe(o, () => {
      if (!(numv('bil-fee') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the one-side line fee.' })); return; }
      const r = Bill.bilateralPay({ feeCents: Math.round(numv('bil-fee') * 100), indicator: Math.round(numv('bil-ind')) });
      if (r.payable) {
        o.appendChild(el('h2', { text: `Bilateral allowed: ${usd(r.allowedCents)} (${r.factorPct}%)` }));
      } else {
        o.appendChild(el('h2', { text: 'Not payable as bilateral' }));
      }
      o.appendChild(el('p', { class: r.payable ? null : 'flag', text: r.note }));
      o.appendChild(postureNote('CMS Pub. 100-04, Ch. 12 40.7; MPFS BILAT SURG indicator. Stops the two common errors: billing 50 on an indicator-0 code, and expecting 200% where the code is already priced bilaterally.'));
    }));
  },

  // ----- 2.4 multi-surgeon-pay ----------------------------------------------
  'multi-surgeon-pay'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Returns the allowed amount for an assistant, co-surgeon, or team surgeon as a percentage of the primary fee, gated by the code\'s matching MPFS surgical indicator. The indicator decides whether the role is payable at all. Confirm code selection and documentation.' }));
    root.appendChild(moneyField('Primary-surgeon fee ($)', 'ms-fee', '2000.00'));
    root.appendChild(selectField('Role', 'ms-role', [
      { value: 'assistant', text: 'Assistant at surgery (modifier 80/81/82, or AS) -- 16%' },
      { value: 'co', text: 'Co-surgeon (modifier 62) -- 62.5% to each' },
      { value: 'team', text: 'Team surgeon (modifier 66) -- by report' },
    ]));
    root.appendChild(selectField('Matching MPFS surgical indicator for this code', 'ms-ind', [
      { value: '2', text: '2 -- payable' },
      { value: '1', text: '1 -- payable with documentation' },
      { value: '0', text: '0 -- not separately payable for this code' },
      { value: '9', text: '9 -- concept does not apply' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ms-fee', 'ms-role', 'ms-ind'], () => safe(o, () => {
      if (!(numv('ms-fee') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the primary-surgeon fee.' })); return; }
      const r = Bill.multiSurgeonPay({ feeCents: Math.round(numv('ms-fee') * 100), role: str('ms-role'), indicator: Math.round(numv('ms-ind')) });
      if (r.payable && r.byReport) {
        o.appendChild(el('h2', { text: 'By report (carrier-priced)' }));
      } else if (r.payable) {
        o.appendChild(el('h2', { text: `Allowed for this role: ${usd(r.allowedCents)} (${r.factorPct}%)` }));
      } else {
        o.appendChild(el('h2', { text: 'Not separately payable' }));
      }
      o.appendChild(el('p', { class: r.payable ? null : 'flag', text: r.note }));
      o.appendChild(postureNote('CMS Pub. 100-04, Ch. 12 20.4.3 / 40.8; MPFS ASST SURG / CO SURG / TEAM SURG indicators. The base fee comes from rvu-payment.'));
    }));
  },

  // ----- 2.5 sequestration-adjust -------------------------------------------
  'sequestration-adjust'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Applies the 2% Medicare sequestration cut to the program-payment portion only -- never to the allowed amount or the patient\'s cost-share. The last reduction in the chain, after rvu-payment and mppr.' }));
    root.appendChild(moneyField('Medicare-allowed amount ($)', 'seq-allowed', '100.00'));
    root.appendChild(moneyField('Patient deductible + coinsurance ($)', 'seq-patient', '20.00'));
    root.appendChild(field('Sequestration percentage', 'seq-pct', { type: 'number', inputmode: 'decimal', placeholder: '2', value: '2' }));
    const o = out(); root.appendChild(o);
    wire(['seq-allowed', 'seq-patient', 'seq-pct'], () => safe(o, () => {
      if (!(numv('seq-allowed') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the Medicare-allowed amount.' })); return; }
      const r = Bill.sequestrationAdjust({
        allowedCents: Math.round(numv('seq-allowed') * 100),
        patientResponsibilityCents: Math.round((numv('seq-patient') || 0) * 100),
        seqPct: numv('seq-pct') >= 0 ? numv('seq-pct') : Bill.SEQUESTRATION_PCT,
      });
      o.appendChild(el('h2', { text: `Net Medicare check: ${usd(r.netPaymentCents)}` }));
      o.appendChild(derivation([
        ['Program-payment base (allowed - patient cost-share)', usd(r.programPaymentCents)],
        [`Sequestration withheld (${r.seqPct}%)`, usd(r.sequestrationCents)],
        ['Net payment to the provider', usd(r.netPaymentCents)],
      ]));
      o.appendChild(postureNote('Budget Control Act of 2011 (Pub. L. 112-25) 251A. Sequestration reduces the payment, never the allowed amount or the beneficiary\'s coinsurance.'));
    }));
  },

  // ===== spec-v79: claim edits & modifier logic ============================
  // v78 prices the line; these five decide whether the line survives. No NCCI
  // PTP / MUE table ships (doctrine clause 2): the indicator / MUE value is an
  // input, so the tool can never be silently stale. Indicators gate, never guess.

  // ----- 2.1 ncci-ptp -------------------------------------------------------
  'ncci-ptp'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Decides whether a code pair is an NCCI procedure-to-procedure edit and whether a modifier can unbundle it. Look the pair up in the CMS PTP edit file, enter its modifier indicator (0/1/9) here, and the tool computes the verdict. No edit file ships -- this is the decision, not the quarterly table.' }));
    root.appendChild(field('Code A', 'ncci-a', { placeholder: '11042' }));
    root.appendChild(field('Code B', 'ncci-b', { placeholder: '97597' }));
    root.appendChild(selectField('Which code is Column 1 (the comprehensive, payable code)?', 'ncci-col', [
      { value: 'unknown', text: 'Unknown -- explain the ordering rule' },
      { value: 'a', text: 'Code A is Column 1 (B bundles into A)' },
      { value: 'b', text: 'Code B is Column 1 (A bundles into B)' },
    ]));
    root.appendChild(selectField('PTP modifier indicator (from the CMS edit file)', 'ncci-ind', [
      { value: '1', text: '1 -- a permitted NCCI-associated modifier may bypass' },
      { value: '0', text: '0 -- no modifier permitted (hard bundle)' },
      { value: '9', text: '9 -- edit deleted / not active' },
    ]));
    root.appendChild(field('Proposed bypass modifier (optional)', 'ncci-mod', { placeholder: '59 / XS / RT ...' }));
    const o = out(); root.appendChild(o);
    wire(['ncci-a', 'ncci-b', 'ncci-col', 'ncci-ind', 'ncci-mod'], () => safe(o, () => {
      if (rawEmpty('ncci-a') || rawEmpty('ncci-b')) { o.appendChild(el('p', { class: 'muted', text: 'Enter both codes.' })); return; }
      const r = Edit.ncciPtp({
        codeA: str('ncci-a'), codeB: str('ncci-b'), column1: str('ncci-col'),
        modifierIndicator: Math.round(numv('ncci-ind')), proposedModifier: str('ncci-mod'),
      });
      o.appendChild(el('h2', { text: r.isEdit ? (r.canBypass ? 'Edit -- bypass possible with the right modifier' : 'Edit -- hard bundle, no bypass') : 'Not an active NCCI edit' }));
      verdictLine(o, r.columnNote);
      verdictLine(o, r.bypassVerdict, r.canBypass || !r.isEdit ? null : 'flag');
      if (r.proposedModifier) {
        verdictLine(o, `Proposed modifier ${r.proposedModifier}: ${r.proposedIsNcciAssociated ? 'is' : 'is NOT'} an NCCI-associated modifier.`, r.proposedIsNcciAssociated ? null : 'flag');
      }
      o.appendChild(postureNote('CMS NCCI Policy Manual, Ch. I; Pub. 100-04 Ch. 23. Indicator semantics: 0 no bypass, 1 NCCI-associated modifier may bypass, 9 not an active edit. Whether the modifier is documented stays with the record.'));
    }));
  },

  // ----- 2.2 mue-check ------------------------------------------------------
  'mue-check'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Adjudicates units against the Medically Unlikely Edit (MUE) value by its MUE Adjudication Indicator (MAI). Enter the code\'s MUE value and MAI from your CMS MUE lookup; the tool computes payable vs at-risk units and whether the excess can be rescued. No MUE table ships.' }));
    root.appendChild(field('Units billed', 'mue-units', { type: 'number', inputmode: 'numeric', placeholder: '5' }));
    root.appendChild(field('MUE value (from the CMS MUE file)', 'mue-value', { type: 'number', inputmode: 'numeric', placeholder: '3' }));
    root.appendChild(selectField('MUE Adjudication Indicator (MAI)', 'mue-mai', [
      { value: '1', text: '1 -- claim-line edit (excess may be split to a second line)' },
      { value: '2', text: '2 -- date-of-service edit, ABSOLUTE (never payable)' },
      { value: '3', text: '3 -- date-of-service edit, reviewable with documentation' },
    ]));
    root.appendChild(checkField('Units are already split across multiple lines/dates', 'mue-split'));
    const o = out(); root.appendChild(o);
    wire(['mue-units', 'mue-value', 'mue-mai', 'mue-split'], () => safe(o, () => {
      if (rawEmpty('mue-units') || rawEmpty('mue-value')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the units billed and the MUE value.' })); return; }
      const r = Edit.mueCheck({
        unitsBilled: Math.round(numv('mue-units')), mueValue: Math.round(numv('mue-value')),
        mai: Math.round(numv('mue-mai')), splitAcrossLines: checked('mue-split'),
      });
      o.appendChild(el('h2', { text: r.pass ? `Passes -- ${r.payableUnits} unit(s) payable` : `Over the MUE -- ${r.payableUnits} payable, ${r.unitsAtRisk} at risk` }));
      verdictLine(o, r.verdict, r.pass ? null : (r.rescuable ? null : 'flag'));
      o.appendChild(derivation([
        ['Units billed', String(r.unitsBilled)],
        ['MUE value', String(r.mueValue)],
        ['Payable units', String(r.payableUnits)],
        ['Units at risk', String(r.unitsAtRisk)],
        ['Excess rescuable?', r.rescuable ? 'Yes -- see the verdict' : 'No -- absolute'],
      ]));
      o.appendChild(postureNote('CMS MUE program; MAI 1 line edit / 2 absolute date-of-service / 3 reviewable date-of-service. The tool that stops a coder from appealing an MAI-2 edit that will never pay.'));
    }));
  },

  // ----- 2.3 modifier-x-selector --------------------------------------------
  'modifier-x-selector'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Picks the single most specific distinct-service modifier (XE/XS/XP/XU) for the scenario, or 59 when none of the four subsets fits, or refuses when there is no distinct-service basis at all. CMS prefers the specific X-modifier over the blunt 59.' }));
    root.appendChild(checkField('There is a distinct procedural service that would otherwise bundle', 'mx-distinct'));
    root.appendChild(checkField('Separate ENCOUNTER (different session that day)', 'mx-enc'));
    root.appendChild(checkField('Separate anatomic SITE / structure', 'mx-site'));
    root.appendChild(checkField('Separate PRACTITIONER', 'mx-prac'));
    root.appendChild(checkField('Unusual, non-overlapping service (same encounter)', 'mx-unusual'));
    const o = out(); root.appendChild(o);
    wire(['mx-distinct', 'mx-enc', 'mx-site', 'mx-prac', 'mx-unusual'], () => safe(o, () => {
      const r = Edit.modifierXSelector({
        distinctService: checked('mx-distinct'), separateEncounter: checked('mx-enc'),
        separateSite: checked('mx-site'), separatePractitioner: checked('mx-prac'),
        nonOverlapping: checked('mx-unusual'),
      });
      o.appendChild(el('h2', { text: r.modifier ? `Modifier ${r.modifier}` : 'No distinct-service modifier' }));
      verdictLine(o, r.verdict, r.modifier ? null : 'flag');
      if (r.alsoApply && r.alsoApply.length) verdictLine(o, `Also describe(s) the scenario: ${r.alsoApply.join(', ')}.`);
      o.appendChild(postureNote('CMS MLN "Proper Use of Modifiers 59 & X{EPSU}"; Pub. 100-04 Ch. 23. Feed the chosen modifier back into ncci-ptp to confirm the pair\'s indicator permits a bypass.'));
    }));
  },

  // ----- 2.4 global-period --------------------------------------------------
  'global-period'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Computes whether a follow-up encounter falls inside the surgical global package from the surgery date and the GLOB DAYS indicator, and names the modifier (24/25/57/58/78/79) that unlocks separate payment for its nature. Calendar math is UTC, day-0 = the day of surgery.' }));
    root.appendChild(dateField('Surgery date', 'gp-surg'));
    root.appendChild(selectField('Global-days indicator (MPFS GLOB DAYS)', 'gp-glob', [
      { value: '090', text: '090 -- major surgery (90-day, + 1 preop day)' },
      { value: '010', text: '010 -- minor procedure (10-day)' },
      { value: '000', text: '000 -- endoscopy / minor (0-day, day of service only)' },
      { value: 'XXX', text: 'XXX -- global concept does not apply' },
      { value: 'YYY', text: 'YYY -- carrier/MAC-priced global' },
      { value: 'ZZZ', text: 'ZZZ -- add-on (global of the primary code)' },
      { value: 'MMM', text: 'MMM -- maternity package' },
    ]));
    root.appendChild(dateField('Subsequent encounter date', 'gp-sub'));
    root.appendChild(selectField('Nature of the subsequent encounter', 'gp-nat', [
      { value: 'unrelated-em', text: 'Unrelated E/M visit' },
      { value: 'staged', text: 'Staged / related procedure or therapy' },
      { value: 'return-to-or', text: 'Return to OR for a complication' },
      { value: 'unrelated-procedure', text: 'Unrelated procedure' },
      { value: 'decision-for-surgery', text: 'Decision-for-surgery visit' },
      { value: 'related-postop', text: 'Routine related post-op visit' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['gp-surg', 'gp-glob', 'gp-sub', 'gp-nat'], () => safe(o, () => {
      if (rawEmpty('gp-surg') || rawEmpty('gp-sub')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the surgery date and the subsequent encounter date.' })); return; }
      const r = Edit.globalPeriod({ surgeryDate: str('gp-surg'), globalDays: str('gp-glob'), subsequentDate: str('gp-sub'), nature: str('gp-nat') });
      o.appendChild(el('h2', { text: r.requiredModifier ? `Separately billable -- modifier ${r.requiredModifier}` : (r.separatelyBillable ? 'Bill normally' : 'Bundled into the surgical package') }));
      verdictLine(o, r.verdict, r.separatelyBillable ? null : 'flag');
      if (r.windowStart && r.windowEnd) {
        o.appendChild(derivation([
          ['Global package window', `${r.windowStart} through ${r.windowEnd}`],
          ['Days from surgery (day 0 = surgery)', r.daysFromSurgery === null ? '--' : String(r.daysFromSurgery)],
          ['Inside the global period?', r.insideGlobal ? 'Yes' : 'No'],
        ]));
      }
      o.appendChild(postureNote('CMS Pub. 100-04 Ch. 12 40; MLN Global Surgery Booklet. The major-surgery fee already includes the 90-day package -- this tells you when a visit is extra.'));
    }));
  },

  // ----- 2.5 modifier-order -------------------------------------------------
  'modifier-order'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Re-sequences up to four modifiers into the correct claim order -- pricing (payment-affecting) modifiers first, then informational/statistical -- tags each, and flags conflicting pairs. The wrong order can mis-price or reject an otherwise clean line.' }));
    root.appendChild(field('Modifier 1', 'mo-1', { placeholder: '59' }));
    root.appendChild(field('Modifier 2', 'mo-2', { placeholder: '26' }));
    root.appendChild(field('Modifier 3', 'mo-3', { placeholder: 'RT' }));
    root.appendChild(field('Modifier 4', 'mo-4', { placeholder: '' }));
    const o = out(); root.appendChild(o);
    wire(['mo-1', 'mo-2', 'mo-3', 'mo-4'], () => safe(o, () => {
      const mods = ['mo-1', 'mo-2', 'mo-3', 'mo-4'].map((id) => str(id).trim()).filter(Boolean);
      if (!mods.length) { o.appendChild(el('p', { class: 'muted', text: 'Enter at least one modifier.' })); return; }
      const r = Edit.modifierOrder({ modifiers: mods });
      o.appendChild(el('h2', { text: `Claim order: ${r.sequence.join(' ')}` }));
      o.appendChild(el('ul', {}, r.ordered.map((t) =>
        li(`${t.modifier} -- ${t.class}${t.recognized ? '' : ' (unrecognized; verify placement)'}`))));
      if (r.conflicts.length) {
        o.appendChild(el('h3', { text: 'Conflicts' }));
        o.appendChild(el('ul', {}, r.conflicts.map((c) => li(c, 'flag'))));
      }
      o.appendChild(postureNote(r.note));
      o.appendChild(postureNote('CMS Pub. 100-04 Ch. 12 / 23 modifier-reporting guidance. The "why did this clean-looking claim under-pay" fix that is invisible until you check the order.'));
    }));
  },
};
