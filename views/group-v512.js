// spec-v512: renderer for the Vaizey (St Marks) fecal incontinence score. Group G. Four frequency selects
// (0-4) plus three weighted yes/no selects, total 0-24.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums what the patient reports; it never asserts a diagnosis, a cause, or an
// indication for biofeedback, neuromodulation, or surgery (lib/vaizey-v512.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vaizey-v512.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the colorectal and pelvic-floor team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vaizey'(root) {
    note(root, 'The Vaizey (St Marks) fecal incontinence score. Rate incontinence for solid stool, for liquid stool, for gas, and alteration in lifestyle over the past four weeks, then answer the three added rows. Total 0 (perfect continence) to 24 (totally incontinent). It sums what the patient reports; it does not identify a cause.');

    const ids = [];

    heading(root, 'Frequency over the past four weeks');
    const scale = M.FREQUENCY_SCALE.map((o) => [o.value, o.text]);
    for (const row of M.FREQUENCY_ROWS) {
      const id = `vz-${row.key}`;
      ids.push(id);
      root.appendChild(select(row.label, id, scale));
    }

    heading(root, 'Added rows');
    for (const row of M.YES_NO_ROWS) {
      const id = `vz-${row.key}`;
      ids.push(id);
      root.appendChild(select(`${row.label} (${row.points} points if yes)`, id, YES_NO));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const row of [...M.FREQUENCY_ROWS, ...M.YES_NO_ROWS]) args[row.key] = val(`vz-${row.key}`);
      const r = M.vaizey(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
        { label: 'Frequency rows', value: String(r.frequencyTotal) },
        { label: 'Added rows', value: String(r.addedTotal) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
