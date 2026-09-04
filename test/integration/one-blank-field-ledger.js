// spec-v1067: the calculator FIELDS that may change their answer when the one
// measurement they name is cleared, and why each is allowed to.
//
// Keyed `tileId|fieldId`, not by tile, and that is the point of it. The
// empty-form ledger next door exempts a whole calculator, and spec-v1029 found
// five scores whose checkbox exemption had been quietly covering a measurement
// as well: a tile-level line cannot say "these seven fields are criteria and
// that one is a measurement". Here, exempting one field leaves every other
// field on the same calculator still guarded.
//
// Every key below was produced by running the gate with this map EMPTY and
// reading the tile's before/after text one line at a time (spec-v1063 to
// spec-v1067). Writing the keys from memory first was a mistake worth
// recording: several guesses happened to be right, those tiles were silently
// exempted, and the gate reported 16 offenders where there were 24. If you
// re-seed this list, empty it first.
//
// Four groups. Adding a line needs a sentence saying which group it is in.

export const ONE_BLANK_FIELD_OK = new Map(Object.entries({
  // -- 1. It DROPS the output that needed the value. Nothing is computed from a
  //       zero; the dependent line simply stops being printed, and the rest of
  //       the panel stands on its own.
  'corrected-ca-na|cca-alb': 'the corrected-calcium line disappears; corrected sodium still prints',
  'corrected-ca-na|glu': 'the corrected-sodium line disappears; corrected calcium still prints',
  'anion-gap|alb': 'the albumin-corrected gap disappears; the uncorrected gap still prints',
  'anion-gap-dd|alb': 'as anion-gap: the albumin-corrected line disappears',
  'aa-pf-suite|sf-age': 'the expected-A-a-by-age line disappears; the measured gradient still prints',
  'egfr-suite|es-w': 'the Cockcroft-Gault row disappears; the two creatinine-only equations still print',
  'ecmo-titration|ec-hb': 'the oxygen-delivery (DO2i) line disappears; sweep and flow still print',
  'peds-weight-conv|pw-kg': 'the kg-to-lb line disappears; the lb-to-kg line still prints',
  'shock-index|si-hr': 'both shock-index lines disappear; MAP and pulse pressure, which have no heart-rate term in them, still print',

  // -- 2. It drops a note written ABOUT the entered value and keeps the general
  //       one. No number changes; the tile stops commenting on a value it no
  //       longer has.
  'aortic-regurgitation-stage|ars-lvesd': 'drops the sentence about the entered end-systolic diameter; the stage is set by other criteria',
  'carboxyhemoglobin|cx-spo2': 'drops "a reading of 99 percent means nothing here"; the general oximeter warning stays',
  'sea-guideline|sea-wbc': 'drops "a count of 8 is not reassuring here"; the imaging verdict is unchanged',
  'mitral-stenosis-stage|mvs-pht': 'drops the half-time caveat written about the entered value',

  // -- 3. A real zero. These fields take nought as a value a clinician means, so
  //       blank and zero genuinely coincide and there is nothing to disclose.
  'iv-osmolarity|io-na': 'sodium ADDITIVES: a bag with none added is a real order',
  'iv-osmolarity|io-k': 'potassium additives: as above',
  'mtp-tracker|mtp-plt': 'platelet units TRANSFUSED: none yet is the normal state of a running protocol',
  'peds-weight-conv|pw-lb': 'a unit converter: five ounces and no pounds is five ounces',
  'mswat|mswat-weight1': 'per-lesion-type % BSA: a patient with no patches is a real patient, and the tile prints the BSA total it summed',
  'mswat|mswat-weight2': 'as above, for plaques',
  'mswat|mswat-weight4': 'as above, for tumours',
  'modified-marshall|mm-creat': 'the tile tells the reader on screen to leave a system blank if it was not assessed, and reports which systems it scored',

  // -- 4. It RULES IN, and a floor owes no caveat once it has left the
  //       reassuring band (spec-v1006). Clearing the field lowers a total that
  //       is already over the threshold, so the verdict cannot flip the wrong
  //       way. What these two do BELOW their thresholds -- where the same blank
  //       would rule out -- was fixed in spec-v1066 and is pinned by their own
  //       unit tests.
  'truelove-witts|tw-temp': 'still severe on the remaining systemic criteria; the caveat is added only when the grade is not severe',
  'truelove-witts|tw-hr': 'as above',
  'truelove-witts|tw-hgb': 'as above',
  'tls-cairo-bishop|tl-k': 'still clinical TLS on the remaining criteria; the "not met" branch discloses what was never entered',
}));
