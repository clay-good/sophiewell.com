// spec-v154 §2: renderers for the four performance-based function / falls /
// palliative tiles of the spec-v150 Post-Parity Coverage program — berg-balance
// (Berg Balance Scale) and tinetti-poma (Tinetti POMA), both Clinical Scoring &
// Risk (Group G); tug (Timed Up & Go) and the surrounding numeric measures are
// Clinical Math & Conversions (Group E); pps (Palliative Performance Scale v2),
// Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Berg
// and POMA are bounded sums, TUG is a thresholded single numeric measure, and
// PPS is a deterministic input->level mapping over fixed-range selects (spec-v29
// §3). A blank required input surfaces a complete-the-fields fallback rather than
// a spurious result (spec-v59). Per the spec-v50 §3 posture note each tile
// renders that it frames a measured performance observation, not a fall-
// prevention, PT, or hospice order in Sophie's voice (spec-v11 §5.3). The PPS
// flags when the columns disagree and leftward precedence resolved the level.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/function-v154.js';
import { resultRow } from '../lib/result-copy.js';

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
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score, time, or level is the cited instrument’s, computed from the performance you entered — a measured observation, not a prognosis or an order. The disposition (fall-prevention bundle, physical-therapy plan, hospice referral, further work-up) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

// Berg per-task 0–4 anchors (generic; the criteria vary by task per Berg 1992).
const BERG_SCALE = [
  { value: '0', text: '0 — unable / needs assistance' },
  { value: '1', text: '1 — severe difficulty' },
  { value: '2', text: '2 — moderate difficulty' },
  { value: '3', text: '3 — minor difficulty / supervision' },
  { value: '4', text: '4 — independent and safe' },
];
const BERG_TASKS = [
  'Sitting to standing',
  'Standing unsupported',
  'Sitting unsupported',
  'Standing to sitting',
  'Transfers',
  'Standing with eyes closed',
  'Standing with feet together',
  'Reaching forward with outstretched arm',
  'Retrieving object from floor',
  'Turning to look behind',
  'Turning 360 degrees',
  'Placing alternate foot on stool',
  'Standing with one foot in front (tandem)',
  'Standing on one foot',
];

// PPSv2 column options (descriptors verified against the Victoria Hospice sample).
const PPS_AMBULATION = [
  { value: 'full', text: 'Full' },
  { value: 'reduced', text: 'Reduced' },
  { value: 'mainly-sit', text: 'Mainly sit / lie' },
  { value: 'mainly-bed', text: 'Mainly in bed' },
  { value: 'bed-bound', text: 'Totally bed bound' },
  { value: 'death', text: 'Death' },
];
const PPS_ACTIVITY = [
  { value: 'normal-no-evidence', text: 'Normal activity & work; no evidence of disease' },
  { value: 'normal-some-evidence', text: 'Normal activity & work; some evidence of disease' },
  { value: 'normal-effort', text: 'Normal activity with effort; some evidence of disease' },
  { value: 'unable-job', text: 'Unable normal job/work; significant disease' },
  { value: 'unable-hobby', text: 'Unable hobby/house work; significant disease' },
  { value: 'unable-any-work', text: 'Unable to do any work; extensive disease' },
  { value: 'unable-most', text: 'Unable to do most activity; extensive disease' },
  { value: 'unable-any', text: 'Unable to do any activity; extensive disease' },
];
const PPS_SELFCARE = [
  { value: 'full', text: 'Full' },
  { value: 'occasional', text: 'Occasional assistance necessary' },
  { value: 'considerable', text: 'Considerable assistance required' },
  { value: 'mainly', text: 'Mainly assistance' },
  { value: 'total', text: 'Total care' },
];
const PPS_INTAKE = [
  { value: 'normal', text: 'Normal' },
  { value: 'reduced', text: 'Normal or reduced' },
  { value: 'minimal', text: 'Minimal to sips' },
  { value: 'mouth-care', text: 'Mouth care only' },
];
const PPS_CONSCIOUS = [
  { value: 'full', text: 'Full' },
  { value: 'confusion', text: 'Full or confusion' },
  { value: 'drowsy', text: 'Full or drowsy +/- confusion' },
  { value: 'coma', text: 'Drowsy or coma +/- confusion' },
];

export const renderers = {
  // ----- 2.1 berg-balance ----------------------------------------------------
  'berg-balance'(root) {
    note(root, 'Berg Balance Scale (Berg 1992): 14 performance tasks, each scored 0 (unable) to 4 (independent and safe), summed 0–56. Strata: 0–20 wheelchair-bound / high fall risk, 21–40 walking with assistance, 41–56 independent; a total below 45 flags increased fall risk. Near-neighbors: tinetti-poma, tug, morse-falls.');
    const ids = [];
    BERG_TASKS.forEach((task, i) => { const id = `berg-q${i + 1}`; root.appendChild(pickField(`${i + 1}. ${task}`, id, BERG_SCALE)); ids.push(id); });
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const fields = {};
      ids.forEach((id, i) => { fields[`q${i + 1}`] = selVal(id); });
      const r = M.bergBalance(fields);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Berg Balance', value: `${r.score}/56` },
        { label: 'Category', value: r.bandLabel },
        { label: 'Fall risk', value: r.increasedRisk ? 'increased (< 45)' : 'lower (≥ 45)' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 tug -------------------------------------------------------------
  tug(root) {
    note(root, 'Timed Up & Go (Podsiadlo & Richardson 1991): the time in seconds to rise from a chair, walk 3 m, turn, return, and sit. CDC STEADI flags increased fall risk at ≥ 12 s; the community-dwelling cut-off is ≥ 13.5 s; ≥ 30 s rates as dependent in transfers/ADLs. Near-neighbors: berg-balance, tinetti-poma.');
    root.appendChild(numField('Measured Timed Up & Go time (seconds)', 'tug-secs', { step: '0.1', min: 0, max: 600, placeholder: 'e.g. 12.5' }));
    const o = out(); root.appendChild(o);
    wire(['tug-secs'], () => safe(o, () => {
      const r = M.tug({ seconds: optNum('tug-secs') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Time', value: `${r.seconds} s` },
        { label: 'STEADI (≥ 12 s)', value: r.steadi ? 'flagged' : 'not flagged' },
        { label: 'Community (≥ 13.5 s)', value: r.community ? 'flagged' : 'not flagged' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 tinetti-poma ----------------------------------------------------
  'tinetti-poma'(root) {
    note(root, 'Tinetti POMA (Tinetti 1986): the 28-point version — balance subscale 0–16 plus gait subscale 0–12, total 0–28. Bands: ≤ 18 high fall risk, 19–23 moderate, ≥ 24 low. Enter the two subscale totals. Near-neighbors: berg-balance, tug.');
    root.appendChild(numField('Balance subscore (0–16)', 'poma-balance', { step: '1', min: 0, max: 16, placeholder: '0–16' }));
    root.appendChild(numField('Gait subscore (0–12)', 'poma-gait', { step: '1', min: 0, max: 12, placeholder: '0–12' }));
    const o = out(); root.appendChild(o);
    wire(['poma-balance', 'poma-gait'], () => safe(o, () => {
      const r = M.tinettiPoma({ balance: optNum('poma-balance'), gait: optNum('poma-gait') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'POMA', value: `${r.score}/28` },
        { label: 'Balance', value: `${r.balance}/16` },
        { label: 'Gait', value: `${r.gait}/12` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 pps -------------------------------------------------------------
  pps(root) {
    note(root, 'Palliative Performance Scale v2 (Anderson 1996; PPSv2 © Victoria Hospice Society): five columns read left-to-right with leftward precedence — ambulation, activity & evidence of disease, self-care, intake, conscious level — giving a level 0%–100% in 10% steps (0% = death). A lower PPS frames a shorter expected survival and the hospice-eligibility discussion. Near-neighbor: ecog-karnofsky (distinct anchor).');
    root.appendChild(pickField('Ambulation', 'pps-amb', PPS_AMBULATION));
    root.appendChild(pickField('Activity & evidence of disease', 'pps-act', PPS_ACTIVITY));
    root.appendChild(pickField('Self-care', 'pps-self', PPS_SELFCARE));
    root.appendChild(pickField('Intake', 'pps-intake', PPS_INTAKE));
    root.appendChild(pickField('Conscious level', 'pps-cons', PPS_CONSCIOUS));
    const o = out(); root.appendChild(o);
    wire(['pps-amb', 'pps-act', 'pps-self', 'pps-intake', 'pps-cons'], () => safe(o, () => {
      const r = M.pps({ ambulation: selVal('pps-amb'), activity: selVal('pps-act'), selfCare: selVal('pps-self'), intake: selVal('pps-intake'), conscious: selVal('pps-cons') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PPS', value: `${r.level}%` },
        { label: 'Band', value: r.bandLabel },
        { label: 'Column conflict', value: r.conflicts && r.conflicts.length ? 'yes (leftward wins)' : 'none' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
