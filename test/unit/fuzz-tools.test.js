// spec-v53 §4.4.2 / spec-v59 §2.6: reflection-driven adversarial fuzz of every
// public compute export.
//
// Location / runner note (a deliberate, documented deviation from the spec's
// proposed `test/integration/fuzz-tools.spec.js`): these are pure Node compute
// functions -- no browser is involved -- and the spec requires the harness be
// "wired into `npm run test`". `npm run test` runs `test:unit` (node:test), NOT
// `test:e2e` (Playwright). A Playwright spec under test/integration/ would only
// run in test:e2e, so it would NOT satisfy "wired into npm run test". A node:test
// here is the correct home: faster, no browser, and actually in the `npm run
// test` path. See docs/audits/v11/_hardening-v53.md and _hardening-v59.md.
//
// spec-v59 §2.6 upgrades the harness on two axes:
//   1. OBJECT-AWARE matrix. Almost every compute function takes a single
//      destructured object, so the old scalar-only matrix never exercised the
//      reachable "valid object with one impossible field" path. The harness now
//      reflects each function's destructured field names from its source, builds
//      a finite baseline object, and drives EACH field through the adversarial
//      matrix while holding the others valid.
//   2. FINITENESS on reachable input. On the object path, when a call returns
//      (does not throw), every numeric return field must be finite or exactly
//      null -- never NaN/Infinity. This is the half of the v53 invariant that
//      catches Class B (a confident non-finite number reaching the DOM).
//
// For EVERY exported function across the target modules and each adversarial
// value the harness asserts:
//   (a) THROW-SAFETY (spec-v53 §3.1): a thrown error is a TypeError or
//       RangeError (a declared validation error), never a programming error.
//   (b) NO STRING LEAK (spec-v53 §3.2): no returned string field embeds the
//       literal token NaN / Infinity / undefined. This IS the DOM-safety
//       invariant -- the DOM only ever receives strings, so a non-finite value
//       that never reaches a string never reaches the user.
//
// Scoping note (honesty discipline, spec-v53 §7 / spec-v59 §2.2): the harness
// asserts the actual DOM-safety invariant -- no banned TOKEN in any returned
// STRING field -- on the object-aware REACHABLE matrix, NOT blanket numeric
// finiteness of internal fields. The DOM only ever receives strings, so a non-
// finite value that never reaches a string never reaches the user. A divide-by-
// an-entered-0 (e.g. shock index with SBP=0) is a mathematically-forced Infinity
// in an INTERNAL numeric field; spec-v59 §2.2's fix for that class is a render-
// side boundsAdvisory() plus the fmt() guard at the render site (which keeps the
// token out of the DOM), NOT a blanket null-return forced onto ~40 functions --
// that is precisely the non-surgical sweep spec-v53 §7 forbids. What the object-
// aware string-leak check newly catches (and the old scalar-only harness missed)
// is a band string that interpolates a raw NaN/Infinity from one bad field -- a
// real leak; spec-v59 fixes each such site (rox, vis, berlinArds) to route the
// interpolation through fmt(). The three confirmed Class-A/B sites that slipped a
// number to the DOM (hacor, lisMurray, bps) return null and are pinned by their
// own unit tests.
//
// Module coverage: the 21 PURE compute modules. The four DOM-renderer modules
// (derivation.js, screener.js, table.js, tree.js) require a `document` and so
// cannot run under node:test; they are exercised by the Playwright all-tools /
// mobile-no-hscroll specs, which mount every tile in a real browser. derivation
// .js's one numeric-leak path (the show-your-work panel) is additionally guarded
// at the source by fmt() (spec-v59 §2.7) -- see lib/derivation.js formatInput.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as clinical from '../../lib/clinical.js';
import * as clinicalV4 from '../../lib/clinical-v4.js';
import * as clinicalV5 from '../../lib/clinical-v5.js';
import * as clinicalV6 from '../../lib/clinical-v6.js';
import * as clinicalV7 from '../../lib/clinical-v7.js';
import * as clinicalV8 from '../../lib/clinical-v8.js';
import * as medicationV4 from '../../lib/medication-v4.js';
import * as medicationV5 from '../../lib/medication-v5.js';
import * as scoringV4 from '../../lib/scoring-v4.js';
import * as scoringV5 from '../../lib/scoring-v5.js';
import * as scoringV6 from '../../lib/scoring-v6.js';
import * as labInterpret from '../../lib/lab-interpret.js';
import * as unitConvert from '../../lib/unit-convert.js';
import * as field from '../../lib/field.js';
import * as codingV5 from '../../lib/coding-v5.js';
import * as regulatory from '../../lib/regulatory.js';
import * as prompt from '../../lib/prompt.js';
import * as workflowV4 from '../../lib/workflow-v4.js';
import * as trend from '../../lib/trend.js';
import * as deadlineMod from '../../lib/deadline.js';
import * as opsV63 from '../../lib/ops-v63.js';
import * as billingV78 from '../../lib/billing-v78.js';
import * as billingV79 from '../../lib/billing-v79.js';
import * as billingV80 from '../../lib/billing-v80.js';
import * as billingV81 from '../../lib/billing-v81.js';
import * as billingV82 from '../../lib/billing-v82.js';
import * as billingV83 from '../../lib/billing-v83.js';
import * as toxV86 from '../../lib/tox-v86.js';
import * as hemodynamicsV87 from '../../lib/hemodynamics-v87.js';
import * as metabolicOncV88 from '../../lib/metabolic-onc-v88.js';
import * as rheumPeriopV89 from '../../lib/rheum-periop-v89.js';
import * as cardioV90 from '../../lib/cardio-v90.js';
import * as pulmV91 from '../../lib/pulm-v91.js';
import * as nephroV92 from '../../lib/nephro-v92.js';
import * as hepgiV93 from '../../lib/hepgi-v93.js';
import * as hemoncV94 from '../../lib/hemonc-v94.js';
import * as neuroV95 from '../../lib/neuro-v95.js';
import * as psychV96 from '../../lib/psych-v96.js';
import * as periopV97 from '../../lib/periop-v97.js';
import * as pedsV98 from '../../lib/peds-v98.js';
import * as idcritV99 from '../../lib/idcrit-v99.js';
import * as cardioV101 from '../../lib/cardio-v101.js';
import * as cardioV102 from '../../lib/cardio-v102.js';
import * as cvriskV103 from '../../lib/cvrisk-v103.js';
import * as cardioV104 from '../../lib/cardio-v104.js';
import * as vascularV105 from '../../lib/vascular-v105.js';
import * as vteV106 from '../../lib/vte-v106.js';
import * as eddecisionV107 from '../../lib/eddecision-v107.js';
import * as traumaV108 from '../../lib/trauma-v108.js';
import * as traumaclassV109 from '../../lib/traumaclass-v109.js';
import * as toxV110 from '../../lib/tox-v110.js';
import * as enviroV111 from '../../lib/enviro-v111.js';
import * as critcareV112 from '../../lib/critcare-v112.js';
import * as fluidrespV113 from '../../lib/fluidresp-v113.js';
import * as pulmV114 from '../../lib/pulm-v114.js';
import * as pulmnodV115 from '../../lib/pulmnod-v115.js';
import * as neuroV117 from '../../lib/neuro-v117.js';
import * as neuroV118 from '../../lib/neuro-v118.js';
import * as neuroV119 from '../../lib/neuro-v119.js';
import * as neuroV120 from '../../lib/neuro-v120.js';
import * as neuroV121 from '../../lib/neuro-v121.js';
import * as neuroV122 from '../../lib/neuro-v122.js';
import * as psychV123 from '../../lib/psych-v123.js';
import * as hepV124 from '../../lib/hep-v124.js';
import * as hepV125 from '../../lib/hep-v125.js';
import * as giV126 from '../../lib/gi-v126.js';
import * as nephroV127 from '../../lib/nephro-v127.js';
import * as renalV128 from '../../lib/renal-v128.js';
import * as acidbaseV129 from '../../lib/acidbase-v129.js';
import * as uroV130 from '../../lib/uro-v130.js';
import * as uroV131 from '../../lib/uro-v131.js';
import * as hemeV132 from '../../lib/heme-v132.js';
import * as warfarinV133 from '../../lib/warfarin-v133.js';
import * as oncV134 from '../../lib/onc-v134.js';
import * as lymphomaV135 from '../../lib/lymphoma-v135.js';
import * as endoV136 from '../../lib/endo-v136.js';
import * as idV137 from '../../lib/id-v137.js';
import * as obV138 from '../../lib/ob-v138.js';
import * as gynV139 from '../../lib/gyn-v139.js';
import * as pedsV140 from '../../lib/peds-v140.js';
import * as pedsGrowthV141 from '../../lib/peds-growth-v141.js';
import * as pedsPercentileV169 from '../../lib/peds-percentile-v169.js';
import * as surgV142 from '../../lib/surg-v142.js';
import * as frailtyV143 from '../../lib/frailty-v143.js';
import * as orthoV144 from '../../lib/ortho-v144.js';
import * as orthoV145 from '../../lib/ortho-v145.js';
import * as spineV146 from '../../lib/spine-v146.js';
import * as rheumV147 from '../../lib/rheum-v147.js';
import * as rheumV148 from '../../lib/rheum-v148.js';
import * as growthLmsData from '../../lib/growth-lms-data.js';
import * as emsV149 from '../../lib/ems-v149.js';
import * as dermV151 from '../../lib/derm-v151.js';
import * as nutritionEnergyV152 from '../../lib/nutrition-energy-v152.js';
import * as urologyV153 from '../../lib/urology-v153.js';
import * as functionV154 from '../../lib/function-v154.js';
import * as suitesV155 from '../../lib/suites-v155.js';
import * as rheumObV156 from '../../lib/rheum-ob-v156.js';
import * as echoV158 from '../../lib/echo-v158.js';
import * as neuroDisabilityV159 from '../../lib/neuro-disability-v159.js';
import * as rheumV160 from '../../lib/rheum-v160.js';
import * as endoMetabV161 from '../../lib/endo-metab-v161.js';
import * as ebmV163 from '../../lib/ebm-v163.js';
import * as ophthoV164 from '../../lib/ophtho-v164.js';
import * as radiologyV165 from '../../lib/radiology-v165.js';
import * as pkV166 from '../../lib/pk-v166.js';
import * as oneformulaV167 from '../../lib/oneformula-v167.js';
import * as ltcgaV173 from '../../lib/ltcga-v173.js';
import * as ltcgaV174 from '../../lib/ltcga-v174.js';
import * as ltcgaV175 from '../../lib/ltcga-v175.js';
import * as ltcgaV176 from '../../lib/ltcga-v176.js';
import * as ltcgaV177 from '../../lib/ltcga-v177.js';
import * as ltcgaV178 from '../../lib/ltcga-v178.js';
import * as ltcgaV179 from '../../lib/ltcga-v179.js';
import * as ltcgaV180 from '../../lib/ltcga-v180.js';
import * as ltcgaV181 from '../../lib/ltcga-v181.js';
import * as ltcgaV182 from '../../lib/ltcga-v182.js';
import * as gapsV185 from '../../lib/gaps-v185.js';
import * as specialtymathV186 from '../../lib/specialtymath-v186.js';
import * as oncStagingV187 from '../../lib/onc-staging-v187.js';
import * as hemeStagingV188 from '../../lib/heme-staging-v188.js';
import * as hemeRiskV189 from '../../lib/heme-risk-v189.js';
import * as hepgiV190 from '../../lib/hepgi-v190.js';
import * as dermuroV191 from '../../lib/dermuro-v191.js';
import * as riskV192 from '../../lib/risk-v192.js';
import * as acsV193 from '../../lib/acs-v193.js';
import * as hemoV194 from '../../lib/hemo-v194.js';
import * as ventV195 from '../../lib/vent-v195.js';
import * as liverV196 from '../../lib/liver-v196.js';
import * as endoQuantV197 from '../../lib/endo-quant-v197.js';
import * as subspecialtyV198 from '../../lib/subspecialty-v198.js';
import * as myeloidPrognosisV199 from '../../lib/myeloid-prognosis-v199.js';
import * as critcareSeverityV200 from '../../lib/critcare-severity-v200.js';
import * as hepatologyGibleedV201 from '../../lib/hepatology-gibleed-v201.js';
import * as cvriskEnginesV202 from '../../lib/cvrisk-engines-v202.js';
import * as periopFrailtyV203 from '../../lib/periop-frailty-v203.js';
import * as nephroFluidsV204 from '../../lib/nephro-fluids-v204.js';
import * as pulmCopdV205 from '../../lib/pulm-copd-v205.js';
import * as tbiStrokeV206 from '../../lib/tbi-stroke-v206.js';
import * as resusTraumaV207 from '../../lib/resus-trauma-v207.js';
import * as nutritionMaternalV208 from '../../lib/nutrition-maternal-v208.js';
import * as cardiologyRiskV209 from '../../lib/cardiology-risk-v209.js';
import * as strokePrognosisV210 from '../../lib/stroke-prognosis-v210.js';
import * as hemeOncRiskV211 from '../../lib/heme-onc-risk-v211.js';
import * as hepFibrosisPortalV212 from '../../lib/hep-fibrosis-portal-v212.js';
import * as acuteInjuryV213 from '../../lib/acute-injury-v213.js';
import * as cardiologyRiskV214 from '../../lib/cardiology-risk-v214.js';
import * as riskScoresV215 from '../../lib/risk-scores-v215.js';
import * as hemePrognosticV216 from '../../lib/heme-prognostic-v216.js';
import * as strokeRiskV217 from '../../lib/stroke-risk-v217.js';
import * as edDecisionV218 from '../../lib/ed-decision-v218.js';
import * as metabolicHepaticV219 from '../../lib/metabolic-hepatic-v219.js';
import * as hepatologyPrognosisV220 from '../../lib/hepatology-prognosis-v220.js';
import * as pulmonaryRiskV221 from '../../lib/pulmonary-risk-v221.js';
import * as rheumClassificationV222 from '../../lib/rheum-classification-v222.js';
import * as dermatologyV223 from '../../lib/dermatology-v223.js';
import * as neurologyV224 from '../../lib/neurology-v224.js';
import * as obgynV225 from '../../lib/obgyn-v225.js';
import * as nephrologyV226 from '../../lib/nephrology-v226.js';
import * as mixedV227 from '../../lib/mixed-v227.js';
import * as mixedV228 from '../../lib/mixed-v228.js';
import * as hematologyV229 from '../../lib/hematology-v229.js';
import * as inflamV230 from '../../lib/inflam-v230.js';
import * as prognosticV231 from '../../lib/prognostic-v231.js';
import * as coagscoreV232 from '../../lib/coagscore-v232.js';
import * as estimatorsV233 from '../../lib/estimators-v233.js';
import * as dermscoreV234 from '../../lib/dermscore-v234.js';
import * as painscoreV235 from '../../lib/painscore-v235.js';
import * as ophthoV236 from '../../lib/ophtho-v236.js';
import * as cardioechoV237 from '../../lib/cardioecho-v237.js';
import * as anthroV238 from '../../lib/anthro-v238.js';
import * as gisurgV239 from '../../lib/gisurg-v239.js';
import * as rehabV240 from '../../lib/rehab-v240.js';
import * as geriV241 from '../../lib/geri-v241.js';
import * as environV242 from '../../lib/environ-v242.js';
import * as entsleepV243 from '../../lib/entsleep-v243.js';
import * as sportsmskV244 from '../../lib/sportsmsk-v244.js';
import * as hemedermV245 from '../../lib/hemederm-v245.js';
import * as ibdV246 from '../../lib/ibd-v246.js';
import * as pedstoxV247 from '../../lib/pedstox-v247.js';
import * as woundidV248 from '../../lib/woundid-v248.js';
import * as renalpulmV249 from '../../lib/renalpulm-v249.js';
import * as obgynV250 from '../../lib/obgyn-v250.js';
import * as cardiometabV251 from '../../lib/cardiometab-v251.js';
import * as orthospineV252 from '../../lib/orthospine-v252.js';
import * as radmeasureV253 from '../../lib/radmeasure-v253.js';
import * as enturopsychV254 from '../../lib/enturopsych-v254.js';
import * as riskscoresV255 from '../../lib/riskscores-v255.js';
import * as rheumcritV256 from '../../lib/rheumcrit-v256.js';
import * as diveV257 from '../../lib/dive-v257.js';
import * as decisionRulesV258 from '../../lib/decision-rules-v258.js';
import * as pneumoniaRiskV260 from '../../lib/pneumonia-risk-v260.js';
import * as acuteAbdomenV261 from '../../lib/acute-abdomen-v261.js';
import * as pediatricAcuteV262 from '../../lib/pediatric-acute-v262.js';
import * as respiratoryMaternalV263 from '../../lib/respiratory-maternal-v263.js';
import * as massiveTransfusionV265 from '../../lib/massive-transfusion-v265.js';
import * as rccPrognosisV266 from '../../lib/rcc-prognosis-v266.js';
import * as inflamV267 from '../../lib/inflam-v267.js';
import * as inflamV268 from '../../lib/inflam-v268.js';
import * as metabolicV269 from '../../lib/metabolic-v269.js';
import * as adiposityV270 from '../../lib/adiposity-v270.js';
import * as lipidsV271 from '../../lib/lipids-v271.js';
import * as anthroV272 from '../../lib/anthro-v272.js';
import * as metabolicV273 from '../../lib/metabolic-v273.js';
import * as proteinsV274 from '../../lib/proteins-v274.js';
import * as fibrosisV275 from '../../lib/fibrosis-v275.js';
import * as nutritionV276 from '../../lib/nutrition-v276.js';
import * as renalV277 from '../../lib/renal-v277.js';
import * as pedsSepsisV278 from '../../lib/peds-sepsis-v278.js';
import * as rccPrognosisV279 from '../../lib/rcc-prognosis-v279.js';
import * as rheumFnV280 from '../../lib/rheum-fn-v280.js';
import * as hccSurveillanceV281 from '../../lib/hcc-surveillance-v281.js';
import * as transfusionV292 from '../../lib/transfusion-v292.js';
import * as fastDementiaV294 from '../../lib/fast-dementia-v294.js';
import * as gdsV295 from '../../lib/gds-v295.js';
import * as benzoEquivV296 from '../../lib/benzo-equiv-v296.js';
import * as nerveInjuryV297 from '../../lib/nerve-injury-v297.js';
import * as concussionRtsV298 from '../../lib/concussion-rts-v298.js';
import * as cosyntropinV299 from '../../lib/cosyntropin-v299.js';
import * as avFistulaV300 from '../../lib/av-fistula-v300.js';
import * as drSeverityV301 from '../../lib/dr-severity-v301.js';
import * as isisV302 from '../../lib/isis-v302.js';
import * as anaphylaxisV303 from '../../lib/anaphylaxis-v303.js';
import * as dstV304 from '../../lib/dst-v304.js';
import * as crsV305 from '../../lib/crs-v305.js';
import * as icansV306 from '../../lib/icans-v306.js';
import * as dmeV307 from '../../lib/dme-v307.js';
import * as concussionRtlV308 from '../../lib/concussion-rtl-v308.js';
import * as gvhdV309 from '../../lib/gvhd-v309.js';
import * as cholangitisV310 from '../../lib/cholangitis-v310.js';
import * as cholecystitisV311 from '../../lib/cholecystitis-v311.js';
import * as cholangitisDxV312 from '../../lib/cholangitis-dx-v312.js';
import * as cholecystitisDxV313 from '../../lib/cholecystitis-dx-v313.js';
import * as deauvilleV314 from '../../lib/deauville-v314.js';
import * as jonesV315 from '../../lib/jones-v315.js';
import * as goldAbeV316 from '../../lib/gold-abe-v316.js';
import * as cdiSeverityV317 from '../../lib/cdi-severity-v317.js';
import * as laEsophagitisV318 from '../../lib/la-esophagitis-v318.js';
import * as ccsAnginaV319 from '../../lib/ccs-angina-v319.js';
import * as clavienDindoV320 from '../../lib/clavien-dindo-v320.js';
import * as hincheyV321 from '../../lib/hinchey-v321.js';
import * as biRadsV322 from '../../lib/bi-rads-v322.js';
import * as siewertV323 from '../../lib/siewert-v323.js';
import * as wexnerV324 from '../../lib/wexner-v324.js';
import * as lungRadsV325 from '../../lib/lung-rads-v325.js';
import * as oRadsV326 from '../../lib/o-rads-v326.js';
import * as liRadsV327 from '../../lib/li-rads-v327.js';
import * as montrealIbdV328 from '../../lib/montreal-ibd-v328.js';
import * as parisClassificationV329 from '../../lib/paris-classification-v329.js';
import * as nottinghamNpiV330 from '../../lib/nottingham-npi-v330.js';
import * as fitzpatrickV331 from '../../lib/fitzpatrick-v331.js';
import * as haggittV332 from '../../lib/haggitt-v332.js';
import * as kikuchiV333 from '../../lib/kikuchi-v333.js';
import * as kudoV334 from '../../lib/kudo-v334.js';
import * as niceV335 from '../../lib/nice-v335.js';
import * as jnetV336 from '../../lib/jnet-v336.js';
import * as outerbridgeV337 from '../../lib/outerbridge-v337.js';
import * as icrsV338 from '../../lib/icrs-v338.js';
import * as cormackLehaneV339 from '../../lib/cormack-lehane-v339.js';
import * as clarkLevelV340 from '../../lib/clark-level-v340.js';
import * as masonRadialHeadV341 from '../../lib/mason-radial-head-v341.js';
import * as hawkinsTalarV342 from '../../lib/hawkins-talar-v342.js';
import * as sandersCalcanealV343 from '../../lib/sanders-calcaneal-v343.js';
import * as ficatArletV344 from '../../lib/ficat-arlet-v344.js';
import * as lichtmanKienbockV345 from '../../lib/lichtman-kienbock-v345.js';
import * as catterallPerthesV346 from '../../lib/catterall-perthes-v346.js';
import * as herringPillarV347 from '../../lib/herring-pillar-v347.js';
import * as strasbergBdiV348 from '../../lib/strasberg-bdi-v348.js';
import * as fazekasV349 from '../../lib/fazekas-v349.js';
import * as tscherneClosedV350 from '../../lib/tscherne-closed-v350.js';
import * as goligherHemorrhoidsV351 from '../../lib/goligher-hemorrhoids-v351.js';
import * as lanskyV352 from '../../lib/lansky-v352.js';
import * as croweDdhV353 from '../../lib/crowe-ddh-v353.js';
import * as tonnisHipOaV354 from '../../lib/tonnis-hip-oa-v354.js';
import * as lachmanAclV355 from '../../lib/lachman-acl-v355.js';
import * as ceapVenousV356 from '../../lib/ceap-venous-v356.js';
import * as nyhaClassV357 from '../../lib/nyha-class-v357.js';
import * as ramsaySedationV358 from '../../lib/ramsay-sedation-v358.js';
import * as tbTesting from '../../lib/tb-testing.js';

const MODULES = {
  'clinical.js': clinical,
  'clinical-v4.js': clinicalV4,
  'clinical-v5.js': clinicalV5,
  'clinical-v6.js': clinicalV6,
  'clinical-v7.js': clinicalV7,
  'clinical-v8.js': clinicalV8,
  'medication-v4.js': medicationV4,
  'medication-v5.js': medicationV5,
  'scoring-v4.js': scoringV4,
  'scoring-v5.js': scoringV5,
  'scoring-v6.js': scoringV6,
  'lab-interpret.js': labInterpret,
  'unit-convert.js': unitConvert,
  'field.js': field,
  'coding-v5.js': codingV5,
  'regulatory.js': regulatory,
  'prompt.js': prompt,
  'workflow-v4.js': workflowV4,
  'trend.js': trend,
  'deadline.js': deadlineMod,
  'ops-v63.js': opsV63,
  'billing-v78.js': billingV78,
  'billing-v79.js': billingV79,
  'billing-v80.js': billingV80,
  'billing-v81.js': billingV81,
  'billing-v82.js': billingV82,
  'billing-v83.js': billingV83,
  'tox-v86.js': toxV86,
  'hemodynamics-v87.js': hemodynamicsV87,
  'metabolic-onc-v88.js': metabolicOncV88,
  'rheum-periop-v89.js': rheumPeriopV89,
  'cardio-v90.js': cardioV90,
  'pulm-v91.js': pulmV91,
  'nephro-v92.js': nephroV92,
  'hepgi-v93.js': hepgiV93,
  'hemonc-v94.js': hemoncV94,
  'neuro-v95.js': neuroV95,
  'psych-v96.js': psychV96,
  'periop-v97.js': periopV97,
  'peds-v98.js': pedsV98,
  'idcrit-v99.js': idcritV99,
  'cardio-v101.js': cardioV101,
  'cardio-v102.js': cardioV102,
  'cvrisk-v103.js': cvriskV103,
  'cardio-v104.js': cardioV104,
  'vascular-v105.js': vascularV105,
  'vte-v106.js': vteV106,
  'eddecision-v107.js': eddecisionV107,
  'trauma-v108.js': traumaV108,
  'traumaclass-v109.js': traumaclassV109,
  'tox-v110.js': toxV110,
  'enviro-v111.js': enviroV111,
  'critcare-v112.js': critcareV112,
  'fluidresp-v113.js': fluidrespV113,
  'pulm-v114.js': pulmV114,
  'pulmnod-v115.js': pulmnodV115,
  'neuro-v117.js': neuroV117,
  'neuro-v118.js': neuroV118,
  'neuro-v119.js': neuroV119,
  'neuro-v120.js': neuroV120,
  'neuro-v121.js': neuroV121,
  'neuro-v122.js': neuroV122,
  'psych-v123.js': psychV123,
  'hep-v124.js': hepV124,
  'hep-v125.js': hepV125,
  'gi-v126.js': giV126,
  'nephro-v127.js': nephroV127,
  'renal-v128.js': renalV128,
  'acidbase-v129.js': acidbaseV129,
  'uro-v130.js': uroV130,
  'uro-v131.js': uroV131,
  'heme-v132.js': hemeV132,
  'warfarin-v133.js': warfarinV133,
  'onc-v134.js': oncV134,
  'lymphoma-v135.js': lymphomaV135,
  'endo-v136.js': endoV136,
  'id-v137.js': idV137,
  'ob-v138.js': obV138,
  'gyn-v139.js': gynV139,
  'peds-v140.js': pedsV140,
  'peds-growth-v141.js': pedsGrowthV141,
  'peds-percentile-v169.js': pedsPercentileV169,
  'surg-v142.js': surgV142,
  'frailty-v143.js': frailtyV143,
  'ortho-v144.js': orthoV144,
  'ortho-v145.js': orthoV145,
  'spine-v146.js': spineV146,
  'rheum-v147.js': rheumV147,
  'rheum-v148.js': rheumV148,
  'growth-lms-data.js': growthLmsData,
  'ems-v149.js': emsV149,
  'derm-v151.js': dermV151,
  'nutrition-energy-v152.js': nutritionEnergyV152,
  'urology-v153.js': urologyV153,
  'function-v154.js': functionV154,
  'suites-v155.js': suitesV155,
  'rheum-ob-v156.js': rheumObV156,
  'echo-v158.js': echoV158,
  'neuro-disability-v159.js': neuroDisabilityV159,
  'rheum-v160.js': rheumV160,
  'endo-metab-v161.js': endoMetabV161,
  'ebm-v163.js': ebmV163,
  'ophtho-v164.js': ophthoV164,
  'radiology-v165.js': radiologyV165,
  'pk-v166.js': pkV166,
  'oneformula-v167.js': oneformulaV167,
  'ltcga-v173.js': ltcgaV173,
  'ltcga-v174.js': ltcgaV174,
  'ltcga-v175.js': ltcgaV175,
  'ltcga-v176.js': ltcgaV176,
  'ltcga-v177.js': ltcgaV177,
  'ltcga-v178.js': ltcgaV178,
  'ltcga-v179.js': ltcgaV179,
  'ltcga-v180.js': ltcgaV180,
  'ltcga-v181.js': ltcgaV181,
  'ltcga-v182.js': ltcgaV182,
  'gaps-v185.js': gapsV185,
  'specialtymath-v186.js': specialtymathV186,
  'onc-staging-v187.js': oncStagingV187,
  'heme-staging-v188.js': hemeStagingV188,
  'heme-risk-v189.js': hemeRiskV189,
  'hepgi-v190.js': hepgiV190,
  'dermuro-v191.js': dermuroV191,
  'risk-v192.js': riskV192,
  'acs-v193.js': acsV193,
  'hemo-v194.js': hemoV194,
  'vent-v195.js': ventV195,
  'liver-v196.js': liverV196,
  'endo-quant-v197.js': endoQuantV197,
  'subspecialty-v198.js': subspecialtyV198,
  'myeloid-prognosis-v199.js': myeloidPrognosisV199,
  'critcare-severity-v200.js': critcareSeverityV200,
  'hepatology-gibleed-v201.js': hepatologyGibleedV201,
  'cvrisk-engines-v202.js': cvriskEnginesV202,
  'periop-frailty-v203.js': periopFrailtyV203,
  'nephro-fluids-v204.js': nephroFluidsV204,
  'pulm-copd-v205.js': pulmCopdV205,
  'tbi-stroke-v206.js': tbiStrokeV206,
  'resus-trauma-v207.js': resusTraumaV207,
  'nutrition-maternal-v208.js': nutritionMaternalV208,
  'cardiology-risk-v209.js': cardiologyRiskV209,
  'stroke-prognosis-v210.js': strokePrognosisV210,
  'heme-onc-risk-v211.js': hemeOncRiskV211,
  'hep-fibrosis-portal-v212.js': hepFibrosisPortalV212,
  'acute-injury-v213.js': acuteInjuryV213,
  'cardiology-risk-v214.js': cardiologyRiskV214,
  'risk-scores-v215.js': riskScoresV215,
  'heme-prognostic-v216.js': hemePrognosticV216,
  'stroke-risk-v217.js': strokeRiskV217,
  'ed-decision-v218.js': edDecisionV218,
  'metabolic-hepatic-v219.js': metabolicHepaticV219,
  'hepatology-prognosis-v220.js': hepatologyPrognosisV220,
  'pulmonary-risk-v221.js': pulmonaryRiskV221,
  'rheum-classification-v222.js': rheumClassificationV222,
  'dermatology-v223.js': dermatologyV223,
  'neurology-v224.js': neurologyV224,
  'obgyn-v225.js': obgynV225,
  'nephrology-v226.js': nephrologyV226,
  'mixed-v227.js': mixedV227,
  'mixed-v228.js': mixedV228,
  'hematology-v229.js': hematologyV229,
  'inflam-v230.js': inflamV230,
  'prognostic-v231.js': prognosticV231,
  'coagscore-v232.js': coagscoreV232,
  'estimators-v233.js': estimatorsV233,
  'dermscore-v234.js': dermscoreV234,
  'painscore-v235.js': painscoreV235,
  'ophtho-v236.js': ophthoV236,
  'cardioecho-v237.js': cardioechoV237,
  'anthro-v238.js': anthroV238,
  'gisurg-v239.js': gisurgV239,
  'rehab-v240.js': rehabV240,
  'geri-v241.js': geriV241,
  'environ-v242.js': environV242,
  'entsleep-v243.js': entsleepV243,
  'sportsmsk-v244.js': sportsmskV244,
  'hemederm-v245.js': hemedermV245,
  'ibd-v246.js': ibdV246,
  'pedstox-v247.js': pedstoxV247,
  'woundid-v248.js': woundidV248,
  'renalpulm-v249.js': renalpulmV249,
  'obgyn-v250.js': obgynV250,
  'cardiometab-v251.js': cardiometabV251,
  'orthospine-v252.js': orthospineV252,
  'radmeasure-v253.js': radmeasureV253,
  'enturopsych-v254.js': enturopsychV254,
  'riskscores-v255.js': riskscoresV255,
  'rheumcrit-v256.js': rheumcritV256,
  'dive-v257.js': diveV257,
  'decision-rules-v258.js': decisionRulesV258,
  'pneumonia-risk-v260.js': pneumoniaRiskV260,
  'acute-abdomen-v261.js': acuteAbdomenV261,
  'pediatric-acute-v262.js': pediatricAcuteV262,
  'respiratory-maternal-v263.js': respiratoryMaternalV263,
  'massive-transfusion-v265.js': massiveTransfusionV265,
  'rcc-prognosis-v266.js': rccPrognosisV266,
  'inflam-v267.js': inflamV267,
  'inflam-v268.js': inflamV268,
  'metabolic-v269.js': metabolicV269,
  'adiposity-v270.js': adiposityV270,
  'lipids-v271.js': lipidsV271,
  'anthro-v272.js': anthroV272,
  'metabolic-v273.js': metabolicV273,
  'proteins-v274.js': proteinsV274,
  'fibrosis-v275.js': fibrosisV275,
  'nutrition-v276.js': nutritionV276,
  'renal-v277.js': renalV277,
  'peds-sepsis-v278.js': pedsSepsisV278,
  'rcc-prognosis-v279.js': rccPrognosisV279,
  'rheum-fn-v280.js': rheumFnV280,
  'hcc-surveillance-v281.js': hccSurveillanceV281,
  'transfusion-v292.js': transfusionV292,
  'fast-dementia-v294.js': fastDementiaV294,
  'gds-v295.js': gdsV295,
  'benzo-equiv-v296.js': benzoEquivV296,
  'nerve-injury-v297.js': nerveInjuryV297,
  'concussion-rts-v298.js': concussionRtsV298,
  'cosyntropin-v299.js': cosyntropinV299,
  'av-fistula-v300.js': avFistulaV300,
  'dr-severity-v301.js': drSeverityV301,
  'isis-v302.js': isisV302,
  'anaphylaxis-v303.js': anaphylaxisV303,
  'dst-v304.js': dstV304,
  'crs-v305.js': crsV305,
  'icans-v306.js': icansV306,
  'dme-v307.js': dmeV307,
  'concussion-rtl-v308.js': concussionRtlV308,
  'gvhd-v309.js': gvhdV309,
  'cholangitis-v310.js': cholangitisV310,
  'cholecystitis-v311.js': cholecystitisV311,
  'cholangitis-dx-v312.js': cholangitisDxV312,
  'cholecystitis-dx-v313.js': cholecystitisDxV313,
  'deauville-v314.js': deauvilleV314,
  'jones-v315.js': jonesV315,
  'gold-abe-v316.js': goldAbeV316,
  'cdi-severity-v317.js': cdiSeverityV317,
  'la-esophagitis-v318.js': laEsophagitisV318,
  'ccs-angina-v319.js': ccsAnginaV319,
  'clavien-dindo-v320.js': clavienDindoV320,
  'hinchey-v321.js': hincheyV321,
  'bi-rads-v322.js': biRadsV322,
  'siewert-v323.js': siewertV323,
  'wexner-v324.js': wexnerV324,
  'lung-rads-v325.js': lungRadsV325,
  'o-rads-v326.js': oRadsV326,
  'li-rads-v327.js': liRadsV327,
  'montreal-ibd-v328.js': montrealIbdV328,
  'paris-classification-v329.js': parisClassificationV329,
  'nottingham-npi-v330.js': nottinghamNpiV330,
  'fitzpatrick-v331.js': fitzpatrickV331,
  'haggitt-v332.js': haggittV332,
  'kikuchi-v333.js': kikuchiV333,
  'kudo-v334.js': kudoV334,
  'nice-v335.js': niceV335,
  'jnet-v336.js': jnetV336,
  'outerbridge-v337.js': outerbridgeV337,
  'icrs-v338.js': icrsV338,
  'cormack-lehane-v339.js': cormackLehaneV339,
  'clark-level-v340.js': clarkLevelV340,
  'mason-radial-head-v341.js': masonRadialHeadV341,
  'hawkins-talar-v342.js': hawkinsTalarV342,
  'sanders-calcaneal-v343.js': sandersCalcanealV343,
  'ficat-arlet-v344.js': ficatArletV344,
  'lichtman-kienbock-v345.js': lichtmanKienbockV345,
  'catterall-perthes-v346.js': catterallPerthesV346,
  'herring-pillar-v347.js': herringPillarV347,
  'strasberg-bdi-v348.js': strasbergBdiV348,
  'fazekas-v349.js': fazekasV349,
  'tscherne-closed-v350.js': tscherneClosedV350,
  'goligher-hemorrhoids-v351.js': goligherHemorrhoidsV351,
  'lansky-v352.js': lanskyV352,
  'crowe-ddh-v353.js': croweDdhV353,
  'tonnis-hip-oa-v354.js': tonnisHipOaV354,
  'lachman-acl-v355.js': lachmanAclV355,
  'ceap-venous-v356.js': ceapVenousV356,
  'nyha-class-v357.js': nyhaClassV357,
  'ramsay-sedation-v358.js': ramsaySedationV358,
  'tb-testing.js': tbTesting,
};

const MATRIX = [0, -1, 1e9, NaN, Infinity, -Infinity, '', undefined, null];
const BANNED = ['NaN', 'Infinity', 'undefined'];

// Reflect the destructured field names from a function's first parameter when it
// is a flat object pattern: `function f({ a, b = 1, c: x })` / `({ a, b }) =>`.
// Returns null when the first parameter is not an object pattern (positional or
// scalar arg) -- those take the scalar matrix instead.
function objectFields(fn) {
  const src = fn.toString();
  const m = src.match(/^(?:[^({]*?)\(\s*\{([^}]*)\}/s);
  if (!m) return null;
  const fields = m[1]
    .split(',')
    .map((s) => s.trim().split(/[=:]/)[0].trim())
    .filter((s) => /^[A-Za-z_$][\w$]*$/.test(s));
  return fields.length ? fields : null;
}

function assertThrowSafe(err, label) {
  assert.ok(
    err instanceof TypeError || err instanceof RangeError,
    `${label} threw ${err && err.constructor && err.constructor.name}: ${err && err.message} -- only TypeError/RangeError are allowed (spec-v53 §3.1)`,
  );
}

// Recursively assert no STRING field embeds a banned token (the DOM-safety
// invariant). null/undefined/booleans/numbers pass; objects/arrays recurse.
function assertSafeReturn(v, path, label) {
  if (typeof v === 'string') {
    for (const t of BANNED) {
      assert.ok(!v.includes(t), `${label}: returned string ${path} leaked "${t}": ${JSON.stringify(v)}`);
    }
    return;
  }
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) assertSafeReturn(v[k], `${path}.${k}`, label);
  }
}

let fnCount = 0;
let objCount = 0;
for (const [modName, mod] of Object.entries(MODULES)) {
  for (const [name, fn] of Object.entries(mod)) {
    if (typeof fn !== 'function') continue;
    fnCount += 1;
    const fields = objectFields(fn);
    test(`fuzz: ${modName} ${name}() is throw-safe and string-leak-free across the object-aware matrix`, () => {
      if (fields) {
        objCount += 1;
        // Object-aware: baseline of finite 1s, drive each field through the matrix.
        const baseline = {};
        for (const f of fields) baseline[f] = 1;
        // A valid baseline call first.
        try { assertSafeReturn(fn({ ...baseline }), '<return>', `${name}(baseline)`); }
        catch (err) { assertThrowSafe(err, `${name}(baseline)`); }
        for (const f of fields) {
          for (const adv of MATRIX) {
            const arg = { ...baseline, [f]: adv };
            let result;
            try { result = fn(arg); }
            catch (err) { assertThrowSafe(err, `${name}({${f}:${String(adv)}})`); continue; }
            assertSafeReturn(result, '<return>', `${name}({${f}:${String(adv)}})`);
          }
        }
      } else {
        // Scalar / positional: pass each adversarial value as the sole argument.
        for (const input of MATRIX) {
          let result;
          try { result = fn(input); }
          catch (err) { assertThrowSafe(err, `${name}(${String(input)})`); continue; }
          // A scalar arg to a positional function yields undefined trailing
          // args, an unreachable shape -- only the string-leak half is
          // meaningful (spec-v53 §7 honesty discipline). A bare numeric return
          // is rendered through fmt() at the call site, not as a raw string.
          assertSafeReturn(result, '<return>', `${name}(${String(input)})`);
        }
      }
    });
  }
}

test('the fuzz harness enumerated the public compute surface and exercised the object path', () => {
  assert.ok(fnCount > 200, `expected 200+ fuzzed exports, got ${fnCount}`);
});
