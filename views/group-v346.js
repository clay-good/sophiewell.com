// spec-v346: renderer for the Catterall classification of Legg-Calve-Perthes disease (groups I-IV).
// Group G. The clinician picks the extent of capital-femoral-epiphysis involvement; the tile reports
// the group, its description, and whether it is a more extensive (group III-IV) involvement.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Catterall group; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/catterall-perthes-v346.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/catterall-perthes-v346.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the pediatric orthopedic surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'catterall-perthes'(root) {
    note(root, 'Catterall classification (Catterall 1971) of Legg-Calve-Perthes disease (childhood osteonecrosis of the femoral head) — how much of the capital femoral epiphysis is involved. Pick the group. I anterior epiphysis only (best prognosis); II anterior and central, pillars preserved; III most of the epiphysis ("head within a head"); IV the entire epiphysis. More extensive involvement (III-IV) carries a worse prognosis. The "head-at-risk" signs are separate modifiers. Near-neighbors: ficat-arlet, lichtman-kienbock.');
    root.appendChild(select('Catterall group', 'catterall-group', [
      ['I', 'I — anterior epiphysis only (best prognosis)'],
      ['II', 'II — anterior and central, pillars preserved'],
      ['III', 'III — most of the epiphysis ("head within a head")'],
      ['IV', 'IV — the entire epiphysis'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['catterall-group'], () => safe(o, () => {
      const r = M.catterallPerthes({ group: val('catterall-group') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Group', value: r.group },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
