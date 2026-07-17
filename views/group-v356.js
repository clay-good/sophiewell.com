// spec-v356: renderer for the CEAP clinical classification (C0-C6) of chronic venous disease. Group G.
// The clinician picks the clinical class; the tile reports the class, its description, and whether it is
// an advanced (C4-C6) class.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the CEAP clinical class; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/ceap-venous-v356.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ceap-venous-v356.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ceap-venous'(root) {
    note(root, 'CEAP clinical classification (Eklof 2004; 2020 update) of chronic venous disease. Pick the clinical class. C0: no signs; C1: telangiectasias / reticular veins; C2: varicose veins; C3: edema; C4a: pigmentation / eczema; C4b: lipodermatosclerosis / atrophie blanche; C5: healed venous ulcer; C6: active venous ulcer. Complements the Venous Clinical Severity Score. Near-neighbors: vcss.');
    root.appendChild(select('CEAP clinical class', 'ceap-class', [
      ['C0', 'C0 - no visible or palpable signs'],
      ['C1', 'C1 - telangiectasias / reticular veins'],
      ['C2', 'C2 - varicose veins'],
      ['C3', 'C3 - edema'],
      ['C4a', 'C4a - pigmentation / eczema'],
      ['C4b', 'C4b - lipodermatosclerosis / atrophie blanche'],
      ['C5', 'C5 - healed venous ulcer'],
      ['C6', 'C6 - active venous ulcer'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ceap-class'], () => safe(o, () => {
      const r = M.ceapVenous({ cls: val('ceap-class') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
