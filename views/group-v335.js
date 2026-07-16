// spec-v335: renderer for the NICE classification (NBI International Colorectal Endoscopic) of a
// colorectal lesion (types 1 / 2 / 3). Group G. The endoscopist picks the NICE type from the
// lesion's color, vessels, and surface pattern on narrow-band imaging; the tile reports the type,
// its usual histologic correlate, and whether the pattern raises concern for deep invasion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the NICE type; it never asserts a tissue diagnosis, a resection
// recommendation, or a cancer diagnosis (lib/nice-v335.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nice-v335.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The biopsy, resection, and referral decisions stay with the endoscopist and the pathologist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nice-classification'(root) {
    note(root, 'NICE classification (NBI International Colorectal Endoscopic; Hewett 2012 / Hayashi 2013), read on narrow-band imaging without requiring magnification. Pick the type from the lesion’s color, vessels, and surface pattern. Type 1 is hyperplastic (non-neoplastic); type 2 is adenoma; type 3 suggests deep submucosal invasive cancer. Near-neighbors: kudo-pit-pattern, paris-classification.');
    root.appendChild(select('NICE type', 'nice-type', [
      ['1', '1 — same/lighter color, no/lacy vessels, uniform or absent surface (hyperplastic)'],
      ['2', '2 — browner, brown vessels around white structures (adenoma)'],
      ['3', '3 — dark brown, disrupted/missing vessels, amorphous surface (deep invasion)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['nice-type'], () => safe(o, () => {
      const r = M.nice({ type: val('nice-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
