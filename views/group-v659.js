// spec-v659 §2: renderer for isgps-dge — the ISGPS grading of delayed gastric emptying
// after pancreatic surgery (Clinical Scoring & Risk, Group G). Completes the
// International Study Group surgical-complication cluster.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three time
// inputs (NGT duration, NGT reinsertion POD, unable-to-tolerate-solids POD); the grade
// is the most severe A/B/C satisfied by any of them.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/isgps-dge-v659.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade is the most severe of the three ISGPS time criteria you entered; vomiting/distension and prokinetic use are associated features, not grade-determining. It is read with the surgical team and the full record.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'isgps-dge'(root) {
    note(root, 'ISGPS grading of delayed gastric emptying after pancreatic surgery (Wente 2007). The grade is the most severe satisfied by any criterion: NGT required 4-7 (A) / 8-14 (B) / >14 (C) days; or NGT reinsertion after POD 3 (A) / 7 (B) / 14 (C); or unable to tolerate solids by POD 7 (A) / 14 (B) / 21 (C). Leave an entry at 0 if it does not apply.');
    root.appendChild(numberField('Nasogastric tube required (days)', 'dge-ngt'));
    root.appendChild(numberField('NGT reinsertion postoperative day (0 = none)', 'dge-reinsert'));
    root.appendChild(numberField('Unable to tolerate solid oral intake by postoperative day (0 = tolerating)', 'dge-solids'));
    const ids = ['dge-ngt', 'dge-reinsert', 'dge-solids'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.isgpsDge({ ngtDays: val('dge-ngt'), reinsertionPod: val('dge-reinsert'), unableSolidsPod: val('dge-solids') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.code },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
