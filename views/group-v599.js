// spec-v599: renderer for the myxedema coma diagnostic score. Group G. Sections are h2 (an h3 under the page
// h1 is a heading-level skip). The single-pick ladders and the additive sub-checklists are kept in SEPARATE
// sections and labeled as such, because treating the cardiovascular or metabolic block as a single pick
// under-scores by up to 100 points (lib/myxedema-coma-v599.js).
//
// Per spec-v11 section 5.3 this is a diagnostic aid for a clinical diagnosis; it never selects or doses
// thyroid hormone or corticosteroids, and a score below the threshold never excludes myxedema coma.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/myxedema-coma-v599.js';
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
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
const ladder = (list) => [['', '--'], ...list.map((i) => [i.value, `${i.text} — ${i.points}`])];
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
const mid = (key) => `myx-${key}`;

export const renderers = {
  'myxedema-coma'(root) {
    note(root, `A score of ${M.DIAGNOSTIC_THRESHOLD} or more is highly suggestive of myxedema coma — which is only about a quarter of the maximum of ${M.MAX_SCORE}. The two thyroid-storm tools on this site cover the opposite emergency.`);

    heading(root, 'Single-pick ladders — one option each');
    root.appendChild(select('Thermoregulatory dysfunction', mid('temperature'), ladder(M.TEMPERATURE_OPTIONS)));
    root.appendChild(select('Central nervous system effects', mid('cns'), ladder(M.CNS_OPTIONS)));
    root.appendChild(select('Gastrointestinal findings', mid('gi'), ladder(M.GI_OPTIONS)));
    root.appendChild(select(`Precipitating event — ${M.PRECIPITATING_EVENT_POINTS} if present`, mid('precipitatingEvent'), YN));

    heading(root, 'Cardiovascular — a graded pick PLUS five additive items');
    root.appendChild(select('Bradycardia (graded — one option)', mid('bradycardia'), ladder(M.BRADYCARDIA_OPTIONS)));
    for (const i of M.CARDIOVASCULAR_ITEMS) root.appendChild(select(`${i.text} — ${i.points}`, mid(i.key), YN));
    note(root, M.ADDITIVE_NOTE);

    heading(root, 'Metabolic — all five additive');
    for (const i of M.METABOLIC_ITEMS) root.appendChild(select(`${i.text} — ${i.points}`, mid(i.key), YN));
    note(root, M.NONSPECIFIC_NOTE);

    const ids = [mid('temperature'), mid('cns'), mid('gi'), mid('precipitatingEvent'), mid('bradycardia'),
      ...M.CARDIOVASCULAR_ITEMS.map((i) => mid(i.key)), ...M.METABOLIC_ITEMS.map((i) => mid(i.key))];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        temperature: val(mid('temperature')), cns: val(mid('cns')), gi: val(mid('gi')),
        bradycardia: val(mid('bradycardia')), precipitatingEvent: val(mid('precipitatingEvent')),
      };
      for (const i of [...M.CARDIOVASCULAR_ITEMS, ...M.METABOLIC_ITEMS]) args[i.key] = val(mid(i.key));
      const r = M.myxedemaComa(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Threshold', value: `${r.threshold}` },
        { label: 'From the metabolic block', value: `${r.nonSpecificSharePercent}%` },
        { label: 'Renderings disagree', value: r.bandsDisagree ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Where the published renderings disagree');
    note(root, M.BAND_NOTE);
    note(root, M.COHORT_NOTE);
    postureNote(root);
  },
};
