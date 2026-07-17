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
  ['ards oxygenation severity', ['pf-ratio', 'oxygenation-index', 'osi-oxygenation']],
  ['ventilator tidal volume ideal body weight', ['pbw-ardsnet']],
  ['rsbi wean vent', ['rsbi']],
  // question-phrased probes (unlocked by the scaffold-strip + plural fold,
  // plain-language-search 3.2/3.3): scaffolding tokens must not drown the
  // clinical terms, and bare plurals must fold.
  ['what is the score for pneumonia severity', ['curb-65', 'psi']],
  ['how do i correct sodium for high glucose', ['corrected-sodium', 'corrected-ca-na']],
  ['should i get a head ct for minor head injury', ['canadian-ct-head', 'nexus-head', 'pecarn-head', 'catch-head', 'chalice', 'cthr']],
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
