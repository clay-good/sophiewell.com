// spec-v919 §2: renderer for just-culture — the three Just Culture behaviors and the response
// each one calls for (Communication & Handoff, Group H).
//
// The outcome is collected and then reported as having changed nothing. That is the point of the
// page, not an oversight.
//
// Each select is written as `'<dom-id>', J.SOME_OPTIONS` so that scripts/lib/option-labels.mjs,
// which reads views statically, resolves the option text from the exported list.

import { el, clear } from '../lib/dom.js';
import * as J from '../lib/just-culture-v919.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'just-culture'(root) {
    selectField(root, 'The behavior', 'jc-behavior', J.BEHAVIOR_OPTIONS);
    selectField(root, 'What happened to the patient', 'jc-outcome', J.OUTCOME_OPTIONS);
    checkField(root, 'The same at-risk choice has repeated after coaching', 'jc-repeated');

    const ids = ['jc-behavior', 'jc-outcome', 'jc-repeated'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = J.justCulture({
        behavior: val('jc-behavior'),
        outcome: val('jc-outcome'),
        repeatedAfterCoaching: checked('jc-repeated'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.outcomeNote);
      note(o, r.repeatNote);
      note(o, r.consoleNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reports the published response for a behavior someone has already characterized. It does not characterize the behavior, and it is not a disciplinary decision.' }));
  },
};
