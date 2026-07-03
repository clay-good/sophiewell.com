// spec-v207 §2: renderers for the resuscitation, cardiac-arrest & trauma-death
// prognosis instruments — TOR rule, REMS, CART, CAHP, and CRASH-2. Group G.
// Shipped one tile at a time.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the termination / rapid-response /
// transfusion / care-limitation decision to the clinician and the patient
// (spec-v11 §5.3) — these prognosticate and stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/resus-trauma-v207.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const opt of options) sel.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The termination, rapid-response, transfusion, and care-limitation decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.3 tor-rule --------------------------------------------------------
  'tor-rule'(root) {
    note(root, 'Termination-of-Resuscitation rules (Morrison 2006/2007): field decision support for non-traumatic adult OHCA. BLS TOR needs all three absent (EMS-witnessed, ROSC before transport, shock delivered); ALS TOR adds two (bystander-witnessed, bystander CPR). Never a mandate to stop. Near-neighbors: go-far, four-score.');
    root.appendChild(selectField('Rule', 'tor-rule', [
      { value: 'bls', text: 'BLS TOR (3 criteria)' },
      { value: 'als', text: 'ALS TOR (5 criteria)' },
    ]));
    root.appendChild(checkField('Arrest witnessed by EMS', 'tor-ems'));
    root.appendChild(checkField('ROSC before transport', 'tor-rosc'));
    root.appendChild(checkField('Shock delivered', 'tor-shock'));
    root.appendChild(checkField('Arrest witnessed by a bystander (ALS only)', 'tor-bwit'));
    root.appendChild(checkField('Bystander CPR provided (ALS only)', 'tor-bcpr'));
    const o = out(); root.appendChild(o);
    const ids = ['tor-rule', 'tor-ems', 'tor-rosc', 'tor-shock', 'tor-bwit', 'tor-bcpr'];
    wire(ids, () => safe(o, () => {
      const r = M.torRule({
        rule: val('tor-rule'), emsWitnessed: chk('tor-ems'), rosc: chk('tor-rosc'), shock: chk('tor-shock'),
        bystanderWitnessed: chk('tor-bwit'), bystanderCpr: chk('tor-bcpr'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'TOR', value: r.met ? 'may consider' : 'continue' }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
