// spec-v156 §2: renderers for the four closing tiles of the spec-v150 Post-Parity
// Coverage program — basdai (Bath AS Disease Activity Index), basfi (Bath AS
// Functional Index), essdai (EULAR Sjögren's Syndrome Disease Activity Index),
// and robson (Robson Ten-Group cesarean-audit classification). All Clinical
// Scoring & Risk (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage.
// basdai/basfi are bounded means over 0–10 inputs (each item finite-checked, a
// complete-the-fields fallback when any is blank); essdai is a bounded weighted
// sum over per-domain activity selects (an unselected domain contributes 0, never
// NaN, spec-v59); robson is a deterministic input -> group mapping where every
// valid combination resolves to exactly one of the ten groups (spec-v100 §2
// classification clarification). Per the spec-v50 §3 posture note each tile defers
// the management / audit decision to the clinician (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rheum-ob-v156.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score / group and its interpretation are the cited instrument’s, computed from the values you enter. The management decision (treatment escalation in spondyloarthritis or Sjögren disease) and any audit conclusion stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function scale010(label, id) {
  return field(label, id, { type: 'number', min: '0', max: '10', step: 'any', inputmode: 'decimal' });
}

const BASDAI_ITEMS = [
  ['Q1 — fatigue / tiredness (0–10)', 'basdai-q1'],
  ['Q2 — spinal (neck, back, hip) pain (0–10)', 'basdai-q2'],
  ['Q3 — peripheral joint pain / swelling (0–10)', 'basdai-q3'],
  ['Q4 — enthesitis (tenderness to touch/pressure) (0–10)', 'basdai-q4'],
  ['Q5 — morning-stiffness severity (0–10)', 'basdai-q5'],
  ['Q6 — morning-stiffness duration (0–10)', 'basdai-q6'],
];
const BASFI_ITEMS = [
  ['1 — put on socks/tights without aid (0–10)', 'basfi-i1'],
  ['2 — bend forward to pick up a pen from the floor (0–10)', 'basfi-i2'],
  ['3 — reach a high shelf without aid (0–10)', 'basfi-i3'],
  ['4 — get up from an armless chair without using hands (0–10)', 'basfi-i4'],
  ['5 — get up off the floor from lying without aid (0–10)', 'basfi-i5'],
  ['6 — stand unsupported 10 minutes without discomfort (0–10)', 'basfi-i6'],
  ['7 — climb 12–15 steps without a handrail/aid (0–10)', 'basfi-i7'],
  ['8 — look over your shoulder without turning your body (0–10)', 'basfi-i8'],
  ['9 — do physically demanding activities (0–10)', 'basfi-i9'],
  ['10 — do a full day of activities at home or work (0–10)', 'basfi-i10'],
];

// Robson categorical option lists.
const ROBSON_PARITY = [
  { value: 'nullipara', text: 'Nulliparous (no previous birth)' },
  { value: 'multipara', text: 'Multiparous (≥ 1 previous birth)' },
];
const ROBSON_PREVIOUS_CS = [
  { value: 'no', text: 'No previous cesarean' },
  { value: 'yes', text: 'Previous cesarean' },
];
const ROBSON_ONSET = [
  { value: 'spontaneous', text: 'Spontaneous labor' },
  { value: 'induced', text: 'Induced labor' },
  { value: 'prelabor-cs', text: 'Cesarean before labor' },
];
const ROBSON_PRESENTATION = [
  { value: 'cephalic', text: 'Cephalic (head-down)' },
  { value: 'breech', text: 'Breech' },
  { value: 'transverse-oblique', text: 'Transverse or oblique lie' },
];
const ROBSON_FETUSES = [
  { value: 'single', text: 'Single' },
  { value: 'multiple', text: 'Multiple' },
];
const ROBSON_GESTATION = [
  { value: 'term', text: 'Term (≥ 37 weeks)' },
  { value: 'preterm', text: 'Preterm (< 37 weeks)' },
];

export const renderers = {
  // ----- 2.1 basdai ----------------------------------------------------------
  basdai(root) {
    note(root, 'Bath Ankylosing Spondylitis Disease Activity Index (Garrett 1994): six 0–10 patient-reported items over the past week. BASDAI = [Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5 — the two morning-stiffness items are averaged, not summed. A BASDAI ≥ 4 suggests active / suboptimally controlled disease. Near-neighbors: basfi, asdas, das28.');
    const ids = [];
    for (const [label, id] of BASDAI_ITEMS) { root.appendChild(scale010(label, id)); ids.push(id); }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.basdai({ q1: val('basdai-q1'), q2: val('basdai-q2'), q3: val('basdai-q3'), q4: val('basdai-q4'), q5: val('basdai-q5'), q6: val('basdai-q6') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'BASDAI', value: `${r.score}` },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 basfi -----------------------------------------------------------
  basfi(root) {
    note(root, 'Bath Ankylosing Spondylitis Functional Index (Calin 1994): ten 0–10 items (eight daily-living tasks + two coping items; 0 = easy, 10 = impossible). BASFI = the mean of the 10 items. A higher index means poorer function. Near-neighbors: basdai, asdas.');
    const ids = [];
    for (const [label, id] of BASFI_ITEMS) { root.appendChild(scale010(label, id)); ids.push(id); }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.basfi({ i1: val('basfi-i1'), i2: val('basfi-i2'), i3: val('basfi-i3'), i4: val('basfi-i4'), i5: val('basfi-i5'), i6: val('basfi-i6'), i7: val('basfi-i7'), i8: val('basfi-i8'), i9: val('basfi-i9'), i10: val('basfi-i10') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'BASFI', value: `${r.score}` },
        { label: 'Function', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 essdai ----------------------------------------------------------
  essdai(root) {
    note(root, 'EULAR Sjögren’s Syndrome Disease Activity Index (Seror 2010): 12 systemic domains, each scored at an activity level whose printed value is already weight × level, so the total is the direct sum. Constitutional, glandular, and biological have no “high” level; CNS has no “low” level. Strata: low < 5, moderate 5–13, high ≥ 14. An unselected domain contributes 0. Near-neighbors: sledai-2k, cdai-ra.');
    const ids = [];
    for (const d of M.ESSDAI_DOMAINS) {
      const id = `essdai-${d.key}`;
      const opts = Object.keys(d.levels).map((name) => ({ value: name, text: `${name === 'No' ? 'No activity' : `${name} activity`} (+${d.levels[name]})` }));
      root.appendChild(selectField(`${d.label} (weight ${d.weight})`, id, opts));
      ids.push(id);
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const d of M.ESSDAI_DOMAINS) args[d.key] = val(`essdai-${d.key}`);
      const r = M.essdai(args);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ESSDAI', value: `${r.score}` },
        { label: 'Activity', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 robson ----------------------------------------------------------
  robson(root) {
    note(root, 'Robson Ten-Group Classification System (Robson 2001; WHO 2015): the standard cesarean-audit classification that sorts every delivery into one of ten mutually-exclusive groups. Groups 1–4 are single cephalic term with no previous cesarean; group 5 is single cephalic term with a previous cesarean; groups 6–10 cover breech, multiple, transverse/oblique, and preterm cephalic deliveries. An audit classification, not an individual risk. Near-neighbors: bishop, meows.');
    root.appendChild(pickField('Parity', 'robson-parity', ROBSON_PARITY));
    root.appendChild(pickField('Previous cesarean', 'robson-previous-cs', ROBSON_PREVIOUS_CS));
    root.appendChild(pickField('Number of fetuses', 'robson-fetuses', ROBSON_FETUSES));
    root.appendChild(pickField('Fetal presentation', 'robson-presentation', ROBSON_PRESENTATION));
    root.appendChild(pickField('Gestational age', 'robson-gestation', ROBSON_GESTATION));
    root.appendChild(pickField('Onset of labor (only used for groups 1–4)', 'robson-onset', ROBSON_ONSET));
    const o = out(); root.appendChild(o);
    wire(['robson-parity', 'robson-previous-cs', 'robson-fetuses', 'robson-presentation', 'robson-gestation', 'robson-onset'], () => safe(o, () => {
      const r = M.robson({
        parity: val('robson-parity'),
        previousCs: val('robson-previous-cs'),
        fetuses: val('robson-fetuses'),
        presentation: val('robson-presentation'),
        gestation: val('robson-gestation'),
        onset: val('robson-onset'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Robson group', value: r.group },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
