// spec-v537: renderer for the ALSFRS-R. Group G. A gastrostomy question plus twelve item selects under h2
// section headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The gastrostomy answer selects WHICH of the two alternative cutting-food scales is shown, and the other is
// hidden. Exactly one is scored: showing both would invite a reader to score both and produce a total out of
// 52 (lib/alsfrs-r-v537.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile measures function; it
// never diagnoses ALS, never estimates prognosis, and never stands in for respiratory testing.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/alsfrs-r-v537.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

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
function heading(root, text) { const h = el('h2', { text }); root.appendChild(h); return h; }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. Care decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'alsfrs-r'(root) {
    note(root, 'The ALS Functional Rating Scale - Revised: twelve functions rated 0 to 4, total 0 to 48, where higher is better — 48 is normal function and 0 is complete loss. The revision replaced the original scale’s single breathing question with three, taking the maximum from 40 to 48, so always report the total out of 48: a bare number from an older record is not comparable. Cutting food is scored on one of two alternative scales depending on whether the patient has a gastrostomy, and exactly one of them counts.');

    const ids = ['als-hasGastrostomy'];
    heading(root, 'Which cutting-food scale applies');
    root.appendChild(select('Does the patient have a gastrostomy? This selects one of two alternative scales for cutting food; only the selected one is scored.', 'als-hasGastrostomy', YES_NO));

    const nodes = new Map();
    heading(root, 'Function items');
    for (const item of M.ALSFRS_ITEMS) {
      const id = `als-${item.key}`;
      ids.push(id);
      const node = select(item.text, id, item.options.map((o) => [o.value, o.text]));
      nodes.set(item.key, node);
      root.appendChild(node);
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const hasG = val('als-hasGastrostomy') === 'yes';
      // Show only the applicable cutting scale.
      nodes.get('cuttingNoGastrostomy').hidden = hasG;
      nodes.get('cuttingWithGastrostomy').hidden = !hasG;

      const args = { hasGastrostomy: val('als-hasGastrostomy') };
      for (const item of M.itemsFor(hasG)) args[item.key] = val(`als-${item.key}`);
      const r = M.alsfrsR(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of ${r.max}` },
        { label: 'Respiratory subscore', value: `${r.respiratorySubscore} of 12` },
        { label: 'Cutting-food scale used', value: r.cuttingScale },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
