// spec-v872 §2: renderer for measles-case-def — the CDC/CSTE measles case definition (Clinical
// Scoring & Risk, Group G).
//
// The isolation sentence prints on every result, including the one that meets no tier, because
// the action a suspected case needs does not wait on the classification.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/measles-case-def-v872.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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

const domId = (key) => `mcd-${key.toLowerCase()}`;

export const renderers = {
  'measles-case-def'(root) {
    note(root, 'Airborne isolation and notification of public health start on suspicion. They do not wait on the tier below.');

    root.appendChild(el('h2', { text: 'Presentation' }));
    checkField(root, 'A febrile illness accompanied by rash', 'mcd-febrilerashillness');
    for (const i of M.CLINICAL_CRITERIA) checkField(root, i.text, domId(i.key));
    checkField(root, 'A more likely diagnosis has been made', 'mcd-morelikelydiagnosis');

    root.appendChild(el('h2', { text: 'Laboratory and exposure' }));
    for (const i of M.LABORATORY_EVIDENCE) checkField(root, i.text, domId(i.key));
    checkField(root, 'Direct epidemiologic link to a laboratory-confirmed case', 'mcd-epilink');
    checkField(root, 'Rash began 7 to 14 days after vaccination, with vaccine strain identified', 'mcd-vaccinestrainrash');

    const groups = [M.CLINICAL_CRITERIA, M.LABORATORY_EVIDENCE];
    const ids = ['mcd-febrilerashillness', 'mcd-morelikelydiagnosis', 'mcd-epilink', 'mcd-vaccinestrainrash']
      .concat(...groups.map((g) => g.map((i) => domId(i.key))));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        febrileRashIllness: checked('mcd-febrilerashillness'),
        moreLikelyDiagnosis: checked('mcd-morelikelydiagnosis'),
        epiLink: checked('mcd-epilink'),
        vaccineStrainRash: checked('mcd-vaccinestrainrash'),
      };
      for (const g of groups) for (const i of g) args[i.key] = checked(domId(i.key));
      const r = M.measlesCaseDefinition(args);
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.moreLikelyNote) note(o, r.moreLikelyNote);
      if (r.rashDurationNote) note(o, r.rashDurationNote);
      if (r.igmPpvNote) note(o, r.igmPpvNote);
      if (r.igmEarlyNote) note(o, r.igmEarlyNote);
      note(o, r.vaccineNote);
      note(o, r.isolationNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published surveillance definition to findings already recorded. It does not diagnose measles, and it does not decide isolation or reporting, both of which start on suspicion.' }));
  },
};
