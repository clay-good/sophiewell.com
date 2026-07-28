// spec-v552: the 22-item Sino-Nasal Outcome Test (SNOT-22). "snot", "snot-22", "sinonasal" and
// "outcome-test" were all zero-hit across corpus.json, app.js and lib/meta.js.
//
// A COMPANION TO THE EXISTING RHINOSINUSITIS TILE, ON A DIFFERENT AXIS. `lund-mackay` stages the CT scan.
// SNOT-22 asks the PATIENT. The two correlate poorly by design -- a near-normal CT can accompany a severe
// symptom burden and the reverse -- so this is not a duplicate, and the tile says so rather than letting a
// reader treat one as a proxy for the other.
//
// TWENTY-TWO ITEMS, EACH 0-5, TOTAL 0-110. Higher is worse. The recall period is fixed at the past two
// weeks and is part of the instrument, not a setting.
//
// **THE FORM'S SECOND QUESTION IS A DESCRIPTOR AND IS NEVER SCORED.** The instrument asks the patient to
// mark the most important items affecting their health, up to five. That is a separate checkbox column. It
// does NOT enter the total, is not weighted, and does not modify any item's contribution. A tile that
// summed or up-weighted the ticked items would report a number that is not a SNOT-22 score, so this lib
// accepts the selection, caps it at five, and returns it strictly alongside the total.
//
// **A SCORE BELOW 8 HAS NO NAMED BAND, AND IS NOT "MILD".** The stratification defines mild as 8 to 20
// inclusive, moderate as above 20 up to 50, and severe as above 50. Nothing is defined below 8; the source
// describes such a score as having no clinically significant symptoms. Rounding 0-7 down into "mild" would
// invent a band the source does not contain and would put a symptom-free patient in the same category as
// one scoring 20, so this lib returns a distinct band for it and marks `namedBand: false`.
//
// **THE BANDS ARE EXTERNALLY DERIVED AND THE INSTRUMENT ITSELF DEFINES NONE.** The 22 items and their
// response scale are the Washington University instrument; the mild/moderate/severe cut points come from a
// separate 2016 stratification study of 65 patients. They are reported here labeled as that study's
// proposal rather than as part of the questionnaire, because a reader who believes the instrument ships
// with severity bands will over-trust them.
//
// THE MINIMAL CLINICALLY IMPORTANT DIFFERENCE IS A PROPERTY OF A COMPARISON, NOT OF A SINGLE SCORE. An
// absolute difference of 8.9 or more between two SNOT-22 scores is considered clinically meaningful. It
// says nothing about whether one score is high, so the lib exposes it as a constant and the result states
// what it applies to, rather than attaching it to a lone total where it would read as a threshold.
//
// HIGH-STAKES: a patient-reported symptom measure. It does NOT diagnose chronic rhinosinusitis, which
// requires symptom duration plus objective confirmation by endoscopy or CT, and it does not distinguish
// rhinosinusitis from allergic rhinitis, migraine, or the other causes of facial pain and nasal symptoms.
// Many of its items -- sleep, fatigue, concentration, sadness -- are not specific to the nose at all and
// move with depression, sleep disorders and general health, so a high total is not by itself evidence of
// sinus disease. It is not an indication for surgery and does not select medical therapy (spec-v11 section
// 5.3). The clinical decision stays with the clinician.
//
// ITEMS, RESPONSE ANCHORS AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed word for word from
// the copyright-bearing instrument and verified against an independent reproduction with an identical item
// list, with the stratification taken from its own source:
//   - SNOT-20 Copyright 1996 Jay F. Piccirillo MD, Washington University School of Medicine. SNOT-22
//     developed from modification of the SNOT-20 by the National Comparative Audit of Surgery for Nasal
//     Polyposis and Rhinosinusitis, Royal College of Surgeons of England. Copyright 2006, Washington
//     University in St. Louis.
//   - Hopkins C, Gillett S, Slack R, Lund VJ, Browne JP. Psychometric validity of the 22-item Sinonasal
//     Outcome Test. Clin Otolaryngol. 2009;34(5):447-454.
//   - Toma S, Hopkins C. Stratification of SNOT-22 scores into mild, moderate or severe and relationship
//     with other subjective instruments. Rhinology. 2016.

export const SNOT22_ITEMS = [
  { key: 'blowNose', text: 'Need to blow nose' },
  { key: 'nasalBlockage', text: 'Nasal blockage' },
  { key: 'sneezing', text: 'Sneezing' },
  { key: 'runnyNose', text: 'Runny nose' },
  { key: 'cough', text: 'Cough' },
  { key: 'postNasalDischarge', text: 'Post-nasal discharge' },
  { key: 'thickDischarge', text: 'Thick nasal discharge' },
  { key: 'earFullness', text: 'Ear fullness' },
  { key: 'dizziness', text: 'Dizziness' },
  { key: 'earPain', text: 'Ear pain' },
  { key: 'facialPain', text: 'Facial pain/pressure' },
  { key: 'smellTaste', text: 'Decreased sense of smell/taste' },
  { key: 'fallingAsleep', text: 'Difficulty falling asleep' },
  { key: 'wakeAtNight', text: 'Wake up at night' },
  { key: 'poorSleep', text: 'Lack of a good night’s sleep' },
  { key: 'wakeTired', text: 'Wake up tired' },
  { key: 'fatigue', text: 'Fatigue' },
  { key: 'productivity', text: 'Reduced productivity' },
  { key: 'concentration', text: 'Reduced concentration' },
  { key: 'irritable', text: 'Frustrated/restless/irritable' },
  { key: 'sad', text: 'Sad' },
  { key: 'embarrassed', text: 'Embarrassed' },
];

// The response anchors are the instrument's own wording.
export const SNOT22_OPTIONS = [
  { value: 0, text: 'No problem' },
  { value: 1, text: 'Very mild problem' },
  { value: 2, text: 'Mild or slight problem' },
  { value: 3, text: 'Moderate problem' },
  { value: 4, text: 'Severe problem' },
  { value: 5, text: 'Problem as bad as it can be' },
];

export const SNOT22_MAX = 110;
export const SNOT22_MCID = 8.9;
export const MOST_IMPORTANT_LIMIT = 5;
export const RECALL_PERIOD = 'The past two weeks.';

// Toma and Hopkins 2016. Nothing is defined below 8.
const BANDS = [
  { max: 7, label: 'Below the mild threshold', named: false, text: 'Below the lowest defined band. The stratification defines nothing under 8, and describes a score in this range as having no clinically significant symptoms. This is NOT the mild band.' },
  { max: 20, label: 'Mild', named: true, text: 'Mild, defined as 8 to 20 inclusive.' },
  { max: 50, label: 'Moderate', named: true, text: 'Moderate, defined as above 20 and up to 50.' },
  { max: SNOT22_MAX, label: 'Severe', named: true, text: 'Severe, defined as above 50.' },
];

const BANDS_PROVENANCE = 'The severity bands are not part of the questionnaire, which defines none. They come from a separate 2016 stratification study of 65 patients and are reported as that study’s proposal.';

const MCID_TEXT = `A minimal clinically important difference of ${SNOT22_MCID} applies to the DIFFERENCE between two SNOT-22 scores from the same patient, not to a single total. It says nothing about whether one score is high.`;

const NOT_SCORED = 'The items marked as most important are a descriptor recorded alongside the total. They are not summed, not weighted, and do not change any item’s contribution.';

const NOTE = 'The 22-item Sino-Nasal Outcome Test asks the patient to rate 22 symptoms and consequences of rhinosinusitis over the past two weeks, each from 0 for no problem to 5 for a problem as bad as it can be, giving a total from 0 to 110 where higher is worse. It is a companion to the Lund-Mackay CT stage rather than a duplicate of it: that grades what the scan shows, this asks the patient, and the two correlate poorly by design, so a near-normal CT can accompany a severe symptom burden and the reverse. The form’s second question, asking the patient to mark up to five most important items, is a descriptor and is never scored: it is not summed or weighted, and a total that included it would not be a SNOT-22 score. A score below 8 has no named band and is not mild. The stratification defines mild as 8 to 20 inclusive, moderate as above 20 up to 50, and severe as above 50, and describes a score under 8 as having no clinically significant symptoms, so rounding 0 to 7 into mild would invent a band the source does not contain. Those bands are not part of the questionnaire, which defines none; they come from a separate 2016 stratification study of 65 patients and are reported as that study’s proposal. A minimal clinically important difference of 8.9 applies to the difference between two scores from the same patient rather than to a single total. This is a patient-reported symptom measure. It does not diagnose chronic rhinosinusitis, which requires symptom duration together with objective confirmation by endoscopy or CT, and it does not distinguish rhinosinusitis from allergic rhinitis, migraine, or the other causes of facial pain and nasal symptoms. Many of its items, including sleep, fatigue, concentration and sadness, are not specific to the nose and move with depression, sleep disorders and general health, so a high total is not by itself evidence of sinus disease. It is not an indication for surgery and does not select medical therapy.';

function readItem(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > 5) return NaN;
  return n;
}

function bandFor(total) {
  return BANDS.find((b) => total <= b.max);
}

// input:
//   one key per item in SNOT22_ITEMS, each 0-5. All 22 required.
//   mostImportant -- optional array (or comma-separated string) of item keys the patient marked as most
//                    important. Recorded, never scored, capped at five.
export function snot22(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = SNOT22_ITEMS.map((item) => ({ item, points: readItem(o[item.key]) }));

  const missing = scored.filter((s) => s.points === null);
  if (missing.length) {
    return { valid: false, message: `Rate all 22 items from 0 to 5. Still needed: ${missing.map((s) => s.item.key).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.points));
  if (bad.length) {
    return { valid: false, message: `Each item must be a whole number from 0 to 5. Unrecognized: ${bad.map((s) => s.item.key).join(', ')}.` };
  }

  const total = scored.reduce((a, s) => a + s.points, 0);
  const band = bandFor(total);

  const rawImportant = o.mostImportant;
  let mostImportant = [];
  if (Array.isArray(rawImportant)) mostImportant = rawImportant.slice();
  else if (typeof rawImportant === 'string' && rawImportant.trim() !== '') mostImportant = rawImportant.split(',');

  const validKeys = new Set(SNOT22_ITEMS.map((i) => i.key));
  mostImportant = mostImportant
    .map((k) => String(k).trim())
    .filter((k) => validKeys.has(k));
  const overLimit = mostImportant.length > MOST_IMPORTANT_LIMIT;
  mostImportant = mostImportant.slice(0, MOST_IMPORTANT_LIMIT);

  return {
    valid: true,
    total,
    max: SNOT22_MAX,
    band: band.label,
    namedBand: band.named,
    mostImportant,
    mostImportantTruncated: overLimit,
    mcid: SNOT22_MCID,
    recallPeriod: RECALL_PERIOD,
    bandLabel: `SNOT-22 ${total} of ${SNOT22_MAX}, ${band.label.toLowerCase()}`,
    bandText: `SNOT-22 ${total} of ${SNOT22_MAX}. ${band.text} ${BANDS_PROVENANCE} ${MCID_TEXT}${mostImportant.length ? ` ${NOT_SCORED}` : ''} It measures symptom burden reported by the patient and does not diagnose rhinosinusitis or indicate surgery.`,
    note: NOTE,
  };
}
