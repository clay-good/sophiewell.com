// spec-v498: renderer for the Narakas classification of obstetric brachial plexus palsy (groups I-IV). Group
// G. The clinician picks the group; the tile reports the group and its root-involvement description. As a
// group descriptor it reports the group the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Narakas group; it never asserts a diagnosis, a decision to refer
// for nerve reconstruction, or a recovery prediction (lib/narakas-obpp-v498.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/narakas-obpp-v498.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the brachial-plexus team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'narakas-obpp'(root) {
    note(root, 'The Narakas classification of obstetric brachial plexus palsy, by which nerve roots are involved, in increasing extent. Pick the group. I: C5-C6, the upper trunk (Erb palsy); II: C5-C7, adding wrist and finger extension; III: C5-T1, a complete flaccid limb without Horner syndrome; IV: C5-T1 with Horner syndrome. Reports the group the clinician has determined from the examination, not a recovery prediction for an individual infant. Near-neighbor: seddon-sunderland.');
    root.appendChild(select('Narakas group', 'narakas-group', [
      ['I', 'I - C5-C6 (Erb palsy)'],
      ['II', 'II - C5-C7 (adds wrist and finger extension)'],
      ['III', 'III - C5-T1 (complete, no Horner syndrome)'],
      ['IV', 'IV - C5-T1 with Horner syndrome'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['narakas-group'], () => safe(o, () => {
      const r = M.narakasObpp({ group: val('narakas-group') });
      resultRow(o, [
        { text: r.band },
        { label: 'Group', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
