// spec-v538: renderer for the NEOS score. Group G. Five yes/no selects under an h2 section heading (never h3
// - an h3 under the page h1 is a heading-level skip).
//
// The result shows a probability ONLY for the scores the source published (0 or 1, and 4 or 5). For a score
// of 2 or 3 it shows the score and an explicit statement that no probability was published, rather than a
// blank or an interpolated figure (lib/neos-v538.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a group-level
// prognostic score; it never predicts an individual outcome and never supports limiting treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neos-v538.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The care decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'neos'(root) {
    note(root, 'The NEOS score predicts poor functional status one year after anti-NMDA receptor encephalitis, meaning a modified Rankin Scale of 3 or more. Five predictors, one point each. Two of them concern treatment timing and need four weeks to have passed, so this is not an early triage tool. The source published a probability only for a score of 0 or 1 and for 4 or 5 — none is shown for 2 or 3, because none was printed. Prolonged severe illness in this disease is compatible with good recovery.');

    heading(root, 'Predictors');
    const ids = [];
    for (const p of M.NEOS_PREDICTORS) {
      const id = `neos-${p.key}`;
      ids.push(id);
      root.appendChild(select(`${p.text}. ${p.detail}`, id, YES_NO));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const p of M.NEOS_PREDICTORS) args[p.key] = val(`neos-${p.key}`);
      const r = M.neos(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Score', value: `${r.total} of 5` },
        { label: 'Published probability', value: r.probabilityPublished ? r.probability : 'none published for this score' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
