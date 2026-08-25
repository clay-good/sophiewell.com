// spec-v589: renderer for the Sternbach criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The three requirements get their own section, separate from the feature checklist,
// because meeting 3 of 10 features is necessary and not sufficient and a single flat list invites exactly
// that error (lib/sternbach-v589.js).
//
// Per spec-v11 section 5.3 failing these criteria never rules serotonin syndrome out, and the tile never
// grades severity or selects treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sternbach-v589.js';
import { resultRow } from '../lib/result-copy.js';

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
const id = (key) => `stern-${key}`;

export const renderers = {
  sternbach(root) {
    note(root, `At least ${M.FEATURES_REQUIRED} of ${M.FEATURES.length} features PLUS all three requirements. The Hunter criteria on this site are the successor — but their claimed superiority is contested, which is why this one is still worth applying.`);

    heading(root, `The ${M.FEATURES.length} clinical features`);
    for (const f of M.FEATURES) root.appendChild(select(f.text, id(f.key)));
    note(root, M.NONSPECIFIC_NOTE);

    heading(root, 'The disputed eleventh feature');
    root.appendChild(select('Rigidity', id('rigidity')));
    note(root, M.RIGIDITY_NOTE);

    heading(root, 'The three requirements — these are not symptoms');
    for (const r of M.REQUIREMENTS) root.appendChild(select(r.text, id(r.key)));
    note(root, M.NEUROLEPTIC_NOTE);

    const ids = [...M.FEATURES.map((f) => id(f.key)), id('rigidity'), ...M.REQUIREMENTS.map((r) => id(r.key))];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { rigidity: val(id('rigidity')) };
      for (const f of M.FEATURES) args[f.key] = val(id(f.key));
      for (const r of M.REQUIREMENTS) args[r.key] = val(id(r.key));
      const r = M.sternbach(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Features', value: `${r.featureCount} of ${r.featureTotal} (${r.featuresRequired} required)` },
        { label: 'Requirements', value: r.requirementsMet ? 'all met' : `unmet: ${r.unmetRequirements.join(', ')}` },
        { label: 'Depends on the disputed list', value: r.verdictDependsOnDisputedFeature ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'How it compares with its successor');
    note(root, M.CONTESTED_NOTE);
    postureNote(root);
  },
};
