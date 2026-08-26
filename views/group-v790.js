// spec-v790 §2: renderer for lake-louise-cmr — the 2018 Lake Louise Criteria for
// myocarditis on cardiac MRI (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six checkboxes in
// two clearly separated prongs; the headings carry the rule, because two markers from one
// prong do not meet the criteria.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lake-louise-cmr-v790.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This reads a study a radiologist has already reported; it does not interpret images. It is also not the acute mountain sickness score of the same name, which shares only the conference venue.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lake-louise-cmr'(root) {
    note(root, '2018 Lake Louise Criteria: a study supports acute myocarditis when at least one marker from EACH prong is present. Two markers from the same prong do not meet the criteria, however striking they are.');
    root.appendChild(el('h2', { text: 'T2-based prong: edema (at least one required)' }));
    root.appendChild(checkField('Increased myocardial T2 relaxation time on mapping', 'llc-t2map'));
    root.appendChild(checkField('Visible myocardial edema on T2-weighted images', 'llc-t2edema'));
    root.appendChild(checkField('Increased T2 signal intensity ratio', 'llc-t2ratio'));
    root.appendChild(el('h2', { text: 'T1-based prong: injury (at least one required)' }));
    root.appendChild(checkField('Increased myocardial T1 relaxation time on mapping', 'llc-t1map'));
    root.appendChild(checkField('Increased extracellular volume fraction', 'llc-ecv'));
    root.appendChild(checkField('Late gadolinium enhancement in a non-ischemic pattern', 'llc-lge'));
    const ids = ['llc-t2map', 'llc-t2edema', 'llc-t2ratio', 'llc-t1map', 'llc-ecv', 'llc-lge'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.lakeLouiseCmr({
        t2Mapping: checked('llc-t2map'),
        t2Edema: checked('llc-t2edema'),
        t2Ratio: checked('llc-t2ratio'),
        t1Mapping: checked('llc-t1map'),
        ecv: checked('llc-ecv'),
        lge: checked('llc-lge'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'T2-based prong', value: r.t2Met ? 'met' : 'not met' },
        { label: 'T1-based prong', value: r.t1Met ? 'met' : 'not met' },
      ]);
      note(o, r.t2Markers.length ? `T2-based markers: ${r.t2Markers.join(', ')}.` : 'No T2-based marker selected.');
      note(o, r.t1Markers.length ? `T1-based markers: ${r.t1Markers.join(', ')}.` : 'No T1-based marker selected.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
