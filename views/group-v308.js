// spec-v308: renderer for the Graduated Return-to-Learn (RTL) strategy after
// sport-related concussion. Group G (clinical scoring & reference). The clinician
// selects the RTL step (1-4); the tile reports the mental activity, the activity,
// and the goal.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the consensus strategy descriptor; it never
// asserts a clearance decision (lib/concussion-rtl-v308.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/concussion-rtl-v308.js';
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
  'concussion-rtl'(root) {
    note(root, 'Graduated Return-to-Learn (RTL) strategy after sport-related concussion (Amsterdam 2022 consensus) — the school companion to the return-to-sport ladder. Select the step to see the mental activity, the activity, and the goal. Progression is symptom-limited; a full return to learn is completed before unrestricted return to sport. Near-neighbors: concussion-rts.');
    root.appendChild(select('Return-to-learn step', 'crtl-step', [
      ['1', 'Step 1 — Symptom-limited daily activity'],
      ['2', 'Step 2 — School activities (out of the classroom)'],
      ['3', 'Step 3 — Return to school part time'],
      ['4', 'Step 4 — Return to school full time'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['crtl-step'], () => safe(o, () => {
      const r = M.concussionRtlStep({ step: val('crtl-step') });
      if (!r.valid) { note(o, r.message || 'Select a step.'); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Activity', value: r.activity },
        { label: 'Goal', value: r.goal },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
