// spec-v577: renderer for MAGIC acute GVHD staging and grading. Group G. Organs under an h2 section heading
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// Each organ's select is built from ITS OWN ladder. Upper GI offers only 0 and 1, because the instrument
// has no upper-GI stage 2, 3 or 4 - a uniform 0-4 select per organ would invent three unreachable values
// (lib/magic-gvhd-v577.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile stages an established
// diagnosis; it never diagnoses GVHD and never indicates immunosuppression.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/magic-gvhd-v577.js';
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

const opts = (ladder) => ladder.map((s) => [String(s.stage), `Stage ${s.stage} — ${s.text}`]);

export const renderers = {
  'magic-gvhd'(root) {
    note(root, 'MAGIC is the consortium standard that superseded the Modified Glucksberg grade. Stage each organ, then the grade is read off a PATTERN table — it is NOT a maximum over the organ stages. Stage-3 skin alone is grade II, while stage-2 lower GI alone is grade III, so a lower organ stage can produce a higher overall grade.');

    heading(root, 'Organ stages');
    root.appendChild(select('Skin (active erythema only)', 'magic-skin', opts(M.SKIN_STAGES)));
    root.appendChild(select('Liver (bilirubin)', 'magic-liver', opts(M.LIVER_STAGES)));
    root.appendChild(select('Upper GI — only two states exist', 'magic-upper', opts(M.UPPER_GI_STAGES)));
    note(root, `There is no upper-GI stage 2, 3 or 4. In the grade III and IV rules upper GI appears as a constraint rather than a contributor, and since ${M.UPPER_GI_MAX_STAGE} is its maximum, it can never by itself drive those grades.`);
    root.appendChild(select('Lower GI (stool output per day)', 'magic-lower', opts(M.LOWER_GI_STAGES)));
    note(root, 'Stage 4 is qualitative and overrides volume. The volume criteria also have separate adult and pediatric denominators, and two alternative measures within each that can disagree — the source gives no tie-break rule, which is why the stage is entered rather than computed from a volume.');

    const o = out(); root.appendChild(o);
    wire(['magic-skin', 'magic-liver', 'magic-upper', 'magic-lower'], () => safe(o, () => {
      const r = M.magicGvhd({
        skin: val('magic-skin'), liver: val('magic-liver'),
        upperGi: val('magic-upper'), lowerGi: val('magic-lower'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Overall grade', value: r.gradeLabel },
        { label: 'Rule applied', value: r.rule },
        { label: 'Organ stages', value: `skin ${r.stages.skin}, liver ${r.stages.liver}, upper GI ${r.stages.upperGi}, lower GI ${r.stages.lowerGi}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
