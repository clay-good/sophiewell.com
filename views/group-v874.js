// spec-v874 §2: renderer for clabsi-lcbi — the NHSN central line-associated bloodstream
// infection definition (Clinical Scoring & Risk, Group G).
//
// The surveillance-not-diagnosis sentence prints on every result, because the whole risk of this
// definition is reading its answer as a clinical one.

import { el, clear } from '../lib/dom.js';
import * as C from '../lib/clabsi-lcbi-v874.js';
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
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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

const domId = (key) => `cl-${key.toLowerCase()}`;

export const renderers = {
  'clabsi-lcbi'(root) {
    note(root, 'A surveillance attribution, decided by rules about timing and culture counts. It is not a clinical diagnosis.');

    root.appendChild(el('h2', { text: 'Patient and organism' }));
    // Written out rather than mapped from the lib constants: scripts/lib/option-labels.mjs reads
    // option text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Age group', 'cl-age', [
      { value: 'adult', text: 'Older than one year' },
      { value: 'infant', text: 'One year old or younger' },
    ]);
    selectField(root, 'Blood culture result', 'cl-organism', [
      { value: 'none', text: 'No positive blood culture' },
      { value: 'recognized-pathogen', text: 'Recognized pathogen' },
      { value: 'common-commensal', text: 'Common commensal' },
    ]);
    checkField(root, 'The commensal was grown from two or more blood cultures drawn on separate occasions, on the same or consecutive days', 'cl-commensaltwocultures');
    checkField(root, 'The organism is related to an infection at another site', 'cl-secondarysite');

    root.appendChild(el('h2', { text: 'Signs and symptoms' }));
    note(root, 'Needed only for the common-commensal route. The accepted list differs by age; both lists are offered here.');
    for (const s of C.ADULT_SIGNS) checkField(root, s.text, domId(s.key));
    for (const s of C.INFANT_SIGNS) if (!C.ADULT_SIGNS.some((a) => a.key === s.key)) checkField(root, s.text + ' (one year old or younger)', domId(s.key));

    root.appendChild(el('h2', { text: 'The central line' }));
    numField(root, 'Consecutive calendar days in place, counting the day of insertion as day 1', 'cl-linedays', { min: '0', max: '3650', step: '1' });
    checkField(root, 'The line was in place on the day of the event, or the day before', 'cl-linepresentonordaybefore');

    const allSigns = [...C.ADULT_SIGNS, ...C.INFANT_SIGNS];
    const ids = ['cl-age', 'cl-organism', 'cl-commensaltwocultures', 'cl-secondarysite', 'cl-linedays', 'cl-linepresentonordaybefore']
      .concat(allSigns.map((s) => domId(s.key)));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        age: val('cl-age'),
        organism: val('cl-organism'),
        commensalTwoCultures: checked('cl-commensaltwocultures'),
        secondarySite: checked('cl-secondarysite'),
        lineDays: val('cl-linedays'),
        linePresentOnOrDayBefore: checked('cl-linepresentonordaybefore'),
      };
      for (const s of allSigns) args[s.key] = checked(domId(s.key));
      const r = C.clabsiLcbi(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.cultureCountNote) note(o, r.cultureCountNote);
      if (r.signsNote) note(o, r.signsNote);
      if (r.secondaryNote) note(o, r.secondaryNote);
      note(o, r.deviceRuleNote);
      note(o, r.surveillanceNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published surveillance definition to findings already recorded. It does not diagnose an infection, and it does not decide whether to treat or to remove a line.' }));
  },
};
