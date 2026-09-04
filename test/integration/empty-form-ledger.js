// spec-v1019: the tiles that answer a cleared form, and the reason each line is
// allowed to be here.
//
// This is a debt ledger, not a list of approvals. It was seeded from the sweep
// that spec-v1013 through spec-v1017 worked through: after those waves, these
// are the tiles that still produce a reading when every number field is empty.
// The great majority are legitimate -- a checklist instrument nobody has ticked
// really does score 0 (the Edmonton symptom assessment, the Roland-Morris, the
// Groningen frailty indicator), and a timer or a document generator has nothing
// to measure from a number field at all.
//
// The rule the gate enforces is about NEW tiles. A tile not on this list that
// answers an empty form fails, with the reading it produced, so the author sees
// the question spec-v1006 asked: is a blank field here a criterion the clinician
// answered "no" to, or a measurement nobody took?
//
// Removing a line is a fix and needs nothing. ADDING one needs a sentence in the
// pull request saying which of those two it is.
//
// spec-v1026: and the sweep now removes lines FOR you, by failing when one of
// these ids has stopped answering. Nine were stale the day that check was added
// -- every one a tile fixed between spec-v1013 and spec-v1025 whose line nobody
// went back to delete, which left nine tiles exempt from the gate that was meant
// to be protecting them.
export const ANSWERS_AN_EMPTY_FORM = new Set([
  // Its six clinical factors are pickers, and "no" is an answer: a patient with
  // congestive heart failure and diabetes scores 8 whether or not the contrast
  // volume has been decided yet. The two measurements it does need are guarded
  // in the library (spec-v1007).
  "mehran-cin",
  // spec-v1029 removed six lines from this list: ciwa, cows, pesi, charlson,
  // hospital-score and wells-pe-geneva. Each was a checklist with a MEASUREMENT
  // in it -- an age, a pulse, a count of admissions -- and the exemption written
  // for the checklist was covering the measurement too. A line here says the
  // blanks are answered criteria; check that it is true of every field, not the
  // ones that gave the tile its name.
  "aat-deficiency",
  "abc-scale",
  "acromegaly-biochem",
  "add-rs",
  "arc-hbr",
  "ascvd",
  "autoimmune-encephalitis",
  "bess-balance-error",
  "bristol-girth",
  "cancer-cachexia",
  "cdc-stature-for-age",
  "cdc-weight-for-age",
  "cf-diagnosis",
  "corrected-age",
  "digoxin",
  "easi",
  "em-time",
  "esas-symptom-assessment",
  "ewgsop2",
  "ews-escalation",
  "ghent-marfan",
  "groningen-frailty-indicator",
  "harris-hip-score",
  "harvey-bradshaw",
  "hf-ef-classification",
  "hiv-pep-occupational",
  "hlh-2004",
  "hpa-glaucoma",
  "igg4-rd-2020",
  "ihs4",
  "indomethacin-headache-ichd3",
  "intubation-difficulty-scale",
  "isth-bat",
  "kings-college",
  "magnesium-replacement",
  "masld-criteria",
  "mchat-rf",
  "membranous-risk",
  "midas",
  "migraine-ichd3",
  "mmt8-myositis",
  "moh-ichd3",
  "mswat",
  "mtp-tracker",
  "must-nutrition",
  "naloxone",
  "nhsn-vae",
  "pa-turnaround",
  "pasi",
  "pbac-hmb",
  // spec-v1029: it stays, and now it earns the line. Every finding here is a
  // criterion, so an untouched form really is a form of negatives; only the age
  // was being invented, and the tile no longer quotes an age-specific rate
  // without one.
  "pecarn-head",
  "peds-bmi-percentile",
  "peds-weight-conv",
  "pertussis-case-def",
  "pews",
  "posas-observer-scar",
  "posas-patient-scar",
  "prevent",
  "quintero-ttts",
  "restraint-timer",
  "rivermead-mobility-index",
  "roland-morris-disability",
  "rudas",
  "salt-score",
  "sea-guideline",
  "sepsis-bundle-clock",
  "systemic-mastocytosis",
  "tension-headache-ichd3",
  "timely-filing",
  "triple-i",
  "unit-converter-v4",
  "vasi",
  "vent-sbt-peep",
  "vis",
  "wat-1",
  "who-severe-malaria",
  "years-pe"
]);
