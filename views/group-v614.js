// spec-v614: renderer for the Ocular Trauma Score. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The acuity select is presented first and separately from the deductions, because it
// is the only term that adds (lib/ocular-trauma-score-v614.js).
//
// Per spec-v11 section 5.3 this estimates a group-level distribution; it never diagnoses, never decides
// surgery, and never supports enucleation or withholding repair.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ocular-trauma-score-v614.js';
import { resultRow } from '../lib/result-copy.js';

const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];

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

const aid = (k) => `ots-${k}`;

export const renderers = {
  'ocular-trauma-score'(root) {
    heading(root, 'Initial visual acuity — the only term that adds');
    root.appendChild(select('Initial visual acuity', 'ots-acuity',
      [['', '--'], ...M.ACUITY_BASE.map((a) => [a.value, `${a.text} — ${a.points}`])]));
    note(root, M.LEDGER_NOTE);

    heading(root, 'Injury findings — each one subtracts');
    for (const d of M.DEDUCTIONS) root.appendChild(select(`${d.text} — ${d.points}`, aid(d.key), YN));

    const o = out(); root.appendChild(o);
    const ids = ['ots-acuity', ...M.DEDUCTIONS.map((d) => aid(d.key))];
    wire(ids, () => safe(o, () => {
      const input = { acuity: val('ots-acuity') };
      for (const d of M.DEDUCTIONS) input[d.key] = val(aid(d.key));
      const r = M.ocularTraumaScore(input);
      if (!r.valid) { note(o, r.message); return; }
      const row = [
        { text: r.bandLabel },
        { label: 'Raw', value: `${r.raw}` },
        { label: 'Base', value: `${r.basePoints}` },
        { label: 'Deducted', value: `${r.deducted}` },
      ];
      if (r.ots) row.push({ label: 'OTS', value: `${r.ots}` });
      resultRow(o, row);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'The result is a distribution, not a prediction');
    note(root, M.DISTRIBUTION_NOTE);
    note(root, M.EXTREMES_NOTE);
    heading(root, 'Where the published table stops');
    note(root, M.FLOOR_NOTE);
    note(root, M.WIDTH_NOTE);
    postureNote(root);
  },
};
