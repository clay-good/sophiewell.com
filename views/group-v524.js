// spec-v524: renderer for the Gray-Weale carotid plaque echogenicity classification. Group G. One select
// under an h2 section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The option text carries each type's appearance so the reader picks the picture rather than a number.
// Per spec-v11 section 5.3 the tile describes a plaque's ultrasound appearance; it never asserts a stenosis
// severity, a stroke risk for an individual, or an indication for carotid intervention
// (lib/gray-weale-v524.js).
//
// Same input/render contract as the rest of the codebase: the select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gray-weale-v524.js';
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
  'gray-weale'(root) {
    note(root, 'The Gray-Weale classification describes carotid plaque echogenicity on B-mode ultrasound, from uniformly echolucent (type 1) to uniformly echogenic (type 4). It is a different axis from the degree of stenosis: NASCET measures how narrow the lumen is, this describes what the plaque appears to be made of, and the two can disagree. It is a grade read by eye, anchored to the vessel lumen and the far-wall media-adventitia interface in the same image, so it depends on gain settings and on the operator.');

    heading(root, 'Plaque appearance on B-mode ultrasound');
    root.appendChild(select('Which appearance best matches the plaque?', 'gw-type',
      M.GRAY_WEALE_TYPES.map((t) => [t.value, `${t.label} — ${t.text}`])));

    const o = out(); root.appendChild(o);
    wire(['gw-type'], () => safe(o, () => {
      const r = M.grayWeale({ type: val('gw-type') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Type', value: r.type },
        { label: 'Group', value: r.group },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
