// spec-v339: renderer for the Cormack-Lehane laryngeal-view classification (grades 1-4). Group G.
// The laryngoscopist picks the grade seen at direct laryngoscopy; the tile reports the grade, its
// description, and whether it is a difficult (grade 3-4) view.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the laryngeal-view grade; it never asserts a diagnosis, an
// airway-management plan, or an intubation-success prediction (lib/cormack-lehane-v339.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cormack-lehane-v339.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The airway-management plan stays with the anesthetist or proceduralist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cormack-lehane'(root) {
    note(root, 'Cormack-Lehane classification (Cormack & Lehane 1984) of the laryngeal view at direct laryngoscopy. Pick the grade. 1 most of the glottis visible; 2 only posterior glottis / arytenoids; 3 only the epiglottis; 4 neither glottis nor epiglottis. Grades 3-4 indicate a difficult view. Near-neighbors: el-ganzouri, wilson-airway.');
    root.appendChild(select('Cormack-Lehane grade', 'cl-grade', [
      ['1', '1 — most of the glottis (vocal cords) visible'],
      ['2', '2 — only posterior glottis / arytenoids (2a cords, 2b arytenoids)'],
      ['3', '3 — only the epiglottis, no glottis (3a liftable, 3b adherent)'],
      ['4', '4 — neither glottis nor epiglottis (only soft palate)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['cl-grade'], () => safe(o, () => {
      const r = M.cormackLehane({ grade: val('cl-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
