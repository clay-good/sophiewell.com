// Search-relevance golden set. Runs 190 realistic clinical queries through the
// real find_calculator surface (shared resolvePromptRanked + data/synonyms.json
// + data/search-corpus over the exposed registry) and asserts an acceptable
// tile ranks in the top 3. This pins the routing quality spec-v282 shipped:
// a synonym-table edit, a corpus-builder change, or ranker work (the deferred
// IDF/BM25-lite slice) must keep every probe green -- this file is the gate a
// future ranker change has to pass before it can land.
//
// Curation rules:
//   - every probe was vetted to pass at authoring time (no aspirational rows);
//   - `want` lists ALL clinically acceptable answers, not just one favorite
//     (e.g. any of the three pancreatitis severity tiles is a correct route);
//   - keep probes phrased the way a nurse would type them, not tile names.
//
// No recorded ranking limitations remain: the earlier "heprin drip",
// "wels criteria pe", two-intent, and derivational-fold gaps are all fixed
// and probed below (derivational folding is a REVIEWED pair table in
// lib/prompt.js, not a suffix rule -- extend it only with a probe).
// The former catalog gap ("when should i transfuse for anemia" had no right
// answer) is now closed: spec-v292 shipped the transfusion-threshold tile
// (AABB 2023 restrictive threshold), exposed it as an MCP adapter, and the
// probe below pins the route.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findCalculator } from '../../mcp/tools.js';

const TOP_N = 3;

// [query, acceptable tile ids (any-of)]
const PROBES = [
  // marquee synonym routes (canaries pinning the synonym table)
  ['stroke risk afib', ['chads']],
  ['creatinine clearance', ['egfr']],
  ['kidney function', ['egfr']],
  ['corrected qt', ['qtc']],
  ['body mass index', ['bmi']],
  // prose / corpus-driven routes
  ['pneumonia severity outpatient or admit', ['curb-65', 'psi']],
  ['alcohol withdrawal severity', ['ciwa']],
  ['opioid withdrawal score', ['cows']],
  ['sepsis screen bedside', ['qsofa-sofa', 'news2', 'sirs']],
  ['pulmonary embolism pretest probability', ['wells-pe', 'wells-pe-geneva', 'years-pe', '4peps']],
  ['rule out pe without imaging', ['perc']],
  ['dvt probability leg swelling', ['wells-dvt']],
  ['gi bleed risk score', ['glasgow-blatchford', 'rockall', 'aims65']],
  ['upper gi bleed mortality', ['aims65', 'rockall']],
  ['pancreatitis severity', ['ranson-bisap', 'glasgow-imrie', 'ctsi-balthazar']],
  ['cirrhosis severity class', ['meld-childpugh']],
  ['afib bleeding risk', ['hasbled', 'orbit-bleeding']],
  ['afib anticoagulation decision', ['chads']],
  ['chest pain low risk discharge', ['heart', 'heart-pathway', 'edacs']],
  ['appendicitis score child', ['alvarado-pas', 'pas']],
  ['head ct after minor head injury', ['canadian-ct-head', 'pecarn', 'nexus-head']],
  ['c spine imaging decision', ['ccsr', 'pecarn-cspine']],
  ['ankle xray needed', ['ottawa-ankle']],
  ['stroke severity scale', ['nihss']],
  ['tia stroke risk after tia', ['abcd2']],
  ['coma scale eye verbal motor', ['gcs']],
  ['delirium screen icu', ['cam-icu']],
  ['sedation depth scale', ['rass', 'sas-riker']],
  ['pressure ulcer risk', ['braden']],
  ['fall risk inpatient', ['morse-falls', 'hendrich-ii', 'stratify']],
  ['iv infiltration grading', ['vip-extravasation']],
  ['free water deficit hypernatremia', ['free-water-deficit']],
  ['sodium correction rate hyponatremia', ['sodium-correction']],
  ['anion gap acidosis', ['anion-gap']],
  ['corrected calcium albumin', ['corrected-calcium']],
  ['ideal body weight devine', ['bw-bsa-suite']],
  ['body surface area chemo dosing', ['bsa']],
  ['maintenance fluids 4 2 1', ['maint-fluids']],
  ['heparin drip protocol aptt', ['heparin-nomogram']],
  ['aminoglycoside dosing', ['aminoglycoside']],
  ['insulin sliding scale correction', ['insulin-correction']],
  ['blood transfusion volume child', ['peds-transfusion-volume']],
  ['burn fluid resuscitation parkland', ['burn-fluid']],
  ['burn surface area rule of nines', ['bsa_burn']],
  ['endotracheal tube size child', ['peds-ett']],
  ['apgar newborn', ['apgar']],
  ['gestational age due date', ['due-date', 'ballard']],
  ['bishop cervix induction', ['bishop']],
  ['postpartum hemorrhage risk', ['qbl-pph', 'pph-stage']],
  ['fentanyl to morphine conversion', ['opioid-conversion']],
  ['steroid conversion prednisone', ['steroid-equiv']],
  ['warfarin dose inr adjustment', ['warfarin-gage', 'warfarin-iwpc']],
  ['ascvd 10 year risk statin', ['ascvd']],
  ['osteoporosis fracture screen', ['osteoporosis-prescreen']],
  ['dka anion gap closure', ['dka-hhs', 'dka-gap', 'anion-gap']],
  ['aki staging creatinine', ['kdigo-aki']],
  ['ards oxygenation severity', ['pf-ratio', 'oxygenation-index']],
  ['ventilator tidal volume ideal body weight', ['pbw-ardsnet']],
  ['rsbi wean vent', ['rsbi']],
  // question-phrased probes (unlocked by the scaffold-strip + plural fold,
  // plain-language-search 3.2/3.3): scaffolding tokens must not drown the
  // clinical terms, and bare plurals must fold.
  ['what is the score for pneumonia severity', ['curb-65', 'psi']],
  ['how do i correct sodium for high glucose', ['corrected-sodium', 'corrected-ca-na']],
  ['should i get a head ct for minor head injury', ['canadian-ct-head', 'nexus-head', 'pecarn-head', 'catch-head', 'chalice']],
  ['what fluids does a burn patient need', ['burn-fluid']],
  ['how do i figure out the anion gap', ['anion-gap']],
  ['what is my patients stroke risk with afib', ['chads']],
  ['how much maintenance fluid for a child', ['maint-fluids']],
  ['what is the target tidal volume on the vent', ['pbw-ardsnet']],
  ['how do i stage this pressure injury', ['npiap-staging', 'braden', 'braden-q']],
  // typo probes (unlocked by the D5 tile-vocabulary repair, task 3.4): one
  // misspelled clinical term must recover even when the tile has no synonym
  // entry, without displacing strong literal readings.
  ['glascow coma scale', ['gcs']],
  ['bradan scale', ['braden', 'braden-q']],
  ['cockroft gault', ['cockcroft-gault', 'egfr-suite']],
  ['anion gapp', ['anion-gap']],
  ['corected calcium', ['corrected-calcium', 'corrected-ca-na']],
  ['morse fals', ['morse-falls']],
  ['apgarr', ['apgar']],
  // former recorded limitations, fixed by the sub-point IDF slice: the
  // rare-repair gate lets "wels" -> "wells" lead a weak literal reading,
  // and the synonym-edit rescue (no longer starved by the zero-results
  // gate) recovers "heprin drip" via the v12 "heparin drip" phrase.
  ['wels criteria pe', ['wells-pe', 'wells-pe-geneva']],
  ['heprin drip', ['heparin-nomogram']],
  // former recorded limitation, fixed by the tier-3 coverage tie-break:
  // the phrase covering more of a two-intent query wins, so the bleeding
  // question dominates the incidental "atrial fibrillation".
  ['anticoagulation bleeding risk atrial fibrillation', ['hasbled', 'orbit-bleeding']],
  // derivational pair folds (reviewed table, spec-v290): the verb form a
  // nurse types matches the noun-form tile.
  ['intubate this patient', ['intubation-difficulty-scale', 'macocha', 'wilson-airway']],
  ['dialyze for toxic alcohol', ['toxic-alcohol']],
  // v13 synonym batch (spec-v291): gaps a wide cross-domain probe sweep
  // surfaced where the tile existed but the query mis-routed.
  ['serum osmolality calculation', ['osmolal-gap']],
  ['acute kidney injury staging', ['kdigo-aki']],
  ['heparin induced thrombocytopenia 4t', ['four-ts']],
  ['gestational diabetes screen', ['iadpsg', 'carpenter-coustan']],
  ['metabolic acidosis compensation', ['winters']],
  // spec-v292: the former catalog gap, now a shipped tile + MCP adapter.
  ['when should i transfuse for anemia', ['transfusion-threshold']],
  // v14 synonym batch (spec-v293): gaps a second cross-domain probe sweep
  // (periop, ID, GI, endocrine, nursing-lines domains) surfaced where the
  // tile existed but the nurse phrasing mis-routed.
  ['post op nausea risk', ['apfel', 'koivuranta-ponv']],
  ['pre op cardiac risk', ['rcri', 'gupta-mica', 'goldman-cardiac-risk']],
  ['cellulitis vs nec fasc', ['lrinec']],
  ['phlebitis scale', ['vip-extravasation']],
  ['c diff severity', ['atlas-cdi']],
  ['insulin sliding scale', ['insulin-correction']],
  // spec-v294 tile, exposed to MCP in wave 119: FAST dementia staging (the
  // catalog gap the v14 sweep noted, now a shipped + MCP-exposed tile).
  ['fast dementia staging', ['fast-dementia']],
  // spec-v295 tile, exposed to MCP in wave 120: the Reisberg GDS.
  ['global deterioration scale', ['global-deterioration-scale']],
  // spec-v296 tile, exposed to MCP in wave 121: benzodiazepine equivalence.
  ['benzodiazepine equivalence', ['benzodiazepine-equivalence']],
  // spec-v297 tile, exposed to MCP in wave 122: Seddon-Sunderland nerve injury.
  ['seddon sunderland', ['seddon-sunderland']],
  // spec-v298 tile, exposed to MCP in wave 123: graduated return-to-sport.
  ['concussion return to sport', ['concussion-rts']],
  // spec-v299 tile, exposed to MCP in wave 124: cosyntropin stimulation test.
  ['cosyntropin stimulation test', ['cosyntropin-stim']],
  // spec-v300 tile, exposed to MCP in wave 125: AVF maturation rule of 6s.
  ['fistula maturation rule of 6s', ['avf-rule-of-6s']],
  // SESSION-40 fresh-domain sweep (sleep, uro, ENT, OB, psych, tox, endo): the
  // search already routes these marquee cross-domain queries into the top 3 --
  // these rows pin those verified routes so a future corpus/ranker change can't
  // silently regress them. (The same sweep surfaced un-forced CATALOG gaps with
  // no tile to route to: diabetic-retinopathy grading, Young Mania Rating Scale,
  // anaphylaxis grading, hypoglycemia-risk, shoulder-instability.)
  ['epworth sleepiness scale', ['epworth']],
  ['stop bang sleep apnea', ['stop-bang']],
  ['prostate symptom score', ['ipss']],
  ['cervical dilation labor', ['bishop']],
  ['suicide risk assessment', ['cssrs']],
  ['sore throat antibiotic score', ['mcisaac', 'centor', 'feverpain']],
  ['dizziness vertigo score', ['dhi']],
  ['dic score', ['isth-dic', 'jaam-dic']],
  ['preeclampsia severity', ['acog-severe-pre']],
  ['thyroid storm score', ['burch-wartofsky']],
  ['testicular torsion score', ['twist-score']],
  ['acetaminophen overdose nomogram', ['acetaminophen-nomogram']],
  ['penicillin allergy risk', ['pen-fast']],
  ['salicylate toxicity', ['salicylate-toxicity']],
  ['kidney stone passage prediction', ['stone-score', 'guys-stone-score']],
  // spec-v301 tile, exposed to MCP in wave 126: diabetic retinopathy severity.
  ['diabetic retinopathy severity', ['icdr-retinopathy']],
  // spec-v302 tile, exposed to MCP in wave 127: shoulder instability severity index.
  ['shoulder instability recurrence risk', ['isis-shoulder']],
  // spec-v303 tile, exposed to MCP in wave 128: Ring & Messmer anaphylaxis grade.
  ['anaphylaxis severity grading', ['anaphylaxis-grade']],
  // SESSION-40 second sweep: "thyroid nodule malignancy risk" was mis-routing to
  // brock-nodule (a LUNG nodule score); the v25 synonym batch routes it to the
  // thyroid TI-RADS tile. This pins the fix.
  ['thyroid nodule malignancy risk', ['acr-tirads']],
  // spec-v304 tile, exposed to MCP in wave 129: 1-mg overnight DST.
  ['cushing screening', ['dexamethasone-suppression']],
  // spec-v305 tile, exposed to MCP in wave 130: ASTCT CRS grading.
  ['cytokine release syndrome grade', ['crs-grade']],
  // spec-v306 tile, exposed to MCP in wave 131: ASTCT ICANS grading.
  ['car t neurotoxicity grade', ['icans-grade']],
  // spec-v307 tile, exposed to MCP in wave 132: diabetic macular edema severity.
  ['diabetic macular edema severity', ['dme-severity']],
  // spec-v308 tile, exposed to MCP in wave 133: graduated return-to-learn.
  ['return to learn concussion', ['concussion-rtl']],
  // spec-v309 tile, exposed to MCP in wave 134: acute GVHD grade.
  ['graft versus host disease grading', ['gvhd-grade']],
  // spec-v310 tile, exposed to MCP in wave 135: acute cholangitis severity.
  ['acute cholangitis severity', ['cholangitis-severity']],
  // spec-v311 tile, exposed to MCP in wave 136: acute cholecystitis severity.
  ['acute cholecystitis severity', ['cholecystitis-severity']],
  // spec-v312 tile, exposed to MCP in wave 137: acute cholangitis diagnosis.
  ['acute cholangitis diagnosis', ['cholangitis-diagnosis']],
  // spec-v313 tile, exposed to MCP in wave 138: acute cholecystitis diagnosis.
  ['acute cholecystitis diagnosis', ['cholecystitis-diagnosis']],
  // spec-v314 tile, exposed to MCP in wave 139: Deauville 5-point PET score.
  ['deauville score', ['deauville-score']],
  // spec-v315 tile, exposed to MCP in wave 140: 2015 revised Jones criteria (ARF).
  ['acute rheumatic fever', ['jones-criteria']],
  // spec-v316 tile, exposed to MCP in wave 141: GOLD ABE assessment (COPD group A/B/E).
  ['copd group', ['gold-abe']],
  // spec-v317 tile, exposed to MCP in wave 142: CDI severity classification (IDSA/SHEA).
  ['clostridioides difficile severity', ['cdi-severity']],
  // spec-v318 tile, exposed to MCP in wave 143: LA classification of erosive esophagitis.
  ['erosive esophagitis grade', ['la-esophagitis']],
  // spec-v319 tile, exposed to MCP in wave 144: CCS angina grade.
  ['ccs angina', ['ccs-angina']],
  // spec-v320 tile, exposed to MCP in wave 145: Clavien-Dindo surgical-complication grade.
  ['clavien dindo', ['clavien-dindo']],
  // spec-v321 tile, exposed to MCP in wave 146: Hinchey classification of diverticulitis.
  ['diverticulitis stage', ['hinchey']],
  // spec-v322 tile, exposed to MCP in wave 147: ACR BI-RADS assessment categories.
  ['breast imaging category', ['bi-rads']],
  // spec-v323 tile, exposed to MCP in wave 148: Siewert classification of GEJ adenocarcinoma.
  ['esophagogastric junction adenocarcinoma', ['siewert']],
  // spec-v324 tile, exposed to MCP in wave 149: Wexner fecal incontinence score.
  ['fecal incontinence score', ['wexner']],
  // spec-v325 tile, exposed to MCP in wave 150: ACR Lung-RADS v2022 categories.
  ['lung screening category', ['lung-rads']],
  // spec-v326 tile, exposed to MCP in wave 151: ACR O-RADS US v2022 risk categories.
  ['ovarian mass risk category', ['o-rads']],
  // spec-v327 tile, exposed to MCP in wave 152: ACR LI-RADS v2018 CT/MRI categories.
  ['liver imaging category', ['li-rads']],
  // spec-v328 tile, exposed to MCP in wave 153: Montreal classification of IBD.
  ['crohn phenotype', ['montreal-ibd']],
  // spec-v329 tile, exposed to MCP in wave 154: Paris endoscopic classification.
  ['polyp morphology', ['paris-classification']],
  // spec-v330 tile, exposed to MCP in wave 155: Nottingham Prognostic Index (breast cancer).
  ['nottingham prognostic index', ['nottingham-prognostic-index']],
  // spec-v331 tile, exposed to MCP in wave 156: Fitzpatrick skin phototype.
  ['skin phototype', ['fitzpatrick-skin-type']],
  // spec-v332 tile, exposed to MCP in wave 157: Haggitt classification (malignant colorectal polyp).
  ['malignant polyp invasion level', ['haggitt-level']],
  // spec-v333 tile, exposed to MCP in wave 158: Kikuchi classification (sessile submucosal invasion).
  ['submucosal invasion depth', ['kikuchi-level']],
  // spec-v334 tile, exposed to MCP in wave 159: Kudo pit-pattern classification.
  ['pit pattern classification', ['kudo-pit-pattern']],
  // spec-v335 tile, exposed to MCP in wave 160: NICE classification (NBI colorectal lesion).
  ['nbi polyp classification', ['nice-classification']],
  // spec-v336 tile, exposed to MCP in wave 161: JNET classification (magnifying NBI colorectal).
  ['japan nbi expert team', ['jnet-classification']],
  // spec-v337 tile, exposed to MCP in wave 162: Outerbridge cartilage classification.
  ['chondromalacia cartilage grade', ['outerbridge-cartilage']],
  // spec-v338 tile, exposed to MCP in wave 163: ICRS cartilage lesion classification.
  ['international cartilage repair society grade', ['icrs-cartilage']],
  // spec-v339 tile, exposed to MCP in wave 164: Cormack-Lehane laryngoscopy grade.
  ['laryngoscopy view grade', ['cormack-lehane']],
  // spec-v340 tile, exposed to MCP in wave 165: Clark level (melanoma invasion).
  ['melanoma invasion level', ['clark-level']],
  // spec-v341 tile, exposed to MCP in wave 166: Mason-Johnston radial head fracture classification.
  ['radial head fracture type', ['mason-radial-head']],
  // spec-v342 tile, exposed to MCP in wave 167: Hawkins classification (talar neck fracture).
  ['talar neck fracture type', ['hawkins-talar']],
  // spec-v343 tile, exposed to MCP in wave 168: Sanders classification (calcaneal fracture).
  ['calcaneal fracture type', ['sanders-calcaneal']],
  // spec-v344 tile, exposed to MCP in wave 169: Ficat-Arlet staging (femoral head AVN).
  ['avascular necrosis staging hip', ['ficat-arlet']],
  // spec-v345 tile, exposed to MCP in wave 170: Lichtman staging (Kienbock disease).
  ['kienbock disease stage', ['lichtman-kienbock']],
  // spec-v346 tile, exposed to MCP in wave 171: Catterall classification (Legg-Calve-Perthes).
  ['perthes disease group', ['catterall-perthes']],
  // spec-v347 tile, exposed to MCP in wave 172: Herring lateral pillar classification (Perthes).
  ['lateral pillar perthes', ['herring-pillar']],
  // spec-v348 tile, exposed to MCP in wave 173: Strasberg classification (bile duct injury).
  ['bile duct injury type', ['strasberg-bdi']],
  // spec-v349 tile, exposed to MCP in wave 174: Fazekas scale (white matter hyperintensities).
  ['white matter hyperintensity grade', ['fazekas-wmh']],
  // spec-v350 tile, exposed to MCP in wave 175: Tscherne classification (closed-fracture soft tissue).
  ['closed fracture soft tissue grade', ['tscherne-closed']],
  // spec-v351 tile, exposed to MCP in wave 176: Goligher classification (internal hemorrhoids).
  ['internal hemorrhoid grade', ['goligher-hemorrhoids']],
  // spec-v352 tile, exposed to MCP in wave 177: Lansky Play-Performance Scale (pediatric).
  ['pediatric performance status', ['lansky']],
  // spec-v353 tile, exposed to MCP in wave 178: Crowe classification (hip dysplasia).
  ['hip dysplasia grade', ['crowe-ddh']],
  // spec-v354 tile, exposed to MCP in wave 179: Tonnis classification (hip osteoarthritis).
  ['hip osteoarthritis grade', ['tonnis-hip-oa']],
  // spec-v355 tile, exposed to MCP in wave 180: Lachman test grade (ACL laxity).
  ['acl laxity grade', ['lachman-acl']],
  // spec-v356 tile, exposed to MCP in wave 181: CEAP classification (chronic venous disease).
  ['chronic venous disease class', ['ceap-venous']],
  // spec-v357 tile, exposed to MCP in wave 182: NYHA functional classification (heart failure).
  ['heart failure functional class', ['nyha-class']],
  // spec-v358 tile, exposed to MCP in wave 183: Ramsay Sedation Scale.
  ['ramsay sedation scale', ['ramsay-sedation']],
  // spec-v359 tile, exposed to MCP in wave 184: NPIAP pressure injury staging.
  ['pressure injury stage', ['pressure-injury-stage']],
  // spec-v360 tile, exposed to MCP in wave 185: Keith-Wagener-Barker hypertensive retinopathy.
  ['hypertensive retinopathy grade', ['kwb-retinopathy']],
  // spec-v361 tile, exposed to MCP in wave 186: Tanner staging (Sexual Maturity Rating).
  ['sexual maturity rating', ['tanner-staging']],
  // spec-v362 tile, exposed to MCP in wave 187: Forrester hemodynamic classification.
  ['hemodynamic subset', ['forrester-hemodynamic']],
  // spec-v363 tile, exposed to MCP in wave 188: Shaffer gonioscopy angle grade.
  ['gonioscopy angle grade', ['shaffer-angle']],
  // spec-v364 tile, exposed to MCP in wave 189: Clinical Activity Score (thyroid eye disease).
  ['thyroid eye disease activity', ['cas-ted']],
  // spec-v365 tile, exposed to MCP in wave 190: Prague C&M criteria (Barrett esophagus).
  ['barrett esophagus length', ['prague-barrett']],
  // spec-v366 tile, exposed to MCP in wave 191: penetrating-neck-trauma zones.
  ['penetrating neck trauma zone', ['neck-zone']],
  // spec-v367 tile, exposed to MCP in wave 192: Penetration-Aspiration Scale.
  ['penetration aspiration scale', ['pas-swallow']],
  // spec-v368 tile, exposed to MCP in wave 193: Ross classification (pediatric heart failure).
  ['pediatric heart failure class', ['ross-hf-peds']],
  // spec-v369 tile, exposed to MCP in wave 194: Nohria-Stevenson profiles (acute heart failure).
  ['hemodynamic profile heart failure', ['nohria-stevenson']],
  // spec-v370 tile, exposed to MCP in wave 195: Hartofilakidis classification (hip dysplasia).
  ['hartofilakidis classification', ['hartofilakidis-ddh']],
  // spec-v371 tile, exposed to MCP in wave 196: C-RADS category (CT colonography).
  ['ct colonography category', ['c-rads']],
  // spec-v372 tile, exposed to MCP in wave 197: CAD-RADS 2.0 category (coronary CTA).
  ['coronary cta category', ['cad-rads']],
  // spec-v373 tile, exposed to MCP in wave 198: NI-RADS category (head & neck surveillance).
  ['neck imaging reporting', ['ni-rads']],
  // spec-v374 tile, exposed to MCP in wave 199: Pauwels classification (femoral neck fracture).
  ['femoral neck fracture angle', ['pauwels-femoral-neck']],
  // spec-v375 tile, exposed to MCP in wave 200: Pipkin classification (femoral head fracture).
  ['femoral head fracture', ['pipkin-femoral-head']],
  // spec-v376 tile, exposed to MCP in wave 201: Denis classification (sacral fracture).
  ['sacral fracture zone', ['denis-sacral']],
  // spec-v377 tile, exposed to MCP in wave 202: Gartland classification (supracondylar humerus fracture).
  ['supracondylar humerus fracture', ['gartland-supracondylar']],
  // spec-v378 tile, exposed to MCP in wave 203: Delbet classification (pediatric femoral neck fracture).
  ['pediatric femoral neck fracture', ['delbet-femoral-neck']],
  // spec-v379 tile, exposed to MCP in wave 204: Tile classification (pelvic ring injury).
  ['pelvic ring fracture stability', ['tile-pelvic']],
  // spec-v380 tile, exposed to MCP in wave 205: Young-Burgess classification (pelvic ring injury).
  ['pelvic ring injury mechanism', ['young-burgess']],
  // spec-v381 tile, exposed to MCP in wave 206: Winquist-Hansen classification (femoral shaft fracture).
  ['femoral shaft comminution', ['winquist-hansen']],
  // spec-v382 tile, exposed to MCP in wave 207: Eichenholtz classification (Charcot neuroarthropathy).
  ['charcot foot staging', ['eichenholtz-charcot']],
  // spec-v383 tile, exposed to MCP in wave 208: Risser sign (skeletal maturity).
  ['iliac apophysis skeletal maturity', ['risser-sign']],
  // spec-v384 tile, exposed to MCP in wave 209: Spetzler-Ponce classification (cerebral AVM).
  ['avm 3-tier classification', ['spetzler-ponce']],
  // spec-v385 tile, exposed to MCP in wave 210: Schwab & England ADL scale.
  ['parkinson adl scale', ['schwab-england']],
  // spec-v386 tile, exposed to MCP in wave 211: Pirani clubfoot severity score.
  ['clubfoot severity score', ['pirani-clubfoot']],
  // spec-v387 tile, exposed to MCP in wave 212: Dimeglio clubfoot classification.
  ['clubfoot classification score', ['dimeglio-clubfoot']],
  // spec-v388 tile, exposed to MCP in wave 213: Brodsky tonsil grading scale.
  ['tonsil size grade', ['brodsky-tonsil']],
  // spec-v389 tile, exposed to MCP in wave 214: Koos grade (vestibular schwannoma).
  ['vestibular schwannoma grade', ['koos-schwannoma']],
  // spec-v390 tile, exposed to MCP in wave 215: Knosp grade (pituitary adenoma).
  ['pituitary adenoma cavernous sinus grade', ['knosp-adenoma']],
  // spec-v391 tile, exposed to MCP in wave 216: Hardy classification (pituitary adenoma).
  ['pituitary adenoma sellar grade', ['hardy-adenoma']],
  // spec-v392 tile, exposed to MCP in wave 217: Hill classification (GE flap valve).
  ['gastroesophageal flap valve', ['hill-flap-valve']],
  // spec-v393 tile, exposed to MCP in wave 218: Lauren classification (gastric cancer).
  ['gastric cancer histology type', ['lauren-gastric']],
  // spec-v394 tile, exposed to MCP in wave 219: Borrmann classification (gastric cancer).
  ['gastric cancer gross morphology', ['borrmann-gastric']],
  // spec-v395 tile, exposed to MCP in wave 220: Parks classification (anal fistula).
  ['anal fistula classification', ['parks-fistula']],
  // spec-v396 tile, exposed to MCP in wave 221: Sievers classification (bicuspid aortic valve).
  ['bicuspid aortic valve type', ['sievers-bav']],
  // spec-v397 tile, exposed to MCP in wave 222: El Khoury classification (aortic regurgitation).
  ['aortic regurgitation mechanism', ['el-khoury-ar']],
  // spec-v398 tile, exposed to MCP in wave 223: Carpentier classification (mitral regurgitation).
  ['mitral regurgitation mechanism', ['carpentier-mr']],
  // spec-v399 tile, exposed to MCP in wave 224: Bismuth-Corlette classification (perihilar cholangiocarcinoma).
  ['klatskin tumor type', ['bismuth-corlette']],
  // spec-v400 tile, exposed to MCP in wave 225: Nyhus classification (groin hernia).
  ['groin hernia classification', ['nyhus-hernia']],
  // spec-v401 tile, exposed to MCP in wave 226: Zargar classification (caustic esophagogastric injury).
  ['caustic ingestion grade', ['zargar-caustic']],
  // spec-v402 tile, exposed to MCP in wave 227: Lauge-Hansen classification (rotational ankle fracture).
  ['ankle fracture mechanism', ['lauge-hansen']],
  // spec-v403 tile, exposed to MCP in wave 228: Berndt-Harty classification (osteochondral lesion of the talus).
  ['osteochondral lesion of the talus', ['berndt-harty']],
  // spec-v404 tile, exposed to MCP in wave 229: Regan-Morrey classification (coronoid process fracture).
  ['coronoid process fracture', ['regan-morrey']],
  // spec-v405 tile, exposed to MCP in wave 230: Savary-Miller classification (reflux esophagitis).
  ['savary miller esophagitis', ['savary-miller']],
  // spec-v406 tile, exposed to MCP in wave 231: Le Fort classification (midface fracture).
  ['midface fracture', ['le-fort']],
  // spec-v407 tile, exposed to MCP in wave 232: Steinberg staging (femoral head AVN).
  ['steinberg staging', ['steinberg-avn']],
  // spec-v408 tile, exposed to MCP in wave 233: Meyers-McKeever classification (tibial eminence fracture).
  ['tibial eminence fracture', ['meyers-mckeever']],
  // spec-v409 tile, exposed to MCP in wave 234: Ideberg classification (glenoid fossa fracture).
  ['glenoid fossa fracture', ['ideberg-glenoid']],
  // spec-v410 tile, exposed to MCP in wave 235: Anderson-D'Alonzo classification (odontoid fracture).
  ['odontoid fracture', ['anderson-dalonzo']],
  // spec-v411 tile, exposed to MCP in wave 236: Levine-Edwards classification (hangman's fracture).
  ['hangman fracture', ['levine-edwards']],
  // spec-v412 tile, exposed to MCP in wave 237: Myerson classification (Lisfranc injury).
  ['lisfranc injury', ['lisfranc-myerson']],
  // spec-v413 tile, exposed to MCP in wave 238: Seinsheimer classification (subtrochanteric femur fracture).
  ['subtrochanteric fracture', ['seinsheimer-subtroch']],
  // spec-v414 tile, exposed to MCP in wave 239: Mayfield classification (perilunate instability).
  ['perilunate instability', ['mayfield-perilunate']],
  // spec-v415 tile, exposed to MCP in wave 240: Geissler classification (carpal ligament injury).
  ['geissler classification', ['geissler-carpal']],
  // spec-v416 tile, exposed to MCP in wave 241: Russe classification (scaphoid fracture).
  ['scaphoid fracture classification', ['russe-scaphoid']],
  // spec-v417 tile, exposed to MCP in wave 242: Wassel classification (thumb polydactyly).
  ['thumb polydactyly', ['wassel-thumb']],
  // spec-v418 tile, exposed to MCP in wave 243: Milch classification (lateral condyle fracture).
  ['lateral condyle fracture', ['milch-condyle']],
  // spec-v419 tile, exposed to MCP in wave 244: Myer-Cotton grade (subglottic stenosis).
  ['subglottic stenosis grade', ['cotton-myer']],
  // spec-v420 tile, exposed to MCP in wave 245: Friedman tongue position (OSA staging).
  ['friedman tongue position', ['friedman-tongue']],
  // spec-v421 tile, exposed to MCP in wave 246: SUN anterior chamber cell grade (uveitis).
  ['anterior chamber cell grade', ['sun-ac-cell']],
  // spec-v422 tile, exposed to MCP in wave 247: SUN anterior chamber flare grade (uveitis).
  ['anterior chamber flare grade', ['sun-ac-flare']],
  // spec-v423 tile, exposed to MCP in wave 248: Marsh-Oberhuber classification (celiac histology).
  ['marsh oberhuber classification', ['marsh-oberhuber']],
  // spec-v424 tile, exposed to MCP in wave 249: Bethesda System (thyroid cytopathology).
  ['bethesda thyroid category', ['bethesda-thyroid']],
  // spec-v425 tile, exposed to MCP in wave 250: vesicoureteral reflux grade (VCUG).
  ['vesicoureteral reflux grade', ['vur-grade']],
  // spec-v426 tile, exposed to MCP in wave 251: Gell and Coombs hypersensitivity classification.
  ['gell coombs hypersensitivity', ['gell-coombs']],
  // spec-v427 tile, exposed to MCP in wave 252: Vaughan Williams antiarrhythmic classification.
  ['vaughan williams antiarrhythmic', ['vaughan-williams']],
  // spec-v428 tile, exposed to MCP in wave 253: MRC muscle-power grade.
  ['mrc muscle power grade', ['mrc-power']],
  // spec-v429 tile, exposed to MCP in wave 254: Sarnat staging (neonatal HIE).
  ['sarnat staging neonatal', ['sarnat-hie']],
  // spec-v430 tile, exposed to MCP in wave 255: Papile grade (germinal matrix / IVH).
  ['papile intraventricular hemorrhage grade', ['papile-ivh']],
  // spec-v431 tile, exposed to MCP in wave 256: Modified Bell staging (NEC).
  ['bell staging necrotizing enterocolitis', ['bell-nec']],
  // spec-v432 tile, exposed to MCP in wave 257: Baden-Walker prolapse grade.
  ['baden walker prolapse grade', ['baden-walker']],
  // spec-v433 tile, exposed to MCP in wave 258: Modic changes (vertebral endplate MRI).
  ['modic changes vertebral endplate', ['modic-changes']],
  // spec-v434 tile, exposed to MCP in wave 259: Pfirrmann disc degeneration grade.
  ['pfirrmann disc degeneration grade', ['pfirrmann-disc']],
  // spec-v435 tile, exposed to MCP in wave 260: Van Herick angle grade.
  ['van herick angle grade', ['van-herick']],
  // spec-v436 tile, exposed to MCP in wave 261: Biffl grade (blunt cerebrovascular injury).
  ['biffl bcvi grade', ['biffl-bcvi']],
  // spec-v437 tile, exposed to MCP in wave 262: Goutallier grade (rotator cuff fatty infiltration).
  ['goutallier fatty infiltration grade', ['goutallier']],
  // spec-v438 tile, exposed to MCP in wave 263: Eaton-Littler stage (thumb CMC arthritis).
  ['eaton littler thumb arthritis stage', ['eaton-littler']],
  // spec-v439 tile, exposed to MCP in wave 264: Hamada grade (cuff tear arthropathy).
  ['hamada cuff tear arthropathy grade', ['hamada']],
  // spec-v440 tile, exposed to MCP in wave 265: Barrow classification (carotid-cavernous fistula).
  ['barrow carotid cavernous fistula', ['barrow-ccf']],
  // spec-v441 tile, exposed to MCP in wave 266: Borden classification (dural AV fistula).
  ['borden dural av fistula', ['borden-davf']],
  // spec-v442 tile, exposed to MCP in wave 267: Zabramski classification (cerebral cavernous malformation).
  ['zabramski cavernous malformation', ['zabramski']],
  // spec-v443 tile, exposed to MCP in wave 268: Kadish staging (esthesioneuroblastoma).
  ['kadish esthesioneuroblastoma stage', ['kadish']],
  // spec-v444 tile, exposed to MCP in wave 269: McCormick grade (spinal cord function).
  ['mccormick spinal cord grade', ['mccormick']],
  // spec-v445 tile, exposed to MCP in wave 270: Revised Atlanta severity (acute pancreatitis).
  ['revised atlanta pancreatitis severity', ['atlanta-pancreatitis']],
  // spec-v446 tile, exposed to MCP in wave 271: ROP stage (retinopathy of prematurity).
  ['retinopathy of prematurity stage', ['rop-stage']],
  // spec-v447 tile, exposed to MCP in wave 272: Anderson-Montesano (occipital condyle fracture).
  ['anderson montesano occipital condyle', ['anderson-montesano']],
  // spec-v448 tile, exposed to MCP in wave 273: Traynelis (atlanto-occipital dislocation).
  ['traynelis atlanto occipital dislocation', ['traynelis']],
  // spec-v449 tile, exposed to MCP in wave 274: Fielding-Hawkins (atlantoaxial rotatory subluxation).
  ['fielding hawkins atlantoaxial rotatory subluxation', ['fielding-hawkins']],
  // spec-v450 tile, exposed to MCP in wave 275: Reid classification (bronchiectasis).
  ['reid bronchiectasis morphology', ['reid-bronchiectasis']],
  // spec-v451 tile, exposed to MCP in wave 276: Sade grade (tympanic membrane retraction).
  ['sade tympanic membrane retraction grade', ['sade-retraction']],
  ['brooker heterotopic ossification classification', ['brooker']],
  ['bado monteggia fracture classification', ['bado']],
  ['nunley vertullo midfoot sprain classification', ['nunley-vertullo']],
  ['leddy packer jersey finger classification', ['leddy-packer']],
  ['stulberg perthes residual deformity classification', ['stulberg']],
  ['boyd griffin intertrochanteric fracture classification', ['boyd-griffin']],
  ['thompson epstein posterior hip dislocation classification', ['thompson-epstein']],
  ['enneking musculoskeletal sarcoma surgical staging', ['enneking']],
  ['debakey aortic dissection classification', ['debakey']],
  ['gmfcs cerebral palsy gross motor function', ['gmfcs']],
  ['waldenstrom perthes radiographic staging', ['waldenstrom-perthes']],
  ['crawford thoracoabdominal aortic aneurysm classification', ['crawford-taaa']],
  ['stamey stress urinary incontinence grade', ['stamey-incontinence']],
  ['judet letournel acetabular fracture classification', ['letournel-acetabulum']],
  ['bromage neuraxial motor block scale', ['bromage-scale']],
  ['brouet cryoglobulinemia classification', ['brouet-cryoglobulinemia']],
  ['steinbrocker rheumatoid arthritis functional class', ['steinbrocker-ra']],
  ['larsen rheumatoid arthritis radiographic grade', ['larsen-ra']],
  ['gass macular hole staging', ['gass-macular-hole']],
  ['yerdel portal vein thrombosis grade', ['yerdel-pvt']],
  ['todani choledochal cyst classification', ['todani-choledochal']],
  ['rastelli complete avsd classification', ['rastelli-avsd']],
  ['glogau photoaging classification', ['glogau-photoaging']],
  ['nash moe vertebral rotation grade', ['nash-moe-rotation']],
  ['sfu hydronephrosis grade', ['sfu-hydronephrosis']],
  ['spaulding device reprocessing classification', ['spaulding-classification']],
  ['spitz esophageal atresia classification', ['spitz-atresia']],
  ['ahlback knee osteoarthritis grade', ['ahlback-knee-oa']],
  ['wiltse spondylolisthesis classification', ['wiltse-spondylolisthesis']],
  ['russell taylor subtrochanteric fracture classification', ['russell-taylor-subtroch']],
  ['vancouver periprosthetic femoral fracture classification', ['vancouver-periprosthetic']],
  ['barrack femoral cement mantle grade', ['barrack-cement']],
  ['dejour trochlear dysplasia classification', ['dejour-trochlea']],
  ['samilson prieto shoulder dislocation arthropathy', ['samilson-prieto']],
  ['rockwood acromioclavicular joint injury classification', ['rockwood-ac']],
  ['bigliani acromion morphology classification', ['bigliani-acromion']],
  ['fernandez distal radius fracture classification', ['fernandez-radius']],
  ['ruedi allgower tibial pilon fracture classification', ['ruedi-allgower-pilon']],
  ['severin ddh radiographic outcome classification', ['severin-ddh']],
  ['hattrup johnson hallux rigidus grade', ['hattrup-johnson']],
  ['lown grade ventricular ectopy holter', ['lown-ectopy']],
  ['intermacs profile advanced heart failure', ['intermacs-profile']],
  ['ranawat class rheumatoid cervical myelopathy', ['ranawat-myelopathy']],
  ['lodwick grade bone lesion aggressiveness', ['lodwick-grade']],
  ['schobinger stage peripheral arteriovenous malformation', ['schobinger-avm']],
  ['narakas group obstetric brachial plexus palsy', ['narakas-obpp']],
  ['dorr type proximal femoral morphology', ['dorr-femur']],
  ['tegner activity scale knee level', ['tegner-activity']],
  ['ludwig female pattern hair loss grade', ['ludwig-hairloss']],
  ['norwood male pattern hair loss stage', ['norwood-hairloss']],
  ['simpson grade meningioma resection', ['simpson-meningioma']],
  ['metavir fibrosis stage liver biopsy', ['metavir-fibrosis']],
  ['metavir activity grade necroinflammatory', ['metavir-activity']],
  ['jerger tympanogram type tympanometry', ['jerger-tympanogram']],
  ['voice handicap index vhi 10 score', ['vhi10']],
  ['sunnybrook facial grading composite synkinesis', ['sunnybrook-facial']],
  ['banff grade t cell mediated rejection tubulitis', ['banff-tcmr']],
  ['crafft adolescent substance use screen', ['crafft']],
  ['vaizey st marks fecal incontinence score', ['vaizey']],
  ['asrs adult adhd screener part a', ['asrs']],
  ['young mania rating scale ymrs', ['ymrs']],
  ['simpson angus drug induced parkinsonism', ['simpson-angus']],
  ['asthma control test act score', ['asthma-control-test']],
  ['premature infant pain profile pipp', ['pipp']],
  ['childhood asthma control test for a child', ['childhood-act']],
  ['eckardt score achalasia symptoms', ['eckardt']],
  ['spigelman stage duodenal polyposis', ['spigelman']],
  ['primary care ptsd screen five questions', ['pc-ptsd5']],
  ['pediatric crohn disease activity index', ['pcdai']],
  ['scadding stage sarcoidosis chest xray', ['scadding']],
  ['cornell assessment of pediatric delirium capd', ['capd']],
  ['carotid plaque echogenicity type ultrasound', ['gray-weale']],
  ['neonatal sofa organ dysfunction preterm', ['nsofa']],
  ['wayne index clinical thyrotoxicosis', ['wayne-index']],
  ['oxford mest c iga nephropathy biopsy', ['mest-c']],
  ['tuberculous versus bacterial meningitis score', ['thwaites']],
  ['vesikari gastroenteritis severity score', ['vesikari']],
  ['thrombus after endovenous vein ablation class', ['ehit']],
  ['fsgs biopsy variant columbia classification', ['columbia-fsgs']],
  ['renal angina index predict aki child', ['renal-angina']],
  ['ridley jopling leprosy classification', ['ridley-jopling']],
  ['capthus single gland parathyroid score', ['capthus']],
  ['hardman index ruptured aortic aneurysm', ['hardman']],
  ['alsfrs r als functional rating scale', ['alsfrs-r']],
  ['neos score nmdar encephalitis outcome', ['neos']],
  ['isl lymphedema stage swollen limb', ['isl-lymphedema']],
  ['ishlt cardiac allograft rejection grade', ['ishlt-rejection']],
  ['rachs congenital heart surgery risk category', ['rachs1']],
  ['twstrs cervical dystonia severity', ['twstrs-severity']],
  ['save score veno arterial ecmo survival', ['save-score']],
  ['nems icu nursing workload score', ['nems']],
  ['palm coein abnormal uterine bleeding causes', ['palm-coein']],
  ['asrm endometriosis stage from score', ['rasrm-stage']],
  ['brue lower risk criteria infant', ['brue']],
  ['patient prosthesis mismatch indexed orifice area', ['ppm-eoai']],
  ['poseidon group low prognosis ivf', ['poseidon']],
  ['glass anatomic stage limb threatening ischemia', ['glass-stage']],
  ['irecist immunotherapy response pseudoprogression', ['irecist']],
  ['snot 22 sinonasal outcome test score', ['snot22']],
  ['puqe score nausea vomiting pregnancy', ['puqe24']],
  ['global acne grading system severity score', ['gags']],
  ['tinnitus handicap inventory score grade', ['thi']],
  ['vitiligo area scoring index vasi', ['vasi']],
  ['mswat skin tumor burden mycosis fungoides', ['mswat']],
  ['osdi dry eye symptom questionnaire score', ['osdi']],
  ['takayasu arteritis classification criteria', ['takayasu-acr-eular-2022']],
  ['granulomatosis with polyangiitis classification criteria', ['gpa-acr-eular-2022']],
  ['microscopic polyangiitis classification criteria', ['mpa-acr-eular-2022']],
  ['eosinophilic granulomatosis with polyangiitis classification', ['egpa-acr-eular-2022']],
  ['adult onset still disease yamaguchi criteria', ['yamaguchi-aosd']],
  ['oswestry disability index low back', ['oswestry-odi']],
  ['slums st louis university mental status cognitive', ['slums']],
  ['cheops pediatric postoperative pain scale', ['cheops']],
  ['mccormack load sharing classification spine fracture', ['mccormack-lsc']],
  ['schenck knee dislocation classification kd grade', ['schenck-knee']],
  ['weiss criteria adrenocortical carcinoma malignancy', ['weiss-adrenal']],
  ['nottingham histologic grade breast cancer scarff bloom', ['nottingham-grade']],
  ['fnclcc grade soft tissue sarcoma mitotic necrosis', ['fnclcc-grade']],
  ['van nuys prognostic index dcis usc vnpi', ['van-nuys-vnpi']],
  ['who isup nucleolar grade renal cell carcinoma fuhrman', ['who-isup-renal-grade']],
  ['peritoneal cancer index sugarbaker hipec tumor burden', ['peritoneal-cancer-index']],
  ['completeness of cytoreduction cc score residual tumor', ['completeness-cytoreduction']],
  ['isgps postoperative pancreatic fistula grade popf', ['isgps-popf']],
  ['isgls post hepatectomy liver failure grade phlf', ['isgls-phlf']],
  ['isgls bile leak grade after liver surgery', ['isgls-bile-leak']],
  ['isgps delayed gastric emptying grade pancreatic surgery', ['isgps-dge']],
  ['pass pheochromocytoma scaled score malignancy histology', ['pass-pheo']],
  ['ips international prognostic score advanced hodgkin lymphoma', ['ips-hodgkin']],
  ['push tool pressure ulcer scale for healing wound', ['push-tool']],
  ['lichtiger index ulcerative colitis activity modified truelove', ['lichtiger-index']],
  ['ase diastolic function grade echo e/e prime tr velocity', ['diastolic-function-ase']],
  ['cleveland clinic wexner constipation score agachan', ['cleveland-constipation']],
  ['ventral hernia working group vhwg grade surgical site', ['vhwg-hernia']],
  ['fournier gangrene severity index fgsi mortality', ['fgsi']],
  ['coronary artery calcium agatston score cac category', ['cac-agatston']],
  ['walter index one year mortality after hospitalization older adults', ['walter-index']],
  ['ottawa bowel preparation scale colonoscopy prep quality', ['ottawa-bowel-prep']],
  ['acr eular boolean remission rheumatoid arthritis criteria', ['acr-eular-boolean']],
  ['minimal disease activity psoriatic arthritis mda vlda', ['mda-psoriatic']],
  ['heckerling pneumonia prediction rule chest xray', ['heckerling-pneumonia']],
  ['onychomycosis severity index osi fungal nail grading', ['osi-onychomycosis']],
  ['altman self rating mania scale asrm screen', ['asrm-mania']],
  ['lund kennedy endoscopic score rhinosinusitis sinus', ['lund-kennedy']],
  ['mcmahon score rhabdomyolysis kidney failure risk', ['mcmahon-rhabdo']],
  ['meld 3.0 liver disease allocation score albumin sex', ['meld3']],
  ['gerdq reflux questionnaire heartburn regurgitation gerd screen', ['gerdq']],
  ['kobayashi score ivig resistance kawasaki disease prediction', ['kobayashi-kawasaki']],
  ['sano score ivig resistance kawasaki ast bilirubin crp', ['sano-kawasaki']],
  ['wang bronchiolitis respiratory score infant severity wheezing retraction', ['wang-bronchiolitis']],
  ['effective serum osmolality tonicity hhs hyperosmolar', ['effective-osmolality']],
  ['fractional excretion of potassium fek renal wasting hypokalemia', ['fractional-excretion-potassium']],
  ['free androgen index fai testosterone shbg pcos hirsutism', ['free-androgen-index']],
  ['ucsf criteria hcc liver transplant eligibility', ['ucsf-hcc']],
  ['elemental iron ingested overdose toxic dose mg per kg tablets', ['elemental-iron-ingested']],
  ['downton fall risk index elderly falls screen medications', ['downton-fall-risk']],
  ['elderly mobility scale ems functional mobility rehabilitation', ['elderly-mobility-scale']],
  ['edmonton frail scale efs frailty screen older adults', ['edmonton-frail-scale']],
  ['posas observer scar assessment scale vascularity pigmentation', ['posas-observer-scar']],
  ['conley fall risk scale nursing inpatient falls dizziness', ['conley-fall-risk']],
  ['interchest chest pain coronary artery disease primary care rule', ['interchest']],
  ['cobb angle scoliosis curve severity degrees', ['cobb-angle']],
  ['manning criteria irritable bowel syndrome ibs symptom', ['manning-ibs']],
  ['framingham criteria heart failure diagnosis major minor', ['framingham-hf-criteria']],
  ['kings score liver fibrosis hepatitis c cirrhosis noninvasive', ['kings-score']],
  ['quick covid severity index qcsi respiratory decompensation', ['qcsi']],
  ['frontal assessment battery fab executive dysfunction dementia', ['fab']],
  ['malt lymphoma prognostic index ipi marginal zone', ['malt-ipi']],
  ['cts6 carpal tunnel clinical diagnostic score', ['cts6']],
  ['boston carpal tunnel questionnaire symptom severity function', ['bctq']],
  ['pelvic floor distress inventory popdi cradi udi', ['pfdi20']],
  ['pelvic floor impact questionnaire uiq craiq popiq', ['pfiq7']],
  ['awol delirium risk prediction admission', ['awol']],
  ['six item cognitive impairment test 6cit dementia screen', ['sixcit']],
  ['schofield basal metabolic rate age banded equation', ['schofield']],
  ['copenhagen burnout inventory personal work related', ['cbi']],
  ['start back screening tool low back pain risk', ['startback']],
  ['fear avoidance beliefs questionnaire back pain work', ['fabq']],
  ['posas patient scale scar pain itch rating', ['posas-patient-scar']],
  ['griffith algorithm wide complex tachycardia default vt', ['griffith-vt']],
  ['oldenburg burnout inventory exhaustion disengagement', ['olbi']],
  ['arvc task force criteria arrhythmogenic right ventricular', ['arvc-tfc']],
  ['ecg atrial enlargement p wave morris index criteria', ['atrial-enlargement']],
  ['intertak score takotsubo versus acute coronary syndrome', ['intertak']],
  ['acute pericarditis diagnostic criteria friction rub', ['acute-pericarditis']],
  ['lake louise criteria myocarditis cardiac mri t1 t2', ['lake-louise-cmr']],
  ['cardiac sarcoidosis diagnostic criteria heart rhythm society', ['cardiac-sarcoidosis']],
  ['rudas multicultural dementia screening scale', ['rudas']],
  ['simple shoulder test twelve yes no shoulder function', ['simple-shoulder-test']],
  ['furst ratio urine plasma electrolyte fluid restriction siadh', ['furst-ratio']],
  ['multisystem inflammatory syndrome children case definition', ['mis-c']],
  ['eu tirads thyroid nodule european ultrasound category', ['eu-tirads']],
  ['neuroendocrine neoplasm who grade ki67 mitotic count', ['nen-who-grade']],
  ['renal tubular acidosis type 1 2 4 urine ph potassium', ['rta-type']],
  ['caine criteria wernicke encephalopathy thiamine', ['caine-wernicke']],
  ['hughes functional grading scale guillain barre disability', ['hughes-gbs']],
  ['hodapp parrish anderson glaucoma visual field staging', ['hpa-glaucoma']],
  ['gardner robertson hearing class serviceable audiogram', ['gardner-robertson']],
  ['anaphylaxis diagnostic criteria world allergy organization', ['anaphylaxis-criteria']],
  ['rome proposal copd exacerbation severity classification', ['rome-ecopd']],
  ['abbreviated mental test score hodkinson ten question', ['amts']],
  ['perceived stress scale ten item cohen', ['pss10']],
  ['chicago classification achalasia subtype manometry', ['chicago-achalasia']],
  ['hepatorenal syndrome aki diagnostic criteria cirrhosis', ['hrs-aki']],
  ['forrest classification bleeding ulcer endoscopy stigmata', ['forrest-classification']],
  ['mallampati oropharyngeal view airway class', ['mallampati']],
  ['gold coast criteria als diagnosis motor neuron', ['gold-coast-als']],
  ['leipzig score wilson disease copper diagnosis', ['leipzig-wilson']],
  ['systemic mastocytosis who criteria tryptase mast cell', ['systemic-mastocytosis']],
  ['cluster headache ichd3 diagnostic criteria autonomic', ['cluster-headache-ichd3']],
  ['migraine ichd3 diagnostic criteria aura', ['migraine-ichd3']],
  ['medication overuse headache rebound criteria', ['moh-ichd3']],
  ['trigeminal neuralgia facial pain criteria', ['trigeminal-neuralgia-ichd3']],
  ['tension type headache ichd3 criteria', ['tension-headache-ichd3']],
  ['paroxysmal hemicrania continua indomethacin criteria', ['indomethacin-headache-ichd3']],
  ['sunct suna short lasting neuralgiform attacks', ['sunct-suna-ichd3']],
  ['ghent nosology marfan syndrome systemic score', ['ghent-marfan']],
  ['hypermobile ehlers danlos 2017 criteria beighton', ['heds-2017']],
  ['neuromyelitis optica nmosd aquaporin criteria', ['nmosd-2015']],
  ['autoimmune encephalitis graus possible criteria', ['autoimmune-encephalitis']],
  ['igg4 related disease diagnostic criteria', ['igg4-rd-2020']],
  ['pulmonary hypertension mpap wedge pvr classification', ['ph-hemodynamics-2022']],
  ['nontuberculous mycobacterial lung disease criteria', ['ntm-pulmonary']],
  ['cystic fibrosis sweat chloride diagnosis criteria', ['cf-diagnosis']],
  ['obesity hypoventilation syndrome paco2 bicarbonate', ['ohs-diagnosis']],
  ['alpha 1 antitrypsin level genotype deficiency', ['aat-deficiency']],
  ['twin twin transfusion quintero stage', ['quintero-ttts']],
  ['triple i intraamniotic infection maternal fever', ['triple-i']],
  ['placenta accreta spectrum figo grade', ['figo-pas']],
  ['premature ovarian insufficiency fsh criteria', ['poi-diagnosis']],
  ['acromegaly igf1 growth hormone ogtt nadir', ['acromegaly-biochem']],
  ['4ts score heparin induced thrombocytopenia', ['four-ts-hit']],
  ['masld metald steatotic liver disease criteria', ['masld-criteria']],
  ['clinical obesity preclinical lancet commission', ['clinical-obesity']],
  ['atrial fibrillation stages permanent paroxysmal', ['af-stages-2023']],
  ['hfref hfpef hfimpef ejection fraction classification', ['hf-ef-classification']],
  ['diabetes diagnosis a1c fasting glucose criteria', ['diabetes-diagnosis']],
  ['heart failure stages a b c d acc aha', ['hf-stages-abcd']],
  ['blood pressure categories acc aha normal elevated stage 1', ['bp-categories']],
  ['aortic stenosis stages acc aha low gradient d2 d3', ['aortic-stenosis-stage']],
  ['mitral stenosis stages acc aha valve area pressure half time', ['mitral-stenosis-stage']],
  ['aortic regurgitation stages acc aha c1 c2 end systolic diameter', ['aortic-regurgitation-stage']],
  ['primary mitral regurgitation stages acc aha ejection fraction 60', ['mitral-regurgitation-stage']],
  ['tricuspid regurgitation stages acc aha hepatic vein reversal', ['tricuspid-regurgitation-stage']],
  ['secondary functional mitral regurgitation stages acc aha', ['secondary-mitral-regurgitation-stage']],
  ['rope score paradoxical embolism patent foramen ovale cryptogenic stroke', ['rope-score']],
  ['rassi score chagas heart disease death risk', ['rassi-chagas']],
  ['spontaneous bacterial peritonitis ascitic neutrophil count 250', ['sbp-ascitic-fluid']],
  ['constrictive pericarditis echo septal shift hepatic vein reversal', ['constrictive-pericarditis-echo']],
  ['gastric emptying study four hour retention grade', ['gastric-emptying-scintigraphy']],
  ['narcolepsy type 1 type 2 criteria cataplexy hypocretin sleep latency', ['narcolepsy-criteria']],
  ['restless legs syndrome five essential diagnostic criteria', ['rls-criteria']],
  ['acute otitis media criteria bulging eardrum observation option', ['aom-criteria']],
  ['who grades of hearing loss better ear pure tone average', ['who-hearing-grade']],
  ['priapism cavernous blood gas ischemic or non-ischemic', ['priapism-gas']],
  ['malignant hyperthermia clinical grading scale raw score rank', ['mh-grading-scale']],
  ['spinal epidural abscess spine pain risk factor sedimentation rate imaging', ['sea-guideline']],
  ['m-chat toddler autism screen follow-up medium risk', ['mchat-rf']],
  ['blood lead reference value micrograms per deciliter child', ['blood-lead']],
  ['methemoglobin co-oximetry methylene blue pulse oximeter', ['methemoglobin']],
  ['carboxyhemoglobin carbon monoxide level smoker baseline', ['carboxyhemoglobin']],
  ['broset violence checklist inpatient risk next 24 hours', ['broset']],
  ['who severe malaria criteria falciparum severity features', ['who-severe-malaria']],
  ['pertussis case definition whooping cough confirmed probable', ['pertussis-case-def']],
  ['eortc msgerc invasive fungal disease proven probable possible', ['eortc-msg-ifd']],
  ['neuroleptic malignant syndrome diagnostic criteria priority points', ['nms-criteria']],
  ['measles case definition febrile rash suspect probable confirmed', ['measles-case-def']],
  ['lyme two tier serology immunoblot interpretation', ['lyme-two-tier']],
  ['nhsn clabsi central line bloodstream infection lcbi', ['clabsi-lcbi']],
  ['nhsn cauti catheter associated urinary tract infection criteria', ['cauti-nhsn']],
  ['nhsn ventilator associated event vac ivac pvap', ['nhsn-vae']],
  ['ishoo angioedema staging tongue larynx airway risk', ['ishoo-angioedema']],
  ['kdigo membranous nephropathy risk category pla2r proteinuria', ['membranous-risk']],
  ['cancer cachexia consensus definition weight loss sarcopenia', ['cancer-cachexia']],
  ['ewgsop2 sarcopenia grip strength muscle mass algorithm', ['ewgsop2']],
  ['vitamin d level interpretation deficiency insufficiency threshold', ['vitamin-d-level']],
  ['post polypectomy surveillance interval next colonoscopy adenoma', ['polyp-surveillance']],
  ['fukuoka ipmn worrisome features high risk stigmata pancreatic cyst', ['ipmn-fukuoka']],
  ['eat sleep console neonatal opioid withdrawal function based care', ['eat-sleep-console']],
  ['niosh lifting equation recommended weight limit lifting index', ['niosh-lifting']],
  ['occupational noise exposure allowable time niosh osha decibels', ['noise-exposure']],
  ['needlestick occupational hiv post exposure prophylaxis decision', ['hiv-pep-occupational']],
  ['feno exhaled nitric oxide interpretation cutpoints asthma', ['feno']],
  ['home oxygen qualifying criteria saturation 88 percent', ['home-oxygen']],
  ['methacholine challenge pd20 pc20 bronchial hyperresponsiveness', ['methacholine']],
  ['peak flow green yellow red zone asthma action plan', ['pef-zones']],
  ['albumin after large volume paracentesis grams per litre', ['lvp-albumin']],
  ['acute tryptase rise baseline mast cell activation', ['tryptase']],
  ['gadolinium nephrogenic systemic fibrosis group ii low egfr', ['gadolinium-nsf']],
  ['lipid emulsion rescue local anesthetic toxicity dose', ['last-lipid']],
  ['preoperative fasting clear liquids two hours npo', ['preop-fasting']],
  ['how long after a drug eluting stent before elective surgery', ['pci-surgery-timing']],
  ['periprocedural bridging warfarin doac interruption', ['periop-bridging']],
  ['istap skin tear classification flap type', ['skin-tear']],
  ['incontinence associated dermatitis globiad category', ['iad-globiad']],
  ['medical adhesive related skin injury marsi tape damage', ['marsi']],
  ['cuff leak test before extubation stridor volume', ['cuff-leak']],
  ['dka resolution criteria anion gap bicarbonate', ['dka-resolution']],
  ['taco versus trali transfusion respiratory reaction', ['taco-trali']],
  ['hepatic veno-occlusive disease definition after transplant', ['vod-sos']],
  ['hy law drug induced liver injury bilirubin', ['hys-law']],
  ['ursodeoxycholic acid response paris criteria', ['udca-response']],
  ['kings college criteria non acetaminophen liver failure', ['kings-college-nonapap']],
  ['chronic graft versus host disease global severity', ['cgvhd-severity']],
  ['fetal heart rate tracing category two', ['nichd-fhr']],
  ['i pass handoff structure', ['ipass-handoff']],
  ['sad persons scale suicide risk screen', ['sad-persons']],
  ['edinburgh claudication questionnaire leg pain walking', ['edinburgh-claudication']],
  ['reimers migration percentage hip cerebral palsy subluxation', ['reimers-migration-percentage']],
  ['caton deschamps index patella alta baja height', ['caton-deschamps']],
  ['pi ll mismatch spinopelvic sagittal alignment lordosis', ['pi-ll-mismatch']],
  ['leeds enthesitis index psoriatic arthritis tender', ['leeds-enthesitis-index']],
  ['amsler krumeich keratoconus staging classification', ['amsler-krumeich']],
  ['meniere disease hearing stage aao hns pure tone average', ['meniere-aao-hns']],
  ['opioid risk tool aberrant behavior long term opioids', ['opioid-risk-tool']],
  ['g8 geriatric screening older cancer comprehensive assessment', ['g8-geriatric']],
  ['ausdrisk australian type 2 diabetes risk assessment', ['ausdrisk']],
  ['mna sf mini nutritional assessment malnutrition elderly', ['mna-sf']],
  ['edmonton obesity staging system eoss obesity severity', ['eoss']],
  ['prostate health index phi psa biopsy prostate cancer', ['prostate-health-index']],
  ['bewe basic erosive wear examination dental tooth', ['bewe']],
  ['dmft caries index decayed missing filled teeth', ['dmft-caries']],
  ['pederson difficulty impacted third molar wisdom tooth extraction', ['pederson-difficulty']],
  ['ellis classification dental tooth fracture trauma', ['ellis-tooth-fracture']],
  ['kennedy classification partially edentulous removable partial denture', ['kennedy-edentulous']],
  ['angle classification malocclusion orthodontic molar', ['angle-malocclusion']],
  ['plaque control record oleary oral hygiene dental', ['plaque-control-record']],
  ['loe silness gingival index gingivitis inflammation', ['loe-silness-gingival-index']],
  ['silness loe plaque index oral hygiene deposits', ['silness-loe-plaque-index']],
  ['miller gingival recession classification root coverage', ['miller-gingival-recession']],
  ['glickman furcation involvement grade periodontal', ['glickman-furcation']],
  ['insomnia severity index sleep isi', ['isi']],
  ['functional oral intake scale fois dysphagia swallowing', ['fois']],
  ['hearing handicap inventory elderly screening hhie', ['hhie-s']],
  ['abc balance confidence scale fall risk', ['abc-scale']],
  ['severity of dependence scale sds substance', ['sds-dependence']],
  ['infant breastfeeding assessment tool ibfat feeding', ['ibfat']],
  ['fatigue severity scale fss krupp', ['fss']],
  ['chalder fatigue scale cfq-11 questionnaire', ['chalder-fatigue']],
  ['phq-15 somatic symptom severity questionnaire', ['phq15']],
  ['kessler k6 psychological distress scale', ['k6']],
  ['short michigan alcoholism screening test smast', ['smast']],
  ['cage-aid alcohol and drug screen adapted to include drugs', ['cage-aid']],
  ['mayo classification olecranon fracture type', ['mayo-olecranon']],
  ['walch glenoid morphology classification osteoarthritis', ['walch-glenoid']],
  ['masaoka koga thymoma staging stage', ['masaoka-koga']],
  ['pregnancy dic score erez obstetric', ['erez-dic']],
  ['aeeg amplitude classification neonatal encephalopathy', ['anaqeeb-aeeg']],
  ['spadi shoulder pain disability index', ['spadi']],
  ['pusher behaviour scale contraversive pushing stroke', ['scp-pushing']],
  ['mayo imaging classification adpkd kidney volume', ['mayo-adpkd']],
  ['propkd score renal survival polycystic kidney', ['propkd']],
  ['lupus nephritis activity chronicity index biopsy', ['lupus-nephritis-indices']],
  ['chronic prostatitis symptom index cpsi', ['nih-cpsi']],
  ['igcccg prognostic group germ cell tumor', ['igcccg']],
  ['thakar cleveland clinic renal failure cardiac surgery', ['thakar-aki']],
  ['gapp grade pheochromocytoma paraganglioma metastatic', ['gapp']],
  ['global definition ards 2024 nonintubated', ['global-ards']],
  ['e-faced bronchiectasis exacerbation score', ['e-faced']],
  ['heaven criteria difficult emergency airway', ['heaven-criteria']],
  ['modified asthma predictive index preschool wheeze', ['mapi-asthma']],
  ['compera four stratum pulmonary hypertension risk', ['compera-2']],
  ['peradeniya organophosphorus poisoning severity scale', ['peradeniya-op']],
  ['ablett tetanus severity grade', ['ablett-tetanus']],
  ['magic acute gvhd staging grade', ['magic-gvhd']],
  ['nancy histological index ulcerative colitis biopsy', ['nancy-index']],
  ['robarts histopathology index uc geboes', ['robarts-index']],
  ['ehra symptom class atrial fibrillation', ['ehra-af']],
  ['shanghai score brugada syndrome diagnosis', ['shanghai-brugada']],
  ['hlh 2004 diagnostic criteria hemophagocytic lymphohistiocytosis', ['hlh-2004']],
  ['nac gillmore stage transthyretin cardiac amyloidosis', ['nac-attr-stage']],
  ['ebmt risk score allogeneic stem cell transplant', ['ebmt-score']],
  ['rucam drug induced liver injury causality', ['rucam']],
  ['up to seven criteria hcc liver transplant', ['up-to-seven']],
  ['quick pitt bacteremia score mortality', ['qpitt']],
  ['bologna criteria poor ovarian response', ['bologna-por']],
  ['sternbach criteria serotonin syndrome', ['sternbach']],
  ['five factor score 1996 vasculitis prognosis', ['ffs-1996']],
  ['heffner criteria pleural exudate without serum', ['heffner']],
  ['amsterdam ii criteria lynch syndrome', ['amsterdam-ii']],
  ['revised bethesda guidelines msi testing', ['bethesda']],
  ['arc hbr high bleeding risk criteria pci', ['arc-hbr']],
  ['acef score cardiac surgery mortality risk', ['acef']],
  ['lepine criteria pleural exudate cholesterol', ['lepine']],
  ['panc 3 score severe acute pancreatitis admission', ['panc3']],
  ['jta criteria thyroid storm ts1 ts2', ['jta-thyroid-storm']],
  ['myxedema coma diagnostic score', ['myxedema-coma']],
  ['fisher grade subarachnoid hemorrhage ct', ['fisher-grade']],
  ['pollock flickinger avm radiosurgery score', ['pollock-flickinger']],
  ['virginia radiosurgery avm scale vras', ['vras']],
  ['bauer score skeletal metastases survival', ['bauer-score']],
  ['bilsky escc epidural spinal cord compression grade', ['bilsky-escc']],
  ['harrington classification periacetabular metastases', ['harrington-acetabular']],
  ['katagiri score skeletal metastasis survival', ['katagiri']],
  ['modified sartorius score hidradenitis', ['sartorius-hs']],
  ['zulewski clinical score hypothyroidism', ['zulewski']],
  ['hijdra sum score subarachnoid blood', ['hijdra']],
  ['edinburgh ct criteria amyloid angiopathy', ['edinburgh-caa']],
  ['fried frailty phenotype criteria', ['fried-frailty']],
  ['university of texas diabetic foot ulcer classification', ['ut-diabetic-foot']],
  ['pedis classification diabetic foot', ['pedis']],
  ['ocular trauma score visual prognosis eye injury', ['ocular-trauma-score']],
  ['areds simplified severity scale macular degeneration', ['areds']],
  ['frisen scale papilledema grading', ['frisen']],
  ['who oral mucositis grade', ['who-mucositis']],
  ['erefs endoscopic reference score eosinophilic esophagitis', ['erefs']],
];

test(`every golden probe routes an acceptable tile into the top ${TOP_N}`, () => {
  const failures = [];
  for (const [query, want] of PROBES) {
    const r = findCalculator({ query, limit: 5 });
    const idx = (r.candidates || []).findIndex((c) => want.includes(c.id));
    if (idx === -1 || idx >= TOP_N) {
      failures.push({
        query,
        want,
        got: (r.candidates || []).slice(0, TOP_N).map((c) => c.id),
        rank: idx === -1 ? null : idx + 1,
      });
    }
  }
  assert.deepEqual(failures, [], `search-relevance regressions:\n${JSON.stringify(failures, null, 2)}`);
});

test('probe hygiene: queries unique, want lists non-empty', () => {
  const seen = new Set();
  for (const [query, want] of PROBES) {
    assert.ok(!seen.has(query), `duplicate probe: ${query}`);
    seen.add(query);
    assert.ok(Array.isArray(want) && want.length > 0, `empty want for: ${query}`);
    assert.equal(query, query.toLowerCase().trim(), `probe not normalized: ${query}`);
  }
});

// The three probe-surfaced gaps the v11 synonym batch fixed must stay
// synonym-routed (not just ranker-lucky): regression pins for the new phrases.
test('v11 synonym batch: the probe-surfaced gaps route via synonyms', () => {
  for (const [query, id] of [
    ['sepsis screen', 'qsofa-sofa'],
    ['sedation scale', 'rass'],
    ['afib bleeding risk', 'hasbled'],
  ]) {
    const r = findCalculator({ query, limit: 3 });
    assert.equal(r.candidates[0].id, id, `${query} -> ${id}`);
    assert.equal(r.candidates[0].why, 'synonym', `${query} should synonym-route`);
  }
});
