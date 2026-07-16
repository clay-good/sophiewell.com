// spec-v337: renderer for the Outerbridge classification of articular cartilage damage (grades
// 0-IV). Group G. The surgeon picks the grade seen at arthroscopy; the tile reports the grade, its
// description, and whether it is a full-thickness (grade IV) lesion.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the cartilage grade; it never asserts a diagnosis, a surgical
// recommendation, or an outcome prediction (lib/outerbridge-v337.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/outerbridge-v337.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The cartilage-repair and management decisions stay with the surgeon and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'outerbridge-cartilage'(root) {
    note(root, 'Outerbridge classification (Outerbridge 1961) of articular cartilage damage seen at arthroscopy. Pick the grade. 0 normal; I softening/swelling; II partial-thickness fissures (<=1.5 cm, not to bone); III fissuring to subchondral bone (>1.5 cm); IV exposed subchondral bone (full-thickness loss). The arthroscopic-cartilage companion to the Kellgren-Lawrence radiographic grade. Near-neighbors: kellgren-lawrence.');
    root.appendChild(select('Outerbridge grade', 'outer-grade', [
      ['0', '0 — normal cartilage'],
      ['I', 'I — softening and swelling'],
      ['II', 'II — partial-thickness fissures (<=1.5 cm, not to bone)'],
      ['III', 'III — fissuring to subchondral bone (>1.5 cm)'],
      ['IV', 'IV — exposed subchondral bone (full-thickness loss)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['outer-grade'], () => safe(o, () => {
      const r = M.outerbridge({ grade: val('outer-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.grade },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
