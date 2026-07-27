// spec-v519: renderer for the Eckardt symptom score for achalasia. Group G. Four selects, each 0-3, under an
// h2 section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Each select gets its OWN option list from lib/eckardt-v519.js: three items are scored by frequency and the
// fourth by kilograms lost, so one shared option list would silently ask how often the patient lost weight.
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile sums reported symptoms; it
// never asserts a diagnosis of achalasia, a manometric subtype, or an indication to treat
// (lib/eckardt-v519.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/eckardt-v519.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The treatment decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'eckardt'(root) {
    note(root, 'The Eckardt symptom score for achalasia: four symptoms scored 0 to 3 for a total of 0 to 12. Dysphagia, regurgitation, and retrosternal pain are scored by how often they occur; weight loss is scored by how much. A total of 0 to 1 is stage 0, 2 to 3 is stage I, 4 to 6 is stage II, and above 6 is stage III. It grades symptoms, not the diagnosis: achalasia is confirmed by manometry.');

    heading(root, 'Symptoms over the recent period');
    const ids = [];
    for (const item of M.ECKARDT_ITEMS) {
      const id = `eck-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.ECKARDT_ITEMS) args[item.key] = val(`eck-${item.key}`);
      const r = M.eckardt(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 12` },
        { label: 'Stage', value: r.stage },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
