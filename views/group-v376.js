// spec-v376: renderer for the Denis classification of a sacral fracture (zones I-III). Group G. The
// clinician picks the zone; the tile reports the zone, its anatomic/neurologic description, and whether
// it is a higher-neurologic-risk (zone II-III) fracture.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Denis zone; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/denis-sacral-v376.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/denis-sacral-v376.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / spine / trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'denis-sacral'(root) {
    note(root, 'Denis classification (Denis 1988) of a sacral fracture, by the relationship of the fracture line to the sacral foramina and central canal. Pick the zone. I: alar (lateral to the foramina), lowest neurologic-injury rate; II: through the foramina, intermediate; III: central canal (medial to the foramina), highest, with bowel / bladder / sexual dysfunction. Near-neighbors: neck-zone.');
    root.appendChild(select('Denis zone', 'denis-zone', [
      ['I', 'Zone I - alar (lateral to the foramina)'],
      ['II', 'Zone II - through the foramina'],
      ['III', 'Zone III - central canal (medial to the foramina)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['denis-zone'], () => safe(o, () => {
      const r = M.denisSacral({ zone: val('denis-zone') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Zone', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
