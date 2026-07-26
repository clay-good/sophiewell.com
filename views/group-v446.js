// spec-v446: renderer for the ROP (retinopathy of prematurity) stage (1-5). Group G. The ophthalmologist
// picks the stage; the tile reports the stage and its retinal description. As a stage descriptor it reports
// the stage the ophthalmologist has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the ROP stage; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/rop-stage-v446.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rop-stage-v446.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the ophthalmology / neonatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rop-stage'(root) {
    note(root, 'The International Classification of Retinopathy of Prematurity (ICROP) stage of acute ROP at the vascular/avascular junction. Pick the stage. 1: demarcation line; 2: ridge; 3: ridge with fibrovascular proliferation; 4: partial retinal detachment (4A extrafoveal, 4B foveal); 5: total retinal detachment. Zone and plus disease are separate axes that also drive management. Reports the stage the ophthalmologist has determined, not a diagnosis or a treatment decision. Near-neighbors: sarnat-hie, papile-ivh.');
    root.appendChild(select('ROP stage', 'rop-stage', [
      ['1', '1 - demarcation line'],
      ['2', '2 - ridge'],
      ['3', '3 - ridge with fibrovascular proliferation'],
      ['4', '4 - partial retinal detachment (4A/4B)'],
      ['5', '5 - total retinal detachment'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['rop-stage'], () => safe(o, () => {
      const r = M.ropStage({ stage: val('rop-stage') });
      resultRow(o, [
        { text: r.band },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
