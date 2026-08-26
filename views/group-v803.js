// spec-v803 §2: renderer for anaphylaxis-criteria — the 2020 World Allergy Organization
// diagnostic criteria (Clinical Scoring & Risk, Group G). The diagnostic companion to
// anaphylaxis-grade, which grades severity once the diagnosis is made.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The two criteria
// sit under separate headings, because they are alternatives and either alone is enough.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/anaphylaxis-criteria-v803.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. Anaphylaxis is a clinical diagnosis and epinephrine is the first-line treatment. Nothing here is a reason to delay it, and not meeting either criterion does not exclude anaphylaxis.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'anaphylaxis-criteria'(root) {
    note(root, 'Either criterion alone makes anaphylaxis highly likely. They are alternatives, not steps: the second exists precisely so that a reaction with no rash still counts.');
    root.appendChild(el('h2', { text: 'Criterion 1: skin or mucosa, plus another system' }));
    root.appendChild(checkField('Acute onset with skin or mucosal involvement (hives, flushing, swollen lips, tongue or uvula)', 'ana-skin'));
    root.appendChild(checkField('Respiratory compromise (dyspnea, wheeze, stridor, reduced peak flow, hypoxemia)', 'ana-resp'));
    root.appendChild(checkField('Reduced blood pressure, or end-organ dysfunction (collapse, syncope, incontinence)', 'ana-circ'));
    root.appendChild(checkField('Severe gastrointestinal symptoms (severe crampy pain, repeated vomiting)', 'ana-gi'));
    root.appendChild(el('h2', { text: 'Criterion 2: after a known allergen, even with no rash' }));
    root.appendChild(checkField('Exposure to a known or highly probable allergen for this patient', 'ana-allergen'));
    root.appendChild(checkField('Hypotension', 'ana-hypo'));
    root.appendChild(checkField('Bronchospasm', 'ana-broncho'));
    root.appendChild(checkField('Laryngeal involvement (stridor, vocal change, painful swallowing)', 'ana-larynx'));
    const ids = ['ana-skin', 'ana-resp', 'ana-circ', 'ana-gi', 'ana-allergen', 'ana-hypo', 'ana-broncho', 'ana-larynx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.anaphylaxisCriteria({
        skinOrMucosal: checked('ana-skin'),
        respiratory: checked('ana-resp'),
        circulatory: checked('ana-circ'),
        gastrointestinal: checked('ana-gi'),
        knownAllergen: checked('ana-allergen'),
        hypotension: checked('ana-hypo'),
        bronchospasm: checked('ana-broncho'),
        laryngeal: checked('ana-larynx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criterion 1', value: r.criterion1 ? 'met' : 'not met' },
        { label: 'Criterion 2', value: r.criterion2 ? 'met' : 'not met' },
      ]);
      note(o, r.systems.length ? `Other systems involved: ${r.systems.join(', ')}.` : 'No other organ system selected.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
