// spec-v709 §2: renderer for opioid-risk-tool — the Opioid Risk Tool (Clinical Scoring &
// Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. A sex select and
// ten checkboxes; a sex-specific weighted sum maps to an aberrant-behavior risk band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/opioid-risk-tool-v709.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The ORT is a screening aid to guide monitoring intensity, not a reason to withhold appropriate pain treatment. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SEX = [['female', 'Female'], ['male', 'Male']];

export const renderers = {
  'opioid-risk-tool'(root) {
    note(root, 'Opioid Risk Tool (Webster 2005): a sex-specific screen for the risk of aberrant drug-related behavior before long-term opioid therapy. Total: 0–3 low, 4–7 moderate, ≥ 8 high.');
    root.appendChild(selectField('Sex', 'ort-sex', CHOICE(SEX)));
    root.appendChild(checkField('Family history of alcohol abuse', 'ort-fam-alc'));
    root.appendChild(checkField('Family history of illegal drug use', 'ort-fam-illegal'));
    root.appendChild(checkField('Family history of prescription drug abuse', 'ort-fam-rx'));
    root.appendChild(checkField('Personal history of alcohol abuse', 'ort-per-alc'));
    root.appendChild(checkField('Personal history of illegal drug use', 'ort-per-illegal'));
    root.appendChild(checkField('Personal history of prescription drug abuse', 'ort-per-rx'));
    root.appendChild(checkField('Age 16 to 45 years', 'ort-age'));
    root.appendChild(checkField('History of preadolescent sexual abuse', 'ort-abuse'));
    root.appendChild(checkField('ADD, OCD, bipolar, or schizophrenia', 'ort-psych'));
    root.appendChild(checkField('Depression', 'ort-depression'));
    const ids = ['ort-sex', 'ort-fam-alc', 'ort-fam-illegal', 'ort-fam-rx', 'ort-per-alc', 'ort-per-illegal', 'ort-per-rx', 'ort-age', 'ort-abuse', 'ort-psych', 'ort-depression'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.opioidRiskTool({
        sex: val('ort-sex'), famAlcohol: checked('ort-fam-alc'), famIllegal: checked('ort-fam-illegal'), famRx: checked('ort-fam-rx'),
        personalAlcohol: checked('ort-per-alc'), personalIllegal: checked('ort-per-illegal'), personalRx: checked('ort-per-rx'),
        age16to45: checked('ort-age'), sexualAbuse: checked('ort-abuse'), psychAddBipolar: checked('ort-psych'), psychDepression: checked('ort-depression'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
        { label: 'Risk', value: r.tier },
      ]);
      note(o, r.factors.length ? `Points: ${r.factors.join(', ')}.` : 'No risk factors (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
