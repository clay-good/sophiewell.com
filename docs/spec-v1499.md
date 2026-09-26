# spec-v1499 — PAED emergence delirium scale

The catalog had no emergence-delirium tool. The Pediatric Anesthesia Emergence Delirium scale (Sikich and Lerman 2004) rates five behaviors after anesthesia, 0 to 4 each. The item wording is not reproduced; each item is named by its topic and rated on the five published anchors.

## Inputs

Five optional selects: eye contact, purposeful actions, awareness of surroundings (these three scored in reverse), restlessness, inconsolability.

## What it does

The total, 0 to 20, read against both cutoffs in use: 10 or more (Sikich; Paediatr Anaesth 2026, Medicine 2026) and more than 12 (BMJ Paediatr Open 2025). A partial form below 10 says how high the unrated items could take it and is not read as reassuring.

## Sources

Sikich N, Lerman J. Anesthesiology 2004;100(5):1138-1145. Scoring as stated in BMJ Paediatr Open 2025 (PMC11911689); the cutoff of 10 in Paediatr Anaesth 2026 (PMC13460726) and Medicine 2026 (PMC12908744).

## Tests

`test/unit/paed-delirium.test.js`: the worked example, the cutoffs, and blanks.
