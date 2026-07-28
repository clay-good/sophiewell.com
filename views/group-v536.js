// spec-v536: renderer for the Hardman index. Group G. Five yes/no selects under an h2 section heading (never
// h3 - an h3 under the page h1 is a heading-level skip).
//
// The intro and every result carry the refutation, because this score's original "3 or more means certain
// death" finding entered practice as a rule for denying surgery and has been repeatedly refuted. A renderer
// that printed the score and the 1996 mortality figure alone would reproduce the exact error the later
// literature exists to correct (lib/hardman-v536.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a historical
// score with its refutation; it never identifies a patient who should be denied an operation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hardman-v536.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The operative decision stays with the surgeon and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hardman'(root) {
    note(root, 'The Hardman index counts five factors present at presentation with a ruptured abdominal aortic aneurysm. The original 1996 series reported that all eight patients with three or more factors died, and that figure entered practice as a rule for denying surgery — it has since been repeatedly refuted. A pooled analysis of about 970 patients found 77 percent mortality at three or more and concluded the index cannot be used as an absolute limit for denial of surgery. A ruptured aneurysm is fatal without repair, and this score does not identify patients who should be denied an operation.');

    heading(root, 'Factors present at presentation');
    const ids = [];
    for (const c of M.HARDMAN_CRITERIA) {
      const id = `hard-${c.key}`;
      ids.push(id);
      root.appendChild(select(`${c.text}. ${c.detail}`, id, YES_NO));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const c of M.HARDMAN_CRITERIA) args[c.key] = val(`hard-${c.key}`);
      const r = M.hardman(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band },
        { label: 'Index', value: `${r.total} of 5` },
        { label: 'Original 1996 series', value: r.originalSeriesMortality },
      ];
      if (r.atOrAboveThree) rows.push({ label: 'Later evidence', value: r.refutation });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
