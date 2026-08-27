// spec-v828 §2: renderer for cf-diagnosis — the 2017 Cystic Fibrosis Foundation consensus
// diagnostic criteria (Clinical Scoring & Risk, Group G).
//
// Age is asked for even though it no longer changes the threshold. That is the point: the
// lower boundary used to depend on age and does not any more, and the tile can only say so
// where a value falls in the range the two readings disagree about.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cf-diagnosis-v828.js';
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
function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
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
  'cf-diagnosis'(root) {
    note(root, 'A sweat chloride on its own is not a diagnosis: an entry route is required too. And the lower boundary has been 30 mmol/L at every age since 2017, where it used to be 40 above six months.');

    root.appendChild(el('h2', { text: 'Entry route: at least one is required' }));
    root.appendChild(checkField('Positive newborn screen', 'cfd-nbs'));
    root.appendChild(checkField('Clinical features consistent with cystic fibrosis', 'cfd-clinical'));
    root.appendChild(checkField('A sibling with cystic fibrosis', 'cfd-sibling'));

    root.appendChild(el('h2', { text: 'Evidence of CFTR dysfunction' }));
    numField(root, 'Sweat chloride, mmol per L', 'cfd-sweat', { min: '0', max: '200', step: '1' });
    numField(root, 'Age in months', 'cfd-age', { min: '0', step: '1' });
    selField(root, 'CFTR genetic analysis', 'cfd-cftr', [
      ['not-tested', 'Not done'],
      ['two-cf-causing', 'Two CF-causing variants in trans'],
      ['one-or-none', 'One CF-causing variant, or none'],
    ]);

    const ids = ['cfd-nbs', 'cfd-clinical', 'cfd-sibling', 'cfd-sweat', 'cfd-age', 'cfd-cftr'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cfDiagnosis({
        newbornScreenPositive: checked('cfd-nbs'),
        clinicalFeatures: checked('cfd-clinical'),
        affectedSibling: checked('cfd-sibling'),
        sweatChloride: val('cfd-sweat'),
        ageMonths: val('cfd-age'),
        cftrVariants: val('cfd-cftr'),
      });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.sweatBand) rows.push({ label: 'Sweat chloride', value: r.sweatBand });
      resultRow(o, rows);
      if (r.thresholdNote) note(o, r.thresholdNote);
      if (r.intermediateNote) note(o, r.intermediateNote);
      if (r.routeNote) note(o, r.routeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies published criteria to results already obtained. It does not order the sweat test or the genetic panel, and it does not start any therapy.' }));
  },
};
