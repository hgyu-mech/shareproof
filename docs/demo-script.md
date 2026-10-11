# ShareProof — 2:20 working demonstration

Record the actual application using its synthetic receipt. Leave real images, browser account details and unrelated tabs outside the frame. The final video should show a complete image-to-download workflow; a script is not evidence that recording or publication has occurred.

| Time | Screen and action | Narration |
| --- | --- | --- |
| 0:00–0:12 | Show the full workbench and fictional receipt | “This receipt confirms an application, but it also includes contact details. ShareProof helps prepare the image and inspect the file that will leave the browser.” |
| 0:12–0:30 | Click `Find contact details`; show real worker progress and resulting suggestions | “English OCR runs in a browser worker. It suggests email and phone locations. The image is not sent to a recognition API.” |
| 0:30–0:47 | Review the suggestions. Briefly show `Keep visible`, then select `Cover` for the sample contacts | “Each suggestion needs a decision. Keep visible is an explicit choice; these sample contacts will be covered.” |
| 0:47–1:03 | Draw a rectangle over the sample participant name; show the manual cover entry | “OCR does not find every kind of private detail. I cover the name by hand. Coordinates and Undo are also available.” |
| 1:03–1:13 | Inspect the surrounding receipt; check the full-image review box | “The confirmation remains readable. I check the rest of the image before building the export.” |
| 1:13–1:36 | Click `Build & inspect PNG`; show the export preview and selected-pixel count | “The app creates a fresh PNG, removes unneeded ancillary chunks, then decodes the final bytes. Every pixel inside each selected cover must match its solid opaque fill.” |
| 1:36–1:48 | Show the SHA-256, chunk types and downloads | “This hash belongs to the exact downloaded file. The review note contains inspection facts, without recognized contact text or the original filename.” |
| 1:48–2:00 | Download PNG and note; open the PNG at readable scale | “Here is the exported image. The selected details are covered while the useful receipt remains visible.” |
| 2:00–2:11 | Return to the app and remove or undo one cover; show result invalidation | “A review change invalidates the previous inspection. The updated image needs a new export check.” |
| 2:11–2:20 | Return to the full workbench; close | “The check covers the selected areas, not every possible private detail. ShareProof keeps that scope visible: review the image, then inspect what you share.” |

## Recording notes

- Wait for the actual OCR result. If initialization needs extra time, shorten other segments or use a clearly marked cut; do not replace a failed scan with staged suggestions.
- The demonstrated sample name cover uses source pixels X 350, Y 343, width 350, height 42. Check the visible bounds before using these coordinates; the pointer tool is equally valid.
- Keep the export large enough to read. Show the actual downloaded PNG rather than the editor alone.
- Record a brief responsive view only if that layout has been checked. Do not imply a phone test from a desktop resize.
- Use the original sample and interface without unlicensed music or unrelated branding. Upload the completed video publicly on YouTube or Vimeo and verify the link before submitting it.

The official [Build With AI: Basics rules](https://learn-ai-basics.devpost.com/rules) ask for a working demonstration under three minutes. This sequence emphasizes the four equally weighted criteria: a coherent workflow, a specific sharing problem, inspection of the actual output as the concept's focus, and a clear end-to-end presentation.
