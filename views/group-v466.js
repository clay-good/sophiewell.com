// spec-v466: renderer for the Judet-Letournel acetabular fracture classification (ten patterns). Group G. The
// clinician picks the pattern; the tile reports the pattern, whether it is elementary or associated, and its
// description. As a pattern descriptor it reports the pattern the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Judet-Letournel pattern; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/letournel-acetabulum-v466.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/letournel-acetabulum-v466.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic-trauma team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'letournel-acetabulum'(root) {
    note(root, 'The Judet-Letournel classification of acetabular fractures: five elementary patterns (posterior wall, posterior column, anterior wall, anterior column, transverse) and five associated patterns (posterior column + posterior wall, transverse + posterior wall, T-shaped, anterior column + posterior hemitransverse, both-column). Pick the pattern. Reports the pattern the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: thompson-epstein.');
    root.appendChild(select('Judet-Letournel pattern', 'letournel-pattern', [
      ['posterior-wall', 'Elementary: posterior wall'],
      ['posterior-column', 'Elementary: posterior column'],
      ['anterior-wall', 'Elementary: anterior wall'],
      ['anterior-column', 'Elementary: anterior column'],
      ['transverse', 'Elementary: transverse'],
      ['pc-pw', 'Associated: posterior column + posterior wall'],
      ['transverse-pw', 'Associated: transverse + posterior wall'],
      ['t-shaped', 'Associated: T-shaped'],
      ['ac-pht', 'Associated: anterior column + posterior hemitransverse'],
      ['both-column', 'Associated: both-column'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['letournel-pattern'], () => safe(o, () => {
      const r = M.letournelAcetabulum({ pattern: val('letournel-pattern') });
      resultRow(o, [
        { text: r.band },
        { label: 'Pattern', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
