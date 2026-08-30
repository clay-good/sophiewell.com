// spec-v901 §2: renderer for iad-globiad — the GLOBIAD categorization of
// incontinence-associated dermatitis (Clinical Scoring & Risk, Group G).
//
// The not-a-pressure-injury sentence prints on every result, and the two pattern questions are
// asked so the tile can push back when the findings point at pressure instead.

import { el, clear } from '../lib/dom.js';
import * as I from '../lib/iad-globiad-v901.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id, detail) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  if (detail) wrap.appendChild(el('span', { class: 'muted', text: ' ' + detail }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'iad-globiad'(root) {
    note(root, 'Moisture damage is top-down over skin that has been wet. A pressure injury is bottom-up over a bony prominence.');

    root.appendChild(el('h2', { text: 'The skin' }));
    checkField(root, 'Skin loss is present', 'iad-skinloss', 'Redness alone is category 1; skin loss is category 2.');
    checkField(root, 'Clinical signs of infection are present', 'iad-infectionsigns', 'The B subcategory.');

    root.appendChild(el('h2', { text: 'The pattern' }));
    note(root, 'These two do not change the category. They are here so this tool can say when the findings point at pressure damage instead.');
    checkField(root, 'The damage is over a bony prominence', 'iad-overbonyprominence');
    checkField(root, 'The edges are distinct', 'iad-distinctedges');

    const ids = ['iad-skinloss', 'iad-infectionsigns', 'iad-overbonyprominence', 'iad-distinctedges'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = I.iadGlobiad({
        skinLoss: checked('iad-skinloss'),
        infectionSigns: checked('iad-infectionsigns'),
        overBonyProminence: checked('iad-overbonyprominence'),
        distinctEdges: checked('iad-distinctedges'),
      });
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.patternNote);
      note(o, r.infectionNote);
      note(o, r.notPressureNote);
      note(o, r.coexistNote);
      note(o, r.productNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records a finding against a published categorization. It does not diagnose infection, and it does not stage a pressure injury.' }));
  },
};
