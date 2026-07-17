// spec-v393: renderer for the Lauren classification of gastric carcinoma (intestinal / diffuse / mixed).
// Group G. The pathologist picks the type; the tile reports the type and its histological description.
// As a histologic type descriptor it does not flag any type as abnormal.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Lauren type; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/lauren-gastric-v393.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lauren-gastric-v393.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the oncology / pathology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lauren-gastric'(root) {
    note(root, 'Lauren classification of gastric carcinoma, by histological growth pattern. Pick the type. Intestinal: cohesive cells retaining glandular structure (chronic gastritis / intestinal metaplasia). Diffuse: poorly cohesive cells, signet-ring cells, no gland formation (classically a worse prognosis). Mixed: both components. Near-neighbors: hill-flap-valve.');
    root.appendChild(select('Lauren type', 'lauren-type', [
      ['intestinal', 'Intestinal - cohesive, glandular'],
      ['diffuse', 'Diffuse - poorly cohesive, signet-ring'],
      ['mixed', 'Mixed - both components'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lauren-type'], () => safe(o, () => {
      const r = M.laurenGastric({ type: val('lauren-type') });
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
