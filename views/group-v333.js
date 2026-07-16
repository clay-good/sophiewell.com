// spec-v333: renderer for the Kikuchi classification of submucosal invasion in a sessile malignant
// colorectal lesion (Sm1 / Sm2 / Sm3). Group G. The pathologist / clinician picks the level from
// the depth of submucosal invasion; the tile reports the level, its description, and whether it is
// a higher-risk (Sm2 / Sm3) lesion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the invasion level; it never asserts a diagnosis, a resection
// recommendation, or a metastasis prediction (lib/kikuchi-v333.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/kikuchi-v333.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The endoscopic-vs-surgical management decision stays with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'kikuchi-level'(root) {
    note(root, 'Kikuchi classification (Kikuchi 1995) for a sessile (non-pedunculated) malignant colorectal lesion. Pick the level from how deeply the invasive carcinoma has invaded the submucosa (divided into thirds). Sm1 (upper third) carries a low metastasis risk; Sm2 / Sm3 (middle / lower third) carry a materially higher risk. The sessile counterpart to Haggitt. Near-neighbors: haggitt-level, paris-classification.');
    root.appendChild(select('Kikuchi level', 'kik-level', [
      ['Sm1', 'Sm1 — upper (superficial) third of the submucosa (~0–3% node metastasis)'],
      ['Sm2', 'Sm2 — middle third (~10% node metastasis)'],
      ['Sm3', 'Sm3 — lower third, adjacent to muscularis propria (~25% node metastasis)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['kik-level'], () => safe(o, () => {
      const r = M.kikuchi({ level: val('kik-level') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Level', value: r.level },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
