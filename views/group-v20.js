// spec-v94 §2: renderers for the five hematology & oncology prognostic tiles
// (hscore-hlh, ipss-r-mds, flipi, mascc, sokal-cml).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable numeric outputs route through fmt() so a guarded null never reaches
// the DOM as NaN/undefined (spec-v53 §3.2). Each tile renders the spec-v50 §3
// clinical posture note and quotes the cited source's own band / category /
// index - none authors a management or disposition order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hemonc-v94.js';
import { resultRow } from '../lib/result-copy.js';
import { fmt } from '../lib/num.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  if (opts.inputmode) inp.setAttribute('inputmode', opts.inputmode);
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
function optNum(id) {
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}
function selVal(id) { return document.getElementById(id).value; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The probability, risk category, index, and risk band are the cited source’s; the diagnosis and the admit / treat-as-outpatient / regimen decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
function pointsList(o, items) {
  o.appendChild(el('ul', {}, items.map((it) => el('li', { text: `${it.label}: ${it.points}` }))));
}

const YESNO = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];

export const renderers = {
  // ----- 2.1 hscore-hlh --------------------------------------------------
  'hscore-hlh'(root) {
    root.appendChild(selectField('Known underlying immunosuppression', 'hs-immuno', YESNO));
    root.appendChild(field('Temperature (°C)', 'hs-temp', { placeholder: 'e.g. 40', inputmode: 'decimal' }));
    root.appendChild(selectField('Organomegaly', 'hs-organ', [
      { value: 'none', text: 'None' },
      { value: 'one', text: 'Hepatomegaly or splenomegaly' },
      { value: 'both', text: 'Hepatomegaly and splenomegaly' },
    ]));
    root.appendChild(selectField('Number of cytopenias (lineages)', 'hs-cyto', [
      { value: '1', text: '1 lineage' },
      { value: '2', text: '2 lineages' },
      { value: '3', text: '3 lineages' },
    ]));
    root.appendChild(field('Ferritin (ng/mL)', 'hs-fer', { placeholder: 'e.g. 4000', inputmode: 'decimal' }));
    root.appendChild(field('Triglyceride (mmol/L)', 'hs-tg', { placeholder: 'e.g. 3', inputmode: 'decimal' }));
    root.appendChild(field('Fibrinogen (g/L)', 'hs-fib', { placeholder: 'e.g. 2', inputmode: 'decimal' }));
    root.appendChild(field('AST (U/L)', 'hs-ast', { placeholder: 'e.g. 100', inputmode: 'decimal' }));
    root.appendChild(selectField('Hemophagocytosis on marrow aspirate', 'hs-hemo', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['hs-immuno', 'hs-temp', 'hs-organ', 'hs-cyto', 'hs-fer', 'hs-tg', 'hs-fib', 'hs-ast', 'hs-hemo'];
    wire(ids, () => safe(o, () => {
      const r = M.hscoreHlh({
        immunosuppression: selVal('hs-immuno'), temp: optNum('hs-temp'),
        organomegaly: selVal('hs-organ'), cytopenias: selVal('hs-cyto'),
        ferritin: optNum('hs-fer'), triglyceride: optNum('hs-tg'),
        fibrinogen: optNum('hs-fib'), ast: optNum('hs-ast'),
        hemophagocytosis: selVal('hs-hemo'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.high ? 'warn' : null },
        { label: 'HScore (0–337)', value: String(r.total) },
        { label: 'Estimated HLH probability', value: r.probability },
      ]);
      pointsList(o, r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ipss-r-mds --------------------------------------------------
  'ipss-r-mds'(root) {
    root.appendChild(selectField('Cytogenetic risk group', 'ir-cyto', [
      { value: 'very-good', text: 'Very good' },
      { value: 'good', text: 'Good' },
      { value: 'intermediate', text: 'Intermediate' },
      { value: 'poor', text: 'Poor' },
      { value: 'very-poor', text: 'Very poor' },
    ]));
    root.appendChild(field('Bone-marrow blasts (%)', 'ir-blasts', { placeholder: 'e.g. 7', inputmode: 'decimal' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'ir-hgb', { placeholder: 'e.g. 9', inputmode: 'decimal' }));
    root.appendChild(field('Platelets (×10⁹/L)', 'ir-plt', { placeholder: 'e.g. 150', inputmode: 'decimal' }));
    root.appendChild(field('Absolute neutrophil count (×10⁹/L)', 'ir-anc', { placeholder: 'e.g. 1.5', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['ir-cyto', 'ir-blasts', 'ir-hgb', 'ir-plt', 'ir-anc'], () => safe(o, () => {
      const r = M.ipssrMds({
        cytogenetics: selVal('ir-cyto'), blasts: optNum('ir-blasts'),
        hemoglobin: optNum('ir-hgb'), platelets: optNum('ir-plt'), anc: optNum('ir-anc'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const c = r.components;
      resultRow(o, [
        { text: r.band, cls: (r.bandKey === 'high' || r.bandKey === 'very-high') ? 'warn' : null },
        { label: 'IPSS-R total', value: String(r.total) },
        { label: 'Median overall survival', value: r.survival },
        { label: 'Points (cytogenetics / blasts / Hgb / platelets / ANC)', value: `${c.cytogenetics} / ${c.blasts} / ${c.hemoglobin} / ${c.platelets} / ${c.anc}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 flipi -------------------------------------------------------
  'flipi'(root) {
    root.appendChild(selectField('Age > 60 years', 'fl-age', YESNO));
    root.appendChild(selectField('Ann Arbor stage III–IV', 'fl-stage', YESNO));
    root.appendChild(selectField('LDH > upper limit of normal', 'fl-ldh', YESNO));
    root.appendChild(selectField('FLIPI: hemoglobin < 12 g/dL', 'fl-hgb', YESNO));
    root.appendChild(selectField('FLIPI: > 4 nodal areas', 'fl-nodal', YESNO));
    root.appendChild(selectField('IPI: ECOG performance status ≥ 2', 'fl-ecog', YESNO));
    root.appendChild(selectField('IPI: > 1 extranodal site', 'fl-extra', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['fl-age', 'fl-stage', 'fl-ldh', 'fl-hgb', 'fl-nodal', 'fl-ecog', 'fl-extra'];
    wire(ids, () => safe(o, () => {
      const r = M.flipi({
        ageOver60: selVal('fl-age'), stageAdvanced: selVal('fl-stage'), ldhHigh: selVal('fl-ldh'),
        hgbLow: selVal('fl-hgb'), nodalOver4: selVal('fl-nodal'),
        ecogOver2: selVal('fl-ecog'), extranodalOver1: selVal('fl-extra'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.flipiBand === 'high' || r.ipiBand === 'high') ? 'warn' : null },
        { label: 'FLIPI', value: `${r.flipiScore} (${r.flipiBand}) — ${r.flipiOs}` },
        { label: 'IPI', value: `${r.ipiScore} (${r.ipiBand}) — ${r.ipiOs}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 mascc -------------------------------------------------------
  'mascc'(root) {
    root.appendChild(selectField('Burden of illness', 'ma-burden', [
      { value: 'no-mild', text: 'No or mild symptoms (5)' },
      { value: 'moderate', text: 'Moderate symptoms (3)' },
      { value: 'severe', text: 'Severe symptoms (0)' },
    ]));
    root.appendChild(selectField('No hypotension (SBP > 90 mmHg)', 'ma-hypo', YESNO));
    root.appendChild(selectField('No chronic obstructive pulmonary disease', 'ma-copd', YESNO));
    root.appendChild(selectField('Solid tumor or no previous fungal infection', 'ma-tumor', YESNO));
    root.appendChild(selectField('No dehydration needing parenteral fluids', 'ma-dehyd', YESNO));
    root.appendChild(selectField('Outpatient at onset of fever', 'ma-outpt', YESNO));
    root.appendChild(selectField('Age < 60 years', 'ma-age', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['ma-burden', 'ma-hypo', 'ma-copd', 'ma-tumor', 'ma-dehyd', 'ma-outpt', 'ma-age'];
    wire(ids, () => safe(o, () => {
      const r = M.mascc({
        burden: selVal('ma-burden'), noHypotension: selVal('ma-hypo'), noCopd: selVal('ma-copd'),
        solidNoFungal: selVal('ma-tumor'), noDehydration: selVal('ma-dehyd'),
        outpatient: selVal('ma-outpt'), ageUnder60: selVal('ma-age'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.lowRisk ? null : 'warn' },
        { label: 'MASCC total (max 26)', value: String(r.total) },
        { label: 'Risk', value: r.lowRisk ? 'low risk (≥ 21)' : 'not low risk (< 21)' },
      ]);
      pointsList(o, r.items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 sokal-cml ---------------------------------------------------
  'sokal-cml'(root) {
    root.appendChild(field('Age (years)', 'sk-age', { placeholder: 'e.g. 50', inputmode: 'numeric' }));
    root.appendChild(field('Spleen (cm below costal margin)', 'sk-spleen', { placeholder: 'e.g. 5', inputmode: 'decimal' }));
    root.appendChild(field('Platelet count (×10⁹/L) — must be > 0', 'sk-plt', { placeholder: 'e.g. 300', inputmode: 'decimal' }));
    root.appendChild(field('Peripheral-blood blasts (%)', 'sk-blasts', { placeholder: 'e.g. 2', inputmode: 'decimal' }));
    const o = out(); root.appendChild(o);
    wire(['sk-age', 'sk-spleen', 'sk-plt', 'sk-blasts'], () => safe(o, () => {
      const r = M.sokalCml({
        age: optNum('sk-age'), spleen: optNum('sk-spleen'),
        platelets: optNum('sk-plt'), blasts: optNum('sk-blasts'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.sokalBand === 'high' || r.eltsBand === 'high') ? 'warn' : null },
        { label: 'Sokal relative risk', value: `${fmt(r.sokal)}${r.sokalBand ? ` (${r.sokalBand})` : ''}` },
        { label: 'ELTS score', value: `${fmt(r.elts)}${r.eltsBand ? ` (${r.eltsBand})` : ''}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
