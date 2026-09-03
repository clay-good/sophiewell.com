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
export const ANSWERS_AN_EMPTY_FORM = new Set([
  // Its six clinical factors are pickers, and "no" is an answer: a patient with
  // congestive heart failure and diabetes scores 8 whether or not the contrast
  // volume has been decided yet. The two measurements it does need are guarded
  // in the library (spec-v1007).
  "mehran-cin",
  "aa-gradient",
  "aat-deficiency",
  "abc-scale",
  "acromegaly-biochem",
  "add-rs",
  "anion-gap-dd",
  "arc-hbr",
  "ascvd",
  "autoimmune-encephalitis",
  "bess-balance-error",
  "bristol-girth",
  "cancer-cachexia",
  "cdc-stature-for-age",
  "cdc-weight-for-age",
  "cf-diagnosis",
  "charlson",
  "ciwa",
  "code-blue-clock",
  "corrected-age",
  "cows",
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
  "hospital-score",
  "hpa-glaucoma",
  "hypothermia-rewarm",
  "igg4-rd-2020",
  "ihs4",
  "indomethacin-headache-ichd3",
  "intubation-difficulty-scale",
  "isth-bat",
  "kings-college",
  "lace",
  "magnesium-replacement",
  "masld-criteria",
  "mchat-rf",
  "meld-childpugh",
  "membranous-risk",
  "meows",
  "midas",
  "migraine-ichd3",
  "mini-cog",
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
  "pecarn-head",
  "peds-bmi-percentile",
  "peds-weight-conv",
  "pertussis-case-def",
  "pesi",
  "pews",
  "posas-observer-scar",
  "posas-patient-scar",
  "preg-dating",
  "prevent",
  "quintero-ttts",
  "restraint-timer",
  "rhig-dose",
  "rivermead-mobility-index",
  "roland-morris-disability",
  "rudas",
  "salt-score",
  "sea-guideline",
  "sepsis-bundle-clock",
  "smart-cop",
  "systemic-mastocytosis",
  "tension-headache-ichd3",
  "timely-filing",
  "triple-i",
  "unit-converter-v4",
  "vasi",
  "vent-sbt-peep",
  "vis",
  "wat-1",
  "wells-pe-geneva",
  "who-severe-malaria",
  "years-pe"
]);
