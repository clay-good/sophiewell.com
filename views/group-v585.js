// spec-v585: renderer for the updated RUCAM. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The R-ratio inputs come FIRST and in their own section, because the ratio decides
// which of the two scoring tables applies before any item is answered, and the two item lists that follow
// are rebuilt when the pattern changes (lib/rucam-v585.js).
//
// Per spec-v11 section 5.3 this grades causality, never severity, never a diagnosis, and never a reason to
// readminister a drug.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rucam-v585.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
  return wrap;
}
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
const opts = (list) => [['', '--'], ...list.map((i) => [i.value, i.points === null ? `${i.text}` : `${i.text} — ${i.points}`])];
const YN = [['', '--'], ['yes', 'Yes'], ['no', 'No']];

// Both scale-dependent lists are rebuilt whenever the R ratio moves across a boundary.
function fillScaleSelects(scale) {
  for (const [id, list] of [['rucam-onset', M.ONSET_ITEMS[scale]], ['rucam-course', M.COURSE_ITEMS[scale]]]) {
    const s = document.getElementById(id);
    if (!s) continue;
    const keep = s.value;
    clear(s);
    for (const [value, text] of opts(list)) s.appendChild(el('option', { value, text }));
    if (list.some((i) => i.value === keep)) s.value = keep;
  }
}

export const renderers = {
  rucam(root) {
    note(root, 'Grades the probability that a particular drug or herb caused an episode of liver injury. There are TWO scoring tables, and the R ratio picks one before any item is answered — mixed injury is scored on the cholestatic table, having none of its own.');

    heading(root, 'The R ratio — this picks the scale');
    root.appendChild(number('ALT', 'rucam-alt'));
    root.appendChild(number('ALT upper limit of normal', 'rucam-alt-uln'));
    root.appendChild(number('ALP', 'rucam-alp'));
    root.appendChild(number('ALP upper limit of normal', 'rucam-alp-uln'));
    note(root, `R = (ALT / ALT upper limit) / (ALP / ALP upper limit). Hepatocellular at ${M.R_HEPATOCELLULAR} or above, cholestatic at ${M.R_CHOLESTATIC} or below, mixed strictly between — and mixed uses the cholestatic table.`);

    heading(root, 'Timing — a score, and also a possible exclusion');
    root.appendChild(select('Time to onset', 'rucam-onset', opts(M.ONSET_ITEMS.hepatocellular)));
    note(root, 'Onset before the drug was started, or too long after it was stopped, EXCLUDES the case: no total is produced at all. The window differs by scale.');
    root.appendChild(select('Course after stopping the drug', 'rucam-course', opts(M.COURSE_ITEMS.hepatocellular)));
    note(root, 'The dechallenge windows are 30 days on the hepatocellular scale and 180 on the cholestatic, with different point ranges. These two lists change when the R ratio crosses a boundary.');

    heading(root, 'Risk factors');
    root.appendChild(select(`Age ${M.AGE_RISK_THRESHOLD} years or over`, 'rucam-age', YN));
    root.appendChild(select('Alcohol use, or pregnancy on the cholestatic scale', 'rucam-alcpreg', YN));
    note(root, M.RISK_CELL_NOTE);

    heading(root, 'The four domains that are identical on both scales');
    root.appendChild(select('Concomitant drugs', 'rucam-concomitant', opts(M.CONCOMITANT_ITEMS)));
    root.appendChild(select('Exclusion of other causes', 'rucam-exclusion', opts(M.EXCLUSION_ITEMS)));
    root.appendChild(select('Previous information on hepatotoxicity', 'rucam-prior', opts(M.PRIOR_INFO_ITEMS)));
    root.appendChild(select('Response to readministration', 'rucam-rechallenge', opts(M.RECHALLENGE_ITEMS)));
    note(root, M.RECHALLENGE_WARNING);

    const ids = ['rucam-alt', 'rucam-alt-uln', 'rucam-alp', 'rucam-alp-uln', 'rucam-onset', 'rucam-course',
      'rucam-age', 'rucam-alcpreg', 'rucam-concomitant', 'rucam-exclusion', 'rucam-prior', 'rucam-rechallenge'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {
        alt: val('rucam-alt'), altUln: val('rucam-alt-uln'),
        alp: val('rucam-alp'), alpUln: val('rucam-alp-uln'),
        onset: val('rucam-onset'), course: val('rucam-course'),
        ageAtLeast55: val('rucam-age'), alcoholOrPregnancy: val('rucam-alcpreg'),
        concomitant: val('rucam-concomitant'), exclusion: val('rucam-exclusion'),
        priorInfo: val('rucam-prior'), rechallenge: val('rucam-rechallenge'),
      };
      const probe = M.rucam(args);
      if (probe.scale) fillScaleSelects(probe.scale);
      const r = probe.scale ? M.rucam({ ...args, onset: val('rucam-onset'), course: val('rucam-course') }) : probe;
      if (!r.valid) { note(o, r.message); return; }
      if (r.excluded) {
        resultRow(o, [{ text: r.band }, { label: 'R ratio', value: `${r.rRatio}` }, { label: 'Pattern', value: r.pattern }]);
        note(o, r.bandText);
        note(o, r.note);
        return;
      }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Score', value: `${r.total}` },
        { label: 'Causality', value: r.band },
        { label: 'R ratio', value: `${r.rRatio} (${r.pattern})` },
        { label: 'Best reachable on this scale', value: `${r.scaleMax}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
