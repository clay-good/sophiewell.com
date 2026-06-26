// spec-v151 §2: renderers for the four dermatology severity tiles of the
// spec-v150 Post-Parity Coverage program — pasi, easi, scorad, dlqi (all
// Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 classification clarification each tile CONSUMES the clinician's /
// patient's bounded read of the exam (per-region severity + area, extent, VAS,
// the DLQI answers) and COMPUTES a region/item-weighted score; none is a no-input
// reference table. Per the spec-v50 §3 clinical-posture note each tile renders
// that it frames a computed value, not a treat/escalate order in Sophie's voice
// (spec-v11 §5.3). PASI/EASI/SCORAD default every unentered severity to 0 (a
// blank area counts as 0% involvement); DLQI requires all ten answers and renders
// a complete-the-fields fallback otherwise rather than scoring a partial total.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/derm-v151.js';
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
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and severity band are the cited index’s, computed from the bounded exam and patient inputs you entered — the tile takes your read, it does not parse a photograph or chart on its own. The management decision — start, change, or escalate therapy (for example, biologic eligibility) — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEV5 = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — slight' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — severe' },
  { value: '4', text: '4 — very severe' },
];
const SEV4 = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — mild' },
  { value: '2', text: '2 — moderate' },
  { value: '3', text: '3 — severe' },
];

const PASI_REGIONS = [['head', 'Head / neck'], ['upper', 'Upper limbs'], ['trunk', 'Trunk'], ['lower', 'Lower limbs']];
const EASI_REGIONS = PASI_REGIONS;

export const renderers = {
  // ----- 2.1 pasi -------------------------------------------------------
  pasi(root) {
    note(root, 'PASI (Fredriksson 1978): the standard psoriasis severity index. For each of four regions grade erythema, induration, and desquamation 0–4 and enter the % area involved; PASI = Σ (E+I+D) × area grade × region weight (head 0.1, upper 0.2, trunk 0.3, lower 0.4), range 0–72. Bands: mild < 10, moderate 10–20, severe > 20. Near-neighbor: dlqi.');
    const ids = [];
    for (const [k, label] of PASI_REGIONS) {
      root.appendChild(el('p', { class: 'muted', text: `${label} — region weight ${({ head: 0.1, upper: 0.2, trunk: 0.3, lower: 0.4 })[k]}` }));
      root.appendChild(selectField(`${label}: erythema`, `pasi-${k}-e`, SEV5));
      root.appendChild(selectField(`${label}: induration (thickness)`, `pasi-${k}-i`, SEV5));
      root.appendChild(selectField(`${label}: desquamation (scaling)`, `pasi-${k}-d`, SEV5));
      root.appendChild(numField(`${label}: % area involved (0–100)`, `pasi-${k}-area`, { min: 0, max: 100, placeholder: 'e.g. 25' }));
      ids.push(`pasi-${k}-e`, `pasi-${k}-i`, `pasi-${k}-d`, `pasi-${k}-area`);
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const arg = {};
      for (const [k] of PASI_REGIONS) {
        arg[k + 'E'] = selVal(`pasi-${k}-e`); arg[k + 'I'] = selVal(`pasi-${k}-i`);
        arg[k + 'D'] = selVal(`pasi-${k}-d`); arg[k + 'Area'] = optNum(`pasi-${k}-area`);
      }
      const r = M.pasi(arg);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PASI', value: `${r.score}/72` },
        { label: 'Severity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 easi -------------------------------------------------------
  easi(root) {
    note(root, 'EASI (Hanifin 2001): atopic-dermatitis severity. For each region grade erythema, edema/papulation, excoriation, and lichenification 0–3 and enter the % area; EASI = Σ (sum) × area grade × weight. Weights are age-dependent — adults (≥ 8 yr) head 0.1/upper 0.2/trunk 0.3/lower 0.4; children (< 8 yr) head 0.2/upper 0.2/trunk 0.3/lower 0.3. Range 0–72 (Leshem strata). Near-neighbor: scorad.');
    root.appendChild(selectField('Age band (sets the region weights)', 'easi-age', [
      { value: 'adult', text: 'Adult / ≥ 8 years' },
      { value: 'child', text: 'Child / < 8 years' },
    ]));
    const ids = ['easi-age'];
    for (const [k, label] of EASI_REGIONS) {
      root.appendChild(el('p', { class: 'muted', text: `${label}` }));
      root.appendChild(selectField(`${label}: erythema`, `easi-${k}-e`, SEV4));
      root.appendChild(selectField(`${label}: edema / papulation`, `easi-${k}-ed`, SEV4));
      root.appendChild(selectField(`${label}: excoriation`, `easi-${k}-ex`, SEV4));
      root.appendChild(selectField(`${label}: lichenification`, `easi-${k}-l`, SEV4));
      root.appendChild(numField(`${label}: % area involved (0–100)`, `easi-${k}-area`, { min: 0, max: 100, placeholder: 'e.g. 25' }));
      ids.push(`easi-${k}-e`, `easi-${k}-ed`, `easi-${k}-ex`, `easi-${k}-l`, `easi-${k}-area`);
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const arg = { age: selVal('easi-age') };
      for (const [k] of EASI_REGIONS) {
        arg[k + 'E'] = selVal(`easi-${k}-e`); arg[k + 'Ed'] = selVal(`easi-${k}-ed`);
        arg[k + 'Ex'] = selVal(`easi-${k}-ex`); arg[k + 'L'] = selVal(`easi-${k}-l`); arg[k + 'Area'] = optNum(`easi-${k}-area`);
      }
      const r = M.easi(arg);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'EASI', value: `${r.score}/72` },
        { label: 'Severity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 scorad -----------------------------------------------------
  scorad(root) {
    note(root, 'SCORAD (European Task Force 1993): SCORAD = A/5 + 7B/2 + C, where A is % body-surface extent (0–100), B six intensity items each 0–3 (dryness graded on uninvolved skin), and C two 0–10 VAS (pruritus, sleeplessness). Range 0–103; oSCORAD = A/5 + 7B/2 drops the subjective items. Bands: mild < 25, moderate 25–50, severe > 50. Near-neighbor: easi.');
    root.appendChild(numField('A — extent: % body surface affected (0–100, rule of nines)', 'scorad-extent', { min: 0, max: 100, placeholder: 'e.g. 30' }));
    root.appendChild(selectField('B — erythema', 'scorad-erythema', SEV4));
    root.appendChild(selectField('B — edema / papulation', 'scorad-edema', SEV4));
    root.appendChild(selectField('B — oozing / crusting', 'scorad-oozing', SEV4));
    root.appendChild(selectField('B — excoriation', 'scorad-excoriation', SEV4));
    root.appendChild(selectField('B — lichenification', 'scorad-lichenification', SEV4));
    root.appendChild(selectField('B — dryness (assessed on uninvolved skin)', 'scorad-dryness', SEV4));
    root.appendChild(numField('C — pruritus VAS (0–10)', 'scorad-pruritus', { min: 0, max: 10, placeholder: 'e.g. 5' }));
    root.appendChild(numField('C — sleeplessness VAS (0–10)', 'scorad-sleeplessness', { min: 0, max: 10, placeholder: 'e.g. 3' }));
    const ids = ['scorad-extent', 'scorad-erythema', 'scorad-edema', 'scorad-oozing', 'scorad-excoriation', 'scorad-lichenification', 'scorad-dryness', 'scorad-pruritus', 'scorad-sleeplessness'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.scorad({
        extent: optNum('scorad-extent'), erythema: selVal('scorad-erythema'), edema: selVal('scorad-edema'),
        oozing: selVal('scorad-oozing'), excoriation: selVal('scorad-excoriation'), lichenification: selVal('scorad-lichenification'),
        dryness: selVal('scorad-dryness'), pruritus: optNum('scorad-pruritus'), sleeplessness: optNum('scorad-sleeplessness'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'SCORAD', value: `${r.score}/103` },
        { label: 'oSCORAD', value: r.oscorad },
        { label: 'Severity', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 dlqi -------------------------------------------------------
  dlqi(root) {
    note(root, 'DLQI (Finlay 1994): ten questions on how much your skin affected your life over the last week, each Very much 3 / A lot 2 / A little 1 / Not at all (or not relevant) 0; question 7 asks first whether your skin prevented work or study (Yes = 3). Total 0–30: 0–1 no effect, 2–5 small, 6–10 moderate, 11–20 very large, 21–30 extremely large effect. Near-neighbor: pasi.');
    const opt = [
      { value: '0', text: 'Not at all / not relevant (0)' },
      { value: '1', text: 'A little (1)' },
      { value: '2', text: 'A lot (2)' },
      { value: '3', text: 'Very much (3)' },
    ];
    const q7opt = [
      { value: '0', text: 'Not at all / not prevented (0)' },
      { value: '1', text: 'A little (1)' },
      { value: '2', text: 'A lot (2)' },
      { value: '3', text: 'Yes — prevented from working or studying (3)' },
    ];
    const qs = [
      'Q1. How itchy, sore, painful, or stinging has your skin been?',
      'Q2. How embarrassed or self-conscious have you been because of your skin?',
      'Q3. How much has your skin interfered with shopping or home/garden tasks?',
      'Q4. How much has your skin influenced the clothes you wear?',
      'Q5. How much has your skin affected social or leisure activities?',
      'Q6. How much has your skin made it difficult to do any sport?',
      'Q7. Has your skin prevented you from working or studying? (or, if not, how much a problem at work/study?)',
      'Q8. How much has your skin created problems with your partner, close friends, or relatives?',
      'Q9. How much has your skin caused any sexual difficulties?',
      'Q10. How much of a problem has the treatment for your skin been (e.g. mess, time)?',
    ];
    const ids = [];
    qs.forEach((label, i) => {
      const id = `dlqi-q${i + 1}`;
      root.appendChild(pickField(label, id, i === 6 ? q7opt : opt));
      ids.push(id);
    });
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const arg = {};
      ids.forEach((id, i) => { arg['q' + (i + 1)] = selVal(id); });
      const r = M.dlqi(arg);
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'DLQI', value: `${r.score}/30` },
        { label: 'Effect', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
