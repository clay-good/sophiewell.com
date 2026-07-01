// MCP wave 12: adapters for lib/urology-v153.js — the IPSS/AUA symptom index,
// the IIEF-5/SHIM erectile-dysfunction screen, and the OABSS overactive-bladder
// score. dom keys mirror views/group-v153.js.

import * as F from '../../lib/urology-v153.js';

export default [
  {
    id: 'ipss',
    summary: 'International Prostate Symptom Score / AUA Symptom Index: seven 0–5 symptom questions summed 0–35 (mild ≤ 7, moderate 8–19, severe 20–35), with a separate quality-of-life item reported alongside.',
    compute: F.ipss,
    fields: [
      { dom: 'ipss-q1', arg: 'q1', kind: 'number', required: true, label: 'Incomplete emptying (0–5)' },
      { dom: 'ipss-q2', arg: 'q2', kind: 'number', required: true, label: 'Frequency (0–5)' },
      { dom: 'ipss-q3', arg: 'q3', kind: 'number', required: true, label: 'Intermittency (0–5)' },
      { dom: 'ipss-q4', arg: 'q4', kind: 'number', required: true, label: 'Urgency (0–5)' },
      { dom: 'ipss-q5', arg: 'q5', kind: 'number', required: true, label: 'Weak stream (0–5)' },
      { dom: 'ipss-q6', arg: 'q6', kind: 'number', required: true, label: 'Straining (0–5)' },
      { dom: 'ipss-q7', arg: 'q7', kind: 'number', required: true, label: 'Nocturia (0–5)' },
      { dom: 'ipss-qol', arg: 'qol', kind: 'number', required: false, label: 'Quality-of-life / bother (0–6, reported separately)' },
    ],
  },
  {
    id: 'iief5',
    summary: 'IIEF-5 / Sexual Health Inventory for Men: five items (Q1 1–5, Q2–Q5 0–5) banded 22–25 no ED, 17–21 mild, 12–16 mild-to-moderate, 8–11 moderate, 5–7 severe; ≤ 21 is the ED threshold.',
    compute: F.iief5,
    fields: [
      { dom: 'iief-q1', arg: 'q1', kind: 'number', required: true, label: 'Q1 confidence (1–5)' },
      { dom: 'iief-q2', arg: 'q2', kind: 'number', required: true, label: 'Q2 (0–5)' },
      { dom: 'iief-q3', arg: 'q3', kind: 'number', required: true, label: 'Q3 (0–5)' },
      { dom: 'iief-q4', arg: 'q4', kind: 'number', required: true, label: 'Q4 (0–5)' },
      { dom: 'iief-q5', arg: 'q5', kind: 'number', required: true, label: 'Q5 (0–5)' },
    ],
  },
  {
    id: 'oabss',
    summary: 'Overactive Bladder Symptom Score: daytime frequency (0–2), nocturia (0–3), urgency (0–5), and urgency incontinence (0–5) summed 0–15; the OAB definition requires urgency ≥ 2 and total ≥ 3.',
    compute: F.oabss,
    fields: [
      { dom: 'oab-day', arg: 'daytime', kind: 'number', required: true, label: 'Daytime frequency (0–2)' },
      { dom: 'oab-night', arg: 'nocturia', kind: 'number', required: true, label: 'Nocturia (0–3)' },
      { dom: 'oab-urg', arg: 'urgency', kind: 'number', required: true, label: 'Urgency (0–5)' },
      { dom: 'oab-inc', arg: 'incontinence', kind: 'number', required: true, label: 'Urgency incontinence (0–5)' },
    ],
  },
];
