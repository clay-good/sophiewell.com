// spec-v530: renderer for the Vesikari clinical severity score. Group G. Seven selects under two h2 section
// headings separating what happened over the episode from what was found and done (never h3 - an h3 under
// the page h1 is a heading-level skip).
//
// Each select's options come from lib/vesikari-v530.js, so the dehydration select genuinely has NO 1-point
// option and the treatment select stops at 2. A shared 0-3 option list would offer scores the instrument
// does not define and push the maximum past 20.
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile grades an episode's
// severity in retrospect; it never triages, never grades current dehydration, and never indicates fluids or
// admission.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/vesikari-v530.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const EPISODE = new Set(['diarrheaDays', 'stoolsPerDay', 'vomitingDays', 'vomitsPerDay']);

export const renderers = {
  'vesikari'(root) {
    note(root, 'The Vesikari clinical severity score grades a whole episode of acute gastroenteritis: seven items, total 0 to 20, with below 7 mild, 7 to 10 moderate, and 11 or more severe. It grades the episode in retrospect, not how dehydrated the child is right now — the Gorelick and clinical dehydration scales answer that. Two shapes catch people out: dehydration has no 1-point option, and rehydration and hospitalization are one treatment item rather than two. The temperature is a rectal-equivalent reading.');

    const ids = [];
    const add = (item) => {
      const id = `ves-${item.key}`;
      ids.push(id);
      root.appendChild(select(item.text, id, item.options.map((o) => [o.value, o.text])));
    };

    heading(root, 'Over the whole episode');
    for (const item of M.VESIKARI_ITEMS.filter((i) => EPISODE.has(i.key))) add(item);

    heading(root, 'Fever, dehydration, and treatment');
    for (const item of M.VESIKARI_ITEMS.filter((i) => !EPISODE.has(i.key))) add(item);

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const item of M.VESIKARI_ITEMS) args[item.key] = val(`ves-${item.key}`);
      const r = M.vesikari(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 20` },
        { label: 'Severity', value: r.severity },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
