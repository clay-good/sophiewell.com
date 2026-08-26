// spec-v805 §2: renderer for amts — the Abbreviated Mental Test Score (Clinical Scoring &
// Risk, Group G). Joins sixcit, rudas, mini-cog, ad8, slums and bims in the brief-screen
// family.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Ten checkboxes,
// one point each; the result reports the score against BOTH cutoffs in common use.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/amts-v805.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is a brief screen that flags the need for fuller assessment. It is affected by education and by language, and it does not diagnose dementia or delirium or tell the two apart.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  amts(root) {
    note(root, 'Ten questions, one point each. Two cutoffs are in common use and they disagree: 6 or below from the validation literature, and under 8 from widespread clinical practice. A score of exactly 7 falls between them, so both are reported rather than one being chosen.');
    root.appendChild(checkField('Age stated correctly', 'amts-age'));
    root.appendChild(checkField('Time to the nearest hour', 'amts-time'));
    root.appendChild(checkField('Recalls the address given at the start of the test', 'amts-addr'));
    root.appendChild(checkField('The current year', 'amts-year'));
    root.appendChild(checkField('The name of the place', 'amts-place'));
    root.appendChild(checkField('Recognizes two people', 'amts-two'));
    root.appendChild(checkField('Date of birth', 'amts-dob'));
    root.appendChild(checkField('The year the First World War started', 'amts-war'));
    root.appendChild(checkField('The name of the present monarch', 'amts-monarch'));
    root.appendChild(checkField('Counts backward from 20 to 1', 'amts-count'));
    const ids = ['amts-age', 'amts-time', 'amts-addr', 'amts-year', 'amts-place', 'amts-two', 'amts-dob', 'amts-war', 'amts-monarch', 'amts-count'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.amts({
        age: checked('amts-age'),
        time: checked('amts-time'),
        addressRecall: checked('amts-addr'),
        year: checked('amts-year'),
        place: checked('amts-place'),
        twoPersons: checked('amts-two'),
        dateOfBirth: checked('amts-dob'),
        warYear: checked('amts-war'),
        monarch: checked('amts-monarch'),
        countBackwards: checked('amts-count'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/10` },
        { label: 'Six-or-below rule', value: r.impairedByValidation ? 'impaired' : 'not impaired' },
        { label: 'Under-eight rule', value: r.impairedByPractice ? 'impaired' : 'not impaired' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
