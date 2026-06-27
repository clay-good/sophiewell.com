// spec-v165 §2: renderers for the four diagnostic-radiology tiles of the
// spec-v162 Cross-Discipline Completion program — acrTirads (TI-RADS),
// adrenalCtWashout, bosniak (renal-cyst class), and ctEffectiveDose. acrTirads
// and bosniak are Clinical Scoring & Risk (Group G) deterministic input→class
// mappings; adrenalCtWashout and ctEffectiveDose are Clinical Math & Conversions
// (Group E) guarded arithmetic.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Every
// washout/dose denominator is guarded in lib/radiology-v165.js, and every
// classification combination resolves to exactly one defined category (no
// undefined/NaN). Per the spec-v50 §3 posture note each tile defers the
// management decision to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/radiology-v165.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
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
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
}
function numHU(label, id) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal' });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The classification or value is the cited source’s, computed from the radiologist’s feature read or the entered measurements; dose estimates are population coefficients, not organ dosimetry. The management decision stays with the reading radiologist and local protocol.' }));
}
function wireAll(root, run) {
  for (const n of root.querySelectorAll('input, select')) {
    n.addEventListener('input', run); n.addEventListener('change', run);
  }
  run();
}

const TIRADS_COMP_OPTS = [
  { value: 'cystic', text: 'Cystic / almost completely cystic (0)' },
  { value: 'spongiform', text: 'Spongiform (0)' },
  { value: 'mixed', text: 'Mixed cystic and solid (1)' },
  { value: 'solid', text: 'Solid / almost completely solid (2)' },
];
const TIRADS_ECHO_OPTS = [
  { value: 'anechoic', text: 'Anechoic (0)' },
  { value: 'hyper', text: 'Hyperechoic / isoechoic (1)' },
  { value: 'hypo', text: 'Hypoechoic (2)' },
  { value: 'veryhypo', text: 'Very hypoechoic (3)' },
];
const TIRADS_SHAPE_OPTS = [
  { value: 'wider', text: 'Wider-than-tall (0)' },
  { value: 'taller', text: 'Taller-than-wide (3)' },
];
const TIRADS_MARGIN_OPTS = [
  { value: 'smooth', text: 'Smooth (0)' },
  { value: 'illdefined', text: 'Ill-defined (0)' },
  { value: 'lobulated', text: 'Lobulated / irregular (2)' },
  { value: 'ete', text: 'Extra-thyroidal extension (3)' },
];

const BOSNIAK_WALL_OPTS = [
  { value: 'thin', text: 'Thin (≤ 2 mm), smooth' },
  { value: 'minimal', text: 'Minimally thickened (3 mm), enhancing' },
  { value: 'thick', text: 'Thick (≥ 4 mm) or irregular, enhancing' },
];
const BOSNIAK_SEPTA_OPTS = [
  { value: 'none', text: 'None' },
  { value: 'few', text: '1–3 thin (≤ 2 mm) septa' },
  { value: 'many', text: '≥ 4 smooth thin enhancing septa' },
];
const BOSNIAK_PROT_OPTS = [
  { value: 'none', text: 'None' },
  { value: 'obtuseSmall', text: 'Obtuse-margined protrusion ≤ 3 mm (enhancing)' },
  { value: 'obtuseLarge', text: 'Obtuse-margined nodule ≥ 4 mm (enhancing)' },
  { value: 'acute', text: 'Acute-margined nodule, any size (enhancing)' },
];

const CT_REGION_OPTS = [
  { value: 'head', text: 'Head (k 0.0021)' },
  { value: 'headneck', text: 'Head and neck (k 0.0031)' },
  { value: 'neck', text: 'Neck (k 0.0059)' },
  { value: 'chest', text: 'Chest (k 0.014)' },
  { value: 'abdomen', text: 'Abdomen (k 0.015)' },
  { value: 'pelvis', text: 'Pelvis (k 0.015)' },
  { value: 'abdomenpelvis', text: 'Abdomen and pelvis (k 0.015)' },
];

export const renderers = {
  // ----- 2.1 acr-tirads ------------------------------------------------------
  'acr-tirads'(root) {
    note(root, 'ACR TI-RADS (Tessler 2017): composition + echogenicity + shape + margin + echogenic foci (additive) → points → TR level. FNA / follow by max diameter: TR3 FNA ≥2.5/follow ≥1.5 cm; TR4 ≥1.5/≥1.0; TR5 ≥1.0/≥0.5. Near-neighbors: fleischner-2017, bosniak.');
    root.appendChild(pickField('Composition', 'tir-comp', TIRADS_COMP_OPTS));
    root.appendChild(pickField('Echogenicity', 'tir-echo', TIRADS_ECHO_OPTS));
    root.appendChild(pickField('Shape', 'tir-shape', TIRADS_SHAPE_OPTS));
    root.appendChild(pickField('Margin', 'tir-margin', TIRADS_MARGIN_OPTS));
    root.appendChild(el('p', { class: 'muted', text: 'Echogenic foci (check all that apply — additive):' }));
    root.appendChild(checkField('Macrocalcifications (+1)', 'tir-macro'));
    root.appendChild(checkField('Peripheral / rim calcifications (+2)', 'tir-rim'));
    root.appendChild(checkField('Punctate echogenic foci (+3)', 'tir-punctate'));
    root.appendChild(num('Nodule maximum diameter (cm)', 'tir-diameter'));
    const o = out(); root.appendChild(o);
    wireAll(root, () => safe(o, () => {
      const r = M.acrTirads({
        composition: val('tir-comp'), echogenicity: val('tir-echo'), shape: val('tir-shape'), margin: val('tir-margin'),
        fociMacro: chk('tir-macro'), fociRim: chk('tir-rim'), fociPunctate: chk('tir-punctate'), diameter: val('tir-diameter'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Points', value: `${r.points}` },
        { label: 'Level', value: `TR${r.level}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 adrenal-ct-washout ----------------------------------------------
  'adrenal-ct-washout'(root) {
    note(root, 'Adrenal CT washout (Caoili 2002): absolute washout APW = (E − D)/(E − U)×100 (≥60% adenoma); relative washout RPW = (E − D)/E×100 (≥40% adenoma) when no unenhanced scan. Unenhanced ≤10 HU is a lipid-rich adenoma. Near-neighbors: mehran-cin.');
    root.appendChild(numHU('Enhanced / portal-venous attenuation E (HU)', 'aw-e'));
    root.appendChild(numHU('Delayed attenuation D (HU)', 'aw-d'));
    root.appendChild(numHU('Unenhanced attenuation U (HU) — optional, enables absolute washout', 'aw-u'));
    const o = out(); root.appendChild(o);
    wireAll(root, () => safe(o, () => {
      const r = M.adrenalCtWashout({ enhanced: val('aw-e'), delayed: val('aw-d'), unenhanced: val('aw-u') });
      if (!r.valid) { showInvalid(o, r); return; }
      const items = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.apw !== null) items.push({ label: 'Absolute washout', value: `${r.apw} %` });
      items.push({ label: 'Relative washout', value: `${r.rpw} %` });
      resultRow(o, items);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 bosniak ---------------------------------------------------------
  'bosniak'(root) {
    note(root, 'Bosniak classification of cystic renal masses, version 2019 (Silverman 2019). Class by the most significant feature: enhancing nodule → IV; thick wall/septa or small obtuse protrusion → III; minimal (3 mm) thickening or ≥4 thin enhancing septa → IIF; 1–3 thin septa or calcification → II; thin smooth wall → I. Near-neighbors: renal-nephrometry, acr-tirads.');
    root.appendChild(pickField('Wall (thickest enhancing component)', 'bos-wall', BOSNIAK_WALL_OPTS));
    root.appendChild(pickField('Septa', 'bos-septa', BOSNIAK_SEPTA_OPTS));
    root.appendChild(pickField('Enhancing protrusion / nodule', 'bos-prot', BOSNIAK_PROT_OPTS));
    root.appendChild(checkField('Calcification present (any type)', 'bos-calc'));
    const o = out(); root.appendChild(o);
    wireAll(root, () => safe(o, () => {
      const r = M.bosniak({ wall: val('bos-wall'), septa: val('bos-septa'), protrusion: val('bos-prot'), calcification: chk('bos-calc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: `Bosniak ${r.cls}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 ct-effective-dose -----------------------------------------------
  'ct-effective-dose'(root) {
    note(root, 'CT effective dose (AAPM Report 96 / EUR 16262): effective dose (mSv) = DLP (mGy·cm) × region k factor. A population estimate (ICRP-60 weighting), not patient-specific organ dosimetry; pediatric factors differ. Near-neighbors: adrenal-ct-washout.');
    root.appendChild(num('Dose-length product DLP (mGy·cm)', 'ct-dlp'));
    root.appendChild(pickField('Body region', 'ct-region', CT_REGION_OPTS));
    const o = out(); root.appendChild(o);
    wireAll(root, () => safe(o, () => {
      const r = M.ctEffectiveDose({ dlp: val('ct-dlp'), region: val('ct-region') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Effective dose', value: `${r.dose} mSv` },
        { label: 'k factor', value: `${r.k}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
