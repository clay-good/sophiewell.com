// spec-v295: renderer for the Reisberg Global Deterioration Scale (GDS) for
// dementia. Group G (clinical scoring & reference). The clinician selects the
// single most appropriate global stage (1-7); the tile reports the published
// stage label and clinical characteristics and flags stage 5 and beyond, at
// which the patient can no longer survive without assistance.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the guideline descriptor; it never asserts a
// diagnosis (lib/gds-v295.js). Companion to the FAST tile (fast-dementia).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gds-v295.js';
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
  'global-deterioration-scale'(root) {
    note(root, 'Reisberg Global Deterioration Scale (GDS) for dementia. Select the single most appropriate global stage to see its published label and clinical characteristics. Stages 1–3 are pre-dementia; 4–7 are dementia. At stage 5 and beyond the patient can no longer survive without assistance. Companion to FAST (finer functional substaging). Near-neighbors: fast-dementia, cdr-sob, bims.');
    root.appendChild(select('Most appropriate GDS global stage', 'gds-stage', [
      ['1', 'Stage 1 — no cognitive decline'],
      ['2', 'Stage 2 — very mild decline (age-associated memory impairment)'],
      ['3', 'Stage 3 — mild decline (mild cognitive impairment)'],
      ['4', 'Stage 4 — moderate decline (mild dementia)'],
      ['5', 'Stage 5 — moderately severe decline (moderate dementia)'],
      ['6', 'Stage 6 — severe decline (moderately severe dementia)'],
      ['7', 'Stage 7 — very severe decline (severe dementia)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['gds-stage'], () => safe(o, () => {
      const r = M.gdsStage({ stage: val('gds-stage') });
      if (!r.valid) { note(o, r.message || 'Select a stage.'); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'GDS stage', value: r.stage },
      ];
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
