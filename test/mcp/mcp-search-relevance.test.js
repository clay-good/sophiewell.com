// Search-relevance golden set. Runs 75 realistic clinical queries through the
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
// Known limitations (deliberately NOT probed) -- both are acceptance tests
// for the deferred term-weighted (IDF/BM25-lite) ranker slice:
//   - a query naming two intents ("anticoagulation bleeding risk atrial
//     fibrillation") resolves by the synonym tie-break (shorter phrase wins),
//     so "atrial fibrillation" routes it to chads over hasbled;
//   - derivational forms don't fold ("when should i transfuse for anemia"
//     misses transfusion-threshold: transfuse vs transfusion). Only bare
//     plurals fold today -- the ing/ion pairs showed order-dependent noise;
//   - a typo repair that only TIES the literal reading is rejected by the
//     +3 margin gate ("heprin drip" stays on the drip tiles: heparin-nomogram
//     ties at 4), and a repair can't rescue a rank when the literal reading
//     is already strong ("wels criteria pe" sits rank 4). Both need
//     term-weighted (IDF) scoring to know "heparin" outweighs "drip".

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
