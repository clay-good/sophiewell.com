// spec-v176 §2: renderers for the six falls-risk / balance / gait tiles of the
// spec-v172 Long-Term Care & Geriatric Assessment program — stratify,
// chair-stand-30s, four-stage-balance, functional-reach, steadi-algorithm
// (Clinical Scoring & Risk, Group G) and gait-speed (Clinical Math &
// Conversions, Group E — it returns a value).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a deterministic measurement/observation -> value/band mapping; an incomplete
// entry surfaces a complete-the-fields fallback. Per the spec-v50 §3 posture note
// each tile defers the clinical decision to the clinician (spec-v11 §5.3) and
// never authors an exercise prescription or fall-prevention order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ltcga-v176.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, HEIGHT_UNITS } from '../lib/field-units.js';

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
function numField(label, id, opts = {}) {
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, value, or pathway is the cited instrument’s, derived from the measurements you enter; it is a fall-risk screen, not a diagnosis. The clinical decision — the falls work-up, the exercise or balance plan, and any referral — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YESNO = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];
const SEX = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];
const BARTHEL03 = [
  { value: '0', text: '0' },
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
];
const FALLCOUNT = [
  { value: '1', text: 'One fall' },
  { value: '2', text: 'Two or more (recurrent)' },
];

export const renderers = {
  // ----- 2.1 stratify --------------------------------------------------------
  stratify(root) {
    note(root, 'STRATIFY (Oliver 1997): the inpatient falls-risk tool the catalog’s morse-falls and hendrich-ii complement. Five factors each score 1 — a recent fall, agitation, visual impairment, frequent toileting, and a transfer+mobility (Barthel 0–3 each) combined score of 3 or 4. Total 0–5; ≥ 2 is high fall risk.');
    root.appendChild(pickField('Presented with a fall, or has fallen since admission', 'stratify-fall', YESNO));
    root.appendChild(pickField('Agitated', 'stratify-agitated', YESNO));
    root.appendChild(pickField('Visual impairment affecting everyday function', 'stratify-visual', YESNO));
    root.appendChild(pickField('In need of especially frequent toileting', 'stratify-toilet', YESNO));
    root.appendChild(pickField('Transfer score (Barthel 0–3)', 'stratify-transfer', BARTHEL03));
    root.appendChild(pickField('Mobility score (Barthel 0–3)', 'stratify-mobility', BARTHEL03));
    const o = out(); root.appendChild(o);
    const ids = ['stratify-fall', 'stratify-agitated', 'stratify-visual', 'stratify-toilet', 'stratify-transfer', 'stratify-mobility'];
    wire(ids, () => safe(o, () => {
      const r = M.stratify({ recentFall: selVal('stratify-fall'), agitated: selVal('stratify-agitated'), visualImpairment: selVal('stratify-visual'), frequentToileting: selVal('stratify-toilet'), transfer: selVal('stratify-transfer'), mobility: selVal('stratify-mobility') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Total', value: `${r.total}/5` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 chair-stand-30s -------------------------------------------------
  'chair-stand-30s'(root) {
    note(root, '30-Second Chair Stand (CDC STEADI): the count of full sit-to-stands in 30 seconds, compared with the CDC STEADI below-average cut-point for age and sex. A count below the cut-point is below average and indicates increased fall risk. Norm bands cover ages 60–94. Companion to steadi-algorithm.');
    root.appendChild(numField('Full stands completed in 30 seconds', 'chair-stands', { min: 0, placeholder: 'e.g. 10' }));
    root.appendChild(numField('Age (years)', 'chair-age', { min: 0, placeholder: 'e.g. 75' }));
    root.appendChild(pickField('Sex', 'chair-sex', SEX));
    const o = out(); root.appendChild(o);
    wire(['chair-stands', 'chair-age', 'chair-sex'], () => safe(o, () => {
      const r = M.chairStand30s({ stands: optNum('chair-stands'), age: optNum('chair-age'), sex: selVal('chair-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Stands', value: `${r.stands}` }, { label: 'Cut-point', value: `${r.threshold}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 four-stage-balance ----------------------------------------------
  'four-stage-balance'(root) {
    note(root, '4-Stage Balance Test (CDC STEADI): four progressively harder stances held up to 10 s each — feet side-by-side, semi-tandem, full tandem, single leg. The key flag is the full tandem: inability to hold it for 10 seconds indicates increased fall risk. Enter the time the full tandem stance was held.');
    root.appendChild(numField('Full tandem stance hold time (seconds)', 'balance-tandem', { step: '0.1', min: 0, placeholder: 'e.g. 8' }));
    const o = out(); root.appendChild(o);
    wire(['balance-tandem'], () => safe(o, () => {
      const r = M.fourStageBalance({ tandemSeconds: optNum('balance-tandem') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Tandem', value: `${r.tandemSeconds} s` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 functional-reach ------------------------------------------------
  'functional-reach'(root) {
    note(root, 'Functional Reach Test (Duncan 1990): the maximum forward reach with a fixed base of support. Under 15.24 cm (6 in) is a markedly increased (~4×) fall risk, 15.24–25.40 cm (6–10 in) an increased (~2×) risk, over 25.40 cm a lower risk. The age/sex normative mean is shown for context (ages 20–87).');
    root.appendChild(unitField('Forward reach distance', 'reach-distance', HEIGHT_UNITS, { placeholder: 'e.g. 18' }));
    root.appendChild(numField('Age (years)', 'reach-age', { min: 0, placeholder: 'e.g. 75' }));
    root.appendChild(pickField('Sex', 'reach-sex', SEX));
    const o = out(); root.appendChild(o);
    wire(['reach-distance', 'reach-distance-unit', 'reach-age', 'reach-sex'], () => safe(o, () => {
      const r = M.functionalReach({ reachCm: unitNumOpt('reach-distance'), age: optNum('reach-age'), sex: selVal('reach-sex') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Reach', value: `${r.reachCm} cm` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 gait-speed (Group E) --------------------------------------------
  'gait-speed'(root) {
    note(root, 'Gait speed (Studenski 2011; “the sixth vital sign”): distance ÷ time, in m/s, commonly over a 4-meter walk. Under 0.6 m/s is a high risk of adverse outcomes, under 0.8 m/s is limited community ambulation, and 1.0 m/s or more is healthy. The time denominator is guarded — a zero or blank time never produces Infinity. Companion to steadi-algorithm.');
    root.appendChild(numField('Distance walked (meters)', 'gait-distance', { step: '0.1', min: 0, placeholder: 'e.g. 4' }));
    root.appendChild(numField('Time taken (seconds)', 'gait-time', { step: '0.1', min: 0, placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['gait-distance', 'gait-time'], () => safe(o, () => {
      const r = M.gaitSpeed({ distanceM: optNum('gait-distance'), timeS: optNum('gait-time') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Speed', value: `${r.speed} m/s` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 steadi-algorithm ------------------------------------------------
  'steadi-algorithm'(root) {
    note(root, 'CDC STEADI screening algorithm: the three key questions (a fall in the past year, feeling unsteady, worry about falling) plus a gait/strength/balance result route to a low / moderate / high pathway. A negative screen is low risk; a positive screen is high when there are recurrent or injurious falls or a gait/balance problem, otherwise moderate. Ties together chair-stand-30s, four-stage-balance, and gait-speed.');
    root.appendChild(pickField('Fallen in the past year', 'steadi-fell', YESNO));
    root.appendChild(pickField('If fell: how many falls', 'steadi-count', FALLCOUNT));
    root.appendChild(pickField('If fell: did any fall cause injury', 'steadi-injury', YESNO));
    root.appendChild(pickField('Feels unsteady when standing or walking', 'steadi-unsteady', YESNO));
    root.appendChild(pickField('Worries about falling', 'steadi-worried', YESNO));
    root.appendChild(pickField('Gait/strength/balance problem on testing', 'steadi-gait', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['steadi-fell', 'steadi-count', 'steadi-injury', 'steadi-unsteady', 'steadi-worried', 'steadi-gait'];
    wire(ids, () => safe(o, () => {
      const r = M.steadiAlgorithm({ fellPastYear: selVal('steadi-fell'), numberOfFalls: selVal('steadi-count'), fallWithInjury: selVal('steadi-injury'), feelsUnsteady: selVal('steadi-unsteady'), worriesAboutFalling: selVal('steadi-worried'), gaitBalanceProblem: selVal('steadi-gait') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};

export const RV176 = renderers;
