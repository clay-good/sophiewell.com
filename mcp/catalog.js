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
import transfusionV292 from './adapters/transfusion-v292.js';
import fastDementiaV294 from './adapters/fast-dementia-v294.js';
import gdsV295 from './adapters/gds-v295.js';
import benzoEquivV296 from './adapters/benzo-equiv-v296.js';
import nerveInjuryV297 from './adapters/nerve-injury-v297.js';
import concussionRtsV298 from './adapters/concussion-rts-v298.js';
import cosyntropinV299 from './adapters/cosyntropin-v299.js';
import avFistulaV300 from './adapters/av-fistula-v300.js';
import drSeverityV301 from './adapters/dr-severity-v301.js';
import isisV302 from './adapters/isis-v302.js';
import anaphylaxisV303 from './adapters/anaphylaxis-v303.js';
import dstV304 from './adapters/dst-v304.js';
import crsV305 from './adapters/crs-v305.js';
import icansV306 from './adapters/icans-v306.js';
import dmeV307 from './adapters/dme-v307.js';
import concussionRtlV308 from './adapters/concussion-rtl-v308.js';
import gvhdV309 from './adapters/gvhd-v309.js';
import cholangitisV310 from './adapters/cholangitis-v310.js';
import cholecystitisV311 from './adapters/cholecystitis-v311.js';
import cholangitisDxV312 from './adapters/cholangitis-dx-v312.js';
import cholecystitisDxV313 from './adapters/cholecystitis-dx-v313.js';
import deauvilleV314 from './adapters/deauville-v314.js';
import jonesV315 from './adapters/jones-v315.js';
import goldAbeV316 from './adapters/gold-abe-v316.js';
import cdiSeverityV317 from './adapters/cdi-severity-v317.js';
import laEsophagitisV318 from './adapters/la-esophagitis-v318.js';
import ccsAnginaV319 from './adapters/ccs-angina-v319.js';
import clavienDindoV320 from './adapters/clavien-dindo-v320.js';
import hincheyV321 from './adapters/hinchey-v321.js';
import biRadsV322 from './adapters/bi-rads-v322.js';
import siewertV323 from './adapters/siewert-v323.js';
import wexnerV324 from './adapters/wexner-v324.js';
import lungRadsV325 from './adapters/lung-rads-v325.js';
import oRadsV326 from './adapters/o-rads-v326.js';
import liRadsV327 from './adapters/li-rads-v327.js';
import montrealIbdV328 from './adapters/montreal-ibd-v328.js';
import parisClassificationV329 from './adapters/paris-classification-v329.js';
import nottinghamNpiV330 from './adapters/nottingham-npi-v330.js';
import fitzpatrickV331 from './adapters/fitzpatrick-v331.js';
import haggittV332 from './adapters/haggitt-v332.js';
import kikuchiV333 from './adapters/kikuchi-v333.js';
import kudoV334 from './adapters/kudo-v334.js';
import niceV335 from './adapters/nice-v335.js';
import jnetV336 from './adapters/jnet-v336.js';
import outerbridgeV337 from './adapters/outerbridge-v337.js';
import icrsV338 from './adapters/icrs-v338.js';
import cormackLehaneV339 from './adapters/cormack-lehane-v339.js';
import clarkLevelV340 from './adapters/clark-level-v340.js';
import masonRadialHeadV341 from './adapters/mason-radial-head-v341.js';
import hawkinsTalarV342 from './adapters/hawkins-talar-v342.js';
import sandersCalcanealV343 from './adapters/sanders-calcaneal-v343.js';
import ficatArletV344 from './adapters/ficat-arlet-v344.js';
import lichtmanKienbockV345 from './adapters/lichtman-kienbock-v345.js';
import catterallPerthesV346 from './adapters/catterall-perthes-v346.js';
import herringPillarV347 from './adapters/herring-pillar-v347.js';
import strasbergBdiV348 from './adapters/strasberg-bdi-v348.js';
import fazekasV349 from './adapters/fazekas-v349.js';
import tscherneClosedV350 from './adapters/tscherne-closed-v350.js';
import goligherHemorrhoidsV351 from './adapters/goligher-hemorrhoids-v351.js';
import lanskyV352 from './adapters/lansky-v352.js';
import croweDdhV353 from './adapters/crowe-ddh-v353.js';
import tonnisHipOaV354 from './adapters/tonnis-hip-oa-v354.js';
import lachmanAclV355 from './adapters/lachman-acl-v355.js';
import ceapVenousV356 from './adapters/ceap-venous-v356.js';
import nyhaClassV357 from './adapters/nyha-class-v357.js';
import ramsaySedationV358 from './adapters/ramsay-sedation-v358.js';
import pressureInjuryStageV359 from './adapters/pressure-injury-stage-v359.js';
import kwbRetinopathyV360 from './adapters/kwb-retinopathy-v360.js';
import tannerStagingV361 from './adapters/tanner-staging-v361.js';
import forresterHemodynamicV362 from './adapters/forrester-hemodynamic-v362.js';
import shafferAngleV363 from './adapters/shaffer-angle-v363.js';
import casTedV364 from './adapters/cas-ted-v364.js';
import pragueBarrettV365 from './adapters/prague-barrett-v365.js';
import neckZoneV366 from './adapters/neck-zone-v366.js';
import pasSwallowV367 from './adapters/pas-swallow-v367.js';
import rossHfPedsV368 from './adapters/ross-hf-peds-v368.js';
import nohriaStevensonV369 from './adapters/nohria-stevenson-v369.js';
import hartofilakidisDdhV370 from './adapters/hartofilakidis-ddh-v370.js';
import cRadsV371 from './adapters/c-rads-v371.js';
import cadRadsV372 from './adapters/cad-rads-v372.js';
import niRadsV373 from './adapters/ni-rads-v373.js';
import pauwelsFemoralNeckV374 from './adapters/pauwels-femoral-neck-v374.js';
import pipkinFemoralHeadV375 from './adapters/pipkin-femoral-head-v375.js';
import denisSacralV376 from './adapters/denis-sacral-v376.js';
import gartlandSupracondylarV377 from './adapters/gartland-supracondylar-v377.js';
import delbetFemoralNeckV378 from './adapters/delbet-femoral-neck-v378.js';
import tilePelvicV379 from './adapters/tile-pelvic-v379.js';
import youngBurgessV380 from './adapters/young-burgess-v380.js';
import winquistHansenV381 from './adapters/winquist-hansen-v381.js';
import eichenholtzCharcotV382 from './adapters/eichenholtz-charcot-v382.js';
import risserSignV383 from './adapters/risser-sign-v383.js';
import spetzlerPonceV384 from './adapters/spetzler-ponce-v384.js';
import schwabEnglandV385 from './adapters/schwab-england-v385.js';
import piraniClubfootV386 from './adapters/pirani-clubfoot-v386.js';
import dimeglioClubfootV387 from './adapters/dimeglio-clubfoot-v387.js';
import brodskyTonsilV388 from './adapters/brodsky-tonsil-v388.js';
import koosSchwannomaV389 from './adapters/koos-schwannoma-v389.js';
import knospAdenomaV390 from './adapters/knosp-adenoma-v390.js';
import hardyAdenomaV391 from './adapters/hardy-adenoma-v391.js';
import hillFlapValveV392 from './adapters/hill-flap-valve-v392.js';
import laurenGastricV393 from './adapters/lauren-gastric-v393.js';
import borrmannGastricV394 from './adapters/borrmann-gastric-v394.js';
import parksFistulaV395 from './adapters/parks-fistula-v395.js';
import sieversBavV396 from './adapters/sievers-bav-v396.js';
import elKhouryArV397 from './adapters/el-khoury-ar-v397.js';
import carpentierMrV398 from './adapters/carpentier-mr-v398.js';
import bismuthCorletteV399 from './adapters/bismuth-corlette-v399.js';
import nyhusHerniaV400 from './adapters/nyhus-hernia-v400.js';
import zargarCausticV401 from './adapters/zargar-caustic-v401.js';
import laugeHansenV402 from './adapters/lauge-hansen-v402.js';
import berndtHartyV403 from './adapters/berndt-harty-v403.js';
import reganMorreyV404 from './adapters/regan-morrey-v404.js';
import savaryMillerV405 from './adapters/savary-miller-v405.js';
import leFortV406 from './adapters/le-fort-v406.js';
import steinbergAvnV407 from './adapters/steinberg-avn-v407.js';
import meyersMckeeverV408 from './adapters/meyers-mckeever-v408.js';
import idebergGlenoidV409 from './adapters/ideberg-glenoid-v409.js';
import andersonDalonzoV410 from './adapters/anderson-dalonzo-v410.js';
import levineEdwardsV411 from './adapters/levine-edwards-v411.js';
import lisfrancMyersonV412 from './adapters/lisfranc-myerson-v412.js';
import seinsheimerSubtrochV413 from './adapters/seinsheimer-subtroch-v413.js';
import mayfieldPerilunateV414 from './adapters/mayfield-perilunate-v414.js';
import geisslerCarpalV415 from './adapters/geissler-carpal-v415.js';
import russeScaphoidV416 from './adapters/russe-scaphoid-v416.js';
import wasselThumbV417 from './adapters/wassel-thumb-v417.js';
import milchCondyleV418 from './adapters/milch-condyle-v418.js';
import cottonMyerV419 from './adapters/cotton-myer-v419.js';
import friedmanTongueV420 from './adapters/friedman-tongue-v420.js';
import sunAcCellV421 from './adapters/sun-ac-cell-v421.js';
import sunAcFlareV422 from './adapters/sun-ac-flare-v422.js';
import marshOberhuberV423 from './adapters/marsh-oberhuber-v423.js';
import bethesdaThyroidV424 from './adapters/bethesda-thyroid-v424.js';
import vurGradeV425 from './adapters/vur-grade-v425.js';
import gellCoombsV426 from './adapters/gell-coombs-v426.js';
import vaughanWilliamsV427 from './adapters/vaughan-williams-v427.js';
import mrcPowerV428 from './adapters/mrc-power-v428.js';
import sarnatHieV429 from './adapters/sarnat-hie-v429.js';
import papileIvhV430 from './adapters/papile-ivh-v430.js';
import bellNecV431 from './adapters/bell-nec-v431.js';
import badenWalkerV432 from './adapters/baden-walker-v432.js';
import modicChangesV433 from './adapters/modic-changes-v433.js';
import pfirrmannDiscV434 from './adapters/pfirrmann-disc-v434.js';
import vanHerickV435 from './adapters/van-herick-v435.js';
import bifflBcviV436 from './adapters/biffl-bcvi-v436.js';
import goutallierV437 from './adapters/goutallier-v437.js';
import eatonLittlerV438 from './adapters/eaton-littler-v438.js';
import hamadaV439 from './adapters/hamada-v439.js';
import barrowCcfV440 from './adapters/barrow-ccf-v440.js';
import bordenDavfV441 from './adapters/borden-davf-v441.js';
import zabramskiV442 from './adapters/zabramski-v442.js';
import kadishV443 from './adapters/kadish-v443.js';
import mccormickV444 from './adapters/mccormick-v444.js';
import atlantaPancreatitisV445 from './adapters/atlanta-pancreatitis-v445.js';
import ropStageV446 from './adapters/rop-stage-v446.js';
import andersonMontesanoV447 from './adapters/anderson-montesano-v447.js';
import traynelisV448 from './adapters/traynelis-v448.js';
import fieldingHawkinsV449 from './adapters/fielding-hawkins-v449.js';
import reidBronchiectasisV450 from './adapters/reid-bronchiectasis-v450.js';
import sadeRetractionV451 from './adapters/sade-retraction-v451.js';
import brookerV452 from './adapters/brooker-v452.js';
import badoV454 from './adapters/bado-v454.js';
import nunleyVertulloV455 from './adapters/nunley-vertullo-v455.js';
import leddyPackerV456 from './adapters/leddy-packer-v456.js';
import stulbergV457 from './adapters/stulberg-v457.js';
import boydGriffinV458 from './adapters/boyd-griffin-v458.js';
import thompsonEpsteinV459 from './adapters/thompson-epstein-v459.js';
import ennekingV460 from './adapters/enneking-v460.js';
import debakeyV461 from './adapters/debakey-v461.js';
import gmfcsV462 from './adapters/gmfcs-v462.js';
import waldenstromPerthesV463 from './adapters/waldenstrom-perthes-v463.js';
import crawfordTaaaV464 from './adapters/crawford-taaa-v464.js';
import stameyIncontinenceV465 from './adapters/stamey-incontinence-v465.js';
import letournelAcetabulumV466 from './adapters/letournel-acetabulum-v466.js';
import bromageScaleV467 from './adapters/bromage-scale-v467.js';
import brouetCryoglobulinemiaV468 from './adapters/brouet-cryoglobulinemia-v468.js';
import steinbrockerRaV469 from './adapters/steinbrocker-ra-v469.js';
import larsenRaV470 from './adapters/larsen-ra-v470.js';
import gassMacularHoleV471 from './adapters/gass-macular-hole-v471.js';
import yerdelPvtV472 from './adapters/yerdel-pvt-v472.js';
import todaniCholedochalV473 from './adapters/todani-choledochal-v473.js';
import rastelliAvsdV474 from './adapters/rastelli-avsd-v474.js';
import glogauPhotoagingV475 from './adapters/glogau-photoaging-v475.js';
import nashMoeRotationV476 from './adapters/nash-moe-rotation-v476.js';
import sfuHydronephrosisV477 from './adapters/sfu-hydronephrosis-v477.js';
import spauldingClassificationV478 from './adapters/spaulding-classification-v478.js';
import spitzAtresiaV479 from './adapters/spitz-atresia-v479.js';
import ahlbackKneeOaV480 from './adapters/ahlback-knee-oa-v480.js';
import wiltseSpondylolisthesisV481 from './adapters/wiltse-spondylolisthesis-v481.js';
import russellTaylorSubtrochV482 from './adapters/russell-taylor-subtroch-v482.js';
import vancouverPeriprostheticV483 from './adapters/vancouver-periprosthetic-v483.js';
import barrackCementV484 from './adapters/barrack-cement-v484.js';
import dejourTrochleaV485 from './adapters/dejour-trochlea-v485.js';
import samilsonPrietoV486 from './adapters/samilson-prieto-v486.js';
import rockwoodAcV487 from './adapters/rockwood-ac-v487.js';
import biglianiAcromionV488 from './adapters/bigliani-acromion-v488.js';
import fernandezRadiusV489 from './adapters/fernandez-radius-v489.js';
import ruediAllgowerPilonV490 from './adapters/ruedi-allgower-pilon-v490.js';
import severinDdhV491 from './adapters/severin-ddh-v491.js';
import hattrupJohnsonV492 from './adapters/hattrup-johnson-v492.js';
import lownEctopyV493 from './adapters/lown-ectopy-v493.js';
import intermacsProfileV494 from './adapters/intermacs-profile-v494.js';
import ranawatMyelopathyV495 from './adapters/ranawat-myelopathy-v495.js';
import lodwickGradeV496 from './adapters/lodwick-grade-v496.js';
import schobingerAvmV497 from './adapters/schobinger-avm-v497.js';
import narakasObppV498 from './adapters/narakas-obpp-v498.js';
import dorrFemurV499 from './adapters/dorr-femur-v499.js';
import tegnerActivityV500 from './adapters/tegner-activity-v500.js';
import ludwigHairlossV501 from './adapters/ludwig-hairloss-v501.js';
import norwoodHairlossV502 from './adapters/norwood-hairloss-v502.js';
import simpsonMeningiomaV503 from './adapters/simpson-meningioma-v503.js';
import tbTesting from './adapters/tb-testing.js';
import labInterpret from './adapters/lab-interpret.js';
import decisionRulesV258 from './adapters/decision-rules-v258.js';
import pneumoniaRiskV260 from './adapters/pneumonia-risk-v260.js';
import acuteAbdomenV261 from './adapters/acute-abdomen-v261.js';
import pediatricAcuteV262 from './adapters/pediatric-acute-v262.js';
import respiratoryMaternalV263 from './adapters/respiratory-maternal-v263.js';
import massiveTransfusionV265 from './adapters/massive-transfusion-v265.js';
import rccPrognosisV266 from './adapters/rcc-prognosis-v266.js';

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
  ['transfusion-v292', transfusionV292],
  ['fast-dementia-v294', fastDementiaV294],
  ['gds-v295', gdsV295],
  ['benzo-equiv-v296', benzoEquivV296],
  ['nerve-injury-v297', nerveInjuryV297],
  ['concussion-rts-v298', concussionRtsV298],
  ['cosyntropin-v299', cosyntropinV299],
  ['av-fistula-v300', avFistulaV300],
  ['dr-severity-v301', drSeverityV301],
  ['isis-v302', isisV302],
  ['anaphylaxis-v303', anaphylaxisV303],
  ['dst-v304', dstV304],
  ['crs-v305', crsV305],
  ['icans-v306', icansV306],
  ['dme-v307', dmeV307],
  ['concussion-rtl-v308', concussionRtlV308],
  ['gvhd-v309', gvhdV309],
  ['cholangitis-v310', cholangitisV310],
  ['cholecystitis-v311', cholecystitisV311],
  ['cholangitis-dx-v312', cholangitisDxV312],
  ['cholecystitis-dx-v313', cholecystitisDxV313],
  ['deauville-v314', deauvilleV314],
  ['jones-v315', jonesV315],
  ['gold-abe-v316', goldAbeV316],
  ['cdi-severity-v317', cdiSeverityV317],
  ['la-esophagitis-v318', laEsophagitisV318],
  ['ccs-angina-v319', ccsAnginaV319],
  ['clavien-dindo-v320', clavienDindoV320],
  ['hinchey-v321', hincheyV321],
  ['bi-rads-v322', biRadsV322],
  ['siewert-v323', siewertV323],
  ['wexner-v324', wexnerV324],
  ['lung-rads-v325', lungRadsV325],
  ['o-rads-v326', oRadsV326],
  ['li-rads-v327', liRadsV327],
  ['montreal-ibd-v328', montrealIbdV328],
  ['paris-classification-v329', parisClassificationV329],
  ['nottingham-npi-v330', nottinghamNpiV330],
  ['fitzpatrick-v331', fitzpatrickV331],
  ['haggitt-v332', haggittV332],
  ['kikuchi-v333', kikuchiV333],
  ['kudo-v334', kudoV334],
  ['nice-v335', niceV335],
  ['jnet-v336', jnetV336],
  ['outerbridge-v337', outerbridgeV337],
  ['icrs-v338', icrsV338],
  ['cormack-lehane-v339', cormackLehaneV339],
  ['clark-level-v340', clarkLevelV340],
  ['mason-radial-head-v341', masonRadialHeadV341],
  ['hawkins-talar-v342', hawkinsTalarV342],
  ['sanders-calcaneal-v343', sandersCalcanealV343],
  ['ficat-arlet-v344', ficatArletV344],
  ['lichtman-kienbock-v345', lichtmanKienbockV345],
  ['catterall-perthes-v346', catterallPerthesV346],
  ['herring-pillar-v347', herringPillarV347],
  ['strasberg-bdi-v348', strasbergBdiV348],
  ['fazekas-v349', fazekasV349],
  ['tscherne-closed-v350', tscherneClosedV350],
  ['goligher-hemorrhoids-v351', goligherHemorrhoidsV351],
  ['lansky-v352', lanskyV352],
  ['crowe-ddh-v353', croweDdhV353],
  ['tonnis-hip-oa-v354', tonnisHipOaV354],
  ['lachman-acl-v355', lachmanAclV355],
  ['ceap-venous-v356', ceapVenousV356],
  ['nyha-class-v357', nyhaClassV357],
  ['ramsay-sedation-v358', ramsaySedationV358],
  ['pressure-injury-stage-v359', pressureInjuryStageV359],
  ['kwb-retinopathy-v360', kwbRetinopathyV360],
  ['tanner-staging-v361', tannerStagingV361],
  ['forrester-hemodynamic-v362', forresterHemodynamicV362],
  ['shaffer-angle-v363', shafferAngleV363],
  ['cas-ted-v364', casTedV364],
  ['prague-barrett-v365', pragueBarrettV365],
  ['neck-zone-v366', neckZoneV366],
  ['pas-swallow-v367', pasSwallowV367],
  ['ross-hf-peds-v368', rossHfPedsV368],
  ['nohria-stevenson-v369', nohriaStevensonV369],
  ['hartofilakidis-ddh-v370', hartofilakidisDdhV370],
  ['c-rads-v371', cRadsV371],
  ['cad-rads-v372', cadRadsV372],
  ['ni-rads-v373', niRadsV373],
  ['pauwels-femoral-neck-v374', pauwelsFemoralNeckV374],
  ['pipkin-femoral-head-v375', pipkinFemoralHeadV375],
  ['denis-sacral-v376', denisSacralV376],
  ['gartland-supracondylar-v377', gartlandSupracondylarV377],
  ['delbet-femoral-neck-v378', delbetFemoralNeckV378],
  ['tile-pelvic-v379', tilePelvicV379],
  ['young-burgess-v380', youngBurgessV380],
  ['winquist-hansen-v381', winquistHansenV381],
  ['eichenholtz-charcot-v382', eichenholtzCharcotV382],
  ['risser-sign-v383', risserSignV383],
  ['spetzler-ponce-v384', spetzlerPonceV384],
  ['schwab-england-v385', schwabEnglandV385],
  ['pirani-clubfoot-v386', piraniClubfootV386],
  ['dimeglio-clubfoot-v387', dimeglioClubfootV387],
  ['brodsky-tonsil-v388', brodskyTonsilV388],
  ['koos-schwannoma-v389', koosSchwannomaV389],
  ['knosp-adenoma-v390', knospAdenomaV390],
  ['hardy-adenoma-v391', hardyAdenomaV391],
  ['hill-flap-valve-v392', hillFlapValveV392],
  ['lauren-gastric-v393', laurenGastricV393],
  ['borrmann-gastric-v394', borrmannGastricV394],
  ['parks-fistula-v395', parksFistulaV395],
  ['sievers-bav-v396', sieversBavV396],
  ['el-khoury-ar-v397', elKhouryArV397],
  ['carpentier-mr-v398', carpentierMrV398],
  ['bismuth-corlette-v399', bismuthCorletteV399],
  ['nyhus-hernia-v400', nyhusHerniaV400],
  ['zargar-caustic-v401', zargarCausticV401],
  ['lauge-hansen-v402', laugeHansenV402],
  ['berndt-harty-v403', berndtHartyV403],
  ['regan-morrey-v404', reganMorreyV404],
  ['savary-miller-v405', savaryMillerV405],
  ['le-fort-v406', leFortV406],
  ['steinberg-avn-v407', steinbergAvnV407],
  ['meyers-mckeever-v408', meyersMckeeverV408],
  ['ideberg-glenoid-v409', idebergGlenoidV409],
  ['anderson-dalonzo-v410', andersonDalonzoV410],
  ['levine-edwards-v411', levineEdwardsV411],
  ['lisfranc-myerson-v412', lisfrancMyersonV412],
  ['seinsheimer-subtroch-v413', seinsheimerSubtrochV413],
  ['mayfield-perilunate-v414', mayfieldPerilunateV414],
  ['geissler-carpal-v415', geisslerCarpalV415],
  ['russe-scaphoid-v416', russeScaphoidV416],
  ['wassel-thumb-v417', wasselThumbV417],
  ['milch-condyle-v418', milchCondyleV418],
  ['cotton-myer-v419', cottonMyerV419],
  ['friedman-tongue-v420', friedmanTongueV420],
  ['sun-ac-cell-v421', sunAcCellV421],
  ['sun-ac-flare-v422', sunAcFlareV422],
  ['marsh-oberhuber-v423', marshOberhuberV423],
  ['bethesda-thyroid-v424', bethesdaThyroidV424],
  ['vur-grade-v425', vurGradeV425],
  ['gell-coombs-v426', gellCoombsV426],
  ['vaughan-williams-v427', vaughanWilliamsV427],
  ['mrc-power-v428', mrcPowerV428],
  ['sarnat-hie-v429', sarnatHieV429],
  ['papile-ivh-v430', papileIvhV430],
  ['bell-nec-v431', bellNecV431],
  ['baden-walker-v432', badenWalkerV432],
  ['modic-changes-v433', modicChangesV433],
  ['pfirrmann-disc-v434', pfirrmannDiscV434],
  ['van-herick-v435', vanHerickV435],
  ['biffl-bcvi-v436', bifflBcviV436],
  ['goutallier-v437', goutallierV437],
  ['eaton-littler-v438', eatonLittlerV438],
  ['hamada-v439', hamadaV439],
  ['barrow-ccf-v440', barrowCcfV440],
  ['borden-davf-v441', bordenDavfV441],
  ['zabramski-v442', zabramskiV442],
  ['kadish-v443', kadishV443],
  ['mccormick-v444', mccormickV444],
  ['atlanta-pancreatitis-v445', atlantaPancreatitisV445],
  ['rop-stage-v446', ropStageV446],
  ['anderson-montesano-v447', andersonMontesanoV447],
  ['traynelis-v448', traynelisV448],
  ['fielding-hawkins-v449', fieldingHawkinsV449],
  ['reid-bronchiectasis-v450', reidBronchiectasisV450],
  ['sade-retraction-v451', sadeRetractionV451],
  ['brooker-v452', brookerV452],
  ['bado-v454', badoV454],
  ['nunley-vertullo-v455', nunleyVertulloV455],
  ['leddy-packer-v456', leddyPackerV456],
  ['stulberg-v457', stulbergV457],
  ['boyd-griffin-v458', boydGriffinV458],
  ['thompson-epstein-v459', thompsonEpsteinV459],
  ['enneking-v460', ennekingV460],
  ['debakey-v461', debakeyV461],
  ['gmfcs-v462', gmfcsV462],
  ['waldenstrom-perthes-v463', waldenstromPerthesV463],
  ['crawford-taaa-v464', crawfordTaaaV464],
  ['stamey-incontinence-v465', stameyIncontinenceV465],
  ['letournel-acetabulum-v466', letournelAcetabulumV466],
  ['bromage-scale-v467', bromageScaleV467],
  ['brouet-cryoglobulinemia-v468', brouetCryoglobulinemiaV468],
  ['steinbrocker-ra-v469', steinbrockerRaV469],
  ['larsen-ra-v470', larsenRaV470],
  ['gass-macular-hole-v471', gassMacularHoleV471],
  ['yerdel-pvt-v472', yerdelPvtV472],
  ['todani-choledochal-v473', todaniCholedochalV473],
  ['rastelli-avsd-v474', rastelliAvsdV474],
  ['glogau-photoaging-v475', glogauPhotoagingV475],
  ['nash-moe-rotation-v476', nashMoeRotationV476],
  ['sfu-hydronephrosis-v477', sfuHydronephrosisV477],
  ['spaulding-classification-v478', spauldingClassificationV478],
  ['spitz-atresia-v479', spitzAtresiaV479],
  ['ahlback-knee-oa-v480', ahlbackKneeOaV480],
  ['wiltse-spondylolisthesis-v481', wiltseSpondylolisthesisV481],
  ['russell-taylor-subtroch-v482', russellTaylorSubtrochV482],
  ['vancouver-periprosthetic-v483', vancouverPeriprostheticV483],
  ['barrack-cement-v484', barrackCementV484],
  ['dejour-trochlea-v485', dejourTrochleaV485],
  ['samilson-prieto-v486', samilsonPrietoV486],
  ['rockwood-ac-v487', rockwoodAcV487],
  ['bigliani-acromion-v488', biglianiAcromionV488],
  ['fernandez-radius-v489', fernandezRadiusV489],
  ['ruedi-allgower-pilon-v490', ruediAllgowerPilonV490],
  ['severin-ddh-v491', severinDdhV491],
  ['hattrup-johnson-v492', hattrupJohnsonV492],
  ['lown-ectopy-v493', lownEctopyV493],
  ['intermacs-profile-v494', intermacsProfileV494],
  ['ranawat-myelopathy-v495', ranawatMyelopathyV495],
  ['lodwick-grade-v496', lodwickGradeV496],
  ['schobinger-avm-v497', schobingerAvmV497],
  ['narakas-obpp-v498', narakasObppV498],
  ['dorr-femur-v499', dorrFemurV499],
  ['tegner-activity-v500', tegnerActivityV500],
  ['ludwig-hairloss-v501', ludwigHairlossV501],
  ['norwood-hairloss-v502', norwoodHairlossV502],
  ['simpson-meningioma-v503', simpsonMeningiomaV503],
  ['tb-testing', tbTesting],
  ['lab-interpret', labInterpret],
  ['decision-rules-v258', decisionRulesV258],
  ['pneumonia-risk-v260', pneumoniaRiskV260],
  ['acute-abdomen-v261', acuteAbdomenV261],
  ['pediatric-acute-v262', pediatricAcuteV262],
  ['respiratory-maternal-v263', respiratoryMaternalV263],
  ['massive-transfusion-v265', massiveTransfusionV265],
  ['rcc-prognosis-v266', rccPrognosisV266],
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
