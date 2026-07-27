// spec-v518: renderer for the Childhood Asthma Control Test (c-ACT). Group G. Four child selects (0-3) and
// three caregiver selects (0-5), total 0-27, under two h2 section headings (never h3 - an h3 under the page
// h1 is a heading-level skip).
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums what a child and a caregiver report; it never asserts a diagnosis, a
// lung-function finding, or an indication to change therapy (lib/childhood-act-v518.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/childhood-act-v518.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The therapy decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'childhood-act'(root) {
    note(root, 'The Childhood Asthma Control Test, for children roughly 4 to 11 years old. It is a different instrument from the adult ACT, not a simplified version: the child answers four items scored 0 to 3 and the caregiver answers three items about the past four weeks scored 0 to 5, for a total of 0 to 27. A total of 19 or less is not well controlled. The cut point is the same number as the adult ACT but sits on a different scale.');

    const ids = [];

    heading(root, 'Answered by the child');
    for (const item of M.CHILD_ITEMS) {
      const id = `cact-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    }

    heading(root, 'Answered by the caregiver');
    for (const item of M.PARENT_ITEMS) {
      const id = `cact-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of [...M.CHILD_ITEMS, ...M.PARENT_ITEMS]) args[item.key] = val(`cact-${item.key}`);
      const r = M.childhoodAct(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
        { label: 'Child', value: `${r.childTotal} of 12` },
        { label: 'Caregiver', value: `${r.parentTotal} of 15` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
