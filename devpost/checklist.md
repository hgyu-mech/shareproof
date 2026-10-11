# Verification

## Core checks

All 12 tests in [core.test.mjs](../tests/core.test.mjs) pass. They cover split OCR tokens, contact-text-free candidate output, fractional and reverse-direction rectangles, overlapping regions, exact opaque-pixel equality, metadata removal, palette preservation and malformed PNG rejection.

## Browser workflow

The synthetic receipt was processed with the bundled English OCR worker. It produced two contact suggestions. Both were covered, a name cover was added manually, and the PNG and JSON note were downloaded. Editing a cover invalidated the previous inspection.

Independent checks of that downloaded artifact produced these results:

| Check | Result |
| --- | --- |
| Decoded PNG | 1160 × 910 pixels |
| Selected regions | 3 |
| Unique selected pixels | 27,480 |
| Selected RGBA values | Every checked pixel matched the opaque cover color |
| Retained PNG chunks | IHDR, IDAT, IEND |
| PNG checksums | Valid |
| Artifact identity | PNG SHA-256 matched the review note |
| Review-note privacy | Recognized sample contact strings were absent |

SHA-256 of the checked PNG:

```text
4d6f5d8f7e3a22dd629f7fba43b525da46ce226d73f2ee5aea658762ae447e79
```

Desktop, tablet-width and phone-width layouts were visually reviewed. Source review covered asynchronous image loads, OCR, drawing gestures and export invalidation. Public-file checks found no known private contact or secret patterns, and private verification captures and local environment files are excluded from Git.

## Verification scope

These results apply to one synthetic example and its selected regions. OCR recall across other images, physical-device compatibility and real-user outcomes have not been measured. Korean OCR and user testing are planned extensions.

## Working demonstration

- [App](https://shareproof-workbench.dgrrgddgrrgd.chatgpt.site)
- [Source and planning documents](https://github.com/hgyu-mech/shareproof)
- [140-second browser demonstration](https://youtu.be/xkf0LrtodzU)
