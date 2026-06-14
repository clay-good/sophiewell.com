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
};
