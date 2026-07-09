// spec-v265 §2.1: renderer for the Assessment of Blood Consumption (ABC) score — the
// fastest bedside massive-transfusion-protocol trigger. Group G. The McLaughlin and PWH
// tiles are parked this slice (spec-v265 §7); only ABC ships.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the MTP-activation decision to the trauma
// team (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/massive-transfusion-v265.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The decision to activate the massive-transfusion protocol stays with the trauma team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'abc-transfusion-score'(root) {
    note(root, 'ABC score (Nunez 2009): the fastest bedside massive-transfusion-protocol trigger, computable before any lab returns. Four binary items; >= 2 predicts massive transfusion. Near-neighbors: tash-score, rabt-score, shock-index.');
    root.appendChild(check('Penetrating mechanism of injury', 'abc-pen'));
    root.appendChild(check('Systolic BP <= 90 mmHg on ED arrival', 'abc-sbp'));
    root.appendChild(check('Heart rate >= 120 bpm on ED arrival', 'abc-hr'));
    root.appendChild(check('Positive FAST examination', 'abc-fast'));
    const o = out(); root.appendChild(o);
    wire(['abc-pen', 'abc-sbp', 'abc-hr', 'abc-fast'], () => safe(o, () => {
      render(o, M.abcTransfusion({
        penetrating: chk('abc-pen'), sbp90: chk('abc-sbp'), hr120: chk('abc-hr'), positiveFast: chk('abc-fast'),
      }), 'ABC');
    }));
    postureNote(root);
  },
};
