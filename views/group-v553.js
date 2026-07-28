// spec-v553: renderer for the PUQE-24. Group G. Inputs under h2 section headings (never h3 - an h3 under
// the page h1 is a heading-level skip).
//
// The well-being question sits under its OWN heading, which says outright that it is not part of the total
// and runs in the opposite direction. Putting it beside the three scored items would invite exactly the
// error the instrument is prone to (lib/puqe24-v553.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 this reports symptom severity; it
// never diagnoses hyperemesis gravidarum and never indicates treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/puqe24-v553.js';
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

const WELLBEING = [['', 'Not answered'], ...Array.from({ length: 11 }, (_, i) => [String(i), String(i)])];

export const renderers = {
  puqe24(root) {
    note(root, 'The PUQE-24 quantifies nausea and vomiting of pregnancy over the last 24 hours with three items. Each scores 1 to 5, so the total runs 3 to 15 — there is no zero. A score of 3 means no nausea, no vomiting and no retching at all, which is why the source says a lower category would be meaningless.');

    heading(root, 'The last 24 hours');
    for (const item of M.PUQE_ITEMS) {
      root.appendChild(select(item.text, `puqe-${item.key}`,
        item.options.map((o) => [String(o.value), `${o.value} — ${o.text}`])));
    }

    heading(root, 'Well-being (not part of the total)');
    note(root, 'Reported separately and never added to the score. It also runs in the opposite direction: 0 is the worst possible and 10 is as good as you felt before pregnancy, so higher is better here while a higher PUQE score is worse.');
    root.appendChild(select('On a scale of 0 to 10, how would you rate your well-being?', 'puqe-wellbeing', WELLBEING));

    const ids = [...M.PUQE_ITEMS.map((i) => `puqe-${i.key}`), 'puqe-wellbeing'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { wellbeing: val('puqe-wellbeing') };
      for (const item of M.PUQE_ITEMS) input[item.key] = val(`puqe-${item.key}`);
      const r = M.puqe24(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Total', value: `${r.total} (range ${r.min} to ${r.max})` },
        { label: 'Band', value: r.band },
        { label: 'Well-being', value: r.wellbeing === null ? 'not answered' : `${r.wellbeing} of 10, not part of the total` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
