// spec-v183 §2.3-§2.4: assemble the MCP calculator registry.
//
// Single source of truth (spec-v183 §1.2): compute logic stays in lib/*.js,
// citations/examples/specialties/interpretation stay in lib/meta.js, and the
// tile's name/group/clinical flag stay in app.js `UTILITIES`. This module joins
// the three at load time. The adapter contributes ONLY the input schema and the
// pure mapping functions; everything else is read, never re-typed.
//
// app.js is parsed as TEXT (the same static-parse discipline as
// scripts/check-catalog-truth.mjs) rather than imported, because app.js couples
// to the browser DOM and must never be loaded in the Node MCP process.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { META } from '../lib/meta.js';
import { fieldSchema, makeToArgs, validateInputs } from './fields.js';

import toxV86 from './adapters/tox-v86.js';
import hepV124 from './adapters/hep-v124.js';
import acidbaseV129 from './adapters/acidbase-v129.js';
import cardioV90 from './adapters/cardio-v90.js';
import pulmV91 from './adapters/pulm-v91.js';
import neuroV118 from './adapters/neuro-v118.js';
import endoV136 from './adapters/endo-v136.js';
import periopV97 from './adapters/periop-v97.js';
import oneformulaV167 from './adapters/oneformula-v167.js';
import cardioV101 from './adapters/cardio-v101.js';
import hemeV132 from './adapters/heme-v132.js';
import giV126 from './adapters/gi-v126.js';
import cardioV102 from './adapters/cardio-v102.js';
import cardioV104 from './adapters/cardio-v104.js';
import cvriskV103 from './adapters/cvrisk-v103.js';
import critcareV112 from './adapters/critcare-v112.js';
import fluidrespV113 from './adapters/fluidresp-v113.js';
import hepgiV93 from './adapters/hepgi-v93.js';
import hemoncV94 from './adapters/hemonc-v94.js';
import neuroV119 from './adapters/neuro-v119.js';
import neuroV120 from './adapters/neuro-v120.js';
import neuroV121 from './adapters/neuro-v121.js';
import neuroV122 from './adapters/neuro-v122.js';
import nephroV127 from './adapters/nephro-v127.js';
import renalV128 from './adapters/renal-v128.js';
import uroV130 from './adapters/uro-v130.js';
import uroV131 from './adapters/uro-v131.js';
import hemodynamicsV87 from './adapters/hemodynamics-v87.js';
import nephroV92 from './adapters/nephro-v92.js';
import ebmV163 from './adapters/ebm-v163.js';
import ophthoV164 from './adapters/ophtho-v164.js';
import echoV158 from './adapters/echo-v158.js';
import rheumV147 from './adapters/rheum-v147.js';
import vteV106 from './adapters/vte-v106.js';
import vascularV105 from './adapters/vascular-v105.js';
import nutritionEnergyV152 from './adapters/nutrition-energy-v152.js';
import endoMetabV161 from './adapters/endo-metab-v161.js';
import gapsV185 from './adapters/gaps-v185.js';
import specialtymathV186 from './adapters/specialtymath-v186.js';
import oncStagingV187 from './adapters/onc-staging-v187.js';
import hemeStagingV188 from './adapters/heme-staging-v188.js';
import hemeRiskV189 from './adapters/heme-risk-v189.js';
import hepgiV190 from './adapters/hepgi-v190.js';
import dermuroV191 from './adapters/dermuro-v191.js';
import riskV192 from './adapters/risk-v192.js';
import ltcgaV173 from './adapters/ltcga-v173.js';
import ltcgaV174 from './adapters/ltcga-v174.js';
import ltcgaV175 from './adapters/ltcga-v175.js';
import ltcgaV176 from './adapters/ltcga-v176.js';
import ltcgaV177 from './adapters/ltcga-v177.js';
import ltcgaV178 from './adapters/ltcga-v178.js';
import ltcgaV179 from './adapters/ltcga-v179.js';
import ltcgaV181 from './adapters/ltcga-v181.js';
import ltcgaV182 from './adapters/ltcga-v182.js';
import neuroV95 from './adapters/neuro-v95.js';
import neuroV117 from './adapters/neuro-v117.js';
import psychV96 from './adapters/psych-v96.js';
import psychV123 from './adapters/psych-v123.js';
import pulmV114 from './adapters/pulm-v114.js';
import pulmnodV115 from './adapters/pulmnod-v115.js';
import toxV110 from './adapters/tox-v110.js';
import traumaV108 from './adapters/trauma-v108.js';
import traumaclassV109 from './adapters/traumaclass-v109.js';
import rheumV148 from './adapters/rheum-v148.js';
import rheumV160 from './adapters/rheum-v160.js';
import rheumPeriopV89 from './adapters/rheum-periop-v89.js';
import rheumObV156 from './adapters/rheum-ob-v156.js';
import spineV146 from './adapters/spine-v146.js';
import orthoV144 from './adapters/ortho-v144.js';
import orthoV145 from './adapters/ortho-v145.js';
import surgV142 from './adapters/surg-v142.js';
import urologyV153 from './adapters/urology-v153.js';
import gynV139 from './adapters/gyn-v139.js';
import obV138 from './adapters/ob-v138.js';
import ltcgaV180 from './adapters/ltcga-v180.js';
import metabolicOncV88 from './adapters/metabolic-onc-v88.js';
import enviroV111 from './adapters/enviro-v111.js';
import eddecisionV107 from './adapters/eddecision-v107.js';
import warfarinV133 from './adapters/warfarin-v133.js';
import emsV149 from './adapters/ems-v149.js';
import pkV166 from './adapters/pk-v166.js';
import radiologyV165 from './adapters/radiology-v165.js';
import frailtyV143 from './adapters/frailty-v143.js';
import functionV154 from './adapters/function-v154.js';
import hepV125 from './adapters/hep-v125.js';
import idV137 from './adapters/id-v137.js';
import lymphomaV135 from './adapters/lymphoma-v135.js';
import neuroDisabilityV159 from './adapters/neuro-disability-v159.js';
import oncV134 from './adapters/onc-v134.js';
import suitesV155 from './adapters/suites-v155.js';
import pedsV98 from './adapters/peds-v98.js';
import pedsV140 from './adapters/peds-v140.js';
import pedsGrowthV141 from './adapters/peds-growth-v141.js';
import pedsPercentileV169 from './adapters/peds-percentile-v169.js';
import dermV151 from './adapters/derm-v151.js';
import acsV193 from './adapters/acs-v193.js';
import hemoV194 from './adapters/hemo-v194.js';
import ventV195 from './adapters/vent-v195.js';
import liverV196 from './adapters/liver-v196.js';
import endoQuantV197 from './adapters/endo-quant-v197.js';
import subspecialtyV198 from './adapters/subspecialty-v198.js';
import myeloidPrognosisV199 from './adapters/myeloid-prognosis-v199.js';
import critcareSeverityV200 from './adapters/critcare-severity-v200.js';
import hepatologyGibleedV201 from './adapters/hepatology-gibleed-v201.js';
import cvriskEnginesV202 from './adapters/cvrisk-engines-v202.js';
import periopFrailtyV203 from './adapters/periop-frailty-v203.js';
import nephroFluidsV204 from './adapters/nephro-fluids-v204.js';
import pulmCopdV205 from './adapters/pulm-copd-v205.js';
import tbiStrokeV206 from './adapters/tbi-stroke-v206.js';
import resusTraumaV207 from './adapters/resus-trauma-v207.js';
import nutritionMaternalV208 from './adapters/nutrition-maternal-v208.js';
import cardiologyRiskV209 from './adapters/cardiology-risk-v209.js';
import strokePrognosisV210 from './adapters/stroke-prognosis-v210.js';
import hemeOncRiskV211 from './adapters/heme-onc-risk-v211.js';
import hepFibrosisPortalV212 from './adapters/hep-fibrosis-portal-v212.js';
import acuteInjuryV213 from './adapters/acute-injury-v213.js';
import cardiologyRiskV214 from './adapters/cardiology-risk-v214.js';
import riskScoresV215 from './adapters/risk-scores-v215.js';
import hemePrognosticV216 from './adapters/heme-prognostic-v216.js';
import strokeRiskV217 from './adapters/stroke-risk-v217.js';
import edDecisionV218 from './adapters/ed-decision-v218.js';
import metabolicHepaticV219 from './adapters/metabolic-hepatic-v219.js';
import hepatologyPrognosisV220 from './adapters/hepatology-prognosis-v220.js';
import pulmonaryRiskV221 from './adapters/pulmonary-risk-v221.js';
import rheumClassificationV222 from './adapters/rheum-classification-v222.js';
import dermatologyV223 from './adapters/dermatology-v223.js';
import neurologyV224 from './adapters/neurology-v224.js';
import obgynV225 from './adapters/obgyn-v225.js';
import nephrologyV226 from './adapters/nephrology-v226.js';
import mixedV227 from './adapters/mixed-v227.js';
import mixedV228 from './adapters/mixed-v228.js';
import hematologyV229 from './adapters/hematology-v229.js';
import inflamV230 from './adapters/inflam-v230.js';
import prognosticV231 from './adapters/prognostic-v231.js';
import coagscoreV232 from './adapters/coagscore-v232.js';
import estimatorsV233 from './adapters/estimators-v233.js';
import dermscoreV234 from './adapters/dermscore-v234.js';
import painscoreV235 from './adapters/painscore-v235.js';
import ophthoV236 from './adapters/ophtho-v236.js';
import cardioechoV237 from './adapters/cardioecho-v237.js';
import anthroV238 from './adapters/anthro-v238.js';
import gisurgV239 from './adapters/gisurg-v239.js';
import rehabV240 from './adapters/rehab-v240.js';
import geriV241 from './adapters/geri-v241.js';
import environV242 from './adapters/environ-v242.js';
import entsleepV243 from './adapters/entsleep-v243.js';
import sportsmskV244 from './adapters/sportsmsk-v244.js';
import hemedermV245 from './adapters/hemederm-v245.js';
import ibdV246 from './adapters/ibd-v246.js';
import pedstoxV247 from './adapters/pedstox-v247.js';
import woundidV248 from './adapters/woundid-v248.js';
import renalpulmV249 from './adapters/renalpulm-v249.js';
import obgynV250 from './adapters/obgyn-v250.js';
import cardiometabV251 from './adapters/cardiometab-v251.js';
import orthospineV252 from './adapters/orthospine-v252.js';
import radmeasureV253 from './adapters/radmeasure-v253.js';
import enturopsychV254 from './adapters/enturopsych-v254.js';
import riskscoresV255 from './adapters/riskscores-v255.js';
import rheumcritV256 from './adapters/rheumcrit-v256.js';
import diveV257 from './adapters/dive-v257.js';
import clinical from './adapters/clinical.js';
import clinicalV4 from './adapters/clinical-v4.js';
import clinicalV5 from './adapters/clinical-v5.js';
import clinicalV6 from './adapters/clinical-v6.js';
import clinicalV7 from './adapters/clinical-v7.js';
import clinicalV8 from './adapters/clinical-v8.js';
import scoringV4 from './adapters/scoring-v4.js';
import scoringV6 from './adapters/scoring-v6.js';
import medicationV4 from './adapters/medication-v4.js';
import medicationV5 from './adapters/medication-v5.js';
import field from './adapters/field.js';
import idcritV99 from './adapters/idcrit-v99.js';
import scoringV5 from './adapters/scoring-v5.js';
import renalV277 from './adapters/renal-v277.js';
import fibrosisV275 from './adapters/fibrosis-v275.js';
import nutritionV276 from './adapters/nutrition-v276.js';
import proteinsV274 from './adapters/proteins-v274.js';
import metabolicV273 from './adapters/metabolic-v273.js';
import anthroV272 from './adapters/anthro-v272.js';
import lipidsV271 from './adapters/lipids-v271.js';
import adiposityV270 from './adapters/adiposity-v270.js';
import metabolicV269 from './adapters/metabolic-v269.js';
import inflamV267 from './adapters/inflam-v267.js';
import inflamV268 from './adapters/inflam-v268.js';
import pedsSepsisV278 from './adapters/peds-sepsis-v278.js';
import rccPrognosisV279 from './adapters/rcc-prognosis-v279.js';
import rheumFnV280 from './adapters/rheum-fn-v280.js';
import hccSurveillanceV281 from './adapters/hcc-surveillance-v281.js';
import decisionRulesV258 from './adapters/decision-rules-v258.js';
import pneumoniaRiskV260 from './adapters/pneumonia-risk-v260.js';

const ADAPTER_MODULES = [
  ['tox-v86', toxV86],
  ['hep-v124', hepV124],
  ['acidbase-v129', acidbaseV129],
  ['cardio-v90', cardioV90],
  ['pulm-v91', pulmV91],
  ['neuro-v118', neuroV118],
  ['endo-v136', endoV136],
  ['periop-v97', periopV97],
  ['oneformula-v167', oneformulaV167],
  ['cardio-v101', cardioV101],
  ['heme-v132', hemeV132],
  ['gi-v126', giV126],
  ['cardio-v102', cardioV102],
  ['cardio-v104', cardioV104],
  ['cvrisk-v103', cvriskV103],
  ['critcare-v112', critcareV112],
  ['fluidresp-v113', fluidrespV113],
  ['hepgi-v93', hepgiV93],
  ['hemonc-v94', hemoncV94],
  ['neuro-v119', neuroV119],
  ['neuro-v120', neuroV120],
  ['neuro-v121', neuroV121],
  ['neuro-v122', neuroV122],
  ['nephro-v127', nephroV127],
  ['renal-v128', renalV128],
  ['uro-v130', uroV130],
  ['uro-v131', uroV131],
  ['hemodynamics-v87', hemodynamicsV87],
  ['nephro-v92', nephroV92],
  ['ebm-v163', ebmV163],
  ['ophtho-v164', ophthoV164],
  ['echo-v158', echoV158],
  ['rheum-v147', rheumV147],
  ['vte-v106', vteV106],
  ['vascular-v105', vascularV105],
  ['nutrition-energy-v152', nutritionEnergyV152],
  ['endo-metab-v161', endoMetabV161],
  ['gaps-v185', gapsV185],
  ['specialtymath-v186', specialtymathV186],
  ['onc-staging-v187', oncStagingV187],
  ['heme-staging-v188', hemeStagingV188],
  ['heme-risk-v189', hemeRiskV189],
  ['hepgi-v190', hepgiV190],
  ['dermuro-v191', dermuroV191],
  ['risk-v192', riskV192],
  ['ltcga-v173', ltcgaV173],
  ['ltcga-v174', ltcgaV174],
  ['ltcga-v175', ltcgaV175],
  ['ltcga-v176', ltcgaV176],
  ['ltcga-v177', ltcgaV177],
  ['ltcga-v178', ltcgaV178],
  ['ltcga-v179', ltcgaV179],
  ['ltcga-v181', ltcgaV181],
  ['ltcga-v182', ltcgaV182],
  ['neuro-v95', neuroV95],
  ['neuro-v117', neuroV117],
  ['psych-v96', psychV96],
  ['psych-v123', psychV123],
  ['pulm-v114', pulmV114],
  ['pulmnod-v115', pulmnodV115],
  ['tox-v110', toxV110],
  ['trauma-v108', traumaV108],
  ['traumaclass-v109', traumaclassV109],
  ['rheum-v148', rheumV148],
  ['rheum-v160', rheumV160],
  ['rheum-periop-v89', rheumPeriopV89],
  ['rheum-ob-v156', rheumObV156],
  ['spine-v146', spineV146],
  ['ortho-v144', orthoV144],
  ['ortho-v145', orthoV145],
  ['surg-v142', surgV142],
  ['urology-v153', urologyV153],
  ['gyn-v139', gynV139],
  ['ob-v138', obV138],
  ['ltcga-v180', ltcgaV180],
  ['metabolic-onc-v88', metabolicOncV88],
  ['enviro-v111', enviroV111],
  ['eddecision-v107', eddecisionV107],
  ['warfarin-v133', warfarinV133],
  ['ems-v149', emsV149],
  ['pk-v166', pkV166],
  ['radiology-v165', radiologyV165],
  ['frailty-v143', frailtyV143],
  ['function-v154', functionV154],
  ['hep-v125', hepV125],
  ['id-v137', idV137],
  ['lymphoma-v135', lymphomaV135],
  ['neuro-disability-v159', neuroDisabilityV159],
  ['onc-v134', oncV134],
  ['suites-v155', suitesV155],
  ['peds-v98', pedsV98],
  ['peds-v140', pedsV140],
  ['peds-growth-v141', pedsGrowthV141],
  ['peds-percentile-v169', pedsPercentileV169],
  ['derm-v151', dermV151],
  ['acs-v193', acsV193],
  ['hemo-v194', hemoV194],
  ['vent-v195', ventV195],
  ['liver-v196', liverV196],
  ['endo-quant-v197', endoQuantV197],
  ['subspecialty-v198', subspecialtyV198],
  ['myeloid-prognosis-v199', myeloidPrognosisV199],
  ['critcare-severity-v200', critcareSeverityV200],
  ['hepatology-gibleed-v201', hepatologyGibleedV201],
  ['cvrisk-engines-v202', cvriskEnginesV202],
  ['periop-frailty-v203', periopFrailtyV203],
  ['nephro-fluids-v204', nephroFluidsV204],
  ['pulm-copd-v205', pulmCopdV205],
  ['tbi-stroke-v206', tbiStrokeV206],
  ['resus-trauma-v207', resusTraumaV207],
  ['nutrition-maternal-v208', nutritionMaternalV208],
  ['cardiology-risk-v209', cardiologyRiskV209],
  ['stroke-prognosis-v210', strokePrognosisV210],
  ['heme-onc-risk-v211', hemeOncRiskV211],
  ['hep-fibrosis-portal-v212', hepFibrosisPortalV212],
  ['acute-injury-v213', acuteInjuryV213],
  ['cardiology-risk-v214', cardiologyRiskV214],
  ['risk-scores-v215', riskScoresV215],
  ['heme-prognostic-v216', hemePrognosticV216],
  ['stroke-risk-v217', strokeRiskV217],
  ['ed-decision-v218', edDecisionV218],
  ['metabolic-hepatic-v219', metabolicHepaticV219],
  ['hepatology-prognosis-v220', hepatologyPrognosisV220],
  ['pulmonary-risk-v221', pulmonaryRiskV221],
  ['rheum-classification-v222', rheumClassificationV222],
  ['dermatology-v223', dermatologyV223],
  ['neurology-v224', neurologyV224],
  ['obgyn-v225', obgynV225],
  ['nephrology-v226', nephrologyV226],
  ['mixed-v227', mixedV227],
  ['mixed-v228', mixedV228],
  ['hematology-v229', hematologyV229],
  ['inflam-v230', inflamV230],
  ['prognostic-v231', prognosticV231],
  ['coagscore-v232', coagscoreV232],
  ['estimators-v233', estimatorsV233],
  ['dermscore-v234', dermscoreV234],
  ['painscore-v235', painscoreV235],
  ['ophtho-v236', ophthoV236],
  ['cardioecho-v237', cardioechoV237],
  ['anthro-v238', anthroV238],
  ['gisurg-v239', gisurgV239],
  ['rehab-v240', rehabV240],
  ['geri-v241', geriV241],
  ['environ-v242', environV242],
  ['entsleep-v243', entsleepV243],
  ['sportsmsk-v244', sportsmskV244],
  ['hemederm-v245', hemedermV245],
  ['ibd-v246', ibdV246],
  ['pedstox-v247', pedstoxV247],
  ['woundid-v248', woundidV248],
  ['renalpulm-v249', renalpulmV249],
  ['obgyn-v250', obgynV250],
  ['cardiometab-v251', cardiometabV251],
  ['orthospine-v252', orthospineV252],
  ['radmeasure-v253', radmeasureV253],
  ['enturopsych-v254', enturopsychV254],
  ['riskscores-v255', riskscoresV255],
  ['rheumcrit-v256', rheumcritV256],
  ['dive-v257', diveV257],
  ['clinical', clinical],
  ['clinical-v4', clinicalV4],
  ['clinical-v5', clinicalV5],
  ['clinical-v6', clinicalV6],
  ['clinical-v7', clinicalV7],
  ['clinical-v8', clinicalV8],
  ['scoring-v4', scoringV4],
  ['scoring-v6', scoringV6],
  ['medication-v4', medicationV4],
  ['medication-v5', medicationV5],
  ['field', field],
  ['idcrit-v99', idcritV99],
  ['scoring-v5', scoringV5],
  ['renal-v277', renalV277],
  ['fibrosis-v275', fibrosisV275],
  ['nutrition-v276', nutritionV276],
  ['proteins-v274', proteinsV274],
  ['metabolic-v273', metabolicV273],
  ['anthro-v272', anthroV272],
  ['lipids-v271', lipidsV271],
  ['adiposity-v270', adiposityV270],
  ['metabolic-v269', metabolicV269],
  ['inflam-v267', inflamV267],
  ['inflam-v268', inflamV268],
  ['peds-sepsis-v278', pedsSepsisV278],
  ['rcc-prognosis-v279', rccPrognosisV279],
  ['rheum-fn-v280', rheumFnV280],
  ['hcc-surveillance-v281', hccSurveillanceV281],
  ['decision-rules-v258', decisionRulesV258],
  ['pneumonia-risk-v260', pneumoniaRiskV260],
];

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

// Parse the { id, name, group, clinical } of every UTILITIES row from app.js
// text. Rows are single-line `  { id: '...', name: '...', group: '...', ...,
// clinical: true|false }`, verified by scripts/check-catalog-truth.mjs's count
// regex. Returns a Map keyed by id.
function parseUtilities() {
  const text = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const start = text.indexOf('const UTILITIES = [');
  if (start === -1) throw new Error('mcp/catalog: cannot locate UTILITIES in app.js');
  let depth = 0;
  let i = text.indexOf('[', start);
  let end = -1;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('mcp/catalog: cannot locate end of UTILITIES array');
  const body = text.slice(start, end);
  const rows = new Map();
  const rowRe = /\{\s*id:\s*'([^']+)',\s*name:\s*'((?:\\.|[^'])*)',\s*group:\s*'([^']*)'[^}]*?clinical:\s*(true|false)\b/g;
  let m;
  while ((m = rowRe.exec(body)) !== null) {
    rows.set(m[1], { id: m[1], name: m[2].replace(/\\'/g, "'"), group: m[3], clinical: m[4] === 'true' });
  }
  return rows;
}

// spec-v50 §3 clinical-posture disclaimer carried on every compute/describe.
export const DISCLAIMER = 'This is a computed quantity for decision support, not a treat / escalate / prescribe order. The value and its interpretation are the cited source’s; the decision stays with the clinician and local protocol.';

function buildRegistry() {
  const utilities = parseUtilities();
  const registry = new Map();
  const errors = [];

  for (const [moduleName, entries] of ADAPTER_MODULES) {
    for (const a of entries) {
      const { id, fields, compute, summary } = a;
      if (!id) { errors.push(`${moduleName}: adapter with no id`); continue; }
      if (registry.has(id)) { errors.push(`${id}: duplicate adapter`); continue; }
      const util = utilities.get(id);
      if (!util) { errors.push(`${id}: not present in UTILITIES (app.js)`); continue; }
      if (!util.clinical) { errors.push(`${id}: not clinical:true (spec-v183 §2.4 first wave is clinical only)`); continue; }
      const meta = META[id];
      if (!meta) { errors.push(`${id}: no META entry`); continue; }
      if (!Array.isArray(fields) || fields.length === 0) { errors.push(`${id}: no fields`); continue; }
      if (typeof compute !== 'function') { errors.push(`${id}: compute is not a function`); continue; }
      if (typeof summary !== 'string' || summary.length < 8) { errors.push(`${id}: missing summary`); continue; }

      const toArgs = typeof a.toArgs === 'function' ? a.toArgs : makeToArgs(fields);
      const formatResult = typeof a.formatResult === 'function' ? a.formatResult : (raw) => raw;

      registry.set(id, {
        id,
        module: moduleName,
        name: util.name,
        group: util.group,
        clinical: util.clinical,
        specialties: meta.specialties || [],
        summary,
        fields,
        inputSchema: fieldSchema(fields),
        compute,
        toArgs,
        formatResult,
        validate: (inputs) => validateInputs(inputs, fields),
        citation: meta.citation || null,
        citationUrl: meta.citationUrl || null,
        citationAccessed: meta.citationAccessed || null,
        interpretation: meta.interpretation || null,
        example: meta.example || null,
      });
    }
  }

  if (errors.length) {
    throw new Error('mcp/catalog: registry assembly failed:\n  ' + errors.join('\n  '));
  }
  return { registry, totalTiles: utilities.size };
}

const { registry, totalTiles } = buildRegistry();

export const REGISTRY = registry;
export const TOTAL_TILES = totalTiles;

export function getCalculator(id) { return registry.get(id) || null; }
export function allCalculators() { return [...registry.values()]; }
export function coverageCount() { return registry.size; }
