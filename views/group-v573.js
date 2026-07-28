// spec-v573: renderer for the Modified Asthma Predictive Index. Group G. The frequency gate and the two
// criteria lists get their own h2 headings (never h3 - an h3 under the page h1 is a heading-level skip),
// because the instrument is a two-gate boolean and the layout should not read as one pooled checklist.
//
// The eosinophil criterion accepts a percentage as well as a yes/no, so the boundary at exactly 4.0 percent
// can be resolved by the lib rather than by the reader (lib/mapi-asthma-v573.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports an index; it
// never diagnoses asthma and never indicates a controller.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mapi-asthma-v573.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
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
  'mapi-asthma'(root) {
    note(root, 'The mAPI is not a score — it is a two-gate boolean. It is positive when there have been at least 4 wheezing episodes in a year AND either at least 1 major criterion or at least 2 minor criteria. Criteria cannot substitute for the frequency gate. Note that the mAPI is not “the original API plus food allergy”: allergic rhinitis was REMOVED from the minors, so it is not scored here.');

    heading(root, 'Frequency gate');
    note(root, 'A literal COUNT of episodes. The original API used a 1-to-5 rating scale instead, and the two are not interchangeable.');
    root.appendChild(number('Wheezing episodes in the past year', 'mapi-episodes', '1'));

    heading(root, 'Major criteria (at least 1 satisfies the second gate)');
    for (const c of M.MAPI_MAJOR_CRITERIA) {
      root.appendChild(select(c.text, `mapi-${c.key}`, YESNO));
    }

    heading(root, 'Minor criteria (at least 2 satisfy the second gate)');
    for (const c of M.MAPI_MINOR_CRITERIA) {
      root.appendChild(select(c.text, `mapi-${c.key}`, YESNO));
    }
    root.appendChild(number(`Blood eosinophils (%) — optional; if given it decides the eosinophil criterion, which is ${M.EOSINOPHIL_THRESHOLD}% OR MORE`, 'mapi-eos', '0.1'));

    const ids = ['mapi-episodes', 'mapi-eos',
      ...M.MAPI_MAJOR_CRITERIA.map((c) => `mapi-${c.key}`),
      ...M.MAPI_MINOR_CRITERIA.map((c) => `mapi-${c.key}`)];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { wheezeEpisodes: val('mapi-episodes'), eosinophilPercent: val('mapi-eos') };
      for (const c of [...M.MAPI_MAJOR_CRITERIA, ...M.MAPI_MINOR_CRITERIA]) input[c.key] = val(`mapi-${c.key}`);
      const r = M.mapiAsthma(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'mAPI', value: r.positive ? 'positive' : 'negative' },
        { label: 'Frequency gate', value: r.frequencyGate ? `met (${r.wheezeEpisodes} episodes)` : `not met (${r.wheezeEpisodes} episodes)` },
        { label: 'Criteria gate', value: `${r.majorCount} major, ${r.minorCount} minor — ${r.criteriaGate ? 'met' : 'not met'}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
