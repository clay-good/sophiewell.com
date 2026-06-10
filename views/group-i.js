// Group I: Field Medicine (64-81). This file ships the first batch
// (64, 65, 66, 67, 68, 69). The remaining utilities (70-81) follow in
// later spec-v3 steps and slot into the same renderers map.

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import { pedsDose, cincinnatiStroke, fast, fieldTriage, startTriage, jumpStartTriage, ruleOfNines, lundBrowder, burnFluid, pediatricEtt, naloxoneDose, selectEmsChecklist, RULE_OF_NINES_ADULT, PEDS_DOSE_RECIPES } from '../lib/field.js';
import { fetchJson } from '../lib/data.js';
import { hypothermiaRewarm, heatstrokeDecision } from '../lib/scoring-v4.js';
import { resultRow } from '../lib/result-copy.js';
import { META } from '../lib/meta.js';
import { renderDerivation, updateDerivationSteps } from '../lib/derivation.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
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
function checkbox(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(document.createTextNode(' '));
  wrap.appendChild(el('label', { for: id, text: label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function nv(id) { return Number(document.getElementById(id).value); }
function checked(id) { return document.getElementById(id).checked; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }

const FIELD_NOTICE = 'This is a math aid for verification. Local protocols, medical direction, and clinician judgment govern any clinical decision.';

function noticeBlock(root) {
  root.appendChild(el('p', { class: 'clinical-notice', role: 'note', text: FIELD_NOTICE }));
}

export const renderers = {
  // ---- Utility 64: Pediatric weight-to-dose ----------------------------
  'peds-weight-dose'(root) {
    noticeBlock(root);
    root.appendChild(field('Patient weight (kg)', 'pwd-w', { placeholder: '10' }));
    const opts = Object.entries(PEDS_DOSE_RECIPES).map(([k, v]) => ({ value: k, text: v.label }));
    root.appendChild(selectField('Medication', 'pwd-r', opts));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = pedsDose({ weightKg: nv('pwd-w'), recipe: document.getElementById('pwd-r').value });
      o.appendChild(el('p', { text: `Dose: ${r.dose} ${r.units}` }));
      if (r.capped) o.appendChild(el('p', { class: 'notice', text: 'Calculated dose exceeds the per-dose cap; cap value reported.' }));
    });
    ['pwd-w', 'pwd-r'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('pwd-r').addEventListener('change', run);
  },

  // ---- Utility 65: Adult cardiac arrest reference ----------------------
  // adult-arrest-ref / peds-arrest-ref / defib removed in spec-v29
  // wave 29-2 (Group I): pure AHA ECC numeric reference cards.
  cincinnati(root) {
    noticeBlock(root);
    root.appendChild(field('Time of last known well (text or HH:MM)', 'cps-time', { type: 'text', placeholder: '09:30' }));
    const slider = (label, id) => {
      const wrap = el('p');
      wrap.appendChild(el('label', { for: id, text: `${label} (0 = normal, 1 = abnormal)` }));
      wrap.appendChild(el('br'));
      const r = el('input', { id, type: 'range', min: '0', max: '1', step: '1', value: '0' });
      const v = el('output', { id: `${id}-v`, text: '0' });
      r.addEventListener('input', () => { v.textContent = r.value; });
      wrap.appendChild(r); wrap.appendChild(document.createTextNode(' ')); wrap.appendChild(v);
      return wrap;
    };
    root.appendChild(slider('Facial droop',      'cps-face'));
    root.appendChild(slider('Arm drift',         'cps-arm'));
    root.appendChild(slider('Abnormal speech',   'cps-speech'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = cincinnatiStroke({
        facialDroop:    nv('cps-face'),
        armDrift:       nv('cps-arm'),
        abnormalSpeech: nv('cps-speech'),
      });
      o.appendChild(el('p', { text: `Cincinnati Prehospital Stroke Scale: ${r.positive ? 'POSITIVE' : 'negative'} (${r.total} of 3 abnormal)` }));
      const t = document.getElementById('cps-time').value.trim();
      if (t) o.appendChild(el('p', { text: `Time of last known well: ${t}` }));
    });
    ['cps-face', 'cps-arm', 'cps-speech', 'cps-time'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // ---- Utility 69: FAST / BE-FAST --------------------------------------
  fast(root) {
    noticeBlock(root);
    root.appendChild(checkbox('Balance loss (BE-FAST)', 'fast-balance'));
    root.appendChild(checkbox('Eyes: vision change (BE-FAST)', 'fast-eyes'));
    root.appendChild(checkbox('Face droop',           'fast-face'));
    root.appendChild(checkbox('Arm weakness',         'fast-arms'));
    root.appendChild(checkbox('Speech change',        'fast-speech'));
    root.appendChild(field('Time of last known well (text or HH:MM)', 'fast-time', { type: 'text', placeholder: '09:30' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const beFast = checked('fast-balance') || checked('fast-eyes');
      const r = fast({
        balance: checked('fast-balance'),
        eyes:    checked('fast-eyes'),
        face:    checked('fast-face'),
        arms:    checked('fast-arms'),
        speech:  checked('fast-speech'),
      }, { extended: true });
      o.appendChild(el('p', { text: `${beFast ? 'BE-FAST' : 'FAST'}: ${r.positive ? 'POSITIVE' : 'negative'}` }));
      const t = document.getElementById('fast-time').value.trim();
      if (t) o.appendChild(el('p', { text: `Time of last known well: ${t}` }));
    });
    ['fast-balance', 'fast-eyes', 'fast-face', 'fast-arms', 'fast-speech'].forEach((id) => document.getElementById(id).addEventListener('change', run));
    document.getElementById('fast-time').addEventListener('input', run);
    run();
  },

  // ---- Utility 70: Trauma Triage Decision Tool -------------------------
  'field-triage'(root) {
    noticeBlock(root);
    const o = out(); root.appendChild(o);
    loadFile('field-triage', 'guidelines.json').then((data) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      o.appendChild(el('p', { class: 'muted', text: data.edition }));
      const ids = [];
      for (const step of data.steps) {
        const sec = el('section');
        sec.appendChild(el('h3', { text: `Step ${step.step}: ${step.name}` }));
        for (const c of step.criteria) {
          const cb = checkbox(c.label, `ft-${c.id}`);
          sec.appendChild(cb);
          ids.push(c.id);
        }
        sec.appendChild(el('p', { class: 'muted', text: step.action }));
        o.appendChild(sec);
      }
      const summary = el('p', { id: 'ft-result', class: 'notice' });
      o.appendChild(summary);
      const run = () => {
        const answers = {};
        for (const id of ids) answers[id] = document.getElementById(`ft-${id}`).checked;
        const r = fieldTriage(answers);
        summary.textContent = `Recommendation: ${r.destination} (${r.reason})`;
      };
      ids.forEach((id) => document.getElementById(`ft-${id}`).addEventListener('change', run));
      run();
    });
  },

  // ---- Utility 71: START adult triage ----------------------------------
  'start-triage'(root) {
    noticeBlock(root);
    root.appendChild(checkbox('Patient can walk', 'st-walk'));
    root.appendChild(checkbox('Patient is breathing (before any maneuver)', 'st-breath'));
    root.appendChild(selectField('Breaths return after airway repositioning?', 'st-reposition', [
      { value: 'na',   text: 'Not applicable (was breathing)' },
      { value: 'yes',  text: 'Yes (breathing returned)' },
      { value: 'no',   text: 'No (apnea persists)' },
    ]));
    root.appendChild(field('Respiratory rate (breaths/min)', 'st-rr', { placeholder: '24' }));
    root.appendChild(checkbox('Radial pulse present and capillary refill < 2s', 'st-perf'));
    root.appendChild(checkbox('Patient follows simple commands', 'st-cmd'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const repo = document.getElementById('st-reposition').value;
      const r = startTriage({
        canWalk: checked('st-walk'),
        isBreathing: checked('st-breath'),
        breathsAfterReposition: repo === 'yes' ? true : repo === 'no' ? false : undefined,
        respiratoryRate: nv('st-rr') || 0,
        hasRadialPulseAndCapRefillUnder2s: checked('st-perf'),
        followsCommands: checked('st-cmd'),
      });
      o.appendChild(el('p', { class: 'notice', text: `Triage: ${r.category}. ${r.reason}` }));
      o.appendChild(el('p', { class: 'muted', text: 'START algorithm. Originally Newport Beach Fire Department / Hoag Hospital. Public-domain MCI triage tool.' }));
    });
    ['st-walk', 'st-breath', 'st-reposition', 'st-rr', 'st-perf', 'st-cmd'].forEach((id) => {
      document.getElementById(id).addEventListener('input', run);
      document.getElementById(id).addEventListener('change', run);
    });
  },

  // ---- Utility 72: JumpSTART pediatric triage --------------------------
  'jumpstart-triage'(root) {
    noticeBlock(root);
    root.appendChild(checkbox('Child can walk', 'js-walk'));
    root.appendChild(checkbox('Child is breathing (before any maneuver)', 'js-breath'));
    root.appendChild(selectField('After 5 rescue breaths, breathing returned?', 'js-rescue', [
      { value: 'na',   text: 'Not applicable (was breathing)' },
      { value: 'yes',  text: 'Yes (breathing returned)' },
      { value: 'no',   text: 'No (apnea persists)' },
    ]));
    root.appendChild(field('Respiratory rate (breaths/min)', 'js-rr', { placeholder: '30' }));
    root.appendChild(checkbox('Palpable peripheral pulse', 'js-pulse'));
    root.appendChild(checkbox('AVPU appropriate (A, V, or appropriate P)', 'js-avpu'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const re = document.getElementById('js-rescue').value;
      const r = jumpStartTriage({
        canWalk: checked('js-walk'),
        isBreathing: checked('js-breath'),
        breathsAfterRescue: re === 'yes' ? true : re === 'no' ? false : undefined,
        respiratoryRate: nv('js-rr') || 0,
        palpablePulse: checked('js-pulse'),
        avpuAppropriate: checked('js-avpu'),
      });
      o.appendChild(el('p', { class: 'notice', text: `Triage: ${r.category}. ${r.reason}` }));
      o.appendChild(el('p', { class: 'muted', text: 'JumpSTART pediatric MCI triage. Originally CHOC Children\'s Hospital. Public-domain.' }));
    });
    ['js-walk', 'js-breath', 'js-rescue', 'js-rr', 'js-pulse', 'js-avpu'].forEach((id) => {
      document.getElementById(id).addEventListener('input', run);
      document.getElementById(id).addEventListener('change', run);
    });
  },

  // ---- Utility 73: Burn surface area -----------------------------------
  bsa_burn(root) {
    noticeBlock(root);
    root.appendChild(selectField('Method', 'bb-method', [
      { value: 'nines',  text: 'Rule of Nines (adult)' },
      { value: 'lund',   text: 'Lund-Browder (enter percent affected per region)' },
    ]));
    const dyn = el('div', { id: 'bb-dyn' });
    root.appendChild(dyn);
    const o = out(); root.appendChild(o);

    function buildNines() {
      clear(dyn);
      const ids = [];
      for (const k of Object.keys(RULE_OF_NINES_ADULT)) {
        const cbId = `bb-n-${k}`;
        ids.push(cbId);
        dyn.appendChild(checkbox(`${k} (${RULE_OF_NINES_ADULT[k]}%)`, cbId));
      }
      const run = () => safe(o, () => {
        const sel = {};
        for (const k of Object.keys(RULE_OF_NINES_ADULT)) sel[k] = document.getElementById(`bb-n-${k}`).checked;
        const r = ruleOfNines(sel);
        o.appendChild(el('p', { class: 'notice', text: `Total burn surface area: ${r.tbsa}%` }));
      });
      ids.forEach((id) => document.getElementById(id).addEventListener('change', run));
      run();
    }
    function buildLund() {
      clear(dyn);
      const regions = ['head', 'neck', 'anterior trunk', 'posterior trunk', 'arm-left', 'arm-right',
                       'forearm-left', 'forearm-right', 'hand-left', 'hand-right',
                       'thigh-left', 'thigh-right', 'leg-left', 'leg-right',
                       'foot-left', 'foot-right', 'genitalia'];
      const ids = [];
      for (const r of regions) {
        const id = `bb-l-${r.replace(/[^a-z0-9]/gi, '-')}`;
        ids.push(id);
        dyn.appendChild(field(`${r} (% affected; age-adjust per chart)`, id, { placeholder: '0' }));
      }
      const run = () => safe(o, () => {
        const sel = {};
        for (let i = 0; i < regions.length; i += 1) sel[regions[i]] = nv(ids[i]) || 0;
        const r = lundBrowder(sel);
        o.appendChild(el('p', { class: 'notice', text: `Total burn surface area: ${r.tbsa}%` }));
      });
      ids.forEach((id) => document.getElementById(id).addEventListener('input', run));
      run();
    }

    document.getElementById('bb-method').addEventListener('change', () => {
      if (document.getElementById('bb-method').value === 'nines') buildNines(); else buildLund();
    });
    buildNines();
  },

  // ---- Utility 74: Burn fluid resuscitation ----------------------------
  'burn-fluid'(root) {
    noticeBlock(root);
    root.appendChild(field('Patient weight (kg)', 'bf-w', { placeholder: '70' }));
    root.appendChild(field('Burn surface area (% TBSA)', 'bf-bsa', { placeholder: '20' }));
    root.appendChild(field('Hours since injury (optional, 0-8)', 'bf-h', { placeholder: '0' }));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['burn-fluid']);
    if (deriv) root.appendChild(deriv);
    const run = () => safe(o, () => {
      const inputs = {
        weightKg: nv('bf-w'), tbsaPercent: nv('bf-bsa'),
        hoursSinceInjury: document.getElementById('bf-h').value === '' ? undefined : nv('bf-h'),
      };
      const r = burnFluid(inputs);
      resultRow(o, [
        { text: 'Parkland (4 mL/kg/% TBSA over 24h)' },
        { label: 'Total 24h', value: r.parkland.total24h, units: 'mL' },
        { label: 'First 8h', value: r.parkland.first8h, units: 'mL' },
        { label: 'Subsequent 16h', value: r.parkland.remaining16h, units: 'mL' },
        r.parkland.remainingInFirst8h != null ? { label: 'Remaining for first 8h window', value: `${r.parkland.remainingInFirst8h} mL (${r.parkland.ratePerHourRemainingFirst8h} mL/hr)` } : null,
        { text: 'Modified Brooke (2 mL/kg/% TBSA over 24h)' },
        { label: 'Total 24h', value: r.brooke.total24h, units: 'mL' },
        { label: 'First 8h', value: r.brooke.first8h, units: 'mL' },
        { label: 'Subsequent 16h', value: r.brooke.remaining16h, units: 'mL' },
        r.brooke.remainingInFirst8h != null ? { label: 'Remaining for first 8h window', value: `${r.brooke.remainingInFirst8h} mL (${r.brooke.ratePerHourRemainingFirst8h} mL/hr)` } : null,
      ]);
      if (deriv) updateDerivationSteps(deriv, META['burn-fluid'], inputs);
    });
    ['bf-w', 'bf-bsa', 'bf-h'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // hypothermia / heat-illness removed in spec-v29 wave 29-2 (Group I).

  // ---- Utility 77: Pediatric ETT size ----------------------------------
  'peds-ett'(root) {
    noticeBlock(root);
    root.appendChild(field('Patient age (years)', 'pet-age', { placeholder: '4' }));
    root.appendChild(selectField('Tube type', 'pet-cuffed', [
      { value: 'uncuffed', text: 'Uncuffed (age/4 + 4)' },
      { value: 'cuffed',   text: 'Cuffed (age/4 + 3.5)' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = pediatricEtt({ ageYears: nv('pet-age'), cuffed: document.getElementById('pet-cuffed').value === 'cuffed' });
      resultRow(o, [
        { label: 'Tube size', value: `${r.sizeMm} mm internal diameter (${r.cuffed ? 'cuffed' : 'uncuffed'})` },
        { label: 'Depth of insertion', value: `${r.depthCm} cm at the lip` },
      ]);
      o.appendChild(el('p', { class: 'muted', text: 'Standard pediatric airway formulas; verify against bedside assessment.' }));
    });
    ['pet-age', 'pet-cuffed'].forEach((id) => {
      document.getElementById(id).addEventListener('input', run);
      document.getElementById(id).addEventListener('change', run);
    });
  },

  // ---- Utility 80: Naloxone dosing -------------------------------------
  naloxone(root) {
    noticeBlock(root);
    root.appendChild(selectField('Population', 'nx-pop', [
      { value: 'adult',     text: 'Adult' },
      { value: 'pediatric', text: 'Pediatric' },
    ]));
    root.appendChild(selectField('Route', 'nx-route', [
      { value: 'iv', text: 'IV' },
      { value: 'im', text: 'IM' },
      { value: 'in', text: 'Intranasal' },
      { value: 'sc', text: 'Subcutaneous (less reliable)' },
    ]));
    root.appendChild(field('Pediatric weight (kg)', 'nx-w', { placeholder: '20' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const pop = document.getElementById('nx-pop').value;
      const r = naloxoneDose({ population: pop, route: document.getElementById('nx-route').value, weightKg: pop === 'pediatric' ? nv('nx-w') : undefined });
      resultRow(o, [
        { label: 'Initial', value: r.dose },
        { label: 'Re-dose', value: r.redose },
        { label: 'Max / escalation', value: r.max },
      ]);
      o.appendChild(el('p', { class: 'muted', text: 'Sources: FDA labeling and CDC opioid overdose guidance. Reference only.' }));
    });
    ['nx-pop', 'nx-route', 'nx-w'].forEach((id) => {
      document.getElementById(id).addEventListener('input', run);
      document.getElementById(id).addEventListener('change', run);
    });
  },

  // ---- Utility 81: EMS Documentation Helper ----------------------------
  'ems-doc'(root) {
    const o = out();
    fetchJson('data/workflow/ems-runtypes.json').then((bank) => {
      const wrap = el('p');
      wrap.appendChild(el('label', { for: 'ed-rt', text: 'Run type' }));
      wrap.appendChild(el('br'));
      const sel = el('select', { id: 'ed-rt' });
      sel.appendChild(el('option', { value: '', text: '(select)' }));
      for (const r of bank.runTypes) sel.appendChild(el('option', { value: r.id, text: r.name }));
      wrap.appendChild(sel);
      root.appendChild(wrap);
      root.appendChild(el('p', {}, [
        el('button', { id: 'ed-go', type: 'button', text: 'Generate checklist' }),
        document.createTextNode(' '),
        el('button', { id: 'ed-print', type: 'button', text: 'Print checklist' }),
      ]));
      root.appendChild(o);
      const run = () => {
        clear(o);
        const c = selectEmsChecklist(bank, sel.value);
        if (!c) { o.appendChild(el('p', { text: 'Select a run type.' })); return; }
        o.appendChild(el('h2', { text: c.name }));
        const ul = el('ul');
        for (const item of c.items) ul.appendChild(el('li', { text: item }));
        o.appendChild(ul);
        o.appendChild(el('p', { class: 'notice', text: bank.notes }));
      };
      document.getElementById('ed-go').addEventListener('click', run);
      document.getElementById('ed-print').addEventListener('click', () => window.print());
    }).catch((err) => {
      o.appendChild(el('p', { class: 'muted', text: `Failed to load run-type bank: ${err.message}` }));
      root.appendChild(o);
    });
  },

  // toxidromes removed in spec-v29 wave 29-2 (Group I).

  // --- spec-v4 §5: Group I extensions (utilities 166-171) -------------

  'nexus-cspine'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'NEXUS: cervical spine imaging is NOT required if ALL five low-risk criteria are met.' }));
    const items = [
      ['No posterior midline cervical-spine tenderness', 'nx-tender'],
      ['No evidence of intoxication', 'nx-intox'],
      ['Normal level of alertness', 'nx-alert'],
      ['No focal neurologic deficit', 'nx-focal'],
      ['No painful distracting injury', 'nx-distract'],
    ];
    for (const [l, id] of items) {
      const wrap = el('p');
      const cb = el('input', { id, type: 'checkbox' });
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('label', { for: id, text: l }));
      root.appendChild(wrap);
    }
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      const all = items.every(([, id]) => document.getElementById(id).checked);
      o.appendChild(el('h2', { text: all ? 'NEXUS: cervical spine imaging NOT required' : 'NEXUS: imaging IS required (one or more criteria not met)' }));
      o.appendChild(el('p', { class: 'muted', text:
        'Canadian C-Spine Rule: if any high-risk factor (age >=65, dangerous mechanism, paresthesias in extremities) -> imaging. ' +
        'Otherwise check low-risk factors that allow safe range-of-motion testing (simple rear-end MVC, sitting in ED, ambulatory at any time, delayed onset of neck pain, absence of midline tenderness). ' +
        'If a low-risk factor is present and the patient can actively rotate the neck 45 degrees left and right, imaging is not needed.' }));
    };
    items.forEach(([, id]) => document.getElementById(id).addEventListener('change', run));
    run();
  },

  // dot-erg / niosh-pg / cpr-numeric / tccc removed in spec-v29 wave
  // 29-2 (Group I): pure hazmat / chemical-hazard / numeric-wallet
  // reference cards.

  'co-cn-antidote'(root) {
    const o = el('div', { id: 'q-results', role: 'region', 'aria-live': 'polite' });
    root.appendChild(o);
    o.appendChild(el('h2', { text: 'CO / Cyanide / Smoke-Inhalation Antidote Reference' }));
    o.appendChild(el('h3', { text: 'Cyanide - hydroxocobalamin' }));
    o.appendChild(el('p', { text: 'Adult: 5 g IV over 15 min; may repeat once for total 10 g (FDA label, Cyanokit).' }));
    o.appendChild(el('p', { text: 'Pediatric: 70 mg/kg IV (max 5 g) over 15 min.' }));
    o.appendChild(el('h3', { text: 'Cyanide - sodium thiosulfate' }));
    o.appendChild(el('p', { text: 'Adult: 12.5 g IV (50 mL of 25% solution) over 10-30 min after sodium nitrite or with hydroxocobalamin in some protocols.' }));
    o.appendChild(el('p', { text: 'Pediatric: 400 mg/kg (max 12.5 g).' }));
    o.appendChild(el('h3', { text: 'Carbon monoxide - hyperbaric oxygen indication' }));
    o.appendChild(el('p', { text: 'Consider HBO if COHb >25% (>15% in pregnancy), syncope or LOC at any point, neurologic deficit, or persistent symptoms after normobaric O2.' }));
    o.appendChild(el('p', { class: 'muted', text: 'Sources: FDA labeling for Cyanokit (hydroxocobalamin) and Nithiodote (sodium nitrite + sodium thiosulfate). UHMS guidance for HBO indications.' }));
  },

  // spec-v30 §2.1: Swiss hypothermia staging -> rewarming algorithm.
  'hypothermia-rewarm'(root) {
    noticeBlock(root);
    root.appendChild(field('Core (rectal / esophageal) temperature, C', 'hyp-t', { placeholder: '30' }));
    root.appendChild(selectField('Patient state', 'hyp-s', [
      { value: 'alert-shivering', text: 'Alert and shivering (HT I)' },
      { value: 'impaired',        text: 'Impaired consciousness, breathing (HT II)' },
      { value: 'unconscious',     text: 'Unconscious, vital signs present (HT III)' },
      { value: 'arrest',          text: 'Cardiac arrest / apparent death (HT IV)' },
    ]));
    root.appendChild(checkbox('Lethal injury / chest non-compressible / known asystole before cooling (ECPR exclusion)', 'hyp-excl'));
    root.appendChild(field('Serum potassium (mmol/L, optional)', 'hyp-k', { placeholder: '4.0' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const kRaw = document.getElementById('hyp-k').value;
      const r = hypothermiaRewarm({
        coreTempC: nv('hyp-t'),
        state: document.getElementById('hyp-s').value,
        ecprExclusion: checked('hyp-excl'),
        potassium: kRaw === '' ? undefined : Number(kRaw),
      });
      o.appendChild(el('h2', { text: `${r.stage} at ${r.coreTempC} C` }));
      o.appendChild(el('p', { text: r.pathway }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'muted', text: b }));
      o.appendChild(el('p', { class: 'muted', text: 'Source: Durrer 2003 (ICAR-MEDCOM); ERC 2021 (Lott) §4; Brown NEJM 2012.' }));
    });
    ['hyp-t', 'hyp-s', 'hyp-excl', 'hyp-k'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
    run();
  },

  // spec-v30 §2.2: heat-illness -> cooling algorithm.
  'heatstroke-decision'(root) {
    noticeBlock(root);
    root.appendChild(field('Core (rectal) temperature, C', 'hs-t', { placeholder: '40' }));
    root.appendChild(selectField('CNS status', 'hs-cns', [
      { value: 'none',            text: 'No CNS dysfunction' },
      { value: 'mild-confusion',  text: 'Mild confusion' },
      { value: 'altered',         text: 'Altered LOC / seizure / coma' },
    ]));
    root.appendChild(checkbox('Sweating present (clears for exertional; unchecked = anhidrotic / classic)', 'hs-sw'));
    root.appendChild(selectField('Setting', 'hs-set', [
      { value: 'field',     text: 'Field / pre-hospital' },
      { value: 'hospital',  text: 'In-hospital' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = heatstrokeDecision({
        coreTempC: nv('hs-t'),
        cns: document.getElementById('hs-cns').value,
        sweating: checked('hs-sw'),
        setting: document.getElementById('hs-set').value,
      });
      o.appendChild(el('h2', { text: `${r.stage}${r.subtype ? ' (' + r.subtype + ')' : ''} at ${r.coreTempC} C` }));
      o.appendChild(el('p', { text: r.action }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'muted', text: b }));
      o.appendChild(el('p', { class: 'muted', text: 'Source: Bouchama 2002 NEJM; WMS 2019 (Lipman) heat-illness practice guideline; Casa 2007.' }));
    });
    ['hs-t', 'hs-cns', 'hs-sw', 'hs-set'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
    run();
  },
};
