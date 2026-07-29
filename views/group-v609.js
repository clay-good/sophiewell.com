// spec-v609: renderer for the Hijdra sum score. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The cisternal and ventricular selects carry DIFFERENT option wording, because the two
// halves of this instrument define their 0-to-3 levels differently (lib/hijdra-v609.js). Paired sites are
// listed left and right as separate rows so they cannot be scored once by accident.
//
// Per spec-v11 section 5.3 this quantifies blood on CT; it never diagnoses, never grades clinical severity,
// and never decides treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hijdra-v609.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, levels) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  s.appendChild(el('option', { value: '', text: '--' }));
  for (const lv of levels) s.appendChild(el('option', { value: String(lv.value), text: `${lv.value} - ${lv.text}` }));
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

const aid = (k) => `hij-${k}`;

export const renderers = {
  hijdra(root) {
    note(root, M.SUM_NOTE);

    heading(root, `Cisterns and fissures — ${M.CISTERNS.length} sites, 0 to ${M.CISTERNAL_MAX}`);
    for (const s of M.CISTERNS) root.appendChild(select(s.text, aid(s.key), M.CISTERN_LEVELS));
    note(root, M.PAIRED_NOTE);

    heading(root, `Ventricles — ${M.VENTRICLES.length} sites, 0 to ${M.VENTRICULAR_MAX}, different wording`);
    for (const s of M.VENTRICLES) root.appendChild(select(s.text, aid(s.key), M.VENTRICLE_LEVELS));
    note(root, M.ANCHOR_NOTE);

    const o = out(); root.appendChild(o);
    const ids = [...M.CISTERNS, ...M.VENTRICLES].map((s) => aid(s.key));
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const s of [...M.CISTERNS, ...M.VENTRICLES]) input[s.key] = val(aid(s.key));
      const r = M.hijdraScore(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Cisternal', value: `${r.cisternal} of ${r.cisternalMax}` },
        { label: 'Ventricular', value: `${r.ventricular} of ${r.ventricularMax}` },
        { label: 'Sites with blood', value: `${r.cisternsWithBlood + r.ventriclesWithBlood} of ${M.CISTERNS.length + M.VENTRICLES.length}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why no severity band is shown');
    note(root, M.NO_BANDS_NOTE);
    heading(root, 'Which scale is best depends on which outcome');
    note(root, M.OUTCOME_NOTE);
    postureNote(root);
  },
};
