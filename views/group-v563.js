// spec-v563: renderer for the Mayo imaging classification of ADPKD. Group G. Inputs under h2 section
// headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Morphology comes FIRST and under its own heading, because it is a radiologist's descriptor that gates
// everything else: an atypical patient gets no subclass at all, and the volume and age fields simply do not
// apply to them (lib/mayo-adpkd-v563.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile stratifies imaging risk;
// it never diagnoses ADPKD and never indicates treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mayo-adpkd-v563.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
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
  'mayo-adpkd'(root) {
    note(root, 'The Mayo imaging classification works in two steps, and only the second is arithmetic. A radiologist classifies the morphology first; only typical (class 1) patients are then subclassified 1A-1E from their height-adjusted total kidney volume and age. Atypical (class 2) patients receive NO subclass — the classification explicitly does not risk-stratify them.');

    heading(root, 'Imaging morphology (a radiologist’s descriptor)');
    root.appendChild(select('Morphology class', 'mayo-morphology',
      M.MORPHOLOGY_CLASSES.map((m) => [m.value, `${m.label} — ${m.text}`])));

    heading(root, 'Volume, height and age (class 1 only)');
    note(root, `Not validated below age ${M.MIN_VALIDATED_AGE}: the published cut-off table starts there, and age sits in a denominator inside an exponent, so the estimate becomes unstable as age falls.`);
    root.appendChild(number('Total kidney volume (mL) — both kidneys summed', 'mayo-tkv', '1'));
    root.appendChild(number('Height (m)', 'mayo-height', '0.01'));
    root.appendChild(number('Age (years)', 'mayo-age', '1'));
    root.appendChild(select('How was the volume measured? (recorded, not used in the arithmetic)', 'mayo-method',
      [['', 'Not stated'], ...M.TKV_METHODS.map((m) => [m.value, m.text])]));
    note(root, M.ELLIPSOID_NOTE);

    const o = out(); root.appendChild(o);
    wire(['mayo-morphology', 'mayo-tkv', 'mayo-height', 'mayo-age', 'mayo-method'], () => safe(o, () => {
      const r = M.mayoAdpkd({
        morphology: val('mayo-morphology'), tkv: val('mayo-tkv'),
        height: val('mayo-height'), age: val('mayo-age'), tkvMethod: val('mayo-method'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Class', value: r.subclassified ? `Mayo ${r.subclass}` : `${r.morphologyLabel} — no subclass` },
        { label: 'Height-adjusted TKV', value: r.subclassified ? `${r.htTkv} mL/m` : 'not applicable' },
        { label: 'Estimated yearly growth', value: r.subclassified ? `${r.growthRate}%` : 'not computed' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
