// spec-v227 §2: renderers for the closing cross-domain slice — ICBD 2014 and ISG
// 1990 Behcet criteria, BATT, the Denver ED Trauma Organ Failure score, the
// Emergency Transfusion Score, and the WHO 2009 dengue classification. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the transfusion / TXA / treatment
// decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mixed-v227.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The transfusion, TXA, and treatment decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'icbd-2014-behcet'(root) {
    note(root, "ICBD 2014 (Davatchi 2014): ocular 2, oral 2, genital 2, skin 1, neuro 1, vascular 1, pathergy 1. >= 4 = Behcet disease. Near-neighbors: isg-1990-behcet, sledai-2k.");
    const items = [['icbd-eye', 'ocular', 'Ocular lesions (+2)'], ['icbd-oral', 'oral', 'Oral aphthosis (+2)'], ['icbd-gen', 'genital', 'Genital aphthosis (+2)'], ['icbd-skin', 'skin', 'Skin lesions (+1)'], ['icbd-neuro', 'neuro', 'Neurological manifestations (+1)'], ['icbd-vasc', 'vascular', 'Vascular manifestations (+1)'], ['icbd-path', 'pathergy', 'Positive pathergy test (+1)']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.icbdBehcet(inp), 'ICBD', `${M.icbdBehcet(inp).score}`);
    }));
    postureNote(root);
  },
  'isg-1990-behcet'(root) {
    note(root, "ISG 1990: recurrent oral ulceration (mandatory) plus >= 2 of genital ulceration, eye lesions, skin lesions, positive pathergy. Near-neighbors: icbd-2014-behcet, sledai-2k.");
    root.appendChild(check('Recurrent oral ulceration (>= 3 times in 12 months) — mandatory', 'isg-oral'));
    root.appendChild(check('Recurrent genital ulceration', 'isg-gen'));
    root.appendChild(check('Eye lesions (uveitis / retinal vasculitis)', 'isg-eye'));
    root.appendChild(check('Skin lesions (erythema nodosum / pseudofolliculitis / acneiform)', 'isg-skin'));
    root.appendChild(check('Positive pathergy test', 'isg-path'));
    const o = out(); root.appendChild(o);
    wire(['isg-oral', 'isg-gen', 'isg-eye', 'isg-skin', 'isg-path'], () => safe(o, () => {
      const r = M.isgBehcet({ oralUlceration: chk('isg-oral'), genital: chk('isg-gen'), eye: chk('isg-eye'), skin: chk('isg-skin'), pathergy: chk('isg-path') });
      render(o, r, 'ISG', r.meets ? 'meets' : 'does not meet');
    }));
    postureNote(root);
  },
  'batt'(root) {
    note(root, 'BATT score (Ageron 2019): age, SBP, GCS bands + RR/SpO2, HR, penetrating, high-energy (0-27). >= 2 has guided TXA. Near-neighbors: iss-rts, denver-ed-tof.');
    root.appendChild(num('Age (years)', 'batt-age', { min: '0' }));
    root.appendChild(num('Systolic BP (mmHg)', 'batt-sbp', { min: '0' }));
    root.appendChild(num('GCS (3-15)', 'batt-gcs', { min: '3', max: '15' }));
    root.appendChild(check('Respiratory rate < 10 or >= 30, or SpO2 < 90% (+2)', 'batt-rr'));
    root.appendChild(check('Heart rate > 100 (+1)', 'batt-hr'));
    root.appendChild(check('Penetrating injury (+2)', 'batt-pen'));
    root.appendChild(check('High-velocity / high-energy trauma (+2)', 'batt-he'));
    const o = out(); root.appendChild(o);
    wire(['batt-age', 'batt-sbp', 'batt-gcs', 'batt-rr', 'batt-hr', 'batt-pen', 'batt-he'], () => safe(o, () => {
      const r = M.batt({ age: val('batt-age'), sbp: val('batt-sbp'), gcs: val('batt-gcs'), rrAbnormal: chk('batt-rr'), hrHigh: chk('batt-hr'), penetrating: chk('batt-pen'), highEnergy: chk('batt-he') });
      render(o, r, 'BATT', `${r.score}`);
    }));
    postureNote(root);
  },
  'denver-ed-tof'(root) {
    note(root, 'Denver ED Trauma Organ Failure (Vogel 2014): age >= 65, intubation, hematocrit band, SBP < 90, BUN >= 30, WBC >= 20,000. 0-1 low, 2-3 moderate, >= 4 high. Near-neighbors: iss-rts, batt.');
    root.appendChild(num('Hematocrit (%)', 'den-hct', { min: '0', max: '100' }));
    root.appendChild(check('Age >= 65 (+1)', 'den-age'));
    root.appendChild(check('Emergent intubation (prehospital or ED) (+3)', 'den-intub'));
    root.appendChild(check('ED systolic BP < 90 (+1)', 'den-sbp'));
    root.appendChild(check('BUN >= 30 mg/dL (+1)', 'den-bun'));
    root.appendChild(check('WBC >= 20,000/µL (+1)', 'den-wbc'));
    const o = out(); root.appendChild(o);
    wire(['den-hct', 'den-age', 'den-intub', 'den-sbp', 'den-bun', 'den-wbc'], () => safe(o, () => {
      const r = M.denverEdTof({ hematocrit: val('den-hct'), ageOver65: chk('den-age'), intubation: chk('den-intub'), sbpLow: chk('den-sbp'), bunHigh: chk('den-bun'), wbcHigh: chk('den-wbc') });
      render(o, r, 'Denver ED TOF', `${r.score}`);
    }));
    postureNote(root);
  },
  'ets'(root) {
    note(root, 'Emergency Transfusion Score (Ruchholtz 2006): SBP band, free fluid, unstable pelvis, age band, from scene, traffic, fall > 3 m. >= 3 flags need for blood. Near-neighbors: abc-score, denver-ed-tof.');
    root.appendChild(num('Systolic BP (mmHg)', 'ets-sbp', { min: '0' }));
    root.appendChild(num('Age (years)', 'ets-age', { min: '0' }));
    root.appendChild(check('Free intra-abdominal fluid on ultrasound (+2.0)', 'ets-fluid'));
    root.appendChild(check('Unstable pelvic ring (+1.5)', 'ets-pelvis'));
    root.appendChild(check('Admission directly from the scene (+1.0)', 'ets-scene'));
    root.appendChild(check('Traffic accident (+1.0)', 'ets-traffic'));
    root.appendChild(check('Fall from > 3 m (+1.0)', 'ets-fall'));
    const o = out(); root.appendChild(o);
    wire(['ets-sbp', 'ets-age', 'ets-fluid', 'ets-pelvis', 'ets-scene', 'ets-traffic', 'ets-fall'], () => safe(o, () => {
      const r = M.ets({ sbp: val('ets-sbp'), age: val('ets-age'), freeFluid: chk('ets-fluid'), unstablePelvis: chk('ets-pelvis'), fromScene: chk('ets-scene'), traffic: chk('ets-traffic'), fall: chk('ets-fall') });
      render(o, r, 'ETS', `${r.score}`);
    }));
    postureNote(root);
  },
  'who-dengue-2009'(root) {
    note(root, 'WHO 2009 dengue classification: severe dengue, dengue with warning signs, or dengue without warning signs. Near-neighbors: curb-65, qsofa.');
    root.appendChild(el('p', { class: 'muted', text: 'Severity criteria (any -> severe dengue):' }));
    root.appendChild(check('Severe plasma leakage: shock or respiratory distress', 'dg-leak'));
    root.appendChild(check('Severe bleeding', 'dg-bleed'));
    root.appendChild(check('Severe organ impairment (AST/ALT >= 1000, impaired consciousness, or organ involvement)', 'dg-organ'));
    root.appendChild(el('p', { class: 'muted', text: 'Warning signs (>= 1 -> dengue with warning signs):' }));
    root.appendChild(check('Abdominal pain or tenderness', 'dg-abd'));
    root.appendChild(check('Persistent vomiting', 'dg-vom'));
    root.appendChild(check('Clinical fluid accumulation', 'dg-fluid'));
    root.appendChild(check('Mucosal bleeding', 'dg-muc'));
    root.appendChild(check('Lethargy / restlessness', 'dg-leth'));
    root.appendChild(check('Liver enlargement > 2 cm', 'dg-liver'));
    root.appendChild(check('Rise in hematocrit with rapid platelet drop', 'dg-hct'));
    const o = out(); root.appendChild(o);
    const ids = ['dg-leak', 'dg-bleed', 'dg-organ', 'dg-abd', 'dg-vom', 'dg-fluid', 'dg-muc', 'dg-leth', 'dg-liver', 'dg-hct'];
    wire(ids, () => safe(o, () => {
      const r = M.whoDengue({ plasmaLeakage: chk('dg-leak'), severeBleeding: chk('dg-bleed'), organImpairment: chk('dg-organ'), abdominalPain: chk('dg-abd'), vomiting: chk('dg-vom'), fluidAccumulation: chk('dg-fluid'), mucosalBleeding: chk('dg-muc'), lethargy: chk('dg-leth'), liverEnlargement: chk('dg-liver'), hctPlatelet: chk('dg-hct') });
      render(o, r, 'Classification', r.tier);
    }));
    postureNote(root);
  },
};
