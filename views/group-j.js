// Group J (NEW): Public Health & Travel - utilities 172-180.
//
// 172 ACIP routine adult; 173 ACIP routine child; 174 ACIP catch-up;
// 175 Yellow Book by-country; 176 Tetanus prophylaxis decision tree;
// 177 Rabies PEP decision tree; 178 BBP exposure decision tree;
// 179 TB testing interpretation (TST mm + IGRA); 180 STI screening intervals.

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import { renderTable } from '../lib/table.js';
import { renderDecisionTree } from '../lib/tree.js';

function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function num(id) { return Number(document.getElementById(id).value); }

export const renderers = {
  'acip-adult'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('acip-routine-adult', 'adult.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'vaccine', label: 'Vaccine' },
          { key: 'ageBand', label: 'Age band' },
          { key: 'recommendation', label: 'Recommendation' },
        ],
        rows,
      });
    });
  },

  'acip-child'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('acip-routine-child', 'child.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'vaccine', label: 'Vaccine' },
          { key: 'dose', label: 'Dose #' },
          { key: 'atAge', label: 'At age' },
        ],
        rows,
      });
    });
  },

  'acip-catchup'(root) {
    const o = out(); root.appendChild(o);
    loadFile('acip-catchup', 'catchup.json').then((rows) => {
      o.appendChild(el('h2', { text: 'ACIP catch-up minimum intervals' }));
      for (const r of rows) {
        o.appendChild(el('h3', { text: r.vaccine }));
        const ul = el('ul');
        for (const [pair, interval] of Object.entries(r.minIntervalDoses)) {
          ul.appendChild(el('li', { text: `Doses ${pair}: ${interval}` }));
        }
        o.appendChild(ul);
      }
    });
  },

  'yellow-book'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('yellow-book', 'yellow-book.json').then((rows) => {
      // Flatten arrays for table display.
      const flat = rows.map((r) => ({
        country: r.country,
        recommendedVaccines: (r.recommendedVaccines || []).join('; '),
        malariaProphylaxis: r.malariaProphylaxis,
        foodWater: r.foodWater,
        altitude: r.altitude,
      }));
      renderTable(region, {
        columns: [
          { key: 'country', label: 'Country' },
          { key: 'recommendedVaccines', label: 'Recommended vaccines' },
          { key: 'malariaProphylaxis', label: 'Malaria prophylaxis' },
          { key: 'foodWater', label: 'Food / water' },
          { key: 'altitude', label: 'Altitude' },
        ],
        rows: flat,
      });
    });
  },

  tetanus(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('tetanus', 'tetanus.json').then((d) => {
      const result = (key, hist) => ({
        result: `Td/Tdap: ${key.tdap}; TIG: ${key.tig}`,
        rationale: hist,
      });
      const tree = {
        question: 'Wound type?',
        options: [
          { label: 'Clean and minor', next: {
            question: 'Tdap / Td immunization status?',
            options: [
              { label: 'Unknown or <3 doses', ...result(d.cleanMinor.unknownOrLessThan3Doses, 'Clean minor wound, low or unknown immunity.') },
              { label: '>=3 doses, last >10 yr ago', ...result(d.cleanMinor.threeOrMoreDosesLastMoreThan10y, 'Clean minor wound, fully immunized but >10y since last booster.') },
              { label: '>=3 doses, last <=10 yr ago', ...result(d.cleanMinor.threeOrMoreDosesLastWithin10y, 'Clean minor wound, fully immunized within 10 years.') },
            ] } },
          { label: 'Dirty / serious wound', next: {
            question: 'Tdap / Td immunization status?',
            options: [
              { label: 'Unknown or <3 doses', ...result(d.dirtyOrSerious.unknownOrLessThan3Doses, 'Dirty wound, low or unknown immunity.') },
              { label: '>=3 doses, last >5 yr ago', ...result(d.dirtyOrSerious.threeOrMoreDosesLastMoreThan5y, 'Dirty wound, fully immunized but >5y since last booster.') },
              { label: '>=3 doses, last <=5 yr ago', ...result(d.dirtyOrSerious.threeOrMoreDosesLastWithin5y, 'Dirty wound, fully immunized within 5 years.') },
            ] } },
        ],
      };
      renderDecisionTree(region, tree, { stateKey: 'tet' });
    });
  },

  'rabies-pep'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('rabies-pep', 'rabies.json').then((d) => {
      const tree = {
        question: 'Animal involved?',
        options: d.animalRules.map((a) => ({
          label: a.animal,
          next: {
            question: 'Has the patient been previously vaccinated against rabies?',
            options: [
              { label: 'No, immunocompetent',
                result: `${a.action}. If PEP indicated: HRIG ${d.schedule.previouslyUnvaccinated.hrig}; vaccine days ${d.schedule.previouslyUnvaccinated.vaccineDays.join(', ')}.`,
                rationale: 'CDC ACIP rabies PEP schedule (4-dose series for immunocompetent unvaccinated).' },
              { label: 'No, immunocompromised',
                result: `${a.action}. If PEP indicated: HRIG ${d.schedule.immunocompromisedUnvaccinated.hrig}; vaccine days ${d.schedule.immunocompromisedUnvaccinated.vaccineDays.join(', ')}.`,
                rationale: '5-dose series for immunocompromised per CDC ACIP.' },
              { label: 'Yes, previously vaccinated',
                result: `${a.action}. If PEP indicated: ${d.schedule.previouslyVaccinated.hrig}; vaccine days ${d.schedule.previouslyVaccinated.vaccineDays.join(', ')}.`,
                rationale: '2-dose booster for previously vaccinated; HRIG not indicated.' },
            ],
          },
        })),
      };
      renderDecisionTree(region, tree, { stateKey: 'rab' });
    });
  },

  'bbp-exposure'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('bbp-exposure', 'bbp.json').then((d) => {
      const tree = {
        question: 'Exposure type?',
        helpText: 'Percutaneous, mucous-membrane, or intact skin?',
        options: [
          { label: 'Percutaneous (needlestick / sharp)', next: {
            question: 'Source patient HIV status?',
            options: [
              { label: 'HIV positive', next: {
                question: 'Exposed worker HBV vaccination status?',
                options: [
                  { label: 'Vaccinated and known responder',
                    result: `HIV PEP: ${d.hivPep.regimen}, start within ${d.hivPep.startWithin}. HBV: ${d.hbvPep.vaccinatedRespondersExposed}. HCV: ${d.hcv}` },
                  { label: 'Unvaccinated or unknown response',
                    result: `HIV PEP: ${d.hivPep.regimen}. HBV: ${d.hbvPep.sourceUnknown_unvaccinatedExposed}. HCV: ${d.hcv}` },
                ] } },
              { label: 'HIV unknown', next: {
                question: 'Source HBsAg status?',
                options: [
                  { label: 'HBsAg positive',
                    result: `HBV: ${d.hbvPep.sourceHBsAgPositive_unvaccinatedExposed}. HIV PEP: not routinely indicated unless source can be tested. HCV: ${d.hcv}` },
                  { label: 'HBsAg unknown',
                    result: `HBV: ${d.hbvPep.sourceUnknown_unvaccinatedExposed}. HIV PEP: case-by-case. HCV: ${d.hcv}` },
                ] } },
              { label: 'HIV negative & HBsAg negative',
                result: `No PEP needed. HCV: ${d.hcv}` },
            ] } },
          { label: 'Mucous membrane', result:
            `Lower-risk than percutaneous. Discuss with occupational health. HIV PEP regimen if indicated: ${d.hivPep.regimen}. HBV per source / vaccine status. HCV: ${d.hcv}` },
          { label: 'Intact skin', result: 'No PEP needed. Document exposure.' },
        ],
      };
      renderDecisionTree(region, tree, { stateKey: 'bbp' });
    });
  },

  'tb-testing'(root) {
    root.appendChild(el('h3', { text: 'TST induration interpretation' }));
    root.appendChild(el('p', {}, [
      el('label', { for: 'tb-mm', text: 'Induration (mm)' }), el('br'),
      el('input', { id: 'tb-mm', type: 'number', step: '1', value: '0' }),
    ]));
    root.appendChild(el('p', {}, [
      el('label', { for: 'tb-risk', text: 'Risk category' }), el('br'),
      el('select', { id: 'tb-risk' }, [
        el('option', { value: '5', text: 'High (HIV+, recent contact, immunosuppressed, fibrotic CXR)' }),
        el('option', { value: '10', text: 'Moderate (foreign-born, IVDU, healthcare workers, etc.)' }),
        el('option', { value: '15', text: 'Low (no specific risk)' }),
      ]),
    ]));
    const o = out(); root.appendChild(o);
    loadFile('tb-tst-igra', 'tb.json').then((d) => {
      const run = () => {
        clear(o);
        const mm = num('tb-mm');
        const cutoff = Number(document.getElementById('tb-risk').value);
        o.appendChild(el('h2', { text: `TST: ${mm} mm vs cutoff ${cutoff} mm -> ${mm >= cutoff ? 'POSITIVE' : 'Negative'}` }));
        o.appendChild(el('h3', { text: 'IGRA interpretation reference' }));
        const ul = el('ul');
        for (const r of d.igra) ul.appendChild(el('li', { text: `${r.result}: ${r.interpretation}` }));
        o.appendChild(ul);
      };
      document.getElementById('tb-mm').addEventListener('input', run);
      document.getElementById('tb-risk').addEventListener('change', run);
      run();
    });
  },

  'sti-screening'(root) {
    const region = el('div', { id: 'q-results', role: 'region' });
    root.appendChild(region);
    loadFile('sti-screening', 'sti.json').then((rows) => {
      renderTable(region, {
        columns: [
          { key: 'population', label: 'Population' },
          { key: 'tests', label: 'Tests' },
          { key: 'interval', label: 'Interval' },
        ],
        rows: rows.map((r) => ({ ...r, tests: (r.tests || []).join('; ') })),
      });
    });
  },
};
