// spec-v598: renderer for the Japan Thyroid Association thyroid-storm criteria. Group G. Sections are h2 (an
// h3 under the page h1 is a heading-level skip). The CNS question sits in its own section above the other
// four features, because it is the privileged one: with it, one other feature reaches TS1; without it,
// three are needed (lib/jta-thyroid-storm-v598.js).
//
// Per spec-v11 section 5.3 these criteria classify and never treat, and a negative result is never presented
// as excluding thyroid storm.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/jta-thyroid-storm-v598.js';
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
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];
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
const jid = (key) => `jta-${key}`;

export const renderers = {
  'jta-thyroid-storm'(root) {
    note(root, 'TS1 is DEFINITE and TS2 is SUSPECTED — grades of diagnostic certainty, not of severity. The Burch-Wartofsky Point Scale on this site answers the same question with a point scale instead, and the two are known to disagree.');

    heading(root, 'The prerequisite');
    root.appendChild(select('Thyrotoxicosis (elevated free T3 or free T4)', jid('thyrotoxicosis'), [
      ['', '--'],
      ['confirmed', 'Confirmed by thyroid function tests'],
      ['labs-unavailable', 'Thyroid function tests not available'],
      ['absent', 'Absent'],
    ]));
    root.appendChild(select('Clinical evidence of thyroid disease (history, goiter, exophthalmos)', jid('clinicalThyroidDisease'), YN));
    note(root, M.NO_LABS_NOTE);

    heading(root, 'The privileged feature');
    root.appendChild(select('Central nervous system manifestation', jid('cnsManifestation'), YN));
    note(root, M.CNS_DESCRIPTION);
    note(root, M.CNS_PRIVILEGE_NOTE);

    heading(root, 'The other four features');
    for (const f of M.NON_CNS_FEATURES) root.appendChild(select(f.text, jid(f.key), YN));
    note(root, `Heart failure here means: ${M.CHF_DESCRIPTION}`);
    note(root, `Gastrointestinal or hepatic disturbance means: ${M.GI_DESCRIPTION}`);

    heading(root, 'The exclusion question');
    root.appendChild(select('Has an alternative cause of the findings been considered and excluded?', jid('alternativeCauseExcluded'), YN));
    note(root, M.EXCLUSION_NOTE);

    const ids = [jid('thyrotoxicosis'), jid('clinicalThyroidDisease'), jid('cnsManifestation'),
      ...M.NON_CNS_FEATURES.map((f) => jid(f.key)), jid('alternativeCauseExcluded')];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        thyrotoxicosis: val(jid('thyrotoxicosis')),
        clinicalThyroidDisease: val(jid('clinicalThyroidDisease')),
        cnsManifestation: val(jid('cnsManifestation')),
        alternativeCauseExcluded: val(jid('alternativeCauseExcluded')),
      };
      for (const f of M.NON_CNS_FEATURES) args[f.key] = val(jid(f.key));
      const r = M.jtaThyroidStorm(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.grade },
        { label: 'CNS manifestation', value: r.cnsManifestation ? 'present' : 'absent' },
        { label: 'Other features', value: `${r.otherFeatureCount} of 4` },
        { label: 'Needed for TS1', value: r.cnsManifestation ? `${M.TS1_FEATURES_WITH_CNS}` : `${M.TS1_FEATURES_WITHOUT_CNS}` },
        { label: 'Via no-labs route', value: r.viaNoLabsRoute ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'How it differs from its companion');
    note(root, M.COMPANION_NOTE);
    note(root, M.GRADE_NOTE);
    postureNote(root);
  },
};
