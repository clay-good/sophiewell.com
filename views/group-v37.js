// spec-v112 §2: renderers for the five critical-care decision rules
// (meds-score, sic-score, cpis-vap, lactate-clearance, mrc-sum-score). The first
// renderer module of Wave 3 of the spec-v100 program. Four home in Clinical
// Scoring & Risk (Group G); lactate-clearance is a Group E clinical-math tile.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames risk or
// likelihood, not management; none authors a resuscitation, anticoagulation,
// ventilator, sedation, or weaning order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/critcare-v112.js';
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
// The spec-v50 §3 clinical-posture note, rendered under each tile's inputs.
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited instrument’s, computed from the values you entered; it frames risk or likelihood. The resuscitation, anticoagulation, ventilator, sedation, and weaning decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
const MRC_OPTS = Array.from({ length: 6 }, (_, i) => ({ value: String(i), text: `${i} -- ${['no contraction', 'flicker', 'movement, gravity eliminated', 'movement against gravity', 'movement against resistance', 'normal power'][i]}` }));

export const renderers = {
  // ----- 2.1 meds-score -------------------------------------------------
  'meds-score'(root) {
    note(root, 'Mortality in Emergency Department Sepsis (MEDS) score: nine weighted items summed 0-27, with the 28-day mortality band. Check every item that is present.');
    root.appendChild(checkField('Terminal illness (> 50% mortality in 30 days) -- 6', 'md-term'));
    root.appendChild(checkField('Tachypnea or hypoxia -- 3', 'md-tach'));
    root.appendChild(checkField('Septic shock (hypotension after fluids) -- 3', 'md-shock'));
    root.appendChild(checkField('Platelets < 150,000/mm^3 -- 3', 'md-plt'));
    root.appendChild(checkField('Bands > 5% -- 3', 'md-band'));
    root.appendChild(checkField('Age > 65 years -- 3', 'md-age'));
    root.appendChild(checkField('Lower respiratory infection -- 2', 'md-lri'));
    root.appendChild(checkField('Nursing-home resident -- 2', 'md-nh'));
    root.appendChild(checkField('Altered mental status -- 2', 'md-ams'));
    const o = out(); root.appendChild(o);
    wire(['md-term', 'md-tach', 'md-shock', 'md-plt', 'md-band', 'md-age', 'md-lri', 'md-nh', 'md-ams'], () => safe(o, () => {
      const r = M.medsScore({
        terminalIllness: chk('md-term'), tachypneaHypoxia: chk('md-tach'), septicShock: chk('md-shock'),
        lowPlatelets: chk('md-plt'), bands: chk('md-band'), ageOver65: chk('md-age'),
        lowerRespInfection: chk('md-lri'), nursingHome: chk('md-nh'), alteredMental: chk('md-ams'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/27` },
        { label: 'Risk', value: `${r.tier} (${r.mortality})` },
      ]);
      note(o, `Items counted: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 sic-score --------------------------------------------------
  'sic-score'(root) {
    note(root, 'Sepsis-Induced Coagulopathy (SIC) score: platelet count, PT-INR, and the total SOFA (capped at 2). SIC is met when the total is 4 or more AND the platelet + PT-INR subscore is 3 or more.');
    root.appendChild(field('Platelet count (x10^9/L)', 'si-plt', { step: '1', min: 0, placeholder: 'e.g. 80' }));
    root.appendChild(field('PT-INR', 'si-inr', { step: '0.1', min: 0, placeholder: 'e.g. 1.6' }));
    root.appendChild(field('Total SOFA score (resp + CV + hepatic + renal)', 'si-sofa', { step: '1', min: 0, placeholder: 'e.g. 4' }));
    const o = out(); root.appendChild(o);
    wire(['si-plt', 'si-inr', 'si-sofa'], () => safe(o, () => {
      const r = M.sicScore({ platelet: optNum('si-plt'), inr: optNum('si-inr'), sofa: optNum('si-sofa') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/6` },
        { label: 'SIC', value: r.met ? 'met' : 'not met' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 cpis-vap ---------------------------------------------------
  'cpis-vap'(root) {
    note(root, 'Clinical Pulmonary Infection Score (CPIS): six components summed 0-12. A score greater than 6 suggests ventilator-associated pneumonia.');
    root.appendChild(field('Temperature (degrees C)', 'cp-temp', { step: '0.1', placeholder: 'e.g. 39' }));
    root.appendChild(field('Leukocytes (per mm^3)', 'cp-wbc', { step: '100', min: 0, placeholder: 'e.g. 12000' }));
    root.appendChild(checkField('Band forms >= 50% (+1 to the leukocyte points)', 'cp-band'));
    root.appendChild(selectField('Tracheal secretions', 'cp-sec', [
      { value: 'none', text: 'None / absent (0)' },
      { value: 'non-purulent', text: 'Non-purulent (1)' },
      { value: 'purulent', text: 'Purulent (2)' },
    ]));
    root.appendChild(selectField('Oxygenation (PaO2/FiO2)', 'cp-oxy', [
      { value: 'normal', text: '> 240 mmHg or ARDS present (0)' },
      { value: 'low', text: '<= 240 mmHg and no ARDS (2)' },
    ]));
    root.appendChild(selectField('Chest radiograph', 'cp-cxr', [
      { value: 'none', text: 'No infiltrate (0)' },
      { value: 'diffuse', text: 'Diffuse / patchy infiltrate (1)' },
      { value: 'localized', text: 'Localized infiltrate (2)' },
    ]));
    root.appendChild(selectField('Tracheal-aspirate culture', 'cp-cult', [
      { value: 'none', text: 'No or light growth (0)' },
      { value: 'moderate', text: 'Moderate / heavy growth (1)' },
    ]));
    root.appendChild(checkField('Same organism on Gram stain (+1 to the culture points)', 'cp-same'));
    const o = out(); root.appendChild(o);
    wire(['cp-temp', 'cp-wbc', 'cp-band', 'cp-sec', 'cp-oxy', 'cp-cxr', 'cp-cult', 'cp-same'], () => safe(o, () => {
      const r = M.cpisVap({
        temp: optNum('cp-temp'), wbc: optNum('cp-wbc'), bandForms: chk('cp-band'),
        secretions: selVal('cp-sec'), oxygenation: selVal('cp-oxy'), cxr: selVal('cp-cxr'),
        culture: selVal('cp-cult'), sameOrganism: chk('cp-same'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/12` },
        { label: 'Components', value: r.parts },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 lactate-clearance ------------------------------------------
  'lactate-clearance'(root) {
    note(root, 'Lactate clearance: the percentage fall between two draws, (initial - repeat) / initial x 100. A clearance of 10% or more is the cited favorable early range; a negative value means the lactate rose.');
    root.appendChild(field('Initial lactate (mmol/L)', 'la-init', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('Repeat lactate (mmol/L)', 'la-rep', { step: '0.1', min: 0, placeholder: 'e.g. 2.0' }));
    root.appendChild(field('Interval between draws (hours, optional)', 'la-int', { step: '0.5', min: 0, placeholder: 'e.g. 2' }));
    const o = out(); root.appendChild(o);
    wire(['la-init', 'la-rep', 'la-int'], () => safe(o, () => {
      const r = M.lactateClearance({ initial: optNum('la-init'), repeat: optNum('la-rep'), interval: optNum('la-int') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      const items = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Clearance', value: `${r.clearance}%` },
      ];
      const iv = optNum('la-int');
      if (iv != null && iv > 0) items.push({ label: 'Interval', value: `${iv} h` });
      resultRow(o, items);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 mrc-sum-score ----------------------------------------------
  'mrc-sum-score'(root) {
    note(root, 'MRC sum score: six movements graded 0-5 on the left and right (12 muscle groups), summed to 0-60. A sum below 48 defines ICU-acquired weakness; below 36 is severe.');
    const groups = [
      ['Shoulder abduction', 'mr-shl', 'mr-shr'],
      ['Elbow flexion', 'mr-ell', 'mr-elr'],
      ['Wrist extension', 'mr-wrl', 'mr-wrr'],
      ['Hip flexion', 'mr-hil', 'mr-hir'],
      ['Knee extension', 'mr-knl', 'mr-knr'],
      ['Ankle dorsiflexion', 'mr-anl', 'mr-anr'],
    ];
    for (const [name, lid, rid] of groups) {
      root.appendChild(selectField(`${name} -- left`, lid, MRC_OPTS));
      root.appendChild(selectField(`${name} -- right`, rid, MRC_OPTS));
    }
    const ids = groups.flatMap(([, l, r]) => [l, r]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      const keys = ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'];
      keys.forEach((k, i) => { input[k] = optNum(ids[i]); });
      const r = M.mrcSumScore(input);
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Sum', value: `${r.total}/60` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
