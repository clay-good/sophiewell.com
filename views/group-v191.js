// spec-v191 §2: renderers for four dermatology / urology severity & staging
// tiles — SCORTEN, the AJCC 8th-edition melanoma T category, PI-RADS v2.1, and
// the Guy's stone score. Group G (classification / score).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the biopsy / surgery / prognosis
// decision to the treating team (spec-v11 §5.3) — these score, stage, and
// classify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dermuro-v191.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
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
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function invalid(o, r) { note(o, 'Complete the remaining fields.'); note(o, r.note); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, stage, or category is the cited source’s, computed from the inputs you enter. The biopsy, surgery, and prognosis decisions stay with the treating team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SCORE_OPTS = (id) => [{ value: '', text: '— choose —' }, ...[1, 2, 3, 4, 5].map((n) => ({ value: `${n}`, text: `${n}` }))];
const ZONE_OPTS = [
  { value: '', text: '— choose zone —' },
  { value: 'peripheral', text: 'Peripheral zone (DWI dominant)' },
  { value: 'transition', text: 'Transition zone (T2W dominant)' },
];
const DCE_OPTS = [
  { value: 'negative', text: 'Negative' },
  { value: 'positive', text: 'Positive (focal early enhancement)' },
];
const GUYS_OPTS = [
  { value: '', text: '— choose the matching configuration —' },
  { value: '1', text: 'Grade I — solitary mid/lower-pole or pelvic stone, simple anatomy' },
  { value: '2', text: 'Grade II — solitary upper-pole stone, OR multiple stones (simple anatomy), OR a solitary stone with abnormal anatomy' },
  { value: '3', text: 'Grade III — multiple stones with abnormal anatomy, OR a calyceal-diverticulum stone, OR a partial staghorn' },
  { value: '4', text: 'Grade IV — staghorn calculus, OR any stone with spina bifida / spinal injury' },
];

export const renderers = {
  // ----- 2.1 scorten ---------------------------------------------------------
  scorten(root) {
    note(root, 'SCORTEN (Bastuji-Garin 2000): seven criteria each 1 point; predicts in-hospital TEN mortality. Best scored on day 1 and again on day 3. Near-neighbors: the burn tiles.');
    root.appendChild(num('Age (years)', 'scorten-age'));
    root.appendChild(num('Heart rate (bpm)', 'scorten-heartRate'));
    root.appendChild(num('Body surface area detached (%)', 'scorten-bsaDetached'));
    root.appendChild(num('BUN (mg/dL)', 'scorten-bun'));
    root.appendChild(num('Serum bicarbonate (mEq/L)', 'scorten-bicarbonate'));
    root.appendChild(num('Serum glucose (mg/dL)', 'scorten-glucose'));
    root.appendChild(checkField('Associated malignancy', 'scorten-malignancy'));
    const o = out(); root.appendChild(o);
    wire(['scorten-age', 'scorten-heartRate', 'scorten-bsaDetached', 'scorten-bun', 'scorten-bicarbonate', 'scorten-glucose', 'scorten-malignancy'], () => safe(o, () => {
      const r = M.scorten({ age: val('scorten-age'), heartRate: val('scorten-heartRate'), bsaDetached: val('scorten-bsaDetached'), bun: val('scorten-bun'), bicarbonate: val('scorten-bicarbonate'), glucose: val('scorten-glucose'), malignancy: chk('scorten-malignancy') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SCORTEN', value: `${r.score}` },
        { label: 'Predicted mortality', value: r.mortality },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 melanoma-t-stage ------------------------------------------------
  'melanoma-t-stage'(root) {
    note(root, 'AJCC 8th-edition melanoma T category (Gershenwald 2017): from Breslow thickness and ulceration. The T element only — nodal and metastatic staging are separate. Near-neighbors: gleason-grade-group.');
    root.appendChild(num('Breslow thickness (mm)', 'melt-breslow'));
    root.appendChild(checkField('Ulceration present', 'melt-ulceration'));
    const o = out(); root.appendChild(o);
    wire(['melt-breslow', 'melt-ulceration'], () => safe(o, () => {
      const r = M.melanomaTStage({ breslow: val('melt-breslow'), ulceration: chk('melt-ulceration') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'T category', value: r.tCategory },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 pi-rads ---------------------------------------------------------
  'pi-rads'(root) {
    note(root, 'PI-RADS v2.1 (Turkbey 2019): the prostate-MRI assessment category (1–5). DWI drives the peripheral zone; T2W drives the transition zone; the score-3 upgrade rules differ by zone. A reporting category, not a biopsy order. Near-neighbors: psa-density.');
    root.appendChild(selectField('Zone of the dominant lesion', 'pirads-zone', ZONE_OPTS));
    root.appendChild(selectField('DWI / ADC score (1–5) — peripheral-zone driver', 'pirads-dwi', SCORE_OPTS()));
    root.appendChild(selectField('T2W score (1–5) — transition-zone driver', 'pirads-t2w', SCORE_OPTS()));
    root.appendChild(selectField('DCE (dynamic contrast) — peripheral score-3 upgrade', 'pirads-dce', DCE_OPTS));
    const o = out(); root.appendChild(o);
    wire(['pirads-zone', 'pirads-dwi', 'pirads-t2w', 'pirads-dce'], () => safe(o, () => {
      const r = M.piRads({ zone: val('pirads-zone'), dwi: val('pirads-dwi'), t2w: val('pirads-t2w'), dce: val('pirads-dce') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PI-RADS category', value: `${r.category}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 guys-stone-score ------------------------------------------------
  'guys-stone-score'(root) {
    note(root, "Guy's stone score (Thomas 2011): grades PCNL complexity (Grade I–IV) with the expected stone-free rate. A complement to S.T.O.N.E. nephrolithometry. Near-neighbors: stone-nephrolithometry.");
    root.appendChild(selectField('Stone configuration and anatomy', 'guys-grade', GUYS_OPTS));
    const o = out(); root.appendChild(o);
    wire(['guys-grade'], () => safe(o, () => {
      const r = M.guysStoneScore({ grade: val('guys-grade') });
      if (!r.valid) return invalid(o, r);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.gradeLabel },
        { label: 'Expected stone-free rate', value: r.sfr },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
