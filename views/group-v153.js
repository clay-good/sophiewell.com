// spec-v153 §2: renderers for the three urology / men's-health patient-reported
// symptom-score tiles of the spec-v150 Post-Parity Coverage program — ipss
// (IPSS / AUA-SI for BPH/LUTS), iief5 (IIEF-5 / SHIM for erectile dysfunction),
// and oabss (Overactive Bladder Symptom Score), all Clinical Scoring & Risk
// (Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each is
// a bounded item sum over fixed-range selects (spec-v29 §3); an unanswered item
// surfaces a complete-the-fields fallback rather than scoring an undercounted
// total (spec-v59). Per the spec-v50 §3 posture note each tile renders that the
// inputs are self-reported symptoms over the instrument's recall window and the
// management decision stays with the clinician (spec-v11 §5.3). The IPSS quality-
// of-life item is reported alongside but never summed into the 0–35 total; the
// OABSS surfaces when the urgency ≥ 2 diagnostic gate is not met.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/urology-v153.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Answer the remaining items.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score and severity band are the cited instrument’s, summed from the patient’s self-reported answers over its recall window — a symptom questionnaire, not a diagnosis. The management decision (watchful waiting, medical therapy, referral, or further work-up) stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

// IPSS symptom-frequency anchors (Barry 1992): 0 not at all → 5 almost always.
const IPSS_FREQ = [
  { value: '0', text: '0 — not at all' },
  { value: '1', text: '1 — less than 1 time in 5' },
  { value: '2', text: '2 — less than half the time' },
  { value: '3', text: '3 — about half the time' },
  { value: '4', text: '4 — more than half the time' },
  { value: '5', text: '5 — almost always' },
];
// Nocturia is a count (times per night), still 0–5.
const IPSS_NOCT = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — 1 time' },
  { value: '2', text: '2 — 2 times' },
  { value: '3', text: '3 — 3 times' },
  { value: '4', text: '4 — 4 times' },
  { value: '5', text: '5 — 5 or more times' },
];
const IPSS_QOL = [
  { value: '0', text: '0 — delighted' },
  { value: '1', text: '1 — pleased' },
  { value: '2', text: '2 — mostly satisfied' },
  { value: '3', text: '3 — mixed (about equally satisfied/dissatisfied)' },
  { value: '4', text: '4 — mostly dissatisfied' },
  { value: '5', text: '5 — unhappy' },
  { value: '6', text: '6 — terrible' },
];

// IIEF-5 per-item anchors. Q1 is 1–5 (no 0 option); Q2–Q5 carry the
// "0 = no sexual activity / did not attempt intercourse" option.
const IIEF_Q1 = [
  { value: '1', text: '1 — very low' },
  { value: '2', text: '2 — low' },
  { value: '3', text: '3 — moderate' },
  { value: '4', text: '4 — high' },
  { value: '5', text: '5 — very high' },
];
const IIEF_FREQ = (zero) => [
  { value: '0', text: `0 — ${zero}` },
  { value: '1', text: '1 — almost never / never' },
  { value: '2', text: '2 — a few times (much less than half)' },
  { value: '3', text: '3 — sometimes (about half the time)' },
  { value: '4', text: '4 — most times (much more than half)' },
  { value: '5', text: '5 — almost always / always' },
];
const IIEF_Q4 = [
  { value: '0', text: '0 — did not attempt intercourse' },
  { value: '1', text: '1 — extremely difficult' },
  { value: '2', text: '2 — very difficult' },
  { value: '3', text: '3 — difficult' },
  { value: '4', text: '4 — slightly difficult' },
  { value: '5', text: '5 — not difficult' },
];

// OABSS item anchors (Homma 2006).
const OAB_DAY = [
  { value: '0', text: '0 — 7 or fewer' },
  { value: '1', text: '1 — 8 to 14' },
  { value: '2', text: '2 — 15 or more' },
];
const OAB_NIGHT = [
  { value: '0', text: '0 — none' },
  { value: '1', text: '1 — 1 time' },
  { value: '2', text: '2 — 2 times' },
  { value: '3', text: '3 — 3 or more times' },
];
const OAB_URG = [
  { value: '0', text: '0 — not at all' },
  { value: '1', text: '1 — less than once a week' },
  { value: '2', text: '2 — once a week or more' },
  { value: '3', text: '3 — about once a day' },
  { value: '4', text: '4 — 2 to 4 times a day' },
  { value: '5', text: '5 — 5 times a day or more' },
];

export const renderers = {
  // ----- 2.1 ipss ------------------------------------------------------------
  ipss(root) {
    note(root, 'International Prostate Symptom Score / AUA-SI (Barry 1992): seven symptom questions over the past month, each 0–5, summed 0–35 (0–7 mild, 8–19 moderate, 20–35 severe). The separate quality-of-life item (0 delighted → 6 terrible) is reported alongside and is not added into the symptom total. Near-neighbors: prostate-volume, oabss.');
    const qs = [
      'Q1. Incomplete emptying — sensation of not emptying your bladder completely',
      'Q2. Frequency — had to urinate again less than 2 hours after finishing',
      'Q3. Intermittency — stopped and started again several times while urinating',
      'Q4. Urgency — found it difficult to postpone urination',
      'Q5. Weak stream — had a weak urinary stream',
      'Q6. Straining — had to push or strain to begin urination',
    ];
    const ids = [];
    qs.forEach((label, i) => { const id = `ipss-q${i + 1}`; root.appendChild(pickField(label, id, IPSS_FREQ)); ids.push(id); });
    root.appendChild(pickField('Q7. Nocturia — times got up to urinate from going to bed until rising', 'ipss-q7', IPSS_NOCT));
    ids.push('ipss-q7');
    root.appendChild(pickField('Quality of life — if you spent the rest of your life with your urinary condition as it is now (optional, not summed)', 'ipss-qol', IPSS_QOL));
    ids.push('ipss-qol');
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ipss({ q1: selVal('ipss-q1'), q2: selVal('ipss-q2'), q3: selVal('ipss-q3'), q4: selVal('ipss-q4'), q5: selVal('ipss-q5'), q6: selVal('ipss-q6'), q7: selVal('ipss-q7'), qol: selVal('ipss-qol') });
      if (!r.valid) { showInvalid(o, r); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'IPSS', value: `${r.score}/35` },
        { label: 'Severity', value: r.bandLabel },
      ];
      if (r.qol != null) rows.push({ label: 'QoL', value: `${r.qol}/6 (${r.qolLabel})` });
      resultRow(o, rows);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 iief5 -----------------------------------------------------------
  iief5(root) {
    note(root, 'IIEF-5 / Sexual Health Inventory for Men (Rosen 1999): five items over the past six months. Q1 is scored 1–5; Q2–Q5 carry a "0 = no sexual activity / did not attempt intercourse" option. Total 22–25 no ED, 17–21 mild, 12–16 mild-to-moderate, 8–11 moderate, 5–7 severe; ≤21 meets the threshold for erectile dysfunction. Near-neighbor: ipss.');
    root.appendChild(pickField('Q1. How do you rate your confidence that you could get and keep an erection?', 'iief-q1', IIEF_Q1));
    root.appendChild(pickField('Q2. When you had erections with stimulation, how often were they hard enough for penetration?', 'iief-q2', IIEF_FREQ('no sexual activity')));
    root.appendChild(pickField('Q3. During intercourse, how often were you able to maintain your erection after penetration?', 'iief-q3', IIEF_FREQ('did not attempt intercourse')));
    root.appendChild(pickField('Q4. During intercourse, how difficult was it to maintain your erection to completion?', 'iief-q4', IIEF_Q4));
    root.appendChild(pickField('Q5. When you attempted intercourse, how often was it satisfactory for you?', 'iief-q5', IIEF_FREQ('did not attempt intercourse')));
    const o = out(); root.appendChild(o);
    wire(['iief-q1', 'iief-q2', 'iief-q3', 'iief-q4', 'iief-q5'], () => safe(o, () => {
      const r = M.iief5({ q1: selVal('iief-q1'), q2: selVal('iief-q2'), q3: selVal('iief-q3'), q4: selVal('iief-q4'), q5: selVal('iief-q5') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'IIEF-5', value: `${r.score}/25` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 oabss -----------------------------------------------------------
  oabss(root) {
    note(root, 'Overactive Bladder Symptom Score (Homma 2006): four items over the past week — daytime frequency (0–2), nighttime frequency (0–3), urgency (0–5), urgency incontinence (0–5). Total 0–15 (≤5 mild, 6–11 moderate, ≥12 severe). OAB requires the urgency item ≥ 2 and total ≥ 3; the tile flags when that gate is not met. Near-neighbor: ipss.');
    root.appendChild(pickField('Q1. Daytime frequency — times urinated from waking until sleeping', 'oab-day', OAB_DAY));
    root.appendChild(pickField('Q2. Nighttime frequency — times got up to urinate during sleep', 'oab-night', OAB_NIGHT));
    root.appendChild(pickField('Q3. Urgency — sudden desire to urinate, difficult to defer', 'oab-urg', OAB_URG));
    root.appendChild(pickField('Q4. Urgency incontinence — leaked urine because of a sudden desire to urinate', 'oab-inc', OAB_URG));
    const o = out(); root.appendChild(o);
    wire(['oab-day', 'oab-night', 'oab-urg', 'oab-inc'], () => safe(o, () => {
      const r = M.oabss({ daytime: selVal('oab-day'), nocturia: selVal('oab-night'), urgency: selVal('oab-urg'), incontinence: selVal('oab-inc') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal || !r.meetsOab ? 'warn' : null },
        { label: 'OABSS', value: `${r.score}/15` },
        { label: 'Severity', value: r.bandLabel },
        { label: 'OAB definition', value: r.meetsOab ? 'met' : 'not met' },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
