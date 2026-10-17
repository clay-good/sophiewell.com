// spec-v1634 tool 12: STOPP/START version 3 screen (O'Mahony D, et al. Eur Geriatr Med 2023;14:625-632).
//
// Source: the article's Appendix 1 (Supplementary file 1), read October 16, 2026 from Europe PMC
// (PMC10447584 supplementaryFiles), after its correction (PMC10447589), which only reordered and retitled
// the supplementary files. 133 STOPP and 57 START criteria, 190 in all; the count is asserted in a test.
// License: CC BY 4.0 (the article and its supplementary material); each criterion is quoted verbatim with
// attribution. Extraction: pdftotext's layout mode, cross-checked against its plain mode; they differed
// only at four line-end hyphens (kept as hyphens) and STOPP D21, where the layout order is the printed one.
//
// Matching. The reader ticks drug classes and conditions. A STOPP criterion is listed when each of its
// groups has a ticked tag and none of its "unless" tags (the criterion's own exception, such as
// "monotherapy" or "primary prevention") is ticked; a START criterion is listed when its groups are ticked
// and one of its recommended drugs is not. Section E's eGFR thresholds are tested against the eGFR entered;
// with none entered those criteria are named as not checked. Doses, durations, laboratory values and the
// remaining exceptions in each criterion's wording are NOT tested: a match is a criterion to read. The tags
// were written for this tool (spec-v1634 section 12); they are not part of the source. Section A of each
// list applies to every medication list and is not matched by ticks.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const DRUGS = [
  { value: 'digoxin', text: 'Digoxin', system: 'Heart and circulation' },
  { value: 'ndhp-ccb', text: 'Verapamil or diltiazem', system: 'Heart and circulation' },
  { value: 'dhp-ccb', text: 'Amlodipine or another dihydropyridine', system: 'Heart and circulation' },
  { value: 'beta-blocker', text: 'Beta-blocker', system: 'Heart and circulation' },
  { value: 'amiodarone', text: 'Amiodarone', system: 'Heart and circulation' },
  { value: 'loop-diuretic', text: 'Loop diuretic (furosemide, bumetanide)', system: 'Heart and circulation' },
  { value: 'thiazide', text: 'Thiazide diuretic', system: 'Heart and circulation' },
  { value: 'central-antihypertensive', text: 'Clonidine, methyldopa or moxonidine', system: 'Heart and circulation' },
  { value: 'ace-inhibitor', text: 'ACE inhibitor', system: 'Heart and circulation' },
  { value: 'arb', text: 'Angiotensin receptor blocker', system: 'Heart and circulation' },
  { value: 'arni', text: 'Sacubitril/valsartan', system: 'Heart and circulation' },
  { value: 'mra', text: 'Spironolactone or eplerenone', system: 'Heart and circulation' },
  { value: 'k-sparing', text: 'Amiloride or triamterene', system: 'Heart and circulation' },
  { value: 'alpha-blocker', text: 'Alpha-1 blocker (doxazosin, tamsulosin)', system: 'Heart and circulation' },
  { value: 'vasodilator', text: 'Other vasodilator (hydralazine, minoxidil)', system: 'Heart and circulation' },
  { value: 'nitrate', text: 'Nitrate', system: 'Heart and circulation' },
  { value: 'pde5', text: 'Sildenafil, tadalafil or vardenafil', system: 'Heart and circulation' },
  { value: 'qt-drug', text: 'Another drug that prolongs QTc', system: 'Heart and circulation' },
  { value: 'statin', text: 'Statin', system: 'Heart and circulation' },
  { value: 'sglt2', text: 'SGLT2 inhibitor', system: 'Heart and circulation' },
  { value: 'iv-iron', text: 'Intravenous iron', system: 'Heart and circulation' },
  { value: 'aspirin', text: 'Aspirin', system: 'Blood thinners' },
  { value: 'p2y12', text: 'Clopidogrel, prasugrel or ticagrelor', system: 'Blood thinners' },
  { value: 'ticlopidine', text: 'Ticlopidine', system: 'Blood thinners' },
  { value: 'vka', text: 'Warfarin or another vitamin K antagonist', system: 'Blood thinners' },
  { value: 'dabigatran', text: 'Dabigatran', system: 'Blood thinners' },
  { value: 'xa-inhibitor', text: 'Apixaban, edoxaban or rivaroxaban', system: 'Blood thinners' },
  { value: 'pgp-inhibitor', text: 'Other P-gp inhibitor (macrolide, azole)', system: 'Blood thinners' },
  { value: 'ssri', text: 'SSRI', system: 'Brain and mood' },
  { value: 'snri', text: 'SNRI (venlafaxine, duloxetine)', system: 'Brain and mood' },
  { value: 'tca', text: 'Tricyclic antidepressant', system: 'Brain and mood' },
  { value: 'antidepressant-other', text: 'Other antidepressant (mirtazapine, trazodone)', system: 'Brain and mood' },
  { value: 'antipsychotic', text: 'Antipsychotic', system: 'Brain and mood' },
  { value: 'phenothiazine', text: 'Phenothiazine (chlorpromazine, prochlorperazine)', system: 'Brain and mood' },
  { value: 'benzodiazepine', text: 'Benzodiazepine', system: 'Brain and mood' },
  { value: 'z-drug', text: 'Zolpidem, zopiclone or zaleplon', system: 'Brain and mood' },
  { value: 'antihistamine-1g', text: 'First-generation antihistamine', system: 'Brain and mood' },
  { value: 'eps-anticholinergic', text: 'Benztropine, trihexyphenidyl or procyclidine', system: 'Brain and mood' },
  { value: 'ache-inhibitor', text: 'Donepezil, rivastigmine or galantamine', system: 'Brain and mood' },
  { value: 'memantine', text: 'Memantine', system: 'Brain and mood' },
  { value: 'nootropic', text: 'Ginkgo, piracetam or another nootropic', system: 'Brain and mood' },
  { value: 'levodopa-da', text: 'Levodopa or a dopamine agonist', system: 'Brain and mood' },
  { value: 'antiepileptic', text: 'Antiepileptic', system: 'Brain and mood' },
  { value: 'gabapentinoid', text: 'Gabapentin or pregabalin', system: 'Brain and mood' },
  { value: 'anticholinergic-2', text: 'Two or more anticholinergic drugs', system: 'Brain and mood' },
  { value: 'metoclopramide', text: 'Metoclopramide', system: 'Stomach and bowel' },
  { value: 'ppi', text: 'Proton pump inhibitor', system: 'Stomach and bowel' },
  { value: 'oral-iron', text: 'Oral iron', system: 'Stomach and bowel' },
  { value: 'laxative', text: 'Laxative', system: 'Stomach and bowel' },
  { value: 'fiber', text: 'Fiber supplement', system: 'Stomach and bowel' },
  { value: 'probiotic', text: 'Probiotic', system: 'Stomach and bowel' },
  { value: 'hp-eradication', text: 'H. pylori eradication therapy', system: 'Stomach and bowel' },
  { value: 'megestrol', text: 'Megestrol acetate', system: 'Stomach and bowel' },
  { value: 'theophylline', text: 'Theophylline', system: 'Lungs' },
  { value: 'lama', text: 'Long-acting muscarinic antagonist inhaler', system: 'Lungs' },
  { value: 'laba', text: 'Long-acting beta-2 agonist inhaler', system: 'Lungs' },
  { value: 'ics', text: 'Inhaled corticosteroid', system: 'Lungs' },
  { value: 'home-oxygen', text: 'Home oxygen', system: 'Lungs' },
  { value: 'nsaid', text: 'NSAID (by mouth or injection)', system: 'Bones, joints and pain' },
  { value: 'corticosteroid', text: 'Systemic corticosteroid', system: 'Bones, joints and pain' },
  { value: 'colchicine', text: 'Colchicine', system: 'Bones, joints and pain' },
  { value: 'xanthine-oxidase', text: 'Allopurinol or febuxostat', system: 'Bones, joints and pain' },
  { value: 'bisphosphonate', text: 'Bisphosphonate', system: 'Bones, joints and pain' },
  { value: 'bone-other', text: 'Denosumab, teriparatide or abaloparatide', system: 'Bones, joints and pain' },
  { value: 'vitamin-d', text: 'Vitamin D', system: 'Bones, joints and pain' },
  { value: 'calcium', text: 'Calcium supplement', system: 'Bones, joints and pain' },
  { value: 'dmard', text: 'DMARD (methotrexate, sulfasalazine)', system: 'Bones, joints and pain' },
  { value: 'methotrexate', text: 'Methotrexate', system: 'Bones, joints and pain' },
  { value: 'folic-acid', text: 'Folic acid', system: 'Bones, joints and pain' },
  { value: 'opioid', text: 'Opioid', system: 'Bones, joints and pain' },
  { value: 'acetaminophen', text: 'Acetaminophen', system: 'Bones, joints and pain' },
  { value: 'lidocaine-patch', text: 'Lidocaine patch', system: 'Bones, joints and pain' },
  { value: 'bladder-antimuscarinic', text: 'Oxybutynin, tolterodine or another bladder antimuscarinic', system: 'Bladder, kidney and hormones' },
  { value: 'mirabegron', text: 'Mirabegron', system: 'Bladder, kidney and hormones' },
  { value: '5ari', text: 'Finasteride or dutasteride', system: 'Bladder, kidney and hormones' },
  { value: 'vaginal-estrogen', text: 'Vaginal estrogen', system: 'Bladder, kidney and hormones' },
  { value: 'antibiotic', text: 'Antibiotic', system: 'Bladder, kidney and hormones' },
  { value: 'nitrofurantoin', text: 'Nitrofurantoin', system: 'Bladder, kidney and hormones' },
  { value: 'metformin', text: 'Metformin', system: 'Bladder, kidney and hormones' },
  { value: 'sulfonylurea-long', text: 'Glyburide, glimepiride or chlorpropamide', system: 'Bladder, kidney and hormones' },
  { value: 'tzd', text: 'Pioglitazone or rosiglitazone', system: 'Bladder, kidney and hormones' },
  { value: 'estrogen', text: 'Systemic estrogen', system: 'Bladder, kidney and hormones' },
  { value: 'progestogen', text: 'Progestogen', system: 'Bladder, kidney and hormones' },
  { value: 'androgen', text: 'Testosterone or another androgen', system: 'Bladder, kidney and hormones' },
  { value: 'levothyroxine', text: 'Levothyroxine', system: 'Bladder, kidney and hormones' },
  { value: 'desmopressin', text: 'Desmopressin or vasopressin', system: 'Bladder, kidney and hormones' },
  { value: 'calcitriol', text: 'Calcitriol or alfacalcidol', system: 'Bladder, kidney and hormones' },
  { value: 'phosphate-binder', text: 'Phosphate binder', system: 'Bladder, kidney and hormones' },
  { value: 'esa', text: 'Erythropoietin or another ESA', system: 'Bladder, kidney and hormones' },
  { value: 'flu-vaccine', text: 'Influenza vaccine this season', system: 'Vaccines' },
  { value: 'pneumococcal-vaccine', text: 'Pneumococcal vaccine', system: 'Vaccines' },
  { value: 'zoster-vaccine', text: 'Zoster vaccine', system: 'Vaccines' },
  { value: 'covid-vaccine', text: 'COVID-19 vaccine', system: 'Vaccines' },
];
export const CONDITIONS = [
  { value: 'hf-ref', text: 'Heart failure, reduced ejection fraction', system: 'Heart and circulation' },
  { value: 'hf-pef', text: 'Heart failure, preserved ejection fraction', system: 'Heart and circulation' },
  { value: 'nyha-3-4', text: 'NYHA class III or IV heart failure', system: 'Heart and circulation' },
  { value: 'hypertension', text: 'Hypertension', system: 'Heart and circulation' },
  { value: 'severe-hypertension', text: 'Severe or labile hypertension', system: 'Heart and circulation' },
  { value: 'cad', text: 'Coronary artery disease', system: 'Heart and circulation' },
  { value: 'cerebro-pvd', text: 'Cerebrovascular or peripheral arterial disease', system: 'Heart and circulation' },
  { value: 'stroke', text: 'Ischemic stroke or TIA', system: 'Heart and circulation' },
  { value: 'af', text: 'Atrial fibrillation', system: 'Heart and circulation' },
  { value: 'svt', text: 'Supraventricular tachyarrhythmia', system: 'Heart and circulation' },
  { value: 'brady-block', text: 'Bradycardia, heart block or unexplained syncope', system: 'Heart and circulation' },
  { value: 'qt-prolonged', text: 'Known QTc prolongation', system: 'Heart and circulation' },
  { value: 'aortic-stenosis', text: 'Severe symptomatic aortic stenosis', system: 'Heart and circulation' },
  { value: 'orthostatic', text: 'Orthostatic hypotension or syncope', system: 'Heart and circulation' },
  { value: 'hypotension', text: 'Symptomatic hypotension', system: 'Heart and circulation' },
  { value: 'ankle-edema', text: 'Dependent ankle edema', system: 'Heart and circulation' },
  { value: 'iron-deficiency', text: 'Iron deficiency', system: 'Heart and circulation' },
  { value: 'frail-85', text: 'Age 85+ with frailty, life expectancy under 3 years', system: 'Heart and circulation' },
  { value: 'bleeding', text: 'Bleeding risk, recent bleeding or major hemorrhage', system: 'Blood clots and bleeding' },
  { value: 'vte-history', text: 'History of venous thromboembolism', system: 'Blood clots and bleeding' },
  { value: 'dvt-first', text: 'First DVT, no continuing provoking factor', system: 'Blood clots and bleeding' },
  { value: 'pe-first', text: 'First pulmonary embolism, no continuing provoking factor', system: 'Blood clots and bleeding' },
  { value: 'dementia', text: 'Dementia or chronic cognitive impairment', system: 'Brain and mood' },
  { value: 'bpsd', text: 'Behavioral and psychological symptoms of dementia', system: 'Brain and mood' },
  { value: 'delirium', text: 'Delirium', system: 'Brain and mood' },
  { value: 'depression', text: 'Major depression', system: 'Brain and mood' },
  { value: 'anxiety', text: 'Persistent severe anxiety', system: 'Brain and mood' },
  { value: 'psychosis', text: 'Psychosis', system: 'Brain and mood' },
  { value: 'insomnia', text: 'Insomnia', system: 'Brain and mood' },
  { value: 'parkinsonism', text: 'Parkinsonism or dementia with Lewy bodies', system: 'Brain and mood' },
  { value: 'parkinsons', text: 'Parkinson disease with disability', system: 'Brain and mood' },
  { value: 'drug-eps', text: 'Drug-induced parkinsonism or EPS', system: 'Brain and mood' },
  { value: 'seizure', text: 'Seizure disorder', system: 'Brain and mood' },
  { value: 'essential-tremor', text: 'Essential tremor', system: 'Brain and mood' },
  { value: 'rls', text: 'Restless legs syndrome', system: 'Brain and mood' },
  { value: 'falls', text: 'Recurrent falls', system: 'Brain and mood' },
  { value: 'glaucoma', text: 'Narrow-angle glaucoma', system: 'Brain and mood' },
  { value: 'pud-gi-bleed', text: 'Peptic ulcer disease or GI bleeding', system: 'Stomach and bowel' },
  { value: 'upper-gi', text: 'Esophagitis, gastritis or severe reflux', system: 'Stomach and bowel' },
  { value: 'gave', text: 'Gastric antral vascular ectasia (GAVE)', system: 'Stomach and bowel' },
  { value: 'hp-ulcer', text: 'H. pylori peptic ulcer', system: 'Stomach and bowel' },
  { value: 'dysphagia', text: 'Dysphagia', system: 'Stomach and bowel' },
  { value: 'constipation', text: 'Chronic constipation', system: 'Stomach and bowel' },
  { value: 'diverticulosis', text: 'Diverticulosis', system: 'Stomach and bowel' },
  { value: 'copd', text: 'COPD', system: 'Lungs' },
  { value: 'asthma', text: 'Asthma', system: 'Lungs' },
  { value: 'hypoxemia', text: 'Chronic hypoxemia or respiratory failure', system: 'Lungs' },
  { value: 'osteoarthritis', text: 'Osteoarthritis', system: 'Bones, joints and pain' },
  { value: 'rheumatoid', text: 'Rheumatoid arthritis', system: 'Bones, joints and pain' },
  { value: 'gout', text: 'Gout', system: 'Bones, joints and pain' },
  { value: 'osteoporosis', text: 'Osteoporosis or fragility fracture', system: 'Bones, joints and pain' },
  { value: 'vitd-deficiency', text: 'Vitamin D deficiency (housebound, falls or osteopenia)', system: 'Bones, joints and pain' },
  { value: 'denosumab-stopped', text: 'Denosumab stopped', system: 'Bones, joints and pain' },
  { value: 'teriparatide-stopped', text: 'Teriparatide or abaloparatide stopped', system: 'Bones, joints and pain' },
  { value: 'pain-severe', text: 'Moderate to severe pain, not arthritis', system: 'Bones, joints and pain' },
  { value: 'neuropathic-pain', text: 'Localized neuropathic pain', system: 'Bones, joints and pain' },
  { value: 'low-bmi-liver', text: 'BMI under 18 or chronic liver disease', system: 'Bones, joints and pain' },
  { value: 'bph', text: 'BPH, LUTS or urinary retention', system: 'Bladder, kidney and hormones' },
  { value: 'incontinence', text: 'Urinary incontinence or frequency', system: 'Bladder, kidney and hormones' },
  { value: 'asymptomatic-bacteriuria', text: 'Asymptomatic bacteriuria', system: 'Bladder, kidney and hormones' },
  { value: 'recurrent-uti', text: 'Recurrent urinary tract infections (women)', system: 'Bladder, kidney and hormones' },
  { value: 'atrophic-vaginitis', text: 'Symptomatic atrophic vaginitis', system: 'Bladder, kidney and hormones' },
  { value: 'erectile-dysfunction', text: 'Erectile dysfunction causing distress', system: 'Bladder, kidney and hormones' },
  { value: 'ckd-proteinuria', text: 'Kidney disease with proteinuria', system: 'Bladder, kidney and hormones' },
  { value: 'ckd-mineral', text: 'Low calcium with secondary hyperparathyroidism', system: 'Bladder, kidney and hormones' },
  { value: 'hyperphosphatemia', text: 'Phosphate persistently above 5.5 mg/dL', system: 'Bladder, kidney and hormones' },
  { value: 'renal-anemia', text: 'Symptomatic anemia of kidney disease', system: 'Bladder, kidney and hormones' },
  { value: 'diabetes', text: 'Type 2 diabetes', system: 'Bladder, kidney and hormones' },
  { value: 'hypoglycemia', text: 'Frequent hypoglycemia', system: 'Bladder, kidney and hormones' },
  { value: 'breast-cancer', text: 'History of breast cancer', system: 'Bladder, kidney and hormones' },
  { value: 'intact-uterus', text: 'Intact uterus', system: 'Bladder, kidney and hormones' },
  { value: 'subclinical-hypothyroid', text: 'Subclinical hypothyroidism (TSH under 10)', system: 'Bladder, kidney and hormones' },
  { value: 'low-k', text: 'Potassium under 3.0 mmol/L', system: 'Lab values' },
  { value: 'high-k', text: 'Potassium above 5.5 mmol/L', system: 'Lab values' },
  { value: 'low-na', text: 'Sodium under 130 mmol/L', system: 'Lab values' },
  { value: 'high-ca', text: 'Corrected calcium above 2.65 mmol/L', system: 'Lab values' },
];
const TITLES = {
  STOPP: { A: 'Indication of medication', B: 'Cardiovascular System', C: 'Coagulation System', D: 'Central Nervous System', E: 'Renal System', F: 'Gastrointestinal System', G: 'Respiratory System', H: 'Musculoskeletal System', I: 'Urogenital System', J: 'Endocrine System', K: 'Drug classes that predictably increase falls risk in susceptible older people', L: 'Analgesic Drugs', M: 'Antimuscarinic/Anticholinergic Drug Burden' },
  START: { A: 'Indicated drugs', B: 'Cardiovascular System', C: 'Coagulation System', D: 'Central Nervous System', E: 'Renal System', F: 'Gastrointestinal System', G: 'Respiratory System', H: 'Musculoskeletal System', I: 'Urogenital System', J: 'Endocrine System', K: 'Analgesics', L: 'Vaccines' },
};
// The criterion text is under `source:`: quoted verbatim, in the source's own spelling. Rule keys: w = groups
// that must each have a tick;
// u = ticks that suppress (STOPP); o = groups of which one unticked is an omission (START);
// e = ['lt' | 'gt', eGFR]; two = classes of which any two ticked also match.
const C = [
  { part: 'STOPP', section: 'A', n: 1, source: 'Any drug prescribed without a clinical indication.', rule: null },
  { part: 'STOPP', section: 'A', n: 2, source: 'Any drug prescribed beyond the recommended duration, where treatment duration is well defined.', rule: null },
  { part: 'STOPP', section: 'A', n: 3, source: 'Any duplicate drug class prescription for daily regular use (as distinct from PRN use) e.g., two concurrent NSAIDs, SSRIs, loop diuretics, ACE inhibitors, anticoagulants, antipsychotics, opioid analgesics (optimisation of monotherapy within a single drug class should be observed prior to considering a new agent).', rule: null },
  { part: 'STOPP', section: 'B', n: 1, source: 'Digoxin for heart failure with normal systolic ventricular function (no clear evidence of benefit)', rule: { w: [['digoxin'], ['hf-pef']] } },
  { part: 'STOPP', section: 'B', n: 2, source: 'Verapamil or diltiazem with NYHA Class III or IV heart failure (may worsen heart failure with reduced ejection fraction i.e., HFREF).', rule: { w: [['ndhp-ccb'], ['nyha-3-4']] } },
  { part: 'STOPP', section: 'B', n: 3, source: 'Beta-blocker in combination with verapamil or diltiazem (risk of heart block).', rule: { w: [['beta-blocker'], ['ndhp-ccb']] } },
  { part: 'STOPP', section: 'B', n: 4, source: 'Ventricular rate-limiting drugs i.e., beta blocker, verapamil, diltiazem, digoxin with bradycardia (< 50/min), type II heart block or complete heart block (risk of complete heart block, asystole).', rule: { w: [['beta-blocker', 'ndhp-ccb', 'digoxin'], ['brady-block']] } },
  { part: 'STOPP', section: 'B', n: 5, source: 'Beta-blocker as monotherapy for uncomplicated hypertension i.e., not associated with angina pectoris, aortic aneurysm or other condition where beta-blocker therapy is indicated (no firm evidence of efficacy).', rule: { w: [['beta-blocker'], ['hypertension']], u: ['ace-inhibitor', 'arb', 'arni', 'dhp-ccb', 'ndhp-ccb', 'thiazide', 'loop-diuretic', 'central-antihypertensive', 'alpha-blocker', 'mra', 'vasodilator', 'cad'] } },
  { part: 'STOPP', section: 'B', n: 6, source: 'Amiodarone as first-line antiarrhythmic therapy in supraventricular tachyarrhythmias (higher risk of major side-effects than beta-blockers, digoxin, verapamil or diltiazem).', rule: { w: [['amiodarone'], ['svt']] } },
  { part: 'STOPP', section: 'B', n: 7, source: 'Loop diuretic as first-line treatment for hypertension unless there is concurrent heart failure requiring diuretic therapy (safer, more effective alternatives available).', rule: { w: [['loop-diuretic'], ['hypertension']], u: ['hf-ref', 'hf-pef', 'nyha-3-4'] } },
  { part: 'STOPP', section: 'B', n: 8, source: 'Loop diuretic for dependent ankle oedema without clinical, biochemical or radiological evidence of heart failure, liver failure, nephrotic syndrome or renal failure (leg elevation and /or compression hosiery usually more appropriate).', rule: { w: [['loop-diuretic'], ['ankle-edema']], u: ['hf-ref', 'hf-pef', 'nyha-3-4'] } },
  { part: 'STOPP', section: 'B', n: 9, source: 'Thiazide diuretic with current significant hypokalaemia (i.e., serum K+ < 3.0 mmol/l), hyponatraemia (i.e., serum Na+ < 130 mmol/l) hypercalcaemia (i.e., corrected serum calcium > 2.65 mmol/l) or with a history of gout (hypokalaemia, hyponatraemia, hypercalcaemia and gout can be precipitated by thiazide diuretic)', rule: { w: [['thiazide'], ['low-k', 'low-na', 'high-ca', 'gout']] } },
  { part: 'STOPP', section: 'B', n: 10, source: 'Loop diuretic for treatment of hypertension with concurrent urinary incontinence (may exacerbate incontinence).', rule: { w: [['loop-diuretic'], ['hypertension'], ['incontinence']] } },
  { part: 'STOPP', section: 'B', n: 11, source: 'Centrally-acting antihypertensives e.g., methyldopa, clonidine, moxonidine, rilmenidine, guanfacine (centrally-active antihypertensives are generally less well tolerated by older people than younger people)', rule: { w: [['central-antihypertensive']] } },
  { part: 'STOPP', section: 'B', n: 12, source: 'Angiotensin-Converting Enzyme inhibitors (ACEIs) or Angiotensin Receptor Blockers (ARBs) in patients with hyperkalaemia i.e., serum K > 5.5 mmol/l.', rule: { w: [['ace-inhibitor', 'arb'], ['high-k']] } },
  { part: 'STOPP', section: 'B', n: 13, source: 'Aldosterone antagonists (e.g., spironolactone, eplerenone) with concurrent potassium-conserving drugs (e.g., ACEI’s, ARB’s, amiloride, triamterene) without monitoring of serum potassium (risk of dangerous hyperkalaemia i.e., > 6.0 mmol/l – serum K should be monitored regularly, i.e., at least every 6 months).', rule: { w: [['mra'], ['ace-inhibitor', 'arb', 'k-sparing']] } },
  { part: 'STOPP', section: 'B', n: 14, source: 'Phosphodiesterase type-5 inhibitors (e.g., sildenafil, tadalafil, vardenafil) in severe heart failure characterised by hypotension i.e., systolic BP < 90 mmHg, or concurrent nitrate therapy for angina (risk of cardiovascular collapse).', rule: { w: [['pde5'], ['nyha-3-4', 'hypotension', 'nitrate']] } },
  { part: 'STOPP', section: 'B', n: 15, source: 'Drugs that predictably prolong the QTc interval (QTc = QT/RR) in patients with known with demonstrable QTc prolongation (to >450 msec in males and >470 msec in females), including quinolones, macrolides, ondansetron, citalopram (doses > 20 mg/day), escitalopram (doses > 10 mg/day), tricyclic antidepressants, lithium, haloperidol, digoxin, class 1A antiarrhythmics, class III antiarrhythmics, tizanidine, phenothiazines, astemizole, mirabegron (risk of life-threatening ventricular arrhythmias).', rule: { w: [['qt-drug', 'amiodarone', 'tca', 'phenothiazine', 'antipsychotic', 'digoxin', 'ssri'], ['qt-prolonged']] } },
  { part: 'STOPP', section: 'B', n: 16, source: 'Statins for primary cardiovascular prevention in persons aged ≥ 85 and established frailty with expected life expectancy likely less than 3 years (lack of evidence of efficacy).', rule: { w: [['statin'], ['frail-85']], u: ['cad', 'cerebro-pvd', 'stroke'] } },
  { part: 'STOPP', section: 'B', n: 17, source: 'Long-term systemic i.e., non-topical NSAIDs with known history of coronary, cerebral or peripheral vascular disease (increased risk of thrombosis).', rule: { w: [['nsaid'], ['cad', 'cerebro-pvd', 'stroke']] } },
  { part: 'STOPP', section: 'B', n: 18, source: 'Long-term antipsychotics with known history of coronary, cerebral or peripheral vascular disease (increased risk of thrombosis).', rule: { w: [['antipsychotic', 'phenothiazine'], ['cad', 'cerebro-pvd', 'stroke']] } },
  { part: 'STOPP', section: 'B', n: 19, source: 'NSAIDs or systemic corticosteroids with heart failure requiring loop diuretic therapy (risk of exacerbation of heart failure).', rule: { w: [['nsaid', 'corticosteroid'], ['hf-ref', 'hf-pef', 'nyha-3-4']] } },
  { part: 'STOPP', section: 'B', n: 20, source: 'Antihypertensive drugs in severe symptomatic aortic stenosis (risk of severe hypotension, syncope).', rule: { w: [['ace-inhibitor', 'arb', 'arni', 'beta-blocker', 'dhp-ccb', 'ndhp-ccb', 'thiazide', 'loop-diuretic', 'central-antihypertensive', 'alpha-blocker', 'mra', 'vasodilator'], ['aortic-stenosis']] } },
  { part: 'STOPP', section: 'B', n: 21, source: 'Digoxin as first line treatment for long-term (> 3 months) ventricular rate control in atrial fibrillation (increased mortality from long-term digoxin use; cardio-selective beta-blockers are generally preferable).', rule: { w: [['digoxin'], ['af']] } },
  { part: 'STOPP', section: 'C', n: 1, source: 'Long-term aspirin at doses greater than 100mg per day (increased risk of bleeding, no evidence for increased efficacy).', rule: { w: [['aspirin']] } },
  { part: 'STOPP', section: 'C', n: 2, source: 'Antiplatelet agents, vitamin K antagonists, direct thrombin inhibitors or factor Xa inhibitors with concurrent significant risk of major bleeding, i.e. uncontrolled severe hypertension, bleeding diathesis, recent non-trivial spontaneous bleeding (high risk of bleeding).', rule: { w: [['aspirin', 'p2y12', 'ticlopidine', 'vka', 'dabigatran', 'xa-inhibitor'], ['bleeding', 'severe-hypertension']] } },
  { part: 'STOPP', section: 'C', n: 3, source: 'Aspirin plus clopidogrel as long-term secondary stroke prevention i.e., > 4 weeks, unless the patient has a coronary stent(s) inserted in the previous 12 months or concurrent acute coronary syndrome or has a high grade symptomatic carotid arterial stenosis (no evidence of added long-term benefit over clopidogrel monotherapy).', rule: { w: [['aspirin'], ['p2y12'], ['stroke']] } },
  { part: 'STOPP', section: 'C', n: 4, source: 'Antiplatelet agents in combination with vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors in patients with chronic atrial fibrillation, unless there is concurrent coronary artery stent(s) inserted or angiographically proven high grade (> 50%) coronary artery stenosis (no added benefit from antiplatelet agents).', rule: { w: [['aspirin', 'p2y12', 'ticlopidine'], ['vka', 'dabigatran', 'xa-inhibitor'], ['af']] } },
  { part: 'STOPP', section: 'C', n: 5, source: 'Antiplatelet agents with vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors in patients with stable coronary, cerebrovascular or peripheral arterial disease (no evidence of added benefit from dual therapy).', rule: { w: [['aspirin', 'p2y12', 'ticlopidine'], ['vka', 'dabigatran', 'xa-inhibitor'], ['cad', 'cerebro-pvd', 'stroke']] } },
  { part: 'STOPP', section: 'C', n: 6, source: 'Ticlopidine in any circumstances (clopidogrel and prasugrel have similar efficacy, stronger evidence and fewer side-effects).', rule: { w: [['ticlopidine']] } },
  { part: 'STOPP', section: 'C', n: 7, source: 'Antiplatelet agents as alternatives to vitamin K antagonists, direct thrombin inhibitors or factor Xa inhibitors for stroke prevention in patients with chronic atrial fibrillation (no evidence of efficacy).', rule: { w: [['aspirin', 'p2y12', 'ticlopidine'], ['af']], u: ['vka', 'dabigatran', 'xa-inhibitor'] } },
  { part: 'STOPP', section: 'C', n: 8, source: 'Vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors for first deep venous thrombosis without continuing provoking risk factors (e.g., thrombophilia) for longer than 6 months, (no proven added benefit).', rule: { w: [['vka', 'dabigatran', 'xa-inhibitor'], ['dvt-first']] } },
  { part: 'STOPP', section: 'C', n: 9, source: 'Vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors for first pulmonary embolus without continuing provoking risk factors (e.g., thrombophilia) for longer than 12 months (no proven added benefit).', rule: { w: [['vka', 'dabigatran', 'xa-inhibitor'], ['pe-first']] } },
  { part: 'STOPP', section: 'C', n: 10, source: 'Nonsteroidal anti-inflammatory drugs (NSAIDs) and vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitors in combination (risk of major gastrointestinal bleeding).', rule: { w: [['nsaid'], ['vka', 'dabigatran', 'xa-inhibitor']] } },
  { part: 'STOPP', section: 'C', n: 11, source: 'Vitamin K antagonist as first-line anticoagulant for atrial fibrillation, unless there is concurrent metallic heart valve in-situ, moderate-to-severe mitral stenosis, or eGFR < 15 mls/min./1.73m2 (direct thrombin inhibitors or factor Xa inhibitors are equally efficacious and safer than vitamin K antagonists).', rule: { w: [['vka'], ['af']] } },
  { part: 'STOPP', section: 'C', n: 12, source: 'Selective serotonin reuptake inhibitors (SSRIs) in combination with Vitamin K antagonist, direct thrombin inhibitor or factor Xa inhibitor with a previous history of major haemorrhage (increased risk of bleeding due to antiplatelet effects of SSRIs).', rule: { w: [['ssri'], ['vka', 'dabigatran', 'xa-inhibitor'], ['bleeding']] } },
  { part: 'STOPP', section: 'C', n: 13, source: 'Direct thrombin inhibitor (e.g., dabigatran) and diltiazem or verapamil (increased risk of bleeding).', rule: { w: [['dabigatran'], ['ndhp-ccb']] } },
  { part: 'STOPP', section: 'C', n: 14, source: 'Apixaban, dabigatran, edoxaban, rivaroxaban and P-glycoprotein (P-gp) drug efflux pump inhibitors e.g., amiodarone, azithromycin, carvedilol, cyclosporin, dronedarone, itraconazole, ketoconazole (systemic), macrolides, quinine, ranolazine, tamoxifen, ticagrelor, verapamil (increased risk of bleeding).', rule: { w: [['dabigatran', 'xa-inhibitor'], ['pgp-inhibitor', 'amiodarone', 'ndhp-ccb', 'beta-blocker', 'p2y12']] } },
  { part: 'STOPP', section: 'C', n: 15, source: 'Systemic oestrogens or androgens with pervious history of venous thromboembolism (increased risk of recurrent venous thromboembolism).', rule: { w: [['estrogen', 'androgen'], ['vte-history']] } },
  { part: 'STOPP', section: 'C', n: 16, source: 'Aspirin for primary prevention in cardiovascular disease (no evidence of benefit).', rule: { w: [['aspirin']], u: ['cad', 'cerebro-pvd', 'stroke'] } },
  { part: 'STOPP', section: 'D', n: 1, source: 'TriCyclic Antidepressants (TCAs) in patients with dementia, narrow angle glaucoma, cardiac conduction abnormalities, prostatism, chronic constipation, recent falls, prior history of urinary retention or orthostatic hypotension (risk of worsening these conditions).', rule: { w: [['tca'], ['dementia', 'glaucoma', 'brady-block', 'bph', 'constipation', 'falls', 'orthostatic']] } },
  { part: 'STOPP', section: 'D', n: 2, source: 'Initiation of TriCyclic Antidepressants (TCAs) as first-line treatment for major depression (higher risk of adverse drug reactions with TCAs than with SSRIs or SNRIs).', rule: { w: [['tca'], ['depression']] } },
  { part: 'STOPP', section: 'D', n: 3, source: 'Serotonin/noradrenaline reuptake inhibitors (SNRI’s e.g., venlafaxine, duloxetine) and severe hypertension i.e., systolic blood pressure > 180 mmHg +/- diastolic blood pressure > 105 mmHg (likely to make hypertension worse).', rule: { w: [['snri'], ['severe-hypertension']] } },
  { part: 'STOPP', section: 'D', n: 4, source: 'Antipsychotics with moderate-marked antimuscarinic/anticholinergic effects (acepromazine, chlorpromazine, clozapine, flupenthixol, fluphenzine, levomepromazine, olanzapine, pipothiazine, promazine, thioridazine) with a history of lower urinary tract symptoms associated with benign prostatic hyperplasia or previous urinary retention (high risk of urinary retention).', rule: { w: [['antipsychotic', 'phenothiazine'], ['bph']] } },
  { part: 'STOPP', section: 'D', n: 5, source: 'Antipsychotics prescribed for behavioural and psychological symptoms of dementia (BPSD) an unchanged dose for > 3 months without medication review (increased risk of extrapyramidal side-effects and chronic worsening of cognition, increased risk of major cardiovascular morbidity and mortality).', rule: { w: [['antipsychotic', 'phenothiazine'], ['bpsd']] } },
  { part: 'STOPP', section: 'D', n: 6, source: 'Selective serotonin re-uptake inhibitors (SSRI’s) with current or recent significant hyponatraemia i.e., serum Na+ < 130 mmol/l (risk of exacerbating or precipitating hyponatraemia).', rule: { w: [['ssri'], ['low-na']] } },
  { part: 'STOPP', section: 'D', n: 7, source: 'Selective serotonin re-uptake inhibitors (SSRI’s) with current or recent significant bleeding (risk of exacerbation or recurrence of bleeding due to antiplatelet effects of SSRI’s).', rule: { w: [['ssri'], ['bleeding']] } },
  { part: 'STOPP', section: 'D', n: 8, source: 'Benzodiazepines for ≥ 4 weeks (no indication for longer treatment; risk of prolonged sedation, confusion, impaired balance, falls, road traffic accidents; all benzodiazepines should be withdrawn gradually if taken for more than 4 weeks as there is a risk of causing a benzodiazepine withdrawal syndrome if stopped abruptly).', rule: { w: [['benzodiazepine']] } },
  { part: 'STOPP', section: 'D', n: 9, source: 'Benzodiazepines for agitated behaviour or psychotic symptoms of dementia (no evidence of efficacy).', rule: { w: [['benzodiazepine'], ['dementia', 'bpsd']] } },
  { part: 'STOPP', section: 'D', n: 10, source: 'Benzodiazepines for insomnia for ≥ 2 weeks (high risk of dependency, increased risk of falls, fractures and road traffic accidents).', rule: { w: [['benzodiazepine'], ['insomnia']] } },
  { part: 'STOPP', section: 'D', n: 11, source: 'Z-drugs (zolpidem, zopiclone, zaleplon) for insomnia for ≥ 2 weeks (increased risk of falls, fractures).', rule: { w: [['z-drug'], ['insomnia']] } },
  { part: 'STOPP', section: 'D', n: 12, source: 'Antipsychotics (i.e., other than clozapine or quetiapine) in those with parkinsonism or Dementia with Lewy Bodies (risk of severe extra-pyramidal symptoms).', rule: { w: [['antipsychotic', 'phenothiazine'], ['parkinsonism']] } },
  { part: 'STOPP', section: 'D', n: 13, source: 'Anticholinergic/antimuscarinic drugs (biperiden, orphenadrine, procyclidine, trihexyphenidyl) to treat extra-pyramidal side-effects of antipsychotic medications (risk of anticholinergic toxicity).', rule: { w: [['eps-anticholinergic']] } },
  { part: 'STOPP', section: 'D', n: 14, source: 'Drugs with potent anticholinergics/antimuscarinic effects** in patients with delirium or dementia (risk of exacerbation of cognitive impairment). ** Commonly prescribed drugs with potent anticholinergic/ antimuscarinic effects include tricyclic antidepressants (e.g., amitriptyline, doxepin, impramine, nortriptyline), antipsychotics (chlorpromazine, clozapine, thioridazine), first generation antihistamines (e.g., diphenhydramine, chlorpheniramine), bladder anti-spasmodics (e.g., tolterodine, oxybutynin), hyoscine, procyclidine, benzatropine, tizanidine.', rule: { w: [['tca', 'antihistamine-1g', 'bladder-antimuscarinic', 'antipsychotic', 'phenothiazine', 'eps-anticholinergic'], ['delirium', 'dementia']] } },
  { part: 'STOPP', section: 'D', n: 15, source: 'Antipsychotics in patients with behavioural and psychological symptoms of dementia (BPSD) for longer than 12 weeks unless BPSD symptoms are severe and other non-pharmacological treatments have failed (increased risk of stroke, myocardial infarction).', rule: { w: [['antipsychotic', 'phenothiazine'], ['bpsd']] } },
  { part: 'STOPP', section: 'D', n: 16, source: 'Antipsychotics as hypnotics, unless sleep disorder is due to psychosis or BPSD effects of dementia (not recommended in summary of product characteristics; increased risk of confusion, hypotension, extra-pyramidal side effects, falls).', rule: { w: [['antipsychotic', 'phenothiazine'], ['insomnia']] } },
  { part: 'STOPP', section: 'D', n: 17, source: 'Acetylcholinesterase inhibitors with a known history of persistent bradycardia (< 60 beats/min.), heart block or recurrent unexplained syncope (risk of cardiac conduction failure, syncope and injury).', rule: { w: [['ache-inhibitor'], ['brady-block']] } },
  { part: 'STOPP', section: 'D', n: 18, source: 'Acetylcholinesterase inhibitors with concurrent treatment with drugs that induce persistent bradycardia (< 60 beats/min.) such as beta-blockers, digoxin, diltiazem, verapamil (risk of cardiac conduction failure, syncope and injury).', rule: { w: [['ache-inhibitor'], ['beta-blocker', 'digoxin', 'ndhp-ccb']] } },
  { part: 'STOPP', section: 'D', n: 19, source: 'Memantine with known current or previous seizure disorder (increased risk of seizures).', rule: { w: [['memantine'], ['seizure']] } },
  { part: 'STOPP', section: 'D', n: 20, source: 'Nootropics in dementia including Gingko Biloba, piracetam, pramiracetam, phenylpiracetam, aniracetam, phosphatidylserine, modafinil, L-theanine, omega-3 fatty acids, panax ginseng, rhodiola, creatine (no evidence of efficacy).', rule: { w: [['nootropic'], ['dementia']] } },
  { part: 'STOPP', section: 'D', n: 21, source: 'Phenothiazines as first-line treatment for psychosis or non-cognitive symptoms of dementia, since safer and more efficacious alternatives exist (phenothiazines are sedative, have significant anti-muscarinic toxicity in older people, except for prochlorperazine for nausea/vomiting/vertigo, chlorpromazine for relief of persistent hiccoughs and levomepromazine as an anti-emetic in palliative care).', rule: { w: [['phenothiazine'], ['psychosis', 'bpsd', 'dementia']] } },
  { part: 'STOPP', section: 'D', n: 22, source: 'Levodopa or dopamine agonists for benign essential tremor (no evidence of efficacy)', rule: { w: [['levodopa-da'], ['essential-tremor']] } },
  { part: 'STOPP', section: 'D', n: 23, source: 'Levodopa or dopamine agonists for treatment of extrapyramidal side-effects of antipsychotics or other forms of drug-induced Parkinsonism (inappropriate prescribing cascade to be avoided).', rule: { w: [['levodopa-da'], ['drug-eps']] } },
  { part: 'STOPP', section: 'D', n: 24, source: 'First-generation antihistamines as first-line treatment for allergy or pruritus (safer antihistamines with fewer side-effects now widely available).', rule: { w: [['antihistamine-1g']] } },
  { part: 'STOPP', section: 'D', n: 25, source: 'First-generation antihistamines for insomnia (high risk of side-effects, Z-drugs safer and more appropriate for short-term use).', rule: { w: [['antihistamine-1g'], ['insomnia']] } },
  { part: 'STOPP', section: 'E', n: 1, source: 'Digoxin at a long-term (i.e. more than 90 days) maintenance dose ≥ 125µg/day if eGFR < 30 ml/min/1.73m2 (risk of digoxin toxicity if plasma levels not measured).', rule: { w: [['digoxin']], e: ['lt', 30] } },
  { part: 'STOPP', section: 'E', n: 2, source: 'Direct thrombin inhibitors (e.g., dabigatran) if eGFR < 30 ml/min/1.73m2 (risk of bleeding)', rule: { w: [['dabigatran']], e: ['lt', 30] } },
  { part: 'STOPP', section: 'E', n: 3, source: 'Factor Xa inhibitors (e.g., rivaroxaban, apixaban, edoxaban) if eGFR < 15 ml/min/1.73m 2 (risk of bleeding)', rule: { w: [['xa-inhibitor']], e: ['lt', 15] } },
  { part: 'STOPP', section: 'E', n: 4, source: 'NSAID’s if eGFR < 50 ml/min/1.73m2 (risk of deterioration in renal function).', rule: { w: [['nsaid']], e: ['lt', 50] } },
  { part: 'STOPP', section: 'E', n: 5, source: 'Colchicine if eGFR < 10 ml/min/1.73m2 (risk of colchicine toxicity)', rule: { w: [['colchicine']], e: ['lt', 10] } },
  { part: 'STOPP', section: 'E', n: 6, source: 'Metformin if eGFR < 30 ml/min/1.73m2 (risk of lactic acidosis).', rule: { w: [['metformin']], e: ['lt', 30] } },
  { part: 'STOPP', section: 'E', n: 7, source: 'Mineralocorticoid receptor antagonists (e.g. spironolactone, eplerenone) if eGFR < 30 ml/min/1.73m2 (risk of dangerous hyperkalaemia).', rule: { w: [['mra']], e: ['lt', 30] } },
  { part: 'STOPP', section: 'E', n: 8, source: 'Nitrofurantoin if eGFR < 45 ml/min/1.73m2 (increased risk of nitrofurantoin toxicity).', rule: { w: [['nitrofurantoin']], e: ['lt', 45] } },
  { part: 'STOPP', section: 'E', n: 9, source: 'Bisphosphonates if eGFR<30 ml/min/1.73m2 (increased risk of acute renal failure).', rule: { w: [['bisphosphonate']], e: ['lt', 30] } },
  { part: 'STOPP', section: 'E', n: 10, source: 'Methotrexate if eGFR <30 ml/min/1.73m2 (increased risk of methotrexate toxicity).', rule: { w: [['methotrexate']], e: ['lt', 30] } },
  { part: 'STOPP', section: 'F', n: 1, source: 'Prochlorperazine or metoclopramide with Parkinsonism (risk of exacerbating Parkinsonian symptoms).', rule: { w: [['phenothiazine', 'metoclopramide'], ['parkinsonism']] } },
  { part: 'STOPP', section: 'F', n: 2, source: 'Proton pump inhibitor (PPI) for uncomplicated peptic ulcer disease at full therapeutic dosage for > 8 weeks (dose reduction or earlier discontinuation or H2 antagonist maintenance therapy usually indicated).', rule: { w: [['ppi'], ['pud-gi-bleed']] } },
  { part: 'STOPP', section: 'F', n: 3, source: 'Drugs likely to cause constipation (e.g. systemic antimuscarinics, oral iron, opioids, verapamil, aluminium antacids) with chronic constipation where non-constipating alternatives are available (risk of exacerbation of constipation).', rule: { w: [['tca', 'antihistamine-1g', 'bladder-antimuscarinic', 'antipsychotic', 'phenothiazine', 'eps-anticholinergic', 'oral-iron', 'opioid', 'ndhp-ccb'], ['constipation']] } },
  { part: 'STOPP', section: 'F', n: 4, source: 'Oral elemental iron doses greater than 200 mg daily (e.g. ferrous fumarate> 600 mg/day, ferrous sulphate > 600 mg/day, ferrous gluconate> 1800 mg/day; no evidence of enhanced iron absorption above these doses).', rule: { w: [['oral-iron']] } },
  { part: 'STOPP', section: 'F', n: 5, source: 'Corticosteroids with a history of peptic ulcer disease or erosive oesophagitis (risk of relapse unless proton pump inhibitor is co-prescribed).', rule: { w: [['corticosteroid'], ['pud-gi-bleed', 'upper-gi']] } },
  { part: 'STOPP', section: 'F', n: 6, source: 'Antiplatelet or anticoagulant drugs with a history of Gastric Antral Vascular Ectasia (GAVE, “watermelon stomach”) (risk of major gastrointestinal bleeding).', rule: { w: [['aspirin', 'p2y12', 'ticlopidine', 'vka', 'dabigatran', 'xa-inhibitor'], ['gave']] } },
  { part: 'STOPP', section: 'F', n: 7, source: 'Antipsychotics with dysphagia (increased risk of aspiration pneumonia).', rule: { w: [['antipsychotic', 'phenothiazine'], ['dysphagia']] } },
  { part: 'STOPP', section: 'F', n: 8, source: 'Megestrol acetate to increase appetite (increased risk of thrombosis and death with unproven efficacy)', rule: { w: [['megestrol']] } },
  { part: 'STOPP', section: 'G', n: 1, source: 'Theophylline as monotherapy for COPD (safer, more effective alternative; risk of adverse effects due to narrow therapeutic index).', rule: { w: [['theophylline'], ['copd']] } },
  { part: 'STOPP', section: 'G', n: 2, source: 'Systemic corticosteroids instead of inhaled corticosteroids for maintenance therapy in moderate-severe COPD (unnecessary exposure to long-term side-effects of systemic corticosteroids and effective inhaled therapies are available).', rule: { w: [['corticosteroid'], ['copd']] } },
  { part: 'STOPP', section: 'G', n: 3, source: 'Long-acting muscarinic antagonists (e.g., tiotropium, aclidinium, umeclidinium, glycopyrronium) with a history of narrow angle glaucoma (may exacerbate glaucoma) or bladder outflow obstruction (may cause urinary retention).', rule: { w: [['lama'], ['glaucoma', 'bph']] } },
  { part: 'STOPP', section: 'G', n: 4, source: 'Benzodiazepines with acute or chronic respiratory failure i.e. pO2 < 8.0 kPa ± pCO2 > 6.5 kPa (risk of exacerbation of respiratory failure).', rule: { w: [['benzodiazepine'], ['hypoxemia']] } },
  { part: 'STOPP', section: 'H', n: 1, source: 'Non-steroidal anti-inflammatory drugs (NSAIDs) other than COX-2 selective agents with history of peptic ulcer disease or gastrointestinal bleeding, unless with concurrent PPI or H2 antagonist (risk of peptic ulcer relapse).', rule: { w: [['nsaid'], ['pud-gi-bleed']] } },
  { part: 'STOPP', section: 'H', n: 2, source: 'NSAID’s with severe hypertension i.e., systolic blood pressure consistently above 170 mmHg and/or diastolic blood pressure consistently above 100 mmHg (risk of exacerbation of hypertension).', rule: { w: [['nsaid'], ['severe-hypertension']] } },
  { part: 'STOPP', section: 'H', n: 3, source: 'Long-term use of NSAID (>3 months) for symptom relief of osteoarthritis pain where paracetamol has not been tried (simple analgesics preferable and usually as effective for pain relief and safer).', rule: { w: [['nsaid'], ['osteoarthritis']], u: ['acetaminophen'] } },
  { part: 'STOPP', section: 'H', n: 4, source: 'Long-term corticosteroids (>3 months) as monotherapy for rheumatoid arthritis (risk of systemic corticosteroid side-effects).', rule: { w: [['corticosteroid'], ['rheumatoid']] } },
  { part: 'STOPP', section: 'H', n: 5, source: 'Corticosteroids (other than periodic intra-articular injections for mono-articular pain) for osteoarthritis (risk of systemic corticosteroid side-effects).', rule: { w: [['corticosteroid'], ['osteoarthritis']] } },
  { part: 'STOPP', section: 'H', n: 6, source: 'Long-term NSAID or colchicine (>3 months) for chronic treatment of gout where there is no contraindication to a xanthine-oxidase inhibitor (e.g., allopurinol, febuxostat) (xanthine-oxidase inhibitors are first choice prophylactic drugs in gout).', rule: { w: [['nsaid', 'colchicine'], ['gout']] } },
  { part: 'STOPP', section: 'H', n: 7, source: 'NSAID with concurrent corticosteroids for treatment of arthritis/rheumatism of any kind (increased risk of peptic ulcer disease).', rule: { w: [['nsaid'], ['corticosteroid'], ['osteoarthritis', 'rheumatoid', 'gout']] } },
  { part: 'STOPP', section: 'H', n: 8, source: 'Oral bisphosphonates in patients with a current or recent history of upper gastrointestinal disease i.e. dysphagia, oesophagitis, gastritis, duodenitis, or peptic ulcer disease, or upper gastrointestinal bleeding (risk of relapse/exacerbation of oesophagitis, oesophageal ulcer, oesophageal stricture).', rule: { w: [['bisphosphonate'], ['upper-gi', 'pud-gi-bleed', 'dysphagia']] } },
  { part: 'STOPP', section: 'H', n: 9, source: 'Long-term opioids for osteoarthritis (lack of evidence of efficacy, increased risk of serious side-effects).', rule: { w: [['opioid'], ['osteoarthritis']] } },
  { part: 'STOPP', section: 'I', n: 1, source: 'Systemic antimuscarinic drugs (e.g., oxybutynin, tolterodine, trospium) with dementia or chronic cognitive impairment (risk of increased confusion, agitation).', rule: { w: [['bladder-antimuscarinic'], ['dementia']] } },
  { part: 'STOPP', section: 'I', n: 2, source: 'Systemic antimuscarinic drugs (e.g., oxybutynin, tolterodine, trospium) with narrow-angle glaucoma (risk of acute exacerbation of glaucoma).', rule: { w: [['bladder-antimuscarinic'], ['glaucoma']] } },
  { part: 'STOPP', section: 'I', n: 3, source: 'Systemic antimuscarinic (e.g., oxybutynin, tolterodine, trospium) drugs for lower urinary tract symptoms with benign prostatic hyperplasia (BPH) and high post-void residual volume i.e. > 200 ml (uncertain efficacy and increased risk of urinary retention in older men).', rule: { w: [['bladder-antimuscarinic'], ['bph']] } },
  { part: 'STOPP', section: 'I', n: 4, source: 'Systemic antimuscarinic drugs (e.g., oxybutynin, tolterodine, trospium) with constipation (risk of exacerbation of constipation).', rule: { w: [['bladder-antimuscarinic'], ['constipation']] } },
  { part: 'STOPP', section: 'I', n: 5, source: 'Alpha-1 receptor antagonists other than silodosin (e.g., alfuzosin, doxazosin, indoramin, tamsulosin, terazosin) with symptomatic orthostatic hypotension or history of syncope (risk of precipitating recurrent syncope).', rule: { w: [['alpha-blocker'], ['orthostatic']] } },
  { part: 'STOPP', section: 'I', n: 6, source: 'Mirabegron in labile or severe hypertension (risk of exacerbation of hypertension).', rule: { w: [['mirabegron'], ['severe-hypertension']] } },
  { part: 'STOPP', section: 'I', n: 7, source: 'Duloxetine with urinary urgency or urge incontinence (duloxetine is indicated in stress incontinence but not in urinary urgency or urge incontinence).', rule: { w: [['snri'], ['incontinence']] } },
  { part: 'STOPP', section: 'I', n: 8, source: 'Antibiotic use in asymptomatic bacteriuria (no indication for treatment).', rule: { w: [['antibiotic'], ['asymptomatic-bacteriuria']] } },
  { part: 'STOPP', section: 'J', n: 1, source: 'Sulphonylureas with a long half-life (e.g., glibenclamide, chlorpropamide, glimepiride) with type 2 diabetes mellitus (risk of prolonged hypoglycaemia).', rule: { w: [['sulfonylurea-long'], ['diabetes']] } },
  { part: 'STOPP', section: 'J', n: 2, source: 'Thiazolidenediones (e.g., rosiglitazone, pioglitazone) with heart failure (risk of exacerbation of heart failure).', rule: { w: [['tzd'], ['hf-ref', 'hf-pef', 'nyha-3-4']] } },
  { part: 'STOPP', section: 'J', n: 3, source: 'Non-selective beta-blockers in diabetes mellitus with frequent hypoglycaemic episodes (risk of suppressing hypoglycaemic symptoms).', rule: { w: [['beta-blocker'], ['hypoglycemia']] } },
  { part: 'STOPP', section: 'J', n: 4, source: 'Sodium glucose co-transporter (SGLT2) inhibitors (e.g., canagliflozin, dapagliflozin, empagliflozin, ertugliflozin) with symptomatic hypotension (risk of exacerbation of hypotension).', rule: { w: [['sglt2'], ['hypotension', 'orthostatic']] } },
  { part: 'STOPP', section: 'J', n: 5, source: 'Systemic oestrogens with a history of breast cancer (increased risk of recurrence).', rule: { w: [['estrogen'], ['breast-cancer']] } },
  { part: 'STOPP', section: 'J', n: 6, source: 'Systemic oestrogens with a history of venous thromboembolism (increased risk of recurrence).', rule: { w: [['estrogen'], ['vte-history']] } },
  { part: 'STOPP', section: 'J', n: 7, source: 'Menopausal hormone therapy (oestrogen plus progestin) with a history of stenotic coronary, cerebral or peripheral arterial disease (increased risk of acute arterial thrombosis).', rule: { w: [['estrogen'], ['progestogen'], ['cad', 'cerebro-pvd', 'stroke']] } },
  { part: 'STOPP', section: 'J', n: 8, source: 'Systemic oestrogens without progestogens in patients with intact uterus (risk of endometrial cancer).', rule: { w: [['estrogen'], ['intact-uterus']], u: ['progestogen'] } },
  { part: 'STOPP', section: 'J', n: 9, source: 'Levothyroxine in subclinical hypothyroidism i.e., normal free T4, elevated TSH but < 10 mU/L (no evidence of benefit, risk of iatrogenic thyrotoxicosis).', rule: { w: [['levothyroxine'], ['subclinical-hypothyroid']] } },
  { part: 'STOPP', section: 'J', n: 10, source: 'Vasopressin analogues (e.g., desmopressin, vasopressin) for urinary incontinence or urinary frequency (risk of symptomatic hyponatraemia).', rule: { w: [['desmopressin'], ['incontinence']] } },
  { part: 'STOPP', section: 'K', n: 1, source: 'Benzodiazepines in patients with recurrent falls (may cause reduced sensorium, impair balance).', rule: { w: [['benzodiazepine'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 2, source: 'Antipsychotic drugs in patients with recurrent falls (may cause Parkinsonism).', rule: { w: [['antipsychotic', 'phenothiazine'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 3, source: 'Vasodilator drugs in patients with recurrent falls with persistent postural hypotension i.e., systolic BP drop ≥ 20 mmHg and/or diastolic BP drop ≥ 10 mmHg (risk of syncope, falls).', rule: { w: [['vasodilator', 'nitrate', 'alpha-blocker'], ['falls'], ['orthostatic']] } },
  { part: 'STOPP', section: 'K', n: 4, source: 'Hypnotic Z-drugs i.e., zopiclone, zolpidem, zaleplon in patients with recurrent falls (may cause protracted daytime sedation, ataxia).', rule: { w: [['z-drug'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 5, source: 'Anti-epileptic drugs in patients with recurrent falls (may impair sensorium, may adversely affect cerebellar function).', rule: { w: [['antiepileptic', 'gabapentinoid'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 6, source: 'First generation antihistamines in patients with recurrent falls (may impair sensorium).', rule: { w: [['antihistamine-1g'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 7, source: 'Opioids in patients with recurrent falls (may impair sensorium).', rule: { w: [['opioid'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 8, source: 'Antidepressants in patients with recurrent falls (may impair sensorium).', rule: { w: [['ssri', 'snri', 'tca', 'antidepressant-other'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 9, source: 'Alpha blockers as antihypertensives in patients with recurrent falls (may cause orthostatic hypotension).', rule: { w: [['alpha-blocker'], ['hypertension'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 10, source: 'Alpha blockers for prostatic bladder outflow symptoms, other than silodosin in patients with recurrent falls (may cause orthostatic hypotension).', rule: { w: [['alpha-blocker'], ['bph'], ['falls']] } },
  { part: 'STOPP', section: 'K', n: 11, source: 'Centrally acting antihypertensives (may impair sensorium and may cause orthostatic hypotension).', rule: { w: [['central-antihypertensive']] } },
  { part: 'STOPP', section: 'K', n: 12, source: 'Antimuscarinics for treatment of overactive bladder or urge incontinence (may impair sensorium).', rule: { w: [['bladder-antimuscarinic']] } },
  { part: 'STOPP', section: 'L', n: 1, source: 'Use of oral or transdermal strong opioids (morphine, oxycodone, fentanyl, buprenorphine, diamorphine, methadone, tramadol, pethidine, pentazocine) as first line therapy for mild pain (WHO analgesic ladder not observed; paracetamol or NSAID not prescribed as first-line therapy).', rule: { w: [['opioid']] } },
  { part: 'STOPP', section: 'L', n: 2, source: 'Use of daily regular (as distinct from PRN) opioids without concomitant laxative (risk of severe constipation).', rule: { w: [['opioid']], u: ['laxative'] } },
  { part: 'STOPP', section: 'L', n: 3, source: 'Long-acting opioids without short-acting opioids for break-through moderate or severe pain (risk of persistence of severe pain).', rule: { w: [['opioid']] } },
  { part: 'STOPP', section: 'L', n: 4, source: 'Topical lidocaine (lignocaine) patch for treatment of chronic osteoarthritis pain (lack of evidence of efficacy).', rule: { w: [['lidocaine-patch'], ['osteoarthritis']] } },
  { part: 'STOPP', section: 'L', n: 5, source: 'Gabapentinoids (e.g., gabapentin, pregabalin) for non-neuropathic pain (lack of evidence of efficacy).', rule: { w: [['gabapentinoid']] } },
  { part: 'STOPP', section: 'L', n: 6, source: 'Paracetamol at doses ≥ 3 g/24 hours in patients with poor nutritional status i.e., BMI < 18 or chronic liver disease (risk of hepatotoxicity).', rule: { w: [['acetaminophen'], ['low-bmi-liver']] } },
  { part: 'STOPP', section: 'M', n: 1, source: 'Concomitant use of two or more drugs with antimuscarinic/anticholinergic properties (e.g., bladder antispasmodics, intestinal antispasmodics, tricyclic antidepressants, first generation antihistamines, antipsychotics) (risk of increased antimuscarinic/anticholinergic toxicity).', rule: { w: [['anticholinergic-2']], two: ['tca', 'antihistamine-1g', 'bladder-antimuscarinic', 'antipsychotic', 'phenothiazine', 'eps-anticholinergic'] } },
  { part: 'START', section: 'A', n: 1, source: 'Where a drug is clearly indicated and considered appropriate in the particular clinical context and there is no clear contraindication, that drug should be initiated as per formulary guidelines for dose and duration.', rule: null },
  { part: 'START', section: 'B', n: 1, source: 'Antihypertensive therapy where systolic blood pressure > 140 mmHg and /or diastolic blood pressure > 90 mmHg, unless established moderate or severe physical frailty in whom the threshold for therapy is 150 mmHg systolic pressure and/or 90 mmHg diastolic pressure.', rule: { w: [['hypertension']], o: [['ace-inhibitor', 'arb', 'arni', 'beta-blocker', 'dhp-ccb', 'ndhp-ccb', 'thiazide', 'loop-diuretic', 'central-antihypertensive', 'alpha-blocker', 'mra', 'vasodilator']] } },
  { part: 'START', section: 'B', n: 2, source: 'Statin therapy with a documented history of coronary, cerebral or peripheral vascular disease, unless the patient’s status is end-of-life or established moderate or severe frailty.', rule: { w: [['cad', 'cerebro-pvd', 'stroke']], o: [['statin']] } },
  { part: 'START', section: 'B', n: 3, source: 'Angiotensin Converting Enzyme (ACE) inhibitor with coronary artery disease.', rule: { w: [['cad']], o: [['ace-inhibitor']] } },
  { part: 'START', section: 'B', n: 4, source: 'Beta-blocker with symptomatic coronary artery disease.', rule: { w: [['cad']], o: [['beta-blocker']] } },
  { part: 'START', section: 'B', n: 5, source: 'Angiotensin Converting Enzyme (ACE) inhibitor for heart failure with reduced ejection fraction.', rule: { w: [['hf-ref']], o: [['ace-inhibitor', 'arni']] } },
  { part: 'START', section: 'B', n: 6, source: 'Cardio-selective beta-blocker (bisoprolol, nebivolol, metoprolol or carvedilol) for stable heart failure with reduced ejection fraction.', rule: { w: [['hf-ref']], o: [['beta-blocker']] } },
  { part: 'START', section: 'B', n: 7, source: 'Mineralocorticoid receptor antagonist (spironolactone, eplerenone) in heart failure without severe renal function impairment i.e., eGFR > 30 ml/min/m2.', rule: { w: [['hf-ref', 'hf-pef', 'nyha-3-4']], o: [['mra']], e: ['gt', 30] } },
  { part: 'START', section: 'B', n: 8, source: 'SGLT-2 inhibitors (canagliflozin, dapagliflozin, empagliflozin, ertugliflozin) in symptomatic heart failure with or without reduced ejection fraction regardless of diabetes being present or not.', rule: { w: [['hf-ref', 'hf-pef', 'nyha-3-4']], o: [['sglt2']] } },
  { part: 'START', section: 'B', n: 9, source: 'Sacubitril/valsartan in heart failure with reduced ejection fraction causing persistent heart failure symptoms despite optimal dose of ACE inhibitor or Angiotensin Receptor Blocker (Sacubitril/valsartan to replace ACE inhibitor or Angiotensin Receptor Blocker).', rule: { w: [['hf-ref'], ['ace-inhibitor', 'arb']], o: [['arni']] } },
  { part: 'START', section: 'B', n: 10, source: 'Beta-blocker for chronic atrial fibrillation with uncontrolled heart rate.', rule: { w: [['af']], o: [['beta-blocker']] } },
  { part: 'START', section: 'B', n: 11, source: 'Intravenous iron for symptomatic heart failure with reduced ejection fraction and iron deficiency.', rule: { w: [['hf-ref'], ['iron-deficiency']], o: [['iv-iron']] } },
  { part: 'START', section: 'C', n: 1, source: 'Vitamin K antagonists or direct thrombin inhibitors or factor Xa inhibitors in the presence of chronic or paroxysmal atrial fibrillation.', rule: { w: [['af']], o: [['vka', 'dabigatran', 'xa-inhibitor']] } },
  { part: 'START', section: 'C', n: 2, source: 'Antiplatelet therapy (aspirin or clopidogrel or prasugrel or ticagrelor) with a documented history of coronary, cerebral or peripheral vascular disease.', rule: { w: [['cad', 'cerebro-pvd', 'stroke']], o: [['aspirin', 'p2y12']] } },
  { part: 'START', section: 'D', n: 1, source: 'L-DOPA or a dopamine agonist in idiopathic Parkinson’s disease with functional impairment and resultant disability.', rule: { w: [['parkinsons']], o: [['levodopa-da']] } },
  { part: 'START', section: 'D', n: 2, source: 'Non-TCA antidepressant for major depression.', rule: { w: [['depression']], o: [['ssri', 'snri', 'antidepressant-other']] } },
  { part: 'START', section: 'D', n: 3, source: 'Acetylcholinesterase inhibitor (donepezil, rivastigmine, galantamine) for mild-moderate Alzheimer’s dementia.', rule: { w: [['dementia']], o: [['ache-inhibitor']] } },
  { part: 'START', section: 'D', n: 4, source: 'Rivastigmine for Dementia with Lewy Bodies or Parkinson’s disease dementia.', rule: { w: [['dementia'], ['parkinsonism', 'parkinsons']], o: [['ache-inhibitor']] } },
  { part: 'START', section: 'D', n: 5, source: 'Selective serotonin reuptake inhibitor (or SNRI or pregabalin if SSRI contraindicated) for persistent severe anxiety that affects independent functioning and quality of life.', rule: { w: [['anxiety']], o: [['ssri', 'snri', 'gabapentinoid']] } },
  { part: 'START', section: 'D', n: 6, source: 'Dopamine agonist (ropinirole or pramipexole or rotigotine) for Restless Legs Syndrome, once iron deficiency and severe chronic kidney disease (i.e., eGFR < 30 ml/min/m2) have been excluded.', rule: { w: [['rls']], o: [['levodopa-da']] } },
  { part: 'START', section: 'D', n: 7, source: 'Propranolol for essential tremor with functional impairment and resultant disability.', rule: { w: [['essential-tremor']], o: [['beta-blocker']] } },
  { part: 'START', section: 'E', n: 1, source: 'One-alpha hydroxycholecalciferol or calcitriol supplementation in severe chronic kidney (i.e., eGFR < 30 ml/min/m2) disease with hypocalcaemia (corrected serum calcium < 2.10 mmol/l) and associated secondary hyperparathyroidism.', rule: { w: [['ckd-mineral']], o: [['calcitriol']], e: ['lt', 30] } },
  { part: 'START', section: 'E', n: 2, source: 'Phosphate binder in severe chronic kidney disease (i.e., eGFR < 30 ml/min/m2) if serum phosphate concentration persistently >1.76 mmol/l (5.5 mg/dl) despite adherence to renal diet.', rule: { w: [['hyperphosphatemia']], o: [['phosphate-binder']], e: ['lt', 30] } },
  { part: 'START', section: 'E', n: 3, source: 'Erythopoietin analogue in severe chronic kidney disease (i.e., eGFR < 30 ml/min/m2) with symptomatic anaemia not attributable to haematinic or iron deficiency to achieve a haemoglobin concentration of 10.0 to 12.0 g/dl.', rule: { w: [['renal-anemia']], o: [['esa']], e: ['lt', 30] } },
  { part: 'START', section: 'E', n: 4, source: 'Angiotensin receptor blocker (ARB) or Angiotensin Converting Enzyme Inhibitor (ACE-I) in chronic kidney disease with proteinuria i.e., urine albumin excretion >300 mg/24 hours.', rule: { w: [['ckd-proteinuria']], o: [['ace-inhibitor', 'arb']] } },
  { part: 'START', section: 'F', n: 1, source: 'Proton Pump Inhibitor with severe gastro-oesophageal reflux disease or peptic oesophageal stricture requiring dilatation.', rule: { w: [['upper-gi']], o: [['ppi']] } },
  { part: 'START', section: 'F', n: 2, source: 'Proton pump inhibitor with initiation of low-dose aspirin and previous history of peptic ulcer or reflux oesophagitis.', rule: { w: [['aspirin'], ['pud-gi-bleed', 'upper-gi']], o: [['ppi']] } },
  { part: 'START', section: 'F', n: 3, source: 'Proton pump inhibitor with short-term (< 2 weeks) or longer-term (> 2 weeks) NSAID.', rule: { w: [['nsaid']], o: [['ppi']] } },
  { part: 'START', section: 'F', n: 4, source: 'Fibre supplements (e.g., bran, ispaghula, methylcellulose, sterculia) for diverticulosis with a history of constipation.', rule: { w: [['diverticulosis'], ['constipation']], o: [['fiber']] } },
  { part: 'START', section: 'F', n: 5, source: 'Osmotic laxative (e.g., lactulose, macrogol, sorbitol) for chronic persistent idiopathic or secondary benign constipation.', rule: { w: [['constipation']], o: [['laxative']] } },
  { part: 'START', section: 'F', n: 6, source: 'Probiotics used with antibiotics in patients who are not immunocompromised or severely debilitated for the prevention of Clostridioides difficile-associated diarrhoea.', rule: { w: [['antibiotic']], o: [['probiotic']] } },
  { part: 'START', section: 'F', n: 7, source: 'Helicobacter pylori eradication therapy in HP-associated active peptic ulcer disease.', rule: { w: [['hp-ulcer']], o: [['hp-eradication']] } },
  { part: 'START', section: 'G', n: 1, source: 'Long-acting muscarinic antagonist (LAMA e.g., tiotropium, aclidinium, umeclidinium, glycopyrronium) or long-acting beta 2 agonist (LABA e.g., bambuterol, formoterol, indacaterol, olodaterol, salmeterol) for symptomatic COPD of GOLD 1 or 2 severity and chronic asthma.', rule: { w: [['copd', 'asthma']], o: [['lama', 'laba']] } },
  { part: 'START', section: 'G', n: 2, source: 'Regular i.e. daily inhaled corticosteroid (e.g., beclomethasone, budesonide, ciclesonide, fluticasone, mometasone) for moderate-severe asthma or COPD of GOLD 3 or 4 severity, where FEV1 <50% of predicted value and repeated exacerbations requiring treatment with oral corticosteroids.', rule: { w: [['copd', 'asthma']], o: [['ics']] } },
  { part: 'START', section: 'G', n: 3, source: 'Home continuous oxygen with documented chronic hypoxaemia (i.e., pO2 < 8.0 kPa or 60 mmHg or SaO2 < 89%).', rule: { w: [['hypoxemia']], o: [['home-oxygen']] } },
  { part: 'START', section: 'H', n: 1, source: 'Disease-modifying anti-rheumatic drug (DMARD) with chronic, active and disabling rheumatoid arthritis.', rule: { w: [['rheumatoid']], o: [['dmard', 'methotrexate']] } },
  { part: 'START', section: 'H', n: 2, source: 'Bisphosphonates and vitamin D and calcium in patients taking long-term systemic corticosteroid therapy for prevention of steroid-induced osteoporosis.', rule: { w: [['corticosteroid']], o: [['bisphosphonate'], ['vitamin-d'], ['calcium']] } },
  { part: 'START', section: 'H', n: 3, source: 'Vitamin D in patients with known osteoporosis and/or previous fragility fracture(s) and/or Bone Mineral Density T-scores below -2.5 in one or multiple sites.', rule: { w: [['osteoporosis']], o: [['vitamin-d']] } },
  { part: 'START', section: 'H', n: 4, source: 'Bone anti-resorptive or anabolic therapy (e.g., bisphosphonate, teriparatide, denosumab) in patients with documented osteoporosis (Bone Mineral Density T-scores below -2.5 in one or multiple sites) and/or previous history of fragility fracture(s) – where no pharmacological or clinical status contraindication exists such as poor one-year life expectancy.', rule: { w: [['osteoporosis']], o: [['bisphosphonate', 'bone-other']] } },
  { part: 'START', section: 'H', n: 5, source: 'Vitamin D supplement in older people with confirmed 25-hydroxycolecalciferol deficiency (< 20 micrograms/L, < 50 nmol/L) who are housebound or experiencing falls or with osteopenia (Bone Mineral Density T-score is less than -1.0 but above -2.5 in one or multiple sites).', rule: { w: [['vitd-deficiency']], o: [['vitamin-d']] } },
  { part: 'START', section: 'H', n: 6, source: 'Anti-resorptive treatment after discontinuation of at least two doses of denosumab (rebound increased bone turnover markers, BMD loss, and increased risk of vertebral fracture following denosumab discontinuation).', rule: { w: [['denosumab-stopped']], o: [['bisphosphonate']] } },
  { part: 'START', section: 'H', n: 7, source: 'Anti-resorptive treatment after discontinuation of teriparatide/abaloparatide treatment for osteoporosis.', rule: { w: [['teriparatide-stopped']], o: [['bisphosphonate', 'bone-other']] } },
  { part: 'START', section: 'H', n: 8, source: 'Xanthine-oxidase inhibitors (e.g. allopurinol, febuxostat) with a history of recurrent episodes of gout.', rule: { w: [['gout']], o: [['xanthine-oxidase']] } },
  { part: 'START', section: 'H', n: 9, source: 'Folic acid supplement in patients taking methotrexate.', rule: { w: [['methotrexate']], o: [['folic-acid']] } },
  { part: 'START', section: 'I', n: 1, source: 'Selective alpha-1 receptor blocker (e.g., tamsulosin, silodosin) for lower urinary tract symptoms related to benign prostatic hyperplasia where prostatectomy is not considered necessary or appropriate or safe.', rule: { w: [['bph']], o: [['alpha-blocker']] } },
  { part: 'START', section: 'I', n: 2, source: '5-alpha reductase inhibitor (e.g., finasteride, dutasteride) for lower urinary tract symptoms related to benign prostatic hyperplasia where prostatectomy is not considered necessary or appropriate or safe.', rule: { w: [['bph']], o: [['5ari']] } },
  { part: 'START', section: 'I', n: 3, source: 'Topical vaginal oestrogen or vaginal oestrogen pessary for symptomatic atrophic vaginitis.', rule: { w: [['atrophic-vaginitis']], o: [['vaginal-estrogen']] } },
  { part: 'START', section: 'I', n: 4, source: 'Topical vaginal oestrogen or vaginal oestrogen pessary in women for recurrent urinary tract infections.', rule: { w: [['recurrent-uti']], o: [['vaginal-estrogen']] } },
  { part: 'START', section: 'I', n: 5, source: 'Phosphodiesterase type-5 inhibitors (e.g., avanafil, sildenafil, tadalafil, vardenafil) for persistent erectile dysfunction that causes distress.', rule: { w: [['erectile-dysfunction']], o: [['pde5']] } },
  { part: 'START', section: 'J', n: 1, source: 'ACE inhibitor or Angiotensin Receptor Blocker (if intolerant of ACE inhibitor) in diabetes with evidence of renal disease i.e., dipstick proteinuria or microalbuminuria (>30 mg/24 hours) unless evidence of severe CKD (eGFR < 30 ml/min/m2).', rule: { w: [['diabetes'], ['ckd-proteinuria']], o: [['ace-inhibitor', 'arb']], e: ['gt', 30] } },
  { part: 'START', section: 'K', n: 1, source: 'High-potency opioids in moderate-severe non-arthritis pain, where paracetamol, NSAIDs or low-potency opioids are not appropriate to the pain severity or have been ineffective.', rule: { w: [['pain-severe']], o: [['opioid']] } },
  { part: 'START', section: 'K', n: 2, source: 'Laxatives in patients receiving opioids regularly i.e., other than PRN use.', rule: { w: [['opioid']], o: [['laxative']] } },
  { part: 'START', section: 'K', n: 3, source: 'Topical 5% lidocaine (lignocaine) patch for localized neuropathic pain, e.g. post-herpetic neuralgia.', rule: { w: [['neuropathic-pain']], o: [['lidocaine-patch']] } },
  { part: 'START', section: 'L', n: 1, source: 'Seasonal influenza vaccine annually.', rule: { o: [['flu-vaccine']] } },
  { part: 'START', section: 'L', n: 2, source: 'Pneumococcal vaccine at least once according to national guidelines.', rule: { o: [['pneumococcal-vaccine']] } },
  { part: 'START', section: 'L', n: 3, source: 'Varicella-zoster vaccine according to national guidelines.', rule: { o: [['zoster-vaccine']] } },
  { part: 'START', section: 'L', n: 4, source: 'SARS-CoV2 vaccine according to national guidelines.', rule: { o: [['covid-vaccine']] } },
];
export const CRITERIA = C.map(({ part, section, n, source, rule }) => ({ id: `${part} ${section}${n}`, part, section, sectionTitle: TITLES[part][section], text: source, general: rule === null }));

const TAGS = new Set([...DRUGS, ...CONDITIONS].map((t) => t.value));
const CITE = 'O\'Mahony D, et al. STOPP/START criteria for potentially inappropriate prescribing in older people: version 3. Eur Geriatr Med 2023;14:625-632, Appendix 1 (CC BY 4.0).';
const NOTE = 'A match is a criterion to read, not a finding: the doses, durations, laboratory values and exceptions in its wording are not tested here, and the prescriber decides.';
const GENERAL = 'Section A of both lists applies to every medication list and is not matched by ticks: STOPP A1 to A3 (no indication, beyond the recommended duration, a duplicate class) and START A1.';

function tickList(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(/[,;\n]/);
  return [];
}

export function stoppStartV3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ageFault = inputFault([['the age', o.ageYears, 0, 120, 'years']]);
  if (ageFault) return { valid: false, message: ageFault };
  if (Number(String(o.ageYears).trim()) < 65) return { valid: false, message: 'STOPP/START version 3 is written for people aged 65 or older.' };
  let egfr = null;
  if (String(o.egfr ?? '').trim() !== '') {
    const f = inputFault([['the eGFR', o.egfr, null, 200, 'mL/min/1.73 m²']]);
    if (f) return { valid: false, message: f };
    egfr = Number(String(o.egfr).trim());
  }
  const ticked = new Set();
  for (const raw of [...tickList(o.drugs), ...tickList(o.conditions)]) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const t = raw.trim();
    if (!TAGS.has(t)) return { valid: false, message: `"${t.slice(0, 40)}" is not one of this screen's drug or condition choices.` };
    ticked.add(t);
  }
  if (!ticked.size) return { valid: false, message: 'Tick the patient\'s drugs and conditions to screen them.' };
  const has = (t) => ticked.has(t);
  const met = (g) => g.some(has);
  const stopp = [];
  const start = [];
  const unchecked = [];
  for (const { part, section, n, source: text, rule: r } of C) {
    if (!r) continue;
    const id = `${part} ${section}${n}`;
    let hit = (r.w || []).every(met) || (r.two ? r.two.filter(has).length >= 2 : false);
    if (hit && part === 'STOPP' && (r.u || []).some(has)) hit = false;
    if (hit && part === 'START') hit = (r.o || []).some((g) => !met(g));
    if (!hit) continue;
    if (r.e && r.e[0] === 'lt') {
      if (egfr === null) { unchecked.push(`${id} (below ${r.e[1]})`); continue; }
      if (!(egfr < r.e[1])) continue;
    }
    if (r.e && r.e[0] === 'gt' && egfr !== null && egfr <= r.e[1]) continue;
    (part === 'STOPP' ? stopp : start).push({ id, section, sectionTitle: TITLES[part][section], text });
  }
  const notes = [GENERAL];
  if (unchecked.length) notes.push(`No eGFR was entered, so these kidney criteria were not checked: ${unchecked.join(', ')}.`);
  if (stopp.length + start.length === 0) notes.push('No criterion matches the ticks entered. Criteria whose drug or condition is not among the choices here cannot match; read the full lists for those.');
  notes.push(CITE);
  const many = (k, w) => `${k} ${w} criteri${k === 1 ? 'on' : 'a'}`;
  return {
    valid: true,
    stopp, start, stoppCount: stopp.length, startCount: start.length, egfrChecked: egfr !== null,
    flag: stopp.length + start.length ? 'review' : 'none', abnormal: stopp.length + start.length > 0,
    band: stopp.length + start.length
      ? `${many(stopp.length, 'STOPP')} and ${many(start.length, 'START')} to review.`
      : 'No STOPP or START criterion matches the ticks entered.',
    bandLabel: `${stopp.length} STOPP, ${start.length} START`,
    notes, note: NOTE,
  };
}
