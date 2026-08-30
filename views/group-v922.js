// spec-v922 §2: renderer for cohens-kappa — agreement between two raters on a yes/no call
// (Clinical Scoring & Risk, Group G).
//
// The prevalence index prints on every result, not in a footnote, because a kappa near zero
// beside 95% agreement is the single most common way this number is misread.

import { el, clear } from '../lib/dom.js';
import * as K from '../lib/cohens-kappa-v922.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cohens-kappa'(root) {
    numField(root, 'Both raters said yes', 'ck-bothyes');
    numField(root, 'First said yes, second said no', 'ck-firstyes');
    numField(root, 'First said no, second said yes', 'ck-secondyes');
    numField(root, 'Both raters said no', 'ck-bothno');

    const ids = ['ck-bothyes', 'ck-firstyes', 'ck-secondyes', 'ck-bothno'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = K.cohensKappa({
        bothYes: val('ck-bothyes'),
        firstYesSecondNo: val('ck-firstyes'),
        firstNoSecondYes: val('ck-secondyes'),
        bothNo: val('ck-bothno'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.paradoxNote);
      note(o, r.biasNote);
      if (r.pabakNote) note(o, r.pabakNote);
      note(o, r.labelsNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is arithmetic on four counts. It does not decide whether the agreement is good enough for what the rating is for.' }));
  },
};
