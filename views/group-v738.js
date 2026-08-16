// spec-v738 §2: renderer for cage-aid — CAGE-AID (CAGE Adapted to Include Drugs)
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Four yes/no
// selects; each "yes" scores 1 point, summed 0-4, with 2 or more a positive screen.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cage-aid-v738.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The CAGE-AID is a self-report screen for alcohol and drug problems; it is not a diagnosis. It supports rather than replaces the clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YN = [{ value: '', text: '— yes / no —' }, { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const ROWS = [
  ['Have you ever felt you ought to cut down on your drinking or drug use?', 'cage-aid-q1'],
  ['Have people annoyed you by criticizing your drinking or drug use?', 'cage-aid-q2'],
  ['Have you ever felt bad or guilty about your drinking or drug use?', 'cage-aid-q3'],
  ['Have you ever had a drink or used drugs first thing in the morning to steady your nerves or get rid of a hangover (eye-opener)?', 'cage-aid-q4'],
];

export const renderers = {
  'cage-aid'(root) {
    note(root, 'CAGE-AID (Brown & Rounds 1995): the four CAGE questions broadened to include drug use. Answer each yes/no; each "yes" scores 1 point, and a total of 2 or more is a positive screen for an alcohol or drug problem.');
    for (const [label, id] of ROWS) root.appendChild(selectField(label, id, YN));
    const ids = ROWS.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cageAid({ q1: val('cage-aid-q1'), q2: val('cage-aid-q2'), q3: val('cage-aid-q3'), q4: val('cage-aid-q4') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/4` },
        { label: 'Screen', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
