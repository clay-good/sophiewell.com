// spec-v534: renderer for the Ridley-Jopling classification of leprosy. Group G. One select under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The select offers Indeterminate alongside the five groups, because indeterminate leprosy sits OUTSIDE the
// five-group spectrum and forcing it into TT would misstate the classification. No bacterial index value is
// offered per group: sources disagree on the per-group figures, so the tile shows the index SCALE separately
// and reports only the direction across the spectrum (lib/ridley-jopling-v534.js).
//
// Same input/render contract as the rest of the codebase: the select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile classifies a case that
// has already been diagnosed; it never diagnoses leprosy and never emits a treatment regimen.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ridley-jopling-v534.js';
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and management stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ridley-jopling'(root) {
    note(root, 'The Ridley-Jopling classification places leprosy on a five-group spectrum ordered by cell-mediated immune response, from TT tuberculoid with high resistance to LL lepromatous with little or none. It is a spectrum, not a ladder of severity. Indeterminate leprosy sits outside the five groups. No bacterial index number is attached to a group here, because published sources disagree on the per-group figures; the index scale is shown separately and only the direction across the spectrum is reported.');

    heading(root, 'Group');
    const options = M.RJ_GROUPS.map((g) => [g.value, `${g.label} — ${g.immunity}`]);
    options.push([M.RJ_INDETERMINATE.value, `${M.RJ_INDETERMINATE.label} — outside the five-group spectrum`]);
    root.appendChild(select('Which group does the case fall in? The lepromin response and the histology are part of the definition, so this cannot be assigned from the clinical picture alone.', 'rj-group', options));

    const o = out(); root.appendChild(o);
    wire(['rj-group'], () => safe(o, () => {
      const r = M.ridleyJopling({ group: val('rj-group') });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [
        { text: r.band },
        { label: 'Group', value: r.group },
        { label: 'WHO operational class', value: r.whoClass },
      ];
      if (r.lepromin) rows.push({ label: 'Lepromin', value: r.lepromin });
      rows.push({ label: 'Bacterial index scale', value: r.bacterialIndexScale.map((b) => `${b.grade}: ${b.text}`).join('; ') });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
