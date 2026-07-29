// spec-v595: renderer for the ACEF and ACEF II scores. Group G. Sections are h2 (an h3 under the page h1 is
// a heading-level skip). The ejection fraction is labeled as a denominator rather than as a scored item,
// because that is the single thing readers of an additive score get wrong here (lib/acef-v595.js).
//
// Per spec-v11 section 5.3 these are group-level preoperative mortality estimates; the tile never decides
// whether to operate and never presents a high score as a reason to decline surgery.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/acef-v595.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
  return wrap;
}
function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of [['', '--'], ['no', 'No'], ['yes', 'Yes']]) s.appendChild(el('option', { value, text }));
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
  acef(root) {
    note(root, 'Both versions are reported from the same inputs. There is no maximum score: the backbone is a ratio, not a sum of points.');

    heading(root, 'The ratio — age divided by ejection fraction');
    root.appendChild(number('Age (years)', 'acef-age'));
    root.appendChild(number('Left ventricular ejection fraction (%) — this is the DENOMINATOR, not a scored item', 'acef-ef'));
    note(root, M.NONLINEAR_NOTE);

    heading(root, 'The add-ons');
    root.appendChild(number(`Serum creatinine (mg/dL) — above ${M.CREATININE_THRESHOLD} adds ${M.ACEF_CREATININE_POINTS} to ACEF and ${M.ACEF2_CREATININE_POINTS} to ACEF II`, 'acef-creatinine'));
    note(root, M.OPERATOR_NOTE);
    root.appendChild(select(`Emergency surgery? — adds ${M.ACEF2_EMERGENCY_POINTS} to ACEF II only`, 'acef-emergency'));
    note(root, M.ELECTIVE_NOTE);
    root.appendChild(number(`Hematocrit (%) — ACEF II adds ${M.HCT_POINTS_PER_POINT_BELOW} for each point below ${M.HCT_REFERENCE}`, 'acef-hematocrit'));
    note(root, M.HCT_NOTE);

    const ids = ['acef-age', 'acef-ef', 'acef-creatinine', 'acef-emergency', 'acef-hematocrit'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.acef({
        age: val('acef-age'), ejectionFraction: val('acef-ef'),
        creatinine: val('acef-creatinine'), emergency: val('acef-emergency'),
        hematocrit: val('acef-hematocrit'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'ACEF', value: `${r.acef}` },
        { label: 'ACEF II', value: `${r.acefII}` },
        { label: 'Age / EF', value: `${r.ratio}` },
        { label: 'Hematocrit points', value: `${r.hematocritPoints}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why there is no maximum');
    note(root, M.RATIO_NOTE);
    note(root, M.VERSION_NOTE);
    postureNote(root);
  },
};
