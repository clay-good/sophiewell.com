// spec-v307: renderer for the diabetic macular edema (DME) severity scale. Group G
// (clinical scoring & reference). The clinician marks whether retinal thickening /
// hard exudates are present and picks their location relative to the fovea; the
// tile reports the DME level.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the DME level; it never asserts a diagnosis or a
// treatment decision (lib/dme-v307.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/dme-v307.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'dme-severity'(root) {
    note(root, 'Diabetic macular edema (DME) severity — the International Clinical scale (Wilkinson 2003), the companion to the ICDR retinopathy grade. Mark whether retinal thickening / hard exudates are present and pick their location relative to the center of the macula; center-involving (severe) DME is the vision-threatening form. Near-neighbors: icdr-retinopathy.');
    root.appendChild(check('Retinal thickening or hard exudates in the posterior pole', 'dme-present'));
    root.appendChild(select('Location relative to the center of the macula', 'dme-location', [
      ['distant', 'Distant from the center (mild)'],
      ['approaching', 'Approaching but not involving the center (moderate)'],
      ['involving', 'Involving the center (severe / center-involving)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['dme-present', 'dme-location'], () => safe(o, () => {
      const r = M.dmeSeverity({ present: chk('dme-present'), location: val('dme-location') });
      if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Center-involving', value: r.centerInvolving ? 'yes (vision-threatening)' : 'no' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
