// spec-v809 §2: renderer for forrest-classification — the endoscopic stigmata classes of a
// bleeding peptic ulcer (Clinical Scoring & Risk, Group G).
//
// One select, six literal options. The options are written out one by one rather than built
// from a loop on purpose: the tool-page builder resolves option TEXT only from literal
// markup, and a loop would leave the pre-rendered pages printing raw values like "iia".

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/forrest-classification-v809.js';
import { resultRow } from '../lib/result-copy.js';

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'forrest-classification'(root) {
    note(root, 'Choose what the endoscopist sees at the ulcer base. The classes are not an ordered ladder: a non-bleeding visible vessel rebleeds more often than an oozing ulcer.');

    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'forrest-stigma', text: 'Endoscopic finding at the ulcer base' }));
    wrap.appendChild(el('br'));
    const sel = el('select', { id: 'forrest-stigma' });
    sel.appendChild(el('option', { value: '', text: '- choose -' }));
    sel.appendChild(el('option', { value: 'ia', text: 'Spurting arterial bleeding' }));
    sel.appendChild(el('option', { value: 'ib', text: 'Oozing bleeding, no visible vessel' }));
    sel.appendChild(el('option', { value: 'iia', text: 'Non-bleeding visible vessel' }));
    sel.appendChild(el('option', { value: 'iib', text: 'Adherent clot, resistant to washing' }));
    sel.appendChild(el('option', { value: 'iic', text: 'Flat pigmented spot' }));
    sel.appendChild(el('option', { value: 'iii', text: 'Clean ulcer base' }));
    wrap.appendChild(sel);
    root.appendChild(wrap);

    const o = out(); root.appendChild(o);
    wire(['forrest-stigma'], () => safe(o, () => {
      const r = M.forrestClassification({ stigma: val('forrest-stigma') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Endoscopic therapy', value: r.endoscopicTherapy },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This describes a finding already made at endoscopy. It does not perform or withhold hemostasis.' }));
  },
};
