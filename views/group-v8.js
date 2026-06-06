// spec-v56: renderers for the 13 weight-based dosing / infusion-titration /
// bedside-toxicology tiles. One module, same input/render pattern as the rest
// of the codebase: every input has a real <label for> (a11y-check passes), no
// innerHTML, no network, no storage. Nullable numeric outputs route through
// fmt() so a guarded null never reaches the DOM as NaN/undefined (spec-v53
// §3.2). Every tile renders the standing medication notice (spec-v56 §3); the
// two validity-window tiles (acetaminophen-nomogram, aminoglycoside) surface a
// refusal message from the compute layer's RangeError rather than a number.

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as M5 from '../lib/medication-v5.js';

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
function checkboxField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { return Number(document.getElementById(id).value); }
function str(id) { return document.getElementById(id).value; }
function checked(id) { return document.getElementById(id).checked; }
function optNum(id) {
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function list(items) { return el('ul', {}, items.filter(Boolean)); }
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
// The standing medication notice every v56 tile carries (spec-v56 §3).
function medNotice(root) {
  root.appendChild(el('p', {
    class: 'notice',
    text: 'Decision support, not a prescription. Verify against your institution\'s protocol and a current reference before administering.',
  }));
}
function wire(ids, run) {
  for (const id of ids) {
    const node = document.getElementById(id);
    if (node) { node.addEventListener('input', run); node.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 heparin-nomogram --------------------------------------------
  'heparin-nomogram'(root) {
    root.appendChild(field('Weight (kg)', 'hep-wt', { placeholder: 'e.g. 80' }));
    root.appendChild(selectField('Indication', 'hep-ind', [
      { value: 'vte', text: 'VTE (80 u/kg bolus, 18 u/kg/h)' },
      { value: 'acs', text: 'ACS (60 u/kg bolus max 4000, 12 u/kg/h max 1000)' },
    ]));
    root.appendChild(field('Current aPTT (seconds, optional)', 'hep-aptt', { placeholder: 'e.g. 40' }));
    const o = out(); root.appendChild(o);
    wire(['hep-wt', 'hep-ind', 'hep-aptt'], () => safe(o, () => {
      const r = M5.heparinNomogram({ weightKg: val('hep-wt'), indication: str('hep-ind'), aptt: optNum('hep-aptt') });
      const items = [
        li(`Initial bolus: ${fmt(r.initialBolusUnits, { fallback: '(enter weight)' })} units`),
        li(`Initial rate: ${fmt(r.initialRateUnitsH, { fallback: '--' })} units/h (${r.initialRateUkgH} u/kg/h)`),
        r.weightCapped ? li('Weight exceeds 150 kg: bolus/rate computed on a 150 kg cap. Confirm against protocol.', 'warn') : null,
      ];
      if (r.titration) {
        items.push(li(r.titration.label, r.titration.hold ? 'warn' : null));
        if (r.titration.rebolusUnits) items.push(li(`Re-bolus: ${r.titration.rebolusUnits} units`));
        if (r.titration.rateChangeUnitsH) items.push(li(`Rate change: ${r.titration.rateChangeUnitsH > 0 ? '+' : ''}${r.titration.rateChangeUnitsH} units/h`));
        items.push(li(`Recheck aPTT in ${r.titration.recheckHours} h.`));
      }
      o.appendChild(list(items));
      o.appendChild(el('p', { class: 'muted', text: 'Raschke nomogram assumes a therapeutic aPTT range of ~46-70 s; confirm against your institution\'s aPTT/anti-Xa nomogram.' }));
    }));
    medNotice(root);
  },

  // ----- 2.2 vanc-auc ----------------------------------------------------
  'vanc-auc'(root) {
    root.appendChild(field('Peak level (mg/L)', 'va-peak', { placeholder: 'e.g. 30' }));
    root.appendChild(field('Peak draw time (h after infusion end)', 'va-tpeak', { placeholder: 'e.g. 1' }));
    root.appendChild(field('Trough level (mg/L)', 'va-trough', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Trough draw time (h after infusion end)', 'va-ttrough', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Infusion duration (h)', 'va-tinf', { placeholder: 'e.g. 1' }));
    root.appendChild(field('Dosing interval (h)', 'va-tau', { placeholder: 'e.g. 12' }));
    root.appendChild(field('MIC (mg/L)', 'va-mic', { placeholder: 'e.g. 1' }));
    const o = out(); root.appendChild(o);
    wire(['va-peak', 'va-tpeak', 'va-trough', 'va-ttrough', 'va-tinf', 'va-tau', 'va-mic'], () => safe(o, () => {
      const r = M5.vancAuc({
        peak: val('va-peak'), tPeak: val('va-tpeak'), trough: val('va-trough'), tTrough: val('va-ttrough'),
        tInf: val('va-tinf'), tau: val('va-tau'), mic: val('va-mic'),
      });
      o.appendChild(list([
        li(`Elimination constant k: ${fmt(r.k, { fallback: '--' })} /h (t1/2 ${fmt(r.halfLife, { fallback: '--' })} h)`),
        li(`Extrapolated Cmax/Cmin: ${fmt(r.cMax, { fallback: '--' })} / ${fmt(r.cMin, { fallback: '--' })} mg/L`),
        li(`AUC24: ${fmt(r.auc24, { fallback: '(enter levels)' })} mg*h/L`),
        li(`AUC24/MIC: ${fmt(r.aucMicRatio, { fallback: '--' })}`),
        li(r.band, r.aucMicRatio > 600 ? 'warn' : null),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'First-order two-level method (Sawchuk-Zaske), not Bayesian. Pharmacy runs population modeling for complex cases.' }));
    }));
    medNotice(root);
  },

  // ----- 2.3 aminoglycoside ----------------------------------------------
  aminoglycoside(root) {
    root.appendChild(selectField('Drug', 'ag-drug', [
      { value: 'gentamicin', text: 'Gentamicin (7 mg/kg)' },
      { value: 'tobramycin', text: 'Tobramycin (7 mg/kg)' },
      { value: 'amikacin', text: 'Amikacin (15 mg/kg)' },
    ]));
    root.appendChild(field('Dosing weight (kg)', 'ag-wt', { placeholder: 'ABW; AdjBW if obese' }));
    root.appendChild(field('Creatinine clearance (mL/min)', 'ag-crcl', { placeholder: 'e.g. 80' }));
    root.appendChild(checkboxField('On dialysis', 'ag-dialysis'));
    const o = out(); root.appendChild(o);
    wire(['ag-drug', 'ag-wt', 'ag-crcl', 'ag-dialysis'], () => safe(o, () => {
      const r = M5.aminoglycoside({ drug: str('ag-drug'), weightKg: val('ag-wt'), crCl: val('ag-crcl'), dialysis: checked('ag-dialysis') });
      o.appendChild(list([
        li(`Extended-interval dose: ${fmt(r.doseMg, { fallback: '(enter weight)' })} mg (${r.mgkg} mg/kg)`),
        li(`Starting interval (from CrCl): ${r.interval}`),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'Confirm the interval by plotting the single random level on your institution\'s printed Hartford nomogram. Not for synergy dosing.' }));
    }));
    medNotice(root);
  },

  // ----- 2.4 acetaminophen-nomogram --------------------------------------
  'acetaminophen-nomogram'(root) {
    root.appendChild(field('Hours since single acute ingestion (4-24 h)', 'apap-h', { placeholder: 'e.g. 4' }));
    root.appendChild(field('Serum acetaminophen (ug/mL)', 'apap-lvl', { placeholder: 'e.g. 160' }));
    const o = out(); root.appendChild(o);
    wire(['apap-h', 'apap-lvl'], () => safe(o, () => {
      const r = M5.acetaminophenNomogram({ hours: val('apap-h'), levelUgMl: val('apap-lvl') });
      o.appendChild(list([
        li(`Treatment line at this time: ${fmt(r.treatmentLine, { fallback: '--' })} ug/mL`),
        li(r.interpretation, r.aboveLine ? 'warn' : null),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'Valid only for a single acute ingestion with a known time, level drawn >=4 h. Not for staggered/chronic ingestion or unknown timing.' }));
    }));
    medNotice(root);
  },

  // ----- 2.5 digoxin -----------------------------------------------------
  digoxin(root) {
    root.appendChild(field('Creatinine clearance (mL/min)', 'dig-crcl', { placeholder: 'e.g. 60' }));
    root.appendChild(field('Age (years, optional)', 'dig-age', { placeholder: 'e.g. 75' }));
    root.appendChild(selectField('Indication', 'dig-ind', [
      { value: 'hf', text: 'Heart failure (target 0.5-0.9 ng/mL)' },
      { value: 'af', text: 'AF rate control (0.8-2.0 ng/mL)' },
    ]));
    root.appendChild(field('Measured level (ng/mL, optional)', 'dig-lvl', { placeholder: 'optional' }));
    root.appendChild(field('Hours post-dose (optional)', 'dig-hrs', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['dig-crcl', 'dig-age', 'dig-ind', 'dig-lvl', 'dig-hrs'], () => safe(o, () => {
      const r = M5.digoxin({ crCl: val('dig-crcl'), ageYears: optNum('dig-age'), indication: str('dig-ind'), levelNgMl: optNum('dig-lvl'), hoursPostDose: optNum('dig-hrs') });
      o.appendChild(list([
        li(r.doseGuidance),
        r.levelInterp ? li(r.levelInterp, /toxic|above/.test(r.levelInterp) ? 'warn' : null) : null,
        r.timingWarn ? li('Level drawn <6 h post-dose: distribution incomplete, the level overestimates the true steady-state concentration.', 'warn') : null,
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.6 local-anesthetic-max ----------------------------------------
  'local-anesthetic-max'(root) {
    root.appendChild(selectField('Agent', 'la-agent', [
      { value: 'lidocaine', text: 'Lidocaine plain (4.5 mg/kg)' },
      { value: 'lidocaine-epi', text: 'Lidocaine + epinephrine (7 mg/kg)' },
      { value: 'bupivacaine', text: 'Bupivacaine plain (2.5 mg/kg)' },
      { value: 'bupivacaine-epi', text: 'Bupivacaine + epinephrine (3 mg/kg)' },
      { value: 'ropivacaine', text: 'Ropivacaine (3 mg/kg)' },
    ]));
    root.appendChild(field('Weight (kg)', 'la-wt', { placeholder: 'e.g. 70' }));
    root.appendChild(field('Solution concentration (%)', 'la-conc', { placeholder: 'e.g. 1' }));
    const o = out(); root.appendChild(o);
    wire(['la-agent', 'la-wt', 'la-conc'], () => safe(o, () => {
      const r = M5.localAnestheticMax({ agent: str('la-agent'), weightKg: val('la-wt'), concPct: val('la-conc') });
      o.appendChild(list([
        li(`${r.label}: maximum total dose ${fmt(r.maxDoseMg, { fallback: '(enter weight)' })} mg`),
        li(`At ${fmt(r.mgPerMl, { fallback: '--' })} mg/mL: maximum volume ${fmt(r.maxVolMl, { fallback: '--' })} mL`),
        r.capBinds ? li('Absolute maximum dose binds before the weight-based dose.', 'warn') : null,
        r.weightCapped ? li('Weight exceeds 100 kg: dose computed on a 100 kg cap to avoid over-dosing.', 'warn') : null,
        li('Recognize LAST early: CNS (perioral numbness, seizures) then cardiovascular collapse; have lipid emulsion available.', 'warn'),
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.7 mgso4-preeclampsia ------------------------------------------
  'mgso4-preeclampsia'(root) {
    root.appendChild(selectField('Loading dose', 'mg-load', [
      { value: '4', text: '4 g' }, { value: '6', text: '6 g' },
    ]));
    root.appendChild(selectField('Maintenance rate', 'mg-maint', [
      { value: '2', text: '2 g/h' }, { value: '1', text: '1 g/h' },
    ]));
    root.appendChild(field('Bag concentration (g/mL)', 'mg-conc', { placeholder: 'e.g. 0.04 (40 g/L)' }));
    root.appendChild(checkboxField('Renal impairment', 'mg-renal'));
    const o = out(); root.appendChild(o);
    wire(['mg-load', 'mg-maint', 'mg-conc', 'mg-renal'], () => safe(o, () => {
      const r = M5.mgso4Preeclampsia({ loadG: val('mg-load'), maintGPerH: val('mg-maint'), concGPerMl: val('mg-conc'), renalImpairment: checked('mg-renal') });
      o.appendChild(list([
        li(`Loading: ${r.loadG} g = ${fmt(r.loadVolMl, { fallback: '(enter concentration)' })} mL over 20-30 min`),
        li(`Maintenance: ${fmt(r.maintGPerH, { fallback: '--' })} g/h = ${fmt(r.maintRateMlH, { fallback: '--' })} mL/h`),
        r.renalImpairment ? li('Renal impairment: maintenance default halved. Monitor levels and reflexes closely.', 'warn') : null,
        li('Monitor DTRs, respiratory rate, and urine output for magnesium toxicity. Antidote: calcium gluconate.', 'warn'),
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.8 pca-pump ----------------------------------------------------
  'pca-pump'(root) {
    root.appendChild(field('Concentration (mg/mL)', 'pca-conc', { placeholder: 'e.g. 1' }));
    root.appendChild(field('Demand (bolus) dose (mg)', 'pca-demand', { placeholder: 'e.g. 1' }));
    root.appendChild(field('Lockout interval (min)', 'pca-lockout', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Continuous (basal) rate (mg/h, optional)', 'pca-basal', { placeholder: 'optional' }));
    root.appendChild(field('1-hour limit (mg, optional)', 'pca-limit', { placeholder: 'optional' }));
    const o = out(); root.appendChild(o);
    wire(['pca-conc', 'pca-demand', 'pca-lockout', 'pca-basal', 'pca-limit'], () => safe(o, () => {
      const basal = optNum('pca-basal');
      const r = M5.pcaPump({
        concMgPerMl: val('pca-conc'), demandMg: val('pca-demand'), lockoutMin: val('pca-lockout'),
        basalMgPerH: basal == null ? 0 : basal, oneHourLimitMg: optNum('pca-limit'),
      });
      o.appendChild(list([
        li(`Maximum demand doses per hour: ${fmt(r.dosesPerHour, { fallback: '--' })}`),
        li(`Maximum demand delivery: ${fmt(r.maxDemandMg, { fallback: '--' })} mg/h`),
        li(`Maximum hourly delivered (demand + basal): ${fmt(r.maxHourlyMg, { fallback: '(enter settings)' })} mg`),
        li(`Demand volume per dose: ${fmt(r.demandVolMl, { fallback: '--' })} mL`),
        r.limitNote ? li(r.limitNote, /never binds/.test(r.limitNote) ? 'warn' : null) : null,
        li('PCA is patient-controlled only: no PCA-by-proxy (family/staff button-pressing).', 'warn'),
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.9 sugammadex --------------------------------------------------
  sugammadex(root) {
    root.appendChild(field('Actual body weight (kg)', 'sug-wt', { placeholder: 'e.g. 70' }));
    root.appendChild(selectField('Depth of block', 'sug-depth', [
      { value: 't2', text: 'Reappearance of T2 (2 mg/kg)' },
      { value: 'ptc', text: '1-2 post-tetanic counts (4 mg/kg)' },
      { value: 'immediate', text: 'Immediate reversal (16 mg/kg)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['sug-wt', 'sug-depth'], () => safe(o, () => {
      const r = M5.sugammadex({ weightKg: val('sug-wt'), depth: str('sug-depth') });
      o.appendChild(list([
        li(`Dose: ${fmt(r.doseMg, { fallback: '(enter weight)' })} mg (${r.mgkg} mg/kg)`),
        li(`Volume at 100 mg/mL: ${fmt(r.volMl, { fallback: '--' })} mL`),
        li('Uses actual body weight per label. Re-curarization possible; hormonal contraception is impaired for 7 days.', 'warn'),
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.10 ketamine-propofol ------------------------------------------
  'ketamine-propofol'(root) {
    root.appendChild(selectField('Agent', 'kp-agent', [
      { value: 'ketamine', text: 'Ketamine (1-2 mg/kg, 50 mg/mL)' },
      { value: 'propofol', text: 'Propofol (0.5-1 mg/kg, 10 mg/mL)' },
      { value: 'ketofol', text: 'Ketofol 1:1 (5 mg/mL each)' },
    ]));
    root.appendChild(field('Weight (kg)', 'kp-wt', { placeholder: 'e.g. 70' }));
    root.appendChild(field('Selected dose (mg/kg)', 'kp-mgkg', { placeholder: 'e.g. 1' }));
    const o = out(); root.appendChild(o);
    wire(['kp-agent', 'kp-wt', 'kp-mgkg'], () => safe(o, () => {
      const r = M5.ketaminePropofol({ agent: str('kp-agent'), weightKg: val('kp-wt'), mgkg: val('kp-mgkg') });
      o.appendChild(list([
        li(`${r.label}: initial dose ${fmt(r.doseMg, { fallback: '(enter weight)' })} mg = ${fmt(r.volMl, { fallback: '--' })} mL`),
        li(`Typical re-dose increment: ${fmt(r.redoseMg, { fallback: '--' })} mg`),
        li('Monitored setting only: airway-ready, continuous SpO2/capnography, rescue available.', 'warn'),
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.11 peds-fluid-deficit -----------------------------------------
  'peds-fluid-deficit'(root) {
    root.appendChild(field('Weight (kg)', 'pfd-wt', { placeholder: 'e.g. 12' }));
    root.appendChild(field('Estimated dehydration (%)', 'pfd-pct', { placeholder: 'e.g. 10' }));
    const o = out(); root.appendChild(o);
    wire(['pfd-wt', 'pfd-pct'], () => safe(o, () => {
      const r = M5.pedsFluidDeficit({ weightKg: val('pfd-wt'), dehydrationPct: val('pfd-pct') });
      o.appendChild(list([
        li(`Maintenance rate (4-2-1): ${fmt(r.maintPerH, { fallback: '(enter weight)' })} mL/h`),
        li(`Total fluid deficit: ${fmt(r.deficitMl, { fallback: '--' })} mL`),
        li(`First 8 h: ${fmt(r.first8hRateMlH, { fallback: '--' })} mL/h (maintenance + 1/2 deficit)`),
        li(`Next 16 h: ${fmt(r.next16hRateMlH, { fallback: '--' })} mL/h (maintenance + 1/2 deficit)`),
      ]));
      o.appendChild(el('p', { class: 'muted', text: 'Subtract resuscitation boluses already given; replace ongoing losses separately. Reassess clinically.' }));
    }));
    medNotice(root);
  },

  // ----- 2.12 peds-resus -------------------------------------------------
  'peds-resus'(root) {
    root.appendChild(field('Weight (kg)', 'pr-wt', { placeholder: 'e.g. 15' }));
    root.appendChild(selectField('Bolus size', 'pr-ml', [
      { value: '20', text: '20 mL/kg' }, { value: '10', text: '10 mL/kg' },
    ]));
    root.appendChild(selectField('Context', 'pr-ctx', [
      { value: 'sepsis', text: 'Sepsis / hypovolemia' },
      { value: 'cardiac-dka', text: 'Cardiac / DKA (cautious)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['pr-wt', 'pr-ml', 'pr-ctx'], () => safe(o, () => {
      const r = M5.pedsResus({ weightKg: val('pr-wt'), mlPerKg: val('pr-ml'), context: str('pr-ctx') });
      o.appendChild(list([
        li(`Bolus volume: ${fmt(r.bolusMl, { fallback: '(enter weight)' })} mL per push`),
        li('Reassess perfusion (HR, cap refill, mental status, urine output) after each bolus.'),
        r.cardiacCautionFlag ? li('Cardiac/DKA context: use 10 mL/kg aliquots and reassess for fluid overload (hepatomegaly, crackles).', 'warn') : null,
        r.weightCapped ? li('Weight exceeds 50 kg: bolus computed on a 50 kg adult cap.', 'warn') : null,
      ]));
    }));
    medNotice(root);
  },

  // ----- 2.13 conc-percent -----------------------------------------------
  'conc-percent'(root) {
    root.appendChild(selectField('Enter as', 'cp-mode', [
      { value: 'ratio', text: 'Ratio 1:X' },
      { value: 'percent', text: 'Percent (% w/v)' },
      { value: 'mgml', text: 'mg/mL' },
    ]));
    root.appendChild(field('Value', 'cp-val', { placeholder: 'e.g. 1000 for 1:1000' }));
    const o = out(); root.appendChild(o);
    wire(['cp-mode', 'cp-val'], () => safe(o, () => {
      const r = M5.concPercent({ mode: str('cp-mode'), value: val('cp-val') });
      o.appendChild(list([
        li(`Concentration: ${fmt(r.mgPerMl, { fallback: '(enter value)' })} mg/mL`),
        li(`Percent: ${fmt(r.percent, { fallback: '--' })}% w/v`),
        li(`Ratio: 1:${fmt(r.ratio, { fallback: '--' })}`),
      ]));
      o.appendChild(el('p', { class: 'muted', text: '1% w/v = 10 mg/mL; 1:1000 = 1 mg/mL; 1:10,000 = 0.1 mg/mL.' }));
    }));
    medNotice(root);
  },
};
