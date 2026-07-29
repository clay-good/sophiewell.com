// spec-v592: renderer for the Amsterdam II criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The three requirements the "3-2-1" mnemonic omits get their own section, because
// those are the ones families fail and a single flat checklist hides that (lib/amsterdam-ii-v592.js).
//
// Per spec-v11 section 5.3 these are family-history criteria; the tile never diagnoses Lynch syndrome, never
// identifies a gene, and never presents a negative result as a reason to stop an evaluation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/amsterdam-ii-v592.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of [['', '--'], ['no', 'No'], ['yes', 'Yes']]) s.appendChild(el('option', { value, text }));
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
const rid = (key) => `ams-${key}`;

export const renderers = {
  'amsterdam-ii'(root) {
    note(root, `All ${M.REQUIREMENTS.length} requirements must be met — this is a conjunction, not a count, and there is no partial credit.`);

    heading(root, 'The cancer spectrum');
    note(root, M.SPECTRUM_NOTE);

    heading(root, 'The three requirements the "3-2-1" mnemonic covers');
    for (const r of M.REQUIREMENTS.filter((x) => x.inMnemonic)) root.appendChild(select(r.text, rid(r.key)));

    heading(root, 'The three requirements the mnemonic leaves out');
    for (const r of M.REQUIREMENTS.filter((x) => !x.inMnemonic)) root.appendChild(select(r.text, rid(r.key)));
    note(root, M.MNEMONIC_NOTE);

    heading(root, 'For the comparison with Amsterdam I');
    root.appendChild(select('Are all three cancers colorectal?', rid('allThreeColorectal')));
    note(root, 'Amsterdam I counted colorectal cancer only, so a family whose three cancers include an endometrial one meets Amsterdam II and fails Amsterdam I.');

    const ids = [...M.REQUIREMENTS.map((r) => rid(r.key)), rid('allThreeColorectal')];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { allThreeColorectal: val(rid('allThreeColorectal')) };
      for (const r of M.REQUIREMENTS) args[r.key] = val(rid(r.key));
      const res = M.amsterdamII(args);
      if (!res.valid) { note(o, res.message); return; }
      resultRow(o, [
        { text: res.band },
        { label: 'Amsterdam II', value: res.meetsAmsterdamII ? 'met' : 'not met' },
        { label: 'Amsterdam I', value: res.meetsAmsterdamI ? 'met' : 'not met' },
        { label: 'Unmet', value: res.unmetRequirements.length ? res.unmetRequirements.join(', ') : 'none' },
      ]);
      note(o, res.bandText);
      note(o, res.note);
    }));

    heading(root, 'What a negative result does not mean');
    note(root, M.NEGATIVE_NOTE);
    note(root, M.WITHHELD_STATS_NOTE);
    postureNote(root);
  },
};
