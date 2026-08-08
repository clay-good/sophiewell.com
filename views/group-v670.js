// spec-v670 §2: renderer for ottawa-bowel-prep — the Ottawa Bowel Preparation Scale
// (Clinical Scoring & Risk, Group G). Companion to the built Boston Bowel Preparation
// Scale (bbps-boston).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three 0-4
// segment selects plus one 0-2 fluid select; the four sum to a total 0-14 (lower =
// better preparation).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ottawa-bowel-prep-v670.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Ottawa scale grades preparation quality; the 2004 validation paper sets no single adequate-versus-inadequate cutoff, so any threshold is study-dependent. A poor or inadequate segment means its mucosa is obscured and may need repeat washing or a repeat colonoscopy. The decision stays with the endoscopist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const SEG_OPTS = [['0', '0 — excellent (almost no residue)'], ['1', '1 — good (residue, mucosa still visible)'], ['2', '2 — fair (visible after suctioning)'], ['3', '3 — poor (reasonable view after suction + wash)'], ['4', '4 — inadequate (solid stool, not cleared)']];
const FLUID_OPTS = [['0', '0 — small amount'], ['1', '1 — moderate amount'], ['2', '2 — large amount']];

export const renderers = {
  'ottawa-bowel-prep'(root) {
    note(root, 'Ottawa Bowel Preparation Scale (Rostom 2004): cleanliness of 3 colon segments (each 0 excellent – 4 inadequate) + overall fluid quantity (0 small – 2 large), total 0–14. Lower is better (0 = perfect). Companion tile: bbps-boston.');
    root.appendChild(selectField('Right / ascending colon cleanliness', 'obps-right', CHOICE(SEG_OPTS)));
    root.appendChild(selectField('Mid colon (transverse + descending) cleanliness', 'obps-mid', CHOICE(SEG_OPTS)));
    root.appendChild(selectField('Rectosigmoid cleanliness', 'obps-recto', CHOICE(SEG_OPTS)));
    root.appendChild(selectField('Overall fluid quantity (whole colon)', 'obps-fluid', CHOICE(FLUID_OPTS)));
    const ids = ['obps-right', 'obps-mid', 'obps-recto', 'obps-fluid'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ottawaBowelPrep({ right: val('obps-right'), mid: val('obps-mid'), rectosigmoid: val('obps-recto'), fluid: val('obps-fluid') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/14` },
        { label: 'Segments', value: `${r.segmentTotal}/12` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
