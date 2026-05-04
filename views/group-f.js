// Group F: Medication and Infusion (41-47).

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import * as C from '../lib/clinical.js';

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
    root.appendChild(field('Weight (kg)', 'w'));
    root.appendChild(field('Dose per kg', 'd'));
    root.appendChild(field('Dose unit (e.g. mg/kg, mcg/kg)', 'u', { type: 'text', placeholder: 'mg/kg' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const total = C.weightDose({ weightKg: nv('w'), dosePerKg: nv('d') });
      const unit = document.getElementById('u').value.trim().replace(/\/kg$/, '') || 'units';
      o.appendChild(el('p', { text: `Total dose: ${total} ${unit}` }));
      // Sanity bounds (general adult heuristic): warn when computed exceeds 5x typical adult dose.
      if (nv('w') > 0 && total / nv('w') > 100) {
        o.appendChild(el('p', { class: 'notice', text: 'Computed per-kg value is unusually large. Double-check the unit and the dose against your formulary.' }));
      }
    });
    ['w', 'd', 'u'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'conc-rate'(root) {
    root.appendChild(field('Dose value', 'dv'));
    root.appendChild(selectField('Dose unit', 'du', [
      { value: 'mcg/kg/min', text: 'mcg/kg/min' }, { value: 'mcg/min', text: 'mcg/min' },
      { value: 'mg/min', text: 'mg/min' }, { value: 'units/hr', text: 'units/hr' },
      { value: 'units/min', text: 'units/min' },
    ]));
    root.appendChild(field('Patient weight (kg, if dose per kg)', 'w'));
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
        weightKg: nv('w'), concentrationValue: nv('cv'),
        concentrationUnit: document.getElementById('cu').value,
      });
      o.appendChild(el('p', { text: `Infusion rate: ${r.mlPerHr} mL/hr` }));
      o.appendChild(el('p', { class: 'muted', text: 'Verify against your institution\'s protocol and pump configuration.' }));
    });
    ['dv', 'du', 'w', 'cv', 'cu'].forEach((id) => document.getElementById(id).addEventListener('input', run));
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
    o.appendChild(tbl);
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
    tbl.appendChild(tbody); o.appendChild(tbl);
  },

  'high-alert'(root) {
    const o = out(); root.appendChild(o);
    loadFile('clinical', 'ismp-high-alert.json').then((data) => {
      o.appendChild(el('p', { class: 'muted', text: data.attribution }));
      const tbl = el('table', { class: 'lookup-table' });
      tbl.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Medication' }), el('th', { scope: 'col', text: 'Why high-alert (project author note)' })])]));
      const tbody = el('tbody');
      for (const m of data.meds) tbody.appendChild(el('tr', {}, [el('td', { text: m.name }), el('td', { text: m.note })]));
      tbl.appendChild(tbody); o.appendChild(tbl);
    });
  },
};
