// spec-v336: renderer for the JNET classification (Japan NBI Expert Team) of a colorectal lesion
// (types 1 / 2A / 2B / 3). Group G. The endoscopist picks the JNET type from the lesion's vessel
// and surface pattern on magnifying narrow-band imaging; the tile reports the type, its usual
// histologic correlate, and whether the pattern raises concern for deep invasion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the JNET type; it never asserts a tissue diagnosis, a resection
// recommendation, or a cancer diagnosis (lib/jnet-v336.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/jnet-v336.js';
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
  'jnet-classification'(root) {
    note(root, 'JNET classification (Japan NBI Expert Team; Sano 2016), read on magnifying narrow-band imaging. Pick the type from the lesion’s vessel and surface pattern. Type 1 is hyperplastic / sessile-serrated (non-neoplastic); 2A is low-grade adenoma; 2B is high-grade neoplasia / shallow submucosal cancer; 3 suggests deep submucosal invasive cancer. Refines NICE by splitting type 2 into 2A/2B. Near-neighbors: nice-classification, kudo-pit-pattern.');
    root.appendChild(select('JNET type', 'jnet-type', [
      ['1', '1 — invisible vessels, regular spots (hyperplastic / sessile-serrated)'],
      ['2A', '2A — regular vessels and surface (low-grade adenoma)'],
      ['2B', '2B — irregular vessels and surface (high-grade / shallow submucosal)'],
      ['3', '3 — loose/interrupted vessels, amorphous surface (deep invasion)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['jnet-type'], () => safe(o, () => {
      const r = M.jnet({ type: val('jnet-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
