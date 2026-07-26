// spec-v504: renderer for the METAVIR liver-fibrosis stage (F0-F4). Group G. The pathologist assigns the
// stage; the tile reports the stage and its histologic description. As a stage descriptor it reports the stage
// the pathologist has assigned.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the METAVIR fibrosis stage; it never asserts a diagnosis, a
// non-invasive substitute for biopsy, or a treatment decision (lib/metavir-fibrosis-v504.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/metavir-fibrosis-v504.js';
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
  'metavir-fibrosis'(root) {
    note(root, 'The METAVIR fibrosis stage, the histologic staging of liver fibrosis on biopsy. This is the stage read from the biopsy, distinct from the non-invasive serum estimates (FIB-4, NAFLD Fibrosis Score). Pick the stage. F0: no fibrosis; F1: portal fibrosis without septa; F2: portal fibrosis with a few septa; F3: numerous septa without cirrhosis (bridging fibrosis); F4: cirrhosis. METAVIR also grades necroinflammatory activity (A0-A3) separately. Reports the fibrosis stage the pathologist has assigned, not a diagnosis or a treatment decision. Near-neighbor: fib4.');
    root.appendChild(select('METAVIR fibrosis stage', 'metavir-stage', [
      ['F0', 'F0 - no fibrosis'],
      ['F1', 'F1 - portal fibrosis without septa'],
      ['F2', 'F2 - portal fibrosis with a few septa'],
      ['F3', 'F3 - bridging fibrosis (numerous septa, no cirrhosis)'],
      ['F4', 'F4 - cirrhosis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['metavir-stage'], () => safe(o, () => {
      const r = M.metavirFibrosis({ stage: val('metavir-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
