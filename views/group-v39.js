// spec-v114 §2: renderers for the six pulmonary / sleep-medicine decision rules
// (decaf-score, bap-65, bronchiectasis-bsi, faced-bronchiectasis, nosas-score,
// ahi-odi-severity). All six home in Clinical Scoring & Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames risk,
// severity, or likelihood, not management; none authors an admit, ventilate, or
// refer-for-sleep-study order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pulm-v114.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited instrument’s, computed from the values you entered; it frames risk, severity, or likelihood. The admit, escalate-care, ventilate, and refer-for-sleep-study decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 decaf-score ------------------------------------------------
  'decaf-score'(root) {
    note(root, 'DECAF score: five items predict in-hospital mortality in a hospitalised acute COPD exacerbation. Total 0-6, banded low 0-1 / intermediate 2 / high 3-6.');
    root.appendChild(selectField('Extended MRC dyspnea (eMRCD)', 'dc-emrcd', [
      { value: '1-4', text: 'eMRCD 1-4 (0)' },
      { value: '5a', text: 'eMRCD 5a: housebound, independent in self-care (+1)' },
      { value: '5b', text: 'eMRCD 5b: housebound, dependent for self-care (+2)' },
    ]));
    root.appendChild(checkField('Eosinopenia (eosinophils < 0.05 x10^9/L) -- +1', 'dc-eos'));
    root.appendChild(checkField('Consolidation on chest radiograph -- +1', 'dc-cons'));
    root.appendChild(checkField('Acidemia (pH < 7.30) -- +1', 'dc-acid'));
    root.appendChild(checkField('Atrial fibrillation -- +1', 'dc-af'));
    const o = out(); root.appendChild(o);
    wire(['dc-emrcd', 'dc-eos', 'dc-cons', 'dc-acid', 'dc-af'], () => safe(o, () => {
      const r = M.decafScore({
        emrcd: selVal('dc-emrcd'), eosinopenia: chk('dc-eos'), consolidation: chk('dc-cons'),
        acidemia: chk('dc-acid'), af: chk('dc-af'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/6` },
        { label: 'Risk', value: `${r.tier} (${r.mortality})` },
      ]);
      note(o, `Items counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 bap-65 -----------------------------------------------------
  'bap-65'(root) {
    note(root, 'BAP-65 class: the class is built from the count of three acute variables, with age > 65 splitting class I from II only when no acute variable is present. Check each item that is present.');
    root.appendChild(checkField('BUN >= 25 mg/dL (>= 8.9 mmol/L)', 'bp-bun'));
    root.appendChild(checkField('Altered mental status', 'bp-ams'));
    root.appendChild(checkField('Pulse >= 109 beats/min', 'bp-pulse'));
    root.appendChild(checkField('Age > 65 years', 'bp-age'));
    const o = out(); root.appendChild(o);
    wire(['bp-bun', 'bp-ams', 'bp-pulse', 'bp-age'], () => safe(o, () => {
      const r = M.bap65({ bun: chk('bp-bun'), ams: chk('bp-ams'), pulse: chk('bp-pulse'), ageOver65: chk('bp-age') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.cls },
        { label: 'Mortality', value: r.mortality },
      ]);
      note(o, `Acute variables: ${r.met}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 bronchiectasis-bsi -----------------------------------------
  'bronchiectasis-bsi'(root) {
    note(root, 'Bronchiectasis Severity Index: nine weighted items. Enter the values, mark the colonization and radiology items, and read the low 0-4 / intermediate 5-8 / high >= 9 band.');
    root.appendChild(field('Age (years)', 'bs-age', { min: 0, placeholder: 'e.g. 72' }));
    root.appendChild(field('BMI (kg/m^2)', 'bs-bmi', { step: '0.1', min: 0, placeholder: 'e.g. 17' }));
    root.appendChild(field('FEV1 (% predicted)', 'bs-fev1', { step: '1', min: 0, placeholder: 'e.g. 45' }));
    root.appendChild(field('Exacerbations in the prior year', 'bs-exac', { min: 0, placeholder: 'e.g. 3' }));
    root.appendChild(selectField('MRC dyspnea score (1-5 scale)', 'bs-mrc', [
      { value: '1', text: '1-3 (0)' },
      { value: '4', text: '4 (+2)' },
      { value: '5', text: '5 (+3)' },
    ]));
    root.appendChild(checkField('Hospital admission in the prior 2 years -- +5', 'bs-adm'));
    root.appendChild(checkField('Pseudomonas aeruginosa colonization -- +3', 'bs-ps'));
    root.appendChild(checkField('Colonization with another organism -- +1', 'bs-other'));
    root.appendChild(checkField('>= 3 lobes involved on imaging -- +1', 'bs-lobes'));
    root.appendChild(checkField('Cystic bronchiectasis -- +1', 'bs-cyst'));
    const o = out(); root.appendChild(o);
    wire(['bs-age', 'bs-bmi', 'bs-fev1', 'bs-exac', 'bs-mrc', 'bs-adm', 'bs-ps', 'bs-other', 'bs-lobes', 'bs-cyst'], () => safe(o, () => {
      const r = M.bronchiectasisBsi({
        age: optNum('bs-age'), bmi: optNum('bs-bmi'), fev1: optNum('bs-fev1'), exacerbations: optNum('bs-exac'),
        mrc: Number(selVal('bs-mrc')), priorAdmission: chk('bs-adm'), pseudomonas: chk('bs-ps'),
        otherOrganism: chk('bs-other'), lobes3: chk('bs-lobes'), cystic: chk('bs-cyst'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}` },
        { label: 'Severity', value: r.tier },
      ]);
      note(o, `Points: ${r.parts}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 faced-bronchiectasis ---------------------------------------
  'faced-bronchiectasis'(root) {
    note(root, 'FACED score: FEV1, Age, Pseudomonas Colonization, radiological Extension, and Dyspnea. Total 0-7, banded mild 0-2 / moderate 3-4 / severe 5-7.');
    root.appendChild(field('FEV1 (% predicted)', 'fa-fev1', { step: '1', min: 0, placeholder: 'e.g. 45' }));
    root.appendChild(field('Age (years)', 'fa-age', { min: 0, placeholder: 'e.g. 72' }));
    root.appendChild(checkField('Chronic Pseudomonas aeruginosa colonization -- +1', 'fa-ps'));
    root.appendChild(checkField('Extension >= 3 lobes involved -- +1', 'fa-ext'));
    root.appendChild(checkField('Dyspnea mMRC >= 3 -- +1', 'fa-dys'));
    const o = out(); root.appendChild(o);
    wire(['fa-fev1', 'fa-age', 'fa-ps', 'fa-ext', 'fa-dys'], () => safe(o, () => {
      const r = M.facedBronchiectasis({
        fev1: optNum('fa-fev1'), age: optNum('fa-age'), pseudomonas: chk('fa-ps'),
        extension: chk('fa-ext'), dyspnea: chk('fa-dys'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/7` },
        { label: 'Severity', value: `${r.tier} (${r.mortality})` },
      ]);
      note(o, `Items counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 nosas-score ------------------------------------------------
  'nosas-score'(root) {
    note(root, 'NoSAS score: neck, obesity (BMI), snoring, age, and sex. Total 0-17; a score of >= 8 flags a high probability of sleep-disordered breathing. Complementary to STOP-BANG.');
    root.appendChild(field('Neck circumference (cm)', 'no-neck', { step: '0.5', min: 0, placeholder: 'e.g. 42' }));
    root.appendChild(field('BMI (kg/m^2)', 'no-bmi', { step: '0.1', min: 0, placeholder: 'e.g. 31' }));
    root.appendChild(field('Age (years)', 'no-age', { min: 0, placeholder: 'e.g. 58' }));
    root.appendChild(checkField('Snoring -- +2', 'no-snore'));
    root.appendChild(checkField('Male sex -- +2', 'no-male'));
    const o = out(); root.appendChild(o);
    wire(['no-neck', 'no-bmi', 'no-age', 'no-snore', 'no-male'], () => safe(o, () => {
      const r = M.nosasScore({
        neck: optNum('no-neck'), bmi: optNum('no-bmi'), age: optNum('no-age'),
        snoring: chk('no-snore'), male: chk('no-male'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/17` },
        { label: 'Risk', value: r.high ? 'high (>= 8)' : 'below threshold' },
      ]);
      note(o, `Items counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 ahi-odi-severity -------------------------------------------
  'ahi-odi-severity'(root) {
    note(root, 'AHI / ODI severity: enter the apnea-hypopnea index (events/hour) for the AASM severity band (normal < 5, mild 5-<15, moderate 15-<30, severe >= 30). The oxygen desaturation index is optional; state which desaturation criterion the study used.');
    root.appendChild(field('Apnea-hypopnea index (events/hour)', 'ah-ahi', { step: '0.1', min: 0, placeholder: 'e.g. 22' }));
    root.appendChild(field('Oxygen desaturation index (events/hour, optional)', 'ah-odi', { step: '0.1', min: 0, placeholder: 'e.g. 18' }));
    root.appendChild(selectField('Desaturation criterion', 'ah-crit', [
      { value: '3%', text: '3% or arousal (AASM recommended, v2.0)' },
      { value: '4%', text: '4% (CMS / older acceptable rule)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ah-ahi', 'ah-odi', 'ah-crit'], () => safe(o, () => {
      const r = M.ahiOdiSeverity({ ahi: optNum('ah-ahi'), odi: optNum('ah-odi'), criterion: selVal('ah-crit') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      const items = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'AHI', value: `${r.ahi}/hr (${r.severity})` },
      ];
      if (r.odi != null) items.push({ label: 'ODI', value: `${r.odi}/hr (${r.criterion})` });
      resultRow(o, items);
      if (r.odiText) note(o, r.odiText);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
