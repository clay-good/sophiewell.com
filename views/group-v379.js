// spec-v379: renderer for the Tile (AO/Tile) classification of a pelvic ring injury (types A/B/C).
// Group G. The clinician picks the type; the tile reports the type, its stability description, and
// whether it is an unstable (type B-C) injury.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Tile type; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/tile-pelvic-v379.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tile-pelvic-v379.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'tile-pelvic'(root) {
    note(root, 'Tile (AO/Tile) classification of a pelvic ring injury, by the mechanical stability of the posterior ring. Pick the type. A: stable (posterior ring intact); B: rotationally unstable but vertically stable (incomplete posterior disruption; open-book or lateral-compression); C: rotationally and vertically unstable (complete posterior disruption). Near-neighbors: iss-rts.');
    root.appendChild(select('Tile type', 'tile-type', [
      ['A', 'Type A - stable (posterior ring intact)'],
      ['B', 'Type B - rotationally unstable, vertically stable'],
      ['C', 'Type C - rotationally and vertically unstable'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['tile-type'], () => safe(o, () => {
      const r = M.tilePelvic({ type: val('tile-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
