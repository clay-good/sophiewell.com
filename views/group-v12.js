// spec-v86 §2: renderers for the three toxicology decision rules
// (serotonin-toxicity, salicylate-toxicity, toxic-alcohol).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable/edge outputs route through fmt() (spec-v53 §3.2). Each tile renders
// the spec-v50 §3 clinical posture note and quotes the cited source's own
// per-band interpretation - none authors a treatment order in Sophie's voice
// (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import * as T from '../lib/tox-v86.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
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
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { return Number(document.getElementById(id).value); }
function selVal(id) { return document.getElementById(id).value; }
function chk(id) { return document.getElementById(id).checked; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function list(items) { return el('ul', {}, items.filter(Boolean)); }
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The verdict and interpretation are the cited source’s; the decision to dialyze, treat, or admit stays with the clinician, local protocol, and poison-control consultation.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 serotonin-toxicity ------------------------------------------
  'serotonin-toxicity'(root) {
    root.appendChild(checkField('Patient has taken a serotonergic agent (required precondition)', 'st-agent'));
    root.appendChild(checkField('Spontaneous clonus', 'st-spont-clonus'));
    root.appendChild(checkField('Inducible clonus', 'st-induc-clonus'));
    root.appendChild(checkField('Ocular clonus', 'st-ocular-clonus'));
    root.appendChild(checkField('Agitation', 'st-agitation'));
    root.appendChild(checkField('Diaphoresis', 'st-diaphoresis'));
    root.appendChild(checkField('Tremor', 'st-tremor'));
    root.appendChild(checkField('Hyperreflexia', 'st-hyperreflexia'));
    root.appendChild(checkField('Hypertonia', 'st-hypertonia'));
    root.appendChild(checkField('Temperature over 38 C', 'st-temp'));
    const o = out(); root.appendChild(o);
    wire(['st-agent', 'st-spont-clonus', 'st-induc-clonus', 'st-ocular-clonus', 'st-agitation', 'st-diaphoresis', 'st-tremor', 'st-hyperreflexia', 'st-hypertonia', 'st-temp'], () => safe(o, () => {
      const r = T.serotoninToxicity({
        serotonergicAgent: chk('st-agent'),
        spontaneousClonus: chk('st-spont-clonus'),
        inducibleClonus: chk('st-induc-clonus'),
        ocularClonus: chk('st-ocular-clonus'),
        agitation: chk('st-agitation'),
        diaphoresis: chk('st-diaphoresis'),
        tremor: chk('st-tremor'),
        hyperreflexia: chk('st-hyperreflexia'),
        hypertonia: chk('st-hypertonia'),
        tempOver38: chk('st-temp'),
      });
      o.appendChild(list([
        li(r.band, r.meets ? 'warn' : null),
      ]));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 salicylate-toxicity -----------------------------------------
  'salicylate-toxicity'(root) {
    root.appendChild(field('Serum salicylate level', 'sal-level', { placeholder: 'e.g. 110' }));
    root.appendChild(selectField('Level units', 'sal-unit', [
      { value: 'mgdl', text: 'mg/dL' },
      { value: 'mmoll', text: 'mmol/L' },
    ]));
    root.appendChild(selectField('Poisoning type', 'sal-type', [
      { value: 'acute', text: 'Acute' },
      { value: 'chronic', text: 'Chronic' },
    ]));
    root.appendChild(field('Arterial pH (optional)', 'sal-ph', { placeholder: 'e.g. 7.25' }));
    root.appendChild(checkField('Altered mental status', 'sal-ams'));
    root.appendChild(checkField('New hypoxemia requiring oxygen (ARDS picture)', 'sal-hypox'));
    root.appendChild(checkField('Impaired kidney function', 'sal-ckd'));
    root.appendChild(checkField('Standard therapy failing or unavailable', 'sal-failing'));
    const o = out(); root.appendChild(o);
    wire(['sal-level', 'sal-unit', 'sal-type', 'sal-ph', 'sal-ams', 'sal-hypox', 'sal-ckd', 'sal-failing'], () => safe(o, () => {
      const r = T.salicylateToxicity({
        level: val('sal-level'),
        unit: selVal('sal-unit'),
        pH: val('sal-ph'),
        poisoningType: selVal('sal-type'),
        alteredMentalStatus: chk('sal-ams'),
        hypoxemia: chk('sal-hypox'),
        impairedKidney: chk('sal-ckd'),
        standardTherapyFailing: chk('sal-failing'),
      });
      const recommend = /recommended|suggested/i.test(r.recommendation);
      const items = [li(r.recommendation, recommend ? 'warn' : null)];
      if (r.levelMgDl != null) items.push(li(`Salicylate level: ${fmt(r.levelMgDl, { digits: 1, unit: 'mg/dL' })}${r.severity ? ` (${r.severity})` : ''}`));
      if (r.criteriaText) items.push(li(`Criterion met: ${r.criteriaText}.`));
      o.appendChild(list(items));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 toxic-alcohol -----------------------------------------------
  'toxic-alcohol'(root) {
    root.appendChild(field('Measured serum osmolality (mOsm/kg)', 'ta-osm', { placeholder: 'e.g. 305' }));
    root.appendChild(field('Serum sodium (mEq/L)', 'ta-na', { placeholder: 'e.g. 140' }));
    root.appendChild(field('Glucose (mg/dL)', 'ta-glu', { placeholder: 'e.g. 90' }));
    root.appendChild(field('BUN (mg/dL)', 'ta-bun', { placeholder: 'e.g. 14' }));
    root.appendChild(field('Serum ethanol (mg/dL, optional)', 'ta-etoh', { placeholder: 'e.g. 0' }));
    root.appendChild(field('Arterial pH (optional)', 'ta-ph', { placeholder: 'e.g. 7.25' }));
    root.appendChild(field('Serum bicarbonate (mEq/L, optional)', 'ta-bicarb', { placeholder: 'e.g. 18' }));
    root.appendChild(field('Documented methanol / ethylene-glycol level (mg/dL, optional)', 'ta-level', { placeholder: 'e.g. 25' }));
    root.appendChild(checkField('Recent-ingestion history', 'ta-recent'));
    root.appendChild(checkField('Strong clinical suspicion', 'ta-suspicion'));
    const o = out(); root.appendChild(o);
    wire(['ta-osm', 'ta-na', 'ta-glu', 'ta-bun', 'ta-etoh', 'ta-ph', 'ta-bicarb', 'ta-level', 'ta-recent', 'ta-suspicion'], () => safe(o, () => {
      const r = T.toxicAlcohol({
        measuredOsm: val('ta-osm'),
        sodium: val('ta-na'),
        glucose: val('ta-glu'),
        bun: val('ta-bun'),
        ethanol: val('ta-etoh'),
        pH: val('ta-ph'),
        bicarbonate: val('ta-bicarb'),
        knownLevel: val('ta-level'),
        recentIngestion: chk('ta-recent'),
        strongSuspicion: chk('ta-suspicion'),
      });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Enter the measured osmolality and serum sodium.' })); return; }
      o.appendChild(list([
        li(`Calculated osmolality: ${fmt(r.calcOsm, { digits: 1, unit: 'mOsm/kg' })} (2 x Na + glucose/18 + BUN/2.8 + ethanol/3.7).`),
        li(`Osmolar gap (measured - calculated): ${fmt(r.osmolarGap, { digits: 1, unit: 'mOsm/kg' })}.`),
        li(r.band, r.indicated ? 'warn' : null),
        r.limbsText ? li(`Indication limb met: ${r.limbsText}.`) : null,
      ]));
      note(o, r.note);
    }));
    postureNote(root);
  },
};
