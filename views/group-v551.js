// spec-v551: renderer for the iRECIST time-point response. Group G. Section headings are h2 (never h3 - an
// h3 under the page h1 is a heading-level skip).
//
// The four confirmation questions sit under their OWN heading, which names the condition that makes them
// apply: they are read only when iUPD was recorded previously AND the current combination is still
// progressed. Each label carries its own threshold, because the source does not make them uniform - 5 mm
// for target disease, any increase for non-target (lib/irecist-v551.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 this assigns a trial data
// category; it never decides whether to continue or stop treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/irecist-v551.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  irecist(root) {
    note(root, 'iRECIST adapts RECIST 1.1 for trials of immunotherapeutics, because immune-cell infiltration can transiently enlarge lesions — or make undetectable lesions detectable — before a deep and durable response follows. Progression is never assigned on a single scan: the first assessment meeting RECIST 1.1 progression criteria is iUPD, unconfirmed, and iCPD requires a confirmatory assessment at least 4 weeks and no more than 8 weeks later. New lesions produce iUPD but are recorded separately and are never added to the sum of measures of the original target lesions.');

    heading(root, 'This assessment');
    root.appendChild(select('Target-lesion response (RECIST 1.1 criteria)', 'irecist-target',
      M.TARGET_RESPONSES.map((r) => [r.value, `${r.label} — ${r.text}`])));
    root.appendChild(select('Non-target-lesion response', 'irecist-nontarget',
      M.NON_TARGET_RESPONSES.map((r) => [r.value, `${r.label} — ${r.text}`])));
    root.appendChild(select('New lesions present?', 'irecist-newlesions', YESNO));

    heading(root, 'The preceding assessment');
    note(root, 'Without a prior iUPD, iCPD is not reachable at all — progression is never confirmed on a single scan.');
    root.appendChild(select('Was iUPD recorded at the immediately preceding assessment?', 'irecist-prior', YESNO));

    heading(root, 'Confirmation, if iUPD was recorded previously');
    note(root, 'Read only when the preceding assessment was iUPD and this one is still progressed. Confirmation requires FURTHER increase, not persistence: no change from the prior iUPD remains iUPD. The thresholds are deliberately not uniform across categories.');
    root.appendChild(select('Target disease: sum of measures up by at least 5 mm since the prior iUPD?', 'irecist-t-inc', YESNO));
    root.appendChild(select('Non-target disease: any further increase? (need not be unequivocal progression)', 'irecist-nt-inc', YESNO));
    root.appendChild(select('New lesions: NLT sum up at least 5 mm, any NLNT increase, or additional new lesions?', 'irecist-nl-inc', YESNO));
    root.appendChild(select('RECIST 1.1 progression in a category that had not previously progressed?', 'irecist-newcat', YESNO));

    const o = out(); root.appendChild(o);
    wire(['irecist-target', 'irecist-nontarget', 'irecist-newlesions', 'irecist-prior',
      'irecist-t-inc', 'irecist-nt-inc', 'irecist-nl-inc', 'irecist-newcat'], () => safe(o, () => {
      const r = M.irecist({
        target: val('irecist-target'), nonTarget: val('irecist-nontarget'),
        newLesions: val('irecist-newlesions'), priorIupd: val('irecist-prior'),
        targetIncrease: val('irecist-t-inc'), nonTargetIncrease: val('irecist-nt-inc'),
        newLesionIncrease: val('irecist-nl-inc'), newCategoryProgression: val('irecist-newcat'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Time-point response', value: r.response },
        { label: 'Bar reset', value: r.resetApplied ? 'yes — shrinkage against baseline after a prior iUPD' : 'no' },
        { label: 'Confirmation window', value: r.confirmationWindow },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
