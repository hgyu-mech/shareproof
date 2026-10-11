# ShareProof

Inspect the screenshot file you are about to share.

ShareProof helps people prepare application receipts and software screenshots for public sharing. It suggests possible email and phone locations, lets the owner cover other details by hand, and checks the selected covers in the actual exported PNG.

[Try the app](https://shareproof-workbench.dgrrgddgrrgd.chatgpt.site) · [Watch the 2:20 demonstration](https://youtu.be/xkf0LrtodzU)

## Run locally

Use Node.js 22 or newer and a current browser with Canvas, WebAssembly and Web Crypto support.

```sh
npm start
```

Open `http://127.0.0.1:8781`. The bundled browser assets are ready to serve; running the app does not require an API key or account. Use HTTP on localhost or HTTPS when hosting `dist/`. Opening `index.html` through a `file://` URL is unsupported.

To reinstall the pinned dependencies and regenerate the bundled OCR assets:

```sh
npm ci
npm run prepare-assets
```

## Try the complete workflow

1. Use the fictional sample receipt or open a PNG, JPEG or WebP image.
2. Click `Find contact details`. The local English OCR worker proposes email and phone regions. Choose `Cover` or `Keep visible` for each suggestion.
3. Use `Draw a cover` for names, addresses or other details the OCR does not detect. Coordinate fields provide another way to add a rectangle. `Undo` and `Remove` let you revise it.
4. Inspect the whole image and confirm the visual-review checkbox.
5. Click `Build & inspect PNG`. Inspect the export preview, selected-pixel count, retained PNG chunk types and SHA-256.
6. Download the checked PNG and its JSON review note. Changing the image or a cover invalidates the old export and requires a new inspection.

An undecided OCR suggestion blocks export. At least one cover and the visual-review confirmation are required. If OCR fails, the manual tools remain available; the failure is not shown as a completed scan.

## How export inspection works

The app draws the source and solid opaque covers onto a fresh canvas, then encodes a new PNG. It checks PNG structure and checksums, removes unnecessary ancillary chunks, and decodes those final bytes again. Every RGBA pixel inside each selected rectangle must equal the opaque cover color. Downloads remain unavailable if that check fails.

SHA-256 is computed over those same final bytes. The review note records the hash, dimensions, file length, region coordinates, reviewed suggestion counts and inspection results. It excludes recognized contact strings, the original filename and the original image.

This check applies to selected regions. English OCR can miss details, and a deliberately kept candidate remains visible. Names, addresses, identifiers and contextual information need manual review. The app does not provide PDF redaction, encryption or a complete anonymization certificate.

## Local OCR and data handling

Tesseract.js and its pretrained English model run in a browser worker. Scripts, worker, WebAssembly cores and language data are bundled under `dist/assets/ocr/`; recognition does not use a remote model API. The app's code makes no image-upload request and does not persist source images. Images and review state remain in the current tab. Hosting still receives ordinary requests for the app and its assets.

Input limits are 12 MB, 12 million decoded pixels and 16,000 pixels per edge. The built-in receipt is an original synthetic fixture with reserved example addresses and fictional details.

## Project layout

| Location | Purpose |
| --- | --- |
| `dist/app.js` | Browser state, OCR worker, review tools, PNG round trip and downloads |
| `dist/core.js` | Candidate regions, rectangle normalization, PNG sanitization and RGBA checks |
| `dist/sample.js` | Original synthetic receipt generated with Canvas |
| `dist/assets/` | Bundled OCR dependencies, model, licenses and hashes |
| `tests/core.test.mjs` | Pure-function checks for boundaries, candidates, pixels and PNG structure |
| `devpost/scope.md`, `prd.md`, `spec.md` | Project scope, product requirements and implementation specification |
| `devpost/checklist.md` | Verification results and their scope |

Run the included core checks with `npm test`. All 12 currently pass. They cover split OCR tokens, contact-string-free candidate output, reverse and fractional rectangles, opaque pixel equality, overlapping regions, metadata removal, palette preservation and malformed PNG rejection.

A browser run on the built-in synthetic receipt found two contact suggestions. Both were covered, a name cover was added, and the PNG and note were downloaded. Independent decoding of that 1160 × 910 PNG confirmed all 27,480 selected pixels had the exact opaque cover color. Its hash matched the note, PNG checksums were valid, only IHDR/IDAT/IEND chunks remained, and recognized sample contact strings were absent from the note. These results cover this sample and its selected regions; they do not measure OCR recall across other images or establish device compatibility.

## Build and licensing

ShareProof was created on October 11, 2026 for Build With AI: Basics. OpenAI Codex assisted implementation and documentation. The [official Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics) structured scope, requirements, specification and verification.

Tesseract.js, its WebAssembly core, the pretrained English model and their dependency assets predate this project. Their licenses and notices are retained in [THIRD-PARTY-NOTICES.md](dist/assets/THIRD-PARTY-NOTICES.md), with versions and hashes in `dist/assets/ocr-manifest.json`. Project-specific code is MIT licensed; third-party material retains its own terms.

The [project story](devpost/submission-copy.md), [verification summary](devpost/checklist.md) and [demonstration guide](docs/demo-script.md) describe the working release.
