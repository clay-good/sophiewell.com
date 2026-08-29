// spec-v875 §2: renderer for cauti-nhsn — the NHSN catheter-associated urinary tract infection
// definition (Clinical Scoring & Risk, Group G).
//
// The catheter-out rule prints on every result, because a symptom set aside without explanation
// looks like the tile lost it.

import { el, clear } from '../lib/dom.js';
import * as U from '../lib/cauti-nhsn-v875.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id, detail) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  if (detail) wrap.appendChild(el('span', { class: 'muted', text: ' ' + detail }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const domId = (key) => `cau-${key.toLowerCase()}`;

export const renderers = {
  'cauti-nhsn'(root) {
    note(root, 'A surveillance attribution. It is not a clinical diagnosis, and it is not a decision about treating asymptomatic bacteriuria.');

    root.appendChild(el('h2', { text: 'The catheter' }));
    numField(root, 'Consecutive calendar days in place, counting the day of insertion as day 1', 'cau-catheterdays', { min: '0', max: '3650', step: '1' });
    checkField(root, 'Still in place on the date of event', 'cau-catheterstillinplace');
    checkField(root, 'Removed the day before the date of event', 'cau-catheterremoveddaybefore');

    root.appendChild(el('h2', { text: 'Symptoms' }));
    for (const s of U.SYMPTOMS) {
      checkField(root, s.text, domId(s.key), U.CATHETER_OUT_ONLY.includes(s.key) ? 'Counted only once the catheter is out.' : null);
    }

    root.appendChild(el('h2', { text: 'Urine culture' }));
    // Written out rather than mapped from U.CULTURE_RESULTS: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Culture result', 'cau-culture', [
      { value: 'none', text: 'No qualifying culture' },
      { value: 'bacterium-threshold', text: 'One or two species, at least one a bacterium at 100,000 CFU/mL or more' },
      { value: 'yeast-only', text: 'Yeast only, at any colony count' },
      { value: 'below-threshold', text: 'Bacterial growth below 100,000 CFU/mL' },
      { value: 'more-than-two-species', text: 'More than two species' },
    ]);

    const ids = ['cau-catheterdays', 'cau-catheterstillinplace', 'cau-catheterremoveddaybefore', 'cau-culture']
      .concat(U.SYMPTOMS.map((s) => domId(s.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        catheterDays: val('cau-catheterdays'),
        catheterStillInPlace: checked('cau-catheterstillinplace'),
        catheterRemovedDayBefore: checked('cau-catheterremoveddaybefore'),
        culture: val('cau-culture'),
      };
      for (const s of U.SYMPTOMS) args[s.key] = checked(domId(s.key));
      const r = U.cautiNhsn(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.speciesNote) note(o, r.speciesNote);
      if (r.yeastNote) note(o, r.yeastNote);
      note(o, r.catheterOutNote);
      note(o, r.deviceRuleNote);
      note(o, r.surveillanceNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published surveillance definition to findings already recorded. It does not diagnose an infection, and it does not decide whether to treat or to remove a catheter.' }));
  },
};
