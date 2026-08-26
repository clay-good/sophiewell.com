// spec-v780 §2: renderer for cbi — the Copenhagen Burnout Inventory (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Nineteen selects
// across three independent scales. Two different response wordings are used, exactly as
// published: a degree set and a frequency set. Neutral item-topic labels.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cbi-v780.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a self-report measure of how work is affecting you. It is not a clinical diagnosis and not an occupational-health determination.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const FREQ = [
  { value: '', text: '— not answered —' },
  { value: '100', text: 'Always' },
  { value: '75', text: 'Often' },
  { value: '50', text: 'Sometimes' },
  { value: '25', text: 'Seldom' },
  { value: '0', text: 'Never or almost never' },
];
const DEGREE = [
  { value: '', text: '— not answered —' },
  { value: '100', text: 'To a very high degree' },
  { value: '75', text: 'To a high degree' },
  { value: '50', text: 'Somewhat' },
  { value: '25', text: 'To a low degree' },
  { value: '0', text: 'To a very low degree' },
];

const PERSONAL = [
  ['How often you feel tired', 'cbi-p1', FREQ],
  ['How often you are physically exhausted', 'cbi-p2', FREQ],
  ['How often you are emotionally exhausted', 'cbi-p3', FREQ],
  ['How often you feel you cannot take any more', 'cbi-p4', FREQ],
  ['How often you feel worn out', 'cbi-p5', FREQ],
  ['How often you feel weak and prone to illness', 'cbi-p6', FREQ],
];
const WORK = [
  ['How far your work is emotionally exhausting', 'cbi-w1', DEGREE],
  ['How far you feel burnt out because of work', 'cbi-w2', DEGREE],
  ['How far your work frustrates you', 'cbi-w3', DEGREE],
  ['How often you feel worn out at the end of the day', 'cbi-w4', FREQ],
  ['How often you are exhausted in the morning at the thought of work', 'cbi-w5', FREQ],
  ['How often every working hour feels tiring', 'cbi-w6', FREQ],
  ['How often you have energy left for family and friends (reverse scored)', 'cbi-w7', FREQ],
];
const CLIENT = [
  ['How far you find it hard to work with the people you care for', 'cbi-c1', DEGREE],
  ['How far you find working with them frustrating', 'cbi-c2', DEGREE],
  ['How far working with them drains your energy', 'cbi-c3', DEGREE],
  ['How far you feel you give more than you get back', 'cbi-c4', DEGREE],
  ['How often you are tired of working with them', 'cbi-c5', FREQ],
  ['How often you wonder how long you can continue', 'cbi-c6', FREQ],
];

export const renderers = {
  cbi(root) {
    note(root, 'Copenhagen Burnout Inventory (Kristensen 2005): three separate scales, each the average of the items you answer, each running 0 to 100 with higher meaning more burnt out. The three are never added together. The last work item is reverse scored. A scale is only reported once at least three items are answered, or four on the work scale. Leave the third scale blank if you have no direct client or patient contact.');
    root.appendChild(el('h2', { text: 'Personal burnout (6 items)' }));
    for (const [label, id, opts] of PERSONAL) root.appendChild(selectField(label, id, opts));
    root.appendChild(el('h2', { text: 'Work-related burnout (7 items)' }));
    for (const [label, id, opts] of WORK) root.appendChild(selectField(label, id, opts));
    root.appendChild(el('h2', { text: 'Client-related burnout (6 items, optional)' }));
    for (const [label, id, opts] of CLIENT) root.appendChild(selectField(label, id, opts));
    const ids = [...PERSONAL, ...WORK, ...CLIENT].map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[id.replace('cbi-', '')] = val(id);
      const r = M.cbi(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.personal !== null) rows.push({ label: 'Personal', value: `${r.personal.toFixed(1)}/100` });
      if (r.work !== null) rows.push({ label: 'Work-related', value: `${r.work.toFixed(1)}/100` });
      if (r.client !== null) rows.push({ label: 'Client-related', value: `${r.client.toFixed(1)}/100` });
      resultRow(o, rows);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
