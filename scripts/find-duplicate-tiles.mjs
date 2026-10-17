#!/usr/bin/env node
// spec-v913: find tiles that are the SAME instrument twice.
//
// Run: node scripts/find-duplicate-tiles.mjs
//
// This is a FINDER, not a gate. It reports candidate pairs and a human decides; the four
// duplicates it was written to surface were all confirmed by reading both adapters, and three
// other pairs that looked identical by every automatic signal turned out to be deliberate.
//
// Why it is not automatic:
//
//   Comparing COMPUTED OUTPUT over the whole input space is too coarse. Any two tiles that
//   return a plain 0..N total match each other -- the first cut paired Guy's stone score with an
//   anaphylaxis grade.
//
//   Comparing DECLARED INPUT SIGNATURES is too narrow. The same instrument gets built twice with
//   different field counts and different unit toggles, so three of the four real duplicates have
//   different signatures and this misses them.
//
//   What actually works is the tile NAME. Two authors building the same instrument years apart
//   write nearly the same name, because the instrument has a name.
//
// So: normalize names, drop the words every tile shares, and report pairs above a similarity
// floor. It is deliberately noisy -- most hits are legitimate families (ICHD-3 has seven, the
// RADS reporting systems several) -- and the reader is expected to reject most of them.
//
// spec-v972 adds a second way in. The name only works when both authors wrote nearly the same
// name, and four duplicates in the catalog were named differently enough to score 0.13 to 0.50
// -- all under the floor. What gave those away is the CITATION: one tile's citation text is the
// other's, verbatim, with a clause added. A pair now reaches the backlog on either signal.
//
// The floor is 0.55 rather than 0.6 because one of the four confirmed duplicates sits at 0.57:
// "University of Texas Diabetic Foot WOUND Classification" against "University of Texas Diabetic
// Foot ULCER Class". One word apart on the thing they both name, and a 0.6 floor hid it.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { META } from '../lib/meta.js';

const CORPUS = fileURLToPath(new URL('../data/search-corpus/corpus.json', import.meta.url));

// Words that appear in so many tile names that they carry no signal about which instrument
// this is.
const STOP = new Set([
  'the', 'of', 'and', 'for', 'in', 'a', 'an', 'score', 'scale', 'index', 'criteria',
  'classification', 'system', 'tool', 'grade', 'grading', 'staging', 'stage', 'risk', 'rule',
  'test', 'assessment', 'calculator', 'model', 'definition', 'definitions',
]);

// spec-v972: an apostrophe is DELETED, not turned into a space. Every other punctuation mark
// separates two words; a possessive does not. "King's Score" split into `king` + `s`, the `s`
// was dropped for being too short, and the tile scored ZERO against "Kings Score" -- the same
// instrument, spelled the other way, invisible to every reading of the name. Deleting the mark
// first makes both read `kings`.
const APOSTROPHES = /['\u2018\u2019\u02bc]/g;

// The parenthetical is dropped: it is where a tile says which VARIANT it is, and two tiles of
// the same instrument routinely disagree there while naming the same thing.
export function nameKey(name) {
  const base = String(name).toLowerCase().replace(APOSTROPHES, '')
    .replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9 ]/g, ' ');
  return [...new Set(base.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))].sort();
}

// spec-v947: and the same key with the parenthetical KEPT. Dropping it is right when the
// parenthetical says which variant a tile is; it is wrong when the parenthetical holds the
// instrument's name and an acronym stands outside it. "Cincinnati Prehospital Stroke Scale"
// against "CPSS (Cincinnati Prehospital Stroke Scale)" scores 0 on the dropped key and 0.80 on
// this one -- and those two tiles are the same instrument, built twice. Every pair is scored
// both ways and keeps the higher score.
export function nameKeyWithParens(name) {
  const base = String(name).toLowerCase().replace(APOSTROPHES, '').replace(/[^a-z0-9 ]/g, ' ');
  return [...new Set(base.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))].sort();
}

export function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  const shared = a.filter((w) => b.includes(w)).length;
  return shared / (a.length + b.length - shared);
}

// spec-v950: a second, independent signal -- do the two tiles cite the SAME PAPER? It is much
// sharper than the name, and on its own it is not evidence of a duplicate: one guideline
// routinely defines several distinct instruments (TG18 grades diagnosis and severity; the SUN
// group grades cell and flare). Every pair that scored on both signals turned out to be a
// companion, so this is reported next to the score rather than used to widen the net -- it
// tells the reader WHY a pair matched, which is what makes a pair quick to rule on.
export function sharesSource(aId, bId, meta = META) {
  const links = (id) => {
    const m = meta[id] || {};
    return new Set([m.citationUrl, ...(m.citationUrls || []).map((e) => e.url)]
      .filter(Boolean).map((u) => u.toLowerCase()));
  };
  const a = links(aId);
  return [...links(bId)].some((u) => a.has(u));
}

// nameScore(a, b) -> number. The higher of the two readings of the name.
export function nameScore(a, b) {
  return Math.max(similarity(a.key, b.key), similarity(a.keyParens, b.keyParens));
}

// spec-v972: a THIRD signal, and the only one that reaches a duplicate whose two authors named
// it differently. `qtc` is "QTc Correction" and `qtc-suite` is "QTc Suite (Bazett / Fridericia /
// Framingham / Hodges)" -- 0.33 on the name, far under the floor, and the same four formulas on
// the same two inputs. What gives them away is the CITATION: one tile's citation text is the
// other's, verbatim, with a sentence added.
//
// This is deliberately containment rather than token similarity. Token overlap on citations
// fires on every guideline family at once (the ACC/AHA valvular guideline alone stages six
// lesions from one reference) and buries the signal. Whole-string containment says something
// much narrower: one of these two citations was WRITTEN FROM THE OTHER. It reports 36 pairs
// across the whole catalog, of which the valve, growth-chart and Tokyo-Guidelines families are
// the bulk -- a readable backlog rather than a screenful.
//
// The 40-character floor keeps out the short citations ("Bazett 1920.") that are contained in
// dozens of others by accident.
const CITATION_FLOOR = 40;

export function citationKey(citation) {
  return String(citation || '').toLowerCase()
    .replace(APOSTROPHES, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// citesTheSame(a, b) -> bool. Is the shorter citation contained whole in the longer?
export function citesTheSame(aCitation, bCitation) {
  const a = citationKey(aCitation);
  const b = citationKey(bCitation);
  if (a.length < CITATION_FLOOR || b.length < CITATION_FLOOR) return false;
  return a.length <= b.length ? b.includes(a) : a.includes(b);
}

// spec-v956: the two readings DISAGREEING is itself the signal, and it points both ways.
//
//   dropped high, kept low   the parenthetical is the only thing telling them apart, so it is
//                            carrying the instrument's identity: "ATLAS Score (C. difficile
//                            Infection)" against "ATLAS Score (AF Recurrence After PVI)". An
//                            acronym collision, and almost never a duplicate.
//
// The other direction needs a sharper test than "kept high, dropped low". That fires on any two
// tools sharing a clinical domain -- "Egami Score (IVIG Resistance, Kawasaki)" against
// "Kobayashi Score (IVIG Resistance, Kawasaki)" are two different instruments for one problem.
// The shape that actually hides duplicates is narrower: ONE TILE'S PARENTHETICAL CONTAINS THE
// OTHER TILE'S WHOLE NAME. "CPSS (Cincinnati Prehospital Stroke Scale)" against "Cincinnati
// Prehospital Stroke Scale" -- an acronym outside, the same instrument spelled out inside.
//
// Naming the shape is what makes a 100-pair backlog readable: a reader can dismiss a family at
// a glance instead of opening two adapters to learn what the names already said.

// outsideKey / parenKey(name) -> sorted distinctive tokens either side of the parentheses.
export function outsideKey(name) {
  return nameKey(name);
}

export function parenKey(name) {
  const inside = [...String(name).matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(' ');
  const base = inside.toLowerCase().replace(APOSTROPHES, '').replace(/[^a-z0-9 ]/g, ' ');
  return [...new Set(base.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))].sort();
}

// namesTheOther(a, b) -> bool. Does either tile's parenthetical hold the other's whole name?
// The other name must be at least two distinctive words: "MELD-Na (Sodium-Augmented MELD)" and
// "MELD-XI (MELD excluding INR)" each hold the other's single surviving token, `meld`, and are
// obviously not the same instrument. One shared word is a family name, not an identity.
export function namesTheOther(a, b) {
  const holds = (paren, outside) => outside.length >= 2 && paren.length > 0
    && outside.every((w) => paren.includes(w));
  return holds(parenKey(a.name), outsideKey(b.name)) || holds(parenKey(b.name), outsideKey(a.name));
}

export function pairShape(a, b) {
  if (namesTheOther(a, b)) return 'NAMES THE OTHER IN PARENTHESES';
  if (citesTheSame(a.citation, b.citation)) return 'ONE CITATION CONTAINS THE OTHER';
  const dropped = similarity(a.key, b.key);
  const kept = similarity(a.keyParens, b.keyParens);
  if (dropped >= 0.8 && kept <= 0.5) return 'ACRONYM COLLISION';
  return '';
}

export function candidatePairs(corpus, floor = 0.55, meta = META) {
  const rows = Object.entries(corpus).map(([id, r]) => ({
    id, name: r.name, key: nameKey(r.name), keyParens: nameKeyWithParens(r.name),
    citation: (meta[id] || {}).citation,
  }));
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const score = nameScore(rows[i], rows[j]);
      // spec-v972: a pair reaches the backlog on EITHER signal. The citation route is what a
      // name score under the floor cannot do on its own.
      const sameCitation = citesTheSame(rows[i].citation, rows[j].citation);
      if (score >= floor || sameCitation) out.push({ score, sameCitation, a: rows[i], b: rows[j] });
    }
  }
  return out.sort((x, y) => y.score - x.score);
}

// Pairs already read and ruled on, so a re-run shows only what is new. A verdict here is a
// claim that someone opened both adapters. The four RETIRED entries no longer appear in the
// corpus and so no longer match; they stay as the record of what was removed and why.
// claim that someone opened both adapters.
export const RULED = new Map(Object.entries({
  'forrest|forrest-classification': 'RETIRED in spec-v914 -- one instrument, one input, same six classes.',
  'gbs|glasgow-blatchford': 'RETIRED in spec-v914 -- the same Blatchford 2000 score; the survivor takes urea in either unit.',
  'osi-oxygenation|oxygenation-index': 'RETIRED in spec-v914 -- the survivor returns the same OSI and the same band, and an OI besides.',
  'university-texas-dfu|ut-diabetic-foot': 'RETIRED in spec-v914 -- the same grade-by-stage grid; the survivor is the fuller build.',
  'npiap-staging|pressure-injury-stage': 'DISTINCT -- one DERIVES the stage from observations, the other explains a stage already assigned.',
  'benzo-equiv|benzodiazepine-equivalence': 'DISTINCT -- overlapping, but benzo-equiv carries midazolam and the other does not.',
  'unit-converter|unit-converter-v4': 'DISTINCT -- overlapping, but unit-converter carries volume and unit-converter-v4 does not.',
  'kings-college|kings-college-nonapap': 'DISTINCT -- the two ARMS of one rule, and they share no variables: the acetaminophen arm turns on arterial pH, creatinine and encephalopathy grade, the other on INR, age, cause, jaundice interval and bilirubin (spec-v910).',

  // spec-v947: the four the parenthetical rule had been hiding. Each pair was confirmed by
  // reading both adapters -- same source, same items, same threshold, and in two cases the same
  // worked-example number to the decimal. Retirement is spec-v948.
  'cincinnati|cpss': 'DUPLICATE -- one CPSS: the same three items from Kothari 1999 and the same >=1-abnormal rule. Survivor cpss (it carries the interpretation bands; cincinnati has none).',
  'abc-mtp|abc-transfusion-score': 'DUPLICATE -- one ABC score: the same four Nunez 2009 items and the same >=2 threshold. Survivor abc-transfusion-score (its bands carry the derivation sensitivity and specificity).',
  'hodgkin-ips|ips-hodgkin': 'DUPLICATE -- one Hasenclever IPS: the same seven adverse factors. Survivor hodgkin-ips (its bands give freedom-from-progression per band; ips-hodgkin lists the factors instead of interpreting the score).',
  'sort|sort-mortality': 'DUPLICATE -- one SORT model, coefficient for coefficient, and both worked examples return 14.67%. Survivor sort-mortality (its name says what the number is).',

  // spec-v950: the pairs that are name-similar AND cite the same paper -- the sharpest signal
  // there is, and every one of them turned out to be a COMPANION rather than a duplicate. One
  // guideline or one paper routinely defines several distinct instruments, and the catalog
  // splits them on purpose. Recorded so the finder stops asking.
  'homa-beta|homa-ir': 'DISTINCT -- one HOMA paper, two quantities: beta-cell function and insulin resistance.',
  'spina-gd|spina-gt': 'DISTINCT -- one SPINA paper, two constants: deiodinase activity and thyroid secretory capacity.',
  'nexus-chest|nexus-chest-ct': 'DISTINCT -- the chest-radiograph rule and the chest-CT rule, different criteria sets from the same NEXUS programme.',
  'cholangitis-diagnosis|cholangitis-severity': 'DISTINCT -- TG18 defines diagnosis and severity separately; one says whether, the other says how bad.',
  'cholecystitis-diagnosis|cholecystitis-severity': 'DISTINCT -- same TG18 split as the cholangitis pair.',
  'cholangitis-diagnosis|cholecystitis-diagnosis': 'DISTINCT -- two diseases, one guideline.',
  'cholangitis-severity|cholecystitis-severity': 'DISTINCT -- two diseases, one guideline.',
  'aortic-regurgitation-stage|aortic-stenosis-stage': 'DISTINCT -- two lesions staged by one ACC/AHA guideline.',
  'aortic-stenosis-stage|mitral-stenosis-stage': 'DISTINCT -- two valves staged by one ACC/AHA guideline.',
  'mitral-regurgitation-stage|secondary-mitral-regurgitation-stage': 'DISTINCT -- primary and secondary MR are staged on different variables in the same guideline.',
  'concussion-rtl|concussion-rts': 'DISTINCT -- return to LEARN and return to SPORT are separate graduated ladders in one consensus statement.',
  'engel-classification|ilae-surgical-outcome': 'DISTINCT -- two competing outcome scales for the same operation, reported side by side in the literature.',
  'sun-ac-cell|sun-ac-flare': 'DISTINCT -- the SUN working group grades cell and flare on separate scales.',
  'cdc-stature-for-age|cdc-weight-for-age': 'DISTINCT -- two growth charts from one CDC reference.',
  'posas-observer-scar|posas-patient-scar': 'DISTINCT -- the observer and patient halves of POSAS are scored by different people.',
  'dme-severity|icdr-retinopathy': 'DISTINCT -- the ICDR scale grades retinopathy and macular edema separately.',
  'anion-gap-dd|delta-gap': 'DISTINCT -- overlapping arithmetic, but anion-gap-dd computes the gap itself and delta-gap the ratio against bicarbonate.',
  'ccsr|nexus-cspine': 'DISTINCT -- the single-rule tile and the combined tile that runs NEXUS and the Canadian rule together, the same shape as egfr / egfr-suite.',
  'wells-dvt|wells-dvt-caprini': 'DISTINCT -- the same single-rule / combined-suite shape.',

  // spec-v956: the only two unread pairs left in the shape that hides duplicates. Both read.
  // spec-v972: the pairs the CITATION signal reached. Four of them are the same instrument built
  // twice -- and not one was visible to the name: the highest name score among them is 0.50 and
  // the lowest is 0.13. Every verdict below comes from opening both renderers and both library
  // functions. Retirement of the four is spec-v973.
  'king-score|kings-score': "DUPLICATE -- one King's Score (Cross 2009): the same four inputs, the same (age x AST x INR) / platelets, the same 12.3 and 16.7 cut-points. Survivor king-score (its three bands are ranges rather than a formula row, and it cites the DOI).",
  'qtc|qtc-suite': 'DUPLICATE -- one QTc tile twice. Both take a QT in milliseconds and a heart rate and return Bazett, Fridericia, Framingham and Hodges from the same constants; qtc-suite is not the suite half of a single-rule/suite pair, because qtc already returns all four. Survivor qtc (it carries the plain-language synonyms and the shorter id; the prefill template, which had been pointing at qtc-suite while search pointed at qtc, moves to it).',
  'four-ts|four-ts-hit': 'DUPLICATE -- one Lo 2006 4Ts score, the same four criteria scored 0-2 to a total out of 8. Survivor four-ts-hit (each criterion is a select whose options print the level in full, and it carries the rule-out testing advice; four-ts crams all three levels of a criterion into one label). four-ts holds the derivation panel, which must be TRANSPLANTED and not copied -- the two call different scoring functions.',
  'bsa_burn|lund-browder': "DUPLICATE -- both cite Lund-Browder 1944 for %TBSA. Survivor lund-browder: bsa_burn's Lund-Browder mode carries no age chart at all -- it sums percentages the reader has been asked to age-adjust by hand -- while lund-browder holds the age bands and returns the Rule of Nines cross-check besides.",
  'ebv-mabl|max-allowable-blood-loss': 'DUPLICATE, BLOCKED -- one Gross 1983 dilution formula, and both tiles return the estimated blood volume and the allowable loss. But their blood-volume factor tables DISAGREE: neonate 85 mL/kg against 90, child 70 against 75. Retiring either changes the answer for those patients, so per spec-v97 this needs a source for the factor table before anything is removed.',

  // The families the citation signal also surfaces. One reference routinely defines several
  // instruments, so containment is expected here and says nothing about duplication.
  'aortic-regurgitation-stage|tricuspid-regurgitation-stage': 'DISTINCT -- two lesions staged by one ACC/AHA valvular guideline.',
  'aortic-regurgitation-stage|mitral-stenosis-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'aortic-regurgitation-stage|mitral-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'aortic-regurgitation-stage|secondary-mitral-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'mitral-regurgitation-stage|mitral-stenosis-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'mitral-regurgitation-stage|tricuspid-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'mitral-stenosis-stage|secondary-mitral-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'secondary-mitral-regurgitation-stage|tricuspid-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'aortic-stenosis-stage|tricuspid-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'mitral-stenosis-stage|tricuspid-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'aortic-stenosis-stage|mitral-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'aortic-stenosis-stage|secondary-mitral-regurgitation-stage': 'DISTINCT -- same ACC/AHA valve grid.',
  'cdc-stature-for-age|peds-bmi-percentile': 'DISTINCT -- three charts from one CDC 2000 reference; the third is BMI-for-age.',
  'cdc-weight-for-age|peds-bmi-percentile': 'DISTINCT -- three charts from one CDC 2000 reference.',
  'abi|toe-brachial-index': 'DISTINCT -- the ankle and the toe index from one measurement standard. The toe index is what is read when medial calcification makes the ankle pressure incompressible, which is the case the ankle index cannot answer.',
  'dka-hhs|dka-resolution': 'DISTINCT -- one Kitabchi 2009 paper, two questions: which hyperglycemic crisis this is and how severe on arrival, against whether it has resolved.',
  'dka-resolution|effective-osmolality': 'DISTINCT -- the resolution checklist against the single tonicity value the HHS criteria turn on.',
  'pfdi20|pfiq7': 'DISTINCT -- the Barber 2005 pair of short forms: the distress inventory and the impact questionnaire measure different things and are scored separately.',
  'crs-grade|icans-grade': 'DISTINCT -- ASTCT grades cytokine release syndrome and neurotoxicity on two separate scales in one consensus.',
  'atlanta-pancreatitis|modified-marshall': 'DISTINCT -- the revised Atlanta severity class against the organ-failure score it takes as an input.',
  'completeness-cytoreduction|peritoneal-cancer-index': 'DISTINCT -- Sugarbaker measures extent of disease before the operation and residual disease after it.',

  'cam|cam-icu': 'DISTINCT -- Inouye 1990 for a patient who can be interviewed, Ely 2001 for a ventilated one who cannot. Different papers, different validation populations, different fields.',
  'tyg-bmi|tyg-index': 'DISTINCT -- Simental-Mendia 2008 takes two inputs and returns ~8.9; Er 2016 multiplies by BMI, takes three, and returns ~223. One is the other times a third variable, which makes it a different instrument on a different scale.',
  'hatch-af|hatch-score': 'RETIRED in spec-v1642 -- one de Vos 2010 score; the survivor follows the paper\'s derived rule and points table (age over 75), the retired tile its methods text (75 and older).',
  'hill-flap-valve|hill-grade': 'RETIRED in spec-v1642 -- one Hill 1996 grade, same four classes from one input.',
  // spec-v1642: the 122 pairs the finder had reported since spec-v972 without a ruling, read on October 17,
  // 2026. Two more were the same tile twice and are retired, not listed: hatch-af into hatch-score and
  // hill-flap-valve into hill-grade.
  'abc-psi|abc-transfusion-score': 'DISTINCT -- shoulder instability class against a massive-transfusion score; one acronym, two fields.',
  'ao-spine-subaxial|slic-score': 'DISTINCT -- two subaxial cervical systems: AO Spine (2016) morphology types against SLIC (2007) points.',
  'aspects|pc-aspects': 'DISTINCT -- anterior-circulation ASPECTS against the posterior-circulation score, different territories.',
  'atlas-cdi|atlas-score': 'DISTINCT -- C. difficile severity against AF recurrence after ablation; one acronym.',
  'bi-rads|c-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'bi-rads|ni-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'boston-caa|boston-febrile': 'DISTINCT -- cerebral amyloid angiopathy criteria against the febrile-infant rule; one name.',
  'braden|braden-q': 'DISTINCT -- adult Braden against the pediatric Braden Q, which adds tissue perfusion and oxygenation.',
  'c-rads|ni-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'cdai-crohns|cdai-ra': 'DISTINCT -- Crohn\'s Disease Activity Index against the rheumatoid Clinical Disease Activity Index; one acronym.',
  'cluster-headache-ichd3|indomethacin-headache-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'cluster-headache-ichd3|migraine-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'cluster-headache-ichd3|moh-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'cluster-headache-ichd3|sunct-suna-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'cluster-headache-ichd3|tension-headache-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'cluster-headache-ichd3|trigeminal-neuralgia-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'e-faced|faced-bronchiectasis': 'DISTINCT -- E-FACED adds prior exacerbations to FACED and has its own cutoffs.',
  'fast-dementia|fast-ed': 'DISTINCT -- Functional Assessment Staging of dementia against the FAST-ED stroke scale; one acronym.',
  'indomethacin-headache-ichd3|migraine-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'indomethacin-headache-ichd3|moh-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'indomethacin-headache-ichd3|sunct-suna-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'indomethacin-headache-ichd3|tension-headache-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'indomethacin-headache-ichd3|trigeminal-neuralgia-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'meld-na|meld-xi': 'DISTINCT -- MELD-XI leaves out the INR for anticoagulated patients; a different equation.',
  'meld-na|meld3': 'DISTINCT -- MELD 3.0 adds sex and albumin and refits the coefficients.',
  'meld-xi|meld3': 'DISTINCT -- different variables and coefficients; neither contains the other.',
  'mfi-11|mfi-5': 'DISTINCT -- the 11-item and 5-item frailty indices, different item sets and denominators.',
  'migraine-ichd3|moh-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'migraine-ichd3|sunct-suna-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'migraine-ichd3|tension-headache-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'migraine-ichd3|trigeminal-neuralgia-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'moh-ichd3|sunct-suna-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'moh-ichd3|tension-headache-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'moh-ichd3|trigeminal-neuralgia-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'nen-who-grade|systemic-mastocytosis': 'DISTINCT -- neuroendocrine tumor grade against mastocytosis criteria; a shared WHO word.',
  'npass|pass-asthma': 'DISTINCT -- neonatal pain scale against pediatric asthma severity; one acronym.',
  'npass|pass-pheo': 'DISTINCT -- neonatal pain scale against the pheochromocytoma histology score; one acronym.',
  'p-possum|possum': 'DISTINCT -- Portsmouth POSSUM refits the mortality equation; the same physiology inputs give a different risk.',
  'palliative-prognostic-index|palliative-prognostic-score': 'DISTINCT -- Morita\'s PPI against Pirovano\'s PaP, different items and bands.',
  'paprosky-acetabular|paprosky-femoral': 'DISTINCT -- the acetabular and femoral halves of one system, different bone and types.',
  'partb-late-penalty|partd-late-penalty': 'DISTINCT -- Part B (10% per full 12 months) against Part D (1% of the national base premium per month); different rules.',
  'pass-asthma|pass-pheo': 'DISTINCT -- pediatric asthma severity against the pheochromocytoma histology score; one acronym.',
  'peradeniya-op|popq-staging': 'DISTINCT -- organophosphate poisoning scale against pelvic organ prolapse staging; letters only.',
  'pf-ratio|tpe-qt-ratio': 'DISTINCT -- oxygenation ratio against an ECG repolarization ratio; the word ratio.',
  'resp-acidosis-compensation|resp-alkalosis-compensation': 'DISTINCT -- opposite disorders with different expected-HCO3 rules.',
  'score2|score2-op': 'DISTINCT -- SCORE2 for ages 40-69 and SCORE2-OP for 70 and older, separate models.',
  'sows|sows-subjective': 'DISTINCT -- Gossop\'s 10-item short scale against Handelsman\'s 16-item subjective scale.',
  'sunct-suna-ichd3|tension-headache-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'sunct-suna-ichd3|trigeminal-neuralgia-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'tension-headache-ichd3|trigeminal-neuralgia-ichd3': 'DISTINCT -- two different ICHD-3 headache diagnoses, each with its own criteria; the shared suffix is the classification.',
  'timi|timi-risk-index': 'DISTINCT -- the TIMI UA/NSTEMI score against the heart-rate, age and blood-pressure index.',
  'warfarin-init-10mg|warfarin-init-5mg': 'DISTINCT -- the Kovacs 10 mg and Crowther 5 mg nomograms, different day-by-day doses.',
  'egpa-acr-eular-2022|gpa-acr-eular-2022': 'DISTINCT -- two vasculitides from one 2022 series, different items and thresholds.',
  'lai-antipsychotic-missed-dose|lai-antipsychotic-start': 'DISTINCT -- starting dose against the missed-dose rule from the same labels.',
  'aast-cholecystitis|cholecystitis-severity': 'DISTINCT -- AAST anatomic grade against the Tokyo TG18 clinical severity.',
  'asthma-control-test|childhood-act': 'DISTINCT -- the adult ACT against the childhood c-ACT, with caregiver items and its own cutoff.',
  'dipss-mf|dipss-plus-mf': 'DISTINCT -- DIPSS-Plus adds karyotype, platelets and transfusion need to DIPSS.',
  'lung-rads|o-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'myeloma-iss|myeloma-r-iss': 'DISTINCT -- R-ISS adds LDH and high-risk cytogenetics to ISS.',
  'allen-ferguson|ao-spine-subaxial': 'DISTINCT -- two subaxial classifications, mechanism-based against AO morphology.',
  'anion-gap|anion-gap-dd': 'DISTINCT -- overlapping, but anion-gap-dd carries the delta-delta ratio; the plain gap stays the common entry.',
  'anion-gap|urine-anion-gap': 'DISTINCT -- serum gap against urine gap, different specimen and use.',
  'asdas|basdai': 'DISTINCT -- ASDAS uses CRP or ESR in a weighted formula; BASDAI is six patient questions.',
  'bi-rads|cad-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'bi-rads|li-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'bi-rads|o-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'c-rads|cad-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'c-rads|li-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'c-rads|o-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'cad-rads|ni-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'calosha-indoor-heat|calosha-outdoor-heat': 'DISTINCT -- two regulations (8 CCR 3396 and 3395) with different triggers.',
  'calvert-carboplatin|chatelut-carboplatin': 'DISTINCT -- Calvert takes GFR; Chatelut estimates carboplatin clearance from creatinine, weight, age and sex.',
  'caregiver-strain-index|modified-caregiver-strain-index': 'DISTINCT -- the modified index scores three levels per item instead of yes/no.',
  'em-mdm|em-time': 'DISTINCT -- E/M level by medical decision making against by total time.',
  'ffs-1996|ffs-2011': 'DISTINCT -- the 1996 and revised 2011 Five-Factor Scores, different items.',
  'gcs|gcs-pupils': 'DISTINCT -- GCS-P subtracts the pupil score from the GCS; a different number.',
  'gcs|peds-gcs': 'DISTINCT -- the pediatric scale rewords the verbal and motor responses for children.',
  'gvhd-grade|magic-gvhd': 'DISTINCT -- modified Glucksberg against MAGIC staging, which changes the organ cutoffs.',
  'hama|hamd': 'DISTINCT -- anxiety against depression; different items.',
  'heffner|lepine': 'DISTINCT -- two different two-test rules for a pleural exudate without serum.',
  'li-rads|ni-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'ni-rads|o-rads': 'DISTINCT -- two different *-RADS reporting systems (organ, modality and categories differ); the shared suffix is the naming style.',
  'osmolal-gap|urine-osmolal-gap': 'DISTINCT -- serum gap against urine gap estimating urinary ammonium.',
  'pitt-bacteremia|qpitt': 'DISTINCT -- qPitt is a five-item reduction with its own threshold.',
  'acef|euroscore2': 'DISTINCT -- ACEF uses age, creatinine and EF; EuroSCORE II is an 18-factor logistic model.',
  'asp-payment|part-b-or-d': 'DISTINCT -- the Part B payment amount against which Part covers a drug.',
  'bap-65|decaf-score': 'DISTINCT -- two COPD exacerbation scores with different items.',
  'bard-score|hepamet-fibrosis': 'DISTINCT -- two fibrosis scores with different inputs and cutoffs.',
  'chalice|pecarn-head': 'DISTINCT -- two pediatric head-injury rules, different criteria.',
  'cll-ipi|cns-ipi': 'DISTINCT -- CLL prognosis against CNS relapse risk in lymphoma.',
  'deurenberg-body-fat|navy-body-fat': 'DISTINCT -- BMI-based against circumference-based estimates.',
  'egami|kobayashi-kawasaki': 'DISTINCT -- two IVIG-resistance scores with different items and cutoffs.',
  'egami|sano-kawasaki': 'DISTINCT -- two IVIG-resistance scores with different items.',
  'ehsani-index|sirdah-index': 'DISTINCT -- two red-cell index formulas with different cutoffs.',
  'ehsani-index|srivastava-index': 'DISTINCT -- two red-cell index formulas with different cutoffs.',
  'flipi-2|prima-pi': 'DISTINCT -- FLIPI-2 uses five factors; PRIMA-PI uses beta-2 microglobulin and marrow involvement.',
  'french-ttp|plasmic-ttp': 'DISTINCT -- the French score against PLASMIC, different items.',
  'iss-rts|triss': 'DISTINCT -- TRISS takes ISS and RTS as inputs to a survival probability.',
  'kobayashi-kawasaki|sano-kawasaki': 'DISTINCT -- two IVIG-resistance scores with different items.',
  'marshall-ct|rotterdam-ct': 'DISTINCT -- two CT classifications of brain injury, different categories.',
  'measles-case-def|pertussis-case-def': 'DISTINCT -- two diseases\' case definitions.',
  'metavir-activity|metavir-fibrosis': 'DISTINCT -- the activity grade and fibrosis stage, two axes of one system.',
  'mfp-refund-check|mfp-refund-reconcile': 'DISTINCT -- one claim against reconciling 835 files.',
  'myeloma-iss|myeloma-r2-iss': 'DISTINCT -- R2-ISS adds weighted cytogenetic and LDH factors.',
  'nottingham-grade|nottingham-prognostic-index': 'DISTINCT -- the histologic grade is one of the prognostic index\'s inputs.',
  'onkotev-score|protecht-score': 'DISTINCT -- two cancer VTE scores with different items.',
  'partd-exception-request|partd-redetermination-request': 'DISTINCT -- two different appeal letters.',
  'pass-asthma|pram-asthma': 'DISTINCT -- two pediatric asthma scores with different items.',
  'peds-dose|peds-weight-dose': 'DISTINCT -- an everyday-drug panel against resuscitation recipes.',
  'sinbad-score|wagner-dfu': 'DISTINCT -- SINBAD points against the Wagner grade.',
  'sirdah-index|srivastava-index': 'DISTINCT -- two red-cell index formulas with different cutoffs.',
  'tx-emergency-detention-clock|tx-emergency-detention-criteria': 'DISTINCT -- the deadlines against the criteria checklist.',
  'acr-eular-2010-ra|acr-eular-boolean': 'DISTINCT -- classification against remission.',
  'allen-ferguson|slic-score': 'DISTINCT -- mechanism classes against SLIC points.',
  'clif-c-aclf|nacseld-aclf': 'DISTINCT -- two ACLF definitions with different organ-failure criteria.',
  'dapsa|mda-psoriatic': 'DISTINCT -- a continuous activity score against a seven-item state.',
  'gca-acr-eular-2022|takayasu-acr-eular-2022': 'DISTINCT -- two vasculitides from one 2022 series.',
  'gpa-acr-eular-2022|mpa-acr-eular-2022': 'DISTINCT -- two vasculitides from one 2022 series.',
  'hpt-file-check|tic-file-check': 'DISTINCT -- hospital files against insurer files, different schemas.',
  'hf-gdmt-target-percent|hf-stages-abcd': 'DISTINCT -- dose targets against stages from one guideline.',
  'baveno-vii|hvpg': 'DISTINCT -- the Baveno rule-out against a measured pressure gradient.',
  'hepatopulmonary-syndrome|portopulmonary-hypertension': 'DISTINCT -- two pulmonary complications of liver disease from one task force.',
}));

function main() {
  const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
  const pairs = candidatePairs(corpus);
  let unruled = 0;
  for (const { score, a, b } of pairs) {
    const verdict = RULED.get(`${a.id}|${b.id}`) || RULED.get(`${b.id}|${a.id}`);
    if (verdict) {
      console.log(`${score.toFixed(2)}  ${a.id} / ${b.id}\n        ${verdict}`);
    } else {
      unruled++;
      const same = sharesSource(a.id, b.id) ? '   SAME SOURCE' : '';
      const shape = pairShape(a, b);
      console.log(`${score.toFixed(2)}  ${a.id} / ${b.id}   NOT YET RULED ON${shape ? `   ${shape}` : ''}${same}`);
      console.log(`        ${a.name}`);
      console.log(`        ${b.name}`);
    }
  }
  console.log(`\nfind-duplicate-tiles: ${pairs.length} candidate pairs, ${RULED.size} already ruled on, ${unruled} not yet read.`);
}

if (process.argv[1] && process.argv[1].endsWith('find-duplicate-tiles.mjs')) main();
