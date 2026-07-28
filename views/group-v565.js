// spec-v565: renderer for the modified NIH lupus nephritis activity and chronicity indices. Group G. The
// two indices get their own h2 headings (never h3 - an h3 under the page h1 is a heading-level skip),
// because they are separate scores that are never added together.
//
// Each component's select is built from ITS OWN rubric: glomerular components list percentages of
// glomeruli, tubulointerstitial ones list mild/moderate/severe. A shared option list would present the same
// four labels for two incommensurable questions (lib/lupus-nephritis-indices-v565.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile scores histology; it
// never assigns the ISN/RPS class and never indicates immunosuppression.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lupus-nephritis-indices-v565.js';
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

const optionsFor = (component) =>
  M.rubricFor(component).map((r) => [String(r.value), `${r.value} — ${r.text}`]);

const labelFor = (component) =>
  `${component.text}${component.weight === 2 ? ' — WEIGHTED ×2' : ''}`;

export const renderers = {
  'lupus-nephritis-indices'(root) {
    note(root, 'The 2018 ISN/RPS revision introduced these indices to REPLACE the A, A/C and C subscripts on classes III and IV — a report reading “Class IV-G (A/C)” is using the superseded scheme. The two indices are reported separately and never added together: they measure opposite things, what may still respond to treatment against what is already scarred. Note that two different 0-3 rubrics are in play — glomerular components by percentage of glomeruli, tubulointerstitial ones by mild/moderate/severe.');

    heading(root, 'Activity index (0-24)');
    note(root, 'Only fibrinoid necrosis and cellular/fibrocellular crescents are weighted, at ×2. Six components each 0-3 would cap at 18; the maximum of 24 comes entirely from those two doubled terms.');
    for (const c of M.ACTIVITY_COMPONENTS) {
      root.appendChild(select(labelFor(c), `lni-${c.key}`, optionsFor(c)));
    }

    heading(root, 'Chronicity index (0-12)');
    note(root, 'Wholly unweighted: four components each 0-3.');
    for (const c of M.CHRONICITY_COMPONENTS) {
      root.appendChild(select(labelFor(c), `lni-${c.key}`, optionsFor(c)));
    }

    const all = [...M.ACTIVITY_COMPONENTS, ...M.CHRONICITY_COMPONENTS];
    const o = out(); root.appendChild(o);
    wire(all.map((c) => `lni-${c.key}`), () => safe(o, () => {
      const input = {};
      for (const c of all) input[c.key] = val(`lni-${c.key}`);
      const r = M.lupusNephritisIndices(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Activity index', value: `${r.activityIndex} of ${r.activityMax}` },
        { label: 'Chronicity index', value: `${r.chronicityIndex} of ${r.chronicityMax}` },
        { label: 'Version', value: r.version },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
