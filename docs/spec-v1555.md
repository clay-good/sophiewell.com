# spec-v1555 — Snakebite: the clotting test, when to give antivenom, and when to repeat it

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Five tiles, for South and Southeast Asia and sub-Saharan Africa. The catalog's `snakebite-severity`
is the US crotalid Snakebite Severity Score and does not apply to these snakes. Latin America is
spec-v1556.

## The rule that governs every antivenom tile

**Never name or dose a commercial antivenom.** SEARO says antivenom strength varies from batch to
batch and between products, so the dose follows the package insert (p. 138). Every tile takes the
**initial dose in vials, "per the product insert or national protocol"**, as an input, and applies
only the timing and repeat rules. The one exception is a national protocol that states vial counts
for its own national product (India, tile 4); that mode is labelled with the country and says the
counts do not transfer to other antivenoms.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| SEARO16 | Warrell DA, for WHO SEARO. *Guidelines for the management of snakebites*, 2nd ed. 2016 (IRIS 10665/249547) | All rights reserved |
| AFRO10 | WHO AFRO. *Guidelines for the prevention and clinical management of snakebite in Africa.* 2010 (IRIS 10665/204458; read as page images, the text layer is garbled) | All rights reserved |
| INSTG16 | Government of India, MoHFW. *Standard Treatment Guidelines: management of snake bite.* 2016 | No licence stated (government publication; facts only) |

No WHO global clinical snakebite guideline exists as of this search. India's 2024 national action
plan (NAPSE) is a policy framework with no dosing (confirmed through a CC BY review, PMC12240341).

---

## 1. `wbct20` — 20-Minute Whole Blood Clotting Test (20WBCT): Valid, Clotted, and When to Repeat

**Question.** Does this 20-minute clotting test show venom-induced incoagulable blood, was it done
correctly, and when is it repeated?

**Inputs.** Vessel: new, clean, dry glass, not washed with detergent (yes / no / unsure; required);
result after 20 minutes undisturbed and tipped once: clotted / still liquid (required); timing: on
admission / hours since the antivenom loading dose (0–72); region (South and Southeast Asia / Africa
/ other; changes the species note only); bleeding away from the bite (three-state); envenoming
neurotoxic (yes / no).

**Logic.**

- **Method (SEARO16 pp. 123–125):** about 2 mL of fresh venous blood in a new, clean, dry glass
  vessel, left 20 minutes at room temperature, then tipped once. AFRO10 says "a few mL".
- **Validity:** plastic, or glass washed with detergent, or wet, gives a false "not clotted". **Any
  answer other than "yes" to the vessel question makes the test invalid**, and the tile says to
  repeat it in new glass, in duplicate with a healthy person's blood as a control if in doubt.
- **Still liquid** = incoagulable blood from venom-induced consumption coagulopathy. SEARO: in
  South-East Asia this indicates a viper and rules out an elapid (p. 124). AFRO: a cardinal sign of
  most vipers and the medically important back-fanged colubrids (p. 60).
- **Clotted is not reassurance early:** the test turns non-clotting only once fibrinogen falls below
  about 0.5 g/L. Repeat it, and do not delay antivenom for other evidence such as bleeding away from
  the bite (SEARO p. 125).
- **Repeat schedule (INSTG16 p. 19):** clotted → every hour from admission for 3 hours, then every 6
  hours for 24 hours; not clotted → 6 hours after the loading dose; neurotoxic → after 6 hours.
  After adequate antivenom, clotting usually returns in 3–9 hours (SEARO p. 142; AFRO about 6).

**Output.** Valid or invalid; what the result means for the region; the next test time on the clock.

**Traps.** An invalid test never reads as normal. Brazil uses a different test (Lee-White clotting
time); it is its own tile in spec-v1556 and is never merged here.

## 2. `snake-antivenom-indication` — Is Antivenom Indicated for This Snakebite? (WHO SEARO and AFRO)

**Question.** Does this snakebite patient meet WHO criteria for antivenom?

**Inputs (three-state each; "not assessed" is never "no").** Region (South and Southeast Asia /
Africa, required). **Systemic:** spontaneous bleeding away from the bite; non-clotting 20WBCT (from
tile 1); INR above 1.2 or prothrombin time more than 4–5 seconds over control (SEARO); platelets
below 100 × 10⁹/L (SEARO); neurotoxic signs (drooping eyelids, eye movement paralysis, weakness);
low blood pressure, shock, abnormal heart rhythm or ECG; acute kidney injury (SEARO); dark brown or
red urine (SEARO). **Local:** swelling of more than half the bitten limb within 48 hours without a
tourniquet; swelling after a bite on a finger or toe; rapid spread (past the wrist or ankle within a
few hours); an enlarged tender lymph node draining the limb (SEARO). For Africa, species known or
suspected to cause tissue death (Bitis, Echis, Cerastes, Macrovipera, spitting cobras). High reaction
risk: a previous reaction to horse or sheep serum, or severe allergy or asthma.

**Logic.**

- **SEARO16 (pp. 129–130):** antivenom when **any one** listed systemic or local sign develops.
- **AFRO10 (p. 77, Table 14.1):** all systemic envenoming (neurotoxicity, spontaneous bleeding,
  incoagulable blood, cardiovascular abnormality) and severe local envenoming, with the **local
  criteria counting only for species that cause tissue death**.
- **High reaction risk:** antivenom only if systemically envenomed (SEARO p. 132).
- **India (INSTG16 p. 22):** local swelling alone, even with fang marks, is not an indication, nor is
  swelling that is hours old; rapidly spreading swelling is.
- There is **no absolute contraindication** (all three sources).

**Output.** Indicated (the criteria met, listed) / not indicated on the criteria entered / incomplete
(naming the unassessed systemic signs). It never says "not indicated" while a systemic sign is
unassessed. Every "indicated" answer adds: **children get the same dose as adults** (SEARO p. 142,
AFRO p. 78, INSTG16 p. 24); **have adrenaline drawn up before starting** (SEARO p. 136); adrenaline
for a reaction is **0.5 mg IM for adults, 0.01 mg/kg for children**, at the first sign, repeated every
5–10 minutes (SEARO p. 134; AFRO p. 81; INSTG16). None of the three sources states a pediatric
maximum, so none is printed. SEARO's optional pre-treatment (0.25 mg subcutaneous adults, 0.005
mL/kg of 0.1% children) prints with its exceptions.
**Coverage note:** some snakes have no antivenom (Africa: burrowing asps, night adders, bush vipers,
Berg adder; India: sea snakes and pit vipers, including the hump-nosed pit viper); the answer says to
check the product's stated species.

**First aid** (SEARO p. 117; AFRO p. 79) prints as a short list, not a tile: no cutting, sucking,
tight tourniquets, ice, or herbs; if a tight band is already on, leave it until antivenom has started.

## 3. `snakebite-syndrome` — Which Snake? The Syndromic Approach (WHO SEARO and AFRO)

**Question.** Which snakes does this clinical picture suggest, and what kind of antivenom (broad,
species-specific, or none) does the guideline point to?

**Inputs.** Region (required); local swelling (none or mild / moderate / marked); blood (clots /
does not clot / spontaneous bleeding); paralysis (yes / no); for South and Southeast Asia: bitten
while sleeping on the floor, bitten in the sea or an estuary, dark urine or kidney injury, subregion
(Sri Lanka and south India / Myanmar / Bangladesh and Thailand / eastern Indonesia).

**Logic.**

- **Africa, six syndromes (AFRO10 ch. 8, pp. 53–55):** (1) marked swelling, blood clots → spitting
  cobra or puff adder → broad antivenom; (2) marked swelling with non-clotting blood or bleeding →
  saw-scaled viper especially in the northern third of Africa, also others → Echis-specific
  antivenom where available, broad antivenom anywhere; (3) descending paralysis, little swelling →
  neurotoxic cobras or mambas → broad antivenom, consider a neostigmine trial (tile 5), ventilate if
  needed; (4) mild swelling alone → night adders, burrowing asps, some small vipers → **no
  antivenom**; (5) mild or no swelling with non-clotting blood → boomslang or vine snake →
  boomslang-specific antivenom, supportive for vine snake; (6) swelling with paralysis → Berg adder
  and relatives → **no antivenom exists**.
- **South and Southeast Asia, five syndromes (SEARO16 p. 101):** local envenoming with a clotting
  problem → vipers; plus shock or kidney injury → Russell's viper; local envenoming with paralysis →
  cobra or king cobra; paralysis with little local change → on land while sleeping, krait; at sea,
  sea snake; Maluku or West Papua, Australasian elapid; paralysis with dark urine and kidney injury →
  on land with a clotting problem, Russell's viper (Sri Lanka, south India); on land while sleeping
  indoors, krait (Bangladesh, Thailand); at sea, sea snake.

**Output.** The syndrome, the suspected snakes, and the guideline's antivenom class. For Asia, a note
that SEARO asks for local algorithms from local data; its Sri Lanka table shows low sensitivity for
Russell's viper (14%) and the hump-nosed viper (10%). **The answer says this is a suggestion, not an
identification.** India's four-syndrome scheme (neuroparalytic, vasculotoxic, myotoxic, painful
progressive swelling) is an optional mode.

## 4. `antivenom-repeat` — When to Repeat Antivenom (WHO SEARO, AFRO, and India's National Regimen)

**Question.** Has this patient met a criterion to repeat antivenom, and when?

**Inputs.** Protocol (WHO SEARO / WHO AFRO / India national guideline; required); initial dose in vials
(required; per the product insert or national protocol; prefilled only in India mode); hours since the
dose ended (0–48); 20WBCT now (clots / does not clot / not done); still bleeding briskly; neurotoxic
or cardiovascular signs (improving / unchanged / worse); on a ventilator; vials given so far.

**Logic.**

- **SEARO16 (p. 142):** repeat **the same dose** if the blood is still non-clotting **6 hours** after
  the initial dose; if bleeding briskly, within 1–2 hours; if neurotoxic or cardiovascular signs are
  worse, after 1 hour. Repeat doses after the patient is paralyzed and ventilated have no proven
  value. Viper envenoming can recur 24–48 hours after a first response.
- **AFRO10 (p. 80):** still non-clotting at 6 hours → repeat, and every 6 hours until clotting returns.
- **India (INSTG16 pp. 23–25):**
  - **Neuroparalytic:** 10 vials as an infusion over 30 minutes; a second 10 after 1 hour if no
    improvement; **maximum 20**. More antivenom does not reverse drooping eyelids alone after a krait
    bite.
  - **Vasculotoxic, low-dose infusion:** 10 vials (Russell's viper) or 6 (saw-scaled viper) over 30
    minutes, then **2 vials every 6 hours** in 100 mL saline until clotting normalizes or for 3 days.
  - **Vasculotoxic, high-dose intermittent:** 10 vials, then **6 vials every 6 hours** until clotting
    normalizes or swelling subsides. INSTG16 calls low-dose "as effective".
  - **At 30 vials, reconsider** whether more is helping, especially without proven systemic bleeding.
  - Life-saving surgery (such as a brain bleed): up to 30 vials at the start. Pregnancy and children:
    the same dose; children's antivenom diluted in 5–10 mL/kg of saline. IV only. **No Indian
    antivenom for sea snakes or pit vipers.**

**Output.** Repeat now (the same vial count) / re-test at a clock time / no repeat criterion met, with
the cumulative vials against India's caps in India mode.

**Conflict to show, not resolve.** SEARO's Annex 3 quotes Indian manufacturers at 5 vials for the
saw-scaled viper (10 for the northern subspecies); INSTG16 says 6. India mode uses INSTG16 and prints
the other figure.

**Traps.** No invented initial dose outside India mode. A 20WBCT "not done" is never "clotted".

## 5. `snake-neostigmine-trial` — Neostigmine Trial for Neurotoxic Snakebite: Doses and Response

**Inputs.** Weight (kg, required); adult or child (required); protocol (WHO SEARO and AFRO / India
national guideline; required); eyelid gap or ptosis grade before and after (mm or grade); minutes since
neostigmine; suspected mamba bite (Africa; yes / no); drug concentrations on hand (mg per mL,
required for mL output).

**Logic.**

- **WHO (SEARO16 pp. 152–153; AFRO10 p. 88):** atropine 0.6 mg (adult) or 50 µg/kg (child) IV, then
  neostigmine **0.02 mg/kg IM (adult) or 0.04 mg/kg (child)**; observe 30–60 minutes. Maintenance for
  a convincing response: adults 0.5–2.5 mg every 1–3 hours up to 10 mg/24 h; children 0.01–0.04 mg/kg
  every 2–4 hours; always with atropine. AFRO: **not after a suspected mamba bite** (its venom already
  acts this way). The trial must not delay antivenom or intubation.
- **India (INSTG16 pp. 29–30):** atropine 0.6 mg, then **neostigmine 1.5 mg IV**, then 0.5 mg with
  atropine every 30 minutes for 5 doses, then tapered at 1, 2, 6 and 12 hours. Children: atropine
  0.05 mg/kg, neostigmine 0.04 mg/kg IV, then 0.01 mg/kg every 30 minutes for 5 doses. **Positive: 50%
  or more recovery of the drooping eyelid within 1 hour.** Stop when recovery is complete, on
  fasciculations or slow heart rate, or if no better after 3 doses (suggests krait). One dose before
  transfer.

**Output.** Doses in mg and in mL at the entered concentrations; positive / negative / too early to
tell; the stop rules.

**Traps.** WHO's adult dose is weight-based and IM; India's is a flat 1.5 mg IV. The tile never mixes
protocols. SEARO's ice-pack test is marked "not yet evaluated" and is not offered.

## Tests

`test/unit/snakebite.test.js`: an invalid vessel always returns invalid; the India repeat clock;
antivenom never "not indicated" with an unassessed systemic sign; AFRO local criteria ignored for a
non-necrotic species; each syndrome row; India caps at 20 and 30; the saw-scaled 6 vs 5 display; the
neostigmine 50% response edge; the mamba refusal.

## Staleness

All three sources *low*. Review when WHO publishes a global snakebite clinical guideline.
