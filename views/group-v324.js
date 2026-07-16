// spec-v324: renderer for the Wexner (Cleveland Clinic) fecal incontinence score.
// Group G. The clinician (or patient) sets the frequency of each of the five items; the
// tile reports the total 0-20 score.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cited score; it never asserts a diagnosis or a
// treatment decision (lib/wexner-v324.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/wexner-v324.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  const opts = [
    ['0', 'Never'],
    ['1', 'Rarely (less than once a month)'],
    ['2', 'Sometimes (monthly, less than weekly)'],
    ['3', 'Usually (weekly, less than daily)'],
    ['4', 'Always (daily or more)'],
  ];
  for (const [value, text] of opts) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['wex-solid', 'wex-liquid', 'wex-gas', 'wex-pad', 'wex-lifestyle'];

export const renderers = {
  'wexner'(root) {
    note(root, 'Wexner (Cleveland Clinic) fecal incontinence score (Jorge & Wexner 1993). Set how often each applies. Each item scores 0 (never) to 4 (daily); total 0–20, where 0 is perfect continence and 20 is complete incontinence. Near-neighbors: bristol-girth.');
    root.appendChild(select('Incontinence to solid stool', 'wex-solid'));
    root.appendChild(select('Incontinence to liquid stool', 'wex-liquid'));
    root.appendChild(select('Incontinence to gas', 'wex-gas'));
    root.appendChild(select('Wears a pad', 'wex-pad'));
    root.appendChild(select('Lifestyle alteration', 'wex-lifestyle'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.wexner({
        solid: val('wex-solid'), liquid: val('wex-liquid'), gas: val('wex-gas'),
        pad: val('wex-pad'), lifestyle: val('wex-lifestyle'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.total} / 20` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
