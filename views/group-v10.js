// spec-v58: renderers for the 12 neonatal / maternal / pediatric-and-adult ICU
// bedside scores. Same input/render pattern as the rest of the codebase: every
// input has a real <label for> (a11y-check passes), no innerHTML, no network,
// no storage. Nullable numeric outputs route through fmt() (spec-v53 §3.2). The
// higher-is-worse neonatal scores (silverman-andersen, downes, finnegan) and
// the lower-is-worse braden-q state their direction explicitly; the age-banded
// tiles (bhutani-bilirubin, pelod2, psofa) show the active band.

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as S from '../lib/scoring-v6.js';
import * as C8 from '../lib/clinical-v8.js';
import { META } from '../lib/meta.js';
import { renderDerivation, updateDerivationSteps } from '../lib/derivation.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
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
// min..max integer select with a short prompt label.
function rangeField(label, id, min, max) {
  const opts = [];
  for (let i = min; i <= max; i += 1) opts.push({ value: String(i), text: String(i) });
  return selectField(label, id, opts);
}
// select over explicit {value, text} point options (weighted criteria).
function pointField(label, id, options) { return selectField(label, id, options); }
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { return Number(document.getElementById(id).value); }
function chk(id) { return document.getElementById(id).checked; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function list(items) { return el('ul', {}, items.filter(Boolean)); }
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
function note(root, text) { root.appendChild(el('p', { class: 'muted', text })); }
function screenerNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a diagnosis or order. Interpret with the full clinical picture and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

// Finnegan binary signs (the graded ones — sleep/fever/respRate — are selects).
const FINNEGAN_BINARY = [
  ['highPitchedCry', 'Excessive high-pitched cry (2)'],
  ['continuousCry', 'Continuous high-pitched cry (3)'],
  ['moro', 'Hyperactive Moro reflex (2)'],
  ['markedMoro', 'Markedly hyperactive Moro (3)'],
  ['tremorsDisturbed', 'Mild tremors when disturbed (1)'],
  ['markedTremorsDisturbed', 'Marked tremors when disturbed (2)'],
  ['tremorsUndisturbed', 'Mild tremors undisturbed (3)'],
  ['markedTremorsUndisturbed', 'Marked tremors undisturbed (4)'],
  ['increasedTone', 'Increased muscle tone (2)'],
  ['excoriation', 'Excoriation of skin (1)'],
  ['myoclonus', 'Myoclonic jerks (3)'],
  ['convulsions', 'Generalized convulsions (5)'],
  ['sweating', 'Sweating (1)'],
  ['yawning', 'Frequent yawning (1)'],
  ['mottling', 'Mottling (1)'],
  ['nasalStuffiness', 'Nasal stuffiness (1)'],
  ['sneezing', 'Sneezing (1)'],
  ['nasalFlaring', 'Nasal flaring (2)'],
  ['excessiveSucking', 'Excessive sucking (1)'],
  ['poorFeeding', 'Poor feeding (2)'],
  ['regurgitation', 'Regurgitation (2)'],
  ['projectileVomiting', 'Projectile vomiting (3)'],
  ['looseStools', 'Loose stools (2)'],
  ['wateryStools', 'Watery stools (3)'],
];

export const renderers = {
  // ----- 2.1 ballard -----------------------------------------------------
  ballard(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Score each criterion -1 to +5 per the New Ballard maturity chart.' }));
    const nm = ['Posture', 'Square window (wrist)', 'Arm recoil', 'Popliteal angle', 'Scarf sign', 'Heel to ear'];
    const ph = ['Skin', 'Lanugo', 'Plantar surface', 'Breast', 'Eye / ear', 'Genitals'];
    root.appendChild(el('p', { class: 'muted', text: 'Neuromuscular maturity' }));
    nm.forEach((l, i) => root.appendChild(rangeField(l, `bl-n${i + 1}`, -1, 5)));
    root.appendChild(el('p', { class: 'muted', text: 'Physical maturity' }));
    ph.forEach((l, i) => root.appendChild(rangeField(l, `bl-p${i + 1}`, -1, 5)));
    const o = out(); root.appendChild(o);
    const ids = [];
    for (let i = 1; i <= 6; i += 1) { ids.push(`bl-n${i}`, `bl-p${i}`); }
    wire(ids, () => safe(o, () => {
      const r = S.ballard({
        neuromuscular: [1, 2, 3, 4, 5, 6].map((i) => val(`bl-n${i}`)),
        physical: [1, 2, 3, 4, 5, 6].map((i) => val(`bl-p${i}`)),
      });
      o.appendChild(list([
        li(`Maturity score: ${fmt(r.score)}`),
        li(`Estimated gestational age: ${fmt(r.gaWeeks, { digits: 1, unit: 'weeks' })} (+/-2)`),
      ]));
      note(o, r.note);
    }));
    screenerNote(root);
  },

  // ----- 2.2 finnegan ----------------------------------------------------
  finnegan(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Score the full interval. Higher = worse (the inverse of APGAR).' }));
    for (const [key, label] of FINNEGAN_BINARY) root.appendChild(checkField(label, `fn-${key}`));
    root.appendChild(rangeField('Sleeps after feeding: <3 h (1) / <2 h (2) / <1 h (3)', 'fn-sleep', 0, 3));
    root.appendChild(rangeField('Fever: 37.2-38.3 C (1) / >38.3 C (2)', 'fn-fever', 0, 2));
    root.appendChild(rangeField('Respiratory rate: >60 (1) / >60 with retractions (2)', 'fn-respRate', 0, 2));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.finnegan);
    if (deriv) root.appendChild(deriv);
    const ids = FINNEGAN_BINARY.map(([k]) => `fn-${k}`).concat(['fn-sleep', 'fn-fever', 'fn-respRate']);
    wire(ids, () => safe(o, () => {
      const signs = {};
      for (const [key] of FINNEGAN_BINARY) signs[key] = chk(`fn-${key}`);
      signs.sleep = val('fn-sleep'); signs.fever = val('fn-fever'); signs.respRate = val('fn-respRate');
      const r = S.finnegan(signs);
      o.appendChild(list([
        li(`Total NAS score: ${fmt(r.total)}`, r.total >= 8 ? 'warn' : null),
        li(r.band, r.total >= 8 ? 'warn' : null),
      ]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META.finnegan, signs);
    }));
    screenerNote(root);
  },

  // ----- 2.3 silverman-andersen ------------------------------------------
  'silverman-andersen'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Score each sign 0-2. Higher = worse (the inverse of APGAR).' }));
    root.appendChild(rangeField('Upper-chest / abdomen movement (synchrony)', 'sa-chest', 0, 2));
    root.appendChild(rangeField('Intercostal retraction', 'sa-intercostal', 0, 2));
    root.appendChild(rangeField('Xiphoid retraction', 'sa-xiphoid', 0, 2));
    root.appendChild(rangeField('Nares dilatation', 'sa-nares', 0, 2));
    root.appendChild(rangeField('Expiratory grunt', 'sa-grunt', 0, 2));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['silverman-andersen']);
    if (deriv) root.appendChild(deriv);
    wire(['sa-chest', 'sa-intercostal', 'sa-xiphoid', 'sa-nares', 'sa-grunt'], () => safe(o, () => {
      const inputs = {
        chestMovement: val('sa-chest'), intercostal: val('sa-intercostal'), xiphoid: val('sa-xiphoid'),
        naresDilatation: val('sa-nares'), grunt: val('sa-grunt'),
      };
      const r = S.silvermanAndersen(inputs);
      o.appendChild(list([li(`Total: ${fmt(r.total)} / 10`), li(r.band)]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META['silverman-andersen'], inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.4 downes ------------------------------------------------------
  downes(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Score each parameter 0-2. Higher = worse.' }));
    root.appendChild(rangeField('Respiratory rate', 'dn-rr', 0, 2));
    root.appendChild(rangeField('Cyanosis', 'dn-cyanosis', 0, 2));
    root.appendChild(rangeField('Air entry', 'dn-airentry', 0, 2));
    root.appendChild(rangeField('Grunting', 'dn-grunting', 0, 2));
    root.appendChild(rangeField('Retractions', 'dn-retractions', 0, 2));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.downes);
    if (deriv) root.appendChild(deriv);
    wire(['dn-rr', 'dn-cyanosis', 'dn-airentry', 'dn-grunting', 'dn-retractions'], () => safe(o, () => {
      const inputs = {
        respiratoryRate: val('dn-rr'), cyanosis: val('dn-cyanosis'), airEntry: val('dn-airentry'),
        grunting: val('dn-grunting'), retractions: val('dn-retractions'),
      };
      const r = S.downes(inputs);
      o.appendChild(list([li(`Total: ${fmt(r.total)} / 10`), li(r.band)]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META.downes, inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.5 bhutani-bilirubin -------------------------------------------
  'bhutani-bilirubin'(root) {
    root.appendChild(field('Age (hours)', 'bb-hours', { placeholder: 'e.g. 48' }));
    root.appendChild(field('Total serum bilirubin (mg/dL)', 'bb-tsb', { placeholder: 'e.g. 14' }));
    root.appendChild(field('Gestational age (weeks, 35-44)', 'bb-ga', { placeholder: 'e.g. 38' }));
    root.appendChild(checkField('Neurotoxicity risk factor(s) present', 'bb-risk'));
    const o = out(); root.appendChild(o);
    wire(['bb-hours', 'bb-tsb', 'bb-ga', 'bb-risk'], () => safe(o, () => {
      const r = S.bhutaniBilirubin({
        ageHours: val('bb-hours'), tsb: val('bb-tsb'), gaWeeks: val('bb-ga'), riskFactors: chk('bb-risk'),
      });
      o.appendChild(list([
        li(`Bhutani zone: ${r.zone}`, r.abovePhoto ? 'warn' : null),
        li(`Hour-specific tracks: 40th ${fmt(r.p40)}, 75th ${fmt(r.p75)}, 95th ${fmt(r.p95)} mg/dL`),
        li(r.photoBand, r.abovePhoto ? 'warn' : null),
      ]));
      note(o, r.note);
    }));
    screenerNote(root);
  },

  // ----- 2.6 qbl-pph -----------------------------------------------------
  'qbl-pph'(root) {
    root.appendChild(field('Measured / collected blood (mL)', 'qp-measured', { placeholder: 'e.g. 300' }));
    root.appendChild(field('Weighed pads/drapes (g)', 'qp-pad', { placeholder: 'e.g. 900' }));
    root.appendChild(field('Dry-pad + irrigation tare (g)', 'qp-tare', { placeholder: 'e.g. 100' }));
    root.appendChild(checkField('Vaginal birth', 'qp-vaginal'));
    root.appendChild(checkField('Hemodynamic instability', 'qp-unstable'));
    root.appendChild(rangeField('CMQCC admission risk factors (count)', 'qp-risk', 0, 6));
    const o = out(); root.appendChild(o);
    wire(['qp-measured', 'qp-pad', 'qp-tare', 'qp-vaginal', 'qp-unstable', 'qp-risk'], () => safe(o, () => {
      const r = S.qblPph({
        measuredMl: val('qp-measured') || 0, padGrams: val('qp-pad') || 0, dryTareGrams: val('qp-tare') || 0,
        vaginal: chk('qp-vaginal'), unstable: chk('qp-unstable'), riskFactors: val('qp-risk') || 0,
      });
      o.appendChild(list([
        li(`Quantitative blood loss: ${fmt(r.qbl, { unit: 'mL' })}`, r.pphFlag ? 'warn' : null),
        li(r.pphBand, r.pphFlag ? 'warn' : null),
        li(`Risk tier: ${r.tier}`),
      ]));
      note(o, r.note);
    }));
    screenerNote(root);
  },

  // ----- 2.7 pelod2 ------------------------------------------------------
  pelod2(root) {
    root.appendChild(el('p', { class: 'muted', text: 'MAP and creatinine cutoffs are applied automatically from the entered age.' }));
    root.appendChild(field('Age (months)', 'p2-age', { placeholder: 'e.g. 24' }));
    root.appendChild(field('Glasgow Coma Scale (3-15)', 'p2-gcs', { placeholder: 'e.g. 12' }));
    root.appendChild(checkField('Both pupils fixed', 'p2-pupils'));
    root.appendChild(field('Lactate (mmol/L)', 'p2-lactate', { placeholder: 'e.g. 6' }));
    root.appendChild(field('Mean arterial pressure (mmHg)', 'p2-map', { placeholder: 'e.g. 50' }));
    root.appendChild(field('Creatinine (umol/L)', 'p2-creat', { placeholder: 'e.g. 60' }));
    root.appendChild(field('PaO2/FiO2 (mmHg)', 'p2-pf', { placeholder: 'e.g. 300' }));
    root.appendChild(field('PaCO2 (mmHg)', 'p2-paco2', { placeholder: 'e.g. 40' }));
    root.appendChild(checkField('Invasive ventilation', 'p2-vent'));
    root.appendChild(field('WBC (x10^3/uL)', 'p2-wbc', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Platelets (x10^3/uL)', 'p2-plt', { placeholder: 'e.g. 100' }));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.pelod2);
    if (deriv) root.appendChild(deriv);
    const ids = ['p2-age', 'p2-gcs', 'p2-pupils', 'p2-lactate', 'p2-map', 'p2-creat', 'p2-pf', 'p2-paco2', 'p2-vent', 'p2-wbc', 'p2-plt'];
    wire(ids, () => safe(o, () => {
      const inputs = {
        ageMonths: val('p2-age'), gcs: val('p2-gcs'), pupilsFixed: chk('p2-pupils'), lactate: val('p2-lactate'),
        map: val('p2-map'), creatinine: val('p2-creat'), pao2fio2: val('p2-pf'), paco2: val('p2-paco2'),
        invasiveVent: chk('p2-vent'), wbc: val('p2-wbc'), platelets: val('p2-plt'),
      };
      const r = S.pelod2(inputs);
      o.appendChild(list([
        li(`PELOD-2 score: ${fmt(r.score)} / 33`),
        li(`Active age band: ${r.activeBand}`),
      ]));
      o.appendChild(list(r.parts.map(([label, pts]) => li(`${label}: ${pts}`))));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META.pelod2, inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.8 psofa -------------------------------------------------------
  psofa(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Cardiovascular and renal cutoffs are applied automatically from the entered age.' }));
    root.appendChild(field('Age (months)', 'ps-age', { placeholder: 'e.g. 24' }));
    root.appendChild(field('PaO2/FiO2 (mmHg)', 'ps-pf', { placeholder: 'e.g. 250' }));
    root.appendChild(checkField('Mechanically ventilated', 'ps-vent'));
    root.appendChild(field('Platelets (x10^3/uL)', 'ps-plt', { placeholder: 'e.g. 120' }));
    root.appendChild(field('Bilirubin (mg/dL)', 'ps-bili', { placeholder: 'e.g. 1.5' }));
    root.appendChild(field('Mean arterial pressure (mmHg)', 'ps-map', { placeholder: 'e.g. 50' }));
    root.appendChild(rangeField('Vasoactive grade (0 none .. 4 high-dose)', 'ps-vaso', 0, 4));
    root.appendChild(field('Glasgow Coma Scale (3-15)', 'ps-gcs', { placeholder: 'e.g. 13' }));
    root.appendChild(field('Creatinine (mg/dL)', 'ps-creat', { placeholder: 'e.g. 0.7' }));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.psofa);
    if (deriv) root.appendChild(deriv);
    const ids = ['ps-age', 'ps-pf', 'ps-vent', 'ps-plt', 'ps-bili', 'ps-map', 'ps-vaso', 'ps-gcs', 'ps-creat'];
    wire(ids, () => safe(o, () => {
      const inputs = {
        ageMonths: val('ps-age'), pao2fio2: val('ps-pf'), vent: chk('ps-vent'), platelets: val('ps-plt'),
        bilirubin: val('ps-bili'), map: val('ps-map'), vasoactive: val('ps-vaso'), gcs: val('ps-gcs'), creatinine: val('ps-creat'),
      };
      const r = S.psofa(inputs);
      o.appendChild(list([
        li(`pSOFA: ${fmt(r.score)} / 24`),
        li(`Active age band: ${r.activeBand}`),
      ]));
      o.appendChild(list(r.parts.map(([label, pts]) => li(`${label}: ${pts}`))));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META.psofa, inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.9 burch-wartofsky ---------------------------------------------
  'burch-wartofsky'(root) {
    root.appendChild(pointField('Temperature (C)', 'bw-temp', [
      { value: '0', text: '<37.2 (0)' }, { value: '5', text: '37.2-37.7 (5)' }, { value: '10', text: '37.8-38.2 (10)' },
      { value: '15', text: '38.3-38.8 (15)' }, { value: '20', text: '38.9-39.4 (20)' }, { value: '25', text: '39.4-39.9 (25)' }, { value: '30', text: '>=40 (30)' },
    ]));
    root.appendChild(pointField('CNS effects', 'bw-cns', [
      { value: '0', text: 'Absent (0)' }, { value: '10', text: 'Mild agitation (10)' }, { value: '20', text: 'Delirium/psychosis/lethargy (20)' }, { value: '30', text: 'Seizure/coma (30)' },
    ]));
    root.appendChild(pointField('GI-hepatic dysfunction', 'bw-gi', [
      { value: '0', text: 'Absent (0)' }, { value: '10', text: 'Diarrhea/nausea/vomiting/abd pain (10)' }, { value: '20', text: 'Unexplained jaundice (20)' },
    ]));
    root.appendChild(pointField('Tachycardia (bpm)', 'bw-hr', [
      { value: '0', text: '<90 (0)' }, { value: '5', text: '90-109 (5)' }, { value: '10', text: '110-119 (10)' },
      { value: '15', text: '120-129 (15)' }, { value: '20', text: '130-139 (20)' }, { value: '25', text: '>=140 (25)' },
    ]));
    root.appendChild(pointField('Congestive heart failure', 'bw-chf', [
      { value: '0', text: 'Absent (0)' }, { value: '5', text: 'Mild/pedal edema (5)' }, { value: '10', text: 'Moderate/bibasilar rales (10)' }, { value: '15', text: 'Severe/pulmonary edema (15)' },
    ]));
    root.appendChild(checkField('Atrial fibrillation (10)', 'bw-afib'));
    root.appendChild(checkField('Precipitant history (10)', 'bw-precip'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['burch-wartofsky']);
    if (deriv) root.appendChild(deriv);
    wire(['bw-temp', 'bw-cns', 'bw-gi', 'bw-hr', 'bw-chf', 'bw-afib', 'bw-precip'], () => safe(o, () => {
      const inputs = {
        temp: val('bw-temp'), cns: val('bw-cns'), gi: val('bw-gi'), hr: val('bw-hr'), chf: val('bw-chf'),
        afib: chk('bw-afib'), precipitant: chk('bw-precip'),
      };
      const r = S.burchWartofsky(inputs);
      o.appendChild(list([li(`Total: ${fmt(r.total)}`, r.total >= 45 ? 'warn' : null), li(r.band, r.total >= 45 ? 'warn' : null)]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META['burch-wartofsky'], inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.10 ariscat ----------------------------------------------------
  ariscat(root) {
    root.appendChild(pointField('Age', 'ar-age', [
      { value: '0', text: '<=50 (0)' }, { value: '3', text: '51-80 (3)' }, { value: '16', text: '>80 (16)' },
    ]));
    root.appendChild(pointField('Preoperative SpO2 (%)', 'ar-spo2', [
      { value: '0', text: '>=96 (0)' }, { value: '8', text: '91-95 (8)' }, { value: '24', text: '<=90 (24)' },
    ]));
    root.appendChild(pointField('Surgical incision', 'ar-incision', [
      { value: '0', text: 'Peripheral (0)' }, { value: '15', text: 'Upper abdominal (15)' }, { value: '24', text: 'Intrathoracic (24)' },
    ]));
    root.appendChild(pointField('Surgery duration', 'ar-duration', [
      { value: '0', text: '<2 h (0)' }, { value: '16', text: '2-3 h (16)' }, { value: '23', text: '>3 h (23)' },
    ]));
    root.appendChild(checkField('Respiratory infection in the last month (17)', 'ar-infection'));
    root.appendChild(checkField('Preoperative anemia (Hb <=10 g/dL) (11)', 'ar-anemia'));
    root.appendChild(checkField('Emergency procedure (8)', 'ar-emergency'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.ariscat);
    if (deriv) root.appendChild(deriv);
    wire(['ar-age', 'ar-spo2', 'ar-incision', 'ar-duration', 'ar-infection', 'ar-anemia', 'ar-emergency'], () => safe(o, () => {
      const inputs = {
        agePts: val('ar-age'), spo2Pts: val('ar-spo2'), incisionPts: val('ar-incision'), durationPts: val('ar-duration'),
        respInfection: chk('ar-infection'), anemia: chk('ar-anemia'), emergency: chk('ar-emergency'),
      };
      const r = S.ariscat(inputs);
      o.appendChild(list([li(`Total: ${fmt(r.total)}`, r.total >= 45 ? 'warn' : null), li(r.band, r.total >= 26 ? 'warn' : null)]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META.ariscat, inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.11 apache2 ----------------------------------------------------
  apache2(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Enter the worst value in the first 24 ICU hours for each variable.' }));
    root.appendChild(field('Temperature (C)', 'ap-temp', { placeholder: 'e.g. 39' }));
    root.appendChild(field('Mean arterial pressure (mmHg)', 'ap-map', { placeholder: 'e.g. 60' }));
    root.appendChild(field('Heart rate (bpm)', 'ap-hr', { placeholder: 'e.g. 120' }));
    root.appendChild(field('Respiratory rate (/min)', 'ap-rr', { placeholder: 'e.g. 30' }));
    root.appendChild(field('Oxygenation: PaO2 (mmHg)', 'ap-oxy', { placeholder: 'e.g. 65' }));
    root.appendChild(field('Arterial pH', 'ap-ph', { placeholder: 'e.g. 7.3' }));
    root.appendChild(field('Serum sodium (mmol/L)', 'ap-na', { placeholder: 'e.g. 150' }));
    root.appendChild(field('Serum potassium (mmol/L)', 'ap-k', { placeholder: 'e.g. 5.6' }));
    root.appendChild(field('Serum creatinine (mg/dL)', 'ap-creat', { placeholder: 'e.g. 2' }));
    root.appendChild(field('Hematocrit (%)', 'ap-hct', { placeholder: 'e.g. 48' }));
    root.appendChild(field('WBC (x10^3/uL)', 'ap-wbc', { placeholder: 'e.g. 18' }));
    root.appendChild(field('Glasgow Coma Scale (3-15)', 'ap-gcs', { placeholder: 'e.g. 13' }));
    root.appendChild(field('Age (years)', 'ap-age', { placeholder: 'e.g. 60' }));
    root.appendChild(checkField('Severe chronic-organ insufficiency / immunocompromise', 'ap-chronic'));
    root.appendChild(checkField('Nonoperative or emergency postoperative admission', 'ap-nonop'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META.apache2);
    if (deriv) root.appendChild(deriv);
    const ids = ['ap-temp', 'ap-map', 'ap-hr', 'ap-rr', 'ap-oxy', 'ap-ph', 'ap-na', 'ap-k', 'ap-creat', 'ap-hct', 'ap-wbc', 'ap-gcs', 'ap-age', 'ap-chronic', 'ap-nonop'];
    wire(ids, () => safe(o, () => {
      const inputs = {
        temp: val('ap-temp'), map: val('ap-map'), hr: val('ap-hr'), rr: val('ap-rr'), oxy: val('ap-oxy'),
        ph: val('ap-ph'), na: val('ap-na'), k: val('ap-k'), creatinine: val('ap-creat'), hct: val('ap-hct'),
        wbc: val('ap-wbc'), gcs: val('ap-gcs'), age: val('ap-age'),
        chronicHealth: chk('ap-chronic'), nonoperativeOrEmergency: chk('ap-nonop'),
      };
      const r = S.apache2(inputs);
      o.appendChild(list([
        li(`APACHE II: ${fmt(r.total)} / 71`),
        li(`Acute physiology ${r.aps} + age ${r.agePts} + chronic health ${r.chronicPts}`),
        li(r.band),
      ]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META.apache2, inputs);
    }));
    screenerNote(root);
  },

  // ----- 2.12 braden-q ---------------------------------------------------
  'braden-q'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Score each subscale 1-4. Lower = higher risk (the inverse of most scores).' }));
    root.appendChild(rangeField('Mobility', 'bq-mobility', 1, 4));
    root.appendChild(rangeField('Activity', 'bq-activity', 1, 4));
    root.appendChild(rangeField('Sensory perception', 'bq-sensory', 1, 4));
    root.appendChild(rangeField('Moisture', 'bq-moisture', 1, 4));
    root.appendChild(rangeField('Friction / shear', 'bq-friction', 1, 4));
    root.appendChild(rangeField('Nutrition', 'bq-nutrition', 1, 4));
    root.appendChild(rangeField('Tissue perfusion / oxygenation', 'bq-perfusion', 1, 4));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['braden-q']);
    if (deriv) root.appendChild(deriv);
    const ids = ['bq-mobility', 'bq-activity', 'bq-sensory', 'bq-moisture', 'bq-friction', 'bq-nutrition', 'bq-perfusion'];
    wire(ids, () => safe(o, () => {
      const inputs = {
        mobility: val('bq-mobility'), activity: val('bq-activity'), sensory: val('bq-sensory'), moisture: val('bq-moisture'),
        friction: val('bq-friction'), nutrition: val('bq-nutrition'), perfusion: val('bq-perfusion'),
      };
      const r = S.bradenQ(inputs);
      o.appendChild(list([li(`Total: ${fmt(r.total)} / 28`, r.total <= 16 ? 'warn' : null), li(r.band, r.total <= 16 ? 'warn' : null)]));
      note(o, r.note);
      if (deriv) updateDerivationSteps(deriv, META['braden-q'], inputs);
    }));
    screenerNote(root);
  },

  // --- spec-v62 §3.3 Part B (wave 2): neonatal phototherapy threshold -------

  'neo-phototherapy'(root) {
    root.appendChild(field('Gestational age (weeks, 35-44)', 'np-ga', { placeholder: 'e.g. 38' }));
    root.appendChild(field('Age (hours, 0-336)', 'np-hours', { placeholder: 'e.g. 48' }));
    root.appendChild(field('Total serum bilirubin (mg/dL)', 'np-tsb', { placeholder: 'e.g. 18' }));
    root.appendChild(checkField('Neurotoxicity risk factor(s) present', 'np-risk'));
    const o = out(); root.appendChild(o);
    wire(['np-ga', 'np-hours', 'np-tsb', 'np-risk'], () => safe(o, () => {
      const tsb = val('np-tsb');
      const r = S.neoPhototherapy({
        gaWeeks: val('np-ga'), ageHours: val('np-hours'), tsb, riskFactors: chk('np-risk'),
      });
      const marginText = r.atPhoto
        ? `TSB ${fmt(tsb)} is ${fmt(r.marginToPhoto)} mg/dL above the phototherapy line`
        : `TSB ${fmt(tsb)} is ${fmt(-r.marginToPhoto)} mg/dL below the phototherapy line`;
      o.appendChild(list([
        li(`Phototherapy threshold: ${fmt(r.photoThreshold)} mg/dL`, r.atPhoto ? 'warn' : null),
        li(marginText, r.atPhoto ? 'warn' : null),
        li(`Exchange-transfusion threshold: ${fmt(r.exchangeThreshold)} mg/dL (escalation of care at ${fmt(r.escalationThreshold)} mg/dL)`, r.atEscalation ? 'warn' : null),
        li(r.band, r.atExchange ? 'warn' : null),
      ]));
      note(o, r.note);
    }));
    screenerNote(root);
  },

  // --- spec-v62 §3 Part B (wave 1): OB/L&D & neonatal tiles -----------------

  'neonatal-feeding-volume'(root) {
    root.appendChild(field('Weight (kg)', 'nfv-w', { placeholder: '3.2' }));
    root.appendChild(field('Target volume (mL/kg/day, term ~150)', 'nfv-mlkg', { placeholder: '150' }));
    root.appendChild(selectField('Feeding frequency', 'nfv-freq', [
      { value: '8', text: 'q3h (8 feeds/day)' },
      { value: '12', text: 'q2h (12 feeds/day)' },
      { value: '6', text: 'q4h (6 feeds/day)' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C8.neonatalFeedingVolume({
        weightKg: val('nfv-w'),
        mlPerKgDay: val('nfv-mlkg'),
        feedsPerDay: Number(document.getElementById('nfv-freq').value),
      });
      o.appendChild(list([
        li(`Total daily volume: ${fmt(r.dailyMl)} mL/day`),
        li(`Per feed: ${fmt(r.perFeedMl)} mL`),
      ]));
      note(o, 'Term newborn 120-180 mL/kg/day (typ. 150); advance per day of life in preterm infants. AAP Pediatric Nutrition.');
    });
    ['nfv-w', 'nfv-mlkg', 'nfv-freq'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },

  'oxytocin-titration'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Planning conversion aid. Follow your unit\'s oxytocin protocol and uterine-activity monitoring.' }));
    root.appendChild(selectField('Bag concentration', 'oxy-conc', [
      { value: '60', text: '30 units / 500 mL (60 mU/mL)' },
      { value: '30', text: '30 units / 1000 mL (30 mU/mL)' },
      { value: '20', text: '20 units / 1000 mL (20 mU/mL)' },
      { value: '10', text: '10 units / 1000 mL (10 mU/mL)' },
    ]));
    root.appendChild(field('Ordered dose (mU/min)', 'oxy-dose', { placeholder: '6' }));
    root.appendChild(field('Pump rate (mL/hr)', 'oxy-rate', { placeholder: '12' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C8.oxytocinConvert({
        milliunitsPerMl: Number(document.getElementById('oxy-conc').value),
        doseMilliunitsMin: val('oxy-dose') || 0,
        rateMlHr: val('oxy-rate') || 0,
      });
      o.appendChild(list([
        li(`Ordered dose -> pump rate: ${fmt(r.rateFromDoseMlHr)} mL/hr`),
        li(`Pump rate -> delivered dose: ${fmt(r.doseFromRateMuMin)} mU/min`),
      ]));
      note(o, 'Typical titration: low-dose 1-2 mU/min q15-40 min; high-dose 3-6 mU/min. ACOG Induction of Labor.');
    });
    ['oxy-conc', 'oxy-dose', 'oxy-rate'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },
};
