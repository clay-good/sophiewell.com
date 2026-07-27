// spec-v514: renderer for the Young Mania Rating Scale (YMRS). Group G. Eleven selects, seven scored 0-4 and
// four scored 0-8, total 0-60.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile sums the ratings a clinician assigns; it never asserts a diagnosis, a
// capacity finding, or an indication for admission, restraint, or medication (lib/ymrs-v514.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ymrs-v514.js';
import { resultRow } from '../lib/result-copy.js';

function scaleFor(max) {
  const out = [];
  for (let n = 0; n <= max; n += 1) out.push([String(n), String(n)]);
  return out;
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the psychiatry team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ymrs'(root) {
    note(root, 'The Young Mania Rating Scale, eleven clinician-rated items at one interview. The items are not weighted equally: seven score 0 to 4 and four - irritability, speech, thought content, and disruptive or aggressive behavior - score 0 to 8, for a total of 0 to 60. Each item below shows its own range. The scale measures severity; it is not a diagnosis and it defines no severity bands of its own.');

    const ids = [];
    M.YMRS_ITEMS.forEach((item, i) => {
      const id = `ym-q${i + 1}`;
      ids.push(id);
      root.appendChild(select(`${i + 1}. ${item.label} (0 to ${item.max})`, id, scaleFor(item.max)));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`q${i + 1}`] = val(id); });
      const r = M.ymrs(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
        { label: 'From the four double-weighted items', value: `${r.doubleWeighted} of 32` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
