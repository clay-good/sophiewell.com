// spec-v605: renderer for the Harrington classification. Group G. Sections are h2 (an h3 under the page h1
// is a heading-level skip). The solitary-and-resectable question is asked in its OWN section, separate from
// the destruction questions, because it decides class IV on its own and class IV is not a destruction level
// (lib/harrington-acetabular-v605.js).
//
// Per spec-v11 section 5.3 this classifies a pattern of destruction; it never decides whether to operate,
// never estimates survival, and the named reconstructions are provenance rather than a recommendation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/harrington-acetabular-v605.js';
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

export const renderers = {
  'harrington-acetabular'(root) {
    note(root, 'Classes I to III are a ladder of acetabular destruction. Class IV is not — it is defined by the lesion being solitary and resectable for cure, so it is not "worse than class III".');

    heading(root, 'The question that decides class IV on its own');
    root.appendChild(select('Is this a SOLITARY metastasis amenable to en-bloc resection with curative intent?', 'harr-solitary'));
    note(root, M.INTENT_NOTE);

    heading(root, 'The destruction ladder');
    root.appendChild(select('Medial wall or quadrilateral plate deficient?', 'harr-medial'));
    root.appendChild(select('Lateral wall or acetabular roof deficient?', 'harr-lateral'));

    const o = out(); root.appendChild(o);
    wire(['harr-solitary', 'harr-medial', 'harr-lateral'], () => safe(o, () => {
      const r = M.harringtonAcetabular({
        solitaryResectableForCure: val('harr-solitary'),
        medialWallDeficient: val('harr-medial'),
        lateralWallOrRoofDeficient: val('harr-lateral'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Assigned by intent', value: r.assignedByIntent ? 'YES — not by destruction' : 'no' },
        { label: 'Destruction ladder alone', value: `class ${r.destructionOnlyClass}` },
        { label: 'Hardest to reconstruct', value: `class ${r.hardestToReconstruct}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'The classes and their reconstructions');
    for (const c of M.CLASSES) note(root, `Class ${c.klass}: ${c.text}. Described reconstruction: ${c.reconstruction}.`);
    note(root, M.RECONSTRUCTION_NOTE);

    heading(root, 'A rendering that inverts class IV');
    note(root, M.CORRUPTION_NOTE);
    note(root, M.HARDEST_NOTE);
    postureNote(root);
  },
};
