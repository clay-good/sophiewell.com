// Search-relevance golden set. Runs 118 realistic clinical queries through the
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
