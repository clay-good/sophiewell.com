// spec-v332: renderer for the Haggitt classification of a malignant colorectal polyp (levels
// 0-4). Group G. The pathologist / clinician picks the level from the depth of invasion relative
// to the polyp anatomy; the tile reports the level, its description, and whether it is a
// higher-risk (level 4 / sessile) lesion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the invasion level; it never asserts a diagnosis, a resection
// recommendation, or a metastasis prediction (lib/haggitt-v332.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/haggitt-v332.js';
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
  'haggitt-level'(root) {
    note(root, 'Haggitt classification (Haggitt 1985). Pick the level from how deeply the invasive carcinoma has invaded relative to the polyp anatomy. Levels 1–3 (pedunculated, favorable histology) carry a low risk of adverse outcome; level 4 — and every invasive sessile polyp, which is level 4 by definition — carries a higher lymph-node-metastasis risk. Near-neighbors: paris-classification, siewert.');
    root.appendChild(select('Haggitt level', 'hag-level', [
      ['0', '0 — carcinoma in situ / intramucosal (not through muscularis mucosae)'],
      ['1', '1 — submucosa of the polyp head'],
      ['2', '2 — neck (head–stalk junction)'],
      ['3', '3 — stalk of the polyp'],
      ['4', '4 — bowel-wall submucosa below the stalk (all sessile = level 4)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['hag-level'], () => safe(o, () => {
      const r = M.haggitt({ level: val('hag-level') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Level', value: r.level },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
