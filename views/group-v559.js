// spec-v559: renderer for the Erez pregnancy-specific DIC score. Group G. Inputs under an h2 section
// heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The prothrombin time label says DIFFERENCE IN SECONDS in as many words, because passing an INR or a raw
// prothrombin time into that field adds 25 unearned points and is the single largest error this instrument
// invites (lib/erez-dic-v559.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a score; it never
// diagnoses DIC, never identifies its cause, and never indicates delivery or a blood product.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/erez-dic-v559.js';
import { resultRow } from '../lib/result-copy.js';

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
  'erez-dic'(root) {
    note(root, 'The Erez score is a pregnancy-specific modification of the ISTH DIC score. It is a third DIC instrument alongside the ISTH and JAAM scores in this catalog, with different components and a cutoff on a different scale — 26, not 5 — so the cutoffs are not interchangeable. D-dimer and fibrin degradation products are deliberately absent, because they rise in normal pregnancy and would produce false positives.');

    heading(root, 'Laboratory values');
    root.appendChild(number('Platelet count (×10⁹/L)', 'erez-platelets', '1'));
    root.appendChild(number('Prothrombin time DIFFERENCE in seconds — patient value minus laboratory control. NOT a ratio and NOT an INR.', 'erez-pt', '0.1'));
    root.appendChild(number('Fibrinogen (g/L)', 'erez-fibrinogen', '0.1'));
    note(root, 'The platelet row is non-monotonic as published: below 50 scores 1 point while 50-100 scores 2, so the most severe thrombocytopenia scores fewer points than moderate thrombocytopenia. That is reproduced here, not corrected.');

    const o = out(); root.appendChild(o);
    wire(['erez-platelets', 'erez-pt', 'erez-fibrinogen'], () => safe(o, () => {
      const r = M.erezDic({
        platelets: val('erez-platelets'), ptDifference: val('erez-pt'), fibrinogen: val('erez-fibrinogen'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Score', value: `${r.total} of ${r.max} (cutoff ${r.cutoff})` },
        { label: 'At or above cutoff', value: r.meetsDic ? 'yes' : 'no — this does not exclude DIC' },
        { label: 'Components', value: `platelets ${r.components.platelets.points}, PT difference ${r.components.ptDifference.points}, fibrinogen ${r.components.fibrinogen.points}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
