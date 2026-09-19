// spec-v1395: reportable disease -- report now or later? (California, Texas, New York, New Jersey.)
//
// Sources, read 2026-09-19, transcribed from each state's PDF (never a summary):
//   CA: Title 17 CCR 2500 list, CDPH, "ReportableDiseases_June2025.pdf" (94 conditions). Urgency per
//     2500(h)-(i): report immediately by telephone; by telephone within one working day; by electronic
//     transmission (including fax), telephone, or mail within one working day; foodborne disease
//     immediately by telephone when two or more cases from separate households share a suspected
//     source; all others within seven calendar days. Report to the local health officer where the
//     patient resides. HIV at all stages is also reportable within seven calendar days under 2641.5-2643.20.
//   TX: DSHS "Texas Notifiable Conditions - 2026", E59-11364 (Rev. 01/01/26), expires 12/31/26 (89
//     conditions). Report to the local or regional health department; the 24/7 number for immediately
//     reportable conditions is 1-800-705-8868. Conditions marked with an asterisk have their own
//     reporting route in the footnotes.
//   Texas reissues its list every January; the ledger row falls due each January.
//
// "Within one working day" is read here as the same clock time on the next working day of that state
// (its legal-holiday calendar), which is the earliest reading.
//
//   NY: NYSDOH "Communicable Disease Reporting Requirements" (#8218, 08/26), the instructions for form
//     DOH-389, read 2026-09-19 (health.ny.gov serves it to a browser user agent). Diseases printed in
//     red bold "should be reported immediately to local health departments by phone"; the colors were
//     read from the PDF's text colors, not guessed. 10 NYCRR 2.10 (Cornell LII): every other listed
//     disease within 24 hours of first seeing the case, to the health officer where the patient
//     lives. Footnotes kept: an animal bite -- notify the local health department BEFORE starting
//     rabies prophylaxis; syphilis -- by phone for a nontreponemal titer of 1:16 or more, any positive
//     prenatal or delivery test, or primary or secondary stage, otherwise by mail; Creutzfeldt-Jakob
//     disease and other TSEs -- to the State Alzheimer's Disease and Other Dementias Registry on
//     suspicion; HIV and AIDS -- on form DOH-4189. Two entries the form marks "proposed addition to
//     list" are labeled so. New York City residents are reported to the NYC Health Department.
//   NJ: NJDOH "Communicable Disease Reporting Requirements for Health Care Professionals &
//     Administrators, N.J.A.C. 8:57-2.2-2.4" (January 2026; nj.gov/health/cd/reporting), read
//     2026-09-19. Two classes: report IMMEDIATELY by telephone (suspected and confirmed), and by the
//     NEXT BUSINESS DAY to the local health department by electronic case report (eCR) or CDRSS.
//     Chlamydia, influenza other than pediatric deaths, and Lyme disease are reportable by eCR only.
//     Sexually transmitted diseases and tuberculosis go to NJDOH via CDRSS; HIV to NJDOH via
//     electronic laboratory reporting. Report to the local health department where the case lives
//     (where the facility is, if unknown); NJDOH 609-826-5964, after hours 609-392-2020, only if the
//     local health department cannot be reached. The rule text itself (on LexisNexis) was not read;
//     this is the Department's own summary of it. Its single-asterisk footnote was not interpreted.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { stateOptions, parseDateTime, nextBusinessDay, parseDate, isBusinessDay, formatDeadline } from './state-calendar.js';

export const RC_VERIFIED = '2026-09-19';
export const RC_STATES = stateOptions(['CA', 'TX', 'NY', 'NJ']);
export const RC_EDITIONS = {
  CA: 'CDPH Title 17 CCR 2500 list, June 2025',
  TX: 'DSHS Texas Notifiable Conditions 2026 (Rev. 01/01/26, expires 12/31/26)',
  NY: 'NYSDOH Communicable Disease Reporting Requirements, #8218 (08/26), with 10 NYCRR 2.10',
  NJ: 'NJDOH Communicable Disease Reporting Requirements, N.J.A.C. 8:57-2.2-2.4 (January 2026)',
};
export const CA_CONDITIONS = [
  { value: 'ca-anaplasmosis', text: 'Anaplasmosis', cls: 'week' },
  { value: 'ca-anthrax-human-or-animal', text: 'Anthrax, human or animal', cls: 'immediate-phone' },
  { value: 'ca-any-unusual-disease-occurrence', text: 'Any unusual disease (occurrence)', cls: 'immediate-phone' },
  { value: 'ca-babesiosis', text: 'Babesiosis', cls: 'any-1wd' },
  { value: 'ca-botulism-infant-foodborne-wound-other', text: 'Botulism (infant, foodborne, wound, other)', cls: 'immediate-phone' },
  { value: 'ca-brucellosis-animal-except-brucella-canis', text: 'Brucellosis, animal (except Brucella canis)', cls: 'week' },
  { value: 'ca-brucellosis-human', text: 'Brucellosis, human', cls: 'any-1wd' },
  { value: 'ca-campylobacteriosis', text: 'Campylobacteriosis', cls: 'any-1wd' },
  { value: 'ca-candida-auris-colonization-or-infection', text: 'Candida auris, colonization or infection', cls: 'any-1wd' },
  { value: 'ca-chancroid', text: 'Chancroid', cls: 'week' },
  { value: 'ca-chickenpox-varicella-outbreaks-hospitalizations', text: 'Chickenpox (varicella): outbreaks, hospitalizations, and deaths', cls: 'any-1wd' },
  { value: 'ca-chikungunya-virus-infection', text: 'Chikungunya virus infection', cls: 'any-1wd' },
  { value: 'ca-cholera', text: 'Cholera', cls: 'immediate-phone' },
  { value: 'ca-ciguatera-fish-poisoning', text: 'Ciguatera fish poisoning', cls: 'immediate-phone' },
  { value: 'ca-coccidioidomycosis', text: 'Coccidioidomycosis', cls: 'week' },
  { value: 'ca-covid-19-hospitalizations-only', text: 'COVID-19 (hospitalizations only)', cls: 'any-1wd' },
  { value: 'ca-creutzfeldt-jakob-disease-and-other-tses', text: 'Creutzfeldt-Jakob disease and other TSEs', cls: 'week' },
  { value: 'ca-cronobacter-sakazakii-infection-in-an-infant-und', text: 'Cronobacter sakazakii infection in an infant under 1 year', cls: 'any-1wd' },
  { value: 'ca-cryptosporidiosis', text: 'Cryptosporidiosis', cls: 'any-1wd' },
  { value: 'ca-cyclosporiasis', text: 'Cyclosporiasis', cls: 'any-1wd' },
  { value: 'ca-cysticercosis-or-taeniasis', text: 'Cysticercosis or taeniasis', cls: 'week' },
  { value: 'ca-dengue-virus-infection', text: 'Dengue virus infection', cls: 'any-1wd' },
  { value: 'ca-diphtheria', text: 'Diphtheria', cls: 'immediate-phone' },
  { value: 'ca-domoic-acid-poisoning-amnesic-shellfish-poisonin', text: 'Domoic acid poisoning (amnesic shellfish poisoning)', cls: 'immediate-phone' },
  { value: 'ca-ehrlichiosis', text: 'Ehrlichiosis', cls: 'week' },
  { value: 'ca-encephalitis-specify-etiology', text: 'Encephalitis (specify etiology)', cls: 'any-1wd' },
  { value: 'ca-escherichia-coli-shiga-toxin-producing-stec-incl', text: 'Escherichia coli, Shiga toxin-producing (STEC), including O157', cls: 'any-1wd' },
  { value: 'ca-flavivirus-infection-of-undetermined-species', text: 'Flavivirus infection of undetermined species', cls: 'immediate-phone' },
  { value: 'ca-foodborne-disease', text: 'Foodborne disease', cls: 'foodborne' },
  { value: 'ca-giardiasis', text: 'Giardiasis', cls: 'week' },
  { value: 'ca-gonococcal-infections', text: 'Gonococcal infections', cls: 'week' },
  { value: 'ca-haemophilus-influenzae-invasive-disease', text: 'Haemophilus influenzae, invasive disease', cls: 'any-1wd' },
  { value: 'ca-hantavirus-infections', text: 'Hantavirus infections', cls: 'any-1wd' },
  { value: 'ca-hemolytic-uremic-syndrome', text: 'Hemolytic uremic syndrome', cls: 'any-1wd' },
  { value: 'ca-hepatitis-a-acute-infection', text: 'Hepatitis A, acute infection', cls: 'any-1wd' },
  { value: 'ca-hepatitis-b-acute-chronic-or-perinatal', text: 'Hepatitis B (acute, chronic, or perinatal)', cls: 'week' },
  { value: 'ca-hepatitis-c-acute-chronic-or-perinatal', text: 'Hepatitis C (acute, chronic, or perinatal)', cls: 'week' },
  { value: 'ca-hepatitis-d-acute-or-chronic', text: 'Hepatitis D (acute or chronic)', cls: 'week' },
  { value: 'ca-hepatitis-e-acute-infection', text: 'Hepatitis E, acute infection', cls: 'week' },
  { value: 'ca-hiv-infection-acute', text: 'HIV infection, acute', cls: 'phone-1wd' },
  { value: 'ca-hiv-infection-any-stage', text: 'HIV infection, any stage', cls: 'week' },
  { value: 'ca-hiv-infection-progression-to-stage-3-aids', text: 'HIV infection, progression to stage 3 (AIDS)', cls: 'week' },
  { value: 'ca-influenza-due-to-novel-strains-humans', text: 'Influenza due to novel strains (humans)', cls: 'immediate-phone' },
  { value: 'ca-influenza-associated-death-laboratory-confirmed', text: 'Influenza-associated death, laboratory-confirmed, under 18 years', cls: 'week' },
  { value: 'ca-legionellosis', text: 'Legionellosis', cls: 'any-1wd' },
  { value: 'ca-leprosy-hansen-disease', text: 'Leprosy (Hansen disease)', cls: 'week' },
  { value: 'ca-leptospirosis', text: 'Leptospirosis', cls: 'week' },
  { value: 'ca-listeriosis', text: 'Listeriosis', cls: 'any-1wd' },
  { value: 'ca-lyme-disease', text: 'Lyme disease', cls: 'week' },
  { value: 'ca-malaria', text: 'Malaria', cls: 'any-1wd' },
  { value: 'ca-measles-rubeola', text: 'Measles (rubeola)', cls: 'immediate-phone' },
  { value: 'ca-melioidosis', text: 'Melioidosis', cls: 'immediate-phone' },
  { value: 'ca-meningitis-specify-etiology', text: 'Meningitis (specify etiology)', cls: 'any-1wd' },
  { value: 'ca-middle-east-respiratory-syndrome-mers', text: 'Middle East respiratory syndrome (MERS)', cls: 'immediate-phone' },
  { value: 'ca-monkeypox-or-orthopox-virus-infection', text: 'Monkeypox or orthopox virus infection', cls: 'immediate-phone' },
  { value: 'ca-multisystem-inflammatory-syndrome-in-children-mi', text: 'Multisystem inflammatory syndrome in children (MIS-C)', cls: 'any-1wd' },
  { value: 'ca-mumps', text: 'Mumps', cls: 'week' },
  { value: 'ca-neisseria-meningitidis-invasive-disease', text: 'Neisseria meningitidis, invasive disease', cls: 'immediate-phone' },
  { value: 'ca-novel-coronavirus-infection', text: 'Novel coronavirus infection', cls: 'immediate-phone' },
  { value: 'ca-novel-virus-infection-with-pandemic-potential', text: 'Novel virus infection with pandemic potential', cls: 'immediate-phone' },
  { value: 'ca-outbreak-of-any-disease', text: 'Outbreak of any disease', cls: 'immediate-phone' },
  { value: 'ca-paralytic-shellfish-poisoning', text: 'Paralytic shellfish poisoning', cls: 'immediate-phone' },
  { value: 'ca-paratyphoid-fever', text: 'Paratyphoid fever', cls: 'any-1wd' },
  { value: 'ca-pertussis-whooping-cough', text: 'Pertussis (whooping cough)', cls: 'any-1wd' },
  { value: 'ca-plague-human-or-animal', text: 'Plague, human or animal', cls: 'immediate-phone' },
  { value: 'ca-poliovirus-infection', text: 'Poliovirus infection', cls: 'any-1wd' },
  { value: 'ca-psittacosis', text: 'Psittacosis', cls: 'any-1wd' },
  { value: 'ca-q-fever', text: 'Q fever', cls: 'any-1wd' },
  { value: 'ca-rabies-human-or-animal', text: 'Rabies, human or animal', cls: 'immediate-phone' },
  { value: 'ca-relapsing-fever', text: 'Relapsing fever', cls: 'any-1wd' },
  { value: 'ca-rickettsial-diseases-other-than-rocky-mountain-s', text: 'Rickettsial diseases other than Rocky Mountain spotted fever, including typhus', cls: 'week' },
  { value: 'ca-rocky-mountain-spotted-fever', text: 'Rocky Mountain spotted fever', cls: 'week' },
  { value: 'ca-rsv-associated-death-laboratory-confirmed-under', text: 'RSV-associated death, laboratory-confirmed, under 5 years', cls: 'week' },
  { value: 'ca-rubella-german-measles', text: 'Rubella (German measles)', cls: 'week' },
  { value: 'ca-rubella-syndrome-congenital', text: 'Rubella syndrome, congenital', cls: 'week' },
  { value: 'ca-salmonellosis-other-than-typhoid-fever', text: 'Salmonellosis (other than typhoid fever)', cls: 'any-1wd' },
  { value: 'ca-scombroid-fish-poisoning', text: 'Scombroid fish poisoning', cls: 'immediate-phone' },
  { value: 'ca-shiga-toxin-detected-in-feces', text: 'Shiga toxin (detected in feces)', cls: 'any-1wd' },
  { value: 'ca-shigellosis', text: 'Shigellosis', cls: 'any-1wd' },
  { value: 'ca-silicosis', text: 'Silicosis', cls: 'week' },
  { value: 'ca-smallpox-variola', text: 'Smallpox (variola)', cls: 'immediate-phone' },
  { value: 'ca-syphilis-all-stages-including-congenital', text: 'Syphilis (all stages, including congenital)', cls: 'any-1wd' },
  { value: 'ca-tetanus', text: 'Tetanus', cls: 'week' },
  { value: 'ca-trichinosis', text: 'Trichinosis', cls: 'any-1wd' },
  { value: 'ca-tuberculosis', text: 'Tuberculosis', cls: 'any-1wd' },
  { value: 'ca-tularemia-animal', text: 'Tularemia, animal', cls: 'week' },
  { value: 'ca-tularemia-human', text: 'Tularemia, human', cls: 'immediate-phone' },
  { value: 'ca-typhoid-fever-cases-and-carriers', text: 'Typhoid fever, cases and carriers', cls: 'any-1wd' },
  { value: 'ca-vibrio-infections', text: 'Vibrio infections', cls: 'any-1wd' },
  { value: 'ca-viral-hemorrhagic-fevers-human-or-animal', text: 'Viral hemorrhagic fevers, human or animal', cls: 'immediate-phone' },
  { value: 'ca-west-nile-virus-infection', text: 'West Nile virus infection', cls: 'any-1wd' },
  { value: 'ca-yellow-fever', text: 'Yellow fever', cls: 'any-1wd' },
  { value: 'ca-yersiniosis', text: 'Yersiniosis', cls: 'any-1wd' },
  { value: 'ca-zika-virus-infection', text: 'Zika virus infection', cls: 'any-1wd' },
];
export const TX_CONDITIONS = [
  { value: 'tx-acquired-immune-deficiency-syndrome-aids', text: 'Acquired immune deficiency syndrome (AIDS)', cls: 'week', own: true },
  { value: 'tx-amebic-meningitis-and-encephalitis', text: 'Amebic meningitis and encephalitis', cls: 'week' },
  { value: 'tx-anaplasmosis', text: 'Anaplasmosis', cls: 'week' },
  { value: 'tx-anthrax', text: 'Anthrax', cls: 'immediate' },
  { value: 'tx-arboviral-infections', text: 'Arboviral infections', cls: 'week' },
  { value: 'tx-asbestosis', text: 'Asbestosis', cls: 'week', own: true },
  { value: 'tx-ascariasis', text: 'Ascariasis', cls: 'week' },
  { value: 'tx-babesiosis', text: 'Babesiosis', cls: 'week' },
  { value: 'tx-botulism-adult-and-infant', text: 'Botulism (adult and infant)', cls: 'immediate' },
  { value: 'tx-brucellosis', text: 'Brucellosis', cls: '1wd' },
  { value: 'tx-campylobacteriosis', text: 'Campylobacteriosis', cls: 'week' },
  { value: 'tx-cancer', text: 'Cancer', cls: 'rules', own: true },
  { value: 'tx-candida-auris', text: 'Candida auris', cls: '1wd' },
  { value: 'tx-carbapenem-resistant-enterobacterales-cre', text: 'Carbapenem-resistant Enterobacterales (CRE)', cls: '1wd' },
  { value: 'tx-chagas-disease', text: 'Chagas disease', cls: 'week' },
  { value: 'tx-chancroid', text: 'Chancroid', cls: 'week', own: true },
  { value: 'tx-chickenpox-varicella', text: 'Chickenpox (varicella)', cls: 'week', own: true },
  { value: 'tx-chlamydia-trachomatis-infection', text: 'Chlamydia trachomatis infection', cls: 'week', own: true },
  { value: 'tx-contaminated-sharps-injury', text: 'Contaminated sharps injury', cls: 'month', own: true },
  { value: 'tx-controlled-substance-overdose', text: 'Controlled substance overdose', cls: 'immediate', own: true },
  { value: 'tx-coronavirus-novel', text: 'Coronavirus, novel', cls: 'immediate' },
  { value: 'tx-cronobacter-spp-in-infants-invasive', text: 'Cronobacter spp. in infants, invasive', cls: 'week' },
  { value: 'tx-cryptosporidiosis', text: 'Cryptosporidiosis', cls: 'week' },
  { value: 'tx-cyclosporiasis', text: 'Cyclosporiasis', cls: 'week' },
  { value: 'tx-cysticercosis', text: 'Cysticercosis', cls: 'week' },
  { value: 'tx-diphtheria', text: 'Diphtheria', cls: 'immediate' },
  { value: 'tx-drowning-near-drowning', text: 'Drowning/near drowning', cls: '10wd', own: true },
  { value: 'tx-echinococcosis', text: 'Echinococcosis', cls: 'week' },
  { value: 'tx-ehrlichiosis', text: 'Ehrlichiosis', cls: 'week' },
  { value: 'tx-fascioliasis', text: 'Fascioliasis', cls: 'week' },
  { value: 'tx-gonorrhea', text: 'Gonorrhea', cls: 'week', own: true },
  { value: 'tx-haemophilus-influenzae-invasive', text: 'Haemophilus influenzae, invasive', cls: 'week' },
  { value: 'tx-hansens-disease-leprosy', text: 'Hansen’s disease (leprosy)', cls: 'week' },
  { value: 'tx-hantavirus-infection', text: 'Hantavirus infection', cls: 'week' },
  { value: 'tx-hemolytic-uremic-syndrome-hus', text: 'Hemolytic uremic syndrome (HUS)', cls: 'week' },
  { value: 'tx-hepatitis-a', text: 'Hepatitis A', cls: '1wd' },
  { value: 'tx-hepatitis-b-infection-identified-prenatally-or-a', text: 'Hepatitis B infection identified prenatally or at delivery (mother)', cls: 'week' },
  { value: 'tx-hepatitis-b-c-and-e-acute', text: 'Hepatitis B, C, and E (acute)', cls: 'week' },
  { value: 'tx-hepatitis-b-perinatal-hbsag-24-months-old-child', text: 'Hepatitis B, perinatal (HBsAg+ < 24 months old) (child)', cls: '1wd' },
  { value: 'tx-hookworm-ancylostomiasis', text: 'Hookworm (ancylostomiasis)', cls: 'week' },
  { value: 'tx-human-immunodeficiency-virus-hiv-acute-infection', text: 'Human immunodeficiency virus (HIV), acute infection', cls: '1wd', own: true },
  { value: 'tx-human-immunodeficiency-virus-hiv-non-acute-infec', text: 'Human immunodeficiency virus (HIV), non-acute infection', cls: 'week', own: true },
  { value: 'tx-influenza-novel', text: 'Influenza, novel', cls: 'immediate' },
  { value: 'tx-influenza-associated-pediatric-mortality', text: 'Influenza-associated pediatric mortality', cls: '1wd' },
  { value: 'tx-lead-child-blood-any-level-adult-blood-any-level', text: 'Lead, child blood, any level & adult blood, any level', cls: 'immediate', own: true },
  { value: 'tx-legionellosis', text: 'Legionellosis', cls: 'week' },
  { value: 'tx-leishmaniasis', text: 'Leishmaniasis', cls: 'week' },
  { value: 'tx-listeriosis', text: 'Listeriosis', cls: 'week' },
  { value: 'tx-lyme-disease', text: 'Lyme disease', cls: 'week' },
  { value: 'tx-malaria', text: 'Malaria', cls: 'week' },
  { value: 'tx-measles-rubeola', text: 'Measles (rubeola)', cls: 'immediate' },
  { value: 'tx-melioidosis', text: 'Melioidosis', cls: 'immediate' },
  { value: 'tx-meningococcal-infection-invasive-neisseria-menin', text: 'Meningococcal infection, invasive (Neisseria meningitidis)', cls: 'immediate' },
  { value: 'tx-mumps', text: 'Mumps', cls: '1wd' },
  { value: 'tx-paragonimiasis', text: 'Paragonimiasis', cls: 'week' },
  { value: 'tx-pertussis', text: 'Pertussis', cls: '1wd' },
  { value: 'tx-pesticide-poisoning-acute-occupational', text: 'Pesticide poisoning, acute occupational', cls: 'week', own: true },
  { value: 'tx-plague-yersinia-pestis', text: 'Plague (Yersinia pestis)', cls: 'immediate' },
  { value: 'tx-poliomyelitis-acute-paralytic', text: 'Poliomyelitis, acute paralytic', cls: 'immediate' },
  { value: 'tx-poliovirus-infection-non-paralytic', text: 'Poliovirus infection, non-paralytic', cls: '1wd' },
  { value: 'tx-prion-diseases-such-as-creutzfeldt-jakob-disease', text: 'Prion diseases, such as Creutzfeldt-Jakob disease (CJD)', cls: 'week' },
  { value: 'tx-q-fever', text: 'Q fever', cls: '1wd' },
  { value: 'tx-rabies-human', text: 'Rabies, human', cls: 'immediate' },
  { value: 'tx-rubella-including-congenital', text: 'Rubella (including congenital)', cls: '1wd' },
  { value: 'tx-salmonellosis-including-typhoid-fever', text: 'Salmonellosis, including typhoid fever', cls: 'week' },
  { value: 'tx-shiga-toxin-producing-escherichia-coli', text: 'Shiga toxin-producing Escherichia coli', cls: 'week' },
  { value: 'tx-shigellosis', text: 'Shigellosis', cls: 'week' },
  { value: 'tx-smallpox', text: 'Smallpox', cls: 'immediate' },
  { value: 'tx-spinal-cord-injury', text: 'Spinal cord injury', cls: '10wd', own: true },
  { value: 'tx-spotted-fever-rickettsiosis', text: 'Spotted fever rickettsiosis', cls: 'week' },
  { value: 'tx-streptococcal-disease-s-pneumo-invasive', text: 'Streptococcal disease (S. pneumo), invasive', cls: 'week' },
  { value: 'tx-syphilis-all-other-stages-including-congenital-s', text: 'Syphilis – all other stages including congenital syphilis', cls: 'week', own: true },
  { value: 'tx-syphilis-primary-and-secondary-stages', text: 'Syphilis – primary and secondary stages', cls: '1wd', own: true },
  { value: 'tx-taenia-solium-and-undifferentiated-taenia-infect', text: 'Taenia solium and undifferentiated Taenia infection', cls: 'week' },
  { value: 'tx-tetanus', text: 'Tetanus', cls: 'week' },
  { value: 'tx-tick-borne-relapsing-fever-tbrf', text: 'Tick-borne relapsing fever (TBRF)', cls: 'week' },
  { value: 'tx-traumatic-brain-injury', text: 'Traumatic brain injury', cls: '10wd', own: true },
  { value: 'tx-trichinosis', text: 'Trichinosis', cls: 'week' },
  { value: 'tx-trichuriasis', text: 'Trichuriasis', cls: 'week' },
  { value: 'tx-tuberculosis-mycobacterium-tuberculosis-complex', text: 'Tuberculosis (Mycobacterium tuberculosis complex)', cls: '1wd' },
  { value: 'tx-tuberculosis-infection', text: 'Tuberculosis infection', cls: 'week' },
  { value: 'tx-tularemia', text: 'Tularemia', cls: 'immediate' },
  { value: 'tx-typhus', text: 'Typhus', cls: 'week' },
  { value: 'tx-vancomycin-intermediate-staph-aureus-visa', text: 'Vancomycin-intermediate Staph aureus (VISA)', cls: 'immediate' },
  { value: 'tx-vancomycin-resistant-staph-aureus-vrsa', text: 'Vancomycin-resistant Staph aureus (VRSA)', cls: 'immediate' },
  { value: 'tx-vibrio-infection-including-cholera', text: 'Vibrio infection, including cholera', cls: '1wd' },
  { value: 'tx-viral-hemorrhagic-fever-including-ebola', text: 'Viral hemorrhagic fever (including Ebola)', cls: 'immediate' },
  { value: 'tx-yellow-fever', text: 'Yellow fever', cls: 'immediate' },
  { value: 'tx-yersiniosis', text: 'Yersiniosis', cls: 'week' },
];

export const NY_CONDITIONS = [
  { value: 'ny-amebiasis', text: 'Amebiasis', cls: '24h' },
  { value: 'ny-anaplasmosis', text: 'Anaplasmosis', cls: '24h' },
  { value: 'ny-animal-bite-for-which-rabies-prophylaxis-is-given', text: 'Animal bite for which rabies prophylaxis is given', cls: 'immediate-phone' },
  { value: 'ny-anthrax', text: 'Anthrax', cls: 'immediate-phone' },
  { value: 'ny-arboviral-infection', text: 'Arboviral infection', cls: 'immediate-phone' },
  { value: 'ny-babesiosis', text: 'Babesiosis', cls: '24h' },
  { value: 'ny-botulism', text: 'Botulism', cls: 'immediate-phone' },
  { value: 'ny-brucellosis', text: 'Brucellosis', cls: 'immediate-phone' },
  { value: 'ny-campylobacteriosis', text: 'Campylobacteriosis', cls: '24h' },
  { value: 'ny-chancroid', text: 'Chancroid', cls: '24h' },
  { value: 'ny-chlamydia-trachomatis-infection', text: 'Chlamydia trachomatis infection', cls: '24h' },
  { value: 'ny-cholera', text: 'Cholera', cls: 'immediate-phone' },
  { value: 'ny-covid-19-sars-cov-2', text: 'COVID-19 (SARS-CoV-2)', cls: '24h' },
  { value: 'ny-severe-acute-respiratory-syndrome-sars', text: 'Severe acute respiratory syndrome (SARS)', cls: 'immediate-phone' },
  { value: 'ny-middle-east-respiratory-syndrome-mers', text: 'Middle East respiratory syndrome (MERS)', cls: 'immediate-phone' },
  { value: 'ny-cryptosporidiosis', text: 'Cryptosporidiosis', cls: '24h' },
  { value: 'ny-cyclosporiasis', text: 'Cyclosporiasis', cls: '24h' },
  { value: 'ny-diphtheria', text: 'Diphtheria', cls: 'immediate-phone' },
  { value: 'ny-e-coli-o157-h7-infection', text: 'E. coli O157:H7 infection', cls: '24h' },
  { value: 'ny-ehrlichiosis', text: 'Ehrlichiosis', cls: '24h' },
  { value: 'ny-encephalitis', text: 'Encephalitis', cls: 'immediate-phone' },
  { value: 'ny-foodborne-illness', text: 'Foodborne illness', cls: 'immediate-phone' },
  { value: 'ny-giardiasis', text: 'Giardiasis', cls: '24h' },
  { value: 'ny-glanders', text: 'Glanders', cls: 'immediate-phone' },
  { value: 'ny-gonococcal-infection', text: 'Gonococcal infection', cls: '24h' },
  { value: 'ny-haemophilus-influenzae-invasive-disease', text: 'Haemophilus influenzae, invasive disease', cls: '24h' },
  { value: 'ny-hantavirus-disease', text: 'Hantavirus disease', cls: 'immediate-phone' },
  { value: 'ny-hemolytic-uremic-syndrome', text: 'Hemolytic uremic syndrome', cls: '24h' },
  { value: 'ny-hepatitis-a', text: 'Hepatitis A', cls: '24h' },
  { value: 'ny-hepatitis-a-in-a-food-handler', text: 'Hepatitis A in a food handler', cls: 'immediate-phone' },
  { value: 'ny-hepatitis-b-acute-or-chronic', text: 'Hepatitis B, acute or chronic', cls: '24h' },
  { value: 'ny-hepatitis-b-carrier-pregnant', text: 'Hepatitis B carrier, pregnant', cls: '24h' },
  { value: 'ny-hepatitis-c-acute-or-chronic', text: 'Hepatitis C, acute or chronic', cls: '24h' },
  { value: 'ny-herpes-infection-infant-60-days-or-younger', text: 'Herpes infection, infant 60 days or younger', cls: '24h' },
  { value: 'ny-hospital-associated-infection-as-defined-in-10-ny', text: 'Hospital-associated infection (as defined in 10 NYCRR 2.2)', cls: '24h' },
  { value: 'ny-influenza-laboratory-confirmed', text: 'Influenza, laboratory-confirmed', cls: '24h' },
  { value: 'ny-legionellosis', text: 'Legionellosis', cls: '24h' },
  { value: 'ny-listeriosis', text: 'Listeriosis', cls: '24h' },
  { value: 'ny-lyme-disease', text: 'Lyme disease', cls: '24h' },
  { value: 'ny-lymphogranuloma-venereum', text: 'Lymphogranuloma venereum', cls: '24h' },
  { value: 'ny-malaria', text: 'Malaria', cls: '24h' },
  { value: 'ny-measles', text: 'Measles', cls: 'immediate-phone' },
  { value: 'ny-melioidosis', text: 'Melioidosis', cls: 'immediate-phone' },
  { value: 'ny-meningitis-aseptic-or-viral', text: 'Meningitis, aseptic or viral', cls: '24h' },
  { value: 'ny-meningitis-haemophilus', text: 'Meningitis, Haemophilus', cls: 'immediate-phone' },
  { value: 'ny-meningitis-meningococcal', text: 'Meningitis, meningococcal', cls: 'immediate-phone' },
  { value: 'ny-meningitis-other', text: 'Meningitis, other', cls: '24h' },
  { value: 'ny-meningococcemia', text: 'Meningococcemia', cls: 'immediate-phone' },
  { value: 'ny-mpox', text: 'Mpox', cls: '24h' },
  { value: 'ny-mumps', text: 'Mumps', cls: '24h' },
  { value: 'ny-pertussis', text: 'Pertussis', cls: '24h' },
  { value: 'ny-plague', text: 'Plague', cls: 'immediate-phone' },
  { value: 'ny-poliomyelitis', text: 'Poliomyelitis', cls: 'immediate-phone' },
  { value: 'ny-psittacosis', text: 'Psittacosis', cls: '24h' },
  { value: 'ny-q-fever', text: 'Q fever', cls: 'immediate-phone' },
  { value: 'ny-rabies', text: 'Rabies', cls: 'immediate-phone' },
  { value: 'ny-respiratory-syncytial-virus-rsv-laboratory-confir', text: 'Respiratory syncytial virus (RSV), laboratory-confirmed', cls: '24h' },
  { value: 'ny-respiratory-syncytial-virus-rsv-pediatric-death', text: 'Respiratory syncytial virus (RSV), pediatric death', cls: '24h' },
  { value: 'ny-rocky-mountain-spotted-fever', text: 'Rocky Mountain spotted fever', cls: '24h' },
  { value: 'ny-rubella-including-congenital-rubella-syndrome', text: 'Rubella, including congenital rubella syndrome', cls: 'immediate-phone' },
  { value: 'ny-salmonellosis', text: 'Salmonellosis', cls: '24h' },
  { value: 'ny-shiga-toxin-producing-e-coli-stec', text: 'Shiga toxin-producing E. coli (STEC)', cls: '24h' },
  { value: 'ny-shigellosis', text: 'Shigellosis', cls: '24h' },
  { value: 'ny-smallpox', text: 'Smallpox', cls: 'immediate-phone' },
  { value: 'ny-staphylococcus-aureus-reduced-susceptibility-or-r', text: 'Staphylococcus aureus, reduced susceptibility or resistance to vancomycin (proposed addition)', cls: '24h' },
  { value: 'ny-staphylococcal-enterotoxin-b-poisoning', text: 'Staphylococcal enterotoxin B poisoning', cls: 'immediate-phone' },
  { value: 'ny-streptococcal-infection-invasive-group-a', text: 'Streptococcal infection, invasive: group A', cls: '24h' },
  { value: 'ny-streptococcal-infection-invasive-group-b', text: 'Streptococcal infection, invasive: group B', cls: '24h' },
  { value: 'ny-streptococcus-pneumoniae-invasive', text: 'Streptococcus pneumoniae, invasive', cls: '24h' },
  { value: 'ny-syphilis', text: 'Syphilis', cls: 'ny-syphilis' },
  { value: 'ny-tetanus', text: 'Tetanus', cls: '24h' },
  { value: 'ny-toxic-shock-syndrome', text: 'Toxic shock syndrome', cls: '24h' },
  { value: 'ny-transmissible-spongiform-encephalopathy-including', text: 'Transmissible spongiform encephalopathy, including Creutzfeldt-Jakob disease', cls: 'ny-tse' },
  { value: 'ny-trichinosis', text: 'Trichinosis', cls: '24h' },
  { value: 'ny-tuberculosis-current-disease', text: 'Tuberculosis, current disease', cls: 'immediate-phone' },
  { value: 'ny-tularemia', text: 'Tularemia', cls: 'immediate-phone' },
  { value: 'ny-typhoid', text: 'Typhoid', cls: 'immediate-phone' },
  { value: 'ny-vaccinia-disease', text: 'Vaccinia disease', cls: 'immediate-phone' },
  { value: 'ny-varicella-not-shingles', text: 'Varicella (not shingles)', cls: '24h' },
  { value: 'ny-vibriosis-proposed-addition', text: 'Vibriosis (proposed addition)', cls: '24h' },
  { value: 'ny-viral-hemorrhagic-fever', text: 'Viral hemorrhagic fever', cls: 'immediate-phone' },
  { value: 'ny-yersiniosis', text: 'Yersiniosis', cls: '24h' },
  { value: 'ny-unusual-disease-or-a-cluster-or-outbreak-of-any-c', text: 'Unusual disease, or a cluster or outbreak of any communicable disease', cls: '24h' },
  { value: 'ny-hiv-infection-hiv-related-illness-or-aids', text: 'HIV infection, HIV-related illness, or AIDS', cls: 'ny-hiv' },
];

export const NJ_CONDITIONS = [
  { value: 'nj-anthrax', text: 'Anthrax', cls: 'immediate-phone' },
  { value: 'nj-biological-intoxication-e-g-ricin-abrin-harmful-a', text: 'Biological intoxication (e.g., ricin, abrin, harmful algal bloom)', cls: 'immediate-phone' },
  { value: 'nj-botulism', text: 'Botulism', cls: 'immediate-phone' },
  { value: 'nj-coronavirus-novel-causing-severe-acute-respirator', text: 'Coronavirus, novel, causing severe acute respiratory syndrome (e.g., SARS, MERS)', cls: 'immediate-phone' },
  { value: 'nj-diphtheria', text: 'Diphtheria', cls: 'immediate-phone' },
  { value: 'nj-foodborne-intoxication-e-g-ciguatera-scombroid-st', text: 'Foodborne intoxication (e.g., ciguatera, scombroid, staphylococcal enterotoxin B)', cls: 'immediate-phone' },
  { value: 'nj-free-living-amebic-infection', text: 'Free-living amebic infection', cls: 'immediate-phone' },
  { value: 'nj-haemophilus-influenzae-invasive', text: 'Haemophilus influenzae, invasive', cls: 'immediate-phone' },
  { value: 'nj-hantavirus', text: 'Hantavirus', cls: 'immediate-phone' },
  { value: 'nj-hepatitis-a', text: 'Hepatitis A', cls: 'immediate-phone' },
  { value: 'nj-influenza-a-novel', text: 'Influenza A, novel', cls: 'immediate-phone' },
  { value: 'nj-measles', text: 'Measles', cls: 'immediate-phone' },
  { value: 'nj-melioidosis', text: 'Melioidosis', cls: 'immediate-phone' },
  { value: 'nj-meningococcal-disease-invasive', text: 'Meningococcal disease, invasive', cls: 'immediate-phone' },
  { value: 'nj-mpox', text: 'Mpox', cls: 'immediate-phone' },
  { value: 'nj-plague', text: 'Plague', cls: 'immediate-phone' },
  { value: 'nj-poliomyelitis', text: 'Poliomyelitis', cls: 'immediate-phone' },
  { value: 'nj-rabies-human', text: 'Rabies, human', cls: 'immediate-phone' },
  { value: 'nj-rubella', text: 'Rubella', cls: 'immediate-phone' },
  { value: 'nj-smallpox', text: 'Smallpox', cls: 'immediate-phone' },
  { value: 'nj-viral-hemorrhagic-fever-e-g-ebola-lassa-marburg', text: 'Viral hemorrhagic fever (e.g., Ebola, Lassa, Marburg)', cls: 'immediate-phone' },
  { value: 'nj-outbreak-of-any-communicable-disease-act-of-biote', text: 'Outbreak of any communicable disease, act of bioterrorism, or potential public health emergency', cls: 'immediate-phone' },
  { value: 'nj-alpha-gal-syndrome', text: 'Alpha-gal syndrome', cls: 'nbd' },
  { value: 'nj-anaplasmosis', text: 'Anaplasmosis', cls: 'nbd' },
  { value: 'nj-animal-bite-human-rabies-exposure-or-rabies-post', text: 'Animal bite (human), rabies exposure, or rabies post-exposure prophylaxis given', cls: 'nbd' },
  { value: 'nj-arboviral-disease-e-g-heartland-la-crosse-st-loui', text: 'Arboviral disease (e.g., Heartland, La Crosse, St. Louis encephalitis, yellow fever)', cls: 'nbd' },
  { value: 'nj-babesiosis', text: 'Babesiosis', cls: 'nbd' },
  { value: 'nj-bacterial-tickborne-disease-e-g-borrelia-miyamoto', text: 'Bacterial tickborne disease (e.g., Borrelia miyamotoi)', cls: 'nbd' },
  { value: 'nj-brucellosis', text: 'Brucellosis', cls: 'nbd' },
  { value: 'nj-campylobacteriosis', text: 'Campylobacteriosis', cls: 'nbd' },
  { value: 'nj-candida-auris-infection-or-colonization', text: 'Candida auris, infection or colonization', cls: 'nbd' },
  { value: 'nj-carbapenemase-producing-organism-infection-or-col', text: 'Carbapenemase-producing organism, infection or colonization', cls: 'nbd' },
  { value: 'nj-chancroid', text: 'Chancroid', cls: 'nj-cdrss' },
  { value: 'nj-chikungunya', text: 'Chikungunya', cls: 'nbd' },
  { value: 'nj-cholera', text: 'Cholera', cls: 'nbd' },
  { value: 'nj-coccidioidomycosis', text: 'Coccidioidomycosis', cls: 'nbd' },
  { value: 'nj-covid-19', text: 'COVID-19', cls: 'nbd' },
  { value: 'nj-cronobacter-infection-invasive-under-12-months', text: 'Cronobacter infection, invasive, under 12 months', cls: 'nbd' },
  { value: 'nj-cryptosporidiosis', text: 'Cryptosporidiosis', cls: 'nbd' },
  { value: 'nj-cyclosporiasis', text: 'Cyclosporiasis', cls: 'nbd' },
  { value: 'nj-dengue', text: 'Dengue', cls: 'nbd' },
  { value: 'nj-eastern-equine-encephalitis', text: 'Eastern equine encephalitis', cls: 'nbd' },
  { value: 'nj-ehrlichiosis', text: 'Ehrlichiosis', cls: 'nbd' },
  { value: 'nj-e-coli-shiga-toxin-producing-stec', text: 'E. coli, Shiga toxin-producing (STEC)', cls: 'nbd' },
  { value: 'nj-extrapulmonary-nontuberculous-mycobacterial-ntm-i', text: 'Extrapulmonary nontuberculous mycobacterial (NTM) infection', cls: 'nbd' },
  { value: 'nj-giardiasis', text: 'Giardiasis', cls: 'nbd' },
  { value: 'nj-gonorrhea', text: 'Gonorrhea', cls: 'nj-cdrss' },
  { value: 'nj-granuloma-inguinale', text: 'Granuloma inguinale', cls: 'nj-cdrss' },
  { value: 'nj-hansen-disease', text: 'Hansen disease', cls: 'nbd' },
  { value: 'nj-hemolytic-uremic-syndrome-post-diarrheal', text: 'Hemolytic uremic syndrome, post-diarrheal', cls: 'nbd' },
  { value: 'nj-hepatitis-b-or-c-newly-diagnosed-in-nj-perinatal', text: 'Hepatitis B or C: newly diagnosed in NJ, perinatal through 36 months, or pregnant', cls: 'nbd' },
  { value: 'nj-hiv', text: 'HIV', cls: 'nj-hiv' },
  { value: 'nj-influenza-associated-pediatric-death', text: 'Influenza-associated pediatric death', cls: 'nbd' },
  { value: 'nj-jamestown-canyon-virus', text: 'Jamestown Canyon virus', cls: 'nbd' },
  { value: 'nj-legionellosis', text: 'Legionellosis', cls: 'nbd' },
  { value: 'nj-leptospirosis', text: 'Leptospirosis', cls: 'nbd' },
  { value: 'nj-listeriosis', text: 'Listeriosis', cls: 'nbd' },
  { value: 'nj-malaria', text: 'Malaria', cls: 'nbd' },
  { value: 'nj-mumps', text: 'Mumps', cls: 'nbd' },
  { value: 'nj-pertussis', text: 'Pertussis', cls: 'nbd' },
  { value: 'nj-powassan-virus', text: 'Powassan virus', cls: 'nbd' },
  { value: 'nj-psittacosis', text: 'Psittacosis', cls: 'nbd' },
  { value: 'nj-q-fever', text: 'Q fever', cls: 'nbd' },
  { value: 'nj-rsv-associated-pediatric-death', text: 'RSV-associated pediatric death', cls: 'nbd' },
  { value: 'nj-rubella-congenital-syndrome', text: 'Rubella, congenital syndrome', cls: 'nbd' },
  { value: 'nj-salmonellosis', text: 'Salmonellosis', cls: 'nbd' },
  { value: 'nj-shigellosis', text: 'Shigellosis', cls: 'nbd' },
  { value: 'nj-spotted-fever-group-rickettsiosis', text: 'Spotted fever group rickettsiosis', cls: 'nbd' },
  { value: 'nj-group-a-streptococcal-disease-invasive', text: 'Group A streptococcal disease, invasive', cls: 'nbd' },
  { value: 'nj-group-b-streptococcal-disease-invasive-under-3-mo', text: 'Group B streptococcal disease, invasive, under 3 months', cls: 'nbd' },
  { value: 'nj-streptococcus-pneumoniae-invasive', text: 'Streptococcus pneumoniae, invasive', cls: 'nbd' },
  { value: 'nj-syphilis-all-stages-including-congenital', text: 'Syphilis, all stages including congenital', cls: 'nj-cdrss' },
  { value: 'nj-tetanus', text: 'Tetanus', cls: 'nbd' },
  { value: 'nj-toxic-shock-syndrome', text: 'Toxic shock syndrome', cls: 'nbd' },
  { value: 'nj-trichinellosis', text: 'Trichinellosis', cls: 'nbd' },
  { value: 'nj-tuberculosis', text: 'Tuberculosis', cls: 'nj-cdrss' },
  { value: 'nj-tularemia', text: 'Tularemia', cls: 'nbd' },
  { value: 'nj-typhoid-fever', text: 'Typhoid fever', cls: 'nbd' },
  { value: 'nj-staphylococcus-aureus-vancomycin-intermediate-or', text: 'Staphylococcus aureus, vancomycin-intermediate or -resistant (VISA/VRSA)', cls: 'nbd' },
  { value: 'nj-varicella-chickenpox', text: 'Varicella (chickenpox)', cls: 'nbd' },
  { value: 'nj-vibriosis', text: 'Vibriosis', cls: 'nbd' },
  { value: 'nj-viral-encephalitis', text: 'Viral encephalitis', cls: 'nbd' },
  { value: 'nj-west-nile-virus', text: 'West Nile virus', cls: 'nbd' },
  { value: 'nj-yersiniosis', text: 'Yersiniosis', cls: 'nbd' },
  { value: 'nj-zika-virus', text: 'Zika virus', cls: 'nbd' },
  { value: 'nj-chlamydia-trachomatis', text: 'Chlamydia trachomatis', cls: 'nj-ecr' },
  { value: 'nj-influenza-other-than-pediatric-death', text: 'Influenza, other than pediatric death', cls: 'nj-ecr' },
  { value: 'nj-lyme-disease', text: 'Lyme disease', cls: 'nj-ecr' },
];

const DAY = 86400000;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function nextWorkdaySameTime(state, t) {
  const day = parseDate(nextBusinessDay(state, t));
  return day + (t - Math.floor(t / DAY) * DAY);
}
function addWorkdays(state, t, n) {
  let cur = t;
  for (let i = 0; i < n; i += 1) cur = nextWorkdaySameTime(state, cur);
  return cur;
}
function plusMonth(t) {
  const d = new Date(t);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d.getUTCDate(), last), d.getUTCHours(), d.getUTCMinutes());
}

const CLASS_TEXT = {
  'immediate-phone': 'Report immediately by telephone.',
  immediate: 'Report immediately.',
  'phone-1wd': 'Report by telephone within one working day.',
  'any-1wd': 'Report by fax or other electronic transmission, telephone, or mail within one working day.',
  '1wd': 'Report within one work day.',
  week: 'Report within one week.',
  month: 'Report within one month.',
  '10wd': 'Report within 10 work days.',
  rules: 'Report under the condition\'s own rules (see the DSHS footnotes).',
  foodborne: 'Report immediately by telephone when two or more cases from separate households are suspected to share a source; otherwise by fax, telephone, or mail within one working day.',
  '24h': 'Report within 24 hours of first seeing the case (10 NYCRR 2.10).',
  'ny-syphilis': 'Report by phone if a nontreponemal titer is 1:16 or more, any prenatal or delivery test is positive at any titer, or the stage is primary or secondary. Otherwise report within 24 hours; mail is allowed.',
  'ny-tse': 'Report within 24 hours, and on suspicion report directly to the New York State Alzheimer\'s Disease and Other Dementias Registry, (518) 473-7817.',
  'ny-hiv': 'Report on the Medical Provider HIV/AIDS and Partner/Contact Report Form (DOH-4189), not on DOH-389.',
  nbd: 'Report by the next business day, by electronic case report or CDRSS.',
  'nj-cdrss': 'Report by the next business day to NJDOH through CDRSS.',
  'nj-ecr': 'Reportable by electronic case report (eCR) only.',
  'nj-hiv': 'Report to NJDOH by electronic laboratory reporting.',
};

const NY_NOTES = {
  'ny-animal-bite-for-which-rabies-prophylaxis-is-given': 'Notify the local health department before starting rabies prophylaxis.',
};

export function reportableConditionUrgency(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const st = RC_STATES.find((s) => s.value === o.state);
  if (!st) return { valid: false, message: 'Choose the state: California, Texas, New York, or New Jersey.' };
  const list = { CA: CA_CONDITIONS, TX: TX_CONDITIONS, NY: NY_CONDITIONS, NJ: NJ_CONDITIONS }[st.value];
  const c = list.find((x) => x.value === { CA: o.caCondition, TX: o.txCondition, NY: o.nyCondition, NJ: o.njCondition }[st.value]);
  if (!c) return { valid: false, message: `Choose the condition from the ${st.text} list.` };
  if (isBlank(o.identified)) return { valid: false, message: 'Enter when the case was identified. The deadline runs from then.' };
  const t = parseDateTime(o.identified);
  if (t === null) return { valid: false, message: 'Enter the time identified as a date and time.' };

  let due = null;
  if (c.cls === 'phone-1wd' || c.cls === 'any-1wd' || c.cls === '1wd' || c.cls === 'foodborne' || c.cls === 'nbd' || c.cls === 'nj-cdrss') due = nextWorkdaySameTime(st.value, t);
  else if (c.cls === 'week') due = t + 7 * DAY;
  else if (c.cls === 'month') due = plusMonth(t);
  else if (c.cls === '10wd') due = addWorkdays(st.value, t, 10);
  else if (c.cls === '24h' || c.cls === 'ny-syphilis' || c.cls === 'ny-tse') due = t + DAY;
  const immediate = c.cls === 'immediate' || c.cls === 'immediate-phone';
  const to = st.value === 'CA'
    ? 'the local health officer for the jurisdiction where the patient lives'
    : st.value === 'NY'
      ? 'the local health department where the patient lives (for a New York City resident, the NYC Health Department); a State institution or hospital also reports to the State Department of Health'
      : st.value === 'NJ'
        ? (c.cls === 'nj-cdrss' || c.cls === 'nj-hiv' ? 'the New Jersey Department of Health' : 'the local health department where the case lives, or where your facility is if that is unknown; call NJDOH at 609-826-5964 (after hours 609-392-2020) only if the local health department cannot be reached')
      : (c.own ? 'the route in the DSHS footnote for this condition' : 'the local or regional health department (24/7 for immediate reports: 1-800-705-8868)');
  const nbdLike = c.cls.includes('1wd') || c.cls === 'foodborne' || c.cls === 'nbd' || c.cls === 'nj-cdrss';
  const weekendNote = !isBusinessDay(st.value, Math.floor(t / DAY) * DAY) && due && nbdLike
    ? 'Identified on a weekend or holiday: the working day counts from the next working day.'
    : null;
  return {
    valid: true,
    urgency: c.cls,
    dueAt: due === null ? null : new Date(due).toISOString().slice(0, 16),
    abnormal: immediate || c.cls === 'ny-syphilis',
    bandLabel: immediate ? 'Report now' : c.cls === 'ny-hiv' ? 'Report on form DOH-4189' : c.cls === 'nj-ecr' ? 'Report by eCR' : c.cls === 'nj-hiv' ? 'Report by electronic lab report' : (due ? `Report by ${new Date(due).toISOString().slice(0, 16).replace('T', ' ')}` : 'See the condition\'s rules'),
    band: `${c.text}: ${CLASS_TEXT[c.cls]}${due ? ` Due by ${formatDeadline(t, due, 'identification')}.` : ''}${NY_NOTES[c.value] ? ` ${NY_NOTES[c.value]}` : ''} Report to ${to}.`,
    editionNote: st.value === 'NY'
      ? `Source: ${RC_EDITIONS.NY}. Diseases the Department prints in red bold are phoned in immediately; the rest are due within 24 hours. An unusual disease, or a cluster or outbreak of any communicable disease, is reportable.`
      : st.value === 'NJ'
        ? `Source: ${RC_EDITIONS.NJ}, the Department's summary of the rule. An outbreak of any communicable disease, an act of bioterrorism, or a potential public health emergency is reported immediately.`
        : `Source: ${RC_EDITIONS[st.value]}. Any outbreak or unusual disease is reported immediately in both California and Texas.`,
    weekendNote,
    readingNote: nbdLike ? `${st.value === 'NJ' ? 'By the next business day' : 'Within one working day'} is read here as the same time on the next working day, the earliest reading.` : null,
  };
}
