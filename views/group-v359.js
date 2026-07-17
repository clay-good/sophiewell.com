// spec-v359: renderer for the NPIAP pressure injury staging (Stage 1-4, Unstageable, DTPI). Group G.
// The clinician/nurse picks the stage; the tile reports the stage, its depth-of-tissue-loss
// description, and whether it is a full-thickness or serious (Stage 3-4 / Unstageable / DTPI) injury.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the NPIAP stage; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/pressure-injury-stage-v359.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pressure-injury-stage-v359.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The care decision stays with the wound-care team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pressure-injury-stage'(root) {
    note(root, 'NPIAP pressure injury staging (2016 revision). Pick the stage by depth of tissue loss. 1: non-blanchable erythema, intact skin; 2: partial-thickness loss, exposed dermis; 3: full-thickness loss (fat may show); 4: full-thickness loss with exposed fascia / muscle / bone; Unstageable: obscured by slough / eschar; Deep Tissue Pressure Injury: persistent non-blanchable deep discoloration. Staging describes tissue loss, not healing. Near-neighbors: braden, bwat.');
    root.appendChild(select('Pressure injury stage', 'pi-stage', [
      ['1', 'Stage 1 - non-blanchable erythema, intact skin'],
      ['2', 'Stage 2 - partial-thickness loss, exposed dermis'],
      ['3', 'Stage 3 - full-thickness skin loss (fat may be visible)'],
      ['4', 'Stage 4 - full-thickness loss, fascia / muscle / bone exposed'],
      ['unstageable', 'Unstageable - obscured by slough / eschar'],
      ['dtpi', 'Deep Tissue Pressure Injury - persistent deep discoloration'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['pi-stage'], () => safe(o, () => {
      const r = M.pressureInjuryStage({ stage: val('pi-stage') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
