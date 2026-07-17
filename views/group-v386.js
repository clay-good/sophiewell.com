// spec-v386: renderer for the Pirani clubfoot severity score (six signs, each 0/0.5/1). Group G. The
// clinician scores the six signs; the tile reports the total (0-6) and the midfoot / hindfoot contracture
// subscores.
//
// Same input/render contract as the rest of the codebase: each input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Pirani score; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/pirani-clubfoot-v386.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pirani-clubfoot-v386.js';
import { resultRow } from '../lib/result-copy.js';

const OPTS = [['0', '0 - normal'], ['0.5', '0.5 - moderate'], ['1', '1 - severe']];

function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of OPTS) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const IDS = ['pir-clb', 'pir-mc', 'pir-lht', 'pir-pc', 'pir-eh', 'pir-re'];

export const renderers = {
  'pirani-clubfoot'(root) {
    note(root, 'Pirani score for clubfoot severity - six signs, each 0 (normal) / 0.5 (moderate) / 1 (severe), split into a midfoot and a hindfoot contracture score (total 0-6). Higher = more severe. Near-neighbors: catterall-perthes.');
    note(root, 'Midfoot signs:');
    root.appendChild(select('Curvature of the lateral border', 'pir-clb'));
    root.appendChild(select('Medial crease', 'pir-mc'));
    root.appendChild(select('Position of the lateral head of the talus', 'pir-lht'));
    note(root, 'Hindfoot signs:');
    root.appendChild(select('Posterior crease', 'pir-pc'));
    root.appendChild(select('Emptiness of the heel', 'pir-eh'));
    root.appendChild(select('Rigidity of the equinus', 'pir-re'));

    const o = out(); root.appendChild(o);
    wire(IDS, () => safe(o, () => {
      const r = M.piraniClubfoot({
        clb: val('pir-clb'), mc: val('pir-mc'), lht: val('pir-lht'),
        pc: val('pir-pc'), eh: val('pir-eh'), re: val('pir-re'),
      });
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: r.bandLabel },
        { label: 'Midfoot', value: `${r.midfootScore} of 3` },
        { label: 'Hindfoot', value: `${r.hindfootScore} of 3` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
