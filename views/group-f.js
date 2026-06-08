// Group F: Medication and Infusion (41-47).

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import * as C from '../lib/clinical.js';
import {
  mmeTotal, steroidEquivalent, benzoEquivalent,
  abxRenalDose, vasopressorRateMlHr, vasopressorDose,
  tpnMacro,
  beersCheck, BEERS_PIM, BEERS_DISEASE,
} from '../lib/medication-v4.js';
import {
  insulinCorrection, electrolyteReplacement, crrtDose, ecmoTitration,
} from '../lib/scoring-v4.js';
import { unitField, unitNum, WEIGHT_UNITS } from '../lib/field-units.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
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
function nv(id) { return Number(document.getElementById(id).value); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }

export const renderers = {
  'drip-rate'(root) {
    root.appendChild(field('Volume (mL)', 'v'));
    root.appendChild(field('Duration (minutes)', 't'));
    root.appendChild(field('Drop factor (gtts/mL, e.g. 15)', 'df'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.dripRate({ volumeMl: nv('v'), durationMin: nv('t'), dropFactor: nv('df') });
      o.appendChild(el('ul', {}, [
        el('li', { text: `Rate: ${r.mlPerHr} mL/hr` }),
        el('li', { text: `Drops: ${r.gttsPerMin} gtts/min` }),
      ]));
    });
    ['v', 't', 'df'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'weight-dose'(root) {
    root.appendChild(unitField('Weight', 'w', WEIGHT_UNITS));
    root.appendChild(field('Dose per kg', 'd'));
    root.appendChild(field('Dose unit (e.g. mg/kg, mcg/kg)', 'u', { type: 'text', placeholder: 'mg/kg' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const weightKg = unitNum('w');
      const total = C.weightDose({ weightKg, dosePerKg: nv('d') });
      const unit = document.getElementById('u').value.trim().replace(/\/kg$/, '') || 'units';
      o.appendChild(el('p', { text: `Total dose: ${total} ${unit}` }));
      // Sanity bounds (general adult heuristic): warn when computed exceeds 5x typical adult dose.
      if (weightKg > 0 && total / weightKg > 100) {
        o.appendChild(el('p', { class: 'notice', text: 'Computed per-kg value is unusually large. Double-check the unit and the dose against your formulary.' }));
      }
    });
    ['w', 'w-unit', 'd', 'u'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'conc-rate'(root) {
    root.appendChild(field('Dose value', 'dv'));
    root.appendChild(selectField('Dose unit', 'du', [
      { value: 'mcg/kg/min', text: 'mcg/kg/min' }, { value: 'mcg/min', text: 'mcg/min' },
      { value: 'mg/min', text: 'mg/min' }, { value: 'units/hr', text: 'units/hr' },
      { value: 'units/min', text: 'units/min' },
    ]));
    root.appendChild(unitField('Patient weight (if dose per kg)', 'w', WEIGHT_UNITS));
    root.appendChild(field('Concentration value', 'cv'));
    root.appendChild(selectField('Concentration unit', 'cu', [
      { value: 'mg/mL', text: 'mg/mL' }, { value: 'units/mL', text: 'units/mL' },
    ]));
    const presets = el('p', { class: 'muted', text:
      'Common presets (per institution policy): noradrenaline 16 mg / 250 mL = 64 mcg/mL; epinephrine 4 mg / 250 mL = 16 mcg/mL; ' +
      'dopamine 400 mg / 250 mL = 1600 mcg/mL; dobutamine 250 mg / 250 mL = 1000 mcg/mL; propofol 10 mg/mL; ' +
      'fentanyl 50 mcg/mL; heparin 25,000 units / 500 mL = 50 units/mL.' });
    root.appendChild(presets);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.concentrationToRate({
        doseValue: nv('dv'), doseUnit: document.getElementById('du').value,
        weightKg: unitNum('w'), concentrationValue: nv('cv'),
        concentrationUnit: document.getElementById('cu').value,
      });
      o.appendChild(el('p', { text: `Infusion rate: ${r.mlPerHr} mL/hr` }));
      o.appendChild(el('p', { class: 'muted', text: 'Verify against your institution\'s protocol and pump configuration.' }));
    });
    ['dv', 'du', 'w', 'w-unit', 'cv', 'cu'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'peds-dose'(root) {
    const o = out(); root.appendChild(o);
    o.appendChild(el('p', { class: 'muted', text: 'Reference table. Verify against your institution\'s formulary.' }));
    const tbl = el('table', { class: 'lookup-table' });
    tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Drug' }), el('th', { scope: 'col', text: 'Typical pediatric dose (per kg)' }), el('th', { scope: 'col', text: 'Notes' })])]));
    const tbody = el('tbody');
    const rows = [
      ['Acetaminophen (PO/PR)', '10-15 mg/kg q4-6h', 'Max 75 mg/kg/day; max single 1 g'],
      ['Ibuprofen (PO)', '5-10 mg/kg q6-8h', 'Avoid in dehydration, age <6 mo'],
      ['Amoxicillin (PO)', '25-50 mg/kg/day divided q8-12h', 'High-dose 80-100 mg/kg/day for AOM'],
      ['Ceftriaxone (IV)', '50-75 mg/kg/day', 'Meningitis dosing differs'],
      ['Epinephrine (IM, anaphylaxis)', '0.01 mg/kg (max 0.3-0.5 mg)', '1 mg/mL concentration'],
      ['Albuterol nebulized', '0.15 mg/kg (min 2.5 mg)', 'Continuous in severe asthma per protocol'],
      ['Dexamethasone (croup)', '0.6 mg/kg PO/IM/IV', 'Single dose; max 16 mg'],
    ];
    for (const r of rows) tbody.appendChild(el('tr', {}, [el('td', { text: r[0] }), el('td', { text: r[1] }), el('td', { text: r[2] })]));
    tbl.appendChild(tbody);
    o.appendChild(el('div', { class: 'table-scroll', role: 'region', 'aria-label': 'Pediatric dose table (scrolls horizontally)', tabindex: '0' }, [tbl]));
    o.appendChild(el('p', { class: 'muted', text: 'Citations: AAP, NLM/DailyMed, manufacturer labels. Reference only.' }));
  },

  'insulin-drip'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'This is a math verifier only. Use your institution\'s insulin protocol.' }));
    root.appendChild(selectField('Example protocol', 'p', [
      { value: 'low', text: 'Example "low intensity" protocol' },
      { value: 'mod', text: 'Example "moderate intensity" protocol' },
    ]));
    root.appendChild(field('Current blood glucose (mg/dL)', 'bg'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const proto = document.getElementById('p').value;
      const bg = nv('bg');
      let rate;
      if (proto === 'low') rate = bg <= 100 ? 0 : (bg <= 150 ? 0.5 : (bg <= 200 ? 1 : (bg <= 250 ? 2 : 3)));
      else rate = bg <= 100 ? 0 : (bg <= 150 ? 1 : (bg <= 200 ? 2 : (bg <= 250 ? 3 : 4)));
      o.appendChild(el('p', { text: `Suggested rate (example only): ${rate} units/hr` }));
      o.appendChild(el('p', { class: 'muted', text: 'Example data only. Always follow the active institution protocol and verify with the bedside RN/MD.' }));
    });
    ['p', 'bg'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'anticoag-reversal'(root) {
    const o = out(); root.appendChild(o);
    o.appendChild(el('p', { class: 'muted', text: 'Reference table. Always confirm against your institution\'s protocol and current literature.' }));
    const tbl = el('table', { class: 'lookup-table' });
    tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Agent' }), el('th', { scope: 'col', text: 'Standard reversal' }), el('th', { scope: 'col', text: 'Notes' })])]));
    const tbody = el('tbody');
    const rows = [
      ['Warfarin', '4-factor PCC + Vitamin K 10 mg IV', 'Use FFP if PCC unavailable'],
      ['Dabigatran', 'Idarucizumab 5 g IV', 'Hemodialysis as adjunct'],
      ['Apixaban / Rivaroxaban', 'Andexanet alfa per dosing nomogram', '4F-PCC 50 units/kg if andexanet unavailable'],
      ['Heparin (UFH)', 'Protamine 1 mg per 100 units last 2-3 hours', 'Max 50 mg single dose'],
      ['LMWH', 'Protamine 1 mg per 1 mg LMWH within 8 hours', 'Partial reversal only'],
      ['Antiplatelets (ASA, P2Y12)', 'Platelet transfusion in life-threatening bleed', 'Evidence mixed'],
    ];
    for (const r of rows) tbody.appendChild(el('tr', {}, [el('td', { text: r[0] }), el('td', { text: r[1] }), el('td', { text: r[2] })]));
    tbl.appendChild(tbody);
    o.appendChild(el('div', { class: 'table-scroll', role: 'region', 'aria-label': 'Anticoagulant reversal table (scrolls horizontally)', tabindex: '0' }, [tbl]));
  },

  // high-alert removed in spec-v29 wave 29-2 (Group K/O).

  // --- spec-v4 §5: Group F extensions (utilities 129-135) -------------

  'opioid-mme'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'CDC 2022 conversion factors. Reference only. Total MME breakpoints (50, 90) per CDC framing; this tool does not prescribe action.' }));
    const rowsContainer = el('div');
    const addBtn = el('button', { type: 'button', text: 'Add medication' });
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(rowsContainer);
    root.appendChild(el('p', {}, [addBtn]));
    root.appendChild(out);

    let factors = [];
    let counter = 0;
    loadFile('mme-factors', 'mme.json').then((rows) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      factors = rows; addRow(); run();
    });

    function addRow() {
      counter += 1;
      const id = `mme-row-${counter}`;
      const drugSel = el('select', { id: `${id}-drug` });
      for (const f of factors) drugSel.appendChild(el('option', { value: f.drug, text: f.drug }));
      const mg = el('input', { id: `${id}-mg`, type: 'number', step: 'any', placeholder: 'mg/dose' });
      const n = el('input', { id: `${id}-n`, type: 'number', step: 'any', placeholder: 'doses/day' });
      const rm = el('button', { type: 'button', text: 'Remove' });
      const row = el('p', { class: 'mme-row', id }, [drugSel, ' ', mg, ' ', n, ' ', rm]);
      rm.addEventListener('click', () => { row.remove(); run(); });
      [drugSel, mg, n].forEach((node) => node.addEventListener('input', run));
      drugSel.addEventListener('change', run);
      rowsContainer.appendChild(row);
    }

    addBtn.addEventListener('click', () => { addRow(); run(); });

    function run() {
      clear(out);
      if (!factors.length) return;
      const rows = [];
      for (const r of rowsContainer.querySelectorAll('.mme-row')) {
        const id = r.id;
        rows.push({
          drug: document.getElementById(`${id}-drug`).value,
          mgPerDose: Number(document.getElementById(`${id}-mg`).value),
          dosesPerDay: Number(document.getElementById(`${id}-n`).value),
        });
      }
      const valid = rows.filter((x) => x.mgPerDose > 0 && x.dosesPerDay > 0);
      if (!valid.length) return;
      const r = mmeTotal({ rows: valid, factors });
      out.appendChild(el('h2', { text: `Total daily MME: ${r.totalMme.toFixed(1)}` }));
      const flags = [];
      if (r.totalMme >= 50) flags.push('At/above 50 MME (CDC: reassess)');
      if (r.totalMme >= 90) flags.push('At/above 90 MME (CDC: justify with documentation)');
      if (flags.length) out.appendChild(el('p', { text: flags.join(' - ') }));
      out.appendChild(el('h3', { text: 'Per-medication breakdown' }));
      out.appendChild(el('ul', {}, r.breakdown.map((b) =>
        el('li', { text: `${b.drug}: ${b.mgPerDose} mg x ${b.dosesPerDay}/day x factor ${b.factor || '?'} = ${b.mme == null ? '(unknown drug)' : b.mme.toFixed(1) + ' MME'}` }))));
    }
  },

  'steroid-equiv'(root) {
    root.appendChild(field('Dose (mg)', 'st-dose', { placeholder: '40' }));
    const fromSel = el('select', { id: 'st-from' });
    const toSel = el('select', { id: 'st-to' });
    root.appendChild(el('p', {}, [el('label', { for: 'st-from', text: 'From drug' }), el('br'), fromSel]));
    root.appendChild(el('p', {}, [el('label', { for: 'st-to', text: 'To drug' }), el('br'), toSel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('steroid-equiv', 'steroid.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) {
        if (typeof r.equivDoseMg !== 'number') continue;
        fromSel.appendChild(el('option', { value: r.drug, text: r.drug }));
        toSel.appendChild(el('option', { value: r.drug, text: r.drug }));
      }
      const run = () => {
        clear(out);
        const dose = Number(document.getElementById('st-dose').value);
        if (!(dose > 0)) return;
        const eq = steroidEquivalent({ drug: fromSel.value, doseMg: dose, target: toSel.value, table });
        if (eq == null) { out.appendChild(el('p', { text: 'No equivalence available.' })); return; }
        const fromRow = table.find((r) => r.drug === fromSel.value);
        const toRow = table.find((r) => r.drug === toSel.value);
        out.appendChild(el('h2', { text: `${dose} mg ${fromSel.value} ≈ ${eq.toFixed(2)} mg ${toSel.value}` }));
        out.appendChild(el('p', { class: 'muted', text: `Mineralocorticoid activity - from: ${fromRow.mineralocorticoid}; to: ${toRow.mineralocorticoid}` }));
      };
      ['st-dose', 'st-from', 'st-to'].forEach((id) => document.getElementById(id).addEventListener(id === 'st-dose' ? 'input' : 'change', run));
    });
  },

  'benzo-equiv'(root) {
    root.appendChild(field('Dose (mg)', 'bz-dose'));
    const fromSel = el('select', { id: 'bz-from' });
    const toSel = el('select', { id: 'bz-to' });
    root.appendChild(el('p', {}, [el('label', { for: 'bz-from', text: 'From drug' }), el('br'), fromSel]));
    root.appendChild(el('p', {}, [el('label', { for: 'bz-to', text: 'To drug' }), el('br'), toSel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('benzo-equiv', 'benzo.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) {
        fromSel.appendChild(el('option', { value: r.drug, text: r.drug }));
        toSel.appendChild(el('option', { value: r.drug, text: r.drug }));
      }
      const run = () => {
        clear(out);
        const dose = Number(document.getElementById('bz-dose').value);
        if (!(dose > 0)) return;
        const eq = benzoEquivalent({ drug: fromSel.value, doseMg: dose, target: toSel.value, table });
        if (eq == null) { out.appendChild(el('p', { text: 'No equivalence available.' })); return; }
        out.appendChild(el('h2', { text: `${dose} mg ${fromSel.value} ≈ ${eq.toFixed(2)} mg ${toSel.value}` }));
      };
      ['bz-dose', 'bz-from', 'bz-to'].forEach((id) => document.getElementById(id).addEventListener(id === 'bz-dose' ? 'input' : 'change', run));
    });
  },

  'abx-renal'(root) {
    const drugSel = el('select', { id: 'abx-drug' });
    root.appendChild(el('p', {}, [el('label', { for: 'abx-drug', text: 'Antibiotic' }), el('br'), drugSel]));
    root.appendChild(field('CrCl (mL/min)', 'abx-crcl'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('abx-renal', 'abx.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) drugSel.appendChild(el('option', { value: r.drug, text: r.drug }));
      const run = () => {
        clear(out);
        const crCl = Number(document.getElementById('abx-crcl').value);
        if (!(crCl > 0)) return;
        const band = abxRenalDose({ drug: drugSel.value, crCl, table });
        if (!band) { out.appendChild(el('p', { text: 'No dose band found.' })); return; }
        out.appendChild(el('h2', { text: `${drugSel.value} - CrCl ${crCl} mL/min` }));
        out.appendChild(el('p', { text: `Dose: ${band.dose}; Interval: ${band.interval}` }));
      };
      ['abx-drug', 'abx-crcl'].forEach((id) => document.getElementById(id).addEventListener(id === 'abx-crcl' ? 'input' : 'change', run));
    });
  },

  'vasopressor'(root) {
    const drugSel = el('select', { id: 'vp-drug' });
    root.appendChild(el('p', {}, [el('label', { for: 'vp-drug', text: 'Drug' }), el('br'), drugSel]));
    root.appendChild(unitField('Patient weight', 'vp-w', WEIGHT_UNITS));
    root.appendChild(field('Bag concentration (mcg/mL)', 'vp-conc'));
    root.appendChild(field('Desired dose (units below)', 'vp-dose'));
    root.appendChild(field('OR pump rate (mL/hr) for reverse calc', 'vp-rate'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('vasopressor-doses', 'vasopressors.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) drugSel.appendChild(el('option', { value: r.drug, text: `${r.drug} (${r.units})` }));
      const run = () => {
        clear(out);
        const row = table.find((r) => r.drug === drugSel.value);
        if (!row) return;
        const units = row.units === 'units/min' ? 'mcg/min' : row.units; // vasopressin treated as mcg/min for the math wrapper
        const w = unitNum('vp-w');
        const conc = Number(document.getElementById('vp-conc').value);
        const dose = Number(document.getElementById('vp-dose').value);
        const rate = Number(document.getElementById('vp-rate').value);
        if (!(conc > 0)) return;
        out.appendChild(el('h2', { text: `${row.drug} - typical range ${row.typicalRange}` }));
        try {
          if (dose > 0) {
            const r = vasopressorRateMlHr({ dose, units, weightKg: w || undefined, concUgPerMl: conc });
            out.appendChild(el('p', { text: `${dose} ${row.units} → ${r.toFixed(2)} mL/hr` }));
          }
          if (rate > 0) {
            const d = vasopressorDose({ rateMlHr: rate, units, weightKg: w || undefined, concUgPerMl: conc });
            out.appendChild(el('p', { text: `${rate} mL/hr → ${d.toFixed(3)} ${row.units}` }));
          }
        } catch (err) {
          out.appendChild(el('p', { class: 'muted', text: err.message }));
        }
      };
      ['vp-drug', 'vp-w', 'vp-w-unit', 'vp-conc', 'vp-dose', 'vp-rate'].forEach((id) => document.getElementById(id).addEventListener((id === 'vp-drug' || id === 'vp-w-unit') ? 'change' : 'input', run));
    });
  },

  'tpn-macro'(root) {
    root.appendChild(field('Final volume (mL)', 'tpn-vol', { placeholder: '1500' }));
    root.appendChild(field('Dextrose (% final)', 'tpn-d', { placeholder: '20' }));
    root.appendChild(field('Amino acid (% final)', 'tpn-aa', { placeholder: '5' }));
    root.appendChild(field('Lipid 20% (mL as % of final volume)', 'tpn-lipid', { placeholder: '10' }));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      try {
        const r = tpnMacro({
          volumeMl: Number(document.getElementById('tpn-vol').value),
          dextrosePct: Number(document.getElementById('tpn-d').value) || 0,
          aminoAcidPct: Number(document.getElementById('tpn-aa').value) || 0,
          lipidPctOfVolume: Number(document.getElementById('tpn-lipid').value) || 0,
        });
        out.appendChild(el('h2', { text: `Total: ${r.totalKcal.toFixed(0)} kcal in ${r.volumeMl} mL` }));
        out.appendChild(el('ul', {}, [
          el('li', { text: `Dextrose: ${r.dextroseG.toFixed(1)} g (${r.kcalDextrose.toFixed(0)} kcal)` }),
          el('li', { text: `Protein: ${r.proteinG.toFixed(1)} g (${r.kcalProtein.toFixed(0)} kcal)` }),
          el('li', { text: `Lipid: ${r.lipidG.toFixed(1)} g (${r.kcalLipid.toFixed(0)} kcal)` }),
        ]));
      } catch (err) {
        out.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    ['tpn-vol', 'tpn-d', 'tpn-aa', 'tpn-lipid'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // iv-to-po removed in spec-v29 wave 29-2 (Group K/O): static
  // equivalence table per sec 7.2 audit decision.

  // spec-v29 sec 4.8.1 wave 29-3c: insulin correction (ADA 2024).
  'insulin-correction'(root) {
    root.appendChild(field('Current BG (mg/dL)', 'ic-bg'));
    root.appendChild(field('Target BG (mg/dL)', 'ic-target'));
    root.appendChild(field('ISF (mg/dL per unit; leave blank to derive from TDD)', 'ic-isf'));
    root.appendChild(field('Total daily insulin dose (units; used only if ISF blank)', 'ic-tdd'));
    root.appendChild(selectField('ISF rule (when derived from TDD)', 'ic-rule', [
      { value: 'rapid',   text: '1800-rule (rapid-acting analogues)' },
      { value: 'regular', text: '1500-rule (regular insulin)' },
    ]));
    root.appendChild(field('Carbs to be eaten (g; leave blank for correction only)', 'ic-carbs'));
    root.appendChild(field('Insulin-to-carb ratio (g per unit)', 'ic-icr'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = insulinCorrection({
        currentBG: nv('ic-bg'),
        targetBG:  nv('ic-target'),
        isf:       nv('ic-isf'),
        totalDailyDose: nv('ic-tdd'),
        isfRule:   document.getElementById('ic-rule').value,
        carbs:     nv('ic-carbs'),
        icr:       nv('ic-icr'),
      });
      o.appendChild(el('h2', { text: `${r.totalUnits} U total` }));
      o.appendChild(el('p', { text: `ISF ${r.isf}${r.isfDerivedFromTdd ? ' (derived from TDD)' : ''}` }));
      o.appendChild(el('ul', {}, [
        el('li', { text: `Correction: ${r.correctionUnits} U` }),
        el('li', { text: `Meal coverage: ${r.mealUnits} U` }),
      ]));
      o.appendChild(el('p', { class: 'clinical-notice', text: 'ADA 2024 hospital glycemic target: 140-180 mg/dL non-critical; 110-180 mg/dL ICU.' }));
    });
    ['ic-bg', 'ic-target', 'ic-isf', 'ic-tdd', 'ic-rule', 'ic-carbs', 'ic-icr'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('ic-rule').addEventListener('change', run);
  },

  // spec-v29 sec 4.9.1 wave 29-3c: electrolyte replacement ladder.
  'electrolyte-replacement'(root) {
    root.appendChild(selectField('Electrolyte', 'er-e', [
      { value: 'k',    text: 'Potassium (mEq/L)' },
      { value: 'mg',   text: 'Magnesium (mg/dL)' },
      { value: 'phos', text: 'Phosphate (mg/dL)' },
    ]));
    root.appendChild(field('Serum level', 'er-l'));
    root.appendChild(selectField('Route', 'er-r', [
      { value: 'iv', text: 'IV' },
      { value: 'po', text: 'PO' },
    ]));
    const renalWrap = el('p', {}, [
      el('label', { for: 'er-renal' }, [
        el('input', { id: 'er-renal', type: 'checkbox' }),
        ' Renal impairment (eGFR < 30 or AKI)',
      ]),
    ]);
    root.appendChild(renalWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = electrolyteReplacement({
        electrolyte:   document.getElementById('er-e').value,
        level:         nv('er-l'),
        route:         document.getElementById('er-r').value,
        renalImpaired: document.getElementById('er-renal').checked,
      });
      o.appendChild(el('h2', { text: `${r.electrolyte}: ${r.dose}` }));
      if (r.rate) o.appendChild(el('p', { text: r.rate }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['er-e', 'er-l', 'er-r'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('er-e').addEventListener('change', run);
    document.getElementById('er-r').addEventListener('change', run);
    document.getElementById('er-renal').addEventListener('change', run);
  },

  // spec-v29 sec 4.17.1 wave 29-3c: CRRT effluent dose + citrate ratio.
  'crrt-dose'(root) {
    root.appendChild(unitField('Patient weight', 'cr-w', WEIGHT_UNITS));
    root.appendChild(field('Prescribed effluent rate (mL/h)', 'cr-r'));
    root.appendChild(selectField('Modality', 'cr-mod', [
      { value: 'CVVH',   text: 'CVVH' },
      { value: 'CVVHD',  text: 'CVVHD' },
      { value: 'CVVHDF', text: 'CVVHDF' },
    ]));
    root.appendChild(field('Ultrafiltration (mL/h, optional)', 'cr-uf'));
    root.appendChild(field('Systemic ionised Ca (mmol/L, optional)', 'cr-sca'));
    root.appendChild(field('Post-filter ionised Ca (mmol/L, optional)', 'cr-pca'));
    root.appendChild(field('Total Ca (mmol/L, optional)', 'cr-tca'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = crrtDose({
        weightKg:              unitNum('cr-w'),
        effluentRateMlPerHr:   nv('cr-r'),
        modality:              document.getElementById('cr-mod').value,
        ultrafiltrationMlPerHr: nv('cr-uf'),
        systemicIonisedCa:     nv('cr-sca'),
        postFilterIonisedCa:   nv('cr-pca'),
        totalCa:               nv('cr-tca'),
      });
      o.appendChild(el('h2', { text: `${r.effluentDoseMlPerKgPerHr} mL/kg/h` }));
      o.appendChild(el('p', { text: r.text }));
      if (r.totalIonisedRatio !== null) o.appendChild(el('p', { text: `Total/ionised Ca ratio: ${r.totalIonisedRatio}` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['cr-w', 'cr-r', 'cr-uf', 'cr-sca', 'cr-pca', 'cr-tca'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    ['cr-mod', 'cr-w-unit'].forEach((id) => document.getElementById(id).addEventListener('change', run));
  },

  // spec-v29 sec 4.18.1 wave 29-3c: ECMO sweep / flow titration.
  'ecmo-titration'(root) {
    root.appendChild(selectField('Modality', 'ec-mod', [
      { value: 'VV', text: 'VV (respiratory)' },
      { value: 'VA', text: 'VA (cardiopulmonary)' },
    ]));
    root.appendChild(unitField('Patient weight', 'ec-w', WEIGHT_UNITS));
    root.appendChild(field('Current sweep (L/min)', 'ec-sw'));
    root.appendChild(field('Current pump flow (L/min)', 'ec-fl'));
    root.appendChild(field('Current PaCO2 (mmHg)', 'ec-pco'));
    root.appendChild(field('Target PaCO2 (mmHg; default 40)', 'ec-tgt'));
    root.appendChild(field('Hemoglobin (g/dL)', 'ec-hb'));
    root.appendChild(field('SaO2 or post-oxygenator SatO2 (% or fraction)', 'ec-sat'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = ecmoTitration({
        modality:        document.getElementById('ec-mod').value,
        weightKg:        unitNum('ec-w'),
        currentSweepLpm: nv('ec-sw'),
        currentFlowLpm:  nv('ec-fl'),
        currentPaCO2:    nv('ec-pco'),
        targetPaCO2:     nv('ec-tgt'),
        hb:              nv('ec-hb'),
        sao2:            nv('ec-sat'),
      });
      o.appendChild(el('h2', { text: `Sweep ${r.suggestedSweepLpm} L/min / Flow ${r.suggestedFlowLpm} L/min` }));
      if (r.do2iMlPerKgPerMin !== null) o.appendChild(el('p', { text: `DO2i ${r.do2iMlPerKgPerMin} mL/kg/min (ELSO 2022 target >= 6)` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['ec-w', 'ec-sw', 'ec-fl', 'ec-pco', 'ec-tgt', 'ec-hb', 'ec-sat'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    ['ec-mod', 'ec-w-unit'].forEach((id) => document.getElementById(id).addEventListener('change', run));
  },

  // spec-v31 §2.1: Beers Criteria (AGS 2023) deprescribing checker.
  'beers-check'(root) {
    root.appendChild(field('Patient age (years)', 'bc-age', { placeholder: '75' }));
    root.appendChild(el('p', { class: 'muted', text: 'Select all medication categories the patient is currently taking:' }));
    const medList = el('div', { id: 'bc-med-list' });
    for (const [key, def] of Object.entries(BEERS_PIM)) {
      const wrap = el('p');
      const cb = el('input', { id: `bc-m-${key}`, type: 'checkbox', 'data-bc-med': key });
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('label', { for: `bc-m-${key}`, text: def.label }));
      medList.appendChild(wrap);
    }
    root.appendChild(medList);
    root.appendChild(el('p', { class: 'muted', text: 'Select all relevant comorbidities (Beers Table 3 drug-disease list):' }));
    const cmbList = el('div', { id: 'bc-cmb-list' });
    for (const [key, label] of Object.entries(BEERS_DISEASE)) {
      const wrap = el('p');
      const cb = el('input', { id: `bc-c-${key}`, type: 'checkbox', 'data-bc-cmb': key });
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('label', { for: `bc-c-${key}`, text: label }));
      cmbList.appendChild(wrap);
    }
    root.appendChild(cmbList);
    const o = out(); root.appendChild(o);
    const collect = (attr) =>
      Array.from(document.querySelectorAll(`[${attr}]`))
        .filter((n) => n.checked)
        .map((n) => n.getAttribute(attr));
    const run = () => safe(o, () => {
      const r = beersCheck({
        ageYears: nv('bc-age'),
        medications: collect('data-bc-med'),
        comorbidities: collect('data-bc-cmb'),
      });
      o.appendChild(el('h2', { text: r.summary }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'muted', text: b }));
      if (r.pimFlags.length) {
        o.appendChild(el('h3', { text: 'PIM flags (AGS 2023 Table 2)' }));
        for (const f of r.pimFlags) {
          o.appendChild(el('p', {}, [
            el('strong', { text: `${f.label}. ` }),
            document.createTextNode(`${f.rationale} ${f.recommendation}`),
          ]));
        }
      }
      if (r.diseaseFlags.length) {
        o.appendChild(el('h3', { text: 'Drug-disease interactions (AGS 2023 Table 3)' }));
        for (const f of r.diseaseFlags) o.appendChild(el('p', { text: f.text }));
      }
      if (r.drugDrugFlags.length) {
        o.appendChild(el('h3', { text: 'Drug-drug interactions (AGS 2023 Table 6)' }));
        for (const f of r.drugDrugFlags) o.appendChild(el('p', { class: 'clinical-notice', text: f.text }));
      }
      o.appendChild(el('p', { class: 'muted', text: 'Source: AGS 2023 Beers Criteria, J Am Geriatr Soc. 2023;71(7):2052-2081.' }));
    });
    document.getElementById('bc-age').addEventListener('input', run);
    for (const n of document.querySelectorAll('[data-bc-med], [data-bc-cmb]')) {
      n.addEventListener('change', run);
    }
    run();
  },
};
