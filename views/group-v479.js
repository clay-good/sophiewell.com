// spec-v479: renderer for the Spitz esophageal atresia risk-group classification (groups I-III). Group G. The
// clinician picks the group; the tile reports the group and its birth-weight / cardiac criteria. As a group
// descriptor it reports the group the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Spitz group; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/spitz-atresia-v479.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/spitz-atresia-v479.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neonatal / pediatric-surgery team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'spitz-atresia'(root) {
    note(root, 'The Spitz classification of esophageal atresia, by birth weight and major congenital cardiac disease. Pick the group. I: birth weight 1500 g or more and no major cardiac disease; II: birth weight less than 1500 g, or major cardiac disease; III: birth weight less than 1500 g and major cardiac disease. Reports the group the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: papile-ivh.');
    root.appendChild(select('Spitz group', 'spitz-group', [
      ['I', 'I - weight >= 1500 g and no major cardiac disease'],
      ['II', 'II - weight < 1500 g, or major cardiac disease'],
      ['III', 'III - weight < 1500 g and major cardiac disease'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['spitz-group'], () => safe(o, () => {
      const r = M.spitzAtresia({ group: val('spitz-group') });
      resultRow(o, [
        { text: r.band },
        { label: 'Group', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
