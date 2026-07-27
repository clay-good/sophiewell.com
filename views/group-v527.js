// spec-v527: renderer for the Wayne index (clinical diagnosis of thyrotoxicosis). Group G. Eighteen selects
// under two h2 section headings, symptoms and signs, matching the table's own division (never h3 - an h3
// under the page h1 is a heading-level skip).
//
// Each option's SIGNED point value is shown in its label, including the negative ones, because the negative
// weights are the whole point of the instrument and a reader who cannot see that "prefers heat" costs 5
// points has no way to sanity-check the total (lib/wayne-index-v527.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a clinical index;
// it never asserts a diagnosis of thyrotoxicosis, a cause, or a treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/wayne-index-v527.js';
import { resultRow } from '../lib/result-copy.js';

function signed(points) {
  if (points > 0) return `+${points}`;
  return String(points);
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text, points] of options) {
    s.appendChild(el('option', { value, text: `${text} (${signed(points)})` }));
  }
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis stays with the clinician and the laboratory.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'wayne-index'(root) {
    note(root, `The Wayne index scores eight symptoms and ten signs with signed weights: above 19 is the toxic range, 11 to 19 equivocal, below 11 euthyroid, on a scale running ${M.WAYNE_RANGE.min} to ${M.WAYNE_RANGE.max}. Several weights are negative — preferring heat costs 5 points and an absent palpable thyroid costs 3 — so an exam with nothing found scores below zero, not zero. It was published in 1959, before sensitive TSH assays existed. Thyrotoxicosis today is diagnosed biochemically, and this is not a substitute for TSH and free T4.`);

    const ids = [];
    const addItem = (item) => {
      const id = `wi-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options));
    };

    heading(root, 'Symptoms of recent onset or increased severity');
    for (const item of M.WAYNE_SYMPTOMS) addItem(item);

    heading(root, 'Signs');
    for (const item of M.WAYNE_SIGNS) addItem(item);

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.WAYNE_ITEMS) args[item.key] = val(`wi-${item.key}`);
      const r = M.wayneIndex(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: String(r.total) },
        { label: 'Reading', value: r.reading },
        { label: 'Symptoms', value: signed(r.symptomTotal) },
        { label: 'Signs', value: signed(r.signTotal) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
