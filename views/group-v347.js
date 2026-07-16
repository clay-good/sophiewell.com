// spec-v347: renderer for the Herring lateral pillar classification of Legg-Calve-Perthes disease
// (groups A, B, B/C border, C). Group G. The clinician picks the lateral-pillar height group; the
// tile reports the group, its description, and whether it is a poorer-prognosis (B/C or C) group.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Herring group; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/herring-pillar-v347.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/herring-pillar-v347.js';
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
  'herring-pillar'(root) {
    note(root, 'Herring lateral pillar classification (Herring 1992; B/C border added 2004) of Legg-Calve-Perthes disease — the height of the lateral pillar of the femoral head at fragmentation. Pick the group. A pillar not involved (best prognosis); B pillar > 50% of original height; B/C border narrow or poorly ossified at about 50%; C pillar < 50% (poorest prognosis). Prognosis also depends strongly on the age at onset. Near-neighbors: catterall-perthes, ficat-arlet.');
    root.appendChild(select('Herring group', 'herring-group', [
      ['A', 'A — lateral pillar not involved (best prognosis)'],
      ['B', 'B — lateral pillar > 50% of original height'],
      ['BC', 'B/C border — narrow or poorly ossified at about 50%'],
      ['C', 'C — lateral pillar < 50% (poorest prognosis)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['herring-group'], () => safe(o, () => {
      const r = M.herringPillar({ group: val('herring-group') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Group', value: r.group },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
