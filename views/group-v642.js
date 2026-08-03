// spec-v642 §2: renderer for yamaguchi-aosd — the Yamaguchi criteria for
// Adult-Onset Still's Disease (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. This is a
// counting rule with exclusion vetoes, not a weighted sum: the view groups the
// four major, four minor, and three exclusion checkboxes, and the lib enforces the
// >= 5 total with >= 2 major rule and the exclusion veto. A blank form scores 0 and
// reports the criteria are not met rather than erroring.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/yamaguchi-v642.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The classification is the cited criteria set’s, computed from the bounded inputs you entered — the tile takes your read, it does not interpret a lab, exam, or chart on its own. Classification criteria are built to standardize study cohorts, not to diagnose an individual; adult-onset Still’s disease is a diagnosis of exclusion, and the diagnosis and management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'yamaguchi-aosd'(root) {
    note(root, 'Yamaguchi criteria for Adult-Onset Still’s Disease (Yamaguchi 1992): classify when ≥ 5 of the 8 criteria are present INCLUDING ≥ 2 major, AND no exclusion is present. Sensitivity 96.2%, specificity 92.1%.');
    note(root, 'Major criteria:');
    root.appendChild(checkField('Fever ≥ 39°C lasting ≥ 1 week', 'yam-fever'));
    root.appendChild(checkField('Arthralgia lasting ≥ 2 weeks', 'yam-arthralgia'));
    root.appendChild(checkField('Typical salmon-pink macular/maculopapular nonpruritic rash appearing during fever', 'yam-rash'));
    root.appendChild(checkField('Leukocytosis ≥ 10,000/mm³ with ≥ 80% granulocytes', 'yam-leuko'));
    note(root, 'Minor criteria:');
    root.appendChild(checkField('Sore throat', 'yam-throat'));
    root.appendChild(checkField('Lymphadenopathy and/or splenomegaly', 'yam-lymph'));
    root.appendChild(checkField('Liver dysfunction (elevated transaminases/LDH)', 'yam-liver'));
    root.appendChild(checkField('Negative rheumatoid factor AND negative ANA', 'yam-rfana'));
    note(root, 'Exclusions (any present vetoes classification):');
    root.appendChild(checkField('Infection (e.g. sepsis, infectious mononucleosis)', 'yam-infection'));
    root.appendChild(checkField('Malignancy (e.g. malignant lymphoma)', 'yam-malignancy'));
    root.appendChild(checkField('Other rheumatic disease (e.g. polyarteritis nodosa, rheumatoid vasculitis)', 'yam-rheumatic'));
    const ids = ['yam-fever', 'yam-arthralgia', 'yam-rash', 'yam-leuko', 'yam-throat', 'yam-lymph', 'yam-liver', 'yam-rfana', 'yam-infection', 'yam-malignancy', 'yam-rheumatic'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.yamaguchiAosd({
        feverMajor: chk('yam-fever'), arthralgia: chk('yam-arthralgia'), rash: chk('yam-rash'), leukocytosis: chk('yam-leuko'),
        soreThroat: chk('yam-throat'), lymphSpleen: chk('yam-lymph'), liverDysfunction: chk('yam-liver'), negativeRfAna: chk('yam-rfana'),
        exclInfection: chk('yam-infection'), exclMalignancy: chk('yam-malignancy'), exclRheumatic: chk('yam-rheumatic'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria', value: `${r.total}/8 (${r.majorCount} major, ${r.minorCount} minor)` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
