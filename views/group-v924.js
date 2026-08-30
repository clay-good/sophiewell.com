// spec-v924 §2: renderer for bland-altman — limits of agreement between two measurement methods
// (Clinical Scoring & Risk, Group G).
//
// The correlation-is-not-agreement line prints on every result, because that is the sentence the
// 1986 paper exists to make and the reason anyone reaches for this method.

import { el, clear } from '../lib/dom.js';
import * as B from '../lib/bland-altman-v924.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', step: 'any', inputmode: 'decimal' }, opts || {})));
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
  'bland-altman'(root) {
    numField(root, 'Mean of the differences, in the units measured', 'ba-bias');
    numField(root, 'Standard deviation of the differences', 'ba-sd', { min: '0' });
    numField(root, 'Number of paired measurements', 'ba-pairs', { min: '2', step: '1', inputmode: 'numeric' });

    const ids = ['ba-bias', 'ba-sd', 'ba-pairs'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = B.blandAltman({
        meanDifference: val('ba-bias'),
        sdOfDifferences: val('ba-sd'),
        pairs: val('ba-pairs'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band }]);
      note(o, `Lower limit ${r.lowerLimit}, with a 95% interval of ${r.lowerLimitCi[0]} to ${r.lowerLimitCi[1]}.`);
      note(o, `Upper limit ${r.upperLimit}, with a 95% interval of ${r.upperLimitCi[0]} to ${r.upperLimitCi[1]}.`);
      note(o, `Bias ${r.bias}, with a 95% interval of ${r.biasCi[0]} to ${r.biasCi[1]}.`);
      note(o, r.signNote);
      note(o, r.correlationNote);
      note(o, r.judgementNote);
      note(o, r.uncertaintyNote);
      note(o, r.proportionalNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This is arithmetic on a mean, a standard deviation and a count. It does not decide whether two methods can be used interchangeably.' }));
  },
};
