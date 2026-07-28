// spec-v570: renderer for the New Global Definition of ARDS. Group G. Inputs under h2 section headings
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The setting select comes first because it decides whether a severity grade exists at all: mild, moderate
// and severe belong ONLY to the intubated category, and the resource-limited branch is a different
// denominator rather than a milder rung (lib/global-ards-v570.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile applies a definition; it
// never identifies the cause and never indicates an intervention.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/global-ards-v570.js';
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
  'global-ards'(root) {
    note(root, 'The 2023/2024 global definition succeeds the Berlin definition, adding a nonintubated category on high-flow or noninvasive support and a resource-limited category needing neither a blood gas nor positive pressure. SEVERITY GRADING EXISTS ONLY FOR INTUBATED ARDS — a nonintubated patient either meets the definition or does not, and the resource-limited branch is a different denominator, not a milder rung.');

    heading(root, 'Category');
    root.appendChild(select('Setting', 'ards-setting',
      M.ARDS_SETTINGS.map((s) => [s.value, `${s.label} — ${s.text}`])));

    heading(root, 'Criteria that apply to all ARDS categories');
    for (const c of M.COMMON_CRITERIA) {
      root.appendChild(select(c.text, `ards-${c.key}`, YESNO));
    }

    heading(root, 'Respiratory support');
    root.appendChild(select(`Intubated only: is the PEEP at least ${M.MIN_PEEP} cm H2O? (required for every intubated severity category)`, 'ards-peep', YESNO));
    root.appendChild(select(`Nonintubated only: high-flow nasal oxygen at ${M.MIN_HFNO_FLOW} L/min or more, or NIV/CPAP with at least ${M.MIN_PEEP} cm H2O?`, 'ards-support', YESNO));

    heading(root, 'Oxygenation');
    note(root, `${M.FIO2_ESTIMATE} ${M.ALTITUDE_CORRECTION}`);
    root.appendChild(select('Which ratio?', 'ards-ratio-type',
      M.RATIO_TYPES.map((r) => [r.value, `${r.label} (${r.unit})`])));
    root.appendChild(number('Ratio value', 'ards-ratio', '1'));
    root.appendChild(number(`Oxygen saturation (%) — required for the SpO2:FiO2 ratio, which is not valid above ${M.SPO2_VALIDITY_CEILING}%`, 'ards-spo2', '1'));

    const ids = ['ards-setting', ...M.COMMON_CRITERIA.map((c) => `ards-${c.key}`),
      'ards-peep', 'ards-support', 'ards-ratio-type', 'ards-ratio', 'ards-spo2'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {
        setting: val('ards-setting'), peepAtLeast5: val('ards-peep'),
        nonintubatedSupport: val('ards-support'), ratioType: val('ards-ratio-type'),
        ratioValue: val('ards-ratio'), spo2: val('ards-spo2'),
      };
      for (const c of M.COMMON_CRITERIA) input[c.key] = val(`ards-${c.key}`);
      const r = M.globalArds(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Meets the definition', value: !r.applicable ? 'not assessable from this measurement' : (r.meetsDefinition ? 'yes' : 'no') },
        { label: 'Severity', value: r.severity || (r.applicable && r.graded ? 'none assigned' : 'not graded in this category') },
        { label: 'Category', value: r.settingLabel || 'not set' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
