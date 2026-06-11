// spec-v55: renderers for the 13 bedside hematology / renal-acid / oxygenation
// tiles. One module, same input/render pattern as the rest of the codebase:
// every input has a real <label for> (a11y-check passes), no innerHTML, no
// network, no storage. Nullable numeric outputs route through fmt() so a
// guarded null never reaches the DOM as NaN/undefined (spec-v53 §3.2).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as V6 from '../lib/clinical-v6.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
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
function val(id) { return Number(document.getElementById(id).value); }
function str(id) { return document.getElementById(id).value; }
function optNum(id) {
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function list(items) {
  return el('ul', {}, items.filter(Boolean));
}
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
// Wire an input/change listener to every field id so the output recomputes live.
function wire(ids, run) {
  for (const id of ids) {
    const node = document.getElementById(id);
    if (node) { node.addEventListener('input', run); node.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 anc ----------------------------------------------------------
  anc(root) {
    root.appendChild(field('WBC (x10^9/L = K/uL)', 'anc-wbc', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Segmented neutrophils (%)', 'anc-segs', { placeholder: 'e.g. 60' }));
    root.appendChild(field('Bands (%)', 'anc-bands', { placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['anc-wbc', 'anc-segs', 'anc-bands'], () => safe(o, () => {
      const r = V6.anc({ wbc: val('anc-wbc'), segs: val('anc-segs'), bands: val('anc-bands') });
      o.appendChild(list([
        li(`ANC: ${fmt(r.anc, { fallback: '(enter values)' })} cells/uL`),
        li(r.grade),
        r.precautions ? li('Neutropenic precautions; fever in this range is an emergency.', 'warn') : null,
      ]));
    }));
  },

  // ----- 2.2 retic-index --------------------------------------------------
  'retic-index'(root) {
    root.appendChild(field('Reticulocyte (%)', 'ri-retic', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Hematocrit (%)', 'ri-hct', { placeholder: 'e.g. 30' }));
    const o = out(); root.appendChild(o);
    wire(['ri-retic', 'ri-hct'], () => safe(o, () => {
      const r = V6.reticIndex({ reticPct: val('ri-retic'), hct: val('ri-hct') });
      o.appendChild(list([
        li(`Corrected reticulocyte: ${fmt(r.correctedRetic, { fallback: '(enter values)' })}%`),
        li(`Maturation factor: ${r.maturationFactor}`),
        li(`Reticulocyte production index (RPI): ${fmt(r.rpi, { fallback: '--' })}`),
        li(r.band),
      ]));
    }));
  },

  // ----- 2.3 tsat ---------------------------------------------------------
  tsat(root) {
    root.appendChild(field('Serum iron (ug/dL)', 'ts-iron', { placeholder: 'e.g. 30' }));
    root.appendChild(field('TIBC (ug/dL)', 'ts-tibc', { placeholder: 'e.g. 450' }));
    root.appendChild(field('Ferritin (ng/mL, optional)', 'ts-ferritin', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['ts-iron', 'ts-tibc', 'ts-ferritin'], () => safe(o, () => {
      const r = V6.tsat({ ironUgDl: val('ts-iron'), tibcUgDl: val('ts-tibc'), ferritinNgMl: optNum('ts-ferritin') });
      o.appendChild(list([
        li(`Transferrin saturation: ${fmt(r.tsat, { fallback: '(enter iron & TIBC)' })}%`),
        li(r.pattern),
      ]));
    }));
  },

  // ----- 2.4 cci-platelet -------------------------------------------------
  'cci-platelet'(root) {
    root.appendChild(field('Pre-transfusion platelet (x10^9/L)', 'cci-pre', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Post-transfusion platelet (x10^9/L)', 'cci-post', { placeholder: 'e.g. 40' }));
    root.appendChild(field('Body surface area (m^2)', 'cci-bsa', { placeholder: 'e.g. 1.8' }));
    root.appendChild(field('Platelet dose (x10^11)', 'cci-dose', { placeholder: 'e.g. 3.0' }));
    const o = out(); root.appendChild(o);
    wire(['cci-pre', 'cci-post', 'cci-bsa', 'cci-dose'], () => safe(o, () => {
      const r = V6.cciPlatelet({ prePlt: val('cci-pre'), postPlt: val('cci-post'), bsaM2: val('cci-bsa'), doseE11: val('cci-dose') });
      o.appendChild(list([
        li(`Count increment: ${fmt(r.increment, { fallback: '--' })} x10^9/L`),
        li(`Corrected count increment (CCI): ${fmt(r.cci, { fallback: '(enter values)' })}`),
        li(r.band, r.refractory ? 'warn' : null),
      ]));
    }));
  },

  // ----- 2.5 ldl-calc -----------------------------------------------------
  'ldl-calc'(root) {
    root.appendChild(field('Total cholesterol (mg/dL)', 'ldl-tc', { placeholder: 'e.g. 200' }));
    root.appendChild(field('HDL cholesterol (mg/dL)', 'ldl-hdl', { placeholder: 'e.g. 50' }));
    root.appendChild(field('Triglycerides (mg/dL)', 'ldl-tg', { placeholder: 'e.g. 150' }));
    const o = out(); root.appendChild(o);
    wire(['ldl-tc', 'ldl-hdl', 'ldl-tg'], () => safe(o, () => {
      const r = V6.ldlCalc({ totalChol: val('ldl-tc'), hdl: val('ldl-hdl'), tg: val('ldl-tg') });
      resultRow(o, [
        { label: 'Non-HDL cholesterol', value: fmt(r.nonHdl, { fallback: '--' }), units: 'mg/dL' },
        { label: 'Friedewald LDL', value: fmt(r.friedewald, { fallback: '(invalid at TG >=400)' }), units: 'mg/dL' },
        { label: 'NIH (Sampson 2020) LDL', value: fmt(r.nih, { fallback: '(out of range)' }), units: 'mg/dL' },
        { text: r.note },
      ]);
    }));
  },

  // ----- 2.6 eag-a1c ------------------------------------------------------
  'eag-a1c'(root) {
    root.appendChild(field('HbA1c (%)', 'eag-a1c', { placeholder: 'e.g. 7' }));
    const o = out(); root.appendChild(o);
    wire(['eag-a1c'], () => safe(o, () => {
      const r = V6.eagA1c({ a1c: val('eag-a1c') });
      o.appendChild(list([
        li(`Estimated average glucose: ${fmt(r.eagMgDl, { fallback: '(enter A1c)' })} mg/dL`),
        li(`= ${fmt(r.eagMmolL, { fallback: '--' })} mmol/L`),
        li('A population estimate; not a substitute for individual glucose monitoring.'),
      ]));
    }));
  },

  // ----- 2.7 cao2-do2 -----------------------------------------------------
  'cao2-do2'(root) {
    root.appendChild(field('Hemoglobin (g/dL)', 'cao2-hb', { placeholder: 'e.g. 15' }));
    root.appendChild(field('SaO2 (%)', 'cao2-sao2', { placeholder: 'e.g. 98' }));
    root.appendChild(field('PaO2 (mmHg)', 'cao2-pao2', { placeholder: 'e.g. 100' }));
    root.appendChild(field('Cardiac output (L/min, optional for DO2)', 'cao2-co', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['cao2-hb', 'cao2-sao2', 'cao2-pao2', 'cao2-co'], () => safe(o, () => {
      const r = V6.cao2Do2({ hb: val('cao2-hb'), sao2: val('cao2-sao2'), pao2: val('cao2-pao2'), cardiacOutput: optNum('cao2-co') });
      resultRow(o, [
        { label: 'Arterial O2 content (CaO2)', value: fmt(r.cao2, { fallback: '(enter values)' }), units: 'mL O2/dL' },
        { label: 'Hb-bound', value: `${fmt(r.boundO2, { fallback: '--' })} | dissolved: ${fmt(r.dissolvedO2, { fallback: '--' })}`, units: 'mL O2/dL' },
        { label: 'O2 delivery (DO2)', value: fmt(r.do2, { fallback: '(enter cardiac output)' }), units: 'mL O2/min' },
      ]);
    }));
  },

  // ----- 2.8 oxygenation-index --------------------------------------------
  'oxygenation-index'(root) {
    root.appendChild(field('FiO2 (0.21-1.0)', 'oi-fio2', { placeholder: 'e.g. 0.6' }));
    root.appendChild(field('Mean airway pressure (cmH2O)', 'oi-map', { placeholder: 'e.g. 15' }));
    root.appendChild(field('PaO2 (mmHg, for OI)', 'oi-pao2', { placeholder: 'optional' }));
    root.appendChild(field('SpO2 (%, for OSI)', 'oi-spo2', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['oi-fio2', 'oi-map', 'oi-pao2', 'oi-spo2'], () => safe(o, () => {
      const r = V6.oxygenationIndex({ fio2: val('oi-fio2'), map: val('oi-map'), pao2: optNum('oi-pao2'), spo2: optNum('oi-spo2') });
      resultRow(o, [
        { label: 'Oxygenation Index (OI)', value: fmt(r.oi, { fallback: '(enter PaO2)' }) },
        r.oiBand ? { text: r.oiBand } : null,
        { label: 'Oxygen Saturation Index (OSI)', value: fmt(r.osi, { fallback: '(enter SpO2)' }) },
        r.osiBand ? { text: r.osiBand } : null,
      ]);
    }));
  },

  // ----- 2.9 driving-pressure ---------------------------------------------
  'driving-pressure'(root) {
    root.appendChild(field('Plateau pressure (cmH2O)', 'dp-plat', { placeholder: 'e.g. 25' }));
    root.appendChild(field('PEEP (cmH2O)', 'dp-peep', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Tidal volume (mL)', 'dp-vt', { placeholder: 'e.g. 400' }));
    root.appendChild(field('Peak pressure (cmH2O, optional for dynamic)', 'dp-peak', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['dp-plat', 'dp-peep', 'dp-vt', 'dp-peak'], () => safe(o, () => {
      const r = V6.drivingPressure({ plateau: val('dp-plat'), peep: val('dp-peep'), tidalVolume: val('dp-vt'), peak: optNum('dp-peak') });
      resultRow(o, [
        { label: 'Driving pressure (dP)', value: fmt(r.drivingPressure, { fallback: '(plateau must exceed PEEP)' }), units: 'cmH2O' },
        { label: 'Static compliance', value: fmt(r.staticCompliance, { fallback: '--' }), units: 'mL/cmH2O' },
        { label: 'Dynamic compliance', value: fmt(r.dynamicCompliance, { fallback: '(enter peak pressure)' }), units: 'mL/cmH2O' },
        { text: r.band, cls: r.drivingPressure != null && r.drivingPressure > 15 ? 'warn' : null },
      ]);
    }));
  },

  // ----- 2.10 ttkg --------------------------------------------------------
  ttkg(root) {
    root.appendChild(field('Urine K (mEq/L)', 'ttkg-uk', { placeholder: 'e.g. 40' }));
    root.appendChild(field('Plasma K (mEq/L)', 'ttkg-pk', { placeholder: 'e.g. 3.0' }));
    root.appendChild(field('Urine osmolality (mOsm/kg)', 'ttkg-uosm', { placeholder: 'e.g. 600' }));
    root.appendChild(field('Plasma osmolality (mOsm/kg)', 'ttkg-posm', { placeholder: 'e.g. 290' }));
    root.appendChild(field('Urine Na (mEq/L)', 'ttkg-una', { placeholder: 'e.g. 40' }));
    const o = out(); root.appendChild(o);
    wire(['ttkg-uk', 'ttkg-pk', 'ttkg-uosm', 'ttkg-posm', 'ttkg-una'], () => safe(o, () => {
      const r = V6.ttkg({ urineK: val('ttkg-uk'), plasmaK: val('ttkg-pk'), urineOsm: val('ttkg-uosm'), plasmaOsm: val('ttkg-posm'), urineNa: val('ttkg-una') });
      if (!r.valid) { o.appendChild(list([li(r.note, 'warn')])); return; }
      o.appendChild(list([
        li(`TTKG: ${fmt(r.ttkg, { fallback: '--' })}`),
        li(r.band),
      ]));
    }));
  },

  // ----- 2.11 urine-anion-gap ---------------------------------------------
  'urine-anion-gap'(root) {
    root.appendChild(field('Urine Na (mEq/L)', 'uag-na', { placeholder: 'e.g. 40' }));
    root.appendChild(field('Urine K (mEq/L)', 'uag-k', { placeholder: 'e.g. 30' }));
    root.appendChild(field('Urine Cl (mEq/L)', 'uag-cl', { placeholder: 'e.g. 90' }));
    const o = out(); root.appendChild(o);
    wire(['uag-na', 'uag-k', 'uag-cl'], () => safe(o, () => {
      const r = V6.urineAnionGap({ urineNa: val('uag-na'), urineK: val('uag-k'), urineCl: val('uag-cl') });
      o.appendChild(list([
        li(`Urine anion gap: ${fmt(r.uag, { fallback: '(enter values)' })} mEq/L`),
        li(r.band),
      ]));
    }));
  },

  // ----- 2.12 acid-base-deficit -------------------------------------------
  'acid-base-deficit'(root) {
    root.appendChild(field('Weight (kg)', 'abd-wt', { placeholder: 'e.g. 70' }));
    root.appendChild(selectField('Sex (TBW fraction)', 'abd-sex', [
      { value: 'M', text: 'Male (0.6)' },
      { value: 'F', text: 'Female (0.5)' },
    ]));
    root.appendChild(field('Measured HCO3 (mEq/L)', 'abd-mhco3', { placeholder: 'e.g. 14' }));
    root.appendChild(field('Target HCO3 (mEq/L)', 'abd-thco3', { placeholder: 'e.g. 24' }));
    root.appendChild(field('Measured Na (mEq/L)', 'abd-mna', { placeholder: 'e.g. 120' }));
    root.appendChild(field('Target Na (mEq/L)', 'abd-tna', { placeholder: 'e.g. 135' }));
    const o = out(); root.appendChild(o);
    wire(['abd-wt', 'abd-sex', 'abd-mhco3', 'abd-thco3', 'abd-mna', 'abd-tna'], () => safe(o, () => {
      const r = V6.acidBaseDeficit({
        weightKg: val('abd-wt'), sex: str('abd-sex'),
        measuredHco3: val('abd-mhco3'), targetHco3: val('abd-thco3'),
        measuredNa: val('abd-mna'), targetNa: val('abd-tna'),
      });
      resultRow(o, [
        { label: 'Total body water', value: fmt(r.tbwLiters, { fallback: '--' }), units: 'L' },
        { label: 'Bicarbonate deficit', value: fmt(r.hco3DeficitMeq, { fallback: '(enter values)' }), units: 'mEq' },
        { label: 'Sodium deficit', value: fmt(r.naDeficitMeq, { fallback: '(enter values)' }), units: 'mEq' },
        { text: 'Deficit estimates, not infusion rates. Verify against local protocol.' },
        r.hyponatremiaWarn ? { text: r.hyponatremiaWarn, cls: 'warn' } : null,
        r.hypernatremiaWarn ? { text: r.hypernatremiaWarn, cls: 'warn' } : null,
      ]);
    }));
  },

  // ----- 2.13 schwartz-egfr -----------------------------------------------
  'schwartz-egfr'(root) {
    root.appendChild(field('Height (cm)', 'se-ht', { placeholder: 'e.g. 100' }));
    root.appendChild(field('Serum creatinine (mg/dL)', 'se-scr', { placeholder: 'e.g. 0.5' }));
    const o = out(); root.appendChild(o);
    wire(['se-ht', 'se-scr'], () => safe(o, () => {
      const r = V6.schwartzEgfr({ heightCm: val('se-ht'), scr: val('se-scr') });
      o.appendChild(list([
        li(`Estimated GFR: ${fmt(r.egfr, { fallback: '(enter values)' })} mL/min/1.73m^2`),
        li(r.band),
        li('Bedside Schwartz; validated ages 1-18 with IDMS-traceable creatinine. Not for neonates or adults.'),
      ]));
    }));
  },
};
