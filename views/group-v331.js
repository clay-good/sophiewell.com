// spec-v331: renderer for the Fitzpatrick skin phototype (I-VI). Group G. The clinician
// picks the phototype from the skin's sunburn/tan response; the tile reports the type, its
// description, and whether it is a higher-photosensitivity (type I-II) skin.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the phototype; it never asserts a diagnosis or a
// treatment decision (lib/fitzpatrick-v331.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fitzpatrick-v331.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The sun-protection, phototherapy, and laser decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'fitzpatrick-skin-type'(root) {
    note(root, 'Fitzpatrick skin phototype (Fitzpatrick 1988). Pick the type from how the skin responds to UV. Lower types (I–II) burn easily and carry the highest photosensitivity / skin-cancer risk; higher types tan and rarely burn. Used to guide sun protection, phototherapy dosing, and laser settings. Near-neighbors: scorten.');
    root.appendChild(select('Fitzpatrick skin type', 'fitz-type', [
      ['I', 'I — always burns, never tans (pale white)'],
      ['II', 'II — usually burns, tans minimally (fair)'],
      ['III', 'III — sometimes burns, tans gradually (darker white)'],
      ['IV', 'IV — burns minimally, tans well (light brown / olive)'],
      ['V', 'V — rarely burns, tans darkly (brown)'],
      ['VI', 'VI — never burns, deeply pigmented (dark brown / black)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['fitz-type'], () => safe(o, () => {
      const r = M.fitzpatrick({ type: val('fitz-type') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
