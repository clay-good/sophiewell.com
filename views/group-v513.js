// spec-v513: renderer for the ASRS v1.1 Part A adult ADHD screener. Group G. Six selects on one 0-4
// frequency scale, but each item counts toward the screen at its own threshold.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile applies the published counting rule; it never asserts a diagnosis and never
// asserts an indication for medication or an accommodation (lib/asrs-v513.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/asrs-v513.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The evaluation stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'asrs'(root) {
    note(root, 'The ASRS v1.1 Part A screener for adult ADHD, over the past six months. The answers are not summed: items 1 to 3 count toward the screen at sometimes or more, items 4 to 6 only at often or more, and four or more counting answers is a positive screen. Each item below shows its own threshold. It is a screen, not a diagnosis.');

    const ids = [];
    const scale = M.FREQUENCY_SCALE.map((o) => [o.value, o.text]);
    M.ASRS_ITEMS.forEach((item, i) => {
      const id = `as-q${i + 1}`;
      ids.push(id);
      const threshold = item.countsAt === 2 ? 'counts at sometimes or more' : 'counts at often or more';
      root.appendChild(select(`${i + 1}. ${item.text} (${threshold})`, id, scale));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`q${i + 1}`] = val(id); });
      const r = M.asrs(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Counting items', value: r.bandLabel },
        { label: 'Raw total (not the screen)', value: `${r.rawTotal} of 24` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
