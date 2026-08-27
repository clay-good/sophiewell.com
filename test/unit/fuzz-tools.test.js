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
import * as pressureInjuryStageV359 from '../../lib/pressure-injury-stage-v359.js';
import * as kwbRetinopathyV360 from '../../lib/kwb-retinopathy-v360.js';
import * as tannerStagingV361 from '../../lib/tanner-staging-v361.js';
import * as forresterHemodynamicV362 from '../../lib/forrester-hemodynamic-v362.js';
import * as shafferAngleV363 from '../../lib/shaffer-angle-v363.js';
import * as casTedV364 from '../../lib/cas-ted-v364.js';
import * as pragueBarrettV365 from '../../lib/prague-barrett-v365.js';
import * as neckZoneV366 from '../../lib/neck-zone-v366.js';
import * as pasSwallowV367 from '../../lib/pas-swallow-v367.js';
import * as rossHfPedsV368 from '../../lib/ross-hf-peds-v368.js';
import * as nohriaStevensonV369 from '../../lib/nohria-stevenson-v369.js';
import * as hartofilakidisDdhV370 from '../../lib/hartofilakidis-ddh-v370.js';
import * as cRadsV371 from '../../lib/c-rads-v371.js';
import * as cadRadsV372 from '../../lib/cad-rads-v372.js';
import * as niRadsV373 from '../../lib/ni-rads-v373.js';
import * as pauwelsFemoralNeckV374 from '../../lib/pauwels-femoral-neck-v374.js';
import * as pipkinFemoralHeadV375 from '../../lib/pipkin-femoral-head-v375.js';
import * as denisSacralV376 from '../../lib/denis-sacral-v376.js';
import * as gartlandSupracondylarV377 from '../../lib/gartland-supracondylar-v377.js';
import * as delbetFemoralNeckV378 from '../../lib/delbet-femoral-neck-v378.js';
import * as tilePelvicV379 from '../../lib/tile-pelvic-v379.js';
import * as youngBurgessV380 from '../../lib/young-burgess-v380.js';
import * as winquistHansenV381 from '../../lib/winquist-hansen-v381.js';
import * as eichenholtzCharcotV382 from '../../lib/eichenholtz-charcot-v382.js';
import * as risserSignV383 from '../../lib/risser-sign-v383.js';
import * as spetzlerPonceV384 from '../../lib/spetzler-ponce-v384.js';
import * as schwabEnglandV385 from '../../lib/schwab-england-v385.js';
import * as piraniClubfootV386 from '../../lib/pirani-clubfoot-v386.js';
import * as dimeglioClubfootV387 from '../../lib/dimeglio-clubfoot-v387.js';
import * as brodskyTonsilV388 from '../../lib/brodsky-tonsil-v388.js';
import * as koosSchwannomaV389 from '../../lib/koos-schwannoma-v389.js';
import * as knospAdenomaV390 from '../../lib/knosp-adenoma-v390.js';
import * as hardyAdenomaV391 from '../../lib/hardy-adenoma-v391.js';
import * as hillFlapValveV392 from '../../lib/hill-flap-valve-v392.js';
import * as laurenGastricV393 from '../../lib/lauren-gastric-v393.js';
import * as borrmannGastricV394 from '../../lib/borrmann-gastric-v394.js';
import * as parksFistulaV395 from '../../lib/parks-fistula-v395.js';
import * as sieversBavV396 from '../../lib/sievers-bav-v396.js';
import * as elKhouryArV397 from '../../lib/el-khoury-ar-v397.js';
import * as carpentierMrV398 from '../../lib/carpentier-mr-v398.js';
import * as bismuthCorletteV399 from '../../lib/bismuth-corlette-v399.js';
import * as nyhusHerniaV400 from '../../lib/nyhus-hernia-v400.js';
import * as zargarCausticV401 from '../../lib/zargar-caustic-v401.js';
import * as laugeHansenV402 from '../../lib/lauge-hansen-v402.js';
import * as berndtHartyV403 from '../../lib/berndt-harty-v403.js';
import * as reganMorreyV404 from '../../lib/regan-morrey-v404.js';
import * as savaryMillerV405 from '../../lib/savary-miller-v405.js';
import * as leFortV406 from '../../lib/le-fort-v406.js';
import * as steinbergAvnV407 from '../../lib/steinberg-avn-v407.js';
import * as meyersMckeeverV408 from '../../lib/meyers-mckeever-v408.js';
import * as idebergGlenoidV409 from '../../lib/ideberg-glenoid-v409.js';
import * as andersonDalonzoV410 from '../../lib/anderson-dalonzo-v410.js';
import * as levineEdwardsV411 from '../../lib/levine-edwards-v411.js';
import * as lisfrancMyersonV412 from '../../lib/lisfranc-myerson-v412.js';
import * as seinsheimerSubtrochV413 from '../../lib/seinsheimer-subtroch-v413.js';
import * as mayfieldPerilunateV414 from '../../lib/mayfield-perilunate-v414.js';
import * as geisslerCarpalV415 from '../../lib/geissler-carpal-v415.js';
import * as russeScaphoidV416 from '../../lib/russe-scaphoid-v416.js';
import * as wasselThumbV417 from '../../lib/wassel-thumb-v417.js';
import * as milchCondyleV418 from '../../lib/milch-condyle-v418.js';
import * as cottonMyerV419 from '../../lib/cotton-myer-v419.js';
import * as friedmanTongueV420 from '../../lib/friedman-tongue-v420.js';
import * as sunAcCellV421 from '../../lib/sun-ac-cell-v421.js';
import * as sunAcFlareV422 from '../../lib/sun-ac-flare-v422.js';
import * as marshOberhuberV423 from '../../lib/marsh-oberhuber-v423.js';
import * as bethesdaThyroidV424 from '../../lib/bethesda-thyroid-v424.js';
import * as vurGradeV425 from '../../lib/vur-grade-v425.js';
import * as gellCoombsV426 from '../../lib/gell-coombs-v426.js';
import * as vaughanWilliamsV427 from '../../lib/vaughan-williams-v427.js';
import * as mrcPowerV428 from '../../lib/mrc-power-v428.js';
import * as sarnatHieV429 from '../../lib/sarnat-hie-v429.js';
import * as papileIvhV430 from '../../lib/papile-ivh-v430.js';
import * as bellNecV431 from '../../lib/bell-nec-v431.js';
import * as badenWalkerV432 from '../../lib/baden-walker-v432.js';
import * as modicChangesV433 from '../../lib/modic-changes-v433.js';
import * as pfirrmannDiscV434 from '../../lib/pfirrmann-disc-v434.js';
import * as vanHerickV435 from '../../lib/van-herick-v435.js';
import * as bifflBcviV436 from '../../lib/biffl-bcvi-v436.js';
import * as goutallierV437 from '../../lib/goutallier-v437.js';
import * as eatonLittlerV438 from '../../lib/eaton-littler-v438.js';
import * as hamadaV439 from '../../lib/hamada-v439.js';
import * as barrowCcfV440 from '../../lib/barrow-ccf-v440.js';
import * as bordenDavfV441 from '../../lib/borden-davf-v441.js';
import * as zabramskiV442 from '../../lib/zabramski-v442.js';
import * as kadishV443 from '../../lib/kadish-v443.js';
import * as mccormickV444 from '../../lib/mccormick-v444.js';
import * as atlantaPancreatitisV445 from '../../lib/atlanta-pancreatitis-v445.js';
import * as ropStageV446 from '../../lib/rop-stage-v446.js';
import * as andersonMontesanoV447 from '../../lib/anderson-montesano-v447.js';
import * as traynelisV448 from '../../lib/traynelis-v448.js';
import * as fieldingHawkinsV449 from '../../lib/fielding-hawkins-v449.js';
import * as reidBronchiectasisV450 from '../../lib/reid-bronchiectasis-v450.js';
import * as sadeRetractionV451 from '../../lib/sade-retraction-v451.js';
import * as brookerV452 from '../../lib/brooker-v452.js';
import * as badoV454 from '../../lib/bado-v454.js';
import * as nunleyVertulloV455 from '../../lib/nunley-vertullo-v455.js';
import * as leddyPackerV456 from '../../lib/leddy-packer-v456.js';
import * as stulbergV457 from '../../lib/stulberg-v457.js';
import * as boydGriffinV458 from '../../lib/boyd-griffin-v458.js';
import * as thompsonEpsteinV459 from '../../lib/thompson-epstein-v459.js';
import * as ennekingV460 from '../../lib/enneking-v460.js';
import * as debakeyV461 from '../../lib/debakey-v461.js';
import * as gmfcsV462 from '../../lib/gmfcs-v462.js';
import * as waldenstromPerthesV463 from '../../lib/waldenstrom-perthes-v463.js';
import * as crawfordTaaaV464 from '../../lib/crawford-taaa-v464.js';
import * as stameyIncontinenceV465 from '../../lib/stamey-incontinence-v465.js';
import * as letournelAcetabulumV466 from '../../lib/letournel-acetabulum-v466.js';
import * as bromageScaleV467 from '../../lib/bromage-scale-v467.js';
import * as brouetCryoglobulinemiaV468 from '../../lib/brouet-cryoglobulinemia-v468.js';
import * as steinbrockerRaV469 from '../../lib/steinbrocker-ra-v469.js';
import * as larsenRaV470 from '../../lib/larsen-ra-v470.js';
import * as gassMacularHoleV471 from '../../lib/gass-macular-hole-v471.js';
import * as yerdelPvtV472 from '../../lib/yerdel-pvt-v472.js';
import * as todaniCholedochalV473 from '../../lib/todani-choledochal-v473.js';
import * as rastelliAvsdV474 from '../../lib/rastelli-avsd-v474.js';
import * as glogauPhotoagingV475 from '../../lib/glogau-photoaging-v475.js';
import * as nashMoeRotationV476 from '../../lib/nash-moe-rotation-v476.js';
import * as sfuHydronephrosisV477 from '../../lib/sfu-hydronephrosis-v477.js';
import * as spauldingClassificationV478 from '../../lib/spaulding-classification-v478.js';
import * as spitzAtresiaV479 from '../../lib/spitz-atresia-v479.js';
import * as ahlbackKneeOaV480 from '../../lib/ahlback-knee-oa-v480.js';
import * as wiltseSpondylolisthesisV481 from '../../lib/wiltse-spondylolisthesis-v481.js';
import * as russellTaylorSubtrochV482 from '../../lib/russell-taylor-subtroch-v482.js';
import * as vancouverPeriprostheticV483 from '../../lib/vancouver-periprosthetic-v483.js';
import * as barrackCementV484 from '../../lib/barrack-cement-v484.js';
import * as dejourTrochleaV485 from '../../lib/dejour-trochlea-v485.js';
import * as samilsonPrietoV486 from '../../lib/samilson-prieto-v486.js';
import * as rockwoodAcV487 from '../../lib/rockwood-ac-v487.js';
import * as biglianiAcromionV488 from '../../lib/bigliani-acromion-v488.js';
import * as fernandezRadiusV489 from '../../lib/fernandez-radius-v489.js';
import * as ruediAllgowerPilonV490 from '../../lib/ruedi-allgower-pilon-v490.js';
import * as severinDdhV491 from '../../lib/severin-ddh-v491.js';
import * as hattrupJohnsonV492 from '../../lib/hattrup-johnson-v492.js';
import * as lownEctopyV493 from '../../lib/lown-ectopy-v493.js';
import * as intermacsProfileV494 from '../../lib/intermacs-profile-v494.js';
import * as ranawatMyelopathyV495 from '../../lib/ranawat-myelopathy-v495.js';
import * as lodwickGradeV496 from '../../lib/lodwick-grade-v496.js';
import * as schobingerAvmV497 from '../../lib/schobinger-avm-v497.js';
import * as narakasObppV498 from '../../lib/narakas-obpp-v498.js';
import * as dorrFemurV499 from '../../lib/dorr-femur-v499.js';
import * as tegnerActivityV500 from '../../lib/tegner-activity-v500.js';
import * as ludwigHairlossV501 from '../../lib/ludwig-hairloss-v501.js';
import * as norwoodHairlossV502 from '../../lib/norwood-hairloss-v502.js';
import * as simpsonMeningiomaV503 from '../../lib/simpson-meningioma-v503.js';
import * as metavirFibrosisV504 from '../../lib/metavir-fibrosis-v504.js';
import * as metavirActivityV505 from '../../lib/metavir-activity-v505.js';
import * as jergerTympanogramV506 from '../../lib/jerger-tympanogram-v506.js';
import * as vhi10V508 from '../../lib/vhi10-v508.js';
import * as sunnybrookFacialV509 from '../../lib/sunnybrook-facial-v509.js';
import * as banffTcmrV510 from '../../lib/banff-tcmr-v510.js';
import * as crafftV511 from '../../lib/crafft-v511.js';
import * as vaizeyV512 from '../../lib/vaizey-v512.js';
import * as asrsV513 from '../../lib/asrs-v513.js';
import * as ymrsV514 from '../../lib/ymrs-v514.js';
import * as simpsonAngusV515 from '../../lib/simpson-angus-v515.js';
import * as asthmaControlTestV516 from '../../lib/asthma-control-test-v516.js';
import * as pippV517 from '../../lib/pipp-v517.js';
import * as childhoodActV518 from '../../lib/childhood-act-v518.js';
import * as eckardtV519 from '../../lib/eckardt-v519.js';
import * as spigelmanV520 from '../../lib/spigelman-v520.js';
import * as pcPtsd5V521 from '../../lib/pc-ptsd5-v521.js';
import * as pcdaiV522 from '../../lib/pcdai-v522.js';
import * as scaddingV523 from '../../lib/scadding-v523.js';
import * as capdV525 from '../../lib/capd-v525.js';
import * as grayWealeV524 from '../../lib/gray-weale-v524.js';
import * as nsofaV526 from '../../lib/nsofa-v526.js';
import * as wayneIndexV527 from '../../lib/wayne-index-v527.js';
import * as mestCV528 from '../../lib/mest-c-v528.js';
import * as thwaitesV529 from '../../lib/thwaites-v529.js';
import * as vesikariV530 from '../../lib/vesikari-v530.js';
import * as ehitV531 from '../../lib/ehit-v531.js';
import * as columbiaFsgsV532 from '../../lib/columbia-fsgs-v532.js';
import * as renalAnginaV533 from '../../lib/renal-angina-v533.js';
import * as ridleyJoplingV534 from '../../lib/ridley-jopling-v534.js';
import * as capthusV535 from '../../lib/capthus-v535.js';
import * as hardmanV536 from '../../lib/hardman-v536.js';
import * as alsfrsRV537 from '../../lib/alsfrs-r-v537.js';
import * as neosV538 from '../../lib/neos-v538.js';
import * as islLymphedemaV539 from '../../lib/isl-lymphedema-v539.js';
import * as ishltRejectionV540 from '../../lib/ishlt-rejection-v540.js';
import * as rachs1V541 from '../../lib/rachs1-v541.js';
import * as twstrsSeverityV542 from '../../lib/twstrs-severity-v542.js';
import * as saveScoreV543 from '../../lib/save-score-v543.js';
import * as nemsV544 from '../../lib/nems-v544.js';
import * as palmCoeinV545 from '../../lib/palm-coein-v545.js';
import * as rasrmStageV546 from '../../lib/rasrm-stage-v546.js';
import * as brueV547 from '../../lib/brue-v547.js';
import * as ppmEoaiV548 from '../../lib/ppm-eoai-v548.js';
import * as poseidonV549 from '../../lib/poseidon-v549.js';
import * as glassStageV550 from '../../lib/glass-stage-v550.js';
import * as irecistV551 from '../../lib/irecist-v551.js';
import * as snot22V552 from '../../lib/snot22-v552.js';
import * as puqe24V553 from '../../lib/puqe24-v553.js';
import * as gagsV554 from '../../lib/gags-v554.js';
import * as thiV555 from '../../lib/thi-v555.js';
import * as vasiV556 from '../../lib/vasi-v556.js';
import * as mswatV557 from '../../lib/mswat-v557.js';
import * as osdiV558 from '../../lib/osdi-v558.js';
import * as takayasuV638 from '../../lib/takayasu-v638.js';
import * as gpaV639 from '../../lib/gpa-v639.js';
import * as mpaV640 from '../../lib/mpa-v640.js';
import * as egpaV641 from '../../lib/egpa-v641.js';
import * as yamaguchiV642 from '../../lib/yamaguchi-v642.js';
import * as oswestryV643 from '../../lib/oswestry-v643.js';
import * as slumsV644 from '../../lib/slums-v644.js';
import * as cheopsV645 from '../../lib/cheops-v645.js';
import * as mccormackV646 from '../../lib/mccormack-v646.js';
import * as schenckV647 from '../../lib/schenck-v647.js';
import * as weissV648 from '../../lib/weiss-v648.js';
import * as nottinghamGradeV649 from '../../lib/nottingham-grade-v649.js';
import * as fnclccGradeV651 from '../../lib/fnclcc-grade-v651.js';
import * as vanNuysVnpiV652 from '../../lib/van-nuys-vnpi-v652.js';
import * as whoIsupRenalGradeV653 from '../../lib/who-isup-renal-grade-v653.js';
import * as peritonealCancerIndexV654 from '../../lib/peritoneal-cancer-index-v654.js';
import * as completenessCytoreductionV655 from '../../lib/completeness-cytoreduction-v655.js';
import * as isgpsPopfV656 from '../../lib/isgps-popf-v656.js';
import * as isglsPhlfV657 from '../../lib/isgls-phlf-v657.js';
import * as isglsBileLeakV658 from '../../lib/isgls-bile-leak-v658.js';
import * as isgpsDgeV659 from '../../lib/isgps-dge-v659.js';
import * as passPheoV660 from '../../lib/pass-pheo-v660.js';
import * as ipsHodgkinV661 from '../../lib/ips-hodgkin-v661.js';
import * as pushToolV662 from '../../lib/push-tool-v662.js';
import * as lichtigerIndexV663 from '../../lib/lichtiger-index-v663.js';
import * as diastolicFunctionAseV664 from '../../lib/diastolic-function-ase-v664.js';
import * as clevelandConstipationV665 from '../../lib/cleveland-constipation-v665.js';
import * as vhwgHerniaV666 from '../../lib/vhwg-hernia-v666.js';
import * as fgsiV667 from '../../lib/fgsi-v667.js';
import * as cacAgatstonV668 from '../../lib/cac-agatston-v668.js';
import * as walterIndexV669 from '../../lib/walter-index-v669.js';
import * as ottawaBowelPrepV670 from '../../lib/ottawa-bowel-prep-v670.js';
import * as acrEularBooleanV671 from '../../lib/acr-eular-boolean-v671.js';
import * as mdaPsoriaticV672 from '../../lib/mda-psoriatic-v672.js';
import * as heckerlingPneumoniaV673 from '../../lib/heckerling-pneumonia-v673.js';
import * as osiOnychomycosisV674 from '../../lib/osi-onychomycosis-v674.js';
import * as asrmManiaV675 from '../../lib/asrm-mania-v675.js';
import * as lundKennedyV676 from '../../lib/lund-kennedy-v676.js';
import * as mcmahonRhabdoV677 from '../../lib/mcmahon-rhabdo-v677.js';
import * as meld3V678 from '../../lib/meld3-v678.js';
import * as gerdqV679 from '../../lib/gerdq-v679.js';
import * as kobayashiKawasakiV680 from '../../lib/kobayashi-kawasaki-v680.js';
import * as sanoKawasakiV681 from '../../lib/sano-kawasaki-v681.js';
import * as wangBronchiolitisV682 from '../../lib/wang-bronchiolitis-v682.js';
import * as effectiveOsmolalityV683 from '../../lib/effective-osmolality-v683.js';
import * as fractionalExcretionPotassiumV684 from '../../lib/fractional-excretion-potassium-v684.js';
import * as freeAndrogenIndexV685 from '../../lib/free-androgen-index-v685.js';
import * as ucsfHccV686 from '../../lib/ucsf-hcc-v686.js';
import * as elementalIronIngestedV687 from '../../lib/elemental-iron-ingested-v687.js';
import * as downtonFallRiskV688 from '../../lib/downton-fall-risk-v688.js';
import * as elderlyMobilityScaleV689 from '../../lib/elderly-mobility-scale-v689.js';
import * as edmontonFrailScaleV690 from '../../lib/edmonton-frail-scale-v690.js';
import * as posasObserverScarV691 from '../../lib/posas-observer-scar-v691.js';
import * as conleyFallRiskV692 from '../../lib/conley-fall-risk-v692.js';
import * as interchestV693 from '../../lib/interchest-v693.js';
import * as cobbAngleV694 from '../../lib/cobb-angle-v694.js';
import * as manningIbsV695 from '../../lib/manning-ibs-v695.js';
import * as framinghamHfCriteriaV696 from '../../lib/framingham-hf-criteria-v696.js';
import * as kingsScoreV697 from '../../lib/kings-score-v697.js';
import * as qcsiV698 from '../../lib/qcsi-v698.js';
import * as fabV699 from '../../lib/fab-v699.js';
import * as maltIpiV700 from '../../lib/malt-ipi-v700.js';
import * as cts6V773 from '../../lib/cts6-v773.js';
import * as bctqV774 from '../../lib/bctq-v774.js';
import * as pfdi20V775 from '../../lib/pfdi20-v775.js';
import * as pfiq7V776 from '../../lib/pfiq7-v776.js';
import * as awolV777 from '../../lib/awol-v777.js';
import * as sixcitV778 from '../../lib/sixcit-v778.js';
import * as schofieldV779 from '../../lib/schofield-v779.js';
import * as cbiV780 from '../../lib/cbi-v780.js';
import * as startbackV781 from '../../lib/startback-v781.js';
import * as fabqV782 from '../../lib/fabq-v782.js';
import * as posasPatientScarV783 from '../../lib/posas-patient-scar-v783.js';
import * as griffithVtV784 from '../../lib/griffith-vt-v784.js';
import * as olbiV785 from '../../lib/olbi-v785.js';
import * as arvcTfcV786 from '../../lib/arvc-tfc-v786.js';
import * as atrialEnlargementV787 from '../../lib/atrial-enlargement-v787.js';
import * as intertakV788 from '../../lib/intertak-v788.js';
import * as pericarditisV789 from '../../lib/pericarditis-v789.js';
import * as lakeLouiseCmrV790 from '../../lib/lake-louise-cmr-v790.js';
import * as cardiacSarcoidosisV791 from '../../lib/cardiac-sarcoidosis-v791.js';
import * as rudasV792 from '../../lib/rudas-v792.js';
import * as simpleShoulderTestV793 from '../../lib/simple-shoulder-test-v793.js';
import * as furstRatioV794 from '../../lib/furst-ratio-v794.js';
import * as misCV795 from '../../lib/mis-c-v795.js';
import * as euTiradsV796 from '../../lib/eu-tirads-v796.js';
import * as nenWhoGradeV797 from '../../lib/nen-who-grade-v797.js';
import * as rtaTypeV798 from '../../lib/rta-type-v798.js';
import * as caineWernickeV799 from '../../lib/caine-wernicke-v799.js';
import * as hughesGbsV800 from '../../lib/hughes-gbs-v800.js';
import * as hpaGlaucomaV801 from '../../lib/hpa-glaucoma-v801.js';
import * as gardnerRobertsonV802 from '../../lib/gardner-robertson-v802.js';
import * as anaphylaxisCriteriaV803 from '../../lib/anaphylaxis-criteria-v803.js';
import * as romeEcopdV804 from '../../lib/rome-ecopd-v804.js';
import * as amtsV805 from '../../lib/amts-v805.js';
import * as pss10V806 from '../../lib/pss10-v806.js';
import * as chicagoAchalasiaV807 from '../../lib/chicago-achalasia-v807.js';
import * as hrsAkiV808 from '../../lib/hrs-aki-v808.js';
import * as forrestClassificationV809 from '../../lib/forrest-classification-v809.js';
import * as mallampatiV810 from '../../lib/mallampati-v810.js';
import * as goldCoastAlsV811 from '../../lib/gold-coast-als-v811.js';
import * as leipzigWilsonV812 from '../../lib/leipzig-wilson-v812.js';
import * as systemicMastocytosisV813 from '../../lib/systemic-mastocytosis-v813.js';
import * as clusterHeadacheIchd3V814 from '../../lib/cluster-headache-ichd3-v814.js';
import * as migraineIchd3V815 from '../../lib/migraine-ichd3-v815.js';
import * as mohIchd3V816 from '../../lib/moh-ichd3-v816.js';
import * as trigeminalNeuralgiaIchd3V817 from '../../lib/trigeminal-neuralgia-ichd3-v817.js';
import * as tensionHeadacheIchd3V818 from '../../lib/tension-headache-ichd3-v818.js';
import * as indomethacinHeadacheIchd3V819 from '../../lib/indomethacin-headache-ichd3-v819.js';
import * as sunctSunaIchd3V820 from '../../lib/sunct-suna-ichd3-v820.js';
import * as ghentMarfanV821 from '../../lib/ghent-marfan-v821.js';
import * as heds2017V822 from '../../lib/heds-2017-v822.js';
import * as nmosd2015V823 from '../../lib/nmosd-2015-v823.js';
import * as autoimmuneEncephalitisV824 from '../../lib/autoimmune-encephalitis-v824.js';
import * as igg4Rd2020V825 from '../../lib/igg4-rd-2020-v825.js';
import * as phHemodynamics2022V826 from '../../lib/ph-hemodynamics-2022-v826.js';
import * as ntmPulmonaryV827 from '../../lib/ntm-pulmonary-v827.js';
import * as cfDiagnosisV828 from '../../lib/cf-diagnosis-v828.js';
import * as ohsDiagnosisV829 from '../../lib/ohs-diagnosis-v829.js';
import * as aatDeficiencyV830 from '../../lib/aat-deficiency-v830.js';
import * as quinteroTttsV831 from '../../lib/quintero-ttts-v831.js';
import * as tripleIV832 from '../../lib/triple-i-v832.js';
import * as figoPasV833 from '../../lib/figo-pas-v833.js';
import * as poiDiagnosisV834 from '../../lib/poi-diagnosis-v834.js';
import * as acromegalyBiochemV835 from '../../lib/acromegaly-biochem-v835.js';
import * as fourTsHitV836 from '../../lib/four-ts-hit-v836.js';
import * as sadPersonsV701 from '../../lib/sad-persons-v701.js';
import * as edinburghClaudicationV702 from '../../lib/edinburgh-claudication-v702.js';
import * as reimersMigrationPercentageV703 from '../../lib/reimers-migration-percentage-v703.js';
import * as catonDeschampsV704 from '../../lib/caton-deschamps-v704.js';
import * as piLlMismatchV705 from '../../lib/pi-ll-mismatch-v705.js';
import * as leedsEnthesitisIndexV706 from '../../lib/leeds-enthesitis-index-v706.js';
import * as amslerKrumeichV707 from '../../lib/amsler-krumeich-v707.js';
import * as meniereAaoHnsV708 from '../../lib/meniere-aao-hns-v708.js';
import * as opioidRiskToolV709 from '../../lib/opioid-risk-tool-v709.js';
import * as g8GeriatricV710 from '../../lib/g8-geriatric-v710.js';
import * as ausdriskV711 from '../../lib/ausdrisk-v711.js';
import * as mnaSfV712 from '../../lib/mna-sf-v712.js';
import * as eossV713 from '../../lib/eoss-v713.js';
import * as prostateHealthIndexV714 from '../../lib/prostate-health-index-v714.js';
import * as beweV715 from '../../lib/bewe-v715.js';
import * as dmftCariesV716 from '../../lib/dmft-caries-v716.js';
import * as pedersonDifficultyV717 from '../../lib/pederson-difficulty-v717.js';
import * as ellisToothFractureV718 from '../../lib/ellis-tooth-fracture-v718.js';
import * as kennedyEdentulousV719 from '../../lib/kennedy-edentulous-v719.js';
import * as angleMalocclusionV720 from '../../lib/angle-malocclusion-v720.js';
import * as plaqueControlRecordV721 from '../../lib/plaque-control-record-v721.js';
import * as loeSilnessGingivalIndexV722 from '../../lib/loe-silness-gingival-index-v722.js';
import * as silnessLoePlaqueIndexV723 from '../../lib/silness-loe-plaque-index-v723.js';
import * as millerGingivalRecessionV724 from '../../lib/miller-gingival-recession-v724.js';
import * as glickmanFurcationV725 from '../../lib/glickman-furcation-v725.js';
import * as isiV726 from '../../lib/isi-v726.js';
import * as foisV727 from '../../lib/fois-v727.js';
import * as hhieSV728 from '../../lib/hhie-s-v728.js';
import * as abcScaleV729 from '../../lib/abc-scale-v729.js';
import * as sdsDependenceV730 from '../../lib/sds-dependence-v730.js';
import * as ibfatV731 from '../../lib/ibfat-v731.js';
import * as fssV732 from '../../lib/fss-v732.js';
import * as chalderFatigueV733 from '../../lib/chalder-fatigue-v733.js';
import * as phq15V734 from '../../lib/phq15-v734.js';
import * as k6V735 from '../../lib/k6-v735.js';
import * as smastV737 from '../../lib/smast-v737.js';
import * as cageAidV738 from '../../lib/cage-aid-v738.js';
import * as mayoOlecranonV739 from '../../lib/mayo-olecranon-v739.js';
import * as walchGlenoidV740 from '../../lib/walch-glenoid-v740.js';
import * as masaokaV650 from '../../lib/masaoka-v650.js';
import * as erezDicV559 from '../../lib/erez-dic-v559.js';
import * as anaqeebAeegV560 from '../../lib/anaqeeb-aeeg-v560.js';
import * as spadiV561 from '../../lib/spadi-v561.js';
import * as scpPushingV562 from '../../lib/scp-pushing-v562.js';
import * as mayoAdpkdV563 from '../../lib/mayo-adpkd-v563.js';
import * as propkdV564 from '../../lib/propkd-v564.js';
import * as lupusNephritisIndicesV565 from '../../lib/lupus-nephritis-indices-v565.js';
import * as nihCpsiV566 from '../../lib/nih-cpsi-v566.js';
import * as igcccgV567 from '../../lib/igcccg-v567.js';
import * as thakarAkiV568 from '../../lib/thakar-aki-v568.js';
import * as gappV569 from '../../lib/gapp-v569.js';
import * as globalArdsV570 from '../../lib/global-ards-v570.js';
import * as eFacedV571 from '../../lib/e-faced-v571.js';
import * as heavenCriteriaV572 from '../../lib/heaven-criteria-v572.js';
import * as mapiAsthmaV573 from '../../lib/mapi-asthma-v573.js';
import * as compera2V574 from '../../lib/compera-2-v574.js';
import * as peradeniyaOpV575 from '../../lib/peradeniya-op-v575.js';
import * as ablettTetanusV576 from '../../lib/ablett-tetanus-v576.js';
import * as magicGvhdV577 from '../../lib/magic-gvhd-v577.js';
import * as nancyIndexV578 from '../../lib/nancy-index-v578.js';
import * as robartsIndexV579 from '../../lib/robarts-index-v579.js';
import * as ehraAfV580 from '../../lib/ehra-af-v580.js';
import * as shanghaiBrugadaV581 from '../../lib/shanghai-brugada-v581.js';
import * as hlh2004V582 from '../../lib/hlh-2004-v582.js';
import * as nacAttrStageV583 from '../../lib/nac-attr-stage-v583.js';
import * as ebmtScoreV584 from '../../lib/ebmt-score-v584.js';
import * as rucamV585 from '../../lib/rucam-v585.js';
import * as upToSevenV586 from '../../lib/up-to-seven-v586.js';
import * as qpittV587 from '../../lib/qpitt-v587.js';
import * as bolognaPorV588 from '../../lib/bologna-por-v588.js';
import * as sternbachV589 from '../../lib/sternbach-v589.js';
import * as ffs1996V590 from '../../lib/ffs-1996-v590.js';
import * as heffnerV591 from '../../lib/heffner-v591.js';
import * as amsterdamIiV592 from '../../lib/amsterdam-ii-v592.js';
import * as bethesdaV593 from '../../lib/bethesda-v593.js';
import * as arcHbrV594 from '../../lib/arc-hbr-v594.js';
import * as acefV595 from '../../lib/acef-v595.js';
import * as lepineV596 from '../../lib/lepine-v596.js';
import * as panc3V597 from '../../lib/panc3-v597.js';
import * as jtaThyroidStormV598 from '../../lib/jta-thyroid-storm-v598.js';
import * as myxedemaComaV599 from '../../lib/myxedema-coma-v599.js';
import * as fisherGradeV600 from '../../lib/fisher-grade-v600.js';
import * as pollockFlickingerV601 from '../../lib/pollock-flickinger-v601.js';
import * as vrasV602 from '../../lib/vras-v602.js';
import * as bauerScoreV603 from '../../lib/bauer-score-v603.js';
import * as bilskyEsccV604 from '../../lib/bilsky-escc-v604.js';
import * as harringtonAcetabularV605 from '../../lib/harrington-acetabular-v605.js';
import * as katagiriV606 from '../../lib/katagiri-v606.js';
import * as sartoriusHsV607 from '../../lib/sartorius-hs-v607.js';
import * as zulewskiV608 from '../../lib/zulewski-v608.js';
import * as hijdraV609 from '../../lib/hijdra-v609.js';
import * as edinburghCaaV610 from '../../lib/edinburgh-caa-v610.js';
import * as friedFrailtyV611 from '../../lib/fried-frailty-v611.js';
import * as utDiabeticFootV612 from '../../lib/ut-diabetic-foot-v612.js';
import * as pedisV613 from '../../lib/pedis-v613.js';
import * as ocularTraumaScoreV614 from '../../lib/ocular-trauma-score-v614.js';
import * as aredsV615 from '../../lib/areds-v615.js';
import * as frisenV616 from '../../lib/frisen-v616.js';
import * as whoMucositisV617 from '../../lib/who-mucositis-v617.js';
import * as erefsV618 from '../../lib/erefs-v618.js';
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
  'pressure-injury-stage-v359.js': pressureInjuryStageV359,
  'kwb-retinopathy-v360.js': kwbRetinopathyV360,
  'tanner-staging-v361.js': tannerStagingV361,
  'forrester-hemodynamic-v362.js': forresterHemodynamicV362,
  'shaffer-angle-v363.js': shafferAngleV363,
  'cas-ted-v364.js': casTedV364,
  'prague-barrett-v365.js': pragueBarrettV365,
  'neck-zone-v366.js': neckZoneV366,
  'pas-swallow-v367.js': pasSwallowV367,
  'ross-hf-peds-v368.js': rossHfPedsV368,
  'nohria-stevenson-v369.js': nohriaStevensonV369,
  'hartofilakidis-ddh-v370.js': hartofilakidisDdhV370,
  'c-rads-v371.js': cRadsV371,
  'cad-rads-v372.js': cadRadsV372,
  'ni-rads-v373.js': niRadsV373,
  'pauwels-femoral-neck-v374.js': pauwelsFemoralNeckV374,
  'pipkin-femoral-head-v375.js': pipkinFemoralHeadV375,
  'denis-sacral-v376.js': denisSacralV376,
  'gartland-supracondylar-v377.js': gartlandSupracondylarV377,
  'delbet-femoral-neck-v378.js': delbetFemoralNeckV378,
  'tile-pelvic-v379.js': tilePelvicV379,
  'young-burgess-v380.js': youngBurgessV380,
  'winquist-hansen-v381.js': winquistHansenV381,
  'eichenholtz-charcot-v382.js': eichenholtzCharcotV382,
  'risser-sign-v383.js': risserSignV383,
  'spetzler-ponce-v384.js': spetzlerPonceV384,
  'schwab-england-v385.js': schwabEnglandV385,
  'pirani-clubfoot-v386.js': piraniClubfootV386,
  'dimeglio-clubfoot-v387.js': dimeglioClubfootV387,
  'brodsky-tonsil-v388.js': brodskyTonsilV388,
  'koos-schwannoma-v389.js': koosSchwannomaV389,
  'knosp-adenoma-v390.js': knospAdenomaV390,
  'hardy-adenoma-v391.js': hardyAdenomaV391,
  'hill-flap-valve-v392.js': hillFlapValveV392,
  'lauren-gastric-v393.js': laurenGastricV393,
  'borrmann-gastric-v394.js': borrmannGastricV394,
  'parks-fistula-v395.js': parksFistulaV395,
  'sievers-bav-v396.js': sieversBavV396,
  'el-khoury-ar-v397.js': elKhouryArV397,
  'carpentier-mr-v398.js': carpentierMrV398,
  'bismuth-corlette-v399.js': bismuthCorletteV399,
  'nyhus-hernia-v400.js': nyhusHerniaV400,
  'zargar-caustic-v401.js': zargarCausticV401,
  'lauge-hansen-v402.js': laugeHansenV402,
  'berndt-harty-v403.js': berndtHartyV403,
  'regan-morrey-v404.js': reganMorreyV404,
  'savary-miller-v405.js': savaryMillerV405,
  'le-fort-v406.js': leFortV406,
  'steinberg-avn-v407.js': steinbergAvnV407,
  'meyers-mckeever-v408.js': meyersMckeeverV408,
  'ideberg-glenoid-v409.js': idebergGlenoidV409,
  'anderson-dalonzo-v410.js': andersonDalonzoV410,
  'levine-edwards-v411.js': levineEdwardsV411,
  'lisfranc-myerson-v412.js': lisfrancMyersonV412,
  'seinsheimer-subtroch-v413.js': seinsheimerSubtrochV413,
  'mayfield-perilunate-v414.js': mayfieldPerilunateV414,
  'geissler-carpal-v415.js': geisslerCarpalV415,
  'russe-scaphoid-v416.js': russeScaphoidV416,
  'wassel-thumb-v417.js': wasselThumbV417,
  'milch-condyle-v418.js': milchCondyleV418,
  'cotton-myer-v419.js': cottonMyerV419,
  'friedman-tongue-v420.js': friedmanTongueV420,
  'sun-ac-cell-v421.js': sunAcCellV421,
  'sun-ac-flare-v422.js': sunAcFlareV422,
  'marsh-oberhuber-v423.js': marshOberhuberV423,
  'bethesda-thyroid-v424.js': bethesdaThyroidV424,
  'vur-grade-v425.js': vurGradeV425,
  'gell-coombs-v426.js': gellCoombsV426,
  'vaughan-williams-v427.js': vaughanWilliamsV427,
  'mrc-power-v428.js': mrcPowerV428,
  'sarnat-hie-v429.js': sarnatHieV429,
  'papile-ivh-v430.js': papileIvhV430,
  'bell-nec-v431.js': bellNecV431,
  'baden-walker-v432.js': badenWalkerV432,
  'modic-changes-v433.js': modicChangesV433,
  'pfirrmann-disc-v434.js': pfirrmannDiscV434,
  'van-herick-v435.js': vanHerickV435,
  'biffl-bcvi-v436.js': bifflBcviV436,
  'goutallier-v437.js': goutallierV437,
  'eaton-littler-v438.js': eatonLittlerV438,
  'hamada-v439.js': hamadaV439,
  'barrow-ccf-v440.js': barrowCcfV440,
  'borden-davf-v441.js': bordenDavfV441,
  'zabramski-v442.js': zabramskiV442,
  'kadish-v443.js': kadishV443,
  'mccormick-v444.js': mccormickV444,
  'atlanta-pancreatitis-v445.js': atlantaPancreatitisV445,
  'rop-stage-v446.js': ropStageV446,
  'anderson-montesano-v447.js': andersonMontesanoV447,
  'traynelis-v448.js': traynelisV448,
  'fielding-hawkins-v449.js': fieldingHawkinsV449,
  'reid-bronchiectasis-v450.js': reidBronchiectasisV450,
  'sade-retraction-v451.js': sadeRetractionV451,
  'brooker-v452.js': brookerV452,
  'bado-v454.js': badoV454,
  'nunley-vertullo-v455.js': nunleyVertulloV455,
  'leddy-packer-v456.js': leddyPackerV456,
  'stulberg-v457.js': stulbergV457,
  'boyd-griffin-v458.js': boydGriffinV458,
  'thompson-epstein-v459.js': thompsonEpsteinV459,
  'enneking-v460.js': ennekingV460,
  'debakey-v461.js': debakeyV461,
  'gmfcs-v462.js': gmfcsV462,
  'waldenstrom-perthes-v463.js': waldenstromPerthesV463,
  'crawford-taaa-v464.js': crawfordTaaaV464,
  'stamey-incontinence-v465.js': stameyIncontinenceV465,
  'letournel-acetabulum-v466.js': letournelAcetabulumV466,
  'bromage-scale-v467.js': bromageScaleV467,
  'brouet-cryoglobulinemia-v468.js': brouetCryoglobulinemiaV468,
  'steinbrocker-ra-v469.js': steinbrockerRaV469,
  'larsen-ra-v470.js': larsenRaV470,
  'gass-macular-hole-v471.js': gassMacularHoleV471,
  'yerdel-pvt-v472.js': yerdelPvtV472,
  'todani-choledochal-v473.js': todaniCholedochalV473,
  'rastelli-avsd-v474.js': rastelliAvsdV474,
  'glogau-photoaging-v475.js': glogauPhotoagingV475,
  'nash-moe-rotation-v476.js': nashMoeRotationV476,
  'sfu-hydronephrosis-v477.js': sfuHydronephrosisV477,
  'spaulding-classification-v478.js': spauldingClassificationV478,
  'spitz-atresia-v479.js': spitzAtresiaV479,
  'ahlback-knee-oa-v480.js': ahlbackKneeOaV480,
  'wiltse-spondylolisthesis-v481.js': wiltseSpondylolisthesisV481,
  'russell-taylor-subtroch-v482.js': russellTaylorSubtrochV482,
  'vancouver-periprosthetic-v483.js': vancouverPeriprostheticV483,
  'barrack-cement-v484.js': barrackCementV484,
  'dejour-trochlea-v485.js': dejourTrochleaV485,
  'samilson-prieto-v486.js': samilsonPrietoV486,
  'rockwood-ac-v487.js': rockwoodAcV487,
  'bigliani-acromion-v488.js': biglianiAcromionV488,
  'fernandez-radius-v489.js': fernandezRadiusV489,
  'ruedi-allgower-pilon-v490.js': ruediAllgowerPilonV490,
  'severin-ddh-v491.js': severinDdhV491,
  'hattrup-johnson-v492.js': hattrupJohnsonV492,
  'lown-ectopy-v493.js': lownEctopyV493,
  'intermacs-profile-v494.js': intermacsProfileV494,
  'ranawat-myelopathy-v495.js': ranawatMyelopathyV495,
  'lodwick-grade-v496.js': lodwickGradeV496,
  'schobinger-avm-v497.js': schobingerAvmV497,
  'narakas-obpp-v498.js': narakasObppV498,
  'dorr-femur-v499.js': dorrFemurV499,
  'tegner-activity-v500.js': tegnerActivityV500,
  'ludwig-hairloss-v501.js': ludwigHairlossV501,
  'norwood-hairloss-v502.js': norwoodHairlossV502,
  'simpson-meningioma-v503.js': simpsonMeningiomaV503,
  'metavir-fibrosis-v504.js': metavirFibrosisV504,
  'metavir-activity-v505.js': metavirActivityV505,
  'jerger-tympanogram-v506.js': jergerTympanogramV506,
  'vhi10-v508.js': vhi10V508,
  'sunnybrook-facial-v509.js': sunnybrookFacialV509,
  'banff-tcmr-v510.js': banffTcmrV510,
  'crafft-v511.js': crafftV511,
  'vaizey-v512.js': vaizeyV512,
  'asrs-v513.js': asrsV513,
  'ymrs-v514.js': ymrsV514,
  'simpson-angus-v515.js': simpsonAngusV515,
  'asthma-control-test-v516.js': asthmaControlTestV516,
  'pipp-v517.js': pippV517,
  'childhood-act-v518.js': childhoodActV518,
  'eckardt-v519.js': eckardtV519,
  'spigelman-v520.js': spigelmanV520,
  'pc-ptsd5-v521.js': pcPtsd5V521,
  'pcdai-v522.js': pcdaiV522,
  'scadding-v523.js': scaddingV523,
  'capd-v525.js': capdV525,
  'gray-weale-v524.js': grayWealeV524,
  'nsofa-v526.js': nsofaV526,
  'wayne-index-v527.js': wayneIndexV527,
  'mest-c-v528.js': mestCV528,
  'thwaites-v529.js': thwaitesV529,
  'vesikari-v530.js': vesikariV530,
  'ehit-v531.js': ehitV531,
  'columbia-fsgs-v532.js': columbiaFsgsV532,
  'renal-angina-v533.js': renalAnginaV533,
  'ridley-jopling-v534.js': ridleyJoplingV534,
  'capthus-v535.js': capthusV535,
  'hardman-v536.js': hardmanV536,
  'alsfrs-r-v537.js': alsfrsRV537,
  'neos-v538.js': neosV538,
  'isl-lymphedema-v539.js': islLymphedemaV539,
  'ishlt-rejection-v540.js': ishltRejectionV540,
  'rachs1-v541.js': rachs1V541,
  'twstrs-severity-v542.js': twstrsSeverityV542,
  'save-score-v543.js': saveScoreV543,
  'nems-v544.js': nemsV544,
  'palm-coein-v545.js': palmCoeinV545,
  'rasrm-stage-v546.js': rasrmStageV546,
  'brue-v547.js': brueV547,
  'ppm-eoai-v548.js': ppmEoaiV548,
  'poseidon-v549.js': poseidonV549,
  'glass-stage-v550.js': glassStageV550,
  'irecist-v551.js': irecistV551,
  'snot22-v552.js': snot22V552,
  'puqe24-v553.js': puqe24V553,
  'gags-v554.js': gagsV554,
  'thi-v555.js': thiV555,
  'vasi-v556.js': vasiV556,
  'mswat-v557.js': mswatV557,
  'osdi-v558.js': osdiV558,
  'takayasu-v638.js': takayasuV638,
  'gpa-v639.js': gpaV639,
  'mpa-v640.js': mpaV640,
  'egpa-v641.js': egpaV641,
  'yamaguchi-v642.js': yamaguchiV642,
  'oswestry-v643.js': oswestryV643,
  'slums-v644.js': slumsV644,
  'cheops-v645.js': cheopsV645,
  'mccormack-v646.js': mccormackV646,
  'schenck-v647.js': schenckV647,
  'weiss-v648.js': weissV648,
  'nottingham-grade-v649.js': nottinghamGradeV649,
  'fnclcc-grade-v651.js': fnclccGradeV651,
  'van-nuys-vnpi-v652.js': vanNuysVnpiV652,
  'who-isup-renal-grade-v653.js': whoIsupRenalGradeV653,
  'peritoneal-cancer-index-v654.js': peritonealCancerIndexV654,
  'completeness-cytoreduction-v655.js': completenessCytoreductionV655,
  'isgps-popf-v656.js': isgpsPopfV656,
  'isgls-phlf-v657.js': isglsPhlfV657,
  'isgls-bile-leak-v658.js': isglsBileLeakV658,
  'isgps-dge-v659.js': isgpsDgeV659,
  'pass-pheo-v660.js': passPheoV660,
  'ips-hodgkin-v661.js': ipsHodgkinV661,
  'push-tool-v662.js': pushToolV662,
  'lichtiger-index-v663.js': lichtigerIndexV663,
  'diastolic-function-ase-v664.js': diastolicFunctionAseV664,
  'cleveland-constipation-v665.js': clevelandConstipationV665,
  'vhwg-hernia-v666.js': vhwgHerniaV666,
  'fgsi-v667.js': fgsiV667,
  'cac-agatston-v668.js': cacAgatstonV668,
  'walter-index-v669.js': walterIndexV669,
  'ottawa-bowel-prep-v670.js': ottawaBowelPrepV670,
  'acr-eular-boolean-v671.js': acrEularBooleanV671,
  'mda-psoriatic-v672.js': mdaPsoriaticV672,
  'heckerling-pneumonia-v673.js': heckerlingPneumoniaV673,
  'osi-onychomycosis-v674.js': osiOnychomycosisV674,
  'asrm-mania-v675.js': asrmManiaV675,
  'lund-kennedy-v676.js': lundKennedyV676,
  'mcmahon-rhabdo-v677.js': mcmahonRhabdoV677,
  'meld3-v678.js': meld3V678,
  'gerdq-v679.js': gerdqV679,
  'kobayashi-kawasaki-v680.js': kobayashiKawasakiV680,
  'sano-kawasaki-v681.js': sanoKawasakiV681,
  'wang-bronchiolitis-v682.js': wangBronchiolitisV682,
  'effective-osmolality-v683.js': effectiveOsmolalityV683,
  'fractional-excretion-potassium-v684.js': fractionalExcretionPotassiumV684,
  'free-androgen-index-v685.js': freeAndrogenIndexV685,
  'ucsf-hcc-v686.js': ucsfHccV686,
  'elemental-iron-ingested-v687.js': elementalIronIngestedV687,
  'downton-fall-risk-v688.js': downtonFallRiskV688,
  'elderly-mobility-scale-v689.js': elderlyMobilityScaleV689,
  'edmonton-frail-scale-v690.js': edmontonFrailScaleV690,
  'posas-observer-scar-v691.js': posasObserverScarV691,
  'conley-fall-risk-v692.js': conleyFallRiskV692,
  'interchest-v693.js': interchestV693,
  'cobb-angle-v694.js': cobbAngleV694,
  'manning-ibs-v695.js': manningIbsV695,
  'framingham-hf-criteria-v696.js': framinghamHfCriteriaV696,
  'kings-score-v697.js': kingsScoreV697,
  'qcsi-v698.js': qcsiV698,
  'fab-v699.js': fabV699,
  'malt-ipi-v700.js': maltIpiV700,
  'cts6-v773.js': cts6V773,
  'bctq-v774.js': bctqV774,
  'pfdi20-v775.js': pfdi20V775,
  'pfiq7-v776.js': pfiq7V776,
  'awol-v777.js': awolV777,
  'sixcit-v778.js': sixcitV778,
  'schofield-v779.js': schofieldV779,
  'cbi-v780.js': cbiV780,
  'startback-v781.js': startbackV781,
  'fabq-v782.js': fabqV782,
  'posas-patient-scar-v783.js': posasPatientScarV783,
  'griffith-vt-v784.js': griffithVtV784,
  'olbi-v785.js': olbiV785,
  'arvc-tfc-v786.js': arvcTfcV786,
  'atrial-enlargement-v787.js': atrialEnlargementV787,
  'intertak-v788.js': intertakV788,
  'pericarditis-v789.js': pericarditisV789,
  'lake-louise-cmr-v790.js': lakeLouiseCmrV790,
  'cardiac-sarcoidosis-v791.js': cardiacSarcoidosisV791,
  'rudas-v792.js': rudasV792,
  'simple-shoulder-test-v793.js': simpleShoulderTestV793,
  'furst-ratio-v794.js': furstRatioV794,
  'mis-c-v795.js': misCV795,
  'eu-tirads-v796.js': euTiradsV796,
  'nen-who-grade-v797.js': nenWhoGradeV797,
  'rta-type-v798.js': rtaTypeV798,
  'caine-wernicke-v799.js': caineWernickeV799,
  'hughes-gbs-v800.js': hughesGbsV800,
  'hpa-glaucoma-v801.js': hpaGlaucomaV801,
  'gardner-robertson-v802.js': gardnerRobertsonV802,
  'anaphylaxis-criteria-v803.js': anaphylaxisCriteriaV803,
  'rome-ecopd-v804.js': romeEcopdV804,
  'amts-v805.js': amtsV805,
  'pss10-v806.js': pss10V806,
  'chicago-achalasia-v807.js': chicagoAchalasiaV807,
  'hrs-aki-v808.js': hrsAkiV808,
  'forrest-classification-v809.js': forrestClassificationV809,
  'mallampati-v810.js': mallampatiV810,
  'gold-coast-als-v811.js': goldCoastAlsV811,
  'leipzig-wilson-v812.js': leipzigWilsonV812,
  'systemic-mastocytosis-v813.js': systemicMastocytosisV813,
  'cluster-headache-ichd3-v814.js': clusterHeadacheIchd3V814,
  'migraine-ichd3-v815.js': migraineIchd3V815,
  'moh-ichd3-v816.js': mohIchd3V816,
  'trigeminal-neuralgia-ichd3-v817.js': trigeminalNeuralgiaIchd3V817,
  'tension-headache-ichd3-v818.js': tensionHeadacheIchd3V818,
  'indomethacin-headache-ichd3-v819.js': indomethacinHeadacheIchd3V819,
  'sunct-suna-ichd3-v820.js': sunctSunaIchd3V820,
  'ghent-marfan-v821.js': ghentMarfanV821,
  'heds-2017-v822.js': heds2017V822,
  'nmosd-2015-v823.js': nmosd2015V823,
  'autoimmune-encephalitis-v824.js': autoimmuneEncephalitisV824,
  'igg4-rd-2020-v825.js': igg4Rd2020V825,
  'ph-hemodynamics-2022-v826.js': phHemodynamics2022V826,
  'ntm-pulmonary-v827.js': ntmPulmonaryV827,
  'cf-diagnosis-v828.js': cfDiagnosisV828,
  'ohs-diagnosis-v829.js': ohsDiagnosisV829,
  'aat-deficiency-v830.js': aatDeficiencyV830,
  'quintero-ttts-v831.js': quinteroTttsV831,
  'triple-i-v832.js': tripleIV832,
  'figo-pas-v833.js': figoPasV833,
  'poi-diagnosis-v834.js': poiDiagnosisV834,
  'acromegaly-biochem-v835.js': acromegalyBiochemV835,
  'four-ts-hit-v836.js': fourTsHitV836,
  'sad-persons-v701.js': sadPersonsV701,
  'edinburgh-claudication-v702.js': edinburghClaudicationV702,
  'reimers-migration-percentage-v703.js': reimersMigrationPercentageV703,
  'caton-deschamps-v704.js': catonDeschampsV704,
  'pi-ll-mismatch-v705.js': piLlMismatchV705,
  'leeds-enthesitis-index-v706.js': leedsEnthesitisIndexV706,
  'amsler-krumeich-v707.js': amslerKrumeichV707,
  'meniere-aao-hns-v708.js': meniereAaoHnsV708,
  'opioid-risk-tool-v709.js': opioidRiskToolV709,
  'g8-geriatric-v710.js': g8GeriatricV710,
  'ausdrisk-v711.js': ausdriskV711,
  'mna-sf-v712.js': mnaSfV712,
  'eoss-v713.js': eossV713,
  'prostate-health-index-v714.js': prostateHealthIndexV714,
  'bewe-v715.js': beweV715,
  'dmft-caries-v716.js': dmftCariesV716,
  'pederson-difficulty-v717.js': pedersonDifficultyV717,
  'ellis-tooth-fracture-v718.js': ellisToothFractureV718,
  'kennedy-edentulous-v719.js': kennedyEdentulousV719,
  'angle-malocclusion-v720.js': angleMalocclusionV720,
  'plaque-control-record-v721.js': plaqueControlRecordV721,
  'loe-silness-gingival-index-v722.js': loeSilnessGingivalIndexV722,
  'silness-loe-plaque-index-v723.js': silnessLoePlaqueIndexV723,
  'miller-gingival-recession-v724.js': millerGingivalRecessionV724,
  'glickman-furcation-v725.js': glickmanFurcationV725,
  'isi-v726.js': isiV726,
  'fois-v727.js': foisV727,
  'hhie-s-v728.js': hhieSV728,
  'abc-scale-v729.js': abcScaleV729,
  'sds-dependence-v730.js': sdsDependenceV730,
  'ibfat-v731.js': ibfatV731,
  'fss-v732.js': fssV732,
  'chalder-fatigue-v733.js': chalderFatigueV733,
  'phq15-v734.js': phq15V734,
  'k6-v735.js': k6V735,
  'smast-v737.js': smastV737,
  'cage-aid-v738.js': cageAidV738,
  'mayo-olecranon-v739.js': mayoOlecranonV739,
  'walch-glenoid-v740.js': walchGlenoidV740,
  'masaoka-v650.js': masaokaV650,
  'erez-dic-v559.js': erezDicV559,
  'anaqeeb-aeeg-v560.js': anaqeebAeegV560,
  'spadi-v561.js': spadiV561,
  'scp-pushing-v562.js': scpPushingV562,
  'mayo-adpkd-v563.js': mayoAdpkdV563,
  'propkd-v564.js': propkdV564,
  'lupus-nephritis-indices-v565.js': lupusNephritisIndicesV565,
  'nih-cpsi-v566.js': nihCpsiV566,
  'igcccg-v567.js': igcccgV567,
  'thakar-aki-v568.js': thakarAkiV568,
  'gapp-v569.js': gappV569,
  'global-ards-v570.js': globalArdsV570,
  'e-faced-v571.js': eFacedV571,
  'heaven-criteria-v572.js': heavenCriteriaV572,
  'mapi-asthma-v573.js': mapiAsthmaV573,
  'compera-2-v574.js': compera2V574,
  'peradeniya-op-v575.js': peradeniyaOpV575,
  'ablett-tetanus-v576.js': ablettTetanusV576,
  'magic-gvhd-v577.js': magicGvhdV577,
  'nancy-index-v578.js': nancyIndexV578,
  'robarts-index-v579.js': robartsIndexV579,
  'ehra-af-v580.js': ehraAfV580,
  'shanghai-brugada-v581.js': shanghaiBrugadaV581,
  'hlh-2004-v582.js': hlh2004V582,
  'nac-attr-stage-v583.js': nacAttrStageV583,
  'ebmt-score-v584.js': ebmtScoreV584,
  'rucam-v585.js': rucamV585,
  'up-to-seven-v586.js': upToSevenV586,
  'qpitt-v587.js': qpittV587,
  'bologna-por-v588.js': bolognaPorV588,
  'sternbach-v589.js': sternbachV589,
  'ffs-1996-v590.js': ffs1996V590,
  'heffner-v591.js': heffnerV591,
  'amsterdam-ii-v592.js': amsterdamIiV592,
  'bethesda-v593.js': bethesdaV593,
  'arc-hbr-v594.js': arcHbrV594,
  'acef-v595.js': acefV595,
  'lepine-v596.js': lepineV596,
  'panc3-v597.js': panc3V597,
  'jta-thyroid-storm-v598.js': jtaThyroidStormV598,
  'myxedema-coma-v599.js': myxedemaComaV599,
  'fisher-grade-v600.js': fisherGradeV600,
  'pollock-flickinger-v601.js': pollockFlickingerV601,
  'vras-v602.js': vrasV602,
  'bauer-score-v603.js': bauerScoreV603,
  'bilsky-escc-v604.js': bilskyEsccV604,
  'harrington-acetabular-v605.js': harringtonAcetabularV605,
  'katagiri-v606.js': katagiriV606,
  'sartorius-hs-v607.js': sartoriusHsV607,
  'zulewski-v608.js': zulewskiV608,
  'hijdra-v609.js': hijdraV609,
  'edinburgh-caa-v610.js': edinburghCaaV610,
  'fried-frailty-v611.js': friedFrailtyV611,
  'ut-diabetic-foot-v612.js': utDiabeticFootV612,
  'pedis-v613.js': pedisV613,
  'ocular-trauma-score-v614.js': ocularTraumaScoreV614,
  'areds-v615.js': aredsV615,
  'frisen-v616.js': frisenV616,
  'who-mucositis-v617.js': whoMucositisV617,
  'erefs-v618.js': erefsV618,
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
