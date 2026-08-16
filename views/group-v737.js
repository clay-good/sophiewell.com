// spec-v737 §2: renderer for smast — the Short Michigan Alcoholism Screening Test
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Thirteen
// yes/no selects; items 1, 4, 5 score on "no" and the rest on "yes", summed 0-13.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/smast-v737.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The SMAST is a self-report screen for alcohol problems; it is not a diagnosis. It supports rather than replaces the clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YN = [{ value: '', text: '— yes / no —' }, { value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

// Items 1, 4, 5 score a point on "no" (reverse-keyed); the rest score on "yes".
const ROWS = [
  ['Do you feel you are a normal drinker? (you drink less than or as much as most people)', 'smast-q1'],
  ['Does a relative or close friend ever worry or complain about your drinking?', 'smast-q2'],
  ['Do you ever feel guilty about your drinking?', 'smast-q3'],
  ['Do friends or relatives think you are a normal drinker?', 'smast-q4'],
  ['Are you able to stop drinking when you want to?', 'smast-q5'],
  ['Have you ever attended a meeting of Alcoholics Anonymous (AA)?', 'smast-q6'],
  ['Has your drinking ever created problems between you and a relative or close friend?', 'smast-q7'],
  ['Have you ever gotten into trouble at work because of your drinking?', 'smast-q8'],
  ['Have you ever neglected your obligations, family, or work for two or more days in a row because you were drinking?', 'smast-q9'],
  ['Have you ever gone to anyone for help about your drinking?', 'smast-q10'],
  ['Have you ever been in a hospital because of your drinking?', 'smast-q11'],
  ['Have you ever been arrested for driving while intoxicated or under the influence of alcohol?', 'smast-q12'],
  ['Have you ever been arrested, even briefly, because of other drunken behavior?', 'smast-q13'],
];

export const renderers = {
  'smast'(root) {
    note(root, 'Short MAST (Selzer 1975): answer each of thirteen yes/no questions about your drinking. Items about being a normal drinker or being able to stop are reverse-scored; the total 0-13 gives a band, and 3 or more screens positive for a probable alcohol problem.');
    for (const [label, id] of ROWS) root.appendChild(selectField(label, id, YN));
    const ids = ROWS.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.smast({
        q1: val('smast-q1'), q2: val('smast-q2'), q3: val('smast-q3'), q4: val('smast-q4'),
        q5: val('smast-q5'), q6: val('smast-q6'), q7: val('smast-q7'), q8: val('smast-q8'),
        q9: val('smast-q9'), q10: val('smast-q10'), q11: val('smast-q11'), q12: val('smast-q12'),
        q13: val('smast-q13'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/13` },
        { label: 'Screen', value: r.tier },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
