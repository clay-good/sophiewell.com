// sophiewell.com - vanilla ES module application.
// All DOM updates use textContent or createElement. Raw HTML insertion is forbidden.

import { renderers as RA } from './views/group-a.js';
import { renderers as RC } from './views/group-c.js';
import { renderers as RE } from './views/group-e.js';
import { renderers as RF } from './views/group-f.js';
import { renderers as RG } from './views/group-g.js';
import { renderers as RH } from './views/group-h.js';
import { renderers as RI } from './views/group-i.js';
import { renderers as RJ } from './views/group-j.js';
import { renderers as RKLMNO } from './views/group-klmno.js';
import { renderers as RV5 } from './views/group-v5.js';
import { renderers as RV6 } from './views/group-v6.js';
import { renderers as RV7 } from './views/group-v7.js';
import { renderers as RV8 } from './views/group-v8.js';
import { renderers as RV9 } from './views/group-v9.js';
import { renderers as RV10 } from './views/group-v10.js';
import { renderers as RV11 } from './views/group-v11.js';
import { renderers as RV12 } from './views/group-v12.js';
import { renderers as RV13 } from './views/group-v13.js';
import { renderers as RV14 } from './views/group-v14.js';
import { renderers as RV15 } from './views/group-v15.js';
import { renderers as RV16 } from './views/group-v16.js';
import { renderers as RV17 } from './views/group-v17.js';
import { renderers as RV18 } from './views/group-v18.js';
import { renderers as RV19 } from './views/group-v19.js';
import { renderers as RV20 } from './views/group-v20.js';
import { renderers as RV21 } from './views/group-v21.js';
import { renderers as RV22 } from './views/group-v22.js';
import { renderers as RV23 } from './views/group-v23.js';
import { renderers as RV24 } from './views/group-v24.js';
import { renderers as RV25 } from './views/group-v25.js';
import { renderers as RV26 } from './views/group-v26.js';
import { renderers as RV27 } from './views/group-v27.js';
import { renderers as RV28 } from './views/group-v28.js';
import { renderers as RV29 } from './views/group-v29.js';
import { renderers as RV30 } from './views/group-v30.js';
import { renderers as RV31 } from './views/group-v31.js';
import { renderers as RV32 } from './views/group-v32.js';
import { renderers as RV33 } from './views/group-v33.js';
import { renderers as RV34 } from './views/group-v34.js';
import { renderers as RV35 } from './views/group-v35.js';
import { renderers as RV36 } from './views/group-v36.js';
import { renderers as RV37 } from './views/group-v37.js';
import { renderers as RV38 } from './views/group-v38.js';
import { renderers as RV39 } from './views/group-v39.js';
import { renderers as RV40 } from './views/group-v40.js';
import { renderers as RV117 } from './views/group-v117.js';
import { renderers as RV118 } from './views/group-v118.js';
import { renderers as RV119 } from './views/group-v119.js';
import { renderers as RV120 } from './views/group-v120.js';
import { renderers as RV121 } from './views/group-v121.js';
import { renderers as RV122 } from './views/group-v122.js';
import { renderers as RV123 } from './views/group-v123.js';
import { renderers as RV124 } from './views/group-v124.js';
import { renderers as RV125 } from './views/group-v125.js';
import { renderers as RV126 } from './views/group-v126.js';
import { renderers as RV127 } from './views/group-v127.js';
import { renderers as RV128 } from './views/group-v128.js';
import { renderers as RV129 } from './views/group-v129.js';
import { renderers as RV130 } from './views/group-v130.js';
import { renderers as RV131 } from './views/group-v131.js';
import { renderers as RV132 } from './views/group-v132.js';
import { renderers as RV133 } from './views/group-v133.js';
import { renderers as RV134 } from './views/group-v134.js';
import { renderers as RV135 } from './views/group-v135.js';
import { renderers as RV136 } from './views/group-v136.js';
import { renderers as RV137 } from './views/group-v137.js';
import { renderers as RV138 } from './views/group-v138.js';
import { renderers as RV139 } from './views/group-v139.js';
import { renderers as RV140 } from './views/group-v140.js';
import { renderers as RV141 } from './views/group-v141.js';
import { renderers as RV142 } from './views/group-v142.js';
import { renderers as RV143 } from './views/group-v143.js';
import { renderers as RV144 } from './views/group-v144.js';
import { renderers as RV145 } from './views/group-v145.js';
import { renderers as RV146 } from './views/group-v146.js';
import { renderers as RV147 } from './views/group-v147.js';
import { renderers as RV148 } from './views/group-v148.js';
import { renderers as RV151 } from './views/group-v151.js';
import { renderers as RV152 } from './views/group-v152.js';
import { renderers as RV153 } from './views/group-v153.js';
import { renderers as RV154 } from './views/group-v154.js';
import { renderers as RV155 } from './views/group-v155.js';
import { renderers as RV156 } from './views/group-v156.js';
import { renderers as RV158 } from './views/group-v158.js';
import { renderers as RV159 } from './views/group-v159.js';
import { renderers as RV160 } from './views/group-v160.js';
import { renderers as RV161 } from './views/group-v161.js';
import { renderers as RV163 } from './views/group-v163.js';
import { renderers as RV185 } from './views/group-v185.js';
import { renderers as RV186 } from './views/group-v186.js';
import { renderers as RV187 } from './views/group-v187.js';
import { renderers as RV188 } from './views/group-v188.js';
import { renderers as RV189 } from './views/group-v189.js';
import { renderers as RV190 } from './views/group-v190.js';
import { renderers as RV191 } from './views/group-v191.js';
import { renderers as RV192 } from './views/group-v192.js';
import { renderers as RV193 } from './views/group-v193.js';
import { renderers as RV194 } from './views/group-v194.js';
import { renderers as RV195 } from './views/group-v195.js';
import { renderers as RV196 } from './views/group-v196.js';
import { renderers as RV197 } from './views/group-v197.js';
import { renderers as RV198 } from './views/group-v198.js';
import { renderers as RV199 } from './views/group-v199.js';
import { renderers as RV200 } from './views/group-v200.js';
import { renderers as RV201 } from './views/group-v201.js';
import { renderers as RV202 } from './views/group-v202.js';
import { renderers as RV203 } from './views/group-v203.js';
import { renderers as RV204 } from './views/group-v204.js';
import { renderers as RV205 } from './views/group-v205.js';
import { renderers as RV206 } from './views/group-v206.js';
import { renderers as RV207 } from './views/group-v207.js';
import { renderers as RV208 } from './views/group-v208.js';
import { renderers as RV209 } from './views/group-v209.js';
import { renderers as RV210 } from './views/group-v210.js';
import { renderers as RV211 } from './views/group-v211.js';
import { renderers as RV212 } from './views/group-v212.js';
import { renderers as RV213 } from './views/group-v213.js';
import { renderers as RV214 } from './views/group-v214.js';
import { renderers as RV215 } from './views/group-v215.js';
import { renderers as RV216 } from './views/group-v216.js';
import { renderers as RV217 } from './views/group-v217.js';
import { renderers as RV218 } from './views/group-v218.js';
import { renderers as RV219 } from './views/group-v219.js';
import { renderers as RV220 } from './views/group-v220.js';
import { renderers as RV221 } from './views/group-v221.js';
import { renderers as RV222 } from './views/group-v222.js';
import { renderers as RV223 } from './views/group-v223.js';
import { renderers as RV224 } from './views/group-v224.js';
import { renderers as RV225 } from './views/group-v225.js';
import { renderers as RV226 } from './views/group-v226.js';
import { renderers as RV227 } from './views/group-v227.js';
import { renderers as RV228 } from './views/group-v228.js';
import { renderers as RV229 } from './views/group-v229.js';
import { renderers as RV230 } from './views/group-v230.js';
import { renderers as RV231 } from './views/group-v231.js';
import { renderers as RV232 } from './views/group-v232.js';
import { renderers as RV233 } from './views/group-v233.js';
import { renderers as RV234 } from './views/group-v234.js';
import { renderers as RV235 } from './views/group-v235.js';
import { renderers as RV236 } from './views/group-v236.js';
import { renderers as RV237 } from './views/group-v237.js';
import { renderers as RV238 } from './views/group-v238.js';
import { renderers as RV239 } from './views/group-v239.js';
import { renderers as RV240 } from './views/group-v240.js';
import { renderers as RV241 } from './views/group-v241.js';
import { renderers as RV242 } from './views/group-v242.js';
import { renderers as RV243 } from './views/group-v243.js';
import { renderers as RV244 } from './views/group-v244.js';
import { renderers as RV245 } from './views/group-v245.js';
import { renderers as RV246 } from './views/group-v246.js';
import { renderers as RV247 } from './views/group-v247.js';
import { renderers as RV248 } from './views/group-v248.js';
import { renderers as RV249 } from './views/group-v249.js';
import { renderers as RV250 } from './views/group-v250.js';
import { renderers as RV251 } from './views/group-v251.js';
import { renderers as RV252 } from './views/group-v252.js';
import { renderers as RV253 } from './views/group-v253.js';
import { renderers as RV254 } from './views/group-v254.js';
import { renderers as RV164 } from './views/group-v164.js';
import { renderers as RV165 } from './views/group-v165.js';
import { renderers as RV166 } from './views/group-v166.js';
import { renderers as RV167 } from './views/group-v167.js';
import { renderers as RV169 } from './views/group-v169.js';
import { renderers as RV173 } from './views/group-v173.js';
import { renderers as RV174 } from './views/group-v174.js';
import { renderers as RV175 } from './views/group-v175.js';
import { renderers as RV176 } from './views/group-v176.js';
import { renderers as RV177 } from './views/group-v177.js';
import { renderers as RV178 } from './views/group-v178.js';
import { renderers as RV179 } from './views/group-v179.js';
import { renderers as RV182 } from './views/group-v182.js';
import { renderers as RV180 } from './views/group-v180.js';
import { renderers as RV181 } from './views/group-v181.js';
import { renderers as RV149 } from './views/group-v149.js';
import { renderers as RV63 } from './views/group-v63.js';
import { renderers as RB } from './views/group-b.js';
import { renderers as RPALINT } from './views/pa-lint.js';
import { META } from './lib/meta.js';
import { fetchJson } from './lib/data.js';
import { copyButton } from './lib/clipboard.js';
import {
  isRememberEnabled, setRememberEnabled, saveInputs, applySavedInputs, hasPersistableInputs,
} from './lib/input-persist.js';
import { installKeyboard } from './lib/keyboard.js';
import { parseHash, patchHash } from './lib/hash.js';
import { loadSynonyms } from './lib/synonyms.js';
import { resolvePrompt } from './lib/prompt.js';
// The patient-artifact dropzone UI (spec-v7 sec 3.1) was removed when
// Sophie pivoted to a clinical-staff-first wedge. The orphaned
// artifact-detect / artifact-route / artifact-handoff helpers were
// deleted in spec-v29 wave 29-2 (Group C/L).

const RENDERERS = { ...RA, ...RB, ...RC, ...RE, ...RF, ...RG, ...RH, ...RI, ...RJ, ...RKLMNO, ...RV5, ...RV6, ...RV7, ...RV8, ...RV9, ...RV10, ...RV11, ...RV12, ...RV13, ...RV14, ...RV15, ...RV16, ...RV17, ...RV18, ...RV19, ...RV20, ...RV21, ...RV22, ...RV23, ...RV24, ...RV25, ...RV26, ...RV27, ...RV28, ...RV29, ...RV30, ...RV31, ...RV32, ...RV33, ...RV34, ...RV35, ...RV36, ...RV37, ...RV38, ...RV39, ...RV40, ...RV117, ...RV118, ...RV119, ...RV120, ...RV121, ...RV122, ...RV123, ...RV124, ...RV125, ...RV126, ...RV127, ...RV128, ...RV129, ...RV130, ...RV131, ...RV132, ...RV133, ...RV134, ...RV135, ...RV136, ...RV137, ...RV138, ...RV139, ...RV140, ...RV141, ...RV142, ...RV143, ...RV144, ...RV145, ...RV146, ...RV147, ...RV148, ...RV149, ...RV151, ...RV152, ...RV153, ...RV154, ...RV155, ...RV156, ...RV158, ...RV159, ...RV160, ...RV161, ...RV163, ...RV164, ...RV165, ...RV166, ...RV167, ...RV169, ...RV173, ...RV174, ...RV175, ...RV176, ...RV177, ...RV178, ...RV179, ...RV182, ...RV180, ...RV181, ...RV185, ...RV186, ...RV187, ...RV188, ...RV189, ...RV190, ...RV191, ...RV192, ...RV193, ...RV194, ...RV195, ...RV196, ...RV197, ...RV198, ...RV199, ...RV200, ...RV201, ...RV202, ...RV203, ...RV204, ...RV205, ...RV206, ...RV207, ...RV208, ...RV209, ...RV210, ...RV211, ...RV212, ...RV213, ...RV214, ...RV215, ...RV216, ...RV217, ...RV218, ...RV219, ...RV220, ...RV221, ...RV222, ...RV223, ...RV224, ...RV225, ...RV226, ...RV227, ...RV228, ...RV229, ...RV230, ...RV231, ...RV232, ...RV233, ...RV234, ...RV235, ...RV236, ...RV237, ...RV238, ...RV239, ...RV240, ...RV241, ...RV242, ...RV243, ...RV244, ...RV245, ...RV246, ...RV247, ...RV248, ...RV249, ...RV250, ...RV251, ...RV252, ...RV253, ...RV254, ...RV63, ...RPALINT };

// ----- Utility registry ----------------------------------------------------
// Source of truth for routes, names, group, audiences, and clinical flag.
// Group letters: A Codes, B Pricing, C Patient Tools, D Provider Lookup,
// E Clinical Math, F Medication, G Scoring, H Workflow.

const UTILITIES = [
  // Group A: Code Lookup
  // spec-v29 wave 29-2: 19 Group A code-reference lookups removed
  // (icd10, hcpcs, cpt, ndc, pos-codes, modifier-codes, revenue-codes,
  // carc, rarc, hcpcs-mod, pos-lookup, tob-decode, rev-table, nubc-codes,
  // drg-lookup, apc-lookup, pcs-lookup, rxnorm-lookup, ndc-rxnorm).
  // Their URL hashes route to the home view with a removed-note via
  // REMOVED_V29_IDS below. Surviving Group A calculators (em-time,
  // ndc-convert) live below in the v5 block.
  // Group B: Billing & Reimbursement (spec-v77 charter / spec-v78 program).
  // The MPFS reimbursement engine: what Medicare actually pays a professional
  // line after every reduction. Deterministic, cited, integer-cents money;
  // input-or-bundled-data (doctrine clause 2). views/group-b.js, lib/billing-v78.js.
  { id: 'rvu-payment', name: 'MPFS Allowed Amount (RVU x GPCI x CF)', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'mppr', name: 'Multiple-Procedure Payment Reduction', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'bilateral-pay', name: 'Bilateral (Modifier 50) Payment by Indicator', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'multi-surgeon-pay', name: 'Assistant / Co- / Team-Surgeon Payment', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'sequestration-adjust', name: 'Medicare 2% Sequestration Adjustment', group: 'B', audiences: ['billers'], clinical: false },
  // spec-v79: claim edits & modifier logic. v78 prices the line; these five
  // decide whether it survives. No NCCI PTP / MUE table ships (doctrine clause 2):
  // the indicator / MUE value is a user input, so the tool is never silently
  // stale. views/group-b.js, lib/billing-v79.js.
  { id: 'ncci-ptp', name: 'NCCI Edit & Modifier-Bypass Checker', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'mue-check', name: 'MUE Units Adjudication (MAI 1/2/3)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'modifier-x-selector', name: 'Modifier 59 vs XE/XS/XP/XU Selector', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'global-period', name: 'Global Surgery Period & Required Modifier', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'modifier-order', name: 'Pricing vs Informational Modifier Order', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  // spec-v80: E/M & time-based coding, completed. The office em-time/em-mdm
  // tiles only do 99202-99215; these six extend MDM leveling to every setting
  // and add the time-unit codes (critical care, prolonged, therapy 8-minute,
  // anesthesia). Setting/payer forks are explicit; CPT descriptors and ASA base
  // units are user inputs (doctrine clause 2). views/group-b.js, lib/billing-v80.js.
  { id: 'em-mdm-2023', name: 'E/M MDM Level by Setting (2023, all places of service)', group: 'B', audiences: ['coders', 'billers', 'clinicians'], clinical: false },
  { id: 'critical-care-time', name: 'Critical Care Time (99291 + 99292 Units)', group: 'B', audiences: ['coders', 'billers', 'clinicians'], clinical: false },
  { id: 'split-shared', name: 'Split / Shared Visit & FS Modifier', group: 'B', audiences: ['coders', 'billers', 'clinicians'], clinical: false },
  { id: 'prolonged-services', name: 'Prolonged Services (99417 / G2212 Units)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'therapy-units', name: 'Therapy Units (8-Minute Rule vs Rule of Eights)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'anesthesia-units', name: 'Anesthesia Units (Base + Time + Modifying x CF)', group: 'B', audiences: ['billers', 'coders'], clinical: false },
  { id: 'ndc-hcpcs-units', name: 'HCPCS Drug Billing Units (Dose -> Units)', group: 'B', audiences: ['billers', 'coders'], clinical: false },
  { id: 'drug-wastage', name: 'Drug Wastage (JW / JZ Units, Single-Dose Vial)', group: 'B', audiences: ['billers', 'coders'], clinical: false },
  { id: 'infusion-hierarchy', name: 'Infusion Hierarchy (Initial Code Picker, 96360-96379)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  // spec-v83: claim integrity & facility payment -- the program's sixth and
  // final feature spec. Four validators catch a bad NPI/MBI/ICD-10 or an
  // out-of-balance 835 before the clearinghouse rejects it; two pricers compute
  // the UB-04 (DRG/APC) facility side the v78 professional engine doesn't.
  // Validators verify format/structure only; pricers read bundled weights but
  // take rates as inputs (doctrine clause 2). views/group-b.js, lib/billing-v83.js.
  { id: 'npi-validate', name: 'NPI Luhn Check-Digit Validator / Generator', group: 'B', audiences: ['billers', 'coders', 'credentialing'], clinical: false },
  { id: 'mbi-validate', name: 'Medicare Beneficiary Identifier (MBI) Format Validator', group: 'B', audiences: ['billers', 'front-desk'], clinical: false },
  { id: 'icd10-validate', name: 'ICD-10-CM Structural & Specificity Checker', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'era-balance', name: '835 / EOB Remittance Balancing', group: 'B', audiences: ['billers', 'posting'], clinical: false },
  { id: 'drg-payment', name: 'IPPS DRG Payment Estimate', group: 'B', audiences: ['facility-billing', 'coders'], clinical: false },
  { id: 'apc-payment', name: 'OPPS APC Payment Estimate', group: 'B', audiences: ['facility-billing', 'coders'], clinical: false },
  // Group C: Patient Bill and Insurance Tools
  // spec-v29 wave 29-2: 12 Group C patient-literacy / eligibility tiles
  // removed (decoder, insurance, eob-decoder, no-surprises,
  // insurance-card, abn-explainer, msn-decoder, idr-eligibility,
  // birthday-rule, cobra-timeline, medicare-enrollment, aca-sep). Their
  // URL hashes route to the home view with a removed-note via
  // REMOVED_V29_IDS below. Survivors: appeal-letter, hipaa-roa
  // (workflow generators per spec-v29 sec 10 open question 1).
  { id: 'appeal-letter', name: 'Appeal Letter Generator', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'hipaa-roa', name: 'HIPAA Right of Access Request Generator', group: 'C', audiences: ['patients'], clinical: false },
  // spec-v63 Part B: ops-deadline calculators (compute through lib/deadline.js).
  { id: 'appeal-deadline', name: 'Medicare Appeal-Level Deadline Calculator', group: 'C', audiences: ['billers', 'patients'], clinical: false },
  { id: 'timely-filing', name: 'Claim Timely-Filing Deadline', group: 'C', audiences: ['billers'], clinical: false },
  { id: 'pa-turnaround', name: 'Prior-Authorization Decision-Deadline Clock', group: 'C', audiences: ['billers', 'clinicians'], clinical: false },
  { id: 'overpayment-60day', name: '60-Day Overpayment Report-and-Return Clock', group: 'C', audiences: ['billers'], clinical: false },
  // spec-v82: patient responsibility & coordination of benefits. v78 computes
  // what the payer pays; these four compute what the PATIENT owes -- Medicare
  // cost-share, COB/MSP, the contractual write-off, and the No Surprises Act
  // cap. Money is integer cents; the protection/network gate is hard, not
  // advisory. views/group-c.js, lib/billing-v82.js.
  { id: 'medicare-cost-share', name: 'Medicare Patient Cost-Share (Part A / B / SNF)', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'cob-calc', name: 'Coordination of Benefits & Medicare Secondary Payer', group: 'C', audiences: ['billers', 'patients'], clinical: false },
  { id: 'allowed-amount', name: 'Contractual Write-Off vs Patient Balance', group: 'C', audiences: ['billers', 'patients'], clinical: false },
  { id: 'nsa-cost-share', name: 'No Surprises Act Cost-Share (QPA-Based)', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  // Group D: Provider and Plan Lookup
  // Group D: v4 extensions (utilities 115-116)
  // Group E: Clinical Math and Conversions
  { id: 'unit-converter', name: 'Unit Converter', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bmi', name: 'BMI Calculator', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'bsa', name: 'Body Surface Area', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'map', name: 'Mean Arterial Pressure', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'anion-gap', name: 'Anion Gap', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'corrected-calcium', name: 'Corrected Calcium for Albumin', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-sodium', name: 'Corrected Sodium for Hyperglycemia', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'aa-gradient', name: 'A-a Gradient', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egfr', name: 'Estimated GFR (CKD-EPI 2021)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cockcroft-gault', name: 'Cockcroft-Gault Creatinine Clearance', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pack-years', name: 'Pack-Years', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'due-date', name: 'Naegele Pregnancy Due Date', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'qtc', name: 'QTc Correction', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pf-ratio', name: 'P/F Ratio', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group E: v4 extensions (utilities 117-128)
  { id: 'anion-gap-dd', name: 'Anion Gap & Delta-Delta', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-ca-na', name: 'Corrected Calcium / Sodium Suite', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'osmolal-gap', name: 'Osmolal Gap', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aa-pf-suite', name: 'A-a Gradient & P/F Suite', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'winters', name: 'Winters Formula (expected PaCO2)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'shock-index', name: 'MAP / Pulse Pressure / Shock Index', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bw-bsa-suite', name: 'Body Weight & BSA Suite (IBW / AdjBW / BSA)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egfr-suite', name: 'eGFR Suite (CKD-EPI 2021 / MDRD / CG)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fena-feurea', name: 'FENa / FEUrea', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'maint-fluids', name: 'Maintenance Fluids (4-2-1)', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'qtc-suite', name: 'QTc Suite (Bazett / Fridericia / Framingham / Hodges)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'preg-dating', name: 'Pregnancy Dating (LMP / CRL / EDD)', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  // Group F: Medication and Infusion
  { id: 'drip-rate', name: 'Drip Rate Calculator', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'weight-dose', name: 'Weight-Based Dose', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'conc-rate', name: 'Concentration-to-Rate', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-dose', name: 'Pediatric Quick-Dose Panel (by weight)', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'insulin-drip', name: 'Insulin Drip Math', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'anticoag-reversal', name: 'Anticoagulation Reversal Dose', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // spec-v62 §3 Part B (wave 1): ICU-infusion + med-surg bedside math.
  { id: 'infusion-time-remaining', name: 'Infusion Time Remaining & Rate-to-Last', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'enteral-free-water', name: 'Enteral Free-Water & Flush Target', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apap-24h-max', name: 'Acetaminophen 24-Hour Total & Ceiling', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'icu-nutrition-target', name: 'ICU Energy & Protein Target', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vte-prophylaxis-dose', name: 'Enoxaparin Dose (weight & renal)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'norepi-equiv', name: 'Norepinephrine-Equivalent Vasopressor Dose', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v65 §2.1: oxygen-cylinder time-to-empty (respiratory-safety analog of infusion-time-remaining).
  { id: 'o2-cylinder-duration', name: 'Oxygen Cylinder Duration & Max Transport Flow', group: 'F', audiences: ['clinicians', 'field'], clinical: true },
  // spec-v29 wave 29-2 (Group K/O): high-alert removed (ISMP wallet
  // reference); iv-to-po removed (static equivalence table, audit
  // confirmed no numeric output per spec-v29 sec 7.2 deferral).
  // Group F: v4 extensions (utilities 129-135)
  { id: 'opioid-mme', name: 'Opioid MME Calculator (CDC 2022)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'steroid-equiv', name: 'Steroid Equivalence Converter', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'benzo-equiv', name: 'Benzodiazepine Equivalence (Ashton)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'abx-renal', name: 'Antibiotic Renal Dose Adjustment', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vasopressor', name: 'Vasopressor Dose to Rate Calculator', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'tpn-macro', name: 'TPN Macronutrient Calculator', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: Clinical Scoring and Reference
  { id: 'gcs', name: 'Glasgow Coma Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'apgar', name: 'APGAR', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // peds-vitals removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
  // lab-ranges removed in spec-v29 wave 29-2 (Group K/O): static table.
  { id: 'abg', name: 'ABG Interpretation Walkthrough', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-pe', name: 'Wells Score for PE', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-dvt', name: 'Wells Score for DVT', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chads', name: 'CHA2DS2-VASc', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hasbled', name: 'HAS-BLED', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nihss', name: 'NIH Stroke Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // asa, mallampati, beers removed in spec-v29 wave 29-2 (Group G non-scores): static reference tables.
  // Group G: v4 extensions waves 1-2 (utilities 136-145)
  { id: 'timi', name: 'TIMI Risk Score (UA / NSTEMI)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'grace', name: 'GRACE Score (in-hospital mortality)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'heart', name: 'HEART Score (chest pain)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'perc', name: 'PERC Rule (PE rule-out)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wells-pe-geneva', name: 'Wells PE & Revised Geneva (PE)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'curb-65', name: 'CURB-65', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psi', name: 'PSI / PORT (pneumonia severity)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'qsofa-sofa', name: 'qSOFA / SOFA', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'meld-childpugh', name: 'MELD-3.0 / Child-Pugh', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ranson-bisap', name: 'Ranson / BISAP (acute pancreatitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: v4 extensions waves 3-4 (utilities 146-156)
  { id: 'centor', name: 'Centor / McIsaac (strep pharyngitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wells-dvt-caprini', name: 'Wells DVT and Caprini VTE Risk', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bishop', name: 'Bishop Score (cervical favorability)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'alvarado-pas', name: 'Alvarado / Pediatric Appendicitis Score', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // mrs removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
  { id: 'phq9', name: 'PHQ-9 Depression Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'gad7', name: 'GAD-7 Anxiety Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'auditc', name: 'AUDIT-C Alcohol Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'cage', name: 'CAGE Alcohol Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'epds', name: 'Edinburgh Postnatal Depression Scale', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'mini-cog', name: 'Mini-Cog Cognitive Screener', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: v4 extensions waves 5-6 (utilities 157-160)
  { id: 'ciwa', name: 'CIWA-Ar (alcohol withdrawal)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cows', name: 'COWS (opioid withdrawal)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ascvd', name: 'ASCVD 10-year Risk (PCE)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'prevent', name: 'PREVENT 2023 10-year CVD Risk (race-free)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group H: Preparation and Workflow
  { id: 'prep', name: 'Appointment Prep Question Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'prior-auth', name: 'Prior Authorization Checklist Generator', group: 'H', audiences: ['billers'], clinical: false },
  // Group H: v4 extensions (utilities 161-165)
  { id: 'hipaa-auth', name: 'HIPAA Authorization Form Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'roi', name: 'ROI Request Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'discharge-instr', name: 'Discharge Instruction Template', group: 'H', audiences: ['clinicians', 'patients'], clinical: false },
  { id: 'specialty-visit', name: 'Specialty-Visit Question Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'wallet-card', name: 'Medication Wallet Card Generator', group: 'H', audiences: ['patients'], clinical: false },
  // Group I: Field Medicine
  // spec-v29 wave 29-2: 10 Group I field-medicine reference cards
  // removed (adult-arrest-ref, peds-arrest-ref, defib, toxidromes,
  // dot-erg, niosh-pg, cpr-numeric, tccc, hypothermia, heat-illness).
  // Their URL hashes route to the home view with a removed-note via
  // REMOVED_V29_IDS below. Surviving Group I calculators / decision
  // rules remain.
  { id: 'peds-weight-dose', name: 'Pediatric Weight-to-Dose Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'cincinnati',       name: 'Cincinnati Prehospital Stroke Scale', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'fast',             name: 'FAST and BE-FAST Stroke Assessment', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'field-triage',     name: 'Trauma Triage Decision Tool (CDC)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'start-triage',     name: 'START Adult MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'jumpstart-triage', name: 'JumpSTART Pediatric MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bsa_burn',         name: 'Burn Surface Area Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'burn-fluid',       name: 'Burn Fluid Resuscitation Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-ett',         name: 'Pediatric ETT Size Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'naloxone',         name: 'Naloxone Dosing Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field', 'patients'], clinical: true },
  { id: 'ems-doc',          name: 'EMS Documentation Helper', group: 'I', audiences: ['clinicians', 'field'], clinical: false },
  // spec-v149: roughlogic.com EMS-group parity -- three pre-hospital / field
  // bedside calculators that filled confirmed gaps. lib/ems-v149.js,
  // views/group-v149.js (RV149). peds-vitals is Class B (AHA PALS citation
  // trips ISSUER_PATTERN -> citation-staleness row); the other two are Class A.
  { id: 'peds-weight-est',  name: 'Pediatric Weight Estimate (APLS)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-vitals',      name: 'Pediatric Vital Signs Reference (PALS)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'dose-volume',      name: 'Drug Concentration to Volume (draw-up)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group I: v4 extensions (utilities 166-171)
  { id: 'nexus-cspine',     name: 'NEXUS + Canadian C-Spine', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'co-cn-antidote',   name: 'CO / Cyanide / Smoke-Inhalation Antidotes', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group J (NEW): Public Health & Travel (utilities 172-180)
  { id: 'tetanus',      name: 'Tetanus Prophylaxis Decision Tree', group: 'J', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'rabies-pep',   name: 'Rabies PEP Decision Tree', group: 'J', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bbp-exposure', name: 'Bloodborne Pathogen Exposure Decision Tree', group: 'J', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tb-testing',   name: 'TB Testing Interpretation (TST + IGRA)', group: 'J', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sti-screening',name: 'STI Screening Interval Reference (CDC)', group: 'J', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  // Group K (Lab Reference): removed in spec-v29 wave 29-2 (lab-adult,
  // lab-peds, tdm-levels, tox-levels are pure reference-range tables).
  // Group L: Forms & Numbers Literacy (removed in spec-v29 wave 29-2:
  // cms1500, ub04, eob-glossary are pure form / glossary references).
  // Group M (NEW): Eligibility & Benefits (utilities 188-191)
  // Group N (NEW): Literacy Helpers (utilities 192-194)
  { id: 'unit-converter-v4', name: 'Universal Unit Converter (lab + vitals + basics)', group: 'N', audiences: ['patients', 'clinicians', 'educators'], clinical: false },
  { id: 'time-to-dose',      name: 'Time-to-Dose Helper', group: 'N', audiences: ['patients'], clinical: false },
  { id: 'peds-weight-conv',  name: 'Pediatric Weight Converter (lb/oz <-> kg)', group: 'N', audiences: ['patients', 'clinicians', 'educators'], clinical: false },
  // Group O (Patient Safety): high-alert-card removed in spec-v29 wave
  // 29-2 (pure ISMP infographic).

  // spec-v5 §4: deterministic additions for the floor (T1-T17). No live data.
  { id: 'sodium-correction',  name: 'Sodium Correction Rate Planner (Adrogue-Madias)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'free-water-deficit', name: 'Free Water Deficit Calculator',                    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iron-ganzoni',       name: 'Iron Deficit Calculator (Ganzoni)',                group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pbw-ardsnet',        name: 'Predicted Body Weight + ARDSnet Tidal Volume',     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rsbi',               name: 'Rapid Shallow Breathing Index (RSBI)',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lights',             name: 'Light’s Criteria (Pleural Effusion)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mentzer',            name: 'Mentzer Index (Microcytic Anemia Screen)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'saag',               name: 'SAAG (Serum-Ascites Albumin Gradient)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'r-factor',           name: 'R-Factor (Drug-Induced Liver Injury Pattern)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'kdigo-aki',          name: 'KDIGO AKI Staging',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sgarbossa',          name: 'Modified Sgarbossa Criteria (Smith)',              group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'rcri',               name: 'Revised Cardiac Risk Index (Lee)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pews',               name: 'Pediatric Early Warning Score (PEWS)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'em-time',            name: 'Time-Based E/M Code Selector (2021)',              group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
  { id: 'em-mdm',             name: 'MDM-Based E/M Code Selector (2021)',               group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
  { id: 'ndc-convert',        name: 'NDC 10 ↔ 11 Digit Converter',                      group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
  { id: 'avpu-gcs',           name: 'AVPU ↔ GCS Quick Reference',                       group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'sbar-template',      name: 'SBAR Handoff Template Generator',                  group: 'H', audiences: ['clinicians', 'field', 'educators'], clinical: false },

  // spec-v6 §1: deterministic additions, citing 45 CFR (HIPAA) and Figge.
  { id: 'corrected-anion-gap', name: 'Albumin-Corrected Anion Gap (Figge)',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'breach-clock',        name: 'HIPAA Breach 60-Day Notification Clock',          group: 'H', audiences: ['billers', 'educators'], clinical: false },
  { id: 'abcd2',               name: 'ABCD2 Score (TIA stroke risk)',                    group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },

  // spec-v12 §3.1 wave 12-1: early-warning bundle.
  { id: 'news2',               name: 'NEWS2 (National Early Warning Score 2)',           group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'mews',                name: 'MEWS (Modified Early Warning Score)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.2 wave 12-2: VTE risk & severity bundle.
  { id: 'pesi',                name: 'PESI (Pulmonary Embolism Severity Index)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'spesi',               name: 'sPESI (Simplified PESI)',                          group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'padua',               name: 'Padua Prediction Score (VTE risk in medical inpatients)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.3 wave 12-3: upper & lower GI-bleeding bundle.
  { id: 'gbs',                 name: 'Glasgow-Blatchford Bleeding Score',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rockall',             name: 'Rockall Score (upper GI bleeding)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aims65',              name: 'AIMS65 Score (upper GI bleeding mortality)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oakland',             name: 'Oakland Score (lower GI bleeding safe discharge)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.4 wave 12-4: hepatology & liver-fibrosis bundle.
  { id: 'fib4',                name: 'FIB-4 Index for Liver Fibrosis',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apri',                name: 'APRI (AST to Platelet Ratio Index)',               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'maddrey-lille',       name: 'Maddrey DF and Lille Model (alcoholic hepatitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.5 wave 12-5: imaging-decision bundle.
  { id: 'cthr',                name: 'Canadian CT Head Rule',                            group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'ccsr',                name: 'Canadian C-Spine Rule',                            group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'pecarn-head',         name: 'PECARN Pediatric Head Injury Rule',                group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ottawa-ankle',        name: 'Ottawa Ankle Rules',                               group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'ottawa-sah',          name: 'Ottawa Subarachnoid Hemorrhage Rule',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.6 wave 12-6: readmission & care-transition risk.
  { id: 'hospital-score',      name: 'HOSPITAL Score for 30-Day Readmission',            group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lace',                name: 'LACE Index for 30-Day Readmission / Death',        group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.7 wave 12-7: comorbidity, frailty & performance status.
  { id: 'charlson',            name: 'Charlson Comorbidity Index (age-adjusted)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cfs',                 name: 'Clinical Frailty Scale (Rockwood)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ecog-karnofsky',      name: 'ECOG and Karnofsky Performance Status',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.8 wave 12-8: cardiology + §3.9: critical-care.
  { id: 'killip',              name: 'Killip Classification (acute MI)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sirs',                name: 'SIRS Criteria (with Sepsis-3 context)',            group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // spec-v13 §3.1 wave 13-1: ICU mortality scoring (partial).
  { id: 'mods',                name: 'Multiple Organ Dysfunction Score (MODS)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.2 wave 13-2: sedation & delirium bundle.
  { id: 'rass',                name: 'Richmond Agitation-Sedation Scale (RASS)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sas-riker',           name: 'Riker Sedation-Agitation Scale (SAS)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cam-icu',             name: 'CAM-ICU (Confusion Assessment Method, ICU)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'icdsc',               name: 'ICDSC (Intensive Care Delirium Screening Checklist)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: '4at',                 name: '4AT Delirium Screen',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.3 wave 13-3: ICU pain bundle.
  { id: 'cpot',                name: 'CPOT (Critical-Care Pain Observation Tool)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bps',                 name: 'BPS (Behavioral Pain Scale)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.4 wave 13-4: nutrition risk bundle.
  { id: 'nutric',              name: 'NUTRIC Score (nutritional risk in critically ill)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mnutric',             name: 'modified NUTRIC (IL-6 omitted)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nrs2002',             name: 'NRS-2002 (Nutrition Risk Screening 2002)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'must-nutrition',      name: 'MUST (Malnutrition Universal Screening Tool)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.5 wave 13-5: ventilation & lung-injury bundle.
  { id: 'rox',                 name: 'ROX Index (HFNC failure prediction)',              group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'hacor',               name: 'HACOR Score (NIV failure)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'berlin-ards',         name: 'Berlin ARDS Criteria',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lis-murray',          name: 'Murray Lung Injury Score',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lips',                name: 'Lung Injury Prediction Score (LIPS)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.6 wave 13-6: vasoactive load.
  { id: 'vis',                 name: 'Vasoactive-Inotropic Score (VIS)',                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.7 wave 13-7: severe CAP triage.
  { id: 'smart-cop',           name: 'SMART-COP (CAP severity)',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'crb65',               name: 'CRB-65 (CAP severity, no BUN)',                    group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'ats-idsa-cap',        name: 'ATS/IDSA Severe CAP Criteria (2019)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'drip',                name: 'DRIP Score (drug-resistant pneumonia)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.2 wave 14-2 (partial): sleep-disordered breathing.
  { id: 'stop-bang',           name: 'STOP-BANG OSA Screen',                             group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'epworth',             name: 'Epworth Sleepiness Scale',                         group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'berlin-osa',          name: 'Berlin Questionnaire (OSA)',                       group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  // spec-v14 §3.3 wave 14-3 (partial): airway, PONV, recovery.
  { id: 'apfel',               name: 'Apfel Simplified PONV Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aldrete',             name: 'modified Aldrete Recovery Score',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lemon',               name: 'LEMON Difficult Airway Predictor',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'white-song',          name: 'White-Song Fast-Track Recovery',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.4 wave 14-4: AFib bleeding alternatives.
  { id: 'atria-bleeding',      name: 'ATRIA Bleeding Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'orbit-bleeding',      name: 'ORBIT Bleeding Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hemorr2hages',        name: 'HEMORR2HAGES Bleeding Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.5 wave 14-5: medical-inpatient bleeding & VTE prophylaxis.
  { id: 'improve-bleeding',    name: 'IMPROVE Bleeding Risk Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'improve-vte',         name: 'IMPROVE VTE Risk Score',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.6 wave 14-6 (partial): cancer-VTE & VTE-recurrence.
  { id: 'khorana',             name: 'Khorana Cancer-VTE Score',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dash-vte',            name: 'DASH VTE-Recurrence Score',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'herdoo2',             name: 'HERDOO2 (women with unprovoked VTE)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.7 wave 14-7 (partial): HIT / DIC.
  { id: 'four-ts',             name: '4Ts Score for HIT',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'isth-dic',            name: 'ISTH Overt DIC Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.8 wave 14-8 (partial): DAPT duration.
  { id: 'dapt-score',          name: 'DAPT Score (continuation)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.1 wave 15-1 (partial): obstetrics.
  { id: 'bpp',                 name: 'Biophysical Profile (BPP)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acog-severe-pre',     name: 'ACOG Severe-feature Preeclampsia',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hellp',               name: 'HELLP Syndrome Criteria',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'carpenter-coustan',   name: 'Carpenter-Coustan GDM Criteria',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iadpsg',              name: 'IADPSG GDM Criteria',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.2 wave 15-2: pediatric febrile-infant evaluation.
  { id: 'rochester',           name: 'Rochester Criteria (febrile infant)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'philadelphia',        name: 'Philadelphia Criteria (febrile infant)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'boston-febrile',      name: 'Boston Criteria (febrile infant)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'step-by-step',        name: 'Step-by-Step Approach (febrile infant)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'yos',                 name: 'Yale Observation Scale',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.3 wave 15-3: pediatric respiratory + neurologic.
  { id: 'westley',             name: 'Westley Croup Score',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pram-asthma',         name: 'PRAM (pediatric asthma severity)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pass-asthma',         name: 'PASS (pediatric asthma severity)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-gcs',            name: 'Pediatric Glasgow Coma Scale',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nigrovic',            name: 'Bacterial Meningitis Score (Nigrovic)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.4 wave 15-4: pediatric imaging-decision companions.
  { id: 'pecarn-iai',          name: 'PECARN Intra-Abdominal Injury Rule',               group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pecarn-cspine',       name: 'PECARN Pediatric C-Spine Rule',                    group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.5 wave 15-5 (partial): trauma scoring.
  { id: 'abc-mtp',             name: 'ABC Score for Massive Transfusion',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mgap',                name: 'MGAP Trauma Score',                                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gap',                 name: 'GAP Trauma Score',                                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'big',                 name: 'BIG Score (pediatric trauma)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3a: nurse-bedside scoring tiles (partial).
  { id: 'braden',              name: 'Braden Scale (pressure injury risk)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'morse-falls',         name: 'Morse Fall Scale',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hendrich-ii',         name: 'Hendrich II Fall Risk Model',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cam',                 name: 'Confusion Assessment Method (CAM, non-ICU)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ich-score',           name: 'ICH Score (Hemphill 2001)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hunt-hess-wfns',      name: 'Hunt-Hess + WFNS aneurysmal SAH grading',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mnihss',              name: 'modified NIHSS (mNIHSS, 11-item)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aldrete-padss',       name: 'modified Aldrete + PADSS (PACU discharge)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3b: nurse-bedside criteria bundles.
  { id: 'npiap-staging',       name: 'NPIAP pressure injury stage selector',             group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'norton-push',         name: 'Norton Scale + PUSH Tool',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vip-extravasation',   name: 'VIP + INS infiltration / extravasation grading',   group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'blood-compat',        name: 'ABO/Rh blood-product compatibility quick-check',   group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3c: nurse-bedside math.
  { id: 'insulin-correction',     name: 'Insulin correction (ADA 2024 ISF / ICR)',          group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'electrolyte-replacement',name: 'Electrolyte replacement ladder (K / Mg / Phos)',   group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'crrt-dose',              name: 'CRRT effluent dose + citrate-Ca ratio',            group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ecmo-titration',         name: 'ECMO sweep / flow titration helper',               group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3d: timer / workflow bedside tiles.
  { id: 'ews-escalation',         name: 'NEWS2 / MEWS escalation + re-assessment timer',    group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'restraint-timer',        name: 'Restraint reassessment timer (CMS 42 CFR 482.13)', group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sepsis-bundle-clock',    name: 'Surviving Sepsis bundle timer + lactate clearance', group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'code-blue-clock',        name: 'Code-blue documentation timer (AHA 2020)',         group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mtp-tracker',            name: 'Massive Transfusion 1:1:1 ratio tracker (PROPPR)',  group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'device-day-counter',     name: 'Foley / central-line device-day counter (CDC)',    group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bristol-girth',          name: 'Bristol stool type + abdominal-girth trend',       group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3e: vent bundle (closes wave 29-3).
  { id: 'vent-sbt-peep',          name: 'SBT readiness + ARDSnet PEEP/FiO2 table',           group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v30 §2: thermal-emergency decision tiles (re-admits the v29
  // wave 29-2 hypothermia / heat-illness reference cards as decisions).
  { id: 'hypothermia-rewarm',     name: 'Swiss hypothermia staging + rewarming algorithm',  group: 'I', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'heatstroke-decision',    name: 'Heat exhaustion vs heat stroke + cooling algorithm', group: 'I', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v31 §2.1: Beers deprescribing checker (resolves spec-v29 §10.4).
  { id: 'beers-check',            name: 'Beers Criteria deprescribing checker (AGS 2023)',  group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v32 §2: non-verbal pain scales for nurse-bedside use.
  { id: 'flacc',                  name: 'FLACC scale (pediatric non-verbal pain)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'painad',                 name: 'PAINAD (Pain Assessment in Advanced Dementia)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nips',                   name: 'NIPS (Neonatal Infant Pain Scale)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v33 §2: opioid-sedation + neonatal-pain extensions.
  { id: 'npass',                  name: 'N-PASS (Neonatal Pain, Agitation, Sedation Scale)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cries',                  name: 'CRIES neonatal postoperative pain scale',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'poss',                   name: 'POSS (Pasero Opioid-induced Sedation Scale)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v34 §2: pediatric ICU bedside extensions.
  { id: 'comfort-b',              name: 'COMFORT-B Behavioral Scale (pediatric sedation)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wat-1',                  name: 'WAT-1 (pediatric iatrogenic withdrawal)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sbs',                    name: 'SBS (State Behavioral Scale, pediatric ICU)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v35 §2: pediatric ICU iatrogenic-withdrawal companion to WAT-1.
  { id: 'sos',                    name: 'SOS (Sophia Observation withdrawal Symptoms)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v36 §2: maternal track-and-trigger (obstetric early warning).
  { id: 'meows',                  name: 'MEOWS (Modified Early Obstetric Warning System)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v37 §2: prehospital / ED stroke triage scales (CPSS + LAMS).
  { id: 'cpss',                   name: 'CPSS (Cincinnati Prehospital Stroke Scale)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lams',                   name: 'LAMS (Los Angeles Motor Scale, LVO prediction)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v38 §2: prehospital LVO predictor companion to LAMS (5-item Pérez de la Ossa 2014).
  { id: 'race',                   name: 'RACE (Rapid Arterial oCclusion Evaluation)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v39 §2: ED stroke recognition with stroke-mimic discrimination.
  { id: 'rosier',                 name: 'ROSIER (Recognition of Stroke in the Emergency Room)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v40 §2: post-stroke bedside dysphagia screen (aspiration risk before oral intake).
  { id: 'guss',                   name: 'GUSS (Gugging Swallowing Screen, post-stroke dysphagia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v41 §2: ICU coma scale for intubated/sedated patients (GCS alternative with brainstem).
  { id: 'four-score',             name: 'FOUR Score (ICU coma scale for intubated patients)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v42 §2: geriatric / discharge-planning functional status (ADL independence).
  { id: 'katz-adl',               name: 'Katz ADL (Activities of Daily Living index)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v43 §2: instrumental ADL companion to Katz (medications, finances, transport, etc.).
  { id: 'lawton-iadl',            name: 'Lawton IADL (Instrumental Activities of Daily Living)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v44 §2: rehab-nursing weighted ADL (10 items, 0-100; serial tracking).
  { id: 'barthel',                name: 'Barthel Index (weighted ADL for rehab nursing)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v45 §2: bedside suicide-risk screening (Joint Commission / SAMHSA recommended).
  { id: 'cssrs',                  name: 'C-SSRS Screener (Columbia Suicide Severity Rating Scale)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v86 (first feature spec of the spec-v85 Advanced Clinical Calculators
  // program): three deterministic toxicology decision rules. Hunter serotonin-
  // toxicity criteria, EXTRIP salicylate hemodialysis indication, and the
  // ethanol-corrected osmolar gap + AACT fomepizole rule. Input-driven, no
  // bundled drug database (doctrine clause 2). views/group-v12.js, lib/tox-v86.js.
  { id: 'serotonin-toxicity',     name: 'Serotonin Toxicity (Hunter Criteria)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'salicylate-toxicity',    name: 'Salicylate Poisoning + EXTRIP Hemodialysis Indication', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'toxic-alcohol',          name: 'Toxic Alcohol: Osmolar Gap + Fomepizole Indication', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v88 (third feature spec of the spec-v85 Advanced Clinical Calculators
  // program): endocrine + oncologic emergencies. ADA DKA/HHS classification and
  // Cairo-Bishop tumor-lysis grading (Group G); the Calvert carboplatin dose
  // with the FDA GFR cap lives in Group F below. views/group-v14.js,
  // lib/metabolic-onc-v88.js.
  { id: 'dka-hhs',                name: 'DKA vs HHS Classification + DKA Severity (ADA)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tls-cairo-bishop',       name: 'Tumor Lysis Syndrome (Cairo-Bishop grading)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v89 (fourth and final feature spec of the spec-v85 Advanced Clinical
  // Calculators program): rheumatology, hepatology & perioperative. DAS28
  // disease activity, King's College Criteria, ASA Physical Status, and the
  // Surgical Apgar Score - all Group G. views/group-v15.js, lib/rheum-periop-v89.js.
  { id: 'das28',                  name: 'DAS28 (rheumatoid arthritis disease activity, ESR/CRP)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'kings-college',          name: 'King’s College Criteria (acetaminophen-induced ALF)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'asa-ps',                 name: 'ASA Physical Status Classification',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'surgical-apgar',         name: 'Surgical Apgar Score (intraoperative outcome)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v90 (first feature spec of Wave 2 of the spec-v85 Advanced Clinical
  // Calculators program): cardiology & ECG. Mean QRS axis, ECG-LVH voltage
  // criteria, TIMI-STEMI, Duke treadmill, cardiac power output, and continuity-
  // equation aortic valve area. views/group-v16.js, lib/cardio-v90.js.
  { id: 'ecg-axis',               name: 'Mean QRS Axis (frontal plane, hexaxial)',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lvh-criteria',           name: 'ECG LVH Voltage Criteria (Sokolow-Lyon, Cornell)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'timi-stemi',             name: 'TIMI Risk Score for STEMI (Morrow)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'duke-treadmill',         name: 'Duke Treadmill Score (exercise-test prognosis)',   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cardiac-power-output',   name: 'Cardiac Power Output (CPO)',                        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aortic-valve-area',      name: 'Aortic Valve Area (continuity equation)',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v91 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
  // pulmonary function & chronic respiratory disease. GOLD spirometric grade,
  // BODE COPD prognosis, GAP index for IPF, GLI-2012 predicted spirometry, and
  // the mMRC dyspnea scale. views/group-v17.js, lib/pulm-v91.js.
  { id: 'gold-spirometry',        name: 'GOLD Spirometric Grade (COPD)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bode-index',             name: 'BODE Index (COPD prognosis)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gap-ipf',                name: 'GAP Index (idiopathic pulmonary fibrosis)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'predicted-spirometry',   name: 'Predicted Spirometry + LLN (GLI-2012)',            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mmrc-dyspnea',           name: 'mMRC Dyspnea Scale',                               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v92 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
  // nephrology. KDIGO CKD G×A staging, spot urine albumin/protein ratios,
  // hemodialysis adequacy (URR + Daugirdas Kt/V), the Mehran contrast-nephropathy
  // risk score, and the 2021 race-free CKD-EPI cystatin-C eGFR.
  // views/group-v18.js, lib/nephro-v92.js.
  { id: 'ckd-staging',            name: 'KDIGO CKD Staging (G×A risk)',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'uacr-upcr',              name: 'Urine Albumin/Protein-to-Creatinine Ratio',        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ktv-urr',                name: 'Dialysis Adequacy (URR + Kt/V)',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mehran-cin',             name: 'Mehran Contrast-Induced Nephropathy Risk',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ckd-epi-cystatin',       name: 'CKD-EPI 2021 Cystatin-C eGFR (race-free)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v93 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
  // hepatology & GI disease activity. The NAFLD Fibrosis Score, the modified
  // Glasgow (Imrie) pancreatitis severity, Truelove & Witts and Mayo for
  // ulcerative colitis, the Harvey-Bradshaw index for Crohn's, and the Milan
  // criteria for HCC transplant eligibility. views/group-v19.js, lib/hepgi-v93.js.
  { id: 'nafld-fibrosis',         name: 'NAFLD Fibrosis Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'glasgow-imrie',          name: 'Modified Glasgow (Imrie) Pancreatitis Severity',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'truelove-witts',         name: 'Truelove & Witts UC Severity',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'harvey-bradshaw',        name: 'Harvey-Bradshaw Index (Crohn’s activity)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mayo-uc',                name: 'Mayo Score / Partial Mayo (ulcerative colitis)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'milan-criteria',         name: 'Milan Criteria (HCC transplant eligibility)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v94 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
  // hematology & oncology prognostic scores. The HScore for reactive HLH, the
  // revised IPSS-R for MDS, the FLIPI/IPI lymphoma indices, the MASCC febrile-
  // neutropenia risk index, and the Sokal/ELTS CML risk scores. They join the
  // heme bedside cluster (anc, khorana, four-ts, isth-dic, tls-cairo-bishop)
  // with the malignancy-prognosis layer. views/group-v20.js, lib/hemonc-v94.js.
  { id: 'hscore-hlh',             name: 'HScore (reactive hemophagocytic syndrome)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ipss-r-mds',             name: 'Revised IPSS-R (myelodysplastic syndromes)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'flipi',                  name: 'FLIPI + IPI Lymphoma Prognostic Indices',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mascc',                  name: 'MASCC Risk Index (febrile neutropenia)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sokal-cml',              name: 'Sokal / ELTS Risk Scores (CML)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v95 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
  // neurology outcome scales & structural grading. The modified Rankin and
  // GOS-E functional-outcome endpoints, Hoehn & Yahr Parkinson staging, the
  // Spetzler-Martin AVM surgical grade (+ Lawton-Young supplement), the
  // House-Brackmann facial-nerve grade, and the MIDAS migraine-disability
  // index. They join the acute neuro cluster (nihss, ich-score,
  // hunt-hess-wfns, four-score, abcd2) with the longitudinal layer the same
  // patient is followed with. views/group-v21.js, lib/neuro-v95.js.
  { id: 'mrs',                    name: 'Modified Rankin Scale (stroke outcome)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gose',                   name: 'Glasgow Outcome Scale - Extended (GOS-E)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hoehn-yahr',             name: 'Hoehn & Yahr Parkinson Disease Staging',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'spetzler-martin',        name: 'Spetzler-Martin AVM Grade (+ Lawton-Young)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'house-brackmann',        name: 'House-Brackmann Facial Nerve Grading',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'midas',                  name: 'MIDAS (Migraine Disability Assessment)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v96 (Wave 2 of spec-v85): six clinician-rated psychiatry rating scales
  // that sit one rung above the brief self-report screeners (phq9, gad7, cssrs,
  // gds15, epds, auditc) -- the instruments a psychiatrist uses to MEASURE
  // depression / anxiety / OCD / PTSD severity and track treatment response, plus
  // the bipolar-spectrum (mdq) and PTSD (pcl5) screens the catalog was missing.
  // views/group-v22.js, lib/psych-v96.js.
  { id: 'hamd',                   name: 'Hamilton Depression Rating Scale (HAM-D, 17-item)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hama',                   name: 'Hamilton Anxiety Rating Scale (HAM-A, 14-item)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'madrs',                  name: 'Montgomery-Asberg Depression Rating Scale (MADRS)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mdq',                    name: 'Mood Disorder Questionnaire (bipolar screen)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ybocs',                  name: 'Yale-Brown Obsessive Compulsive Scale (Y-BOCS)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pcl5',                   name: 'PTSD Checklist for DSM-5 (PCL-5, 20-item)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v97 (Wave 2 of spec-v85): five perioperative risk instruments one rung
  // above the screening indices already in the catalog (rcri, ariscat, lemon,
  // apfel, asa-ps, surgical-apgar). Two are published logistic PROBABILITY models
  // (Gupta MICA cardiac, Gupta respiratory failure), two are validated weighted
  // INDICES (Arozullah pneumonia, El-Ganzouri airway), and one is a preoperative
  // point-score MORTALITY model (POSPOM). views/group-v23.js, lib/periop-v97.js.
  { id: 'gupta-mica',             name: 'Gupta Perioperative Cardiac Risk (MICA)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gupta-respiratory-failure', name: 'Gupta Postoperative Respiratory Failure Risk',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'arozullah-pneumonia',    name: 'Arozullah Postoperative Pneumonia Risk Index',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'el-ganzouri',            name: 'El-Ganzouri Risk Index (difficult intubation)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pospom',                 name: 'POSPOM (preoperative postoperative-mortality score)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v142 (Wave 8 of spec-v100, program-opening): six classic surgical /
  // anesthetic risk instruments beside the modern periop cluster above. POSSUM
  // and its Portsmouth recalibration drive logistic morbidity/mortality
  // equations; SORT is the modern six-variable bedside mortality estimate;
  // Goldman is the 1977 ancestor of rcri; Wilson is an anatomic difficult-airway
  // predictor distinct from el-ganzouri; the Surgical Risk Scale is the
  // CEPOD+ASA+BUPA audit score. views/group-v142.js, lib/surg-v142.js (RV142).
  { id: 'possum',                 name: 'POSSUM (operative morbidity & mortality)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'p-possum',               name: 'P-POSSUM (Portsmouth-recalibrated mortality)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sort',                   name: 'Surgical Outcome Risk Tool (SORT)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'goldman-cardiac-risk',   name: 'Goldman Cardiac Risk Index',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wilson-airway',          name: 'Wilson Risk Sum Score (difficult intubation)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'surgical-risk-scale',    name: 'Surgical Risk Scale (Sutton)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v143 (Wave 8 of spec-v100): five frailty / geriatric-oncology screening
  // instruments that deepen the charlson / cfs frailty-comorbidity panel and the
  // ecog-karnofsky oncology cluster. mFI-5/mFI-11 are the free, published
  // surrogates for the proprietary ACS-NSQIP risk calculator; the FRAIL Scale and
  // VES-13 are bedside screens; CARG is the standard pre-chemotherapy toxicity
  // predictor for adults >= 65. views/group-v143.js, lib/frailty-v143.js (RV143).
  { id: 'mfi-5',                  name: 'Modified 5-Item Frailty Index (mFI-5)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mfi-11',                 name: 'Modified 11-Item Frailty Index (mFI-11)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'frail-scale',            name: 'FRAIL Scale (frailty screen)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ves-13',                 name: 'Vulnerable Elders Survey-13 (VES-13)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'carg-toxicity',          name: 'CARG Chemotherapy Toxicity Tool',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v144 (Wave 8 of spec-v100): six orthopedic fracture-classification
  // decision rules beside the orthopedic triage/risk cluster (ottawa-ankle,
  // ottawa-knee, nexus-cspine, canadian-c-spine). Per the spec-v100 §2
  // classification clarification, each consumes the clinician's read of the film
  // (wound size, displacement, fibula level, plateau geometry, physeal pattern,
  // displaced-part count) and computes a class -- not a no-input reference table.
  // views/group-v144.js, lib/ortho-v144.js (RV144).
  { id: 'gustilo-anderson',       name: 'Gustilo-Anderson Open Fracture Classification',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'garden-classification',  name: 'Garden Classification (femoral neck)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'weber-ankle',            name: 'Danis-Weber Ankle Classification',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'schatzker-classification', name: 'Schatzker Classification (tibial plateau)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'salter-harris',          name: 'Salter-Harris Classification (physeal fracture)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'neer-classification',    name: 'Neer Classification (proximal humerus)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v145 (Wave 8 of spec-v100): five orthopedic risk / osteoarthritis
  // instruments beside the v144 fracture-classification cluster and the existing
  // ottawa-knee / ottawa-ankle ED rules. Per the spec-v100 §2 classification
  // clarification the Frykman/Mirels/Kellgren-Lawrence tiles consume the
  // clinician's read of the film (joint involvement, lesion factors, grade) and
  // compute a class/score; pittsburgh-knee-rule is entry-gated boolean logic;
  // compartment-delta-pressure (Group E) is a guarded subtraction with the
  // < 30 mmHg fasciotomy flag. views/group-v145.js, lib/ortho-v145.js (RV145).
  { id: 'frykman-classification', name: 'Frykman Classification (distal radius)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mirels-score',           name: 'Mirels Score (impending pathologic fracture)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'kellgren-lawrence',      name: 'Kellgren-Lawrence Osteoarthritis Grade',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pittsburgh-knee-rule',   name: 'Pittsburgh Knee Rules (knee-radiograph indication)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'compartment-delta-pressure', name: 'Compartment Delta Pressure (fasciotomy threshold)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v146 (Wave 8 of spec-v100): five spinal tumor / trauma classification
  // instruments. The catalog has the brain/cerebrovascular neurosurgical scores
  // (ich-score, hunt-hess-wfns, nihss) but no spinal instability, spinal-
  // metastasis, or spinal-trauma scores. Per the spec-v100 §2 classification
  // clarification each tile consumes the clinician's read of the CT/MRI/exam as
  // bounded selects and computes a weighted-sum score + the source's management
  // interpretation; none is a no-input reference table. views/group-v146.js,
  // lib/spine-v146.js (RV146).
  { id: 'sins-score',         name: 'Spinal Instability Neoplastic Score (SINS)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tokuhashi-revised',  name: 'Revised Tokuhashi Score (metastatic spine prognosis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tomita-score',       name: 'Tomita Score (spinal-metastasis surgical strategy)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tlics-score',        name: 'Thoracolumbar Injury Classification & Severity (TLICS)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'slic-score',         name: 'Subaxial Cervical Spine Injury Classification (SLIC)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v147 (Wave 8 of spec-v100): seven rheumatology disease-activity and
  // classification instruments that fill confirmed gaps beside the das28 anchor.
  // CDAI/SDAI are the lab-light/CRP DAS28 companions; the 2010 ACR/EULAR RA,
  // 2015 gout, CASPAR, and 2016 fibromyalgia criteria are the standard
  // classification rules; SLEDAI-2K is the SLE activity index. Per the spec-v100
  // §2 classification clarification each tile consumes the clinician's read of
  // the joint exam, serology, synovial fluid, and imaging and computes a score /
  // classification; none is a no-input reference table. views/group-v147.js,
  // lib/rheum-v147.js (RV147).
  { id: 'cdai-ra',            name: 'CDAI (Clinical Disease Activity Index, rheumatoid arthritis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sdai-ra',            name: 'SDAI (Simplified Disease Activity Index, rheumatoid arthritis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acr-eular-2010-ra',  name: '2010 ACR/EULAR Rheumatoid Arthritis Classification Criteria', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sledai-2k',          name: 'SLEDAI-2K (SLE Disease Activity Index 2000)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gout-acr-eular-2015', name: '2015 ACR/EULAR Gout Classification Criteria',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'caspar',             name: 'CASPAR Criteria for Psoriatic Arthritis',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fibromyalgia-acr-2016', name: '2016 Revised ACR Fibromyalgia Criteria',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v148 (Wave 8 of spec-v100, the CLOSING spec): seven deterministic
  // rheumatology, palliative, and pharmacy instruments. ASDAS is the
  // spondyloarthritis activity score; FFS-2011 the vasculitis prognosis; the
  // 2022 ACR/EULAR GCA criteria the giant-cell-arteritis classification; PPI and
  // PaP the free palliative-prognosis substitutes; the opioid converter an
  // equianalgesic rotation calculator (distinct from the surveillance opioid-mme);
  // Naranjo the ADR causality scale. Per the spec-v100 §2 classification
  // clarification each tile consumes the clinician's bounded inputs and computes a
  // score / classification / converted dose; none is a no-input reference table.
  // The proposed eighth tile (valproate-correction) is DEFERRED (docs/spec-v148.md
  // §7.1: spec citation error + free-fraction table not cross-verifiable to >=2
  // sources + documented clinical inaccuracy). views/group-v148.js,
  // lib/rheum-v148.js (RV148).
  { id: 'asdas',              name: 'ASDAS (Ankylosing Spondylitis Disease Activity Score)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ffs-2011',           name: 'Five-Factor Score (FFS-2011, systemic vasculitis prognosis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gca-acr-eular-2022', name: '2022 ACR/EULAR Giant Cell Arteritis Classification Criteria', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'palliative-prognostic-index', name: 'Palliative Prognostic Index (PPI)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'palliative-prognostic-score', name: 'Palliative Prognostic Score (PaP)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'opioid-conversion',  name: 'Opioid Equianalgesic Conversion (rotation calculator)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'naranjo',            name: 'Naranjo Adverse Drug Reaction Probability Scale',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v151 (the first implementation spec of the spec-v150 Post-Parity
  // Coverage program): four deterministic dermatology severity instruments -
  // dermatology had no scored-severity tile in the live catalog. PASI is the
  // psoriasis index that gates biologics; EASI and SCORAD are the two competing
  // atopic-dermatitis indices (EASI's region weights are age-branched); DLQI is
  // the universal skin quality-of-life score. Per the spec-v100 §2 classification
  // clarification each tile consumes the clinician's / patient's bounded read of
  // the exam and computes a region/item-weighted score + band; none is a no-input
  // reference table. views/group-v151.js, lib/derm-v151.js (RV151).
  { id: 'pasi',               name: 'PASI (Psoriasis Area and Severity Index)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'easi',               name: 'EASI (Eczema Area and Severity Index)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'scorad',             name: 'SCORAD (SCORing Atopic Dermatitis)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dlqi',               name: 'DLQI (Dermatology Life Quality Index)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v152 (the second implementation spec of the spec-v150 Post-Parity
  // Coverage program): five predictive energy-expenditure equations - the
  // catalog had nutrition screening (must/nrs2002/nutric) and a weight-based
  // icu-nutrition-target, but no predictive resting/total energy-expenditure
  // regression (the number a dietitian starts from). Mifflin-St Jeor (the
  // ambulatory standard), Harris-Benedict (the classic comparator), and
  // Katch-McArdle (lean-mass) are Group E math; Penn State and Ireton-Jones are
  // the ventilated-ICU equations in Group F (nutrition-support context). Each
  // consumes the bounded anthropometrics and computes a predicted kcal/day; none
  // is a no-input reference table. views/group-v152.js, lib/nutrition-energy-v152.js (RV152).
  { id: 'mifflin-st-jeor',    name: 'Mifflin-St Jeor Resting Energy Expenditure',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'harris-benedict',    name: 'Harris-Benedict Basal Energy Expenditure (revised)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'katch-mcardle',      name: 'Katch-McArdle Basal Metabolic Rate (lean-mass)',   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'penn-state-ree',     name: 'Penn State Equation (ventilated REE)',              group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ireton-jones',       name: 'Ireton-Jones Energy Equation',                     group: 'F', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v153 (the third implementation spec of the spec-v150 Post-Parity
  // Coverage program): three deterministic urology / men's-health patient-
  // reported symptom scores - the catalog carried the urologic oncology math
  // (psa-density/velocity/doubling-time, prostate-volume, gleason-grade-group,
  // damico-prostate-risk, capra-score) and stone scores but NONE of the
  // symptom-score PROs that drive benign-disease management. IPSS/AUA-SI is the
  // BPH/LUTS standard, IIEF-5 (SHIM) is the abridged erectile-dysfunction
  // screen, and OABSS is the overactive-bladder score (with an urgency >= 2
  // diagnostic gate). Per the spec-v100 §2 classification clarification each
  // tile consumes the patient's bounded self-report and computes an item-summed
  // score + band; none is a no-input reference table. views/group-v153.js,
  // lib/urology-v153.js (RV153).
  { id: 'ipss',               name: 'IPSS / AUA Symptom Index (prostate / LUTS)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iief5',              name: 'IIEF-5 / SHIM (erectile dysfunction)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oabss',              name: 'OABSS (Overactive Bladder Symptom Score)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v154 (the fourth implementation spec of the spec-v150 Post-Parity
  // Coverage program): four performance-based function / falls / palliative
  // instruments - the catalog carried fall RISK-prediction scores (morse-falls,
  // hendrich-ii) and frailty screens but no performance-based mobility/balance
  // measure, and palliative care had ecog-karnofsky but not the Palliative
  // Performance Scale that anchors hospice eligibility. Berg Balance and Tinetti
  // POMA are the standard balance/gait batteries, TUG is the single-most-used
  // bedside mobility screen (CDC STEADI threshold), and PPSv2 is the hospice-
  // eligibility functional anchor (read-leftward column rule). Per the spec-v100
  // §2 doctrine each consumes the measured performance and computes a score,
  // threshold flag, or level; none is a no-input reference table.
  // views/group-v154.js, lib/function-v154.js (RV154).
  { id: 'berg-balance',       name: 'Berg Balance Scale (BBS)',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tug',                name: 'Timed Up & Go (TUG)',                              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tinetti-poma',       name: 'Tinetti POMA (mobility & gait)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pps',                name: 'Palliative Performance Scale (PPSv2)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v155 (the fifth implementation spec of the spec-v150 Post-Parity
  // Coverage program): four suite-completion tiles, each plugging a named hole
  // in an otherwise-complete suite. The lymphoma-index suite (nccn-ipi, r-ipi,
  // flipi) had no mantle-cell index; the UGI-bleed suite (gbs, rockall, aims65,
  // oakland) had no endoscopic-stigmata anchor; wifi grades limb threat but the
  // diabetic-foot wound-grading systems were absent. mipi is a closed-form
  // continuous index (log domain guarded); forrest / wagner-dfu /
  // university-texas-dfu are deterministic input -> class mappings (spec-v100 §2
  // classification clarification). PRECISE-DAPT is DEFERRED under the spec-v97
  // >= 2-source rule (a non-transcribable restricted-cubic-spline nomogram),
  // parked with crib-ii / gail-bcrat. views/group-v155.js, lib/suites-v155.js
  // (RV155).
  { id: 'mipi',               name: 'MIPI (Mantle Cell Lymphoma Prognostic Index)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'forrest',            name: 'Forrest Classification (UGI bleeding stigmata)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wagner-dfu',         name: 'Wagner Diabetic Foot Ulcer Grade',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'university-texas-dfu', name: 'University of Texas Diabetic Foot Ulcer Class',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v156 (the sixth and CLOSING implementation spec of the spec-v150
  // Post-Parity Coverage program): four tiles that complete the rheumatology
  // patient-reported axis and the obstetric cesarean-audit standard. v147/v148
  // shipped the physician-derived rheumatology activity scores (cdai-ra,
  // sdai-ra, sledai-2k, asdas, ffs-2011); v156 completes the PATIENT-reported
  // axial-SpA axis (basdai activity, basfi function) and adds the standard
  // Sjögren systemic-activity index (essdai); robson is the WHO-endorsed
  // cesarean-audit classifier beside meows / bishop. basdai/basfi/essdai are
  // bounded means / weighted sums; robson is a deterministic input -> group
  // mapping where every valid combination resolves to exactly one of the ten
  // groups (spec-v100 §2 classification clarification). views/group-v156.js,
  // lib/rheum-ob-v156.js (RV156). Closes the Post-Parity Coverage program.
  { id: 'basdai',             name: 'BASDAI (Ankylosing Spondylitis Disease Activity)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'basfi',              name: 'BASFI (Ankylosing Spondylitis Functional Index)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'essdai',             name: 'ESSDAI (Sjögren Disease Activity Index)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'robson',             name: 'Robson Ten-Group Classification (cesarean audit)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v158 (first feature spec of the spec-v157 Subspecialty Depth program):
  // five echocardiography quantification computes that fill the program headline
  // gap - echo had only aortic-valve-area despite being one of the most-performed
  // studies in medicine. Each is closed-form arithmetic over the operator's 2D /
  // Doppler measurements with published severity partitions (spec-v100 §2). All
  // Clinical Math & Conversions (Group E). views/group-v158.js, lib/echo-v158.js
  // (RV158). Formulas/partitions cross-verified vs ASE/EACVI (Lang 2015) + the
  // cited primary papers (spec-v97).
  { id: 'lv-mass-index',      name: 'LV Mass Index & Geometry (Devereux)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'la-volume-index',    name: 'Left Atrial Volume Index (LAVI)',                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'teichholz-lvef',     name: 'Teichholz LVEF & Fractional Shortening',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rvsp-pasp',          name: 'RV Systolic Pressure / PASP (TR jet)',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mitral-e-e-prime',   name: 'E/e′ (LV Filling-Pressure Estimate)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v159 (second feature spec of the spec-v157 Subspecialty Depth program):
  // four neurology / spine disability classification scales used in MS,
  // spinal-cord-injury, and cervical-myelopathy clinics - none was in the
  // catalog. Each is a deterministic input -> grade/step mapping (spec-v100 §2
  // classification clarification). All Clinical Scoring & Risk (Group G).
  // views/group-v159.js, lib/neuro-disability-v159.js (RV159).
  { id: 'edss',               name: 'EDSS (Expanded Disability Status Scale, MS)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'asia-impairment',    name: 'ASIA Impairment Scale (spinal-cord injury)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mjoa',               name: 'mJOA (cervical myelopathy)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nurick',             name: 'Nurick Grade (cervical spondylotic myelopathy)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v160 (third feature spec of the spec-v157 Subspecialty Depth program):
  // four rheumatology activity / classification instruments - the routine US RA
  // PRO (RAPID3), the PsA activity index (DAPSA), and the two SLE classification
  // criteria (SLICC 2012 and 2019 EULAR/ACR). rapid3/dapsa are bounded weighted
  // sums; slicc-sle / sle-2019-eular-acr are deterministic classification rules
  // (spec-v100 §2). All Clinical Scoring & Risk (Group G). views/group-v160.js,
  // lib/rheum-v160.js (RV160). Weights cross-verified (spec-v97).
  { id: 'rapid3',             name: 'RAPID3 (RA patient-reported activity)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dapsa',              name: 'DAPSA (Psoriatic Arthritis Disease Activity)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'slicc-sle',          name: 'SLICC 2012 SLE Classification Criteria',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sle-2019-eular-acr', name: '2019 EULAR/ACR SLE Classification Criteria',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v161 (fourth and CLOSING feature spec of the spec-v157 Subspecialty
  // Depth program): four endocrine / metabolic / nutrition-support arithmetic
  // computes that fill the absent screening math. arr / calcium-phosphate-product
  // / free-thyroxine-index are Clinical Math & Conversions (Group E);
  // nitrogen-balance is Medication & Infusion (Group F, nutrition-support
  // context). views/group-v161.js, lib/endo-metab-v161.js (RV161).
  // calcium-phosphate-product cites KDIGO -> documentation-only staleness row.
  { id: 'arr',                    name: 'Aldosterone-Renin Ratio (primary-aldosteronism screen)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'calcium-phosphate-product', name: 'Calcium-Phosphate Product (CKD-MBD)',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'free-thyroxine-index',   name: 'Free Thyroxine Index (FTI / T7)',                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nitrogen-balance',       name: 'Nitrogen Balance (nutrition support)',             group: 'F', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v163 (first feature spec of the spec-v162 Cross-Discipline Completion
  // program): three evidence-based-medicine bedside-math computes that fill a
  // confirmed gap - the catalog cites sensitivity / likelihood-ratios but had no
  // tool to compute post-test probability, predictive values, or NNT. Each is
  // closed-form arithmetic over the entered values (spec-v100 §2). All Clinical
  // Math & Conversions (Group E). views/group-v163.js, lib/ebm-v163.js (RV163).
  // Textbook-standard formulas cross-verified to >= 2 sources (spec-v97).
  { id: 'fagan-post-test',    name: 'Fagan Post-Test Probability (likelihood ratio)',    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'diagnostic-2x2',     name: 'Diagnostic Test 2×2 (sens / spec / PV / LR)',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nnt-arr',            name: 'Number Needed to Treat / Absolute Risk Reduction',  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v164 (second feature spec of the spec-v162 program): three
  // ophthalmology computes filling a zero-tile gap. iol-power (SRK II) and
  // ocular-perfusion-pressure are arithmetic; visual-acuity-converter is a
  // notation conversion. All Clinical Math & Conversions (Group E).
  // views/group-v164.js, lib/ophtho-v164.js (RV164). Cross-verified (spec-v97);
  // SRK II base formula + axial-length band confirmed, refraction correction
  // ships the documented single 1.25 factor with a caveat.
  { id: 'iol-power',                name: 'IOL Power (SRK II)',                            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'visual-acuity-converter',  name: 'Visual Acuity Converter (Snellen / logMAR / decimal)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ocular-perfusion-pressure', name: 'Ocular Perfusion Pressure (OPP)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v165 (third feature spec of the spec-v162 program): four diagnostic-
  // radiology classification / quantification instruments filling a zero
  // structured-reporting gap. acr-tirads / bosniak are deterministic
  // input->class mappings (Group G, spec-v100 §2); adrenal-ct-washout /
  // ct-effective-dose are guarded arithmetic (Group E). views/group-v165.js,
  // lib/radiology-v165.js (RV165). Point tables cross-verified to >= 2 sources
  // (spec-v97); acr-tirads (ACR) and ct-effective-dose (AAPM/ICRP) cite issuers
  // -> documentation-only citation-staleness rows.
  { id: 'acr-tirads',         name: 'ACR TI-RADS (Thyroid Nodule)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'adrenal-ct-washout', name: 'Adrenal CT Washout (adenoma vs non-adenoma)',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bosniak',            name: 'Bosniak Classification (renal cyst, 2019)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ct-effective-dose',  name: 'CT Effective Dose (DLP × k)',                       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v166 (fourth feature spec of the spec-v162 program): generic
  // pharmacokinetics + the antipsychotic chlorpromazine-equivalent converter -
  // filling the generic-PK and psych-equivalence gaps beside the live drug-
  // specific PK and the opioid/benzo/steroid converters. Both Medication &
  // Infusion (Group F). views/group-v166.js, lib/pk-v166.js (RV166).
  // chlorpromazine-equivalents ships the Woods 2003 anchor table (7 agents,
  // >= 2-source-confirmed; method named). lithium-maintenance DEFERRED: the
  // Cooper 1973 band table is single-sourced (primary paywalled, secondary
  // image-only) and the published equation does not cleanly reproduce it ->
  // fails the spec-v97 >= 2-source rule (parked with crib-ii / gail-bcrat).
  { id: 'pk-suite',                 name: 'Pharmacokinetics Suite (loading / maintenance / half-life)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chlorpromazine-equivalents', name: 'Antipsychotic Chlorpromazine Equivalents',   group: 'F', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v167 (closing feature spec of the spec-v162 program): six single-
  // formula subspecialty computes, each filling a named one-tile gap
  // (ventilation, fetal Doppler, vascular, GI, audiology, IBD endoscopy).
  // rutgeerts is a deterministic input->grade mapping (Group G, spec-v100 §2);
  // the other five are guarded arithmetic (Group E). views/group-v167.js,
  // lib/oneformula-v167.js (RV167). Cross-verified to >= 2 sources (spec-v97);
  // toe-brachial-index (AHA) and pure-tone-average (ASHA/AAO-HNS) cite issuers
  // -> documentation-only citation-staleness rows.
  { id: 'mean-airway-pressure',  name: 'Mean Airway Pressure (Pₘₐw)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cerebroplacental-ratio', name: 'Cerebroplacental Ratio (CPR)',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'toe-brachial-index',    name: 'Toe-Brachial Index (TBI)',                        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'stool-osmotic-gap',     name: 'Stool Osmotic Gap',                               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pure-tone-average',     name: 'Pure Tone Average (PTA)',                         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rutgeerts',             name: 'Rutgeerts Score (post-op Crohn’s recurrence)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v98 (Wave 2 of spec-v85): four deterministic pediatric decision rules
  // and prognostic scores that fill confirmed gaps after a full sweep of Group N
  // (neonatal/procedural) and the pediatric scores in Group G. views/group-v24.js,
  // lib/peds-v98.js.
  { id: 'kawasaki-criteria',      name: 'Kawasaki Disease Diagnostic Criteria (classic + incomplete)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'kocher-criteria',        name: 'Kocher Criteria (septic arthritis vs transient synovitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pim3',                   name: 'PIM3 (Paediatric Index of Mortality 3)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'catch-head',             name: 'CATCH Rule (CT for childhood minor head injury)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v99 (Wave 2 of spec-v85, program-closing): five deterministic
  // infectious-disease, critical-care, and burns decision rules beside the acute
  // triage tools (curb-65, sirs, qsofa-sofa, apache2) and burn-fluid.
  // views/group-v25.js, lib/idcrit-v99.js.
  { id: 'duke-endocarditis',      name: 'Modified Duke Criteria for Infective Endocarditis (2023 Duke-ISCVID)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pitt-bacteremia',        name: 'Pitt Bacteremia Score',                            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'saps-ii',                name: 'SAPS II (Simplified Acute Physiology Score II)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lund-browder',           name: 'Lund-Browder Chart + Rule of Nines (%TBSA burn)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'refeeding-risk',         name: 'Refeeding Syndrome Risk (NICE CG32)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v101 (Wave 1 of the spec-v100 MDCalc Parity Completion program): five
  // deterministic AF stroke-risk and QT-prolongation instruments beside the
  // existing combined chads view and the qtc-suite corrected-interval tile.
  // views/group-v26.js, lib/cardio-v101.js.
  { id: 'chads2',                 name: 'CHADS2 Score (AF stroke risk)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cha2ds2-va',             name: 'CHA2DS2-VA (2024 ESC, sex-removed AF stroke risk)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chads-65',               name: 'CHADS-65 Canadian AF Anticoagulation Pathway (CCS)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'atria-stroke',           name: 'ATRIA Stroke Risk Score',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tisdale-qtc',            name: 'Tisdale Risk Score for QT Prolongation',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v102 (Wave 1 of spec-v100): heart-failure prognosis, HFpEF likelihood,
  // and cardiogenic-shock mortality. (gwtg-hf is DEFERRED -- see docs/spec-v102.md;
  // its per-band point table could not be verified from a primary source.)
  // views/group-v27.js, lib/cardio-v102.js.
  { id: 'maggic',                 name: 'MAGGIC Heart Failure Risk Score (1- & 3-year mortality)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'h2fpef',                 name: 'H2FPEF Score (HFpEF probability)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hfa-peff',               name: 'HFA-PEFF Diagnostic Score (ESC HFpEF algorithm)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cardshock-score',        name: 'CardShock Risk Score (cardiogenic shock mortality)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v103 (Wave 1 of spec-v100): cardiovascular-risk & atherogenic-lipid
  // engines that complement (never replace) the existing ascvd / prevent tiles.
  // SCORE2 / SCORE2-OP (European, region-calibrated), MESA CHD with coronary
  // calcium, Framingham general CVD + vascular age, and Reynolds in Group G; the
  // non-HDL / remnant fractions in Group E. views/group-v28.js, lib/cvrisk-v103.js.
  { id: 'score2',                 name: 'SCORE2 (ESC 2021, 10-year CVD risk, age 40-69)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'score2-op',              name: 'SCORE2-OP (ESC 2021, 10-year CVD risk, age >= 70)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mesa-chd',               name: 'MESA 10-Year CHD Risk (with coronary-artery calcium)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'framingham-cvd',         name: 'Framingham General CVD Risk + Vascular Age (2008)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'reynolds-risk',          name: 'Reynolds Risk Score (hsCRP + family history)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'non-hdl-remnant',        name: 'Non-HDL & Remnant Cholesterol',                    group: 'E', audiences: ['clinicians', 'educators', 'patients'], clinical: true },

  // spec-v104 (Wave 1 of spec-v100): ECG arrhythmia, aortic & syncope decision
  // rules beside the existing ecg-axis / lvh tiles. Brugada & Vereckei wide-
  // complex-tachycardia step algorithms, the ADD-RS aortic-dissection pretest
  // score, and the ROSE / EGSYS / OESIL ED syncope instruments.
  // views/group-v29.js, lib/cardio-v104.js.
  { id: 'brugada-vt',             name: 'Brugada Criteria (VT vs SVT, wide-complex tachycardia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vereckei-avr',           name: 'Vereckei aVR Algorithm (VT vs SVT)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'add-rs',                 name: 'Aortic Dissection Detection Risk Score (ADD-RS)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rose-syncope',           name: 'ROSE Rule (syncope 1-month serious outcome)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egsys',                  name: 'EGSYS Score (cardiac-syncope probability)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oesil',                  name: 'OESIL Risk Score (syncope 12-month mortality)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v105 (closing spec of Wave 1 of spec-v100): peripheral-artery and
  // cardiac-surgery-risk instruments. The ankle-brachial index in Group E; the
  // Rutherford/Fontaine PAD-stage mapper, the SVS WIfI limb-threat classification,
  // and the EuroSCORE II cardiac-surgery mortality engine in Group G.
  // views/group-v30.js, lib/vascular-v105.js.
  { id: 'abi',                    name: 'Ankle-Brachial Index (ABI)',                      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rutherford-fontaine',    name: 'Rutherford Category / Fontaine Stage (PAD)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wifi',                   name: 'SVS WIfI Limb-Threat Classification',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'euroscore2',             name: 'EuroSCORE II (cardiac-surgery mortality)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v106 (first spec of Wave 2 of spec-v100): six venous-thromboembolism
  // workup instruments. All in Group G. views/group-v31.js, lib/vte-v106.js.
  { id: 'peged',                  name: 'PEGeD (graduated D-dimer rule)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: '4peps',                  name: '4PEPS (4-level PE probability score)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bova-pe',                name: 'Bova Score (PE complications)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hestia',                 name: 'Hestia Criteria (outpatient PE)',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'geneva-original',        name: 'Geneva Score (original)',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'constans-uedvt',         name: 'Constans Score (upper-extremity DVT)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v107 (second spec of Wave 2 of spec-v100): four ED decision-rule and
  // resuscitation-risk scores. All in Group G. views/group-v32.js,
  // lib/eddecision-v107.js.
  { id: 'hear',                   name: 'HEAR Score (HEART minus troponin)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'new-orleans-head',       name: 'New Orleans Head Trauma Criteria',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'go-far',                 name: 'GO-FAR Score (good-outcome survival after IHCA)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'macocha',                name: 'MACOCHA Score (ICU difficult intubation)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v108 (third spec of Wave 2 of spec-v100): six trauma severity scores
  // and decision rules. triss and niss home in Group E (probability / severity
  // computations); tash-score, rabt-score, gcs-pupils, nexus-chest-ct in Group G.
  // views/group-v33.js, lib/trauma-v108.js.
  { id: 'triss',                  name: 'TRISS (Trauma & Injury Severity Score)',            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'niss',                   name: 'New Injury Severity Score (NISS)',                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tash-score',             name: 'TASH Score (massive transfusion probability)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rabt-score',             name: 'RABT Score (massive transfusion 0-4 rule)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gcs-pupils',             name: 'Glasgow Coma Scale - Pupils (GCS-P)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nexus-chest-ct',         name: 'NEXUS Chest CT (blunt trauma)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v109 (fourth spec of Wave 2 of spec-v100): five trauma-classification /
  // soft-tissue-infection decision rules, all in Group G. denver-bcvi and
  // aast-organ-injury are Class B (docs/citation-staleness.md rows); the other
  // three are Class A. views/group-v34.js, lib/traumaclass-v109.js.
  { id: 'denver-bcvi',            name: 'Expanded Denver Criteria (BCVI screening)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aast-organ-injury',      name: 'AAST Organ Injury Scale (spleen/liver/kidney)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mangled-extremity',      name: 'Mangled Extremity Severity Score (MESS)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lrinec',                 name: 'LRINEC Score (necrotizing fasciitis)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'alt-70',                 name: 'ALT-70 Cellulitis Score',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v110 (fifth spec of Wave 2 of spec-v100): five toxicology dosing /
  // dialysis-decision tools. The four dosing tiles (digifab/nac/hiet/tca) home
  // in Group F (Medication & Infusion); lithium-extrip is a Group G decision
  // tree. The four dosing tiles render the spec-v100 §2 clause-5 second-check
  // caveat. digifab/nac/hiet/tca are Class A (fixed label/derivation formulas);
  // lithium-extrip is Class B (EXTRIP 2015, docs/citation-staleness.md row).
  // views/group-v35.js, lib/tox-v110.js.
  { id: 'digifab-dosing',         name: 'Digoxin Immune Fab (DigiFab) Dosing',              group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nac-dosing',             name: 'Acetaminophen NAC IV Dosing',                      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hiet-dosing',            name: 'High-Dose Insulin Euglycemia (HIET) Dosing',       group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tca-bicarbonate',        name: 'TCA Toxicity: QRS Risk & Bicarbonate Target',      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lithium-extrip',         name: 'Lithium Dialysis Decision (EXTRIP)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v111 (closing spec of Wave 2 of spec-v100): four environmental /
  // wilderness-medicine severity scores and classifications. All home in
  // Group I (EMS & Field), cross-linked from Clinical Scoring (Group G).
  // lake-louise-ams / snakebite-severity / cauchy-frostbite are Class A (fixed
  // scoring instruments); szpilman-drowning is Class B (revisable decision
  // tree, docs/citation-staleness.md row). views/group-v36.js, lib/enviro-v111.js.
  { id: 'lake-louise-ams',        name: 'Lake Louise Acute Mountain Sickness (AMS) Score',  group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'szpilman-drowning',      name: 'Szpilman Drowning Classification',                 group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'snakebite-severity',     name: 'Snakebite Severity Score (SSS)',                   group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'cauchy-frostbite',       name: 'Cauchy Frostbite Classification',                  group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },

  // spec-v112 (opens Wave 3 of spec-v100): five deterministic critical-care
  // decision rules. Four are Clinical Scoring & Risk (Group G); lactate-clearance
  // is a Group E clinical-math tile. All Class A (fixed point weights /
  // thresholds / arithmetic) -- no docs/citation-staleness.md row.
  // views/group-v37.js, lib/critcare-v112.js.
  { id: 'meds-score',             name: 'MEDS Score (ED Sepsis Mortality)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sic-score',              name: 'Sepsis-Induced Coagulopathy (SIC) Score',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cpis-vap',               name: 'Clinical Pulmonary Infection Score (CPIS)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lactate-clearance',      name: 'Lactate Clearance',                                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mrc-sum-score',          name: 'MRC Sum Score (ICU-Acquired Weakness)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v113 (Wave 3 of spec-v100): three dynamic preload-responsiveness
  // indices, all Group E clinical-math tiles beside the static hemodynamic-suite.
  // All Class A (fixed ratio arithmetic with cited thresholds) -- no
  // docs/citation-staleness.md row. views/group-v38.js, lib/fluidresp-v113.js.
  { id: 'ivc-fluid-responsiveness', name: 'IVC Collapsibility / Distensibility Index',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ppv-svv',                name: 'Pulse-Pressure / Stroke-Volume Variation',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'passive-leg-raise',      name: 'Passive Leg Raise Stroke-Volume Response',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v114 (Wave 3 of spec-v100): six pulmonary / sleep-medicine decision
  // rules -- acute COPD-exacerbation prognosis, bronchiectasis severity, and
  // sleep-disordered-breathing classification. All home in Clinical Scoring &
  // Risk (Group G). decaf/bap-65/bronchiectasis-bsi/faced/nosas are Class A
  // (fixed derivation-paper point weights, journal+author citations -- no
  // staleness row); ahi-odi-severity is Class B (revisable AASM scoring
  // criteria, docs/citation-staleness.md row). views/group-v39.js,
  // lib/pulm-v114.js.
  { id: 'decaf-score',            name: 'DECAF Score (acute COPD exacerbation)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bap-65',                 name: 'BAP-65 Score (acute COPD exacerbation)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bronchiectasis-bsi',     name: 'Bronchiectasis Severity Index (BSI)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'faced-bronchiectasis',   name: 'FACED Score (bronchiectasis)',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nosas-score',            name: 'NoSAS Score (OSA screen)',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ahi-odi-severity',       name: 'AHI / ODI Severity Classifier',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v115 (Wave 3 of spec-v100, closes Wave 3): five pulmonary decision
  // rules -- the incidental (Mayo) and screen-detected (Brock/PanCan) nodule
  // malignancy models, the Fleischner 2017 follow-up matrix, the PAH REVEAL
  // Lite 2 risk score, and the pleural-infection RAPID score. All home in
  // Clinical Scoring & Risk (Group G). mayo-spn/brock-nodule/reveal-lite-2/
  // rapid-pleural are Class A (fixed coefficients / point weights,
  // journal+author citations -- no staleness row); fleischner-2017 is Class B
  // (revisable Fleischner Society 2017 guidance, docs/citation-staleness.md
  // row). views/group-v40.js, lib/pulmnod-v115.js.
  { id: 'mayo-spn',               name: 'Mayo Clinic SPN Malignancy Risk',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'brock-nodule',           name: 'Brock / PanCan Nodule Malignancy Risk',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fleischner-2017',        name: 'Fleischner 2017 Nodule Follow-up',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'reveal-lite-2',          name: 'REVEAL Lite 2 (PAH risk)',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rapid-pleural',          name: 'RAPID Score (pleural infection)',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v117 (Wave 4 of spec-v100, opens Wave 4): six acute-stroke imaging-
  // prognosis and thrombolysis-risk instruments the stroke team computes at the
  // scanner -- the ASPECTS topographic NCCT score, the ABC/2 hematoma volume
  // (Group E -- the volume the ich-score consumes), and the DRAGON / HAT /
  // SEDAN / THRIVE post-tPA outcome and hemorrhage-risk scores. dragon-stroke,
  // hat-score, sedan-score, thrive-stroke, and ich-volume-abc2 are Class A
  // (fixed point weights / geometric formula, journal+author citations -- no
  // staleness row); aspects is Class B (an imaging-read convention applied
  // through evolving reperfusion guidelines, docs/citation-staleness.md row).
  // views/group-v117.js, lib/neuro-v117.js.
  { id: 'aspects',                name: 'ASPECTS (Alberta Stroke Program Early CT Score)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ich-volume-abc2',        name: 'ICH Volume (ABC/2)',                               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dragon-stroke',          name: 'DRAGON Score (post-tPA outcome)',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hat-score',              name: 'HAT Score (hemorrhage after thrombolysis)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sedan-score',            name: 'SEDAN Score (post-tPA symptomatic ICH)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'thrive-stroke',          name: 'THRIVE Score (stroke outcome)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v118 (Wave 4 of spec-v100): five hemorrhagic-stroke / SAH / IVH /
  // unruptured-aneurysm instruments the neuro-ICU and neurosurgery teams grade
  // from the NCCT/CTA read -- the modified Fisher SAH-blood grade, the modified
  // Graeb IVH burden, the BAT hematoma-expansion score, and the PHASES / ELAPSS
  // aneurysm rupture- and growth-risk scores. All five are Class A (fixed
  // grading rules / point weights, journal+author citations -- no staleness
  // row). views/group-v118.js, lib/neuro-v118.js.
  { id: 'modified-fisher',        name: 'Modified Fisher Scale (SAH vasospasm risk)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'graeb-ivh',              name: 'Modified Graeb Score (IVH burden)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bat-score',              name: 'BAT Score (hematoma expansion)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'phases',                 name: 'PHASES Score (aneurysm rupture risk)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'elapss',                 name: 'ELAPSS Score (aneurysm growth risk)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v119 (Wave 4 of spec-v100): four prehospital large-vessel-occlusion
  // triage and cerebrovascular-diagnosis instruments the EMS crew and stroke
  // team run -- the C-STAT/CPSSS and FAST-ED field LVO-severity screens, the
  // Boston Criteria v2.0 cerebral-amyloid-angiopathy certainty, and the CVT
  // outcome risk score. cpsss, fast-ed, and cvt-risk are Class A (fixed point
  // weights, journal+author citations -- no staleness row); boston-caa is
  // Class B (a revisable consensus diagnostic definition, docs/citation-
  // staleness.md row). views/group-v119.js, lib/neuro-v119.js.
  { id: 'cpsss',                  name: 'C-STAT / CPSSS (prehospital LVO severity)',        group: 'G', audiences: ['clinicians', 'field', 'educators'], clinical: true },
  { id: 'fast-ed',                name: 'FAST-ED (field LVO triage)',                       group: 'G', audiences: ['clinicians', 'field', 'educators'], clinical: true },
  { id: 'boston-caa',             name: 'Boston Criteria v2.0 (cerebral amyloid angiopathy)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cvt-risk',               name: 'CVT Outcome Risk Score',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v120 (Wave 4 of spec-v100): five epilepsy-prognosis, headache-
  // likelihood, and vertigo-localization instruments the neurology / ED team
  // runs daily -- the STESS status-epilepticus prognosis, the 2HELPS2B cEEG
  // seizure-risk lookup, the MESS first-seizure recurrence rule (id distinct
  // from the v109 mangled-extremity MESS), the POUND migraine mnemonic, and the
  // HINTS / HINTS-plus central-vs-peripheral vestibular exam. All five are
  // Class A (fixed point weights / mnemonic / classification / compiled lookup,
  // journal+author citations -- no staleness row). views/group-v120.js,
  // lib/neuro-v120.js.
  { id: 'stess',                  name: 'STESS (status epilepticus severity)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'helps2b',                name: '2HELPS2B (cEEG seizure risk)',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mess-first-seizure',     name: 'MESS (first-seizure recurrence risk)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pound-migraine',         name: 'POUND (migraine likelihood)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hints',                  name: 'HINTS / HINTS-plus (vestibular exam)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v121 (Wave 4 of the spec-v100 program): four neuromuscular-emergency
  // instruments the neurology / neurocritical-care team runs to predict
  // respiratory failure and grade disease -- the EGRIS respiratory-insufficiency
  // score and mEGOS outcome score in Guillain-Barre syndrome, the Brighton GBS
  // diagnostic-certainty level, and the MGFA clinical classification + MG-ADL in
  // myasthenia gravis. All four are Class A (fixed point weights / case
  // definition / classification + ordinal sum, journal+author citations -- no
  // staleness row). views/group-v121.js, lib/neuro-v121.js.
  { id: 'egris',                  name: 'EGRIS (GBS respiratory-failure risk)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'megos',                  name: 'mEGOS (GBS walking-outcome score)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'brighton-gbs',           name: 'Brighton GBS Criteria (certainty level)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mgfa',                   name: 'MGFA class + MG-ADL (myasthenia severity)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v122 (Wave 4 of the spec-v100 program): three general-neurology and
  // rehabilitation instruments that cross specialty lines -- the Hachinski
  // Ischemic Score (vascular vs Alzheimer-type dementia), the Modified Ashworth
  // Scale (spasticity grade, the PM&R / physical-therapy bedside standard), and
  // the Bickerstaff brainstem-encephalitis diagnostic checklist. All three are
  // Class A (fixed point weights / ordinal scale / diagnostic checklist,
  // journal+author citations -- no staleness row). views/group-v122.js,
  // lib/neuro-v122.js.
  { id: 'hachinski',              name: 'Hachinski Ischemic Score (dementia type)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'modified-ashworth',      name: 'Modified Ashworth Scale (spasticity grade)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bickerstaff',            name: 'Bickerstaff Brainstem Encephalitis Criteria',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v123 (Wave 4 closer of the spec-v100 program): five public-domain /
  // free-to-use psychiatry instruments -- the AIMS tardive-dyskinesia movement
  // scale (NIMH public domain), the Bush-Francis Catatonia Rating Scale, the
  // Barnes Akathisia Rating Scale, the SCOFF eating-disorder screen (free in the
  // BMJ source), and the CES-D depression scale (NIMH public domain). All five are
  // Class A (fixed ordinal scales / item sets, journal+manual citations -- no
  // staleness row); the copyrighted psychiatry instruments (BDI, PANSS, MoCA, ...)
  // stay on the spec-v100 §8 exclusion list. views/group-v123.js, lib/psych-v123.js.
  { id: 'aims-tardive',           name: 'AIMS (tardive dyskinesia severity)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bfcrs',                  name: 'Bush-Francis Catatonia Rating Scale',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bars-akathisia',         name: 'Barnes Akathisia Rating Scale',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'scoff',                  name: 'SCOFF (eating-disorder screen)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ces-d',                  name: 'CES-D (depression scale)',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v124 (Wave 5 opener of the spec-v100 program): six hepatology
  // function-and-fibrosis instruments read beside meld-childpugh and fib4 -- the
  // ALBI objective liver-function grade, MELD-XI (INR-excluding MELD), the Forns
  // HCV-fibrosis index, the BARD NAFLD advanced-fibrosis rule-out, the Fatty Liver
  // Index steatosis probability, and the Lok cirrhosis-probability model. All six
  // are Class A (fixed derivation coefficients; journal+author citations -- no
  // staleness row). views/group-v124.js, lib/hep-v124.js.
  { id: 'albi-grade',             name: 'ALBI grade (albumin-bilirubin liver function)',    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'meld-xi',                name: 'MELD-XI (MELD excluding INR)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'forns-index',            name: 'Forns Index (HCV fibrosis)',                       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bard-score',             name: 'BARD Score (NAFLD advanced fibrosis)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fatty-liver-index',      name: 'Fatty Liver Index (steatosis probability)',        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lok-index',              name: 'Lok Index (cirrhosis probability)',                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v125 (Wave 5 of the spec-v100 program): five hepatology severity and
  // encephalopathy instruments completing the acute-hepatology cluster -- the
  // pediatric PELD listing score, the CLIF-C ACLF acute-on-chronic-liver-failure
  // mortality model, the Glasgow Alcoholic Hepatitis Score, the West Haven hepatic-
  // encephalopathy grade, and the Hepatic Steatosis Index. All five are Class A
  // (fixed coefficients / bands / criteria; journal+author citations -- no staleness
  // row). views/group-v125.js, lib/hep-v125.js.
  { id: 'peld-score',             name: 'PELD (pediatric end-stage liver disease)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'clif-c-aclf',            name: 'CLIF-C ACLF (acute-on-chronic liver failure)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gahs',                   name: 'Glasgow Alcoholic Hepatitis Score',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'west-haven-he',          name: 'West Haven HE grade (hepatic encephalopathy)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hepatic-steatosis-index', name: 'Hepatic Steatosis Index (NAFLD screen)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v126 (Wave 5 of the spec-v100 program): six GI disease-activity and
  // pancreatitis-severity instruments -- the CDAI Crohn's activity index, the
  // UCEIS UC endoscopic index, the SES-CD Crohn's endoscopic score, the HAPS
  // harmless-pancreatitis gate, the Balthazar CT severity index, and the modified
  // Marshall organ-dysfunction score. Five are Class A; modified-marshall is Class
  // B (revisable Revised-Atlanta definition -> documentation-only citation-staleness
  // row, on-publication cadence). views/group-v126.js, lib/gi-v126.js.
  { id: 'cdai-crohns',            name: 'CDAI (Crohn\'s Disease Activity Index)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'uceis',                  name: 'UCEIS (UC endoscopic severity)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ses-cd',                 name: 'SES-CD (Crohn\'s endoscopic score)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'haps',                   name: 'HAPS (harmless acute pancreatitis)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ctsi-balthazar',         name: 'CT Severity Index (Balthazar, pancreatitis)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'modified-marshall',      name: 'Modified Marshall organ-dysfunction score',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v127 (Wave 5 of the spec-v100 program): four nephrology-prognosis and
  // AKI-staging instruments beside egfr-suite / ckd-staging / ktv-urr / kdigo-aki
  // -- the Tangri KFRE kidney-failure-risk equation, RIFLE and AKIN AKI staging,
  // and the Flythe ultrafiltration-rate threshold. All four are Class A (fixed
  // coefficients / consensus criteria; journal+author citations -- no staleness
  // row). views/group-v127.js, lib/nephro-v127.js.
  { id: 'kfre',                   name: 'KFRE (kidney failure risk equation)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rifle-aki',              name: 'RIFLE criteria (AKI staging)',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'akin-aki',               name: 'AKIN criteria (AKI staging)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ufr-dialysis',           name: 'Ultrafiltration rate (dialysis)',                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v128: renal excretion & dialysis math (Wave 5). Five Group E tiles that
  // extend the fractional-excretion family (fena-feurea) and dialysis adequacy
  // (ktv-urr). All Class A (fixed arithmetic / kinetic forms; journal+author
  // citations, no ISSUER_PATTERN trip -> no citation-staleness row).
  // views/group-v128.js, lib/renal-v128.js.
  { id: 'fepo4',                  name: 'Fractional excretion of phosphate (FEPO4)',        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'femg',                   name: 'Fractional excretion of magnesium (FEMg)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'npcr-pna',               name: 'nPCR / nPNA (dialysis protein catabolic rate)',    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'std-ktv',                name: 'Standard Kt/V (weekly dialysis dose)',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'efwc',                   name: 'Electrolyte-free water clearance',                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v129: acid-base compensation & gaps (Wave 5). Six Group E tiles that
  // complete the compensation set winters opened and add the physicochemical
  // (Stewart) and urine-gap views beside anion-gap-dd. All Class A (fixed
  // physiologic formulas / compensation coefficients; journal+author citations,
  // no ISSUER_PATTERN trip -> no citation-staleness row).
  // views/group-v129.js, lib/acidbase-v129.js.
  { id: 'stewart-sid-sig',        name: 'Stewart SID / strong ion gap (SIG)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'base-excess',            name: 'Base excess (Van Slyke, Hgb-corrected)',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'resp-acidosis-compensation', name: 'Expected HCO3 (respiratory acidosis)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'resp-alkalosis-compensation', name: 'Expected HCO3 (respiratory alkalosis)',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'met-alkalosis-compensation', name: 'Expected PaCO2 (metabolic alkalosis)',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'urine-osmolal-gap',      name: 'Urine osmolal gap (urinary NH4+ estimate)',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v130: urology prostate metrics & risk (Wave 5). Opens the prostate-
  // cancer surface: four Group E volumetry/PSA-kinetics tiles and two Group G
  // risk classifications. All Class A (fixed geometric/arithmetic formulas and
  // fixed published classification tables; journal+author citations, no
  // ISSUER_PATTERN trip -> no citation-staleness row).
  // views/group-v130.js, lib/uro-v130.js.
  { id: 'prostate-volume',        name: 'Prostate volume (ellipsoid)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psa-density',            name: 'PSA density',                                      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psa-velocity',           name: 'PSA velocity',                                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psa-doubling-time',      name: 'PSA doubling time',                               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'damico-prostate-risk',   name: 'D’Amico prostate-cancer risk classification',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gleason-grade-group',    name: 'Gleason Grade Group (ISUP)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v131: urology renal-mass, kidney-stone & torsion scores (Wave 5
  // close). Five Group G ordinal/threshold instruments closing the urology
  // cluster begun in v130. All Class A (fixed published point tables;
  // journal+author citations, no ISSUER_PATTERN trip -> no citation-staleness
  // row). roks-stone-recurrence was scoped but is DEFERRED (its nomogram points
  // are not recoverable from open sources; see lib/uro-v131.js + docs/spec-v131.md).
  // views/group-v131.js, lib/uro-v131.js.
  { id: 'capra-score',            name: 'CAPRA prostate-cancer risk score (UCSF)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'renal-nephrometry',      name: 'R.E.N.A.L. nephrometry score (renal mass)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'padua-renal',            name: 'PADUA renal-tumor complexity score',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'stone-nephrolithometry', name: 'S.T.O.N.E. nephrolithometry (PCNL complexity)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'twist-score',            name: 'TWIST score (testicular torsion)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v132 (Wave 6 of the spec-v100 program): the thrombotic-microangiopathy /
  // coagulopathy cluster beside four-ts and khorana. views/group-v132.js,
  // lib/heme-v132.js. All Group G, Class A (journal+author citations).
  { id: 'plasmic-ttp',            name: 'PLASMIC score (TTP / ADAMTS13 probability)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'french-ttp',             name: 'French TTP score (ADAMTS13 probability)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'jaam-dic',               name: 'JAAM DIC score (acute disseminated intravascular coagulation)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ipset-thrombosis',       name: 'Revised IPSET-thrombosis (essential thrombocythemia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cisne',                  name: 'CISNE (stable febrile-neutropenia complication risk)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v134 (Wave 6 of the spec-v100 program): the plasma-cell and myeloid-
  // neoplasm staging cluster beside ipss-r-mds and flipi. views/group-v134.js,
  // lib/onc-v134.js (RV134). All Group G; five Class A (journal+author citations),
  // myeloma-r-iss Class B (IMWG working-group definition -> citation-staleness row).
  { id: 'myeloma-iss',            name: 'Multiple myeloma ISS stage',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'myeloma-r-iss',          name: 'Revised ISS (R-ISS) for multiple myeloma',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'myeloma-r2-iss',         name: 'Second-Revision ISS (R2-ISS) for multiple myeloma', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mgus-risk',              name: 'Mayo MGUS progression-risk stratification',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dipss-mf',               name: 'DIPSS (myelofibrosis survival score)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dipss-plus-mf',          name: 'DIPSS-Plus (myelofibrosis survival score)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v135 (Wave 6 of the spec-v100 program): the lymphoma / CLL prognostic-
  // index cluster beside flipi and ipss-r-mds. views/group-v135.js,
  // lib/lymphoma-v135.js (RV135). All Group G, all Class A (journal+author
  // citations -- no ISSUER_PATTERN trip, no citation-staleness row).
  { id: 'r-ipi',                  name: 'Revised IPI (R-IPI) for DLBCL',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nccn-ipi',               name: 'NCCN-IPI for DLBCL',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gelf-criteria',          name: 'GELF high-tumor-burden criteria (follicular lymphoma)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hodgkin-ips',            name: 'Hasenclever IPS (advanced Hodgkin lymphoma)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cll-ipi',                name: 'CLL International Prognostic Index (CLL-IPI)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v136 (Wave 6 of the spec-v100 program): the endocrine / metabolic index
  // cluster beside eag-a1c. views/group-v136.js, lib/endo-v136.js (RV136). The
  // three insulin-resistance surrogates sit in Clinical Math & Conversions
  // (Group E); metabolic-syndrome and the OST/ORAI DXA pre-screen sit in Clinical
  // Scoring & Risk (Group G). metabolic-syndrome is Class B (revisable consensus
  // definition -> citation-staleness row); the other four are Class A.
  { id: 'homa-ir',                name: 'HOMA-IR (insulin resistance) + HOMA-%B',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'quicki',                 name: 'QUICKI (insulin sensitivity index)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tyg-index',              name: 'Triglyceride-Glucose (TyG) index',                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'metabolic-syndrome',     name: 'Metabolic Syndrome (Harmonized / IDF)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'osteoporosis-prescreen', name: 'OST / ORAI Osteoporosis DXA Pre-Screen',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v137 (Wave 6 of the spec-v100 program, CLOSING spec): the infectious-
  // disease risk-score cluster beside the CAP severity tools (curb-65, psi,
  // smart-cop). views/group-v137.js, lib/id-v137.js (RV137). All Group G, all
  // Class A (journal+author citations -- no ISSUER_PATTERN trip, no citation-
  // staleness row). SOURCE-GOVERNANCE: covid-gram reports the published logistic
  // probability with NO invented risk tiers (the authors define none) and a
  // calibration caveat (betas = ln of the published odds ratios; intercept from
  // the paper's 1-sig-fig constant); vacs-index quotes only the two published
  // mortality anchors over a continuous curve (no fabricated per-band lookup).
  { id: 'isaric-4c-mortality',    name: 'ISARIC 4C Mortality Score (COVID-19)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'covid-gram',             name: 'COVID-GRAM Critical Illness Risk Score',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'candida-score',          name: 'Candida Score (León, invasive candidiasis)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vacs-index',             name: 'VACS Index 1.0 (HIV mortality)',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'regiscar-dress',         name: 'RegiSCAR Score for DRESS',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v138 (Wave 7 OPENER of the spec-v100 program): the obstetrics /
  // maternal-fetal-medicine cluster beside the dating / induction tiles
  // (due-date, preg-dating, bishop, bpp). views/group-v138.js, lib/ob-v138.js
  // (RV138). hadlock-efw, afi, barnhart-hcg, iom-gwg sit in Clinical Math &
  // Conversions (Group E); fullpiers and minipiers in Clinical Scoring & Risk
  // (Group G). afi and iom-gwg are Class B (ACOG oligo/poly thresholds and the
  // IOM/ACOG-CO-548 gain ranges are revisable -> citation-staleness rows); the
  // other four are Class A. COEFFICIENTS RE-FETCHED, never recalled (spec-v97):
  // the Hadlock four-parameter log10 model, the fullPIERS / miniPIERS logistic
  // coefficients (SpO2 enters fullPIERS only via the platelet interaction; GA and
  // SBP enter miniPIERS as natural logs), and the Barnhart 53%/48h minimal rise.
  { id: 'hadlock-efw',            name: 'Hadlock Estimated Fetal Weight (BPD/HC/AC/FL)',    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fullpiers',              name: 'fullPIERS (pre-eclampsia adverse-outcome risk)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'minipiers',              name: 'miniPIERS (bedside pre-eclampsia risk)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'afi',                    name: 'Amniotic Fluid Index (AFI)',                       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'barnhart-hcg',           name: 'Barnhart Minimal hCG Rise (viable IUP)',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iom-gwg',                name: 'IOM Gestational Weight Gain',                      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v139 (Wave 7, second feature spec): the gynecology decision-rule
  // cluster -- VBAC counseling, adnexal-mass malignancy triage, PCOS, and POP-Q
  // staging. views/group-v139.js, lib/gyn-v139.js (RV139). All six are Clinical
  // Scoring & Risk (Group G). flamm-vbac substitutes for the excluded paywalled
  // Grobman MFMU calculator and iota-simple-rules for the excluded IOTA ADNEX
  // model (spec-v100 §8). roma-ovarian and rotterdam-pcos are Class B (the assay
  // cutoff and the ESHRE/ASRM consensus are revisable -> citation-staleness rows);
  // the other four are Class A. COEFFICIENTS RE-FETCHED, never recalled (spec-v97):
  // the ROMA pre/post-menopausal logistic with natural-log marker terms, the
  // RMI I/II/III U and M scaling, and the Flamm admission point weights.
  { id: 'flamm-vbac',             name: 'Flamm VBAC Score',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'roma-ovarian',           name: 'ROMA (Risk of Ovarian Malignancy Algorithm)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rmi-ovarian',            name: 'Risk of Malignancy Index (RMI I/II/III)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iota-simple-rules',      name: 'IOTA Simple Rules',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rotterdam-pcos',         name: 'Rotterdam PCOS Criteria',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'popq-staging',           name: 'POP-Q Staging',                                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v140 (Wave 7, third feature spec): the pediatric / neonatal severity
  // cluster -- the newborn-nursery sepsis decision, the NICU illness score, the
  // bronchiolitis bay, the gastroenteritis room, and the pediatric-urology
  // exam. views/group-v140.js, lib/peds-v140.js (RV140). eos-calculator,
  // snappe-ii, rdai-tal, and clinical-dehydration-scale are Clinical Scoring &
  // Risk (Group G); koff-bladder-capacity is Clinical Math & Conversions
  // (Group E). All five are Class A. COEFFICIENTS RE-FETCHED, never recalled
  // (spec-v97): the Kaiser EOS prior logistic (GA quadratic, raw-°F temperature,
  // ROM fractional-power transform, incidence-specific intercept) and the
  // upper-CI exam likelihood ratios (0.41 / 5.0 / 21.2); the SNAPPE-II nine-band
  // table with the PaO2(mmHg)/FiO2(%) ratio; the RDAI/Tal sub-scores. (crib-ii,
  // the sixth proposed tile, is DEFERRED -- its Parry 2003 birth-weight x
  // gestational-age x sex matrix could be sourced from only one reproduction;
  // see docs/spec-v140.md §2.3 and lib/peds-v140.js.)
  { id: 'eos-calculator',         name: 'Neonatal Early-Onset Sepsis Calculator (Kaiser)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'snappe-ii',              name: 'SNAPPE-II',                                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rdai-tal',               name: 'RDAI / Tal Bronchiolitis Severity',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'clinical-dehydration-scale', name: 'Clinical Dehydration Scale (CDS)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'koff-bladder-capacity',  name: 'Koff Expected Bladder Capacity',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v141 (Wave 7, fourth and final feature spec): pediatric growth and
  // developmental-age instruments. views/group-v141.js, lib/peds-growth-v141.js
  // (RV141), reading the verbatim CDC 2000 / WHO 2006 LMS tables compiled into
  // lib/growth-lms-data.js. All four are Clinical Math & Conversions (Group E),
  // all Class A. The LMS coefficients are re-fetched, never recalled (spec-v97):
  // transcribed byte-for-byte from the published CDC NCHS / WHO MGRS data files.
  // SCOPE: spec-v141 proposed six tiles; two are not shipped here. peds-weight-est
  // (APLS) is ALREADY LIVE from spec-v149 (Group I) -- re-adding it would
  // duplicate a live tile (spec-v85 §6.2 collision check), so it is skipped.
  // gail-bcrat (NCI Gail/BCRAT) is DEFERRED: its race-specific incidence and
  // competing-mortality tables ship only as binary .rda in the NCI BCRA package
  // (not verbatim-fetchable to cross-verify per spec-v97) and a subtly-wrong
  // cancer-risk percentage is a real harm -- parked with crib-ii. See
  // lib/peds-growth-v141.js header and docs/spec-v141.md.
  { id: 'peds-bmi-percentile',    name: 'Pediatric BMI-for-Age Percentile (CDC)',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v169 (Data-Sourced Reference-Table program, spec-v168): the CDC 2000
  // stature-for-age and weight-for-age percentile companions to the BMI-for-age
  // tile above. views/group-v169.js, lib/peds-percentile-v169.js (RV169), reading
  // the CDC stature/weight LMS strata parsed verbatim into lib/growth-lms-data.js
  // and cross-verified against the source files' own published percentile columns
  // (spec-v97). Both Class A (Group E), kept beside their growth-percentile
  // siblings. SCOPE: spec-v169 proposed a third tile (pediatric-bp-percentile);
  // it is DEFERRED on sourcing grounds -- the AAP/NHLBI BP regression
  // coefficients are PDF-locked and not verbatim/cross-verifiable in the build
  // environment, and a wrong BP percentile mis-stages hypertension. See
  // lib/peds-percentile-v169.js header and docs/spec-v169.md.
  { id: 'cdc-stature-for-age',    name: 'CDC Stature-for-Age Percentile (2-20 yr)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cdc-weight-for-age',     name: 'CDC Weight-for-Age Percentile (2-20 yr)',          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'who-growth-zscore',      name: 'WHO Growth z-Score (0-2 yr)',                      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mid-parental-height',    name: 'Mid-Parental Target Height',                       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-age',          name: 'Corrected Gestational Age',                        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v173 (first feature spec of the spec-v172 Long-Term Care & Geriatric
  // Assessment program): cognition / dementia-staging instruments for the LTC
  // surface. views/group-v173.js, lib/ltcga-v173.js (RV173). v173 ships the
  // three whose exact item-level scoring was re-fetched and cross-verified
  // against >= 2 independent sources (spec-v97); the other five proposed tiles
  // (gpcog, iqcode-short, global-deterioration-scale, fast-dementia, mds-cps)
  // are deferred pending verbatim sourcing (see docs/spec-v173.md §4).
  { id: 'bims',                   name: 'BIMS (Brief Interview for Mental Status, MDS 3.0)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ad8',                    name: 'AD8 Dementia Screening Interview (informant)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cdr-sob',                name: 'CDR Sum of Boxes (dementia staging)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v174 (second feature spec of the spec-v172 LTC-GA program): behavioral
  // symptoms of dementia & observational delirium / mood screens for the LTC
  // surface. views/group-v174.js, lib/ltcga-v174.js (RV174). All five proposed
  // tiles ship; each item value, per-item range, and band was re-fetched and
  // cross-verified against >= 2 independent sources (spec-v97); the draft ABS
  // per-item range was corrected 0-4 -> 0-3 by that verification.
  { id: 'nu-desc',                name: 'Nu-DESC (Nursing Delirium Screening Scale)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'doss',                   name: 'DOSS (Delirium Observation Screening Scale)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cornell-csdd',           name: 'Cornell Scale for Depression in Dementia',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'interrai-abs',           name: 'interRAI Aggressive Behavior Scale (ABS)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cmai',                   name: 'Cohen-Mansfield Agitation Inventory (CMAI)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v175 (third feature spec of the spec-v172 LTC-GA program, cluster
  // §3.3): observational pain-assessment instruments for the cognitively
  // impaired / nonverbal elder. views/group-v175.js, lib/ltcga-v175.js (RV175).
  // All three proposed tiles ship; each item list, per-item range, and band was
  // re-fetched and cross-verified against >= 2 independent sources (spec-v97).
  { id: 'abbey-pain',             name: 'Abbey Pain Scale',                                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cnpi',                   name: 'CNPI (Checklist of Nonverbal Pain Indicators)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'doloplus-2',             name: 'DOLOPLUS-2 (behavioral pain assessment)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v176 (fourth feature spec of the spec-v172 LTC-GA program, cluster
  // §3.4): falls-risk, balance & gait instruments - the performance-based
  // battery and CDC STEADI algorithm the inpatient morse-falls / hendrich-ii
  // screens do not cover. views/group-v176.js, lib/ltcga-v176.js (RV176). Every
  // norm, band, and cut-point re-fetched and cross-verified against >= 2 sources
  // (spec-v97). chair-stand-30s, four-stage-balance, steadi-algorithm are Class B
  // (CDC STEADI -> citation-staleness rows). gait-speed is Group E (returns m/s).
  { id: 'stratify',               name: 'STRATIFY (inpatient falls-risk tool)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chair-stand-30s',        name: '30-Second Chair Stand (CDC STEADI)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'four-stage-balance',     name: '4-Stage Balance Test (CDC STEADI)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'functional-reach',       name: 'Functional Reach Test',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gait-speed',             name: 'Gait Speed (4-meter / habitual, m/s)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'steadi-algorithm',       name: 'CDC STEADI Fall-Risk Screening Algorithm',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v177 (fifth feature spec of the spec-v172 LTC-GA program, cluster
  // §3.5): frailty & sarcopenia case-finders. views/group-v177.js,
  // lib/ltcga-v177.js (RV177). Ships 4 of 7; clinical-frailty-scale (Rockwood
  // CFS licensing), groningen-frailty-indicator, and edmonton-frail-scale (exact
  // per-item scoring not byte-verifiable at implementation) are deferred on
  // licensing / sourcing grounds (spec-v97). All 4 Class A.
  { id: 'sarc-f',                 name: 'SARC-F (sarcopenia screen)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sarc-calf',              name: 'SARC-CalF (SARC-F + calf circumference)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'prisma-7',               name: 'PRISMA-7 (frailty case-finder)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sof-frailty-index',      name: 'SOF Frailty Index',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v178 (sixth feature spec of the spec-v172 LTC-GA program, cluster
  // §3.6): geriatric-nutrition & dysphagia instruments. views/group-v178.js,
  // lib/ltcga-v178.js (RV178). gnri/pni-onodera/conut are lab-based formulas
  // (Group E); snaq/eat-10/determine are bounded sums (Group G). Every
  // coefficient, cut-point, and band re-fetched and cross-verified against >= 2
  // sources (spec-v97); the DETERMINE weights are verbatim from the ACL/NSI form.
  { id: 'gnri',                   name: 'GNRI (Geriatric Nutritional Risk Index)',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pni-onodera',            name: 'Onodera Prognostic Nutritional Index (PNI)',        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'conut',                  name: 'CONUT (Controlling Nutritional Status score)',      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'snaq',                   name: 'SNAQ (Simplified Nutritional Appetite Questionnaire)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'eat-10',                 name: 'EAT-10 (Eating Assessment Tool, dysphagia screen)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'determine',              name: 'DETERMINE Nutritional Health Checklist',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v179 (seventh feature spec of the spec-v172 LTC-GA program, cluster
  // §3.7): geriatric-pharmacotherapy / polypharmacy-burden quantifiers.
  // views/group-v179.js, lib/ltcga-v179.js (RV179). Per the spec-v100 §2
  // clarification, these consume the clinician's per-level counts / per-drug doses
  // and do NOT embed a drug database. Ships 3 of 4; medication-regimen-complexity
  // (MRCI) is deferred (65-item weight tables not byte-verifiable, spec-v97). DBI
  // is Group E (returns a value); ACB/ARS are Group G. All Class A.
  { id: 'anticholinergic-burden', name: 'ACB (Anticholinergic Cognitive Burden)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'anticholinergic-risk-scale', name: 'ARS (Anticholinergic Risk Scale)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'drug-burden-index',      name: 'Drug Burden Index (DBI)',                           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v182 (closing feature spec of the spec-v172 LTC-GA program, cluster
  // §3.10): continence-severity, caregiver-strain & advanced-wound instruments.
  // views/group-v182.js, lib/ltcga-v182.js (RV182). sandvik-incontinence is a
  // frequency×amount product (Group E); the rest are bounded sums (Group G).
  // Ships 5 of 6; waterlow deferred (detailed weighted card with edition drift,
  // not byte-verifiable, spec-v97). All Class A.
  { id: 'sandvik-incontinence',   name: 'Sandvik Severity Index (urinary incontinence)',     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iciq-ui-sf',             name: 'ICIQ-UI Short Form (urinary incontinence)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'modified-caregiver-strain-index', name: 'Modified Caregiver Strain Index (MCSI)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'caregiver-strain-index', name: 'Caregiver Strain Index (CSI)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bwat',                   name: 'Bates-Jensen Wound Assessment Tool (BWAT)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v181 (LTC-GA cluster §3.9): long-term-care infection surveillance &
  // antimicrobial stewardship. views/group-v181.js, lib/ltcga-v181.js (RV181).
  // Both are categorical site-branched criteria-logic determinations (no numeric
  // score). Both Class A: the Stone 2012 and Loeb 2001 citations are journal
  // references ("Infect Control Hosp Epidemiol") and name no acronym in
  // check-citations ISSUER_PATTERN (CDC/IDSA/ATS/etc.; SHEA is not in it), so
  // no docs/citation-staleness.md row is required (confirmed at build time per
  // spec-v92/v94, same as the EULAR/ACR spelled-out lesson).
  { id: 'mcgeer-criteria',        name: 'Revised McGeer surveillance definitions (LTC infection)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'loeb-minimum-criteria',  name: 'Loeb minimum criteria (initiating antibiotics in LTC)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v180 (LTC-GA cluster 3.8): older-adult mortality & LTC-prognosis
  // instruments. views/group-v180.js, lib/ltcga-v180.js (RV180). Ships 2 of 7:
  // lee-mortality-index (a 0-26 weighted point sum -> validation-cohort 4-year
  // mortality bands, a point-table lookup with no exponentiation) and chess-scale
  // (interRAI CHESS, a 0-5 health-instability score). The other five
  // (schonberg-index, walter-index, suemoto-index, mitchell-mri, adept) are
  // deferred on the spec-v97 >= 2-source bar (band-% mappings single-sourced /
  // weights image-locked). Both Class A: Lee cites JAMA 2006 and CHESS cites
  // Hirdes 2003 (J Am Geriatr Soc), journal formulas naming no acronym in
  // check-citations ISSUER_PATTERN, so no docs/citation-staleness.md row is
  // required. Both are prognostic estimates framed as decision support, not a
  // prediction of an individual's death (spec-v11 5.3).
  { id: 'lee-mortality-index',    name: 'Lee 4-Year Mortality Index (older adults)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chess-scale',            name: 'CHESS Scale (interRAI health instability)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v6 §3.3: lab result interpreter. Patient-decoder category.
  { id: 'lab-interpret',       name: 'Lab Result Interpreter',                           group: 'C', audiences: ['patients', 'clinicians', 'educators'], clinical: true },

  // spec-v52 §3.2 + §4: prior-auth packet linter. First tile with the
  // new document-linter shape (the existing 254 default to numeric).
  // Group 'P' is the new top-level "Revenue cycle & utilization" group
  // introduced for revenue-cycle / utilization-management tiles. Wave
  // 52-1b ships the dropzone + SHA-256 audit-trail stub; the 60-rule
  // core ruleset, the PDF/DOCX parsers, and the DOCX report follow in
  // subsequent waves.
  { id: 'pa-lint',                name: 'Prior-Auth Packet Linter',                         group: 'P', audiences: ['billers', 'case-managers'], clinical: false, shape: 'document-linter' },
  // spec-v55: bedside hematology, renal/acid-base, and oxygenation math (13 tiles).
  { id: 'anc',                 name: 'Absolute Neutrophil Count (ANC) + neutropenia grade', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'retic-index',         name: 'Reticulocyte Production Index (corrected retic)',  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tsat',                name: 'Transferrin Saturation + iron-studies interpreter', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cci-platelet',        name: 'Corrected Count Increment (platelet refractoriness)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ldl-calc',            name: 'Calculated LDL (Friedewald + NIH)',                group: 'E', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'eag-a1c',             name: 'Estimated Average Glucose from A1c (eAG)',         group: 'E', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'cao2-do2',            name: 'Arterial O2 Content (CaO2) + O2 Delivery (DO2)',   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oxygenation-index',   name: 'Oxygenation Index (OI) + Oxygen Saturation Index (OSI)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'driving-pressure',    name: 'Driving Pressure + static/dynamic compliance',     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v87 §2: critical-care physiology - PA-catheter resistance suite,
  // mechanical power of ventilation, Bohr-Enghoff dead-space fraction.
  // views/group-v13.js, lib/hemodynamics-v87.js.
  { id: 'hemodynamic-suite',   name: 'Hemodynamics: Cardiac Index, Stroke Volume, SVR/PVR Suite', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mechanical-power',    name: 'Mechanical Power of Ventilation (Gattinoni)',      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dead-space',          name: 'Physiologic Dead-Space Fraction (Bohr-Enghoff Vd/Vt)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v65 §2.2-2.3: gas-exchange ventilation target and cerebral perfusion pressure.
  { id: 'minute-ventilation',  name: 'Minute Ventilation + Target-PaCO2 Rate',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cerebral-perfusion-pressure', name: 'Cerebral Perfusion Pressure (CPP = MAP - ICP)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ttkg',                name: 'Transtubular Potassium Gradient (TTKG)',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'urine-anion-gap',     name: 'Urine Anion Gap (non-gap acidosis)',               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acid-base-deficit',   name: 'Bicarbonate Deficit + Sodium Deficit',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'schwartz-egfr',       name: 'Bedside Schwartz eGFR (pediatric)',                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v56: weight-based dosing, infusion titration, and bedside toxicology (13 tiles).
  { id: 'heparin-nomogram',     name: 'Weight-based heparin infusion nomogram',           group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v133 (Wave 6): warfarin start-up beside heparin-nomogram -- the IWPC
  // and Gage pharmacogenetic maintenance-dose models and the Kovacs 10 mg /
  // Crowther 5 mg initiation nomograms. lib/warfarin-v133.js, views/group-v133.js
  // (RV133). All four coefficient blocks / nomogram tables re-fetched and
  // cross-verified against the primary source (spec-v97 discipline).
  { id: 'warfarin-iwpc',        name: 'IWPC pharmacogenetic warfarin dose',               group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'warfarin-gage',        name: 'Gage pharmacogenomic warfarin dose',               group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'warfarin-init-10mg',   name: 'Warfarin 10 mg initiation nomogram (Kovacs)',      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'warfarin-init-5mg',    name: 'Warfarin 5 mg initiation nomogram (Crowther)',     group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vanc-auc',             name: 'Vancomycin AUC24/MIC (first-order, two-level)',    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aminoglycoside',       name: 'Extended-interval aminoglycoside (Hartford)',      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acetaminophen-nomogram', name: 'Acetaminophen (Rumack-Matthew) nomogram',        group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'digoxin',              name: 'Digoxin maintenance dose + level interpretation',  group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'local-anesthetic-max', name: 'Local anesthetic maximum dose',                    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mgso4-preeclampsia',   name: 'Magnesium sulfate (preeclampsia / eclampsia)',     group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pca-pump',             name: 'PCA pump settings + hourly-maximum guardrail',     group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sugammadex',           name: 'Sugammadex reversal dose',                         group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ketamine-propofol',    name: 'Procedural sedation dosing (ketamine/propofol)',   group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-fluid-deficit',   name: 'Pediatric dehydration deficit + maintenance',      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-resus',           name: 'Pediatric resuscitation bolus',                    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'conc-percent',         name: 'Concentration / percent / ratio converter',        group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v88 §2.2: AUC-based carboplatin dose (Calvert 1989) with the FDA
  // estimated-GFR cap. views/group-v14.js, lib/metabolic-onc-v88.js.
  { id: 'calvert-carboplatin',  name: 'Carboplatin Dose (Calvert formula + FDA GFR cap)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v57: brief screeners, decision rules, and triage scores (14 tiles).
  { id: 'phq2-gad2',            name: 'PHQ-2 / GAD-2 ultra-brief screeners',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'audit-full',           name: 'AUDIT (10-item alcohol use screen)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dast10',               name: 'DAST-10 Drug Abuse Screening Test',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gds15',                name: 'Geriatric Depression Scale (GDS-15)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ottawa-knee',          name: 'Ottawa Knee Rule',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nexus-chest',          name: 'NEXUS Chest (blunt chest-trauma imaging)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sfsr',                 name: 'San Francisco Syncope Rule (CHESS)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'canadian-syncope',     name: 'Canadian Syncope Risk Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'edacs',                name: 'EDACS chest-pain score (+ EDACS-ADP)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'years-pe',             name: 'YEARS algorithm for pulmonary embolism',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'feverpain',            name: 'FeverPAIN score (strep pharyngitis)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'stone-score',          name: 'STONE score (ureteral stone)',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iss-rts',              name: 'Injury Severity Score + Revised Trauma Score',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sipa',                 name: 'Shock Index, Pediatric Age-Adjusted (SIPA)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v58: neonatal, maternal, and pediatric/adult ICU bedside scores (12 tiles).
  { id: 'ballard',              name: 'New Ballard Score (gestational age)',              group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'finnegan',             name: 'Finnegan Neonatal Abstinence Score (NAS)',         group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'silverman-andersen',   name: 'Silverman-Andersen respiratory severity',          group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'downes',               name: 'Downes score (neonatal respiratory distress)',     group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bhutani-bilirubin',    name: 'Bhutani bilirubin nomogram + AAP phototherapy',    group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'qbl-pph',              name: 'Quantitative blood loss + PPH risk',               group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pelod2',               name: 'PELOD-2 (pediatric organ dysfunction)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psofa',                name: 'Pediatric SOFA (pSOFA)',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'burch-wartofsky',      name: 'Burch-Wartofsky point scale (thyroid storm)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ariscat',              name: 'ARISCAT postoperative pulmonary risk',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apache2',              name: 'APACHE II (ICU mortality estimate)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'braden-q',             name: 'Braden Q (pediatric pressure-injury risk)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v61 §3: 12 bedside medication-safety, electrolyte/fluid, and OB/peds tiles.
  { id: 'urine-output',         name: 'Urine output rate + KDIGO oliguria flag',          group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'gir',                  name: 'Glucose Infusion Rate (mg/kg/min)',                group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ebv-mabl',             name: 'Estimated blood volume + max allowable blood loss', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-phenytoin',  name: 'Albumin-corrected phenytoin (Sheiner-Tozer)',      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'potassium-deficit',    name: 'Potassium deficit + replacement guidance',         group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'magnesium-replacement', name: 'Magnesium repletion estimate',                    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'calcium-replacement',  name: 'Calcium replacement (gluconate / chloride + elemental Ca)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rhig-dose',            name: 'Rh immune globulin dose (fetomaternal hemorrhage)', group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-transfusion-volume', name: 'Pediatric / neonatal PRBC transfusion volume',  group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iv-osmolarity',        name: 'IV / PN osmolarity + central-line flag',           group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'burn-uop-target',      name: 'Burn-resuscitation urine-output target',           group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'fluid-balance',        name: 'Shift net fluid balance (I&O)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'carb-insulin-bolus',   name: 'Carb-counting mealtime insulin bolus',             group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v62 §3 Part B (wave 1): OB/L&D & neonatal bedside math.
  { id: 'neonatal-feeding-volume', name: 'Neonatal Feeding Volume (mL/kg/day)',          group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oxytocin-titration',   name: 'Oxytocin mU/min <-> mL/hr',                        group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v62 §3.3 Part B (wave 2): AAP-2022 neonatal phototherapy threshold.
  { id: 'neo-phototherapy',     name: 'Neonatal Phototherapy Threshold (AAP 2022)',      group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v185: eight gap-filling cardiac/echo hemodynamics, anticoagulation,
  // metabolic, and dosing-weight calculators. lib/gaps-v185.js, views/group-v185.js (RV185).
  { id: 'fick-cardiac-output',  name: 'Cardiac Output by the Fick Principle',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gorlin',               name: 'Gorlin Valve-Area Equation',                       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'qp-qs',                name: 'Qp/Qs Pulmonary-to-Systemic Flow Ratio',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lvot-stroke-volume',   name: 'Doppler Stroke Volume & CO (LVOT-VTI)',            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vte-bleed',            name: 'VTE-BLEED Bleeding Risk (on anticoagulation)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'matsuda-index',        name: 'Matsuda Insulin Sensitivity Index (OGTT)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rosendaal-ttr',        name: 'Time in Therapeutic Range (Rosendaal)',            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lean-body-weight',     name: 'Lean Body Weight (Janmahasatian)',                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v186: six advanced specialty computations (radiation oncology, valve
  // regurgitation, LV mechanics, diffusing capacity, exercise physiology, EBM
  // statistics). lib/specialtymath-v186.js, views/group-v186.js (RV186).
  { id: 'bed-eqd2',             name: 'Radiotherapy BED & EQD2 (linear-quadratic)',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pisa-eroa',            name: 'PISA Regurgitant Orifice & Volume (EROA)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lv-wall-stress',       name: 'LV Meridional Wall Stress (Laplace)',              group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dlco-correction',      name: 'Hemoglobin-Corrected DLCO & KCO',                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vo2max-exercise',      name: 'Estimated VO₂max & METs (Bruce / Cooper)',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'proportion-ci',        name: 'Confidence Interval for a Proportion (Wilson)',    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v187: five solid-tumor staging / response / inflammation-prognosis
  // instruments (Subspecialty Oncology & Hematology Staging program, first spec).
  // lib/onc-staging-v187.js, views/group-v187.js (RV187).
  { id: 'bclc-hcc',             name: 'BCLC Stage (hepatocellular carcinoma)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'imdc-rcc',             name: 'IMDC (Heng) Metastatic RCC Risk',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mskcc-rcc',            name: 'MSKCC (Motzer) Metastatic RCC Risk',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'recist',               name: 'RECIST 1.1 Tumor Response',                        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'glasgow-prognostic-score', name: 'Modified Glasgow Prognostic Score (mGPS)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v188: five leukemia / lymphoma staging and prognostic instruments
  // (Subspecialty Oncology & Hematology Staging program, second spec).
  // lib/heme-staging-v188.js, views/group-v188.js (RV188).
  { id: 'binet-cll',            name: 'Binet Staging (CLL)',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rai-cll',              name: 'Rai Staging (CLL)',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ann-arbor',           name: 'Ann Arbor / Lugano Lymphoma Staging',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'flipi-2',              name: 'FLIPI-2 (Follicular Lymphoma Prognostic Index 2)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hasford-cml',          name: 'Hasford (Euro) Score for CML',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v189: four heme / rheum / anticoagulation / comorbidity instruments
  // (Subspecialty Oncology & Hematology Staging program, closing spec; BVAS v3
  // deferred). lib/heme-risk-v189.js, views/group-v189.js (RV189).
  { id: 'msmart',               name: 'mSMART Myeloma Risk Stratification',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'impede-vte',           name: 'IMPEDE VTE Score (Myeloma)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'same-tt2r2',           name: 'SAMe-TT2R2 (VKA Anticoagulation Control)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'elixhauser',           name: 'Elixhauser Comorbidity Index (van Walraven)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v190: four hepatology / GI instruments. lib/hepgi-v190.js,
  // views/group-v190.js (RV190). PALBI grade, MELD-Na, Clichy criteria, Rome IV IBS.
  { id: 'palbi',                name: 'PALBI (Platelet-Albumin-Bilirubin) Grade',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'meld-na',              name: 'MELD-Na (Sodium-Augmented MELD)',                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'clichy',               name: 'Clichy Criteria for Acute Liver Failure',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rome-iv-ibs',          name: 'Rome IV Criteria for Irritable Bowel Syndrome',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v191: four dermatology / urology severity & staging instruments.
  // lib/dermuro-v191.js, views/group-v191.js (RV191).
  { id: 'scorten',              name: 'SCORTEN (Toxic Epidermal Necrolysis Severity)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'melanoma-t-stage',     name: 'AJCC 8th-Edition Melanoma T Category',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pi-rads',              name: 'PI-RADS v2.1 (Prostate MRI Assessment)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'guys-stone-score',     name: 'Guy’s Stone Score (PCNL Complexity)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v192: four screening / bedside-risk instruments (GWTG-HF deferred).
  // lib/risk-v192.js, views/group-v192.js (RV192).
  { id: 'findrisc',             name: 'FINDRISC (Finnish Diabetes Risk Score)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'grobman-vbac',         name: 'VBAC Success Calculator (Grobman, race-free 2021)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'marburg-heart-score',  name: 'Marburg Heart Score (CAD in Primary-Care Chest Pain)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'adhere-hf',            name: 'ADHERE In-Hospital Heart-Failure Mortality',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v193: five acute-coronary / primary-PCI / cardiogenic-shock risk
  // instruments (Advanced Specialist Quantitation program, first spec).
  // lib/acs-v193.js, views/group-v193.js (RV193).
  { id: 'crusade',              name: 'CRUSADE Major-Bleeding Risk (NSTEMI)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'scai-shock',           name: 'SCAI SHOCK Cardiogenic-Shock Stage',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'zwolle-pci',           name: 'Zwolle Primary-PCI Risk Score',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'timi-risk-index',      name: 'TIMI Risk Index',                                  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cadillac-risk',        name: 'CADILLAC Risk Score (post-PCI mortality)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v194: four invasive- / echocardiographic-hemodynamics instruments.
  // lib/hemo-v194.js, views/group-v194.js (RV194).
  { id: 'papi',                 name: 'Pulmonary Artery Pulsatility Index (PAPi)',        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'transpulmonary-gradient', name: 'Transpulmonary & Diastolic Pressure Gradient', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tei-index',            name: 'Tei Myocardial Performance Index (MPI)',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'shunt-fraction',       name: 'Pulmonary Shunt Fraction (Qs/Qt)',                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v195: four gas-exchange / ventilation-efficiency instruments.
  // lib/vent-v195.js, views/group-v195.js (RV195).
  { id: 'sf-ratio',             name: 'SpO₂/FiO₂ (S/F) Ratio with estimated P/F',         group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ventilatory-ratio',    name: 'Ventilatory Ratio (VR)',                           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'osi-oxygenation',      name: 'Oxygen Saturation Index (OSI)',                    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ventilation-index',    name: 'Ventilation Index (VI)',                           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v196: five chronic-liver-disease prognostic instruments.
  // lib/liver-v196.js, views/group-v196.js (RV196).
  { id: 'abic-score',           name: 'ABIC Score (Alcoholic Hepatitis)',                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'globe-score',          name: 'GLOBE Score (PBC Transplant-Free Survival)',       group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'uk-pbc-risk',          name: 'UK-PBC Risk Score',                                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'page-b',               name: 'PAGE-B Score (HCC Risk in Chronic Hepatitis B)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mayo-psc-risk',        name: 'Revised Mayo PSC Natural-History Model',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v197: five thyroid-homeostasis / β-cell-function instruments.
  // lib/endo-quant-v197.js, views/group-v197.js (RV197).
  { id: 'spina-gt',             name: 'SPINA-GT (Thyroid Secretory Capacity)',            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'spina-gd',             name: 'SPINA-GD (Peripheral Deiodinase Activity)',        group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'jostel-tsh-index',     name: 'Jostel’s TSH Index (TSHI / sTSHI)',                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'homa-beta',            name: 'HOMA-B (Steady-State β-Cell Function)',            group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oral-disposition-index', name: 'Oral Disposition Index (DIo)',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v198: five cross-specialty prognostic / diagnostic instruments
  // (Advanced Specialist Quantitation program, closing spec).
  // lib/subspecialty-v198.js, views/group-v198.js (RV198).
  { id: 'cns-ipi',              name: 'CNS International Prognostic Index (CNS-IPI)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'isth-bat',             name: 'ISTH Bleeding Assessment Tool (ISTH-BAT)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'virsta',               name: 'VIRSTA Score (IE Risk in S. aureus Bacteremia)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'select-pse',           name: 'SeLECT Score (Late Post-Stroke Epilepsy)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'figo-gtn',             name: 'WHO/FIGO Prognostic Score (GTN)',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v199: four myeloid-neoplasm & transplant prognostic instruments
  // (Deep Subspecialty Quantitation program, opening spec). The proposed fifth
  // tile (ELTS) was dropped at implementation: the spec-v85 §6.2 collision
  // re-check found ELTS is already computed by the live `sokal-cml` tile
  // (lib/hemonc-v94.js sokalCml), so a standalone tile would duplicate it.
  // lib/myeloid-prognosis-v199.js, views/group-v199.js (RV199).
  { id: 'mipss70',              name: 'MIPSS70 (Primary Myelofibrosis, Transplant-Age)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gipss',                name: 'GIPSS (Genetically Inspired Prognostic Score, PMF)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mysec-pm',             name: 'MYSEC-PM (Secondary Myelofibrosis Survival)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hct-ci',               name: 'HCT-CI (Transplant Comorbidity Index, Sorror)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v200: four critical-care severity, organ-dysfunction & acid-base
  // instruments (Deep Subspecialty Quantitation program). The proposed fifth
  // tile (vasoactive-inotropic-score / VIS) was dropped at implementation: VIS
  // is already computed by the live `vis` tile (lib/clinical-v4.js, spec-v13),
  // so a standalone tile would duplicate it. lib/critcare-severity-v200.js,
  // views/group-v200.js (RV200).
  { id: 'oasis',                name: 'OASIS (Oxford Acute Severity of Illness Score)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lods',                 name: 'LODS (Logistic Organ Dysfunction System)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'delta-gap',            name: 'Delta Gap / Delta Ratio (Acid-Base)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apps-ards',            name: 'APPS Score (Age, PaO₂/FiO₂, Plateau in ARDS)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v201: five hepatology & upper-GI-bleeding prognostic instruments (Deep
  // Subspecialty Quantitation program). lib/hepatology-gibleed-v201.js,
  // views/group-v201.js (RV201). Shipped one tile at a time.
  { id: 'glasgow-blatchford',   name: 'Glasgow-Blatchford Score (Upper GI Bleed)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'clif-c-ad',            name: 'CLIF-C AD (Acute Decompensation, pre-ACLF)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hepamet-fibrosis',     name: 'Hepamet Fibrosis Score (NAFLD Advanced Fibrosis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'clip-hcc',             name: 'CLIP Score (Cancer of the Liver Italian Program)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'agile-3plus',          name: 'Agile 3+ (FibroScan Advanced Fibrosis Probability)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v202: cardiovascular & heart-failure risk / survival engines (Deep
  // Subspecialty Quantitation program). lib/cvrisk-engines-v202.js,
  // views/group-v202.js (RV202). Shipped one tile at a time.
  { id: 'mecki',                name: 'MECKI Score (CPET-anchored HF Prognosis)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v203: perioperative, fracture, cerebrovascular & frailty risk (Deep
  // Subspecialty Quantitation program, closing spec). lib/periop-frailty-v203.js,
  // views/group-v203.js (RV203). Shipped one tile at a time.
  { id: 'dasi',                 name: 'Duke Activity Status Index (DASI, Functional Capacity)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'abcd3-i',              name: 'ABCD3-I Score (Early Stroke Risk After TIA)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sort-mortality',       name: 'SORT (Surgical Outcome Risk Tool, 30-day Mortality)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v204: nephrology, fluids & renal-tubular quantitation (Frontline &
  // Bedside Decision Instruments program). lib/nephro-fluids-v204.js,
  // views/group-v204.js (RV204). Shipped one tile at a time.
  { id: 'cccr',                 name: 'Calcium/Creatinine Clearance Ratio (FHH vs PHPT)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'max-allowable-blood-loss', name: 'Maximum Allowable Blood Loss (ABL)',            group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'efw-clearance',        name: 'Electrolyte-Free Water Clearance',                 group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tmp-gfr',              name: 'TmP/GFR (Renal Phosphate Threshold)',              group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'urine-calcium-cr',     name: 'Urinary Calcium (Spot Ca/Cr + 24-hour Excretion)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v205: pulmonology, COPD & sleep severity (Frontline & Bedside Decision
  // Instruments program). lib/pulm-copd-v205.js, views/group-v205.js (RV205).
  { id: 'cat-copd',             name: 'COPD Assessment Test (CAT)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lent-score',           name: 'LENT Score (Malignant Pleural Effusion Prognosis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ado-index',            name: 'ADO Index (Age, Dyspnea, Obstruction; COPD)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dose-index',           name: 'DOSE Index (Dyspnea, Obstruction, Smoking, Exacerbations; COPD)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sacs-osa',             name: 'Sleep Apnea Clinical Score (SACS, Flemons)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v206: traumatic brain injury & stroke prognosis (Frontline & Bedside
  // Decision Instruments program). lib/tbi-stroke-v206.js, group-v206 (RV206).
  { id: 'essen-stroke-risk',    name: 'Essen Stroke Risk Score (Recurrent Vascular Events)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rotterdam-ct',         name: 'Rotterdam CT Score (Traumatic Brain Injury)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'marshall-ct',          name: 'Marshall CT Classification (Traumatic Brain Injury)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'func-score',           name: 'FUNC Score (Functional Outcome After ICH)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v207: resuscitation, cardiac-arrest & trauma-death prognosis (Frontline
  // & Bedside Decision Instruments program). lib/resus-trauma-v207.js, RV207.
  { id: 'tor-rule',             name: 'Termination of Resuscitation Rule (BLS / ALS)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rems',                 name: 'REMS (Rapid Emergency Medicine Score)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cart-score',           name: 'CART Score (Cardiac Arrest Risk Triage)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v208: nutrition-status assessment & maternal-neonatal risk (Frontline &
  // Bedside Decision Instruments program). lib/nutrition-maternal-v208.js, RV208.
  { id: 'ponderal-index',       name: 'Neonatal Ponderal Index (Rohrer’s Index)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sflt1-plgf',           name: 'sFlt-1/PlGF Ratio (Preeclampsia Rule-out / Rule-in)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'glim-malnutrition',    name: 'GLIM Criteria (Malnutrition Diagnosis)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sga-nutrition',        name: 'Subjective Global Assessment (SGA, Detsky)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v209: advanced cardiology risk & prognosis (Advanced Prognostic &
  // Risk-Equation Instruments program). lib/cardiology-risk-v209.js, RV209.
  // mecki already live (v202); seattle-hf deferred.
  { id: 'hcm-risk-scd',         name: 'HCM Risk-SCD (5-year Sudden Cardiac Death, HCM)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'charge-af',            name: 'CHARGE-AF (5-year Atrial Fibrillation Risk)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v210: ischemic-stroke & ICH prognosis (Advanced Prognostic &
  // Risk-Equation Instruments program). lib/stroke-prognosis-v210.js, RV210.
  // func-score already live (v206); iscore deferred.
  { id: 'span-100',             name: 'SPAN-100 Index (Age + NIHSS Stroke Prognosis)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v211: hematology-oncology risk stratification (Advanced Prognostic &
  // Risk-Equation Instruments program). lib/heme-onc-risk-v211.js, RV211. hct-ci
  // already live (v199).
  { id: 'eutos',                name: 'EUTOS Score (CML Prognosis on Imatinib)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'improvedd',            name: 'IMPROVEDD VTE Risk Score (Medical Inpatients)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'compass-cat',          name: 'COMPASS-CAT (Cancer-Associated VTE Risk)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'eln-2022-aml',         name: 'ELN 2022 AML Genetic Risk Classification',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v212: hepatology fibrosis & portal-hypertension prognosis (Advanced
  // Prognostic & Risk-Equation Instruments program). lib/hep-fibrosis-portal-v212.js,
  // RV212. hepamet-fibrosis already live (v201).
  { id: 'king-score',           name: 'King’s Score (Non-Invasive Cirrhosis Marker)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'baveno-vii',           name: 'Baveno VII (Portal Hypertension & Varices Rule-Out)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v213: ED disposition & injury/physiology bedside instruments.
  // lib/acute-injury-v213.js, RV213. Each verified absent by direct app.js scan
  // (spec-v85 §6.2); each stratifies / classifies / estimates, none orders.
  { id: 'heart-pathway',        name: 'HEART Pathway (Early Discharge in Chest Pain)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ottawa-heart-failure', name: 'Ottawa Heart Failure Risk Scale (OHFRS)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'light-criteria',       name: 'Light’s Criteria (Pleural Exudate vs Transudate)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'baux-score',           name: 'Baux Score (Burn Mortality Estimate)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'revised-baux',         name: 'Revised Baux Score (Burn Mortality with Inhalation)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v214: cardiology risk scores (AF ablation / progression + ACS severity).
  // lib/cardiology-risk-v214.js, RV214. Each verified absent (spec-v85 §6.2);
  // each stratifies recurrence / progression / complication risk, none orders.
  { id: 'apple-score',          name: 'APPLE Score (AF Recurrence After Ablation)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'caap-af-score',        name: 'CAAP-AF Score (Freedom From AF After Ablation)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'atlas-score',          name: 'ATLAS Score (AF Recurrence After PVI)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hatch-score',          name: 'HATCH Score (AF Progression Risk)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mb-later-score',       name: 'MB-LATER Score (Very-Late AF Recurrence)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'canada-acs-risk-score', name: 'Canada ACS (C-ACS) Risk Score',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'action-icu-score',     name: 'ACTION ICU Score (ICU Complications in NSTEMI)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v215: lipid / device / oncology risk scores. lib/risk-scores-v215.js,
  // RV215. Each verified absent (spec-v85 §6.2); each classifies / stratifies,
  // none orders.
  { id: 'dlcn-fh-score',        name: 'Dutch Lipid Clinic Network Score (Familial Hypercholesterolemia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'simon-broome-fh',      name: 'Simon Broome Criteria (Familial Hypercholesterolemia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'padit-score',          name: 'PADIT Score (Cardiac Device Infection Risk)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'grim-score',           name: 'GRIm-Score (Gustave Roussy Immune Score)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lipi',                 name: 'Lung Immune Prognostic Index (LIPI)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'onkotev-score',        name: 'ONKOTEV Score (Cancer-Associated VTE Risk)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'protecht-score',       name: 'PROTECHT Score (Cancer-Associated VTE Risk)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v216: hematology prognostic scores & staging. lib/heme-prognostic-v216.js,
  // RV216. Each verified absent (spec-v85 §6.2); each stages / stratifies, none orders.
  { id: 'wpss-mds',             name: 'WPSS (WHO Prognostic Scoring System for MDS)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mdacc-cll-index',      name: 'MDACC CLL Prognostic Index',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pit-ptcl',             name: 'PIT (Prognostic Index for PTCL-U)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'prima-pi',             name: 'PRIMA-PI (Follicular Lymphoma Prognostic Index)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'durie-salmon',         name: 'Durie-Salmon Staging (Multiple Myeloma)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lymphocyte-doubling-time', name: 'Lymphocyte Doubling Time (CLL)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'talcott-febrile-neutropenia', name: 'Talcott Rules (Febrile Neutropenia Risk)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v217: stroke & neuro-vascular risk scores. lib/stroke-risk-v217.js,
  // RV217. Each verified absent (spec-v85 §6.2); each stratifies / grades, none orders.
  { id: 'canadian-tia-score',   name: 'Canadian TIA Score (7-Day Stroke Risk)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'astral-score',         name: 'ASTRAL Score (90-Day Stroke Outcome)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'soar-score',           name: 'SOAR Score (Stroke Mortality)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'plan-score',           name: 'PLAN Score (Stroke 30-Day Mortality)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sits-sich',            name: 'SITS-SICH (Symptomatic ICH After Alteplase)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vasograde',            name: 'VASOGRADE (Delayed Cerebral Ischemia After aSAH)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ogilvy-carter',        name: 'Ogilvy-Carter Aneurysm Grading',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v218: ED / trauma / infection decision instruments. lib/ed-decision-v218.js,
  // RV218. Each verified absent (spec-v85 §6.2); each stratifies / classifies, none orders.
  { id: 'faint-score',          name: 'FAINT Score (Older-Adult ED Syncope)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nexus-head-ct',        name: 'NEXUS Head CT Instrument (Adult)',                 group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'handoc-score',         name: 'HANDOC Score (Echo Need in Strep Bacteremia)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'denova-score',         name: 'DENOVA Score (Echo Need in E. faecalis Bacteremia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'icm-pji-2018',         name: '2018 ICM Periprosthetic Joint Infection Definition', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'air-score',            name: 'Appendicitis Inflammatory Response (AIR) Score',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'adult-appendicitis-score', name: 'Adult Appendicitis Score (AAS)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v219: metabolic & hepatic indices. lib/metabolic-hepatic-v219.js, RV219.
  // Each verified absent (spec-v85 §6.2); each screens / estimates, none orders.
  { id: 'ada-diabetes-risk-test', name: 'ADA / Bang Diabetes Risk Test',                  group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'cambridge-diabetes-risk', name: 'Cambridge Diabetes Risk Score',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lipid-accumulation-product', name: 'Lipid Accumulation Product (LAP)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'visceral-adiposity-index', name: 'Visceral Adiposity Index (VAI)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'conicity-index',       name: 'Conicity Index (Central Adiposity)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ast-alt-ratio',        name: 'AST/ALT (De Ritis) Ratio',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ggt-platelet-ratio',   name: 'GGT-to-Platelet Ratio (GPR)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v220: hepatology prognosis & fibrosis. lib/hepatology-prognosis-v220.js,
  // RV220. Each verified absent (spec-v85 §6.2); each stages / stratifies, none orders.
  { id: 'fips-score',           name: 'FIPS (Freiburg Index of Post-TIPS Survival)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'albi-plt',             name: 'ALBI-PLT Score (Varices Risk)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'damico-cirrhosis-stage', name: 'D’Amico Clinical Stages of Cirrhosis',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'amap-score',           name: 'aMAP Score (Hepatocellular Carcinoma Risk)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nacseld-aclf',         name: 'NACSELD Acute-on-Chronic Liver Failure',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fibroq',               name: 'FibroQ (Liver Fibrosis Index)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v221: pulmonary & critical-care risk scores. lib/pulmonary-risk-v221.js,
  // RV221. Each verified absent (spec-v85 §6.2); each stratifies / estimates, none orders.
  { id: 'simplified-revised-geneva', name: 'Simplified Revised Geneva Score (PE)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'scap-score',           name: 'SCAP Score (Severe Community-Acquired Pneumonia)',  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corb-score',           name: 'CORB Score (Severe Pneumonia)',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'resp-score',           name: 'RESP Score (Respiratory ECMO Survival)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ild-gap',              name: 'ILD-GAP Index (Interstitial Lung Disease Mortality)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'du-bois-ipf',          name: 'du Bois IPF 1-Year Mortality Score',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pneumothorax-volume',  name: 'Pneumothorax Size (Collins Method)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v222: rheumatology classification & activity. lib/rheum-classification-v222.js,
  // RV222. Each verified absent (spec-v85 §6.2); each classifies / scores activity, none orders.
  { id: 'iim-eular-acr-2017',   name: '2017 EULAR/ACR Myositis Classification',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pmr-eular-acr-2012',   name: '2012 EULAR/ACR Polymyalgia Rheumatica Criteria',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bohan-peter',          name: 'Bohan & Peter Criteria (Polymyositis/Dermatomyositis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acr-eular-2013-systemic-sclerosis', name: '2013 ACR/EULAR Systemic Sclerosis Criteria', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mrss-modified-rodnan-skin-score', name: 'Modified Rodnan Skin Score (mRSS)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acr-eular-2016-sjogren', name: '2016 ACR/EULAR Sjögren Criteria',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'esspri',               name: 'ESSPRI (Sjögren Patient-Reported Index)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v223: dermatology activity, staging & screening. lib/dermatology-v223.js,
  // RV223. Each verified absent (spec-v85 §6.2); each scores / classifies / screens, none orders.
  { id: 'uas7',                 name: 'UAS7 (Urticaria Activity Score over 7 Days)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hiscr',                name: 'HiSCR (Hidradenitis Suppurativa Clinical Response)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hurley-stage',         name: 'Hurley Staging (Hidradenitis Suppurativa)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'poem',                 name: 'POEM (Patient-Oriented Eczema Measure)',           group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'alden',                name: 'ALDEN (Drug Causality in SJS/TEN)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pest',                 name: 'PEST (Psoriatic Arthritis Screening Tool)',        group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'glasgow-7-point-checklist', name: 'Weighted Glasgow 7-Point Checklist (Melanoma)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v224: neurology screening, disability & epilepsy outcome. lib/neurology-v224.js,
  // RV224. Each verified absent (spec-v85 §6.2); each screens / classifies / scores, none orders.
  { id: 'id-migraine',          name: 'ID Migraine Screener',                             group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'onls',                 name: 'ONLS (Overall Neuropathy Limitations Scale)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'end-it-score',         name: 'END-IT Score (Status Epilepticus Outcome)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'engel-classification', name: 'Engel Epilepsy Surgery Outcome Class',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ilae-surgical-outcome', name: 'ILAE Epilepsy Surgery Outcome Class',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'salzburg-ncse-criteria', name: 'Salzburg Criteria for Nonconvulsive Status Epilepticus', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dhi',                  name: 'Dizziness Handicap Inventory (DHI)',               group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  // spec-v225: obstetrics & gynecology scoring. lib/obgyn-v225.js, RV225.
  // Each verified absent (spec-v85 §6.2); each scores / classifies, none orders.
  { id: 'nugent-score',         name: 'Nugent Score (Bacterial Vaginosis Gram Stain)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'amsel-criteria',       name: 'Amsel Criteria (Bacterial Vaginosis)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ferriman-gallwey',     name: 'Modified Ferriman-Gallwey Hirsutism Score',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pbac-hmb',             name: 'PBAC (Pictorial Blood Loss Assessment Chart)',     group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'thompson-hie',         name: 'Thompson Score (Neonatal Encephalopathy)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'menopause-rating-scale', name: 'Menopause Rating Scale (MRS)',                   group: 'G', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'kupperman-index',      name: 'Blatt-Kupperman Menopausal Index',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v226: nephrology, electrolyte & fluid formulas. lib/nephrology-v226.js,
  // RV226. Each verified absent (spec-v85 §6.2); each estimates / stratifies, none orders.
  { id: 'watson-tbw',           name: 'Watson Total Body Water',                          group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'salazar-corcoran',     name: 'Salazar-Corcoran Creatinine Clearance (Obesity)',  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'epvs',                 name: 'Estimated Plasma Volume Status (ePVS)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'furosemide-stress-test', name: 'Furosemide Stress Test (AKI Progression)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fe-bicarbonate',       name: 'Fractional Excretion of Bicarbonate (FEHCO3)',     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-potassium-ph', name: 'pH-Corrected Serum Potassium',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v227: closing cross-domain slice (Bedside Decision & Physiology program,
  // +100 milestone). lib/mixed-v227.js, RV227. Each verified absent (spec-v85 §6.2);
  // each classifies / stratifies, none orders. who-dengue-2009 carries a
  // docs/citation-staleness.md row (WHO acronym).
  { id: 'icbd-2014-behcet',     name: 'ICBD 2014 (Behçet Disease Criteria)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'isg-1990-behcet',      name: 'ISG 1990 Criteria (Behçet Disease)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'batt',                 name: 'BATT Score (Trauma Hemorrhage / TXA)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'denver-ed-tof',        name: 'Denver ED Trauma Organ Failure Score',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ets',                  name: 'Emergency Transfusion Score (ETS)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'who-dengue-2009',      name: 'WHO 2009 Dengue Case Classification',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v228: microcytic-anemia RBC discrimination indices. lib/mixed-v228.js,
  // RV228. Each verified absent (spec-v85 §6.2); each screens beta-thalassemia
  // trait vs iron-deficiency anemia (sibling to mentzer/shine-lal), none diagnoses
  // or orders. Formulas/cutoffs >= 2-source verified (spec-v97).
  { id: 'england-fraser-index', name: 'England & Fraser Index (Thalassemia vs Iron Deficiency)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sirdah-index',         name: 'Sirdah Index (Thalassemia vs Iron Deficiency)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rdw-index',            name: 'RDW Index / RDWI (Thalassemia vs Iron Deficiency)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'srivastava-index',     name: 'Srivastava Index (Thalassemia vs Iron Deficiency)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ehsani-index',         name: 'Ehsani Index (Thalassemia vs Iron Deficiency)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v229: CBC-derived count & inflammation indices (1000-tile milestone).
  // lib/hematology-v229.js, RV229. Each verified absent (spec-v85 §6.2); each
  // computes a lab value from CBC inputs, none diagnoses or orders (spec-v11 §5.3).
  // Formulas/bands >= 2-source verified (spec-v97).
  { id: 'aec',                  name: 'Absolute Eosinophil Count (Eosinophilia Grading)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nlr',                  name: 'Neutrophil-to-Lymphocyte Ratio (NLR)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'plr',                  name: 'Platelet-to-Lymphocyte Ratio (PLR)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sii',                  name: 'Systemic Immune-Inflammation Index (SII)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v230: prognostic inflammation indices (extends the v229 index family).
  // lib/inflam-v230.js, RV230. Each verified absent (spec-v85 6.2, incl. MCP
  // adapters); each computes a lab value, none diagnoses or orders (spec-v11 5.3).
  // Formulas >= 2-source verified (spec-v97).
  { id: 'lmr',                  name: 'Lymphocyte-to-Monocyte Ratio (LMR)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'siri',                 name: 'Systemic Inflammation Response Index (SIRI)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'piv',                  name: 'Pan-Immune-Inflammation Value (PIV)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'crp-albumin-ratio',    name: 'CRP-to-Albumin Ratio (CAR)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v231: nutrition/inflammation prognostic tools (extends v229/v230).
  // lib/prognostic-v231.js, RV231. Each verified absent (spec-v85 6.2, incl. MCP
  // adapters); each computes a score/lab value, none diagnoses or orders (spec-v11
  // 5.3). Cutoffs/formulas >= 2-source verified (spec-v97).
  { id: 'naples-prognostic-score', name: 'Naples Prognostic Score',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nmr',                  name: 'Neutrophil-to-Monocyte Ratio (NMR)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'far',                  name: 'Fibrinogen-to-Albumin Ratio (FAR)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v232: thrombosis/coagulation bedside scores. lib/coagscore-v232.js,
  // RV232. Each verified absent (spec-v85 6.2, incl. MCP adapters); each grades/
  // classifies, none diagnoses or orders (spec-v11 5.3). Point systems >= 2-source
  // verified (spec-v97).
  { id: 'villalta',             name: 'Villalta Scale (Post-Thrombotic Syndrome)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sic',                  name: 'Sepsis-Induced Coagulopathy (SIC) Score',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v233: quantitative bedside estimators. lib/estimators-v233.js, RV233.
  // Each verified absent (spec-v85 6.2, incl. MCP adapters); each computes a ratio/
  // estimate/threshold, none diagnoses or orders (spec-v11 5.3). Formulas/cutoffs
  // >= 2-source verified (spec-v97).
  { id: 'evans-index',          name: 'Evans Index (Ventricular Enlargement)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fohr',                 name: 'Frontal-Occipital Horn Ratio (FOHR)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'age-adjusted-d-dimer', name: 'Age-Adjusted D-Dimer Cutoff',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'deurenberg-body-fat',  name: 'Deurenberg Body-Fat Estimate',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v234: dermatology scoring indices. lib/dermscore-v234.js, RV234. Each
  // verified absent (spec-v85 6.2, incl. MCP adapters); each grades/classifies
  // severity, none diagnoses or orders (spec-v11 5.3). Formulas >= 2-source
  // verified (spec-v97).
  { id: 'masi',                 name: 'MASI (Melasma Area and Severity Index)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'salt-score',           name: 'SALT (Severity of Alopecia Tool)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'napsi',                name: 'NAPSI (Nail Psoriasis Severity Index)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vancouver-scar-scale', name: 'Vancouver Scar Scale (VSS)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v235: pain / disability screening instruments. lib/painscore-v235.js,
  // RV235. Each verified absent (spec-v85 6.2, incl. MCP adapters); each screens/
  // grades, none diagnoses or orders (spec-v11 5.3). Point systems >= 2-source
  // verified (spec-v97).
  { id: 'dn4-neuropathic-pain', name: 'DN4 Neuropathic Pain Screen',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lanss-pain-scale',     name: 'LANSS Pain Scale',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'roland-morris-disability', name: 'Roland-Morris Disability Questionnaire',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'neck-disability-index', name: 'Neck Disability Index (NDI)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v236: ophthalmology / refractive calculators. lib/ophtho-v236.js, RV236.
  // Each verified absent (spec-v85 6.2, incl. MCP adapters); each computes an
  // optical value or risk score, none diagnoses or orders (spec-v11 5.3). Formulas
  // >= 2-source verified (spec-v97).
  { id: 'spherical-equivalent', name: 'Spherical Equivalent',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vertex-distance',      name: 'Vertex Distance Power Conversion',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'percent-tissue-altered', name: 'Percent Tissue Altered (LASIK Ectasia Risk)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'randleman-erss',       name: 'Randleman Ectasia Risk Score System',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v237: cardiology ECG / echo bedside calculators. lib/cardioecho-v237.js,
  // RV237. Each verified absent (spec-v85 6.2, incl. MCP adapters); each scores/
  // classifies/computes a value, none diagnoses or orders (spec-v11 5.3). Point
  // systems/formulas >= 2-source verified (spec-v97).
  { id: 'romhilt-estes',        name: 'Romhilt-Estes LVH Point Score',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wilkins-score',        name: 'Wilkins Mitral Valve Echo Score',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mitral-valve-area-pht', name: 'Mitral Valve Area by Pressure Half-Time',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aortic-dvi',           name: 'Aortic Dimensionless Index',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rate-pressure-product', name: 'Rate-Pressure Product (Double Product)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v238: anthropometric / metabolic estimators. lib/anthro-v238.js, RV238.
  // Each verified absent (spec-v85 6.2, incl. MCP adapters); each estimates a value,
  // none diagnoses or orders (spec-v11 5.3). Formulas >= 2-source verified (spec-v97).
  { id: 'relative-fat-mass',    name: 'Relative Fat Mass (RFM)',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'body-roundness-index', name: 'Body Roundness Index (BRI)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'navy-body-fat',        name: 'US Navy Body-Fat Estimate',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egdr',                 name: 'Estimated Glucose Disposal Rate (eGDR)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v239: hepatology / GI-surgery scores. lib/gisurg-v239.js, RV239. Each
  // verified absent (spec-v85 6.2, incl. MCP adapters); each scores/classifies risk,
  // none diagnoses or orders (spec-v11 5.3). Point systems/formulas >= 2-source
  // verified (spec-v97).
  { id: 'bonacini-cds',         name: 'Bonacini Cirrhosis Discriminant Score',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'guci',                 name: 'Goteborg University Cirrhosis Index (GUCI)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mannheim-peritonitis-index', name: 'Mannheim Peritonitis Index',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'boey-score',           name: 'Boey Score (Perforated Peptic Ulcer)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v240: palliative / rehabilitation functional measures. lib/rehab-v240.js,
  // RV240. Each verified absent (spec-v85 6.2, incl. MCP adapters); each sums/
  // estimates a value, none diagnoses or orders (spec-v11 5.3). Scoring/formulas
  // >= 2-source verified (spec-v97).
  { id: 'esas-symptom-assessment', name: 'Edmonton Symptom Assessment System (ESAS)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rivermead-mobility-index', name: 'Rivermead Mobility Index',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'six-minute-walk-predicted', name: 'Predicted 6-Minute Walk Distance',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'quickdash',            name: 'QuickDASH (Upper-Limb Disability)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v241: geriatric assessment tools. lib/geri-v241.js, RV241. Each verified
  // absent (spec-v85 6.2, incl. MCP adapters); each screens/scores/estimates, none
  // diagnoses or orders (spec-v11 5.3). Scoring/formulas >= 2-source verified
  // (spec-v97).
  { id: 'groningen-frailty-indicator', name: 'Groningen Frailty Indicator (GFI)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'short-physical-performance-battery', name: 'Short Physical Performance Battery (SPPB)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'osteoporosis-self-assessment-tool', name: 'Osteoporosis Self-Assessment Tool (OST)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'five-times-sit-to-stand', name: 'Five-Times Sit-to-Stand Test',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v242: environmental heat / cold exposure indices. lib/environ-v242.js,
  // RV242. Each verified absent (spec-v85 6.2, incl. MCP adapters); each computes an
  // apparent-temperature / heat-stress value, none diagnoses or orders (spec-v11
  // 5.3). Formulas >= 2-source verified (spec-v97).
  { id: 'heat-index',           name: 'Heat Index (Apparent Temperature)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'humidex',              name: 'Humidex',                                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wind-chill',           name: 'Wind Chill Index',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wbgt',                 name: 'Wet-Bulb Globe Temperature (WBGT)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v243: ENT / sleep screening tools. lib/entsleep-v243.js, RV243. Each
  // verified absent (spec-v85 6.2, incl. MCP adapters); each scores/screens/computes
  // a value, none diagnoses or orders (spec-v11 5.3). Point systems/formulas
  // >= 2-source verified (spec-v97).
  { id: 'nose-scale',           name: 'NOSE Scale (Nasal Obstruction)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rfs-reflux-finding',   name: 'Reflux Finding Score (RFS)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'no-apnea-score',       name: 'No-Apnea OSA Screen',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sleep-efficiency',     name: 'Sleep Efficiency Index',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v244: sports-medicine / MSK measures. lib/sportsmsk-v244.js, RV244. Each
  // verified absent (spec-v85 6.2, incl. MCP adapters); each scores/grades, none
  // diagnoses or orders (spec-v11 5.3). Point systems >= 2-source verified (spec-v97).
  { id: 'lysholm-knee-score',   name: 'Lysholm Knee Score',                               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'marx-activity-rating', name: 'Marx Activity Rating Scale',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'foot-posture-index',   name: 'Foot Posture Index (FPI-6)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bess-balance-error',   name: 'Balance Error Scoring System (BESS)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v245: hematology discrimination indices + HS severity. lib/hemederm-v245.js,
  // RV245. Each verified absent (spec-v85 6.2, incl. MCP adapters); each computes an
  // index/score, none diagnoses or orders (spec-v11 5.3). Formulas/point systems
  // >= 2-source verified (spec-v97).
  { id: 'shine-lal-index',      name: 'Shine & Lal Index',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'green-king-index',     name: 'Green & King Index',                               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'percent-platelet-recovery', name: 'Percent Platelet Recovery (PPR)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ihs4',                 name: 'IHS4 (Hidradenitis Suppurativa Severity)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v246: IBD / GI activity indices. lib/ibd-v246.js, RV246. Each verified
  // absent (spec-v85 6.2, incl. MCP adapters); each scores/grades disease activity,
  // none diagnoses or orders (spec-v11 5.3). Point systems >= 2-source verified
  // (spec-v97).
  { id: 'sccai',                name: 'Simple Clinical Colitis Activity Index (SCCAI)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pucai',                name: 'Pediatric Ulcerative Colitis Activity Index',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bbps-boston',          name: 'Boston Bowel Preparation Scale (BBPS)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'simplified-aih',       name: 'Simplified Autoimmune Hepatitis Criteria',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v247: pediatric acute-care + toxicology tools. lib/pedstox-v247.js, RV247.
  // Each verified absent (spec-v85 6.2, incl. MCP adapters); each scores/estimates,
  // none diagnoses or orders (spec-v11 5.3). Point systems/formulas >= 2-source
  // verified (spec-v97).
  { id: 'pediatric-trauma-score', name: 'Pediatric Trauma Score (Tepas)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bind-score',           name: 'BIND Score (Bilirubin Encephalopathy)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'widmark-bac',          name: 'Widmark Blood-Alcohol Estimate',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'povoc-ponv',           name: 'POVOC Pediatric Postoperative Vomiting Score',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v248: wound-care + infectious-disease scores. lib/woundid-v248.js, RV248.
  // Each verified absent (spec-v85 6.2, incl. MCP adapters); each scores/classifies
  // risk, none diagnoses or orders (spec-v11 5.3). Point systems >= 2-source verified
  // (spec-v97).
  { id: 'absi-burn',            name: 'Abbreviated Burn Severity Index (ABSI)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sinbad-score',         name: 'SINBAD Diabetic Foot Ulcer Score',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'atlas-cdi',            name: 'ATLAS Score (C. difficile Infection)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'increment-cpe',        name: 'INCREMENT-CPE Mortality Score',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v249: renal & respiratory bedside formulas. lib/renalpulm-v249.js, RV249.
  // Each verified absent (spec-v85 6.2, incl. MCP adapters); each computes a value,
  // none diagnoses or orders (spec-v11 5.3). Formulas >= 2-source verified (spec-v97).
  { id: 'renal-failure-index',  name: 'Renal Failure Index (RFI)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'feua',                 name: 'Fractional Excretion of Uric Acid (FEUA)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bronchodilator-response', name: 'Bronchodilator Responsiveness',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'integrative-weaning-index', name: 'Integrative Weaning Index (IWI)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v250: obstetric calculators. lib/obgyn-v250.js, RV250. Each verified absent
  // (spec-v85 6.2, incl. MCP adapters); each computes a rate/dating/score, none
  // diagnoses or orders (spec-v11 5.3). Formulas/point systems >= 2-source verified
  // (spec-v97).
  { id: 'pearl-index',          name: 'Pearl Index (Contraceptive Failure Rate)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'robinson-crl-dating',  name: 'Robinson-Fleming CRL Dating',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'carpreg-ii',           name: 'CARPREG II Cardiac Risk in Pregnancy',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'malinas-score',        name: 'Malinas Score (Imminent Delivery)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v251: cardiometabolic formulas. lib/cardiometab-v251.js, RV251. Each
  // verified absent (spec-v85 6.2, incl. MCP adapters); each computes a value, none
  // diagnoses or orders (spec-v11 5.3). Formulas >= 2-source verified (spec-v97).
  { id: 'corrected-timi-frame-count', name: 'Corrected TIMI Frame Count (cTFC)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tpe-qt-ratio',         name: 'Tp-e/QT Ratio',                                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'spise',                name: 'SPISE (Insulin Sensitivity Estimator)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'atherogenic-index-of-plasma', name: 'Atherogenic Index of Plasma (AIP)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v252: orthopedic / spine radiographic ratios. lib/orthospine-v252.js,
  // RV252. Each verified absent (spec-v85 6.2, incl. MCP adapters); each computes a
  // ratio/grade/score, none diagnoses or orders (spec-v11 5.3). Ratios/scores
  // >= 2-source verified (spec-v97).
  { id: 'insall-salvati-ratio', name: 'Insall-Salvati Ratio (Patellar Height)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'torg-pavlov-ratio',    name: 'Torg-Pavlov Ratio (Cervical Stenosis)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'meyerding-spondylolisthesis', name: 'Meyerding Spondylolisthesis Grade',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'beighton-hypermobility', name: 'Beighton Hypermobility Score',                    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v253: radiologic measurements & scores. lib/radmeasure-v253.js, RV253. Each
  // verified absent (spec-v85 6.2, incl. MCP adapters); each computes a percentage/
  // score/grade/volume, none diagnoses or orders (spec-v11 5.3). Formulas/point
  // systems >= 2-source verified (spec-v97).
  { id: 'nascet-carotid-stenosis', name: 'NASCET Carotid Stenosis',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'helsinki-ct-score',    name: 'Helsinki CT Score (TBI)',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'genant-vertebral-fracture', name: 'Genant Vertebral Fracture Grade',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'testicular-volume',    name: 'Testicular Volume (Lambert)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v254: ENT / urology / psychiatry screening tools. lib/enturopsych-v254.js,
  // RV254. Each verified absent (spec-v85 6.2, incl. MCP adapters); each scores/
  // grades/computes a value, none diagnoses or orders (spec-v11 5.3). Point systems
  // >= 2-source verified (spec-v97).
  { id: 'reflux-symptom-index', name: 'Reflux Symptom Index (RSI)',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lund-mackay',          name: 'Lund-Mackay CT Sinus Score',                       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bladder-outlet-obstruction-index', name: 'Bladder Outlet Obstruction Index (BOOI)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fagerstrom-ftnd',      name: 'Fagerstrom Nicotine Dependence (FTND)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
];

const UTIL_BY_ID = new Map(UTILITIES.map((u) => [u.id, u]));

const CLINICAL_NOTICE_TEXT =
  'This is a math aid for verification. Institutional protocols and clinician judgment govern any clinical decision.';

// spec-v29 wave 29-2: tiles deleted from UTILITIES whose permalink
// hashes still resolve. The router sends them to the home view with a
// one-line removed-note (spec-v29 sec 2.7). The map carries the
// per-group note text so the explanation matches the deletion bucket.
const REMOVED_V29_IDS = new Map([
  // Group A (wave 29-2 Group A PR): 19 code-reference lookups.
  ...[
    'icd10', 'hcpcs', 'cpt', 'ndc', 'pos-codes', 'modifier-codes',
    'revenue-codes', 'carc', 'rarc', 'hcpcs-mod', 'pos-lookup',
    'tob-decode', 'rev-table', 'nubc-codes', 'drg-lookup', 'apc-lookup',
    'pcs-lookup', 'rxnorm-lookup', 'ndc-rxnorm',
  ].map((id) => [id, 'This tool is no longer available. Use the upstream code source (CMS, FDA, NUBC, AMA, X12) or your EHR\'s lookup.']),
  // Group C / L (wave 29-2 Group C/L PR): 15 patient-literacy and
  // form-locator / glossary tiles.
  ...[
    'decoder', 'insurance', 'eob-decoder', 'no-surprises',
    'insurance-card', 'abn-explainer', 'msn-decoder', 'idr-eligibility',
    'birthday-rule', 'cobra-timeline', 'medicare-enrollment', 'aca-sep',
    'cms1500', 'ub04', 'eob-glossary',
  ].map((id) => [id, 'This tool is no longer available. The workflow generators (appeal letter, HIPAA Right of Access) remain; the static decoders and eligibility infographics are out.']),
  // Group I (wave 29-2 Group I PR): 10 field-medicine reference cards.
  ...[
    'adult-arrest-ref', 'peds-arrest-ref', 'defib', 'toxidromes',
    'dot-erg', 'niosh-pg', 'cpr-numeric', 'tccc', 'hypothermia',
    'heat-illness',
  ].map((id) => [id, 'This tool is no longer available. Use the AHA wallet card, PHMSA ERG, NIOSH Pocket Guide, or your protocol app. The field-medicine calculators (peds-weight-dose, burn-fluid, naloxone, NEXUS, START triage, etc.) remain.']),
  // Group K / O (wave 29-2 Group K/O PR): 8 reference-range and
  // wallet-card tiles.
  ...[
    'lab-ranges', 'lab-adult', 'lab-peds', 'tdm-levels', 'tox-levels',
    'high-alert', 'high-alert-card', 'iv-to-po',
  ].map((id) => [id, 'This tool is no longer available. Use your institution\'s lab reference ranges, the ISMP high-alert list, or your formulary. The calculators that consume these thresholds inside their math (e.g. lab-interpret, NEWS2, abx-renal) remain.']),
  // Group G non-scores (wave 29-2 Group G PR): 5 single-class clinical
  // reference tiles (Beers, peds-vitals, ASA, Mallampati, mRS). The
  // scoring tiles in Group G (NIHSS, CHA2DS2-VASc, Wells, etc.) remain.
  ...[
    'beers', 'peds-vitals', 'asa', 'mallampati', 'mrs',
  ].map((id) => [id, 'This tool is no longer available. Use the upstream source (AGS Beers Criteria, PALS reference table, ASA Physical Status statement, the original Mallampati or Modified Rankin Scale publication) or your protocol. The scoring calculators (NIHSS, CHA2DS2-VASc, Wells, GRACE, HEART, etc.) remain.']),
]);

// ----- DOM helpers ---------------------------------------------------------

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      const value = attrs[key];
      if (value === false || value === null || value === undefined) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('data-')) node.setAttribute(key, value);
      else if (key.startsWith('aria-')) node.setAttribute(key, value);
      else if (key === 'href' || key === 'type' || key === 'role' || key === 'id' || key === 'for') node.setAttribute(key, value);
      else node.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// ----- Filter state --------------------------------------------------------

// spec-v29 §5.3: Nurse is the default-selected audience chip on first visit
// (nurse-first pivot). URL-hash persists divergence from this default.
const filterState = { audience: 'nurse' };


// spec-v29 §5.3: chips and back-end audience tokens are decoupled, but the
// prompt-ranker and synonym matcher still want a single audience hint per
// query. Map the active chip to its closest back-end audience tag.
const CHIP_TO_AUDIENCE_HINT = {
  all: 'all',
  nurse: 'clinicians',
  doctor: 'clinicians',
  pharmacist: 'clinicians',
  rt: 'clinicians',
  ems: 'field',
  'biller-coder': 'billers',
  educator: 'educators',
};




// spec-v11 §4.1: visible specialty / category labels. The letter is the
// legacy id retained inside UTILITIES entries so deep links keep working;
// the label is the visible name everywhere a user sees it.
const GROUP_LABELS = {
  A: 'Billing & Coding',
  // spec-v77 §3: the computational reimbursement/payment/edit group.
  B: 'Billing & Reimbursement',
  C: 'Insurance & Patient Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Risk',
  H: 'Workflow & Documentation',
  I: 'EMS & Field Medicine',
  J: 'Immunization & Infectious Disease',
  K: 'Reference Ranges',
  L: 'Insurance Glossary',
  M: 'State & Coverage Reference',
  N: 'Pediatrics & Neonatal',
  O: 'High-Alert & Safety',
  // spec-v52 §10.1: new top-level group for revenue-cycle / utilization
  // tiles. Ships with one tile (pa-lint) at v52-1b close.
  P: 'Revenue cycle & utilization',
};



// spec-v7 §3.2: in-memory cache of the loaded synonym table. Empty until
// loadSynonyms() resolves the curated synonym table at boot. Until it lands,
// SYNONYM_ENTRIES is empty and resolvePrompt() ranks on name/id tokens only, so
// the hero search degrades gracefully (synonyms are an accelerator, not a hard
// dependency).
let SYNONYM_ENTRIES = [];

// spec-v8 §4.3: assemble the tile corpus the synonym resolver reads.
// id / name / group / audiences come from UTILITIES; tags + specialties from
// META[id]. The per-tile description was scraped from the home tile-grid before
// spec-v51/v53 removed that grid, so desc is now empty -- the resolver ranks on
// name / id / tags / specialties, which is enough for synonym + token matching.
let TILE_CORPUS_CACHE = null;
function tileCorpus() {
  if (TILE_CORPUS_CACHE) return TILE_CORPUS_CACHE;
  TILE_CORPUS_CACHE = UTILITIES.map((u) => ({
    id: u.id,
    name: u.name,
    group: u.group,
    audiences: u.audiences || [],
    desc: '',
    tags: (META[u.id] && Array.isArray(META[u.id].tags)) ? META[u.id].tags : [],
    // spec-v11 §4.3: optional specialty tags, additive search tokens.
    specialties: (META[u.id] && Array.isArray(META[u.id].specialties)) ? META[u.id].specialties : [],
  }));
  return TILE_CORPUS_CACHE;
}

function audienceHint() {
  return CHIP_TO_AUDIENCE_HINT[filterState.audience] || 'all';
}




// ----- Routing -------------------------------------------------------------

const HOME_VIEW_HTML_ID = 'home-view-marker';

function getMain() {
  return document.getElementById('main');
}

// spec-v74: the "Skip to content" link targets #main, but this is a hash-routed
// SPA -- a bare href="#main" sets location.hash, the router reads route "main",
// finds no such tile, and calls restoreHome(). So on any tile the skip link
// ejected the user back to the home view (and focus landed on <body>, not the
// content) -- a WCAG 2.4.1 (Bypass Blocks) failure, worse than a no-op. Static
// pre-rendered pages don't load app.js, so their native #main anchor is fine;
// this handler scopes the fix to the SPA: move focus to the main landmark
// without touching the hash or the router.
function bindSkipLink() {
  const link = document.querySelector('.skip-link');
  if (!link) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const main = getMain();
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
}

let homeViewSnapshot = null;

function captureHomeSnapshot() {
  const main = getMain();
  if (!main || homeViewSnapshot) return;
  homeViewSnapshot = main.cloneNode(true);
  homeViewSnapshot.id = HOME_VIEW_HTML_ID;
}

function restoreHome() {
  const main = getMain();
  if (!main || !homeViewSnapshot) return;
  clear(main);
  const fresh = homeViewSnapshot.cloneNode(true);
  while (fresh.firstChild) main.appendChild(fresh.firstChild);
  // The home view is restored from a cloned snapshot, so the hero combobox
  // loses its event listeners -- re-bind them. The clone ships an empty input.
  bindHeroSearch();
  document.title = 'Sophie Well';
}

// spec-v2 section 4.3: hash-based calculator input state. After a tool body
// is rendered, populate inputs from `q=...` and start writing changes back.
function applyHashState(body) {
  const { state } = parseHash(window.location.hash);
  if (!state || Object.keys(state).length === 0) return;
  for (const [k, v] of Object.entries(state)) {
    const node = body.querySelector(`#${CSS.escape(k)}`) || document.getElementById(k);
    if (!node) continue;
    if (node.tagName === 'SELECT') node.value = v;
    else if (node.type === 'checkbox') node.checked = v === '1' || v === 'true';
    else node.value = v;
    const evt = node.tagName === 'SELECT' ? 'change' : (node.type === 'checkbox' ? 'change' : 'input');
    node.dispatchEvent(new Event(evt, { bubbles: true }));
  }
}

function trackHashState(body) {
  // Coalesce bursts of input/change events into a single replaceState call.
  // Restoration helpers (applyHashState, applyExample) dispatch one event per
  // field, which on a multi-field tile would otherwise produce N replaceState
  // calls back-to-back. WebKit caps replaceState at 100 calls per 10 seconds
  // across the page, so an unthrottled writer trips the limit when a test
  // walks every tool route in sequence. Also no-op when the produced hash
  // already matches the current one to avoid redundant history churn.
  let scheduled = false;
  const writeState = () => {
    if (scheduled) return;
    scheduled = true;
    const flush = () => {
      scheduled = false;
      const state = {};
      body.querySelectorAll('input, select, textarea').forEach((node) => {
        if (!node.id) return;
        // Skip ephemeral pieces (search boxes inside lookup tools, the bill
        // textarea, free-text fields with no semantic meaning).
        if (node.tagName === 'TEXTAREA') return;
        if (node.type === 'checkbox') {
          if (node.checked) state[node.id] = '1';
        } else if (node.value !== '' && node.value != null) {
          state[node.id] = String(node.value);
        }
      });
      const nextHash = patchHash({ state });
      if (nextHash !== window.location.hash) {
        window.history.replaceState(null, '', nextHash);
      }
    };
    if (typeof queueMicrotask === 'function') queueMicrotask(flush);
    else Promise.resolve().then(flush);
  };
  body.addEventListener('input', writeState);
  body.addEventListener('change', writeState);
}

// Append `str` to `parent`, turning any bare https:// URL it contains into
// a real clickable, privacy-safe anchor. The text is author-controlled
// (lib/meta.js citation strings), not user input, and every anchor is built
// with createElement + textContent (no raw-markup assignment) so the strict
// CSP and no-XSS posture hold. rel="noopener noreferrer" + the global
// no-referrer meta keep the outbound click from leaking where the reader
// came from.
function appendLinkified(parent, str) {
  const re = /https?:\/\/[^\s)]+/g;
  let last = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parent.appendChild(document.createTextNode(str.slice(last, m.index)));
    // Trailing sentence punctuation should stay as text, not part of the URL.
    let url = m[0];
    let trail = '';
    while (url && /[.,;]$/.test(url)) { trail = url.slice(-1) + trail; url = url.slice(0, -1); }
    parent.appendChild(el('a', {
      class: 'citation-inline-link', href: url, target: '_blank', rel: 'noopener noreferrer', text: url,
    }));
    if (trail) parent.appendChild(document.createTextNode(trail));
    last = m.index + m[0].length;
  }
  if (last < str.length) parent.appendChild(document.createTextNode(str.slice(last)));
}

// spec-v9 §3.2: the meta block now renders as the per-tile References
// region below the tool body. It carries the citation, the dataset stamp
// (when present), a "Reset to example" link (when an example is defined),
// and the universal "Copy all" affordance.
function renderMetaBlock(util) {
  const meta = META[util.id];
  if (!meta) return null;
  const block = el('section', { class: 'tool-meta', 'aria-label': 'References' });

  if (meta.citation) {
    // Inline + detailed citation, with links where possible: bare URLs in
    // the citation text become clickable, and an optional structured
    // `citationUrl` (a permanent DOI or the publisher's canonical page)
    // renders as an explicit "Read the source" link after the reference.
    const p = el('p', { class: 'citation' });
    p.appendChild(document.createTextNode('Citation: '));
    appendLinkified(p, meta.citation);
    if (meta.citationUrl) {
      p.appendChild(document.createTextNode(' '));
      p.appendChild(el('a', {
        class: 'citation-link',
        href: meta.citationUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: 'Read the source ↗',
      }));
    }
    block.appendChild(p);
  }

  // spec-v11 §5: optional per-band `interpretation` block. Renders below
  // the citation under a mandatory "Per source:" header so every word
  // shown is the source's, not Sophie's.
  if (meta.interpretation && Array.isArray(meta.interpretation.bands) && meta.interpretation.bands.length) {
    const interp = el('div', { class: 'interpretation', 'aria-label': 'Interpretation per source' });
    interp.appendChild(el('p', { class: 'interpretation-header', text: 'Per source:' }));
    const list = el('ul', { class: 'interpretation-bands' });
    for (const band of meta.interpretation.bands) {
      if (!band || !band.range || !band.text) continue;
      const item = el('li', { class: 'interpretation-band' });
      item.appendChild(el('span', { class: 'interpretation-range', text: String(band.range) }));
      item.appendChild(document.createTextNode(' - '));
      item.appendChild(el('span', { class: 'interpretation-text', text: String(band.text) }));
      list.appendChild(item);
    }
    interp.appendChild(list);
    block.appendChild(interp);
  }

  // spec-v62 §2 A2: optional source-anchored "next step" (action) block. Renders
  // beneath interpretation under its own "Recommended next step (per source):"
  // header. Every line is the governing publication's verbatim recommendation
  // (never an order Sophie generates), with the source named below.
  if (meta.actions && Array.isArray(meta.actions.bands) && meta.actions.bands.length) {
    const actions = el('div', { class: 'actions', 'aria-label': 'Recommended next step per source' });
    actions.appendChild(el('p', { class: 'actions-header', text: 'Recommended next step (per source):' }));
    const alist = el('ul', { class: 'actions-bands' });
    for (const band of meta.actions.bands) {
      if (!band || !band.range || !band.step) continue;
      const item = el('li', { class: 'actions-band' });
      item.appendChild(el('span', { class: 'actions-range', text: String(band.range) }));
      item.appendChild(document.createTextNode(' - '));
      item.appendChild(el('span', { class: 'actions-text', text: String(band.step) }));
      alist.appendChild(item);
    }
    actions.appendChild(alist);
    if (meta.actions.source) actions.appendChild(el('p', { class: 'actions-source muted', text: `Source: ${meta.actions.source}` }));
    block.appendChild(actions);
  }

  if (meta.source) {
    const stamp = el('p', { class: 'source-stamp', text: `Source: ${meta.source.label} (loading version...)` });
    block.appendChild(stamp);
    fetchJson(`data/${meta.source.dataset}/manifest.json`).then((m) => {
      // When the dataset manifest carries a vetted sourceUrl (the agency's
      // canonical page, verified by the data pipeline), make the label a
      // clickable link so the citation points at its primary source.
      clear(stamp);
      stamp.appendChild(document.createTextNode('Source: '));
      if (m && m.sourceUrl) {
        stamp.appendChild(el('a', {
          class: 'source-link', href: m.sourceUrl, target: '_blank', rel: 'noopener noreferrer', text: meta.source.label,
        }));
      } else {
        stamp.appendChild(document.createTextNode(meta.source.label));
      }
      if (m && m.fetchDate) stamp.appendChild(document.createTextNode(`, fetched ${m.fetchDate}`));
    }).catch(() => {
      stamp.textContent = `Source: ${meta.source.label}`;
    });
  }

  if (meta.example) {
    const link = el('a', {
      href: '#',
      class: 'example-reset',
      text: 'Reset to example',
      'aria-label': 'Reset inputs to the example values',
    });
    const note = el('span', { class: 'example-expected muted' });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      applyExample(util);
      note.textContent = ` Expected: ${meta.example.expected}`;
    });
    block.appendChild(el('p', { class: 'example-row' }, [link, note]));
  }

  // spec-v61 §2 A2: related-tool linking. `META[id].related` lists sibling
  // tile ids; render each that resolves to a real, in-catalog tile as a hash
  // link so a nurse on `wells-pe` is one click from `perc` / `pesi`. Unknown
  // ids are silently skipped (the related-tools unit test pins that every
  // declared id resolves, so this is defensive, not a feature).
  if (Array.isArray(meta.related) && meta.related.length) {
    const seen = new Set();
    const links = [];
    for (const rid of meta.related) {
      if (rid === util.id || seen.has(rid)) continue;
      const target = UTILITIES.find((u) => u.id === rid);
      if (!target) continue;
      seen.add(rid);
      const a = el('a', { class: 'related-link', href: `#${rid}`, text: target.name });
      links.push(el('li', { class: 'related-item' }, [a]));
    }
    if (links.length) {
      const rel = el('nav', { class: 'related-tools', 'aria-label': 'Related tools' });
      rel.appendChild(el('p', { class: 'related-header', text: 'Related tools:' }));
      rel.appendChild(el('ul', { class: 'related-list' }, links));
      block.appendChild(rel);
    }
  }

  // spec-v2 section 3.2: a single "Copy all" button that grabs whatever the
  // results region currently shows. Per-result copy buttons live in the
  // utility renderers; this is the universal fallback. spec-v61 §2 A5: a
  // sibling "Copy link" button copies the deep link (hash-state already
  // encodes the inputs), so a populated calculation can be handed to a
  // colleague. No new persistence, no network.
  const copyLive = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
  const copyAllBtn = copyButton(() => {
    const res = document.getElementById('q-results') || document.getElementById('tool-body');
    return res ? (res.innerText || res.textContent || '') : '';
  }, { label: 'Copy all', live: copyLive });
  const copyLinkBtn = copyButton(() => location.href, { label: 'Copy link', live: copyLive });
  block.appendChild(el('p', { class: 'copy-row' }, [copyAllBtn, copyLinkBtn, copyLive]));

  // spec-v61 §2 A7: opt-in, client-only input persistence. Only shown on tiles
  // that actually have persistable (numeric/choice) inputs. Off by default;
  // checking it stores this tile's current values immediately, unchecking it
  // erases everything stored. No PHI free-text is ever persisted (see
  // lib/input-persist.js), and nothing leaves the device.
  const toolBody = document.getElementById('tool-body');
  if (toolBody && hasPersistableInputs(toolBody)) {
    const cb = el('input', { type: 'checkbox', class: 'remember-checkbox' });
    cb.checked = isRememberEnabled();
    cb.addEventListener('change', () => {
      setRememberEnabled(cb.checked);
      const tb = document.getElementById('tool-body');
      if (cb.checked && tb) saveInputs(util.id, tb);
    });
    const label = el('label', { class: 'remember-row' }, [
      cb,
      el('span', { class: 'remember-text', text: 'Remember my inputs on this device' }),
    ]);
    const note = el('span', {
      class: 'remember-note muted',
      text: 'Stored only in this browser. Numbers only, never free-text. Off by default; unchecking erases it.',
    });
    block.appendChild(el('p', { class: 'remember-line' }, [label, note]));
  }

  return block.children.length ? block : null;
}

// spec-v9 §3.3: fill a tile's inputs from META[id].example. Returns the set
// of input IDs that were filled so callers can avoid clobbering values that
// hash-state already set.
function applyExample(util, { skip } = {}) {
  const meta = META[util.id];
  if (!meta || !meta.example || !meta.example.fields) return new Set();
  const filled = new Set();
  for (const [id, value] of Object.entries(meta.example.fields)) {
    if (skip && skip.has(id)) continue;
    const node = document.getElementById(id);
    if (!node) continue;
    if (node.tagName === 'SELECT') node.value = value;
    else if (node.type === 'checkbox') node.checked = value === '1' || value === true || value === 'true';
    else node.value = value;
    // Dispatch both 'input' and 'change' so renderers wired to either
    // event re-run. Several renderers listen only to one or the other.
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
    filled.add(id);
  }
  return filled;
}

// spec-v9 §3.3: append a muted "(example: <value>)" annotation next to the
// label of an input that was pre-filled from META[id].example. Renderers
// that pair each input with a <label for="id"> get the annotation
// automatically; ad-hoc renderers can call this helper from view code.
export function annotateExample(id, value) {
  const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
  if (!label) return;
  if (label.querySelector('.example-hint')) return;
  label.appendChild(
    el('span', { class: 'example-hint muted', text: ` (example: ${value})` })
  );
}

function renderToolView(util) {
  const main = getMain();
  if (!main) return;
  clear(main);

  // Breadcrumb (replaces the old "Back to tools" paragraph).
  const breadcrumbBack = el('button', {
    type: 'button',
    class: 'breadcrumb-back',
    'aria-label': 'Back to all tools',
    text: '← All tools',
  });
  breadcrumbBack.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#/';
  });
  const trail = el('span', { class: 'breadcrumb-trail' }, [
    el('span', { class: 'bc-group', text: GROUP_LABELS[util.group] || util.group }),
    el('span', { 'aria-hidden': 'true', text: ' / ' }),
    el('span', { class: 'bc-current', text: util.name }),
  ]);
  main.appendChild(el('div', { class: 'breadcrumb' }, [breadcrumbBack, trail]));

  // Use <section>, not <main>, so we don't nest a <main> inside <main id="main">
  // (HTML disallows multiple main landmarks; some screen readers also get
  // confused). The .content class still gets the encryptalotta panel chrome.
  const content = el('section', { class: 'content', 'aria-label': util.name });
  content.appendChild(el('h1', { text: util.name }));

  if (util.clinical && util.group !== 'I') {
    content.appendChild(
      el('p', { class: 'clinical-notice', role: 'note', text: CLINICAL_NOTICE_TEXT })
    );
  }

  // spec-v9 §3.2: tile regions render in the order title -> description ->
  // inputs -> references. The meta block (References) is appended *after*
  // the tool body, not above it.
  const body = el('div', { id: 'tool-body', class: 'tool-body' });
  content.appendChild(body);

  // Attach to the live DOM before invoking the renderer. Several renderers
  // call document.getElementById on inputs they just appended, which only
  // works once `body` is part of the document.
  main.appendChild(content);

  const renderer = RENDERERS[util.id];
  if (renderer) {
    try {
      renderer(body);
      // spec-v9 §3.3: pre-fill META[id].example after the renderer mounts,
      // but let URL-hash state win (deep links keep their values).
      Promise.resolve().then(() => {
        applyHashState(body);
        trackHashState(body);
        const hashKeys = new Set(Object.keys(parseHash(window.location.hash).state || {}));
        // spec-v61 §2 A7: opt-in remembered inputs fill fields the deep link
        // didn't set, and win over the example. The save listeners are always
        // attached; saveInputs() no-ops unless the toggle is on, so flipping
        // it on mid-session starts persisting from the next edit.
        const remembered = applySavedInputs(body, util.id, hashKeys);
        const save = () => saveInputs(util.id, body);
        body.addEventListener('input', save);
        body.addEventListener('change', save);
        const filled = applyExample(util, { skip: new Set([...hashKeys, ...remembered]) });
        const meta = META[util.id];
        if (meta && meta.example && meta.example.fields) {
          for (const [id, value] of Object.entries(meta.example.fields)) {
            if (filled.has(id)) annotateExample(id, value);
          }
        }
      });
    } catch (err) {
      console.error(`[sophiewell] renderer threw for tool "${util.id}":`, err);
      body.appendChild(el('p', { class: 'muted', text: `Error rendering tool: ${err.message}` }));
    }
  } else {
    console.warn(`[sophiewell] no renderer registered for tool "${util.id}"  -  showing coming-soon placeholder`);
    body.appendChild(
      el('p', {
        class: 'tool-description',
        text: 'This tool is coming soon. The data and renderer for this calculator are still being prepared.',
      })
    );
  }

  const metaBlock = renderMetaBlock(util);
  if (metaBlock) content.appendChild(metaBlock);
  document.title = util.name + ' | Sophie Well';

  // Always reset scroll so the new view is visible.
  window.scrollTo({ top: 0, behavior: 'auto' });

  // Move focus to the heading for screen reader users.
  const h1 = content.querySelector('h1');
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }
}

let currentRouteId = null;

function route() {
  const parsed = parseHash(window.location.hash);
  const id = parsed.route;
  if (!id) {
    currentRouteId = null;
    restoreHome();
    return;
  }
  const util = UTIL_BY_ID.get(id);
  if (util) {
    if (currentRouteId !== id) {
      currentRouteId = id;
      renderToolView(util);
    }
  } else {
    currentRouteId = null;
    restoreHome();
    // spec-v29 wave 29-2: removed-tile hashes show a one-line note above
    // the home view. The note is inserted on every navigation so that
    // following a removed-tile permalink always surfaces the explanation.
    if (REMOVED_V29_IDS.has(id)) {
      const main = getMain();
      if (main) {
        const note = el('p', {
          class: 'deprecation-notice',
          role: 'note',
          'aria-label': 'Removed tile',
          text: REMOVED_V29_IDS.get(id),
        });
        main.insertBefore(note, main.firstChild);
      }
    }
  }
}

// ----- Topbar search (typeahead -> direct navigation) ---------------------

function scoreUtility(util, tokens) {
  const name = util.name.toLowerCase();
  const id = util.id.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    const inName = name.indexOf(t);
    const inId = id.indexOf(t);
    if (inName === -1 && inId === -1) return -1;
    if (name === t || id === t) score += 1000;
    if (inName === 0) score += 200;
    else if (inName > 0) score += Math.max(40 - inName, 5);
    if (inId === 0) score += 120;
    else if (inId > 0) score += 30;
    if (new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(util.name)) score += 60;
  }
  return score;
}

function searchUtilities(query, limit) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const ranked = [];
  for (const util of UTILITIES) {
    const s = scoreUtility(util, tokens);
    if (s >= 0) ranked.push({ util, score: s });
  }
  ranked.sort((a, b) => b.score - a.score || a.util.name.localeCompare(b.util.name));
  return ranked.slice(0, limit).map((r) => r.util);
}


// spec-v53: the home-view search combobox. Mirrors the topbar search, with
// one difference: focusing the empty input lists the entire catalog A-Z so
// the bar doubles as the "browse all tools" affordance the retired
// tool-picker <select> used to provide. Typing narrows to the ranked top
// matches; click / Enter routes to the tile.
let heroSearchDocClickBound = false;
function bindHeroSearch() {
  const input = document.getElementById('hero-search');
  const list = document.getElementById('hero-search-results');
  if (!input || !list) return;

  let activeIndex = -1;
  let currentMatches = [];
  const ALL = UTILITIES.slice().sort((a, b) => a.name.localeCompare(b.name));

  function setExpanded(open) {
    input.setAttribute('aria-expanded', open ? 'true' : 'false');
    list.hidden = !open;
  }

  function setActive(idx) {
    const items = list.querySelectorAll('.hero-search-result');
    items.forEach((node, i) => {
      const on = i === idx;
      node.classList.toggle('is-active', on);
      node.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) {
        input.setAttribute('aria-activedescendant', node.id);
        node.scrollIntoView({ block: 'nearest' });
      }
    });
    if (idx === -1) input.removeAttribute('aria-activedescendant');
    activeIndex = idx;
  }

  function navigateTo(util) {
    if (!util) return;
    input.value = '';
    currentMatches = [];
    clear(list);
    setExpanded(false);
    setActive(-1);
    input.blur();
    if (location.hash === '#' + util.id) {
      currentRouteId = null;
      route();
    } else {
      location.hash = '#' + util.id;
    }
  }

  // Empty query (e.g. on focus) lists the whole catalog A-Z; a typed query
  // returns the ranked top matches.
  function matchesFor(query) {
    const q = query.trim();
    if (!q) return ALL;
    const ranked = searchUtilities(q, 12);
    // spec-v7 §3.2: searchUtilities ranks on name/id only and is blind to the
    // curated synonym table and patient phrasing, so a query like "they denied
    // it" -> appeal-letter or "kidney function" -> egfr (which share no token
    // with the tile name) returned nothing useful or the wrong tile. Consult
    // resolvePrompt() (synonyms -> token ranker -> one-edit retry) and surface
    // its single best tile first so patient-mental-model queries resolve to the
    // right tool. resolvePrompt returns null below its threshold, so a
    // non-matching query simply falls back to the name/id ranking.
    const r = resolvePrompt(q, tileCorpus(), SYNONYM_ENTRIES, audienceHint());
    if (r && r.tileId && UTIL_BY_ID) {
      const u = UTIL_BY_ID.get(r.tileId);
      if (u) return [u, ...ranked.filter((x) => x.id !== u.id)].slice(0, 12);
    }
    return ranked;
  }

  function render(query) {
    clear(list);
    currentMatches = matchesFor(query);
    if (currentMatches.length === 0) {
      list.appendChild(el('li', { class: 'hero-search-empty', role: 'presentation', text: 'No tools match.' }));
      setExpanded(true);
      setActive(-1);
      return;
    }
    currentMatches.forEach((util, i) => {
      const item = el('li', {
        class: 'hero-search-result',
        role: 'option',
        id: `hero-search-result-${i}`,
        'data-tool': util.id,
        'aria-selected': 'false',
      }, [
        el('span', { class: 'hsr-name', text: util.name }),
        el('span', { class: 'hsr-group', text: GROUP_LABELS[util.group] || util.group }),
      ]);
      // mousedown so the route fires before the input-blur close handler.
      item.addEventListener('mousedown', (e) => { e.preventDefault(); navigateTo(util); });
      item.addEventListener('mouseenter', () => setActive(i));
      list.appendChild(item);
    });
    setExpanded(true);
    setActive(0);
  }

  input.addEventListener('focus', () => render(input.value));
  input.addEventListener('input', () => render(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      if (!currentMatches.length) return;
      setActive((activeIndex + 1) % currentMatches.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      if (!currentMatches.length) return;
      setActive((activeIndex - 1 + currentMatches.length) % currentMatches.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentMatches[activeIndex]) {
        e.preventDefault();
        navigateTo(currentMatches[activeIndex]);
      } else if (currentMatches[0]) {
        e.preventDefault();
        navigateTo(currentMatches[0]);
      }
    } else if (e.key === 'Escape') {
      if (input.value || !list.hidden) {
        input.value = '';
        clear(list);
        currentMatches = [];
        setExpanded(false);
        setActive(-1);
        e.preventDefault();
      }
    }
  });

  // Close on an outside click. Bound once at the document level (the hero
  // element itself is replaced on each restoreHome clone, so the handler
  // re-queries the live nodes by id rather than closing over them).
  if (!heroSearchDocClickBound) {
    heroSearchDocClickBound = true;
    document.addEventListener('click', (e) => {
      const inp = document.getElementById('hero-search');
      const lst = document.getElementById('hero-search-results');
      if (!inp || !lst) return;
      if (e.target === inp || lst.contains(e.target)) return;
      inp.setAttribute('aria-expanded', 'false');
      lst.hidden = true;
    });
  }
}

// ----- Service worker registration ----------------------------------------

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const isHttps = window.location.protocol === 'https:';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isHttps && !isLocal) return;
  // The service worker file is added in step 6.
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Silent: offline support is best-effort.
  });
}

// ----- Boot ----------------------------------------------------------------

function boot() {
  captureHomeSnapshot();
  // spec-v29 §5.3: a deep-linked #a=<audience> overrides the nurse-first
  // default and biases the synonym resolver's audience hint. The chip-filter
  // UI was removed in spec-v51/v53, so this only reads the hash now.
  const initial = parseHash(window.location.hash);
  if (initial.audience) filterState.audience = initial.audience;
  bindHeroSearch();
  bindSkipLink();
  installKeyboard();
  // spec-v7 §3.2: load the synonym table once at boot. Hero search degrades
  // to fuzzy-only if the fetch fails (e.g., file:// load); synonyms are an
  // optional accelerator, not a hard dependency.
  loadSynonyms().then((entries) => { SYNONYM_ENTRIES = entries; }).catch(() => {});
  window.addEventListener('hashchange', route);
  route();
  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export { UTILITIES, UTIL_BY_ID };
