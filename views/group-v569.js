// spec-v569: renderer for GAPP. Group G. Inputs under h2 section headings (never h3 - an h3 under the page
// h1 is a heading-level skip).
//
// The two histological-pattern features are SEPARATE yes/no selects rather than one radio group, because
// they ADD: a tumor showing both scores 2, and that is the only reading under which the published maximum
// of 10 is reachable. A single-choice control would silently cap the score at 9 (lib/gapp-v569.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades metastatic
// potential; it never diagnoses and never sets a surveillance interval.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gapp-v569.js';
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

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  gapp(root) {
    note(root, 'GAPP grades the metastatic potential of a resected pheochromocytoma or paraganglioma, 0-10. It replaced an earlier scaled score by dropping features that concorded poorly between observers and adding Ki-67 and a biochemical phenotype. Grades: well differentiated 0-2, moderately differentiated 3-6, poorly differentiated 7-10.');

    heading(root, 'Histological pattern (these ADD, they are not alternatives)');
    note(root, 'Zellballen alone is the 0-point baseline. A tumor showing both features scores 2 — the only reading under which the published maximum of 10 is reachable.');
    for (const f of M.HISTOLOGICAL_FEATURES) {
      root.appendChild(select(`${f.text} — ${f.points} point`, `gapp-${f.key}`, YESNO));
    }

    heading(root, 'Histology');
    root.appendChild(select(`Comedo-type necrosis — ${M.COMEDO_NECROSIS_POINTS} points if present`, 'gapp-comedo', YESNO));
    root.appendChild(select('Cellularity — counted in cells per unit area at a specified magnification, so operator-dependent', 'gapp-cellularity',
      M.CELLULARITY_LEVELS.map((c) => [c.value, `${c.text} — ${c.points} point${c.points === 1 ? '' : 's'}`])));
    root.appendChild(select('Ki-67 labelling index', 'gapp-ki67',
      M.KI67_LEVELS.map((k) => [k.value, `${k.text} — ${k.points} point${k.points === 1 ? '' : 's'}`])));
    root.appendChild(select(`Vascular or capsular invasion — ${M.INVASION_POINTS} point if present`, 'gapp-invasion', YESNO));

    heading(root, 'Catecholamine type (a biochemical variable, not from the slide)');
    note(root, 'Derived from 24-hour urine fractionated metanephrine and normetanephrine. Note the ordering is non-monotonic: a non-functioning tumor scores the same as adrenergic and less than noradrenergic.');
    root.appendChild(select('Catecholamine type', 'gapp-catecholamine',
      M.CATECHOLAMINE_TYPES.map((c) => [c.value, `${c.text} — ${c.points} point${c.points === 1 ? '' : 's'}`])));

    const ids = [...M.HISTOLOGICAL_FEATURES.map((f) => `gapp-${f.key}`),
      'gapp-comedo', 'gapp-cellularity', 'gapp-ki67', 'gapp-invasion', 'gapp-catecholamine'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {
        comedoNecrosis: val('gapp-comedo'), cellularity: val('gapp-cellularity'),
        ki67: val('gapp-ki67'), vascularOrCapsularInvasion: val('gapp-invasion'),
        catecholamineType: val('gapp-catecholamine'),
      };
      for (const f of M.HISTOLOGICAL_FEATURES) input[f.key] = val(`gapp-${f.key}`);
      const r = M.gapp(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'GAPP', value: `${r.total} of ${r.max}` },
        { label: 'Grade', value: `${r.grade} — ${r.gradeLabel}` },
        { label: 'Histological pattern', value: `${r.patternPoints} of 2${r.bothPatternFeatures ? ' (both features present)' : ''}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
