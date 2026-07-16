// spec-v352: renderer for the Lansky Play-Performance Scale (pediatric functional status, 0-100 in
// steps of 10). Group G. The clinician picks the score; the tile reports the score, its play/activity
// description, the coarse functional band, and whether it is a reduced (0-40) status.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Lansky score; it never asserts a diagnosis, a treatment /
// eligibility decision, or a prognosis (lib/lansky-v352.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lansky-v352.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The assessment stays with the treating clinician; trial-eligibility thresholds are protocol-specific.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lansky'(root) {
    note(root, 'Lansky Play-Performance Scale (Lansky 1987) — pediatric functional status, the counterpart to the adult Karnofsky score. Pick the score describing the child\'s usual play and activity. 80-100: able to carry on normal activity; 50-70: reduced but up and about; 0-40: mostly bedbound / disabled. Near-neighbors: ecog-karnofsky, pps.');
    root.appendChild(select('Lansky score', 'lansky-score', [
      ['100', '100 - fully active, normal'],
      ['90', '90 - minor restrictions in strenuous activity'],
      ['80', '80 - active, but tires more quickly'],
      ['70', '70 - greater restriction of / less time in play'],
      ['60', '60 - up and around, minimal active play'],
      ['50', '50 - dressed but lies around much of the day; quiet play only'],
      ['40', '40 - mostly in bed; quiet activities'],
      ['30', '30 - in bed; needs assistance even for quiet play'],
      ['20', '20 - often sleeping; very passive activities only'],
      ['10', '10 - no play; does not get out of bed'],
      ['0', '0 - unresponsive'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lansky-score'], () => safe(o, () => {
      const r = M.lansky({ score: val('lansky-score') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Functional band', value: r.functionalBand },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
