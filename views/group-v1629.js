// spec-v1629: renderers for the pharmacy bench-math tools (Group Q): alligation, dilution-c1v1,
// serial-dilution, min-weighable-quantity, aliquot-method, specific-gravity, api-potency-adjust,
// tablet-powder-source, buffer-ph, percent-ionized, dropper-calibration, suppository-displacement,
// capsule-fill, formula-scale, molecular-weight, salt-base-factor, meq-mmol-mg, ethanol-proof and
// apothecary-household-measures.

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
import * as SP from '../lib/suppository-displacement-v1629.js';
import * as CF from '../lib/capsule-fill-v1629.js';
import * as FS from '../lib/formula-scale-v1629.js';
import * as MWT from '../lib/molecular-weight-v1629.js';
import * as SB from '../lib/salt-base-factor-v1629.js';
import * as MQ from '../lib/meq-mmol-mg-v1629.js';
import * as EP from '../lib/ethanol-proof-v1629.js';
import * as AH from '../lib/apothecary-household-measures-v1629.js';
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
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder }));
  root.appendChild(wrap);
  return wrap;
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

  'suppository-displacement'(root) {
    const pairs = [['sp-mode', 'mode'], ['sp-def', 'definition'], ['sp-units', 'units'], ['sp-extra', 'overage'], ['sp-blank', 'blankWeight'], ['sp-drug', 'drugPerUnit'], ['sp-factor', 'factor'], ['sp-med', 'medicatedWeight']];
    selectField(root, 'What to work out', 'sp-mode', SP.MODES);
    const batch = [
      selectField(root, 'Which definition your factor uses', 'sp-def', SP.DEFINITIONS),
      numField(root, 'Number of units', 'sp-units', ''),
      numField(root, 'Extra units to allow for loss (optional)', 'sp-extra', ''),
    ];
    numField(root, 'One unit of plain base from your mold (g)', 'sp-blank', '');
    numField(root, 'Drug per unit (g)', 'sp-drug', '');
    batch.push(numField(root, 'The drug factor, from your reference or from calibration', 'sp-factor', ''));
    const med = numField(root, 'One medicated unit from your mold (g)', 'sp-med', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('sp-mode');
      for (const w of batch) w.hidden = mode === 'calibrate';
      med.hidden = mode !== 'calibrate';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SP.suppositoryDisplacement(args), o);
    }));
  },

  'capsule-fill'(root) {
    const pairs = [['cf-method', 'method'], ['cf-count', 'capsules'], ['cf-extra', 'overage'], ['cf-active', 'activeMg'], ['cf-afill', 'activeFillMg'], ['cf-dfill', 'diluentFillMg'], ['cf-vol', 'capsuleVolumeMl'], ['cf-adens', 'activeDensity'], ['cf-ddens', 'diluentDensity']];
    selectField(root, 'Method', 'cf-method', CF.METHODS);
    numField(root, 'Number of capsules', 'cf-count', '');
    numField(root, 'Extra capsules to allow for loss (optional)', 'cf-extra', '');
    numField(root, 'Active per capsule (mg)', 'cf-active', '');
    const weights = [
      numField(root, 'Active alone that fills one capsule, as you measured it (mg)', 'cf-afill', ''),
      numField(root, 'Diluent alone that fills one capsule, as you measured it (mg)', 'cf-dfill', ''),
    ];
    const densities = [
      numField(root, 'Capsule body volume, from the capsule maker\'s sheet (mL)', 'cf-vol', ''),
      numField(root, 'Tapped density of the active (g/mL)', 'cf-adens', ''),
      numField(root, 'Tapped density of the diluent (g/mL)', 'cf-ddens', ''),
    ];
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const method = val('cf-method');
      for (const w of weights) w.hidden = method === 'densities';
      for (const w of densities) w.hidden = method !== 'densities';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CF.capsuleFill(args), o);
    }));
  },

  'formula-scale'(root) {
    const pairs = [['fs-formula', 'formula'], ['fs-master', 'masterYield'], ['fs-yunit', 'yieldUnit'], ['fs-wanted', 'wantedYield'], ['fs-ing', 'ingredient'], ['fs-ingqty', 'ingredientQuantity']];
    textareaField(root, 'Master formula, one ingredient per line: name, quantity, unit (the quantity may be "qs"; the unit may be "parts")', 'fs-formula', 'Hydrocortisone, 1, g\nGlycerin, 5, g\nWhite petrolatum, qs, g');
    numField(root, 'Yield of the master formula (not needed for a formula in parts)', 'fs-master', '');
    selectField(root, 'Unit of the yield', 'fs-yunit', FS.YIELD_UNITS);
    numField(root, 'Yield wanted (enter this, or one ingredient below)', 'fs-wanted', '');
    const ing = el('p');
    ing.appendChild(el('label', { for: 'fs-ing', text: 'Or: the ingredient to scale by, as written in the formula' }));
    ing.appendChild(el('br'));
    ing.appendChild(el('input', { id: 'fs-ing', type: 'text', autocomplete: 'off' }));
    root.appendChild(ing);
    numField(root, 'Quantity of that ingredient wanted, in its own unit', 'fs-ingqty', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(FS.formulaScale(args), o);
    }));
  },

  'molecular-weight'(root) {
    textField(root, 'Chemical formula, as printed on the container, the certificate of analysis or the label', 'mwt-formula', 'e.g. CaCl2.2H2O');
    note(root, 'Type each symbol as written (Ca, not CA). Put a hydrate after a dot (CaCl2.2H2O) and a charge after a caret (SO4^2-).');
    const o = out(); root.appendChild(o);
    wire(['mwt-formula'], () => safe(o, () => show(MWT.molecularWeight({ formula: val('mwt-formula') }), o)));
  },

  'salt-base-factor'(root) {
    const pairs = [['sb-af', 'aFormula'], ['sb-amw', 'aMw'], ['sb-an', 'aMoieties'], ['sb-bf', 'bFormula'], ['sb-bmw', 'bMw'], ['sb-bn', 'bMoieties'], ['sb-qty', 'quantity'], ['sb-of', 'quantityOf']];
    note(root, 'Form A and form B are two chemical forms of one drug: a salt and its base, or a hydrate and the anhydrous form. Give each a formula or a molecular weight.');
    textField(root, 'Form A: formula', 'sb-af', 'e.g. C11H17N2NaO3');
    numField(root, 'Form A: or its molecular weight (g/mol)', 'sb-amw', '');
    numField(root, 'Form A: active moieties per formula unit (blank is 1)', 'sb-an', '');
    textField(root, 'Form B: formula', 'sb-bf', 'e.g. C11H18N2O3');
    numField(root, 'Form B: or its molecular weight (g/mol)', 'sb-bmw', '');
    numField(root, 'Form B: active moieties per formula unit (blank is 1)', 'sb-bn', '');
    numField(root, 'Quantity to convert (optional)', 'sb-qty', '');
    selectField(root, 'The quantity is a weight of', 'sb-of', SB.QUANTITY_OF);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(SB.saltBaseFactor(args), o);
    }));
  },

  'meq-mmol-mg'(root) {
    const pairs = [['mq-qty', 'quantity'], ['mq-unit', 'unit'], ['mq-formula', 'formula'], ['mq-mw', 'molecularWeight'], ['mq-val', 'valence'], ['mq-part', 'particles'], ['mq-vol', 'volumeMl']];
    numField(root, 'Quantity', 'mq-qty', '');
    selectField(root, 'Unit of the quantity', 'mq-unit', MQ.UNITS);
    textField(root, 'Formula of the form weighed (a hydrate\'s formula for a hydrate)', 'mq-formula', 'e.g. KCl');
    numField(root, 'Or: its molecular weight (g/mol)', 'mq-mw', '');
    numField(root, 'Valence: total positive charge per formula unit (blank gives millimoles only)', 'mq-val', '');
    numField(root, 'Particles on complete dissociation (blank gives no milliosmoles)', 'mq-part', '');
    numField(root, 'Volume, mL (optional, for per-liter values)', 'mq-vol', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(MQ.meqMmolMg(args), o);
    }));
  },

  'ethanol-proof'(root) {
    const pairs = [['ep-mode', 'mode'], ['ep-pct', 'percent'], ['ep-proof', 'proof'], ['ep-vol', 'volume'], ['ep-vunit', 'volumeUnit'], ['ep-pg', 'proofGallons'], ['ep-rate', 'rate'], ['ep-from', 'fromProof'], ['ep-to', 'toProof'], ['ep-gal', 'gallons'], ['ep-w1', 'waterFrom'], ['ep-w2', 'waterTo']];
    selectField(root, 'What to work out', 'ep-mode', EP.MODES);
    const pct = numField(root, 'Percent ethanol by volume (enter this, or the proof)', 'ep-pct', 'e.g. 95');
    const proof = numField(root, 'Proof', 'ep-proof', '');
    const gallons = [numField(root, 'Volume of spirits', 'ep-vol', ''), selectField(root, 'Unit of the volume', 'ep-vunit', EP.VOLUME_UNITS)];
    const tax = [numField(root, 'Proof gallons', 'ep-pg', ''), numField(root, 'Tax rate, dollars per proof gallon (the result names the rates in the statute)', 'ep-rate', '')];
    const reduce = [
      numField(root, 'Starting proof', 'ep-from', ''),
      numField(root, 'Wanted proof', 'ep-to', ''),
      numField(root, 'Wine gallons on hand', 'ep-gal', ''),
      numField(root, 'Parts water at the starting proof, from Table 6 of 27 CFR 30.66', 'ep-w1', ''),
      numField(root, 'Parts water at the wanted proof, from Table 6', 'ep-w2', ''),
    ];
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('ep-mode');
      pct.hidden = mode !== 'convert';
      proof.hidden = mode !== 'convert' && mode !== 'gallons';
      for (const w of gallons) w.hidden = mode !== 'gallons';
      for (const w of tax) w.hidden = mode !== 'tax';
      for (const w of reduce) w.hidden = mode !== 'reduce';
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(EP.ethanolProof(args), o);
    }));
  },

  'apothecary-household-measures'(root) {
    const pairs = [['ah-qty', 'quantity'], ['ah-unit', 'unit']];
    numField(root, 'Quantity', 'ah-qty', 'e.g. 5');
    selectField(root, 'Unit', 'ah-unit', AH.UNITS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AH.apothecaryHouseholdMeasures(args), o);
    }));
  },
};
