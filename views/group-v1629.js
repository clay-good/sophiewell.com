// spec-v1629: renderers for the pharmacy bench-math tools (Group Q): alligation, dilution-c1v1,
// serial-dilution, min-weighable-quantity, aliquot-method, specific-gravity, api-potency-adjust,
// tablet-powder-source, buffer-ph, percent-ionized and dropper-calibration.

import { el, clear } from '../lib/dom.js';
import * as AL from '../lib/alligation-v1629.js';
import * as DL from '../lib/dilution-c1v1-v1629.js';
import * as SD from '../lib/serial-dilution-v1629.js';
import * as MW from '../lib/min-weighable-quantity-v1629.js';
import * as AQ from '../lib/aliquot-method-v1629.js';
import * as SG from '../lib/specific-gravity-v1629.js';
import * as AP from '../lib/api-potency-adjust-v1629.js';
import * as TP from '../lib/tablet-powder-source-v1629.js';
import * as BP from '../lib/buffer-ph-v1629.js';
import * as PI from '../lib/percent-ionized-v1629.js';
import * as DC from '../lib/dropper-calibration-v1629.js';
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

export const renderers = {
  alligation(root) {
    const pairs = [['al-mode', 'mode'], ['al-su', 'strengthUnit'], ['al-qu', 'quantityUnit'], ['al-high', 'higher'], ['al-low', 'lower'], ['al-target', 'target'], ['al-total', 'total'], ['al-highqty', 'higherQty'], ['al-lowqty', 'lowerQty'], ['al-lots', 'lots']];
    selectField(root, 'What to work out', 'al-mode', AL.MODES);
    selectField(root, 'Strength unit (the same for every strength)', 'al-su', AL.STRENGTH_UNITS);
    selectField(root, 'Quantity unit', 'al-qu', AL.QUANTITY_UNITS);
    const two = [
      numField(root, 'Higher strength (100% for pure drug)', 'al-high', 'e.g. 70'),
      numField(root, 'Lower strength (0 for a plain diluent)', 'al-low', 'e.g. 20'),
      numField(root, 'Target strength', 'al-target', 'e.g. 30'),
      numField(root, 'Total wanted (enter this, or one amount on hand below)', 'al-total', 'e.g. 500'),
      numField(root, 'Or: amount of the higher strength on hand', 'al-highqty', ''),
      numField(root, 'Or: amount of the lower strength on hand', 'al-lowqty', ''),
    ];
    const medial = [textareaField(root, 'Lots, one per line: strength, quantity', 'al-lots', '10, 100\n20, 300')];
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('al-mode');
      for (const w of two) w.hidden = mode === 'medial';
      for (const w of medial) w.hidden = mode !== 'medial';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AL.alligation(args), o);
    }));
  },

  'dilution-c1v1'(root) {
    const pairs = [['dl-c1', 'stockStrength'], ['dl-u1', 'stockUnit'], ['dl-q1', 'stockQuantity'], ['dl-c2', 'finalStrength'], ['dl-u2', 'finalUnit'], ['dl-q2', 'finalQuantity'], ['dl-sg', 'specificGravity']];
    note(root, 'Enter any three of the four values and leave the one to solve for blank.');
    numField(root, 'Stock strength', 'dl-c1', 'e.g. 1000');
    selectField(root, 'Stock strength unit', 'dl-u1', DL.UNITS);
    numField(root, 'Stock quantity (mL, or g for % w/w)', 'dl-q1', '');
    numField(root, 'Final strength', 'dl-c2', 'e.g. 10000');
    selectField(root, 'Final strength unit', 'dl-u2', DL.UNITS);
    numField(root, 'Final quantity (mL, or g for % w/w)', 'dl-q2', 'e.g. 100');
    numField(root, 'Specific gravity of the stock (only for a % w/w stock made into a weight-in-volume product)', 'dl-sg', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DL.dilutionC1V1(args), o);
    }));
  },

  'serial-dilution'(root) {
    const pairs = [['sd-unit', 'unit'], ['sd-stock', 'stock'], ['sd-target', 'target'], ['sd-vol', 'finalVolume'], ['sd-factor', 'factor'], ['sd-min', 'minVolume'], ['sd-step', 'stepVolume']];
    selectField(root, 'Strength unit (the same for the stock and the target)', 'sd-unit', SD.UNITS);
    numField(root, 'Stock strength', 'sd-stock', 'e.g. 100');
    numField(root, 'Target strength', 'sd-target', 'e.g. 0.03');
    numField(root, 'Volume wanted at the last step (mL)', 'sd-vol', 'e.g. 10');
    numField(root, 'Dilution factor per step (enter this, or the smallest volume below)', 'sd-factor', 'e.g. 10');
    numField(root, 'Or: smallest volume you can measure (mL)', 'sd-min', '');
    numField(root, 'Volume of each earlier step, mL (optional; blank uses the last step\'s volume)', 'sd-step', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SD.serialDilution(args), o);
    }));
  },

  'min-weighable-quantity'(root) {
    const pairs = [['mw-mode', 'mode'], ['mw-unit', 'unit'], ['mw-sens', 'sensitivity'], ['mw-limit', 'errorLimit'], ['mw-qty', 'quantity'], ['mw-wanted', 'wanted'], ['mw-got', 'obtained']];
    selectField(root, 'What to work out', 'mw-mode', MW.MODES);
    selectField(root, 'Unit the device measures in', 'mw-unit', MW.UNITS);
    const sens = numField(root, 'Sensitivity of the device, from its certificate or calibration', 'mw-sens', '');
    numField(root, 'Largest error accepted, percent (from the standard you work to)', 'mw-limit', '');
    const qty = numField(root, 'Quantity to be measured', 'mw-qty', '');
    const wanted = numField(root, 'Quantity wanted', 'mw-wanted', '');
    const got = numField(root, 'Quantity actually obtained', 'mw-got', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('mw-mode');
      sens.hidden = mode === 'error';
      qty.hidden = mode !== 'potential';
      wanted.hidden = mode !== 'error';
      got.hidden = mode !== 'error';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MW.minWeighableQuantity(args), o);
    }));
  },

  'aliquot-method'(root) {
    const pairs = [['aq-form', 'form'], ['aq-needed', 'needed'], ['aq-min', 'minimum'], ['aq-aliquot', 'aliquot'], ['aq-vol', 'volume'], ['aq-minvol', 'minVolume']];
    selectField(root, 'Method', 'aq-form', AQ.FORMS);
    numField(root, 'Drug needed (mg)', 'aq-needed', '');
    numField(root, 'Minimum weighable quantity of your balance (mg)', 'aq-min', '');
    const aliquot = numField(root, 'Aliquot weight, mg (optional; blank uses the smallest that works)', 'aq-aliquot', '');
    const vol = numField(root, 'Volume the drug is dissolved to (mL)', 'aq-vol', '');
    const minVol = numField(root, 'Smallest volume you can measure (mL)', 'aq-minvol', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const form = val('aq-form');
      aliquot.hidden = form === 'liquid';
      vol.hidden = form !== 'liquid';
      minVol.hidden = form !== 'liquid';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AQ.aliquotMethod(args), o);
    }));
  },

  'specific-gravity'(root) {
    const pairs = [['sg-mode', 'mode'], ['sg-sg', 'specificGravity'], ['sg-vol', 'volume'], ['sg-wt', 'weight'], ['sg-ww', 'percentWw'], ['sg-empty', 'empty'], ['sg-filled', 'filled'], ['sg-water', 'water']];
    selectField(root, 'What to work out', 'sg-mode', SG.MODES);
    const sg = numField(root, 'Specific gravity (or density in g/mL)', 'sg-sg', '');
    const vol = numField(root, 'Volume (mL)', 'sg-vol', '');
    const wt = numField(root, 'Weight (g)', 'sg-wt', '');
    const ww = numField(root, 'Strength, % w/w', 'sg-ww', '');
    const three = [
      numField(root, 'Empty container (g)', 'sg-empty', ''),
      numField(root, 'Container filled with the liquid (g)', 'sg-filled', ''),
      numField(root, 'Container filled with water (g)', 'sg-water', ''),
    ];
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('sg-mode');
      sg.hidden = mode === 'measure';
      vol.hidden = mode !== 'weight';
      wt.hidden = mode !== 'volume';
      ww.hidden = mode !== 'strength';
      for (const w of three) w.hidden = mode !== 'measure';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SG.specificGravity(args), o);
    }));
  },

  'api-potency-adjust'(root) {
    const pairs = [['ap-target', 'target'], ['ap-unit', 'unit'], ['ap-assay', 'assay'], ['ap-basis', 'basis'], ['ap-water', 'water'], ['ap-salt', 'saltFactor']];
    numField(root, 'Target amount of pure active', 'ap-target', '');
    selectField(root, 'Unit of the target', 'ap-unit', AP.UNITS);
    numField(root, 'Assay of this lot, percent (from its certificate of analysis)', 'ap-assay', '');
    selectField(root, 'Basis the assay is stated on', 'ap-basis', AP.BASES);
    numField(root, 'Water content or loss on drying, percent (needed for an anhydrous or dried assay)', 'ap-water', '');
    numField(root, 'Salt factor (optional: weight of salt per weight of base)', 'ap-salt', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AP.apiPotencyAdjust(args), o);
    }));
  },

  'tablet-powder-source'(root) {
    const pairs = [['tp-needed', 'needed'], ['tp-strength', 'strength'], ['tp-count', 'count'], ['tp-total', 'totalWeight'], ['tp-extra', 'extra']];
    numField(root, 'Drug needed (mg)', 'tp-needed', 'e.g. 150');
    numField(root, 'Labeled strength per tablet (mg)', 'tp-strength', 'e.g. 40');
    numField(root, 'Number of whole tablets weighed', 'tp-count', 'e.g. 10');
    numField(root, 'Total weight of those tablets (mg)', 'tp-total', 'e.g. 2500');
    numField(root, 'Extra tablets to crush (optional)', 'tp-extra', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(TP.tabletPowderSource(args), o);
    }));
  },

  'buffer-ph'(root) {
    const pairs = [['bp-pair', 'pair'], ['bp-mode', 'mode'], ['bp-pka', 'pKa'], ['bp-acceptor', 'acceptor'], ['bp-donor', 'donor'], ['bp-target', 'targetPh'], ['bp-total', 'total'], ['bp-vol', 'volumeMl'], ['bp-mwa', 'acceptorMw'], ['bp-mwd', 'donorMw']];
    selectField(root, 'Buffer pair', 'bp-pair', BP.PAIRS);
    selectField(root, 'What to work out', 'bp-mode', BP.BUFFER_MODES);
    numField(root, 'pKa at your working temperature (for a weak base, the pKa of its conjugate acid)', 'bp-pka', '').querySelector('input').removeAttribute('min');
    const conc = [
      numField(root, 'Concentration of the salt (acid pair) or of the base (base pair), mol/L', 'bp-acceptor', ''),
      numField(root, 'Concentration of the acid (acid pair) or of the salt (base pair), mol/L', 'bp-donor', ''),
    ];
    const compose = [
      numField(root, 'Target pH', 'bp-target', ''),
      numField(root, 'Total buffer concentration, mol/L', 'bp-total', ''),
      numField(root, 'Volume, mL (optional, for grams)', 'bp-vol', ''),
      numField(root, 'Molecular weight of the salt (acid pair) or of the base (base pair), g/mol (optional)', 'bp-mwa', ''),
      numField(root, 'Molecular weight of the acid (acid pair) or of the salt (base pair), g/mol (optional)', 'bp-mwd', ''),
    ];
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('bp-mode');
      for (const w of conc) w.hidden = mode === 'compose';
      for (const w of compose) w.hidden = mode !== 'compose';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(BP.bufferPh(args), o);
    }));
  },

  'percent-ionized'(root) {
    const pairs = [['pi-type', 'type'], ['pi-pka', 'pKa'], ['pi-ph', 'pH']];
    selectField(root, 'The drug is a', 'pi-type', PI.DRUG_TYPES);
    numField(root, 'pKa (for a weak base, the pKa of its conjugate acid)', 'pi-pka', '').querySelector('input').removeAttribute('min');
    numField(root, 'pH', 'pi-ph', 'e.g. 7.4');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PI.percentIonized(args), o);
    }));
  },

  'dropper-calibration'(root) {
    const pairs = [['dc-drops', 'drops'], ['dc-vol', 'volume'], ['dc-dose', 'dose'], ['dc-unit', 'doseUnit'], ['dc-conc', 'concentration']];
    note(root, 'Count the drops your own dropper makes with the liquid you will use, into a measured volume.');
    numField(root, 'Drops counted', 'dc-drops', '');
    numField(root, 'Volume those drops made (mL)', 'dc-vol', '');
    numField(root, 'Dose (optional)', 'dc-dose', '');
    selectField(root, 'Dose unit', 'dc-unit', DC.DOSE_UNITS);
    const conc = numField(root, 'Concentration (mg/mL)', 'dc-conc', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      conc.hidden = val('dc-unit') !== 'mg';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DC.dropperCalibration(args), o);
    }));
  },
};
