// spec-v562: renderer for the Scale for Contraversive Pushing. Group G. One h2 per section (never h3 - an
// h3 under the page h1 is a heading-level skip), each carrying its own sitting and standing selects.
//
// Each section's select options are built from THAT section's own ladder, because the ladders differ:
// section A has no 0.5, section B does, section C is binary. A shared option list would offer values the
// instrument does not contain (lib/scp-pushing-v562.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile identifies a behavior;
// it never diagnoses stroke and never selects a rehabilitation intervention.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/scp-pushing-v562.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'scp-pushing'(root) {
    note(root, 'Each of the three sections is scored twice — sitting and standing — and the two are summed, so each section runs 0-2 and the total 0-6. The TOTAL IS NOT THE CLASSIFIER: pusher behavior requires all three sections to clear the threshold independently, so a patient scoring 4 of 6 with one section at zero is not a pusher. The point ladders differ between sections; section A has no 0.5.');

    for (const section of M.SCP_SECTIONS) {
      heading(root, `${section.key}. ${section.text}`);
      if (section.detail) note(root, section.detail);
      const options = section.options.map((o) => [String(o.value), `${o.value} — ${o.text}`]);
      for (const position of M.SCP_POSITIONS) {
        root.appendChild(select(`${position.charAt(0).toUpperCase()}${position.slice(1)}`,
          `scp-${section.key}-${position}`, options));
      }
    }

    const ids = M.SCP_SECTIONS.flatMap((s) => M.SCP_POSITIONS.map((p) => `scp-${s.key}-${p}`));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const section of M.SCP_SECTIONS) {
        for (const position of M.SCP_POSITIONS) {
          input[`${section.key}${position}`] = val(`scp-${section.key}-${position}`);
        }
      }
      const r = M.scpPushing(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Section subtotals', value: `A ${r.sectionSubtotals.A}, B ${r.sectionSubtotals.B}, C ${r.sectionSubtotals.C} (each max 2)` },
        { label: 'Total', value: `${r.total} of ${r.max} — not the classifier` },
        { label: 'Criteria', value: `Crit_1 ${r.crit1 ? 'met' : 'not met'}, Crit_2 ${r.crit2 ? 'met' : 'not met'}, Crit_3 ${r.crit3 ? 'met' : 'not met'}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
