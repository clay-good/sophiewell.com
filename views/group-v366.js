// spec-v366: renderer for the anatomic zones of the neck for penetrating trauma (Zones I-III). Group G.
// The clinician picks the zone; the tile reports the zone's boundaries, the structures at risk, and the
// surgical-access consideration.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the anatomic zone; it never asserts a diagnosis, a management decision,
// or a prognosis (lib/neck-zone-v366.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neck-zone-v366.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Any penetrating neck injury is high-stakes; the management decision stays with the trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'neck-zone'(root) {
    note(root, 'Anatomic zones of the neck for penetrating trauma. Pick the zone. I: sternal notch to cricoid cartilage; II: cricoid to the angle of the mandible; III: angle of the mandible to the skull base. The zone describes the structures at risk and surgical-access considerations. The modern "no-zone" approach drives management by hard signs of injury + CT angiography rather than by zone alone. Near-neighbors: iss-rts.');
    root.appendChild(select('Neck zone', 'neck-zone', [
      ['I', 'Zone I - sternal notch / clavicles to the cricoid cartilage'],
      ['II', 'Zone II - cricoid cartilage to the angle of the mandible'],
      ['III', 'Zone III - angle of the mandible to the base of the skull'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['neck-zone'], () => safe(o, () => {
      const r = M.neckZone({ zone: val('neck-zone') });
      resultRow(o, [
        { text: r.band },
        { label: 'Zone', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
