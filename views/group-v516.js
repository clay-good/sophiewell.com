// spec-v516: renderer for the Asthma Control Test (ACT). Group G. Five patient-rated selects, each with its
// own anchor wording, summed to 5-25.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums what the patient reports; it never asserts a diagnosis, a lung-function
// finding, or an indication to change therapy (lib/asthma-control-test-v516.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/asthma-control-test-v516.js';
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The therapy decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'asthma-control-test'(root) {
    note(root, 'The Asthma Control Test, five patient-rated items about the past four weeks. Each item scores 1 to 5 and 5 is always the best answer; the total runs 5 to 25, where 25 is totally controlled, 20 to 24 is well controlled, and 19 or less is not well controlled. It measures control between visits, not acute severity and not lung function.');

    const ids = [];
    M.ACT_ITEMS.forEach((item, i) => {
      const id = `act-q${i + 1}`;
      ids.push(id);
      root.appendChild(select(`${i + 1}. ${item.text}`, id, item.options.map((o) => [o.value, o.text])));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`q${i + 1}`] = val(id); });
      const r = M.asthmaControlTest(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 25` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
