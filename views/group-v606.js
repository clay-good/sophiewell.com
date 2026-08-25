// spec-v606: renderer for the new Katagiri score. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The two laboratory tiers are shown in SEPARATE sections with their own analytes
// listed, because they share no analyte and presenting them as one ladder is the commonest misreading
// (lib/katagiri-v606.js).
//
// Per spec-v11 section 5.3 this is a group-level survival estimate; it never decides whether to operate,
// never chooses a treatment modality, and never grades the bone.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/katagiri-v606.js';
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
const kid = (key) => `kat-${key}`;

export const renderers = {
  katagiri(root) {
    note(root, `Six factors, 0 to ${M.MAX_SCORE}. Derived in a cohort treated mostly NON-surgically, unlike the other skeletal-metastasis scores on this site.`);

    heading(root, 'Primary site — graded by treatability, not by organ');
    root.appendChild(select('Growth-rate group', kid('primarySite'),
      [['', '--'], ...M.PRIMARY_SITE_GROUPS.map((g) => [g.value, `${g.text} — ${g.points}`])]));
    for (const g of M.PRIMARY_SITE_GROUPS) note(root, `${g.text} (${g.points}): ${g.examples}.`);
    note(root, M.TREATABILITY_NOTE);

    heading(root, 'Visceral or cerebral metastases');
    root.appendChild(select('Extent', kid('visceralMetastases'),
      [['', '--'], ...M.VISCERAL_GROUPS.map((g) => [g.value, `${g.text} — ${g.points}`])]));

    heading(root, 'Laboratory — ABNORMAL tier (1 point for any one)');
    for (const l of M.ABNORMAL_LABS) root.appendChild(select(l.text, kid(l.key), YN));

    heading(root, 'Laboratory — CRITICAL tier (2 points for any one, and it outranks the abnormal tier)');
    for (const l of M.CRITICAL_LABS) root.appendChild(select(l.text, kid(l.key), YN));
    note(root, M.LAB_TIER_NOTE);
    note(root, M.ANY_OF_NOTE);

    heading(root, 'The three one-point items');
    for (const b of M.BINARY_ITEMS) root.appendChild(select(`${b.text} — ${b.points}`, kid(b.key), YN));

    const ids = [kid('primarySite'), kid('visceralMetastases'),
      ...M.ABNORMAL_LABS.map((l) => kid(l.key)), ...M.CRITICAL_LABS.map((l) => kid(l.key)),
      ...M.BINARY_ITEMS.map((b) => kid(b.key))];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        primarySite: val(kid('primarySite')), visceralMetastases: val(kid('visceralMetastases')),
      };
      for (const l of [...M.ABNORMAL_LABS, ...M.CRITICAL_LABS]) args[l.key] = val(kid(l.key));
      for (const b of M.BINARY_ITEMS) args[b.key] = val(kid(b.key));
      const r = M.katagiri(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Band', value: `${r.band} — ${r.risk}` },
        { label: '1-year survival (derivation)', value: `${r.oneYearSurvivalPercent}%` },
        { label: 'Laboratory tier', value: `${r.laboratoryTier} (${r.laboratoryPoints})` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Bands and provenance');
    for (const b of M.BANDS) note(root, `Score ${b.label}: ${b.risk}, ${b.oneYearSurvival}% one-year survival in the derivation cohort.`);
    note(root, M.PREDECESSOR_NOTE);
    note(root, M.COHORT_NOTE);
    postureNote(root);
  },
};
