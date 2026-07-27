// spec-v509: renderer for the Sunnybrook Facial Grading System. Group G. Three resting-symmetry selects,
// five voluntary-movement selects (1-5), and five synkinesis selects (0-3), combined into the 0-100
// composite.
//
// Same input/render contract as the rest of the codebase: every select has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile does the arithmetic of the examiner's own observations; it never asserts a
// diagnosis, an etiology, or an indication for imaging, medication, or surgery
// (lib/sunnybrook-facial-v509.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sunnybrook-facial-v509.js';
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
function heading(root, text) { root.appendChild(el('h3', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the ENT, neurology, and facial-therapy team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sunnybrook-facial'(root) {
    note(root, 'The Sunnybrook Facial Grading System, the quantitative regional grading of facial nerve function. Grade the affected side against the normal side on three axes: symmetry at rest, voluntary movement across five standard expressions, and the synkinesis seen during those same expressions. The composite runs from 0 (complete flaccid paralysis) to 100 (normal symmetry). It records what you observed today; it does not name a cause.');

    const ids = [];

    heading(root, 'Resting symmetry (compared with the normal side)');
    for (const item of M.REST_ITEMS) {
      const id = `sb-rest-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.label, id, item.options.map((o) => [o.value, o.text])));
    }

    heading(root, 'Symmetry of voluntary movement');
    const movementOptions = M.MOVEMENT_SCALE.map((o) => [o.value, o.text]);
    M.EXPRESSIONS.forEach((label, i) => {
      const id = `sb-m${i + 1}`;
      ids.push(id);
      root.appendChild(select(label, id, movementOptions));
    });

    heading(root, 'Synkinesis during each expression');
    const synOptions = M.SYNKINESIS_SCALE.map((o) => [o.value, o.text]);
    M.EXPRESSIONS.forEach((label, i) => {
      const id = `sb-s${i + 1}`;
      ids.push(id);
      root.appendChild(select(`${label} (synkinesis)`, id, synOptions));
    });

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.REST_ITEMS) args[item.key] = val(`sb-rest-${item.key}`);
      M.EXPRESSIONS.forEach((_, i) => {
        args[`m${i + 1}`] = val(`sb-m${i + 1}`);
        args[`s${i + 1}`] = val(`sb-s${i + 1}`);
      });
      const r = M.sunnybrookFacial(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Composite', value: r.bandLabel },
        { label: 'Movement', value: String(r.movementScore) },
        { label: 'Resting', value: String(r.restingScore) },
        { label: 'Synkinesis', value: String(r.synkinesisScore) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
