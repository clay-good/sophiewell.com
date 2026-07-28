// spec-v580: renderer for the modified EHRA symptom scale. Group G. Questions under h2 section headings
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The 2a/2b split is asked as its own question, and only when daily activity is unaffected, because that is
// the one boundary on the scale where the discriminator is SUBJECTIVE rather than functional - and it is
// the boundary the modification exists to draw. A single five-way pick would bury it
// (lib/ehra-af-v580.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile classifies symptom
// burden; it never diagnoses atrial fibrillation and says nothing about stroke risk.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ehra-af-v580.js';
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
  'ehra-af'(root) {
    note(root, 'The modified EHRA scale is the SYMPTOM axis for atrial fibrillation, alongside the stroke, bleeding and recurrence scores. The ladder is 1, 2a, 2b, 3, 4 — there is no class 2, so it cannot be stored as an integer without collapsing 2a into 2b. It is physician-assessed, and it says nothing about stroke risk.');

    heading(root, 'Symptoms');
    note(root, `The rater considers ${M.EVALUATED_SYMPTOMS.join(', ')} — but these are domains to weigh, not inputs. The class depends only on the effect on daily activity.`);
    root.appendChild(select('Does atrial fibrillation cause any symptoms?', 'ehra-any', YESNO));

    heading(root, 'Effect on normal daily activity');
    root.appendChild(select('Activity impact', 'ehra-activity',
      M.ACTIVITY_LEVELS.map((a) => [a.value, a.text])));

    heading(root, 'The 2a / 2b split — asked only when activity is unaffected');
    note(root, '2a and 2b share the same objective criterion. They are separated only by whether the patient is troubled by the symptoms — the one place on this scale where function is not the discriminator.');
    root.appendChild(select('Is the patient troubled by the symptoms?', 'ehra-troubled', YESNO));

    const o = out(); root.appendChild(o);
    wire(['ehra-any', 'ehra-activity', 'ehra-troubled'], () => safe(o, () => {
      const r = M.ehraAf({
        anySymptoms: val('ehra-any'), activityImpact: val('ehra-activity'),
        troubledBySymptoms: val('ehra-troubled'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'mEHRA class', value: `${r.classLabel} — ${r.severity}` },
        { label: 'Decided by', value: r.decidedBy },
        { label: 'Subjective split used', value: r.subjectiveSplitApplied ? 'yes — the 2a/2b boundary' : 'no' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
