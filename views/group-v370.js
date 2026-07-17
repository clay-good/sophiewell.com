// spec-v370: renderer for the Hartofilakidis classification of adult DDH (types A/B/C). Group G. The
// clinician picks the type; the tile reports the type, its description, and whether it is a dislocation
// (type B-C).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Hartofilakidis type; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/hartofilakidis-ddh-v370.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hartofilakidis-ddh-v370.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The surgical decision stays with the orthopedic surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hartofilakidis-ddh'(root) {
    note(root, 'Hartofilakidis classification (Hartofilakidis 1988) of adult developmental dysplasia of the hip - the second widely used adult-DDH classification alongside Crowe. Pick the type. A: dysplasia (head within the true acetabulum); B: low dislocation (false acetabulum partially overlaps the true one); C: high dislocation (false acetabulum with no connection to the true one). Near-neighbors: crowe-ddh.');
    root.appendChild(select('Hartofilakidis type', 'hart-type', [
      ['A', 'Type A - dysplasia (head within the true acetabulum)'],
      ['B', 'Type B - low dislocation (false acetabulum partially overlaps)'],
      ['C', 'Type C - high dislocation (false acetabulum, no connection)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hart-type'], () => safe(o, () => {
      const r = M.hartofilakidisDdh({ type: val('hart-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
