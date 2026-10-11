# ShareProof scope

## Problem and audience
Students, applicants and people sharing software screenshots need to remove visible contact details while preserving the confirmation or context around them.

## Core workflow
Inspect the file that leaves the browser. Draw opaque masks, export a new PNG, reopen the bytes, inspect covered pixels and PNG chunks, and produce a review note tied to its SHA-256 hash. An editor overlay alone is not the exported artifact.

## Complete workflow
Load an image → run on-device OCR for email/phone candidates → review each candidate or add a rectangle → build a flattened PNG → decode the exported bytes and verify selected rectangles → download that exact PNG and a note containing no recognized private strings. The result is demonstrable in under three minutes.

## Current scope
One PNG, JPEG or WebP image; local English OCR; manual rectangle tools; explicit cover/keep decisions; opaque fills; decoded pixel checks; PNG chunk inspection; artifact hash; PNG and JSON downloads.

## Planned extensions
Korean OCR, multiple pages, keyboard shape manipulation, broader suggestion types and measured user testing.

## Outside scope
PDF redaction, cloud OCR, semantic personal-data inference, sharing services, accounts, persistent original-image storage, blur and pixelation. Export inspection covers the selected rectangles; finding every private detail remains a separate manual review task.
