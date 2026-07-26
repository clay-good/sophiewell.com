// spec-v508: renderer for the Voice Handicap Index-10 (VHI-10). Group G. Ten patient-rated items, each 0-4,
// summed to a total of 0-40 with the commonly cited abnormal threshold of 11.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums the answers given; it never asserts a diagnosis, a laryngeal finding, or
// an indication for laryngoscopy, therapy, or surgery (lib/vhi10-v508.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vhi10-v508.js';
import { resultRow } from '../lib/result-copy.js';

const SCALE = [
  ['0', '0 - never'],
  ['1', '1 - almost never'],
  ['2', '2 - sometimes'],
  ['3', '3 - almost always'],
  ['4', '4 - always'],
];

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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the ENT and speech-language-pathology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'vhi10'(root) {
    note(root, 'The Voice Handicap Index-10, a ten-item patient-reported measure of self-perceived voice handicap. The patient rates each statement from 0 (never) to 4 (always); the total runs 0 to 40, and 11 or more is the commonly cited threshold for an abnormal degree of handicap. The score reflects how much handicap the patient perceives, not what is causing it. Persistent hoarseness warrants laryngeal visualization regardless of the score.');

    const ids = [];
    M.VHI10_ITEMS.forEach((text, i) => {
      const id = `vhi-q${i + 1}`;
      ids.push(id);
      root.appendChild(select(`${i + 1}. ${text}`, id, SCALE));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`v${i + 1}`] = val(id); });
      const r = M.vhi10(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
