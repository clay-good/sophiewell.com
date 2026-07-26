// spec-v505: renderer for the METAVIR necroinflammatory activity grade (A0-A3). Group G. Companion to the
// fibrosis-stage tile (metavir-fibrosis). The pathologist assigns the grade; the tile reports the grade and
// its description. As a grade descriptor it reports the grade the pathologist has assigned.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the METAVIR activity grade; it never asserts a diagnosis, a
// non-invasive substitute for biopsy, or a treatment decision (lib/metavir-activity-v505.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/metavir-activity-v505.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the hepatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'metavir-activity'(root) {
    note(root, 'The METAVIR necroinflammatory activity grade, the second axis of the METAVIR system, derived from the combination of piecemeal (interface) necrosis and lobular necrosis. A METAVIR read is reported as an activity grade and a fibrosis stage together, for example A2F3. Pick the grade. A0: none; A1: mild; A2: moderate; A3: severe. Activity describes ongoing necroinflammation; fibrosis describes accumulated scarring. Reports the grade the pathologist has assigned, not a diagnosis or a treatment decision. Companion tile: metavir-fibrosis.');
    root.appendChild(select('METAVIR activity grade', 'metavir-activity-grade', [
      ['A0', 'A0 - no activity'],
      ['A1', 'A1 - mild activity'],
      ['A2', 'A2 - moderate activity'],
      ['A3', 'A3 - severe activity'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['metavir-activity-grade'], () => safe(o, () => {
      const r = M.metavirActivity({ grade: val('metavir-activity-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
