// spec-v132 §2: renderers for the five thrombotic-microangiopathy / coagulopathy
// tiles that open Wave 6 -- plasmic-ttp, french-ttp, jaam-dic, ipset-thrombosis,
// cisne -- all in Clinical Scoring & Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score /
// risk class, not management (spec-v11 §5.3). Each compute surfaces a complete-
// the-fields fallback rather than a bad number; the yes/no and graded selects
// carry a blank leading option so a partial entry is reported as not-assessed,
// not silently scored 0 (lib/heme-v132.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heme-v132.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and risk class are the cited instrument’s, computed from the values you entered. The diagnosis and the management decision — plasma exchange, transfusion, cytoreduction, admission or antibiotics — stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const BLANK = { value: '', text: 'Select…' };
const YN = [BLANK, { value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const GRADE_OPTS = [BLANK, { value: '0', text: '0' }, { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' }, { value: '4', text: '4' }];

export const renderers = {
  // ----- 2.1 plasmic-ttp ------------------------------------------------
  'plasmic-ttp'(root) {
    note(root, 'PLASMIC score (Bendapudi 2017): a 0–7 pretest probability of severe ADAMTS13 deficiency (acquired TTP), scored before the assay returns. 1 point each: platelet <30 ×10⁹/L; a hemolysis sign (reticulocyte >2.5%, undetectable haptoglobin, or indirect bilirubin >2.0 mg/dL); no active cancer in the past year; no prior transplant; MCV <90 fL; INR <1.5; creatinine <2.0 mg/dL. 0–4 low, 5 intermediate, 6–7 high.');
    root.appendChild(field('Platelet count (×10⁹/L)', 'pl-plt', { step: '1', min: 0, placeholder: 'e.g. 18' }));
    root.appendChild(selectField('Hemolysis (retic >2.5%, undetectable haptoglobin, or indirect bili >2.0)?', 'pl-hem', YN));
    root.appendChild(selectField('Active cancer in the past year?', 'pl-ca', YN));
    root.appendChild(selectField('Prior solid-organ or stem-cell transplant?', 'pl-tx', YN));
    root.appendChild(field('MCV (fL)', 'pl-mcv', { step: '0.1', min: 0, placeholder: 'e.g. 85' }));
    root.appendChild(field('INR', 'pl-inr', { step: '0.1', min: 0, placeholder: 'e.g. 1.2' }));
    root.appendChild(field('Creatinine (mg/dL)', 'pl-cr', { step: '0.1', min: 0, placeholder: 'e.g. 1.4' }));
    const o = out(); root.appendChild(o);
    wire(['pl-plt', 'pl-hem', 'pl-ca', 'pl-tx', 'pl-mcv', 'pl-inr', 'pl-cr'], () => safe(o, () => {
      const r = M.plasmicTtp({ platelet: optNum('pl-plt'), hemolysis: selVal('pl-hem'), activeCancer: selVal('pl-ca'), transplant: selVal('pl-tx'), mcv: optNum('pl-mcv'), inr: optNum('pl-inr'), creatinine: optNum('pl-cr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PLASMIC', value: `${r.total} of 7 (${r.tier})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 french-ttp -------------------------------------------------
  'french-ttp'(root) {
    note(root, 'French TTP score (Coppo 2010): a 0–3 pretest rule for severe acquired ADAMTS13 deficiency. 1 point each: platelet <30 ×10⁹/L, creatinine ≤2.26 mg/dL (≤200 µmol/L), positive ANA. A score of 0 makes severe deficiency very unlikely; 2–3 makes it highly likely.');
    root.appendChild(field('Platelet count (×10⁹/L)', 'ft-plt', { step: '1', min: 0, placeholder: 'e.g. 22' }));
    root.appendChild(field('Creatinine (mg/dL)', 'ft-cr', { step: '0.01', min: 0, placeholder: 'e.g. 1.1' }));
    root.appendChild(selectField('Antinuclear antibody (ANA) positive?', 'ft-ana', YN));
    const o = out(); root.appendChild(o);
    wire(['ft-plt', 'ft-cr', 'ft-ana'], () => safe(o, () => {
      const r = M.frenchTtp({ platelet: optNum('ft-plt'), creatinine: optNum('ft-cr'), ana: selVal('ft-ana') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'French TTP', value: `${r.total} of 3 (${r.tier})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 jaam-dic ---------------------------------------------------
  'jaam-dic'(root) {
    note(root, 'JAAM DIC score (Gando 2006, the 2006 revised acute-DIC criteria): a 0–8 score. SIRS ≥3 criteria = 1; platelet <80 ×10⁹/L or >50% fall in 24 h = 3, else 80 to <120 or >30% fall = 1; FDP ≥25 µg/mL = 3, 10 to <25 = 1; PT ratio ≥1.2 = 1. A total ≥4 meets the criteria for DIC. The 24-h-prior platelet is optional (it scores the fall).');
    root.appendChild(selectField('≥3 SIRS criteria met?', 'jd-sirs', YN));
    root.appendChild(field('Platelet count now (×10⁹/L)', 'jd-plt', { step: '1', min: 0, placeholder: 'e.g. 90' }));
    root.appendChild(field('Platelet 24 h ago (×10⁹/L, optional)', 'jd-prior', { step: '1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('FDP (µg/mL)', 'jd-fdp', { step: '0.1', min: 0, placeholder: 'e.g. 28' }));
    root.appendChild(field('Prothrombin-time ratio', 'jd-pt', { step: '0.01', min: 0, placeholder: 'e.g. 1.3' }));
    const o = out(); root.appendChild(o);
    wire(['jd-sirs', 'jd-plt', 'jd-prior', 'jd-fdp', 'jd-pt'], () => safe(o, () => {
      const r = M.jaamDic({ sirs: selVal('jd-sirs'), platelet: optNum('jd-plt'), priorPlatelet: optNum('jd-prior'), fdp: optNum('jd-fdp'), ptRatio: optNum('jd-pt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'JAAM DIC', value: `${r.total} of 8${r.dic ? ' — DIC' : ''}` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 ipset-thrombosis -------------------------------------------
  'ipset-thrombosis'(root) {
    note(root, 'Revised IPSET-thrombosis (Barbui 2015): stratifies thrombotic risk in essential thrombocythemia into four categories from age >60, a thrombosis history, and JAK2 V617F. Very low = none; low = JAK2 only; intermediate = age >60 without JAK2 or thrombosis; high = a thrombosis history, or age >60 with JAK2. (Distinct from the VTE Padua / IMPROVE tools.)');
    root.appendChild(selectField('Age older than 60 years?', 'ip-age', YN));
    root.appendChild(selectField('History of thrombosis?', 'ip-thr', YN));
    root.appendChild(selectField('JAK2 V617F mutation present?', 'ip-jak2', YN));
    const o = out(); root.appendChild(o);
    wire(['ip-age', 'ip-thr', 'ip-jak2'], () => safe(o, () => {
      const r = M.ipsetThrombosis({ ageOver60: selVal('ip-age'), thrombosis: selVal('ip-thr'), jak2: selVal('ip-jak2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'IPSET-thrombosis', value: r.category }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 cisne ------------------------------------------------------
  'cisne'(root) {
    note(root, 'CISNE (Carmona-Bayonas 2015): predicts serious complications in solid-tumor outpatients with febrile neutropenia who appear clinically stable. ECOG ≥2 = 2, stress-induced hyperglycemia = 2, COPD = 1, chronic cardiovascular disease = 1, NCI mucositis grade ≥2 = 1, monocytes <200/µL = 1. 0 low (~1.1%), 1–2 intermediate (~6.2%), ≥3 high (~36%).');
    root.appendChild(selectField('ECOG performance status', 'ci-ecog', GRADE_OPTS));
    root.appendChild(selectField('Stress-induced hyperglycemia?', 'ci-glu', YN));
    root.appendChild(selectField('COPD?', 'ci-copd', YN));
    root.appendChild(selectField('Chronic cardiovascular disease?', 'ci-cv', YN));
    root.appendChild(selectField('NCI mucositis grade', 'ci-muc', GRADE_OPTS));
    root.appendChild(field('Monocyte count (/µL)', 'ci-mono', { step: '1', min: 0, placeholder: 'e.g. 150' }));
    const o = out(); root.appendChild(o);
    wire(['ci-ecog', 'ci-glu', 'ci-copd', 'ci-cv', 'ci-muc', 'ci-mono'], () => safe(o, () => {
      const r = M.cisne({ ecog: selVal('ci-ecog') === '' ? null : Number(selVal('ci-ecog')), hyperglycemia: selVal('ci-glu'), copd: selVal('ci-copd'), cardiovascular: selVal('ci-cv'), mucositis: selVal('ci-muc') === '' ? null : Number(selVal('ci-muc')), monocytes: optNum('ci-mono') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CISNE', value: `${r.total} of 8 (${r.tier})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
