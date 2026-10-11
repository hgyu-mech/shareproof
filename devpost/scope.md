---
status: draft
---
# ShareProof

## Problem and audience
People sharing application receipts or software screenshots need to remove visible contact details without losing the useful surrounding evidence. The entrant's actual preparation history includes requests to check private information in screenshots. No external customer study has been conducted.

## Kernel
Inspect the file that leaves the browser. Draw opaque masks, export a new PNG, reopen the bytes, inspect covered pixels and PNG chunks, and produce a review note tied to its SHA-256 hash. An editor overlay alone is not the exported artifact.

## End-to-end proof
Load an image → run on-device OCR for email/phone candidates → review each candidate or add a rectangle → build a flattened PNG → decode the exported bytes and verify selected rectangles → download that exact PNG and a note containing no recognized private strings. The result is demonstrable in under three minutes.

## Now / later / cut
- Now: one PNG/JPEG/WebP image, local English OCR, manual rectangle tools, explicit review choices, opaque fills, decoded pixel checks, metadata chunk check, artifact hash, downloads.
- Later: Korean OCR, multiple pages, keyboard shape manipulation, broader detection types and measured user testing.
- Cut: PDF redaction, cloud OCR, semantic personal-data inference, sharing services, login, persistent original-image storage, blur/pixelation.

## Decision provenance
The entrant asked to optimize for award competitiveness rather than mechanical affinity. The agent compared a tolerance calculator, screenshot export verification, and demo planning against the official rubric. ShareProof was selected as the stronger proposed demonstration, not as a guaranteed winner. This draft is not represented as an approved learner interview.
