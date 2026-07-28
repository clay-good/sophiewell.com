// spec-v559 MCP wave: adapter for the Erez pregnancy-specific DIC score in lib/erez-dic-v559.js. The dom
// keys mirror the browser renderer (views/group-v559.js) and META['erez-dic'].example.
//
// **THE PLATELET ROW IS NON-MONOTONIC AND MUST NOT BE "FIXED".** Below 50 scores 1 point while 50 to 100
// scores 2, so the MOST severe thrombocytopenia scores FEWER points than moderate thrombocytopenia. Two
// independent sources print it that way and one names the pattern as unusual. Every instinct says to
// straighten it into a monotonic ladder, and doing so would change the score of exactly the sickest
// patients. The rows are exported so the property is checkable.
//
// **THE PROTHROMBIN TIME INPUT IS A DIFFERENCE IN SECONDS, NOT A RATIO AND NOT AN INR.** It is the
// patient's prothrombin time minus the laboratory control, and the strata are fractions of a second: under
// 0.5, 0.5 to 1.0, 1.0 to 1.5, above 1.5. An agent handed "INR 1.2" or "PT 14 seconds" and passing either
// straight through lands in the TOP stratum and adds 25 unearned points - most of the way to the cutoff on
// its own. This is the single largest error the instrument invites.
//
// **THE CUTOFF IS ESSENTIALLY UNREACHABLE WITHOUT ONE OF THE TWO 25-POINT FINDINGS.** Maximum 52, and 25 of
// it is fibrinogen below 3.0 g/L while another 25 is a PT difference above 1.5 seconds. Everything else -
// the entire platelet row plus both middle strata - totals at most 20, which cannot reach 26. An agent
// watching a platelet count fall should know it will never reach DIC by that route.
//
// **D-DIMER AND FIBRIN DEGRADATION PRODUCTS ARE DELIBERATELY ABSENT, UNLIKE THE ISTH SCORE.** They rise in
// normal pregnancy and would false-positive. Their absence is a design decision, not a gap to fill in.
//
// **THE CUTOFF SCALE DIFFERS FROM THE OTHER DIC SCORES IN THIS CATALOG.** ISTH uses 5; this uses 26. They
// are not interchangeable, and an agent must not carry a cutoff across.

import * as E from '../../lib/erez-dic-v559.js';

export default [
  {
    id: 'erez-dic',
    summary: `The Erez pregnancy-specific DIC score (Erez and colleagues, PLoS One 2014), a population-based modification of the International Society on Thrombosis and Hemostasis DIC score for PREGNANT WOMEN. Three components, maximum ${E.EREZ_MAX}, and a score of ${E.EREZ_CUTOFF} OR MORE indicates disseminated intravascular coagulation. PLATELET COUNT (x10^9/L): below 50 = 1 point; 50 to 100 = 2; above 100 to 185 = 1; above 185 = 0. THIS ROW IS NON-MONOTONIC AND MUST NOT BE CORRECTED: the MOST severe thrombocytopenia (below 50) scores FEWER points than moderate thrombocytopenia (50 to 100). Two independent sources print it this way and one names the pattern explicitly as unusual, so it is the published table rather than a transcription error, and straightening it into a monotonic ladder would change the score of exactly the sickest patients. PROTHROMBIN TIME DIFFERENCE (SECONDS): below 0.5 = 0; 0.5 to 1.0 = 5; above 1.0 to 1.5 = 12; above 1.5 = 25. THIS INPUT IS A DIFFERENCE IN SECONDS - THE PATIENT VALUE MINUS THE LABORATORY CONTROL - AND IS NOT A RATIO AND NOT AN INR. The strata are fractions of a second, so passing an INR such as 1.2, or a raw prothrombin time such as 14 seconds, lands in the top stratum and adds 25 points the patient has not earned, moving the score by 12 to 25 points. This is the single largest error the instrument invites. FIBRINOGEN (g/L): below 3.0 = 25; 3.0 to 4.0 = 6; above 4.0 to 4.5 = 1; above 4.5 = 0. THE CUTOFF IS ESSENTIALLY UNREACHABLE WITHOUT ONE OF THE TWO 25-POINT FINDINGS, a fibrinogen below 3.0 g/L or a PT difference above 1.5 seconds: everything else on the form totals at most ${E.MAX_WITHOUT_A_25_POINT_FINDING}, so a falling platelet count cannot reach the cutoff by itself however far it falls. D-DIMER AND FIBRIN DEGRADATION PRODUCTS ARE DELIBERATELY ABSENT, unlike the ISTH score, because they rise in normal pregnancy and would produce false positives; that absence is a design decision rather than a gap to fill. THE CUTOFF SCALE DIFFERS FROM THE OTHER DIC SCORES: ISTH uses 5 and this uses ${E.EREZ_CUTOFF}, so the cutoffs are NOT interchangeable and must never be carried across. The published strata share their endpoints, so each printed range is given its own upper bound and the next starts strictly above it; the two sources differ only in inequality glyphs, never in the numbers. DIC in pregnancy is an OBSTETRIC EMERGENCY, and it is a CLINICAL diagnosis supported by laboratory findings rather than established by a score: A SCORE BELOW THE CUTOFF DOES NOT EXCLUDE IT. This does not identify the CAUSE, which is what actually gets treated - abruption, amniotic fluid embolism, sepsis, severe preeclampsia and HELLP, retained products, and acute fatty liver of pregnancy all present this way and diverge sharply in management. It does not indicate delivery, transfusion, or any blood product, and it does not replace serial measurement, which is usually what reveals the diagnosis.`,
    compute: E.erezDic,
    fields: [
      {
        dom: 'erez-platelets', arg: 'platelets', kind: 'number', unit: 'x10^9/L', required: true,
        label: `Platelet count [${E.PLATELET_ROWS.map((r) => `${r.text} = ${r.points}`).join('; ')}]. NON-MONOTONIC as published: below 50 scores fewer points than 50 to 100.`,
      },
      {
        dom: 'erez-pt', arg: 'ptDifference', kind: 'number', unit: 'seconds', required: true,
        label: `Prothrombin time DIFFERENCE IN SECONDS: the patient value MINUS the laboratory control. NOT a ratio and NOT an INR - passing either adds 25 unearned points [${E.PT_DIFFERENCE_ROWS.map((r) => `${r.text} = ${r.points}`).join('; ')}]`,
      },
      {
        dom: 'erez-fibrinogen', arg: 'fibrinogen', kind: 'number', unit: 'g/L', required: true,
        label: `Fibrinogen [${E.FIBRINOGEN_ROWS.map((r) => `${r.text} = ${r.points}`).join('; ')}]`,
      },
    ],
  },
];
