// spec-v323: renderer for the Siewert classification of esophagogastric-junction
// adenocarcinoma. Group G. The clinician picks the type (I-III) from the tumor-center
// location relative to the GEJ; the tile reports the type and its standard definition.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the anatomic classification; it never asserts a stage
// or a treatment decision (lib/siewert-v323.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/siewert-v323.js';
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
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The staging and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'siewert'(root) {
    note(root, 'Siewert classification of esophagogastric-junction (GEJ) adenocarcinoma (Siewert & Stein 1998). Pick the type from where the tumor center sits relative to the anatomic GEJ. Type I is treated more like esophageal cancer, type III more like gastric cancer; type II is the true cardia. Near-neighbors: la-esophagitis.');
    root.appendChild(select('Siewert type (tumor-center location vs the GEJ)', 'siewert-type', [
      ['1', 'I — center 1 to 5 cm above the GEJ (distal esophageal)'],
      ['2', 'II — center 1 cm above to 2 cm below the GEJ (true cardia)'],
      ['3', 'III — center 2 to 5 cm below the GEJ (subcardial gastric)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['siewert-type'], () => safe(o, () => {
      const r = M.siewert({ type: val('siewert-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.class },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
