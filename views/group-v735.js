// spec-v735 §2: renderer for k6 — the Kessler K6 Psychological Distress Scale (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six 0-4 selects;
// the sum 0-24 maps to a distress band. Neutral item-topic labels.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/k6-v735.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The K6 is a self-report screen of psychological distress; it is not a diagnosis. It supports rather than replaces the clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [{ value: '', text: '— 0-4 —' }, { value: '0', text: '0 (none of the time)' }, { value: '1', text: '1 (a little of the time)' }, { value: '2', text: '2 (some of the time)' }, { value: '3', text: '3 (most of the time)' }, { value: '4', text: '4 (all of the time)' }];

const ROWS = [
  ['Over the past 30 days, how often did you feel nervous', 'k6-q1'],
  ['... hopeless', 'k6-q2'],
  ['... restless or fidgety', 'k6-q3'],
  ['... so depressed that nothing could cheer you up', 'k6-q4'],
  ['... that everything was an effort', 'k6-q5'],
  ['... worthless', 'k6-q6'],
];

export const renderers = {
  'k6'(root) {
    note(root, 'Kessler K6 (Kessler 2003): over the past 30 days, rate how often you felt each of six ways, 0 (none of the time) to 4 (all of the time). The sum 0-24 gives a distress band; 13 or more screens positive for probable serious mental illness.');
    for (const [label, id] of ROWS) root.appendChild(selectField(label, id, RATE));
    const ids = ROWS.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.k6({ q1: val('k6-q1'), q2: val('k6-q2'), q3: val('k6-q3'), q4: val('k6-q4'), q5: val('k6-q5'), q6: val('k6-q6') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/24` },
        { label: 'Distress', value: r.tier.replace('-', ' ') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
