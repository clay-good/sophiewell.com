// spec-v369: renderer for the Nohria-Stevenson clinical hemodynamic profiles (A/B/C/L). Group G. The
// clinician selects congestion (dry/wet) and perfusion (warm/cold); the tile computes the profile and
// flags any profile other than A (compensated).
//
// Same input/render contract as the rest of the codebase: the inputs have real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the profile from the entered signs; it never asserts a diagnosis, a
// treatment decision, or a prognosis (lib/nohria-stevenson-v369.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nohria-stevenson-v369.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The profile-guided therapy pattern is a teaching aid; the management decision stays with the treating clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nohria-stevenson'(root) {
    note(root, 'Nohria-Stevenson clinical hemodynamic profiles (Nohria 2003) for acute heart failure - the bedside counterpart to the invasive Forrester classification. Select congestion and perfusion. Wet signs: orthopnea, elevated JVP, edema, rales, S3. Cold signs: narrow pulse pressure, cool extremities, altered mentation, hypotension. A dry-warm; B wet-warm; C wet-cold; L dry-cold. Near-neighbors: forrester-hemodynamic.');
    root.appendChild(select('Congestion', 'ns-congestion', [
      ['dry', 'Dry - no congestion'],
      ['wet', 'Wet - congestion present'],
    ]));
    root.appendChild(select('Perfusion', 'ns-perfusion', [
      ['warm', 'Warm - adequate perfusion'],
      ['cold', 'Cold - hypoperfusion'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['ns-congestion', 'ns-perfusion'], () => safe(o, () => {
      const r = M.nohriaStevenson({ congestion: val('ns-congestion'), perfusion: val('ns-perfusion') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Profile', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
