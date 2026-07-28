// spec-v554: renderer for the Global Acne Grading System. Group G. Regions under an h2 section heading
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Each region select shows its FACTOR in the label, so the multiplication is visible rather than hidden in
// the total, and the trunk option says outright that chest and upper back are one combined region
// (lib/gags-v554.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades severity; it
// never diagnoses acne and never indicates treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gags-v554.js';
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const GRADE_OPTIONS = M.GAGS_GRADES.map((g) => [String(g.value), `${g.value} — ${g.text}`]);

export const renderers = {
  gags(root) {
    note(root, 'The Global Acne Grading System multiplies a fixed factor for each of six regions by a lesion grade from 0 to 4, and sums the products. The factors total 11, so the score runs 0 to 44. Grade each region by its single MOST SEVERE lesion — never by counting lesions or adding lesion types, so a region with comedones, papules and one nodule is grade 4, not 1 plus 2 plus 4.');

    heading(root, 'Grade each region by its most severe lesion');
    for (const region of M.GAGS_REGIONS) {
      root.appendChild(select(`${region.text} — factor ${region.factor}`, `gags-${region.key}`, GRADE_OPTIONS));
    }

    const o = out(); root.appendChild(o);
    wire(M.GAGS_REGIONS.map((r) => `gags-${r.key}`), () => safe(o, () => {
      const input = {};
      for (const region of M.GAGS_REGIONS) input[region.key] = val(`gags-${region.key}`);
      const r = M.gags(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Global score', value: `${r.total} of ${r.max}` },
        { label: 'Severity', value: r.bandAssigned ? r.band : 'no band — the published table leaves 39 unassigned' },
        { label: 'Regions', value: r.regionScores.map((x) => `${x.key} ${x.factor}×${x.grade}=${x.local}`).join(', ') },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
