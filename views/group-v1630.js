// spec-v1630: sterile compounding, IV admixture and drug storage. Group Q.
// reconstitution-concentration, admixture-concentration, lipid-emulsion-dose-check, pn-aluminum-load,
// pn-calcium-phosphate-check, pn-order-summary, pn-amino-acid-order, premixed-pn-rate-check,
// pn-micronutrient-volume, iv-phosphate-order-check,
// mean-kinetic-temperature,
// in-use-discard-time, storage-excursion-summary, cleanroom-class-check and room-air-changes.

import { el, clear } from '../lib/dom.js';
import * as RC from '../lib/reconstitution-concentration-v1630.js';
import * as AC from '../lib/admixture-concentration-v1630.js';
import * as IP from '../lib/iv-phosphate-order-check-v1630.js';
import * as LE from '../lib/lipid-emulsion-dose-check-v1630.js';
import * as PA from '../lib/pn-aluminum-load-v1630.js';
import * as CP from '../lib/pn-calcium-phosphate-check-v1630.js';
import * as IU from '../lib/in-use-discard-time-v1630.js';
import * as AA from '../lib/pn-amino-acid-order-v1630.js';
import * as PR from '../lib/premixed-pn-rate-check-v1630.js';
import * as MV from '../lib/pn-micronutrient-volume-v1630.js';
import * as PS from '../lib/pn-order-summary-v1630.js';
import * as MK from '../lib/mean-kinetic-temperature-v1630.js';
import * as SE from '../lib/storage-excursion-summary-v1630.js';
import * as CR from '../lib/cleanroom-class-check-v1630.js';
import * as RA from '../lib/room-air-changes-v1630.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
// A temperature can be below zero: no minimum, and a keypad that has a minus sign.
function signedField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'text' }));
  root.appendChild(wrap);
  return wrap;
}
function plainField(root, label, id, type, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type, autocomplete: 'off', placeholder: placeholder || '' }));
  root.appendChild(wrap);
  return wrap;
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
// One renderer shape for every tool here: read each field, hand the lot to the library, show the result.
function run(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'reconstitution-concentration'(root) {
    selectField(root, 'Unit of the drug amount (used for the strengths and the dose too)', 'rc-unit', RC.UNITS);
    numField(root, 'Drug amount in the container', 'rc-amount', '');
    numField(root, 'Diluent volume the label states, mL', 'rc-diluent', '');
    numField(root, 'From the label, one of three: resulting concentration, per mL', 'rc-conc', '');
    numField(root, 'or final volume, mL', 'rc-final', '');
    numField(root, 'or powder displacement volume, mL', 'rc-disp', '');
    numField(root, 'Diluent volume you intend to use, mL (optional)', 'rc-new', '');
    numField(root, 'or concentration wanted, per mL (optional)', 'rc-want', '');
    numField(root, 'Ordered dose (optional)', 'rc-dose', '');
    run(root, [['rc-unit', 'unit'], ['rc-amount', 'amount'], ['rc-diluent', 'labelDiluent'], ['rc-conc', 'labelConcentration'], ['rc-final', 'labelFinalVolume'], ['rc-disp', 'displacement'], ['rc-new', 'newDiluent'], ['rc-want', 'wantedConcentration'], ['rc-dose', 'dose']], RC.reconstitutionConcentration);
  },

  'admixture-concentration'(root) {
    selectField(root, 'Unit of the additive amount', 'ac-unit', AC.UNITS);
    selectField(root, 'State the strength', 'ac-per', AC.PER);
    numField(root, 'Nominal bag volume, mL', 'ac-nominal', '');
    numField(root, 'Overfill, mL, from the manufacturer (leave blank if not known)', 'ac-overfill', '');
    numField(root, 'Volume withdrawn before adding, mL (optional)', 'ac-withdrawn', '');
    textareaField(root, 'Additions of the drug, one per line: amount, then its volume in mL', 'ac-adds', '');
    numField(root, 'Other volume added that holds none of the drug, mL (optional)', 'ac-other', '');
    numField(root, 'Strength already in the bag fluid (optional)', 'ac-base', '');
    numField(root, 'Target strength (optional)', 'ac-target', '');
    run(root, [['ac-unit', 'unit'], ['ac-per', 'per'], ['ac-nominal', 'nominalVolume'], ['ac-overfill', 'overfill'], ['ac-withdrawn', 'withdrawn'], ['ac-adds', 'additives'], ['ac-other', 'otherVolume'], ['ac-base', 'baseline'], ['ac-target', 'target']], AC.admixtureConcentration);
  },

  'iv-phosphate-order-check'(root) {
    const pairs = [['ip-salt', 'salt'], ['ip-age', 'ageBand'], ['ip-weight', 'weight'], ['ip-wunit', 'weightUnit'], ['ip-dose', 'dose'], ['ip-dunit', 'doseUnit'], ['ip-vol', 'finalVolume'], ['ip-hours', 'hours'], ['ip-line', 'line'], ['ip-phos', 'serumPhosphorus'], ['ip-k', 'serumPotassium']];
    selectField(root, 'Salt', 'ip-salt', IP.SALT_OPTIONS);
    selectField(root, 'Age band', 'ip-age', IP.AGE_BANDS);
    numField(root, 'Actual body weight', 'ip-weight', '');
    selectField(root, 'Weight unit', 'ip-wunit', IP.WEIGHT_UNITS);
    numField(root, 'Phosphorus ordered', 'ip-dose', '');
    selectField(root, 'Ordered as', 'ip-dunit', IP.DOSE_UNITS);
    numField(root, 'Final volume, mL', 'ip-vol', '');
    numField(root, 'Infusion time, hours', 'ip-hours', '');
    selectField(root, 'Line', 'ip-line', IP.LINES);
    numField(root, 'Serum phosphorus, mg/dL (optional)', 'ip-phos', '');
    numField(root, 'Serum potassium, mEq/L (optional)', 'ip-k', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = IP.ivPhosphateOrderCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'lipid-emulsion-dose-check'(root) {
    const pairs = [['le-product', 'product'], ['le-age', 'ageBand'], ['le-weight', 'weight'], ['le-wunit', 'weightUnit'], ['le-order', 'order'], ['le-ounit', 'orderUnit'], ['le-hours', 'hours'], ['le-route', 'route'], ['le-kcal', 'totalKcal'], ['le-own', 'ownMax']];
    selectField(root, 'Product', 'le-product', LE.PRODUCT_OPTIONS);
    selectField(root, 'Age band', 'le-age', LE.AGE_BANDS);
    numField(root, 'Patient weight', 'le-weight', '');
    selectField(root, 'Weight unit', 'le-wunit', LE.WEIGHT_UNITS);
    numField(root, 'Ordered lipid', 'le-order', '');
    selectField(root, 'Ordered as', 'le-ounit', LE.ORDER_UNITS);
    numField(root, 'Infusion duration, hours', 'le-hours', '');
    selectField(root, 'How it runs', 'le-route', LE.ROUTES);
    numField(root, 'Total daily energy, kcal (optional)', 'le-kcal', '');
    const own = numField(root, 'Maximum g/kg/day from the label in hand', 'le-own', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LE.lipidEmulsionDoseCheck(args, new Date());
      // The label's own figure is asked for only when the tool's copy is withheld.
      own.hidden = !(r.withheld || val('le-own') !== '');
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'pn-aluminum-load'(root) {
    numField(root, 'Patient weight', 'pal-weight', '');
    selectField(root, 'Weight unit', 'pal-wunit', PA.WEIGHT_UNITS);
    textareaField(root, 'Components of the daily bag, one per line: name, volume in mL, and the aluminum figure on its container label in mcg/L', 'pal-parts', '');
    run(root, [['pal-weight', 'weight'], ['pal-wunit', 'weightUnit'], ['pal-parts', 'components']], PA.pnAluminumLoad);
  },

  'pn-calcium-phosphate-check'(root) {
    const pairs = [['cp-vol', 'finalVolume'], ['cp-caunit', 'calciumUnit'], ['cp-ca', 'calcium'], ['cp-punit', 'phosphateUnit'], ['cp-p', 'phosphate'], ['cp-aa', 'aminoAcidGrams'], ['cp-low', 'lowestVolume'], ['cp-kind', 'limitKind'], ['cp-limit', 'limit'], ['cp-caown', 'calciumPerMl'], ['cp-pown', 'phosphatePerMl']];
    numField(root, 'Final volume, mL', 'cp-vol', '');
    selectField(root, 'Calcium entered as', 'cp-caunit', CP.CALCIUM_UNITS);
    numField(root, 'Calcium amount', 'cp-ca', '');
    const caOwn = numField(root, 'Calcium, mEq per mL, from the vial in hand', 'cp-caown', '');
    selectField(root, 'Phosphate entered as', 'cp-punit', CP.PHOSPHATE_UNITS);
    numField(root, 'Phosphate amount', 'cp-p', '');
    const pOwn = numField(root, 'Phosphate, mmol per mL, from the vial in hand', 'cp-pown', '');
    numField(root, 'Amino acids, g (optional)', 'cp-aa', '');
    numField(root, 'Volume at the point of lowest dilution, mL (optional)', 'cp-low', '');
    selectField(root, 'Your limit is (optional)', 'cp-kind', CP.LIMIT_KINDS);
    numField(root, 'Your limit, from your own curve or compounder software', 'cp-limit', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CP.pnCalciumPhosphateCheck(args, new Date());
      // The vial's own figure is asked for only when the label figure is withheld.
      caOwn.hidden = !(r.withheld === 'calcium' || val('cp-caown') !== '');
      pOwn.hidden = !(r.withheld === 'phosphate' || val('cp-pown') !== '');
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'pn-amino-acid-order'(root) {
    const pairs = [['aa-product', 'product'], ['aa-age', 'ageBand'], ['aa-weight', 'weight'], ['aa-wunit', 'weightUnit'], ['aa-order', 'order'], ['aa-ounit', 'orderUnit'], ['aa-cys', 'cysteine']];
    selectField(root, 'Product', 'aa-product', AA.PRODUCT_OPTIONS);
    selectField(root, 'Age band', 'aa-age', AA.AGE_BANDS);
    numField(root, 'Patient weight', 'aa-weight', '');
    selectField(root, 'Weight unit', 'aa-wunit', AA.WEIGHT_UNITS);
    numField(root, 'Amino acids ordered', 'aa-order', '');
    selectField(root, 'Ordered as', 'aa-ounit', AA.ORDER_UNITS);
    selectField(root, 'Cysteine', 'aa-cys', AA.CYSTEINE);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AA.pnAminoAcidOrder(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'premixed-pn-rate-check'(root) {
    const pairs = [['pr-form', 'formulation'], ['pr-weight', 'weight'], ['pr-wunit', 'weightUnit'], ['pr-rate', 'rate'], ['pr-vol', 'volume'], ['pr-hours', 'hours']];
    selectField(root, 'Formulation (amino acid percent / dextrose percent)', 'pr-form', PR.FORMULATION_OPTIONS);
    numField(root, 'Patient weight (adult)', 'pr-weight', '');
    selectField(root, 'Weight unit', 'pr-wunit', PR.WEIGHT_UNITS);
    numField(root, 'Rate, mL/hour', 'pr-rate', '');
    numField(root, 'or volume per day, mL', 'pr-vol', '');
    numField(root, 'and the hours it runs over', 'pr-hours', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PR.premixedPnRateCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'pn-micronutrient-volume'(root) {
    selectField(root, 'Product', 'mv-product', MV.PRODUCT_OPTIONS);
    numField(root, 'Patient weight', 'mv-weight', '');
    selectField(root, 'Weight unit', 'mv-wunit', MV.WEIGHT_UNITS);
    const o = out(); root.appendChild(o);
    wire(['mv-product', 'mv-weight', 'mv-wunit'], () => safe(o, () => {
      const r = MV.pnMicronutrientVolume({ product: val('mv-product'), weight: val('mv-weight'), weightUnit: val('mv-wunit') }, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'pn-order-summary'(root) {
    const pairs = [['ps-weight', 'weight'], ['ps-wunit', 'weightUnit'], ['ps-dex', 'dextroseGrams'], ['ps-aa', 'aminoAcidGrams'], ['ps-n', 'nitrogenGrams'], ['ps-lipid', 'lipidProduct'], ['ps-lipidg', 'lipidGrams'], ['ps-hours', 'hours'], ['ps-vol', 'volume']];
    numField(root, 'Patient weight', 'ps-weight', '');
    selectField(root, 'Weight unit', 'ps-wunit', PS.WEIGHT_UNITS);
    numField(root, 'Dextrose (hydrous), g per day', 'ps-dex', '');
    numField(root, 'Amino acids, g per day', 'ps-aa', '');
    numField(root, 'Nitrogen, g per day, from the amino acid label (optional)', 'ps-n', '');
    selectField(root, 'Lipid product (optional)', 'ps-lipid', PS.LIPID_OPTIONS);
    numField(root, 'Lipid, g per day (optional)', 'ps-lipidg', '');
    numField(root, 'Infusion hours per day', 'ps-hours', '');
    numField(root, 'Total volume, mL per day', 'ps-vol', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PS.pnOrderSummary(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'in-use-discard-time'(root) {
    selectField(root, 'Container', 'iu-kind', IU.CONTAINERS);
    const timed = [
      plainField(root, 'Opened or first punctured, date and time', 'iu-opened', 'datetime-local'),
      plainField(root, 'Manufacturer\'s expiration date (YYYY-MM-DD, or YYYY-MM for a month and year)', 'iu-exp', 'text'),
      numField(root, 'In-use limit from the label (blank uses 28 days for a multi-dose vial)', 'iu-limit', ''),
      selectField(root, 'The limit is in', 'iu-unit', IU.LIMIT_UNITS),
    ];
    const o = out(); root.appendChild(o);
    wire(['iu-kind', 'iu-opened', 'iu-exp', 'iu-limit', 'iu-unit'], () => safe(o, () => {
      for (const w of timed) w.hidden = val('iu-kind') === 'single-dose';
      show(IU.inUseDiscardTime({ container: val('iu-kind'), opened: val('iu-opened'), expiration: val('iu-exp'), limit: val('iu-limit'), limitUnit: val('iu-unit') }), o);
    }));
  },

  'mean-kinetic-temperature'(root) {
    selectField(root, 'Unit of the readings', 'mk-unit', MK.UNITS);
    textareaField(root, 'Readings, one per line, at equal intervals (or on every line: temperature, then its duration in hours)', 'mk-readings', '');
    // The paper's default, shown and editable; the result names the value used.
    numField(root, 'Activation energy, kJ/mol', 'mk-ea', '').querySelector('input').value = String(MK.DEFAULT_ACTIVATION_ENERGY);
    signedField(root, 'Product\'s labeled limit, in the unit of the readings (optional)', 'mk-limit');
    run(root, [['mk-unit', 'unit'], ['mk-readings', 'readings'], ['mk-ea', 'activationEnergy'], ['mk-limit', 'limit']], MK.meanKineticTemperature);
  },

  'storage-excursion-summary'(root) {
    selectField(root, 'Unit of the readings', 'se-unit', SE.UNITS);
    selectField(root, 'Storage range', 'se-range', SE.RANGE_OPTIONS);
    const custom = [signedField(root, 'Lowest temperature of the range, from the package insert', 'se-low'), signedField(root, 'Highest temperature of the range, from the package insert', 'se-high')];
    textareaField(root, 'Readings, one per line: date and time (YYYY-MM-DD HH:MM), then the temperature', 'se-readings', '');
    const o = out(); root.appendChild(o);
    wire(['se-unit', 'se-range', 'se-low', 'se-high', 'se-readings'], () => safe(o, () => {
      const own = val('se-range') === 'custom';
      for (const w of custom) w.hidden = !own;
      // A hidden field's leftover value is not part of the question.
      show(SE.storageExcursionSummary({ unit: val('se-unit'), range: val('se-range'), low: own ? val('se-low') : '', high: own ? val('se-high') : '', readings: val('se-readings') }), o);
    }));
  },

  'cleanroom-class-check'(root) {
    selectField(root, 'Particle count unit', 'cr-unit', CR.COUNT_UNITS);
    numField(root, 'Particle count at 0.5 µm and larger', 'cr-count', '');
    selectField(root, 'Intended class of the area (needed for a microbial sample)', 'cr-class', CR.INTENDED);
    numField(root, 'Active air sample, cfu/m³ (optional)', 'cr-air', '');
    numField(root, '90 mm settling plate, cfu per 4 hours (optional)', 'cr-plate', '');
    run(root, [['cr-unit', 'countUnit'], ['cr-count', 'count'], ['cr-class', 'intendedClass'], ['cr-air', 'activeAir'], ['cr-plate', 'settlingPlate']], CR.cleanroomClassCheck);
  },

  'room-air-changes'(root) {
    selectField(root, 'Airflow unit', 'ra-aunit', RA.AIRFLOW_UNITS);
    numField(root, 'Supply or exhaust airflow', 'ra-air', '');
    selectField(root, 'Room measured in', 'ra-runit', RA.ROOM_UNITS);
    numField(root, 'Room volume (or enter the three dimensions below)', 'ra-vol', '');
    numField(root, 'Room length', 'ra-len', '');
    numField(root, 'Room width', 'ra-wid', '');
    numField(root, 'Room height', 'ra-hgt', '');
    numField(root, 'Required air changes per hour, from your own standard (optional)', 'ra-req', '');
    run(root, [['ra-aunit', 'airflowUnit'], ['ra-air', 'airflow'], ['ra-runit', 'roomUnit'], ['ra-vol', 'volume'], ['ra-len', 'length'], ['ra-wid', 'width'], ['ra-hgt', 'height'], ['ra-req', 'requiredAch']], RA.roomAirChanges);
  },
};
