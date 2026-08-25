// spec-v601: renderer for the Pollock-Flickinger radiosurgery-based AVM score. Group G. Sections are h2 (an
// h3 under the page h1 is a heading-level skip). The site is chosen ONCE from an anatomical list and each
// version's tier is derived, because the two published ladders classify the same site differently and asking
// twice would invite an inconsistent pair (lib/pollock-flickinger-v601.js).
//
// Per spec-v11 section 5.3 this predicts a radiosurgical outcome at a group level; it never chooses between
// treatment modalities, never plans a dose, and never presents a favourable score as an indication to treat.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pollock-flickinger-v601.js';
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
  'pollock-flickinger'(root) {
    note(root, 'Both published versions are computed from the same inputs. The Spetzler-Ponce grade on this site answers a different question about the same malformation — microsurgical risk, not radiosurgical outcome.');

    heading(root, 'The three inputs');
    root.appendChild(number('AVM volume (cm^3)', 'pf-volume'));
    root.appendChild(number('Age (years)', 'pf-age'));
    root.appendChild(select('Anatomical site', 'pf-site',
      [['', '--'], ...M.SITES.map((s) => [s.value, `${s.text} — original tier ${s.originalTier}, modified tier ${s.modifiedTier === null ? 'NOT LISTED' : s.modifiedTier}`])]));
    note(root, M.INTRAVENTRICULAR_NOTE);

    const o = out(); root.appendChild(o);
    wire(['pf-volume', 'pf-age', 'pf-site'], () => safe(o, () => {
      const r = M.pollockFlickinger({ volume: val('pf-volume'), age: val('pf-age'), site: val('pf-site') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Modified', value: r.modified === null ? 'not computable' : `${r.modified}` },
        { label: 'Original', value: `${r.original}` },
        { label: 'Difference', value: r.difference === null ? '-' : `${r.difference}` },
        { label: 'Band changed', value: r.bandChanged ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What the modification actually changed');
    note(root, M.COEFFICIENT_NOTE);
    note(root, M.SHIFT_NOTE);

    heading(root, 'Reported outcomes by modified score');
    for (const b of M.OUTCOME_BANDS) {
      note(root, `${b.label}: ${b.obliterationWithoutDeficit}% obliteration without new deficit, ${b.mrsDecline}% decline in the modified Rankin scale.`);
    }
    note(root, M.OVERLAP_NOTE);
    note(root, M.CONTINUOUS_NOTE);
    postureNote(root);
  },
};
