// spec-v126 §2: renderers for the six GI disease-activity and pancreatitis-
// severity instruments (cdai-crohns, uceis, ses-cd, haps, ctsi-balthazar,
// modified-marshall). All six home in Clinical Scoring & Risk (Group G). v126
// continues Wave 5 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score or
// determination, not management; none authors a treatment order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gi-v126.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const op of options) sel.appendChild(el('option', { value: op.value, text: op.text }));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or determination is the cited instrument’s, computed from the values you entered. The management decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const SEG_OPTS = [
  { value: '0', text: '0' }, { value: '1', text: '1' }, { value: '2', text: '2' }, { value: '3', text: '3' },
];
const SEGMENTS = [['il', 'Ileum'], ['rc', 'Right colon'], ['tc', 'Transverse'], ['lc', 'Left colon'], ['re', 'Rectum']];

export const renderers = {
  // ----- 2.1 cdai-crohns ------------------------------------------------
  'cdai-crohns'(root) {
    note(root, 'Crohn\'s Disease Activity Index (Best 1976): the 8-item trial-standard activity score. Enter the 7-day diary sums and the labs. Bands: < 150 remission, 150-220 mild, 221-450 moderate, > 450 severe.');
    root.appendChild(field('Liquid/very soft stools (sum over 7 days)', 'cd-stools', { min: 0, placeholder: 'e.g. 20' }));
    root.appendChild(field('Abdominal pain (daily 0-3, sum over 7 days)', 'cd-pain', { min: 0, placeholder: 'e.g. 14' }));
    root.appendChild(field('General well-being (daily 0-4, sum over 7 days)', 'cd-well', { min: 0, placeholder: 'e.g. 7' }));
    root.appendChild(field('Complications (count of 0-6)', 'cd-comp', { min: 0, placeholder: 'e.g. 1' }));
    root.appendChild(checkField('Taking antidiarrheal drugs', 'cd-anti'));
    root.appendChild(selectField('Abdominal mass', 'cd-mass', [
      { value: '0', text: 'None (0)' }, { value: '2', text: 'Questionable (2)' }, { value: '5', text: 'Definite (5)' },
    ]));
    root.appendChild(checkField('Female (hematocrit standard 42 vs 47)', 'cd-female'));
    root.appendChild(field('Hematocrit (%)', 'cd-hct', { step: '0.1', min: 0, placeholder: 'e.g. 40' }));
    root.appendChild(field('Body weight (kg)', 'cd-wt', { step: '0.1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Standard/ideal body weight (kg)', 'cd-std', { step: '0.1', min: 0, placeholder: 'e.g. 70' }));
    const o = out(); root.appendChild(o);
    wire(['cd-stools', 'cd-pain', 'cd-well', 'cd-comp', 'cd-anti', 'cd-mass', 'cd-female', 'cd-hct', 'cd-wt', 'cd-std'], () => safe(o, () => {
      const r = M.cdaiCrohns({
        stools: optNum('cd-stools'), pain: optNum('cd-pain'), wellbeing: optNum('cd-well'),
        complications: optNum('cd-comp'), antidiarrheal: chk('cd-anti'), abdMass: selVal('cd-mass'),
        female: chk('cd-female'), hct: optNum('cd-hct'), weight: optNum('cd-wt'), standardWeight: optNum('cd-std'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CDAI', value: String(r.total) }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 uceis ------------------------------------------------------
  uceis(root) {
    note(root, 'UC Endoscopic Index of Severity (Travis 2012): three descriptors at the worst-affected area. Total 0-8 (0-based modern scale). Remission 0-1, mild 2-4, moderate 5-6, severe 7-8.');
    root.appendChild(selectField('Vascular pattern', 'uc-vasc', [
      { value: '0', text: 'Normal (0)' }, { value: '1', text: 'Patchy obliteration (1)' }, { value: '2', text: 'Obliterated (2)' },
    ]));
    root.appendChild(selectField('Bleeding', 'uc-bleed', [
      { value: '0', text: 'None (0)' }, { value: '1', text: 'Mucosal (1)' }, { value: '2', text: 'Luminal mild (2)' }, { value: '3', text: 'Luminal moderate/severe (3)' },
    ]));
    root.appendChild(selectField('Erosions and ulcers', 'uc-ero', [
      { value: '0', text: 'None (0)' }, { value: '1', text: 'Erosions (1)' }, { value: '2', text: 'Superficial ulcer (2)' }, { value: '3', text: 'Deep ulcer (3)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['uc-vasc', 'uc-bleed', 'uc-ero'], () => safe(o, () => {
      const r = M.uceis({ vascular: selVal('uc-vasc'), bleeding: selVal('uc-bleed'), erosions: selVal('uc-ero') });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'UCEIS', value: `${r.total}/8` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 ses-cd -----------------------------------------------------
  'ses-cd'(root) {
    note(root, 'Simple Endoscopic Score for Crohn\'s Disease (Daperno 2004): four variables scored 0-3 in each of five ileocolonic segments. Stenosis sub-total is capped at 11 (max total 56). Bands: 0-2 remission, 3-6 mild, 7-15 moderate, > 15 severe.');
    const groups = [
      ['us', 'Ulcer size'],
      ['uf', 'Ulcerated surface'],
      ['af', 'Affected surface'],
      ['st', 'Stenosis'],
    ];
    const ids = [];
    for (const [vk, vlabel] of groups) {
      for (const [sk, slabel] of SEGMENTS) {
        const id = `se-${vk}-${sk}`;
        ids.push(id);
        root.appendChild(selectField(`${vlabel} — ${slabel} (0-3)`, id, SEG_OPTS));
      }
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const arr = (vk) => SEGMENTS.map(([sk]) => selVal(`se-${vk}-${sk}`));
      const r = M.sesCd({ ulcerSize: arr('us'), ulceratedSurface: arr('uf'), affectedSurface: arr('af'), stenosis: arr('st') });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'SES-CD', value: `${r.total}/56` }]);
      if (r.stenosisCapped) note(o, 'Stenosis sub-total capped at 11 per the published rule.');
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 haps -------------------------------------------------------
  haps(root) {
    note(root, 'Harmless Acute Pancreatitis Score (Lankisch 2009): a three-criterion admission gate. All three normal predicts a harmless (non-severe) course; any abnormal does not rule severity in.');
    root.appendChild(checkField('Rebound tenderness or guarding present (peritonitis)', 'ha-perit'));
    root.appendChild(checkField('Female (hematocrit threshold 39.6 vs 43)', 'ha-female'));
    root.appendChild(field('Hematocrit (%)', 'ha-hct', { step: '0.1', min: 0, placeholder: 'e.g. 40' }));
    root.appendChild(field('Serum creatinine (mg/dL)', 'ha-creat', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    const o = out(); root.appendChild(o);
    wire(['ha-perit', 'ha-female', 'ha-hct', 'ha-creat'], () => safe(o, () => {
      const r = M.haps({ peritonitis: chk('ha-perit'), female: chk('ha-female'), hct: optNum('ha-hct'), creatinine: optNum('ha-creat') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HAPS', value: r.harmless ? 'harmless' : 'not harmless' }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 ctsi-balthazar ---------------------------------------------
  'ctsi-balthazar'(root) {
    note(root, 'CT Severity Index (Balthazar 1990): the CT grade plus the necrosis score. Total 0-10: 0-3 mild, 4-6 moderate, 7-10 severe.');
    root.appendChild(selectField('Balthazar CT grade', 'ct-grade', [
      { value: '0', text: 'A — normal pancreas (0)' },
      { value: '1', text: 'B — focal/diffuse enlargement (1)' },
      { value: '2', text: 'C — intrinsic changes + fat stranding (2)' },
      { value: '3', text: 'D — single fluid collection (3)' },
      { value: '4', text: 'E — two or more collections or gas (4)' },
    ]));
    root.appendChild(selectField('Pancreatic necrosis', 'ct-necr', [
      { value: '0', text: 'None (0)' },
      { value: '2', text: '30% or less (2)' },
      { value: '4', text: '30-50% (4)' },
      { value: '6', text: 'Over 50% (6)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['ct-grade', 'ct-necr'], () => safe(o, () => {
      const r = M.ctsiBalthazar({ grade: selVal('ct-grade'), necrosis: selVal('ct-necr') });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CTSI', value: `${r.total}/10` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 modified-marshall ------------------------------------------
  'modified-marshall'(root) {
    note(root, 'Modified Marshall organ-dysfunction score (Banks 2013, Revised Atlanta): scores three organ systems 0-4. Organ failure is a score ≥ 2 in any assessed system (the threshold separating moderately-severe from severe acute pancreatitis). Leave a system blank if not assessed.');
    root.appendChild(field('Respiratory — PaO₂ (mmHg)', 'mm-pao2', { step: '1', min: 0, placeholder: 'e.g. 200' }));
    root.appendChild(field('Respiratory — FiO₂ (%)', 'mm-fio2', { step: '1', min: 0, placeholder: 'e.g. 100' }));
    root.appendChild(field('Renal — serum creatinine (mg/dL)', 'mm-creat', { step: '0.1', min: 0, placeholder: 'e.g. 2.0' }));
    root.appendChild(selectField('Cardiovascular (systolic BP / fluid / pH)', 'mm-cv', [
      { value: '', text: 'Not assessed' },
      { value: '0', text: 'SBP > 90 (0)' },
      { value: '1', text: 'SBP < 90, fluid-responsive (1)' },
      { value: '2', text: 'SBP < 90, not fluid-responsive (2)' },
      { value: '3', text: 'SBP < 90 + pH < 7.3 (3)' },
      { value: '4', text: 'SBP < 90 + pH < 7.2 (4)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['mm-pao2', 'mm-fio2', 'mm-creat', 'mm-cv'], () => safe(o, () => {
      const r = M.modifiedMarshall({ pao2: optNum('mm-pao2'), fio2: optNum('mm-fio2'), creatinine: optNum('mm-creat'), cardiovascular: selVal('mm-cv') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Max organ score', value: `${r.maxScore}/4` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
