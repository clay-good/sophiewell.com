// spec-v895 §2: renderer for gadolinium-nsf — nephrogenic systemic fibrosis risk before a
// gadolinium-based contrast agent (Clinical Scoring & Risk, Group G).
//
// The group-over-eGFR sentence prints on every result, because the outdated blanket rule is what
// a reader arrives holding.

import { el, clear } from '../lib/dom.js';
import * as G from '../lib/gadolinium-nsf-v895.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gadolinium-nsf'(root) {
    note(root, 'Which agent group is used decides this more than the filtration rate does. The old blanket rule below an eGFR of 30 came from one group only.');

    root.appendChild(el('h2', { text: 'The agent' }));
    // Written out rather than mapped from the lib constants: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Agent group', 'gad-agentgroup', [
      { value: 'group-2', text: 'Group II: gadobenate, gadobutrol, gadoterate, gadoteridol, gadopiclenol' },
      { value: 'group-1', text: 'Group I: gadodiamide, gadopentetate, gadoversetamide' },
      { value: 'group-3', text: 'Group III: gadoxetate' },
      { value: 'unknown', text: 'Not known which agent will be used' },
    ]);

    root.appendChild(el('h2', { text: 'The kidneys' }));
    selectField(root, 'Kidney function', 'gad-renalstate', [
      { value: 'normal', text: 'Stable kidney function, eGFR 30 or above' },
      { value: 'ckd-low', text: 'Stable chronic kidney disease, eGFR below 30' },
      { value: 'dialysis', text: 'On dialysis' },
      { value: 'aki', text: 'Acute kidney injury' },
    ]);

    const o = out(); root.appendChild(o);
    wire(['gad-agentgroup', 'gad-renalstate'], () => safe(o, () => {
      const r = G.gadoliniumNsf({
        agentGroup: val('gad-agentgroup'),
        renalState: val('gad-renalstate'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.akiNote) note(o, r.akiNote);
      if (r.screeningNote) note(o, r.screeningNote);
      note(o, r.groupOverEgfrNote);
      note(o, r.dialysisNote);
      note(o, r.otherQuestionsNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published grouping to an agent and a filtration rate already known. It does not choose an agent, and it does not authorize a scan.' }));
  },
};
