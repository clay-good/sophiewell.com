// spec-v140 §2: renderers for the five pediatric / neonatal severity tiles
// (eos-calculator, snappe-ii, rdai-tal, clinical-dehydration-scale,
// koff-bladder-capacity). eos-calculator, snappe-ii, and rdai-tal are Clinical
// Scoring & Risk (Group G); clinical-dehydration-scale is Group G;
// koff-bladder-capacity is Clinical Math & Conversions (Group E). v140 is the
// third feature spec of Wave 7 of the spec-v100 program. (crib-ii is deferred --
// see lib/peds-v140.js header.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a
// probability, score, or band, not management; none authors an antibiotic /
// fluid / admission order in Sophie's voice (spec-v11 §5.3). The EOS logistic
// surfaces a complete-the-fields fallback rather than a number from a bad input
// (lib/peds-v140.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/peds-v140.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, TEMP_UNITS } from '../lib/field-units.js';

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
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The probability, score, or band is the cited instrument’s, computed from the values you entered. The management decision — observe, culture, treat, or rehydrate — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

// 0-N point select with a "not assessed" first option (value '').
function scoreField(label, id, levels) {
  const opts = [{ value: '', text: '— not assessed —' }];
  for (const lv of levels) opts.push({ value: String(lv.value), text: `${lv.value} — ${lv.text}` });
  return selectField(label, id, opts);
}

export const renderers = {
  // ----- 2.1 eos-calculator ---------------------------------------------
  'eos-calculator'(root) {
    note(root, 'Kaiser Neonatal Early-Onset Sepsis Calculator (Kuzniewicz/Puopolo): the posterior EOS probability per 1,000 live births from the maternal/prenatal predictors and the newborn exam. Enter the highest intrapartum temperature in °F. The management tier shown is the source’s, keyed to the posterior risk.');
    root.appendChild(selectField('EOS baseline incidence (per 1,000 live births)', 'eos-inc', [
      { value: '0.5', text: '0.5 (CDC national default)' },
      { value: '0.6', text: '0.6' },
      { value: '0.4', text: '0.4' },
      { value: '0.3', text: '0.3' },
    ]));
    root.appendChild(field('Gestational age (weeks, decimal)', 'eos-ga', { step: '0.1', min: 22, max: 43, placeholder: 'e.g. 39' }));
    root.appendChild(field('Highest intrapartum temperature (°F)', 'eos-temp', { step: '0.1', min: 90, max: 110, placeholder: 'e.g. 100.4' }));
    root.appendChild(field('Rupture of membranes (hours before delivery)', 'eos-rom', { step: '0.1', min: 0, placeholder: 'e.g. 18' }));
    root.appendChild(selectField('Maternal GBS status', 'eos-gbs', [
      { value: 'negative', text: 'Negative' },
      { value: 'positive', text: 'Positive' },
      { value: 'unknown', text: 'Unknown' },
    ]));
    root.appendChild(selectField('Intrapartum antibiotics', 'eos-abx', [
      { value: 'none', text: 'None, or any antibiotic under 2 h before delivery' },
      { value: 'tx1', text: 'GBS-specific ≥ 2 h, or broad-spectrum 2 to under 4 h, before delivery' },
      { value: 'tx2', text: 'Broad-spectrum ≥ 4 h before delivery' },
    ]));
    root.appendChild(selectField('Newborn clinical examination', 'eos-exam', [
      { value: 'well', text: 'Well-appearing' },
      { value: 'equivocal', text: 'Equivocal' },
      { value: 'illness', text: 'Clinical illness' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['eos-inc', 'eos-ga', 'eos-temp', 'eos-rom', 'eos-gbs', 'eos-abx', 'eos-exam'], () => safe(o, () => {
      const r = M.eosCalculator({ incidence: selVal('eos-inc'), ga: optNum('eos-ga'), tempF: optNum('eos-temp'), rom: optNum('eos-rom'), gbs: selVal('eos-gbs'), abx: selVal('eos-abx'), exam: selVal('eos-exam') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'EOS risk (after exam)', value: `${r.posteriorRisk} per 1,000` },
        { label: 'Risk at birth', value: `${r.priorRisk} per 1,000` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 snappe-ii --------------------------------------------------
  'snappe-ii'(root) {
    note(root, 'SNAPPE-II (Richardson 2001): the neonatal illness-severity score (0–162) from the first hours of life. Enter the PaO₂ in mmHg and FiO₂ as a percentage; items left blank score their normal (0-point) band.');
    root.appendChild(field('Mean blood pressure (mmHg)', 'sn-map', { step: '1', min: 0, placeholder: 'e.g. 25' }));
    root.appendChild(unitField('Lowest temperature', 'sn-temp', TEMP_UNITS, { placeholder: 'e.g. 34.5' }));
    root.appendChild(field('Lowest PaO₂ (mmHg)', 'sn-pao2', { step: '1', min: 0, placeholder: 'e.g. 50' }));
    root.appendChild(field('FiO₂ at that PaO₂ (%)', 'sn-fio2', { step: '1', min: 21, max: 100, placeholder: 'e.g. 80' }));
    root.appendChild(field('Lowest serum pH', 'sn-ph', { step: '0.01', placeholder: 'e.g. 7.05' }));
    root.appendChild(checkField('Multiple seizures', 'sn-seiz'));
    root.appendChild(field('Urine output (mL/kg/h)', 'sn-urine', { step: '0.1', min: 0, placeholder: 'e.g. 0.5' }));
    root.appendChild(field('Birth weight (g)', 'sn-bw', { step: '1', min: 0, placeholder: 'e.g. 800' }));
    root.appendChild(checkField('Small for gestational age (< 3rd percentile)', 'sn-sga'));
    root.appendChild(field('Apgar at 5 minutes', 'sn-apgar', { step: '1', min: 0, max: 10, placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['sn-map', 'sn-temp', 'sn-temp-unit', 'sn-pao2', 'sn-fio2', 'sn-ph', 'sn-seiz', 'sn-urine', 'sn-bw', 'sn-sga', 'sn-apgar'], () => safe(o, () => {
      const r = M.snappeII({ map: optNum('sn-map'), temp: unitNumOpt('sn-temp'), pao2: optNum('sn-pao2'), fio2: optNum('sn-fio2'), ph: optNum('sn-ph'), seizures: chk('sn-seiz'), urine: optNum('sn-urine'), bw: optNum('sn-bw'), sga: chk('sn-sga'), apgar5: optNum('sn-apgar') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SNAPPE-II', value: `${r.score}/162` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 rdai-tal ---------------------------------------------------
  'rdai-tal'(root) {
    note(root, 'RDAI (Lowell 1987): the bronchiolitis respiratory-distress total (0–17) from wheeze and retraction sub-scores. The optional Tal score (Tal 1983) adds respiratory rate, wheeze, cyanosis, and accessory-muscle use (0–12).');
    note(root, 'RDAI — wheezing:');
    root.appendChild(scoreField('Wheezing on expiration', 'rd-wexp', [
      { value: 0, text: 'none' }, { value: 1, text: 'end-expiratory' }, { value: 2, text: 'half of expiration' }, { value: 3, text: 'three-quarters' }, { value: 4, text: 'all of expiration' },
    ]));
    root.appendChild(scoreField('Wheezing on inspiration', 'rd-winsp', [
      { value: 0, text: 'none' }, { value: 1, text: 'part of inspiration' }, { value: 2, text: 'all of inspiration' },
    ]));
    root.appendChild(scoreField('Location of wheezing', 'rd-wloc', [
      { value: 0, text: 'none' }, { value: 1, text: '≤ 2 of 4 lung fields' }, { value: 2, text: '≥ 3 of 4 lung fields' },
    ]));
    note(root, 'RDAI — retractions:');
    root.appendChild(scoreField('Supraclavicular retractions', 'rd-supra', [
      { value: 0, text: 'none' }, { value: 1, text: 'mild' }, { value: 2, text: 'moderate' }, { value: 3, text: 'marked' },
    ]));
    root.appendChild(scoreField('Intercostal retractions', 'rd-inter', [
      { value: 0, text: 'none' }, { value: 1, text: 'mild' }, { value: 2, text: 'moderate' }, { value: 3, text: 'marked' },
    ]));
    root.appendChild(scoreField('Subcostal retractions', 'rd-sub', [
      { value: 0, text: 'none' }, { value: 1, text: 'mild' }, { value: 2, text: 'moderate' }, { value: 3, text: 'marked' },
    ]));
    note(root, 'Tal score (optional):');
    root.appendChild(scoreField('Respiratory rate', 'rd-trr', [
      { value: 0, text: '≤ 30/min' }, { value: 1, text: '31–45/min' }, { value: 2, text: '46–60/min' }, { value: 3, text: '> 60/min' },
    ]));
    root.appendChild(scoreField('Wheezing (Tal)', 'rd-twhz', [
      { value: 0, text: 'none' }, { value: 1, text: 'end-expiratory by stethoscope' }, { value: 2, text: 'inspiration + expiration' }, { value: 3, text: 'audible without stethoscope' },
    ]));
    root.appendChild(scoreField('Cyanosis', 'rd-tcyan', [
      { value: 0, text: 'none' }, { value: 1, text: 'perioral with crying' }, { value: 2, text: 'perioral at rest' }, { value: 3, text: 'generalized at rest' },
    ]));
    root.appendChild(scoreField('Accessory-muscle use', 'rd-tacc', [
      { value: 0, text: 'none' }, { value: 1, text: '+' }, { value: 2, text: '++' }, { value: 3, text: '+++' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['rd-wexp', 'rd-winsp', 'rd-wloc', 'rd-supra', 'rd-inter', 'rd-sub', 'rd-trr', 'rd-twhz', 'rd-tcyan', 'rd-tacc'];
    wire(ids, () => safe(o, () => {
      const r = M.rdaiTal({
        wheezeExp: selVal('rd-wexp'), wheezeInsp: selVal('rd-winsp'), wheezeLoc: selVal('rd-wloc'),
        retSupraclav: selVal('rd-supra'), retIntercostal: selVal('rd-inter'), retSubcostal: selVal('rd-sub'),
        talRr: selVal('rd-trr'), talWheeze: selVal('rd-twhz'), talCyanosis: selVal('rd-tcyan'), talAccessory: selVal('rd-tacc'),
      });
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'RDAI', value: `${r.rdai}/17` },
      ];
      if (r.tal !== null) rows.push({ label: 'Tal', value: `${r.tal}/12` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 clinical-dehydration-scale ---------------------------------
  'clinical-dehydration-scale'(root) {
    note(root, 'Clinical Dehydration Scale (Goldman 2008), for children ~1–36 months with gastroenteritis: four items each 0–2, summing 0–8. 0 = none, 1–4 = some, 5–8 = moderate to severe dehydration.');
    root.appendChild(scoreField('General appearance', 'cd-app', [
      { value: 0, text: 'normal' }, { value: 1, text: 'thirsty, restless, or lethargic but irritable when touched' }, { value: 2, text: 'drowsy, limp, cold, or sweaty; comatose' },
    ]));
    root.appendChild(scoreField('Eyes', 'cd-eyes', [
      { value: 0, text: 'normal' }, { value: 1, text: 'slightly sunken' }, { value: 2, text: 'very sunken' },
    ]));
    root.appendChild(scoreField('Mucous membranes', 'cd-muc', [
      { value: 0, text: 'moist' }, { value: 1, text: 'sticky' }, { value: 2, text: 'dry' },
    ]));
    root.appendChild(scoreField('Tears', 'cd-tears', [
      { value: 0, text: 'present (normal)' }, { value: 1, text: 'decreased' }, { value: 2, text: 'absent' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['cd-app', 'cd-eyes', 'cd-muc', 'cd-tears'], () => safe(o, () => {
      const r = M.clinicalDehydrationScale({ appearance: selVal('cd-app'), eyes: selVal('cd-eyes'), mucous: selVal('cd-muc'), tears: selVal('cd-tears') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'CDS', value: `${r.score}/8` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 koff-bladder-capacity --------------------------------------
  'koff-bladder-capacity'(root) {
    note(root, 'Koff expected bladder capacity (Koff 1983): expected bladder capacity (mL) = (age in years + 2) × 30. The standard reference estimate for children roughly 1–12 years.');
    root.appendChild(field('Age (years)', 'kb-age', { step: '0.5', min: 0, placeholder: 'e.g. 4' }));
    const o = out(); root.appendChild(o);
    wire(['kb-age'], () => safe(o, () => {
      const r = M.koffBladderCapacity({ age: optNum('kb-age') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Expected capacity', value: `${r.capacity} mL` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
