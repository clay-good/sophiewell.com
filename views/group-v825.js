// spec-v825 §2: renderer for igg4-rd-2020 — the 2020 revised comprehensive diagnostic
// criteria for IgG4-related disease (Clinical Scoring & Risk, Group G).
//
// The three pathological sub-items are listed as equals under a heading saying "two of
// three", because that is the 2020 change: the IgG4 immunostain is one route among three and
// not the item itself.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/igg4-rd-2020-v825.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'igg4-rd-2020'(root) {
    note(root, 'These are the 2020 revised criteria, not the 2011 originals. The pathological item now needs two of three sub-items, so storiform fibrosis can carry it when the IgG4 stain cannot.');

    root.appendChild(el('h2', { text: 'Item 1: clinical and radiological' }));
    root.appendChild(checkField('One or more organs show diffuse or localized swelling, a mass or a nodule characteristic of IgG4-related disease', 'ig4-organ'));
    root.appendChild(checkField('The only swelling is lymph node swelling, with a single organ involved', 'ig4-nodes'));

    root.appendChild(el('h2', { text: 'Item 2: serological' }));
    numField(root, 'Serum IgG4, mg per dL', 'ig4-serum', { min: '0', step: '1' });

    root.appendChild(el('h2', { text: 'Item 3: pathological, two of these three' }));
    root.appendChild(checkField('Dense lymphocyte and plasma cell infiltration with fibrosis', 'ig4-infiltrate'));
    root.appendChild(checkField('IgG4-positive to IgG-positive cell ratio above 40 percent, with more than 10 IgG4-positive cells per high-power field', 'ig4-ratio'));
    root.appendChild(checkField('Typical tissue fibrosis, particularly storiform fibrosis, or obliterative phlebitis', 'ig4-storiform'));

    const ids = ['ig4-organ', 'ig4-nodes', 'ig4-serum', 'ig4-infiltrate', 'ig4-ratio', 'ig4-storiform'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.igg4Rd2020({
        organSwelling: checked('ig4-organ'),
        lymphNodesOnly: checked('ig4-nodes'),
        serumIgg4: val('ig4-serum'),
        denseInfiltrate: checked('ig4-infiltrate'),
        igg4Ratio: checked('ig4-ratio'),
        storiformFibrosis: checked('ig4-storiform'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Pathological sub-items', value: `${r.pathologySubItems.length}/3` },
      ]);
      if (r.possibleWarning) note(o, r.possibleWarning);
      if (r.pathologyNote) note(o, r.pathologyNote);
      if (r.lymphNote) note(o, r.lymphNote);
      if (r.thresholdNote) note(o, r.thresholdNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to findings already gathered. It does not start corticosteroids or rituximab, and it does not exclude the malignancy these criteria assume has been considered.' }));
  },
};
