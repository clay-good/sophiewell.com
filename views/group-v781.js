// spec-v781 §2: renderer for startback — the STarT Back Screening Tool (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Eight
// agree/disagree checkboxes plus one five-level bothersomeness select; the risk group
// needs BOTH the total and the psychosocial subscore. Neutral item-topic labels.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/startback-v781.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a prognostic screen for matching treatment intensity to risk. It is not a diagnosis and it does not identify serious spinal pathology; red flags are assessed separately.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const BOTHER = [
  { value: 'not-at-all', text: 'Not at all (0)' },
  { value: 'slightly', text: 'Slightly (0)' },
  { value: 'moderately', text: 'Moderately (0)' },
  { value: 'very-much', text: 'Very much (1)' },
  { value: 'extremely', text: 'Extremely (1)' },
];

const AGREE = [
  ['1. Pain has spread down the leg at some time', 'sb-q1'],
  ['2. Pain in the shoulder or neck at some time', 'sb-q2'],
  ['3. Has walked only short distances because of the back pain', 'sb-q3'],
  ['4. Has dressed more slowly than usual because of the back pain', 'sb-q4'],
  ['5. Believes it is not safe to be physically active with this condition', 'sb-q5'],
  ['6. Worrying thoughts much of the time', 'sb-q6'],
  ['7. Believes the pain is terrible and will never get better', 'sb-q7'],
  ['8. Has not enjoyed the things usually enjoyed', 'sb-q8'],
];

export const renderers = {
  startback(root) {
    note(root, 'STarT Back (Hill 2008): tick each statement the person agrees with about the last two weeks, then rate overall bothersomeness. Items 5 to 9 also form the psychosocial subscore. Groups: total 3 or less is low risk; total 4 or more is medium risk when the subscore is 3 or less and high risk when it is 4 or 5.');
    for (const [label, id] of AGREE) root.appendChild(checkField(label, id));
    root.appendChild(selectField('9. Overall, how bothersome has the back pain been in the last 2 weeks', 'sb-bother', BOTHER));
    const ids = [...AGREE.map((r) => r[1]), 'sb-bother'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { bother: val('sb-bother') };
      for (const [, id] of AGREE) args[id.replace('sb-', '')] = checked(id);
      const r = M.startBack(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/9` },
        { label: 'Psychosocial subscore', value: `${r.subscore}/5` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
