// spec-v173 §2.6 (built as spec-v294): renderer for the Functional
// Assessment Staging Tool (FAST) for dementia. Group G (clinical scoring &
// reference). The clinician selects the highest FAST stage the patient has
// reached; the tile reports the published functional descriptor and, for stage
// 7a and beyond, the Medicare dementia hospice-eligibility context.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the guideline descriptor and hospice context; it
// never asserts a diagnosis or an eligibility determination (Design in
// lib/fast-dementia-v294.js). Id intentionally distinct from the live `fast` =
// FAST / BE-FAST stroke tile.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fast-dementia-v294.js';
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
  'fast-dementia'(root) {
    note(root, 'Functional Assessment Staging Tool (FAST) for dementia. Select the highest consecutive stage the patient has reached to see its functional descriptor. Stage 6 covers dressing through incontinence (6a–6e); stage 7 covers speech loss through loss of head control (7a–7f). At stage 7a or beyond, FAST plus a named medical complication is part of the Medicare dementia hospice-eligibility guideline. Near-neighbors: global-deterioration-scale, cdr-sob, bims.');
    root.appendChild(select('Highest FAST stage reached', 'fast-stage', [
      ['1', 'Stage 1 — no difficulty'],
      ['2', 'Stage 2 — subjective forgetfulness'],
      ['3', 'Stage 3 — decreased job functioning'],
      ['4', 'Stage 4 — decreased complex-task ability'],
      ['5', 'Stage 5 — needs help choosing clothing'],
      ['6a', 'Stage 6a — difficulty dressing'],
      ['6b', 'Stage 6b — unable to bathe properly'],
      ['6c', 'Stage 6c — mechanics of toileting lost'],
      ['6d', 'Stage 6d — urinary incontinence'],
      ['6e', 'Stage 6e — fecal incontinence'],
      ['7a', 'Stage 7a — speech ≤ a half-dozen words/day'],
      ['7b', 'Stage 7b — speech a single word/day'],
      ['7c', 'Stage 7c — non-ambulatory'],
      ['7d', 'Stage 7d — cannot sit up'],
      ['7e', 'Stage 7e — loss of ability to smile'],
      ['7f', 'Stage 7f — loss of head control'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['fast-stage'], () => safe(o, () => {
      const r = M.fastStage({ stage: val('fast-stage') });
      if (!r.valid) { note(o, r.message || 'Select a stage.'); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FAST stage', value: r.stage },
      ];
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
