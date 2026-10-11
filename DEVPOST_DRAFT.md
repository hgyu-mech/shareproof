# ShareProof

## Tagline

Cover private details in a screenshot, then inspect the exact PNG you will share.

## Inspiration

An application receipt can contain useful confirmation and personal contact details in the same image. Someone sharing that receipt needs to preserve the context while deciding which details belong in public.

ShareProof makes the downloaded file the final checkpoint. Its intended users are students, applicants and people sharing software screenshots. The prototype's current validation uses an original fictional receipt.

## What it does

Open an image, find possible contact details, and review each suggestion. English OCR runs locally and proposes email and phone regions. The owner chooses to cover or keep each region and adds hand-drawn or coordinate-based covers for names and other details. Undecided suggestions block export.

After a full-image visual check, the app creates a flattened PNG, removes unnecessary ancillary chunks, and reopens the resulting bytes. It verifies every RGBA pixel inside the selected covers, then computes a SHA-256 for that file. The downloaded PNG is the inspected artifact. Its JSON note records dimensions, covered regions and inspection facts without recognized contact strings or the source filename.

The export preview also shows the exact decoded result. Editing a cover invalidates it, so an older checked file cannot silently stand in for the latest review.

## How it was built

This is a new project created during the competition period with the official Devpost Learn Skill Pack. The six stages guided the learner context, scope, PRD, specification, build and shipping workflow. The repository contains the draft scope, PRD and specification. A coding agent assisted implementation and documentation.

The interface uses HTML, CSS, JavaScript and Canvas. Tesseract.js supplies pretrained English OCR in a browser worker; email and phone patterns turn its word boxes into review candidates. Worker, model and WebAssembly files are bundled with the app. The application makes no image-upload request.

PNG inspection validates structure and checksums, keeps decode-essential chunks, and removes other ancillary content. The browser then decodes those final bytes for exact opaque-pixel checks. The artifact hash connects the inspection note to the output. Open-source OCR code and model assets are disclosed with their original licenses.

## Challenges and tradeoffs

An editor rectangle is only a view. The implementation had to check the file after encoding and sanitization, including fractional rectangle edges, overlapping covers and alpha values. Failed checks disable downloads.

OCR suggestions also needed a narrow role. They do not decide whether an image is safe to share. Manual covers remain available when OCR fails or misses a detail, and kept suggestions stay explicit in the review note.

## Scope and next steps

The current proof of concept supports one PNG, JPEG or WebP image and English contact suggestions. Its focus is the sequence from review to the inspected output file, with a note tied to the final bytes.

Next steps are Korean OCR, measured user testing and broader candidate types. PDF redaction, cloud recognition and complete anonymization are outside this build. Participant feedback and learning reflection remain pending.

## Current verification

All 12 core tests pass. A real browser run found the sample's email and phone suggestions, covered both, added a manual name cover, and downloaded the PNG and note. Independent decoding checked all 27,480 selected pixels in the 1160 × 910 output against the exact opaque cover color. The SHA-256 matched the note; PNG checksums were valid; only IHDR, IDAT and IEND remained; and the note contained no recognized sample contact strings. This verifies one synthetic example, not automatic detection of every private detail.

## Built with

JavaScript · HTML/CSS · Canvas · Web Crypto · Tesseract.js · WebAssembly · Node.js · Devpost Learn Skill Pack

## Testing instructions

Run `npm start` with Node.js 22+, then open `http://127.0.0.1:8781`. Use the synthetic sample, run `Find contact details`, cover each candidate and add a name cover by hand. Confirm the visual review, build the PNG, inspect the output and download both files. Editing a cover should hide the inspected result and disable the prior downloads.

`npm test` runs the included core tests. Repository and hosted links, the public video and submission status remain release items to confirm.
