// spec-v198 §2: renderers for the five cross-specialty prognostic / diagnostic
// tiles — CNS-IPI, ISTH-BAT, VIRSTA, SeLECT, and the WHO/FIGO GTN score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the prophylaxis / imaging / treatment
// / chemotherapy decision to the specialist and patient (spec-v11 §5.3) — these
// stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/subspecialty-v198.js';
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
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
}
function scoreField(label, id) {
  return field(label, id, { type: 'number', min: '0', max: '4', step: '1', inputmode: 'numeric', value: '0' });
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The CNS-prophylaxis, echocardiography, bleeding-workup, anti-seizure, and chemotherapy-regimen decisions stay with the specialist and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ISTHBAT_UI = [
  ['epistaxis', 'Epistaxis'], ['cutaneous', 'Cutaneous / bruising'], ['minorWounds', 'Bleeding from minor wounds'],
  ['oralCavity', 'Oral cavity'], ['gi', 'GI bleeding'], ['hematuria', 'Hematuria'],
  ['toothExtraction', 'Tooth extraction'], ['surgery', 'Surgery'], ['menorrhagia', 'Menorrhagia (female)'],
  ['postpartum', 'Postpartum hemorrhage (female)'], ['muscleHematoma', 'Muscle hematoma'], ['hemarthrosis', 'Hemarthrosis'],
  ['cns', 'CNS bleeding (0, 3, or 4)'], ['other', 'Other bleeding'],
];

export const renderers = {
  // ----- 2.1 cns-ipi ---------------------------------------------------------
  'cns-ipi'(root) {
    note(root, 'CNS International Prognostic Index (Schmitz 2016): six factors, 1 point each → 0–6; low 0–1 (~0.6%), intermediate 2–3 (~3.4%), high 4–6 (~10.2%) 2-year CNS relapse. Near-neighbors: nccn-ipi, r-ipi, ann-arbor.');
    root.appendChild(checkField('Age > 60 years', 'cnsipi-age'));
    root.appendChild(checkField('LDH > normal', 'cnsipi-ldh'));
    root.appendChild(checkField('ECOG performance status > 1', 'cnsipi-ecog'));
    root.appendChild(checkField('Ann Arbor stage III/IV', 'cnsipi-stage'));
    root.appendChild(checkField('> 1 extranodal site', 'cnsipi-extranodal'));
    root.appendChild(checkField('Kidney and/or adrenal involvement', 'cnsipi-kidney'));
    const o = out(); root.appendChild(o);
    wire(['cnsipi-age', 'cnsipi-ldh', 'cnsipi-ecog', 'cnsipi-stage', 'cnsipi-extranodal', 'cnsipi-kidney'], () => safe(o, () => {
      const r = M.cnsIpi({ age: chk('cnsipi-age'), ldh: chk('cnsipi-ldh'), ecog: chk('cnsipi-ecog'), stage: chk('cnsipi-stage'), extranodal: chk('cnsipi-extranodal'), kidneyAdrenal: chk('cnsipi-kidney') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 isth-bat --------------------------------------------------------
  'isth-bat'(root) {
    note(root, 'ISTH bleeding assessment tool (Rodeghiero 2010; thresholds Elbatarny 2014): 14 domains scored 0 to +4. Abnormal ≥ 4 (adult male), ≥ 6 (adult female), ≥ 3 (child). Near-neighbors: four-ts, plasmic-ttp.');
    root.appendChild(pickField('Patient group', 'isth-group', [
      { value: 'male', text: 'Adult male (abnormal ≥ 4)' },
      { value: 'female', text: 'Adult female (abnormal ≥ 6)' },
      { value: 'child', text: 'Child (abnormal ≥ 3)' },
    ]));
    for (const [key, label] of ISTHBAT_UI) root.appendChild(scoreField(label, 'isth-' + key));
    const o = out(); root.appendChild(o);
    const ids = ['isth-group', ...ISTHBAT_UI.map(([k]) => 'isth-' + k)];
    wire(ids, () => safe(o, () => {
      const payload = { group: val('isth-group') };
      for (const [key] of ISTHBAT_UI) payload[key] = val('isth-' + key);
      const r = M.isthBat(payload);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Total', value: `${r.total}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 virsta ----------------------------------------------------------
  virsta(root) {
    note(root, 'VIRSTA score for IE risk in S. aureus bacteremia (Tubiana 2016): weighted items → ≤ 2 low (IE ~1%, NPV ~99%; echo deferrable), ≥ 3 higher (~17%; echo recommended). Near-neighbors: duke-endocarditis, pitt-bacteremia.');
    root.appendChild(checkField('Cerebral / peripheral emboli (+5)', 'virsta-emboli'));
    root.appendChild(checkField('Meningitis (+5)', 'virsta-meningitis'));
    root.appendChild(checkField('Intracardiac device or previous IE (+4)', 'virsta-device'));
    root.appendChild(checkField('IV drug use (+4)', 'virsta-ivdu'));
    root.appendChild(checkField('Preexisting native valve disease (+3)', 'virsta-valve'));
    root.appendChild(checkField('Persistent bacteremia (+3)', 'virsta-persistent'));
    root.appendChild(checkField('Vertebral osteomyelitis (+2)', 'virsta-vertebral'));
    root.appendChild(checkField('Community / non-nosocomial acquisition (+2)', 'virsta-community'));
    root.appendChild(checkField('Severe sepsis / septic shock (+1)', 'virsta-sepsis'));
    root.appendChild(checkField('CRP > 190 mg/L (+1)', 'virsta-crp'));
    const o = out(); root.appendChild(o);
    const ids = ['virsta-emboli', 'virsta-meningitis', 'virsta-device', 'virsta-ivdu', 'virsta-valve', 'virsta-persistent', 'virsta-vertebral', 'virsta-community', 'virsta-sepsis', 'virsta-crp'];
    wire(ids, () => safe(o, () => {
      const r = M.virsta({ emboli: chk('virsta-emboli'), meningitis: chk('virsta-meningitis'), device: chk('virsta-device'), ivdu: chk('virsta-ivdu'), valve: chk('virsta-valve'), persistent: chk('virsta-persistent'), vertebral: chk('virsta-vertebral'), community: chk('virsta-community'), sepsis: chk('virsta-sepsis'), crp: chk('virsta-crp') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 select-pse ------------------------------------------------------
  'select-pse'(root) {
    note(root, 'SeLECT score for late post-stroke epilepsy (Galovic 2018): Severity + Large-artery atherosclerosis + Early seizure + Cortical + Territory → 0–9, mapped to 1-year and 5-year late-seizure risk. Near-neighbors: nihss, stess.');
    root.appendChild(pickField('Stroke severity (NIHSS)', 'select-nihss', [
      { value: '0-3', text: '0–3 (0 points)' },
      { value: '4-10', text: '4–10 (1 point)' },
      { value: '11+', text: '≥ 11 (2 points)' },
    ]));
    root.appendChild(checkField('Large-artery atherosclerotic etiology (+1)', 'select-laa'));
    root.appendChild(checkField('Early seizure ≤ 7 days (+3)', 'select-early'));
    root.appendChild(checkField('Cortical involvement (+2)', 'select-cortical'));
    root.appendChild(checkField('MCA territory (+1)', 'select-territory'));
    const o = out(); root.appendChild(o);
    wire(['select-nihss', 'select-laa', 'select-early', 'select-cortical', 'select-territory'], () => safe(o, () => {
      const r = M.selectPse({ nihss: val('select-nihss'), laa: chk('select-laa'), early: chk('select-early'), cortical: chk('select-cortical'), territory: chk('select-territory') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }, { label: '1-yr', value: `${r.risk1}%` }, { label: '5-yr', value: `${r.risk5}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 figo-gtn --------------------------------------------------------
  'figo-gtn'(root) {
    note(root, 'WHO/FIGO prognostic score for gestational trophoblastic neoplasia (FIGO 2000): eight factors scored 0/1/2/4; ≤ 6 low (single-agent), ≥ 7 high (multi-agent). Near-neighbors: robson.');
    root.appendChild(num('Age (years)', 'figo-age'));
    root.appendChild(pickField('Antecedent pregnancy', 'figo-antecedent', [
      { value: 'mole', text: 'Mole (0)' }, { value: 'abortion', text: 'Abortion (1)' }, { value: 'term', text: 'Term pregnancy (2)' },
    ]));
    root.appendChild(num('Interval from index pregnancy (months)', 'figo-interval'));
    root.appendChild(num('Pretreatment hCG (IU/L)', 'figo-hcg'));
    root.appendChild(num('Largest tumor size incl. uterus (cm)', 'figo-size'));
    root.appendChild(pickField('Site of metastases', 'figo-site', [
      { value: 'lung', text: 'Lung / none (0)' }, { value: 'spleenkidney', text: 'Spleen, kidney (1)' },
      { value: 'gi', text: 'Gastrointestinal (2)' }, { value: 'liverbrain', text: 'Liver, brain (4)' },
    ]));
    root.appendChild(num('Number of metastases', 'figo-mets'));
    root.appendChild(pickField('Previous failed chemotherapy', 'figo-chemo', [
      { value: 'none', text: 'None (0)' }, { value: 'single', text: 'Single drug (2)' }, { value: 'multi', text: '≥ 2 drugs (4)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['figo-age', 'figo-antecedent', 'figo-interval', 'figo-hcg', 'figo-size', 'figo-site', 'figo-mets', 'figo-chemo'], () => safe(o, () => {
      const r = M.figoGtn({ age: val('figo-age'), antecedent: val('figo-antecedent'), interval: val('figo-interval'), hcg: val('figo-hcg'), size: val('figo-size'), site: val('figo-site'), mets: val('figo-mets'), priorChemo: val('figo-chemo') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
