// spec-v1700: drug-interaction-kinetics tools 1, 2, 5 and 6 (ICH M12).
// ddi-basic-screen, ddi-static-aucr, ddi-cr-ir-predict, enzyme-recovery-time.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import { plot } from '../lib/components.js';
import * as DBS from '../lib/ddi-basic-screen-v1700.js';
import * as DSA from '../lib/ddi-static-aucr-v1700.js';
import * as DCI from '../lib/ddi-cr-ir-predict-v1700.js';
import * as ERT from '../lib/enzyme-recovery-time-v1700.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '5', placeholder }));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) {
  const n = document.getElementById(id);
  if (!n) return '';
  return n.type === 'checkbox' ? n.checked : n.value;
}
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
// chart(result) -> a plot figure or null. It renders beside the answer region, not in it, so the live region
// announces the answer and not a table of plotted values (docs/design.md 7).
function tool(root, pairs, compute, chart) {
  const o = out(); root.appendChild(o);
  const area = el('div', { class: 'plot-area' });
  root.appendChild(area);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    clear(area);
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    const r = compute(args);
    show(r, o);
    if (chart && r.valid) { const fig = chart(r); if (fig) area.appendChild(fig); }
  }));
}

export const renderers = {
  'ddi-basic-screen'(root) {
    selectField(root, 'Mechanism', 'dbs-mech', DBS.MECHANISM_OPTIONS);
    selectField(root, 'Concentration unit for Cmax, Ki,u and KI,u', 'dbs-unit', DBS.UNIT_OPTIONS);
    numField(root, 'Molecular weight (g/mol; for ng/mL and the gut test)', 'dbs-mw', '');
    numField(root, 'Cmax at the highest dose at steady state (total)', 'dbs-cmax', '');
    numField(root, 'fu,p, the unbound fraction in plasma', 'dbs-fup', '');
    checkField(root, 'A measured fu,p below 1% has been shown reliable', 'dbs-fupval');
    numField(root, 'Or Cmax,u directly, in place of Cmax and fu,p', 'dbs-cmaxu', '0.1');
    numField(root, 'Ki,u (reversible and gut tests)', 'dbs-ki', '');
    numField(root, 'Gut test: maximum clinical dose (mg)', 'dbs-dose', '');
    numField(root, 'Time-dependent: KI,u', 'dbs-ki2', '1');
    numField(root, 'Time-dependent: kinact (per minute)', 'dbs-kinact', '0.05');
    selectField(root, 'Time-dependent: enzyme, for M12 Table 6\'s kdeg', 'dbs-enzyme', DBS.ENZYME_OPTIONS);
    numField(root, 'Or kdeg (per minute), in place of the table', 'dbs-kdeg', '');
    tool(root, [['dbs-mech', 'mechanism'], ['dbs-unit', 'unit'], ['dbs-mw', 'mw'], ['dbs-cmax', 'cmax'], ['dbs-fup', 'fup'], ['dbs-fupval', 'fupValidated'], ['dbs-cmaxu', 'cmaxu'], ['dbs-ki', 'ki'], ['dbs-dose', 'dose'], ['dbs-ki2', 'kI'], ['dbs-kinact', 'kinact'], ['dbs-enzyme', 'enzyme'], ['dbs-kdeg', 'kdeg']], DBS.ddiBasicScreen);
  },
  'ddi-static-aucr'(root) {
    note(root, 'All concentrations in µM. Leave a mechanism blank to leave it out.');
    numField(root, 'fm: fraction of the substrate\'s hepatic clearance by this enzyme', 'dsa-fm', '0.9');
    numField(root, 'Fg: the substrate\'s fraction escaping gut metabolism (blank: 1)', 'dsa-fg', '');
    numField(root, 'Reversible: Ki', 'dsa-ki', '0.5');
    numField(root, 'Time-dependent: kinact (per minute)', 'dsa-kinact', '');
    numField(root, 'Time-dependent: KI', 'dsa-ki2', '');
    selectField(root, 'Time-dependent: enzyme, for M12 Table 6\'s liver kdeg', 'dsa-enzyme', DSA.ENZYME_OPTIONS);
    numField(root, 'Or liver kdeg (per minute)', 'dsa-kdegh', '');
    numField(root, 'Gut kdeg (per minute; blank: intestinal CYP3A4 from Table 6)', 'dsa-kdegg', '');
    numField(root, 'Induction: Emax (fold)', 'dsa-emax', '4');
    numField(root, 'Induction: EC50', 'dsa-ec50', '1');
    numField(root, 'Induction: d scaling factor (blank: 1)', 'dsa-d', '');
    numField(root, 'Liver inhibitor concentration [I]h', 'dsa-ih', '1');
    numField(root, 'Gut inhibitor concentration [I]g', 'dsa-ig', '');
    checkField(root, 'Estimate [I]h and [I]g from the dose with M12\'s equations instead', 'dsa-est');
    numField(root, 'Estimate: fu,p', 'dsa-fup', '');
    numField(root, 'Estimate: Cmax (total)', 'dsa-cmax', '');
    numField(root, 'Estimate: inhibitor dose (mg)', 'dsa-dose', '');
    numField(root, 'Estimate: molecular weight (g/mol)', 'dsa-mw', '');
    numField(root, 'Estimate: RB, the blood-to-plasma ratio', 'dsa-rb', '');
    numField(root, 'Estimate: Fa (blank: 1)', 'dsa-fa', '');
    numField(root, 'Estimate: the inhibitor\'s Fg (blank: 1)', 'dsa-fgi', '');
    numField(root, 'Estimate: ka per minute (blank: 0.1)', 'dsa-ka', '');
    numField(root, 'Estimate: Qh in L/h (blank: 97)', 'dsa-qh', '');
    numField(root, 'Estimate: Qen in L/h (blank: 18)', 'dsa-qen', '');
    tool(root, [['dsa-fm', 'fm'], ['dsa-fg', 'fg'], ['dsa-ki', 'ki'], ['dsa-kinact', 'kinact'], ['dsa-ki2', 'kI'], ['dsa-enzyme', 'enzyme'], ['dsa-kdegh', 'kdegH'], ['dsa-kdegg', 'kdegG'], ['dsa-emax', 'emax'], ['dsa-ec50', 'ec50'], ['dsa-d', 'd'], ['dsa-ih', 'ih'], ['dsa-ig', 'ig'], ['dsa-est', 'estimate'], ['dsa-fup', 'fup'], ['dsa-cmax', 'cmax'], ['dsa-dose', 'dose'], ['dsa-mw', 'mw'], ['dsa-rb', 'rb'], ['dsa-fa', 'fa'], ['dsa-fgi', 'fgInhibitor'], ['dsa-ka', 'kaPerMin'], ['dsa-qh', 'qh'], ['dsa-qen', 'qen']], DSA.ddiStaticAucr);
  },
  'ddi-cr-ir-predict'(root) {
    selectField(root, 'Compute', 'dci-mode', DCI.MODE_OPTIONS);
    numField(root, 'CR: the substrate\'s CYP3A4 contribution ratio', 'dci-cr', '0.92');
    numField(root, 'IR: the inhibitor\'s CYP3A4 inhibition ratio', 'dci-ir', '0.92');
    numField(root, 'IC: the inducer\'s apparent increase in clearance', 'dci-ic', '');
    numField(root, 'Observed AUC ratio with the strong inhibitor (to find CR or IR)', 'dci-ratio', '');
    textField(root, 'The inhibitor dose the IR applies to', 'dci-dose', 'itraconazole 200 mg');
    tool(root, [['dci-mode', 'mode'], ['dci-cr', 'cr'], ['dci-ir', 'ir'], ['dci-ic', 'ic'], ['dci-ratio', 'observedRatio'], ['dci-dose', 'irDose']], DCI.ddiCrIrPredict);
  },
  'enzyme-recovery-time'(root) {
    selectField(root, 'Enzyme, for M12 Table 6\'s kdeg', 'ert-enzyme', ERT.ENZYME_OPTIONS);
    numField(root, 'Or kdeg (per minute), in place of the table', 'ert-kdeg', '');
    numField(root, 'Starting level as a fraction of baseline (0 if fully inactivated; above 1 if induced)', 'ert-e0', '3');
    numField(root, 'Hours since the drug was stopped (optional)', 'ert-hours', '72');
    numField(root, 'Washout of the drug itself before recovery starts, hours (optional)', 'ert-washout', '');
    tool(root, [['ert-enzyme', 'enzyme'], ['ert-kdeg', 'kdeg'], ['ert-e0', 'startLevel'], ['ert-hours', 'hoursSinceStop'], ['ert-washout', 'washoutHours']], ERT.enzymeRecoveryTime, (r) => plot({
      title: 'Enzyme level after stopping', xLabel: 'hours since stopping', yLabel: 'percent of baseline',
      series: [{ label: 'Enzyme level', points: r.curve.map((c) => [c.t, c.percent]) }],
      table: { headers: ['Hours', 'Percent of baseline'], rows: r.curve.filter((_, i) => i % 2 === 0).map((c) => [c.t, c.percent]) },
    }));
  },
};
