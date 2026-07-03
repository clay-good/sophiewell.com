// spec-v218 §2: renderers for the ED / trauma / infection decision instruments —
// FAINT, NEXUS Head CT, HANDOC, DENOVA, 2018 ICM PJI, AIR, and AAS. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the imaging / admission / surgical
// decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ed-decision-v218.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The imaging, admission, and surgical decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  if (r.detail) note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'faint-score'(root) {
    note(root, 'FAINT score (Probst 2020): for ED patients >= 60 y with syncope — heart failure, arrhythmia, abnormal ECG, NT-proBNP (+2), hs-troponin (0-6). Score 0 = low risk; >= 1 = not low risk. Near-neighbors: canadian-syncope, egsys.');
    const items = [['fnt-hf', 'heartFailure', 'History of heart failure (+1)'], ['fnt-arr', 'arrhythmia', 'History of cardiac arrhythmia (+1)'], ['fnt-ecg', 'abnormalEcg', 'Abnormal initial ECG (+1)'], ['fnt-bnp', 'ntprobnp', 'Elevated NT-proBNP (+2)'], ['fnt-trop', 'troponin', 'Elevated hs-troponin (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.faint(inp), 'FAINT', `${M.faint(inp).score}`);
    }));
    postureNote(root);
  },
  'nexus-head-ct'(root) {
    note(root, 'NEXUS Head CT (Mower 2005): CT indicated if ANY of 8 findings present; if all absent, CT can be deferred. Near-neighbors: cthr, canadian-cspine.');
    const items = [['nx-skull', 'skullFracture', 'Signs of significant skull fracture'], ['nx-scalp', 'scalpHematoma', 'Scalp hematoma'], ['nx-deficit', 'neuroDeficit', 'Neurologic deficit'], ['nx-alert', 'alteredAlertness', 'Altered level of alertness'], ['nx-behavior', 'abnormalBehavior', 'Abnormal behavior'], ['nx-coag', 'coagulopathy', 'Coagulopathy'], ['nx-vomit', 'vomiting', 'Persistent vomiting'], ['nx-age', 'ageOver65', 'Age >= 65 years']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      const r = M.nexusHead(inp);
      render(o, r, 'CT', r.ctIndicated ? 'indicated' : 'deferrable');
    }));
    postureNote(root);
  },
  'handoc-score'(root) {
    note(root, 'HANDOC score (Sunnerhagen 2018): in non-beta-hemolytic strep bacteremia — murmur, aetiology, >= 2 cultures, duration >= 7 d, one species, community-acquired (-1 to 6). >= 3 = echo. Near-neighbors: denova-score, duke-endocarditis.');
    root.appendChild(check('Heart murmur or valve disease/prosthesis (+1)', 'hd-murmur'));
    root.appendChild(select('Aetiology (species group)', 'hd-aet', [['0', 'Other species (0)'], ['1', 'S. mutans / bovis / sanguinis group (+1)'], ['2', 'S. anginosus group (-1)']]));
    root.appendChild(check('>= 2 positive blood cultures (+1)', 'hd-cult'));
    root.appendChild(check('Duration of symptoms >= 7 days (+1)', 'hd-dur'));
    root.appendChild(check('Only one species growing (+1)', 'hd-one'));
    root.appendChild(check('Community-acquired infection (+1)', 'hd-comm'));
    const o = out(); root.appendChild(o);
    wire(['hd-murmur', 'hd-aet', 'hd-cult', 'hd-dur', 'hd-one', 'hd-comm'], () => safe(o, () => {
      const r = M.handoc({ murmur: chk('hd-murmur'), aetiology: val('hd-aet'), cultures2: chk('hd-cult'), duration7: chk('hd-dur'), oneSpecies: chk('hd-one'), community: chk('hd-comm') });
      render(o, r, 'HANDOC', `${r.score}`);
    }));
    postureNote(root);
  },
  'denova-score'(root) {
    note(root, 'DENOVA score (Berge 2019): in E. faecalis bacteremia — duration >= 7 d, embolization, >= 2 cultures, origin unknown, valve disease, murmur (0-6). >= 3 = echo. Near-neighbors: handoc-score, duke-endocarditis.');
    const items = [['dn-dur', 'duration7', 'Duration of symptoms >= 7 days (+1)'], ['dn-emb', 'embolization', 'Embolization (+1)'], ['dn-cult', 'cultures2', '>= 2 positive cultures (+1)'], ['dn-origin', 'originUnknown', 'Origin of infection unknown (+1)'], ['dn-valve', 'valveDisease', 'Valve disease (+1)'], ['dn-murmur', 'murmur', 'Auscultated murmur (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.denova(inp), 'DENOVA', `${M.denova(inp).score}`);
    }));
    postureNote(root);
  },
  'icm-pji-2018'(root) {
    note(root, '2018 ICM PJI definition (Parvizi 2018): a major criterion = infected; otherwise sum preop minor criteria. >= 6 infected, 2-5 inconclusive, 0-1 not infected. Near-neighbors: wbc-count, esr.');
    root.appendChild(check('Major criterion: sinus tract OR >= 2 cultures with the same organism', 'icm-major'));
    root.appendChild(check('Serum CRP > 10 mg/L or D-dimer > 860 ng/mL (+2)', 'icm-crp'));
    root.appendChild(check('ESR > 30 mm/h (+1)', 'icm-esr'));
    root.appendChild(check('Synovial WBC > 3000/µL or positive leukocyte esterase (+3)', 'icm-swbc'));
    root.appendChild(check('Positive alpha-defensin (+3)', 'icm-ad'));
    root.appendChild(check('Synovial PMN% > 80% (+2)', 'icm-pmn'));
    root.appendChild(check('Synovial CRP > 6.9 mg/L (+1)', 'icm-scrp'));
    const o = out(); root.appendChild(o);
    wire(['icm-major', 'icm-crp', 'icm-esr', 'icm-swbc', 'icm-ad', 'icm-pmn', 'icm-scrp'], () => safe(o, () => {
      const r = M.icmPji({ major: chk('icm-major'), crpDdimer: chk('icm-crp'), esr: chk('icm-esr'), synovialWbcLe: chk('icm-swbc'), alphaDefensin: chk('icm-ad'), pmn: chk('icm-pmn'), synovialCrp: chk('icm-scrp') });
      render(o, r, 'Result', r.infected ? 'infected' : (r.score !== null && r.score >= 2 ? 'inconclusive' : 'not infected'));
    }));
    postureNote(root);
  },
  'air-score'(root) {
    note(root, 'AIR score (Andersson 2008): vomiting, RIF pain, rebound grade, temp >= 38.5, WBC/PMN/CRP bands (0-12). Low 0-4, indeterminate 5-8, high 9-12. Near-neighbors: alvarado-pas, adult-appendicitis-score.');
    root.appendChild(check('Vomiting (+1)', 'air-vomit'));
    root.appendChild(check('Right-iliac-fossa pain (+1)', 'air-rif'));
    root.appendChild(select('Rebound tenderness / defense', 'air-rebound', [['0', 'None (0)'], ['1', 'Light (1)'], ['2', 'Medium (2)'], ['3', 'Strong (3)']]));
    root.appendChild(check('Temperature >= 38.5 °C (+1)', 'air-fever'));
    root.appendChild(num('WBC (×10⁹/L)', 'air-wbc', { min: '0' }));
    root.appendChild(num('Neutrophil percentage (%)', 'air-pmn', { min: '0', max: '100' }));
    root.appendChild(num('CRP (mg/L)', 'air-crp', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['air-vomit', 'air-rif', 'air-rebound', 'air-fever', 'air-wbc', 'air-pmn', 'air-crp'], () => safe(o, () => {
      const r = M.airScore({ vomiting: chk('air-vomit'), rifPain: chk('air-rif'), rebound: val('air-rebound'), fever: chk('air-fever'), wbc: val('air-wbc'), pmnPct: val('air-pmn'), crp: val('air-crp') });
      render(o, r, 'AIR', `${r.score}`);
    }));
    postureNote(root);
  },
  'adult-appendicitis-score'(root) {
    note(root, 'Adult Appendicitis Score (Sammalkorpi 2014): RLQ pain/relocation/tenderness, guarding, WBC/PMN/CRP bands (CRP depends on symptom duration). Low 0-10, intermediate 11-15, high >= 16. Near-neighbors: air-score, alvarado-pas.');
    root.appendChild(check('Pain in right lower quadrant (+2)', 'aas-rlq'));
    root.appendChild(check('Migration/relocation of pain to RLQ (+2)', 'aas-reloc'));
    root.appendChild(check('RLQ tenderness present', 'aas-tender'));
    root.appendChild(check('Female sex (16-49 years scores tenderness lower)', 'aas-female'));
    root.appendChild(num('Age (years)', 'aas-age', { min: '0' }));
    root.appendChild(select('Guarding', 'aas-guard', [['0', 'None (0)'], ['2', 'Mild (2)'], ['4', 'Moderate or severe (4)']]));
    root.appendChild(num('WBC (×10⁹/L)', 'aas-wbc', { min: '0' }));
    root.appendChild(num('Neutrophil percentage (%)', 'aas-pmn', { min: '0', max: '100' }));
    root.appendChild(num('CRP (mg/L)', 'aas-crp', { min: '0' }));
    root.appendChild(check('Symptom duration >= 24 hours', 'aas-dur'));
    const o = out(); root.appendChild(o);
    wire(['aas-rlq', 'aas-reloc', 'aas-tender', 'aas-female', 'aas-age', 'aas-guard', 'aas-wbc', 'aas-pmn', 'aas-crp', 'aas-dur'], () => safe(o, () => {
      const r = M.adultAppendicitis({ rlqPain: chk('aas-rlq'), relocation: chk('aas-reloc'), tenderness: chk('aas-tender'), female: chk('aas-female'), age: val('aas-age'), guarding: val('aas-guard'), wbc: val('aas-wbc'), pmnPct: val('aas-pmn'), crp: val('aas-crp'), durationOver24h: chk('aas-dur') });
      render(o, r, 'AAS', `${r.score}`);
    }));
    postureNote(root);
  },
};
