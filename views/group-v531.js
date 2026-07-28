// spec-v531: renderer for the EHIT (endothermal heat-induced thrombosis) classification. Group G. One select
// under an h2 section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The select offers Ia and Ib separately and offers NO bare "class I", because the lib rejects a bare I as
// ambiguous: the two subclasses carry the same management, but a record should not silently lose which was
// meant. The option text carries each class's anatomic definition so the reader picks the finding rather
// than a numeral (lib/ehit-v531.js).
//
// Same input/render contract as the rest of the codebase: the select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports an anatomic class
// and the published recommendation attached to it, labeled as a suggestion at a stated strength of evidence;
// it never chooses an agent, a dose, or a duration.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ehit-v531.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The anticoagulation decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'ehit'(root) {
    note(root, 'The EHIT classification describes thrombus seen on ultrasound within four weeks of endovenous thermal ablation that originates from the treated vein and protrudes into a deep vein. Class I does not propagate into the deep vein (Ia peripheral to the superficial epigastric vein, Ib central to it); II occupies less than half the deep vein lumen; III more than half but not occlusive; IV is occlusive. The 2021 revision renumbered nothing — Ib is exactly the old class I. Do not confuse it with the six-level Lawrence system, whose levels 1 to 3 all collapse into class I here.');

    heading(root, 'Ultrasound finding after endovenous thermal ablation');
    root.appendChild(select('How far does the thrombus extend?', 'ehit-class',
      M.EHIT_CLASSES.map((c) => [c.value, `${c.label} — ${c.text}`])));

    const o = out(); root.appendChild(o);
    wire(['ehit-class'], () => safe(o, () => {
      const r = M.ehit({ ehitClass: val('ehit-class') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Class', value: r.ehitClass },
        { label: 'Published recommendation', value: r.recommendation },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
