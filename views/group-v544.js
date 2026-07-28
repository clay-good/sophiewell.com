// spec-v544: renderer for NEMS. Group G. Five yes/no selects plus two three-way selects under two h2 section
// headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Ventilation and vasoactive support are each ONE select with three options, not two yes/no items, because
// their underlying NEMS items are mutually exclusive. That makes the exclusivity structural: there is no
// arrangement of controls that scores both members of either pair, and the ceiling is therefore 56 rather
// than the 66 a naive nine-item form would allow (lib/nems-v544.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports consumed nursing
// workload; it never reports illness severity and never determines staffing.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nems-v544.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Staffing decisions stay with the nursing leadership.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nems'(root) {
    note(root, `The Nine Equivalents of Nursing Manpower Use Score, total 0 to ${M.NEMS_MAX}. It measures the nursing workload a patient consumed over a shift — not how sick they are. Two pairs of items are mutually exclusive and appear here as single choices: mechanical ventilation excludes supplementary ventilatory care, and multiple vasoactive drugs replaces the single-drug score. That is why the maximum is ${M.NEMS_MAX} and not the ${M.NEMS_NAIVE_SUM} a naive nine-item sum would give. It is not an illness-severity score and not a nurse-to-patient ratio.`);

    heading(root, 'Ventilation and vasoactive support (one choice each — the items within them are mutually exclusive)');
    root.appendChild(select('Ventilatory support', 'nems-ventilation',
      M.NEMS_VENTILATION.map((v) => [v.value, `${v.text} (${v.points})`])));
    root.appendChild(select('Vasoactive or inotropic support', 'nems-vasoactive',
      M.NEMS_VASOACTIVE.map((v) => [v.value, `${v.text} (${v.points})`])));

    heading(root, 'Other items');
    const ids = ['nems-ventilation', 'nems-vasoactive'];
    for (const i of M.NEMS_INDEPENDENT) {
      const id = `nems-${i.key}`;
      ids.push(id);
      root.appendChild(select(`${i.text} (${i.points})`, id, YES_NO));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { ventilation: val('nems-ventilation'), vasoactive: val('nems-vasoactive') };
      for (const i of M.NEMS_INDEPENDENT) args[i.key] = val(`nems-${i.key}`);
      const r = M.nems(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'NEMS', value: `${r.total} of ${r.max}` },
        { label: 'Ventilation', value: `${r.ventilation} (${r.ventilationPoints})` },
        { label: 'Vasoactive', value: `${r.vasoactive} (${r.vasoactivePoints})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
