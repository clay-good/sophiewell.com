// spec-v775 §2: renderer for pfdi20 — the Pelvic Floor Distress Inventory short form
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Twenty 0-4
// selects in three subscales; each subscale is the mean of its answered items times 25.
// Neutral symptom-topic labels (questionnaire wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pfdi20-v775.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The PFDI-20 measures symptom bother reported by the patient. It is a way to follow change over time, not a diagnosis, a physical examination, or a prolapse stage.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [
  { value: '', text: '— not answered —' },
  { value: '0', text: '0 (symptom absent)' },
  { value: '1', text: '1 (not at all bothered)' },
  { value: '2', text: '2 (somewhat)' },
  { value: '3', text: '3 (moderately)' },
  { value: '4', text: '4 (quite a bit)' },
];

const POPDI = [
  ['Item 1 - pressure in the lower abdomen', 'pfdi-q1'],
  ['Item 2 - heaviness or dullness in the pelvic area', 'pfdi-q2'],
  ['Item 3 - a bulge you can see or feel in the vaginal area', 'pfdi-q3'],
  ['Item 4 - needing to push on the vagina or rectum to complete a bowel movement', 'pfdi-q4'],
  ['Item 5 - a feeling that the bladder does not empty completely', 'pfdi-q5'],
  ['Item 6 - needing to push up a vaginal bulge to start or finish urinating', 'pfdi-q6'],
];
const CRADI = [
  ['Item 7 - straining too hard to have a bowel movement', 'pfdi-q7'],
  ['Item 8 - a feeling that the bowel does not empty completely', 'pfdi-q8'],
  ['Item 9 - loss of control of well-formed stool', 'pfdi-q9'],
  ['Item 10 - loss of control of loose stool', 'pfdi-q10'],
  ['Item 11 - loss of control of gas', 'pfdi-q11'],
  ['Item 12 - pain with bowel movements', 'pfdi-q12'],
  ['Item 13 - a strong urge to have a bowel movement', 'pfdi-q13'],
  ['Item 14 - part of the rectum bulging out during or after a bowel movement', 'pfdi-q14'],
];
const UDI = [
  ['Item 15 - frequent urination', 'pfdi-q15'],
  ['Item 16 - urine leakage linked to a feeling of urgency', 'pfdi-q16'],
  ['Item 17 - urine leakage with coughing, sneezing or laughing', 'pfdi-q17'],
  ['Item 18 - small amounts of urine leakage', 'pfdi-q18'],
  ['Item 19 - difficulty emptying the bladder', 'pfdi-q19'],
  ['Item 20 - pain or discomfort in the lower abdomen or genital area', 'pfdi-q20'],
];

export const renderers = {
  pfdi20(root) {
    note(root, 'PFDI-20 (Barber 2005): rate twenty pelvic floor symptoms 0 (absent) to 4 (quite a bit bothered). Each of the three subscales is the mean of its answered items times 25, giving 0 to 100; the summary adds the three, giving 0 to 300. Higher means more distress.');
    root.appendChild(el('h2', { text: 'Prolapse distress (POPDI-6)' }));
    for (const [label, id] of POPDI) root.appendChild(selectField(label, id, RATE));
    root.appendChild(el('h2', { text: 'Colorectal and anal distress (CRADI-8)' }));
    for (const [label, id] of CRADI) root.appendChild(selectField(label, id, RATE));
    root.appendChild(el('h2', { text: 'Urinary distress (UDI-6)' }));
    for (const [label, id] of UDI) root.appendChild(selectField(label, id, RATE));
    const rows = [...POPDI, ...CRADI, ...UDI];
    const ids = rows.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[id.replace('pfdi-', '')] = val(id);
      const r = M.pfdi20(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Summary', value: `${r.total.toFixed(1)}/300` },
        { label: 'POPDI-6', value: `${r.popdi.toFixed(1)}/100` },
        { label: 'CRADI-8', value: `${r.cradi.toFixed(1)}/100` },
        { label: 'UDI-6', value: `${r.udi.toFixed(1)}/100` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
