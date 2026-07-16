// spec-v334: renderer for the Kudo pit-pattern classification of a colorectal lesion (types I / II
// / IIIS / IIIL / IV / V). Group G. The endoscopist picks the pit pattern seen on magnifying
// chromoendoscopy; the tile reports the type, its usual histologic correlate, and whether the
// pattern raises concern for invasion (type V).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the pit-pattern type; it never asserts a tissue diagnosis, a
// resection recommendation, or a cancer diagnosis (lib/kudo-v334.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/kudo-v334.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The biopsy, resection, and referral decisions stay with the endoscopist and the pathologist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'kudo-pit-pattern'(root) {
    note(root, 'Kudo pit-pattern classification (Kudo 1996), read on magnifying chromoendoscopy. Pick the crypt-opening (pit) pattern seen. Types I–II are non-neoplastic; IIIS / IIIL / IV are neoplastic adenomas; type V raises concern for invasive carcinoma / deep submucosal invasion. Near-neighbors: paris-classification, haggitt-level.');
    root.appendChild(select('Kudo pit-pattern type', 'kudo-type', [
      ['I', 'I — roundish pits (normal, non-neoplastic)'],
      ['II', 'II — stellar / papillary pits (hyperplastic, non-neoplastic)'],
      ['IIIS', 'IIIS — small tubular pits, smaller than type I (adenoma)'],
      ['IIIL', 'IIIL — tubular pits, larger than type I (adenoma)'],
      ['IV', 'IV — branch- / gyrus-like pits (adenoma, often villous)'],
      ['V', 'V — non-structured / irregular pits (suggestive of invasion)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['kudo-type'], () => safe(o, () => {
      const r = M.kudo({ type: val('kudo-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
