# spec-v1450 — Cognard classification of dural AV fistulas

A companion gap: `borden-davf` has shipped for months and `cognard` matched nothing. Neurosurgery
and interventional radiology reports use both.

## Sources, read 2026-09-25

- Cognard C et al, *Radiology* 1995;194:671-680 (PubMed 7862961; DOI checked): the classification.
- The types, stated identically in two open reviews in *J Cerebrovasc Endovasc Neurosurg*
  (2022;24:203, PMC9537653; 2023;25:117, PMC10318241):

| type | venous drainage |
|---|---|
| I | into a sinus, antegrade flow |
| IIa | into a sinus, sinus reflux only |
| IIb | into a sinus, cortical vein reflux only |
| IIa+b | into a sinus, sinus and cortical vein reflux |
| III | directly into a cortical vein, no venous ectasia |
| IV | directly into a cortical vein, with venous ectasia |
| V | into spinal perimedullary veins |

- Risk (PMC9537653): without cortical venous drainage (Cognard I, IIa; Borden I) the natural
  history is benign; with it (Cognard IIb-V) about 8% annual hemorrhage, 6-15% annual
  non-hemorrhagic deficit, and rebleeding up to 35%.

## Behavior

The drainage is chosen first, then only its own questions: the two refluxes for sinus drainage,
ectasia for direct cortical drainage, nothing more for spinal. The answer names the type and
whether cortical venous drainage is present, with the review's figures. The type does not choose
the treatment.

## Tests

`test/unit/cognard-davf.test.js`: all seven types, the benign/aggressive split, and the questions
asked for each drainage.
