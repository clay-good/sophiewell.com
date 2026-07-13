// spec-v298: renderer for the Graduated Return-to-Sport (RTS) strategy after
// sport-related concussion. Group G (clinical scoring & reference). The clinician
// selects the RTS step (1-6); the tile reports the exercise strategy, the
// activity at that step, the goal, and the consensus progression gates.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the consensus strategy descriptor; it never
// asserts a clearance decision (lib/concussion-rts-v298.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/concussion-rts-v298.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'concussion-rts'(root) {
    note(root, 'Graduated Return-to-Sport (RTS) strategy after sport-related concussion (Amsterdam 2022 consensus). Select the step to see the exercise strategy, the activity, the goal, and the progression gates. Each step typically takes a minimum of 24 hours; Steps 4–6 begin only after symptoms have resolved. Near-neighbors: gcs, canadian-ct-head.');
    root.appendChild(select('Return-to-sport step', 'crts-step', [
      ['1', 'Step 1 — Symptom-limited activity'],
      ['2', 'Step 2 — Light/moderate aerobic exercise'],
      ['3', 'Step 3 — Individual sport-specific exercise'],
      ['4', 'Step 4 — Non-contact training drills'],
      ['5', 'Step 5 — Full contact practice'],
      ['6', 'Step 6 — Return to sport'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['crts-step'], () => safe(o, () => {
      const r = M.concussionRtsStep({ step: val('crts-step') });
      if (!r.valid) { note(o, r.message || 'Select a step.'); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Activity', value: r.activity },
        { label: 'Goal', value: r.goal },
      ];
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
