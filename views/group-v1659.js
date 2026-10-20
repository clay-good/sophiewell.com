// spec-v1659: public health epidemiology measures.
// incidence-prevalence, mortality-measures, ypll, attributable-proportion, vaccine-effectiveness, smr,
// direct-age-standardization.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as IP from '../lib/incidence-prevalence-v1659.js';
import * as MM from '../lib/mortality-measures-v1659.js';
import * as YP from '../lib/ypll-v1659.js';
import * as AP from '../lib/attributable-proportion-v1659.js';
import * as VE from '../lib/vaccine-effectiveness-v1659.js';
import * as SMR from '../lib/smr-v1659.js';
import * as DAS from '../lib/direct-age-standardization-v1659.js';

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
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
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
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'incidence-prevalence'(root) {
    selectField(root, 'Measure', 'ipv-measure', IP.MEASURES);
    numField(root, 'New cases, or people with the condition for prevalence', 'ipv-cases', 'e.g. 16');
    numField(root, 'Population, or person-time for a rate', 'ipv-denominator', 'e.g. 6400');
    selectField(root, 'Person-time unit (incidence rate only)', 'ipv-unit', [{ value: 'person-years', text: 'Person-years' }, { value: 'person-months', text: 'Person-months' }, { value: 'person-days', text: 'Person-days' }]);
    selectField(root, 'Multiplier', 'ipv-multiplier', [{ value: '100', text: 'per 100 (%)' }, { value: '1000', text: 'per 1,000' }, { value: '10000', text: 'per 10,000' }, { value: '100000', text: 'per 100,000' }]);
    tool(root, [['ipv-measure', 'measure'], ['ipv-cases', 'cases'], ['ipv-denominator', 'denominator'], ['ipv-unit', 'timeUnit'], ['ipv-multiplier', 'multiplier']], IP.incidencePrevalence);
  },
  'mortality-measures'(root) {
    selectField(root, 'Measure', 'mm-measure', MM.MEASURES.map((m) => ({ value: m[0], text: m[1] })));
    numField(root, 'Numerator (deaths)', 'mm-numerator', 'e.g. 2419921');
    numField(root, 'Denominator', 'mm-denominator', 'e.g. 290809777');
    selectField(root, 'Multiplier (the measure\'s usual one if blank)', 'mm-multiplier', [{ value: '100', text: 'per 100 (%)' }, { value: '1000', text: 'per 1,000' }, { value: '10000', text: 'per 10,000' }, { value: '100000', text: 'per 100,000' }]);
    tool(root, [['mm-measure', 'measure'], ['mm-numerator', 'numerator'], ['mm-denominator', 'denominator'], ['mm-multiplier', 'multiplier']], MM.mortalityMeasures);
  },
  'ypll'(root) {
    numField(root, 'End point age (years)', 'ypll-end', 'e.g. 65');
    areaField(root, 'Age groups (youngest, oldest, deaths) or one age at death per line', 'ypll-deaths', '0, 4, 125');
    numField(root, 'Population under the end point (for the rate)', 'ypll-pop', '');
    selectField(root, 'Rate multiplier (default per 1,000)', 'ypll-multiplier', [{ value: '100', text: 'per 100 (%)' }, { value: '1000', text: 'per 1,000' }, { value: '10000', text: 'per 10,000' }, { value: '100000', text: 'per 100,000' }]);
    tool(root, [['ypll-end', 'endPoint'], ['ypll-deaths', 'deaths'], ['ypll-pop', 'population'], ['ypll-multiplier', 'multiplier']], YP.ypll);
  },
  'attributable-proportion'(root) {
    numField(root, 'Risk or rate among the exposed', 'apr-exposed', 'e.g. 0.57');
    numField(root, 'Risk or rate among the unexposed', 'apr-unexposed', 'e.g. 0.07');
    tool(root, [['apr-exposed', 'exposed'], ['apr-unexposed', 'unexposed']], AP.attributableProportion);
  },
  'vaccine-effectiveness'(root) {
    selectField(root, 'Efficacy (trial) or effectiveness (field)', 'vef-term', VE.TERMS);
    numField(root, 'Cases among the vaccinated', 'vef-cases-v', 'e.g. 18');
    numField(root, 'Vaccinated persons', 'vef-vacc', 'e.g. 152');
    numField(root, 'Cases among the unvaccinated', 'vef-cases-u', 'e.g. 3');
    numField(root, 'Unvaccinated persons', 'vef-unvacc', 'e.g. 7');
    tool(root, [['vef-term', 'term'], ['vef-cases-v', 'casesVaccinated'], ['vef-vacc', 'vaccinated'], ['vef-cases-u', 'casesUnvaccinated'], ['vef-unvacc', 'unvaccinated']], VE.vaccineEffectiveness);
  },
  'smr'(root) {
    numField(root, 'Observed events', 'smr-observed', 'e.g. 30');
    numField(root, 'Expected events (or enter strata below)', 'smr-expected', 'e.g. 20');
    areaField(root, 'Strata, one per line: person-time, reference rate', 'smr-strata', '10000, 0.001');
    tool(root, [['smr-observed', 'observed'], ['smr-expected', 'expected'], ['smr-strata', 'strata']], SMR.smr);
  },
  'direct-age-standardization'(root) {
    selectField(root, 'Standard population', 'das-standard', DAS.STANDARDS);
    areaField(root, 'Strata, one per line. 2000 standard: youngest, oldest (or +), events, population. Own: label, events, population, standard', 'das-strata', '25, 34, 120, 84112');
    selectField(root, 'Multiplier (default per 100,000)', 'das-multiplier', [{ value: '1000', text: 'per 1,000' }, { value: '10000', text: 'per 10,000' }, { value: '100000', text: 'per 100,000' }]);
    tool(root, [['das-standard', 'standard'], ['das-strata', 'strata'], ['das-multiplier', 'multiplier']], DAS.directAgeStandardization);
  },
};
