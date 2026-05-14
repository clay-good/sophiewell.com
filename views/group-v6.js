// spec-v6 §3: renderers for v6 tiles. Currently:
//   - lab-interpret  (§3.3)
//
// Patterns match the rest of the codebase: every input gets a real
// <label for> in the same file (a11y-check passes), no innerHTML, no
// network calls, no localStorage.

import { el, clear } from '../lib/dom.js';
import {
  interpretLab,
  LAB_ANALYTES,
  LAB_GROUPS,
} from '../lib/lab-interpret.js';

function field(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', 'any');
  inp.setAttribute('placeholder', 'value');
  wrap.appendChild(inp);
  return wrap;
}

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const opt of options) {
    const o = el('option', { value: opt.value, text: opt.label });
    if (opt.value === '') o.setAttribute('value', '');
    sel.appendChild(o);
  }
  wrap.appendChild(sel);
  return wrap;
}

function flagLabel(flag) {
  switch (flag) {
    case 'within-range':       return 'Within range';
    case 'borderline':         return 'Borderline';
    case 'flagged-mild':       return 'Flagged - mild';
    case 'flagged-significant':return 'Flagged - significant';
    default:                   return flag;
  }
}

function renderResult(parent, result) {
  const card = el('div', { class: 'lab-result', 'data-flag': result.flag });
  card.appendChild(el('p', { class: 'lab-result-head' }, [
    el('strong', { text: result.analyte }),
    document.createTextNode(': '),
    document.createTextNode(`${result.value} ${result.units}`),
    document.createTextNode('  '),
    el('span', { class: 'lab-result-band', text: flagLabel(result.flag) }),
  ]));
  card.appendChild(el('p', { class: 'lab-result-range muted',
    text: `Reference range: ${result.refLow} - ${result.refHigh} ${result.units}` }));
  if (result.narrative) {
    card.appendChild(el('p', { class: 'lab-result-narrative', text: result.narrative }));
  }
  if (result.ask) {
    card.appendChild(el('p', { class: 'lab-result-ask', text: result.ask }));
  }
  card.appendChild(el('p', { class: 'lab-result-source muted', text: `Source: ${result.source}` }));
  parent.appendChild(card);
}

export const renderers = {
  'lab-interpret'(root) {
    // Disclaimer band (spec-v6 §6 acceptance: disclaimer present).
    root.appendChild(el('p', { class: 'clinical-notice', role: 'note',
      text: 'Reference information, not medical advice. This explains a value against a published range; it does not diagnose, treat, or replace clinician review. Local labs may use slightly different reference ranges.' }));

    // Shared patient context (sex / pregnancy) - applies to all entries.
    const ctx = el('fieldset', { class: 'lab-ctx' });
    ctx.appendChild(el('legend', { text: 'Patient context (optional)' }));
    ctx.appendChild(selectField('Sex (affects creatinine, hemoglobin, hematocrit, HDL)', 'lab-sex', [
      { value: '',       label: 'Not specified' },
      { value: 'female', label: 'Female' },
      { value: 'male',   label: 'Male' },
    ]));
    const pregWrap = el('p');
    const pregLabel = el('label', { for: 'lab-pregnant' });
    const pregBox = el('input', { id: 'lab-pregnant', type: 'checkbox' });
    pregLabel.appendChild(pregBox);
    pregLabel.appendChild(document.createTextNode(' Pregnant (uses pregnancy-adjusted hemoglobin range)'));
    pregWrap.appendChild(pregLabel);
    ctx.appendChild(pregWrap);
    root.appendChild(ctx);

    // One row per analyte, organized in panels.
    for (const group of LAB_GROUPS) {
      const fs = el('fieldset', { class: 'lab-panel' });
      fs.appendChild(el('legend', { text: group.label }));
      for (const id of group.ids) {
        const a = LAB_ANALYTES[id];
        fs.appendChild(field(`${a.label} (${a.units})`, `lab-${id}`));
      }
      root.appendChild(fs);
    }

    const btn = el('button', { type: 'button', id: 'lab-go', text: 'Interpret values' });
    root.appendChild(el('p', {}, [btn]));

    const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(results);

    function compute() {
      clear(results);
      const sex = document.getElementById('lab-sex').value || null;
      const pregnant = document.getElementById('lab-pregnant').checked;
      const opts = { sex, pregnant };

      const entries = [];
      for (const id of Object.keys(LAB_ANALYTES)) {
        const inp = document.getElementById(`lab-${id}`);
        if (!inp || inp.value === '') continue;
        const v = Number(inp.value);
        if (!Number.isFinite(v)) continue;
        entries.push({ analyteId: id, value: v });
      }

      if (entries.length === 0) {
        results.appendChild(el('p', { class: 'muted',
          text: 'Enter one or more values above, then click Interpret values.' }));
        return;
      }

      results.appendChild(el('h2', { text: `Interpretation (${entries.length} value${entries.length === 1 ? '' : 's'})` }));
      for (const entry of entries) {
        const r = interpretLab(entry.analyteId, entry.value, opts);
        renderResult(results, r);
      }
      results.appendChild(el('p', { class: 'muted lab-result-footer',
        text: 'Calm summary, not a diagnosis. Patient portals frequently release results before a clinician has reviewed them; bring any flagged values to your scheduled visit or contact the office for guidance.' }));
    }

    btn.addEventListener('click', (e) => { e.preventDefault(); compute(); });
  },
};
