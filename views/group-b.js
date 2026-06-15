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
import { loadAllShards, loadFile, loadShard } from '../lib/data.js';
import * as Bill from '../lib/billing-v78.js';
import * as Edit from '../lib/billing-v79.js';
import * as Em from '../lib/billing-v80.js';
import * as Drug from '../lib/billing-v81.js';
import * as Integ from '../lib/billing-v83.js';

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
// A dose/billing-unit measure picker (spec-v81): mass converts within itself;
// units / mL are their own families.
function unitSelect(label, id, value) {
  const sel = selectField(label, id, [
    { value: 'mg', text: 'mg' }, { value: 'mcg', text: 'mcg' }, { value: 'g', text: 'g' },
    { value: 'units', text: 'units (IU/USP)' }, { value: 'ml', text: 'mL' },
  ]);
  const node = sel.querySelector('select');
  if (node && value) node.value = value;
  return sel;
}
// A multi-row text input with a real <label for> (spec-v81 per-administration
// list); reads top-to-bottom on a phone with no sideways scroll.
function textareaField(label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const ta = el('textarea', { id, rows: '4', autocomplete: 'off' });
  if (placeholder) ta.setAttribute('placeholder', placeholder);
  wrap.appendChild(ta);
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

  // ===== spec-v80: E/M & time-based coding, completed ======================
  // The office em-time/em-mdm tiles only do 99202-99215. These six finish the
  // E/M surface: MDM leveling in every setting, critical-care minutes, the
  // split/shared substantive-portion call, prolonged services, the therapy
  // 8-minute rule, and anesthesia units. Setting/payer forks are explicit
  // (spec-v80 §3); no tile assumes Medicare or office. CPT descriptors and ASA
  // base units are the user's inputs (doctrine clause 2).

  // ----- 2.1 em-mdm-2023 ----------------------------------------------------
  'em-mdm-2023'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Sets the E/M level from the 2-of-3 MDM grid in EVERY setting -- inpatient/observation, ED, nursing facility, home -- not just the office. Pick the setting, grade the three MDM elements, and the tool returns the setting-specific code. The office path defers to the existing em-mdm tile. This is the level the documented MDM supports, not a documentation audit.' }));
    root.appendChild(selectField('Setting', 'emm-setting', [
      { value: 'inpatient-initial', text: 'Inpatient / observation -- initial (99221-99223)' },
      { value: 'inpatient-subsequent', text: 'Inpatient / observation -- subsequent (99231-99233)' },
      { value: 'ed', text: 'Emergency department (99281-99285; MDM only)' },
      { value: 'snf-initial', text: 'Nursing facility -- initial (99304-99306)' },
      { value: 'snf-subsequent', text: 'Nursing facility -- subsequent (99307-99310)' },
      { value: 'home-new', text: 'Home / residence -- new patient (99341-99345)' },
      { value: 'home-established', text: 'Home / residence -- established (99347-99350)' },
      { value: 'office', text: 'Office / outpatient (99202-99215) -- see em-mdm' },
    ]));
    const mdmOpts = [
      { value: '2', text: 'Straightforward' },
      { value: '3', text: 'Low' },
      { value: '4', text: 'Moderate' },
      { value: '5', text: 'High' },
    ];
    root.appendChild(selectField('Number / complexity of problems addressed', 'emm-prob', mdmOpts));
    root.appendChild(selectField('Amount / complexity of data reviewed', 'emm-data', mdmOpts));
    root.appendChild(selectField('Risk of complications / morbidity', 'emm-risk', mdmOpts));
    const o = out(); root.appendChild(o);
    wire(['emm-setting', 'emm-prob', 'emm-data', 'emm-risk'], () => safe(o, () => {
      const r = Em.emMdm2023({
        setting: str('emm-setting'),
        problems: Math.round(numv('emm-prob')), data: Math.round(numv('emm-data')), risk: Math.round(numv('emm-risk')),
      });
      if (r.setting === 'office') {
        o.appendChild(el('h2', { text: `${r.mdm} MDM -> new ${r.newCode} / established ${r.estCode}` }));
      } else {
        o.appendChild(el('h2', { text: `${r.mdm} MDM -> ${r.code}` }));
      }
      o.appendChild(derivation([
        ['Setting', r.settingLabel],
        ['MDM level (2 of 3)', `${r.mdm}`],
        ['Limiting element', r.limitingElements.length ? r.limitingElements.join(', ') : 'none -- all three reach the level'],
      ]));
      verdictLine(o, r.note);
      o.appendChild(postureNote('AMA CPT 2023 E/M Guidelines (the 2021 office MDM grid extended to all settings). Confirm code selection against the current CPT code set and your documentation. Office near-neighbors: em-mdm (MDM) and em-time (time path).'));
    }));
  },

  // ----- 2.2 critical-care-time ---------------------------------------------
  'critical-care-time'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Converts the day\'s aggregated critical-care minutes into 99291 + 99292 units. Below 30 minutes is not critical care (report an E/M instead). Subtract any separately billable procedure time -- the rule that trips most coders. Aggregate bedside + unit time per CMS before entering it.' }));
    root.appendChild(field('Total critical-care minutes for the day', 'cc-total', { type: 'number', inputmode: 'numeric', placeholder: '104' }));
    root.appendChild(field('Minutes of separately billable procedures to subtract', 'cc-proc', { type: 'number', inputmode: 'numeric', placeholder: '0' }));
    const o = out(); root.appendChild(o);
    wire(['cc-total', 'cc-proc'], () => safe(o, () => {
      if (rawEmpty('cc-total')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the total critical-care minutes.' })); return; }
      const r = Em.criticalCareTime({ totalMinutes: Math.round(numv('cc-total')), procedureMinutes: Math.round(numv('cc-proc') || 0) });
      o.appendChild(el('h2', { text: r.isCriticalCare ? (r.units99292 ? `99291 + 99292 x${r.units99292}` : '99291') : 'Not critical care' }));
      verdictLine(o, r.note, r.isCriticalCare ? null : 'flag');
      o.appendChild(derivation([
        ['Total minutes', String(r.totalMinutes)],
        ['Less separately billable procedure time', String(r.procedureMinutes)],
        ['Net critical-care minutes', String(r.netMinutes)],
        ['99291 (first 30-74 min)', r.code99291 ? '1' : '0 -- below the 30-minute floor'],
        ['99292 units (each +30 min)', String(r.units99292)],
      ]));
      o.appendChild(postureNote('AMA CPT 99291 / 99292; CMS Pub. 100-04 Ch. 12 30.6.12. The <30-minute floor and the procedure-time subtraction are the two miscoding traps.'));
    }));
  },

  // ----- 2.3 split-shared ---------------------------------------------------
  'split-shared'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Determines which provider must bill a facility split/shared E/M -- physician or NPP -- under the substantive-portion basis you select, whether modifier FS applies, and the payment consequence (NPP billing pays at the reduced NPP percentage). The 2024 CMS rule made this call mandatory.' }));
    root.appendChild(selectField('Substantive-portion basis', 'ss-basis', [
      { value: 'time', text: 'More than half of the total time' },
      { value: 'mdm', text: 'Substantive part of the MDM' },
    ]));
    root.appendChild(field('Physician minutes (time basis)', 'ss-phys', { type: 'number', inputmode: 'numeric', placeholder: '20' }));
    root.appendChild(field('NPP minutes (time basis)', 'ss-npp', { type: 'number', inputmode: 'numeric', placeholder: '15' }));
    root.appendChild(selectField('Who performed the substantive MDM (MDM basis)', 'ss-mdmby', [
      { value: 'physician', text: 'Physician' },
      { value: 'npp', text: 'NPP' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ss-basis', 'ss-phys', 'ss-npp', 'ss-mdmby'], () => safe(o, () => {
      const basis = str('ss-basis');
      if (basis === 'time' && rawEmpty('ss-phys') && rawEmpty('ss-npp')) {
        o.appendChild(el('p', { class: 'muted', text: 'Enter the physician and NPP minutes.' })); return;
      }
      const r = Em.splitShared({
        basis,
        physicianTime: Math.round(numv('ss-phys') || 0), nppTime: Math.round(numv('ss-npp') || 0),
        mdmBy: str('ss-mdmby'),
      });
      o.appendChild(el('h2', { text: `${r.billingProvider === 'physician' ? 'Physician' : 'NPP'} bills (+ modifier FS)` }));
      verdictLine(o, r.verdict);
      verdictLine(o, r.paymentNote, r.billingProvider === 'physician' ? null : 'flag');
      o.appendChild(derivation([
        ['Basis', r.basis === 'time' ? 'More than half of total time' : 'Substantive part of MDM'],
        ['Billing provider', r.billingProvider === 'physician' ? 'Physician' : 'NPP'],
        ['Modifier FS', 'Required (identifies the split/shared service)'],
        ['Pays at', `${r.paymentPercent}% of the physician fee schedule`],
      ]));
      o.appendChild(postureNote('CMS Pub. 100-04 Ch. 12 30.6.18; PFS split (or shared) visit policy. Near-neighbor: multi-surgeon-pay is the surgical two-provider split; this is the E/M one.'));
    }));
  },

  // ----- 2.4 prolonged-services ---------------------------------------------
  'prolonged-services'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Computes the prolonged-service add-on and its units once total time crosses the floor -- distinguishing AMA 99417/99418 from Medicare G2212/G0316, whose thresholds differ. Billing 99417 to a Medicare payer that wants G2212 is the classic error this prevents. Pick the time-selected primary code and the payer.' }));
    root.appendChild(selectField('Primary E/M code (selected by time)', 'ps-code', [
      { value: '99205', text: '99205 -- office/outpatient new (60-74 min)' },
      { value: '99215', text: '99215 -- office/outpatient established (40-54 min)' },
      { value: '99223', text: '99223 -- inpatient/observation initial (75-89 min)' },
      { value: '99233', text: '99233 -- inpatient/observation subsequent (50-64 min)' },
    ]));
    root.appendChild(selectField('Payer', 'ps-payer', [
      { value: 'ama', text: 'CPT / commercial (AMA 99417 / 99418)' },
      { value: 'medicare', text: 'Medicare (G2212 / G0316)' },
    ]));
    root.appendChild(field('Total documented time (minutes)', 'ps-min', { type: 'number', inputmode: 'numeric', placeholder: '90' }));
    const o = out(); root.appendChild(o);
    wire(['ps-code', 'ps-payer', 'ps-min'], () => safe(o, () => {
      if (rawEmpty('ps-min')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the total documented time.' })); return; }
      const r = Em.prolongedServices({ primaryCode: str('ps-code'), totalMinutes: Math.round(numv('ps-min')), payer: str('ps-payer') });
      o.appendChild(el('h2', { text: r.units ? `${r.prolongedCode} x${r.units}` : 'Below the prolonged-service threshold' }));
      verdictLine(o, r.note, r.units ? null : 'flag');
      o.appendChild(derivation([
        ['Primary code', `${r.primaryCode} (${r.primarySetting})`],
        ['Payer / add-on', `${r.payer === 'ama' ? 'CPT / commercial' : 'Medicare'} -> ${r.prolongedCode}`],
        ['Threshold (first unit)', `${r.threshold} minutes`],
        ['Total time', `${r.totalMinutes} minutes`],
        ['Prolonged units', String(r.units)],
      ]));
      o.appendChild(postureNote('AMA CPT 99417 / 99418; CMS Pub. 100-04 (G2212 / G0316). Near-neighbor: em-time selects the primary code this adds onto.'));
    }));
  },

  // ----- 2.5 therapy-units --------------------------------------------------
  'therapy-units'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Converts timed-treatment minutes into billable units under the Medicare 8-minute rule (cumulative) or the AMA Rule of Eights (per-service), and shows where the two diverge -- the boundary cases that drive PT/OT/SLP under- and over-billing. Exclude untimed-code services from the minutes.' }));
    root.appendChild(selectField('Rule', 'tu-rule', [
      { value: 'medicare', text: 'Medicare 8-minute rule (cumulative total)' },
      { value: 'rule-of-eights', text: 'AMA Rule of Eights (per-service)' },
    ]));
    root.appendChild(field('Total timed minutes (8-minute rule)', 'tu-total', { type: 'number', inputmode: 'numeric', placeholder: '50' }));
    root.appendChild(field('Per-service minutes, comma-separated (Rule of Eights)', 'tu-services', { placeholder: '8, 8' }));
    const o = out(); root.appendChild(o);
    wire(['tu-rule', 'tu-total', 'tu-services'], () => safe(o, () => {
      const rule = str('tu-rule');
      if (rule === 'medicare') {
        if (rawEmpty('tu-total')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the total timed minutes.' })); return; }
        const r = Em.therapyUnits({ rule, totalMinutes: Math.round(numv('tu-total')) });
        o.appendChild(el('h2', { text: `${r.units} unit(s)` }));
        verdictLine(o, r.note, r.units ? null : 'flag');
        o.appendChild(derivation([['Total timed minutes', String(r.totalMinutes)], ['Band', r.band], ['Units', String(r.units)]]));
      } else {
        const per = str('tu-services').split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
        if (!per.length) { o.appendChild(el('p', { class: 'muted', text: 'Enter per-service minutes, comma-separated (e.g., 8, 8).' })); return; }
        const r = Em.therapyUnits({ rule, perServiceMinutes: per });
        o.appendChild(el('h2', { text: `${r.units} unit(s)${r.diverges ? ` (Medicare rule: ${r.medicareUnits})` : ''}` }));
        verdictLine(o, r.note, r.diverges ? 'flag' : null);
        o.appendChild(derivation([
          ['Per-service units', r.services.map((s) => `${s.minutes}m=${s.units}u`).join(', ')],
          ['Rule of Eights total', String(r.units)],
          ['Medicare cumulative', String(r.medicareUnits)],
        ]));
      }
      o.appendChild(postureNote('CMS Pub. 100-04 Ch. 5 20.2; 42 CFR 410. 8-minute bands: 8-22=1, 23-37=2, 38-52=3, 53-67=4. The Rule of Eights diverges by pooling vs splitting the boundary remainders.'));
    }));
  },

  // ----- 2.6 anesthesia-units -----------------------------------------------
  'anesthesia-units'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Anesthesia is the one fee that does NOT use the RVU formula: payment = (base + time + modifying units) x the anesthesia conversion factor, where one time unit = 15 minutes. Enter the ASA base units (not shipped), the time, the CF, and the medical-direction modifier (which sets the concurrency percentage). This is the rule\'s math, not a payment guarantee.' }));
    root.appendChild(field('Base units (from the ASA Relative Value Guide)', 'an-base', { type: 'number', inputmode: 'decimal', placeholder: '5' }));
    root.appendChild(field('Anesthesia time (minutes)', 'an-time', { type: 'number', inputmode: 'numeric', placeholder: '60' }));
    root.appendChild(field('Modifying units (physical status / qualifying circumstances)', 'an-mod', { type: 'number', inputmode: 'decimal', placeholder: '0' }));
    root.appendChild(moneyField('Anesthesia conversion factor ($ per unit)', 'an-cf', '20.3178'));
    root.appendChild(selectField('Medical-direction modifier', 'an-dir', [
      { value: 'aa', text: 'AA -- personally performed (100%)' },
      { value: 'qz', text: 'QZ -- CRNA, non-medically-directed (100%)' },
      { value: 'qy', text: 'QY -- medical direction of one CRNA (50%)' },
      { value: 'qk', text: 'QK -- medical direction of 2-4 concurrent (50%)' },
      { value: 'qx', text: 'QX -- CRNA with medical direction (50%)' },
      { value: 'ad', text: 'AD -- medical supervision, >4 concurrent (flat 3 base units)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['an-base', 'an-time', 'an-mod', 'an-cf', 'an-dir'], () => safe(o, () => {
      if (rawEmpty('an-base') || rawEmpty('an-time') || !(numv('an-cf') > 0)) {
        o.appendChild(el('p', { class: 'muted', text: 'Enter base units, time, and the conversion factor.' })); return;
      }
      const r = Em.anesthesiaUnits({
        baseUnits: numv('an-base'), timeMinutes: Math.round(numv('an-time')), modifyingUnits: numv('an-mod') || 0,
        conversionFactor: numv('an-cf'), medicalDirection: str('an-dir'),
      });
      o.appendChild(el('h2', { text: `${usd(r.directedPaymentCents)} (${r.directionPercent != null ? r.directionPercent + '%' : 'AD flat'})` }));
      o.appendChild(derivation([
        ['Base units', String(r.baseUnits)],
        ['Time units (minutes / 15)', String(r.timeUnits)],
        ['Modifying units', String(r.modifyingUnits)],
        ['Total units', String(r.totalUnits)],
        ['x Conversion factor', `$${fmt(r.conversionFactor, { digits: 4 })} per unit`],
        ['Full payment (before direction)', usd(r.fullPaymentCents)],
        [r.directionLabel, usd(r.directedPaymentCents)],
      ]));
      o.appendChild(postureNote('CMS Pub. 100-04 Ch. 12 50; ASA Relative Value Guide base units (entered, not shipped). Near-neighbor: rvu-payment prices everything EXCEPT anesthesia -- this is the exception.'));
    }));
  },

  // ===== spec-v81: drug & infusion billing =================================
  // ----- 2.1 ndc-hcpcs-units ------------------------------------------------
  'ndc-hcpcs-units'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Converts a dose to the number of HCPCS billing units to report. A J-code\'s billing unit is a fixed amount ("1 unit = 10 mg") -- the units are almost never the milligrams given, and the off-by-a-factor error here is the most common drug-claim mistake. Enter the unit size from the code descriptor. Near-neighbor: ndc-convert flips the NDC digit format; this is dose -> units.' }));
    root.appendChild(field('Dose administered', 'nh-dose', { type: 'number', inputmode: 'decimal', placeholder: '35' }));
    root.appendChild(unitSelect('Dose unit', 'nh-dose-unit', 'mg'));
    root.appendChild(field('Billing-unit size (1 unit = this much)', 'nh-unitsize', { type: 'number', inputmode: 'decimal', placeholder: '10' }));
    root.appendChild(unitSelect('Billing-unit measure', 'nh-unit-unit', 'mg'));
    root.appendChild(selectField('Rounding rule', 'nh-round', [
      { value: 'up', text: 'Round up (single-dose default)' },
      { value: 'nearest', text: 'Round to nearest' },
      { value: 'down', text: 'Round down' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['nh-dose', 'nh-dose-unit', 'nh-unitsize', 'nh-unit-unit', 'nh-round'], () => safe(o, () => {
      if (rawEmpty('nh-dose') || rawEmpty('nh-unitsize')) { o.appendChild(el('p', { class: 'muted', text: 'Enter the dose and the billing-unit size.' })); return; }
      const r = Drug.ndcHcpcsUnits({
        dose: numv('nh-dose'), doseUnit: str('nh-dose-unit'),
        unitSize: numv('nh-unitsize'), unitUnit: str('nh-unit-unit'), rounding: str('nh-round'),
      });
      o.appendChild(el('h2', { text: `${r.billingUnits} billing unit(s)` }));
      verdictLine(o, r.note, r.isCleanMultiple ? null : 'flag');
      o.appendChild(derivation([
        ['Dose', `${fmt(r.dose)} ${r.doseUnit}`],
        ['Billing unit', `1 unit = ${fmt(r.unitSize)} ${r.unitUnit}`],
        ['Exact ratio (dose / unit)', String(r.exactUnits)],
        ['Rounding', r.rounding],
        ['Billing units to report', String(r.billingUnits)],
        ['Clean multiple?', r.isCleanMultiple ? 'yes' : 'no -- rounding applied'],
      ]));
      o.appendChild(postureNote('CMS HCPCS Level II drug descriptors; CMS Pub. 100-04 Ch. 17. The unit size is entered from the code descriptor (doctrine clause 2 -- no drug-pricing file ships). Pairs with drug-wastage to split administered vs discarded units.'));
    }));
  },

  // ----- 2.2 drug-wastage ---------------------------------------------------
  'drug-wastage'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Splits a single-dose vial into administered units and discarded (JW) units, or returns the JZ "zero waste" verdict when the dose uses the full vial -- and hard-refuses JW on a multi-dose vial. Missing JZ and improper JW on a multi-dose vial are both active audit targets. Optionally enter the available vial sizes for the least-waste selection.' }));
    root.appendChild(field('Vial size', 'dw-vial', { type: 'number', inputmode: 'decimal', placeholder: '50' }));
    root.appendChild(field('Dose administered', 'dw-dose', { type: 'number', inputmode: 'decimal', placeholder: '35' }));
    root.appendChild(unitSelect('Dose / vial unit', 'dw-dose-unit', 'mg'));
    root.appendChild(field('Billing-unit size (1 unit = this much)', 'dw-unitsize', { type: 'number', inputmode: 'decimal', placeholder: '10' }));
    root.appendChild(unitSelect('Billing-unit measure', 'dw-unit-unit', 'mg'));
    root.appendChild(selectField('Vial type', 'dw-type', [
      { value: 'single', text: 'Single-dose vial (JW/JZ eligible)' },
      { value: 'multi', text: 'Multi-dose vial (JW does NOT apply)' },
    ]));
    root.appendChild(field('Available vial sizes (optional, comma-separated)', 'dw-sizes', { placeholder: '50, 20, 10' }));
    const o = out(); root.appendChild(o);
    wire(['dw-vial', 'dw-dose', 'dw-dose-unit', 'dw-unitsize', 'dw-unit-unit', 'dw-type', 'dw-sizes'], () => safe(o, () => {
      if (rawEmpty('dw-vial') || rawEmpty('dw-dose') || rawEmpty('dw-unitsize')) {
        o.appendChild(el('p', { class: 'muted', text: 'Enter the vial size, the dose, and the billing-unit size.' })); return;
      }
      const sizes = str('dw-sizes').split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
      const r = Drug.drugWastage({
        vialSize: numv('dw-vial'), dose: numv('dw-dose'), doseUnit: str('dw-dose-unit'),
        unitSize: numv('dw-unitsize'), unitUnit: str('dw-unit-unit'), vialType: str('dw-type'),
        availableVialSizes: sizes.length ? sizes : undefined,
      });
      o.appendChild(el('h2', { text: r.modifier ? `Modifier ${r.modifier}` : 'No waste billing (multi-dose)' }));
      verdictLine(o, r.note, r.modifier === 'JW' || !r.eligibleForJW ? 'flag' : null);
      o.appendChild(derivation([
        ['Dose administered', `${fmt(numv('dw-dose'))} ${str('dw-dose-unit')}`],
        ['Vial size', `${fmt(numv('dw-vial'))} ${str('dw-dose-unit')}`],
        ['Vial type', r.vialType === 'single' ? 'Single-dose' : 'Multi-dose'],
        ['Vials drawn', String(r.vialsUsed)],
        ['Total units drawn', String(r.totalUnits)],
        ['Administered units', String(r.administeredUnits)],
        ['Discarded (JW) units', r.eligibleForJW ? String(r.discardedUnits) : 'not billable (multi-dose)'],
        ['Modifier', r.modifier || 'none'],
        r.leastWaste ? ['Least-waste vial selection', `${r.leastWaste.combo.map((c) => `${c.count}x${c.size}`).join(' + ')} = ${r.leastWaste.totalAmount} (${r.leastWaste.wasteAmount} wasted)`] : null,
      ]));
      o.appendChild(postureNote('CMS Pub. 100-04 Ch. 17 §40; JW/JZ modifier guidance. Near-neighbor: ndc-hcpcs-units supplies the unit math this splits.'));
    }));
  },

  // ----- 2.3 infusion-hierarchy ---------------------------------------------
  'infusion-hierarchy'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Picks the single "initial" infusion/injection code for an encounter by the CMS hierarchy (chemo > therapeutic > hydration; infusion > push), NOT by what ran first on the clock, and assigns every other administration its add-on role. An infusion under 16 minutes is reported as an IV push. One administration per line as "type, minutes".' }));
    root.appendChild(textareaField('Administrations (one per line: type, minutes)', 'ih-list',
      'chemo-infusion, 90\ntherapeutic-infusion, 60\nhydration, 30'));
    root.appendChild(el('p', { class: 'muted', text: 'Types: chemo-infusion, chemo-push, therapeutic-infusion, therapeutic-push, hydration. Append ", concurrent" to a line for a concurrently-run infusion.' }));
    const o = out(); root.appendChild(o);
    const ROLE_LABEL = {
      initial: 'INITIAL', 'sequential-infusion': 'Sequential infusion',
      'sequential-hydration': 'Sequential/secondary hydration', 'concurrent-infusion': 'Concurrent infusion',
      'additional-push': 'Additional/sequential push',
    };
    wire(['ih-list'], () => safe(o, () => {
      const raw = str('ih-list').split('\n').map((s) => s.trim()).filter(Boolean);
      if (!raw.length) { o.appendChild(el('p', { class: 'muted', text: 'Enter one administration per line, e.g. "chemo-infusion, 90".' })); return; }
      const administrations = raw.map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        return {
          type: parts[0],
          minutes: parts[1] != null && parts[1] !== '' ? Number(parts[1]) : 0,
          concurrent: parts.slice(2).some((p) => p.toLowerCase() === 'concurrent'),
        };
      });
      const r = Drug.infusionHierarchy({ administrations });
      o.appendChild(el('h2', { text: `Initial code ${r.initialCode}` }));
      verdictLine(o, r.note);
      const ul = el('ul');
      for (const ln of r.lines) {
        const role = ROLE_LABEL[ln.role] || ln.role;
        const addOn = ln.addOnCode && ln.addOnUnits ? ` + ${ln.addOnCode} x${ln.addOnUnits}` : '';
        const reclass = ln.reclassified ? ' (<16 min -> reported as a push)' : '';
        ul.appendChild(li(`${ln.type.replace('-', ' ')}, ${ln.minutes} min: ${role} -> ${ln.code}${addOn}${reclass}`, ln.role === 'initial' ? null : 'muted'));
      }
      o.appendChild(ul);
      o.appendChild(postureNote('AMA CPT 96360-96379; CMS Pub. 100-04 Ch. 12. Exactly one initial code per IV site/encounter; the rest are sequential/concurrent/additional-hour/additional-push add-ons.'));
    }));
  },

  // ===== spec-v83: claim integrity & facility payment ======================
  // The four integrity validators catch a bad identifier / out-of-balance
  // remittance before the clearinghouse rejects it; the two facility pricers
  // compute the UB-04 (DRG/APC) side the v78 professional engine does not.
  // Validators verify FORMAT/STRUCTURE only; pricers read bundled weights but
  // take rates as inputs (doctrine clause 2).

  // ----- 2.1 npi-validate ---------------------------------------------------
  'npi-validate'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Validates a 10-digit NPI by recomputing its Luhn (ISO/IEC 7812) check digit over the 80840 issuer prefix, or generates the 10th digit from a 9-digit base. A wrong check digit means a typo or transposition. This verifies the format/check digit only -- not that the NPI is enrolled in NPPES.' }));
    root.appendChild(field('NPI (10 digits) or 9-digit base to generate', 'npi-in', { placeholder: '1234567893', inputmode: 'numeric' }));
    const o = out(); root.appendChild(o);
    wire(['npi-in'], () => safe(o, () => {
      if (rawEmpty('npi-in')) { o.appendChild(el('p', { class: 'muted', text: 'Enter a 10-digit NPI or a 9-digit base.' })); return; }
      const r = Integ.npiValidate({ npi: str('npi-in') });
      if (r.mode === 'generate') {
        o.appendChild(el('h2', { text: `NPI ${r.npi} (check digit ${r.checkDigit})` }));
        verdictLine(o, r.note);
      } else {
        o.appendChild(el('h2', { text: r.valid ? `NPI ${r.npi} is valid (check digit ${r.checkDigit})` : `NPI ${r.npi} is INVALID` }));
        verdictLine(o, r.note, r.valid ? null : 'flag');
        o.appendChild(derivation([
          ['NPI', r.npi],
          ['Check digit present', String(r.checkDigit)],
          ['Recomputed Luhn check digit', String(r.expectedCheckDigit)],
        ]));
      }
      o.appendChild(postureNote('45 CFR 162.406; NPI check digit per the Luhn algorithm over the 80840 prefix. Format/check-digit validation only -- enrollment lives in NPPES.'));
    }));
  },

  // ----- 2.2 mbi-validate ---------------------------------------------------
  'mbi-validate'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Checks a Medicare Beneficiary Identifier against the CMS 11-character position grammar (which positions are numeric, alphabetic, or alphanumeric) and the excluded letters S, L, O, I, B, Z. Names the first offending position and rule so you can fix the character. Validates format only -- not active entitlement.' }));
    root.appendChild(field('MBI (11 characters)', 'mbi-in', { placeholder: '1EG4-TE5-MK73' }));
    const o = out(); root.appendChild(o);
    wire(['mbi-in'], () => safe(o, () => {
      if (rawEmpty('mbi-in')) { o.appendChild(el('p', { class: 'muted', text: 'Enter an MBI.' })); return; }
      const r = Integ.mbiValidate({ mbi: str('mbi-in') });
      o.appendChild(el('h2', { text: r.valid ? `${r.mbi}: valid (all 11 positions pass)` : `${r.mbi}: INVALID` }));
      verdictLine(o, r.note, r.valid ? null : 'flag');
      if (!r.valid && r.firstError && r.firstError.position) {
        o.appendChild(derivation([
          ['First offending position', String(r.firstError.position)],
          ['Character', r.firstError.got || '--'],
          ['Rule', r.firstError.rule],
        ]));
      }
      o.appendChild(postureNote('CMS Medicare Beneficiary Identifier format specification (the new Medicare card). Excluded letters: S, L, O, I, B, Z. Format only -- not an entitlement check.'));
    }));
  },

  // ----- 2.3 icd10-validate -------------------------------------------------
  'icd10-validate'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Checks an ICD-10-CM code against the code-set structural grammar (category / etiology / site / laterality, the placeholder X) and the required 7th character for the chapters that demand it. Flags the "will deny for lack of specificity" case before submission. Validates structure/specificity only -- not that the code is the clinically correct diagnosis.' }));
    root.appendChild(field('ICD-10-CM code', 'icd-in', { placeholder: 'M54.5' }));
    root.appendChild(checkField('A 7th character is required for this code (injury, OB, certain chapters)', 'icd-7th'));
    const o = out(); root.appendChild(o);
    let existsByLetter = null; // best-effort existence check against bundled shards
    wire(['icd-in', 'icd-7th'], () => safe(o, () => {
      if (rawEmpty('icd-in')) { o.appendChild(el('p', { class: 'muted', text: 'Enter an ICD-10-CM code.' })); return; }
      const r = Integ.icd10Validate({ code: str('icd-in'), requires7th: checked('icd-7th') });
      o.appendChild(el('h2', { text: r.valid ? `${r.code}: valid structure` : `${r.code}: ${r.structurallyValid ? 'incomplete' : 'invalid structure'}` }));
      verdictLine(o, r.note, r.valid ? null : 'flag');
      o.appendChild(derivation([
        ['Code', r.code],
        ['Structurally valid', r.structurallyValid ? 'yes' : 'no'],
        ['7th character required', r.requires7th ? 'yes' : 'no'],
        ['7th character present', r.has7th ? 'yes' : 'no'],
      ]));
      // Best-effort: confirm the code exists in the bundled ICD-10-CM shards.
      if (r.structurallyValid && existsByLetter) {
        const bare = r.code.replace('.', '').toUpperCase();
        const hit = existsByLetter.has(bare);
        o.appendChild(el('p', { class: 'muted', text: hit ? `Found in the bundled ICD-10-CM sample set.` : `Not in the bundled ICD-10-CM sample set (the sample set is a small offline seed, not the full code list) -- the structural verdict above stands regardless.` }));
      }
      o.appendChild(postureNote('ICD-10-CM Official Guidelines and the code-set conventions (CMS/CDC). Structure & specificity only -- it does not assert the code is the clinically correct diagnosis.'));
    }));
    // Load the shard for the entered code's first letter on demand for the
    // existence note; degrades silently to structural-only on any failure.
    const reloadShard = () => {
      const letter = str('icd-in').trim().toUpperCase().charAt(0);
      if (!/^[A-Z]$/.test(letter)) return;
      loadShard('icd10cm', `${letter}.json`).then((rows) => {
        if (!root.isConnected || !Array.isArray(rows)) return;
        existsByLetter = new Set(rows.map((x) => String(x.code || '').replace('.', '').toUpperCase()));
        const ev = () => { const n = document.getElementById('icd-in'); if (n) n.dispatchEvent(new Event('input', { bubbles: true })); };
        ev();
      }).catch(() => {});
    };
    document.getElementById('icd-in').addEventListener('change', reloadShard);
    reloadShard();
  },

  // ----- 2.4 era-balance ----------------------------------------------------
  'era-balance'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Confirms an 835 / EOB balances before you post it: billed = paid + the sum of the CAS claim-adjustment amounts (CO contractual, PR patient responsibility, OA other, PI payer-initiated). Reports the exact out-of-balance amount and the patient responsibility (sum of PR) to bill. Integer cents, proven to the penny.' }));
    root.appendChild(moneyField('Billed charge ($)', 'era-billed', '200.00'));
    root.appendChild(moneyField('Paid amount ($)', 'era-paid', '120.00'));
    root.appendChild(moneyField('CO -- contractual obligation ($)', 'era-co', '50.00'));
    root.appendChild(moneyField('PR -- patient responsibility ($)', 'era-pr', '30.00'));
    root.appendChild(moneyField('OA -- other adjustment ($)', 'era-oa', '0'));
    root.appendChild(moneyField('PI -- payer-initiated ($)', 'era-pi', '0'));
    const o = out(); root.appendChild(o);
    wire(['era-billed', 'era-paid', 'era-co', 'era-pr', 'era-oa', 'era-pi'], () => safe(o, () => {
      if (rawEmpty('era-billed') || rawEmpty('era-paid')) { o.appendChild(el('p', { class: 'muted', text: 'Enter at least the billed charge and the paid amount.' })); return; }
      const r = Integ.eraBalance({
        billedCents: Math.round(numv('era-billed') * 100),
        paidCents: Math.round((numv('era-paid') || 0) * 100),
        coCents: Math.round((numv('era-co') || 0) * 100),
        prCents: Math.round((numv('era-pr') || 0) * 100),
        oaCents: Math.round((numv('era-oa') || 0) * 100),
        piCents: Math.round((numv('era-pi') || 0) * 100),
      });
      o.appendChild(el('h2', { text: r.balanced ? `Balances ($${fmt(0, { digits: 2 })} residual)` : `OUT OF BALANCE by ${usd(Math.abs(r.residualCents))}` }));
      verdictLine(o, r.note, r.balanced ? null : 'flag');
      o.appendChild(derivation([
        ['Billed', usd(r.billedCents)],
        ['Paid', usd(r.paidCents)],
        ['Sum of adjustments (CO+PR+OA+PI)', usd(r.sumAdjCents)],
        ['Residual (billed - paid - adjustments)', usd(r.residualCents)],
        ['Patient responsibility (Sigma PR) to bill', usd(r.patientResponsibilityCents)],
      ]));
      o.appendChild(postureNote('ASC X12 835 balancing; CAS group codes CO/PR/OA/PI (CARC/RARC per CAQH CORE). Near-neighbor: allowed-amount projects the split from the contract; this reconciles the split the payer sent.'));
    }));
  },

  // ----- 2.5 drg-payment ----------------------------------------------------
  'drg-payment'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Estimates the IPPS DRG payment = relative weight x the wage-index-adjusted hospital base rate (operating + capital), with the per-diem reduction for a post-acute transfer. Enter the MS-DRG to fill the bundled relative weight / GMLOS, or type them. Estimates the operating model; outlier/IME/DSH need the hospital\'s own cost-report factors.' }));
    root.appendChild(field('MS-DRG (optional -- fills bundled weight / GMLOS)', 'drg-code', { placeholder: '470' }));
    root.appendChild(moneyField('Relative weight', 'drg-weight', '1.5'));
    root.appendChild(moneyField('Operating base rate ($)', 'drg-oper', '6000.00'));
    root.appendChild(moneyField('Capital base rate ($)', 'drg-cap', '500.00'));
    root.appendChild(moneyField('Wage index', 'drg-wage', '1.0'));
    root.appendChild(checkField('Post-acute transfer (apply the per-diem reduction)', 'drg-transfer'));
    root.appendChild(field('Length of stay (days, transfer only)', 'drg-los', { type: 'number', inputmode: 'numeric', placeholder: '2' }));
    root.appendChild(moneyField('Geometric mean LOS (days, transfer only)', 'drg-gmlos', '5'));
    root.appendChild(moneyField('Entered add-ons -- outlier / IME / DSH ($)', 'drg-addon', '0'));
    const o = out(); root.appendChild(o);
    const drgByCode = new Map();

    function run() {
      safe(o, () => {
        if (!(numv('drg-weight') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the relative weight (or an MS-DRG that fills it).' })); return; }
        if (!(numv('drg-oper') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the operating base rate.' })); return; }
        const r = Integ.drgPayment({
          relativeWeight: numv('drg-weight'),
          operatingBaseCents: Math.round(numv('drg-oper') * 100),
          capitalBaseCents: Math.round((numv('drg-cap') || 0) * 100),
          wageIndex: numv('drg-wage') > 0 ? numv('drg-wage') : 1,
          isTransfer: checked('drg-transfer'),
          lengthOfStay: Math.round(numv('drg-los') || 0),
          gmlos: numv('drg-gmlos') || 0,
          addOnCents: Math.round((numv('drg-addon') || 0) * 100),
        });
        o.appendChild(el('h2', { text: `${r.isTransferPriced ? 'Transfer-adjusted' : 'Base'} DRG payment: ${usd(r.transferAdjustedCents)}` }));
        verdictLine(o, r.note, r.isTransferPriced ? 'flag' : null);
        o.appendChild(derivation([
          ['Relative weight', String(r.relativeWeight)],
          ['Wage-adjusted base (operating + capital)', usd(r.wageAdjustedBaseCents)],
          ['Base DRG payment (weight x base)', usd(r.baseDrgCents)],
          r.isTransferPriced ? ['Per-diem rate (base / GMLOS)', usd(r.perDiemCents)] : null,
          r.isTransferPriced ? ['Transfer-adjusted payment', usd(r.transferAdjustedCents)] : null,
          r.addOnCents > 0 ? ['Entered add-ons', usd(r.addOnCents)] : null,
          ['Total estimated payment', usd(r.totalCents)],
        ]));
        o.appendChild(postureNote('42 CFR Part 412 (IPPS); relative weight from the bundled data/drg or entered. Estimates the operating model -- outlier/IME/DSH/new-tech need the hospital\'s cost-report factors. Near-neighbor: apc-payment is the outpatient counterpart.'));
      });
    }
    wire(['drg-code', 'drg-weight', 'drg-oper', 'drg-cap', 'drg-wage', 'drg-transfer', 'drg-los', 'drg-gmlos', 'drg-addon'], run);
    function fillFromCode() {
      const row = drgByCode.get(str('drg-code').trim());
      if (!row) return;
      if (row.relativeWeight != null) document.getElementById('drg-weight').value = row.relativeWeight;
      if (row.gmlos != null) document.getElementById('drg-gmlos').value = row.gmlos;
      run();
    }
    document.getElementById('drg-code').addEventListener('input', fillFromCode);
    loadFile('drg', 'drg.json').then((rows) => {
      if (!root.isConnected || !Array.isArray(rows)) return;
      for (const row of rows) if (row && row.drg) drgByCode.set(String(row.drg), row);
    }).catch(() => {});
  },

  // ----- 2.6 apc-payment ----------------------------------------------------
  'apc-payment'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Estimates the OPPS APC payment = relative weight x the OPPS conversion factor, wage adjusted, with status-indicator packaging (status N lines pay $0, bundled into the primary) and the multiple-procedure discount (the lower-weighted significant procedures, status T, are reduced). One APC per line as "weight, status indicator". Estimates the base model; comprehensive-APC and pass-through nuances need the facility\'s factors.' }));
    root.appendChild(textareaField('APC lines (one per line: weight, status indicator)', 'apc-list', '10, T\n4, T\n2, N'));
    root.appendChild(el('p', { class: 'muted', text: 'Status indicators: T = significant procedure (discounted); J1 = comprehensive APC; S / V = separately payable, not discounted; N = packaged ($0).' }));
    root.appendChild(moneyField('OPPS conversion factor ($ per relative-weight unit)', 'apc-cf', '87.00'));
    root.appendChild(moneyField('Wage index', 'apc-wage', '1.0'));
    root.appendChild(field('Multiple-procedure discount (%)', 'apc-disc', { type: 'number', inputmode: 'numeric', placeholder: '50', value: '50' }));
    const o = out(); root.appendChild(o);
    wire(['apc-list', 'apc-cf', 'apc-wage', 'apc-disc'], () => safe(o, () => {
      const raw = str('apc-list').split('\n').map((s) => s.trim()).filter(Boolean);
      if (!raw.length) { o.appendChild(el('p', { class: 'muted', text: 'Enter one APC per line, e.g. "10, T".' })); return; }
      if (!(numv('apc-cf') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the OPPS conversion factor.' })); return; }
      const lines = raw.map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        return { weight: Number(parts[0]), statusIndicator: parts[1] || 'N' };
      });
      const r = Integ.apcPayment({
        lines,
        conversionFactorCents: Math.round(numv('apc-cf') * 100),
        wageIndex: numv('apc-wage') > 0 ? numv('apc-wage') : 1,
        discountPct: numv('apc-disc') >= 0 ? numv('apc-disc') : 50,
      });
      o.appendChild(el('h2', { text: `Total OPPS payment: ${usd(r.totalCents)}` }));
      verdictLine(o, r.note);
      const ul = el('ul');
      for (const ln of r.lines) {
        const status = ln.packaged ? 'packaged ($0)' : (ln.discounted ? `discounted to ${r.discountPct}%` : 'separately payable');
        ul.appendChild(li(`Weight ${ln.weight}, status ${ln.statusIndicator}: ${usd(ln.payCents)} (${status})`, ln.packaged ? 'muted' : null));
      }
      o.appendChild(ul);
      o.appendChild(postureNote('42 CFR Part 419 (OPPS); relative weight / status indicator from the bundled data/apc or entered. Near-neighbor: mppr is the professional multiple-procedure reduction; this is the OPPS one. rvu-payment prices the professional line.'));
    }));
  },
};
