// spec-v776 §2: renderer for pfiq7 — the Pelvic Floor Impact Questionnaire short form
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The same seven
// life-impact questions are asked three times, once per organ system; each scale is the
// mean of its answered items times 100/3. Neutral topic labels (wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pfiq7-v776.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The PFIQ-7 measures how much symptoms interfere with daily life, as the patient reports it. It is a way to follow change over time, not a diagnosis, an examination, or a prolapse stage.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [
  { value: '', text: '— not answered —' },
  { value: '0', text: '0 (not at all)' },
  { value: '1', text: '1 (somewhat)' },
  { value: '2', text: '2 (moderately)' },
  { value: '3', text: '3 (quite a bit)' },
];

const TOPICS = [
  'household chores such as cooking, laundry and cleaning',
  'physical activity such as walking, swimming or other exercise',
  'entertainment outside the home such as a movie or a concert',
  'traveling by car or bus more than 30 minutes from home',
  'social activities outside the home',
  'emotional health, such as feeling nervous or low',
  'feeling frustrated',
];
const SCALES = [
  { heading: 'Bladder or urine symptoms (UIQ-7)', prefix: 'pfiq-u', short: 'Bladder' },
  { heading: 'Bowel or rectal symptoms (CRAIQ-7)', prefix: 'pfiq-c', short: 'Bowel' },
  { heading: 'Vaginal or pelvic symptoms (POPIQ-7)', prefix: 'pfiq-p', short: 'Pelvis' },
];

export const renderers = {
  pfiq7(root) {
    note(root, 'PFIQ-7 (Barber 2005): the same seven questions about everyday life, asked once about bladder symptoms, once about bowel symptoms and once about vaginal or pelvic symptoms. Rate each 0 (not at all) to 3 (quite a bit). Each scale is the mean of its answered items times 100 divided by 3, giving 0 to 100; the summary adds the three, giving 0 to 300.');
    const ids = [];
    for (const sc of SCALES) {
      root.appendChild(el('h2', { text: sc.heading }));
      TOPICS.forEach((topic, i) => {
        const id = `${sc.prefix}${i + 1}`;
        ids.push(id);
        root.appendChild(selectField(`${sc.short} - effect on ${topic}`, id, RATE));
      });
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[id.replace('pfiq-', '')] = val(id);
      const r = M.pfiq7(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Summary', value: `${r.total.toFixed(2)}/300` },
        { label: 'UIQ-7', value: `${r.uiq.toFixed(2)}/100` },
        { label: 'CRAIQ-7', value: `${r.craiq.toFixed(2)}/100` },
        { label: 'POPIQ-7', value: `${r.popiq.toFixed(2)}/100` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
