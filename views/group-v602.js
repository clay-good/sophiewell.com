// spec-v602: renderer for the Virginia Radiosurgery AVM Scale. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). Volume is entered as a NUMBER rather than picked from its band, so the
// saturation above 4 cm^3 is visible in the result rather than hidden by the input
// (lib/vras-v602.js).
//
// Per spec-v11 section 5.3 this predicts a radiosurgical outcome at a group level; it never chooses between
// treatment modalities, never plans a dose, and never presents a favourable score as an indication to treat.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vras-v602.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
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
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
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
  vras(root) {
    note(root, `Scores 0 to ${M.VRAS_MAX}. The Pollock-Flickinger score in this catalog answers the same question with a continuous formula — the two share only volume, and neither converts into the other.`);

    heading(root, 'The three items');
    root.appendChild(number('AVM volume (cm^3)', 'vras-volume'));
    for (const b of M.VOLUME_BANDS) note(root, `${b.text}: ${b.points} point${b.points === 1 ? '' : 's'}.`);
    root.appendChild(select(`Eloquent location — ${M.ELOQUENCE_POINTS} point`, 'vras-eloquent', YN));
    root.appendChild(select(`Prior hemorrhage — ${M.HEMORRHAGE_POINTS} point`, 'vras-hemorrhage', YN));
    note(root, M.VOLUME_WEIGHT_NOTE);

    const o = out(); root.appendChild(o);
    wire(['vras-volume', 'vras-eloquent', 'vras-hemorrhage'], () => safe(o, () => {
      const r = M.vras({
        volume: val('vras-volume'), eloquentLocation: val('vras-eloquent'),
        priorHemorrhage: val('vras-hemorrhage'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Outcome band', value: r.outcomeBand },
        { label: 'Favorable outcome', value: `${r.favorablePercent}%` },
        { label: 'Volume item saturated', value: r.volumeSaturated ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Reported favorable outcome by band');
    for (const b of M.OUTCOME_BANDS) note(root, `Score ${b.label}: ${b.favorablePercent}% favorable.`);
    note(root, M.GRANULARITY_NOTE);
    note(root, `Favorable outcome means: ${M.FAVORABLE_DEFINITION}`);

    heading(root, 'Where it differs from the continuous score');
    note(root, M.SATURATION_NOTE);
    note(root, M.SHARED_VARIABLE_NOTE);
    postureNote(root);
  },
};
