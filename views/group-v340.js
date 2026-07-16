// spec-v340: renderer for the Clark level of a cutaneous melanoma (levels I-V). Group G. The
// pathologist picks the anatomic level of dermal invasion; the tile reports the level, its
// description, and whether it is a deeper (level IV-V) invasion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Clark level; it never asserts a diagnosis, a staging decision,
// or a prognosis (lib/clark-level-v340.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/clark-level-v340.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The staging and management decisions stay with the clinician and the pathologist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'clark-level'(root) {
    note(root, 'Clark level (Clark 1969) of a cutaneous melanoma — the anatomic skin layer invaded. Pick the level. I in situ (epidermis); II papillary dermis (partial); III fills papillary dermis; IV reticular dermis; V subcutaneous fat. Deeper levels (IV-V) historically carried higher risk. Modern staging uses AJCC TNM with Breslow thickness. Near-neighbors: melanoma-t-stage.');
    root.appendChild(select('Clark level', 'clark-lvl', [
      ['I', 'I — intraepidermal (melanoma in situ)'],
      ['II', 'II — papillary dermis (partial)'],
      ['III', 'III — fills the papillary dermis (to reticular interface)'],
      ['IV', 'IV — reticular dermis'],
      ['V', 'V — subcutaneous fat'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['clark-lvl'], () => safe(o, () => {
      const r = M.clarkLevel({ level: val('clark-lvl') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Level', value: r.level },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
