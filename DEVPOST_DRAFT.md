# ShareProof project overview

Cover private details in a screenshot, then inspect the exact PNG you will share.

ShareProof is a browser workbench for students, applicants and people sharing software screenshots. Local English OCR suggests email and phone regions. The owner reviews each suggestion, adds manual covers for other details and checks the complete image.

Export creates a flattened PNG, removes unnecessary ancillary chunks and decodes the final bytes. Selected cover pixels must match the solid opaque fill before the inspected PNG and its SHA-256-linked review note are available. Changing the image or covers requires a new inspection.

The [project story](devpost/submission-copy.md) covers the implementation, design decisions and next steps. [Verification](devpost/checklist.md) records 12 passing core tests and the independently checked synthetic receipt export. Inspection applies to selected regions; OCR and manual review determine which regions are chosen.

- [Working app](https://shareproof-workbench.dgrrgddgrrgd.chatgpt.site)
- [Source](https://github.com/hgyu-mech/shareproof)
- [2:20 demonstration](https://youtu.be/xkf0LrtodzU)
