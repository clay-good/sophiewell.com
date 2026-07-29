// spec-v607: renderer for the modified Sartorius score. Group G. Sections are h2 (an h3 under the page h1 is
// a heading-level skip). Nodules and draining fistulas are asked as SEPARATE counts, never as one "lesion"
// count, because a fistula is worth six nodules (lib/sartorius-hs-v607.js).
//
// Per spec-v11 section 5.3 this measures extent; it never diagnoses, never selects treatment, and never
// stands in for pain, drainage, odor or quality of life.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sartorius-hs-v607.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1' }));
  return wrap;
}
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

export const renderers = {
  'sartorius-hs'(root) {
    note(root, M.REGIONAL_NOTE);

    heading(root, 'Lesion counts for ONE region — counted separately, never together');
    root.appendChild(number(`Nodules — ${M.NODULE_POINTS} point each`, 'sart-nodules'));
    root.appendChild(number(`Draining fistulas — ${M.FISTULA_POINTS} points each`, 'sart-fistulas'));
    note(root, M.FISTULA_NOTE);

    heading(root, 'Distance between lesions in this region');
    root.appendChild(select('Longest distance', 'sart-distance',
      [['', '--'], ...M.DISTANCE_BANDS.map((d) => [d.value, `${d.text} — ${d.points}`])]));
    note(root, M.DISTANCE_NOTE);

    heading(root, 'Separation by normal skin');
    root.appendChild(select('Are the lesions separated by normal skin?', 'sart-separated',
      [['', '--'], ['yes', `Yes — 0`], ['no', `No — ${M.SEPARATION_POINTS}`]]));
    note(root, M.HURLEY_NOTE);

    const o = out(); root.appendChild(o);
    wire(['sart-nodules', 'sart-fistulas', 'sart-distance', 'sart-separated'], () => safe(o, () => {
      const r = M.sartoriusRegion({
        nodules: val('sart-nodules'), fistulas: val('sart-fistulas'),
        distance: val('sart-distance'), separatedByNormalSkin: val('sart-separated'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Nodules', value: `${r.nodulePoints}` },
        { label: 'Fistulas', value: `${r.fistulaPoints}` },
        { label: 'Distance', value: `${r.distancePoints}` },
        { label: 'Separation', value: `${r.separationPoints}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why no severity band is shown');
    note(root, M.SINGLE_SOURCED_BANDS);
    note(root, M.UNBOUNDED_NOTE);
    note(root, M.SUPERSEDED_NOTE);
    postureNote(root);
  },
};
